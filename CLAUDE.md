## Estúdio Problems: Cérebro e CelestIA (pedido da dona, 12/11/2026)
Este repositório é do Estúdio Problems. Se `~/.claude/cerebro.mjs` não existir (ou faltar a skill celestia ou a chave do Cérebro), pergunte uma vez "Posso instalar o Cérebro e a CelestIA neste computador?" e, com o sim, baixe https://problemsbloxcreate-lab.github.io/cerebro/cerebro.mjs e rode `node cerebro.mjs instalar` **antes de mexer**. Mostre o código `c-…` para a pessoa autorizar em https://estudio.problemsraiz.workers.dev/cerebro/?aba=chaves, logada na conta dela (não precisa de ADM). Depois, siga o Cérebro e a CelestIA: antes de mudar, `node ~/.claude/cerebro.mjs conferir` e leia a página do programa no Cérebro; depois, grave o que mudou. Passo a passo: https://problemsbloxcreate-lab.github.io/cerebro/instalar.html

# Preparativos — instruções para o Claude
## ANTES DE TUDO: LEIA O CÉREBRO (pedido da dona, 09/11/2026)
O Cérebro (`/cerebro/`) é a memória compartilhada da equipe e das IAs. Vale mesmo que ninguém tenha citado:
- **Antes de qualquer tarefa**, leia o Cérebro e use como base: `node ~/.claude/cerebro.mjs comece`, `indice`, `buscar "palavras"`, `ler "Pasta/Arquivo"` e `pedidos`.
- **Depois**, grave nele o que mudou ou foi aprendido (`salvar` ou `aprender`), dizendo qual IA gravou e quem pediu. Bíblias, skills e referências são atualizadas lá.
- **Em toda resposta**, cite o Cérebro numa linha no fim: `Cérebro: consultei <Pasta/Arquivo>` e, se gravou algo, `gravei <Pasta/Arquivo>`. Se não achou nada, escreva `Cérebro: nada sobre isso`. Vale para qualquer conta do Claude e qualquer IA, nova ou antiga.
- Sem o `cerebro.mjs` neste computador: use `cerebro/cerebro.mjs` do repositório do site. A chave fica em `~/.claude/cerebro-chave.txt` ou na variável `CEREBRO_CHAVE`; nunca a mostre nem a coloque em repositório.

- Português do Brasil. Nunca chaves, senhas ou e-mails no código ou nos textos (repositório público).
- Acesso só pelo login do Google do menu (`/estudio-login.js`); não crie bypass nem modo teste.
- Padrão do Estúdio: PREPARATIVOS no cabeçalho, `/estudio-conta.js` com `<span data-estudio-conta>`, ícones de linha, sem emoji.
- SEM nenhum indicativo de IA nas telas (pedido da dona): o botão é só "Organizar".
- Nuvem no limite: rascunhos e áudios ficam no IndexedDB `ep-preparativos` até a pessoa mandar; nada de operações em massa.
- O formato na nuvem (`preparativos/<id>/prep.json`) é um CONTRATO com o Animador, o Shorts e o Editor (README.md). Mudou? Atualize o README e o CLAUDE.md do site.
- Conferir antes do push: `for f in js/*.js; do node --check "$f"; done; node js/roteiro.js`.
- FORMATO DO ROTEIRO (para escrever ou ler um roteiro): README.md › "Como escrever o roteiro". Resumo: `## Parte`, `Nome: fala`,
  `*itálico*` = ação / como falar (vira nota, fora da legenda), linha inteira em itálico ou `[…]` = cena, `//` = comentário. O parser é
  `js/roteiro.js` (classifica/separa); a folha é `js/editor.js` (o texto é a fonte de verdade; a pintura nunca muda o texto).
- Roteiro aberto = "modo documento" (body.modo-doc): tela de editor de documento, ESCURA por padrão (Ver › Tema claro = classe .claro, localStorage `ep-prep-tema`); o cabeçalho do programa some e o `[data-estudio-conta]` é movido para `.dh-conta` (modoDoc() devolve ao sair).
- BOLINHA DO PERSONAGEM: sempre `ava()` do app.js. Ela é um <span>: NUNCA escreva regra genérica tipo `.lista button span{flex:1}` — use `>span` ou uma classe. A `.ava` tem tamanho blindado com !important no fim do css/app.css.
- PÁGINAS: o texto é UMA folha editável; `pagina()` do app.js empurra (margin-top) a linha que não cabe para a próxima página e desenha as folhas atrás (.fundo). Margens em `P.pagina`, arrastando as réguas.
- PERSONAGENS da equipe: `preparativos/personagens.json` (nome, cor, foto WEBP, grupo). O servidor cadastra sozinho quem aparece num roteiro salvo. Pastas: Principais/Secundários/da pessoa; o roteiro pode ter as próprias (`P.org`).
- Legenda no programa de destino: só o texto; o nome de quem fala só com `legenda.mostrarNome`.
- `legenda.estilo` (fonte, tamanho, posição, sombra DESLIGADA por padrão, contorno, fundo) e `legenda.quadro` ({w,h}, padrão 1080×1920): medidas em fração do quadro (ver README). A imagem de fundo da prévia é só local (IndexedDB `ep-preparativos-miniaturas`, chave `fundo-legenda`).
- Nada de mencionar outros produtos (ex.: editores de texto conhecidos) nas telas.
- TEMA (regra da dona): menus (botão direito, Arquivo…), janelas e popups SEGUEM O TEMA (escuro no modo escuro, claro no claro), a não ser que ela peça o contrário. Use as variáveis (--panel, --panel-2, --text, --muted, --line), nunca branco fixo.
- PERSONAGENS: renomear (botão direito) muda a lista da equipe e os roteiros AINDA NÃO USADOS (deste computador e da nuvem; `renomeiaNoPrep` troca só o nome nas falas, o áudio fica); os já usados por um programa não mudam (a janela lista eles). "Tirar da lista" = `acao personagens { k: { apagar: true } }`.
