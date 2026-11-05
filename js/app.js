/* ===================== app.js — PREPARATIVOS (Estúdio Problems) =====================
   O que vem antes de animar ou editar: roteiros em partes, falas por personagem, gravação das falas, destino e legendas.
   Nuvem: rotas /preparativos* do turma-ia (formato no README.md). Rascunhos e áudios ficam NESTE navegador (IndexedDB
   "ep-preparativos") até a pessoa mandar para a nuvem. */
'use strict';
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const SRV = PREP_CONFIG.servidor;
const DESTINOS = Object.fromEntries(PREP_CONFIG.destinos), STATUS = Object.fromEntries(PREP_CONFIG.status);
const tempo = s => { s = Math.max(0, +s || 0); return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') + (s < 10 ? ',' + Math.floor(s * 10 % 10) : ''); };
const quando = t => { if (!t) return ''; const d = new Date(t); return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };

/* ---------- ícones de linha (iguais aos do menu) ---------- */
const IC = {
  mais: '<path d="M12 5v14M5 12h14"/>', voltar: '<path d="M15 18l-6-6 6-6"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  play: '<path d="M7 5l12 7-12 7z"/>', parar: '<rect x="6" y="6" width="12" height="12" rx="2"/>', lixo: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  nuvem: '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/>', enviar: '<path d="M12 16V5M7 10l5-5 5 5M5 19h14"/>', ok: '<path d="M5 12l5 5 9-10"/>',
  doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>', atualizar: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>', organizar: '<path d="M4 6h10M4 12h16M4 18h7"/><path d="M17 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
  luz: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>', pessoa: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  alerta: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>', legenda: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 14h4M13 14h4M7 10h10"/>',
};
const ic = (n, s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

/* ---------- avisos ---------- */
function aviso(t, tipo = 'info', ms = 4200) { const el = h(`<div class="aviso ${tipo}">${esc(t)}</div>`); $('#avisos').appendChild(el); setTimeout(() => { el.classList.add('sai'); setTimeout(() => el.remove(), 300); }, ms); }
function pergunta(titulo, msg, botoes) {
  return new Promise(ok => { const el = h(`<div class="modal"><div class="caixa"><b>${esc(titulo)}</b><p>${esc(msg)}</p><div class="bts"></div></div></div>`);
    for (const [rot, val, cls] of botoes) { const b = h(`<button class="bt ${cls || ''}">${esc(rot)}</button>`); b.onclick = () => { el.remove(); ok(val); }; $('.bts', el).appendChild(b); }
    document.body.appendChild(el); });
}

/* ---------- permissões (níveis de acesso: outra parte do Estúdio decide; sem ela, pode tudo) ---------- */
const pode = c => { try { return window.EstudioPerm?.pode?.('preparativos.' + c) ?? true; } catch { return true; } };

/* ---------- banco deste navegador: rascunhos e áudios que ainda não foram para a nuvem ---------- */
const DB = {
  _db: null,
  abre() { return this._db || (this._db = new Promise((ok, no) => { const r = indexedDB.open('ep-preparativos', 1); r.onupgradeneeded = () => { r.result.createObjectStore('rasc'); r.result.createObjectStore('aud'); }; r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); })); },
  async op(loja, modo, f) { const db = await this.abre(); return new Promise((ok, no) => { const tx = db.transaction(loja, modo), st = tx.objectStore(loja), r = f(st); tx.oncomplete = () => ok(r?.result); tx.onerror = () => no(tx.error); }); },
  get(l, k) { return this.op(l, 'readonly', s => s.get(k)); }, put(l, k, v) { return this.op(l, 'readwrite', s => s.put(v, k)); }, del(l, k) { return this.op(l, 'readwrite', s => s.delete(k)); },
  async todos(l) { const db = await this.abre(); return new Promise((ok, no) => { const out = [], tx = db.transaction(l, 'readonly'), c = tx.objectStore(l).openCursor(); c.onsuccess = () => { const x = c.result; if (x) { out.push([x.key, x.value]); x.continue(); } }; tx.oncomplete = () => ok(out); tx.onerror = () => no(tx.error); }); },
};

/* ---------- nuvem ---------- */
const Nuvem = {
  async hd() { const t = await window.EstudioLogin?.token?.(); return t ? { authorization: t } : {}; },
  async pede(caminho, o = {}) {
    let r; try { r = await fetch(SRV + caminho, { ...o, headers: { ...(await this.hd()), ...(o.headers || {}) }, cache: 'no-store' }); } catch { throw new Error('Não consegui falar com a nuvem. Confira a internet e tente de novo.'); }
    const tipo = r.headers.get('content-type') || '';
    if (!r.ok) { const j = tipo.includes('json') ? await r.json().catch(() => ({})) : {}; const e = new Error(j.error?.message || `A nuvem respondeu ${r.status}.`); e.status = r.status; e.tipo = j.error?.type; e.dados = j.error; throw e; }
    if (o.blob) return r.blob();
    return tipo.includes('json') ? r.json() : r.text();
  },
  json(caminho, metodo, corpo) { return this.pede(caminho, { method: metodo, headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) }); },
  lista() { return this.pede('/preparativos'); },
  async abre(id) { const r = await fetch(SRV + '/preparativos/arquivo?k=' + encodeURIComponent(`preparativos/${id}/prep.json`), { headers: await this.hd(), cache: 'no-store' });
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error?.message || 'Não consegui abrir este roteiro da nuvem.'); }
    const P = await r.json(); P.mod = +r.headers.get('x-mod') || P.mod || 0; return P; },
  salva(P, forcar) { return this.pede(`/preparativos/arquivo?k=${encodeURIComponent(`preparativos/${P.id}/prep.json`)}&base=${+P.mod || 0}${forcar ? '&forcar=1' : ''}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(P) }); },
  acao(corpo) { return this.json('/preparativos/acao', 'POST', corpo); },
  cores() { return this.pede('/preparativos/arquivo?k=preparativos/cores.json').catch(e => { if (e.status === 404) return {}; throw e; }); },
  _aud: new Map(),
  async audio(k) { if (!this._aud.has(k)) this._aud.set(k, this.pede('/preparativos/arquivo?k=' + encodeURIComponent(k), { blob: true }).catch(e => { this._aud.delete(k); throw e; })); return this._aud.get(k); },
};

/* ---------- estado ---------- */
const S = { aba: 'roteiros', lista: null, P: null, sub: 'roteiro', sujo: false, eu: null, cores: null, tocando: null };
const coresPadrao = ['#19f0f0', '#ffb04a', '#ff6b93', '#a796ff', '#4fe08f', '#ffd36b', '#7fd1ff', '#ff8f6b'];
const corDe = (nome, P = S.P) => { const k = Roteiro.chave(nome); return P?.legenda?.cores?.[k] || S.cores?.[k] || null; };
const corOuPadrao = (nome, i) => corDe(nome) || coresPadrao[i % coresPadrao.length];

function novoPrep(nome = 'Roteiro novo', texto = '') {
  return { v: 1, id: 'pr' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), nome, destino: null, status: 'rascunho', roteiro: texto, partes: Roteiro.separa(texto), legenda: { ativa: true, cores: {} }, usadoPor: [], criado: Date.now(), mod: 0, novo: true };
}
// rascunho deste navegador (guardado a cada mudança, sem gastar a nuvem)
let tGuarda = 0;
function marcaSujo() { S.sujo = true; pintaBarraPrep(); clearTimeout(tGuarda); tGuarda = setTimeout(() => DB.put('rasc', S.P.id, { P: S.P, base: S.base, em: Date.now() }).catch(() => { }), 600); }

/* ======================= telas ======================= */
const tela = () => $('#tela');
function trocaAba(a) { S.aba = a; S.P = null; $$('[data-aba]').forEach(b => b.classList.toggle('on', b.dataset.aba === a)); history.replaceState(null, '', a === 'roteiros' ? './' : './?aba=' + a); pinta(); }
async function sairDoPrep() { if (S.sujo && !await pergunta('Sair sem mandar para a nuvem?', 'O que você mudou continua guardado neste computador e aparece aqui da próxima vez.', [['Ficar', false], ['Sair', true, 'pri']])) return false; S.P = null; S.sujo = false; history.replaceState(null, '', './'); pinta(); return true; }
function pinta() { if (S.P) return pintaPrep(); if (S.aba === 'ideias') return Ideias.pinta(); if (S.aba === 'cores') return pintaCores(); return pintaInicio(); }

/* ---------- início: lista dos roteiros ---------- */
async function pintaInicio(novo) {
  const el = tela(); el.innerHTML = `<section class="inicio"><div class="cab"><h1>Roteiros</h1><span class="esp"></span>
    <button class="bt" data-at title="Buscar de novo">${ic('atualizar')} Atualizar</button>${pode('roteiro') ? `<button class="bt pri" data-novo>${ic('mais')} Novo roteiro</button>` : ''}</div>
    <p class="dica">Escreva o roteiro em partes, veja as falas de cada personagem e grave pelo navegador. Quando estiver pronto, marque para qual programa ele vai.</p>
    <div class="locais"></div><div class="grade"><div class="vazio">Carregando…</div></div></section>`;
  $('[data-at]', el).onclick = () => { S.lista = null; pintaInicio(true); };
  $('[data-novo]', el)?.addEventListener('click', () => abrePrep(novoPrep()));
  // rascunhos deste navegador que ainda não foram para a nuvem
  try { const R = (await DB.todos('rasc')).map(([, v]) => v).filter(v => v?.P?.id).sort((a, b) => b.em - a.em); const box = $('.locais', el);
    if (R.length) { box.innerHTML = '<h2>Só neste computador</h2><div class="grade"></div>'; for (const r of R) { const c = cartao(r.P, true); c.onclick = () => abrePrep(r.P, r.base); $('.grade', box).appendChild(c); } } } catch { }
  const g = $('.grade:last-child', el);
  try { if (!S.lista || novo) S.lista = (await Nuvem.lista()).itens || []; }
  catch (e) { g.innerHTML = `<div class="vazio erro">${esc(e.message)}</div>`; return; }
  g.innerHTML = S.lista.length ? '' : '<div class="vazio">Nenhum roteiro na nuvem ainda.</div>';
  for (const it of S.lista.sort((a, b) => (b.mod || 0) - (a.mod || 0))) { const c = cartao(it); c.onclick = async () => { c.classList.add('carregando'); try { abrePrep(await Nuvem.abre(it.id)); } catch (e) { aviso(e.message, 'erro'); c.classList.remove('carregando'); } }; g.appendChild(c); }
}
function cartao(it, local) {
  const n = it.n ?? (it.partes || []).reduce((s, p) => s + (p.falas?.length || 0), 0), g = it.g ?? (it.partes || []).reduce((s, p) => s + (p.falas || []).filter(f => f.audio).length, 0), np = typeof it.partes === 'number' ? it.partes : (it.partes || []).length;
  return h(`<button class="cartao ${esc(it.status || 'rascunho')}"><span class="st">${esc(STATUS[it.status] || 'Rascunho')}</span>${it.destino ? `<span class="dest">${esc(DESTINOS[it.destino] || it.destino)}</span>` : ''}
    <b>${esc(it.nome || 'Sem nome')}</b><small>${np} parte${np === 1 ? '' : 's'} · ${n} fala${n === 1 ? '' : 's'} · ${g} gravada${g === 1 ? '' : 's'}</small>
    <div class="barra"><i style="width:${n ? Math.round(g / n * 100) : 0}%"></i></div><small class="mt">${local ? 'falta mandar para a nuvem' : esc(quando(it.mod))}</small></button>`);
}

/* ---------- um preparativo ---------- */
async function abrePrep(P, base) {
  // tem rascunho deste computador mais novo que o da nuvem?
  if (!base && !P.novo) { try { const r = await DB.get('rasc', P.id); if (r?.P && (+r.base?.mod || 0) === (+P.mod || 0) && r.em > (P.mod || 0)) { const usar = await pergunta('Continuar de onde parou?', 'Este computador tem mudanças neste roteiro que ainda não foram para a nuvem.', [['Abrir o da nuvem', false], ['Continuar daqui', true, 'pri']]); if (usar) { base = r.base; P = r.P; } else await DB.del('rasc', P.id); } } catch { } }
  S.P = P; S.base = base || { mod: P.mod || 0, roteiro: P.roteiro || '' }; S.sujo = !!base || !!P.novo; S.sub = pode('roteiro') || pode('organizar') ? (S.sub || 'roteiro') : 'falas';
  if (!S.cores) Nuvem.cores().then(c => { S.cores = c || {}; if (S.P) pintaCorpo(); }).catch(() => { S.cores = {}; });
  history.replaceState(null, '', './?id=' + encodeURIComponent(P.id)); pintaPrep();
}
function pintaPrep() {
  const P = S.P, el = tela();
  el.innerHTML = `<section class="prep"><div class="cab">
      <button class="bt ic" data-volta title="Voltar aos roteiros">${ic('voltar')}</button>
      <input class="nome" value="${esc(P.nome)}" ${pode('roteiro') ? '' : 'readonly'} aria-label="Nome do roteiro">
      <span class="esp"></span>
      <label class="campo">Vai para <select data-destino ${pode('pronto') ? '' : 'disabled'}><option value="">—</option>${PREP_CONFIG.destinos.map(([v, n]) => `<option value="${v}" ${P.destino === v ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
      <label class="campo">Situação <select data-status ${pode('pronto') ? '' : 'disabled'}>${PREP_CONFIG.status.map(([v, n]) => `<option value="${v}" ${P.status === v ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
      <span class="salvar"></span>
    </div>
    <nav class="sub">${[['roteiro', 'Roteiro', 'doc'], ['falas', 'Falas e gravação', 'mic'], ['legendas', 'Legendas', 'legenda']].map(([k, n, i]) => `<button data-sub="${k}" class="${S.sub === k ? 'on' : ''}">${ic(i, 15)} ${n}</button>`).join('')}</nav>
    <div class="corpo"></div></section>`;
  $('[data-volta]', el).onclick = sairDoPrep;
  const nm = $('.nome', el); nm.oninput = () => { P.nome = nm.value.slice(0, 80); marcaSujo(); };
  const mudaMarca = async (campo, v) => {
    P[campo] = v || null; if (campo === 'status') P.status = v || 'rascunho';
    if (P.novo || S.sujo) return marcaSujo(); // vai junto quando mandar para a nuvem
    try { const r = await Nuvem.acao({ acao: 'marca', id: P.id, [campo]: P[campo] }); P.mod = r.mod || P.mod; S.base.mod = P.mod; aviso(campo === 'status' && v === 'pronto' ? `Marcado como pronto${P.destino ? ' para o ' + (DESTINOS[P.destino] || P.destino) : ''}.` : 'Salvo na nuvem.', 'ok'); S.lista = null; }
    catch (e) { aviso(e.message, 'erro'); }
  };
  $('[data-destino]', el).onchange = e => mudaMarca('destino', e.target.value);
  $('[data-status]', el).onchange = e => mudaMarca('status', e.target.value);
  $$('[data-sub]', el).forEach(b => b.onclick = () => { S.sub = b.dataset.sub; $$('[data-sub]', el).forEach(x => x.classList.toggle('on', x === b)); pintaCorpo(); });
  pintaBarraPrep(); pintaCorpo();
}
function pintaBarraPrep() {
  const box = $('.prep .salvar'); if (!box || !S.P) return; const P = S.P;
  box.innerHTML = S.sujo ? `<button class="bt pri" data-salva>${ic('nuvem')} Mandar para a nuvem</button>` : `<span class="salvo">${ic('ok', 14)} ${P.mod ? 'Na nuvem' : ''}</span>`;
  const b = $('[data-salva]', box); if (b) b.onclick = () => salvaPrep(b);
}
async function salvaPrep(bt) {
  const P = S.P; if (!pode('roteiro') && !pode('organizar') && !pode('pronto')) return aviso('Sua conta pode gravar, mas não mudar o roteiro.', 'erro');
  if (bt) { bt.disabled = true; bt.textContent = 'Mandando…'; }
  try {
    const { novo, ...corpo } = P; let r;
    try { r = await Nuvem.salva(corpo); }
    catch (e) {
      if (e.status !== 409 || e.tipo !== 'conflito') throw e;
      // alguém mexeu enquanto você editava: junta (o seu texto + os áudios que chegaram) se o roteiro da nuvem não mudou
      const nv = await Nuvem.abre(P.id);
      if ((nv.roteiro || '') === (S.base.roteiro || '')) { P.partes = Roteiro.separa(P.roteiro, nv.partes); P.mod = nv.mod; P.usadoPor = nv.usadoPor || []; r = await Nuvem.salva({ ...P, novo: undefined }); }
      else { const esc2 = await pergunta('Outra pessoa mudou este roteiro', 'A versão da nuvem tem um roteiro diferente do que você abriu. O que fazer?', [['Abrir a versão da nuvem', 'abrir'], ['Salvar a minha por cima', 'forcar', 'perigo'], ['Cancelar', null]]);
        if (esc2 === 'abrir') { await DB.del('rasc', P.id).catch(() => { }); S.sujo = false; return abrePrep(nv); }
        if (esc2 !== 'forcar') return; r = await Nuvem.salva({ ...P, novo: undefined }, true); }
    }
    P.mod = r.mod; delete P.novo; S.base = { mod: P.mod, roteiro: P.roteiro }; S.sujo = false; S.lista = null; await DB.del('rasc', P.id).catch(() => { });
    aviso('Mandado para a nuvem.', 'ok'); pintaBarraPrep(); if (S.sub === 'falas') pintaCorpo();
  } catch (e) { aviso(e.message, 'erro'); }
  finally { if (bt?.isConnected) pintaBarraPrep(); }
}
function pintaCorpo() { const c = $('.prep .corpo'); if (!c) return; if (S.sub === 'falas') return Falas.pinta(c); if (S.sub === 'legendas') return pintaLegendas(c); return pintaRoteiro(c); }

/* ---------- aba Roteiro ---------- */
function pintaRoteiro(c) {
  const P = S.P, ed = pode('roteiro');
  c.innerHTML = `<div class="rot"><div class="esq"><div class="ferr">
      ${ed ? `<button class="bt" data-parte>${ic('mais', 15)} Nova parte</button>` : ''}
      ${pode('organizar') ? `<button class="bt" data-org title="Arruma o texto em partes e falas por personagem">${ic('organizar', 15)} Organizar</button>` : ''}
      <span class="esp"></span><small class="dica">Fala: <code>NOME: texto</code> · Parte: <code>## Episódio 1 parte 1</code> · Cena: <code>[…]</code></small></div>
      <textarea spellcheck="true" ${ed ? '' : 'readonly'} placeholder="## Episódio 1 parte 1&#10;PROBLEMS: Oi, gente!&#10;CLARA: (rindo) Oi, Problems.&#10;&#10;## Episódio 1 parte 2&#10;PROBLEMS: …">${esc(P.roteiro || '')}</textarea></div>
    <aside class="dir"><div class="resumo"></div></aside></div>`;
  const ta = $('textarea', c); let t = 0;
  ta.oninput = () => { P.roteiro = ta.value; clearTimeout(t); t = setTimeout(() => { P.partes = Roteiro.separa(P.roteiro, P.partes); resumo(); }, 250); marcaSujo(); };
  $('[data-parte]', c)?.addEventListener('click', () => { const n = P.partes.length + 1, ins = `${ta.value && !ta.value.endsWith('\n\n') ? (ta.value.endsWith('\n') ? '\n' : '\n\n') : ''}## ${Roteiro.norm(P.nome)} parte ${n}\n`; const pos = ta.selectionEnd || ta.value.length; ta.setRangeText(ins, pos, pos, 'end'); ta.focus(); ta.oninput(); });
  $('[data-org]', c)?.addEventListener('click', e => Organizar.roda(e.currentTarget, ta));
  const resumo = () => {
    const ps = Roteiro.personagens(P.partes), box = $('.resumo', c);
    box.innerHTML = `<h3>${P.partes.length} parte${P.partes.length === 1 ? '' : 's'}</h3><ol class="partes">${P.partes.map(p => `<li><b>${esc(p.nome)}</b><small>${p.falas.length} fala${p.falas.length === 1 ? '' : 's'}${p.falas.some(f => f.regravar) ? ' · <span class="aten">texto mudou, regravar</span>' : ''}</small></li>`).join('')}</ol>
      <h3>Personagens</h3><div class="chips">${ps.map((p, i) => `<span class="chip" style="--c:${corOuPadrao(p.nome, i)}">${esc(p.nome)} <small>${p.g}/${p.n}</small></span>`).join('') || '<small class="dica">Escreva as falas como NOME: texto.</small>'}</div>`;
  };
  resumo();
}

/* ---------- Organizar: a nuvem arruma o texto em partes e falas ---------- */
const Organizar = {
  SIS: `Você arruma roteiros de vídeos de animação em português do Brasil. Receba o texto e devolva SÓ um JSON:
{"partes":[{"nome":"Episódio 1 parte 1","falas":[{"personagem":"NOME","texto":"o que ele fala","nota":"como falar (opcional, curta)"}]}]}
Regras: não invente falas nem mude o sentido; corrija só erros óbvios de digitação; nome do personagem igual em todas as falas (o mesmo jeito de escrever);
narração e indicações de cena não viram fala (a não ser que exista um NARRADOR falando); separe em partes nomeadas seguindo o que o texto indica
(episódio, parte, cena); se o texto não indicar partes, use uma parte com o nome do roteiro; a nota vem de indicações entre parênteses na fala.`,
  async roda(bt, ta) {
    const P = S.P, txt = ta.value.trim(); if (!txt) return aviso('Escreva ou cole o roteiro primeiro.', 'info');
    const rot = bt.innerHTML; bt.disabled = true; bt.innerHTML = `<span class="gira"></span> Organizando…`;
    try {
      const r = await fetch(SRV + '/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', ...(await Nuvem.hd()) }, body: JSON.stringify({ system: [{ type: 'text', text: this.SIS }], messages: [{ role: 'user', content: `NOME DO ROTEIRO: ${P.nome}\n\nTEXTO:\n${txt.slice(0, 60000)}` }] }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error?.message || 'A nuvem não conseguiu organizar agora.'); }
      const saida = /event-stream/.test(r.headers.get('content-type') || '') ? await this.le(r) : ((await r.json()).content || []).map(x => x.text || '').join('');
      const m = saida.match(/\{[\s\S]*\}/); if (!m) throw new Error('Não deu para organizar este texto. Tente de novo.');
      const j = JSON.parse(m[0]); const partes = (j.partes || []).filter(p => p?.falas?.length).map(p => ({ nome: String(p.nome || P.nome).slice(0, 80), falas: p.falas.filter(f => f?.personagem && f?.texto).map(f => ({ personagem: String(f.personagem).slice(0, 40), texto: String(f.texto), nota: f.nota ? String(f.nota).slice(0, 80) : '' })) }));
      if (!partes.length) throw new Error('Não achei falas neste texto.');
      ta.value = Roteiro.escreve(partes); ta.oninput(); aviso('Roteiro organizado em ' + partes.length + ' parte' + (partes.length === 1 ? '' : 's') + '.', 'ok');
    } catch (e) { aviso(e.message, 'erro'); }
    finally { bt.disabled = false; bt.innerHTML = rot; }
  },
  async le(r) {
    const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '', txt = '';
    for (;;) { const { done, value } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true }); let i;
      while ((i = buf.indexOf('\n\n')) >= 0) { const ev = buf.slice(0, i); buf = buf.slice(i + 2); const d = ev.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trim()).join(''); if (!d) continue;
        let o; try { o = JSON.parse(d); } catch { continue; } if (o.type === 'content_block_delta' && o.delta?.text) txt += o.delta.text; if (o.type === 'error') throw new Error(o.error?.message || 'A nuvem não conseguiu organizar agora.'); } }
    return txt;
  },
};

/* ---------- aba Falas e gravação ---------- */
const Falas = {
  quem: null, rec: null,
  async pinta(c) {
    const P = S.P, ps = Roteiro.personagens(P.partes); this.c = c;
    try { this.quem = this.quem ?? localStorage.getItem('ep-prep-quem') ?? ''; } catch { this.quem = this.quem || ''; }
    if (this.quem && !ps.some(p => p.chave === this.quem)) this.quem = '';
    const locais = await this.locais();
    const visiveis = P.partes.map(p => ({ ...p, falas: p.falas.filter(f => !this.quem || Roteiro.chave(f.personagem) === this.quem) })).filter(p => p.falas.length);
    c.innerHTML = `<div class="falas"><div class="ferr"><span class="rot-quem">${ic('pessoa', 15)} Quem vai gravar:</span>
        <div class="chips">${['', ...ps.map(p => p.chave)].map((k, i) => { const p = ps.find(x => x.chave === k); return `<button class="chip ${this.quem === k ? 'on' : ''}" data-grava="${esc(k)}" ${p ? `style="--c:${corOuPadrao(p.nome, i - 1)}"` : ''}>${p ? esc(p.nome) + ` <small>${p.g}/${p.n}</small>` : 'Todos'}</button>`; }).join('')}</div>
        <span class="esp"></span><span class="env"></span></div>
      ${P.novo || S.sujo && !P.mod ? `<p class="aviso-linha">${ic('alerta', 15)} Mande o roteiro para a nuvem antes de enviar as gravações (as gravações ficam guardadas aqui enquanto isso).</p>` : ''}
      ${!ps.length ? '<div class="vazio">Ainda não há falas. Escreva o roteiro como <code>NOME: texto</code>.</div>' : ''}
      ${visiveis.map(p => `<div class="parte"><h3>${esc(p.nome)}</h3>${p.falas.map(f => this.linha(f, locais.get(f.id), ps)).join('')}</div>`).join('')}</div>`;
    $$('[data-grava]', c).forEach(b => b.onclick = () => { this.quem = b.dataset.grava; try { localStorage.setItem('ep-prep-quem', this.quem); } catch { } this.pinta(c); });
    $$('.fala', c).forEach(el => { const f = this.acha(el.dataset.f); if (!f) return;
      $('[data-gravar]', el)?.addEventListener('click', () => this.grava(f, el));
      $('[data-ouvir]', el)?.addEventListener('click', e => this.ouve(f, e.currentTarget));
      $('[data-tirar]', el)?.addEventListener('click', async () => { await DB.del('aud', P.id + '/' + f.id); this.pinta(c); }); });
    this.pintaEnvio(locais);
  },
  acha(id) { for (const p of S.P.partes) for (const f of p.falas) if (f.id === id) return f; return null; },
  async locais() { const m = new Map(); try { for (const [k, v] of await DB.todos('aud')) if (String(k).startsWith(S.P.id + '/')) m.set(String(k).slice(S.P.id.length + 1), v); } catch { } return m; },
  linha(f, local, ps) {
    const i = ps.findIndex(p => p.chave === Roteiro.chave(f.personagem)), gravar = pode('gravar');
    const st = local ? `<span class="st aqui">gravada aqui · falta enviar</span>` : f.audio ? `<span class="st nuvem">${f.regravar ? '<span class="aten">texto mudou, regravar</span>' : 'na nuvem'} · ${tempo(f.duracao)}</span>` : '<span class="st sem">sem áudio</span>';
    return `<div class="fala ${local ? 'local' : f.audio ? 'tem' : ''}" data-f="${esc(f.id)}"><span class="pers" style="--c:${corOuPadrao(f.personagem, i)}">${esc(f.personagem)}</span>
      <div class="txt">${f.nota ? `<em>(${esc(f.nota)})</em> ` : ''}${esc(f.texto)}${st}</div>
      <div class="bts">${local || f.audio ? `<button class="bt ic" data-ouvir title="Ouvir">${ic('play', 15)}</button>` : ''}
      ${gravar ? `<button class="bt ${local || f.audio ? '' : 'pri'}" data-gravar>${ic('mic', 15)} ${local || f.audio ? 'Regravar' : 'Gravar'}</button>` : ''}
      ${local ? `<button class="bt ic" data-tirar title="Jogar fora esta gravação">${ic('lixo', 15)}</button>` : ''}</div></div>`;
  },
  async grava(f, el) {
    if (this.rec) { const parar = this.rec.f === f; this.rec.parar(); if (parar) return; }
    let st; try { st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
    catch { return aviso('Não consegui usar o microfone. Libere o microfone para este site no navegador.', 'erro'); }
    const tipo = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => window.MediaRecorder?.isTypeSupported?.(t)) || '';
    const mr = new MediaRecorder(st, { ...(tipo ? { mimeType: tipo } : {}), audioBitsPerSecond: PREP_CONFIG.audioBits }), pedacos = [], t0 = performance.now();
    const bt = $('[data-gravar]', el); bt.classList.add('gravando'); bt.innerHTML = `${ic('parar', 15)} Parar <span class="cron">0:00</span>`;
    const cron = setInterval(() => { const s = (performance.now() - t0) / 1000; const cr = $('.cron', bt); if (cr) cr.textContent = tempo(s); if (s > PREP_CONFIG.audioMaxSeg) this.rec?.parar(); }, 200);
    mr.ondataavailable = e => e.data.size && pedacos.push(e.data);
    mr.onstop = async () => { clearInterval(cron); st.getTracks().forEach(t => t.stop()); this.rec = null; const dur = (performance.now() - t0) / 1000;
      if (dur < 0.4) { aviso('Gravação curta demais.', 'info'); return this.pinta(this.c); }
      const blob = new Blob(pedacos, { type: mr.mimeType || tipo || 'audio/webm' });
      await DB.put('aud', S.P.id + '/' + f.id, { blob, duracao: Math.round(dur * 100) / 100, em: Date.now() }); this.pinta(this.c); };
    mr.start(250); this.rec = { f, parar: () => { try { mr.stop(); } catch { } } };
  },
  async ouve(f, bt) {
    if (S.tocando) { S.tocando.pause(); const era = S.tocando._f === f.id; S.tocando = null; $$('.tocando').forEach(x => x.classList.remove('tocando')); if (era) return; }
    try { const l = await DB.get('aud', S.P.id + '/' + f.id); const blob = l?.blob || await Nuvem.audio(f.audio);
      const a = new Audio(URL.createObjectURL(blob)); a._f = f.id; S.tocando = a; bt.classList.add('tocando'); a.onended = () => { bt.classList.remove('tocando'); S.tocando = null; URL.revokeObjectURL(a.src); }; await a.play(); }
    catch (e) { aviso('Não consegui tocar: ' + (e.message || e), 'erro'); }
  },
  pintaEnvio(locais) {
    const box = $('.env', this.c); if (!box) return; const n = [...locais.keys()].filter(id => this.acha(id)).length;
    box.innerHTML = n && pode('gravar') ? `<button class="bt pri" data-envia>${ic('enviar', 15)} Enviar ${n} gravaç${n === 1 ? 'ão' : 'ões'}</button>` : '';
    const b = $('[data-envia]', box); if (b) b.onclick = () => this.envia(b, locais);
  },
  async envia(bt, locais) {
    const P = S.P; if (P.novo || !P.mod) return aviso('Mande o roteiro para a nuvem primeiro (botão "Mandar para a nuvem" lá em cima).', 'info');
    bt.disabled = true; const lista = [...locais.entries()].filter(([id]) => this.acha(id)); const feitas = [];
    try {
      for (const [i, [id, l]] of lista.entries()) { bt.textContent = `Enviando ${i + 1} de ${lista.length}…`;
        const ext = /mp4/.test(l.blob.type) ? 'm4a' : /ogg/.test(l.blob.type) ? 'ogg' : 'webm', k = `preparativos/${P.id}/aud/${id}-${Date.now().toString(36)}.${ext}`;
        await Nuvem.pede('/preparativos/arquivo?k=' + encodeURIComponent(k), { method: 'POST', headers: { 'content-type': l.blob.type || 'audio/webm' }, body: l.blob });
        feitas.push({ id, audio: k, duracao: l.duracao }); }
    } catch (e) { aviso(e.message, 'erro'); }
    if (feitas.length) { try { const r = await Nuvem.acao({ acao: 'falas', id: P.id, falas: feitas }); // uma gravação do prep.json para todas
        for (const x of feitas) { const f = this.acha(x.id); if (f) { f.audio = x.audio; f.duracao = x.duracao; delete f.regravar; } await DB.del('aud', P.id + '/' + x.id).catch(() => { }); }
        if (!S.sujo) { P.mod = r.mod || P.mod; S.base.mod = P.mod; } S.lista = null; aviso(`${feitas.length} gravaç${feitas.length === 1 ? 'ão enviada' : 'ões enviadas'}.`, 'ok'); }
      catch (e) { aviso(e.message, 'erro'); } }
    this.pinta(this.c);
  },
};

/* ---------- aba Legendas ---------- */
function pintaLegendas(c) {
  const P = S.P, ps = Roteiro.personagens(P.partes), ed = pode('organizar'); P.legenda = P.legenda || { ativa: true, cores: {} };
  c.innerHTML = `<div class="leg"><label class="liga"><input type="checkbox" ${P.legenda.ativa ? 'checked' : ''} ${ed ? '' : 'disabled'}> Legendas ligadas neste roteiro</label>
    <p class="dica">A cor vale pelo nome do personagem, sem diferenciar maiúscula e minúscula ("Problems" = "PROBLEMS"). Cores novas ficam salvas para os próximos roteiros.</p>
    <div class="lista">${ps.map((p, i) => { const cor = corOuPadrao(p.nome, i); return `<div class="lin"><input type="color" value="${cor}" data-k="${esc(p.chave)}" ${ed ? '' : 'disabled'}><b>${esc(p.nome)}</b><span class="previa" style="color:${cor}">${esc(P.partes.flatMap(x => x.falas).find(f => Roteiro.chave(f.personagem) === p.chave)?.texto.slice(0, 60) || '')}</span>${S.cores?.[p.chave] ? '<small class="dica">cor salva</small>' : ''}</div>`; }).join('') || '<div class="vazio">Sem personagens ainda.</div>'}</div>
    ${ed && ps.length ? `<button class="bt pri" data-salva>${ic('ok', 15)} Salvar as cores</button>` : ''}</div>`;
  const liga = $('.liga input', c), cores = () => Object.fromEntries($$('input[type=color]', c).map(i => [i.dataset.k, i.value]));
  $$('input[type=color]', c).forEach(i => i.oninput = () => { i.parentElement.querySelector('.previa').style.color = i.value; });
  const salva = async () => { P.legenda = { ativa: liga.checked, cores: cores() };
    if (P.novo || S.sujo) { S.cores = { ...(S.cores || {}), ...P.legenda.cores }; marcaSujo(); return aviso('Vai junto quando mandar para a nuvem.', 'info'); }
    try { const r = await Nuvem.acao({ acao: 'legenda', id: P.id, ...P.legenda }); P.mod = r.mod || P.mod; S.base.mod = P.mod; S.cores = r.cores || { ...(S.cores || {}), ...P.legenda.cores }; aviso('Cores salvas.', 'ok'); pintaLegendas(c); } catch (e) { aviso(e.message, 'erro'); } };
  liga.onchange = salva; $('[data-salva]', c)?.addEventListener('click', salva);
}

/* ---------- aba Cores das legendas (todas as que a equipe já usou) ---------- */
async function pintaCores() {
  const el = tela(); el.innerHTML = `<section class="inicio"><div class="cab"><h1>Cores das legendas</h1></div><p class="dica">Cada personagem tem uma cor, pelo nome (sem diferenciar maiúscula e minúscula). Os roteiros novos já começam com estas cores.</p><div class="leg"><div class="lista"><div class="vazio">Carregando…</div></div></div></section>`;
  try { S.cores = await Nuvem.cores() || {}; } catch (e) { $('.lista', el).innerHTML = `<div class="vazio erro">${esc(e.message)}</div>`; return; }
  const ed = pode('organizar'), lista = $('.lista', el), pintaL = () => {
    lista.innerHTML = Object.entries(S.cores).sort().map(([k, c]) => `<div class="lin"><input type="color" value="${esc(c)}" data-k="${esc(k)}" ${ed ? '' : 'disabled'}><b>${esc(k)}</b><span class="previa" style="color:${esc(c)}">Exemplo de legenda</span></div>`).join('') || '<div class="vazio">Nenhuma cor salva ainda.</div>';
    if (ed) lista.appendChild(h(`<div class="lin nova"><input type="color" value="#19f0f0"><input class="txt" placeholder="Nome do personagem" maxlength="40"><button class="bt pri">${ic('mais', 15)} Salvar</button></div>`));
    $$('input[type=color][data-k]', lista).forEach(i => i.onchange = () => manda({ [i.dataset.k]: i.value }));
    const nv = $('.nova', lista); if (nv) $('button', nv).onclick = () => { const n = Roteiro.chave($('.txt', nv).value); if (!n) return aviso('Escreva o nome do personagem.', 'info'); manda({ [n]: $('input[type=color]', nv).value }); };
  };
  const manda = async cores => { try { const r = await Nuvem.acao({ acao: 'cores', cores }); S.cores = r.cores || { ...S.cores, ...cores }; aviso('Cor salva.', 'ok'); pintaL(); } catch (e) { aviso(e.message, 'erro'); } };
  pintaL();
}

/* ---------- aba Ideias (mesmos dados das Ideias do Animador: /ideias → ideias/*.json) ---------- */
const Ideias = {
  S: null,
  async pinta(novo) {
    const el = tela(); el.innerHTML = `<section class="inicio"><div class="cab"><h1>Ideias</h1><span class="esp"></span>${pode('ideias') ? `<button class="bt" data-an title="Pede de novo a análise dos canais de referência">${ic('atualizar')} Atualizar análise</button><button class="bt pri" data-nova>${ic('mais')} Nova ideia</button>` : ''}</div>
      <p class="dica analise"></p><div class="ids grade"><div class="vazio">Carregando…</div></div></section>`;
    try { if (!this.S || novo) this.S = await Nuvem.pede('/ideias'); } catch (e) { $('.ids', el).innerHTML = `<div class="vazio erro">${esc(e.message)}</div>`; return; }
    const A = this.S.analise, I = this.S.ideias || { lista: [] };
    $('.analise', el).textContent = A ? `Análise dos canais de ${quando(A.em)}${this.S.canais?.length ? ' · ' + this.S.canais.join(', ') : ''}${I.padroes?.length ? ' — ' + I.padroes.slice(0, 3).join(' · ') : ''}` : 'Ainda não há análise dos canais.';
    $('[data-an]', el)?.addEventListener('click', async e => { e.currentTarget.disabled = true; try { const r = await Nuvem.json('/ideias', 'POST', { acao: 'atualizar', canais: this.S.canais || [] }); aviso(r.ja ? 'A análise já foi pedida há pouco.' : 'Análise pedida. Ela chega em alguns minutos.', 'ok'); } catch (er) { aviso(er.message, 'erro'); } });
    $('[data-nova]', el)?.addEventListener('click', () => this.edita(null));
    const g = $('.ids', el); g.innerHTML = I.lista?.length ? '' : '<div class="vazio">Nenhuma ideia ainda.</div>';
    for (const x of I.lista || []) {
      const c = h(`<div class="cartao ideia"><span class="st">${x.formato === 'longo' ? 'Vídeo longo' : 'Short'}</span><b>${esc(x.titulo)}</b>${x.gancho ? `<small class="gancho">“${esc(x.gancho)}”</small>` : ''}<small>${esc(x.resumo || '')}</small>
        <div class="bts">${pode('roteiro') ? `<button class="bt pri" data-rot>${ic('doc', 14)} Virar roteiro</button>` : ''}${pode('ideias') ? `<button class="bt" data-ed>Editar</button><button class="bt ic" data-del title="Tirar esta ideia">${ic('lixo', 14)}</button>` : ''}</div></div>`);
      $('[data-rot]', c)?.addEventListener('click', () => { const t = `// Ideia: ${x.titulo}${x.resumo ? '\n// ' + x.resumo : ''}${x.gancho ? '\n// Gancho: ' + x.gancho : ''}\n\n## ${x.titulo} parte 1\n`; S.aba = 'roteiros'; $$('[data-aba]').forEach(b => b.classList.toggle('on', b.dataset.aba === 'roteiros')); abrePrep(novoPrep(String(x.titulo).slice(0, 80), t)); });
      $('[data-ed]', c)?.addEventListener('click', () => this.edita(x));
      $('[data-del]', c)?.addEventListener('click', async () => { if (!await pergunta('Tirar esta ideia?', x.titulo, [['Cancelar', false], ['Tirar', true, 'perigo']])) return; I.lista = I.lista.filter(y => y !== x); this.guarda(I); });
      g.appendChild(c);
    }
  },
  edita(x) {
    const el = h(`<div class="modal"><div class="caixa larga"><b>${x ? 'Editar ideia' : 'Nova ideia'}</b>
      <label>Título<input data-t maxlength="140" value="${esc(x?.titulo || '')}"></label>
      <label>Formato<select data-f><option value="short">Short</option><option value="longo" ${x?.formato === 'longo' ? 'selected' : ''}>Vídeo longo</option></select></label>
      <label>Gancho (primeira fala ou imagem)<input data-g maxlength="240" value="${esc(x?.gancho || '')}"></label>
      <label>Resumo<textarea data-r rows="4" maxlength="800">${esc(x?.resumo || '')}</textarea></label>
      <div class="bts"><button class="bt" data-c>Cancelar</button><button class="bt pri" data-s>Salvar</button></div></div></div>`);
    document.body.appendChild(el); $('[data-t]', el).focus(); $('[data-c]', el).onclick = () => el.remove();
    $('[data-s]', el).onclick = () => { const t = $('[data-t]', el).value.trim(); if (!t) return aviso('Escreva o título.', 'info');
      const I = this.S.ideias || (this.S.ideias = { lista: [] }); I.lista = I.lista || [];
      const o = { formato: $('[data-f]', el).value, titulo: t, gancho: $('[data-g]', el).value.trim(), resumo: $('[data-r]', el).value.trim() };
      if (x) Object.assign(x, o); else I.lista.unshift({ id: 'ide' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...o, porque: '', personagens: [] });
      el.remove(); this.guarda(I); };
  },
  async guarda(I) { I.em = new Date().toISOString(); try { await Nuvem.json('/ideias', 'PUT', { ideias: I }); aviso('Ideias salvas.', 'ok'); } catch (e) { aviso(e.message, 'erro'); } this.pinta(); },
};

/* ======================= começo ======================= */
$$('[data-aba]').forEach(b => b.onclick = async () => { if (S.P && !await sairDoPrep()) return; trocaAba(b.dataset.aba); });
addEventListener('beforeunload', e => { if (S.sujo) { e.preventDefault(); e.returnValue = ''; } });
addEventListener('DOMContentLoaded', () => window.EstudioConta?.espaco?.registrar?.({
  programa: 'Preparativos',
  async listar() { const out = [];
    try { for (const [k, v] of await DB.todos('rasc')) out.push({ nome: v.P?.nome || k, bytes: JSON.stringify(v).length, data: v.em, info: 'rascunho do roteiro', rotuloBaixar: 'Baixar .preparativos', baixar: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(v.P, null, 1)], { type: 'application/json' })); a.download = (v.P?.nome || 'roteiro').replace(/[^\w\- ]+/g, '_') + '.preparativos'; a.click(); }, apagar: () => DB.del('rasc', k) });
      for (const [k, v] of await DB.todos('aud')) out.push({ nome: 'Gravação ' + k.split('/')[1], bytes: v.blob?.size || 0, data: v.em, info: 'falta enviar', rotuloBaixar: 'Baixar áudio', baixar: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(v.blob); a.download = k.replace('/', '_') + '.webm'; a.click(); }, apagar: () => DB.del('aud', k) }); } catch { }
    return out; },
}));
(async () => {
  try { S.eu = await window.EstudioLogin?.pronto; } catch { }
  const q = new URLSearchParams(location.search), id = q.get('id'), aba = q.get('aba');
  if (aba === 'ideias' || aba === 'cores') return trocaAba(aba);
  if (id && /^[A-Za-z0-9_-]{2,40}$/.test(id)) { try { return abrePrep(await Nuvem.abre(id)); } catch { const r = await DB.get('rasc', id).catch(() => null); if (r?.P) return abrePrep(r.P, r.base); } }
  pintaInicio();
})();
