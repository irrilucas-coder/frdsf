---
name: minerar-low-ticket
description: Minera a Biblioteca de Anúncios da Meta atrás de ofertas low ticket (ebooks, guias, packs, apostilas, produtos feitos com IA) que estão escalando hoje, ranqueia e entrega os links do produto e do anúncio para modelar. Use quando o usuário pedir "minerar", "o que está vendendo", "ofertas do dia", "low ticket escalando" ou similar.
---

# Minerar ofertas low ticket

O robô fica em `minerador/minerar.js` e as palavras-chave em `minerador/config.json`.

## Passo a passo

1. Se o usuário citou um nicho ou palavras (ex.: "receitas", "renda extra"), passe com `--palavras "a,b,c"`.
   Se citou período ("últimos 3 dias"), use `--dias N`. Padrão: 1 dia (só o que começou ontem/hoje).
2. Rode:
   ```bash
   node minerador/minerar.js [--dias N] [--palavras "..."] [--minimo 2]
   ```
   Demora ~30–60 s por palavra-chave. Se der 0 anúncios, veja o print em `minerador/relatorios/erro-*.png`
   (normalmente é bloqueio de rede, pedido de login ou mudança no site) e avise o usuário.
3. Leia `minerador/relatorios/<data>.json` e faça a ANÁLISE, não só copie a tabela:
   - **Top 10** com: nome da página, o que é o produto (deduza da copy), preço, checkout,
     nº de anúncios ativos e variações, link do produto e link do anúncio.
   - Como ler os números: muitos anúncios ativos + muitas variações do mesmo criativo = o anunciante está
     duplicando campanha porque está lucrando. Oferta com 1 anúncio só é teste.
   - Ofertas que aparecem em várias páginas diferentes = provável produto com afiliados ou já modelado (nicho quente).
   - Agrupe por nicho (ex.: receitas, finanças, maternidade, espiritualidade, IA) e diga quais nichos estão mais quentes.
   - Para cada um dos top 5, dê uma ideia de como **modelar com IA** (formato, ângulo da copy, bônus, preço sugerido),
     sem copiar marca, nome ou material da outra pessoa.
4. Mostre o caminho do HTML (`minerador/relatorios/<data>.html`) para o usuário clicar nos links.

## Ajustes
- Destinos ignorados (apps, Instagram, WhatsApp): `ignorar_destinos` no config.
- Trocar nichos fixos: edite `palavras_chave` em `minerador/config.json`.
- Mais resultados por palavra: aumente `rolagens_por_palavra`.
- O robô precisa acessar `www.facebook.com`. Em sessão na nuvem, o host precisa estar liberado na rede do ambiente.
- Sem login, a Meta limita as buscas ("Rate limit exceeded"), principalmente em servidores de nuvem: cada palavra
  traz ~30 anúncios e o resto é cortado. Rodar no computador do usuário (internet de casa) rende bem mais.
  Se aparecer o aviso, espere alguns minutos e rode de novo com menos palavras.
