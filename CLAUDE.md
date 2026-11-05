# Preparativos — instruções para o Claude
- Português do Brasil. Nunca chaves, senhas ou e-mails no código ou nos textos (repositório público).
- Acesso só pelo login do Google do menu (`/estudio-login.js`); não crie bypass nem modo teste.
- Padrão do Estúdio: PREPARATIVOS no cabeçalho, `/estudio-conta.js` com `<span data-estudio-conta>`, ícones de linha, sem emoji.
- SEM nenhum indicativo de IA nas telas (pedido da dona): o botão é só "Organizar".
- Nuvem no limite: rascunhos e áudios ficam no IndexedDB `ep-preparativos` até a pessoa mandar; nada de operações em massa.
- O formato na nuvem (`preparativos/<id>/prep.json`) é um CONTRATO com o Animador, o Shorts e o Editor (README.md). Mudou? Atualize o README e o CLAUDE.md do site.
- Conferir antes do push: `for f in js/*.js; do node --check "$f"; done; node js/roteiro.js`.
