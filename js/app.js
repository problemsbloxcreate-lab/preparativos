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
  play: '<path d="M8 5.2v13.6a.6.6 0 0 0 .9.5l10.6-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5z" fill="currentColor" stroke="none"/>', parar: '<rect x="6" y="6" width="12" height="12" rx="2"/>', lixo: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  nuvem: '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/>', enviar: '<path d="M12 16V5M7 10l5-5 5 5M5 19h14"/>', ok: '<path d="M5 12l5 5 9-10"/>',
  doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>', atualizar: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>', organizar: '<path d="M4 6h10M4 12h16M4 18h7"/><path d="M17 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
  luz: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>', pessoa: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  alerta: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  pc: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>', coment: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  copiar: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  pasta: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', mais3: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  junto: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0"/>', camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  grade: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  lapis: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>', play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',
  mover: '<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
  celular: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>', filme: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M3 15h18M8 5v4M16 5v4M8 15v4M16 15v4"/>',
  grafico: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  desfazer: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>', refazer: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  titulo: '<path d="M6 4v16M18 4v16M6 12h12"/>', baixo: '<path d="M6 9l6 6 6-6"/>', ajuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 1-1 1.7M12 17v.5"/>', legenda: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 14h4M13 14h4M7 10h10"/>',
};
// CARREGANDO: as bolinhas girando do Windows 10 (em tudo que carrega, pedido da dona)
const giro = (txt = '') => `<span class="w10" role="progressbar" aria-label="${esc(txt || 'Carregando')}"><i></i><i></i><i></i><i></i><i></i></span>${txt ? `<span class="w10-t">${esc(txt)}</span>` : ''}`;
const giroBloco = (txt = 'Carregando') => `<div class="vazio carregando">${giro(txt)}</div>`;
// ícone do ATELIÊ (o mesmo do menu e do Animador) onde a escolha vem de lá
const icAt = (px = 16) => window.EstudioIcones ? `<span class="ic-at">${window.EstudioIcones.svg('at', px)}</span>` : '';
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
let avisouBanco = 0;
function avisoBanco() { if (Date.now() - avisouBanco < 60e3) return; avisouBanco = Date.now(); aviso('Outra aba do Preparativos está segurando o que fica guardado neste computador (rascunhos e gravações). Feche ou recarregue as outras abas do Preparativos.', 'erro', 9000); }
const DB = {
  _db: null,
  // abre SEM pedir versão (pedir uma versão nova trava enquanto outra aba do Preparativos estiver aberta); cada aba fecha quando outra precisar
  // e não fica esperando para sempre: se outra aba segura o banco, em 4 s avisa e segue (o resto do programa funciona)
  abre() { return this._db || (this._db = new Promise((ok, no) => { const t = setTimeout(() => { this._db = null; avisoBanco(); no(new Error('O banco deste navegador está ocupado por outra aba do Preparativos.')); }, 4000);
    const r = indexedDB.open('ep-preparativos'); const ok0 = ok; ok = v => { clearTimeout(t); ok0(v); }; r.onupgradeneeded = () => { for (const l of ['rasc', 'aud']) if (!r.result.objectStoreNames.contains(l)) r.result.createObjectStore(l); };
    r.onsuccess = () => { const db = r.result; db.onversionchange = () => { db.close(); this._db = null; }; ok(db); }; r.onerror = () => { this._db = null; no(r.error); }; r.onblocked = () => { this._db = null; no(new Error('banco ocupado')); }; })); },
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
    if (!r.ok) { const j = await r.json().catch(() => ({})); const e = new Error(r.status === 404 ? 'Esse roteiro não existe mais (foi apagado).' : j.error?.message || 'Não consegui abrir este roteiro da nuvem.'); e.status = r.status; throw e; }
    const P = await r.json(); P.mod = +r.headers.get('x-mod') || P.mod || 0; return P; },
  salva(P, forcar) { return this.pede(`/preparativos/arquivo?k=${encodeURIComponent(`preparativos/${P.id}/prep.json`)}&base=${+P.mod || 0}${forcar ? '&forcar=1' : ''}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(P) }); },
  acao(corpo) { return this.json('/preparativos/acao', 'POST', corpo); },
  cores() { return this.pede('/preparativos/arquivo?k=preparativos/cores.json').catch(e => { if (e.status === 404) return {}; throw e; }); },
  personagens() { return this.pede('/preparativos/arquivo?k=preparativos/personagens.json').catch(e => { if (e.status === 404) return {}; throw e; }); },
  _img: new Map(),
  foto(k) { if (!this._img.has(k)) this._img.set(k, this.pede('/preparativos/arquivo?k=' + encodeURIComponent(k), { blob: true }).then(b => URL.createObjectURL(b)).catch(e => { this._img.delete(k); throw e; })); return this._img.get(k); },
  _aud: new Map(),
  async audio(k) { if (!this._aud.has(k)) this._aud.set(k, this.pede('/preparativos/arquivo?k=' + encodeURIComponent(k), { blob: true }).catch(e => { this._aud.delete(k); throw e; })); return this._aud.get(k); },
};

/* ---------- estado ---------- */
const S = { aba: 'roteiros', lista: null, P: null, sub: 'roteiro', sujo: false, eu: null, cores: null, pers: null, tocando: null, ed: null };
const coresPadrao = ['#19f0f0', '#ffb04a', '#ff6b93', '#a796ff', '#4fe08f', '#ffd36b', '#7fd1ff', '#ff8f6b'];
// PERSONAGENS DA EQUIPE (preparativos/personagens.json: nome, cor, foto, grupo) + o cores.json antigo
let carregandoPers = null;
function carregaPers(novo) {
  if (S.pers && !novo) return Promise.resolve(S.pers);
  return carregandoPers || (carregandoPers = Promise.all([Nuvem.personagens().catch(() => ({})), Nuvem.cores().catch(() => ({}))]).then(([p, c]) => {
    S.cores = c || {}; S.pers = p || {}; for (const [k, v] of Object.entries(S.cores)) { if (!S.pers[k]) S.pers[k] = { nome: k, cor: v }; else if (!S.pers[k].cor) S.pers[k].cor = v; }
    Roteiro.usaConhecidos(Object.values(S.pers).map(x => x.nome)); if (S.P) S.P.partes = Roteiro.separa(S.P.roteiro || '', S.P.partes);
    return S.pers; }).finally(() => { carregandoPers = null; }));
}
const persDe = nome => S.pers?.[Roteiro.chave(nome)] || null;
const corDe = (nome, P = S.P) => { const k = Roteiro.chave(nome); return P?.legenda?.cores?.[k] || S.pers?.[k]?.cor || S.cores?.[k] || null; };
// cor padrão (sem cor salva): sai do NOME, então é a mesma em todas as telas e computadores; Problems = ciano (pedido da dona)
const corPadrao = nome => { const k = Roteiro.chave(nome); if (k === 'problems') return '#19f0f0'; let h = 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return coresPadrao[1 + h % (coresPadrao.length - 1)]; };
const corOuPadrao = nome => corDe(nome) || corPadrao(nome);
// pasta do personagem: a organização da equipe, ou a própria do roteiro aberto (se ele usa uma)
const grupoDe = (nome, P = S.P) => { const k = Roteiro.chave(nome); return (P?.org?.propria ? P.org.grupos?.[k] : S.pers?.[k]?.grupo) || ''; };
const GRUPOS_BASE = ['Principais', 'Secundários'];

function novoPrep(nome = 'Roteiro novo', texto = '') {
  return { v: 1, id: 'pr' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), nome, destino: null, status: 'rascunho', roteiro: texto, partes: Roteiro.separa(texto), legenda: { ativa: true, mostrarNome: false, cores: {} }, usadoPor: [], criado: Date.now(), mod: 0, novo: true };
}
// rascunho deste navegador (guardado a cada mudança, sem gastar a nuvem). "Trabalhar junto" (P.junto) manda sozinho 20 s depois da última mudança.
let tGuarda = 0, tJunto = 0, ultAuto = 0;
// o que conta como mudança: o conteúdo do roteiro (não a hora, o autor etc.). S.marco = como estava ao abrir / no último envio.
const assinatura = P => P ? JSON.stringify([P.nome, (P.roteiro || '').trim(), P.destino, P.status, P.legenda, P.pagina, P.org, P.animador]) : '';
const prepVazio = P => !!P?.novo && !(P.roteiro || '').trim();
// só pergunta ao sair se há mudança de verdade ainda não mandada para a nuvem
function mudouDeVerdade() { const P = S.P; if (!P || !S.sujo) return false; if (P.novo) return !prepVazio(P); return S.marco == null || assinatura(P) !== S.marco; }
function marcaSujo() {
  S.sujo = true; pintaBarraPrep(); clearTimeout(tGuarda); tGuarda = setTimeout(() => DB.put('rasc', S.P.id, { P: S.P, base: S.base, em: Date.now() }).catch(() => { }), 600);
  clearTimeout(tJunto); if (S.P?.mod && !S.P.novo && pode('roteiro')) { const falta = Math.max(8000, 15000 - (Date.now() - ultAuto)); tJunto = setTimeout(() => { if (S.sujo && S.P?.mod && !S.P.novo) { ultAuto = Date.now(); salvaPrep(null, true); } }, falta); }
}

/* ---------- QUEM: quem criou, quem editou e quem está AO VIVO (igual no Animador e no Ateliê) ----------
   No prep.json: autor = { id: 'u…' (código tirado do e-mail, nunca o e-mail), nome, foto (pequena), em } e edicoes = [ … ] (as últimas 12).
   Ao vivo: Firebase Realtime Database (o mesmo do Animador, não gasta a Cloudflare): aovivo/prep/<id>/<uid> = { i, n, f, t },
   some sozinho quando a aba fecha (onDisconnect). O início escuta aovivo/prep só enquanto está na tela. */
const Quem = {
  _eu: null,
  async eu() {
    if (this._eu) return this._eu; const p = await window.EstudioLogin?.perfil?.().catch(() => ({})) || {}, email = p.email || window.EstudioLogin?.email || '';
    return (this._eu = { id: await this.idDe(email), nome: p.nome || String(email).split('@')[0] || 'Alguém', foto: await this.miniFoto(p.foto) });
  },
  async idDe(email) { email = String(email || '').trim().toLowerCase(); if (!email) return 'anon';
    try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('estudio-problems:' + email)); return 'u' + [...new Uint8Array(b)].slice(0, 8).map(x => x.toString(16).padStart(2, '0')).join(''); } catch { return 'anon'; } },
  async miniFoto(f) { if (!f) return null; if (/^https:\/\//.test(f) && f.length < 1000) return f;
    try { const im = new Image(); im.src = f; await im.decode(); const T = 64, c = document.createElement('canvas'); c.width = c.height = T; const k = Math.max(T / im.naturalWidth, T / im.naturalHeight), w = im.naturalWidth * k, hh = im.naturalHeight * k;
      c.getContext('2d').drawImage(im, (T - w) / 2, (T - hh) / 2, w, hh); return c.toDataURL('image/jpeg', .82); } catch { return null; } },
  // ao mandar para a nuvem: quem criou fica; quem editou entra (ou sobe) na lista
  async marca(P) { const eu = await this.eu(); if (eu.id === 'anon') return; const agora = Date.now();
    if (!P.autor) P.autor = { ...eu, em: agora }; P.edicoes = [...(P.edicoes || []).filter(x => x.id !== eu.id), { ...eu, em: agora }].slice(-12); },
  // foto de uma pessoa pelo código (porteiro /pessoa, guardada nesta aba)
  _p: new Map(),
  pessoa(u) { if (!/^u[0-9a-f]{16}$/.test(u || '')) return Promise.resolve(null);
    if (!this._p.has(u)) this._p.set(u, (async () => { try { const g = JSON.parse(sessionStorage.getItem('ep-pessoa-' + u) || 'null'); if (g && Date.now() - g.t < 3600e3) return g.p; } catch { }
      try { const r = await fetch('/pessoa?u=' + encodeURIComponent(u), { credentials: 'same-origin' }); if (!r.ok) return null; const p = await r.json(); try { sessionStorage.setItem('ep-pessoa-' + u, JSON.stringify({ t: Date.now(), p })); } catch { } return p; } catch { return null; } })());
    return this._p.get(u); },
};
// bolinha de PESSOA (foto da conta; sem foto, as iniciais). data-u = carrega a foto pelo código; data-f = foto já conhecida
const pava = (x, cls = '') => x ? `<span class="pava ${cls}" title="${esc(x.nome || x.n || '')}" ${x.foto || x.f ? `style="background-image:url('${esc(x.foto || x.f)}')"` : `data-u="${esc(x.id || x.i || '')}"`}>${esc(iniciais(x.nome || x.n || '?'))}</span>` : '';
new MutationObserver(() => { for (const el of document.querySelectorAll('.pava[data-u]:not([data-u-ok])')) { el.dataset.uOk = '1'; Quem.pessoa(el.dataset.u).then(p => { if (p?.foto) { el.style.backgroundImage = `url("${p.foto}")`; el.classList.add('com-foto'); } }); } })
  .observe(document.documentElement, { childList: true, subtree: true });
const AoVivo = {
  db: null, eu: null, ouvindo: null, sala: null,
  async abre() { if (this.db) return this.db; await window.EstudioLogin?.pronto;
    if (!window.firebase?.database) await new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js'; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    this.db = firebase.app().database('https://estudio-problems-login-default-rtdb.firebaseio.com'); return this.db; },
  // entra no roteiro aberto: aparece para quem estiver nele ou no início
  async entra(id, aoMudar) { this.sai(); try { const db = await this.abre(), u = firebase.auth().currentUser; if (!u) return; const eu = await Quem.eu();
      const ref = db.ref(`aovivo/prep/${id}/${u.uid}`); await ref.onDisconnect().remove(); await ref.set({ i: eu.id, n: eu.nome, f: eu.foto || null, t: firebase.database.ServerValue.TIMESTAMP });
      this.eu = ref; this.sala = db.ref(`aovivo/prep/${id}`); this.sala.on('value', s => aoMudar?.(Object.entries(s.val() || {}).map(([k, v]) => ({ ...v, eu: k === u.uid })))); } catch { } },
  sai() { try { this.eu?.onDisconnect().cancel(); this.eu?.remove(); this.sala?.off(); } catch { } this.eu = this.sala = null; },
  // o início escuta quem está em cada roteiro (só enquanto ele está na tela)
  async ouveTudo(aoMudar) { this.paraTudo(); try { const db = await this.abre(); this.ouvindo = db.ref('aovivo/prep'); this.ouvindo.on('value', s => aoMudar?.(s.val() || {})); } catch { } },
  paraTudo() { try { this.ouvindo?.off(); } catch { } this.ouvindo = null; },
};
addEventListener('pagehide', () => AoVivo.sai());
// quem criou / editou: o resumo do cabeçalho e dos cartões
function quemHtml(autor, edicoes, curto) {
  const ed = (edicoes || []).filter(x => x && (x.id || x.i) !== (autor?.id || autor?.i)).slice(-4).reverse();
  if (!autor && !ed.length) return '';
  return `<span class="quem-l">${autor ? `${pava(autor, 'p')}<span>${curto ? '' : 'Criado por '}<b>${esc(autor.nome || autor.n)}</b></span>` : ''}${ed.length ? `<span class="quem-ed" title="Editado por ${esc(ed.map(x => x.nome || x.n).join(', '))}">${curto ? '' : '<span>editado por</span>'}${ed.map(x => pava(x, 'p')).join('')}</span>` : ''}</span>`;
}

/* ======================= telas ======================= */
const tela = () => $('#tela');
function trocaAba(a, semHist) { S.aba = a; S.P = null; $$('[data-aba]').forEach(b => b.classList.toggle('on', b.dataset.aba === a)); const alvo = a === 'roteiros' ? '' : '?aba=' + a;
  if (location.search !== alvo) history[semHist ? 'replaceState' : 'pushState'](null, '', './' + alvo); pinta(); }
async function sairDoPrep(semHist) {
  // sem mudança de verdade: sai direto; roteiro novo e vazio nem fica como rascunho
  if (S.P && S.sujo && !mudouDeVerdade()) { clearTimeout(tGuarda); clearTimeout(tJunto); const id = S.P.id, novo = S.P.novo; S.sujo = false; if (novo || S.marco != null) await DB.del('rasc', id).catch(() => { }); }
  if (S.sujo && !await pergunta('Sair sem mandar para a nuvem?', 'O que você mudou continua guardado neste computador e aparece aqui da próxima vez.', [['Ficar', false], ['Sair', true, 'pri']])) return false; S.P = null; S.sujo = false; S.ed = null; AoVivo.sai(); AoVivo.atual = null; if (!semHist) history.pushState(null, '', S.aba && S.aba !== 'roteiros' ? './?aba=' + S.aba : './'); pinta(); return true; }
function pinta() { Mic.paraTeste(); if (S.P) return pintaPrep(); modoDoc(false); AoVivo.sai(); AoVivo.paraTudo(); if (S.aba === 'ideias') return Ideias.pinta(); if (S.aba === 'personagens' || S.aba === 'cores') return pintaPersonagens(); return pintaInicio(); }
// bolinha com as iniciais do personagem, na cor dele; com foto, a foto (carrega sozinha quando a bolinha aparece)
const iniciais = n => { const p = Roteiro.norm(n).split(' ').filter(Boolean); return ((p[0]?.[0] || '?') + (p.length > 1 ? p[1][0] : (p[0]?.[1] || ''))).toUpperCase(); };
// cor da letra sobre um fundo: fundo escuro → branca, fundo claro → quase preta (luminância relativa, WCAG)
const txSobre = c => { const m = /^#?([0-9a-f]{6})$/i.exec(String(c || '').trim()); if (!m) return '#111'; const n = parseInt(m[1], 16), L = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }), Y = .2126 * L[0] + .7152 * L[1] + .0722 * L[2];
  return (1.05 / (Y + .05)) > ((Y + .05) / .05) ? '#ffffff' : '#111111'; };
const ava = (nome, cor, tam = '') => { const f = persDe(nome)?.foto; return `<span class="ava ${tam}" style="--c:${cor};--tx:${txSobre(cor)}" title="${esc(nome)}"${f ? ` data-foto="${esc(f)}"` : ''}>${esc(iniciais(nome))}</span>`; };
new MutationObserver(() => { for (const el of document.querySelectorAll('.ava[data-foto]:not([data-foto-ok])')) { el.dataset.fotoOk = '1'; Nuvem.foto(el.dataset.foto).then(u => { el.style.backgroundImage = `url("${u}")`; el.classList.add('com-foto'); }).catch(() => { }); } })
  .observe(document.documentElement, { childList: true, subtree: true });
const icProg = d => ({ animador: 'an', shorts: 'sh', editor: 'ed' }[d]);
const progIc = (d, px = 18) => window.EstudioIcones && icProg(d) ? window.EstudioIcones.svg(icProg(d), px) : ic('doc', px);
const anel = (pct, tam = 44) => { const r = 16, L = 2 * Math.PI * r; return `<svg class="anel" width="${tam}" height="${tam}" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${r}" fill="none" stroke="currentColor" stroke-opacity=".14" stroke-width="4"/><circle cx="20" cy="20" r="${r}" fill="none" stroke="var(--ok)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(pct / 100 * L).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 20 20)"/><text x="20" y="24" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">${pct}%</text></svg>`; };

/* ---------- início: lista dos roteiros ---------- */
// ONDE: neste computador · na nuvem · em uso (um programa já usou) — e a SITUAÇÃO (rascunho, gravando, pronto); filtros com ícones
let filtro = 'todos', filtroOnde = 'tudo';
const ST_IC = { todos: 'grade', rascunho: 'lapis', gravando: 'mic', pronto: 'ok' };
// monta a tela nova FORA da página e troca de uma vez só, sem piscar; se demorar mais de 0,35 s, mostra o carregando no lugar
function telaNova() { const alvo = tela(), el = document.createElement('div'); el.className = 'tela-in';
  const t = setTimeout(() => { if (!el.isConnected) alvo.replaceChildren(h(`<div class="tela-in">${giroBloco()}</div>`)); }, 350);
  return { el, mostra: () => { clearTimeout(t); if (!el.isConnected) alvo.replaceChildren(el); }, cancela: () => clearTimeout(t) }; }
// TELA DE ROTEIROS (pedido da dona, 06/11): filtros em cima (onde está + situação), "continuar de onde parou", PASTAS em cartões
// (como o Animador: clicar abre, "‹ Roteiros" volta, arrastar um roteiro para cima de uma pasta) e "fora de pastas". Seção vazia não aparece.
// As pastas são da equipe toda: preparativos/pastas.json = { ordem: [nome…], de: { <id do roteiro>: nome } } (ação "pastas").
let pastaRot = null; try { pastaRot = localStorage.getItem('ep-prep-rot-pasta') || null; } catch { }
const abrePastaRot = g => { pastaRot = g || null; try { pastaRot ? localStorage.setItem('ep-prep-rot-pasta', pastaRot) : localStorage.removeItem('ep-prep-rot-pasta'); } catch { } pintaInicio(); window.scrollTo({ top: 0 }); };
async function pastasRot(novo) { if (S.pastasR && !novo) return S.pastasR; try { const r = await Nuvem.pede('/preparativos/arquivo?k=' + encodeURIComponent('preparativos/pastas.json')); S.pastasR = r && typeof r === 'object' ? { ordem: r.ordem || [], de: r.de || {} } : { ordem: [], de: {} }; } catch { S.pastasR = S.pastasR || { ordem: [], de: {} }; } return S.pastasR; }
async function mudaPastasRot(o, msg) { try { const r = await Nuvem.acao({ acao: 'pastas', ...o }); S.pastasR = r.pastas || S.pastasR; if (msg) aviso(msg, 'ok'); } catch (e) { aviso(e.message, 'erro'); } pintaInicio(); }
async function pintaInicio(novo) {
  const ONDES = [['tudo', 'Tudo', 'grade'], ['pc', 'Neste computador', 'pc'], ['nuvem', 'Na nuvem', 'nuvem'], ['uso', 'Em uso', 'play']], ed = pode('roteiro');
  const T = telaNova(), el = T.el; el.innerHTML = `<section class="inicio">
    <div class="cab topo-ini"><span class="cab-ic t-rot">${ic('doc', 24)}</span><div class="cab-txt"><h1>Roteiros</h1><p>Escreva, separe as falas de cada personagem e grave.</p></div><span class="esp"></span><button class="bt ic" data-at title="Buscar de novo">${ic('atualizar')}</button>${ed ? `<button class="bt" data-pnova>${ic('pasta', 15)} Pasta nova</button><button class="bt pri grande" data-novo>${ic('mais', 18)} Novo roteiro</button>` : ''}</div>
    <div class="filtros-ini">
      <div class="seg" role="group" aria-label="Onde">${ONDES.map(([k, n, i]) => `<button data-onde="${k}" class="${filtroOnde === k ? 'on' : ''}">${ic(i, 15)} ${n}<b class="n" data-n="${k}"></b></button>`).join('')}</div>
      <div class="chips-st" role="group" aria-label="Situação">${[['todos', 'Todas as situações'], ...PREP_CONFIG.status].map(([k, n]) => `<button data-f="${k}" class="st-${k} ${filtro === k ? 'on' : ''}">${ic(ST_IC[k], 14)} ${esc(n)}</button>`).join('')}</div>
    </div>
    <div class="rot-corpo">${giroBloco()}</div></section>`;
  $('[data-at]', el).onclick = () => { S.lista = null; S.pastasR = null; pintaInicio(true); };
  $('[data-novo]', el)?.addEventListener('click', () => abrePrep(novoPrep()));
  $('[data-pnova]', el)?.addEventListener('click', async () => { const g = await pastaNova(); if (g) mudaPastasRot({ nova: g }, `Pasta "${g}" criada. Arraste roteiros para ela.`); });
  $$('[data-f]', el).forEach(b => b.onclick = () => { filtro = b.dataset.f; pintaInicio(); });
  $$('[data-onde]', el).forEach(b => b.onclick = () => { filtroOnde = b.dataset.onde; pintaInicio(); });
  await carregaPers().catch(() => { });
  // TODOS os roteiros numa lista só (o que tem mudança só aqui fica uma vez, com o selo "termina de salvar ao abrir")
  const todos = [], doPc = new Set(); let erro = '';
  try { for (const r of (await DB.todos('rasc')).map(([, v]) => v).filter(v => v?.P?.id).sort((a, b) => b.em - a.em)) { if (prepVazio(r.P)) { DB.del('rasc', r.P.id).catch(() => { }); continue; } doPc.add(r.P.id); todos.push({ it: r.P, onde: r.P.novo || !r.base?.mod ? 'pc' : 'mudou', t: r.em || 0, abre: () => abrePrep(r.P, r.base) }); } } catch { }
  try { if (!S.lista || novo) S.lista = (await Nuvem.lista()).itens || []; } catch (e) { erro = e.message; }
  const PR = await pastasRot(novo);
  for (const it of S.lista || []) if (!doPc.has(it.id)) todos.push({ it, onde: it.uso?.length ? 'uso' : 'nuvem', t: it.mod || 0, abre: () => Nuvem.abre(it.id).then(abrePrep) });
  todos.sort((a, b) => b.t - a.t);
  const naOnde = (x, k) => k === 'tudo' || (k === 'pc' ? x.onde === 'pc' || x.onde === 'mudou' : k === 'nuvem' ? x.onde === 'nuvem' || x.onde === 'mudou' : x.onde === 'uso');
  for (const [k] of ONDES) $(`[data-n="${k}"]`, el).textContent = todos.filter(x => naOnde(x, k)).length || '';
  const L = todos.filter(x => naOnde(x, filtroOnde) && (filtro === 'todos' || (x.it.status || 'rascunho') === filtro));
  const pastaDe = x => PR.de[x.it.id] || '', pastas = [...new Set([...PR.ordem, ...Object.values(PR.de)])].filter(Boolean);
  if (pastaRot && !pastas.includes(pastaRot)) pastaRot = null;
  const corpo = $('.rot-corpo', el), grade = arr => { const g = h('<div class="grade"></div>'); for (const x of arr) g.appendChild(liga(x)); return g; };
  const liga = x => { const c = cartao(x.it, x.onde); c.onclick = async () => { c.classList.add('carregando'); c.insertAdjacentHTML('beforeend', `<span class="cartao-giro">${giro()}</span>`); try { await x.abre(); } catch (e) { aviso(e.message, 'erro'); c.classList.remove('carregando'); $('.cartao-giro', c)?.remove(); } };
    if (ed) { c.draggable = true; c.ondragstart = e => { e.dataTransfer.setData('text/rot-prep', x.it.id); e.dataTransfer.effectAllowed = 'move'; c.classList.add('arrastando'); }; c.ondragend = () => c.classList.remove('arrastando'); }
    c.oncontextmenu = e => { if (!ed) return; e.preventDefault(); const atual = pastaDe(x);
      popMenu(e, [...(x.onde === 'nuvem' || x.onde === 'uso' ? [[`${ic('pc', 14)} Tirar da nuvem e manter neste computador…`, '', () => tiraDaNuvem(x.it.id)], '-'] : []),...pastas.map(g => [`${ic('pasta', 14)} Mover para ${esc(g)}`, atual === g ? '✓' : '', () => mudaPastasRot({ mover: { [x.it.id]: g } }, `"${x.it.nome || 'Roteiro'}" foi para ${g}.`), atual === g]),
        [`${ic('pasta', 14)} Tirar da pasta`, !atual ? '✓' : '', () => mudaPastasRot({ mover: { [x.it.id]: null } }, 'Saiu da pasta.'), !atual],
        [`${ic('mais', 14)} Pasta nova com este roteiro…`, '', async () => { const g = await pastaNova(); if (g) mudaPastasRot({ mover: { [x.it.id]: g } }, `"${x.it.nome || 'Roteiro'}" foi para ${g}.`); }]]); };
    return c; };
  const alvo = (a, g) => { if (!ed) return; a.ondragover = e => { if (!e.dataTransfer.types.includes('text/rot-prep')) return; e.preventDefault(); a.classList.add('alvo'); }; a.ondragleave = e => { if (!a.contains(e.relatedTarget)) a.classList.remove('alvo'); };
    a.ondrop = e => { e.preventDefault(); a.classList.remove('alvo'); const id = e.dataTransfer.getData('text/rot-prep'); if (!id || (PR.de[id] || '') === (g || '')) return; mudaPastasRot({ mover: { [id]: g || null } }, g ? `Foi para ${g}.` : 'Saiu da pasta.'); }; };
  const menuPasta = (e, g) => popMenu(e, [[`${ic('pasta', 14)} Abrir a pasta`, '', () => abrePastaRot(g)], '-',
    [`${ic('lapis', 14)} Renomear…`, '', async () => { const nn = ((await pedeTexto('Renomear a pasta', `Novo nome para "${g}"`, 40)) || '').trim(); if (nn && nn !== g) { if (pastaRot === g) { pastaRot = nn; try { localStorage.setItem('ep-prep-rot-pasta', nn); } catch { } } mudaPastasRot({ renomear: { de: g, para: nn } }, `Pasta renomeada para ${nn}.`); } }, !ed],
    [`${ic('lixo', 14)} Apagar a pasta (os roteiros ficam)`, '', async () => { if (await pergunta(`Apagar a pasta "${g}"?`, 'Os roteiros dela vão para "Fora de pastas". Nenhum roteiro é apagado.', [['Cancelar', false], ['Apagar a pasta', true, 'perigo']])) { if (pastaRot === g) abrePastaRot(null); mudaPastasRot({ apagar: g }, `Pasta "${g}" apagada.`); } }, !ed]]);
  corpo.innerHTML = '';
  if (erro) corpo.appendChild(h(`<div class="vazio erro">${esc(erro)}</div>`));
  if (pastaRot) { // ---- DENTRO DE UMA PASTA ----
    const D = L.filter(x => pastaDe(x) === pastaRot), top = h(`<div><nav class="pb-cam"><button class="pb-volta" data-volta title="Voltar · solte um roteiro aqui para tirar desta pasta">${ic('voltar', 14)} Roteiros</button><span aria-hidden="true">›</span><b>${esc(pastaRot)}</b></nav>
      <div class="pb-abre-t"><span class="pb-ic">${ic('pasta', 20)}</span><h2>${esc(pastaRot)}</h2><small>${D.length} ${D.length === 1 ? 'roteiro' : 'roteiros'}</small><span class="esp"></span>${ed ? `<button class="bt ic" data-mn title="Opções da pasta">${ic('mais3', 16)}</button>` : ''}</div></div>`);
    $('[data-volta]', top).onclick = () => abrePastaRot(null); alvo($('[data-volta]', top), ''); $('[data-mn]', top)?.addEventListener('click', e => menuPasta(e.currentTarget, pastaRot));
    corpo.appendChild(top); corpo.appendChild(D.length ? grade(D) : h(`<div class="pb-vazia">${todos.some(x => pastaDe(x) === pastaRot) ? 'Nada nesta pasta com esses filtros.' : 'Pasta vazia. Volte e arraste roteiros para o cartão desta pasta (ou botão direito no roteiro › Mover para…).'}</div>`));
  } else {
    const fora = L.filter(x => !pastaDe(x) || !pastas.includes(pastaDe(x)));
    if (L.length > 6) { corpo.appendChild(h(`<h3 class="pb-h">Continuar de onde parou</h3>`)); corpo.appendChild(grade(L.slice(0, 4))); }
    if (pastas.length) { corpo.appendChild(h(`<h3 class="pb-h">Pastas <small>clique para abrir · arraste um roteiro para cima de uma pasta</small></h3>`));
      const cards = h('<div class="pb-cards"></div>');
      for (const g of pastas) { const D = L.filter(x => pastaDe(x) === g), tot = todos.filter(x => pastaDe(x) === g).length, c = h(`<div class="pb-card" role="button" tabindex="0" title="Abrir a pasta · botão direito: opções"><div class="pb-prev pb-prev-r">${D.slice(0, 3).map(x => `<span class="st st-${esc(x.it.status || 'rascunho')}">${ic(ST_IC[x.it.status || 'rascunho'] || 'lapis', 11)} ${esc(STATUS[x.it.status || 'rascunho'] || '')}</span>`).join('') || `<span class="pb-vz">${ic('pasta', 34)}</span>`}</div>
          <div class="pb-info"><b>${esc(g)}</b><small>${D.length}${D.length !== tot ? ' de ' + tot : ''}</small>${ed ? `<button class="pb-mn" title="Opções da pasta">${ic('mais3', 15)}</button>` : ''}</div><small class="pb-desc">${D.length ? esc(D.slice(0, 3).map(x => x.it.nome || 'Sem nome').join(', ') + (D.length > 3 ? '…' : '')) : tot ? 'Nada com esses filtros' : 'Pasta vazia'}</small></div>`);
        c.onclick = e => { if (!e.target.closest('.pb-mn')) abrePastaRot(g); }; c.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrePastaRot(g); } };
        $('.pb-mn', c)?.addEventListener('click', e => { e.stopPropagation(); menuPasta(e.currentTarget, g); }); c.oncontextmenu = e => { e.preventDefault(); menuPasta(e, g); }; alvo(c, g); cards.appendChild(c); }
      corpo.appendChild(cards); }
    if (fora.length) { corpo.appendChild(h(`<h3 class="pb-h">${pastas.length ? 'Fora de pastas' : 'Todos os roteiros'} <small>${fora.length}</small></h3>`)); corpo.appendChild(grade(fora)); }
    if (!L.length && !erro) corpo.appendChild(h(`<div class="vazio">${todos.length ? 'Nenhum roteiro com esses filtros.' : 'Ainda não há roteiros. Clique em "Novo roteiro".'}</div>`));
  }
  if (S.P || (S.aba && S.aba !== 'roteiros')) return T.cancela(); // a pessoa já foi para outra aba (ou abriu um roteiro) enquanto carregava: não cobre a tela
  T.mostra();
  // AO VIVO: quem está com cada roteiro aberto agora (some sozinho quando a pessoa fecha)
  // (a mesma presença do Firebase que já existia: sem pedido novo à nuvem e sem consultar em intervalo)
  AoVivo.ouveTudo(m => { if (!el.isConnected || S.P) return AoVivo.paraTudo(); $$('.cartao[data-vivo]', el).forEach(card => { const g = Object.values(m[card.dataset.vivo] || {}), q = $('.quem-c', card); if (!q) return;
    card.classList.toggle('ao-vivo', !!g.length);
    q.innerHTML = g.length ? `<span class="quem-l quem-vivo" title="Com o roteiro aberto agora: ${esc(g.map(x => x.n).join(', '))}"><span class="vivo-fotos">${g.slice(0, 4).map(x => pava(x, 'p vivo')).join('')}</span><span><b>${esc(g[0].n || 'Alguém')}</b>${g.length > 1 ? ` e mais ${g.length - 1}` : ''}</span></span>` : q.dataset.quemOrig || ''; }); });
}
// onde: 'pc' (só neste computador) | 'mudou' (na nuvem, com mudanças só aqui) | 'nuvem' | 'uso' (um programa já usou)
function cartao(it, onde) {
  const fs = Array.isArray(it.partes) ? it.partes.flatMap(p => p.falas || []) : null;
  const n = fs ? fs.length : it.n || 0, g = fs ? fs.filter(f => f.audio).length : it.g || 0, np = Array.isArray(it.partes) ? it.partes.length : it.partes || 0;
  const pers = fs ? Roteiro.personagens(it.partes).map(p => p.nome) : it.pers || [], pct = n ? Math.round(g / n * 100) : 0, st = it.status || 'rascunho';
  const uso = onde === 'uso' ? (it.uso || []) : [];
  const ONDE = { pc: `${ic('pc', 13)} Neste computador`, mudou: `${ic('nuvem', 13)} Na nuvem · termina de salvar ao abrir`, nuvem: `${ic('nuvem', 13)} Na nuvem`, uso: `${ic('play', 13)} Em uso` };
  const autor = it.autor || (it.quem?.a ? { id: it.quem.a.i, nome: it.quem.a.n } : null), eds = it.edicoes || (it.quem?.e || []).map(x => ({ id: x.i, nome: x.n }));
  return h(`<button class="cartao ${esc(st)}" data-id="${esc(it.id || '')}" data-vivo="${esc(it.id || '')}"><div class="topo"><span class="st st-${esc(st)}">${ic(ST_IC[st] || 'lapis', 12)} ${esc(STATUS[st] || 'Rascunho')}</span><span class="onde o-${onde}">${ONDE[onde]}</span></div>
    <div class="meio"><div><b>${esc(it.nome || 'Sem nome')}</b><small>${np} parte${np === 1 ? '' : 's'} · ${n} fala${n === 1 ? '' : 's'}</small></div></div>
    <div class="grav ${n && g === n ? 'todas' : ''}" title="${g} de ${n} falas já têm áudio gravado">${ic(n && g === n ? 'ok' : 'mic', 14)}<span>${!n ? 'ainda sem falas' : g === n ? 'todas as falas gravadas' : `<b>${g}</b> de <b>${n}</b> falas gravadas`}</span><div class="barra"><i style="width:${pct}%"></i></div></div>
    <div class="elenco">${pers.slice(0, 6).map(p => ava(p, corOuPadrao(p), 'p')).join('')}${pers.length > 6 ? `<span class="mais">+${pers.length - 6}</span>` : ''}</div>
    <div class="quem-c" data-quem-orig="${esc(quemHtml(autor, eds, true))}">${quemHtml(autor, eds, true)}</div>
    ${uso.length ? `<div class="usos">${uso.map(u => `<span class="uso">${progIc(u, 16)} usado no ${esc(DESTINOS[u] || u)}</span>`).join('')}</div>` : ''}
    <small class="mt">${it.destino ? `${progIc(it.destino, 14)} vai para o ${esc(DESTINOS[it.destino] || it.destino)} · ` : ''}${onde === 'nuvem' || onde === 'uso' ? 'mudado ' + esc(quando(it.mod)) : 'guardado aqui'}</small></button>`);
}

/* ---------- um preparativo ---------- */
// para que serve cada etapa (aparece embaixo do cabeçalho e no "title" dos botões)
const ETAPA_TIT = { rascunho: 'Ainda escrevendo o roteiro', gravando: 'Roteiro fechado: cada pessoa grava as falas do seu personagem', pronto: 'Tudo certo: o programa de destino já pode usar' };
const ETAPA_DICA = P => { const st = P.status || 'rascunho', d = DESTINOS[P.destino];
  if (st === 'rascunho') return `<b>Rascunho</b> · escreva e arrume o roteiro. Quando as falas estiverem certas, passe para <b>Gravando</b>.`;
  if (st === 'gravando') return `<b>Gravando</b> · cada pessoa abre "Falas e gravação", escolhe o seu personagem e grava. Quando tudo estiver gravado, marque <b>Pronto</b>.`;
  return `<b>Pronto</b> · ${d ? `já aparece para o <b>${esc(d)}</b> usar (as falas, os áudios e as cores das legendas vão juntos).` : 'escolha para qual programa ele vai.'}`; };
async function abrePrep(P, base, semHist) {
  // tem rascunho deste computador mais novo que o da nuvem?
  if (!base && !P.novo) { try { const r = await DB.get('rasc', P.id); if (r?.P && (+r.base?.mod || 0) === (+P.mod || 0) && r.em > (P.mod || 0)) { const usar = await pergunta('Continuar de onde parou?', 'Este computador tem mudanças neste roteiro que ainda não foram para a nuvem.', [['Abrir o da nuvem', false], ['Continuar daqui', true, 'pri']]); if (usar) { base = r.base; P = r.P; } else await DB.del('rasc', P.id); } } catch { } }
  Varios.usa(P); try { P.partes = Roteiro.separa(P.roteiro || '', P.partes); } catch { } S.P = P; S.base = base || { mod: P.mod || 0, roteiro: P.roteiro || '' }; S.sujo = !!base || !!P.novo; S.marco = base ? null : assinatura(P); S.sub = pode('roteiro') || pode('organizar') ? (S.sub || 'roteiro') : 'falas'; S.ed = null;
  if (!S.pers) carregaPers().then(() => { if (S.P) { S.ed?.repinta(); pintaLado(); if (S.sub !== 'roteiro') pintaCorpo(); } }).catch(() => { S.pers = {}; });
  if (!S.nomeEu) window.EstudioLogin?.perfil?.().then(p => { S.nomeEu = String(p?.nome || '').split(' ')[0]; }).catch(() => { });
  { const u = './?id=' + encodeURIComponent(P.id); if (new URLSearchParams(location.search).get('id') !== P.id) history[semHist ? 'replaceState' : 'pushState'](null, '', u); } pintaPrep();
  carregaPers().catch(() => { }).then(() => Varios.confere()); // "Stick e Bob" com nome desconhecido: pergunta já ao abrir
}
// MODO DOCUMENTO (pedido da dona, 05/11/2026): com um roteiro aberto a tela inteira vira um editor de documento, com UM cabeçalho só
// (o do Preparativos some e o botão da conta /estudio-conta.js vem para o canto deste)
let contaOrig = null;
function modoDoc(on) {
  document.body.classList.toggle('modo-doc', !!on); let tema = 'escuro'; try { tema = localStorage.getItem('ep-prep-tema') || 'escuro'; } catch { }
  document.body.classList.toggle('claro', !!on && tema === 'claro'); // escuro é o padrão (pedido da dona)
  const sp = document.querySelector('[data-estudio-conta]'); if (!sp) return;
  if (on) { if (!contaOrig) contaOrig = { pai: sp.parentNode, prox: sp.nextSibling }; const alvo = $('.dh-conta'); if (alvo && sp.parentNode !== alvo) alvo.appendChild(sp); }
  else if (contaOrig && sp.parentNode !== contaOrig.pai) { contaOrig.pai.insertBefore(sp, contaOrig.prox); }
}
// menus do cabeçalho (Arquivo, Editar…): abre no clique; com um aberto, passar o mouse troca
function menus(nav, def) {
  let aberto = null; const fecha = () => { aberto?.caixa.remove(); aberto?.bt.classList.remove('on'); aberto = null; };
  const abre = (bt, itens) => { fecha(); const caixa = h('<div class="dh-menu" role="menu"></div>');
    for (const it of itens()) { if (it === '-') { caixa.appendChild(h('<hr>')); continue; } const [rot, atalho, fn, off] = it;
      const b = h(`<button role="menuitem" ${off ? 'disabled' : ''}><span>${rot}</span><small>${esc(atalho || '')}</small></button>`); b.onmousedown = e => e.preventDefault(); b.onclick = () => { fecha(); fn(); }; caixa.appendChild(b); }
    const r = bt.getBoundingClientRect(); caixa.style.left = r.left + 'px'; caixa.style.top = r.bottom + 2 + 'px'; document.body.appendChild(caixa); bt.classList.add('on'); aberto = { bt, caixa }; };
  for (const [nome, itens] of def) { const bt = h(`<button>${esc(nome)}</button>`); bt.onmousedown = e => e.preventDefault();
    bt.onclick = () => aberto?.bt === bt ? fecha() : abre(bt, itens); bt.onmouseenter = () => { if (aberto && aberto.bt !== bt) abre(bt, itens); }; nav.appendChild(bt); }
  addEventListener('mousedown', e => { if (aberto && !e.target.closest('.dh-menu, .dh-menus')) fecha(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') fecha(); });
}
const GUIAS = [['roteiro', 'Roteiro', 'doc'], ['falas', 'Falas e gravação', 'mic'], ['legendas', 'Legendas', 'legenda']];
// com destino = Animador aparece a guia do ELENCO: qual personagem do Ateliê é cada nome do roteiro (prep.animador.pers)
const guiasDe = P => P?.destino === 'animador' ? [...GUIAS, ['elenco', 'Elenco no Animador', 'pessoa']] : GUIAS;
function irGuia(k) { S.sub = k; if (k === 'falas') passaGravando(); marcaGuias(); pintaCorpo(); window.scrollTo({ top: 0 }); }
// a etapa anda sozinha: abriu "Falas e gravação" num rascunho → Gravando (na nuvem, uma ação pequena; só neste computador, vai junto depois)
async function passaGravando() { const P = S.P; if (!P || (P.status || 'rascunho') !== 'rascunho' || !pode('pronto')) return; P.status = 'gravando';
  if (P.mod && !P.novo && !S.sujo) { try { const r = await Nuvem.acao({ acao: 'marca', id: P.id, status: 'gravando' }); if (r.mod) { P.mod = r.mod; S.base.mod = r.mod; } S.lista = null; } catch { marcaSujo(); } } else marcaSujo(); }
// a barra de guias de cima: qual está aberta, e Anterior/Próximo; o lado esquerdo só aparece no Roteiro (títulos e personagens)
function marcaGuias() { const L = guiasDe(S.P).map(g => g[0]), i = L.indexOf(S.sub); $$('.dh-guias [data-sub]').forEach(x => x.classList.toggle('on', x.dataset.sub === S.sub));
  const a = $('[data-guia-ant]'), b = $('[data-guia-prox]'); if (a) { a.disabled = i <= 0; a.onclick = () => i > 0 && irGuia(L[i - 1]); }
  if (b) { const ultima = i >= L.length - 1, pronto = S.P?.status === 'pronto';
    if (!ultima) { b.disabled = false; b.classList.remove('feito'); b.innerHTML = `Próximo <span class="dg-seta-d">${ic('voltar', 15)}</span>`; b.title = 'Próxima guia'; b.onclick = () => irGuia(L[i + 1]); }
    else { b.disabled = !pode('pronto'); b.classList.toggle('feito', pronto); b.innerHTML = pronto ? `${ic('ok', 15)} Pronto` : `${ic('ok', 15)} Finalizar`;
      b.title = pronto ? `Já está pronto para o ${DESTINOS[S.P.destino] || 'programa'} usar. Clique para voltar a gravar.` : 'Marca como pronto: o roteiro fica disponível para o programa de destino (An, Sh ou Ed)';
      b.onclick = async () => { if (pronto) { if (await pergunta('Voltar a gravar?', 'O roteiro deixa de aparecer como pronto no programa de destino até você finalizar de novo.', [['Cancelar', false], ['Voltar a gravar', true, 'pri']])) await S.mudaMarca?.('status', 'gravando'); }
        else await S.mudaMarca?.('status', 'pronto'); marcaGuias(); }; } }
  document.body.classList.toggle('sem-guias', S.sub !== 'roteiro'); }
function baixaTexto() { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([S.P.roteiro || ''], { type: 'text/plain;charset=utf-8' })); a.download = (S.P.nome || 'roteiro').replace(/[^\w\- ]+/g, '_') + '.txt'; a.click(); }
function mostraComo() { const m = h(`<div class="modal"><div class="caixa larga">${COMO}<div class="bts"><button class="bt pri">Entendi</button></div></div></div>`); $('button', m).onclick = () => m.remove(); m.onclick = e => { if (e.target === m) m.remove(); }; document.body.appendChild(m); }
addEventListener('keydown', e => { if (!S.P || !(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 's') return; e.preventDefault(); if (S.sujo) salvaPrep($('.prep [data-salva]')); else aviso('Já está salvo na nuvem.', 'ok', 1800); });

function pintaPrep() {
  // o botão da conta (nuvem, computador, casinha, foto) mora no cabeçalho do roteiro: volta para o lugar dele ANTES de redesenhar,
  // senão ele some junto com o cabeçalho velho (acontecia ao trocar o programa de destino ou a situação)
  { const sp = document.querySelector('[data-estudio-conta]'); if (sp && contaOrig && sp.parentNode !== contaOrig.pai) contaOrig.pai.insertBefore(sp, contaOrig.prox); }
  const P = S.P, el = tela(), pp = pode('pronto'), ordem = PREP_CONFIG.status.map(x => x[0]), at = ordem.indexOf(P.status || 'rascunho');
  el.innerHTML = `<section class="prep"><div class="dh-topo">
    <header class="dh">
      <button class="dh-logo" data-volta title="Voltar aos roteiros"><span data-estudio-icone="pr"></span></button>
      <div class="dh-meio">
        <div class="dh-l1"><input class="nome" value="${esc(P.nome)}" ${pode('roteiro') ? '' : 'readonly'} aria-label="Nome do roteiro" size="${Math.max(8, Math.min(40, P.nome.length + 1))}"><span class="salvar"></span></div>
        <nav class="dh-menus"></nav>
      </div>
      <span class="esp"></span>
      <div class="quem-doc"><div class="aovivo-doc"></div><button class="g-mini" data-hist title="Quem criou e quem editou">${ic('relogio', 18)}</button></div>
      <div class="destinos" role="group" aria-label="Vai para">${PREP_CONFIG.destinos.map(([v, n]) => `<button data-destino="${v}" class="${P.destino === v ? 'on' : ''}" ${pp ? '' : 'disabled'} title="Vai para o ${esc(n)}">${progIc(v, 20)}</button>`).join('')}</div>
      <span class="enviar"></span>
      <span class="dh-conta"></span>
    </header>
    <nav class="dh-guias" aria-label="Guias do roteiro"><button class="bt dg-ant" data-guia-ant title="Guia anterior">${ic('voltar', 15)} Anterior</button>
      <div class="dg-passos">${guiasDe(P).map(([k, n, i], x) => `${x ? '<span class="dg-seta" aria-hidden="true">›</span>' : ''}<button data-sub="${k}" class="dg-p ${S.sub === k ? 'on' : ''}" title="${esc(n)}"><i>${x + 1}</i>${ic(i, 15)}<span>${n}</span></button>`).join('')}</div>
      <button class="bt pri dg-prox" data-guia-prox title="Próxima guia">Próximo <span class="dg-seta-d">${ic('voltar', 15)}</span></button></nav>
    <div class="dh-barra"></div></div>
    <div class="dh-area">
      <aside class="guias"><div class="g-roteiro"></div></aside>
      <div class="corpo"></div>
    </div></section>`;
  modoDoc(true); window.EstudioIcones?.aplicar?.(); AoVivo.paraTudo();
  // ao vivo: entra uma vez por roteiro (só quando ele está na nuvem: rascunho só deste computador ninguém mais vê)
  const pintaVivo = l => { const box = $('.prep .aovivo-doc'); if (!box) return; const g = (l || AoVivo.ultimos || []); AoVivo.ultimos = g; const outros = g.filter(x => !x.eu);
    box.innerHTML = g.length > 1 || outros.length ? g.slice(0, 5).map(x => pava(x, 'vivo' + (x.eu ? ' eu' : ''))).join('') + (g.length > 5 ? `<span class="mais">+${g.length - 5}</span>` : '') : ''; box.title = g.length ? 'Ao vivo agora: ' + g.map(x => x.n + (x.eu ? ' (você)' : '')).join(', ') : ''; };
  if (P.mod && !P.novo && AoVivo.atual !== P.id) { AoVivo.atual = P.id; AoVivo.ultimos = []; AoVivo.entra(P.id, pintaVivo); } else pintaVivo();
  $('[data-hist]', el).onclick = e => { const b = e.currentTarget; $$('.hist-pop').forEach(x => x.remove()); const eds = (P.edicoes || []).slice().reverse();
    const pop = h(`<div class="dh-menu pop hist-pop"><div class="hp-tit">Quem criou</div>${P.autor ? `<div class="hp-l">${pava(P.autor)}<div><b>${esc(P.autor.nome)}</b><small>${esc(quando(P.autor.em))}</small></div></div>` : '<p class="dica" style="padding:0 14px">Ainda não foi para a nuvem.</p>'}
      ${eds.length ? `<hr><div class="hp-tit">Quem editou</div>${eds.map(x => `<div class="hp-l">${pava(x)}<div><b>${esc(x.nome)}</b><small>${esc(quando(x.em))}</small></div></div>`).join('')}` : ''}</div>`);
    document.body.appendChild(pop); const r = b.getBoundingClientRect(); pop.style.left = Math.max(8, r.right - pop.offsetWidth) + 'px'; pop.style.top = r.bottom + 6 + 'px';
    setTimeout(() => addEventListener('mousedown', function f(ev) { if (!ev.target.closest('.hist-pop')) { pop.remove(); removeEventListener('mousedown', f); } }), 0); };
  $('[data-volta]', el).onclick = () => sairDoPrep();
  const nm = $('.nome', el); nm.oninput = () => { P.nome = nm.value.slice(0, 80); nm.size = Math.max(8, Math.min(40, nm.value.length + 1)); marcaSujo(); };
  nm.onkeydown = e => { if (e.key === 'Enter') { nm.blur(); S.ed?.foca(); } };
  const mudaMarca = S.mudaMarca = async (campo, v) => {
    if (campo === 'status' && v === P.status) return; const antes = P.status;
    if (campo === 'status' && v === 'pronto') { // pronto = vai para um programa: precisa do destino e avisa o que falta gravar
      if (!P.destino) { const d = await pergunta('Vai para qual programa?', 'Escolha onde este roteiro vai ser usado. Ele passa a aparecer lá como pronto.', [...PREP_CONFIG.destinos.map(([k, n]) => [n, k]), ['Cancelar', null]]); if (!d) return; P.destino = d; }
      const falta = P.partes.reduce((s, p) => s + p.falas.filter(f => !f.audio).length, 0);
      if (falta && !await pergunta('Ainda faltam gravações', `${falta} fala${falta === 1 ? ' está' : 's estão'} sem áudio. Marcar como pronto mesmo assim?`, [['Voltar', false], ['Marcar pronto', true, 'pri']])) return;
    }
    P[campo] = v || null; if (campo === 'status') P.status = v || 'rascunho';
    const dest = DESTINOS[P.destino] || P.destino, msg = campo !== 'status' ? (P.destino ? `Vai para o ${dest}.` : 'Sem destino.') : v === 'pronto' ? `Pronto! Já aparece para o ${dest} usar.` : v === 'gravando' ? 'Hora de gravar: cada pessoa escolhe o seu personagem e grava as falas dele.' : 'Voltou para rascunho: ainda está sendo escrito.';
    if (campo === 'status' && v === 'gravando') S.sub = 'falas';
    if (P.novo || S.sujo) {
      if (campo === 'status' && (v === 'gravando' || v === 'pronto')) { // gravar e ir para o programa precisam da nuvem
        if (!await pergunta(v === 'pronto' ? 'Mandar para a nuvem?' : 'Mandar para a nuvem para gravar?', v === 'pronto' ? `Para o ${dest} usar, o roteiro precisa estar na nuvem.` : 'Cada pessoa grava pelo próprio computador, então o roteiro precisa estar na nuvem.', [['Agora não', false], ['Mandar', true, 'pri']])) { P.status = antes; S.sub = S.sub === 'falas' && antes !== 'gravando' ? 'roteiro' : S.sub; return pintaPrep(); }
        await salvaPrep(null, true); if (!S.sujo) aviso(msg + ' Já está na nuvem.', 'ok', 5500); return pintaPrep(); }
      marcaSujo(); aviso(msg + ' (vai junto quando mandar para a nuvem)', 'info', 5500); return pintaPrep(); } // vai junto quando mandar para a nuvem
    try { const r = await Nuvem.acao({ acao: 'marca', id: P.id, destino: P.destino, status: P.status }); P.mod = r.mod || P.mod; S.base.mod = P.mod; aviso(msg, 'ok', 5500); S.lista = null; }
    catch (e) { aviso(e.message, 'erro'); }
    pintaPrep();
  };
  $$('[data-destino]', el).forEach(b => b.onclick = () => mudaMarca('destino', P.destino === b.dataset.destino ? '' : b.dataset.destino));
  $$('[data-status]', el).forEach(b => b.onclick = () => mudaMarca('status', b.dataset.status));
  $$('.dh-guias [data-sub]', el).forEach(b => b.onclick = () => irGuia(b.dataset.sub)); marcaGuias();
  const E = () => S.sub === 'roteiro' ? S.ed : null, edita = pode('roteiro');
  const naFolha = fn => () => { if (S.sub !== 'roteiro') irGuia('roteiro'); setTimeout(() => S.ed && fn(S.ed), 0); };
  menus($('.dh-menus', el), [
    ['Arquivo', () => [
      [`${ic('mais', 15)} Novo roteiro`, '', async () => { if (await sairDoPrep()) abrePrep(novoPrep()); }, !edita],
      [`${ic('doc', 15)} Abrir roteiros`, '', () => sairDoPrep()],
      ...(pode('roteiro') && P.mod && !P.novo ? [[`${ic('pc', 15)} Tirar da nuvem e manter neste computador…`, '', () => tiraDaNuvem(P.id)]] : []),
      '-', [`${ic('nuvem', 15)} Mandar para a nuvem`, 'Ctrl+S', () => salvaPrep($('.prep [data-salva]')), !S.sujo],
      [`${ic('enviar', 15)} Baixar como texto (.txt)`, '', baixaTexto],
      '-', [`${ic('luz', 15)} Ideias`, '', async () => { if (await sairDoPrep()) trocaAba('ideias'); }],
      [`${ic('pessoa', 15)} Personagens`, '', async () => { if (await sairDoPrep()) trocaAba('personagens'); }]]],
    ['Editar', () => [[`${ic('desfazer', 15)} Desfazer`, 'Ctrl+Z', () => E()?.desfaz(), !E()], [`${ic('refazer', 15)} Refazer`, 'Ctrl+Y', () => E()?.refaz(), !E()], '-', ['Selecionar tudo', 'Ctrl+A', () => E()?.tudo(), !E()]]],
    ['Ver', () => [...guiasDe(P).map(([k, n, i]) => [`${ic(i, 15)} ${n}`, S.sub === k ? '✓' : '', () => irGuia(k)]), '-', ['Mostrar as guias do lado', document.body.classList.contains('sem-guias') ? '' : '✓', () => document.body.classList.toggle('sem-guias')],
      ['Tema claro', document.body.classList.contains('claro') ? '✓' : '', () => { const c = document.body.classList.toggle('claro'); try { localStorage.setItem('ep-prep-tema', c ? 'claro' : 'escuro'); } catch { } }]]],
    ['Inserir', () => [[`${ic('titulo', 15)} Capítulo novo`, '', naFolha(e => e.novaLinha('# Capítulo', { espaco: true })), !edita], [`${ic('titulo', 15)} Parte nova`, '', naFolha(e => e.novaLinha(`## ${Roteiro.norm(P.nome)} parte ${P.partes.length + 1}`, { espaco: true })), !edita],
      ...Roteiro.personagens(P.partes).map(p => [`${ava(p.nome, coresDoRoteiro().get(p.chave), 'p')} Fala de ${esc(p.nome)}`, '', naFolha(e => e.novaLinha(p.nome + ': ')), !edita]),
      [`${ic('pessoa', 15)} Fala de um personagem novo…`, '', async () => { const n = (await pedeTexto('Personagem novo', 'Nome do personagem (como vai aparecer no roteiro)') || '').replace(/[:*#\[\]()]/g, '').trim().slice(0, 40); if (n) naFolha(e => e.novaLinha(n + ': '))(); }, !edita],
      '-', ['<i class="ital">I</i>&nbsp; Ação (o que está acontecendo)', '', naFolha(e => e.novaLinha('**', { recua: 1 })), !edita],
      ['[ ] Indicação de cena', '', naFolha(e => e.novaLinha('[]', { recua: 1 })), !edita], [`${ic('coment', 15)} Comentário para a equipe`, '', naFolha(e => e.comentar()), !edita], ['— Quebra de página', '', naFolha(e => e.novaLinha('---')), !edita]]],
    ['Formatar', () => [['Texto normal', '', naFolha(e => e.estilo('normal')), !edita], [`${ic('pessoa', 15)} Nome do personagem (seleção)`, '', naFolha(e => e.estilo('nome')), !edita],
      ['<i class="ital">I</i>&nbsp; Ação / explicação da cena', 'Ctrl+I', naFolha(e => e.estilo('acao')), !edita], [`${ic('titulo', 15)} Título do capítulo`, '', naFolha(e => e.estilo('capitulo')), !edita], [`${ic('titulo', 15)} Título de uma parte`, '', naFolha(e => e.estilo('parte')), !edita], ['// Comentário', '', naFolha(e => e.estilo('comentario')), !edita]]],
    ['Ferramentas', () => [[`${ic('organizar', 15)} Organizar o roteiro`, '', naFolha(e => Organizar.roda($('[data-org]') || h('<button></button>'), e)), !pode('organizar')], [`${ic('mic', 15)} Gravar as falas`, '', () => irGuia('falas')], [`${ic('legenda', 15)} Legendas`, '', () => irGuia('legendas')], [`${ic('pessoa', 15)} Personagens da equipe`, '', async () => { if (await sairDoPrep()) trocaAba('personagens'); }]]],
    ['Ajuda', () => [[`${ic('ajuda', 15)} Como escrever o roteiro`, '', mostraComo], [`${ic('ajuda', 15)} Atalhos do teclado`, 'Ctrl+/', mostraAtalhos]]],
  ]);
  pintaBarraPrep(); pintaCorpo();
}
function pintaBarraPrep() {
  const P = S.P, sv = $('.prep .salvar'), en = $('.prep .enviar'); if (!P || !sv) return;
  sv.innerHTML = P.novo || !P.mod ? `<span class="onde o-pc" title="Ainda não foi para a nuvem: só você vê">${ic('pc', 15)} Só neste computador</span>`
    : S.sujo ? `<span class="onde o-salvando" title="Está na nuvem: as mudanças vão sozinhas daqui a pouco">${giro()} Salvando na nuvem…</span>`
    : `<span class="onde o-nuvem" title="Salvo na nuvem · ${esc(quando(P.mod))}">${ic('nuvem', 15)} Salvo na nuvem</span>`;
  en.innerHTML = S.sujo && (P.novo || !P.mod) ? `<button class="bt pri pilula" data-salva title="A equipe passa a ver (e gravar) este roteiro">${ic('nuvem')} Mandar para a nuvem</button>` : `<span class="pilula ok">${ic('nuvem')} Na nuvem</span>`;
  const b = $('[data-salva]', en); if (b) b.onclick = () => salvaPrep(b);
}
async function salvaPrep(bt, quieto) {
  const P = S.P; if (!pode('roteiro') && !pode('organizar') && !pode('pronto')) return aviso('Sua conta pode gravar, mas não mudar o roteiro.', 'erro');
  if (bt) { bt.disabled = true; bt.innerHTML = giro('Mandando'); }
  const enviado = P.roteiro;
  try {
    await Quem.marca(P); const { novo, ...corpo } = P; let r;
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
    P.mod = r.mod; delete P.novo; S.base = { mod: P.mod, roteiro: enviado }; S.sujo = P.roteiro !== enviado; if (!S.sujo) S.marco = assinatura(P); S.lista = null;
    if (!S.sujo) await DB.del('rasc', P.id).catch(() => { }); else DB.put('rasc', P.id, { P, base: S.base, em: Date.now() }).catch(() => { });
    carregaPers(true).then(() => pintaLado()).catch(() => { }); // personagens novos entraram na lista da equipe
    if (!quieto) aviso('Mandado para a nuvem. A equipe já vê.', 'ok'); if (S.sub === 'falas') pintaCorpo();
  } catch (e) { aviso(e.message, 'erro'); }
  finally { pintaBarraPrep(); }
}
// ATALHOS DO TECLADO do editor (os mesmos de editores de texto comuns)
const ATALHOS = [['Desfazer', 'Ctrl+Z'], ['Refazer', 'Ctrl+Y ou Ctrl+Shift+Z'], ['Ação / como falar (itálico)', 'Ctrl+I'], ['Selecionar tudo', 'Ctrl+A'], ['Copiar · recortar · colar', 'Ctrl+C · Ctrl+X · Ctrl+V'], ['Colar sem formatação', 'Ctrl+Shift+V'],
  ['Título de capítulo', 'Ctrl+Alt+1'], ['Título de parte', 'Ctrl+Alt+2'], ['Texto normal', 'Ctrl+Alt+0'], ['Apagar a palavra', 'Ctrl+Backspace · Ctrl+Delete'], ['Pular palavra', 'Ctrl+← · Ctrl+→'], ['Começo / fim da linha', 'Home · End'],
  ['Começo / fim do roteiro', 'Ctrl+Home · Ctrl+End'], ['Selecionar', 'Shift+setas'], ['Selecionar por palavra', 'Ctrl+Shift+← · →'], ['Mover a linha', 'Alt+Shift+↑ · ↓'], ['Procurar', 'Ctrl+F'], ['Mandar para a nuvem', 'Ctrl+S'], ['Ver estes atalhos', 'Ctrl+/']];
function mostraAtalhos() { const m = h(`<div class="modal"><div class="caixa larga"><b>Atalhos do teclado</b><table class="atalhos">${ATALHOS.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${b.split(' · ').map(x => `<kbd>${esc(x)}</kbd>`).join(' ')}</td></tr>`).join('')}</table><div class="bts"><button class="bt pri" data-x>Fechar</button></div></div></div>`);
  const fim = () => m.remove(); $('[data-x]', m).onclick = fim; m.onclick = e => { if (e.target === m) fim(); }; m.onkeydown = e => { if (e.key === 'Escape') fim(); }; document.body.appendChild(m); $('[data-x]', m).focus(); }
function pintaCorpo() {
  const c = $('.prep .corpo'); if (!c) return; if (S.sub !== 'roteiro') S.ed = null; if (S.sub !== 'falas') Mic.paraTeste();
  const barra = $('.prep .dh-barra'), gr = $('.prep .g-roteiro'); if (gr) gr.innerHTML = '';
  c.className = 'corpo corpo-' + S.sub;
  if (S.sub !== 'roteiro' && barra) barra.innerHTML = ''; if (false) barra.innerHTML = `<div class="db-pilula"><span class="db-tit">${ic({ falas: 'mic', legendas: 'legenda', elenco: 'pessoa' }[S.sub] || 'doc', 16)} ${{ falas: 'Falas e gravação', legendas: 'Legendas', elenco: 'Elenco no Animador' }[S.sub] || ''}</span><span class="esp"></span><button class="bt" data-volta-rot>${ic('doc', 15)} Voltar ao roteiro</button></div>`;
  $('[data-volta-rot]', barra || document)?.addEventListener('click', () => irGuia('roteiro'));
  if (S.sub === 'elenco' && S.P.destino !== 'animador') S.sub = 'roteiro';
  if (S.sub === 'falas') return Falas.pinta(c); if (S.sub === 'legendas') return pintaLegendas(c); if (S.sub === 'elenco') return pintaElenco(c); return pintaRoteiro(c);
}
// cor de cada personagem do roteiro aberto (na ordem em que aparecem)
function coresDoRoteiro() { const m = new Map(); Roteiro.personagens(S.P?.partes).forEach((p, i) => m.set(p.chave, corOuPadrao(p.nome, i))); return m; }

/* ---------- aba Roteiro: a folha do roteiro ---------- */
const COMO = `<div class="como"><b>Como escrever</b>
  <div class="ex"><span class="mk"># </span><b class="g1">Episódio 1</b><small>capítulo (agrupa as partes; opcional)</small></div>
  <div class="ex"><span class="mk">## </span><b>Parte 1</b><small>parte (cada parte é gravada e usada separada)</small></div>
  <div class="ex"><span class="nm" style="--c:#19f0f0">Problems</span>: Oi, gente!<small>fala: nome + dois-pontos</small></div>
  <div class="ex"><span class="nm" style="--c:#ffb04a">Clara</span>: <mark>rindo</mark> Oi!<small>*itálico* = como falar (fica fora da legenda)</small></div>
  <div class="ex"><mark>Problems abre a porta.</mark><small>linha toda em itálico = ação / explicação da cena</small></div>
  <div class="ex"><i>[a câmera se aproxima]</i><small>colchetes = cena</small></div>
  <div class="ex"><span class="com">// Clara: deixar esta fala mais curta</span><small>comentário para a equipe (não vira fala)</small></div>
  <div class="ex"><span class="mk">———</span><small>"---" numa linha = começar uma página nova</small></div>
  <p><b>Selecione um trecho</b> (ou clique com o botão direito nele) para dizer se é <b>nome do personagem</b>, <b>ação</b>, <b>título</b> ou para deixar um
  <b>comentário para a equipe</b> (ele entra numa linha "//" logo abaixo, com o seu nome). Antes de mudar, ele mostra como vai ficar e pergunta.
  Colar um texto de outro editor funciona: o itálico de lá vira ação. As margens mudam arrastando os marcadores das réguas.</p></div>`;
const ESTILOS = [['normal', 'Texto normal'], ['capitulo', 'Título do capítulo'], ['parte', 'Título da parte'], ['acao', 'Ação / cena'], ['comentario', 'Comentário']];
const ESTILO_DE = { v: 'normal', n: 'normal', f: 'normal', f2: 'normal', q: 'normal', a: 'acao', c: 'comentario' };
let zoom = 1; try { zoom = +localStorage.getItem('ep-prep-zoom') || 1; } catch { }
// PÁGINAS (tamanho Carta, como os editores de texto: 816 × 1056 px a 96 dpi; margens de 2,54 cm = 96 px, mudam pelas réguas)
const PG = { W: 816, H: 1056, G: 18 };
const margens = P => { const m = P?.pagina || {}; return { ml: m.ml ?? 96, mr: m.mr ?? 96, mt: m.mt ?? 96, mb: m.mb ?? 96 }; };
function pagina(c) {
  const pg = $('.paginas', c), fo = pg && $('.folha', pg), ed = fo && $('.folha-txt', fo); if (!ed) return; const M = margens(S.P);
  fo.style.padding = `${M.mt}px ${M.mr}px ${M.mb}px ${M.ml}px`;
  const ls = [...ed.children]; for (const d of ls) if (d.dataset.q) { d.style.marginTop = ''; delete d.dataset.q; }
  const r = ed.offsetWidth / (PG.W - M.ml - M.mr) || 1, util = (PG.H - M.mt - M.mb) * r, passo = (PG.H + PG.G) * r; let p = 0, forca = false;
  for (const d of ls) {
    if (d.classList.contains('q')) { forca = true; continue; }
    const top = d.offsetTop, alt = d.offsetHeight;
    const pi = Math.max(p, Math.floor(top / passo)); let novo = pi;
    if (forca && pi === p && top > p * passo + 1) novo = p + 1; // depois de "---": página nova
    else if (top > pi * passo + util - 1 || (top + alt > pi * passo + util + 1 && top > pi * passo + 1)) novo = pi + 1; // não cabe: vai para a próxima
    if (novo * passo > top) { d.style.marginTop = ((parseFloat(getComputedStyle(d).marginTop) || 0) + (novo * passo - top) / r) + 'px'; d.dataset.q = '1'; }
    p = novo; forca = false;
  }
  const ult = ls[ls.length - 1], n = Math.max(1, ult ? Math.floor((ult.offsetTop + ult.offsetHeight - 1) / passo) + 1 : 1);
  fo.style.minHeight = (n * (PG.H + PG.G) - PG.G) + 'px';
  const fundo = $('.fundo', pg); if (fundo.childElementCount !== n) fundo.innerHTML = Array.from({ length: n }, (_, i) => `<div class="pg" style="top:${i * (PG.H + PG.G)}px"><span class="pg-n">${i + 1}</span></div>`).join('');
  const rv = $('.regua-v', pg); if (rv) { rv.style.setProperty('--mt', M.mt + 'px'); rv.style.setProperty('--mb', M.mb + 'px'); if (rv.dataset.n !== String(n)) { rv.dataset.n = n; rv.innerHTML = Array.from({ length: n }, (_, i) => `<div class="rv-pg" style="top:${i * (PG.H + PG.G)}px">${Array.from({ length: 27 }, (_, k) => `<span style="top:${(k + 1) * 37.8}px">${k + 1}</span>`).join('')}</div>`).join('') + '<i class="rv-mao" data-m="mt"></i><i class="rv-mao" data-m="mb"></i>'; } }
  regua(c);
}
function regua(c) {
  const M = margens(S.P), rh = $('.prep .r-folha'), rv = $('.regua-v', c);
  if (rh) { rh.style.setProperty('--ml', M.ml + 'px'); rh.style.setProperty('--mr', M.mr + 'px'); rh.style.zoom = zoom; }
  if (rv) { rv.style.setProperty('--mt', M.mt + 'px'); rv.style.setProperty('--mb', M.mb + 'px'); }
}
// arrastar os marcadores das réguas muda as margens (guardadas no roteiro: P.pagina)
function arrastaMargem(ev, lado, c) {
  if (!pode('roteiro')) return; ev.preventDefault(); const P = S.P, M0 = margens(P), x0 = ev.clientX, y0 = ev.clientY, z = zoom;
  const lim = { ml: [24, PG.W / 2 - 120], mr: [24, PG.W / 2 - 120], mt: [24, PG.H / 2 - 150], mb: [24, PG.H / 2 - 150] }[lado];
  const dica = h(`<div class="marg-dica"></div>`); document.body.appendChild(dica);
  const move = e => { const d = lado === 'ml' ? (e.clientX - x0) / z : lado === 'mr' ? (x0 - e.clientX) / z : lado === 'mt' ? (e.clientY - y0) / z : (y0 - e.clientY) / z;
    const v = Math.round(Math.max(lim[0], Math.min(lim[1], M0[lado] + d))); P.pagina = { ...M0, ...(P.pagina || {}), [lado]: v };
    dica.textContent = `${{ ml: 'Margem esquerda', mr: 'Margem direita', mt: 'Margem de cima', mb: 'Margem de baixo' }[lado]}: ${(v / 37.8).toFixed(2).replace('.', ',')} cm`; dica.style.left = e.clientX + 14 + 'px'; dica.style.top = e.clientY + 14 + 'px'; pagina(c); };
  const fim = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', fim); dica.remove(); marcaSujo(); };
  addEventListener('pointermove', move); addEventListener('pointerup', fim);
}
// um menuzinho no lugar do clique (pastas dos personagens, organização)
function popMenu(ancora, itens) {
  $$('.dh-menu.pop').forEach(x => x.remove()); const caixa = h('<div class="dh-menu pop" role="menu"></div>');
  for (const it of itens) { if (it === '-') { caixa.appendChild(h('<hr>')); continue; } const [rot, marca, fn, off] = it; const b = h(`<button role="menuitem" ${off ? 'disabled' : ''}><span>${rot}</span><small>${esc(marca || '')}</small></button>`); b.onclick = () => { caixa.remove(); fn(); }; caixa.appendChild(b); }
  const r = ancora instanceof Event ? { left: ancora.clientX, bottom: ancora.clientY } : ancora.getBoundingClientRect(); document.body.appendChild(caixa); caixa.style.left = Math.min(innerWidth - caixa.offsetWidth - 8, r.left) + 'px'; caixa.style.top = Math.min(innerHeight - caixa.offsetHeight - 8, r.bottom + 4) + 'px';
  setTimeout(() => addEventListener('mousedown', function fora(e) { if (!e.target.closest('.dh-menu.pop')) { caixa.remove(); removeEventListener('mousedown', fora); } }), 0);
}
// muda a pasta de um personagem: na organização deste roteiro (P.org) ou na da equipe (personagens.json)
async function mudaGrupo(nome, grupo) {
  const P = S.P, k = Roteiro.chave(nome);
  if (P.org?.propria) { P.org.grupos = { ...(P.org.grupos || {}), [k]: grupo || undefined }; if (!grupo) delete P.org.grupos[k]; marcaSujo(); return pintaLado(); }
  if (!pode('organizar')) return aviso('Sua conta não muda a organização da equipe. Use "Organização só deste roteiro".', 'erro');
  try { const r = await Nuvem.acao({ acao: 'personagens', itens: { [k]: { nome, grupo: grupo || null } } }); S.pers = { ...S.pers, ...r.personagens }; aviso(grupo ? `${nome} foi para ${grupo}.` : `${nome} saiu da pasta.`, 'ok'); pintaLado(); }
  catch (e) { aviso(e.message, 'erro'); }
}
async function pastaNova() { const n = (await pedeTexto('Pasta nova', 'Nome da pasta (ex.: Figurantes)') || '').replace(/[^\p{L}\p{N} ._-]/gu, '').trim().slice(0, 30); return n || null; }
let pintaLado = () => { };
function pintaRoteiro(c) {
  const P = S.P, ed = pode('roteiro'), barra = $('.prep .dh-barra'), gr = $('.prep .g-roteiro'), M = margens(P);
  barra.innerHTML = `<div class="db-pilula">
      ${ed ? `<button class="db" data-desf title="Desfazer (Ctrl+Z)">${ic('desfazer', 17)}</button><button class="db" data-ref title="Refazer (Ctrl+Y)">${ic('refazer', 17)}</button><span class="sep"></span>` : ''}
      <select class="db-sel" data-zoom title="Zoom">${[.5, .75, .9, 1, 1.25, 1.5].map(z => `<option value="${z}" ${z === zoom ? 'selected' : ''}>${Math.round(z * 100)}%</option>`).join('')}</select><span class="sep"></span>
      ${ed ? `<select class="db-sel largo" data-estilo title="Estilo da linha">${ESTILOS.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select><span class="sep"></span>
      <div class="falade"><button class="db" data-falade title="Começa uma fala de um personagem">${ic('pessoa', 16)} Fala de… ${ic('baixo', 12)}</button><div class="lista-pers" hidden></div></div>
      <button class="db" data-acao title="Ação / explicação da cena (Ctrl+I)"><i class="ital">I</i></button>
      <button class="db" data-coment title="Comentário para a equipe">${ic('coment', 16)}</button><span class="sep"></span>` : ''}
      ${pode('organizar') ? `<button class="db" data-org title="Arruma um texto solto em capítulos, partes e falas">${ic('organizar', 16)} Organizar</button>` : ''}
      <span class="esp"></span>
      <button class="db" data-como title="Como escrever">${ic('ajuda', 16)}</button>
      <span class="db-modo">${ed ? `${ic('doc', 15)} Edição` : `${ic('doc', 15)} Só leitura`}</span>
    </div>
    <div class="regua"><div class="r-folha" title="Arraste os marcadores para mudar as margens"><div class="r-num">${Array.from({ length: 21 }, (_, i) => `<span style="left:${(i + 1) * 37.8}px">${i + 1}</span>`).join('')}</div><i class="rh-mao" data-m="ml"></i><i class="rh-mao" data-m="mr"></i></div></div>`;
  c.innerHTML = `<div class="mesa"><div class="paginas" style="zoom:${zoom}"><div class="regua-v" title="Arraste os marcadores para mudar as margens"></div><div class="fundo"></div><div class="folha"></div></div></div>`;
  gr.innerHTML = `<div class="g-tit">Títulos</div><div class="indice"></div><div class="g-tit g-pers">Personagens<span class="esp"></span><button class="g-mini" data-orgp title="Organização dos personagens">${ic('pasta', 15)}</button></div><div class="pfiltro"></div><div class="pers"></div>`;
  const cores = () => coresDoRoteiro();
  let t = 0, tPg = 0; const repagina = () => { cancelAnimationFrame(tPg); tPg = requestAnimationFrame(() => pagina(c)); };
  const E = S.ed = Editor.cria($('.folha', c), { texto: P.roteiro || '', somenteLer: !ed, atalhos: mostraAtalhos, editaPers: n => editaPersRoteiro(n),
    cor: n => cores().get(Roteiro.chave(n)) || corOuPadrao(n),
    aoMudar: tx => { P.roteiro = tx; marcaSujo(); clearTimeout(t); t = setTimeout(() => { Varios.confere(); const antes = [...cores().keys()].join(); P.partes = Roteiro.separa(P.roteiro, P.partes); lado(); if ([...cores().keys()].join() !== antes) E.repinta(); }, 200); },
    aoMover: () => { const s = $('[data-estilo]', barra), l = E.linhas(), tp = E.tipoAtual(); if (s && tp) s.value = tp === 'h' ? (E.nivelAtual() === 1 ? 'capitulo' : 'parte') : ESTILO_DE[tp] || 'normal'; },
    aoPintar: repagina,
    confirma: (msg, antes, depois) => perguntaMuda(msg, antes, depois),
    pedeTexto: (tit, rot) => pedeTexto(tit, rot, 200),
    autor: () => S.nomeEu || '' });
  E.el.addEventListener('estilo', ev => E.estilo(ev.detail)); // Ctrl+Alt+1/2/0
  if (!P.roteiro && ed) E.el.dataset.vazio = 'Comece aqui. Ex.: "# Episódio 1", "## Parte 1" e depois "Problems: Oi, gente!"';
  const lado = pintaLado = () => {
    const ps = Roteiro.personagens(P.partes), cs = cores(), linhas = E.linhas();
    // índice: capítulos e partes (clique vai até o título)
    const tit = []; let falas = 0, atual = null;
    linhas.forEach((l, i) => { if (l.t === 'h') { atual = { nivel: l.nivel || 2, nome: l.nome, i, n: 0 }; tit.push(atual); } else if (l.t === 'f' && atual) atual.n++; });
    $('.indice', gr).innerHTML = tit.map(x => `<button class="ix ix${x.nivel}" data-linha="${x.i}"><b>${esc(x.nome)}</b>${x.nivel === 2 ? `<small>${x.n} fala${x.n === 1 ? '' : 's'}</small>` : ''}</button>`).join('') || '<p class="dica">Os títulos aparecem aqui. Escreva "# Capítulo" ou "## Parte".</p>';
    // personagens em pastas (Principais, Secundários, as que a pessoa criar); "Sem pasta" no fim
    const fil = S.filtroPers || '', pastas = [...new Set([...GRUPOS_BASE, ...ps.map(p => grupoDe(p.nome)).filter(Boolean)])].filter(g => ps.some(p => grupoDe(p.nome) === g) || GRUPOS_BASE.includes(g));
    $('.pfiltro', gr).innerHTML = ps.length ? ['', ...pastas.filter(g => ps.some(p => grupoDe(p.nome) === g))].map(g => `<button class="pf ${fil === g ? 'on' : ''}" data-pf="${esc(g)}">${g ? esc(g) : 'Todos'}</button>`).join('') : '';
    let fechadas = {}; try { fechadas = JSON.parse(localStorage.getItem('ep-prep-pastas') || '{}'); } catch { }
    const grupos = [...pastas, ''].filter(g => !fil || g === fil).map(g => [g, ps.filter(p => grupoDe(p.nome) === g)]).filter(([g, l]) => l.length);
    $('.pers', gr).innerHTML = grupos.map(([g, l]) => `<div class="pasta ${fechadas[g || '-'] ? 'fechada' : ''}"><button class="pasta-tit" data-pasta="${esc(g || '-')}">${ic('baixo', 12)} ${g ? esc(g) : 'Sem pasta'} <small>${l.length}</small></button>
      ${l.map(p => `<div class="prow"><button class="pchip" data-pers="${esc(p.nome)}" title="Nova fala de ${esc(p.nome)}">${ava(p.nome, cs.get(p.chave), 'p')}<span>${esc(p.nome)}</span><small>${p.n}</small></button><button class="g-mini" data-pmenu="${esc(p.nome)}" title="Mover para outra pasta">${ic('mais3', 14)}</button></div>`).join('')}</div>`).join('') || '<p class="dica">Escreva <b>Nome: fala</b> e o personagem aparece aqui.</p>';
    $$('[data-linha]', gr).forEach(b => b.onclick = () => { const l = +b.dataset.linha; if (l >= 0) E.irPara(l); });
    $$('[data-pers]', gr).forEach(b => b.onclick = () => ed && E.novaLinha(b.dataset.pers + ': '));
    $$('[data-pf]', gr).forEach(b => b.onclick = () => { S.filtroPers = b.dataset.pf; lado(); });
    $$('[data-pasta]', gr).forEach(b => b.onclick = () => { const k = b.dataset.pasta; fechadas[k] = !fechadas[k]; try { localStorage.setItem('ep-prep-pastas', JSON.stringify(fechadas)); } catch { } b.parentElement.classList.toggle('fechada', !!fechadas[k]); });
    $$('.prow', gr).forEach(r => r.oncontextmenu = e => { e.preventDefault(); const n = $('[data-pers]', r).dataset.pers, g0 = grupoDe(n);
      popMenu(e, [[`${ic('pessoa', 14)} Nova fala de ${esc(n)}`, '', () => E.novaLinha(n + ': '), !ed], '-',
        ...[...new Set([...GRUPOS_BASE, ...pastas])].map(g => [`${ic('pasta', 14)} Mover para ${esc(g)}`, g === g0 ? '✓' : '', () => mudaGrupo(n, g), g === g0]),
        [`${ic('pasta', 14)} Tirar da pasta`, !g0 ? '✓' : '', () => mudaGrupo(n, ''), !g0], [`${ic('mais', 14)} Pasta nova…`, '', async () => { const g = await pastaNova(); if (g) mudaGrupo(n, g); }]]); });
    $$('[data-pasta]', gr).forEach(b => b.oncontextmenu = e => { e.preventDefault(); const fe = b.parentElement.classList.contains('fechada');
      popMenu(e, [[`${ic('baixo', 14)} ${fe ? 'Abrir a pasta' : 'Fechar a pasta'}`, '', () => b.click()], [`${ic('pessoa', 14)} Organizar as pastas (aba Personagens)`, '', async () => { if (await sairDoPrep()) trocaAba('personagens'); }]]); });
    $$('[data-pmenu]', gr).forEach(b => b.onclick = () => { const n = b.dataset.pmenu, g0 = grupoDe(n);
      popMenu(b, [...[...new Set([...GRUPOS_BASE, ...pastas])].map(g => [`${ic('pasta', 14)} ${esc(g)}`, g === g0 ? '✓' : '', () => mudaGrupo(n, g)]), [`${ic('mais', 14)} Pasta nova…`, '', async () => { const g = await pastaNova(); if (g) mudaGrupo(n, g); }], '-', ['Sem pasta', !g0 ? '✓' : '', () => mudaGrupo(n, '')]]); });
    const lp = $('.lista-pers', barra); if (lp) lp.innerHTML = ps.map(p => `<button data-np="${esc(p.nome)}">${ava(p.nome, cs.get(p.chave), 'p')} ${esc(p.nome)}</button>`).join('') + `<button data-np="">${ic('mais', 14)} Personagem novo…</button>`;
  };
  lado();
  $('[data-orgp]', gr).onclick = e => popMenu(e.currentTarget, [
    ['Organização da equipe', P.org?.propria ? '' : '✓', () => { if (P.org?.propria) { P.org = { ...P.org, propria: false }; marcaSujo(); lado(); aviso('Usando as pastas da equipe (aba Personagens).', 'ok'); } }],
    ['Organização só deste roteiro', P.org?.propria ? '✓' : '', () => { if (!P.org?.propria) { const gs = {}; for (const p of Roteiro.personagens(P.partes)) { const g = S.pers?.[p.chave]?.grupo; if (g) gs[p.chave] = g; } P.org = { propria: true, grupos: { ...gs, ...(P.org?.grupos || {}) } }; marcaSujo(); lado(); aviso('Agora as pastas deste roteiro são só dele.', 'ok'); } }],
    '-', [`${ic('pessoa', 14)} Abrir a aba Personagens`, '', async () => { if (await sairDoPrep()) trocaAba('personagens'); }]]);
  const sem = e => e.preventDefault(); // os botões da barra não tiram o foco da folha
  $$('.db', barra).forEach(b => b.addEventListener('mousedown', sem));
  $('[data-desf]', barra)?.addEventListener('click', () => E.desfaz()); $('[data-ref]', barra)?.addEventListener('click', () => E.refaz());
  $('[data-zoom]', barra).onchange = e => { zoom = +e.target.value; $('.paginas', c).style.zoom = zoom; try { localStorage.setItem('ep-prep-zoom', zoom); } catch { } pagina(c); };
  $('[data-estilo]', barra)?.addEventListener('change', e => { E.estilo(e.target.value); E.foca(); });
  $('[data-acao]', barra)?.addEventListener('click', () => E.italico());
  $('[data-coment]', barra)?.addEventListener('click', () => E.comentar());
  const fd = $('[data-falade]', barra), lp = $('.lista-pers', barra);
  lp?.addEventListener('mousedown', sem);
  fd?.addEventListener('click', () => { lp.hidden = !lp.hidden; });
  lp?.addEventListener('click', async e => { const b = e.target.closest('[data-np]'); if (!b) return; lp.hidden = true; let n = b.dataset.np;
    if (!n) { n = await pedeTexto('Personagem novo', 'Nome do personagem (como vai aparecer no roteiro)'); if (!n) return; n = n.replace(/[:*#\[\]()]/g, '').trim().slice(0, 40); if (!n) return; }
    E.novaLinha(n + ': '); });
  addEventListener('mousedown', e => { if (lp && !lp.hidden && !e.target.closest('.falade')) lp.hidden = true; });
  $('[data-org]', barra)?.addEventListener('click', e => Organizar.roda(e.currentTarget, E));
  $('[data-como]', barra).onclick = mostraComo;
  $$('.rh-mao', barra).forEach(m => m.onpointerdown = e => arrastaMargem(e, m.dataset.m, c));
  $('.regua-v', c).addEventListener('pointerdown', e => { const m = e.target.closest('.rv-mao'); if (m) arrastaMargem(e, m.dataset.m, c); });
  new ResizeObserver(repagina).observe($('.mesa', c));
  repagina(); regua(c);
  if (ed && !P.roteiro) setTimeout(() => E.foca(), 50);
}
// pergunta antes de mudar pelo menu da seleção, mostrando a linha antes e depois
function perguntaMuda(msg, antes, depois) {
  return new Promise(ok => { const m = h(`<div class="modal"><div class="caixa larga"><b>${esc(msg)}</b><div class="antes-depois"><small>Antes</small><pre>${esc(antes)}</pre><small>Depois</small><pre class="depois">${esc(depois)}</pre></div><div class="bts"><button class="bt" data-n>Cancelar</button><button class="bt pri" data-s>Mudar</button></div></div></div>`);
    const fim = v => { m.remove(); ok(v); }; $('[data-n]', m).onclick = () => fim(false); $('[data-s]', m).onclick = () => fim(true); m.onkeydown = e => { if (e.key === 'Escape') fim(false); if (e.key === 'Enter') fim(true); };
    document.body.appendChild(m); $('[data-s]', m).focus(); });
}
function pedeTexto(titulo, rotulo, max = 40) {
  return new Promise(ok => { const m = h(`<div class="modal"><div class="caixa"><b>${esc(titulo)}</b><label>${esc(rotulo)}<input maxlength="${max}"></label><div class="bts"><button class="bt" data-c>Cancelar</button><button class="bt pri" data-s>OK</button></div></div></div>`);
    const i = $('input', m), fim = v => { m.remove(); ok(v); }; $('[data-c]', m).onclick = () => fim(null); $('[data-s]', m).onclick = () => fim(i.value.trim()); i.onkeydown = e => { if (e.key === 'Enter') fim(i.value.trim()); if (e.key === 'Escape') fim(null); };
    document.body.appendChild(m); i.focus(); });
}

/* ---------- Organizar: a nuvem arruma o texto em partes e falas ---------- */
const Organizar = {
  SIS: `Você arruma roteiros de vídeos de animação em português do Brasil. Receba o texto e devolva SÓ um JSON:
{"partes":[{"capitulo":"Episódio 1 (opcional)","nome":"Parte 1","falas":[{"personagem":"Nome","texto":"o que ele fala","nota":"como falar ou o que ele faz (opcional, curta)"}]}]}
Regras: não invente falas nem mude o sentido; corrija só erros óbvios de digitação; nome do personagem escrito igual em todas as falas;
narração, ações e indicações de cena não viram fala (a não ser que exista um NARRADOR falando); trechos em itálico (*assim*) ou entre parênteses
dentro de uma fala são a nota (como falar), não o texto falado; separe em partes nomeadas seguindo o que o texto indica (parte, cena), e use "capitulo" quando o texto agrupar partes (episódio, capítulo);
se o texto não indicar partes, use uma parte com o nome do roteiro.`,
  async roda(bt, E) {
    const P = S.P, txt = E.texto.trim(); if (!txt) return aviso('Escreva ou cole o roteiro primeiro.', 'info');
    const rot = bt.innerHTML; bt.disabled = true; bt.innerHTML = giro('Organizando');
    try {
      const r = await fetch(SRV + '/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', ...(await Nuvem.hd()) }, body: JSON.stringify({ system: [{ type: 'text', text: this.SIS }], messages: [{ role: 'user', content: `NOME DO ROTEIRO: ${P.nome}\n\nTEXTO:\n${txt.slice(0, 60000)}` }] }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error?.message || 'A nuvem não conseguiu organizar agora.'); }
      const saida = /event-stream/.test(r.headers.get('content-type') || '') ? await this.le(r) : ((await r.json()).content || []).map(x => x.text || '').join('');
      const m = saida.match(/\{[\s\S]*\}/); if (!m) throw new Error('Não deu para organizar este texto. Tente de novo.');
      const j = JSON.parse(m[0]); const partes = (j.partes || []).filter(p => p?.falas?.length).map(p => ({ nome: String(p.nome || P.nome).slice(0, 80), ...(p.capitulo ? { capitulo: String(p.capitulo).slice(0, 80) } : {}), falas: p.falas.filter(f => f?.personagem && f?.texto).map(f => ({ personagem: String(f.personagem).slice(0, 40), texto: String(f.texto), nota: f.nota ? String(f.nota).slice(0, 80) : '' })) }));
      if (!partes.length) throw new Error('Não achei falas neste texto.');
      E.trocaTudo(Roteiro.escreve(partes));
      aviso('Roteiro organizado em ' + partes.length + ' parte' + (partes.length === 1 ? '' : 's') + '. Ctrl+Z desfaz.', 'ok');
    } catch (e) { aviso(e.message, 'erro'); }
    finally { if (bt.isConnected) { bt.disabled = false; bt.innerHTML = rot; } }
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
/* ---------- MICROFONE: permissão, escolher o microfone, ouvir a própria voz, filtros e volume (guardados NESTE computador) ---------- */
const Mic = {
  cfg() { let c = {}; try { c = JSON.parse(localStorage.getItem('ep-prep-mic') || '{}') || {}; } catch { } return { dev: '', monitor: false, ruido: true, eco: true, agc: true, vol: 1, ...c }; },
  salva(c) { try { localStorage.setItem('ep-prep-mic', JSON.stringify(c)); } catch { } },
  async permissao() { try { const p = await navigator.permissions.query({ name: 'microphone' }); return p.state; } catch { }
    try { const d = await navigator.mediaDevices.enumerateDevices(); return d.some(x => x.kind === 'audioinput' && x.label) ? 'granted' : 'prompt'; } catch { return 'prompt'; } },
  // abre o microfone já com as configurações: filtros do navegador + volume (ganho) + ouvir-se; grava do "dest" (o som já tratado)
  async abre() { const c = this.cfg(), base = { echoCancellation: c.eco, noiseSuppression: c.ruido, autoGainControl: c.agc };
    let st; try { st = await navigator.mediaDevices.getUserMedia({ audio: c.dev ? { ...base, deviceId: { exact: c.dev } } : base }); } catch (e) { if (!c.dev) throw e; st = await navigator.mediaDevices.getUserMedia({ audio: base }); }
    const ac = new AudioContext(), src = ac.createMediaStreamSource(st), g = ac.createGain(), an = ac.createAnalyser(), dest = ac.createMediaStreamDestination(); g.gain.value = c.vol; an.fftSize = 2048;
    src.connect(g); g.connect(an); g.connect(dest); let mon = null; if (c.monitor) { mon = ac.createGain(); mon.gain.value = 1; g.connect(mon); mon.connect(ac.destination); }
    return { st, ac, an, g, dest, mon, fecha() { try { st.getTracks().forEach(t => t.stop()); } catch { } try { ac.close(); } catch { } } }; },
  nivel(an, buf) { an.getByteTimeDomainData(buf); let s = 0, pico = 0; for (const v of buf) { const x = (v - 128) / 128; s += x * x; pico = Math.max(pico, Math.abs(x)); } return { rms: Math.sqrt(s / buf.length), pico }; },
  teste: null,
  // o painel do topo da aba Falas
  async pinta(box) {
    if (!box) return; this.paraTeste(); const perm = await this.permissao();
    if (perm === 'denied') { box.className = 'mic-painel bloq'; box.innerHTML = `<div class="mp-cab">${ic('mic', 18)}<b>O microfone está bloqueado para este site</b></div>
      <ol class="mp-passos"><li>Clique no <b>cadeado</b> (ou no ícone de ajustes) à esquerda do endereço, lá em cima no navegador.</li><li>Em <b>Microfone</b>, escolha <b>Permitir</b>.</li><li>Clique em <b>Tentar de novo</b> (ou recarregue a página).</li></ol>
      <button class="bt" data-de-novo>${ic('atualizar', 15)} Tentar de novo</button>`; $('[data-de-novo]', box).onclick = () => this.pinta(box); return; }
    if (perm !== 'granted') { box.className = 'mic-painel pede'; box.innerHTML = `<div class="mp-cab">${ic('mic', 18)}<b>Para gravar, o site precisa usar o seu microfone</b></div>
      <p>Clique em <b>Permitir o microfone</b> e, na janelinha que o navegador abrir, escolha <b>Permitir</b>. Depois aparecem as configurações (qual microfone, volume, filtros).</p>
      <button class="bt pri" data-permitir>${ic('mic', 15)} Permitir o microfone</button>`;
      $('[data-permitir]', box).onclick = async () => { try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach(t => t.stop()); } catch { } this.pinta(box); }; return; }
    const c = this.cfg(); let devs = []; try { devs = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audioinput'); } catch { }
    const chave = (k, rot, dica) => `<label class="mp-ch" title="${esc(dica)}"><input type="checkbox" data-c="${k}" ${c[k] ? 'checked' : ''}><span class="trilho"><i></i></span>${rot}</label>`;
    box.className = 'mic-painel ok'; box.innerHTML = `<div class="mp-cab">${ic('mic', 18)}<b>Microfone</b><span class="mp-ok">${ic('ok', 13)} permitido</span><span class="esp"></span><button class="bt" data-teste>${ic('play', 14)} Testar</button></div>
      <div class="mp-grade">
        <label class="mp-campo"><small>Qual microfone</small><select data-dev><option value="">Padrão do computador</option>${devs.map(d => `<option value="${esc(d.deviceId)}" ${d.deviceId === c.dev ? 'selected' : ''}>${esc(d.label || 'Microfone')}</option>`).join('')}</select></label>
        <label class="mp-campo"><small>Volume do microfone <b data-vv>${Math.round(c.vol * 100)}%</b></small><input type="range" min="0" max="2" step="0.05" value="${c.vol}" data-vol></label>
        <div class="mp-campo"><small>Teste (fale alguma coisa)</small><div class="mp-medidor"><i></i><span class="mp-pico"></span></div></div>
      </div>
      <div class="mp-chaves">${chave('ruido', 'Redução de ruído', 'Tira chiado e barulho de fundo')}${chave('eco', 'Cancelar eco', 'Tira o eco do som que sai das caixas')}${chave('agc', 'Volume automático', 'O navegador ajusta o volume sozinho')}${chave('monitor', 'Ouvir a minha voz', 'Você escuta o microfone enquanto testa e grava (use fone de ouvido para não dar microfonia)')}</div>`;
    const muda = (k, v) => { const n = { ...this.cfg(), [k]: v }; this.salva(n); if (this.teste) { this.paraTeste(); this.testa(box); } };
    $('[data-dev]', box).onchange = e => muda('dev', e.target.value);
    $('[data-vol]', box).oninput = e => { $('[data-vv]', box).textContent = Math.round(e.target.value * 100) + '%'; const n = { ...this.cfg(), vol: +e.target.value }; this.salva(n); if (this.teste) this.teste.m.g.gain.value = +e.target.value; };
    $$('[data-c]', box).forEach(i => i.onchange = () => { if (i.dataset.c === 'monitor' && i.checked) aviso('Use fone de ouvido: sem fone, o som da caixa volta para o microfone (microfonia).', 'info', 6000); muda(i.dataset.c, i.checked); });
    $('[data-teste]', box).onclick = () => this.teste ? this.paraTeste(box) : this.testa(box);
  },
  async testa(box) { try { const m = await this.abre(), buf = new Uint8Array(m.an.fftSize), med = $('.mp-medidor i', box), pk = $('.mp-pico', box); let raf;
      const anda = () => { const { rms, pico } = this.nivel(m.an, buf); med.style.width = Math.min(100, rms * 280) + '%'; pk.style.left = Math.min(100, pico * 100) + '%'; pk.classList.toggle('alto', pico > .95); raf = requestAnimationFrame(anda); }; anda();
      this.teste = { m, para: () => cancelAnimationFrame(raf) }; const b = $('[data-teste]', box); if (b) b.innerHTML = `${ic('parar', 14)} Parar o teste`; }
    catch (e) { aviso('Não consegui abrir o microfone: ' + (e.message || e), 'erro'); } },
  paraTeste(box) { if (this.teste) { this.teste.para(); this.teste.m.fecha(); this.teste = null; } const b = box && $('[data-teste]', box); if (b) b.innerHTML = `${ic('play', 14)} Testar`; },
};
// ONDA DO ÁUDIO: as barrinhas de uma gravação (guardadas na memória desta aba por chave)
const Onda = {
  cache: new Map(),
  async picos(chave, blob, n = 140) { if (this.cache.has(chave)) return this.cache.get(chave);
    const ac = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 2, 44100); const ab = await ac.decodeAudioData(await blob.arrayBuffer()), d = ab.getChannelData(0), passo = Math.max(1, Math.floor(d.length / n)), out = [];
    for (let i = 0; i < n; i++) { let m = 0; for (let j = i * passo; j < Math.min(d.length, (i + 1) * passo); j++) m = Math.max(m, Math.abs(d[j])); out.push(m); }
    const max = Math.max(.05, ...out), r = out.map(x => x / max); this.cache.set(chave, r); return r; },
  desenha(cv, picos, cor, feito = 0) { const W = cv.width = cv.clientWidth * devicePixelRatio || 600, H = cv.height = cv.clientHeight * devicePixelRatio || 60, g = cv.getContext('2d'), n = picos.length, bw = W / n;
    g.clearRect(0, 0, W, H); picos.forEach((p, i) => { const h = Math.max(2 * devicePixelRatio, p * (H - 4)); g.fillStyle = i / n < feito ? cor : 'rgba(150,155,170,.55)'; g.fillRect(i * bw + bw * .15, (H - h) / 2, bw * .7, h); }); },
};

/* ---------- LINKS DE DUBLAGEM (pedido da dona, 06/11/2026): um link para quem vai dublar, sem conta ----------
   Quem pode (preparativos.links) escolhe ANTES de gerar: todas as falas, as de um personagem ou uma fala só; e o prazo: 1 hora ou sem prazo.
   Link de UMA fala/UM personagem morre quando a pessoa clica em "Terminei". Link de vários personagens: quem encerra é o responsável (aqui).
   O que chega fica "aguardando aprovação" (preparativos/<id>/dub/) até alguém aceitar. O token aparece UMA vez (o servidor guarda só o hash). */
const Dub = {
  async pinta(box) {
    if (!box) return; const P = S.P; if (P.novo || !P.mod) { box.innerHTML = ''; return; }
    box.className = 'dub-painel'; box.innerHTML = `<div class="dp-cab">${ic('enviar', 17)}<b>Links para dublar</b><span class="esp"></span>${pode('links') ? `<button class="bt" data-dub-novo>${ic('mais', 14)} Criar link</button>` : ''}</div><div class="dp-corpo">${giro('Carregando')}</div>`;
    $('[data-dub-novo]', box)?.addEventListener('click', () => this.novo(box));
    let r; try { r = await Nuvem.acao({ acao: 'dublar', op: 'lista', id: P.id }); } catch (e) { $('.dp-corpo', box).innerHTML = `<small class="erro">${esc(e.message)}</small>`; return; }
    this.mostra(box, r);
  },
  nomeFala(id) { for (const p of S.P.partes) for (const f of p.falas) if (f.id === id) return f; return null; },
  mostra(box, r) {
    const corpo = $('.dp-corpo', box), links = r.links || [], pend = r.pend || []; { const d = box.closest('details'), pl = d && $('.fl-pend', d); if (pl) { pl.hidden = !pend.length; pl.textContent = pend.length + ' para aprovar'; if (pend.length) d.open = true; } }
    corpo.innerHTML = `${pend.length ? `<div class="dp-pend"><small class="dp-t">${ic('alerta', 13)} Chegaram ${pend.length} gravaç${pend.length === 1 ? 'ão' : 'ões'} esperando aprovação</small>${pend.map(x => { const f = this.nomeFala(x.fala);
        return `<div class="dp-item" data-k="${esc(x.k)}"><button class="redondo" data-ouve title="Ouvir">${ic('play', 15)}</button><div class="dp-tx"><b>${esc(f?.personagem || '?')}</b> ${esc((f?.texto || '').slice(0, 90))}<small>por ${esc(x.quem?.nome || 'alguém')}${x.quem?.conta ? '' : ' (sem conta)'} · ${tempo(x.dur)} · ${esc(quando(x.em))}</small></div>
          ${pode('gravar') ? `<button class="bt pri" data-aceita>${ic('ok', 14)} Aceitar</button><button class="bt" data-recusa>Recusar</button>` : ''}</div>`; }).join('')}</div>` : ''}
      ${links.length ? links.map(l => `<div class="dp-link" data-h="${esc(l.h)}"><div class="dp-tx"><b>${esc(l.rotulo)}</b><small>${l.falas.length} fala${l.falas.length === 1 ? '' : 's'} · ${l.expira ? 'vence ' + new Date(l.expira).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'sem prazo'} · ${l.unico ? 'morre quando a pessoa terminar' : 'você encerra quando acabar'} · ${l.total} envio${l.total === 1 ? '' : 's'}${l.quem ? ' · ' + esc(l.quem.nome) : ''}</small></div>${pode('links') ? `<button class="bt" data-encerra>Encerrar link</button>` : ''}</div>`).join('')
        : `<small class="dica">Nenhum link ligado. ${pode('links') ? 'Crie um para mandar a quem vai dublar (a pessoa não precisa de conta).' : ''}</small>`}`;
    $$('.dp-item', corpo).forEach(it => { const k = it.dataset.k, x = pend.find(y => y.k === k);
      $('[data-ouve]', it).onclick = async e => { const b = e.currentTarget; try { if (S.tocando) { S.tocando.pause(); S.tocando = null; } const a = new Audio(URL.createObjectURL(await Nuvem.audio(k))); S.tocando = a; a.play(); b.innerHTML = ic('parar', 15); a.onended = a.onpause = () => { b.innerHTML = ic('play', 15); }; } catch (er) { aviso(er.message, 'erro'); } };
      $('[data-aceita]', it)?.addEventListener('click', async e => { e.currentTarget.disabled = true; try { const r2 = await Nuvem.acao({ acao: 'dublar', op: 'aceita', id: S.P.id, k }); const f = this.nomeFala(x.fala); if (f) { if (r2.de) f.audios = { ...(f.audios || {}), [r2.de]: { audio: r2.audio, duracao: r2.duracao } }; else { f.audio = r2.audio; f.duracao = r2.duracao; delete f.regravar; } }
        if (!S.sujo && r2.mod) { S.P.mod = r2.mod; S.base.mod = r2.mod; } S.lista = null; aviso('Gravação aceita: agora é o áudio da fala.', 'ok'); Falas.pinta(Falas.c); } catch (er) { aviso(er.message, 'erro'); e.currentTarget.disabled = false; } });
      $('[data-recusa]', it)?.addEventListener('click', async () => { if (!await pergunta('Recusar esta gravação?', 'Ela é apagada da nuvem. A fala continua como estava.', [['Cancelar', false], ['Recusar', true, 'perigo']])) return; try { this.mostra(box, await Nuvem.acao({ acao: 'dublar', op: 'recusa', id: S.P.id, k })); } catch (er) { aviso(er.message, 'erro'); } }); });
    $$('.dp-link', corpo).forEach(it => $('[data-encerra]', it)?.addEventListener('click', async () => { if (!await pergunta('Encerrar este link?', 'Ele para de funcionar na hora. O que já foi enviado continua aqui esperando aprovação.', [['Cancelar', false], ['Encerrar', true, 'perigo']])) return;
      try { this.mostra(box, await Nuvem.acao({ acao: 'dublar', op: 'desliga', id: S.P.id, link: it.dataset.h })); aviso('Link encerrado.', 'ok'); } catch (er) { aviso(er.message, 'erro'); } }));
  },
  // CRIAR: escolher o alcance (todas / um personagem / uma fala) e o prazo ANTES de gerar
  novo(box) {
    const P = S.P, ps = Roteiro.personagens(P.partes), todas = P.partes.flatMap(p => p.falas);
    // janela compacta: cabeçalho, corpo que rola por dentro e rodapé SEMPRE visível (cabe em notebook e celular)
    const m = h(`<div class="modal"><div class="caixa dn-caixa" role="dialog" aria-label="Criar link para dublar">
      <div class="dn-cab"><b>Criar link para dublar</b><small>A pessoa vê só estas falas, grava e envia, sem conta. O que chegar espera você aceitar.</small></div>
      <div class="dn-corpo">
        <fieldset class="dn-sec"><legend>Quais falas</legend>
          <label class="dn-op"><input type="radio" name="alc" value="pers" checked><span>De um personagem</span></label>
          <div class="dn-campo" data-campo="pers"><select data-pers>${ps.map(p => `<option value="${esc(p.chave)}">${esc(p.nome)} · ${p.n} fala${p.n === 1 ? '' : 's'}</option>`).join('')}</select></div>
          <label class="dn-op"><input type="radio" name="alc" value="fala"><span>Uma fala só</span></label>
          <div class="dn-campo" data-campo="fala" hidden><select data-fala>${todas.map((f, n) => `<option value="${esc(f.id)}">${n + 1}. ${esc(f.personagem)}: ${esc(f.texto.slice(0, 50))}</option>`).join('')}</select></div>
          <label class="dn-op"><input type="radio" name="alc" value="todas"><span>Todas as falas (${todas.length})</span></label>
          <label class="dn-op dn-chk" data-so><input type="checkbox" data-sem checked><span>Só as que ainda não têm áudio</span></label></fieldset>
        <fieldset class="dn-sec"><legend>Prazo</legend>
          <div class="dn-seg" role="radiogroup"><button type="button" class="on" data-prazo="hora" role="radio" aria-checked="true">1 hora</button><button type="button" data-prazo="sempre" role="radio" aria-checked="false">Sem prazo</button></div>
          <small class="dn-exp" data-quem-fecha></small></fieldset>
        <fieldset class="dn-sec"><legend>Nome do link <span>(só para você)</span></legend><input type="text" class="dn-txt" data-rot maxlength="60" placeholder="Ex.: Clara — episódio 3"></fieldset>
      </div>
      <div class="dn-rod"><button class="bt" data-n>Cancelar</button><button class="bt pri" data-s>${ic('enviar', 14)} Criar link</button></div></div></div>`);
    let prazo = 'hora';
    const fecha = () => m.remove(), alc = () => $('input[name=alc]:checked', m).value;
    const escolhidas = () => { const so = $('[data-sem]', m).checked, l = alc() === 'fala' ? todas.filter(f => f.id === $('[data-fala]', m).value) : alc() === 'pers' ? todas.filter(f => Roteiro.quem(f).includes($('[data-pers]', m).value)) : todas; return alc() === 'fala' ? l : l.filter(f => !so || !f.audio); };
    const explica = () => { const a = alc(), l = escolhidas(), varios = new Set(l.flatMap(f => Roteiro.quem(f))).size > 1;
      $$('[data-campo]', m).forEach(c => { c.hidden = c.dataset.campo !== a; }); $('[data-so]', m).hidden = a === 'fala';
      $('[data-quem-fecha]', m).textContent = `${l.length} fala${l.length === 1 ? '' : 's'}. ` + (prazo === 'hora' ? 'Vale 1 hora e depois é apagado. ' : 'Sem prazo. ') + (varios ? 'Vários personagens: acaba quando VOCÊ encerrar.' : 'Morre quando a pessoa clicar em "Terminei".');
      const rot = $('[data-rot]', m); if (!rot.dataset.mexeu) rot.value = a === 'todas' ? 'Todas as falas' : a === 'pers' ? (ps.find(p => p.chave === $('[data-pers]', m).value)?.nome || '') : 'Uma fala'; };
    m.addEventListener('change', explica); $('[data-rot]', m).oninput = e => { e.target.dataset.mexeu = 1; };
    $$('[data-prazo]', m).forEach(b => b.onclick = () => { prazo = b.dataset.prazo; $$('[data-prazo]', m).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); explica(); });
    explica();
    $('[data-n]', m).onclick = fecha; m.onclick = e => { if (e.target === m) fecha(); }; m.onkeydown = e => { if (e.key === 'Escape') fecha(); };
    $('[data-s]', m).onclick = async e => { const l = escolhidas(); if (!l.length) return aviso('Nenhuma fala com essa escolha (todas já têm áudio?).', 'info'); const b = e.currentTarget; b.disabled = true; b.innerHTML = giro('Criando');
      try { const r = await Nuvem.acao({ acao: 'dublar', op: 'novo', id: P.id, falas: l.map(f => f.id), rotulo: $('[data-rot]', m).value, prazo, ...(alc() === 'pers' ? { de: $('[data-pers]', m).value } : {}) });
        const url = location.origin + '/dublar/#t=' + r.token; fecha(); this.mostra(box, r); this.mostraLink(url); } catch (er) { aviso(er.message, 'erro'); b.disabled = false; b.innerHTML = `${ic('enviar', 14)} Criar link`; } };
    document.body.appendChild(m); $('input[name=alc]:checked', m).focus(); },
  mostraLink(url) {
    const m = h(`<div class="modal"><div class="caixa larga"><b>Link pronto</b><p>Copie e mande para quem vai dublar. <b>Ele só aparece agora</b>: se perder, crie outro.</p>
      <div class="dn-url"><input type="text" readonly value="${esc(url)}"><button class="bt pri" data-cp>${ic('copiar', 14)} Copiar</button></div><div class="bts"><button class="bt" data-n>Fechar</button></div></div></div>`);
    $('[data-cp]', m).onclick = async () => { try { await navigator.clipboard.writeText(url); aviso('Link copiado.', 'ok'); } catch { $('input', m).select(); document.execCommand('copy'); aviso('Link copiado.', 'ok'); } };
    $('[data-n]', m).onclick = () => m.remove(); document.body.appendChild(m); $('input', m).select(); },
};
/* ---------- TIRAR DA NUVEM E MANTER NESTE COMPUTADOR (pedido da dona via Animador, 06/11) ----------
   Sempre pergunta (avisa se um programa já usou). PRIMEIRO guarda a cópia local com os áudios (rascunho + gravações deste computador,
   aparece em "Neste computador"); SÓ ENTÃO apaga da nuvem. Se apagar falhar, a cópia local sai (para não ficar duplicado). */
async function tiraDaNuvem(id) {
  if (!pode('roteiro')) return aviso('Sua conta não pode mudar roteiros.', 'erro');
  let P; try { P = S.P?.id === id && S.P.mod && !S.P.novo ? JSON.parse(JSON.stringify(S.P)) : await Nuvem.abre(id); } catch (e) { return aviso(e.message, 'erro'); }
  const usos = (P.usadoPor || []).map(u => `${DESTINOS[u.programa] || u.programa}${u.projeto ? ' (' + u.projeto + ')' : ''}`);
  const ok = await confirmaHtml('Tirar da nuvem e manter neste computador?', `<p>"${esc(P.nome || 'Roteiro')}" sai da nuvem: a equipe deixa de ver e gravar. Fica só neste computador, com o texto e os áudios.</p>
    ${usos.length ? `<p class="aten-box">${ic('alerta', 15)} Já foi usado: <b>${esc(usos.join(', '))}</b>. Esses programas não vão mais achar o roteiro na nuvem.</p>` : ''}`, 'Tirar da nuvem', true);
  if (!ok) return;
  const fs = P.partes.flatMap(p => p.falas), guardados = []; let n = 0;
  aviso('Guardando a cópia neste computador…', 'info', 2500);
  try {
    for (const f of fs) { const alvos = [[f.audio, f.id, f.duracao], ...Object.entries(f.audios || {}).map(([k, x]) => [x?.audio, f.id + '@' + k, x?.duracao])];
      for (const [k, chaveL, dur] of alvos) { if (!k) continue; const blob = await Nuvem.audio(k); await DB.put('aud', P.id + '/' + chaveL, { blob, duracao: dur || 0, em: Date.now() }); guardados.push(P.id + '/' + chaveL); n++; } }
    const L = JSON.parse(JSON.stringify(P)); for (const f of L.partes.flatMap(p => p.falas)) { f.audio = null; f.duracao = 0; delete f.audios; delete f.regravar; }
    L.novo = true; L.mod = 0; delete L.usadoPor; await DB.put('rasc', L.id, { P: L, base: { mod: 0, roteiro: L.roteiro || '' }, em: Date.now() });
  } catch (e) { for (const k of guardados) await DB.del('aud', k).catch(() => { }); return aviso('Não consegui guardar a cópia neste computador, então nada saiu da nuvem: ' + e.message, 'erro'); }
  try { await Nuvem.pede('/preparativos/arquivo?k=' + encodeURIComponent(`preparativos/${P.id}/`), { method: 'DELETE' }); }
  catch (e) { await DB.del('rasc', P.id).catch(() => { }); for (const k of guardados) await DB.del('aud', k).catch(() => { }); return aviso('A nuvem não deixou tirar (' + e.message + '). Nada mudou.', 'erro'); }
  S.lista = null; aviso(`Tirado da nuvem. Ficou neste computador${n ? ` com ${n} áudio${n === 1 ? '' : 's'}` : ''}.`, 'ok', 5000);
  const r = await DB.get('rasc', P.id); if (S.P?.id === P.id) { S.sujo = false; S.P = null; return abrePrep(r.P, r.base, true); } if (!S.P) pintaInicio(true);
}
/* ---------- "STICK E PROBLEMS": SÃO PERSONAGENS DIFERENTES? (pedido da dona) ----------
   Fala com "e", ",", "+" ou "&" no nome em que alguma parte ainda não é personagem conhecido: pergunta UMA vez e lembra a resposta
   (no roteiro, P.varios, para a equipe toda, e neste computador para os próximos roteiros). */
const Varios = {
  _perg: new Set(),
  locais() { try { return JSON.parse(localStorage.getItem('ep-prep-varios') || '{}') || {}; } catch { return {}; } },
  usa(P) { Roteiro.usaDecisoes({ ...this.locais(), ...(P?.varios || {}) }); },
  async confere() { const P = S.P; if (!P || !(pode('roteiro') || pode('organizar'))) return;
    for (const nome of Roteiro.duvidas(P.roteiro || '')) { const k = Roteiro.chave(nome); if (this._perg.has(k)) continue; this._perg.add(k);
      const partes = nome.split(Roteiro.SEP).filter(Boolean);
      const r = await pergunta(`"${nome}" são personagens diferentes?`, `Se sim, a fala fica de ${partes.join(' e ')} falando juntos (cada um grava a sua, ou todos juntos). Se não, "${nome}" é o nome de um personagem só.`, [['Não, é um nome só', false], ['Sim, separar', true, 'pri']]);
      if (!S.P || S.P !== P) return; P.varios = { ...(P.varios || {}), [k]: r }; try { localStorage.setItem('ep-prep-varios', JSON.stringify({ ...this.locais(), [k]: r })); } catch { }
      this.usa(P); P.partes = Roteiro.separa(P.roteiro || '', P.partes); marcaSujo(); S.ed?.repinta(); pintaLado(); if (S.sub !== 'roteiro') pintaCorpo(); } },
};
Cortes.aoAvisar(t => { if (t) aviso(t, 'info', 15000); }); // "convertendo o arquivo…"
const Falas = {
  quem: null, rec: null,
  async pinta(c) {
    const P = S.P; Varios.confere(); const ps = Roteiro.personagens(P.partes), cs = coresDoRoteiro(); this.c = c;
    try { this.quem = this.quem ?? localStorage.getItem('ep-prep-quem') ?? ''; } catch { this.quem = this.quem || ''; }
    if (this.quem && !ps.some(p => p.chave === this.quem)) this.quem = '';
    const locais = await this.locais(); this._loc = locais; let num = 0;
    const visiveis = P.partes.map(p => ({ ...p, falas: p.falas.flatMap(f => { const n = ++num; if (this.quem) return Roteiro.quem(f).includes(this.quem) ? [{ f, n }] : [];
      if (!this.varios(f)) return [{ f, n }]; return [...Roteiro.quem(f).map(k => ({ f: this.versao(f, k), n })), ...(f.audio ? [{ f: this.versao(f, ''), n }] : [])]; }) })).filter(p => p.falas.length);
    const vagas = P.partes.flatMap(p => p.falas).flatMap(f => this.varios(f) ? Roteiro.quem(f).map(k => !!(f.audios?.[k]?.audio || f.audio)) : [!!f.audio]), total = vagas.length, feitas = vagas.filter(Boolean).length; // cada personagem da fala de vários conta
    const aberto = k => { try { return localStorage.getItem('ep-prep-sec-' + k) === '1'; } catch { return false; } };
    c.innerHTML = `<div class="falas falas2">
      <div class="fl-topo"><div class="fl-prog"><b>Falas e gravação</b><span><b>${feitas}</b> de <b>${total}</b> falas gravadas</span><div class="barra"><i style="width:${total ? feitas / total * 100 : 0}%"></i></div></div>
        ${pode('gravar') && ps.length ? `<div class="fl-acoes"><button class="bt pri" data-seq title="Grava as falas ${this.quem ? 'deste personagem' : 'do roteiro'} uma atrás da outra; Enter passa para a próxima">${ic('mic', 15)} Gravar em sequência</button><button class="bt" data-varias title="Um ou VÁRIOS arquivos (um por personagem): o Preparativos separa cada um nas falas sozinho">${ic('baixo', 15)} Subir áudio(s) com várias falas</button>${this._lote?.length ? `<button class="bt" data-lote title="Ver como ficou o último envio de vários áudios">${ic('ok', 15)} Ver o último envio</button>` : ''}</div>` : ''}</div>
      <div class="fl-quem" role="tablist" aria-label="Quem vai gravar">
        <button class="fl-q ${!this.quem ? 'on' : ''}" data-grava="" role="tab"><span class="fl-q-ic">${ic('pessoa', 15)}</span><span>Todos</span><small>${feitas}/${total}</small></button>
        ${ps.map(p => `<button class="fl-q ${this.quem === p.chave ? 'on' : ''}" data-grava="${esc(p.chave)}" role="tab" style="--c:${cs.get(p.chave)}">${ava(p.nome, cs.get(p.chave), 'p')}<span>${esc(p.nome)}</span><small>${p.g}/${p.n}</small><i class="fl-q-b" style="width:${p.n ? p.g / p.n * 100 : 0}%"></i></button>`).join('')}
      </div>
      ${pode('gravar') ? `<details class="fl-sec" data-sec="mic" ${aberto('mic') ? 'open' : ''}><summary>${ic('mic', 15)} Microfone <small>escolher, testar, filtros e volume</small></summary><div class="mic-painel"></div></details>` : ''}
      ${pode('gravar') || pode('links') ? `<details class="fl-sec" data-sec="dub" ${aberto('dub') ? 'open' : ''}><summary>${ic('enviar', 15)} Links para dublar <small>para alguém de fora gravar</small><span class="fl-pend" hidden></span></summary><div class="dub-painel"></div></details>` : ''}
      <div class="seq-pend"></div>
      <div class="env"></div>
      ${P.novo || S.sujo && !P.mod ? `<p class="aviso-linha">${ic('alerta', 15)} Mande o roteiro para a nuvem antes de enviar as gravações (elas ficam guardadas aqui enquanto isso).</p>` : ''}
      ${!ps.length ? '<div class="vazio">Ainda não há falas. Escreva o roteiro como <b>Nome: fala</b>.</div>' : ''}
      ${visiveis.map(p => `<div class="parte"><h3>${esc(p.nome)}</h3>${p.falas.map(({ f, n }) => this.linha(f, n, locais.get(f.id + this.suf(f)), cs)).join('')}</div>`).join('')}</div>`;
    $$('[data-grava]', c).forEach(b => b.onclick = () => { this.quem = b.dataset.grava; try { localStorage.setItem('ep-prep-quem', this.quem); } catch { } this.pinta(c); });
    $$('.fala', c).forEach(el => { const f0 = this.acha(el.dataset.f); if (!f0) return; const f = el.dataset.vez != null && this.varios(f0) ? this.versao(f0, el.dataset.vez) : f0;
      $('[data-gravar]', el)?.addEventListener('click', () => this.grava(f, el));
      $('[data-ouvir]', el)?.addEventListener('click', e => this.ouve(f, e.currentTarget));
      $('[data-tirar]', el)?.addEventListener('click', async () => { await DB.del('aud', this.chaveL(f)); this.pinta(c); });
      $('[data-subir]', el)?.addEventListener('click', () => this.sobe(f));
      $('[data-edita]', el)?.addEventListener('click', () => this.editaAudio(f));
      $$('[data-ouve-outro]', el).forEach(b => b.onclick = async () => { const a = await this.audioOutro(f, b.dataset.ouveOutro).catch(e => { aviso(e.message, 'erro'); return null; }); if (!a) return; if (S.tocando) S.tocando.pause(); S.tocando = a; a.play(); });
      $$('[data-grava-ouvindo]', el).forEach(b => b.onclick = () => this.grava(f, el, b.dataset.gravaOuvindo));
      // ANDAR PELO ÁUDIO: clicar/arrastar na onda vai para aquele ponto (tocando ou não)
      const bx = $('.onda-box', el); bx.onpointerdown = ev => { ev.preventDefault(); const fr = e2 => { const r = bx.getBoundingClientRect(); return Math.max(0, Math.min(1, (e2.clientX - r.left) / r.width)); };
        const vai = e2 => { const a = S.tocando; if (a && a._f === f.id && a.duration) a.currentTime = fr(e2) * a.duration; };
        if (S.tocando?._f === f.id) vai(ev); else this.ouve(f, $('[data-ouvir]', el), fr(ev));
        const mv = e2 => vai(e2), fim = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', fim); }; addEventListener('pointermove', mv); addEventListener('pointerup', fim); }; });
    this.pintaEnvio(locais);
    $('[data-seq]', c)?.addEventListener('click', () => this.emSequencia());
    $('[data-varias]', c)?.addEventListener('click', () => this.variasFalas());
    $('[data-lote]', c)?.addEventListener('click', () => this.mostraLote());
    $$('.fl-sec', c).forEach(d => d.ontoggle = () => { try { localStorage.setItem('ep-prep-sec-' + d.dataset.sec, d.open ? '1' : '0'); } catch { } });
    // gravação em sequência que não chegou a ser revisada (a aba fechou no meio): continua daqui
    if (locais.has('_seq')) { const sq = locais.get('_seq'), bx = $('.seq-pend', c); bx.innerHTML = `<div class="faixa-env">${ic('alerta', 16)}<span>Há uma <b>gravação em sequência</b> que não foi revisada (${new Date(sq.em).toLocaleString('pt-BR')}).</span><span class="esp"></span><button class="bt pri" data-seq-rev>Revisar</button><button class="bt" data-seq-fora>Descartar</button></div>`;
      $('[data-seq-rev]', bx).onclick = () => this.revisaSeq(new Blob(sq.chunks, { type: sq.tipo || 'audio/webm' }), sq.trechos || []); $('[data-seq-fora]', bx).onclick = async () => { if (await pergunta('Descartar a gravação em sequência?', 'Ela ainda não foi separada nas falas.', [['Cancelar', false], ['Descartar', true, 'perigo']])) { await DB.del('aud', P.id + '/_seq'); this.pinta(c); } }; }
    Mic.pinta($('.mic-painel', c)); Dub.pinta($('.dub-painel', c));
    // a onda das gravações deste computador (e das da nuvem que já foram ouvidas nesta aba)
    for (const el of $$('.fala', c)) { const f0 = this.acha(el.dataset.f); if (!f0) continue; const f = el.dataset.vez != null && this.varios(f0) ? this.versao(f0, el.dataset.vez) : f0; const l = locais.get(f.id + this.suf(f)), au = this.audioDe(f), cor = getComputedStyle(el).getPropertyValue('--c').trim() || '#4fe08f';
      const k = l ? `l:${this.chaveL(f)}:${l.em}` : au ? 'n:' + au : null; if (!k) continue;
      if (l) Onda.picos(k, l.blob).then(pk => { const bx = $('.onda-box', el); bx.hidden = false; Onda.desenha($('.onda', el), pk, cor); }).catch(() => { });
      else if (Onda.cache.has(k)) { const bx = $('.onda-box', el); bx.hidden = false; Onda.desenha($('.onda', el), Onda.cache.get(k), cor); } }
  },
  acha(id) { id = String(id).split('@')[0]; for (const p of S.P.partes) for (const f of p.falas) if (f.id === id) return f; return null; },
  // FALA DE VÁRIOS: com um personagem escolhido em "Quem vai gravar?", grava a VERSÃO DELE (audios[chave]); no "Todos", a de todos juntos (audio)
  varios: f => Array.isArray(f?.personagens) && f.personagens.length > 1,
  vez(f) { if (f && Object.prototype.hasOwnProperty.call(f, '_vz')) return f._vz; return this.varios(f) && this.quem && Roteiro.quem(f).includes(this.quem) ? this.quem : ''; },
  versao(f, k) { const v = Object.create(f); v._vz = k; return v; },
  suf(f) { const v = this.vez(f); return v ? '@' + v : ''; },
  chaveL(f) { return S.P.id + '/' + f.id + this.suf(f); },
  audioDe(f) { const v = this.vez(f); return v ? f.audios?.[v]?.audio || null : f.audio; },
  durDe(f) { const v = this.vez(f); return v ? f.audios?.[v]?.duracao || 0 : f.duracao; },
  // ---------- áudio com várias falas, gravar em sequência, editar um áudio (js: dublar/cortes.js) ----------
  alvos() { const fs = []; for (const p of S.P.partes) for (const f of p.falas) if (!this.quem || Roteiro.quem(f).includes(this.quem)) fs.push(f); return fs; },
  paraCortes(f) { const vz = this.vez(f), outros = this.varios(f) ? f.personagens.filter(p => Roteiro.chave(p) !== vz) : [];
    return { id: f.id, rotulo: vz ? (f.personagens.find(p => Roteiro.chave(p) === vz) || f.personagem) : f.personagem, texto: f.texto, nota: f.nota, junto: vz ? outros.join(', ') : '' }; },
  async guardaPedacos(ps) { for (const x of ps) { const f = this.acha(x.fala); if (f) await DB.put('aud', this.chaveL(f), { blob: x.blob, duracao: x.duracao, em: Date.now() }); } this._quemVolta?.();
    aviso(`${ps.length} fala${ps.length === 1 ? '' : 's'} com áudio novo neste computador. Ouça e clique em "Enviar agora".`, 'ok', 5000); this.pinta(this.c); },
  // TRANSCRIÇÃO só quando a pessoa pede; o resultado fica guardado neste navegador (não repete a mesma)
  transcritor() { if (!pode('transcrever')) return null; return async A => {
    let h = A.d.length + ':' + A.sr; for (let i = 0; i < A.d.length; i += Math.max(1, A.d.length >> 12)) h += ':' + Math.round(A.d[i] * 1e4); const k = 'tr:' + h.length + ':' + [...h].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    try { const g = await TH.get(k); if (g?.palavras) return g.palavras; } catch { }
    const ps = await Cortes.paraTranscrever(A), palavras = [];
    for (const [i, p] of ps.entries()) { aviso(`Transcrevendo ${i + 1} de ${ps.length}…`, 'info', 4000); const r = await Nuvem.pede('/transcrever', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ audio: p.base64, language: 'pt', de: 'preparativos', prompt: this.alvos().slice(0, 8).map(f => f.texto).join(' ').slice(0, 280) }) });
      for (const sg of r.segments || []) { const ws = sg.words?.length ? sg.words : [{ w: sg.text, s: sg.start, e: sg.end }]; for (const w of ws) palavras.push({ w: w.w, s: (+w.s || 0) + p.desde, e: (+w.e || 0) + p.desde }); } }
    TH.put(k, { palavras, em: Date.now() }).catch(() => { }); return palavras; }; },
  // ANTES de analisar: de quem é o áudio e quais falas (a separação só usa ESSAS, na ordem do roteiro; nunca põe pedaço em fala de outro)
  // o personagem cujo nome mais parece com o nome do arquivo ("stick_falas_ep3.mp3" → Stick)
  pelaNomeArq(nome, ps) { const n = Roteiro.chave(String(nome || '').replace(/\.[a-z0-9]{2,5}$/i, '')).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(), toks = n.split(' ').filter(Boolean); if (!toks.length) return null;
    const dist = (a, b) => { const d = [...Array(b.length + 1).keys()]; for (let i = 1; i <= a.length; i++) { let p = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } } return d[b.length]; };
    let melhor = null, nota = 0; for (const p of ps) { const pk = p.chave.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(), junto = pk.replace(/ /g, '');
      let sc = n.includes(pk) || n.replace(/ /g, '').includes(junto) ? 1 : 0; for (const t of toks) if (t.length >= 3) { const r = 1 - dist(t, junto) / Math.max(t.length, junto.length); if (r > sc) sc = r; }
      if (sc > nota) { nota = sc; melhor = p; } } return nota >= .7 ? melhor : null; },
  escolheFalas(nomeArq) { return new Promise(ok => { const P = S.P, cs = coresDoRoteiro(), ps = Roteiro.personagens(P.partes), todas = P.partes.flatMap(p => p.falas);
    const sug = nomeArq ? this.pelaNomeArq(nomeArq, ps) : null, marcado = sug ? sug.chave : this.quem;
    const m = h(`<div class="modal"><div class="caixa dn-caixa" role="dialog" aria-label="Subir um áudio com várias falas"><div class="dn-cab"><b>Subir um áudio com várias falas</b><small>${nomeArq ? `Arquivo: <b>${esc(nomeArq)}</b>. ` : ''}De quem é o áudio e quais falas ele tem, na ordem do roteiro.</small></div>
      <div class="dn-corpo"><fieldset class="dn-sec"><legend>De quem é este áudio?</legend><div class="vf-quem">${ps.map(p => `<label class="vf-p" style="--c:${cs.get(p.chave)}"><input type="radio" name="vq" value="${esc(p.chave)}" ${marcado === p.chave ? 'checked' : ''}>${ava(p.nome, cs.get(p.chave), 'p')}<span>${esc(p.nome)}</span>${sug?.chave === p.chave ? '<em class="vf-sug">sugerido pelo nome do arquivo</em>' : ''}<small>${p.n}</small></label>`).join('')}
        <label class="vf-p"><input type="radio" name="vq" value="" ${!marcado ? 'checked' : ''}><span>Vários personagens (o roteiro inteiro, em ordem)</span></label></div></fieldset>
      <fieldset class="dn-sec"><legend>Quais falas?</legend><label class="dn-op"><input type="radio" name="vs" value="todas" checked><span>Todas desse personagem</span></label><label class="dn-op"><input type="radio" name="vs" value="sem"><span>Só as que ainda não têm áudio</span></label><label class="dn-op"><input type="radio" name="vs" value="lista"><span>Escolher na lista</span></label>
        <div class="vf-lista" hidden></div><small class="dn-exp" data-conta></small></fieldset>
      ${pode('transcrever') ? `<fieldset class="dn-sec"><legend>Como achar as falas</legend><label class="dn-op"><input type="checkbox" data-trans checked><span>Pelo texto (transcrição: mais certo; usa a cota e fica guardada neste navegador)</span></label><small class="dn-exp">Sem isso, separa pelas pausas, e dá para ajustar à mão.</small></fieldset>` : ''}</div>
      <div class="dn-rod"><button class="bt" data-n>Cancelar</button><button class="bt pri" data-s>${ic('ok', 14)} Separar</button></div></div></div>`);
    const quem = () => $('input[name=vq]:checked', m)?.value || '', modo = () => $('input[name=vs]:checked', m).value;
    const base = () => todas.filter(f => !quem() || Roteiro.quem(f).includes(quem())), temAudio = f => { const v = quem() && this.varios(f) ? f.audios?.[quem()]?.audio : f.audio; return !!v || this._loc?.has(f.id + (quem() && this.varios(f) ? '@' + quem() : '')); };
    const pintaL = () => { const l = $('.vf-lista', m); l.hidden = modo() !== 'lista'; if (!l.hidden) { const marc = new Set($$('input[data-f]:checked', l).map(x => x.dataset.f)); l.innerHTML = base().map(f => `<label class="dn-op"><input type="checkbox" data-f="${esc(f.id)}" ${!l.dataset.ja || marc.has(f.id) ? 'checked' : ''}><span><b>${esc(f.personagem)}:</b> ${esc(f.texto.slice(0, 70))}</span></label>`).join(''); l.dataset.ja = 1; }
      $('[data-conta]', m).textContent = `${escolhidas().length} fala(s) — o áudio vai ser separado só nelas, nesta ordem.`; };
    const escolhidas = () => modo() === 'lista' ? base().filter(f => $(`.vf-lista input[data-f="${CSS.escape(f.id)}"]`, m)?.checked) : modo() === 'sem' ? base().filter(f => !temAudio(f)) : base();
    m.addEventListener('change', e => { if (e.target.name === 'vq') delete $('.vf-lista', m).dataset.ja; pintaL(); }); pintaL();
    const fim = v => { m.remove(); ok(v); }; $('[data-n]', m).onclick = () => fim(null); m.onclick = e => { if (e.target === m) fim(null); }; m.onkeydown = e => { if (e.key === 'Escape') fim(null); };
    $('[data-s]', m).onclick = () => { const l = escolhidas(); if (!l.length) return aviso('Nenhuma fala com essa escolha.', 'info'); fim({ quem: quem(), falas: l, transcrever: !!$('[data-trans]', m)?.checked }); };
    document.body.appendChild(m); }); },
  async variasFalas() { const inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true; inp.accept = 'audio/*,video/*,.mp3,.wav,.ogg,.oga,.opus,.m4a,.webm,.mpeg,.mpg,.mp2,.mpga,.flac,.aac,.wma,.amr,.3gp,.mov,.mp4,.mkv,.avi';
    inp.onchange = async () => { if (inp.files.length > 1) return this.variosArquivos([...inp.files]); const arq = inp.files[0]; if (!arq) return; if (arq.size > 200 * 1048576) return aviso('Esse arquivo é grande demais (máx. 200 MB).', 'erro');
      const esc0 = await this.escolheFalas(arq.name); if (!esc0) return; this.quem = esc0.quem; try { localStorage.setItem('ep-prep-quem', this.quem); } catch { } // a versão certa (fala de vários) é a do personagem escolhido
      const fs = esc0.falas; aviso('Abrindo o áudio…', 'info', 2500);
      try { const A = await Cortes.decodifica(arq), marcas = Cortes.silencios(A, fs.length);
        await Cortes.revisao({ dados: A, blob: arq, falas: fs.map(f => this.paraCortes(f)), extras: S.P.partes.flatMap(p => p.falas).filter(f => !fs.includes(f)).map(f => this.paraCortes(f)), marcas, titulo: `Separar "${arq.name}" em ${fs.length} fala(s)${esc0.quem ? ' de ' + (fs[0] ? (this.paraCortes(fs[0]).rotulo) : '') : ''}`, aviso: esc0.transcrever ? 'Transcrevendo para achar cada fala pelo texto… enquanto isso, os cortes são pelas pausas.' : Cortes.avisoPausas(marcas, fs.length) + ' Ou use "Transcrever para acertar".', transcrever: this.transcritor(), autoTranscrever: esc0.transcrever,
          aoSalvar: ps => this.guardaPedacos(ps), aoFechar: () => this.pinta(this.c) }); }
      catch (e) { aviso(e.message, 'erro'); } };
    inp.click(); },
  // VÁRIOS ÁUDIOS (um por personagem) DE UMA VEZ: cada um se configura sozinho (personagem pelo nome do arquivo, falas pelo texto ou pelas pausas)
  variosArquivos(arqs) { const P = S.P, cs = coresDoRoteiro(), ps = Roteiro.personagens(P.partes);
    if (arqs.some(a => a.size > 200 * 1048576)) return aviso('Algum arquivo passa de 200 MB.', 'erro');
    const linhas = arqs.map(a => ({ arq: a, quem: this.pelaNomeArq(a.name, ps)?.chave || '' }));
    const m = h(`<div class="modal"><div class="caixa dn-caixa va-caixa" role="dialog" aria-label="Vários áudios"><div class="dn-cab"><b>Separar ${arqs.length} áudios nas falas</b><small>Cada arquivo é de um personagem. O personagem vem do nome do arquivo: confira antes.</small></div>
      <div class="dn-corpo"><div class="va-lista">${linhas.map((l, i) => `<div class="va-l"><span class="va-arq" title="${esc(l.arq.name)}">${ic('mic', 14)} ${esc(l.arq.name)}</span>
        <select data-q="${i}"><option value="">— de quem? —</option>${ps.map(p => `<option value="${esc(p.chave)}" ${l.quem === p.chave ? 'selected' : ''}>${esc(p.nome)} (${p.n})</option>`).join('')}</select>
        <select data-s="${i}"><option value="todas">todas as falas</option><option value="sem">só as sem áudio</option></select></div>`).join('')}</div>
        ${pode('transcrever') ? `<label class="dn-op"><input type="checkbox" data-trans checked><span>Achar as falas pelo texto (transcrição; usa a cota, fica guardada neste navegador)</span></label>` : ''}
        <small class="dn-exp">Depois você vê o resultado de cada um e pode revisar. Os áudios ficam neste computador até "Enviar agora".</small></div>
      <div class="dn-rod"><button class="bt" data-n>Cancelar</button><button class="bt pri" data-s0>${ic('ok', 14)} Separar todos</button></div></div></div>`);
    const fim = () => m.remove(); $('[data-n]', m).onclick = fim; m.onkeydown = e => { if (e.key === 'Escape') fim(); };
    $('[data-s0]', m).onclick = async () => { const esc2 = linhas.map((l, i) => ({ ...l, quem: $(`[data-q="${i}"]`, m).value, modo: $(`[data-s="${i}"]`, m).value })), trans = !!$('[data-trans]', m)?.checked;
      if (esc2.some(l => !l.quem)) return aviso('Escolha de quem é cada áudio.', 'info'); fim(); await this.processaLote(esc2, trans); };
    document.body.appendChild(m); },
  async processaLote(itens, trans) { const P = S.P, quem0 = this.quem, lote = [];
    for (const [n, it] of itens.entries()) { aviso(`Separando ${n + 1} de ${itens.length}: ${it.arq.name}…`, 'info', 6000); this.quem = it.quem;
      const base = P.partes.flatMap(p => p.falas).filter(f => Roteiro.quem(f).includes(it.quem)), temAudio = f => !!this.audioDe(f) || this._loc?.has(f.id + this.suf(f)), fs = it.modo === 'sem' ? base.filter(f => !temAudio(f)) : base;
      const r = { nome: it.arq.name, quem: it.quem, rotulo: Roteiro.personagens(P.partes).find(p => p.chave === it.quem)?.nome || it.quem, falas: fs.map(f => this.paraCortes(f)), ids: fs.map(f => f.id) };
      try { if (!fs.length) throw new Error('nenhuma fala para esse personagem'); const A = await Cortes.decodifica(it.arq); r.A = A; r.blob = it.arq;
        const c = await Cortes.cortesAuto(A, r.falas, trans ? this.transcritor() : null); r.marcas = c.marcas; r.aviso = c.aviso; r.pedacos = (c.marcas.length + 1);
        const ps = await Cortes.codifica(A, c.marcas, r.falas); for (const x of ps) { const f = this.acha(x.fala); if (f) await DB.put('aud', this.chaveL(f), { blob: x.blob, duracao: x.duracao, em: Date.now() }); } r.feitas = ps.length; }
      catch (e) { r.erro = e.message; } lote.push(r); }
    this.quem = quem0; this._lote = lote; await this.pinta(this.c); this.mostraLote(); },
  // o resultado de cada arquivo, com "Revisar" (abre a revisão com os cortes que foram usados)
  mostraLote() { const L = this._lote || []; if (!L.length) return; const cs = coresDoRoteiro();
    const m = h(`<div class="modal"><div class="caixa dn-caixa va-caixa" role="dialog" aria-label="Resultado"><div class="dn-cab"><b>Como ficou: ${L.length} áudio(s)</b><small>Cada fala já tem o seu pedaço neste computador. Confira ouvindo na lista de falas, revise o que precisar e depois clique em "Enviar agora".</small></div>
      <div class="dn-corpo">${L.map((r, i) => `<div class="va-r ${r.erro ? 'erro' : r.feitas < r.falas.length ? 'meio' : 'ok'}" style="--c:${cs.get(r.quem) || '#888'}"><div class="va-r1">${ava(r.rotulo, cs.get(r.quem), 'p')}<b>${esc(r.rotulo)}</b><small>${esc(r.nome)}</small></div>
        <div class="va-r2">${r.erro ? `Não deu: ${esc(r.erro)}` : `<b>${r.feitas}</b> de <b>${r.falas.length}</b> fala(s) com áudio · ${esc(r.aviso || '')}`}</div>${r.A ? `<button class="bt" data-rev="${i}">${ic('lapis', 14)} Revisar os cortes</button>` : ''}</div>`).join('')}</div>
      <div class="dn-rod"><button class="bt pri" data-x>Fechar</button></div></div></div>`);
    $('[data-x]', m).onclick = () => m.remove(); m.onkeydown = e => { if (e.key === 'Escape') m.remove(); };
    $$('[data-rev]', m).forEach(b => b.onclick = async () => { const r = L[+b.dataset.rev], quem0 = this.quem; m.remove(); this.quem = r.quem;
      await Cortes.revisao({ dados: { sr: r.A.sr, d: r.A.d.slice() }, blob: r.blob, falas: r.falas, marcas: r.marcas, titulo: `Revisar: ${r.nome} (${r.rotulo})`, aviso: r.aviso, transcrever: this.transcritor(),
        aoSalvar: async ps => { for (const x of ps) { const f = this.acha(x.fala); if (f) await DB.put('aud', this.chaveL(f), { blob: x.blob, duracao: x.duracao, em: Date.now() }); } r.feitas = ps.length; r.aviso = 'Revisado à mão.'; this.quem = quem0; await this.pinta(this.c); this.mostraLote(); },
        aoFechar: () => { this.quem = quem0; } }); });
    document.body.appendChild(m); },
  async emSequencia() { const fs = this.alvos(); if (!fs.length) return; Mic.paraTeste($('.mic-painel', this.c)); const P = S.P;
    try { await Cortes.sequencia({ falas: fs.map(f => this.paraCortes(f)), abreMic: async () => { const m = await Mic.abre(); return { stream: m.dest.stream, fecha: m.fecha }; },
      guarda: x => x ? DB.put('aud', P.id + '/_seq', x).catch(() => { }) : DB.del('aud', P.id + '/_seq').catch(() => { }),
      aoTerminar: (blob, trechos) => this.revisaSeq(blob, trechos), aoCancelar: () => this.pinta(this.c) }); } catch (e) { aviso(e.message, 'erro'); } },
  async revisaSeq(blob, trechos) { const P = S.P; await DB.put('aud', P.id + '/_seq', { chunks: [blob], tipo: blob.type, trechos, em: Date.now() }).catch(() => { });
    const fs = this.alvos(), ids = fs.map(f => f.id);
    try { const R = await Cortes.paraRevisao(blob, trechos, ids);
      await Cortes.revisao({ dados: R.dados, falas: fs.map(f => this.paraCortes(f)), marcas: R.marcas, dono: R.quem.map(id => ids.indexOf(id)), titulo: 'Revisar a gravação em sequência', aviso: 'Os cortes são os Enter que você apertou. Arraste para acertar.', transcrever: this.transcritor(),
        aoSalvar: async ps => { await DB.del('aud', P.id + '/_seq').catch(() => { }); await this.guardaPedacos(ps); } }); } catch (e) { aviso(e.message, 'erro'); } },
  async editaAudio(f) { const KL = this.chaveL(f), au = this.audioDe(f), l = await DB.get('aud', KL).catch(() => null);
    try { const blob = l?.blob || (au ? await Nuvem.audio(au) : null); if (!blob) return; await Cortes.revisao({ blob, uma: true, titulo: `Editar o áudio: ${f.personagem}: "${String(f.texto).slice(0, 40)}"`,
      aoSalvar: async ([x]) => { await DB.put('aud', KL, { blob: x.blob, duracao: x.duracao, em: Date.now() }); aviso('Áudio editado. Ele fica neste computador até você clicar em "Enviar agora".', 'ok', 5000); this.pinta(this.c); } }); }
    catch (e) { aviso(e.message, 'erro'); } },
  async locais() { const m = new Map(); try { for (const [k, v] of await DB.todos('aud')) if (String(k).startsWith(S.P.id + '/')) m.set(String(k).slice(S.P.id.length + 1), v); } catch { } return m; },
  linha(f, n, local, cs) {
    const vz = this.vez(f), varios = this.varios(f), au = this.audioDe(f), cor = varios ? (vz ? cs.get(vz) : '#9aa0ab') : cs.get(Roteiro.chave(f.personagem)), gravar = pode('gravar');
    const st = local ? `<span class="st aqui">${ic('alerta', 12)} gravada aqui · falta enviar · ${tempo(local.duracao)}</span>` : au ? `<span class="st nuvem">${f.regravar && !vz ? `<span class="aten">${ic('alerta', 12)} o texto mudou, regravar</span>` : `${ic('ok', 12)} na nuvem`} · ${tempo(this.durDe(f))}</span>` : '<span class="st sem">sem áudio</span>';
    const corP = p => cs.get(Roteiro.chave(p)) || corOuPadrao(p), nomes = f.personagens?.map((p, i, l) => `${i ? `<span class="nm-e">${i === l.length - 1 ? ' e ' : ', '}</span>` : ''}<b style="color:${corP(p)}" class="${vz && Roteiro.chave(p) !== vz ? 'nm-outro' : ''}">${esc(p)}</b>`).join('') || '';
    const quemH = varios ? `<div class="quem varios">${vz ? ava(f.personagens.find(p => Roteiro.chave(p) === vz) || vz, corP(f.personagens.find(p => Roteiro.chave(p) === vz) || vz), 'p') : `<span class="avs">${f.personagens.map(p => ava(p, corP(p), 'p')).join('')}</span>`}<span class="nm-v">${nomes}</span><small>${vz ? `versão de ${esc(f.personagens.find(p => Roteiro.chave(p) === vz) || vz)}` : 'todos juntos'}</small></div>`
      : `<div class="quem">${ava(f.personagem, cor, 'p')}<b>${esc(f.personagem)}</b></div>`;
    const outros = varios && vz ? f.personagens.filter(p => Roteiro.chave(p) !== vz) : [];
    const juntoH = outros.length ? `<div class="junto-de"><span>${ic('alerta', 13)} Esta fala é dita <b>ao mesmo tempo</b> que:</span>${outros.map(p => { const ko = Roteiro.chave(p), tem = f.audios?.[ko]?.audio || this._loc?.has(f.id + '@' + ko);
        return `<span class="jd-p">${ava(p, cs.get(ko) || corOuPadrao(p), 'p')}<b style="color:${cs.get(ko) || corOuPadrao(p)}">${esc(p)}</b>${tem ? `<button class="bt mini" data-ouve-outro="${esc(ko)}">${ic('play', 12)} Ouvir</button>${pode('gravar') ? `<button class="bt mini" data-grava-ouvindo="${esc(ko)}" title="Toca a gravação de ${esc(p)} enquanto você grava (use fone)">${ic('mic', 12)} Gravar ouvindo ${esc(p)}</button>` : ''}` : '<small>ainda não gravou</small>'}</span>`; }).join('')}</div>` : '';
    const dicaV = varios && !vz ? `<small class="dica-v">Gravação de todos juntos (opcional): cada personagem também tem a sua linha.</small>` : '';
    return `<div class="fala ${local ? 'local' : au ? 'tem' : ''}" data-f="${esc(f.id)}" ${varios ? `data-vez="${esc(vz)}"` : ''} style="--c:${cor}"><span class="num">${n}</span>
      ${quemH}
      <div class="txt">${f.nota ? `<em>${esc(f.nota)}</em>` : ''}<p>${esc(f.texto)}</p>${st}${juntoH}${dicaV}<div class="onda-box" hidden title="Clique ou arraste para ir a qualquer ponto"><canvas class="onda"></canvas><i class="onda-pos"></i><span class="onda-t"></span></div></div>
      <div class="bts">${local || au ? `<button class="redondo ouvir" data-ouvir title="Ouvir">${ic('play', 16)}</button>` : ''}
      ${gravar ? `<button class="redondo gravar ${local || au ? 'de-novo' : ''}" data-gravar title="${local || au ? 'Regravar' : 'Gravar'}">${ic('mic', 18)}</button>` : ''}
      ${gravar ? `<button class="redondo subir" data-subir title="Usar um áudio já gravado (mp3, wav, ogg, m4a, webm)">${ic('baixo', 16)}</button>` : ''}
      ${gravar && (local || au) ? `<button class="redondo" data-edita title="Editar o áudio: aparar, cortar trecho, volume, zoom">${ic('lapis', 15)}</button>` : ''}
      ${local ? `<button class="redondo" data-tirar title="Jogar fora esta gravação">${ic('lixo', 15)}</button>` : ''}</div></div>`;
  },
  // a gravação de OUTRO personagem da mesma fala (deste computador ou da nuvem), para ouvir/gravar junto
  async audioOutro(f, ko) { const l = await DB.get('aud', S.P.id + '/' + f.id + '@' + ko).catch(() => null), k = f.audios?.[ko]?.audio; const b = l?.blob || (k ? await Nuvem.audio(k) : null); if (!b) throw new Error('Esse personagem ainda não gravou esta fala.'); const a = new Audio(URL.createObjectURL(b)); return a; },
  async grava(f, el, ouvindo) { const KL = this.chaveL(f);
    if (this.rec) { const parar = this.rec.f === f; this.rec.parar(); if (parar) return; }
    let guia = null; if (ouvindo) { try { guia = await this.audioOutro(f, ouvindo); } catch (e) { return aviso(e.message, 'erro'); } aviso('Use fone de ouvido: assim o áudio do outro personagem não entra na sua gravação.', 'info', 5000); }
    Mic.paraTeste($('.mic-painel', this.c));
    let m; try { m = await Mic.abre(); } catch { Mic.pinta($('.mic-painel', this.c)); return aviso('Não consegui usar o microfone. Veja o quadro "Microfone" lá em cima.', 'erro'); }
    const tipo = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => window.MediaRecorder?.isTypeSupported?.(t)) || '';
    const mr = new MediaRecorder(m.dest.stream, { ...(tipo ? { mimeType: tipo } : {}), audioBitsPerSecond: PREP_CONFIG.audioBits }), pedacos = [], t0 = performance.now();
    const bt = $('[data-gravar]', el); bt.classList.add('gravando'); bt.innerHTML = ic('parar', 16); bt.title = 'Parar';
    el.classList.add('gravando'); const st0 = $('.st', el); if (st0) st0.innerHTML = '<span class="rec">● gravando <b class="cron">0:00</b></span>';
    // ONDA AO VIVO: as barrinhas vão entrando pela direita enquanto a pessoa fala
    const bx = $('.onda-box', el), cv = $('.onda', el), cor = getComputedStyle(el).getPropertyValue('--c').trim() || '#ff4d5e'; bx.hidden = false; bx.classList.add('ao-vivo');
    const buf = new Uint8Array(m.an.fftSize), hist = []; let raf, ult = 0;
    const anda = t => { if (t - ult > 45) { ult = t; const { rms } = Mic.nivel(m.an, buf); hist.push(Math.min(1, rms * 3.2)); if (hist.length > 140) hist.shift(); Onda.desenha(cv, [...Array(140 - hist.length).fill(0), ...hist], cor, 1); } raf = requestAnimationFrame(anda); }; raf = requestAnimationFrame(anda);
    const cron = setInterval(() => { const sg = (performance.now() - t0) / 1000; const cr = $('.cron', el); if (cr) cr.textContent = tempo(sg); if (sg > PREP_CONFIG.audioMaxSeg) this.rec?.parar(); }, 200);
    mr.ondataavailable = e => e.data.size && pedacos.push(e.data);
    mr.onstop = async () => { clearInterval(cron); cancelAnimationFrame(raf); m.fecha(); this.rec = null; const dur = (performance.now() - t0) / 1000;
      if (dur < 0.4) { aviso('Gravação curta demais.', 'info'); return this.pinta(this.c); }
      const blob = new Blob(pedacos, { type: mr.mimeType || tipo || 'audio/webm' });
      try { await DB.put('aud', KL, { blob, duracao: Math.round(dur * 100) / 100, em: Date.now() }); } catch (e) { aviso('Não consegui guardar a gravação neste computador: ' + (e.message || e), 'erro'); }
      this.pinta(this.c); };
    mr.start(250); if (guia) { guia.currentTime = 0; guia.play().catch(() => { }); } // começam JUNTOS (para sincronizar)
    this.rec = { f, parar: () => { try { guia?.pause(); mr.stop(); } catch { } } };
  },
  async ouve(f, bt, desde) {
    if (S.tocando) { S.tocando.pause(); const era = S.tocando._f === f.id; S.tocando._fim?.(); S.tocando = null; $$('.tocando').forEach(x => x.classList.remove('tocando')); if (era && desde == null) return; }
    if (!bt) return;
    const el = bt.closest('.fala'), cor = getComputedStyle(el).getPropertyValue('--c').trim() || '#4fe08f';
    const KL = this.chaveL(f), AU = this.audioDe(f);
    try { const l = await DB.get('aud', KL), au = AU, blob = l?.blob || await Nuvem.audio(au), k = l ? `l:${KL}:${l.em}` : 'n:' + au;
      const pk = await Onda.picos(k, blob).catch(() => null), bx = $('.onda-box', el), cv = $('.onda', el); if (pk) { bx.hidden = false; Onda.desenha(cv, pk, cor); }
      const a = new Audio(URL.createObjectURL(blob)); a._f = f.id; S.tocando = a; bt.classList.add('tocando'); bt.innerHTML = ic('parar', 16);
      const tt = $('.onda-t', el); let raf; const anda = () => { if (a.duration && isFinite(a.duration)) { if (pk) Onda.desenha(cv, pk, cor, a.currentTime / a.duration); if (tt) tt.textContent = tempo(a.currentTime) + ' / ' + tempo(a.duration); } raf = requestAnimationFrame(anda); };
      a._fim = () => { cancelAnimationFrame(raf); bt.classList.remove('tocando'); bt.innerHTML = ic('play', 16); if (pk) Onda.desenha(cv, pk, cor); if (tt) tt.textContent = ''; };
      a.onended = () => { a._fim(); S.tocando = null; URL.revokeObjectURL(a.src); };
      if (desde != null) await new Promise(ok => { if (a.readyState >= 1) ok(); else { a.onloadedmetadata = ok; setTimeout(ok, 1500); } }).then(() => { if (isFinite(a.duration)) a.currentTime = desde * a.duration; });
      await a.play(); anda(); }
    catch (e) { aviso('Não consegui tocar: ' + (e.message || e), 'erro'); }
  },
  sobe(f) { const KL = this.chaveL(f);
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'audio/*,video/*,.mp3,.wav,.ogg,.oga,.opus,.m4a,.webm,.mpeg,.mpg,.mp2,.mpga,.flac,.aac,.wma,.amr,.3gp,.mov,.mp4,.mkv,.avi';
    inp.onchange = async () => { const arq = inp.files[0]; if (!arq) return;
      if (arq.size > 200 * 1048576) return aviso('Esse arquivo passa de 200 MB.', 'erro');
      let A; try { aviso('Lendo o arquivo…', 'info', 2500); A = await Cortes.decodifica(arq); } catch (e) { return aviso('Não consegui ler esse arquivo: ' + (e.message || 'formato desconhecido'), 'erro'); }
      const dur = A.d.length / A.sr; if (dur > PREP_CONFIG.audioMaxSeg + 1) return aviso(`Esse áudio tem ${tempo(dur)}. Cada fala pode ter até ${tempo(PREP_CONFIG.audioMaxSeg)}. Use "Subir áudio(s) com várias falas" para separar.`, 'erro');
      const blob = await Cortes.comprime(A); // converte na hora: qualquer formato vira um áudio leve (Opus)
      try { await DB.put('aud', KL, { blob, duracao: Math.round(dur * 100) / 100, em: Date.now(), arquivo: String(arq.name || '').slice(0, 80) }); } catch (e) { return aviso('Não consegui guardar: ' + (e.message || e), 'erro'); }
      aviso('Áudio colocado na fala. Falta enviar para a nuvem.', 'ok'); this.pinta(this.c); };
    inp.click();
  },
  // tipo do arquivo pelo nome/tipo (o servidor confere de novo pelo CONTEÚDO)
  tipoDe(arq) { const n = String(arq.name || '').toLowerCase(), t = String(arq.type || '');
    return /\.mp3$/.test(n) || /mpeg|mp3/.test(t) ? 'audio/mpeg' : /\.wav$/.test(n) || /wav/.test(t) ? 'audio/wav' : /\.(m4a|mp4|aac)$/.test(n) || /mp4|aac|m4a/.test(t) ? 'audio/mp4' : /\.(ogg|oga|opus)$/.test(n) || /ogg|opus/.test(t) ? 'audio/ogg' : 'audio/webm'; },
  pintaEnvio(locais) {
    const box = $('.env', this.c); if (!box) return; const n = [...locais.keys()].filter(id => this.acha(id)).length;
    box.innerHTML = n && pode('gravar') ? `<div class="faixa-env">${ic('alerta', 16)}<span><b>${n} gravaç${n === 1 ? 'ão' : 'ões'}</b> esperando envio (estão só neste computador)</span><span class="esp"></span><button class="bt pri" data-envia>${ic('enviar', 15)} Enviar agora</button></div>` : '';
    const b = $('[data-envia]', box); if (b) b.onclick = () => this.envia(b, locais);
  },
  async envia(bt, locais) {
    const P = S.P; if (P.novo || !P.mod) return aviso('Mande o roteiro para a nuvem primeiro (botão "Mandar para a nuvem" lá em cima).', 'info');
    bt.disabled = true; const lista = [...locais.entries()].filter(([id]) => this.acha(id)); const feitas = [];
    try {
      for (const [i, [id, l]] of lista.entries()) { bt.innerHTML = giro(`Enviando ${i + 1} de ${lista.length}`);
        const fidK = id.split('@')[0], ext = /mpeg/.test(l.blob.type) ? 'mp3' : /wav/.test(l.blob.type) ? 'wav' : /mp4/.test(l.blob.type) ? 'm4a' : /ogg/.test(l.blob.type) ? 'ogg' : 'webm', k = `preparativos/${P.id}/aud/${fidK}-${Date.now().toString(36)}.${ext}`;
        await Nuvem.pede('/preparativos/arquivo?k=' + encodeURIComponent(k), { method: 'POST', headers: { 'content-type': l.blob.type || 'audio/webm' }, body: l.blob });
        const [fid, de] = id.split('@'); feitas.push({ id: fid, ...(de ? { de } : {}), audio: k, duracao: l.duracao, _loc: id }); }
    } catch (e) { aviso(e.message, 'erro'); }
    if (feitas.length) { try { const r = await Nuvem.acao({ acao: 'falas', id: P.id, falas: feitas.map(({ _loc, ...x }) => x) }); // uma gravação do prep.json para todas
        for (const x of feitas) { const f = this.acha(x.id); if (f) { if (x.de) f.audios = { ...(f.audios || {}), [x.de]: { audio: x.audio, duracao: x.duracao } }; else { f.audio = x.audio; f.duracao = x.duracao; delete f.regravar; } } await DB.del('aud', P.id + '/' + x._loc).catch(() => { }); }
        if (!S.sujo) { P.mod = r.mod || P.mod; S.base.mod = P.mod; } S.lista = null; aviso(`${feitas.length} gravaç${feitas.length === 1 ? 'ão enviada' : 'ões enviadas'}.`, 'ok'); pintaBarraPrep(); }
      catch (e) { aviso(e.message, 'erro'); } }
    this.pinta(this.c);
  },
};


/* ---------- guia ELENCO NO ANIMADOR (destino = Animador): cada nome do roteiro → um personagem do Ateliê ----------
   Fica em prep.animador.pers = { "<Roteiro.chave(nome)>": { id, nome } | null }. null = nenhum; sem entrada = o Animador procura um
   personagem da equipe com o MESMO nome. A lista do Ateliê sai do GET /personagens (só a lista: nome vem da metadata do personagem.json,
   sem abrir cada personagem — poupa a nuvem) e fica 10 min guardada nesta aba. */
async function atelie(novo) {
  try { const g = JSON.parse(sessionStorage.getItem('ep-prep-atelie') || 'null'); if (!novo && g && Date.now() - g.t < 600e3 && g.pastas) { g.l.pastas = g.pastas; return g.l; } } catch { }
  const [j, pa] = await Promise.all([Nuvem.pede('/personagens'), Nuvem.pede('/personagens/arquivo?k=personagens/pastas.json').catch(() => null)]), l = [], de = pa?.de || {};
  for (const x of j.itens || []) { const m = String(x.k || '').match(/^personagens\/([a-z0-9][a-z0-9-]{1,40})\/personagem\.json$/); if (m) l.push({ id: m[1], nome: x.nome || m[1].replace(/-/g, ' ').replace(/^./, c => c.toUpperCase()), mod: +x.mod || 0, pasta: de[m[1]] || 'Personagens' }); }
  l.pastas = [...new Set([...(Array.isArray(pa?.pastas) ? pa.pastas : []), ...l.map(x => x.pasta)])];
  l.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  try { sessionStorage.setItem('ep-prep-atelie', JSON.stringify({ t: Date.now(), l, pastas: l.pastas })); } catch { }
  return l;
}

const TH = { _db: null, abre() { return this._db || (this._db = new Promise((ok, no) => { const r = indexedDB.open('ep-preparativos-miniaturas', 1); r.onupgradeneeded = () => r.result.createObjectStore('th');
    r.onsuccess = () => { const db = r.result; db.onversionchange = () => { db.close(); this._db = null; }; ok(db); }; r.onerror = () => { this._db = null; no(r.error); }; r.onblocked = () => { this._db = null; no(new Error('banco ocupado')); }; })); },
  async op(modo, f) { const db = await this.abre(); return new Promise((ok, no) => { const tx = db.transaction('th', modo), r = f(tx.objectStore('th')); tx.oncomplete = () => ok(r?.result); tx.onerror = () => no(tx.error); }); },
  get(k) { return this.op('readonly', s => s.get(k)); }, put(k, v) { return this.op('readwrite', s => s.put(v, k)); } };
const thPedidos = new Map(); let thFila = Promise.resolve(), thAtivos = 0; const thEspera = [];
const thCor = new Map(); // id do personagem do Ateliê → cor principal (do Animador)
async function thumbDe(x) {
  try { const g = await TH.get(x.id); if (g && g.mod === x.mod && 'cor' in g) { if (g.cor) thCor.set(x.id, g.cor); return g.thumb || null; } } catch { }
  if (thPedidos.has(x.id)) return thPedidos.get(x.id);
  const pr = (async () => { if (thAtivos >= 4) await new Promise(r => thEspera.push(r)); thAtivos++; // no máximo 4 de uma vez
    try { const d = await Nuvem.pede('/personagens/arquivo?k=' + encodeURIComponent(`personagens/${x.id}/personagem.json`)); const th = typeof d?.thumb === 'string' && d.thumb.startsWith('data:image/') ? d.thumb : null;
      const cor = /^#[0-9a-f]{6}$/i.test(String(d?.cor || '')) ? String(d.cor).toLowerCase() : null; thCor.set(x.id, cor);
      TH.put(x.id, { mod: x.mod, thumb: th, cor }).catch(() => { }); return th; }
    catch { return null; } finally { thAtivos--; thEspera.shift()?.(); thPedidos.delete(x.id); } })();
  thPedidos.set(x.id, pr); return pr;
}
// janela do Ateliê: pastas, miniaturas e nomes (as miniaturas carregam quando aparecem na tela)
function escolheNoAtelie(L, atual, titulo, rotAuto = 'Automático (padrão do personagem)') {
  return new Promise(ok => {
    const pastas = (L.pastas || [...new Set(L.map(x => x.pasta))]).filter(p => L.some(x => x.pasta === p));
    const m = h(`<div class="modal"><div class="caixa atelie-pop"><div class="ap-cab">${icAt(24)}<b>${esc(titulo)}</b><span class="esp"></span><input class="ap-busca" placeholder="Procurar pelo nome" aria-label="Procurar"><button class="bt ic" data-x title="Fechar">${ic('voltar', 15)}</button></div>
      <div class="ap-esp"><button class="ap-op ${atual === undefined ? 'on' : ''}" data-v="">${ic('atualizar', 15)} ${esc(rotAuto)}</button><button class="ap-op ${atual === null ? 'on' : ''}" data-v="-">${ic('lixo', 15)} Nenhum</button></div>
      <div class="ap-corpo">${pastas.map(p => `<div class="ap-pasta" data-p="${esc(p)}"><button class="pasta-tit" data-tp>${ic('baixo', 12)} ${ic('pasta', 14)} ${esc(p)} <small>${L.filter(x => x.pasta === p).length}</small></button>
        <div class="ap-grade">${L.filter(x => x.pasta === p).map(x => `<button class="ap-card ${atual?.id === x.id ? 'on' : ''}" data-v="${esc(x.id)}" data-n="${esc(Roteiro.chave(x.nome))}"><span class="ap-th" data-th="${esc(x.id)}">${esc(iniciais(x.nome))}</span><span class="ap-nome">${esc(x.nome)}</span></button>`).join('')}</div></div>`).join('')}</div></div></div>`);
    const fim = v => { io.disconnect(); m.remove(); ok(v); };
    const io = new IntersectionObserver(es => { for (const e of es) { if (!e.isIntersecting) continue; const el = e.target; io.unobserve(el); const x = L.find(y => y.id === el.dataset.th);
      if (x) { el.classList.add('carregando-th'); thumbDe(x).then(t => { el.classList.remove('carregando-th'); if (t) { el.style.backgroundImage = `url("${t}")`; el.classList.add('com-th'); } }); } } }, { root: null, rootMargin: '200px' });
    $$('[data-th]', m).forEach(el => io.observe(el));
    m.onclick = e => { if (e.target === m || e.target.closest('[data-x]')) return fim(false); const t = e.target.closest('[data-tp]'); if (t) return t.parentElement.classList.toggle('fechada');
      const b = e.target.closest('[data-v]'); if (!b) return; const v = b.dataset.v; fim(v === '' ? undefined : v === '-' ? null : L.find(x => x.id === v)); };
    const busca = $('.ap-busca', m); busca.oninput = () => { const q = Roteiro.chave(busca.value); $$('.ap-card', m).forEach(c => { c.hidden = q && !c.dataset.n.includes(q); }); $$('.ap-pasta', m).forEach(p => { p.hidden = !$$('.ap-card', p).some(c => !c.hidden); }); };
    m.onkeydown = e => { if (e.key === 'Escape') fim(false); };
    document.body.appendChild(m); busca.focus(); $('.ap-card.on', m)?.scrollIntoView({ block: 'center' });
  });
}
async function pintaElenco(c) {
  const P = S.P, ps = Roteiro.personagens(P.partes), ed = pode('roteiro') || pode('organizar'), cs = coresDoRoteiro();
  c.innerHTML = `<div class="elenco-an"><div class="explica">${ic('pessoa', 20)}<div><b>Quem é quem no Animador</b>
    <p>Escolha qual personagem do Ateliê faz cada nome NESTE roteiro (fica salvo nele e dá para trocar depois). Em <b>Automático</b> vale o <b>padrão do personagem</b> (aba Personagens); sem padrão, o personagem do Ateliê com o mesmo nome. <b>Nenhum</b> = essa voz entra sem personagem na cena.</p></div></div>
    <div class="el-lista">${giroBloco('Carregando os personagens do Ateliê')}</div>
    <div class="el-pe"><button class="bt" data-at>${ic('atualizar', 15)} Buscar a lista do Ateliê de novo</button></div></div>`;
  let L; try { [L] = await Promise.all([atelie(), carregaPers().catch(() => ({}))]); } catch (e) { $('.el-lista', c).innerHTML = `<div class="vazio erro">${esc(e.message)}</div>`; return; }
  $('[data-at]', c).onclick = async () => { sessionStorage.removeItem('ep-prep-atelie'); pintaElenco(c); };
  const porNome = new Map(L.map(x => [Roteiro.chave(x.nome), x])), mapa = () => (P.animador?.pers || {});
  const pinta = () => { const M = mapa();
    $('.el-lista', c).innerHTML = ps.length ? ps.map(p => { const v = M[p.chave], pad = S.pers?.[p.chave]?.atelie, mesmo = porNome.get(p.chave), sel = v === null ? '-' : v?.id || '';
      const auto = pad === null ? null : pad?.id ? (L.find(x => x.id === pad.id) || { id: pad.id, nome: pad.nome }) : mesmo;
      const quem = v === null ? 'sem personagem na cena' : v?.id ? `vai ser <b>${esc(v.nome || v.id)}</b> (só neste roteiro)`
        : pad === null ? 'padrão do personagem: <b>nenhum</b>' : pad?.id ? `padrão: <b>${esc(pad.nome || pad.id)}</b>` : mesmo ? `automático: <b>${esc(mesmo.nome)}</b> (mesmo nome)` : '<span class="aten">sem padrão e nenhum personagem do Ateliê com este nome: escolha um</span>';
      const alvo = v?.id ? L.find(x => x.id === v.id) : v === null ? null : auto;
      return `<div class="el-lin">${ava(p.nome, cs.get(p.chave), 'p')}<b>${esc(p.nome)}</b><small>${p.n} fala${p.n === 1 ? '' : 's'}</small><span class="el-seta">${ic('voltar', 14)}</span>
        <button class="el-esc" data-esc="${esc(p.chave)}" ${ed ? '' : 'disabled'} title="Escolher no Ateliê"><span class="ap-th p" ${alvo ? `data-th="${esc(alvo.id)}"` : ''}>${alvo ? esc(iniciais(alvo.nome)) : icAt(18)}</span>${icAt(15)} Escolher no Ateliê</button>
        <select data-k="${esc(p.chave)}" ${ed ? '' : 'disabled'}><option value="" ${sel === '' ? 'selected' : ''}>Automático (padrão do personagem)</option><option value="-" ${sel === '-' ? 'selected' : ''}>Nenhum</option>
        <optgroup label="Personagens do Ateliê">${L.map(x => `<option value="${esc(x.id)}" ${sel === x.id ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</optgroup>
        ${v?.id && !L.some(x => x.id === v.id) ? `<option value="${esc(v.id)}" selected>${esc(v.nome || v.id)} (não está mais no Ateliê)</option>` : ''}</select>
        <small class="el-quem">${quem}</small></div>`; }).join('') : '<div class="vazio">Ainda não há falas no roteiro.</div>';
    $$('select[data-k]', c).forEach(sl => sl.onchange = () => { const k = sl.dataset.k, v = sl.value, pers = { ...mapa() };
      if (v === '') delete pers[k]; else if (v === '-') pers[k] = null; else { const x = L.find(y => y.id === v); pers[k] = { id: v, nome: x?.nome || v }; }
      P.animador = { ...(P.animador || {}), pers }; marcaSujo(); pinta(); });
    $$('[data-esc]', c).forEach(b => b.onclick = async () => { const k = b.dataset.esc, p = ps.find(x => x.chave === k), r = await escolheNoAtelie(L, mapa()[k], `Quem faz ${p?.nome || k} no Animador?`); if (r === false) return;
      const pers = { ...mapa() }; if (r === undefined) delete pers[k]; else if (r === null) pers[k] = null; else pers[k] = { id: r.id, nome: r.nome };
      P.animador = { ...(P.animador || {}), pers }; marcaSujo(); pinta(); });
    $$('.el-esc [data-th]', c).forEach(el => { const x = L.find(y => y.id === el.dataset.th); if (x) thumbDe(x).then(t => { if (t) { el.style.backgroundImage = `url("${t}")`; el.classList.add('com-th'); } }); }); };
  pinta();
}

/* ---------- aba LEGENDAS: o estilo da legenda que o Animador, o Shorts e o Editor usam ----------
   prep.legenda = { ativa, mostrarNome, cores, estilo, quadro }. estilo usa FRAÇÕES do quadro (tamanho = altura da letra ÷ altura do vídeo;
   x/y = centro da legenda; largura = largura da caixa ÷ largura do vídeo; contorno/sombra também em fração da altura).
   A foto de fundo da prévia é SÓ deste computador (banco de miniaturas), nunca vai para a nuvem. */
const PALETA = ['#19f0f0', '#ffb04a', '#ff6b93', '#a796ff', '#4fe08f', '#ffd36b', '#7fd1ff', '#ff8f6b', '#ffffff', '#c9ff6b'];
const LEG_PADRAO = { fonte: 'Rubik', tamanho: .045, peso: 800, x: .5, y: .82, largura: .86, alinhar: 'center', maiusculas: false,
  contorno: { ativo: false, cor: '#000000', largura: .004 }, sombra: { ativa: false, cor: '#000000', desfoque: .006, x: 0, y: .003, opacidade: .8 }, fundo: { ativo: false, cor: '#000000', opacidade: .5 } };
const QUADROS = [['1080x1920', 'Short / Reels — 1080 × 1920'], ['1920x1080', 'Vídeo — 1920 × 1080'], ['1080x1080', 'Quadrado — 1080 × 1080'], ['1080x1350', 'Retrato 4:5 — 1080 × 1350'], ['outro', 'Outro tamanho…']];
const FONTES = ['Rubik', 'Arial', 'Segoe UI', 'Verdana', 'Trebuchet MS', 'Georgia', 'Impact', 'Comic Sans MS'];
const estiloDe = P => { const e = P.legenda?.estilo || {}; return { ...LEG_PADRAO, ...e, contorno: { ...LEG_PADRAO.contorno, ...(e.contorno || {}) }, sombra: { ...LEG_PADRAO.sombra, ...(e.sombra || {}) }, fundo: { ...LEG_PADRAO.fundo, ...(e.fundo || {}) } }; };
const rgba = (hex, a) => { const n = parseInt(String(hex).slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
function pintaLegendas(c) {
  const P = S.P, ps = Roteiro.personagens(P.partes), ed = pode('organizar');
  P.legenda = P.legenda || { ativa: true, mostrarNome: false, cores: {} };
  const E = estiloDe(P), Q = { w: 1080, h: 1920, ...(P.legenda.quadro || {}) }, cs = coresDoRoteiro(), escolha = Object.fromEntries(ps.map(p => [p.chave, cs.get(p.chave)]));
  const exemplo = k => P.partes.flatMap(x => x.falas).find(f => Roteiro.chave(f.personagem) === k)?.texto || 'Exemplo de legenda';
  let foco = ps[0]?.chave, img = { x: 0, y: 0, zoom: 1 }, pi = Math.max(0, P.partes.findIndex(x => x.falas.length)), fi = 0;
  const nomeParte = (x, i) => (x.capitulo ? x.capitulo + ' › ' : '') + (x.nome || 'Parte ' + (i + 1));
  const qv = `${Q.w}x${Q.h}`, qSel = QUADROS.some(([v]) => v === qv) ? qv : 'outro';
  const faixa = (k, rot, min, max, passo, val, fmt) => `<label class="lg-f"><small>${rot} <b data-v="${k}">${fmt(val)}</b></small><input type="range" data-k="${k}" min="${min}" max="${max}" step="${passo}" value="${val}" ${ed ? '' : 'disabled'}></label>`;
  const chave = (k, rot, v) => `<label class="mp-ch"><input type="checkbox" data-ch="${k}" ${v ? 'checked' : ''} ${ed ? '' : 'disabled'}><span class="trilho"><i></i></span>${rot}</label>`;
  const pct = v => Math.round(v * 1000) / 10 + '%';
  c.innerHTML = `<div class="leg3">
    <div class="lg-cfg">
      <div class="lg-bloco">${chave('ativa', 'Legendas ligadas neste roteiro', P.legenda.ativa)}${chave('mostrarNome', 'Mostrar o nome de quem fala', P.legenda.mostrarNome)}
        <p class="dica">Por padrão a legenda mostra só o que é falado, na cor de quem fala. Tudo daqui vai junto para o Animador, o Shorts e o Editor.</p></div>
      <div class="lg-bloco"><h4>Tamanho do vídeo</h4><select data-quadro ${ed ? '' : 'disabled'}>${QUADROS.map(([v, n]) => `<option value="${v}" ${v === qSel ? 'selected' : ''}>${n}</option>`).join('')}</select>
        <div class="lg-wh" ${qSel === 'outro' ? '' : 'hidden'}><input type="number" data-w min="160" max="7680" value="${Q.w}" ${ed ? '' : 'disabled'}> × <input type="number" data-h min="160" max="7680" value="${Q.h}" ${ed ? '' : 'disabled'}> px</div></div>
      <div class="lg-bloco"><h4>Texto</h4>
        <div class="lg-2"><label class="lg-f"><small>Fonte</small><select data-fonte ${ed ? '' : 'disabled'}>${FONTES.map(f => `<option ${f === E.fonte ? 'selected' : ''} style="font-family:'${f}'">${f}</option>`).join('')}</select></label>
          <label class="lg-f"><small>Alinhamento</small><select data-alinhar ${ed ? '' : 'disabled'}>${[['left', 'Esquerda'], ['center', 'Centro'], ['right', 'Direita']].map(([v, n]) => `<option value="${v}" ${v === E.alinhar ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
        ${faixa('tamanho', 'Tamanho da letra', .015, .12, .001, E.tamanho, pct)}${faixa('peso', 'Grossura', 300, 900, 100, E.peso, v => v)}
        ${chave('maiusculas', 'TUDO EM MAIÚSCULAS', E.maiusculas)}</div>
      <div class="lg-bloco"><h4>${chave('sombra.ativa', 'Sombra', E.sombra.ativa)}</h4><div class="lg-sub" ${E.sombra.ativa ? '' : 'hidden'} data-sub="sombra">
        <label class="lg-cor"><small>Cor</small><input type="color" data-cor="sombra.cor" value="${E.sombra.cor}" ${ed ? '' : 'disabled'}></label>
        ${faixa('sombra.desfoque', 'Desfoque', 0, .04, .001, E.sombra.desfoque, pct)}${faixa('sombra.y', 'Distância', -.03, .03, .001, E.sombra.y, pct)}${faixa('sombra.opacidade', 'Força', 0, 1, .05, E.sombra.opacidade, v => Math.round(v * 100) + '%')}</div></div>
      <div class="lg-bloco"><h4>${chave('contorno.ativo', 'Contorno', E.contorno.ativo)}</h4><div class="lg-sub" ${E.contorno.ativo ? '' : 'hidden'} data-sub="contorno">
        <label class="lg-cor"><small>Cor</small><input type="color" data-cor="contorno.cor" value="${E.contorno.cor}" ${ed ? '' : 'disabled'}></label>${faixa('contorno.largura', 'Grossura', .001, .02, .0005, E.contorno.largura, pct)}</div></div>
      <div class="lg-bloco"><h4>${chave('fundo.ativo', 'Fundo atrás do texto', E.fundo.ativo)}</h4><div class="lg-sub" ${E.fundo.ativo ? '' : 'hidden'} data-sub="fundo">
        <label class="lg-cor"><small>Cor</small><input type="color" data-cor="fundo.cor" value="${E.fundo.cor}" ${ed ? '' : 'disabled'}></label>${faixa('fundo.opacidade', 'Opacidade', 0, 1, .05, E.fundo.opacidade, v => Math.round(v * 100) + '%')}</div></div>
      <div class="lg-bloco"><h4>Cor de cada personagem</h4><div class="lista">${ps.map(p => `<div class="lin" data-k="${esc(p.chave)}">${ava(p.nome, escolha[p.chave], 'p')}<b>${esc(p.nome)}</b>
        <div class="paleta">${PALETA.map(x => `<button class="cor ${x === escolha[p.chave] ? 'on' : ''}" style="--c:${x}" data-cor-p="${x}" ${ed ? '' : 'disabled'} title="${x}"></button>`).join('')}<label class="cor-outra" title="Outra cor"><input type="color" value="${escolha[p.chave]}" ${ed ? '' : 'disabled'}><span>${ic('mais', 12)}</span></label></div></div>`).join('') || '<div class="vazio">Sem personagens ainda.</div>'}</div></div>
    </div>
    <div class="lg-prev"><div class="lg-barra"><b>Prévia</b><span class="esp"></span><button class="bt" data-img>${ic('camera', 14)} Imagem de fundo</button><button class="bt" data-sem-img hidden>${ic('lixo', 14)} Tirar</button><button class="bt" data-centra title="Voltar a legenda para o lugar padrão">${ic('atualizar', 14)} Posição padrão</button></div>
      <div class="lg-moldura"><div class="quadro" style="aspect-ratio:${Q.w} / ${Q.h};--ar:${Q.w / Q.h}"><img class="q-img" alt="" hidden><div class="q-leg" tabindex="0"><span class="q-txt"></span><i class="q-alca e"></i><i class="q-alca d"></i></div></div></div>
      <div class="lg-cor-fala" hidden><small>Fala de vários personagens: a legenda usa a cor neutra. Cor só desta fala:</small><input type="color" value="#ffffff" ${ed ? '' : 'disabled'}><button class="link" data-cor-fala-tira>voltar para a neutra</button></div>
      <div class="lg-trecho"><label class="lg-f"><small>Parte</small><select data-parte>${P.partes.map((x, i) => `<option value="${i}" ${i === pi ? 'selected' : ''}>${esc(nomeParte(x, i))} (${x.falas.length})</option>`).join('') || '<option>Sem partes ainda</option>'}</select></label>
        <div class="lg-nav"><button class="bt ic" data-ant title="Fala anterior">${ic('voltar', 15)}</button><span class="lg-num"></span><button class="bt ic" data-prox title="Próxima fala" style="transform:scaleX(-1)">${ic('voltar', 15)}</button></div>
        <div class="lg-falas"></div></div>
      <small class="dica">Arraste a legenda para mudar o lugar; puxe as bordas dela para mudar a largura; rodinha do mouse em cima da legenda = tamanho da letra. Com imagem de fundo: arraste o fundo para mover e use a rodinha para dar zoom. A imagem fica só neste computador.</small>
      <input type="file" accept="image/*" data-arq-img hidden></div></div>`;
  const qd = $('.quadro', c), leg = $('.q-leg', c), txt = $('.q-txt', c), im = $('.q-img', c);
  // ---- aplica o estilo na prévia (em unidades do quadro: cqh = 1% da altura do quadro) ----
  const aplica = () => { const e = E, h = v => `calc(${v * 100} * 1cqh)`, p = ps.find(x => x.chave === foco);
    leg.style.left = e.x * 100 + '%'; leg.style.top = e.y * 100 + '%'; leg.style.width = e.largura * 100 + '%'; leg.hidden = !P.legenda.ativa;
    const fa = P.partes[pi]?.falas[fi], k = fa ? Roteiro.chave(fa.personagem) : foco, pn = fa ? fa.personagem : p?.nome, vrs = fa && Array.isArray(fa.personagens) && fa.personagens.length > 1;
    const corF = fa?.cor || (vrs ? '#ffffff' : escolha[k] || '#ffffff'); const cf = $('.lg-cor-fala', c); if (cf) { cf.hidden = !vrs; if (vrs) { $('input', cf).value = fa.cor || '#ffffff'; $('[data-cor-fala-tira]', cf).hidden = !fa.cor; } }
    txt.textContent = (P.legenda.mostrarNome && pn ? pn + ': ' : '') + (fa ? fa.texto : foco ? exemplo(foco) : 'Exemplo de legenda');
    const fs = P.partes[pi]?.falas || []; $('.lg-num', c).textContent = fs.length ? `${fi + 1} de ${fs.length}` : '—'; $('[data-ant]', c).disabled = fi <= 0; $('[data-prox]', c).disabled = fi >= fs.length - 1;
    $$('.lg-falas .lf', c).forEach((b, i) => b.classList.toggle('on', i === fi));
    Object.assign(txt.style, { fontFamily: `'${e.fonte}', sans-serif`, fontSize: h(e.tamanho), fontWeight: e.peso, textAlign: e.alinhar, textTransform: e.maiusculas ? 'uppercase' : 'none', color: corF,
      textShadow: e.sombra.ativa ? `${h(e.sombra.x)} ${h(e.sombra.y)} ${h(e.sombra.desfoque)} ${rgba(e.sombra.cor, e.sombra.opacidade)}` : 'none',
      webkitTextStroke: e.contorno.ativo ? `${h(e.contorno.largura)} ${e.contorno.cor}` : '0', paintOrder: 'stroke fill',
      background: e.fundo.ativo ? rgba(e.fundo.cor, e.fundo.opacidade) : 'transparent', padding: e.fundo.ativo ? `${h(.006)} ${h(.012)}` : '0' });
    leg.style.textAlign = e.alinhar; };
  // ---- guarda (vai sozinho para a nuvem se o roteiro já estiver lá) ----
  let tSalva = 0; const guarda = () => { P.legenda = { ...P.legenda, estilo: JSON.parse(JSON.stringify(E)), quadro: { w: Q.w, h: Q.h }, cores: { ...(P.legenda.cores || {}), ...escolha } }; clearTimeout(tSalva); tSalva = setTimeout(marcaSujo, 300); };
  const poe = (k, v) => { const [a, b] = k.split('.'); if (b) E[a][b] = v; else E[a] = v; };
  $$('[data-k]', c).forEach(i => i.oninput = () => { const v = +i.value; poe(i.dataset.k, v); const s = $(`[data-v="${i.dataset.k}"]`, c); if (s) s.textContent = /opacidade/.test(i.dataset.k) ? Math.round(v * 100) + '%' : i.dataset.k === 'peso' ? v : pct(v); aplica(); guarda(); });
  $$('[data-ch]', c).forEach(i => i.onchange = () => { const k = i.dataset.ch; if (k === 'ativa' || k === 'mostrarNome') P.legenda[k] = i.checked; else poe(k, i.checked);
    const sub = $(`[data-sub="${k.split('.')[0]}"]`, c); if (sub) sub.hidden = !i.checked; aplica(); guarda(); });
  $$('[data-cor]', c).forEach(i => i.oninput = () => { poe(i.dataset.cor, i.value); aplica(); guarda(); });
  $('[data-fonte]', c).onchange = e => { E.fonte = e.target.value; aplica(); guarda(); };
  $('[data-alinhar]', c).onchange = e => { E.alinhar = e.target.value; aplica(); guarda(); };
  const muda = (w, h) => { Q.w = Math.round(w); Q.h = Math.round(h); qd.style.aspectRatio = `${Q.w} / ${Q.h}`; qd.style.setProperty('--ar', Q.w / Q.h); aplica(); guarda(); };
  $('[data-quadro]', c).onchange = e => { const v = e.target.value, wh = $('.lg-wh', c); wh.hidden = v !== 'outro'; if (v !== 'outro') { const [w, h] = v.split('x').map(Number); muda(w, h); $('[data-w]', c).value = w; $('[data-h]', c).value = h; } };
  $('[data-w]', c).onchange = $('[data-h]', c).onchange = () => muda(Math.max(160, Math.min(7680, +$('[data-w]', c).value || 1080)), Math.max(160, Math.min(7680, +$('[data-h]', c).value || 1920)));
  { const cf = $('.lg-cor-fala', c); $('input', cf).oninput = e => { const fa = P.partes[pi]?.falas[fi]; if (!fa) return; fa.cor = e.target.value; aplica(); marcaSujo(); };
    $('[data-cor-fala-tira]', cf).onclick = () => { const fa = P.partes[pi]?.falas[fi]; if (!fa) return; delete fa.cor; aplica(); marcaSujo(); }; }
  const pintaFalas = () => { const fs = P.partes[pi]?.falas || []; $('.lg-falas', c).innerHTML = fs.map((f, i) => `<button class="lf" data-i="${i}" style="--c:${f.cor || (f.personagens?.length > 1 ? '#fff' : escolha[Roteiro.chave(f.personagem)] || '#fff')}"><b>${esc(f.personagem)}</b> ${esc(f.texto.slice(0, 90))}</button>`).join('') || '<div class="vazio">Nenhuma fala nesta parte.</div>';
    $$('.lg-falas .lf', c).forEach(b => b.onclick = () => { fi = +b.dataset.i; aplica(); }); };
  $('[data-parte]', c).onchange = e => { pi = +e.target.value; fi = 0; pintaFalas(); aplica(); };
  $('[data-ant]', c).onclick = () => { if (fi > 0) { fi--; aplica(); $('.lg-falas .lf.on', c)?.scrollIntoView({ block: 'nearest' }); } };
  $('[data-prox]', c).onclick = () => { if (fi < (P.partes[pi]?.falas.length || 0) - 1) { fi++; aplica(); $('.lg-falas .lf.on', c)?.scrollIntoView({ block: 'nearest' }); } };
  pintaFalas();
  // cores dos personagens (clicar no nome = pula para a primeira fala dele na parte escolhida)
  const pulaPara = k => { const i = (P.partes[pi]?.falas || []).findIndex(f => Roteiro.quem(f).includes(k)); if (i >= 0) fi = i; };
  $$('.lg-cfg .lin', c).forEach(l => { const k = l.dataset.k, troca = v => { escolha[k] = v; $$('.cor', l).forEach(b => b.classList.toggle('on', b.dataset.corP === v)); $('.ava', l).style.setProperty('--c', v); $('input[type=color]', l).value = v; foco = k; pulaPara(k); pintaFalas(); aplica(); guarda(); };
    l.onclick = e => { if (!e.target.closest('button,input,label')) { foco = k; pulaPara(k); aplica(); } };
    $$('.cor', l).forEach(b => b.onclick = () => troca(b.dataset.corP)); $('input[type=color]', l).oninput = e => troca(e.target.value); });
  // ---- ARRASTAR a legenda, mudar a largura pelas bordas, rodinha = tamanho ----
  const arrasta = (ev, fn) => { if (!ed) return; ev.preventDefault(); ev.stopPropagation(); const r = qd.getBoundingClientRect(), x0 = ev.clientX, y0 = ev.clientY, base = { ...E };
    const mv = e => { fn((e.clientX - x0) / r.width, (e.clientY - y0) / r.height, base); aplica(); };
    const fim = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', fim); leg.classList.remove('mexendo'); guarda(); }; leg.classList.add('mexendo'); addEventListener('pointermove', mv); addEventListener('pointerup', fim); };
  leg.onpointerdown = e => { const alca = e.target.closest('.q-alca'); if (alca) return arrasta(e, (dx, dy, b) => { E.largura = Math.max(.1, Math.min(1, b.largura + (alca.classList.contains('d') ? 2 * dx : -2 * dx))); });
    arrasta(e, (dx, dy, b) => { E.x = Math.max(0, Math.min(1, b.x + dx)); E.y = Math.max(0, Math.min(1, b.y + dy)); }); };
  leg.onwheel = e => { if (!ed) return; e.preventDefault(); e.stopPropagation(); E.tamanho = Math.max(.015, Math.min(.12, E.tamanho * (e.deltaY < 0 ? 1.06 : 1 / 1.06))); const i = $('[data-k="tamanho"]', c); i.value = E.tamanho; $('[data-v="tamanho"]', c).textContent = pct(E.tamanho); aplica(); guarda(); };
  $('[data-centra]', c).onclick = () => { if (!ed) return; Object.assign(E, { x: LEG_PADRAO.x, y: LEG_PADRAO.y, largura: LEG_PADRAO.largura }); aplica(); guarda(); };
  // ---- IMAGEM DE FUNDO só deste computador: arrastar = mover, rodinha = zoom ----
  const poeImg = () => { im.style.transform = `translate(-50%,-50%) translate(${img.x * 100}%, ${img.y * 100}%) scale(${img.zoom})`; };
  const guardaImg = blob => TH.put('fundo-legenda', { blob: blob || TH._blob, ...img }).catch(() => { });
  const mostraImg = (blob, o) => { if (im.src) URL.revokeObjectURL(im.src); TH._blob = blob; im.src = URL.createObjectURL(blob); im.hidden = false; $('[data-sem-img]', c).hidden = false; img = { x: 0, y: 0, zoom: 1, ...(o || {}) }; poeImg(); };
  TH.get('fundo-legenda').then(g => { if (g?.blob) mostraImg(g.blob, { x: g.x || 0, y: g.y || 0, zoom: g.zoom || 1 }); }).catch(() => { });
  const arq = $('[data-arq-img]', c); $('[data-img]', c).onclick = () => arq.click();
  arq.onchange = () => { const f = arq.files[0]; arq.value = ''; if (!f) return; mostraImg(f); guardaImg(f); };
  $('[data-sem-img]', c).onclick = () => { im.hidden = true; im.removeAttribute('src'); $('[data-sem-img]', c).hidden = true; TH.put('fundo-legenda', null).catch(() => { }); };
  qd.onpointerdown = e => { if (im.hidden || e.target.closest('.q-leg')) return; e.preventDefault(); const r = qd.getBoundingClientRect(), x0 = e.clientX, y0 = e.clientY, b = { ...img }; qd.classList.add('movendo');
    const mv = ev => { img.x = b.x + (ev.clientX - x0) / (im.offsetWidth || r.width); img.y = b.y + (ev.clientY - y0) / (im.offsetHeight || r.height); poeImg(); };
    const fim = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', fim); qd.classList.remove('movendo'); guardaImg(); }; addEventListener('pointermove', mv); addEventListener('pointerup', fim); };
  qd.onwheel = e => { if (im.hidden || e.target.closest('.q-leg')) return; e.preventDefault(); img.zoom = Math.max(.2, Math.min(8, img.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08))); poeImg(); clearTimeout(qd._t); qd._t = setTimeout(() => guardaImg(), 400); };
  aplica();
}

/* ---------- aba PERSONAGENS (a lista da equipe: preparativos/personagens.json) ---------- */
// foto: recorta no meio, diminui para 256 px e vira WEBP (leve na nuvem)
async function paraWebp(arq, lado = 256) {
  const bmp = await createImageBitmap(arq), q = Math.min(bmp.width, bmp.height), cv = document.createElement('canvas'); cv.width = cv.height = Math.min(lado, q);
  cv.getContext('2d').drawImage(bmp, (bmp.width - q) / 2, (bmp.height - q) / 2, q, q, 0, 0, cv.width, cv.height);
  const b = await new Promise(ok => cv.toBlob(ok, 'image/webp', .82)); if (!b || b.type !== 'image/webp') throw new Error('Este navegador não consegue gerar WEBP. Use o Chrome ou o Edge.'); return b;
}
const slug = s => Roteiro.chave(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'p';

/* ---------- EDITAR PERSONAGEM SÓ NESTE ROTEIRO (menu da seleção, pedido da dona 06/11) ----------
   Renomear em todas as falas, juntar com outro nome, cor da legenda (P.legenda.cores) e personagem do Ateliê (P.animador.pers) valem
   SÓ para este roteiro; o padrão de todos fica na aba Personagens. No Animador: escolha do roteiro › padrão › mesmo nome. */
async function editaPersRoteiro(nome) {
  const P = S.P; if (!P) return; let k = Roteiro.chave(nome); const ed = pode('roteiro') || pode('organizar');
  const outros = () => Roteiro.personagens(P.partes).filter(p => p.chave !== k);
  const padraoAt = () => { const a = S.pers?.[k]?.atelie; return a === null ? 'Nenhum' : a?.id ? (a.nome || a.id) : 'Automático (mesmo nome)'; };
  const m = h(`<div class="modal"><div class="caixa ep-caixa" role="dialog"><div class="ep-cab"><span data-ava></span><div><b data-nm></b><small class="ep-aviso">${ic('alerta', 13)} Vale só para este roteiro. O padrão fica na aba Personagens.</small></div><span class="esp"></span><button class="bt ic" data-x title="Fechar">${ic('voltar', 15)}</button></div>
    <div class="ep-corpo">
      <div class="pd-sec"><small>Nome nas falas</small><div class="ep-lin"><input type="text" class="dn-txt" data-novo maxlength="40"><button class="bt" data-ren ${ed ? '' : 'disabled'}>${ic('lapis', 14)} Renomear em todas as falas</button></div></div>
      <div class="pd-sec"><small>Juntar com outro nome</small><div class="ep-lin"><select data-junta ${ed ? '' : 'disabled'}><option value="">Escolha…</option></select><button class="bt" data-jun ${ed ? '' : 'disabled'}>Juntar</button></div><small class="dica">Ex.: "Aluno vermelho" e "Aluno Vermelho" viram um só.</small></div>
      <div class="pd-sec"><small>Cor da legenda neste roteiro</small><div class="paleta" data-pal></div><button class="link" data-cor-pad>Usar a cor padrão</button></div>
      <div class="pd-sec"><small>No Animador (neste roteiro)</small><div class="ep-lin"><button class="el-esc" data-at ${ed ? '' : 'disabled'}><span class="ap-th p" data-th>${icAt(18)}</span><span data-at-n></span></button><button class="link" data-at-pad>Usar o padrão</button></div><small class="dica" data-at-av></small></div>
    </div>
    <div class="bts ep-rod"><button class="bt" data-aba>${ic('pessoa', 14)} Abrir na aba Personagens</button><button class="bt" data-nuvem ${pode('organizar') ? '' : 'disabled'}>${ic('nuvem', 14)} Salvar como personagem na nuvem</button><span class="esp"></span><button class="bt pri" data-x>Pronto</button></div></div></div>`);
  const fim = () => m.remove(), muda = () => { marcaSujo(); S.ed?.repinta(); pintaLado(); pinta2(); };
  const corAqui = () => P.legenda?.cores?.[k] || null, corV = () => corAqui() || corOuPadrao(nome);
  const atAqui = () => P.animador?.pers && k in P.animador.pers ? P.animador.pers[k] : undefined;
  const pinta2 = () => { $('[data-nm]', m).textContent = nome; $('[data-ava]', m).innerHTML = ava(nome, corV(), 'g'); $('[data-novo]', m).value = nome;
    $('[data-junta]', m).innerHTML = '<option value="">Escolha…</option>' + outros().map(p => `<option value="${esc(p.nome)}">${esc(p.nome)}</option>`).join('');
    $('[data-pal]', m).innerHTML = PALETA.map(x => `<button class="cor ${x === corV() ? 'on' : ''}" style="--c:${x}" data-c="${x}" ${ed ? '' : 'disabled'}></button>`).join('') + `<label class="cor-outra" title="Outra cor"><input type="color" value="${corV()}" ${ed ? '' : 'disabled'}><span>${ic('mais', 12)}</span></label>`;
    $$('[data-c]', m).forEach(b => b.onclick = () => poeCor(b.dataset.c)); $('[data-pal] input', m).onchange = e => poeCor(e.target.value);
    const a = atAqui(); $('[data-at-n]', m).textContent = a === undefined ? `Padrão: ${padraoAt()}` : a === null ? 'Nenhum (só aqui)' : a.nome + ' (só aqui)';
    $('[data-at-av]', m).textContent = a === undefined ? '' : `Só neste roteiro — o padrão continua ${padraoAt()}.`; $('[data-at-pad]', m).hidden = a === undefined; $('[data-cor-pad]', m).hidden = !corAqui();
    const th = $('[data-th]', m), id = a?.id || (a === undefined ? S.pers?.[k]?.atelie?.id : null); th.style.backgroundImage = ''; th.innerHTML = icAt(18);
    if (id) atelie().then(L => { const x = L.find(y => y.id === id); if (x) thumbDe(x).then(u => { if (u && m.isConnected) { th.style.backgroundImage = `url("${u}")`; th.classList.add('com-th'); th.textContent = ''; } }); }).catch(() => { }); };
  const poeCor = c => { P.legenda = { ...(P.legenda || { ativa: true, mostrarNome: false }), cores: { ...(P.legenda?.cores || {}), [k]: c } }; muda(); };
  const renomeia = novo => { novo = String(novo || '').replace(/[:*#\[\]()]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40); if (!novo || novo === nome) return;
    const n = renomeiaNoPrep(P, nome, novo); S.ed?.trocaTudo(P.roteiro); aviso(`${n} fala${n === 1 ? '' : 's'} agora ${n === 1 ? 'é' : 'são'} de ${novo} (só neste roteiro).`, 'ok'); nome = novo; k = Roteiro.chave(novo); muda(); };
  $('[data-ren]', m).onclick = () => renomeia($('[data-novo]', m).value);
  $('[data-jun]', m).onclick = () => { const alvo = $('[data-junta]', m).value; if (alvo) renomeia(alvo); };
  $('[data-cor-pad]', m).onclick = () => { const c = { ...(P.legenda?.cores || {}) }; delete c[k]; P.legenda = { ...P.legenda, cores: c }; muda(); };
  $('[data-at]', m).onclick = async () => { let L; try { L = await atelie(); } catch (e) { return aviso(e.message, 'erro'); } const r = await escolheNoAtelie(L, atAqui(), `Quem faz ${nome} no Animador (só neste roteiro)?`, `Usar o padrão (${padraoAt()})`); if (r === false) return;
    const pers = { ...(P.animador?.pers || {}) }; if (r === undefined) delete pers[k]; else pers[k] = r === null ? null : { id: r.id, nome: r.nome }; P.animador = { ...(P.animador || {}), pers }; muda(); };
  $('[data-at-pad]', m).onclick = () => { const pers = { ...(P.animador?.pers || {}) }; delete pers[k]; P.animador = { ...(P.animador || {}), pers }; muda(); };
  $('[data-aba]', m).onclick = async () => { fim(); if (await sairDoPrep()) trocaAba('personagens'); };
  // SALVAR NA NUVEM como personagem da equipe (padrão de todos os roteiros) com o nome, a cor e o Ateliê escolhidos aqui
  $('[data-nuvem]', m).onclick = async () => { await carregaPers().catch(() => { }); let alvoNome = nome; const ja = S.pers?.[Roteiro.chave(alvoNome)];
    if (ja) { const r = await pergunta(`Já existe "${ja.nome}" na aba Personagens`, 'Atualizar o padrão dele com o que está aqui, ou criar com outro nome?', [['Cancelar', null], ['Criar com outro nome', 'outro'], ['Atualizar o padrão', 'atualiza', 'pri']]); if (!r) return;
      if (r === 'outro') { alvoNome = ((await pedeTexto('Personagem novo', 'Nome do personagem novo', 40)) || '').replace(/[:*#\[\]()<>]/g, '').trim(); if (!alvoNome) return; if (S.pers?.[Roteiro.chave(alvoNome)]) return aviso(`"${alvoNome}" também já existe.`, 'erro'); } }
    const a = atAqui(), item = { nome: alvoNome, cor: corV(), ...(a !== undefined ? { atelie: a === null ? null : { id: a.id, nome: a.nome } } : {}) };
    try { const r = await Nuvem.acao({ acao: 'personagens', itens: { [Roteiro.chave(alvoNome)]: item } }); S.pers = r.personagens || S.pers; aviso(`"${alvoNome}" salvo na aba Personagens (padrão de todos os roteiros).`, 'ok'); pinta2(); } catch (e) { aviso(e.message, 'erro'); } };
  $$('[data-x]', m).forEach(b => b.onclick = fim); m.onclick = e => { if (e.target === m) fim(); }; m.onkeydown = e => { if (e.key === 'Escape') fim(); };
  document.body.appendChild(m); pinta2(); $('[data-novo]', m).focus();
}
/* ---------- RENOMEAR / APAGAR um personagem ----------
   Muda na lista da equipe (mantém cor, foto, pasta e padrão do Animador) e nos roteiros que AINDA NÃO FORAM USADOS por um programa
   (os deste computador e os da nuvem). Os já usados não mudam (o programa já pegou o nome antigo). Os áudios continuam ligados às falas
   (só o nome do personagem muda em cada fala; o texto e o áudio ficam). */
function renomeiaNoPrep(P, velho, novo) {
  const kv = Roteiro.chave(velho), kn = Roteiro.chave(novo), info = Roteiro.classifica(P.roteiro || ''); let n = 0;
  P.roteiro = String(P.roteiro || '').replace(/\r/g, '').split('\n').map((l, i) => { const o = info[i]; if (o?.t === 'f' && Roteiro.chave(o.nome) === kv) { n++; return o.pre + novo + o.meio + o.resto; } return l; }).join('\n');
  for (const pt of P.partes || []) for (const f of pt.falas || []) if (Roteiro.chave(f.personagem) === kv) f.personagem = novo;
  const mv = o => { if (o && kv in o && kv !== kn) { if (!(kn in o)) o[kn] = o[kv]; delete o[kv]; } };
  mv(P.legenda?.cores); mv(P.animador?.pers); mv(P.org?.grupos);
  return n;
}
const temPers = (P, k) => Roteiro.personagens(P?.partes).some(p => p.chave === k);
// o que muda e o que não muda: roteiros deste computador e da nuvem, separados em "vai mudar" e "já usado (não muda)"
async function ondeEsta(k) {
  const muda = [], usados = []; let lista = S.lista; try { if (!lista) lista = S.lista = (await Nuvem.lista()).itens || []; } catch { lista = []; }
  const locais = new Map(); try { for (const [, v] of await DB.todos('rasc')) if (v?.P?.id && temPers(v.P, k)) locais.set(v.P.id, v); } catch { }
  for (const [, v] of locais) (v.P.usadoPor?.length ? usados : muda).push({ id: v.P.id, nome: v.P.nome, local: v });
  for (const it of lista) { if (locais.has(it.id)) continue; const nomes = (it.pers || []).map(Roteiro.chave); if (!nomes.includes(k) && nomes.length < 8) continue; // a lista guarda até 8 nomes
    (it.uso?.length ? usados : muda).push({ id: it.id, nome: it.nome, nuvem: true, talvez: !nomes.includes(k), uso: it.uso }); }
  return { muda, usados };
}
async function renomeiaPersonagem(k, todos, aoFim) {
  const v = todos[k]; if (!pode('organizar')) return aviso('Sua conta não muda os personagens da equipe.', 'erro');
  let novo = ((await pedeTexto(`Renomear ${v.nome}`, 'Nome novo do personagem', 40)) || '').replace(/[:*#\[\]()<>]/g, '').replace(/\s+/g, ' ').trim(); if (!novo || novo === v.nome) return;
  const kn = Roteiro.chave(novo); if (kn !== k && todos[kn] && !todos[kn]._fora) return aviso(`Já existe um personagem chamado ${todos[kn].nome}.`, 'erro');
  const espera = h(`<div class="modal"><div class="caixa">${giroBloco('Procurando onde o nome aparece')}</div></div>`); document.body.appendChild(espera);
  const { muda, usados } = await ondeEsta(k); espera.remove();
  const lis = l => l.map(x => `<li>${x.nuvem ? ic('nuvem', 13) : ic('pc', 13)} ${esc(x.nome || 'Sem nome')}${x.uso?.length ? ` <small>(usado no ${esc(x.uso.map(u => DESTINOS[u] || u).join(', '))})</small>` : ''}</li>`).join('');
  const ok = await confirmaHtml(`Renomear "${v.nome}" para "${novo}"?`, `<p>A cor, a foto, a pasta e o padrão no Animador vão junto.</p>
    ${muda.length ? `<p><b>Muda também nestes roteiros</b> (ainda não foram usados por um programa; os áudios gravados continuam):</p><ul class="lista-r">${lis(muda)}</ul>` : '<p>Nenhum roteiro não usado tem este personagem.</p>'}
    ${usados.length ? `<p class="aten-box">${ic('alerta', 15)} <b>Não muda nestes</b>, porque já estão sendo usados num programa (ele já pegou o nome "${esc(v.nome)}"):</p><ul class="lista-r">${lis(usados)}</ul>` : ''}`, 'Renomear');
  if (!ok) return;
  const { _fora, em, ...dados } = v;
  try { await Nuvem.acao({ acao: 'personagens', itens: { [kn]: { ...dados, nome: novo, ...(dados.atelie === undefined ? {} : { atelie: dados.atelie }) }, ...(kn !== k ? { [k]: { apagar: true } } : {}) } }); }
  catch (e) { return aviso(e.message, 'erro'); }
  let feitos = 0, falhas = 0;
  for (const x of muda) { try {
      if (x.local) { const r = x.local; renomeiaNoPrep(r.P, v.nome, novo); await DB.put('rasc', r.P.id, { ...r, em: Date.now() }); feitos++; continue; }
      const P = await Nuvem.abre(x.id); if (P.usadoPor?.length) continue; if (!temPers(P, k)) continue; renomeiaNoPrep(P, v.nome, novo); await Nuvem.salva(P); feitos++;
    } catch { falhas++; } }
  S.lista = null; await carregaPers(true).catch(() => { });
  aviso(`${v.nome} agora é ${novo}.${feitos ? ` Mudou em ${feitos} roteiro${feitos === 1 ? '' : 's'}.` : ''}${falhas ? ` ${falhas} não deu para mudar agora (tente de novo).` : ''}`, falhas ? 'erro' : 'ok', 7000);
  aoFim?.();
}
async function apagaPersonagem(k, todos, aoFim) {
  const v = todos[k]; if (!pode('organizar')) return aviso('Sua conta não muda os personagens da equipe.', 'erro');
  const espera = h(`<div class="modal"><div class="caixa">${giroBloco('Procurando onde o nome aparece')}</div></div>`); document.body.appendChild(espera);
  const { muda, usados } = await ondeEsta(k); espera.remove();
  const lis = l => l.map(x => `<li>${x.nuvem ? ic('nuvem', 13) : ic('pc', 13)} ${esc(x.nome || 'Sem nome')}</li>`).join('');
  const ok = await confirmaHtml(`Tirar "${v.nome}" da lista de personagens?`, `<p>Saem a cor, a foto, a pasta e o padrão no Animador. As falas dos roteiros não são apagadas.</p>
    ${muda.length ? `<p>Ele ainda aparece nestes roteiros. Se um deles for mandado para a nuvem de novo, <b>ele volta para a lista</b> (com cor e foto padrão):</p><ul class="lista-r">${lis(muda)}</ul>` : ''}
    ${usados.length ? `<p class="aten-box">${ic('alerta', 15)} Estes já estão sendo usados num programa e <b>não mudam</b>:</p><ul class="lista-r">${lis(usados)}</ul>` : ''}`, 'Tirar da lista', true);
  if (!ok) return;
  if (v._fora) { delete todos[k]; aviso(`${v.nome} saiu da lista.`, 'ok'); return aoFim?.(); }
  try { await Nuvem.acao({ acao: 'personagens', itens: { [k]: { apagar: true } } }); delete todos[k]; await carregaPers(true).catch(() => { }); aviso(`${v.nome} saiu da lista.`, 'ok'); aoFim?.(); } catch (e) { aviso(e.message, 'erro'); }
}
// janela de confirmação com texto formatado (listas)
function confirmaHtml(titulo, html, rotOk, perigo) {
  return new Promise(ok => { const m = h(`<div class="modal"><div class="caixa larga"><b>${esc(titulo)}</b><div class="conf-corpo">${html}</div><div class="bts"><button class="bt" data-n>Cancelar</button><button class="bt ${perigo ? 'perigo' : 'pri'}" data-s>${esc(rotOk)}</button></div></div></div>`);
    const fim = v => { m.remove(); ok(v); }; $('[data-n]', m).onclick = () => fim(false); $('[data-s]', m).onclick = () => fim(true); m.onkeydown = e => { if (e.key === 'Escape') fim(false); };
    document.body.appendChild(m); $('[data-s]', m).focus(); });
}

async function pintaPersonagens() {
  const el = tela(); el.innerHTML = `<section class="inicio pers-aba"><div class="cab"><span class="cab-ic t-pers">${ic('pessoa', 24)}</span><div class="cab-txt"><h1>Personagens</h1><p>O elenco da equipe: foto, cor da legenda, pasta e quem faz no Animador.</p></div><span class="esp"></span>${pode('organizar') ? `<button class="bt" data-pnova>${ic('pasta', 15)} Pasta nova</button><button class="bt pri" data-novop>${ic('mais', 15)} Personagem novo</button>` : ''}</div>
    <div class="pb-busca"><input type="search" data-busca placeholder="Buscar personagem em todas as pastas" aria-label="Buscar personagem"></div>
    <div class="pers-grade">${giroBloco()}</div>
    <input type="file" accept="image/*" data-arq hidden></section>`;
  try { await carregaPers(true); if (!S.lista) S.lista = (await Nuvem.lista().catch(() => ({ itens: [] }))).itens || []; if (S.P || S.aba !== 'personagens' || !el.isConnected) return; } catch (e) { $('.pers-grade', el).innerHTML = `<div class="vazio erro">${esc(e.message)}</div>`; return; }
  // os da equipe + os que aparecem nos roteiros e ainda não entraram na lista (ex.: roteiro só neste computador)
  const todos = { ...S.pers }; for (const it of S.lista) for (const n of it.pers || []) { const k = Roteiro.chave(n); if (!todos[k]) todos[k] = { nome: n, _fora: 1 }; }
  try { for (const [, v] of await DB.todos('rasc')) for (const p of Roteiro.personagens(v?.P?.partes)) if (!todos[p.chave]) todos[p.chave] = { nome: p.nome, _fora: 1 }; } catch { }
  const ed = pode('organizar'), arq = $('[data-arq]', el), novas = new Set(); let alvo = null, fechadas = {};
  try { fechadas = JSON.parse(localStorage.getItem('ep-prep-pastas-aba') || '{}'); } catch { }
  const manda = async (k, mudas, msg) => { try { const r = await Nuvem.acao({ acao: 'personagens', itens: { [k]: { nome: todos[k]?.nome || k, ...mudas } } }); S.pers = r.personagens || S.pers; Object.assign(todos, S.pers); if (msg) aviso(msg, 'ok'); pintaL(); } catch (e) { aviso(e.message, 'erro'); } };
  arq.onchange = async () => { const f = arq.files[0]; arq.value = ''; if (!f || !alvo) return; const k = alvo;
    try { aviso('Preparando a foto…', 'info', 1500); const b = await paraWebp(f), chaveF = `preparativos/pers/${slug(k)}-${Date.now().toString(36)}.webp`;
      await Nuvem.pede('/preparativos/arquivo?k=' + encodeURIComponent(chaveF), { method: 'POST', headers: { 'content-type': 'image/webp' }, body: b });
      await manda(k, { foto: chaveF }, `Foto salva (${Math.max(1, Math.round(b.size / 1024))} KB).`); } catch (e) { aviso(e.message, 'erro'); } };
  // PERSONAGEM NOVO: entra na lista da equipe já (antes de aparecer num roteiro), opcionalmente numa pasta
  const novoPers = async grupo => { const n = ((await pedeTexto('Personagem novo', 'Nome do personagem (como vai aparecer no roteiro)', 40)) || '').replace(/[:*#\[\]()<>]/g, '').replace(/\s+/g, ' ').trim(); if (!n) return;
    const k = Roteiro.chave(n); if (todos[k] && !todos[k]._fora) return aviso(`${todos[k].nome} já está na lista.`, 'info');
    todos[k] = { nome: n, ...(grupo ? { grupo } : {}) }; manda(k, { nome: n, ...(grupo ? { grupo } : {}) }, `${n} entrou na lista${grupo ? ' em ' + grupo : ''}. Escolha a foto, a cor e o personagem do Ateliê dele.`); };
  $('[data-novop]', el)?.addEventListener('click', () => novoPers(null));
  $('[data-pnova]', el)?.addEventListener('click', async () => { const g = await pastaNova(); if (!g) return; novas.add(g); pintaL(); aviso(`Pasta "${g}" criada. Arraste personagens para ela.`, 'info'); });
  // ===== PASTAS EM CARTÕES (como a tela inicial do Animador, pedido da dona 06/11): clicar abre a pasta; "‹ Personagens" volta =====
  let aberta = null, busca = ''; // sempre começa nas pastas (pedido da dona); clicar em "Personagens" lá em cima volta para cá
  const abre = g => { aberta = g || null; pintaL(); window.scrollTo({ top: 0 }); };
  const listaPastas = () => [...new Set([...GRUPOS_BASE, ...Object.values(todos).map(v => v.grupo).filter(Boolean), ...novas])];
  const membros = g => Object.entries(todos).filter(([, v]) => (v.grupo || '') === g).map(([k]) => k);
  const mandaVarios = async (itens, msg) => { try { const r = await Nuvem.acao({ acao: 'personagens', itens }); S.pers = r.personagens || S.pers; Object.assign(todos, S.pers); if (msg) aviso(msg, 'ok'); pintaL(); } catch (er) { aviso(er.message, 'erro'); } };
  const corP = v => v.cor || corPadrao(v.nome);
  const ordena = E => E.sort(([, a], [, b]) => String(a.nome).localeCompare(String(b.nome), 'pt-BR'));
  const moveP = (k, g) => { if (!todos[k] || (todos[k].grupo || '') === (g || '')) return; todos[k] = { ...todos[k], grupo: g || undefined }; pintaL(); manda(k, { grupo: g || null }, g ? `${todos[k].nome} foi para ${g}.` : `${todos[k].nome} saiu da pasta.`); };
  const cartao = ([k, v]) => `<div class="pc3" data-k="${esc(k)}" style="--c:${corP(v)}" ${ed ? 'draggable="true"' : ''} role="button" tabindex="0" title="Ver ${esc(v.nome)} (cor da legenda, foto, Animador)">${ava(v.nome, corP(v), 'g')}<b>${esc(v.nome)}</b>
    <span class="pc3-m"><i class="pc3-cor" title="Cor da legenda"></i>${v.atelie?.id ? `<span class="pc3-at" data-th="${esc(v.atelie.id)}" title="No Animador: ${esc(v.atelie.nome || v.atelie.id)}">${icAt(12)}</span>` : ''}</span></div>`;
  const grade = L => `<div class="pc3-grade">${L.map(cartao).join('')}</div>`;
  const renomeiaPasta = async g => { const ms = membros(g), nn = ((await pedeTexto('Renomear a pasta', `Novo nome para "${g}"`, 30)) || '').replace(/[^\p{L}\p{N} ._-]/gu, '').trim(); if (!nn || nn === g) return;
    novas.delete(g); novas.add(nn); if (aberta === g) aberta = nn; if (!ms.length) return pintaL(); mandaVarios(Object.fromEntries(ms.map(k => [k, { nome: todos[k].nome, grupo: nn }])), `Pasta renomeada para ${nn}.`); };
  const apagaPasta = async g => { const ms = membros(g); if (!await pergunta(`Apagar a pasta "${g}"?`, ms.length ? `${ms.length === 1 ? 'O personagem dela vai' : `Os ${ms.length} personagens dela vão`} para "Fora de pastas". Nenhum personagem é apagado.` : 'A pasta está vazia.', [['Cancelar', false], ['Apagar a pasta', true, 'perigo']])) return;
    novas.delete(g); if (aberta === g) aberta = null; if (!ms.length) return pintaL(); mandaVarios(Object.fromEntries(ms.map(k => [k, { nome: todos[k].nome, grupo: null }])), `Pasta "${g}" apagada.`); };
  const menuPasta = (e, g) => { const base = GRUPOS_BASE.includes(g);
    popMenu(e, [[`${ic('pasta', 14)} Abrir a pasta`, '', () => abre(g)], [`${ic('mais', 14)} Personagem novo nesta pasta…`, '', () => novoPers(g), !ed], [`${ic('pasta', 14)} Pasta nova…`, '', () => $('[data-pnova]', el)?.click(), !ed], '-',
      [`${ic('lapis', 14)} Renomear…`, base ? 'fixa' : '', () => renomeiaPasta(g), base || !ed], [`${ic('lixo', 14)} Apagar a pasta`, base ? 'fixa' : '', () => apagaPasta(g), base || !ed]]); };
  const trocaFoto = k => { alvo = k; arq.click(); };
  const tiraFoto = async k => { if (await pergunta('Tirar a foto?', `${todos[k].nome} volta a aparecer com as iniciais.`, [['Cancelar', false], ['Tirar', true, 'perigo']])) await manda(k, { foto: null }, 'Foto tirada.'); };
  const escolhePadrao = async k => { let L; try { L = await atelie(); } catch (er) { aviso(er.message, 'erro'); return false; }
    const r = await escolheNoAtelie(L, todos[k].atelie, `Padrão de ${todos[k].nome} no Animador (todos os roteiros)`, 'Automático (personagem com o mesmo nome)'); if (r === false) return false;
    { const n = { ...todos[k] }; if (r === undefined) delete n.atelie; else n.atelie = r === null ? null : { id: r.id, nome: r.nome }; todos[k] = n; S.pers = { ...(S.pers || {}), [k]: n }; pintaL(); }
    await manda(k, { atelie: r === undefined ? 'auto' : r === null ? null : { id: r.id, nome: r.nome } }, r === undefined ? 'Padrão: automático (mesmo nome).' : r === null ? 'Padrão: nenhum personagem na cena.' : `Padrão no Animador: ${r.nome}.`); return true; };
  const menuPers = (e, k) => { const v = todos[k];
    popMenu(e, [[`${ic('lapis', 14)} Ver / mudar a cor e o resto…`, '', () => detalhe(k)], [`${ic('camera', 14)} ${v.foto ? 'Trocar a foto…' : 'Pôr uma foto…'}`, '', () => trocaFoto(k), !ed],
      ...(v.foto ? [[`${ic('lixo', 14)} Tirar a foto`, '', () => tiraFoto(k), !ed]] : []), [`${icAt(14)} Padrão no Animador…`, '', () => escolhePadrao(k), !ed], '-',
      ...listaPastas().map(g => [`${ic('pasta', 14)} Mover para ${esc(g)}`, (v.grupo || '') === g ? '✓' : '', () => moveP(k, g), !ed || (v.grupo || '') === g]),
      [`${ic('pasta', 14)} Tirar da pasta`, !v.grupo ? '✓' : '', () => moveP(k, ''), !ed || !v.grupo],
      [`${ic('mais', 14)} Pasta nova com ${esc(v.nome)}…`, '', async () => { const g = await pastaNova(); if (g) { novas.add(g); moveP(k, g); } }, !ed], '-',
      [`${ic('lapis', 14)} Renomear…`, '', () => renomeiaPersonagem(k, todos, () => pintaPersonagens()), !ed],
      [`${ic('lixo', 14)} Tirar da lista…`, '', () => apagaPersonagem(k, todos, () => pintaPersonagens()), !ed]]); };
  // solta um personagem (arrastado) em cima de um elemento = vai para a pasta g
  const alvoSoltar = (alvoEl, g) => { if (!ed) return; alvoEl.ondragover = e => { if (!e.dataTransfer.types.includes('text/pers-prep')) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; alvoEl.classList.add('alvo'); };
    alvoEl.ondragleave = e => { if (!alvoEl.contains(e.relatedTarget)) alvoEl.classList.remove('alvo'); };
    alvoEl.ondrop = e => { e.preventDefault(); alvoEl.classList.remove('alvo'); const k = e.dataTransfer.getData('text/pers-prep'); if (k) moveP(k, g); }; };
  const pintaL = () => {
    const box = $('.pers-grade', el), E = ordena(Object.entries(todos)), pastas = listaPastas(); if (aberta && !pastas.includes(aberta)) aberta = null;
    if (busca) { const q = Roteiro.chave(busca), L = E.filter(([, v]) => Roteiro.chave(v.nome).includes(q)); box.innerHTML = L.length ? grade(L) : '<div class="vazio">Ninguém com esse nome.</div>'; }
    else if (aberta) { const L = E.filter(([, v]) => (v.grupo || '') === aberta), base = GRUPOS_BASE.includes(aberta);
      box.innerHTML = `<nav class="pb-cam"><button class="pb-volta" data-volta title="Voltar · solte um personagem aqui para tirar desta pasta">${ic('voltar', 14)} Personagens</button><span aria-hidden="true">›</span><b>${esc(aberta)}</b></nav>
        <div class="pb-abre-t"><span class="pb-ic">${ic('pasta', 20)}</span><h2>${esc(aberta)}</h2><small>${L.length} ${L.length === 1 ? 'personagem' : 'personagens'}</small><span class="esp"></span>${ed ? `<button class="bt" data-novo-aqui>${ic('mais', 14)} Personagem novo aqui</button>${base ? '' : `<button class="bt" data-ren>${ic('lapis', 14)} Renomear</button>`}<button class="bt ic" data-mn title="Opções da pasta">${ic('mais3', 16)}</button>` : ''}</div>
        ${L.length ? grade(L) : '<div class="pb-vazia">Pasta vazia. Volte e arraste personagens para o cartão desta pasta (ou use o botão direito no personagem › Mover para…).</div>'}`; }
    else { const soltos = E.filter(([, v]) => !v.grupo);
      box.innerHTML = `<h3 class="pb-h">Pastas <small>clique para abrir · arraste um personagem para cima de uma pasta</small></h3>
        <div class="pb-cards">${pastas.map(g => { const L = E.filter(([, v]) => v.grupo === g);
          return `<div class="pb-card" data-pasta="${esc(g)}" role="button" tabindex="0" title="Abrir a pasta · botão direito: opções"><div class="pb-prev">${L.slice(0, 3).map(([, v]) => ava(v.nome, corP(v), 'g')).join('') || `<span class="pb-vz">${ic('pasta', 34)}</span>`}</div>
            <div class="pb-info"><b>${esc(g)}</b><small>${L.length}</small><button class="pb-mn" title="Opções da pasta">${ic('mais3', 15)}</button></div><small class="pb-desc">${L.length ? esc(L.slice(0, 4).map(([, v]) => v.nome).join(', ') + (L.length > 4 ? '…' : '')) : 'Pasta vazia'}</small></div>`; }).join('')}</div>
        ${soltos.length ? `<h3 class="pb-h">Fora de pastas <small>${soltos.length}</small></h3>${grade(soltos)}` : ''}`; }
    // cartões dos personagens: clicar abre os detalhes; arrastar leva para uma pasta
    $$('.pc3', box).forEach(cd => { const k = cd.dataset.k; cd.onclick = () => detalhe(k); cd.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); detalhe(k); } }; cd.oncontextmenu = e => { e.preventDefault(); menuPers(e, k); };
      cd.ondragstart = e => { e.dataTransfer.setData('text/pers-prep', k); e.dataTransfer.effectAllowed = 'move'; cd.classList.add('arrastando'); }; cd.ondragend = () => cd.classList.remove('arrastando'); });
    const ths = $$('.pc3-at[data-th]', box); if (ths.length) atelie().then(L => ths.forEach(t => { const x = L.find(y => y.id === t.dataset.th); if (x) thumbDe(x).then(u => { if (u) { t.style.backgroundImage = `url("${u}")`; t.classList.add('com-th'); t.innerHTML = ''; } }); })).catch(() => { });
    $$('.pb-card', box).forEach(c => { const g = c.dataset.pasta; c.onclick = e => { if (e.target.closest('.pb-mn')) return; abre(g); }; c.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abre(g); } };
      $('.pb-mn', c).onclick = e => { e.stopPropagation(); menuPasta(e.currentTarget, g); }; c.oncontextmenu = e => { e.preventDefault(); menuPasta(e, g); }; alvoSoltar(c, g); });
    const vt = $('[data-volta]', box); if (vt) { vt.onclick = () => abre(null); alvoSoltar(vt, ''); }
    $('[data-ren]', box)?.addEventListener('click', () => renomeiaPasta(aberta)); $('[data-mn]', box)?.addEventListener('click', e => menuPasta(e.currentTarget, aberta)); $('[data-novo-aqui]', box)?.addEventListener('click', () => novoPers(aberta));
  };
  { const bi = $('[data-busca]', el); bi.oninput = () => { busca = bi.value.trim(); pintaL(); }; }
  // ===== DETALHES DO PERSONAGEM (abre ao clicar): cor da legenda (com as cores do personagem do Ateliê e conta-gotas), foto, Animador, pasta =====
  const detalhe = k => { const v = todos[k]; if (!v) return; let cor = corP(v), tSalva = 0;
    const m = h(`<div class="modal"><div class="caixa pd-caixa" style="--c:${cor}" role="dialog" aria-label="${esc(v.nome)}">
      <div class="pd-cab"><button class="foto" ${ed ? '' : 'disabled'} title="${v.foto ? 'Trocar a foto' : 'Pôr uma foto'}">${ava(v.nome, cor, 'g')}<span class="cam">${ic('camera', 13)}</span></button>
        <div class="pd-nome"><b>${esc(v.nome)}</b><small>${ic('pasta', 12)} ${v.grupo ? esc(v.grupo) : 'fora de pastas'}${v.foto && ed ? ` · <button class="link" data-tira>tirar a foto</button>` : ''}</small></div><span class="esp"></span><button class="bt ic" data-x title="Fechar">${ic('voltar', 15)}</button></div>
      <div class="pd-corpo">
        <div class="pd-sec"><small>Cor da legenda</small><div class="paleta">${PALETA.map(x => `<button class="cor" style="--c:${x}" data-cor="${x}" ${ed ? '' : 'disabled'} title="${x}"></button>`).join('')}<label class="cor-outra" title="Outra cor"><input type="color" value="${cor}" ${ed ? '' : 'disabled'}><span>${ic('mais', 12)}</span></label></div></div>
        <div class="pd-sec pd-at" hidden><small>Cores do personagem <b data-at-nome></b> <span class="pd-carr">${giro()}</span></small><div class="pd-at-l"><canvas class="pd-cv" width="150" height="150" title="Clique para pegar a cor deste ponto"></canvas>
          <div class="pd-at-d"><div class="paleta" data-cores></div><span class="dica">As cores que mais aparecem no personagem do Ateliê. Ou clique na imagem para pegar a cor daquele ponto. Rodinha (ou pinça) = zoom, arrastar = mover, duplo clique = ver inteiro.</span><span class="pd-lupa"><i></i><b></b></span></div></div></div>
        <div class="pd-leg"><span>Exemplo de legenda</span></div>
        <div class="pd-2"><div class="pd-sec"><small>No Animador</small><button class="el-esc" data-pad ${ed ? '' : 'disabled'}><span class="ap-th p ${v.atelie?.id ? '' : 'sem-th'}" ${v.atelie?.id ? `data-th="${esc(v.atelie.id)}"` : ''}>${v.atelie?.id ? esc(iniciais(v.atelie.nome || v.atelie.id)) : icAt(20)}</span><span>${v.atelie === null ? 'Nenhum' : v.atelie?.id ? esc(v.atelie.nome || v.atelie.id) : 'Automático (mesmo nome)'}</span></button></div>
          <div class="pd-sec"><small>Pasta</small><select data-pasta ${ed ? '' : 'disabled'}><option value="">Fora de pastas</option>${listaPastas().map(g => `<option value="${esc(g)}" ${g === v.grupo ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select></div></div>
      </div>
      <div class="bts"><button class="bt" data-ren ${ed ? '' : 'disabled'}>${ic('lapis', 14)} Renomear</button><button class="bt" data-apaga ${ed ? '' : 'disabled'}>${ic('lixo', 14)} Tirar da lista</button><span class="esp"></span><button class="bt pri" data-x>Pronto</button></div></div></div>`);
    const cx = $('.pd-caixa', m), fim = () => { if (tSalva) { clearTimeout(tSalva); tSalva = 0; if (cor !== corP(todos[k])) manda(k, { cor }); } m._sai?.(); m.remove(); };
    // escolher a cor: muda na hora aqui e guarda logo depois (uma gravação só, mesmo clicando em várias)
    const poeCor = (c, guarda = true) => { cor = c; cx.style.setProperty('--c', c); $('.ava', cx)?.style.setProperty('--c', c); $$('[data-cor]', m).forEach(b => b.classList.toggle('on', b.dataset.cor === c)); $('input[type=color]', m).value = c;
      if (guarda && ed) { clearTimeout(tSalva); tSalva = setTimeout(() => { tSalva = 0; manda(k, { cor: c }); }, 700); } };
    poeCor(cor, false);
    $$('[data-cor]', m).forEach(b => b.onclick = () => poeCor(b.dataset.cor)); $('input[type=color]', m).oninput = e => poeCor(e.target.value);
    m.onclick = e => { if (e.target === m || e.target.closest('[data-x]')) fim(); }; const esc0 = e => { if (e.key === 'Escape' && m.isConnected && !document.querySelector('.modal:not(:has(.pd-caixa))')) fim(); }; document.addEventListener('keydown', esc0); m._sai = () => document.removeEventListener('keydown', esc0);
    $('.foto', m).onclick = () => { fim(); trocaFoto(k); };
    $('[data-tira]', m)?.addEventListener('click', async () => { fim(); await tiraFoto(k); });
    $('[data-pad]', m).onclick = async () => { fim(); await escolhePadrao(k); detalhe(k); };
    $('[data-pasta]', m).onchange = e => moveP(k, e.target.value);
    $('[data-ren]', m).onclick = () => { fim(); renomeiaPersonagem(k, todos, () => pintaPersonagens()); };
    $('[data-apaga]', m).onclick = () => { fim(); apagaPersonagem(k, todos, () => pintaPersonagens()); };
    document.body.appendChild(m); $('[data-x]', m).focus();
    // personagem do Ateliê ligado a ele: o escolhido, senão o de MESMO nome (sem gastar nuvem: a miniatura já vem guardada)
    // A seção aparece SEMPRE: carregando → cores + imagem; sem personagem ligado ou sem miniatura, diz o porquê (antes ficava vazia)
    const sec = $('.pd-at', m), boxC = $('[data-cores]', m), cv = $('.pd-cv', m), g = cv.getContext('2d', { willReadFrequently: true }), cores = [];
    const msgAt = t => { $('.pd-carr', m)?.remove(); boxC.innerHTML = `<small class="dica">${esc(t)}</small>`; };
    sec.hidden = false;
    const pintaCores = () => { $('.pd-carr', m)?.remove(); boxC.innerHTML = cores.slice(0, 8).map(c => `<button class="cor" style="--c:${c}" data-cor="${c}" ${ed ? '' : 'disabled'} title="${c}"></button>`).join('') || '<small class="dica">Não achei cores nessa imagem.</small>';
      $$('[data-cor]', boxC).forEach(b => { b.onclick = () => poeCor(b.dataset.cor); b.classList.toggle('on', b.dataset.cor === cor); }); };
    if (v.atelie === null) { cv.hidden = true; $('.pd-lupa', m).hidden = true; msgAt('Sem personagem do Ateliê ("Nenhum" em No Animador).'); }
    else atelie().then(async L => { const x = v.atelie?.id ? L.find(y => y.id === v.atelie.id) : L.find(y => Roteiro.chave(y.nome) === k); if (!m.isConnected) return;
      if (!x) { cv.hidden = true; $('.pd-lupa', m).hidden = true; return msgAt(v.atelie?.id ? 'O personagem do Ateliê ligado a ele não foi achado (foi apagado?).' : 'Ligue um personagem do Ateliê em "No Animador" para ver as cores dele.'); }
      $('[data-at-nome]', m).textContent = '(' + x.nome + ')';
      const pa = $('[data-pad] [data-th]', m); const u = await thumbDe(x); if (!m.isConnected) return; if (pa && u) { pa.style.backgroundImage = `url("${u}")`; pa.classList.add('com-th'); pa.textContent = ''; }
      if (thCor.get(x.id)) cores.push(thCor.get(x.id)); // a cor principal que o Animador já calculou
      if (!u) { cv.hidden = true; $('.pd-lupa', m).hidden = true; if (cores.length) pintaCores(); else msgAt('Esse personagem do Ateliê ainda não tem miniatura (abra e salve ele no Ateliê).'); return; }
      const im = new Image(); im.onerror = () => { cv.hidden = true; cores.length ? pintaCores() : msgAt('Não consegui ler a imagem dele.'); };
      // ZOOM no conta-gotas: rodinha (ou pinça) = zoom no ponto; arrastar = mover; clique sem arrastar = pegar a cor
      const V = { z: 1, x: 0, y: 0 }, W = cv.width = 300, H = cv.height = 300;
      const desenha = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); const r = Math.min(W / im.width, H / im.height) * V.z; g.imageSmoothingEnabled = V.z < 3;
        g.drawImage(im, W / 2 - im.width * r / 2 + V.x, H / 2 - im.height * r / 2 + V.y, im.width * r, im.height * r); };
      const zoomEm = (fx, fy, f) => { const z2 = Math.max(1, Math.min(16, V.z * f)), k2 = z2 / V.z; V.x = (V.x - (fx - W / 2)) * k2 + (fx - W / 2); V.y = (V.y - (fy - H / 2)) * k2 + (fy - H / 2); V.z = z2; if (V.z === 1) V.x = V.y = 0; desenha(); };
      const naTela = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
      im.onload = () => { desenha(); for (const c of coresDaImagem(g, W, H)) if (!cores.includes(c)) cores.push(c); pintaCores(); };
      im.src = u;
      const ponto = e => { const [px, py] = naTela(e), d = g.getImageData(Math.max(0, Math.min(W - 1, Math.floor(px))), Math.max(0, Math.min(H - 1, Math.floor(py))), 1, 1).data; return d[3] > 100 ? '#' + [d[0], d[1], d[2]].map(n => n.toString(16).padStart(2, '0')).join('') : null; };
      cv.onwheel = e => { e.preventDefault(); const [px, py] = naTela(e); zoomEm(px, py, e.deltaY < 0 ? 1.25 : 1 / 1.25); };
      const toques = new Map(); let arr = null, mexeu = false, pin = 0;
      cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); toques.set(e.pointerId, [e.clientX, e.clientY]); mexeu = false; arr = { x: e.clientX, y: e.clientY, vx: V.x, vy: V.y };
        if (toques.size === 2) { const [a, b] = [...toques.values()]; pin = Math.hypot(a[0] - b[0], a[1] - b[1]); } };
      cv.onpointermove = e => { const c = ponto(e); if (c) { $('.pd-lupa i', m).style.background = c; $('.pd-lupa b', m).textContent = c; }
        if (!toques.has(e.pointerId)) return; toques.set(e.pointerId, [e.clientX, e.clientY]); const r = cv.getBoundingClientRect(), k2 = W / r.width;
        if (toques.size === 2) { const [a, b] = [...toques.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pin) { const [px, py] = naTela({ clientX: (a[0] + b[0]) / 2, clientY: (a[1] + b[1]) / 2 }); zoomEm(px, py, d / pin); } pin = d; mexeu = true; return; }
        if (arr && V.z > 1 && Math.hypot(e.clientX - arr.x, e.clientY - arr.y) > 3) { mexeu = true; V.x = arr.vx + (e.clientX - arr.x) * k2; V.y = arr.vy + (e.clientY - arr.y) * k2; desenha(); } };
      cv.onpointerup = cv.onpointercancel = e => { toques.delete(e.pointerId); if (toques.size < 2) pin = 0; if (!toques.size) { if (!mexeu && e.type === 'pointerup' && ed) { const c = ponto(e); if (c) poeCor(c); } arr = null; } };
      cv.ondblclick = () => { V.z = 1; V.x = V.y = 0; desenha(); };
    }).catch(() => msgAt('Não consegui abrir a lista do Ateliê agora.'));
  };
  pintaL();
}
// AS CORES QUE MAIS APARECEM numa imagem (para escolher a cor da legenda): junta por tom e claridade e devolve a média de cada grupo
function coresDaImagem(g, w, h) {
  let D; try { D = g.getImageData(0, 0, w, h).data; } catch { return []; } const grupos = new Map(); let tot = 0;
  for (let i = 0; i < D.length; i += 8) { if (D[i + 3] < 200) continue; const r = D[i], gg = D[i + 1], b = D[i + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), l = (mx + mn) / 510, s = mx === mn ? 0 : (mx - mn) / 255 / (1 - Math.abs(2 * l - 1) || 1);
    if (l < .1) continue; // contorno preto não conta
    let hh = 0; if (mx !== mn) { const d = mx - mn; hh = mx === r ? ((gg - b) / d + 6) % 6 : mx === gg ? (b - r) / d + 2 : (r - gg) / d + 4; }
    const key = s < .15 ? 'n' + Math.round(l * 4) : Math.round(hh * 3) % 18 + ':' + Math.round(l * 3); const v = grupos.get(key) || [0, 0, 0, 0]; v[0] += r; v[1] += gg; v[2] += b; v[3]++; grupos.set(key, v); tot++; }
  return [...grupos.values()].filter(v => v[3] > tot * .02).sort((a, b) => b[3] - a[3]).slice(0, 7).map(v => '#' + v.slice(0, 3).map(x => Math.round(x / v[3]).toString(16).padStart(2, '0')).join(''));
}

/* ---------- aba Ideias (mesmos dados das Ideias do Animador: /ideias → ideias/*.json) ---------- */
const num = n => { n = +n || 0; return n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '').replace('.', ',') + ' mi' : n >= 1e3 ? Math.round(n / 1e3) + ' mil' : String(n); };
const PEND_IDEIAS = 'prep-ideias-pendentes'; // ideias que a nuvem não aceitou (ex.: limite do dia)
const Ideias = {
  S: null, formato: 'todos', aFormato: 'short', aCanal: '',
  async pinta(novo) {
    const T = telaNova(), el = T.el; el.innerHTML = `<section class="inicio ideias">
      <div class="cab"><span class="cab-ic t-ideia">${ic('luz', 24)}</span><div class="cab-txt"><h1>Ideias</h1><p>O que está funcionando nos canais e ideias para o nosso.</p></div><span class="esp"></span>${pode('ideias') ? `<button class="bt" data-canais>${ic('play', 15)} Canais</button><button class="bt" data-an title="Pede de novo a análise dos canais de referência">${ic('atualizar')} Atualizar análise</button><button class="bt" data-nova>${ic('mais')} Escrever ideia</button><button class="bt pri" data-sug>${ic('luz')} Sugerir ideias</button>` : ''}</div>
      <div class="analise-box">${giroBloco('Carregando a análise')}</div>
      <h2 class="ids-tit">${ic('luz', 16)} Ideias para o nosso canal</h2>
      <div class="filtros">${[['todos', 'Todas', 'grade'], ['short', 'Shorts', 'celular'], ['longo', 'Vídeos longos', 'filme']].map(([k, n, i]) => `<button data-fo="${k}" class="${this.formato === k ? 'on' : ''}">${ic(i, 14)} ${n}</button>`).join('')}</div>
      <div class="ids grade">${giroBloco()}</div></section>`;
    try { if (!this.S || novo) this.S = await Nuvem.pede('/ideias'); } catch (e) { if (S.P || S.aba !== 'ideias') return T.cancela(); T.mostra(); $('.ids', el).innerHTML = $('.analise-box', el).innerHTML = `<div class="vazio erro">${esc(e.message)}</div>`; return; }
    // ideias que não foram para a nuvem (06/11/2026: as 8 ideias de 05/11 sumiram quando a nuvem estava no limite): manda de novo, UMA vez por página
    if (!this._pend) { this._pend = true; let p = null; try { p = JSON.parse(localStorage.getItem(PEND_IDEIAS) || 'null'); } catch { }
      if (p?.lista) { const s = this.S.ideias; if (!s || String(p.em || '') > String(s.em || '')) { this.S.ideias = p; return this.guarda(p, 'As ideias que não tinham ido para a nuvem foram salvas agora.'); } try { localStorage.removeItem(PEND_IDEIAS); } catch { } } }
    if (S.P || S.aba !== 'ideias') return T.cancela(); T.mostra(); const A = this.S.analise, I = this.S.ideias || { lista: [] };
    this.pintaAnalise($('.analise-box', el), A, I);
    $('[data-canais]', el)?.addEventListener('click', () => this.canais());
    $('[data-an]', el)?.addEventListener('click', async e => { e.currentTarget.disabled = true; try { const r = await Nuvem.json('/ideias', 'POST', { acao: 'atualizar', canais: this.S.canais || [] }); aviso(r.ja ? 'A análise já foi pedida há pouco.' : 'Análise pedida. Ela chega em alguns minutos.', 'ok'); } catch (er) { aviso(er.message, 'erro'); } });
    $('[data-nova]', el)?.addEventListener('click', () => this.edita(null));
    $('[data-sug]', el)?.addEventListener('click', e => this.sugere(e.currentTarget));
    $$('[data-fo]', el).forEach(b => b.onclick = () => { this.formato = b.dataset.fo; this.pinta(); });
    const g = $('.ids', el), L = (I.lista || []).filter(x => this.formato === 'todos' || x.formato === this.formato);
    g.innerHTML = L.length ? '' : `<div class="vazio">${I.lista?.length ? 'Nenhuma ideia deste formato.' : `Nenhuma ideia ainda.${pode('ideias') && A ? ' Use "Sugerir ideias" para ganhar ideias a partir do que está funcionando, ou escreva a sua.' : ''}`}</div>`;
    for (const x of L) {
      const c = h(`<div class="cartao ideia ${x.formato === 'longo' ? 'longo' : 'short'}"><div class="topo"><span class="st">${ic(x.formato === 'longo' ? 'filme' : 'celular', 12)} ${x.formato === 'longo' ? 'Vídeo longo' : 'Short'}</span>${x.esforco ? `<span class="dica">esforço ${esc(x.esforco)}</span>` : ''}</div>
        <b>${esc(x.titulo)}</b>${x.gancho ? `<p class="gancho">“${esc(x.gancho)}”</p>` : ''}<small>${esc(x.resumo || '')}</small>
        ${x.porque ? `<small class="pq">${ic('luz', 12)} ${esc(x.porque)}</small>` : ''}${x.personagens?.length ? `<div class="elenco">${x.personagens.slice(0, 5).map(p => ava(p, corOuPadrao(p), 'p')).join('')}</div>` : ''}
        <div class="bts">${pode('roteiro') ? `<button class="bt pri" data-rot>${ic('doc', 14)} Virar roteiro</button>` : ''}${pode('ideias') ? `<button class="bt" data-ed>Editar</button><button class="bt ic" data-del title="Tirar esta ideia">${ic('lixo', 14)}</button>` : ''}</div></div>`);
      $('[data-rot]', c)?.addEventListener('click', () => this.viraRoteiro(x, I));
      $('[data-ed]', c)?.addEventListener('click', () => this.edita(x));
      $('[data-del]', c)?.addEventListener('click', async () => { if (!await pergunta('Tirar esta ideia?', x.titulo, [['Cancelar', false], ['Tirar', true, 'perigo']])) return; I.lista = I.lista.filter(y => y !== x); this.guarda(I); });
      g.appendChild(c);
    }
  },
  // O QUE ESTÁ FUNCIONANDO: os padrões em cartões (título + detalhe) e os canais um embaixo do outro, com Shorts OU Vídeos longos
  // (um formato por vez, para não misturar) e filtro por canal; muitos canais = a lista rola por dentro
  pintaAnalise(box, A, I) {
    if (!A?.canais?.length) { box.innerHTML = `<div class="vazio">Ainda não há análise dos canais de referência.${pode('ideias') ? ' Use "Canais" para escolher e "Atualizar análise".' : ''}</div>`; return; }
    const sh = this.aFormato === 'short', cs = A.canais.filter(c => !this.aCanal || c.h === this.aCanal);
    const pad = (I.padroes || []).slice(0, 8).map(p => { const i = p.indexOf(':'); return i > 8 && i < 110 ? [p.slice(0, i), p.slice(i + 1).trim()] : [p, '']; });
    box.innerHTML = `<div class="an-cab"><h2>${ic('grafico', 16)} O que está funcionando agora</h2><small class="dica">análise de ${esc(quando(A.em))} · ${A.canais.length} cana${A.canais.length === 1 ? 'l' : 'is'}</small></div>
      ${pad.length ? `<div class="padroes2">${pad.map(([t, d], i) => `<div class="pad"><span class="pad-n">${i + 1}</span><div><b>${esc(t)}</b>${d ? `<p>${esc(d)}</p>` : ''}</div></div>`).join('')}</div>` : ''}
      <div class="an-filtros"><div class="seg">${[['short', 'Shorts', 'celular'], ['longo', 'Vídeos longos', 'filme']].map(([k, n, i]) => `<button data-af="${k}" class="${this.aFormato === k ? 'on' : ''}">${ic(i, 14)} ${n}</button>`).join('')}</div>
        <div class="chips-canal"><button data-ac="" class="${!this.aCanal ? 'on' : ''}">Todos os canais</button>${A.canais.map(c => `<button data-ac="${esc(c.h)}" class="${this.aCanal === c.h ? 'on' : ''}">${c.avatar ? `<img src="${esc(c.avatar)}" alt="" referrerpolicy="no-referrer">` : ''}${esc(c.nome)}</button>`).join('')}</div></div>
      <div class="canais-l">${cs.map(c => { const vs = ((sh ? c.shorts : c.longos)?.bem || []).slice(0, 10), med = c.mediana?.[sh ? 'short' : 'longo'];
        return `<div class="canal-l"><div class="cl-info">${c.avatar ? `<img src="${esc(c.avatar)}" alt="" referrerpolicy="no-referrer">` : ''}<div><b>${esc(c.nome)}</b><small>${esc(c.h)}</small><small>${esc(c.inscritos || '')}</small>${med ? `<small>média de ${num(med)} views por ${sh ? 'short' : 'vídeo'}</small>` : ''}</div></div>
          <div class="cl-vids ${sh ? 'sh' : 'lg'}">${vs.length ? vs.map(v => `<a class="vid2" href="https://www.youtube.com/watch?v=${esc(v.id)}" target="_blank" rel="noopener" title="${esc(v.titulo)}"><span class="vt"><img src="https://i.ytimg.com/vi/${esc(v.id)}/mqdefault.jpg" alt="" loading="lazy" referrerpolicy="no-referrer">${v.nota ? `<span class="x">${String(v.nota).replace('.', ',')}×</span>` : ''}${!sh && v.dur ? `<span class="d">${esc(v.dur)}</span>` : ''}</span><b>${esc(v.titulo || '(sem título)')}</b><small>${num(v.views)} views</small></a>`).join('') : `<small class="dica">Nada acima da média em ${sh ? 'shorts' : 'vídeos longos'}.</small>`}</div></div>`; }).join('')}</div>
      <small class="dica">"2×" = o vídeo teve o dobro das views que o canal costuma ter.</small>`;
    $$('[data-af]', box).forEach(b => b.onclick = () => { this.aFormato = b.dataset.af; this.pintaAnalise(box, A, I); });
    $$('[data-ac]', box).forEach(b => b.onclick = () => { this.aCanal = b.dataset.ac; this.pintaAnalise(box, A, I); });
  },
  // CANAIS de referência (até 20): adicionar e tirar; salvar já pede a análise de novo
  canais() {
    let L = [...(this.S?.canais || ['@Torajo', '@TurmaDaBatatinha'])];
    const m = h(`<div class="modal"><div class="caixa larga"><b>Canais de referência</b><p>Os canais do YouTube que a análise acompanha (até 20). Escreva o @ do canal, como aparece no endereço dele.</p>
      <div class="can-lista"></div><div class="can-add"><input placeholder="@canal" maxlength="41"><button class="bt" data-add>${ic('mais', 14)} Adicionar</button></div>
      <div class="bts"><button class="bt" data-c>Cancelar</button><button class="bt pri" data-s>Salvar e analisar</button></div></div></div>`);
    const A = this.S?.analise, info = h => A?.canais?.find(c => c.h.toLowerCase() === h.toLowerCase());
    const pinta = () => { $('.can-lista', m).innerHTML = L.map((x, i) => { const c = info(x); return `<div class="can-l">${c?.avatar ? `<img src="${esc(c.avatar)}" alt="" referrerpolicy="no-referrer">` : `<span class="can-sem">${ic('play', 14)}</span>`}<div><b>${esc(c?.nome || x)}</b><small>${esc(x)}${c?.inscritos ? ' · ' + esc(c.inscritos) : c ? '' : ' · entra na próxima análise'}</small></div><button class="bt ic" data-tira="${i}" title="Tirar">${ic('lixo', 14)}</button></div>`; }).join('') || '<p class="dica">Nenhum canal.</p>';
      $$('[data-tira]', m).forEach(b => b.onclick = () => { L.splice(+b.dataset.tira, 1); pinta(); }); };
    const add = () => { const i = $('.can-add input', m); let v = i.value.trim().replace(/^https?:\/\/(www\.)?youtube\.com\//i, '').replace(/\/.*$/, ''); if (!v) return; if (!v.startsWith('@')) v = '@' + v;
      if (!/^@[\w.\-]{3,40}$/.test(v)) return aviso('Escreva o @ do canal (ex.: @Torajo).', 'info'); if (L.some(x => x.toLowerCase() === v.toLowerCase())) return aviso('Esse canal já está na lista.', 'info'); if (L.length >= 20) return aviso('No máximo 20 canais.', 'info'); L.push(v); i.value = ''; pinta(); };
    $('[data-add]', m).onclick = add; $('.can-add input', m).onkeydown = e => { if (e.key === 'Enter') add(); };
    $('[data-c]', m).onclick = () => m.remove();
    $('[data-s]', m).onclick = async e => { if (!L.length) return aviso('Ponha pelo menos um canal.', 'info'); const b = e.currentTarget; b.disabled = true; b.innerHTML = giro('Salvando');
      try { const r = await Nuvem.json('/ideias', 'POST', { acao: 'atualizar', canais: L }); this.S.canais = L; m.remove(); aviso(r.ja ? 'Canais salvos. A análise já tinha sido pedida há pouco; ela chega em alguns minutos.' : 'Canais salvos. A análise nova chega em alguns minutos.', 'ok', 6000); }
      catch (er) { aviso(er.message, 'erro'); b.disabled = false; b.textContent = 'Salvar e analisar'; } };
    document.body.appendChild(m); pinta(); $('.can-add input', m).focus();
  },
  viraRoteiro(x, I) {
    // o que a equipe escolhe vira exemplo do gosto dela nas próximas ideias (mesmo campo do Animador)
    I.escolhidas = [...(I.escolhidas || []), { titulo: x.titulo, formato: x.formato, em: Date.now() }].slice(-30); Nuvem.json('/ideias', 'PUT', { ideias: I }).catch(() => { });
    const t = `// Ideia: ${x.titulo}${x.resumo ? '\n// ' + x.resumo : ''}${x.gancho ? '\n// Gancho: ' + x.gancho : ''}\n\n## ${x.titulo} parte 1\n`;
    S.aba = 'roteiros'; $$('[data-aba]').forEach(b => b.classList.toggle('on', b.dataset.aba === 'roteiros')); S.sub = 'roteiro'; abrePrep(novoPrep(String(x.titulo).slice(0, 80), t));
  },
  // ideias novas a partir da análise dos canais (mesmo serviço do "Organizar"; nada na tela fala de IA)
  SIS: `Você é o roteirista-chefe do canal Problems (animação 2D brasileira, Estúdio Problems). Leia a ANÁLISE dos canais de referência (números reais)
e proponha ideias de vídeos para o NOSSO canal, com o NOSSO elenco, copiando o FORMATO e o motivo de dar certo (nunca os personagens, nomes ou histórias dos outros).
Responda SÓ um JSON: {"padroes":["frase curta com um padrão que está funcionando, citando número", ...4 a 6],"ideias":[{"formato":"short|longo","titulo":"título no estilo do canal","gancho":"a primeira fala ou imagem (2 s)","resumo":"2-3 frases","porque":"por que deve dar certo, citando o padrão","personagens":["nomes do nosso elenco"],"esforco":"baixo|medio|alto"}]}
Metade shorts e metade longos; formatos variados (mistério, conversa com o público, enquete, curiosidades, "e se…", desafio, clipe musical, episódio).`,
  resumo() { const A = this.S?.analise; if (!A) return '';
    const lin = v => `- "${v.titulo}" · ${num(v.views)} views${v.nota ? ` · ×${v.nota} da mediana` : ''}${v.dur ? ` · ${v.dur}` : ''}`;
    return A.canais.map(c => [`CANAL ${c.nome} (${c.h}) · ${c.inscritos || ''} · mediana ${num(c.mediana?.short)} (shorts) / ${num(c.mediana?.longo)} (longos)`,
      'SHORTS indo bem:', ...(c.shorts?.bem || []).slice(0, 10).map(lin), 'SHORTS mais vistos:', ...(c.shorts?.populares || []).slice(0, 10).map(lin),
      'LONGOS indo bem:', ...(c.longos?.bem || []).slice(0, 8).map(lin), 'LONGOS mais vistos:', ...(c.longos?.populares || []).slice(0, 8).map(lin)].join('\n')).join('\n\n'); },
  async sugere(bt) {
    if (!this.S?.analise) return aviso('Ainda não há análise dos canais. Use "Atualizar análise" e espere alguns minutos.', 'info');
    const I0 = this.S.ideias || { lista: [] }, rot = bt.innerHTML; bt.disabled = true; bt.innerHTML = giro('Pensando nas ideias');
    try {
      const elenco = [...new Set([...Object.values(await carregaPers().catch(() => ({}))).map(v => v.nome), ...(S.lista || []).flatMap(x => x.pers || [])].map(n => Roteiro.norm(n)).filter(Boolean))].slice(0, 30);
      const pedido = `ANÁLISE (${quando(this.S.analise.em)}):\n${this.resumo()}\n\nNOSSO ELENCO: ${elenco.join(', ') || '(use personagens genéricos do canal Problems)'}\n\n`
        + (I0.lista?.length ? `IDEIAS QUE JÁ EXISTEM (não repita):\n${I0.lista.map(x => `- [${x.formato}] ${x.titulo}`).join('\n')}\n\n` : '')
        + (I0.escolhidas?.length ? `IDEIAS QUE A EQUIPE JÁ ESCOLHEU (aprenda o gosto, sem repetir):\n${I0.escolhidas.slice(-15).map(x => `- [${x.formato}] ${x.titulo}`).join('\n')}\n\n` : '') + 'Escreva 8 ideias.';
      const r = await fetch(SRV + '/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', ...(await Nuvem.hd()) }, body: JSON.stringify({ system: [{ type: 'text', text: this.SIS }], messages: [{ role: 'user', content: pedido }] }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error?.message || 'A nuvem não conseguiu sugerir agora.'); }
      const saida = /event-stream/.test(r.headers.get('content-type') || '') ? await Organizar.le(r) : ((await r.json()).content || []).map(x => x.text || '').join('');
      const m = saida.match(/\{[\s\S]*\}/); if (!m) throw new Error('Não deu para sugerir agora. Tente de novo.');
      const j = JSON.parse(m[0]), txt = (v, n) => String(v || '').slice(0, n);
      const novas = (j.ideias || []).filter(x => x?.titulo).map(x => ({ id: 'ide' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), formato: x.formato === 'longo' ? 'longo' : 'short', titulo: txt(x.titulo, 140), gancho: txt(x.gancho, 240), resumo: txt(x.resumo, 800), porque: txt(x.porque, 300), personagens: (Array.isArray(x.personagens) ? x.personagens : []).map(p => txt(p, 40)).slice(0, 6), esforco: ['baixo', 'medio', 'alto'].includes(x.esforco) ? x.esforco : '' }));
      if (!novas.length) throw new Error('Não vieram ideias. Tente de novo.');
      const I = { ...I0, em: new Date().toISOString(), base: this.S.analise.em, padroes: (j.padroes || I0.padroes || []).map(String).slice(0, 8), lista: [...novas, ...(I0.lista || [])] };
      this.S.ideias = I; await this.guarda(I, `${novas.length} ideias novas.`);
    } catch (e) { aviso(e.message, 'erro'); if (bt.isConnected) { bt.disabled = false; bt.innerHTML = rot; } }
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
  async guarda(I, msg = 'Ideias salvas.') { I.em = new Date().toISOString(); try { await Nuvem.json('/ideias', 'PUT', { ideias: I }); try { localStorage.removeItem(PEND_IDEIAS); } catch { } aviso(msg, 'ok'); }
    catch (e) { try { localStorage.setItem(PEND_IDEIAS, JSON.stringify(I)); } catch { } aviso(e.message + ' As ideias ficaram guardadas neste computador e vão para a nuvem na próxima vez que você abrir as Ideias.', 'erro'); } this.pinta(); },
};

/* ======================= começo ======================= */
// o botão VOLTAR/AVANÇAR do navegador anda entre as telas (roteiro aberto, abas); com mudança não mandada, pergunta antes de sair
addEventListener('popstate', async () => {
  const q = new URLSearchParams(location.search), id = q.get('id'), aba = q.get('aba') || 'roteiros';
  if (S.P && S.P.id === id) return;
  if (S.P && !await sairDoPrep(true)) { history.pushState(null, '', './?id=' + encodeURIComponent(S.P.id)); return; }
  if (id && /^[A-Za-z0-9_-]{2,40}$/.test(id)) { const r = await DB.get('rasc', id).catch(() => null); try { return abrePrep(r?.P && !r.base?.mod ? r.P : await Nuvem.abre(id), r?.P && !r.base?.mod ? r.base : undefined, true); } catch (e) { if (r?.P) return abrePrep(r.P, r.base, true); aviso(e.status === 404 ? 'Esse roteiro não existe mais (foi apagado).' : e.message, 'erro'); } }
  trocaAba(['ideias', 'personagens'].includes(aba) ? aba : 'roteiros', true);
});
$$('[data-aba]').forEach(b => b.onclick = async () => { if (S.P && !await sairDoPrep(true)) return; trocaAba(b.dataset.aba); });
addEventListener('beforeunload', e => { if (mudouDeVerdade()) { e.preventDefault(); e.returnValue = ''; } });
addEventListener('DOMContentLoaded', () => window.EstudioConta?.espaco?.registrar?.({
  programa: 'Preparativos',
  async listar() { const out = [];
    try { for (const [k, v] of await DB.todos('rasc')) out.push({ nome: v.P?.nome || k, bytes: JSON.stringify(v).length, data: v.em, info: 'rascunho do roteiro', rotuloBaixar: 'Baixar .preparativos', baixar: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(v.P, null, 1)], { type: 'application/json' })); a.download = (v.P?.nome || 'roteiro').replace(/[^\w\- ]+/g, '_') + '.preparativos'; a.click(); }, apagar: () => DB.del('rasc', k) });
      for (const [k, v] of await DB.todos('aud')) out.push({ nome: 'Gravação ' + k.split('/')[1], bytes: v.blob?.size || 0, data: v.em, info: 'falta enviar', rotuloBaixar: 'Baixar áudio', baixar: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(v.blob); a.download = k.replace('/', '_') + '.webm'; a.click(); }, apagar: () => DB.del('aud', k) }); } catch { }
    return out; },
}));
(async () => {
  { const IAB = { roteiros: 'doc', ideias: 'luz', personagens: 'pessoa' }; $$('[data-aba]').forEach(b => { if (!b.querySelector('svg')) b.insertAdjacentHTML('afterbegin', ic(IAB[b.dataset.aba] || 'doc', 16) + ' '); }); }
  try { S.eu = await window.EstudioLogin?.pronto; } catch { }
  // níveis de acesso: o /estudio-conta.js (defer) cria o EstudioPerm depois deste arquivo; espera ele antes de desenhar os botões
  if (document.readyState === 'loading') await new Promise(r => addEventListener('DOMContentLoaded', r, { once: true }));
  try { await window.EstudioPerm?.pronto; } catch { }
  const q = new URLSearchParams(location.search), id = q.get('id') || q.get('roteiro'), aba = q.get('aba');
  if (aba === 'ideias') return trocaAba(aba, true); if (aba === 'personagens' || aba === 'cores') return trocaAba('personagens', true);
  if (id && /^[A-Za-z0-9_-]{2,40}$/.test(id)) { tela().innerHTML = giroBloco(); let msg = '';
    try { await abrePrep(await Nuvem.abre(id), undefined, true);
      if (q.get('acao') === 'tirar-nuvem') { history.replaceState(null, '', './?id=' + encodeURIComponent(id)); if (pode('roteiro')) tiraDaNuvem(id); } return; }
    catch (e) { const r = await DB.get('rasc', id).catch(() => null); if (r?.P) { history.replaceState(null, '', './?id=' + encodeURIComponent(id)); return abrePrep(r.P, r.base, true); } msg = e.status === 404 ? 'Esse roteiro não existe mais (foi apagado).' : e.message; }
    history.replaceState(null, '', './'); pintaInicio(); return aviso(msg, 'erro', 7000); }
  pintaInicio();
})();
