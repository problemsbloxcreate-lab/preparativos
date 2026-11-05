# PREPARATIVOS · Estúdio Problems

O que vem antes de animar ou editar: **roteiros** em partes nomeadas, **falas por personagem**, **gravação** de cada fala pelo
navegador, **destino** (Animador, Criar Shorts ou Editar vídeos) e **legendas** com cor por personagem. As **Ideias** (as mesmas
do Animador) também moram aqui.

Endereço: https://estudio.problemsraiz.workers.dev/preparativos/ (só pelo login do menu; esta cópia do GitHub Pages é a origem
que o porteiro serve e redireciona para o endereço único).

## Como escrever o roteiro

```
## Episódio 1 parte 1
PROBLEMS: Oi, gente!
CLARA: (rindo) Oi, Problems.
[a câmera se aproxima]          ← indicação de cena (não vira fala)
// anotação                     ← comentário (não vira fala)

## Episódio 1 parte 2
PROBLEMS: Tchau!
```

- `## Nome` (ou uma linha só com "Parte 2", "Episódio 3…", "Cena 4…") começa uma parte.
- `NOME: texto` é uma fala (nome com até 4 palavras). Linha seguida sem linha em branco continua a fala.
- `(nota)` no começo da fala = como falar; não entra na legenda.
- O botão **Organizar** arruma um texto solto nesse formato. Ao editar o texto, a fala igual continua com o áudio; a fala que mudou
  no mesmo lugar fica com o áudio e a marca "regravar".

## Navegador (nada vai para a nuvem sem a pessoa mandar)

IndexedDB `ep-preparativos`: loja `rasc` (rascunho do preparativo, chave = id, `{ P, base, em }`) e loja `aud` (gravação ainda não
enviada, chave = `<id>/<falaId>`, `{ blob, duracao, em }`). Áudio em Opus/WebM a 48 kbps (Safari: MP4/AAC).

## CONTRATO NA NUVEM (para o Animador, o Criar Shorts e o Editar vídeos)

Servidor `turma-ia` (`https://turma-ia.problemsraiz.workers.dev`, cabeçalho `authorization: Bearer <token do Firebase>`, o mesmo
das outras rotas). Chaves na nuvem da equipe:

| chave | o que é |
|---|---|
| `preparativos/<id>/prep.json` | o preparativo inteiro (abaixo) |
| `preparativos/<id>/aud/<falaId>-<t>.webm` | o áudio de uma fala (`.ogg`/`.m4a` também); nome novo a cada regravação |
| `preparativos/cores.json` | `{ "<nome em minúsculas>": "#rrggbb" }` — cor da legenda de cada personagem, para a equipe toda |

### `prep.json`

```jsonc
{
  "v": 1,
  "id": "prm3k9x2ab",                    // [A-Za-z0-9_-]{2,40}
  "nome": "Episódio 1",
  "destino": "animador",                // "animador" | "shorts" | "editor" | null
  "status": "pronto",                    // "rascunho" | "gravando" | "pronto"
  "roteiro": "## Episódio 1 parte 1\nPROBLEMS: Oi!\n…",   // o texto como foi escrito
  "partes": [
    { "id": "p…", "nome": "Episódio 1 parte 1",
      "falas": [
        { "id": "f…", "personagem": "PROBLEMS", "texto": "Oi!", "nota": "rindo",
          "audio": "preparativos/prm3k9x2ab/aud/f…-m3k.webm",   // ou null (ainda sem áudio)
          "duracao": 1.42,                                       // segundos
          "regravar": true,                                       // opcional: o texto mudou depois da gravação
          "em": "2026-11-05T18:00:00.000Z" }                      // quando o áudio chegou
      ] }
  ],
  "legenda": { "ativa": true, "cores": { "problems": "#19f0f0" } },  // chave = nome do personagem em minúsculas
  "usadoPor": [ { "programa": "animador", "projeto": "<id da animação>", "quando": "2026-11-05T18:10:00.000Z" } ],
  "criado": 1793900000000,
  "mod": 1793901008021                   // versão (o servidor põe a cada gravação)
}
```

Cor de um personagem numa legenda: `prep.legenda.cores[nome.toLowerCase()]` → senão `cores.json[nome.toLowerCase()]` → senão a cor
padrão do programa. Nome comparado sem diferenciar maiúscula e minúscula (`"Problems"` = `"PROBLEMS"`).

### Rotas

| pedido | o que faz | permissão |
|---|---|---|
| `GET /preparativos` | `{ itens: [{ id, nome, destino, status, mod, por, em, n, g, partes }] }` (n = falas, g = gravadas; `por` = código u…, nunca e-mail) | ver |
| `GET /preparativos/arquivo?k=<chave>` | o arquivo; o `prep.json` vem com `x-mod` | ver |
| `POST /preparativos/arquivo?k=…/prep.json&base=<mod>` | salva inteiro; `base` diferente da nuvem → 409 `conflito` (`&forcar=1` sobrescreve). `destino`/`status` só mudam com "pronto"; `usadoPor` só pela ação `usado` | roteiro (ou organizar) |
| `POST /preparativos/arquivo?k=…/aud/<falaId>-<t>.webm` | áudio de uma fala (até 8 MB) | gravar |
| `POST /preparativos/acao {acao:'falas', id, falas:[{id, audio, duracao}]}` | liga os áudios às falas numa gravação só; o áudio antigo da fala é apagado | gravar |
| `POST /preparativos/acao {acao:'marca', id, destino?, status?}` | destino e situação | pronto |
| `POST /preparativos/acao {acao:'legenda', id, ativa, cores}` | legendas do preparativo + junta as cores em `cores.json` | organizar |
| `POST /preparativos/acao {acao:'cores', cores}` | junta cores em `cores.json` | organizar |
| `POST /preparativos/acao {acao:'usado', id, programa, projeto}` | **o programa que usou avisa aqui** (Animador/Shorts/Editor) | ver |
| `DELETE /preparativos/arquivo?k=preparativos/<id>/` | apaga o preparativo inteiro | quem criou ou ADM |

Todas as respostas de `acao` trazem o `mod` novo. Para pegar os preparativos prontos para um programa:
`GET /preparativos` → filtrar `status === 'pronto' && destino === '<programa>'` → `GET …/prep.json` → baixar os `audio` das falas.

As Ideias usam a rota de sempre: `GET/PUT/POST /ideias` (`ideias/ideias.json`, `ideias/analise.json`, `ideias/canais.json`).

### Permissões (`permissoes.json` do site)

`preparativos.ver`, `preparativos.gravar`, `preparativos.roteiro`, `preparativos.organizar`, `preparativos.pronto`,
`preparativos.ideias`. No navegador: `window.EstudioPerm?.pode?.('preparativos.gravar') ?? true`. Quem só tem ver + gravar lê o
roteiro e grava as próprias falas.

## Publicar

Commit + `git pull --rebase` + push na `main` (o GitHub Pages publica a raiz). Antes: `node --check js/*.js` e `node js/roteiro.js`.
