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
  alerta: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  pc: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>', coment: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
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
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error?.message || 'Não consegui abrir este roteiro da nuvem.'); }
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
let tGuarda = 0, tJunto = 0;
function marcaSujo() {
  S.sujo = true; pintaBarraPrep(); clearTimeout(tGuarda); tGuarda = setTimeout(() => DB.put('rasc', S.P.id, { P: S.P, base: S.base, em: Date.now() }).catch(() => { }), 600);
  clearTimeout(tJunto); if (S.P?.junto && S.P.mod && !S.P.novo) tJunto = setTimeout(() => { if (S.sujo && S.P?.junto) salvaPrep(null, true); }, 20000);
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
function trocaAba(a) { S.aba = a; S.P = null; $$('[data-aba]').forEach(b => b.classList.toggle('on', b.dataset.aba === a)); history.replaceState(null, '', a === 'roteiros' ? './' : './?aba=' + a); pinta(); }
async function sairDoPrep() { if (S.sujo && !await pergunta('Sair sem mandar para a nuvem?', 'O que você mudou continua guardado neste computador e aparece aqui da próxima vez.', [['Ficar', false], ['Sair', true, 'pri']])) return false; S.P = null; S.sujo = false; S.ed = null; AoVivo.sai(); AoVivo.atual = null; history.replaceState(null, '', './'); pinta(); return true; }
function pinta() { if (S.P) return pintaPrep(); modoDoc(false); AoVivo.sai(); AoVivo.paraTudo(); if (S.aba === 'ideias') return Ideias.pinta(); if (S.aba === 'personagens' || S.aba === 'cores') return pintaPersonagens(); return pintaInicio(); }
// bolinha com as iniciais do personagem, na cor dele; com foto, a foto (carrega sozinha quando a bolinha aparece)
const iniciais = n => { const p = Roteiro.norm(n).split(' ').filter(Boolean); return ((p[0]?.[0] || '?') + (p.length > 1 ? p[1][0] : (p[0]?.[1] || ''))).toUpperCase(); };
const ava = (nome, cor, tam = '') => { const f = persDe(nome)?.foto; return `<span class="ava ${tam}" style="--c:${cor}" title="${esc(nome)}"${f ? ` data-foto="${esc(f)}"` : ''}>${esc(iniciais(nome))}</span>`; };
new MutationObserver(() => { for (const el of document.querySelectorAll('.ava[data-foto]:not([data-foto-ok])')) { el.dataset.fotoOk = '1'; Nuvem.foto(el.dataset.foto).then(u => { el.style.backgroundImage = `url("${u}")`; el.classList.add('com-foto'); }).catch(() => { }); } })
  .observe(document.documentElement, { childList: true, subtree: true });
const icProg = d => ({ animador: 'an', shorts: 'sh', editor: 'ed' }[d]);
const progIc = (d, px = 18) => window.EstudioIcones && icProg(d) ? window.EstudioIcones.svg(icProg(d), px) : ic('doc', px);
const anel = (pct, tam = 44) => { const r = 16, L = 2 * Math.PI * r; return `<svg class="anel" width="${tam}" height="${tam}" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${r}" fill="none" stroke="currentColor" stroke-opacity=".14" stroke-width="4"/><circle cx="20" cy="20" r="${r}" fill="none" stroke="var(--ok)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(pct / 100 * L).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 20 20)"/><text x="20" y="24" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">${pct}%</text></svg>`; };

/* ---------- início: lista dos roteiros ---------- */
// ONDE: neste computador · na nuvem · em uso (um programa já usou) — e a SITUAÇÃO (rascunho, gravando, pronto); filtros com ícones
let filtro = 'todos', filtroOnde = 'tudo';
const ST_IC = { todos: 'grade', rascunho: 'lapis', gravando: 'mic', pronto: 'ok' };
async function pintaInicio(novo) {
  const ONDES = [['tudo', 'Tudo', 'grade'], ['pc', 'Neste computador', 'pc'], ['nuvem', 'Na nuvem', 'nuvem'], ['uso', 'Em uso', 'play']];
  const el = tela(); el.innerHTML = `<section class="inicio">
    <div class="cab topo-ini"><span class="cab-ic t-rot">${ic('doc', 24)}</span><div class="cab-txt"><h1>Roteiros</h1><p>Escreva, separe as falas de cada personagem e grave.</p></div><span class="esp"></span><button class="bt ic" data-at title="Buscar de novo">${ic('atualizar')}</button>${pode('roteiro') ? `<button class="bt pri grande" data-novo>${ic('mais', 18)} Novo roteiro</button>` : ''}</div>
    <div class="filtros-ini">
      <div class="seg" role="group" aria-label="Onde">${ONDES.map(([k, n, i]) => `<button data-onde="${k}" class="${filtroOnde === k ? 'on' : ''}">${ic(i, 15)} ${n}<b class="n" data-n="${k}"></b></button>`).join('')}</div>
      <div class="chips-st" role="group" aria-label="Situação">${[['todos', 'Todas as situações'], ...PREP_CONFIG.status].map(([k, n]) => `<button data-f="${k}" class="st-${k} ${filtro === k ? 'on' : ''}">${ic(ST_IC[k], 14)} ${esc(n)}</button>`).join('')}</div>
    </div>
    <div class="secoes">
      <div class="painel-sec sec-pc" data-sec="pc"><div class="ps-cab"><span class="sec-ic">${ic('pc', 18)}</span><div><b>Neste computador</b><small>Só você vê. Vai para a nuvem quando for gravar, quando ficar pronto ou quando você mandar.</small></div></div><div class="grade" data-g="pc">${giroBloco()}</div></div>
      <div class="painel-sec sec-nuvem" data-sec="nuvem"><div class="ps-cab"><span class="sec-ic">${ic('nuvem', 18)}</span><div><b>Na nuvem</b><small>A equipe toda vê e grava.</small></div></div><div class="grade" data-g="nuvem">${giroBloco()}</div></div>
      <div class="painel-sec sec-uso" data-sec="uso"><div class="ps-cab"><span class="sec-ic">${ic('play', 18)}</span><div><b>Em uso</b><small>Já foram usados num programa (Animador, Shorts ou Editor).</small></div></div><div class="grade" data-g="uso">${giroBloco()}</div></div>
    </div></section>`;
  $('[data-at]', el).onclick = () => { S.lista = null; pintaInicio(true); };
  $('[data-novo]', el)?.addEventListener('click', () => abrePrep(novoPrep()));
  $$('[data-f]', el).forEach(b => b.onclick = () => { filtro = b.dataset.f; pintaInicio(); });
  $$('[data-onde]', el).forEach(b => b.onclick = () => { filtroOnde = b.dataset.onde; pintaInicio(); });
  await carregaPers().catch(() => { });
  const passa = it => filtro === 'todos' || (it.status || 'rascunho') === filtro, G = { pc: [], nuvem: [], uso: [] };
  try { for (const r of (await DB.todos('rasc')).map(([, v]) => v).filter(v => v?.P?.id).sort((a, b) => b.em - a.em)) G.pc.push({ it: r.P, onde: r.P.novo || !r.base?.mod ? 'pc' : 'mudou', abre: () => abrePrep(r.P, r.base) }); } catch { }
  try { if (!S.lista || novo) S.lista = (await Nuvem.lista()).itens || []; } catch (e) { $('[data-g="nuvem"]', el).innerHTML = `<div class="vazio erro">${esc(e.message)}</div>`; }
  for (const it of (S.lista || []).sort((a, b) => (b.mod || 0) - (a.mod || 0))) (it.uso?.length ? G.uso : G.nuvem).push({ it, onde: it.uso?.length ? 'uso' : 'nuvem', abre: () => Nuvem.abre(it.id).then(abrePrep) });
  for (const k of ['pc', 'nuvem', 'uso']) {
    const L = G[k].filter(x => passa(x.it)), sec = $(`[data-sec="${k}"]`, el), g = $(`[data-g="${k}"]`, el); $(`[data-n="${k}"]`, el).textContent = G[k].length || '';
    sec.hidden = filtroOnde !== 'tudo' && filtroOnde !== k; if (sec.hidden) continue;
    if (g.querySelector('.erro')) continue;
    g.innerHTML = L.length ? '' : `<div class="vazio">${G[k].length ? 'Nada nesta situação.' : { pc: 'Nada só neste computador.', nuvem: 'Nenhum roteiro na nuvem.', uso: 'Nenhum roteiro foi usado num programa ainda.' }[k]}</div>`;
    for (const x of L) { const c = cartao(x.it, x.onde); c.onclick = async () => { c.classList.add('carregando'); c.insertAdjacentHTML('beforeend', `<span class="cartao-giro">${giro()}</span>`); try { await x.abre(); } catch (e) { aviso(e.message, 'erro'); c.classList.remove('carregando'); $('.cartao-giro', c)?.remove(); } }; g.appendChild(c); }
  }
  $('[data-n="tudo"]', el).textContent = G.pc.length + G.nuvem.length + G.uso.length || '';
  // AO VIVO: quem está com cada roteiro aberto agora (some sozinho quando a pessoa fecha)
  AoVivo.ouveTudo(m => { if (!el.isConnected || S.P) return AoVivo.paraTudo(); $$('[data-vivo]', el).forEach(d => { const g = Object.values(m[d.dataset.vivo] || {});
    d.innerHTML = g.length ? `<span class="vivo-tag" title="Ao vivo agora: ${esc(g.map(x => x.n).join(', '))}"><i></i> ao vivo</span>${g.slice(0, 4).map(x => pava(x, 'p vivo')).join('')}` : ''; d.parentElement.classList.toggle('tem-vivo', !!g.length); }); });
}
// onde: 'pc' (só neste computador) | 'mudou' (na nuvem, com mudanças só aqui) | 'nuvem' | 'uso' (um programa já usou)
function cartao(it, onde) {
  const fs = Array.isArray(it.partes) ? it.partes.flatMap(p => p.falas || []) : null;
  const n = fs ? fs.length : it.n || 0, g = fs ? fs.filter(f => f.audio).length : it.g || 0, np = Array.isArray(it.partes) ? it.partes.length : it.partes || 0;
  const pers = fs ? Roteiro.personagens(it.partes).map(p => p.nome) : it.pers || [], pct = n ? Math.round(g / n * 100) : 0, st = it.status || 'rascunho';
  const uso = onde === 'uso' ? (it.uso || []) : [];
  const ONDE = { pc: `${ic('pc', 13)} Neste computador`, mudou: `${ic('nuvem', 13)} Na nuvem · mudanças só aqui`, nuvem: `${ic('nuvem', 13)} Na nuvem`, uso: `${ic('play', 13)} Em uso` };
  const autor = it.autor || (it.quem?.a ? { id: it.quem.a.i, nome: it.quem.a.n } : null), eds = it.edicoes || (it.quem?.e || []).map(x => ({ id: x.i, nome: x.n }));
  return h(`<button class="cartao ${esc(st)}" data-id="${esc(it.id || '')}"><div class="vivo-c" data-vivo="${esc(it.id || '')}"></div><div class="topo"><span class="st st-${esc(st)}">${ic(ST_IC[st] || 'lapis', 12)} ${esc(STATUS[st] || 'Rascunho')}</span><span class="onde o-${onde}">${ONDE[onde]}</span></div>
    <div class="meio"><div><b>${esc(it.nome || 'Sem nome')}</b><small>${np} parte${np === 1 ? '' : 's'} · ${n} fala${n === 1 ? '' : 's'}</small></div></div>
    <div class="grav ${n && g === n ? 'todas' : ''}" title="${g} de ${n} falas já têm áudio gravado">${ic(n && g === n ? 'ok' : 'mic', 14)}<span>${!n ? 'ainda sem falas' : g === n ? 'todas as falas gravadas' : `<b>${g}</b> de <b>${n}</b> falas gravadas`}</span><div class="barra"><i style="width:${pct}%"></i></div></div>
    <div class="elenco">${pers.slice(0, 6).map(p => ava(p, corOuPadrao(p), 'p')).join('')}${pers.length > 6 ? `<span class="mais">+${pers.length - 6}</span>` : ''}</div>
    ${quemHtml(autor, eds, true) ? `<div class="quem-c">${quemHtml(autor, eds, true)}</div>` : ''}
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
async function abrePrep(P, base) {
  // tem rascunho deste computador mais novo que o da nuvem?
  if (!base && !P.novo) { try { const r = await DB.get('rasc', P.id); if (r?.P && (+r.base?.mod || 0) === (+P.mod || 0) && r.em > (P.mod || 0)) { const usar = await pergunta('Continuar de onde parou?', 'Este computador tem mudanças neste roteiro que ainda não foram para a nuvem.', [['Abrir o da nuvem', false], ['Continuar daqui', true, 'pri']]); if (usar) { base = r.base; P = r.P; } else await DB.del('rasc', P.id); } } catch { } }
  S.P = P; S.base = base || { mod: P.mod || 0, roteiro: P.roteiro || '' }; S.sujo = !!base || !!P.novo; S.sub = pode('roteiro') || pode('organizar') ? (S.sub || 'roteiro') : 'falas'; S.ed = null;
  if (!S.pers) carregaPers().then(() => { if (S.P) { S.ed?.repinta(); pintaLado(); if (S.sub !== 'roteiro') pintaCorpo(); } }).catch(() => { S.pers = {}; });
  if (!S.nomeEu) window.EstudioLogin?.perfil?.().then(p => { S.nomeEu = String(p?.nome || '').split(' ')[0]; }).catch(() => { });
  history.replaceState(null, '', './?id=' + encodeURIComponent(P.id)); pintaPrep();
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
function irGuia(k) { S.sub = k; $$('.guias [data-sub]').forEach(x => x.classList.toggle('on', x.dataset.sub === k)); pintaCorpo(); }
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
      <div class="etapas" role="group" aria-label="Situação">${PREP_CONFIG.status.map(([v, n], i) => `<button data-status="${v}" class="${i < at ? 'feito' : i === at ? 'on' : ''}" ${pp ? '' : 'disabled'} title="${esc(ETAPA_TIT[v])}"><i>${i < at ? ic('ok', 12) : i + 1}</i><span>${esc(n)}</span></button>`).join('')}</div>
      <span class="enviar"></span>
      <span class="dh-conta"></span>
    </header>
    <div class="dh-barra"></div></div>
    <div class="dh-area">
      <aside class="guias"><div class="g-tit">Guias do roteiro</div>
        ${guiasDe(P).map(([k, n, i]) => `<button data-sub="${k}" class="${S.sub === k ? 'on' : ''}">${ic(i, 16)} ${n}</button>`).join('')}
        <p class="etapa-dica etapa-${esc(P.status || 'rascunho')}">${ETAPA_DICA(P)}</p>
        <div class="g-roteiro"></div></aside>
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
  $('[data-volta]', el).onclick = sairDoPrep;
  const nm = $('.nome', el); nm.oninput = () => { P.nome = nm.value.slice(0, 80); nm.size = Math.max(8, Math.min(40, nm.value.length + 1)); marcaSujo(); };
  nm.onkeydown = e => { if (e.key === 'Enter') { nm.blur(); S.ed?.foca(); } };
  const mudaMarca = async (campo, v) => {
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
  $$('.guias [data-sub]', el).forEach(b => b.onclick = () => irGuia(b.dataset.sub));
  const E = () => S.sub === 'roteiro' ? S.ed : null, edita = pode('roteiro');
  const naFolha = fn => () => { if (S.sub !== 'roteiro') irGuia('roteiro'); setTimeout(() => S.ed && fn(S.ed), 0); };
  menus($('.dh-menus', el), [
    ['Arquivo', () => [
      [`${ic('mais', 15)} Novo roteiro`, '', async () => { if (await sairDoPrep()) abrePrep(novoPrep()); }, !edita],
      [`${ic('doc', 15)} Abrir roteiros`, '', () => sairDoPrep()],
      '-', [`${ic('nuvem', 15)} Mandar para a nuvem`, 'Ctrl+S', () => salvaPrep($('.prep [data-salva]')), !S.sujo],
      [`${ic('junto', 15)} Trabalhar junto (manda sozinho para a nuvem)`, P.junto ? '✓' : '', () => { P.junto = !P.junto; marcaSujo(); aviso(P.junto ? 'Trabalhando junto: as mudanças vão sozinhas para a nuvem 20 s depois que você para de mexer.' : 'As mudanças ficam neste computador até você mandar.', 'info', 6000); }, !pode('roteiro')],
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
    ['Ajuda', () => [[`${ic('ajuda', 15)} Como escrever o roteiro`, '', mostraComo]]],
  ]);
  pintaBarraPrep(); pintaCorpo();
}
function pintaBarraPrep() {
  const P = S.P, sv = $('.prep .salvar'), en = $('.prep .enviar'); if (!P || !sv) return;
  sv.innerHTML = P.novo || !P.mod ? `<span class="onde o-pc" title="Ainda não foi para a nuvem: só você vê">${ic('pc', 15)} Só neste computador</span>`
    : S.sujo ? `<span class="onde o-mudou" title="Está na nuvem, mas as últimas mudanças estão só aqui">${ic('nuvem', 15)} Na nuvem · ${ic('pc', 14)} mudanças só aqui</span>`
    : `<span class="onde o-nuvem" title="Salvo na nuvem · ${esc(quando(P.mod))}">${ic('nuvem', 15)} Salvo na nuvem</span>`;
  if (P.junto) sv.insertAdjacentHTML('beforeend', `<span class="onde o-junto" title="As mudanças vão sozinhas para a nuvem">${ic('junto', 14)} trabalhando junto</span>`);
  en.innerHTML = S.sujo ? `<button class="bt pri pilula" data-salva title="A equipe passa a ver (e gravar) este roteiro">${ic('nuvem')} Mandar para a nuvem</button>` : `<span class="pilula ok">${ic('nuvem')} Na nuvem</span>`;
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
    P.mod = r.mod; delete P.novo; S.base = { mod: P.mod, roteiro: enviado }; S.sujo = P.roteiro !== enviado; S.lista = null;
    if (!S.sujo) await DB.del('rasc', P.id).catch(() => { }); else DB.put('rasc', P.id, { P, base: S.base, em: Date.now() }).catch(() => { });
    carregaPers(true).then(() => pintaLado()).catch(() => { }); // personagens novos entraram na lista da equipe
    if (!quieto) aviso('Mandado para a nuvem. A equipe já vê.', 'ok'); if (S.sub === 'falas') pintaCorpo();
  } catch (e) { aviso(e.message, 'erro'); }
  finally { pintaBarraPrep(); }
}
function pintaCorpo() {
  const c = $('.prep .corpo'); if (!c) return; if (S.sub !== 'roteiro') S.ed = null;
  const barra = $('.prep .dh-barra'), gr = $('.prep .g-roteiro'); if (gr) gr.innerHTML = '';
  c.className = 'corpo corpo-' + S.sub;
  if (S.sub !== 'roteiro' && barra) barra.innerHTML = `<div class="db-pilula"><span class="db-tit">${ic({ falas: 'mic', legendas: 'legenda', elenco: 'pessoa' }[S.sub] || 'doc', 16)} ${{ falas: 'Falas e gravação', legendas: 'Legendas', elenco: 'Elenco no Animador' }[S.sub] || ''}</span><span class="esp"></span><button class="bt" data-volta-rot>${ic('doc', 15)} Voltar ao roteiro</button></div>`;
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
  const E = S.ed = Editor.cria($('.folha', c), { texto: P.roteiro || '', somenteLer: !ed,
    cor: n => cores().get(Roteiro.chave(n)) || corOuPadrao(n),
    aoMudar: tx => { P.roteiro = tx; marcaSujo(); clearTimeout(t); t = setTimeout(() => { const antes = [...cores().keys()].join(); P.partes = Roteiro.separa(P.roteiro, P.partes); lado(); if ([...cores().keys()].join() !== antes) E.repinta(); }, 200); },
    aoMover: () => { const s = $('[data-estilo]', barra), l = E.linhas(), tp = E.tipoAtual(); if (s && tp) s.value = tp === 'h' ? (E.nivelAtual() === 1 ? 'capitulo' : 'parte') : ESTILO_DE[tp] || 'normal'; },
    aoPintar: repagina,
    confirma: (msg, antes, depois) => perguntaMuda(msg, antes, depois),
    pedeTexto: (tit, rot) => pedeTexto(tit, rot, 200),
    autor: () => S.nomeEu || '' });
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
const Falas = {
  quem: null, rec: null,
  async pinta(c) {
    const P = S.P, ps = Roteiro.personagens(P.partes), cs = coresDoRoteiro(); this.c = c;
    try { this.quem = this.quem ?? localStorage.getItem('ep-prep-quem') ?? ''; } catch { this.quem = this.quem || ''; }
    if (this.quem && !ps.some(p => p.chave === this.quem)) this.quem = '';
    const locais = await this.locais(); let num = 0;
    const visiveis = P.partes.map(p => ({ ...p, falas: p.falas.map(f => ({ f, n: ++num })).filter(({ f }) => !this.quem || Roteiro.chave(f.personagem) === this.quem) })).filter(p => p.falas.length);
    const total = P.partes.reduce((s, p) => s + p.falas.length, 0), feitas = P.partes.reduce((s, p) => s + p.falas.filter(f => f.audio).length, 0);
    c.innerHTML = `<div class="falas">
      <h3>Quem vai gravar?</h3>
      <div class="elenco-g">
        <button class="pcard ${!this.quem ? 'on' : ''}" data-grava=""><span class="ava g todos">${ic('pessoa', 20)}</span><b>Todos</b><small>${feitas} de ${total} gravadas</small><div class="barra"><i style="width:${total ? feitas / total * 100 : 0}%"></i></div></button>
        ${ps.map(p => `<button class="pcard ${this.quem === p.chave ? 'on' : ''}" data-grava="${esc(p.chave)}" style="--c:${cs.get(p.chave)}">${ava(p.nome, cs.get(p.chave), 'g')}<b>${esc(p.nome)}</b><small>${p.g} de ${p.n} gravada${p.n === 1 ? '' : 's'}</small><div class="barra"><i style="width:${p.n ? p.g / p.n * 100 : 0}%"></i></div></button>`).join('')}
      </div>
      <div class="env"></div>
      ${P.novo || S.sujo && !P.mod ? `<p class="aviso-linha">${ic('alerta', 15)} Mande o roteiro para a nuvem antes de enviar as gravações (elas ficam guardadas aqui enquanto isso).</p>` : ''}
      ${!ps.length ? '<div class="vazio">Ainda não há falas. Escreva o roteiro como <b>Nome: fala</b>.</div>' : ''}
      ${visiveis.map(p => `<div class="parte"><h3>${esc(p.nome)}</h3>${p.falas.map(({ f, n }) => this.linha(f, n, locais.get(f.id), cs)).join('')}</div>`).join('')}</div>`;
    $$('[data-grava]', c).forEach(b => b.onclick = () => { this.quem = b.dataset.grava; try { localStorage.setItem('ep-prep-quem', this.quem); } catch { } this.pinta(c); });
    $$('.fala', c).forEach(el => { const f = this.acha(el.dataset.f); if (!f) return;
      $('[data-gravar]', el)?.addEventListener('click', () => this.grava(f, el));
      $('[data-ouvir]', el)?.addEventListener('click', e => this.ouve(f, e.currentTarget));
      $('[data-tirar]', el)?.addEventListener('click', async () => { await DB.del('aud', P.id + '/' + f.id); this.pinta(c); }); });
    this.pintaEnvio(locais);
  },
  acha(id) { for (const p of S.P.partes) for (const f of p.falas) if (f.id === id) return f; return null; },
  async locais() { const m = new Map(); try { for (const [k, v] of await DB.todos('aud')) if (String(k).startsWith(S.P.id + '/')) m.set(String(k).slice(S.P.id.length + 1), v); } catch { } return m; },
  linha(f, n, local, cs) {
    const cor = cs.get(Roteiro.chave(f.personagem)), gravar = pode('gravar');
    const st = local ? `<span class="st aqui">${ic('alerta', 12)} gravada aqui · falta enviar · ${tempo(local.duracao)}</span>` : f.audio ? `<span class="st nuvem">${f.regravar ? `<span class="aten">${ic('alerta', 12)} o texto mudou, regravar</span>` : `${ic('ok', 12)} na nuvem`} · ${tempo(f.duracao)}</span>` : '<span class="st sem">sem áudio</span>';
    return `<div class="fala ${local ? 'local' : f.audio ? 'tem' : ''}" data-f="${esc(f.id)}" style="--c:${cor}"><span class="num">${n}</span>
      <div class="quem">${ava(f.personagem, cor, 'p')}<b>${esc(f.personagem)}</b></div>
      <div class="txt">${f.nota ? `<em>${esc(f.nota)}</em>` : ''}<p>${esc(f.texto)}</p>${st}<div class="nivel" hidden><i></i></div></div>
      <div class="bts">${local || f.audio ? `<button class="redondo ouvir" data-ouvir title="Ouvir">${ic('play', 16)}</button>` : ''}
      ${gravar ? `<button class="redondo gravar ${local || f.audio ? 'de-novo' : ''}" data-gravar title="${local || f.audio ? 'Regravar' : 'Gravar'}">${ic('mic', 18)}</button>` : ''}
      ${local ? `<button class="redondo" data-tirar title="Jogar fora esta gravação">${ic('lixo', 15)}</button>` : ''}</div></div>`;
  },
  async grava(f, el) {
    if (this.rec) { const parar = this.rec.f === f; this.rec.parar(); if (parar) return; }
    let st; try { st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
    catch { return aviso('Não consegui usar o microfone. Libere o microfone para este site no navegador.', 'erro'); }
    const tipo = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => window.MediaRecorder?.isTypeSupported?.(t)) || '';
    const mr = new MediaRecorder(st, { ...(tipo ? { mimeType: tipo } : {}), audioBitsPerSecond: PREP_CONFIG.audioBits }), pedacos = [], t0 = performance.now();
    const bt = $('[data-gravar]', el); bt.classList.add('gravando'); bt.innerHTML = ic('parar', 16); bt.title = 'Parar';
    el.classList.add('gravando'); const st0 = $('.st', el); if (st0) st0.innerHTML = '<span class="rec">● gravando <b class="cron">0:00</b></span>';
    // medidor do volume do microfone
    let ac, an, raf; const nv = $('.nivel', el), barra = $('i', nv); nv.hidden = false;
    try { ac = new AudioContext(); an = ac.createAnalyser(); an.fftSize = 512; ac.createMediaStreamSource(st).connect(an); const d = new Uint8Array(an.fftSize);
      const mede = () => { an.getByteTimeDomainData(d); let s = 0; for (const v of d) s += (v - 128) ** 2; barra.style.width = Math.min(100, Math.sqrt(s / d.length) * 3.2) + '%'; raf = requestAnimationFrame(mede); }; mede(); } catch { }
    const cron = setInterval(() => { const s = (performance.now() - t0) / 1000; const cr = $('.cron', el); if (cr) cr.textContent = tempo(s); if (s > PREP_CONFIG.audioMaxSeg) this.rec?.parar(); }, 200);
    mr.ondataavailable = e => e.data.size && pedacos.push(e.data);
    mr.onstop = async () => { clearInterval(cron); cancelAnimationFrame(raf); try { ac?.close(); } catch { } st.getTracks().forEach(t => t.stop()); this.rec = null; const dur = (performance.now() - t0) / 1000;
      if (dur < 0.4) { aviso('Gravação curta demais.', 'info'); return this.pinta(this.c); }
      const blob = new Blob(pedacos, { type: mr.mimeType || tipo || 'audio/webm' });
      await DB.put('aud', S.P.id + '/' + f.id, { blob, duracao: Math.round(dur * 100) / 100, em: Date.now() }); this.pinta(this.c); };
    mr.start(250); this.rec = { f, parar: () => { try { mr.stop(); } catch { } } };
  },
  async ouve(f, bt) {
    if (S.tocando) { S.tocando.pause(); const era = S.tocando._f === f.id; S.tocando = null; $$('.tocando').forEach(x => x.classList.remove('tocando')); if (era) return; }
    try { const l = await DB.get('aud', S.P.id + '/' + f.id); const blob = l?.blob || await Nuvem.audio(f.audio);
      const a = new Audio(URL.createObjectURL(blob)); a._f = f.id; S.tocando = a; bt.classList.add('tocando'); bt.innerHTML = ic('parar', 16); a.onended = () => { bt.classList.remove('tocando'); bt.innerHTML = ic('play', 16); S.tocando = null; URL.revokeObjectURL(a.src); }; await a.play(); }
    catch (e) { aviso('Não consegui tocar: ' + (e.message || e), 'erro'); }
  },
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
        const ext = /mp4/.test(l.blob.type) ? 'm4a' : /ogg/.test(l.blob.type) ? 'ogg' : 'webm', k = `preparativos/${P.id}/aud/${id}-${Date.now().toString(36)}.${ext}`;
        await Nuvem.pede('/preparativos/arquivo?k=' + encodeURIComponent(k), { method: 'POST', headers: { 'content-type': l.blob.type || 'audio/webm' }, body: l.blob });
        feitas.push({ id, audio: k, duracao: l.duracao }); }
    } catch (e) { aviso(e.message, 'erro'); }
    if (feitas.length) { try { const r = await Nuvem.acao({ acao: 'falas', id: P.id, falas: feitas }); // uma gravação do prep.json para todas
        for (const x of feitas) { const f = this.acha(x.id); if (f) { f.audio = x.audio; f.duracao = x.duracao; delete f.regravar; } await DB.del('aud', P.id + '/' + x.id).catch(() => { }); }
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
async function thumbDe(x) {
  try { const g = await TH.get(x.id); if (g && g.mod === x.mod) return g.thumb || null; } catch { }
  if (thPedidos.has(x.id)) return thPedidos.get(x.id);
  const pr = (async () => { if (thAtivos >= 4) await new Promise(r => thEspera.push(r)); thAtivos++; // no máximo 4 de uma vez
    try { const d = await Nuvem.pede('/personagens/arquivo?k=' + encodeURIComponent(`personagens/${x.id}/personagem.json`)); const th = typeof d?.thumb === 'string' && d.thumb.startsWith('data:image/') ? d.thumb : null;
      TH.put(x.id, { mod: x.mod, thumb: th }).catch(() => { }); return th; }
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

/* ---------- aba Legendas (do roteiro aberto) ---------- */
const PALETA = ['#19f0f0', '#ffb04a', '#ff6b93', '#a796ff', '#4fe08f', '#ffd36b', '#7fd1ff', '#ff8f6b', '#ffffff', '#c9ff6b'];
function pintaLegendas(c) {
  const P = S.P, ps = Roteiro.personagens(P.partes), ed = pode('organizar'); P.legenda = P.legenda || { ativa: true, mostrarNome: false, cores: {} };
  const cs = coresDoRoteiro(), escolha = Object.fromEntries(ps.map(p => [p.chave, cs.get(p.chave)]));
  const exemplo = k => P.partes.flatMap(x => x.falas).find(f => Roteiro.chave(f.personagem) === k)?.texto || 'Exemplo de legenda';
  let foco = ps[0]?.chave;
  c.innerHTML = `<div class="leg2">
    <div class="esq">
      <label class="chave"><input type="checkbox" data-liga ${P.legenda.ativa ? 'checked' : ''} ${ed ? '' : 'disabled'}><span class="trilho"><i></i></span> Legendas ligadas neste roteiro</label>
      <label class="chave"><input type="checkbox" data-nome ${P.legenda.mostrarNome ? 'checked' : ''} ${ed ? '' : 'disabled'}><span class="trilho"><i></i></span> Mostrar o nome de quem fala na legenda</label>
      <p class="dica">Normalmente a legenda mostra só o que é falado, na cor de quem fala (o nome não aparece). A cor vale pelo nome do personagem, sem diferenciar maiúscula e minúscula; mudar aqui muda para a equipe toda (aba Personagens).</p>
      <div class="lista">${ps.map(p => `<div class="lin" data-k="${esc(p.chave)}">${ava(p.nome, escolha[p.chave], 'p')}<b>${esc(p.nome)}</b>
        <div class="paleta">${PALETA.map(x => `<button class="cor ${x === escolha[p.chave] ? 'on' : ''}" style="--c:${x}" data-cor="${x}" ${ed ? '' : 'disabled'} title="${x}"></button>`).join('')}<input type="color" value="${escolha[p.chave]}" ${ed ? '' : 'disabled'} title="Outra cor"></div></div>`).join('') || '<div class="vazio">Sem personagens ainda. Escreva falas no roteiro (Nome: fala).</div>'}</div>
      ${ed && ps.length ? `<button class="bt pri" data-salva>${ic('ok', 15)} Salvar as cores</button>` : ''}
    </div>
    <div class="dir"><div class="tela-video"><div class="ceu"></div><div class="chao"></div><div class="leg-previa"></div></div><small class="dica">Prévia da legenda. Clique num personagem para ver a cor dele.</small></div></div>`;
  const liga = $('[data-liga]', c), nome = $('[data-nome]', c), previa = () => { const pv = $('.leg-previa', c); pv.hidden = !liga.checked; if (!foco) return; const p = ps.find(x => x.chave === foco);
    pv.style.color = escolha[foco]; pv.textContent = (nome.checked ? `${p?.nome || ''}: ` : '') + exemplo(foco); };
  $$('.lin', c).forEach(l => { const k = l.dataset.k, troca = v => { escolha[k] = v; $$('.cor', l).forEach(b => b.classList.toggle('on', b.dataset.cor === v)); $('.ava', l).style.setProperty('--c', v); $('input[type=color]', l).value = v; foco = k; previa(); };
    l.onclick = e => { if (!e.target.closest('button,input')) { foco = k; previa(); } };
    $$('.cor', l).forEach(b => b.onclick = () => troca(b.dataset.cor)); $('input[type=color]', l).oninput = e => troca(e.target.value); });
  const salva = async () => { P.legenda = { ativa: liga.checked, mostrarNome: nome.checked, cores: { ...escolha } };
    for (const [k, v] of Object.entries(escolha)) if (S.pers) S.pers[k] = { ...(S.pers[k] || { nome: k }), cor: v };
    if (P.novo || S.sujo) { marcaSujo(); return aviso('Guardado aqui. Vai para a nuvem junto com o roteiro.', 'info'); }
    try { const r = await Nuvem.acao({ acao: 'legenda', id: P.id, ...P.legenda }); P.mod = r.mod || P.mod; S.base.mod = P.mod; S.cores = r.cores || S.cores; aviso('Legendas salvas.', 'ok'); pintaBarraPrep(); } catch (e) { aviso(e.message, 'erro'); } };
  liga.onchange = () => { previa(); salva(); }; nome.onchange = () => { previa(); salva(); }; $('[data-salva]', c)?.addEventListener('click', salva);
  previa();
}

/* ---------- aba PERSONAGENS (a lista da equipe: preparativos/personagens.json) ---------- */
// foto: recorta no meio, diminui para 256 px e vira WEBP (leve na nuvem)
async function paraWebp(arq, lado = 256) {
  const bmp = await createImageBitmap(arq), q = Math.min(bmp.width, bmp.height), cv = document.createElement('canvas'); cv.width = cv.height = Math.min(lado, q);
  cv.getContext('2d').drawImage(bmp, (bmp.width - q) / 2, (bmp.height - q) / 2, q, q, 0, 0, cv.width, cv.height);
  const b = await new Promise(ok => cv.toBlob(ok, 'image/webp', .82)); if (!b || b.type !== 'image/webp') throw new Error('Este navegador não consegue gerar WEBP. Use o Chrome ou o Edge.'); return b;
}
const slug = s => Roteiro.chave(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'p';

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
    <p class="dica">Arraste um personagem para a pasta que quiser. Clique no nome da pasta para fechar ou abrir; botão direito na pasta ou no personagem para mais opções (renomear, apagar a pasta, foto…).</p>
    <div class="pers-grade">${giroBloco()}</div>
    <input type="file" accept="image/*" data-arq hidden></section>`;
  try { await carregaPers(true); if (!S.lista) S.lista = (await Nuvem.lista().catch(() => ({ itens: [] }))).itens || []; } catch (e) { $('.pers-grade', el).innerHTML = `<div class="vazio erro">${esc(e.message)}</div>`; return; }
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
  const pintaL = () => {
    const E = Object.entries(todos).sort(([, a], [, b]) => String(a.nome).localeCompare(String(b.nome), 'pt-BR')), pastas = [...new Set([...GRUPOS_BASE, ...E.map(([, v]) => v.grupo).filter(Boolean), ...novas])];
    const grupos = [...pastas, ''].map(g => [g, E.filter(([, v]) => (v.grupo || '') === g)]);
    $('.pers-grade', el).innerHTML = grupos.map(([g, l]) => `<div class="pasta-g ${fechadas[g || '-'] ? 'fechada' : ''}" data-pasta="${esc(g)}">
      <button class="pasta-g-tit" data-abre="${esc(g || '-')}">${ic('baixo', 14)} ${ic('pasta', 16)} <b>${g ? esc(g) : 'Sem pasta'}</b> <small>${l.length}</small></button>
      <div class="pcards">${l.map(([k, v]) => { const cor = v.cor || corPadrao(v.nome);
      return `<div class="pcard2" data-k="${esc(k)}" style="--c:${cor}" ${ed ? 'draggable="true"' : ''}><span class="pega" title="Arraste para outra pasta">${ic('mover', 14)}</span><button class="foto" ${ed ? '' : 'disabled'} title="${v.foto ? 'Trocar a foto' : 'Pôr uma foto'}">${ava(v.nome, cor, 'g')}<span class="cam">${ic('camera', 14)}</span></button>
        <div class="pc-meio"><b>${esc(v.nome)}</b>
          <div class="paleta">${PALETA.map(x => `<button class="cor ${x === cor ? 'on' : ''}" style="--c:${x}" data-cor="${x}" ${ed ? '' : 'disabled'}></button>`).join('')}<input type="color" value="${cor}" ${ed ? '' : 'disabled'} title="Outra cor"></div>
          <span class="leg-mini" style="color:${cor}">Exemplo de legenda</span>
          <div class="pc-an"><small>No Animador:</small><button class="el-esc" data-pad ${ed ? '' : 'disabled'} title="Personagem do Ateliê que faz ${esc(v.nome)} em todos os roteiros"><span class="ap-th p" ${v.atelie?.id ? `data-th="${esc(v.atelie.id)}"` : ''}>${v.atelie?.id ? esc(iniciais(v.atelie.nome || v.atelie.id)) : icAt(18)}</span>${v.atelie === null ? 'Nenhum' : v.atelie?.id ? esc(v.atelie.nome || v.atelie.id) : 'Automático (mesmo nome)'}</button></div>
          ${v.foto && ed ? `<button class="link" data-tira>Tirar a foto</button>` : ''}</div></div>`; }).join('') || `<div class="pasta-vazia">${ed ? 'Arraste personagens para cá.' : 'Ninguém nesta pasta.'}</div>`}</div></div>`).join('<hr class="sep-pasta">');
    // BOTÃO DIREITO — na pasta: abrir/fechar, pasta nova, renomear, apagar (os personagens vão para "Sem pasta"; Principais e Secundários são fixas)
    const mandaVarios = async (itens, msg) => { try { const r = await Nuvem.acao({ acao: 'personagens', itens }); S.pers = r.personagens || S.pers; Object.assign(todos, S.pers); if (msg) aviso(msg, 'ok'); pintaL(); } catch (er) { aviso(er.message, 'erro'); } };
    const membros = g => Object.entries(todos).filter(([, v]) => (v.grupo || '') === g).map(([k]) => k);
    $$('.pasta-g', el).forEach(pg => { $('.pasta-g-tit', pg).oncontextmenu = e => { e.preventDefault(); const g = pg.dataset.pasta, base = !g || GRUPOS_BASE.includes(g), ms = membros(g);
      popMenu(e, [[`${ic('baixo', 14)} ${fechadas[g || '-'] ? 'Abrir a pasta' : 'Fechar a pasta'}`, '', () => $('[data-abre]', pg).click()],
        [`${ic('mais', 14)} Personagem novo nesta pasta…`, '', () => novoPers(g || null), !ed], [`${ic('pasta', 14)} Pasta nova…`, '', () => $('[data-pnova]', el)?.click(), !ed], '-',
        [`${ic('lapis', 14)} Renomear…`, base ? 'fixa' : '', async () => { const nn = ((await pedeTexto('Renomear a pasta', `Novo nome para "${g}"`, 30)) || '').replace(/[^\p{L}\p{N} ._-]/gu, '').trim(); if (!nn || nn === g) return;
          novas.delete(g); novas.add(nn); if (!ms.length) return pintaL(); mandaVarios(Object.fromEntries(ms.map(k => [k, { nome: todos[k].nome, grupo: nn }])), `Pasta renomeada para ${nn}.`); }, base || !ed],
        [`${ic('lixo', 14)} Apagar a pasta`, base ? 'fixa' : '', async () => { if (!await pergunta(`Apagar a pasta "${g}"?`, ms.length ? `${ms.length === 1 ? 'O personagem dela vai' : `Os ${ms.length} personagens dela vão`} para "Sem pasta". Nenhum personagem é apagado.` : 'A pasta está vazia.', [['Cancelar', false], ['Apagar a pasta', true, 'perigo']])) return;
          novas.delete(g); if (!ms.length) return pintaL(); mandaVarios(Object.fromEntries(ms.map(k => [k, { nome: todos[k].nome, grupo: null }])), `Pasta "${g}" apagada.`); }, base || !ed]]); }; });
    // BOTÃO DIREITO — no personagem: foto, padrão no Animador, mover de pasta
    $$('.pcard2', el).forEach(cd => { cd.oncontextmenu = e => { if (e.target.closest('input,select')) return; e.preventDefault(); const k = cd.dataset.k, v = todos[k], ps2 = [...new Set([...GRUPOS_BASE, ...Object.values(todos).map(x => x.grupo).filter(Boolean), ...novas])];
      popMenu(e, [[`${ic('camera', 14)} ${v.foto ? 'Trocar a foto…' : 'Pôr uma foto…'}`, '', () => $('.foto', cd).click(), !ed],
        ...(v.foto ? [[`${ic('lixo', 14)} Tirar a foto`, '', () => $('[data-tira]', cd)?.click(), !ed]] : []),
        [`${icAt(14)} Padrão no Animador…`, '', () => $('[data-pad]', cd).click(), !ed], '-',
        ...ps2.map(g => [`${ic('pasta', 14)} Mover para ${esc(g)}`, (v.grupo || '') === g ? '✓' : '', () => manda(k, { grupo: g }, `${v.nome} foi para ${g}.`), !ed || (v.grupo || '') === g]),
        [`${ic('pasta', 14)} Tirar da pasta`, !v.grupo ? '✓' : '', () => manda(k, { grupo: null }, `${v.nome} saiu da pasta.`), !ed || !v.grupo],
        [`${ic('mais', 14)} Pasta nova com ${esc(v.nome)}…`, '', async () => { const g = await pastaNova(); if (g) { novas.add(g); manda(k, { grupo: g }, `${v.nome} foi para ${g}.`); } }, !ed], '-',
        [`${ic('lapis', 14)} Renomear…`, '', () => renomeiaPersonagem(k, todos, () => pintaPersonagens()), !ed],
        [`${ic('lixo', 14)} Tirar da lista…`, '', () => apagaPersonagem(k, todos, () => pintaPersonagens()), !ed]]); }; });
    // abrir/fechar pastas
    $$('[data-abre]', el).forEach(b => b.onclick = () => { const k = b.dataset.abre; fechadas[k] = !fechadas[k]; try { localStorage.setItem('ep-prep-pastas-aba', JSON.stringify(fechadas)); } catch { } b.parentElement.classList.toggle('fechada', !!fechadas[k]); });
    // ARRASTAR para outra pasta (solta no título ou na área da pasta)
    $$('.pcard2[draggable]', el).forEach(cd => { cd.ondragstart = e => { e.dataTransfer.setData('text/plain', cd.dataset.k); e.dataTransfer.effectAllowed = 'move'; cd.classList.add('arrastando'); document.body.classList.add('arrastando-pers'); };
      cd.ondragend = () => { cd.classList.remove('arrastando'); document.body.classList.remove('arrastando-pers'); $$('.pasta-g.alvo', el).forEach(x => x.classList.remove('alvo')); }; });
    $$('.pasta-g', el).forEach(pg => { pg.ondragover = e => { if (!ed) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; pg.classList.add('alvo'); }; pg.ondragleave = e => { if (!pg.contains(e.relatedTarget)) pg.classList.remove('alvo'); };
      pg.ondrop = e => { e.preventDefault(); pg.classList.remove('alvo'); const k = e.dataTransfer.getData('text/plain'), g = pg.dataset.pasta; if (!k || !todos[k] || (todos[k].grupo || '') === g) return;
        todos[k] = { ...todos[k], grupo: g || undefined }; pintaL(); manda(k, { grupo: g || null }, g ? `${todos[k].nome} foi para ${g}.` : `${todos[k].nome} saiu da pasta.`); }; });
    $$('.pcard2', el).forEach(cd => { const k = cd.dataset.k;
      $('.foto', cd).onclick = () => { alvo = k; arq.click(); };
      $('[data-tira]', cd)?.addEventListener('click', async () => { if (await pergunta('Tirar a foto?', `${todos[k].nome} volta a aparecer com as iniciais.`, [['Cancelar', false], ['Tirar', true, 'perigo']])) manda(k, { foto: null }, 'Foto tirada.'); });
      $('[data-pad]', cd)?.addEventListener('click', async e => { const bt = e.currentTarget, rot = bt.innerHTML; bt.innerHTML = giro('Abrindo o Ateliê'); let L; try { L = await atelie(); } catch (er) { bt.innerHTML = rot; return aviso(er.message, 'erro'); } bt.innerHTML = rot;
        const r = await escolheNoAtelie(L, todos[k].atelie, `Padrão de ${todos[k].nome} no Animador (todos os roteiros)`, 'Automático (personagem com o mesmo nome)'); if (r === false) return;
        manda(k, { atelie: r === undefined ? 'auto' : r === null ? null : { id: r.id, nome: r.nome } }, r === undefined ? 'Padrão: automático (mesmo nome).' : r === null ? 'Padrão: nenhum personagem na cena.' : `Padrão no Animador: ${r.nome}.`); });
      const thp = $('[data-pad] [data-th]', cd); if (thp) { thp.classList.add('carregando-th'); atelie().then(L => { const x = L.find(y => y.id === thp.dataset.th); if (x) thumbDe(x).then(t => { thp.classList.remove('carregando-th'); if (t) { thp.style.backgroundImage = `url("${t}")`; thp.classList.add('com-th'); } }); }).catch(() => thp.classList.remove('carregando-th')); }
      const cor = v => manda(k, { cor: v }); $$('.cor', cd).forEach(b => b.onclick = () => cor(b.dataset.cor)); $('input[type=color]', cd).onchange = e => cor(e.target.value); });
  };
  pintaL();
}

/* ---------- aba Ideias (mesmos dados das Ideias do Animador: /ideias → ideias/*.json) ---------- */
const num = n => { n = +n || 0; return n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '').replace('.', ',') + ' mi' : n >= 1e3 ? Math.round(n / 1e3) + ' mil' : String(n); };
const Ideias = {
  S: null, formato: 'todos', aFormato: 'short', aCanal: '',
  async pinta(novo) {
    const el = tela(); el.innerHTML = `<section class="inicio ideias">
      <div class="cab"><span class="cab-ic t-ideia">${ic('luz', 24)}</span><div class="cab-txt"><h1>Ideias</h1><p>O que está funcionando nos canais e ideias para o nosso.</p></div><span class="esp"></span>${pode('ideias') ? `<button class="bt" data-canais>${ic('play', 15)} Canais</button><button class="bt" data-an title="Pede de novo a análise dos canais de referência">${ic('atualizar')} Atualizar análise</button><button class="bt" data-nova>${ic('mais')} Escrever ideia</button><button class="bt pri" data-sug>${ic('luz')} Sugerir ideias</button>` : ''}</div>
      <div class="analise-box">${giroBloco('Carregando a análise')}</div>
      <h2 class="ids-tit">${ic('luz', 16)} Ideias para o nosso canal</h2>
      <div class="filtros">${[['todos', 'Todas', 'grade'], ['short', 'Shorts', 'celular'], ['longo', 'Vídeos longos', 'filme']].map(([k, n, i]) => `<button data-fo="${k}" class="${this.formato === k ? 'on' : ''}">${ic(i, 14)} ${n}</button>`).join('')}</div>
      <div class="ids grade">${giroBloco()}</div></section>`;
    try { if (!this.S || novo) this.S = await Nuvem.pede('/ideias'); } catch (e) { $('.ids', el).innerHTML = $('.analise-box', el).innerHTML = `<div class="vazio erro">${esc(e.message)}</div>`; return; }
    const A = this.S.analise, I = this.S.ideias || { lista: [] };
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
  async guarda(I, msg = 'Ideias salvas.') { I.em = new Date().toISOString(); try { await Nuvem.json('/ideias', 'PUT', { ideias: I }); aviso(msg, 'ok'); } catch (e) { aviso(e.message, 'erro'); } this.pinta(); },
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
  { const IAB = { roteiros: 'doc', ideias: 'luz', personagens: 'pessoa' }; $$('[data-aba]').forEach(b => { if (!b.querySelector('svg')) b.insertAdjacentHTML('afterbegin', ic(IAB[b.dataset.aba] || 'doc', 16) + ' '); }); }
  try { S.eu = await window.EstudioLogin?.pronto; } catch { }
  // níveis de acesso: o /estudio-conta.js (defer) cria o EstudioPerm depois deste arquivo; espera ele antes de desenhar os botões
  if (document.readyState === 'loading') await new Promise(r => addEventListener('DOMContentLoaded', r, { once: true }));
  try { await window.EstudioPerm?.pronto; } catch { }
  const q = new URLSearchParams(location.search), id = q.get('id'), aba = q.get('aba');
  if (aba === 'ideias') return trocaAba(aba); if (aba === 'personagens' || aba === 'cores') return trocaAba('personagens');
  if (id && /^[A-Za-z0-9_-]{2,40}$/.test(id)) { try { return abrePrep(await Nuvem.abre(id)); } catch { const r = await DB.get('rasc', id).catch(() => null); if (r?.P) return abrePrep(r.P, r.base); } }
  pintaInicio();
})();
