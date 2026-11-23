/* ===================== simples.js — PREPARATIVOS SIMPLES: um Short em 3 passos (aprovado pela dona, 23/11/2026) =====================
   Proposta e prévia: Documents/Estúdio Problems/Preparativos simples/ (proposta.md e previa.html). Visual: sistema Celeste.
   O roteiro aberto deixa de ter 4 guias + Anterior/Próximo e vira 3 passos com UMA ação principal no rodapé:
     1 Roteiro  (S.sub = 'roteiro') caixa de texto simples + "Como o Preparativos entendeu" (falas, personagens, palavras em destaque,
                aviso de linha sem "NOME:"). O editor de antes (régua, menus, Organizar) continua em Mais opções › Ver como documento (S.doc).
     2 Vozes    (S.sub = 'falas')   um quadro "Solte aqui o áudio inteiro" que decide sozinho: 1 arquivo = js/inteiro.js (acha cada fala);
                um por personagem = js/inteiro.js com "de quem é cada áudio"; um por fala = cada arquivo vai para a sua fala (como o "subir"
                de cada fala). Depois: "Ouça estas N falas" (aviso, Ouvir, Está certo) e as boas recolhidas. Gravar com o microfone,
                Mandar link para dublar e Mais opções ficam como botões secundários.
     3 Animador (S.sub = 'fim')     resumo + "Montar no Animador": marca pronto (a mesma regra do Finalizar) e abre
                /animador/?montar=<id>&ritmo=1 numa aba nova (lá monta sem perguntar formato/partes e roda o Ritmo). Outro destino
                (Shorts, Editor) = "Marcar como pronto", como era.
   Ajustes (painel pela direita, regra de janelas do Celeste): Elenco, Legenda (o resto em "Mais ajustes de legenda"), Canal e data, Quem mexeu.
   NADA muda no prep.json (o "Está certo" só apaga f.aviso / f.regravar, que já existiam). O ritmo ligado/desligado fica só neste
   navegador (localStorage ep-prep-ritmo).
   Lógica pura no topo (sem DOM): node js/simples.js roda o teste. O resto usa o que o app.js deixa no escopo global
   (S, Falas, Nuvem, DB, Roteiro, Cortes, Mic, Dub, aviso, pergunta, ic, esc, h, $, $$, ava, giro, tempo, pode, coresDoRoteiro, salvaPrep,
   marcaSujo, mudaMarca, pintaPrep, irGuia, …). */
'use strict';
const Simples = {
  // ---------------------------------------------------------------- lógica pura ----------------------------------------------------------------
  _R() { return typeof Roteiro !== 'undefined' ? Roteiro : require('./roteiro.js'); },
  // palavra em MAIÚSCULAS com 3+ letras = palavra em destaque (a MESMA regra do Ritmo do Animador: js/ritmo.js › caps). *assim* no roteiro é nota (como falar).
  limpaPal: w => String(w || '').replace(/^[^0-9A-Za-zÀ-ÿ]+|[^0-9A-Za-zÀ-ÿ]+$/g, ''),
  caps(w) { const l = String(w).replace(/[^A-Za-zÀ-ÿ]/g, ''); return l.length >= 2 && /* 2+ letras: "MENOS EU" (23/11) */ l === l.toLocaleUpperCase('pt-BR') && l !== l.toLocaleLowerCase('pt-BR'); },
  /* "Como o Preparativos entendeu": o que o texto vira, com o MESMO leitor do programa (Roteiro.classifica/separa).
     → { falas, partes, pers: [{ nome, chave, n }], destaques: [palavra], notas (falas com *nota*), semNome: [{ linha, texto }] (linha solta: NÃO vira fala),
         juntas: [{ linha, texto }] (linha sem NOME: colada embaixo de uma fala: vira continuação da fala de cima, como manda o formato) } */
  entende(texto) {
    const R = this._R(), linhas = R.classifica(texto || ''), partes = R.separa(texto || ''), falas = partes.flatMap(p => p.falas);
    const semNome = [], juntas = []; linhas.forEach((o, i) => { const x = { linha: i + 1, texto: String(o.linha || '').trim().slice(0, 70) }; if (o.t === 'n') semNome.push(x); else if (o.t === 'f2') juntas.push(x); });
    const vistos = new Set(), destaques = [];
    for (const f of falas) for (const w of String(f.texto || '').split(/\s+/)) { const p = this.limpaPal(w); if (!this.caps(p)) continue; const k = p.toLocaleLowerCase('pt-BR'); if (!vistos.has(k)) { vistos.add(k); destaques.push(p); } }
    return { falas: falas.length, partes: partes.length, pers: R.personagens(partes).map(p => ({ nome: p.nome, chave: p.chave, n: p.n })), destaques, notas: falas.filter(f => f.nota).length, semNome, juntas };
  },
  /* QUADRO ÚNICO DE ÁUDIO: os arquivos soltos → qual jeito usar.
     arqs = [{ nome, tam (bytes), dur (s ou null) }], nPers = personagens do roteiro, deQuem(nome) = chave do personagem pelo nome do arquivo (ou null)
     'inteiro'    1 arquivo (com todas as falas, ou de um personagem): js/inteiro.js acha cada fala
     'personagem' um arquivo por personagem (cada nome de arquivo bate com um personagem diferente, ou são longos): js/inteiro.js com "de quem é"
     'fala'       vários arquivos curtos, um por fala (ou mais arquivos do que personagens): cada um vai para a sua fala */
  CURTO: 20, CURTO_BYTES: 400 * 1024,
  classificaSoltos(arqs, nPers, deQuem) {
    const L = arqs || []; if (!L.length) return { modo: null };
    if (L.length === 1) return { modo: 'inteiro' };
    const curto = a => a.dur != null && isFinite(a.dur) ? a.dur <= this.CURTO : (+a.tam || 0) <= this.CURTO_BYTES;
    if (L.length > Math.max(1, nPers || 0)) return { modo: 'fala', motivo: 'mais arquivos do que personagens' };
    const donos = L.map(a => deQuem ? deQuem(a.nome) : null);
    if (donos.every(Boolean) && new Set(donos).size === L.length) return { modo: 'personagem', motivo: 'cada arquivo tem o nome de um personagem' };
    if (L.every(curto)) return { modo: 'fala', motivo: 'arquivos curtos' };
    return { modo: 'personagem', motivo: 'arquivos longos' };
  },
  /* UM ARQUIVO POR FALA: qual fala cada arquivo recebe (índice 0.., ou -1). O número no nome manda ("fala 3.mp3", "03.wav");
     sem número, vai na ordem do nome (1, 2, 10 em ordem de número) nas falas que sobraram. */
  ordemPorFala(nomes, nFalas) {
    const N = nomes.length, ord = [...nomes.keys()].sort((a, b) => String(nomes[a]).localeCompare(String(nomes[b]), 'pt-BR', { numeric: true, sensitivity: 'base' }));
    const out = Array(N).fill(-1), usadas = new Set();
    for (const i of ord) { const m = String(nomes[i]).replace(/\.[a-z0-9]{2,5}$/i, '').match(/(\d+)(?!.*\d)/), k = m ? +m[1] - 1 : -1; if (k >= 0 && k < nFalas && !usadas.has(k)) { out[i] = k; usadas.add(k); } }
    let prox = 0; for (const i of ord) { if (out[i] >= 0) continue; while (prox < nFalas && usadas.has(prox)) prox++; if (prox < nFalas) { out[i] = prox; usadas.add(prox); } }
    return out;
  },

  // ---------------------------------------------------------------- a tela ----------------------------------------------------------------
  PASSOS: [['roteiro', 'Roteiro'], ['falas', 'Vozes'], ['fim', 'Animador']],
  NOME_DEST: { animador: 'Animador', shorts: 'Shorts', editor: 'Editor' },
  passoDe(sub) { return sub === 'falas' ? 'falas' : sub === 'fim' ? 'fim' : 'roteiro'; },
  ritmo() { try { return localStorage.getItem('ep-prep-ritmo') !== '0'; } catch { return true; } },
  // todas as falas (fala de vários conta pronta quando tem o áudio de todos juntos ou a versão de cada um)
  conta(P) { const fs = (P?.partes || []).flatMap(p => p.falas || []), tem = f => !!f.audio || (Falas.varios(f) && Roteiro.quem(f).every(k => f.audios?.[k]?.audio));
    return { falas: fs, total: fs.length, com: fs.filter(tem).length, sem: fs.filter(f => !tem(f)), avisos: fs.filter(f => f.audio && ((f.auto && f.fonte?.de === f.audio && f.aviso?.length) || f.regravar)), dur: fs.reduce((s, f) => s + (+f.duracao || 0), 0) }; },

  pinta() {
    const P = S.P; if (!P) return; modoDoc(false); // o botão da conta volta para o lugar dele antes de redesenhar (senão some junto)
    document.body.classList.add('modo-ps'); S.ed = null; S.sub = this.passoDe(S.sub);
    const el = tela(), dest = P.destino || 'animador';
    el.innerHTML = `<section class="prep ps">
      <header class="ps-cab">
        <button class="ps-marca" data-volta title="Voltar aos roteiros"><span class="ic-prog" data-estudio-icone="pr" aria-hidden="true"></span><span class="ps-marca-t"><b>PREPARATIVOS</b><small>Estúdio Problems</small></span></button>
        <nav class="seg ps-passos" aria-label="Short em 3 passos">${this.PASSOS.map(([k, n], i) => `<button data-passo="${k}"><span class="ps-n">${i + 1}</span><span class="ps-tx">${k === 'fim' ? esc(this.NOME_DEST[dest] || n) : n}</span></button>`).join('')}</nav>
        <div class="ps-dir"><button class="bt gh ps-aj" data-ajustes title="Ajustes: elenco, legenda, canal e data">${ic('ajustes', 18)}<span>Ajustes</span></button><span class="dh-conta ps-conta"></span></div>
      </header>
      <div class="ps-main">
        <div class="ps-titulo"><input class="nome" value="${esc(P.nome)}" ${pode('roteiro') ? '' : 'readonly'} aria-label="Nome do roteiro" maxlength="80"><span class="salvar"></span><span class="enviar"></span><span class="aovivo-doc"></span></div>
        <div class="corpo ps-corpo"></div>
      </div>
      <div class="ps-rodape"><div class="ps-rod-in"><button class="bt suave" data-ps-volta>${ic('voltar', 16)} Voltar</button><div class="ps-res"></div><button class="bt pri" data-ps-vai>Continuar</button></div></div>
    </section>`;
    const sp = document.querySelector('[data-estudio-conta]'); if (sp) { if (!contaOrig) contaOrig = { pai: sp.parentNode, prox: sp.nextSibling }; $('.ps-conta', el).appendChild(sp); } // sol/lua, nuvem, computador, grade e foto: o conjunto comum do Celeste
    window.EstudioIcones?.aplicar?.(); AoVivo.paraTudo();
    $('[data-volta]', el).onclick = () => sairDoPrep();
    $('[data-ajustes]', el).onclick = () => this.ajustes();
    $$('[data-passo]', el).forEach(b => b.onclick = () => { if (b.dataset.passo !== S.sub) irGuia(b.dataset.passo); });
    const nm = $('.nome', el); nm.oninput = () => { P.nome = nm.value.slice(0, 80); marcaSujo(); }; nm.onkeydown = e => { if (e.key === 'Enter') nm.blur(); };
    if (P.mod && !P.novo && AoVivo.atual !== P.id) { AoVivo.atual = P.id; AoVivo.ultimos = []; AoVivo.entra(P.id, l => this.vivo(l)); } else this.vivo();
    pintaBarraPrep(); this.corpo();
  },
  vivo(l) { const box = $('.prep .aovivo-doc'); if (!box) return; const g = (l || AoVivo.ultimos || []); AoVivo.ultimos = g; const outros = g.filter(x => !x.eu);
    box.innerHTML = g.length > 1 || outros.length ? g.slice(0, 5).map(x => pava(x, 'vivo' + (x.eu ? ' eu' : ''))).join('') + (g.length > 5 ? `<span class="mais">+${g.length - 5}</span>` : '') : ''; box.title = g.length ? 'Ao vivo agora: ' + g.map(x => x.n + (x.eu ? ' (você)' : '')).join(', ') : ''; },
  sai() { document.body.classList.remove('modo-ps'); },
  marcaPassos() {
    const P = S.P; if (!P) return; const c = this.conta(P), feito = { roteiro: c.total > 0 && S.sub !== 'roteiro', falas: c.total > 0 && c.com === c.total, fim: P.status === 'pronto' };
    $$('.ps-passos [data-passo]').forEach(b => { const k = b.dataset.passo, on = k === S.sub, f = feito[k] && !on; b.classList.toggle('on', on); b.classList.toggle('feito', f); if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      $('.ps-n', b).innerHTML = f ? ic('ok', 12) : String(this.PASSOS.findIndex(x => x[0] === k) + 1); });
  },
  corpo() {
    const c = $('.prep .ps-corpo'); if (!c) return; S.sub = this.passoDe(S.sub); S.ed = null; if (S.sub !== 'falas') Mic.paraTeste();
    c.className = 'corpo ps-corpo ps-' + S.sub; pintaLado = () => { if (S.sub === 'roteiro') this.entendi(); };
    this.marcaPassos();
    if (S.sub === 'falas') { Falas._resumo = null; this.rodape(); return Falas.pinta(c); }
    if (S.sub === 'fim') return this.passo3(c);
    return this.passo1(c);
  },

  // ---------------------------------------------------------------- passo 1: roteiro ----------------------------------------------------------------
  passo1(c) {
    const P = S.P, ed = pode('roteiro');
    c.innerHTML = `<h1 class="ps-h1">Cole o roteiro</h1>
      <p class="ps-sub">Uma fala por linha, assim: <b>NOME: texto</b>. Para destacar uma palavra, escreva em MAIÚSCULAS: <b>COLOU</b>. Entre asteriscos (<b>*rindo*</b>) é como falar e fica fora da legenda.</p>
      <div class="ps-dois">
        <div class="ps-cartao ps-ed"><div class="ps-topo"><h2>Roteiro</h2><button class="bt suave" data-mais1>${ic('tres', 16)} Mais opções</button></div>
          <textarea class="ps-texto" spellcheck="true" aria-label="Texto do roteiro" ${ed ? '' : 'readonly'} placeholder="Problems: Oi, gente!&#10;Clara: Oi, Problems!"></textarea>
          <p class="dica">Sem régua nem menus de documento: é só texto. Quem precisar, abre "Ver como documento" em Mais opções.</p></div>
        <aside class="ps-cartao ps-entendi" aria-live="polite"><h2>Como o Preparativos entendeu</h2><div class="ps-entendi-in"></div></aside>
      </div>`;
    const ta = $('.ps-texto', c); ta.value = P.roteiro || ''; let t = 0;
    ta.oninput = () => { P.roteiro = ta.value; marcaSujo(); clearTimeout(t); t = setTimeout(() => { if (S.P !== P) return; P.partes = Roteiro.separa(P.roteiro, P.partes); Varios.confere(); this.entendi(); this.rodape(); this.marcaPassos(); }, 250); };
    $('[data-mais1]', c).onclick = e => { const bm = e.currentTarget; popMenu(bm, [
      [`${ic('doc', 15)} Ver como documento (régua e formatação)`, '', () => { S.doc = true; S.sub = 'roteiro'; pintaPrep(); }],
      [`${ic('organizar', 15)} Organizar o roteiro`, '', () => Organizar.roda(bm, this.textoComoEditor(ta)), !pode('organizar')],
      [`${ic('enviar', 15)} Baixar como arquivo .txt`, '', baixaTexto],
      '-', [`${ic('ajuda', 15)} Ver como escrever o roteiro`, '', mostraComo],
      ...(pode('roteiro') && P.mod && !P.novo ? ['-', [`${ic('pc', 15)} Tirar da nuvem e manter neste computador…`, '', () => tiraDaNuvem(P.id)]] : [])]); };
    this.entendi(); this.rodape();
    if (ed && !P.roteiro) setTimeout(() => ta.focus(), 50);
  },
  // o "Organizar" mexe no texto como num editor: o texto novo entra como UMA edição (Ctrl+Z desfaz)
  textoComoEditor(ta) { return { get texto() { return ta.value; }, trocaTudo(tx) { ta.focus(); ta.select(); if (!document.execCommand?.('insertText', false, tx)) ta.value = tx; ta.dispatchEvent(new Event('input')); } }; },
  entendi() {
    const box = $('.prep .ps-entendi-in'); if (!box || !S.P) return; const E = this.entende(S.P.roteiro || ''), cs = coresDoRoteiro();
    box.innerHTML = `<div class="ps-cont"><div><b>${E.falas}</b><span>${E.falas === 1 ? 'fala' : 'falas'}</span></div><div><b>${E.pers.length}</b><span>${E.pers.length === 1 ? 'personagem' : 'personagens'}</span></div><div><b>${E.destaques.length}</b><span>palavras em destaque</span></div></div>
      ${E.partes > 1 ? `<p class="dica">${E.partes} partes</p>` : ''}
      <div class="ps-pers">${E.pers.map(p => `<div class="ps-p">${ava(p.nome, cs.get(p.chave) || corOuPadrao(p.nome), 'p')}<b>${esc(p.nome)}</b><span>${p.n} ${p.n === 1 ? 'fala' : 'falas'}</span></div>`).join('') || '<p class="dica">Ainda não achei nenhuma fala.</p>'}</div>
      ${E.destaques.length ? `<div class="ps-kws">${E.destaques.slice(0, 40).map(k => `<span class="ps-kw">${esc(k)}</span>`).join('')}</div>` : ''}
      ${E.notas ? `<p class="dica">${E.notas} ${E.notas === 1 ? 'fala tem' : 'falas têm'} nota de como falar (fica fora da legenda).</p>` : ''}
      ${E.semNome.length ? `<div class="ps-nota" role="note">${ic('alerta', 16)}<span><b>Aviso:</b> ${E.semNome.length === 1 ? 'a linha' : 'as linhas'} ${E.semNome.slice(0, 8).map(x => x.linha).join(', ')}${E.semNome.length > 8 ? '…' : ''} ${E.semNome.length === 1 ? 'não tem' : 'não têm'} NOME: antes do texto, então não ${E.semNome.length === 1 ? 'entra' : 'entram'} como fala.
        ${E.semNome.slice(0, 3).map(x => `<small>${x.linha}: ${esc(x.texto)}</small>`).join('')}</span></div>` : ''}
      ${E.juntas.length ? `<p class="dica ps-juntas">${E.juntas.length === 1 ? 'A linha' : 'As linhas'} ${E.juntas.slice(0, 8).map(x => x.linha).join(', ')}${E.juntas.length > 8 ? '…' : ''} ${E.juntas.length === 1 ? 'não tem' : 'não têm'} NOME: e ${E.juntas.length === 1 ? 'continua' : 'continuam'} a fala de cima. Se for outra fala, ponha o nome; se for texto solto, deixe uma linha em branco antes.</p>` : ''}`;
  },

  // ---------------------------------------------------------------- passo 2: vozes (o corpo é o Falas.pinta do app.js) ----------------------------------------------------------------
  ligaVozes(c) {
    if (!c?.isConnected || S.sub !== 'falas') return; const P = S.P;
    $$('[data-solta]', c).forEach(z => { ['dragenter', 'dragover'].forEach(t => z.addEventListener(t, e => { if (![...(e.dataTransfer?.types || [])].includes('Files')) return; e.preventDefault(); z.classList.add('sobre'); }));
      z.addEventListener('dragleave', e => { if (!z.contains(e.relatedTarget)) z.classList.remove('sobre'); });
      z.addEventListener('drop', e => { if (!e.dataTransfer?.files?.length) return; e.preventDefault(); z.classList.remove('sobre'); this.solta([...e.dataTransfer.files]); }); });
    $$('[data-escolhe]', c).forEach(b => b.onclick = () => { const inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true;
      inp.accept = 'audio/*,video/*,.mp3,.wav,.ogg,.oga,.opus,.m4a,.webm,.mpeg,.mpg,.mp2,.mpga,.flac,.aac,.wma,.amr,.3gp,.mov,.mp4,.mkv,.avi'; inp.onchange = () => { if (inp.files.length) this.solta([...inp.files]); }; inp.click(); });
    $$('[data-dub]', c).forEach(b => b.onclick = () => this.painelDub());
    $$('[data-certo]', c).forEach(b => b.onclick = () => this.certo(b));
    $$('[data-mais-v]', c).forEach(b => b.onclick = () => popMenu(b, [
      ...(!$('[data-seq]', c) && pode('gravar') ? [[`${ic('mic', 15)} Gravar com o microfone`, '', () => Falas.emSequencia()]] : []),
      ...(!$('[data-dub]:not([hidden])', c) && (pode('gravar') || pode('links')) ? [[`${ic('enviar', 15)} Mandar link para dublar`, '', () => this.painelDub()]] : []),
      [`${ic('mic', 15)} Escolher e testar o microfone`, '', () => this.painelMic()],
      ...(Falas._lote?.length ? [[`${ic('ok', 15)} Ver o último envio`, '', () => Falas.mostraLote()]] : []),
      '-', [`${ic('baixo', 15)} Separar à mão um áudio com várias falas`, '', () => Falas.variasFalas(), !pode('gravar')],
      [`${ic('upload', 15)} Pôr o áudio inteiro escolhendo de quem é`, '', () => carregaJs('js/inteiro.js', 'Inteiro').then(I => I.abre()).catch(e => aviso(e.message, 'erro')), !pode('gravar')]]));
    // gravações de link de dublagem esperando aprovação (uma consulta por minuto, no máximo)
    if (P.mod && !P.novo && (pode('gravar') || pode('links'))) {
      const poe = n => { if (!c.isConnected) return; $$('[data-dub]', c).forEach(b => { const bd = $('.ps-badge', b); if (b.classList.contains('ps-pend-bt')) { b.hidden = !n; if (bd) bd.textContent = `${n} ${n === 1 ? 'gravação' : 'gravações'} para aprovar`; } else if (bd) { bd.hidden = !n; bd.textContent = n ? ` · ${n} para aprovar` : ''; } }); };
      const d = this._dub; if (d && d.id === P.id && Date.now() - d.em < 60e3) poe(d.n);
      else Nuvem.acao({ acao: 'dublar', op: 'lista', id: P.id }).then(r => { this._dub = { id: P.id, em: Date.now(), n: (r.pend || []).length }; poe(this._dub.n); }).catch(() => { });
    }
    this.rodape();
  },
  // "Está certo": tira o aviso da fala (f.aviso do corte automático e f.regravar do texto mudado) e guarda no roteiro
  async certo(b) {
    const el = b.closest('.fala'), f = el && Falas.acha(el.dataset.f), P = S.P; if (!f) return; const n = el.querySelector('.num')?.textContent || '';
    delete f.aviso; delete f.regravar; marcaSujo();
    if (P.mod && !P.novo && (pode('roteiro') || pode('organizar'))) await salvaPrep(null, true);
    aviso(`Fala ${n} marcada como certa.`, 'ok', 2500); if (S.sub === 'falas') Falas.pinta(Falas.c);
  },
  // duração de um arquivo pelo próprio navegador (sem abrir o áudio inteiro); null se não deu
  durDe(arq) { return new Promise(ok => { let u = ''; try { u = URL.createObjectURL(arq); } catch { return ok(null); } const a = new Audio(); let fim = false;
    const sai = v => { if (fim) return; fim = true; URL.revokeObjectURL(u); ok(v); }; a.preload = 'metadata'; a.onloadedmetadata = () => sai(isFinite(a.duration) ? a.duration : null); a.onerror = () => sai(null); setTimeout(() => sai(null), 4000); a.src = u; }); },
  // O QUADRO ÚNICO: decide o jeito pelo número e pelo tamanho dos arquivos
  async solta(lista) {
    const P = S.P; if (!P) return; if (!pode('gravar')) return aviso('Sua conta pode ouvir, mas não pôr áudio.', 'erro');
    const arqs = lista.filter(a => a.size <= 200 * 1048576); if (arqs.length < lista.length) aviso('Arquivo com mais de 200 MB ficou de fora.', 'erro'); if (!arqs.length) return;
    const ps = Roteiro.personagens(P.partes); if (!ps.length) return aviso('Ainda não há falas no roteiro.', 'info');
    const durs = await Promise.all(arqs.map(a => this.durDe(a)));
    const r = this.classificaSoltos(arqs.map((a, i) => ({ nome: a.name, tam: a.size, dur: durs[i] })), ps.length, nome => Falas.pelaNomeArq(nome, ps)?.chave || null);
    if (r.modo === 'fala') return this.porFala(arqs);
    if (P.novo || !P.mod) return aviso('Mande o roteiro para a nuvem primeiro (botão "Mandar para a nuvem" lá em cima). O áudio inteiro sobe uma vez só, junto do roteiro.', 'info', 7000);
    let I; try { I = await carregaJs('js/inteiro.js', 'Inteiro'); } catch (e) { return aviso(e.message, 'erro'); }
    if (r.modo === 'inteiro') { const W = I.painel('Achando as falas'); return I.analisa(W, [{ arq: arqs[0], quem: Falas.pelaNomeArq(arqs[0].name, ps)?.chave || '' }]); } // 1 arquivo: já começa (pelo nome do arquivo, de um personagem; senão, de todos)
    I.deQuem(arqs); // um por personagem: confere de quem é cada um (já vem sugerido pelo nome do arquivo)
  },
  // UM ARQUIVO POR FALA: cada arquivo vai para a sua fala, neste computador (igual ao "subir um arquivo" de cada fala); depois "Enviar agora"
  porFala(arqs) {
    const P = S.P, todas = P.partes.flatMap(p => p.falas), ord = this.ordemPorFala(arqs.map(a => a.name), todas.length), cs = coresDoRoteiro();
    const W = this.painel('Um áudio por fala');
    W.corpo.innerHTML = `<p class="ps-p-txt">Cada arquivo vai para uma fala. Confira a fala de cada um (o número no nome do arquivo manda; sem número, vai na ordem).</p>
      ${arqs.map((a, i) => `<div class="ps-arq"><b>${esc(a.name)}</b><label>Fala<select data-q="${i}"><option value="-1">Não usar este arquivo</option>${todas.map((f, k) => `<option value="${k}" ${ord[i] === k ? 'selected' : ''}>${k + 1}. ${esc(f.personagem)}: ${esc(String(f.texto).slice(0, 50))}${f.audio ? ' (já tem áudio)' : ''}</option>`).join('')}</select></label></div>`).join('')}`;
    W.rod.innerHTML = `<button class="bt" data-c>Cancelar</button><button class="bt pri" data-ok>${ic('ok', 15)} Pôr nas falas</button>`;
    $('[data-c]', W.rod).onclick = W.fecha;
    $('[data-ok]', W.rod).onclick = async () => {
      const usar = arqs.map((a, i) => ({ a, k: +$(`[data-q="${i}"]`, W.corpo).value })).filter(x => x.k >= 0), ks = usar.map(x => x.k);
      if (!usar.length) return aviso('Nenhum arquivo escolhido.', 'info'); if (new Set(ks).size < ks.length) return aviso('Dois arquivos estão na mesma fala.', 'erro');
      W.rod.innerHTML = ''; let feitas = 0; const erros = [];
      for (const [n, x] of usar.entries()) { W.corpo.innerHTML = `<div class="ps-passo">${giro()}<span>Pondo ${n + 1} de ${usar.length}: ${esc(x.a.name)}</span></div>`;
        try { const A = await Cortes.decodifica(x.a), dur = A.d.length / A.sr; if (dur > PREP_CONFIG.audioMaxSeg + 1) throw new Error(`tem ${tempo(dur)} (cada fala pode ter até ${tempo(PREP_CONFIG.audioMaxSeg)})`);
          const blob = await Cortes.comprime(A), f = todas[x.k]; await DB.put('aud', P.id + '/' + f.id, { blob, duracao: Math.round(dur * 100) / 100, em: Date.now(), arquivo: String(x.a.name || '').slice(0, 80) }); feitas++; }
        catch (e) { erros.push(`${x.a.name}: ${e.message || e}`); } }
      W.fecha(); if (erros.length) aviso('Não deu: ' + erros.join(' · '), 'erro', 9000);
      if (feitas) aviso(`${feitas} ${feitas === 1 ? 'fala ganhou' : 'falas ganharam'} áudio neste computador. Ouça e clique em "Enviar agora".`, 'ok', 6000);
      if (S.sub === 'falas') Falas.pinta(Falas.c); };
  },
  painelDub() {
    const P = S.P, W = this.painel('Mandar link para dublar');
    W.corpo.innerHTML = `<p class="ps-p-txt">Crie um link e mande para quem vai dublar. A pessoa não precisa de conta. O áudio dela volta para as falas certas depois que você aprovar aqui.</p><div class="dub-painel ps-dub"></div>`;
    if (P.novo || !P.mod) $('.ps-dub', W.corpo).innerHTML = '<p class="dica">Mande o roteiro para a nuvem primeiro (botão "Mandar para a nuvem" lá em cima).</p>'; else Dub.pinta($('.ps-dub', W.corpo));
    W.rod.innerHTML = `<button class="bt pri" data-ok>Pronto</button>`; $('[data-ok]', W.rod).onclick = W.fecha;
    W.aoFechar(() => { this._dub = null; if (S.sub === 'falas' && S.P === P) Falas.pinta(Falas.c); });
  },
  painelMic() { const W = this.painel('Microfone'), box = h('<div class="mic-painel"></div>'); W.corpo.append(box); Mic.pinta(box);
    W.rod.innerHTML = `<button class="bt pri" data-ok>Pronto</button>`; $('[data-ok]', W.rod).onclick = W.fecha; W.aoFechar(() => Mic.paraTeste(box)); },

  // ---------------------------------------------------------------- passo 3: animador (ou o destino) ----------------------------------------------------------------
  async passo3(c) {
    const P = S.P, d = P.destino, C = this.conta(P), cs = coresDoRoteiro(), ps = Roteiro.personagens(P.partes), nd = this.NOME_DEST[d] || 'programa';
    const L = P.legenda || {}, E = estiloDe(P), Q = { w: 1080, h: 1920, ...(L.quadro || {}) }, rit = this.ritmo(), an = d === 'animador';
    if (S.montado === P.id) { this.rodape(); return this.finalMontado(c); }
    const mudou = JSON.stringify(E) !== JSON.stringify(LEG_PADRAO);
    const elencoDe = k => { const v = (P.animador?.pers || {})[k], pad = S.pers?.[k]?.atelie; return v === null ? 'Nenhum' : v?.id ? esc(v.nome || v.id) : pad === null ? 'Nenhum (padrão)' : pad?.id ? esc(pad.nome || pad.id) : 'Automático'; };
    const f1 = C.falas.find(f => f.texto), corF = f1 ? (f1.cor || (Falas.varios(f1) ? '#ffffff' : cs.get(Roteiro.chave(f1.personagem)) || corOuPadrao(f1.personagem))) : '#19f0f0';
    const vozes = !C.total ? '' : C.sem.length ? `<div class="ps-lin alerta"><span class="ps-rot">Vozes</span><div class="ps-val">${ic('alerta', 16)} <b>Faltam ${C.sem.length} ${C.sem.length === 1 ? 'fala' : 'falas'}</b><small>Sem áudio, a fala entra só com a legenda, no tempo de leitura. "Pronto para o ${esc(nd)}" só com todas as falas gravadas.</small></div><button class="bt gh" data-vai="falas">Pôr as vozes</button></div>`
      : C.avisos.length ? `<div class="ps-lin alerta"><span class="ps-rot">Vozes</span><div class="ps-val">${ic('alerta', 16)} <b>${C.avisos.length} ${C.avisos.length === 1 ? 'fala com aviso ainda não ouvida' : 'falas com aviso ainda não ouvidas'}</b><small>Dá para montar assim e corrigir depois.</small></div><button class="bt gh" data-vai="falas">Ouvir agora</button></div>`
      : `<div class="ps-lin"><span class="ps-rot">Vozes</span><div class="ps-val"><b>${C.total} de ${C.total} com áudio</b><small>Nenhum aviso pendente</small></div><span class="ps-okic">${ic('ok', 20)}</span></div>`;
    c.innerHTML = `<h1 class="ps-h1">${an ? 'Mande para o Animador' : d ? `Mande para o ${esc(nd)}` : 'Para onde vai este roteiro?'}</h1>
      <p class="ps-sub">${an ? 'Confira o resumo. Um botão só monta as cenas, põe os personagens e já põe o ritmo.' : d ? `Confira o resumo e marque como pronto: ele passa a aparecer no ${esc(nd)}.` : 'Escolha o programa em Ajustes › Canal e data.'}</p>
      <div class="ps-dois"><div class="ps-cartao ps-resumo">
        <div class="ps-lin"><span class="ps-rot">Falas</span><div class="ps-val"><b>${C.total} ${C.total === 1 ? 'fala' : 'falas'}</b><small>${C.dur ? `cerca de ${tempo(C.dur)} de áudio` : 'ainda sem áudio'}${P.partes.length > 1 ? ` · ${P.partes.length} partes, todas numa animação` : ''}</small></div></div>
        ${vozes}
        <div class="ps-lin ps-lin-pers"><span class="ps-rot">Personagens</span><div class="ps-val">${ps.map(p => `<div class="ps-p">${ava(p.nome, cs.get(p.chave), 'p')}<span><b>${esc(p.nome)}</b> <small>${p.n} ${p.n === 1 ? 'fala' : 'falas'}${an ? ' · ' + elencoDe(p.chave) : ''}</small></span></div>`).join('') || '<small>Nenhum ainda</small>'}</div>${an ? '<button class="bt gh" data-aj="elenco">Trocar</button>' : ''}</div>
        <div class="ps-lin"><span class="ps-rot">Legenda</span><div class="ps-val"><b>${L.ativa === false ? 'Legendas desligadas' : mudou ? 'Do seu jeito' : 'Padrão do canal'}</b><small>${L.ativa === false ? 'O vídeo sai sem legenda' : `${esc(E.fonte)}, ${E.alinhar === 'left' ? 'à esquerda' : E.alinhar === 'right' ? 'à direita' : 'centro'}, ${L.mostrarNome ? 'com o nome de quem fala' : 'cor de quem fala'}${E.maiusculas ? ', maiúsculas' : ''}`}</small></div><button class="bt gh" data-aj="legenda">Mudar</button></div>
        <div class="ps-lin"><span class="ps-rot">Formato</span><div class="ps-val"><b>${Q.h > Q.w ? 'Short' : Q.h === Q.w ? 'Quadrado' : 'Vídeo'}, ${Q.w} × ${Q.h}</b><small>${d ? `Vai para o ${esc(nd)}` : 'Sem destino'}${P.canal ? ` · canal ${esc(P.canal.nome)}` : ' · sem canal'}</small></div><button class="bt gh" data-aj="publicar">Mudar</button></div>
        ${an ? `<div class="ps-lin"><span class="ps-rot">Ritmo</span><div class="ps-val"><b>Pôr o ritmo automático</b><small>${rit ? 'Cortes de câmera, letreiros nas palavras em destaque e fechamento no fim.' : 'Desligado: o Short entra sem cortes de câmera nem letreiros.'}</small></div><button class="ps-chave" role="switch" aria-checked="${rit}" aria-label="Pôr o ritmo automático" data-ritmo></button></div>` : ''}
        ${P.status === 'pronto' ? `<div class="ps-lin"><span class="ps-rot">Situação</span><div class="ps-val"><b>Pronto para o ${esc(nd)}</b><small>Já aparece lá.</small></div>${pode('pronto') ? '<button class="bt gh" data-volta-gravar>Voltar a gravar</button>' : ''}</div>` : ''}
      </div>
      <div class="ps-amostra"><div class="ps-cel" style="aspect-ratio:${Q.w} / ${Q.h}"><div class="ps-boneco"></div>${L.ativa === false ? '' : `<div class="ps-leg" style="top:${E.y * 100}%;width:${E.largura * 100}%;text-align:${E.alinhar};font-family:'${esc(E.fonte)}',sans-serif;font-weight:${E.peso};color:${corF};text-transform:${E.maiusculas ? 'uppercase' : 'none'}">${L.mostrarNome && f1 ? `<span class="ps-quem">${esc(f1.personagem)}</span>` : ''}${esc(f1 ? f1.texto.split(/(?<=[.!?])\s/)[0] : 'Exemplo de legenda')}</div>`}</div><p class="ps-amostra-t">Amostra da legenda</p></div></div>`;
    $$('[data-vai]', c).forEach(b => b.onclick = () => irGuia(b.dataset.vai));
    $$('[data-aj]', c).forEach(b => b.onclick = () => this.ajustes(b.dataset.aj));
    const ch = $('[data-ritmo]', c); if (ch) ch.onclick = () => { try { localStorage.setItem('ep-prep-ritmo', this.ritmo() ? '0' : '1'); } catch { } this.passo3(c); };
    const vg = $('[data-volta-gravar]', c); if (vg) vg.onclick = async () => { if (await pergunta('Voltar a gravar?', 'O roteiro deixa de aparecer como pronto no programa de destino até você marcar de novo.', [['Cancelar', false], ['Voltar a gravar', true, 'pri']])) await mudaMarca('status', 'gravando'); };
    this.rodape();
  },
  finalMontado(c) {
    const P = S.P, url = this.linkAnimador(P);
    c.innerHTML = `<div class="ps-cartao ps-final"><span class="ps-final-ic">${ic('ok', 30)}</span><h2>O Short foi para o Animador</h2>
      <ul class="ps-feitos">${(this._feitos || []).map(t => `<li>${ic('ok', 16)} ${esc(t)}</li>`).join('')}</ul>
      <p>${this._abriu ? 'Ele está sendo montado na aba nova do Animador: as cenas, os personagens com a boca pela voz' + (this.ritmo() ? ' e o ritmo' : '') + '. Falta só conferir a animação e exportar.' : 'Clique em Abrir no Animador: ele monta as cenas, os personagens com a boca pela voz' + (this.ritmo() ? ' e o ritmo' : '') + ' sozinho.'}</p>
      <div class="ps-final-bts"><a class="bt pri" href="${esc(url)}" target="_blank" rel="noopener" data-abre-an>${ic('filme', 16)} Abrir no Animador</a><button class="bt" data-outro>Começar outro Short</button></div></div>`;
    $('[data-abre-an]', c).onclick = () => { this._abriu = true; };
    $('[data-outro]', c).onclick = async () => { const d = P.destino, cn = P.canal; if (!await sairDoPrep()) return; S.montado = null; const N = novoPrep('Novo Short'); N.destino = d || 'animador'; N.canal = cn || PREP_CONFIG.canais.find(x => x.id === PREP_CONFIG.canalPadrao[N.destino]) || null; S.sub = 'roteiro'; await abrePrep(N); };
  },
  linkAnimador(P) { return '/animador/?montar=' + encodeURIComponent(P.id) + '&ritmo=' + (this.ritmo() ? 1 : 0); },
  /* MONTAR NO ANIMADOR = o Finalizar de antes (mesma regra) + abrir o Animador já montando. O Animador lê o link (?montar=<id>&ritmo=1),
     baixa o prep.json, monta tudo numa animação só com o formato daqui, põe os personagens do elenco e roda o Ritmo. */
  async montar(bt) {
    const P = S.P; if (!P || this._montando) return; if (!pode('pronto')) return aviso('Sua conta não pode marcar o roteiro como pronto.', 'erro');
    const locais = await Falas.locais(), nLoc = [...locais.keys()].filter(id => Falas.acha(id)).length, C = this.conta(P);
    const faltaDepois = C.sem.filter(f => !locais.has(f.id)).length;
    // precisa perguntar algo aqui (falta fala, roteiro ainda não está na nuvem)? então a aba nova só abre no fim, pelo botão "Abrir no Animador"
    const pergunta1 = P.status !== 'pronto' && (faltaDepois > 0 || P.novo || !P.mod), w = pergunta1 ? null : window.open('', '_blank');
    if (w) try { w.document.write('<!doctype html><meta charset="utf-8"><title>Abrindo o Animador…</title><body style="margin:0;height:100vh;display:grid;place-items:center;background:#000;color:#e8e9ec;font:14px system-ui,sans-serif">Mandando o roteiro para o Animador…</body>'); w.document.close(); } catch { }
    this._montando = true; const rot = bt?.innerHTML; if (bt) { bt.disabled = true; bt.innerHTML = giro('Mandando'); } const feitos = [];
    try {
      if (S.sujo && P.mod && !P.novo) { await salvaPrep(null, true); if (S.sujo) throw new Error('O roteiro não foi para a nuvem.'); }
      if (nLoc) { if (P.novo || !P.mod) await salvaPrep(null, true); if (P.mod && !P.novo) { await Falas.envia(document.createElement('button'), locais); feitos.push(`${nLoc} ${nLoc === 1 ? 'gravação enviada' : 'gravações enviadas'} para a nuvem`); } }
      if (P.status !== 'pronto') { await mudaMarca('status', 'pronto'); if (S.P !== P || P.status !== 'pronto') throw null; }
      if (S.sujo) await salvaPrep(null, true);
      feitos.push(`Roteiro marcado como pronto para o Animador (${this.conta(P).com} de ${this.conta(P).total} falas com áudio)`);
      feitos.push(this.ritmo() ? 'O Animador monta as cenas, os personagens e o ritmo' : 'O Animador monta as cenas e os personagens (sem ritmo)');
      this._feitos = feitos; this._abriu = !!w; S.montado = P.id;
      if (w) w.location.href = this.linkAnimador(P);
    } catch (e) { try { w?.close(); } catch { } if (e) aviso(e.message || String(e), 'erro'); }
    finally { this._montando = false; if (bt?.isConnected) { bt.disabled = false; bt.innerHTML = rot; } }
    if (S.P === P && S.sub === 'fim') this.corpo();
  },

  // ---------------------------------------------------------------- rodapé: a ação principal de cada passo ----------------------------------------------------------------
  rodape() {
    const box = $('.prep .ps-rodape'), P = S.P; if (!box || !P) return; const vol = $('[data-ps-volta]', box), vai = $('[data-ps-vai]', box), res = $('.ps-res', box), C = this.conta(P), np = Roteiro.personagens(P.partes).length;
    box.hidden = S.sub === 'fim' && S.montado === P.id; vol.hidden = S.sub === 'roteiro'; vai.disabled = false; vai.className = 'bt pri'; vai.title = '';
    vol.onclick = () => irGuia(S.sub === 'fim' ? 'falas' : 'roteiro');
    if (S.sub === 'roteiro') { vai.innerHTML = 'Continuar para as vozes'; vai.disabled = !C.total; vai.onclick = () => irGuia('falas');
      res.innerHTML = C.total ? `<b>${C.total} ${C.total === 1 ? 'fala' : 'falas'}</b> · ${np} ${np === 1 ? 'personagem' : 'personagens'}` : 'Escreva ou cole o roteiro para continuar.'; }
    else if (S.sub === 'falas') { const r = Falas._resumo || { total: C.total, feitas: C.com, aviso: C.avisos.length, locais: 0 }, tem = r.feitas > 0 || r.locais > 0;
      vai.innerHTML = 'Continuar'; vai.disabled = !tem; vai.onclick = () => irGuia('fim'); if (!tem) vai.className = 'bt';
      res.innerHTML = tem ? `<b>${r.feitas} de ${r.total} falas com áudio</b>${r.aviso ? ` · ${r.aviso} ${r.aviso === 1 ? 'aviso para ouvir' : 'avisos para ouvir'}` : r.feitas === r.total ? ' · tudo conferido' : ''}${r.locais ? ` · ${r.locais} só neste computador` : ''}` : 'Solte o áudio para continuar.'; }
    else { const d = P.destino, nd = this.NOME_DEST[d];
      res.innerHTML = `<b>${C.total} ${C.total === 1 ? 'fala' : 'falas'}</b> · ${np} ${np === 1 ? 'personagem' : 'personagens'}${d === 'animador' && this.ritmo() ? ' · com ritmo automático' : ''}${C.sem.length ? ` · faltam ${C.sem.length}` : ''}`;
      if (d === 'animador') { vai.innerHTML = `${ic('filme', 16)} Montar no Animador`; vai.disabled = !C.total || !pode('pronto'); vai.onclick = () => this.montar(vai); }
      else if (!d) { vai.innerHTML = 'Escolher para onde vai'; vai.onclick = () => this.ajustes('publicar'); }
      else if (P.status === 'pronto') { vai.innerHTML = `${ic('ok', 16)} Pronto para o ${nd}`; vai.className = 'bt'; vai.disabled = true; }
      else { vai.innerHTML = `${ic('ok', 16)} Marcar como pronto para o ${nd}`; vai.disabled = !pode('pronto'); vai.onclick = () => mudaMarca('status', 'pronto'); } }
    if (!pode('pronto') && S.sub === 'fim') vai.title = 'Sua conta não pode marcar o roteiro como pronto.';
  },

  // ---------------------------------------------------------------- painéis pela direita (regra de janelas do Celeste) ----------------------------------------------------------------
  _pns: [],
  painel(titulo, largo) {
    const veu = h('<div class="ps-veu"></div>'), pn = h(`<aside class="ps-pn${largo ? ' largo' : ''}" role="dialog" aria-modal="true" aria-label="${esc(titulo)}"><div class="ps-pn-topo"><b>${esc(titulo)}</b><button class="ps-x" title="Fechar" aria-label="Fechar">${ic('x', 18)}</button></div><div class="ps-pn-corpo"></div><div class="ps-pn-rod"></div></aside>`);
    let aoFechar = null; const tecla = e => { if (e.key === 'Escape' && !document.querySelector('.modal') && this._pns.at(-1) === W) { e.stopPropagation(); fecha(); } };
    const fecha = () => { if (!pn.isConnected) return; veu.remove(); pn.remove(); removeEventListener('keydown', tecla, true); this._pns = this._pns.filter(x => x !== W); aoFechar?.(); };
    veu.onclick = fecha; $('.ps-x', pn).onclick = fecha; addEventListener('keydown', tecla, true); document.body.append(veu, pn);
    const W = { pn, corpo: $('.ps-pn-corpo', pn), rod: $('.ps-pn-rod', pn), fecha, aoFechar: f => { aoFechar = f; } }; this._pns.push(W); setTimeout(() => $('.ps-x', pn).focus(), 30); return W;
  },
  fechaPaineis() { for (const W of [...this._pns]) W.fecha(); },
  /* AJUSTES: Elenco (destino Animador), Legenda, Canal e data, Quem mexeu. sec = 'elenco' | 'legenda' | 'publicar' abre só essa parte */
  ajustes(sec) {
    if (!S.P) return; const ja = this._aj && this._aj.pn.isConnected ? this._aj : null; const W = ja || (this._aj = this.painel('Ajustes'));
    if (!ja) { W.rod.innerHTML = `<button class="bt pri" data-ok>Pronto</button>`; $('[data-ok]', W.rod).onclick = W.fecha; W.aoFechar(() => { this._aj = null; if (S.P && !S.doc) { if (S.sub === 'fim') this.corpo(); else this.marcaPassos(); } }); }
    this.pintaAjustes(sec);
  },
  pintaAjustes(sec) {
    const W = this._aj, P = S.P; if (!W || !P) return; const abertos = new Set($$('details[data-aj]', W.corpo).filter(d => d.open).map(d => d.dataset.aj)); if (sec) { abertos.clear(); abertos.add(sec); }
    const an = P.destino === 'animador', org = pode('organizar'), pp = pode('pronto'), L = P.legenda || {}, E = estiloDe(P);
    const sec1 = (k, t, corpo) => `<details data-aj="${k}" ${abertos.has(k) ? 'open' : ''}><summary><span class="ps-aj-t"><b>${t}</b><small data-aj-r="${k}"></small></span>${ic('seta', 16)}</summary><div class="ps-aj-c">${corpo}</div></details>`;
    W.corpo.innerHTML = (an ? sec1('elenco', 'Elenco', '<div class="ps-elenco"></div>') : '')
      + sec1('legenda', 'Legenda', `<label class="ps-linha-ch"><span>Legendas ligadas neste roteiro</span><button class="ps-chave" role="switch" aria-checked="${L.ativa !== false}" data-leg="ativa" ${org ? '' : 'disabled'}></button></label>
        <label class="ps-linha-ch"><span>Mostrar o nome de quem fala</span><button class="ps-chave" role="switch" aria-checked="${!!L.mostrarNome}" data-leg="mostrarNome" ${org ? '' : 'disabled'}></button></label>
        <label class="ps-linha-ch"><span>Tudo em maiúsculas</span><button class="ps-chave" role="switch" aria-checked="${!!E.maiusculas}" data-leg="maiusculas" ${org ? '' : 'disabled'}></button></label>
        <label class="ps-campo">Letra<select data-leg-fonte ${org ? '' : 'disabled'}>${FONTES.map(f => `<option ${f === E.fonte ? 'selected' : ''}>${esc(f)}</option>`).join('')}${FONTES.includes(E.fonte) ? '' : `<option selected>${esc(E.fonte)}</option>`}</select></label>
        <button class="bt" data-leg-padrao ${org ? '' : 'disabled'}>Voltar ao padrão</button>
        <p class="dica">Tamanho do vídeo, sombra, contorno, fundo, tamanho da letra, posição e a cor de cada personagem ficam em Mais ajustes de legenda.</p>
        <button class="bt suave" data-leg-mais>${ic('legenda', 15)} Mais ajustes de legenda</button>`)
      + sec1('publicar', 'Canal e data', `<div class="ps-campo">Vai para<div class="seg ps-dest" role="group" aria-label="Vai para">${PREP_CONFIG.destinos.map(([k]) => `<button data-dest="${k}" class="${P.destino === k ? 'on' : ''}" ${pp ? '' : 'disabled'}>${esc(this.NOME_DEST[k] || k)}</button>`).join('')}</div></div>
        <label class="ps-campo">Canal do YouTube<select data-canal ${pp ? '' : 'disabled'}><option value="">Escolher depois</option>${PREP_CONFIG.canais.map(c => `<option value="${esc(c.id)}" ${P.canal?.id === c.id ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}</select></label>
        <div class="ps-campo">Dia no calendário do Publicações<button class="bt ps-data" data-data-cal>${ic('cal', 15)}<span>—</span></button></div>`)
      + sec1('quem', 'Quem mexeu', `${P.autor ? `<div class="ps-hist">${pava(P.autor)}<div><b>${esc(P.autor.nome)}</b><small>criou · ${esc(quando(P.autor.em))}</small></div></div>` : '<p class="dica">Ainda não foi para a nuvem.</p>'}${(P.edicoes || []).slice().reverse().map(x => `<div class="ps-hist">${pava(x)}<div><b>${esc(x.nome)}</b><small>editou · ${esc(quando(x.em))}</small></div></div>`).join('')}`);
    const c = W.corpo;
    // elenco: a lista do Ateliê é buscada de novo ao abrir
    const del = $('details[data-aj="elenco"]', c), pintaEl = () => { const b = $('.ps-elenco', c); if (b && !b.dataset.ok) { b.dataset.ok = 1; pintaElenco(b); } };
    if (del) { if (del.open) pintaEl(); del.addEventListener('toggle', () => { if (del.open) pintaEl(); }); }
    // legenda rápida
    const muda = fn => { P.legenda = P.legenda || { ativa: true, mostrarNome: false, cores: {} }; fn(P.legenda); marcaSujo(); this.resumoAjustes(); };
    $$('[data-leg]', c).forEach(b => b.onclick = () => { const k = b.dataset.leg, v = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', String(v));
      muda(l => { if (k === 'maiusculas') l.estilo = { ...estiloDe(P), maiusculas: v }; else l[k] = v; }); });
    $('[data-leg-fonte]', c).onchange = e => muda(l => { l.estilo = { ...estiloDe(P), fonte: e.target.value }; });
    $('[data-leg-padrao]', c).onclick = () => { muda(l => { l.estilo = JSON.parse(JSON.stringify(LEG_PADRAO)); l.ativa = true; l.mostrarNome = false; }); this.pintaAjustes(); aviso('Legenda de volta ao padrão (o tamanho do vídeo e as cores dos personagens ficaram).', 'ok'); };
    $('[data-leg-mais]', c).onclick = () => { const L2 = this.painel('Legenda', true), box = h('<div class="ps-leg-tudo"></div>'); L2.corpo.append(box); pintaLegendas(box);
      L2.rod.innerHTML = `<button class="bt pri" data-ok>Pronto</button>`; $('[data-ok]', L2.rod).onclick = L2.fecha; L2.aoFechar(() => { if (this._aj) this.pintaAjustes(); }); };
    // canal e data
    $$('[data-dest]', c).forEach(b => b.onclick = async () => { if (b.dataset.dest === P.destino) return; await mudaMarca('destino', b.dataset.dest); this.pintaAjustes(); });
    $('[data-canal]', c).onchange = async e => { const cn = PREP_CONFIG.canais.find(x => x.id === e.target.value) || null; await mudaMarca('canal', cn); this.pintaAjustes(); };
    $('[data-data-cal]', c).onclick = () => marcaDataCalendario(S.P); pintaDataCal();
    this.resumoAjustes();
  },
  resumoAjustes() {
    const W = this._aj, P = S.P; if (!W || !P) return; const r = k => $(`[data-aj-r="${k}"]`, W.corpo), L = P.legenda || {}, E = estiloDe(P);
    const ps = Roteiro.personagens(P.partes), M = P.animador?.pers || {}, mao = ps.filter(p => p.chave in M).length;
    if (r('elenco')) r('elenco').textContent = mao ? `Você escolheu ${mao} à mão` : `Automático para ${ps.length === 1 ? 'o personagem' : `os ${ps.length} personagens`}`;
    if (r('legenda')) r('legenda').textContent = L.ativa === false ? 'Legendas desligadas' : `${JSON.stringify(E) === JSON.stringify(LEG_PADRAO) && !L.mostrarNome ? 'Padrão' : 'Mudou'}: ${E.fonte}, ${L.mostrarNome ? 'com o nome' : 'cor de quem fala'}${E.maiusculas ? ', maiúsculas' : ''}`;
    if (r('publicar')) r('publicar').textContent = `${this.NOME_DEST[P.destino] || 'Sem destino'}, ${P.canal ? 'canal ' + P.canal.nome : 'sem canal'}`;
    if (r('quem')) r('quem').textContent = P.autor ? `criado por ${P.autor.nome}` : 'só neste computador';
  },
};
if (typeof window !== 'undefined') window.Simples = Simples;
if (typeof module !== 'undefined') module.exports = Simples;

// teste da lógica pura: node js/simples.js
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  const assert = require('assert'); let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
  // 1) classificar os arquivos soltos
  const P2 = nome => /stick/i.test(nome) ? 'stick' : /problems/i.test(nome) ? 'problems' : null;
  ok(Simples.classificaSoltos([], 2, P2).modo === null, 'nenhum arquivo');
  ok(Simples.classificaSoltos([{ nome: 'roteiro-23-11.wav', tam: 9e6, dur: 54 }], 2, P2).modo === 'inteiro', '1 arquivo = inteiro');
  ok(Simples.classificaSoltos([{ nome: 'curto.wav', tam: 1e5, dur: 2 }], 2, P2).modo === 'inteiro', '1 arquivo curto também = inteiro');
  ok(Simples.classificaSoltos([{ nome: 'stick.mp3', tam: 3e6, dur: 30 }, { nome: 'problems.mp3', tam: 6e6, dur: 50 }], 2, P2).modo === 'personagem', 'um por personagem (nomes)');
  ok(Simples.classificaSoltos([{ nome: 'a.mp3', tam: 3e6, dur: 30 }, { nome: 'b.mp3', tam: 6e6, dur: 50 }], 2, P2).modo === 'personagem', 'dois longos sem nome = um por personagem');
  ok(Simples.classificaSoltos([{ nome: 'fala1.mp3', tam: 9e4, dur: 3 }, { nome: 'fala2.mp3', tam: 8e4, dur: 2.5 }], 2, P2).modo === 'fala', 'dois curtos sem nome de personagem = um por fala');
  ok(Simples.classificaSoltos(Array.from({ length: 17 }, (_, i) => ({ nome: `fala ${i + 1}.wav`, tam: 2e5, dur: null })), 2, P2).modo === 'fala', '17 arquivos, 2 personagens = um por fala');
  ok(Simples.classificaSoltos([{ nome: 'x.ogg', tam: 1e5, dur: null }, { nome: 'y.ogg', tam: 2e5, dur: null }], 3, P2).modo === 'fala', 'sem duração: pelo tamanho');
  // 2) um arquivo por fala: o número no nome manda; sem número, na ordem
  assert.deepStrictEqual(Simples.ordemPorFala(['fala 10.wav', 'fala 2.wav', 'fala 1.wav'], 17), [9, 1, 0]); n++;
  assert.deepStrictEqual(Simples.ordemPorFala(['b.wav', 'a.wav', 'c.wav'], 5), [1, 0, 2]); n++;
  assert.deepStrictEqual(Simples.ordemPorFala(['3.wav', 'x.wav', 'y.wav'], 3), [2, 0, 1]); n++;
  assert.deepStrictEqual(Simples.ordemPorFala(['1.wav', '2.wav', '3.wav'], 2), [0, 1, -1]); n++;
  // 3) "Como entendi" + 4) aviso de linha sem NOME:
  const T = 'Problems: A minha sala inteira COLOU na prova. *rindo* Menos eu.\nProblems: O pessoal chamava ele de filho do PITÁGORAS.\nIsso aqui não tem nome\nStick: Eu fui adicionado sem querer!\n\n// comentário\n[a câmera se aproxima]\n*Problems abre a porta.*\nClara: Oi\ne continua aqui.';
  const E = Simples.entende(T);
  ok(E.falas === 4, 'falas: ' + E.falas);
  assert.deepStrictEqual(E.pers.map(p => [p.nome, p.n]), [['Problems', 2], ['Stick', 1], ['Clara', 1]]); n++;
  assert.deepStrictEqual(E.destaques, ['COLOU', 'PITÁGORAS']); n++;
  ok(E.notas === 1, 'notas: ' + E.notas);
  const T2 = T.replace('Isso aqui não tem nome', '\nIsso aqui não tem nome\n'), E2 = Simples.entende(T2);
  assert.deepStrictEqual(E.semNome.map(x => x.linha), []); n++; // colada embaixo de uma fala = continuação (o formato do roteiro), não aviso
  assert.deepStrictEqual(E.juntas.map(x => x.linha), [3, 10]); n++;
  assert.deepStrictEqual(E2.semNome.map(x => x.linha), [4]); n++; // com linha em branco antes = solta: aviso; comentário, cena e ação NÃO são aviso
  ok(E2.falas === 4, 'falas com a linha solta: ' + E2.falas);
  ok(Simples.entende('').falas === 0 && Simples.entende('').semNome.length === 0, 'vazio');
  ok(Simples.entende('Só uma frase solta.').semNome.length === 1, 'frase solta = aviso');
  console.log(`simples.js: ${n} conferências ok`);
}
