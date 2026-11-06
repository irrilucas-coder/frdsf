# Monitoramento de canais do YouTube

Coleta automática feita por uma tarefa agendada do Claude Code, que abre uma sessão nova a cada 3 horas.

- `coletar.py <handle> <pasta>`: grava o retrato atual do canal (inscritos, vídeos, views) sem precisar de chave de API.
- `custki/resumo.md`: tabela atualizada a cada coleta, com os vídeos novos e o ganho de views desde a coleta anterior.
- `custki/analise.md`: análise do formato (o que o canal faz, como faz e por que funciona). O Claude atualiza esse arquivo quando surge algo novo.
- `custki/snapshots.jsonl` e `custki/videos.json`: dados brutos e histórico.

Para rodar manualmente: `python3 monitoramento/coletar.py Custki monitoramento/custki`

O ambiente de nuvem precisa ter `www.youtube.com` e `i.ytimg.com` liberados. O ambiente "frdsf (YouTube monitor)" já tem esses dois domínios.
