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
  function silencios(A, n, minimo = .35) { const { e, q } = energia(A), ord = [...e].sort((a, b) => a - b), piso = ord[Math.floor(ord.length * .1)] || 0, voz = ord[Math.floor(ord.length * .9)] || 0;
    const lim = Math.max(piso + (voz - piso) * .12, piso * 2, .003), corr = []; // limiar adaptado ao ruído de fundo (piso) e ao volume da voz
    let ini = -1, comeco = e.findIndex(v => v >= lim), fimV = e.length - 1 - [...e].reverse().findIndex(v => v >= lim);
    for (let i = 0; i <= e.length; i++) { const sil = i < e.length && e[i] < lim; if (sil && ini < 0) ini = i; if (!sil && ini >= 0) { if ((i - ini) * q >= minimo && ini > comeco && i <= fimV) corr.push({ t: (ini + i) / 2 * q, dur: (i - ini) * q }); ini = -1; } }
    const m = corr.sort((a, b) => b.dur - a.dur).slice(0, Math.max(0, n - 1)).map(x => x.t).sort((a, b) => a - b); m.achados = corr.length + 1; return m; }
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
.ct-fundo{position:fixed;inset:0;z-index:200;background:rgba(8,9,11,.72);display:flex;align-items:center;justify-content:center;padding:14px;backdrop-filter:blur(2px)}
.ct-jan{background:#191a1e;color:#eceef2;border:1px solid #33363d;box-shadow:0 20px 60px rgba(0,0,0,.6);width:min(1120px,100%);max-height:calc(100vh - 28px);display:flex;flex-direction:column;font:14px/1.4 "Segoe UI",system-ui,sans-serif;overflow:hidden}
.ct-cab{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #2c2f35;background:#1d1f24}.ct-cab .ct-ic{width:34px;height:34px;display:grid;place-items:center;background:#ffd36b;color:#2a1f05;font-size:17px;flex:none}
.ct-cab b{font-size:16px;font-weight:600;display:block;line-height:1.2}.ct-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:3px}.ct-chip{font-size:11.5px;color:#c9cdd4;background:#2a2c32;padding:1px 8px}.ct-esp{flex:1}
.ct-x{border:0;background:none;color:#9aa0ab;font-size:20px;width:34px;height:34px;cursor:pointer}.ct-x:hover{color:#fff;background:#2a2c32}
.ct-barra{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:flex-end;padding:10px 18px;border-bottom:1px solid #2c2f35}
.ct-grp{display:flex;flex-direction:column;gap:3px}.ct-grp>small{font-size:10.5px;color:#8b909a;text-transform:uppercase;letter-spacing:.6px}.ct-grp>div{display:flex;gap:4px;flex-wrap:wrap}
.ct-bt{border:1px solid #42454d;background:#25272c;color:#eceef2;padding:5px 10px;font-size:12.5px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;height:30px}.ct-bt:hover:not(:disabled){border-color:#ffd36b;background:#2c2e34}.ct-bt:disabled{opacity:.38;cursor:default}
.ct-bt.on{border-color:#ffd36b;color:#ffd36b}.ct-bt.pri{background:#ffd36b;border-color:#ffd36b;color:#2a1f05;font-weight:600}.ct-bt.rec{background:#ff4d5e;border-color:#ff4d5e;color:#fff;font-weight:600}.ct-bt kbd{font:10.5px ui-monospace,monospace;opacity:.7;border:1px solid currentColor;padding:0 3px}
.ct-bt.mini{height:26px;padding:3px 8px;font-size:12px}
.ct-sil{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px 18px;background:#202227;border-bottom:1px solid #2c2f35;font-size:13px}.ct-sil[hidden]{display:none}
.ct-sil label{display:inline-flex;align-items:center;gap:6px;color:#c9cdd4}.ct-sil input{width:72px;height:28px;background:#141518;color:#eceef2;border:1px solid #42454d;padding:0 6px}
.ct-area{padding:12px 18px 0}
.ct-onda{position:relative;height:200px;background:#111215;border:1px solid #2c2f35;cursor:crosshair;touch-action:none}.ct-onda canvas{width:100%;height:100%;display:block}
.ct-status{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;padding:6px 0 0;font:12.5px ui-monospace,Consolas,monospace;color:#c9cdd4}.ct-status b{color:#ffd36b;font-weight:600}.ct-status .ct-st-corte{color:#ff8fab}
.ct-rol{width:100%;margin:6px 0 0;accent-color:#ffd36b}
.ct-atalhos{margin:6px 0 0;color:#80858f;font-size:11px;line-height:1.55}
.ct-lista{overflow:auto;padding:10px 18px;display:flex;flex-direction:column;gap:5px;min-height:60px}
.ct-lt{font-size:10.5px;color:#8b909a;text-transform:uppercase;letter-spacing:.6px;margin:2px 0}
.ct-ped{display:grid;grid-template-columns:30px 1fr auto auto;align-items:center;gap:8px;padding:6px 8px;background:#212328;border:1px solid #2c2f35;border-left:4px solid var(--c,#ffd36b)}
.ct-ped .ct-n{width:26px;height:26px;display:grid;place-items:center;background:var(--c,#ffd36b);color:#1a1405;font-weight:700;font-size:13px}
.ct-ped select{background:#141518;color:#eceef2;border:1px solid #42454d;padding:4px 6px;min-width:0;width:100%;height:30px}
.ct-ped .ct-d{font:12px ui-monospace,monospace;color:#9aa0ab}.ct-ped .ct-bts{display:flex;gap:4px}
.ct-ped.sobra{--c:#ffb04a}.ct-ped.nao{--c:#5a5d66}
.ct-falta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:6px 8px;border:1px dashed #ff6b81;background:rgba(255,77,94,.06);font-size:13px}.ct-falta .ct-n{width:26px;height:26px;display:grid;place-items:center;background:#ff4d5e;color:#fff;font-weight:700}.ct-falta>span:not(.ct-n){flex:1 1 220px}.ct-falta .ct-n{flex:none}
.ct-extra{display:flex;gap:8px;align-items:center;margin-top:4px}.ct-extra select{flex:1;background:#141518;color:#eceef2;border:1px solid #42454d;padding:4px 6px;height:30px}
.ct-rod{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 18px;border-top:1px solid #2c2f35;background:#1d1f24}.ct-aviso{color:#ffb04a;font-size:12.5px;flex:1 1 280px}
.ct-seq{width:min(760px,100%)}.ct-seq .ct-atual{padding:26px 22px 10px;text-align:center}.ct-seq .ct-quem{color:#ffd36b;font-weight:700;font-size:15px}.ct-seq .ct-nota{color:#e6d28a;font-style:italic}
.ct-seq .ct-txt{font:600 30px/1.3 Rubik,"Segoe UI",sans-serif;margin:8px 0}.ct-seq .ct-junto{color:#ffb04a;font-size:13px}.ct-seq .ct-prox{padding:8px 22px 14px;color:#9aa0ab;text-align:center;border-top:1px dashed #3a3d44;font-size:14px}
.ct-seq .ct-st{display:flex;gap:12px;justify-content:center;align-items:center;padding:6px;color:#c9cdd4;font:13px ui-monospace,monospace}.ct-seq .ct-rec{width:12px;height:12px;border-radius:50%;background:#ff4d5e;animation:ct-p 1s infinite}.ct-seq .ct-rec.pausa{animation:none;background:#9aa0ab}
@keyframes ct-p{50%{opacity:.35}}
.ct-seq .ct-ctl{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:10px 16px 16px}
@media (max-width:700px){.ct-seq .ct-txt{font-size:22px}.ct-onda{height:150px}.ct-ped{grid-template-columns:30px 1fr;}.ct-ped .ct-d,.ct-ped .ct-bts{grid-column:2}}`; document.head.appendChild(s); }

  /* ================= REVISÃO / EDIÇÃO FINA ================= */
  const pilha = []; // janelas abertas (a de cima recebe as teclas)
  const prefSil = () => { try { return { min: 400, margem: 150, ...JSON.parse(localStorage.getItem('ct-sil') || '{}') }; } catch { return { min: 400, margem: 150 }; } };
  async function revisao(o) {
    css(); let A; try { A = o.dados || await decodifica(o.blob); } catch { throw new Error('Não consegui ler esse arquivo como áudio (use mp3, wav, ogg, m4a ou webm).'); }
    const ORIG = { d: A.d.slice(), marcas: [...(o.marcas || [])], dono: o.dono ? [...o.dono] : null }, uma = !!o.uma, falas = o.falas || [], extras = [...(o.extras || [])];
    let marcas = [...(o.marcas || [])].sort((a, b) => a - b), dono = o.dono ? [...o.dono] : null, sel = null, selM = -1, cab = 0, zoom = 1, ini = 0, tocando = null, hist = [], fut = [], aviso = o.aviso || '';
    const dur = () => A.d.length / A.sr, bordas = () => [0, ...marcas, dur()];
    const donoDe = k => dono ? (dono[k] ?? null) : (k < falas.length ? k : -1);
    const materializa = () => { if (!dono) dono = bordas().slice(0, -1).map((_, k) => donoDe(k)); };
    const segDe = t => { const bs = bordas(); let k = 0; while (k < bs.length - 2 && t >= bs[k + 1]) k++; return k; };
    // ---- janela ----
    const f = el('div', 'ct-fundo'), j = el('div', 'ct-jan'); f.append(j);
    const c1 = el('div', 'ct-cab'), cabTxt = el('div'), chips = el('div', 'ct-chips'); c1.append(el('span', 'ct-ic', uma ? '✎' : '✂')); cabTxt.append(el('b', null, o.titulo || (uma ? 'Editar o áudio' : 'Separar o áudio nas falas')), chips); c1.append(cabTxt, el('span', 'ct-esp'));
    const bx = bt('✕', 'ct-x', () => fecha(), 'Fechar (Esc)'); bx.className = 'ct-x'; c1.append(bx); j.append(c1);
    const barra = el('div', 'ct-barra'); j.append(barra);
    const silP = el('div', 'ct-sil'); silP.hidden = true; j.append(silP);
    const area = el('div', 'ct-area'), onda = el('div', 'ct-onda'), cv = el('canvas'); onda.append(cv); area.append(onda);
    const rol = el('input', 'ct-rol'); rol.type = 'range'; rol.min = 0; rol.max = 1000; rol.value = 0; rol.hidden = true; area.append(rol);
    const status = el('div', 'ct-status'); area.append(status);
    const dica = el('div', 'ct-atalhos'); dica.textContent = (uma ? '' : 'C cortar aqui · clique na linha vermelha + Delete tira o corte · arrastar a linha move o corte · Enter ouve o pedaço · Ctrl+←/→ corte anterior/seguinte · ')
      + 'Espaço tocar/parar · clique = cursor · arrastar = selecionar · Delete apaga a seleção · [ aparar até aqui · ] aparar daqui · Home/End · ←/→ 0,1 s (Shift 1 s, Alt 0,01 s) · + − 0 zoom (ou rodinha; Shift+rodinha rola) · Ctrl+Z / Ctrl+Y';
    area.append(dica); j.append(area);
    const lista = el('div', 'ct-lista'); if (!uma) j.append(lista);
    const rod = el('div', 'ct-rod'), av = el('span', 'ct-aviso'); rod.append(av); j.append(rod);
    // ---- barra de ferramentas em grupos ----
    const B = {}, grupo = (titulo, itens) => { const g = el('div', 'ct-grp'), d = el('div'); g.append(el('small', null, titulo), d); for (const [k, txt, fn, title, cls] of itens) { B[k] = bt(txt, cls || '', fn, title); d.append(B[k]); } barra.append(g); };
    grupo('Ouvir', [['play', '▶ Tocar', () => toca(), 'Espaço'], ['ouveSel', '▶ Seleção', () => sel && toca(sel[0], sel[1]), 'Ouvir só o trecho selecionado']]);
    if (!uma) grupo('Cortar entre falas', [['marca', '✂ Cortar aqui', () => poeMarca(cab), 'C · ou duplo clique na onda'], ['tiraM', '✕ Tirar corte', () => tiraMarca(selM), 'Clique na linha vermelha e depois aqui (ou Delete)']]);
    grupo('Aparar', [['ini', '⇤ Até aqui', () => aparaAte(cab), '[ : tira tudo ANTES do cursor'], ['fim', 'Daqui ⇥', () => aparaDesde(cab), '] : tira tudo DEPOIS do cursor'], ['apara', '◧ Só a seleção', () => apara(), 'Fica só com o trecho selecionado'], ['apaga', '🗑 Apagar seleção', () => apagaSel(), 'Delete: tira o trecho selecionado (os cortes ficam)']]);
    grupo('Silêncio', [['pontas', 'Tirar das pontas', () => tiraPontas(), 'Tira o silêncio do começo e do fim, deixando a margem'], ['silB', 'Remover silêncios…', () => { silP.hidden = !silP.hidden; B.silB.classList.toggle('on', !silP.hidden); }, 'Encurta as pausas longas, deixando uma margem em volta']]);
    grupo('Volume', [['menos', '🔉 −', () => ganho(1 / 1.18), 'Mais baixo (na seleção ou em tudo)'], ['mais', '🔊 +', () => ganho(1.18), 'Mais alto (na seleção ou em tudo)']]);
    grupo('Histórico', [['desf', '↶', () => desfaz(), 'Desfazer (Ctrl+Z)'], ['ref', '↷', () => refaz(), 'Refazer (Ctrl+Y)'], ['orig', 'Original', () => { guarda(); A.d = ORIG.d.slice(); marcas = [...ORIG.marcas]; dono = ORIG.dono && [...ORIG.dono]; sel = null; selM = -1; tudo(); }, 'Voltar ao áudio como chegou']]);
    grupo('Zoom', [['zm', '−', () => fazZoom(zoom / 1.6, cab), 'Zoom − (tecla −)'], ['zp', '+', () => fazZoom(zoom * 1.6, cab), 'Zoom + (tecla +)'], ['z0', 'Tudo', () => { zoom = 1; ini = 0; desenha(); }, 'Ver o áudio inteiro (tecla 0)']]);
    // painel "Remover silêncios" (valores ajustáveis, lembrados neste navegador)
    { const p = prefSil(); silP.append(el('b', null, 'Remover silêncios'));
      const campo = (rot, k, v, dica) => { const l = el('label'), i = el('input'); i.type = 'number'; i.min = k === 'min' ? 100 : 0; i.max = 5000; i.step = 10; i.value = v; i.dataset.k = k; l.title = dica; l.append(rot, i, 'ms'); return l; };
      silP.append(campo('pausas a partir de', 'min', p.min, 'Só encurta pausas maiores que isto'), campo('deixar de margem', 'margem', p.margem, 'Quanto de silêncio fica antes e depois de cada fala'));
      silP.append(bt('Aplicar', 'pri', () => { const v = { min: +$('[data-k=min]', silP).value || 400, margem: +$('[data-k=margem]', silP).value || 0 }; try { localStorage.setItem('ct-sil', JSON.stringify(v)); } catch { } removeSilencios(v.min / 1000, v.margem / 1000); }), bt('Fechar', '', () => { silP.hidden = true; B.silB.classList.remove('on'); }));
      const ex = el('small'); ex.style.color = '#8b909a'; ex.textContent = 'Vale na seleção (se houver) ou no áudio todo. A margem também é usada no "Tirar das pontas".'; silP.append(ex); }
    if (!uma) { if (o.transcrever) rod.append(bt('Transcrever para acertar', '', () => transcreve(), 'Usa a cota de transcrição (o resultado fica guardado neste navegador)'));
      rod.append(bt('Cortar pelas pausas', '', () => { guarda(); marcas = silencios(A, falas.length); dono = null; selM = -1; aviso = avisoPausas(marcas, falas.length); tudo(); }, 'Põe os cortes nas pausas mais longas (uma por fala)')); }
    rod.append(bt('Cancelar', '', () => fecha()), bt(o.cru ? 'Usar este pedaço' : uma ? 'Salvar' : 'Separar nas falas', 'pri', () => salva()));
    // ---- desenhar (onda, régua de tempo, cortes com o número da fala, seleção, cursor) ----
    const px = () => cv.width / (dur() * zoom), xT = t => (t - ini) * px(), tX = x => ini + x / px(), DP = () => devicePixelRatio || 1;
    function desenha() { const W = cv.width = onda.clientWidth * DP(), H = cv.height = onda.clientHeight * DP(), g = cv.getContext('2d'), d = A.d, sr = A.sr, R = 18 * DP(), HW = H - R; g.clearRect(0, 0, W, H);
      const vis = dur() / zoom; ini = Math.max(0, Math.min(dur() - vis, ini));
      if (!uma) { const bs = bordas(); for (let k = 0; k < bs.length - 1; k++) { const fi = donoDe(k); if (k % 2) { g.fillStyle = 'rgba(255,255,255,.025)'; g.fillRect(xT(bs[k]), 0, xT(bs[k + 1]) - xT(bs[k]), HW); } if (fi == null) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(xT(bs[k]), 0, xT(bs[k + 1]) - xT(bs[k]), HW); } } }
      if (sel) { g.fillStyle = 'rgba(255,211,107,.16)'; g.fillRect(xT(sel[0]), 0, xT(sel[1]) - xT(sel[0]), HW); g.fillStyle = '#ffd36b'; g.fillRect(xT(sel[0]), 0, DP(), HW); g.fillRect(xT(sel[1]), 0, DP(), HW); }
      const s0 = ini * sr, por = vis * sr / W; g.fillStyle = '#6fa8ff';
      for (let x = 0; x < W; x++) { const a = Math.floor(s0 + x * por), b = Math.min(d.length, Math.floor(s0 + (x + 1) * por) + 1); let mn = 0, mx = 0; for (let i = a; i < b; i++) { const v = d[i]; if (v < mn) mn = v; if (v > mx) mx = v; } g.fillRect(x, HW / 2 - mx * HW / 2, 1, Math.max(1, (mx - mn) * HW / 2)); }
      // régua
      g.fillStyle = '#17181c'; g.fillRect(0, HW, W, R); g.fillStyle = '#8b909a'; g.font = `${10 * DP()}px Segoe UI, sans-serif`; const passo = [.05, .1, .25, .5, 1, 2, 5, 10, 30, 60].find(p => p * px() > 60 * DP()) || 60;
      for (let t = Math.ceil(ini / passo) * passo; t <= ini + vis; t += passo) { const x = xT(t); g.fillRect(x, HW, DP(), 5 * DP()); g.fillText(passo < 1 ? tms(t).replace(/0+$/, '').replace(/,$/, '') : tms(t).replace(/,\d+$/, ''), x + 3 * DP(), H - 4 * DP()); }
      if (!uma) { const bs = bordas(); g.font = `bold ${12 * DP()}px Segoe UI, sans-serif`;
        for (let k = 0; k < bs.length - 1; k++) { const fi = donoDe(k), nome = fi == null ? '×' : fi >= 0 && falas[fi] ? String(fi + 1) : '?', x = Math.max(3 * DP(), xT(bs[k]) + 5 * DP());
          if (x < W && xT(bs[k + 1]) > 0) { const w = Math.max(20 * DP(), g.measureText(nome).width + 10 * DP()); g.fillStyle = fi == null ? '#5a5d66' : fi >= 0 ? '#ffd36b' : '#ffb04a'; g.fillRect(x, 4 * DP(), w, 18 * DP()); g.fillStyle = '#1a1405'; g.fillText(nome, x + 5 * DP(), 17 * DP()); } }
        marcas.forEach((m, i) => { const x = xT(m), on = i === selM; g.strokeStyle = on ? '#ffd36b' : '#ff5a7a'; g.lineWidth = (on ? 3 : 2) * DP(); g.beginPath(); g.moveTo(x, 0); g.lineTo(x, HW); g.stroke();
          g.fillStyle = on ? '#ffd36b' : '#ff5a7a'; g.beginPath(); g.moveTo(x - 7 * DP(), HW); g.lineTo(x + 7 * DP(), HW); g.lineTo(x, HW - 10 * DP()); g.closePath(); g.fill(); }); }
      g.strokeStyle = '#ffffff'; g.lineWidth = DP(); g.beginPath(); g.moveTo(xT(cab), 0); g.lineTo(xT(cab), HW); g.stroke();
      rol.hidden = zoom <= 1.001; rol.value = Math.round(ini / Math.max(.001, dur() - vis) * 1000) || 0;
      status.replaceChildren(); const sp = (rot, v, cls) => { const s = el('span', cls); s.append(rot + ' '); s.append(el('b', null, v)); status.append(s); };
      sp('cursor', tms(cab)); if (sel) sp('seleção', `${tms(sel[0])} – ${tms(sel[1])} (${tms(sel[1] - sel[0])})`); sp('total', tms(dur())); if (zoom > 1.001) sp('zoom', Math.round(zoom) + '×');
      if (selM >= 0) { const s = el('span', 'ct-st-corte', `corte ${selM + 1} selecionado (${tms(marcas[selM])}) — Delete tira`); status.append(s); }
      for (const k of ['apaga', 'apara', 'ouveSel']) B[k].disabled = !sel; if (B.tiraM) B.tiraM.disabled = selM < 0; B.desf.disabled = !hist.length; B.ref.disabled = !fut.length; }
    // ---- lista: um cartão por pedaço + as falas faltando (com "adicionar") + falas de fora da lista ----
    function pintaLista() { if (uma) return; lista.replaceChildren(); const bs = bordas(), usados = new Set(); lista.append(el('div', 'ct-lt', `Pedaços (${bs.length - 1})`));
      for (let k = 0; k < bs.length - 1; k++) { const fi = donoDe(k), r = el('div', 'ct-ped' + (fi == null ? ' nao' : fi < 0 ? ' sobra' : '')); if (fi >= 0) usados.add(fi);
        const s = el('select'); s.append(new Option('— não usar este pedaço —', 'x')); falas.forEach((fa, i) => s.append(new Option((i + 1) + '. ' + fa.rotulo + ': ' + String(fa.texto || '').slice(0, 70), i))); s.value = fi == null || fi < 0 ? 'x' : fi;
        s.onchange = () => { guarda(); materializa(); dono[k] = s.value === 'x' ? null : +s.value; tudo(); };
        const bts = el('div', 'ct-bts'); bts.append(bt('▶', 'mini', () => toca(bs[k], bs[k + 1]), 'Ouvir este pedaço'), bt('✎', 'mini', () => editaPedaco(k), 'Editar só este pedaço'));
        r.append(el('span', 'ct-n', fi == null ? '×' : fi >= 0 ? String(fi + 1) : '?'), s, el('span', 'ct-d', tms(bs[k + 1] - bs[k])), bts); lista.append(r); }
      const faltam = falas.map((_, i) => i).filter(i => !usados.has(i));
      if (faltam.length) { lista.append(el('div', 'ct-lt', `Faltando (${faltam.length})`)); for (const i of faltam) { const r = el('div', 'ct-falta'); r.append(el('span', 'ct-n', String(i + 1)), el('span', null, falas[i].rotulo + ': ' + String(falas[i].texto || '').slice(0, 90)));
        const b1 = bt('Usar a seleção', 'mini', () => daFala(i, 'sel'), 'Corta nas pontas do trecho selecionado e dá esse pedaço para esta fala'); b1.disabled = !sel; r.append(b1, bt('Cortar no cursor', 'mini', () => daFala(i, 'cur'), 'Corta no cursor: o pedaço DEPOIS dele vai para esta fala')); lista.append(r); } }
      if (extras.length) { const x = el('div', 'ct-extra'), s = el('select'); s.append(new Option('+ Adicionar outra fala do roteiro…', '')); extras.forEach((fa, i) => s.append(new Option(fa.rotulo + ': ' + String(fa.texto || '').slice(0, 80), i)));
        s.onchange = () => { if (s.value === '') return; const fa = extras.splice(+s.value, 1)[0]; falas.push(fa); materializa(); tudo(); }; x.append(s); lista.append(x); }
      const sobra = (bs.length - 1) - falas.length; av.textContent = [aviso, sobra > 0 ? `Sobram ${sobra} pedaço(s): escolha a fala ou "não usar".` : '', faltam.length ? `${faltam.length} fala(s) sem pedaço: use "Usar a seleção" ou "Cortar no cursor" nelas.` : ''].filter(Boolean).join(' '); }
    const tudo = () => { desenha(); pintaLista(); info(); };
    const info = () => { chips.replaceChildren(); const c = t => chips.append(el('span', 'ct-chip', t)); c(tms(dur()).replace(/,\d+$/, '')); if (o.blob) c(mb(o.blob.size)); if (!uma) { c(`${falas.length} fala(s)`); c(`${marcas.length} corte(s)`); } };
    // ---- edição (com desfazer) ----
    function guarda() { hist.push({ d: A.d, marcas: [...marcas], dono: dono && [...dono] }); if (hist.length > 40) hist.shift(); fut = []; }
    function desfaz() { if (!hist.length) return; fut.push({ d: A.d, marcas: [...marcas], dono: dono && [...dono] }); const h = hist.pop(); A.d = h.d; marcas = h.marcas; dono = h.dono; sel = null; selM = -1; tudo(); }
    function refaz() { if (!fut.length) return; hist.push({ d: A.d, marcas: [...marcas], dono: dono && [...dono] }); const h = fut.pop(); A.d = h.d; marcas = h.marcas; dono = h.dono; sel = null; selM = -1; tudo(); }
    // corta o áudio num ponto: o pedaço novo (à direita) fica com "quem" (ou com o mesmo dono do pedaço cortado)
    function poeCorte(t, quem) { t = Math.max(.01, Math.min(dur() - .01, t)); if (marcas.some(m => Math.abs(m - t) < .01)) return segDe(t + .001); const k = segDe(t); marcas.push(t); marcas.sort((a, b) => a - b); if (dono) dono.splice(k + 1, 0, quem === undefined ? dono[k] ?? null : quem); return k + 1; }
    function poeMarca(t) { if (uma) return; guarda(); poeCorte(t, dono ? null : undefined); selM = -1; tudo(); }
    function tiraMarca(i) { if (i < 0 || i >= marcas.length) return; guarda(); marcas.splice(i, 1); if (dono) dono.splice(i + 1, 1); selM = -1; tudo(); }
    function daFala(i, como) { guarda(); materializa(); if (como === 'sel' && sel) { poeCorte(sel[0]); const kb = poeCorte(sel[1]); dono[segDe(sel[0] + .001)] = i; void kb; } else { const k = poeCorte(cab, i); dono[k] = i; } sel = null; selM = -1; tudo(); }
    // trecho que some: os cortes NÃO são apagados (os de dentro vão para a ponta do trecho)
    function tiraTrecho(a, b) { const ia = Math.round(a * A.sr), ib = Math.round(b * A.sr), d = new Float32Array(A.d.length - (ib - ia)); d.set(A.d.subarray(0, ia)); d.set(A.d.subarray(ib), ia); A.d = d; marcas = marcas.map(m => m >= b ? m - (b - a) : m > a ? a : m); }
    function apagaSel() { if (!sel) return; guarda(); const [a, b] = sel; tiraTrecho(a, b); cab = a; sel = null; tudo(); }
    function aparaAte(t) { if (t <= .001) return; guarda(); tiraTrecho(0, t); marcas = marcas.map(m => Math.max(.01, m)); cab = 0; sel = null; ini = 0; tudo(); }
    function aparaDesde(t) { if (t >= dur() - .001) return; guarda(); tiraTrecho(t, dur()); marcas = marcas.map(m => Math.min(dur() - .01, m)); sel = null; tudo(); }
    function apara() { if (!sel) return; const [a, b] = sel; guarda(); tiraTrecho(b, dur()); tiraTrecho(0, a); marcas = marcas.map(m => Math.min(dur() - .01, Math.max(.01, m))); cab = 0; sel = null; ini = 0; tudo(); }
    function limiar() { const { e, q } = energia(A), ord = [...e].sort((a, b) => a - b), piso = ord[Math.floor(ord.length * .1)] || 0, voz = ord[Math.floor(ord.length * .9)] || 0; return { e, q, lim: Math.max(piso + (voz - piso) * .12, .003) }; }
    function tiraPontas() { const { e, q, lim } = limiar(), mg = prefSil().margem / 1000, a = e.findIndex(v => v >= lim), b = e.length - 1 - [...e].reverse().findIndex(v => v >= lim); if (a < 0) return;
      const t0 = Math.max(0, a * q - mg), t1 = Math.min(dur(), (b + 1) * q + mg); if (t0 < .02 && t1 > dur() - .02) return; guarda(); if (t1 < dur()) tiraTrecho(t1, dur()); if (t0 > 0) tiraTrecho(0, t0); marcas = marcas.map(m => Math.min(dur() - .01, Math.max(.01, m))); cab = 0; sel = null; ini = 0; tudo(); }
    // REMOVER SILÊNCIOS: cada pausa maior que "min" fica com só a "margem" de cada lado (na seleção ou em tudo)
    function removeSilencios(min, mg) { const { e, q, lim } = limiar(), [sa, sb] = sel || [0, dur()], cortes = []; let ini0 = -1;
      for (let i = 0; i <= e.length; i++) { const sil = i < e.length && e[i] < lim; if (sil && ini0 < 0) ini0 = i; if (!sil && ini0 >= 0) { const a = ini0 * q, b = i * q; if (b - a >= min && b - a > 2 * mg + .02) { const ca = Math.max(a + mg, sa), cb = Math.min(b - mg, sb); if (cb - ca > .01) cortes.push([ca, cb]); } ini0 = -1; } }
      if (!cortes.length) { aviso = 'Não achei pausas maiores que ' + Math.round(min * 1000) + ' ms.'; return tudo(); }
      guarda(); let tirado = 0; for (const [a, b] of cortes.reverse()) { tiraTrecho(a, b); tirado += b - a; } sel = null; cab = Math.min(cab, dur()); aviso = `Removi ${cortes.length} pausa(s) (${tms(tirado)} de silêncio), deixando ${Math.round(mg * 1000)} ms de margem.`; tudo(); }
    // editar SÓ um pedaço (no áudio geral): abre o mesmo editor para ele e devolve o resultado no lugar
    async function editaPedaco(k) { para(); const bs = bordas(), a = bs[k], b = bs[k + 1], P0 = pedaco(A, a, b);
      await revisao({ dados: P0, uma: true, titulo: 'Editar o pedaço ' + (donoDe(k) >= 0 ? (donoDe(k) + 1) + ': ' + (falas[donoDe(k)]?.rotulo || '') : k + 1), cru: true,
        aoSalvar: ([x]) => { guarda(); const n = x.dados.d, ia = Math.round(a * A.sr), ib = Math.round(b * A.sr), d = new Float32Array(A.d.length - (ib - ia) + n.length); d.set(A.d.subarray(0, ia)); d.set(n, ia); d.set(A.d.subarray(ib), ia + n.length);
          const dif = n.length / A.sr - (b - a); A.d = d; marcas = marcas.map(m => m > a + .001 ? m + dif : m); tudo(); } }); }
    function ganho(k) { guarda(); const d = A.d.slice(), [a, b] = sel || [0, dur()]; for (let i = Math.round(a * A.sr); i < Math.min(d.length, Math.round(b * A.sr)); i++) d[i] = Math.max(-1, Math.min(1, d[i] * k)); A.d = d; tudo(); }
    function fazZoom(z, foco) { const vis0 = dur() / zoom; zoom = Math.max(1, Math.min(400, z)); const vis = dur() / zoom; ini = foco - (foco - ini) * vis / vis0; desenha(); }
    // ---- tocar ----
    function para() { try { tocando?.s.stop(); } catch { } tocando = null; B.play.textContent = '▶ Tocar'; }
    function toca(a = cab, b = dur()) { if (tocando) return para(); const x = ac(), buf = x.createBuffer(1, A.d.length, A.sr); buf.copyToChannel(A.d, 0); const s = x.createBufferSource(); s.buffer = buf; s.connect(x.destination);
      const t0 = x.currentTime; s.start(0, a, Math.max(.01, b - a)); tocando = { s }; B.play.textContent = '❚❚ Parar'; s.onended = () => { if (tocando?.s === s) para(); desenha(); };
      const anda = () => { if (tocando?.s !== s) return; cab = a + (x.currentTime - t0); const vis = dur() / zoom; if (cab > ini + vis) ini = cab - vis * .1; desenha(); requestAnimationFrame(anda); }; anda(); }
    // ---- mouse na onda: clique na linha vermelha = seleciona o corte (arrastar move); clique no resto = cursor; arrastar = selecionar ----
    let arr = null;
    onda.onpointerdown = e => { if (e.button !== 0) return; onda.setPointerCapture(e.pointerId); const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * DP(), t = tX(x);
      const mi = uma ? -1 : marcas.reduce((best, m, i) => { const dx = Math.abs(xT(m) - x); return dx < 8 * DP() && (best < 0 || dx < Math.abs(xT(marcas[best]) - x)) ? i : best; }, -1);
      arr = { x0: e.clientX, t0: t, mi, mexeu: false, guardou: false }; if (mi >= 0) { selM = mi; sel = null; desenha(); } };
    onda.oncontextmenu = e => e.preventDefault();
    onda.onpointermove = e => { if (!arr) return; const r = cv.getBoundingClientRect(), t = Math.max(0, Math.min(dur(), tX((e.clientX - r.left) * DP()))); if (Math.abs(e.clientX - arr.x0) > 3) arr.mexeu = true; if (!arr.mexeu) return;
      if (arr.mi >= 0) { if (!arr.guardou) { guarda(); arr.guardou = true; } const lo = arr.mi > 0 ? marcas[arr.mi - 1] + .02 : .01, hi = arr.mi < marcas.length - 1 ? marcas[arr.mi + 1] - .02 : dur() - .01; marcas[arr.mi] = Math.max(lo, Math.min(hi, t)); desenha(); }
      else { sel = [Math.min(arr.t0, t), Math.max(arr.t0, t)]; selM = -1; desenha(); } };
    onda.onpointerup = () => { if (!arr) return; if (!arr.mexeu && arr.mi < 0) { cab = arr.t0; sel = null; selM = -1; } const mexeuCorte = arr.mi >= 0 && arr.mexeu; arr = null; if (mexeuCorte) tudo(); else { desenha(); pintaLista(); } };
    onda.ondblclick = e => { const r = cv.getBoundingClientRect(); poeMarca(tX((e.clientX - r.left) * DP())); };
    onda.onwheel = e => { e.preventDefault(); const r = cv.getBoundingClientRect(), t = tX((e.clientX - r.left) * DP()); if (e.shiftKey) { ini += (e.deltaY > 0 ? 1 : -1) * dur() / zoom * .15; desenha(); } else fazZoom(zoom * (e.deltaY < 0 ? 1.3 : 1 / 1.3), t); };
    rol.oninput = () => { ini = rol.value / 1000 * (dur() - dur() / zoom); desenha(); };
    const vaiPara = t => { para(); cab = Math.max(0, Math.min(dur(), t)); sel = null; const vis = dur() / zoom; if (cab < ini || cab > ini + vis) ini = cab - vis / 2; desenha(); pintaLista(); };
    const tecla = e => { if (!f.isConnected || pilha[pilha.length - 1] !== f) return; if (e.target.closest?.('select,input')) return; const mod = e.ctrlKey || e.metaKey, k = e.key;
      if (k === 'Home') { e.preventDefault(); vaiPara(0); } else if (k === 'End') { e.preventDefault(); vaiPara(dur()); }
      else if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); const d = k === 'ArrowLeft' ? -1 : 1;
        if (mod) { const bs = bordas(), alvo = d < 0 ? [...bs].reverse().find(b => b < cab - .005) : bs.find(b => b > cab + .005); vaiPara(alvo ?? (d < 0 ? 0 : dur())); }
        else vaiPara(cab + d * (e.shiftKey ? 1 : e.altKey ? .01 : .1)); }
      else if (k === 'Enter') { e.preventDefault(); const bs = bordas(), s = segDe(cab); toca(bs[s], bs[s + 1]); }
      else if (k === '[') { e.preventDefault(); aparaAte(cab); } else if (k === ']') { e.preventDefault(); aparaDesde(cab); }
      else if (k === '+' || k === '=') { e.preventDefault(); fazZoom(zoom * 1.6, cab); } else if (k === '-' || k === '_') { e.preventDefault(); fazZoom(zoom / 1.6, cab); } else if (k === '0' && !mod) { e.preventDefault(); zoom = 1; ini = 0; desenha(); }
      else if (k === ' ') { e.preventDefault(); toca(); } else if (/^[mMcC]$/.test(k) && !mod) { e.preventDefault(); poeMarca(cab); }
      else if (k === 'Delete' || k === 'Backspace') { if (selM >= 0) { e.preventDefault(); tiraMarca(selM); } else if (sel) { e.preventDefault(); apagaSel(); } } // o corte só sai se ele estiver SELECIONADO (clicado)
      else if (mod && k.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); desfaz(); } else if (mod && (k.toLowerCase() === 'y' || (k.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); refaz(); }
      else if (k === 'Escape') { if (selM >= 0 || sel) { selM = -1; sel = null; desenha(); pintaLista(); } else fecha(); } };
    pilha.push(f); addEventListener('keydown', tecla); const rz = () => desenha(); addEventListener('resize', rz); const ro = new ResizeObserver(() => desenha()); ro.observe(onda); // desenha de novo quando a área ganha tamanho
    function fecha(semPerguntar) { if (!semPerguntar && hist.length && !confirm('Fechar sem salvar? As mudanças neste áudio se perdem.')) return; para(); removeEventListener('keydown', tecla); removeEventListener('resize', rz); ro.disconnect(); f.remove(); const pi = pilha.indexOf(f); if (pi >= 0) pilha.splice(pi, 1); o.aoFechar?.(); }
    // ---- transcrição ----
    async function transcreve(sozinho) { if (!o.transcrever) return; const bts = $$('button', rod); bts.forEach(b => b.disabled = true); const v = av.textContent; av.textContent = 'Transcrevendo… (pode levar um pouco)';
      try { energia._c = null; const palavras = await o.transcrever(A); const pos = alinha(palavras, falas); if (!pos.some(Boolean)) throw new Error('Não achei as falas na transcrição. Use as pausas ou corte à mão.');
        guarda(); const novas = []; for (let k = 1; k < falas.length; k++) { const a = pos[k - 1], b = pos[k]; if (!b) continue; const t = a ? (a.fim + b.ini) / 2 : b.ini - .15; novas.push(quieto(A, t)); }
        marcas = [...new Set(novas.map(x => Math.round(x * 1000) / 1000))].sort((a, b) => a - b); dono = null; selM = -1; aviso = `Cortes sugeridos pela transcrição (${pos.filter(Boolean).length} de ${falas.length} falas achadas). Confira e arraste se precisar.`; tudo(); }
      catch (e) { if (sozinho) { aviso = 'A transcrição não deu certo (' + e.message + '). Fiquei com os cortes pelas pausas: confira, ou tente "Transcrever para acertar" de novo.'; pintaLista(); } else { av.textContent = v; alert(e.message); } } bts.forEach(b => b.disabled = false); }
    // ---- salvar: cada pedaço vira o áudio de uma fala (Opus .ogg; WAV se o navegador não tiver o codificador) ----
    async function salva() { para(); if (o.cru) { o.aoSalvar([{ dados: { sr: A.sr, d: A.d.slice() } }]); return fecha(true); }
      const bs = uma ? [0, dur()] : bordas(), out = [], salvaBt = rod.lastChild; salvaBt.disabled = true; salvaBt.textContent = 'Preparando…';
      try { for (let k = 0; k < bs.length - 1; k++) { const fi = uma ? 0 : donoDe(k); if (!uma && (fi == null || fi < 0)) continue; const p = await reamostra(pedaco(A, Math.max(0, bs[k] - (uma ? 0 : .02)), Math.min(dur(), bs[k + 1] + (uma ? 0 : .02))), 22050);
          if (p.d.length < 2205) continue; let blob = null; try { blob = await opusOgg(p); } catch { } out.push({ fala: uma ? null : falas[fi].id, blob: blob || wav(p), duracao: Math.round(p.d.length / p.sr * 100) / 100 }); }
        if (!out.length) throw new Error('Nenhum pedaço para salvar.'); const ok = await o.aoSalvar(out); if (ok !== false) fecha(true); }
      catch (e) { alert(e.message); salvaBt.disabled = false; salvaBt.textContent = uma ? 'Salvar' : 'Separar nas falas'; } }
    document.body.append(f); requestAnimationFrame(tudo); if (o.autoTranscrever && o.transcrever && !uma) setTimeout(() => transcreve(true), 300); return { fecha };
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
  // ---------- SEPARAR SEM ABRIR A JANELA (vários arquivos de uma vez) ----------
  // cortes pelo texto (transcrição + alinhamento) ou, sem ela, pelas pausas; devolve { marcas, aviso, achadas }
  async function cortesAuto(A, falas, transcrever) { let marcas = silencios(A, falas.length), aviso = avisoPausas(marcas, falas.length), achadas = null;
    if (transcrever) { try { energia._c = null; const pos = alinha(await transcrever(A), falas); achadas = pos.filter(Boolean).length;
        if (achadas) { const novas = []; for (let k = 1; k < falas.length; k++) { const a = pos[k - 1], b = pos[k]; if (!b) continue; novas.push(quieto(A, a ? (a.fim + b.ini) / 2 : b.ini - .15)); }
          marcas = [...new Set(novas.map(x => Math.round(x * 1000) / 1000))].sort((a, b) => a - b); aviso = `Pelo texto: ${achadas} de ${falas.length} fala(s) achadas.`; } else aviso = 'A transcrição não achou as falas; usei as pausas. ' + aviso; }
      catch (e) { aviso = 'Transcrição falhou (' + e.message + '); usei as pausas. ' + aviso; } }
    return { marcas, aviso, achadas }; }
  // cada pedaço (na ordem) vira o áudio de uma fala, comprimido
  async function codifica(A, marcas, falas) { const bs = [0, ...marcas, A.d.length / A.sr], out = [];
    for (let k = 0; k < Math.min(bs.length - 1, falas.length); k++) { const p = await reamostra(pedaco(A, Math.max(0, bs[k] - .02), Math.min(A.d.length / A.sr, bs[k + 1] + .02)), 22050); if (p.d.length < 2205) continue;
      let blob = null; try { blob = await opusOgg(p); } catch { } out.push({ fala: falas[k].id, blob: blob || wav(p), duracao: Math.round(p.d.length / p.sr * 100) / 100 }); } return out; }
  const avisoPausas = (m, n) => m.achados === n ? `Achei ${n} pedaço${n === 1 ? '' : 's'} pelas pausas (uma por fala). Confira ouvindo cada um.` : m.achados > n ? `Achei ${m.achados} pedaços para ${n} fala${n === 1 ? '' : 's'}: usei as ${n - 1} pausas mais longas. Confira e arraste os cortes.` : `Achei ${m.achados} pedaço${m.achados === 1 ? '' : 's'} para ${n} falas: faltam pausas. Ponha os cortes que faltam (M ou duplo clique).`;
  return { cortesAuto, codifica, avisoPausas, revisao, sequencia, paraRevisao, paraTranscrever, decodifica, alinha, silencios, tms, opusOgg, wav };
})();
if (typeof window !== 'undefined') window.Cortes = Cortes;
