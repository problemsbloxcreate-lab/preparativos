# PREPARATIVOS · Estúdio Problems

O que vem antes de animar ou editar: **roteiros** em partes nomeadas, **falas por personagem**, **gravação** de cada fala pelo
navegador, **destino** (Animador, Criar Shorts ou Editar vídeos) e **legendas** com cor por personagem. As **Ideias** (as mesmas
do Animador) também moram aqui.

Endereço: https://estudio.problemsraiz.workers.dev/preparativos/ (só pelo login do menu; esta cópia do GitHub Pages é a origem
que o porteiro serve e redireciona para o endereço único).

## Como escrever o roteiro (leia antes de escrever ou ler um roteiro — vale para gente e para o Claude)

O roteiro é TEXTO simples, escrito na folha estilo Google Docs da aba Roteiro. O que aparece na folha é exatamente o texto
guardado em `prep.json → roteiro`; as cores são só pintura em cima. Cada linha é uma destas:

```
## Episódio 1 parte 1                 ← PARTE: "## Nome" (ou uma linha só com "Parte 2", "Episódio 3…", "Cena 4…")
Problems: Oi, gente!                  ← FALA: "Nome: o que ele fala" — o nome antes dos dois-pontos (até 4 palavras)
Clara: *rindo* Oi, Problems!          ← *itálico* dentro da fala = como falar / o que ele faz → vira "nota" (fora da legenda e do áudio)
Clara (sussurrando): Vem cá.          ← "(nota)" logo depois do nome também é nota
e continua aqui.                      ← linha colada embaixo de uma fala (sem linha em branco) continua a MESMA fala
*Problems abre a porta devagar.*      ← linha inteira em itálico = AÇÃO / explicação da cena (não vira fala)
[a câmera se aproxima]                ← colchetes = cena (não vira fala)
// anotação para a equipe             ← comentário (não vira fala)
```

- Maiúscula e minúscula no nome tanto faz: "Problems", "PROBLEMS" e "problems" são o mesmo personagem (mesma cor).
- Linha solta que não é nada disso = narração (não vira fala). Para um narrador falar, escreva `Narrador: …`.
- Deixe uma linha em branco entre uma fala e um texto solto, senão o texto solto vira continuação da fala.
- Na folha: o NOME de cada personagem fica pintado na cor dele, o itálico fica cinza (os `*` aparecem clarinhos), as partes viram título
  e aparecem na lateral ("Partes" e "Personagens"). Selecionar um trecho (ou clique direito nele) abre o menu: **É o nome do personagem**
  (`Problems Oi` → `Problems: Oi`; nome sozinho numa linha + fala na de baixo → junta), **É ação / explicação da cena** (`*…*`),
  **É o título de uma parte** (`## …`), **Texto normal**. Ctrl+I = itálico. Colar do Google Docs: o itálico de lá vira `*…*` e os títulos viram `## `.
- O botão **Organizar** reescreve um texto solto neste formato. Ao editar o texto, a fala igual continua com o áudio; a fala que mudou
  no mesmo lugar fica com o áudio e a marca "regravar".
- Quem lê o roteiro por código usa `Roteiro.classifica(texto)` (o que é cada linha) e `Roteiro.separa(texto)` (partes → falas), em `js/roteiro.js`.

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

> **Temporário (05/11/2026):** o GitHub Pages deste repositório travou numa publicação e foi desligado; o mesmo endereço
> está sendo servido por uma cópia em `problemsbloxcreate-lab.github.io/preparativos/` (pasta `preparativos/` do repo do site).
> Até religar o Pages daqui, cada mudança precisa ser copiada para lá também (veja o LEIA-ME daquela pasta).
