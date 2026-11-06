/* ===================== cortes.js — EDIÇÃO E CORTE DE ÁUDIO no navegador (Preparativos e página do link de dublagem) =====================
   Tudo aqui roda no navegador (Web Audio), sem gastar nuvem: só o resultado final (um áudio por fala) vai para quem chamou.
   Cortes.revisao({ blob|dados, falas:[{id, rotulo, texto, nota}], marcas?, titulo, aviso, aoSalvar(pedacos), transcrever? })
     → janela com a ONDA inteira: marcadores entre as falas (arrastar, duplo clique = novo, M = marcar tocando, botão direito = tirar),
       seleção (arrastar), apagar trecho, cortar fora da seleção, volume +/−, zoom (rodinha, + e −), desfazer/refazer, voltar ao original,
       tempo exato do cursor e da seleção (0:01,250), ouvir cada pedaço, trocar qual fala é qual, "Separar pelos silêncios" e
       "Transcrever para acertar" (quando quem chamou deixa). aoSalvar recebe [{ fala, blob, duracao }] (Opus em .ogg; WAV mono 22 kHz se o navegador não tiver o codificador).
   Cortes.revisao({ ..., uma: true }) → o mesmo editor para UM áudio (sem marcadores): aoSalvar([{ blob, duracao }]).
   Cortes.sequencia({ falas, abreMic, guarda, aoTerminar }) → GRAVAR TUDO EM SEQUÊNCIA: fala atual grande + próxima; Enter = próxima
     (marca o corte), Espaço = pausa, Backspace = volta e regrava a anterior, "Refazer esta fala", Esc = cancelar. aoTerminar(blob, trechos).
   Cortes.paraRevisao(blob, trechos) → junta só os trechos que valem e devolve { dados, marcas } para abrir a revisão.
   Nada de HTML com texto de fora: tudo vai por textContent. */
'use strict';
const Cortes = (() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const bt = (txt, cls, fn, title) => { const b = el('button', 'ct-bt ' + (cls || ''), txt); b.type = 'button'; if (fn) b.onclick = fn; if (title) b.title = title; return b; };
  const tms = s => { s = Math.max(0, +s || 0); const m = Math.floor(s / 60), r = s - m * 60; return m + ':' + String(Math.floor(r)).padStart(2, '0') + ',' + String(Math.round((r % 1) * 1000) % 1000).padStart(3, '0'); };
  const mb = n => (n / 1048576).toFixed(n > 10485760 ? 0 : 1).replace('.', ',') + ' MB';
  let AC = null; const ac = () => (AC = AC && AC.state !== 'closed' ? AC : new (window.AudioContext || window.webkitAudioContext)());
  // ---------- áudio: decodificar (mono), recortar, WAV ----------
  async function decodifica(blob) { const ab = await blob.arrayBuffer(); const b = await ac().decodeAudioData(ab.slice(0));
    const n = b.length, d = new Float32Array(n); for (let c = 0; c < b.numberOfChannels; c++) { const x = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] += x[i] / b.numberOfChannels; } return { sr: b.sampleRate, d }; }
  async function reamostra(A, sr2) { if (A.sr === sr2 || !A.d.length) return A; const n2 = Math.max(1, Math.round(A.d.length * sr2 / A.sr)), o = new OfflineAudioContext(1, n2, sr2), b = o.createBuffer(1, A.d.length, A.sr);
    b.copyToChannel(A.d, 0); const s = o.createBufferSource(); s.buffer = b; s.connect(o.destination); s.start(); const r = await o.startRendering(); return { sr: sr2, d: r.getChannelData(0).slice() }; }
  function wav(A) { const n = A.d.length, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, A.sr, true); v.setUint32(28, A.sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const x = Math.max(-1, Math.min(1, A.d[i])); v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true); } return new Blob([b], { type: 'audio/wav' }); }
  // OPUS NUM .OGG (WebCodecs AudioEncoder, mais rápido que o tempo real; ~6 KB/s em vez de ~44 KB/s do WAV). Sem suporte → null (fica WAV)
  const CRC = (() => { const t = new Uint32Array(256); for (let i = 0; i < 256; i++) { let r = i << 24; for (let k = 0; k < 8; k++) r = r & 0x80000000 ? (r << 1) ^ 0x04c11db7 : r << 1; t[i] = r >>> 0; } return t; })();
  const crc = b => { let c = 0; for (let i = 0; i < b.length; i++) c = ((c << 8) ^ CRC[((c >>> 24) ^ b[i]) & 255]) >>> 0; return c; };
  function oggPagina(pacotes, granulo, serie, seq, tipo) { const segs = []; for (const p of pacotes) { let n = p.length; while (n >= 255) { segs.push(255); n -= 255; } segs.push(n); }
    const tam = pacotes.reduce((s, p) => s + p.length, 0), b = new Uint8Array(27 + segs.length + tam), v = new DataView(b.buffer); b.set([79, 103, 103, 83], 0); b[4] = 0; b[5] = tipo;
    v.setUint32(6, granulo % 4294967296, true); v.setUint32(10, Math.floor(granulo / 4294967296), true); v.setUint32(14, serie, true); v.setUint32(18, seq, true); b[26] = segs.length; b.set(segs, 27);
    let o = 27 + segs.length; for (const p of pacotes) { b.set(p, o); o += p.length; } v.setUint32(22, crc(b), true); return b; }
  async function opusOgg(A) {
    if (typeof AudioEncoder === 'undefined' || typeof AudioData === 'undefined') return null; const cfg = { codec: 'opus', sampleRate: 48000, numberOfChannels: 1, bitrate: 48000 };
    try { if (!(await AudioEncoder.isConfigSupported(cfg)).supported) return null; } catch { return null; }
    const R = await reamostra(A, 48000), pk = []; let erro = null;
    const enc = new AudioEncoder({ output: ch => { const b = new Uint8Array(ch.byteLength); ch.copyTo(b); pk.push({ b, n: Math.round((ch.duration || 20000) * 48000 / 1e6) }); }, error: e => { erro = e; } });
    enc.configure(cfg); const N = 48000; for (let i = 0; i < R.d.length; i += N) { const part = R.d.slice(i, Math.min(R.d.length, i + N)), ad = new AudioData({ format: 'f32-planar', sampleRate: 48000, numberOfFrames: part.length, numberOfChannels: 1, timestamp: Math.round(i / 48 * 1000), data: part }); enc.encode(ad); ad.close(); }
    await enc.flush(); enc.close(); if (erro || !pk.length) return null;
    const pre = 312, serie = (Math.random() * 4294967295) >>> 0, cab = new Uint8Array(19), cv = new DataView(cab.buffer); cab.set([...'OpusHead'].map(c => c.charCodeAt(0))); cab[8] = 1; cab[9] = 1; cv.setUint16(10, pre, true); cv.setUint32(12, 48000, true);
    const ven = [...'Estudio Problems'].map(c => c.charCodeAt(0)), tags = new Uint8Array(8 + 4 + ven.length + 4); tags.set([...'OpusTags'].map(c => c.charCodeAt(0))); new DataView(tags.buffer).setUint32(8, ven.length, true); tags.set(ven, 12);
    const pags = [oggPagina([cab], 0, serie, 0, 2), oggPagina([tags], 0, serie, 1, 0)]; let seq = 2, gran = pre, grupo = [], segs = 0; const fim = pre + R.d.length;
    for (let i = 0; i < pk.length; i++) { const p = pk[i], s = Math.floor(p.b.length / 255) + 1; if (segs + s > 255 && grupo.length) { pags.push(oggPagina(grupo, Math.min(gran, fim), serie, seq++, 0)); grupo = []; segs = 0; }
      grupo.push(p.b); segs += s; gran += p.n; }
    pags.push(oggPagina(grupo, Math.min(gran, fim), serie, seq, 4)); return new Blob(pags, { type: 'audio/ogg' }); }
  const pedaco = (A, a, b) => ({ sr: A.sr, d: A.d.slice(Math.max(0, Math.round(a * A.sr)), Math.min(A.d.length, Math.round(b * A.sr))) });
  // energia em quadros de 20 ms (para silêncios e ajuste fino)
  function energia(A) { const q = Math.max(1, Math.round(A.sr * .02)), n = Math.ceil(A.d.length / q), e = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0; const ini = i * q, f = Math.min(A.d.length, ini + q); for (let j = ini; j < f; j++) s += A.d[j] * A.d[j]; e[i] = Math.sqrt(s / Math.max(1, f - ini)); } return { e, q: .02 }; }
  // o ponto mais quieto perto de t (±raio), para não cortar no meio da palavra
  function quieto(A, t, raio = .35) { const { e, q } = energia._c?.A === A ? energia._c : (energia._c = { A, ...energia(A) }); const i0 = Math.max(0, Math.floor((t - raio) / q)), i1 = Math.min(e.length - 1, Math.ceil((t + raio) / q)); let mi = Math.round(t / q), mv = Infinity;
    for (let i = i0; i <= i1; i++) { const v = e[i] + Math.abs(i * q - t) * .002; if (v < mv) { mv = v; mi = i; } } return Math.max(0, Math.min(A.d.length / A.sr, mi * q + q / 2)); }
  // SEM TRANSCRIÇÃO: as n−1 pausas mais longas viram os cortes (aproximado)
  function silencios(A, n) { const { e, q } = energia(A), ord = [...e].sort((a, b) => a - b), lim = Math.max(ord[Math.floor(ord.length * .15)] * 3, .006), corr = [];
    let ini = -1; for (let i = 0; i <= e.length; i++) { const sil = i < e.length && e[i] < lim; if (sil && ini < 0) ini = i; if (!sil && ini >= 0) { if ((i - ini) * q >= .18 && ini > 0 && i < e.length) corr.push({ t: (ini + i) / 2 * q, dur: (i - ini) * q }); ini = -1; } }
    return corr.sort((a, b) => b.dur - a.dur).slice(0, Math.max(0, n - 1)).map(x => x.t).sort((a, b) => a - b); }
  // ---------- ALINHAMENTO: palavras transcritas (com tempo) × falas do roteiro ----------
  const normal = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  function parecido(a, b) { if (a === b) return true; if (Math.abs(a.length - b.length) > 2) return false; let p = 0; const m = Math.min(a.length, b.length); while (p < m && a[p] === b[p]) p++; return p >= Math.min(4, m - 1) || (a.length > 3 && b.length > 3 && (a.includes(b) || b.includes(a))); }
  function alinha(palavras, falas) { // devolve o tempo de início de cada fala (null quando não achou)
    const T = [], dono = []; falas.forEach((f, i) => normal(f.texto).forEach(t => { T.push(t); dono.push(i); })); const W = palavras.map(p => ({ t: normal(p.w)[0] || '', s: p.s, e: p.e })).filter(x => x.t);
    const n = T.length, m = W.length; if (!n || !m) return falas.map(() => null); const S = new Int32Array((n + 1) * (m + 1)), at = (i, j) => i * (m + 1) + j;
    for (let i = 1; i <= n; i++) S[at(i, 0)] = -i; for (let j = 1; j <= m; j++) S[at(0, j)] = -j * .5 | 0;
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) S[at(i, j)] = Math.max(S[at(i - 1, j - 1)] + (parecido(T[i - 1], W[j - 1].t) ? 2 : -1), S[at(i - 1, j)] - 1, S[at(i, j - 1)] - 1);
    const par = new Array(n).fill(-1); let i = n, j = m; while (i > 0 && j > 0) { const v = S[at(i, j)]; if (v === S[at(i - 1, j - 1)] + (parecido(T[i - 1], W[j - 1].t) ? 2 : -1)) { if (parecido(T[i - 1], W[j - 1].t)) par[i - 1] = j - 1; i--; j--; } else if (v === S[at(i - 1, j)] - 1) i--; else j--; }
    return falas.map((_, k) => { const idx = []; for (let x = 0; x < n; x++) if (dono[x] === k && par[x] >= 0) idx.push(par[x]); return idx.length ? { ini: W[Math.min(...idx)].s, fim: W[Math.max(...idx)].e } : null; }); }
  // ---------- CSS (uma vez) ----------
  function css() { if ($('#ct-css')) return; const s = el('style'); s.id = 'ct-css'; s.textContent = `
.ct-fundo{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:12px}
.ct-jan{background:#1d1f23;color:#eceef2;border:1px solid #3a3d44;width:min(1100px,100%);max-height:calc(100vh - 24px);display:flex;flex-direction:column;font:14px/1.4 "Segoe UI",system-ui,sans-serif}
.ct-cab{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #3a3d44}.ct-cab b{font-size:16px}.ct-cab small{color:#9aa0ab}.ct-esp{flex:1}
.ct-barra{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px 16px;border-bottom:1px solid #3a3d44}
.ct-bt{border:1px solid #4a4d55;background:#26282d;color:#eceef2;padding:5px 10px;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:5px}.ct-bt:hover:not(:disabled){border-color:#6a6e78}.ct-bt:disabled{opacity:.4;cursor:default}
.ct-bt.pri{background:#ffd36b;border-color:#ffd36b;color:#2a1f05;font-weight:600}.ct-bt.rec{background:#ff4d5e;border-color:#ff4d5e;color:#fff;font-weight:600}.ct-bt kbd{font:11px ui-monospace,monospace;opacity:.75;border:1px solid currentColor;padding:0 3px}
.ct-sep{width:1px;height:22px;background:#3a3d44;margin:0 4px}
.ct-tempo{font:12.5px ui-monospace,Consolas,monospace;color:#c9cdd4;margin-left:auto}
.ct-onda{position:relative;margin:10px 16px 0;height:190px;background:#141518;border:1px solid #3a3d44;cursor:text;touch-action:none}.ct-onda canvas{width:100%;height:100%;display:block}
.ct-rol{margin:4px 16px 0;width:calc(100% - 32px);accent-color:#ffd36b}
.ct-lista{overflow:auto;padding:8px 16px;display:flex;flex-direction:column;gap:4px;min-height:60px}
.ct-ped{display:flex;align-items:center;gap:8px;padding:5px 8px;background:#26282d;border-left:4px solid var(--c,#888);font-size:13px}.ct-ped select{background:#141518;color:#eceef2;border:1px solid #4a4d55;padding:3px;max-width:340px;flex:1}.ct-ped small{color:#9aa0ab;min-width:70px}
.ct-ped.falta{opacity:.7;border-left-color:#ff4d5e}.ct-ped.sobra{border-left-color:#ffb04a}
.ct-rod{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 16px;border-top:1px solid #3a3d44}.ct-aviso{color:#ffb04a;font-size:12.5px;flex:1 1 260px}
.ct-seq{width:min(760px,100%)}.ct-seq .ct-atual{padding:26px 22px 10px;text-align:center}.ct-seq .ct-quem{color:#ffd36b;font-weight:700;font-size:15px}.ct-seq .ct-nota{color:#e6d28a;font-style:italic}
.ct-seq .ct-txt{font:600 30px/1.3 Rubik,"Segoe UI",sans-serif;margin:8px 0}.ct-seq .ct-junto{color:#ffb04a;font-size:13px}.ct-seq .ct-prox{padding:8px 22px 14px;color:#9aa0ab;text-align:center;border-top:1px dashed #3a3d44;font-size:14px}
.ct-seq .ct-st{display:flex;gap:12px;justify-content:center;align-items:center;padding:6px;color:#c9cdd4;font:13px ui-monospace,monospace}.ct-seq .ct-rec{width:12px;height:12px;border-radius:50%;background:#ff4d5e;animation:ct-p 1s infinite}.ct-seq .ct-rec.pausa{animation:none;background:#9aa0ab}
@keyframes ct-p{50%{opacity:.35}}
.ct-seq .ct-ctl{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:10px 16px 16px}
@media (max-width:600px){.ct-seq .ct-txt{font-size:22px}.ct-onda{height:150px}}`; document.head.appendChild(s); }

  /* ================= REVISÃO / EDIÇÃO FINA ================= */
  async function revisao(o) {
    css(); let A; try { A = o.dados || await decodifica(o.blob); } catch { throw new Error('Não consegui ler esse arquivo como áudio (use mp3, wav, ogg, m4a ou webm).'); }
    const ORIG = { d: A.d.slice(), marcas: [...(o.marcas || [])] }, uma = !!o.uma, falas = o.falas || [];
    let marcas = [...(o.marcas || [])].sort((a, b) => a - b), dono = o.dono ? [...o.dono] : null, sel = null, cab = 0, zoom = 1, ini = 0, tocando = null, hist = [], fut = [], aviso = o.aviso || '';
    const dur = () => A.d.length / A.sr;
    const f = el('div', 'ct-fundo'), j = el('div', 'ct-jan'); f.append(j);
    const c1 = el('div', 'ct-cab'); c1.append(el('b', null, o.titulo || (uma ? 'Editar o áudio' : 'Separar o áudio nas falas'))); const info = el('small'); c1.append(info, el('span', 'ct-esp')); c1.append(bt('Fechar', '', () => fecha())); j.append(c1);
    const barra = el('div', 'ct-barra'); j.append(barra);
    const onda = el('div', 'ct-onda'), cv = el('canvas'); onda.append(cv); j.append(onda); const rol = el('input', 'ct-rol'); rol.type = 'range'; rol.min = 0; rol.max = 1000; rol.value = 0; rol.hidden = true; j.append(rol);
    const lista = el('div', 'ct-lista'); if (!uma) j.append(lista);
    const rod = el('div', 'ct-rod'), av = el('span', 'ct-aviso'); rod.append(av); j.append(rod);
    const tempo = el('span', 'ct-tempo');
    const B = {}; const add = (k, txt, fn, title, cls) => { B[k] = bt(txt, cls, fn, title); barra.append(B[k]); return B[k]; }, sep = () => barra.append(el('span', 'ct-sep'));
    add('play', '▶ Ouvir', () => toca(), 'Espaço'); add('ouveSel', 'Ouvir a seleção', () => sel && toca(sel[0], sel[1])); sep();
    if (!uma) { add('marca', '+ Marcar corte', () => { poeMarca(cab); }, 'M (também tocando) · duplo clique na onda'); sep(); }
    add('apaga', 'Apagar trecho', () => apagaSel(), 'Delete: tira o trecho selecionado'); add('apara', 'Cortar fora da seleção', () => apara(), 'Fica só o que está selecionado (apara começo e fim)'); sep();
    add('menos', 'Volume −', () => ganho(1 / 1.18)); add('mais', 'Volume +', () => ganho(1.18)); sep();
    add('desf', '↶ Desfazer', () => desfaz(), 'Ctrl+Z'); add('ref', '↷ Refazer', () => refaz(), 'Ctrl+Y'); add('orig', 'Voltar ao original', () => { guarda(); A.d = ORIG.d.slice(); marcas = [...ORIG.marcas]; dono = null; sel = null; tudo(); }); sep();
    add('zm', 'Zoom −', () => fazZoom(zoom / 1.6, cab)); add('zp', 'Zoom +', () => fazZoom(zoom * 1.6, cab)); barra.append(tempo);
    if (!uma) { if (o.transcrever) rod.append(bt('Transcrever para acertar', '', () => transcreve(), 'Usa a cota de transcrição (só quando você pede; o resultado fica guardado neste navegador)'));
      rod.append(bt('Separar pelos silêncios', '', () => { guarda(); marcas = silencios(A, falas.length); dono = null; aviso = 'Separado pelas pausas mais longas: é aproximado, confira cada pedaço.'; tudo(); })); }
    rod.append(bt('Cancelar', '', () => fecha()), bt(uma ? 'Salvar' : 'Separar nas falas', 'pri', () => salva()));
    // ---- desenhar ----
    const px = () => cv.width / (dur() * zoom), xT = t => (t - ini) * px(), tX = x => ini + x / px();
    function desenha() { const W = cv.width = onda.clientWidth * devicePixelRatio, H = cv.height = onda.clientHeight * devicePixelRatio, g = cv.getContext('2d'), d = A.d, sr = A.sr; g.clearRect(0, 0, W, H);
      const vis = dur() / zoom; ini = Math.max(0, Math.min(dur() - vis, ini));
      if (sel) { g.fillStyle = 'rgba(255,211,107,.18)'; g.fillRect(xT(sel[0]), 0, xT(sel[1]) - xT(sel[0]), H); }
      const s0 = ini * sr, por = vis * sr / W; g.fillStyle = '#7fb6ff';
      for (let x = 0; x < W; x++) { const a = Math.floor(s0 + x * por), b = Math.min(d.length, Math.floor(s0 + (x + 1) * por) + 1); let mn = 0, mx = 0; for (let i = a; i < b; i++) { const v = d[i]; if (v < mn) mn = v; if (v > mx) mx = v; } g.fillRect(x, H / 2 - mx * H / 2, 1, Math.max(1, (mx - mn) * H / 2)); }
      if (!uma) { const bs = [0, ...marcas, dur()]; g.font = `${12 * devicePixelRatio}px Segoe UI, sans-serif`;
        for (let k = 0; k < bs.length - 1; k++) { const fi = donoDe(k), nome = fi == null ? '(não usar)' : fi >= 0 && falas[fi] ? (k + 1) + '. ' + falas[fi].rotulo : '(sobrando)'; const x = Math.max(4, xT(bs[k]) + 4); if (x < W) { g.fillStyle = fi == null || fi < 0 ? '#ffb04a' : '#ffd36b'; g.fillText(nome.slice(0, 40), x, 14 * devicePixelRatio); } }
        g.lineWidth = 2 * devicePixelRatio; for (const m of marcas) { const x = xT(m); g.strokeStyle = '#ff6b93'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); g.fillStyle = '#ff6b93'; g.fillRect(x - 5 * devicePixelRatio, H - 12 * devicePixelRatio, 10 * devicePixelRatio, 12 * devicePixelRatio); } }
      g.strokeStyle = '#fff'; g.lineWidth = devicePixelRatio; g.beginPath(); g.moveTo(xT(cab), 0); g.lineTo(xT(cab), H); g.stroke();
      rol.hidden = zoom <= 1.001; rol.value = Math.round(ini / Math.max(.001, dur() - vis) * 1000) || 0;
      tempo.textContent = `cursor ${tms(cab)}` + (sel ? ` · seleção ${tms(sel[0])} – ${tms(sel[1])} (${tms(sel[1] - sel[0])})` : '') + ` · total ${tms(dur())}`;
      for (const k of ['apaga', 'apara', 'ouveSel']) B[k].disabled = !sel; B.desf.disabled = !hist.length; B.ref.disabled = !fut.length; }
    const donoDe = k => dono ? dono[k] : (k < falas.length ? k : -1);
    function pintaLista() { if (uma) return; lista.replaceChildren(); const bs = [0, ...marcas, dur()], usados = new Set();
      for (let k = 0; k < bs.length - 1; k++) { const fi = donoDe(k), r = el('div', 'ct-ped' + (fi == null ? '' : fi < 0 ? ' sobra' : '')); r.style.setProperty('--c', fi >= 0 ? '#ffd36b' : '#ffb04a');
        const s = el('select'); s.append(new Option('(não usar este pedaço)', 'x')); falas.forEach((fa, i) => s.append(new Option((i + 1) + '. ' + fa.rotulo + ': ' + String(fa.texto || '').slice(0, 50), i))); s.value = fi == null || fi < 0 ? 'x' : fi; if (fi >= 0) usados.add(fi);
        s.onchange = () => { dono = dono || [...Array(bs.length - 1)].map((_, q) => donoDe(q)); dono[k] = s.value === 'x' ? null : +s.value; tudo(); };
        r.append(el('small', null, tms(bs[k + 1] - bs[k])), bt('▶', '', () => toca(bs[k], bs[k + 1]), 'Ouvir este pedaço'), s); lista.append(r); }
      const faltam = falas.map((fa, i) => i).filter(i => !usados.has(i)); for (const i of faltam) { const r = el('div', 'ct-ped falta'); r.append(el('small', null, 'faltando'), el('span', null, (i + 1) + '. ' + falas[i].rotulo + ': ' + String(falas[i].texto || '').slice(0, 60))); lista.append(r); }
      const sobra = (bs.length - 1) - falas.length; av.textContent = [aviso, sobra > 0 ? `Sobram ${sobra} pedaço(s): escolha a fala ou deixe "não usar".` : '', faltam.length ? `${faltam.length} fala(s) sem pedaço: ponha mais marcadores (M) ou deixe para gravar depois.` : ''].filter(Boolean).join(' '); }
    const tudo = () => { desenha(); pintaLista(); };
    // ---- edição (com desfazer) ----
    function guarda() { hist.push({ d: A.d, marcas: [...marcas], dono: dono && [...dono] }); if (hist.length > 30) hist.shift(); fut = []; }
    function desfaz() { if (!hist.length) return; fut.push({ d: A.d, marcas: [...marcas], dono }); const h = hist.pop(); A.d = h.d; marcas = h.marcas; dono = h.dono; sel = null; tudo(); }
    function refaz() { if (!fut.length) return; hist.push({ d: A.d, marcas: [...marcas], dono }); const h = fut.pop(); A.d = h.d; marcas = h.marcas; dono = h.dono; sel = null; tudo(); }
    function apagaSel() { if (!sel) return; guarda(); const [a, b] = sel, ia = Math.round(a * A.sr), ib = Math.round(b * A.sr), d = new Float32Array(A.d.length - (ib - ia)); d.set(A.d.subarray(0, ia)); d.set(A.d.subarray(ib), ia); A.d = d;
      marcas = marcas.filter(m => m < a || m > b).map(m => m > b ? m - (b - a) : m); cab = a; sel = null; tudo(); }
    function apara() { if (!sel) return; guarda(); const [a, b] = sel; A.d = A.d.slice(Math.round(a * A.sr), Math.round(b * A.sr)); marcas = marcas.filter(m => m > a && m < b).map(m => m - a); cab = 0; sel = null; ini = 0; tudo(); }
    function ganho(k) { guarda(); const d = A.d.slice(), [a, b] = sel || [0, dur()]; for (let i = Math.round(a * A.sr); i < Math.min(d.length, Math.round(b * A.sr)); i++) d[i] = Math.max(-1, Math.min(1, d[i] * k)); A.d = d; tudo(); }
    function poeMarca(t) { if (uma) return; t = Math.max(.01, Math.min(dur() - .01, t)); guarda(); marcas = [...marcas, t].sort((a, b) => a - b); dono = null; tudo(); }
    function fazZoom(z, foco) { const vis0 = dur() / zoom; zoom = Math.max(1, Math.min(400, z)); const vis = dur() / zoom; ini = foco - (foco - ini) * vis / vis0; desenha(); }
    // ---- tocar ----
    function para() { try { tocando?.s.stop(); } catch { } tocando = null; B.play.textContent = '▶ Ouvir'; }
    function toca(a = cab, b = dur()) { if (tocando) return para(); const x = ac(), buf = x.createBuffer(1, A.d.length, A.sr); buf.copyToChannel(A.d, 0); const s = x.createBufferSource(); s.buffer = buf; s.connect(x.destination);
      const t0 = x.currentTime; s.start(0, a, Math.max(.01, b - a)); tocando = { s }; B.play.textContent = '❚❚ Parar'; s.onended = () => { if (tocando?.s === s) para(); desenha(); };
      const anda = () => { if (tocando?.s !== s) return; cab = a + (x.currentTime - t0); const vis = dur() / zoom; if (cab > ini + vis) ini = cab - vis * .1; desenha(); requestAnimationFrame(anda); }; anda(); }
    // ---- mouse/teclado na onda ----
    let arr = null;
    onda.onpointerdown = e => { onda.setPointerCapture(e.pointerId); const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * devicePixelRatio, t = tX(x);
      const mi = uma ? -1 : marcas.findIndex(m => Math.abs(xT(m) - x) < 7 * devicePixelRatio);
      if (e.button === 2 && mi >= 0) { e.preventDefault(); guarda(); marcas.splice(mi, 1); dono = null; return tudo(); }
      arr = { x0: e.clientX, t0: t, mi, mexeu: false, antes: mi >= 0 ? (guarda(), true) : false }; };
    onda.oncontextmenu = e => e.preventDefault();
    onda.onpointermove = e => { if (!arr) return; const r = cv.getBoundingClientRect(), t = Math.max(0, Math.min(dur(), tX((e.clientX - r.left) * devicePixelRatio))); if (Math.abs(e.clientX - arr.x0) > 3) arr.mexeu = true; if (!arr.mexeu) return;
      if (arr.mi >= 0) { marcas[arr.mi] = t; marcas.sort((a, b) => a - b); arr.mi = marcas.indexOf(t); desenha(); } else { sel = [Math.min(arr.t0, t), Math.max(arr.t0, t)]; desenha(); } };
    onda.onpointerup = () => { if (!arr) return; if (!arr.mexeu) { if (arr.antes) hist.pop(); if (arr.mi < 0) { cab = arr.t0; sel = null; } } else if (arr.mi >= 0) pintaLista(); arr = null; desenha(); };
    onda.ondblclick = e => { const r = cv.getBoundingClientRect(); poeMarca(tX((e.clientX - r.left) * devicePixelRatio)); };
    onda.onwheel = e => { e.preventDefault(); const r = cv.getBoundingClientRect(), t = tX((e.clientX - r.left) * devicePixelRatio); if (e.shiftKey) { ini += (e.deltaY > 0 ? 1 : -1) * dur() / zoom * .15; desenha(); } else fazZoom(zoom * (e.deltaY < 0 ? 1.3 : 1 / 1.3), t); };
    rol.oninput = () => { ini = rol.value / 1000 * (dur() - dur() / zoom); desenha(); };
    const tecla = e => { if (!f.isConnected) return; if (e.target.closest?.('select,input')) return; const mod = e.ctrlKey || e.metaKey;
      if (e.key === ' ') { e.preventDefault(); toca(); } else if ((e.key === 'm' || e.key === 'M') && !mod) { e.preventDefault(); poeMarca(cab); } else if (e.key === 'Delete' || e.key === 'Backspace') { if (sel) { e.preventDefault(); apagaSel(); } }
      else if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); desfaz(); } else if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); refaz(); } else if (e.key === 'Escape') fecha(); };
    addEventListener('keydown', tecla); const rz = () => desenha(); addEventListener('resize', rz);
    function fecha(semPerguntar) { if (!semPerguntar && hist.length && !confirm('Fechar sem salvar? As mudanças neste áudio se perdem.')) return; para(); removeEventListener('keydown', tecla); removeEventListener('resize', rz); f.remove(); o.aoFechar?.(); }
    // ---- transcrição (só quando a pessoa pede) ----
    async function transcreve() { if (!o.transcrever) return; const bts = $$('button', rod); bts.forEach(b => b.disabled = true); const v = av.textContent; av.textContent = 'Transcrevendo… (pode levar um pouco)';
      try { energia._c = null; const palavras = await o.transcrever(A); const pos = alinha(palavras, falas); if (!pos.some(Boolean)) throw new Error('Não achei as falas na transcrição. Use os silêncios ou marque à mão.');
        guarda(); const novas = []; for (let k = 1; k < falas.length; k++) { const a = pos[k - 1], b = pos[k]; if (!b) continue; const t = a ? (a.fim + b.ini) / 2 : b.ini - .15; novas.push(quieto(A, t)); }
        marcas = [...new Set(novas.map(x => Math.round(x * 1000) / 1000))].sort((a, b) => a - b); dono = null; aviso = `Cortes sugeridos pela transcrição (${pos.filter(Boolean).length} de ${falas.length} falas achadas). Confira e arraste se precisar.`; tudo(); }
      catch (e) { av.textContent = v; alert(e.message); } bts.forEach(b => b.disabled = false); }
    // ---- salvar: cada pedaço vira o áudio de uma fala (WAV mono 22 kHz) ----
    async function salva() { para(); const bs = uma ? [0, dur()] : [0, ...marcas, dur()], out = [], salvaBt = rod.lastChild; salvaBt.disabled = true; salvaBt.textContent = 'Preparando…';
      try { for (let k = 0; k < bs.length - 1; k++) { const fi = uma ? 0 : donoDe(k); if (!uma && (fi == null || fi < 0)) continue; const p = await reamostra(pedaco(A, Math.max(0, bs[k] - (uma ? 0 : .02)), Math.min(dur(), bs[k + 1] + (uma ? 0 : .02))), 22050);
          if (p.d.length < 2205) continue; let blob = null; try { blob = await opusOgg(p); } catch { } out.push({ fala: uma ? null : falas[fi].id, blob: blob || wav(p), duracao: Math.round(p.d.length / p.sr * 100) / 100 }); }
        if (!out.length) throw new Error('Nenhum pedaço para salvar.'); const ok = await o.aoSalvar(out); if (ok !== false) fecha(true); }
      catch (e) { alert(e.message); salvaBt.disabled = false; salvaBt.textContent = uma ? 'Salvar' : 'Separar nas falas'; } }
    info.textContent = `${tms(dur())}${o.blob ? ' · ' + mb(o.blob.size) : ''}${uma ? '' : ` · ${falas.length} fala(s)`}`;
    document.body.append(f); requestAnimationFrame(tudo); return { fecha };
  }

  /* ================= GRAVAR TUDO EM SEQUÊNCIA ================= */
  // trechos: [{ fala, ini, fim }] em segundos da gravação (sem as pausas); trecho descartado não entra
  async function sequencia(o) {
    css(); const falas = o.falas; if (!falas.length) return; let st; try { st = await o.abreMic(); } catch { throw new Error('Não consegui usar o microfone.'); }
    const stream = st.stream || st, tipo = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => window.MediaRecorder?.isTypeSupported?.(t)) || '';
    const mr = new MediaRecorder(stream, { ...(tipo ? { mimeType: tipo } : {}), audioBitsPerSecond: 64000 }), pedacos = [];
    let i = 0, inicio = 0, ativo = 0, desde = performance.now(), pausado = false, trechos = [], fim = false;
    const agora = () => (ativo + (pausado ? 0 : performance.now() - desde)) / 1000;
    const f = el('div', 'ct-fundo'), j = el('div', 'ct-jan ct-seq'); f.append(j);
    const cab = el('div', 'ct-cab'); cab.append(el('b', null, 'Gravar tudo em sequência'), el('span', 'ct-esp')); const qual = el('small'); cab.append(qual); j.append(cab);
    const atual = el('div', 'ct-atual'), prox = el('div', 'ct-prox'), stx = el('div', 'ct-st'), ctl = el('div', 'ct-ctl'); j.append(atual, prox, stx, ctl);
    const luz = el('i', 'ct-rec'), tt = el('span'); stx.append(luz, tt);
    const kb = (txt, k) => { const s = el('span'); s.append(txt + ' '); const x = el('kbd', null, k); s.append(x); return s; };
    const bVolta = bt('', '', () => volta()), bRefaz = bt('Refazer esta fala', '', () => refaz()), bPausa = bt('', '', () => pausa()), bProx = bt('', 'pri', () => proxima()), bCanc = bt('', '', () => cancela());
    bVolta.append(kb('Voltar', 'Backspace')); bPausa.append(kb('Pausar', 'Espaço')); bProx.append(kb('Próxima', 'Enter')); bCanc.append(kb('Cancelar', 'Esc')); ctl.append(bVolta, bRefaz, bPausa, bProx, bCanc);
    function mostra() { const fa = falas[i], nx = falas[i + 1]; atual.replaceChildren(); atual.append(el('div', 'ct-quem', fa.rotulo)); if (fa.nota) atual.append(el('div', 'ct-nota', fa.nota)); atual.append(el('div', 'ct-txt', fa.texto)); if (fa.junto) atual.append(el('div', 'ct-junto', 'Dita ao mesmo tempo que: ' + fa.junto));
      prox.replaceChildren(); prox.append(nx ? 'Próxima: ' + nx.rotulo + (nx.nota ? ' (' + nx.nota + ')' : '') + ' — ' + String(nx.texto).slice(0, 90) : 'Esta é a última. Enter termina.');
      qual.textContent = `Fala ${i + 1} de ${falas.length}`; bVolta.disabled = i === 0; bProx.firstChild.firstChild.textContent = i === falas.length - 1 ? 'Terminar ' : 'Próxima '; }
    const relogio = setInterval(() => { tt.textContent = (pausado ? 'pausado · ' : 'gravando · ') + tms(agora()).replace(/,\d+$/, ''); }, 200);
    function proxima() { trechos = trechos.filter(t => t.fala !== falas[i].id); trechos.push({ fala: falas[i].id, ini: inicio, fim: agora() }); inicio = agora(); if (i === falas.length - 1) return termina(); i++; mostra(); salvaTemp(); }
    function volta() { if (i === 0) return; i--; trechos = trechos.filter(t => t.fala !== falas[i].id); inicio = agora(); mostra(); } // regrava a anterior a partir daqui (o trecho velho dela é descartado)
    function refaz() { inicio = agora(); tt.textContent = 'recomeçando esta fala…'; }
    function pausa() { if (pausado) { desde = performance.now(); pausado = false; mr.resume(); luz.classList.remove('pausa'); bPausa.firstChild.firstChild.textContent = 'Pausar '; } else { ativo += performance.now() - desde; pausado = true; mr.pause(); luz.classList.add('pausa'); bPausa.firstChild.firstChild.textContent = 'Continuar '; } }
    function sai() { fim = true; clearInterval(relogio); removeEventListener('keydown', tecla); try { (st.fecha ? st.fecha() : stream.getTracks().forEach(x => x.stop())); } catch { } f.remove(); }
    const pronto = () => new Promise(ok => { if (mr.state === 'inactive') return ok(); mr.onstop = ok; try { mr.stop(); } catch { ok(); } });
    async function termina() { await pronto(); const blob = new Blob(pedacos, { type: mr.mimeType || tipo || 'audio/webm' }); sai(); o.aoTerminar(blob, trechos); }
    async function cancela() { if (pausado === false) pausa(); const r = trechos.length ? prompt('Cancelar a gravação em sequência?\nEscreva 1 para GUARDAR o que já foi gravado (vai para a revisão), 2 para DESCARTAR tudo, ou deixe vazio para continuar gravando.', '1') : (confirm('Descartar a gravação?') ? '2' : '');
      if (r === '1') return termina(); if (r === '2') { await pronto(); sai(); o.guarda?.(null); return o.aoCancelar?.(); } pausa(); }
    let tSalva = 0; function salvaTemp() { clearTimeout(tSalva); tSalva = setTimeout(() => { try { o.guarda?.({ chunks: pedacos.slice(), tipo: mr.mimeType || tipo, trechos: trechos.slice(), em: Date.now() }); } catch { } }, 300); }
    const tecla = e => { if (fim) return; if (e.key === 'Enter') { e.preventDefault(); proxima(); } else if (e.key === ' ') { e.preventDefault(); pausa(); } else if (e.key === 'Backspace') { e.preventDefault(); volta(); } else if (e.key === 'Escape') { e.preventDefault(); cancela(); } };
    addEventListener('keydown', tecla);
    mr.ondataavailable = e => { if (e.data.size) { pedacos.push(e.data); if (pedacos.length % 20 === 0) salvaTemp(); } }; // guarda no navegador enquanto grava (a cada ~5 s)
    document.body.append(f); mostra(); mr.start(250); desde = performance.now();
  }
  // a gravação contínua → só os trechos que valem, na ordem das falas, com os cortes entre eles
  async function paraRevisao(blob, trechos, ordem) { const A = await decodifica(blob), ts = [...trechos].sort((a, b) => ordem.indexOf(a.fala) - ordem.indexOf(b.fala)), partes = [], marcas = [], quem = []; let t = 0;
    for (const x of ts) { const p = pedaco(A, x.ini, x.fim); if (!p.d.length) continue; if (partes.length) marcas.push(t); partes.push(p.d); quem.push(x.fala); t += p.d.length / A.sr; }
    const n = partes.reduce((s, d) => s + d.length, 0), d = new Float32Array(n); let o = 0; for (const p of partes) { d.set(p, o); o += p.length; } return { dados: { sr: A.sr, d }, marcas, quem }; }
  // áudio → pedaços de WAV 16 kHz em base64 (para a transcrição; até ~150 s cada)
  async function paraTranscrever(A, seg = 150) { const r = await reamostra({ sr: A.sr, d: A.d }, 16000), out = []; for (let a = 0; a < r.d.length; a += seg * 16000) { const b = wav({ sr: 16000, d: r.d.slice(a, a + seg * 16000) }), u8 = new Uint8Array(await b.arrayBuffer()); let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000)); out.push({ base64: btoa(s), desde: a / 16000 }); } return out; }
  return { revisao, sequencia, paraRevisao, paraTranscrever, decodifica, alinha, silencios, tms, opusOgg, wav };
})();
if (typeof window !== 'undefined') window.Cortes = Cortes;
