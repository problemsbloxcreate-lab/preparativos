# Preparativos — instruções para o Claude
- Português do Brasil. Nunca chaves, senhas ou e-mails no código ou nos textos (repositório público).
- Acesso só pelo login do Google do menu (`/estudio-login.js`); não crie bypass nem modo teste.
- Padrão do Estúdio: PREPARATIVOS no cabeçalho, `/estudio-conta.js` com `<span data-estudio-conta>`, ícones de linha, sem emoji.
- SEM nenhum indicativo de IA nas telas (pedido da dona): o botão é só "Organizar".
- Nuvem no limite: rascunhos e áudios ficam no IndexedDB `ep-preparativos` até a pessoa mandar; nada de operações em massa.
- O formato na nuvem (`preparativos/<id>/prep.json`) é um CONTRATO com o Animador, o Shorts e o Editor (README.md). Mudou? Atualize o README e o CLAUDE.md do site.
- Conferir antes do push: `for f in js/*.js; do node --check "$f"; done; node js/roteiro.js`.
- FORMATO DO ROTEIRO (para escrever ou ler um roteiro): README.md › "Como escrever o roteiro". Resumo: `## Parte`, `Nome: fala`,
  `*itálico*` = ação / como falar (vira nota, fora da legenda), linha inteira em itálico ou `[…]` = cena, `//` = comentário. O parser é
  `js/roteiro.js` (classifica/separa); a folha estilo Google Docs é `js/editor.js` (o texto é a fonte de verdade; a pintura nunca muda o texto).
