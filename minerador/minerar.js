#!/usr/bin/env node
// Minerador de ofertas low ticket na Biblioteca de Anúncios da Meta.
// Abre o site da Biblioteca (como uma pessoa faria), busca cada palavra-chave,
// junta os anúncios por oferta (página de destino) e ranqueia o que está escalando.
//
// Uso:
//   node minerador/minerar.js                  -> usa minerador/config.json
//   node minerador/minerar.js --dias 3         -> anúncios que começaram nos últimos 3 dias
//   node minerador/minerar.js --palavras "ebook,receitas fit"
//   node minerador/minerar.js --mostrar        -> abre o navegador visível (bom pra depurar)

const fs = require('fs');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright não encontrado. Rode: npm install playwright && npx playwright install chromium');
  process.exit(1);
}

// ---------- configuração ----------
const DIR = __dirname;
const config = JSON.parse(fs.readFileSync(path.join(DIR, 'config.json'), 'utf8'));
const args = process.argv.slice(2);
const arg = (nome) => {
  const i = args.indexOf(nome);
  return i >= 0 ? args[i + 1] : undefined;
};
const dias = Number(arg('--dias') ?? config.dias ?? 1);
const pais = arg('--pais') ?? config.pais ?? 'BR';
const palavras = (arg('--palavras') ? arg('--palavras').split(',') : config.palavras_chave).map((p) => p.trim()).filter(Boolean);
const rolagens = Number(arg('--rolagens') ?? config.rolagens_por_palavra ?? 8);
const mostrar = args.includes('--mostrar');
const ordenarSeguidores = args.includes('--por-seguidores');
const fmt = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}mil` : String(n || '-'));
const minimoAnuncios = Number(arg('--minimo') ?? config.minimo_anuncios_por_oferta ?? 2);
const plataformas = (config.plataformas_checkout || []).map((p) => p.toLowerCase());
const sinais = (config.sinais_low_ticket || []).map((s) => new RegExp(s, 'i'));
const ignorar = (config.ignorar_destinos || []).map((d) => d.toLowerCase());

const hoje = new Date();
const dataMin = new Date(hoje.getTime() - dias * 86400000);
// só fica anúncio que COMEÇOU nos últimos N dias (oferta nova); 0 = sem filtro
const recentesDias = Number(arg('--recentes') ?? config.recentes_dias ?? 0);
const corteRecentes = recentesDias ? new Date(hoje.getTime() - recentesDias * 86400000) : null;
const precoMaximo = Number(arg('--preco-max') ?? config.preco_maximo ?? 0);
const sinaisPdf = (config.sinais_pdf || []).map((s) => new RegExp(s, 'i'));
const valor = (p) => Number(p.replace(/R\$/i, '').replace(/\.(?=\d{3})/g, '').replace(',', '.'));
const iso = (d) => d.toISOString().slice(0, 10);

// ---------- helpers ----------
function urlBusca(q) {
  const p = new URLSearchParams({
    active_status: 'active',
    ad_type: 'all',
    country: pais,
    q,
    search_type: 'keyword_unordered',
    media_type: 'all',
    'start_date[min]': iso(dataMin),
    'start_date[max]': '',
  });
  return `https://www.facebook.com/ads/library/?${p.toString()}`;
}

// O Facebook embrulha links externos em l.facebook.com/l.php?u=...
function desembrulhar(u) {
  if (!u) return '';
  try {
    const url = new URL(u);
    if (url.hostname.endsWith('facebook.com') && url.pathname.startsWith('/l.php')) {
      return url.searchParams.get('u') || u;
    }
    return u;
  } catch {
    return u;
  }
}

function chaveOferta(link, pageId) {
  if (!link || /wa\.me|whatsapp\.com/i.test(link)) return `whatsapp/pagina:${pageId || 'desconhecida'}`;
  try {
    const u = new URL(link);
    const caminho = u.pathname.replace(/\/+$/, '');
    return `${u.hostname.replace(/^www\./, '')}${caminho}`;
  } catch {
    return link;
  }
}

function precos(texto) {
  const achados = (texto || '').match(/R\$ ?\d{1,4}(?:[.,]\d{2})?/gi) || [];
  return [...new Set(achados.map((p) => p.replace(/\s/g, '')))];
}

// Procura recursivamente objetos de anúncio dentro do JSON do GraphQL.
function extrairAnuncios(obj, saida) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const v of obj) extrairAnuncios(v, saida);
    return;
  }
  if (obj.ad_archive_id && obj.snapshot) {
    const s = obj.snapshot || {};
    const cards = Array.isArray(s.cards) ? s.cards : [];
    const link = desembrulhar(s.link_url || cards.find((c) => c.link_url)?.link_url || '');
    const corpo = [s.body?.text, s.title, s.link_description, s.caption, ...cards.map((c) => `${c.title || ''} ${c.body || ''}`)]
      .filter(Boolean)
      .join(' \n ');
    saida.push({
      id: String(obj.ad_archive_id),
      variacoes: Number(obj.collation_count) || 1,
      pagina: obj.page_name || s.page_name || '',
      pagina_id: String(obj.page_id || s.page_id || ''),
      seguidores: Number(s.page_like_count || obj.page_like_count) || 0,
      inicio: obj.start_date ? new Date(obj.start_date * 1000) : null,
      ativo: obj.is_active !== false,
      link,
      cta: s.cta_text || '',
      texto: corpo.slice(0, 600),
      plataformas_meta: obj.publisher_platform || [],
    });
    return;
  }
  for (const v of Object.values(obj)) extrairAnuncios(v, saida);
}

function parseRespostas(texto) {
  const limpo = texto.replace(/^for \(;;\);/, '');
  const objs = [];
  for (const linha of limpo.split('\n')) {
    const l = linha.trim();
    if (!l.startsWith('{')) continue;
    try {
      objs.push(JSON.parse(l));
    } catch {
      /* linha parcial, ignora */
    }
  }
  return objs;
}

// Plano B: lê o que está na tela, caso o formato do GraphQL mude.
async function extrairDaTela(page) {
  return page.evaluate(() => {
    const out = [];
    const blocos = [...document.querySelectorAll('div')].filter((d) => {
      const t = d.innerText || '';
      return /(ID da biblioteca|Library ID)\s*:\s*\d+/.test(t) && t.length < 4000;
    });
    // fica só com os blocos mais internos
    const internos = blocos.filter((b) => !blocos.some((o) => o !== b && b.contains(o)));
    for (const b of internos) {
      const t = b.innerText;
      const id = (t.match(/(?:ID da biblioteca|Library ID)\s*:\s*(\d+)/) || [])[1];
      const inicio = (t.match(/(?:Veiculação iniciada em|Started running on)\s*([^\n]+)/) || [])[1] || '';
      const variacoes = Number((t.match(/(\d+)\s*(?:anúncios usam|ads use)/) || [])[1] || 1);
      const card = b.closest('div[class]')?.parentElement || b;
      const links = [...card.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => !/facebook\.com\/(ads\/library|[^/]+\/?$)/.test(h));
      const paginaEl = card.querySelector('a[href*="facebook.com/"] span, a[href*="facebook.com/"]');
      out.push({ id, inicioTexto: inicio, variacoes, links, pagina: paginaEl?.innerText || '', texto: (card.innerText || '').slice(0, 600) });
    }
    return out;
  });
}

// ---------- coleta ----------
async function main() {
  if (args.includes('--reprocessar')) {
    const brutos = JSON.parse(fs.readFileSync(path.join(DIR, 'relatorios', `${iso(hoje)}-brutos.json`), 'utf8'));
    const m = new Map(brutos.map((a) => [a.id, { ...a, inicio: a.inicio ? new Date(a.inicio) : null, palavras: new Set(a.palavras) }]));
    return ranquear(m);
  }
  console.log(`\n🔎 Minerando ${palavras.length} palavras-chave | país ${pais} | anúncios iniciados desde ${iso(dataMin)}${corteRecentes ? ` | só ofertas lançadas desde ${iso(corteRecentes)}` : ''}${precoMaximo ? ` | até R$${precoMaximo}` : ''}\n`);
  const browser = await chromium.launch({ headless: !mostrar });
  const context = await browser.newContext({
    locale: 'pt-BR',
    viewport: { width: 1366, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const anuncios = new Map();
  let palavraAtual = '';
  let limitado = false;
  const guardar = (lista) => {
    for (const a of lista) {
      if (!anuncios.has(a.id)) anuncios.set(a.id, { ...a, palavras: new Set([palavraAtual]) });
      else anuncios.get(a.id).palavras.add(palavraAtual);
    }
  };
  const ordens = new Set();
  page.on('request', (req) => {
    if (!req.url().includes('/api/graphql')) return;
    const m = decodeURIComponent(req.postData() || '').match(/"sortData":\{"mode":"([A-Z_]+)"/);
    if (m) ordens.add(m[1]);
  });
  page.on('response', async (resp) => {
    if (!resp.url().includes('/api/graphql')) return;
    try {
      const txt = await resp.text();
      if (txt.includes('Rate limit exceeded')) limitado = true;
      if (!txt.includes('ad_archive_id')) return;
      const lista = [];
      for (const o of parseRespostas(txt)) extrairAnuncios(o, lista);
      guardar(lista);
    } catch {
      /* resposta já descartada */
    }
  });

  for (const q of palavras) {
    palavraAtual = q;
    const antes = anuncios.size;
    process.stdout.write(`  • "${q}" ... `);
    try {
      await page.goto(urlBusca(q), { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(4000);
      // os primeiros resultados vêm embutidos no HTML, dentro de <script type="application/json">
      await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
      const jsons = await page
        .$$eval('script[type="application/json"]', (els) =>
          els.map((e) => e.textContent).filter((t) => t && t.includes('ad_archive_id')),
        )
        .catch(() => []); // a página às vezes se redireciona sozinha no meio da leitura
      for (const t of jsons) {
        try {
          const lista = [];
          extrairAnuncios(JSON.parse(t), lista);
          guardar(lista);
        } catch {
          /* bloco inválido */
        }
      }
      await page.keyboard.press('Escape').catch(() => {}); // fecha aviso de "bloqueador de anúncios"
      const okBtn = page.getByRole('button', { name: 'OK', exact: true });
      if (await okBtn.count().catch(() => 0)) await okBtn.first().click().catch(() => {});
      if (config.ordenar_mais_recentes !== false) {
        try {
          await page.getByText('Classificar por').first().click({ timeout: 5000 });
          await page.getByText('Mais recentes', { exact: true }).last().click({ timeout: 5000 });
          const aplicar = page.getByRole('button', { name: /Aplicar|Mostrar resultados|Apply/ });
          if (await aplicar.count()) await aplicar.first().click().catch(() => {});
          await page.waitForTimeout(3500);
        } catch {
          /* menu não apareceu; segue com a ordem padrão */
        }
      }
      // fecha banner de cookies se aparecer
      for (const txt of ['Permitir todos os cookies', 'Allow all cookies', 'Recusar cookies opcionais', 'Decline optional cookies']) {
        const b = page.getByRole('button', { name: txt });
        if (await b.count().catch(() => 0)) {
          await b.first().click().catch(() => {});
          break;
        }
      }
      for (let i = 0; i < rolagens; i++) {
        await page.mouse.wheel(0, 4000);
        await page.waitForTimeout(1800 + Math.random() * 1200);
      }
      // plano B: se o GraphQL não trouxe nada, lê a tela
      if (anuncios.size === antes) {
        for (const d of await extrairDaTela(page)) {
          if (!d.id || anuncios.has(d.id)) continue;
          const link = desembrulhar(d.links.find((l) => !l.includes('facebook.com') || l.includes('l.php')) || '');
          anuncios.set(d.id, {
            id: d.id, variacoes: d.variacoes, pagina: d.pagina, pagina_id: '', inicio: null, inicioTexto: d.inicioTexto,
            ativo: true, link, cta: '', texto: d.texto, plataformas_meta: [], palavras: new Set([q]),
          });
        }
      }
      console.log(`${anuncios.size - antes} anúncios novos${limitado ? ' (⚠️ a Meta limitou as buscas — espere uns minutos)' : ''}`);
      await page.waitForTimeout(3000 + Math.random() * 4000); // pausa entre buscas pra não ser limitado
    } catch (e) {
      console.log(`erro: ${e.message.split('\n')[0]}`);
    }
  }

  if (anuncios.size === 0) {
    const shot = path.join(DIR, 'relatorios', `erro-${iso(hoje)}.png`);
    fs.mkdirSync(path.dirname(shot), { recursive: true });
    await page.screenshot({ path: shot, fullPage: false }).catch(() => {});
    console.log(`\n⚠️  Nenhum anúncio coletado. O Facebook pode ter pedido login ou bloqueado. Print salvo em ${shot}`);
  }
  if (ordens.size) console.log(`  (ordenação usada pela Meta: ${[...ordens].join(', ')})`);
  await browser.close();

  fs.mkdirSync(path.join(DIR, 'relatorios'), { recursive: true });
  fs.writeFileSync(
    path.join(DIR, 'relatorios', `${iso(hoje)}-brutos.json`),
    JSON.stringify([...anuncios.values()].map((a) => ({ ...a, palavras: [...a.palavras] })), null, 2),
  );

  ranquear(anuncios);
}

// parece português? (descarta anúncio gringo que aparece no Brasil)
const PT = /\b(você|voce|para|seu|sua|agora|aprenda|como|não|hoje|grátis|gratuit)\b/i;

function ranquear(anuncios) {
  // ---------- agrupar por oferta ----------
  const ofertas = new Map();
  for (const a of anuncios.values()) {
    if (ignorar.some((d) => (a.link || '').toLowerCase().includes(d))) continue; // app, Instagram, loja...
    if ((a.texto || '').includes('{{product.')) continue; // anúncio de catálogo = e-commerce, não infoproduto
    if (!PT.test(a.texto || '')) continue;
    if (corteRecentes && a.inicio && a.inicio < corteRecentes) continue; // anúncio antigo
    const k = chaveOferta(a.link, a.pagina_id || a.pagina);
    if (!ofertas.has(k)) ofertas.set(k, { chave: k, link: a.link, anuncios: [], paginas: new Set(), palavras: new Set(), variacoes: 0, seguidores: 0 });
    const o = ofertas.get(k);
    o.anuncios.push(a);
    o.paginas.add(a.pagina);
    a.palavras.forEach((p) => o.palavras.add(p));
    o.variacoes += a.variacoes;
    o.seguidores = Math.max(o.seguidores, a.seguidores || 0);
    if (!o.link && a.link) o.link = a.link;
  }

  const ranking = [...ofertas.values()]
    .map((o) => {
      const texto = o.anuncios.map((a) => a.texto).join(' ');
      const linkLower = (o.link || '').toLowerCase();
      const checkout = plataformas.find((p) => linkLower.includes(p)) || '';
      const sinaisAchados = sinais.filter((r) => r.test(texto)).length;
      const totalAnuncios = o.anuncios.length;
      const primeiro = o.anuncios.reduce((m, a) => (a.inicio && (!m || a.inicio < m) ? a.inicio : m), null);
      const diasNoAr = primeiro ? Math.max(0, Math.round((hoje - primeiro) / 86400000)) : null;
      // anúncios que começaram dentro da janela = o anunciante está subindo campanha nova agora
      const novos = o.anuncios.filter((a) => a.inicio && a.inicio >= new Date(dataMin.getTime() - 86400000)).length;
      const ehPdf = !sinaisPdf.length || sinaisPdf.some((r) => r.test(texto) || r.test(o.link || ''));
      const valores = precos(texto).map(valor).filter((v) => v > 0);
      const menorPreco = valores.length ? Math.min(...valores) : null;
      const score =
        o.variacoes + totalAnuncios * 2 + novos * 3 + (checkout ? 5 : 0) + sinaisAchados * 1.5 +
        (corteRecentes ? 0 : Math.min(diasNoAr || 0, 30) / 6);
      const exemplo = o.anuncios.slice().sort((x, y) => y.variacoes - x.variacoes)[0];
      return {
        oferta: o.chave,
        link: o.link,
        paginas: [...o.paginas].filter(Boolean),
        anuncios_ativos: totalAnuncios,
        variacoes_total: o.variacoes,
        seguidores_pagina: o.seguidores,
        checkout,
        precos: precos(texto),
        primeiro_anuncio: primeiro ? iso(primeiro) : exemplo.inicioTexto || '',
        dias_no_ar: diasNoAr,
        anuncios_novos: novos,
        palavras: [...o.palavras],
        score: Math.round(score * 10) / 10,
        sinais: sinaisAchados,
        eh_pdf: ehPdf,
        menor_preco: menorPreco,
        exemplo_texto: (exemplo.texto || '').replace(/\s+/g, ' ').slice(0, 280),
        anuncio_biblioteca: `https://www.facebook.com/ads/library/?id=${exemplo.id}`,
        ids: o.anuncios.map((a) => a.id),
      };
    })
    .filter((r) => r.anuncios_ativos >= minimoAnuncios || r.variacoes_total >= minimoAnuncios)
    .filter((r) => r.checkout || r.sinais > 0)
    .filter((r) => r.eh_pdf)
    .filter((r) => !precoMaximo || r.menor_preco == null || r.menor_preco <= precoMaximo)
    .sort((a, b) => (ordenarSeguidores ? b.seguidores_pagina - a.seguidores_pagina : 0) || b.score - a.score);

  salvar(ranking, anuncios.size);
}

// ---------- relatório ----------
function salvar(ranking, totalBruto) {
  const pasta = path.join(DIR, 'relatorios');
  fs.mkdirSync(pasta, { recursive: true });
  const base = path.join(pasta, `${iso(hoje)}`);
  fs.writeFileSync(`${base}.json`, JSON.stringify({ gerado_em: hoje.toISOString(), pais, dias, palavras, totalBruto, ranking }, null, 2));

  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let md = `# PDFs low ticket recentes — ${iso(hoje)}\n\nLançados nos últimos ${recentesDias || '∞'} dias · até R$${precoMaximo || '∞'}\n\n`;
  md += `País: ${pais} · Janela: últimos ${dias} dia(s) · ${totalBruto} anúncios lidos · ${ranking.length} ofertas com ${minimoAnuncios}+ anúncios\n\n`;
  md += `| # | Oferta | Anúncios | Novos | Variações | Seguidores | Dias no ar | Checkout | Preço | Página | Links |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
  ranking.slice(0, 50).forEach((r, i) => {
    md += `| ${i + 1} | ${r.oferta.replace(/\|/g, '/')} | ${r.anuncios_ativos} | ${r.anuncios_novos} | ${r.variacoes_total} | ${fmt(r.seguidores_pagina)} | ${r.dias_no_ar ?? '-'} | ${r.checkout || '-'} | ${r.precos.slice(0, 2).join(' ') || '-'} | ${r.paginas.slice(0, 2).join(', ').replace(/\|/g, '/')} | [produto](${r.link || '#'}) · [anúncio](${r.anuncio_biblioteca}) |\n`;
  });
  fs.writeFileSync(`${base}.md`, md);

  const linhas = ranking.slice(0, 100).map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><b>${esc(r.paginas[0] || '—')}</b><br><small>${esc(r.exemplo_texto)}</small></td>
      <td class="n">${r.anuncios_ativos}</td><td class="n">${r.anuncios_novos}</td><td class="n">${r.variacoes_total}</td><td class="n">${fmt(r.seguidores_pagina)}</td>
      <td>${esc(r.checkout || '—')}</td><td>${esc(r.precos.slice(0, 3).join(' ') || '—')}</td>
      <td>${esc(r.primeiro_anuncio)}${r.dias_no_ar != null ? `<br><small>${r.dias_no_ar} dias</small>` : ''}</td>
      <td>${r.link ? `<a href="${esc(r.link)}" target="_blank">Ver produto</a><br>` : ''}<a href="${esc(r.anuncio_biblioteca)}" target="_blank">Ver anúncio</a></td>
    </tr>`).join('');
  fs.writeFileSync(`${base}.html`, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PDFs low ticket ${iso(hoje)}</title><style>
body{font-family:system-ui,sans-serif;margin:16px;background:#fafafa;color:#111}table{border-collapse:collapse;width:100%;background:#fff}
td,th{border-bottom:1px solid #e5e5e5;padding:8px;text-align:left;vertical-align:top;font-size:14px}th{background:#f0f0f0}.n{text-align:right;font-weight:600}
small{color:#555}a{color:#0a58ca}@media (prefers-color-scheme:dark){body{background:#111;color:#eee}table{background:#1a1a1a}th{background:#222}td,th{border-color:#333}small{color:#aaa}a{color:#6ea8fe}}
</style></head><body><h1>PDFs low ticket recentes — ${iso(hoje)}</h1>
<p>PDF low ticket · lançados nos últimos ${recentesDias || '∞'} dias · até R$${precoMaximo || '∞'} · País ${pais} · ${totalBruto} anúncios lidos · ${ranking.length} ofertas. Ordenado por força: anúncios ativos, anúncios novos na janela, variações do mesmo criativo, tempo no ar, checkout e sinais de low ticket.</p>
<div style="overflow-x:auto"><table><tr><th>#</th><th>Página / copy</th><th>Anúncios</th><th>Novos hoje</th><th>Variações</th><th>Seguidores da página</th><th>Checkout</th><th>Preço</th><th>Início</th><th>Links</th></tr>${linhas}</table></div></body></html>`);

  console.log(`\n✅ ${ranking.length} ofertas ranqueadas. Relatórios:\n   ${base}.html\n   ${base}.md\n   ${base}.json\n`);
  ranking.slice(0, 10).forEach((r, i) =>
    console.log(`${String(i + 1).padStart(2)}. [${r.score}] ${r.paginas[0] || r.oferta} — ${r.anuncios_ativos} anúncios, ${r.variacoes_total} variações ${r.checkout ? `(${r.checkout})` : ''}\n    produto: ${r.link || '—'}\n    anúncio: ${r.anuncio_biblioteca}`),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
