# PREPARATIVOS · Estúdio Problems

O que vem antes de animar ou editar: **roteiros** em capítulos e partes, **falas por personagem**, **gravação** de cada fala pelo
navegador, **destino** (Animador, Criar Shorts ou Editar vídeos), **legendas** e a lista de **personagens** da equipe (foto, cor,
pasta). As **Ideias** (as mesmas do Animador) também moram aqui.

Endereço: https://estudio.problemsraiz.workers.dev/preparativos/ (só pelo login do menu; esta cópia do GitHub Pages é a origem
que o porteiro serve e redireciona para o endereço único).

## Como escrever o roteiro (leia antes de escrever ou ler um roteiro — vale para gente e para o Claude)

O roteiro é TEXTO simples, escrito na folha da aba Roteiro. O que está na folha é exatamente o texto guardado em
`prep.json → roteiro`; cores, marca-texto e páginas são só pintura em cima. Cada linha é uma destas:

```
# Episódio 1                          ← CAPÍTULO (título grande, opcional): agrupa as partes de baixo
## Parte 1                            ← PARTE: "## Nome" (ou uma linha só com "Parte 2", "Episódio 3…", "Cena 4…")
Problems: Oi, gente!                  ← FALA: "Nome: o que ele fala" — o nome antes dos dois-pontos (até 4 palavras)
Clara: *rindo* Oi, Problems!          ← *itálico* dentro da fala = como falar / o que ele faz → vira "nota" (fora da legenda e do áudio)
Clara (sussurrando): Vem cá.          ← "(nota)" logo depois do nome também é nota
e continua aqui.                      ← linha colada embaixo de uma fala (sem linha em branco) continua a MESMA fala
*Problems abre a porta devagar.*      ← linha inteira em itálico = AÇÃO / explicação da cena (não vira fala)
[a câmera se aproxima]                ← colchetes = cena (não vira fala)
// Clara: deixar esta fala mais curta ← COMENTÁRIO para a equipe (não vira fala)
---                                   ← QUEBRA DE PÁGINA: o que vem depois começa numa página nova (só visual)
```

- Maiúscula e minúscula no nome tanto faz: "Problems", "PROBLEMS" e "problems" são o mesmo personagem (mesma cor, mesma foto).
- Linha solta que não é nada disso = narração (não vira fala). Para um narrador falar, escreva `Narrador: …`.
- Deixe uma linha em branco entre uma fala e um texto solto, senão o texto solto vira continuação da fala.
- Falas logo abaixo de um `# Capítulo` sem `## Parte` viram uma parte com o nome do capítulo.
- Na folha: o NOME de cada personagem fica pintado na cor dele; a ação/explicação aparece com marca-texto amarelo bem leve e SEM os `*`
  (eles continuam no texto); os títulos aparecem grandes e no índice do lado esquerdo; o texto pula de página como num editor de texto
  (folha Carta 816 × 1056 px, margens de 96 px que mudam arrastando as réguas — ficam em `prep.json → pagina`).
- Selecionar um trecho (ou clique direito nele) abre o menu: **É o nome do personagem** (`Problems Oi` → `Problems: Oi`; nome sozinho
  numa linha + fala na de baixo → junta), **É ação / explicação da cena** (`*…*`), **É o título de um capítulo** (`# …`), **É o título de
  uma parte** (`## …`), **Texto normal** e **Comentário para a equipe** (pede o texto e põe `// Nome: texto (sobre "trecho")` logo abaixo).
  Toda mudança pelo menu mostra a linha antes e depois e pergunta antes de mudar. Ctrl+I = itálico. Colar de outro editor: o itálico de
  lá vira `*…*`, título 1 vira `# ` e título 2/3 vira `## `.
- O botão **Organizar** reescreve um texto solto neste formato como UMA edição (Ctrl+Z desfaz). Ao editar o texto, a fala igual continua
  com o áudio; a fala que mudou no mesmo lugar fica com o áudio e a marca "regravar".
- Quem lê o roteiro por código usa `Roteiro.classifica(texto)` (o que é cada linha) e `Roteiro.separa(texto)` (partes → falas), em `js/roteiro.js`.

## Neste computador × na nuvem

Um roteiro novo fica **só neste computador** (IndexedDB `ep-preparativos`) até alguém mandar. Ele vai para a nuvem quando a pessoa
clica em "Mandar para a nuvem", quando marca **Gravando** (cada um grava do próprio computador) ou **Pronto** (o programa de destino
precisa dele), ou sozinho a cada mudança se o roteiro estiver em **Arquivo › Trabalhar junto** (`prep.junto = true`; manda 20 s depois
da última mudança). O início mostra separado o que está "Neste computador" e "Na nuvem"; o cabeçalho do roteiro mostra onde ele está.

IndexedDB: loja `rasc` (rascunho do preparativo, chave = id, `{ P, base, em }`) e loja `aud` (gravação ainda não enviada, chave =
`<id>/<falaId>`, `{ blob, duracao, em }`). Áudio em Opus/WebM a 48 kbps (Safari: MP4/AAC).

## CONTRATO NA NUVEM (para o Animador, o Criar Shorts e o Editar vídeos)

Servidor `turma-ia` (`https://turma-ia.problemsraiz.workers.dev`, cabeçalho `authorization: Bearer <token do Firebase>`, o mesmo
das outras rotas). Chaves na nuvem da equipe:

| chave | o que é |
|---|---|
| `preparativos/<id>/prep.json` | o preparativo inteiro (abaixo) |
| `preparativos/<id>/aud/<falaId>-<t>.webm` | o áudio de uma fala (`.ogg`/`.m4a` também); nome novo a cada regravação |
| `preparativos/personagens.json` | os personagens da equipe: `{ "<nome em minúsculas>": { nome, cor, foto, grupo, atelie, em } }` (`atelie` = padrão no Animador: `{ id, nome }` \| `null` = nenhum; sem o campo = mesmo nome) |
| `preparativos/pers/<nome>-<t>.webp` | a foto de um personagem (WEBP, até 256 × 256, cortada no meio) |
| `preparativos/cores.json` | (antigo) `{ "<nome em minúsculas>": "#rrggbb" }` — ainda é lido; as cores novas vão para `personagens.json` |

### `prep.json`

```jsonc
{
  "v": 1,
  "id": "prm3k9x2ab",                    // [A-Za-z0-9_-]{2,40}
  "nome": "Episódio 1",
  "destino": "animador",                // "animador" | "shorts" | "editor" | null
  "status": "pronto",                    // "rascunho" | "gravando" | "pronto"
  "roteiro": "# Episódio 1\n## Parte 1\nProblems: Oi!\n…",   // o texto como foi escrito
  "partes": [
    { "id": "p…", "nome": "Parte 1", "capitulo": "Episódio 1",  // capitulo: opcional
      "falas": [
        { "id": "f…", "personagem": "Problems", "texto": "Oi!", "nota": "rindo",
          "audio": "preparativos/prm3k9x2ab/aud/f…-m3k.webm",   // ou null (ainda sem áudio)
          "duracao": 1.42,                                       // segundos
          "regravar": true,                                       // opcional: o texto mudou depois da gravação
          "em": "2026-11-05T18:00:00.000Z" }                      // quando o áudio chegou
      ] }
  ],
  "legenda": { "ativa": true, "mostrarNome": false, "cores": { "problems": "#19f0f0" } },
  "pagina": { "ml": 96, "mr": 96, "mt": 96, "mb": 96 },        // opcional: margens da folha (px)
  "org": { "propria": true, "grupos": { "juca": "Secundários" } }, // opcional: pastas dos personagens só deste roteiro
  "junto": false,                                              // opcional: "Trabalhar junto" (manda sozinho)
  "animador": { "pers": { "clara": { "id": "<id no Ateliê>", "nome": "Clara" }, "juca": null } }, // opcional (destino Animador): quem é quem
  "usadoPor": [ { "programa": "animador", "projeto": "<id da animação>", "quando": "2026-11-05T18:10:00.000Z" } ],
  "criado": 1793900000000,
  "mod": 1793901008021                   // versão (o servidor põe a cada gravação)
}
```

**LEGENDA NO PROGRAMA DE DESTINO:** mostre só o `texto` da fala (nunca a `nota`), na cor do personagem. O **nome de quem fala só aparece
se `legenda.mostrarNome === true`** (aí "Nome: texto"). `legenda.ativa === false` = sem legendas.

**ESTILO E TAMANHO DA LEGENDA** (aba Legendas; o Animador, o Shorts e o Editor devem usar): `legenda.quadro = { w, h }` = tamanho do
vídeo em px (padrão 1080 × 1920). `legenda.estilo` = `{ fonte ('Rubik'), tamanho (.045), peso (800), x (.5), y (.82), largura (.86),
alinhar ('left'|'center'|'right'), maiusculas (false), contorno: { ativo (false), cor, largura (.004) }, sombra: { ativa (FALSE por padrão),
cor, desfoque (.006), x (0), y (.003), opacidade (.8) }, fundo: { ativo (false), cor, opacidade (.5) } }`. TODOS os números de medida são
FRAÇÃO DA ALTURA do quadro (tamanho .045 = 4,5% da altura; em 1920 px = 86 px), menos `x`, `y` e `largura`, que são fração da largura/altura
do quadro: `x`,`y` = CENTRO da legenda (`y` é o meio do bloco de texto), `largura` = largura máxima da caixa (o texto quebra dentro dela).
Sem `estilo`/`quadro` = use esses padrões. A imagem de fundo da prévia é só do navegador de quem configurou e NÃO vai para a nuvem.

**ELENCO NO ANIMADOR** (guia "Elenco no Animador", aparece com destino = Animador): `prep.animador.pers[Roteiro.chave(nome)]` =
`{ id, nome }` (personagem do Ateliê, `personagens/<id>/personagem.json`) | `null` (nenhum personagem na cena). Sem entrada = o Animador
procura o PADRÃO do personagem (`personagens.json[chave].atelie`, escolhido na aba Personagens: `{ id, nome }` ou `null` = nenhum) e, sem
padrão, um personagem do Ateliê com o MESMO nome. Ordem: escolha do roteiro › padrão do personagem › mesmo nome. A lista do Ateliê vem do
`GET /personagens` (nome = metadata do `personagem.json`; pastas = `personagens/pastas.json`; miniatura = `thumb` do `personagem.json`).

Cor de um personagem: `prep.legenda.cores[nome.toLowerCase()]` → senão `personagens.json[nome.toLowerCase()].cor` → senão
`cores.json[nome.toLowerCase()]` → senão a cor padrão do programa. Foto (opcional): `personagens.json[…].foto` (chave do WEBP).

### Rotas

| pedido | o que faz | permissão |
|---|---|---|
| `GET /preparativos` | `{ itens: [{ id, nome, destino, status, mod, por, em, n, g, partes, pers }] }` (n = falas, g = gravadas, pers = até 8 nomes; `por` = código u…, nunca e-mail) | ver |
| `GET /preparativos/arquivo?k=<chave>` | o arquivo; o `prep.json` vem com `x-mod` | ver |
| `POST /preparativos/arquivo?k=…/prep.json&base=<mod>` | salva inteiro; `base` diferente da nuvem → 409 `conflito` (`&forcar=1` sobrescreve). `destino`/`status` só mudam com "pronto"; `usadoPor` só pela ação `usado`. Todo personagem novo das falas entra sozinho em `personagens.json` | roteiro (ou organizar) |
| `POST /preparativos/arquivo?k=…/aud/<falaId>-<t>.webm` | áudio de uma fala (até 8 MB) | gravar |
| `POST /preparativos/arquivo?k=preparativos/pers/<nome>-<t>.webp` | foto de um personagem (só WEBP, até 512 KB) | organizar |
| `POST /preparativos/acao {acao:'falas', id, falas:[{id, audio, duracao}]}` | liga os áudios às falas numa gravação só; o áudio antigo da fala é apagado | gravar |
| `POST /preparativos/acao {acao:'marca', id, destino?, status?}` | destino e situação | pronto |
| `POST /preparativos/acao {acao:'legenda', id, ativa, mostrarNome, cores, estilo, quadro}` | legendas do preparativo + as cores vão para `personagens.json` | organizar |
| `POST /preparativos/acao {acao:'personagens', itens:{ "<nome>": { nome?, cor?, foto?, grupo?, atelie? } }}` | muda personagens da equipe (`null` tira foto/grupo; foto antiga é apagada; `atelie: null` = nenhum, `atelie: "auto"` tira o padrão) → `{ personagens }` | organizar |
| `POST /preparativos/acao {acao:'cores', cores}` | (antigo) junta cores → `personagens.json` | organizar |
| `POST /preparativos/acao {acao:'usado', id, programa, projeto}` | **o programa que usou avisa aqui** (Animador/Shorts/Editor) | ver |
| `DELETE /preparativos/arquivo?k=preparativos/<id>/` | apaga o preparativo inteiro | quem criou ou ADM |

Todas as respostas de `acao` trazem o `mod` novo. Para pegar os preparativos prontos para um programa:
`GET /preparativos` → filtrar `status === 'pronto' && destino === '<programa>'` → `GET …/prep.json` → baixar os `audio` das falas.

As Ideias usam a rota de sempre: `GET/PUT/POST /ideias` (`ideias/ideias.json`, `ideias/analise.json`, `ideias/canais.json`).

### Permissões (`permissoes.json` do site)

Programa `preparativos` (ver) e funções `preparativos.gravar`, `preparativos.roteiro`, `preparativos.organizar`, `preparativos.pronto`,
`preparativos.ideias`. No navegador: `window.EstudioPerm?.pode?.('preparativos.gravar') ?? true`. Quem só tem ver + gravar lê o
roteiro e grava as próprias falas.

## Publicar

Commit + `git pull --rebase` + push na `main` (o GitHub Pages publica a raiz). Antes: `node --check js/*.js` e `node js/roteiro.js`.

## Link de dublagem

LINK DE DUBLAGEM (06/11/2026): página PÚBLICA `/dublar/#t=<token>` servida pelo PORTEIRO (arquivos `preparativos/dublar/{index.html,dublar.js,dublar.css}`, só esses, com CSP rígida). A API `/dublar/api/{ver,enviar,terminar}` do porteiro (POST só da mesma origem) repassa ao turma-ia pela ligação TURMA com `x-porteiro-nome`/`x-porteiro-id` de quem tem sessão; o turma-ia recusa `/dublar/*` vindo da internet (req.cf). Token 32 bytes aleatórios, só o HASH fica (`dublar-links/<sha256>` = id; `preparativos/<id>/dublar.json` = { links, pend }). Vale só para as falas escolhidas (todas / um personagem / uma fala), prazo 1 hora ou sem prazo; link de UM personagem/fala morre no "Terminei", de vários só quando o responsável encerra (ou vence). Limites: 20 MB, tipo pelo conteúdo (`tipoAudio`), 10 envios por fala, 6×falas por link, 40 pedidos/min por link e 60 por IP. Áudios em `preparativos/<id>/dub/` "aguardando aprovação" até a ação `dublar` (op lista|novo|desliga|aceita|recusa); permissão `preparativos.links` para criar/encerrar, `gravar` para aceitar. Fala aceita ganha `audio` (chave dub/) e `dub: { nome, conta, em }`. Depois de publicar o turma-ia, rodar a Action `porta-reserva.yml` (estudio-problems).

Também: cada fala aceita áudio pronto (mp3, wav, ogg, m4a, webm até 20 MB; o servidor confere o tipo pelo conteúdo) e a onda da fala é clicável para ir a qualquer ponto.

## Fala de vários personagens

FALA DE VÁRIOS PERSONAGENS (06/11/2026): "Stick e Problems (juntos): CLARA!" (separadores "e", ",", "+", "&") vira UMA fala com `personagens: ['Stick','Problems']` (o `personagem` continua o texto inteiro) — só quando cada nome já existe sozinho no roteiro ou na aba Personagens. `audio` = todos juntos; `audios: { '<nome minúsculo>': { audio, duracao } }` = a versão de cada um (ação `falas` com `de`; link de dublagem de um personagem também grava em `audios`). Legenda: cor NEUTRA (#ffffff) a não ser que a fala tenha `cor` própria. No Animador: os vários em cena.
