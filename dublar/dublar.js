/* ===================== dublar.js — página PÚBLICA do link de dublagem (Preparativos, 06/11/2026) =====================
   Abre em /dublar/#t=<token> (servida pelo porteiro, sem login). Mostra só as falas do link, grava cada uma no navegador (ou usa um
   arquivo pronto), deixa ouvir/andar pelo áudio/regravar e envia. Fala só com /dublar/api/* (mesmo endereço). SEGURANÇA: nada que vem
   de fora vira HTML (tudo por textContent); o token fica no "#" e vai só no cabeçalho x-dub-token. */
'use strict';
(() => {
  const app = document.getElementById('app'), $ = (s, r = document) => r.querySelector(s);
  const tok = (new URLSearchParams(location.hash.slice(1)).get('t') || '').trim();
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const bt = (txt, cls, fn) => { const b = el('button', 'bt ' + (cls || ''), txt); b.type = 'button'; if (fn) b.onclick = fn; return b; };
  const tempo = s => { s = Math.max(0, +s || 0); return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0'); };
  let nomeGuardado = ''; try { nomeGuardado = localStorage.getItem('ep-dublar-nome') || ''; } catch { }
  const api = async (cam, o = {}) => {
    const h = { 'x-dub-token': tok, ...(o.headers || {}) }; const nome = (S.nome || '').trim(); if (nome) h['x-dub-nome'] = encodeURIComponent(nome);
    let r; try { r = await fetch('/dublar/api/' + cam, { ...o, headers: h, cache: 'no-store', credentials: 'same-origin' }); } catch { throw new Error('Sem conexão. Confira a internet e tente de novo.'); }
    const j = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error(j.error?.message || 'Algo deu errado (' + r.status + ').'); e.status = r.status; throw e; } return j; };
  const S = { d: null, nome: nomeGuardado, loc: new Map(), rec: null, tocando: null };
  const suporte = box => { const d = el('div'); d.setAttribute('data-ep-suporte', 'publico'); box.append(d); try { window.EstudioSuporte?.poe?.(d, { publico: true }); } catch { } };
  const anota = (msg, falaId) => { try { window.EstudioDiario?.anota?.('erro', 'dublar', String(msg).slice(0, 200), falaId ? 'fala ' + falaId : ''); } catch { } }; // ids sim; o token, nunca
  const aviso = (titulo, msg, tipo) => { app.replaceChildren(); const a = el('div', 'aviso ' + (tipo || '')); a.append(el('h2', null, titulo), el('p', null, msg)); if (tipo === 'erro') { anota(titulo + ': ' + msg); suporte(a); } app.append(a); };
  // erro que não precisa fechar a página: faixa no topo, com o relatório de suporte (no lugar dos alertas)
  const faixa = (msg, falaId) => { anota(msg, falaId); $('.faixa-erro')?.remove(); const f = el('div', 'aviso erro faixa-erro'); const x = bt('Fechar', '', () => f.remove()); f.append(el('p', null, msg)); suporte(f); f.append(x); app.prepend(f); f.scrollIntoView({ block: 'nearest' }); };
  addEventListener('error', e => faixa('Algo deu errado nesta página (' + String(e.message || 'erro inesperado').slice(0, 120) + '). Tente de novo ou gere o relatório de suporte.'));
  addEventListener('unhandledrejection', e => faixa('Algo deu errado nesta página (' + String(e.reason?.message || 'erro inesperado').slice(0, 120) + ').'));

  async function inicia() {
    if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) faixa('Este navegador não grava áudio. Use o Chrome, o Edge ou o Firefox atualizados (dá para usar "Usar um arquivo").');
    if (!/^[A-Za-z0-9_-]{43}$/.test(tok)) return aviso('Link incompleto', 'Abra o link exatamente como você recebeu (com tudo depois do "#").', 'erro');
    try { S.d = await api('ver'); } catch (e) { return aviso('Não deu para abrir', e.message, 'erro'); }
    if (S.d.quem?.conta) S.nome = S.d.quem.nome;
    $('#sub').textContent = (S.d.roteiro || 'Roteiro') + (S.d.rotulo ? ' · ' + S.d.rotulo : '');
    const t = $('#tempo'); const pintaT = () => { if (!S.d.expira) { t.textContent = 'Link sem prazo'; return; } const f = S.d.expira - Date.now(); t.textContent = f > 0 ? 'Link vale mais ' + Math.max(1, Math.round(f / 60000)) + ' min' : 'O link venceu'; };
    pintaT(); setInterval(pintaT, 30000);
    pinta();
  }

  function pinta() {
    const d = S.d; app.replaceChildren();
    // QUEM GRAVA
    const b1 = el('div', 'bloco'); b1.append(el('h3', null, 'Quem está gravando'));
    if (d.quem?.conta) { const c = el('div', 'conta'); c.append('Gravando como ', el('b', null, d.quem.nome), ' (conta do Estúdio).'); b1.append(c); }
    else { const l = el('div', 'linha'), i = el('input'); i.type = 'text'; i.maxLength = 40; i.placeholder = 'Seu nome'; i.value = S.nome; i.autocomplete = 'name';
      i.oninput = () => { S.nome = i.value.replace(/[<>"'`\\{}]/g, ''); try { localStorage.setItem('ep-dublar-nome', S.nome); } catch { } };
      l.append(i, el('span', 'dica', 'Sem conta do Estúdio: as gravações ficam com o nome que você escrever.')); b1.append(l); }
    app.append(b1);
    // MICROFONE
    const b2 = el('div', 'bloco'); b2.append(el('h3', null, 'Microfone'));
    const l2 = el('div', 'linha'), sel = el('select'), niv = el('div', 'nivel'); niv.append(el('i'));
    sel.append(new Option('Microfone padrão', '')); const btT = bt('Testar', '', () => testa(btT, niv, sel.value));
    l2.append(sel, btT, niv); b2.append(l2, el('p', 'dica', 'Use fone de ouvido e um lugar quieto. Você pode ouvir, voltar para qualquer ponto e regravar antes de enviar.'));
    app.append(b2);
    navigator.mediaDevices?.enumerateDevices?.().then(ds => ds.filter(x => x.kind === 'audioinput' && x.label).forEach(x => sel.append(new Option(x.label, x.deviceId)))).catch(() => { });
    sel.onchange = () => { S.dev = sel.value; };
    // FALAS
    const n = d.falas.length, env = Object.keys(d.enviadas || {}).length;
    app.append(el('p', 'prog', `${env} de ${n} fala${n === 1 ? '' : 's'} enviada${env === 1 ? '' : 's'}.`));
    for (const f of d.falas) app.append(cartao(f));
    // TERMINEI
    const fim = el('div', 'fim'), bf = bt('Terminei', 'pri', termina); bf.title = 'Avisa que você acabou. Gravações que ainda não foram enviadas são enviadas antes.'; fim.append(bf); app.append(fim);
  }

  function cartao(f) {
    const d = S.d, c = el('div', 'fala'), loc = S.loc.get(f.id), env = d.enviadas?.[f.id];
    if (loc) c.classList.add('local'); else if (env) c.classList.add('enviada');
    if (f.parte) c.append(el('div', 'parte', f.parte));
    if (f.antes) { const a = el('div', 'antes'); a.append(el('b', null, f.antes.personagem + ': '), f.antes.texto); c.append(a); }
    c.append(el('div', 'quem', f.personagem)); if (f.voce) c.append(el('div', 'nota', 'Fala de vários: grave só a parte de ' + f.voce + '.')); if (f.nota) c.append(el('div', 'nota', f.nota)); c.append(el('div', 'texto', f.texto));
    c.append(el('div', 'st ' + (loc ? 'aq' : env ? 'ok' : ''), loc ? `Gravada aqui (${tempo(loc.dur)}) · falta enviar` : env ? `Enviada (${tempo(env.dur)}) · esperando a equipe aprovar` : 'Ainda não gravada'));
    if (loc) c.append(player(loc));
    const l = el('div', 'linha'), gr = bt(S.rec?.f === f.id ? 'Parar' : loc || env ? 'Regravar' : 'Gravar', 'rec' + (S.rec?.f === f.id ? ' on' : ''), () => grava(f, gr));
    const up = bt('Usar um arquivo', '', () => sobe(f)); up.title = 'mp3, wav, ogg, m4a ou webm (até 20 MB)';
    l.append(gr, up); if (loc) l.append(bt('Enviar', 'pri', e => envia(f, e.currentTarget)), bt('Jogar fora', '', () => { S.loc.delete(f.id); pinta(); }));
    c.append(l); return c;
  }

  // PLAYER: play/pause, barra para ir a qualquer ponto e tempo
  function player(loc) {
    const p = el('div', 'player'), a = new Audio(loc.url), b = bt('▶', ''), r = el('input'), t = el('span', 't', '0:00 / ' + tempo(loc.dur));
    r.type = 'range'; r.min = 0; r.max = 1000; r.value = 0; r.setAttribute('aria-label', 'Posição do áudio');
    b.onclick = () => { if (a.paused) { S.tocando?.pause(); S.tocando = a; a.play(); } else a.pause(); };
    a.onplay = () => { b.textContent = '❚❚'; }; a.onpause = a.onended = () => { b.textContent = '▶'; };
    a.ontimeupdate = () => { const du = isFinite(a.duration) ? a.duration : loc.dur; if (du) { r.value = Math.round(a.currentTime / du * 1000); t.textContent = tempo(a.currentTime) + ' / ' + tempo(du); } };
    r.oninput = () => { const du = isFinite(a.duration) ? a.duration : loc.dur; if (du) a.currentTime = r.value / 1000 * du; };
    p.append(b, r, t); return p;
  }

  // MICROFONE: teste e gravação (Opus/WebM), com filtros do navegador
  const abreMic = () => navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, ...(S.dev ? { deviceId: { exact: S.dev } } : {}) } });
  let teste = null;
  async function testa(b, niv, dev) {
    if (teste) { teste.para(); teste = null; b.textContent = 'Testar'; return; }
    try { const st = await abreMic(), ac = new AudioContext(), an = ac.createAnalyser(), buf = new Uint8Array(an.fftSize); ac.createMediaStreamSource(st).connect(an); let raf;
      const anda = () => { an.getByteTimeDomainData(buf); let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v - 128) / 128); $('i', niv).style.width = Math.min(100, m * 140) + '%'; raf = requestAnimationFrame(anda); }; anda();
      teste = { para: () => { cancelAnimationFrame(raf); st.getTracks().forEach(x => x.stop()); ac.close(); $('i', niv).style.width = '0'; } }; b.textContent = 'Parar o teste';
    } catch { faixa('Não consegui usar o microfone. Clique no cadeado ao lado do endereço, permita o microfone e tente de novo.'); }
  }
  async function grava(f) {
    if (S.rec) { const era = S.rec.f === f.id; S.rec.parar(); if (era) return; }
    if (teste) { teste.para(); teste = null; }
    let st; try { st = await abreMic(); } catch { return faixa('Não consegui usar o microfone. Clique no cadeado ao lado do endereço, permita o microfone e tente de novo.'); }
    const tipo = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => window.MediaRecorder?.isTypeSupported?.(t)) || '';
    const mr = new MediaRecorder(st, { ...(tipo ? { mimeType: tipo } : {}), audioBitsPerSecond: 64000 }), ped = [], t0 = performance.now();
    const lim = setTimeout(() => S.rec?.parar(), (S.d.maxSeg || 120) * 1000);
    mr.ondataavailable = e => e.data.size && ped.push(e.data);
    mr.onstop = () => { clearTimeout(lim); st.getTracks().forEach(x => x.stop()); S.rec = null; const dur = (performance.now() - t0) / 1000;
      if (dur < 0.4) return pinta(); const blob = new Blob(ped, { type: mr.mimeType || tipo || 'audio/webm' }); poeLocal(f.id, blob, dur); };
    mr.start(250); S.rec = { f: f.id, parar: () => { try { mr.stop(); } catch { } } }; pinta();
  }
  const poeLocal = (id, blob, dur) => { const v = S.loc.get(id); if (v) URL.revokeObjectURL(v.url); S.loc.set(id, { blob, dur, url: URL.createObjectURL(blob) }); pinta(); };
  function sobe(f) {
    const i = el('input'); i.type = 'file'; i.accept = 'audio/*,.mp3,.wav,.ogg,.oga,.opus,.m4a,.webm';
    i.onchange = async () => { const a = i.files[0]; if (!a) return; if (a.size > (S.d.maxMb || 20) * 1048576) return faixa('Esse arquivo passa de 20 MB.', f.id);
      let dur = 0; try { const ac = new OfflineAudioContext(1, 2, 44100); dur = (await ac.decodeAudioData(await a.arrayBuffer())).duration; } catch { return faixa('Não consegui ler esse arquivo como áudio (use mp3, wav, ogg, m4a ou webm).', f.id); }
      poeLocal(f.id, a, dur); };
    i.click();
  }
  async function envia(f, b) {
    if (!S.d.quem?.conta && !(S.nome || '').trim()) { alert('Escreva o seu nome lá em cima antes de enviar.'); $('input[type=text]')?.focus(); return false; }
    const v = S.loc.get(f.id); if (!v) return true; if (b) { b.disabled = true; b.textContent = 'Enviando…'; }
    try { await api('enviar?fala=' + encodeURIComponent(f.id) + '&dur=' + (Math.round(v.dur * 100) / 100), { method: 'POST', body: v.blob, headers: { 'content-type': 'application/octet-stream' } });
      URL.revokeObjectURL(v.url); S.loc.delete(f.id); S.d.enviadas = { ...(S.d.enviadas || {}), [f.id]: { em: Date.now(), dur: v.dur } }; pinta(); return true; }
    catch (e) { faixa('O envio falhou: ' + e.message, f.id); if (b) { b.disabled = false; b.textContent = 'Enviar'; } return false; }
  }
  async function termina(e) {
    const b = e.currentTarget, falta = S.d.falas.filter(f => !S.loc.has(f.id) && !S.d.enviadas?.[f.id]).length;
    if (falta && !confirm(`${falta} fala${falta === 1 ? '' : 's'} ainda sem gravação. Terminar mesmo assim?`)) return;
    b.disabled = true; b.textContent = 'Enviando…';
    for (const f of S.d.falas) if (S.loc.has(f.id) && !(await envia(f))) { b.disabled = false; b.textContent = 'Terminei'; return; }
    try { await api('terminar', { method: 'POST' }); } catch (er) { faixa(er.message); b.disabled = false; b.textContent = 'Terminei'; return; }
    aviso('Pronto, obrigado!', 'As gravações foram enviadas para a equipe. Pode fechar esta aba.', 'ok');
    setTimeout(() => { try { window.close(); } catch { } }, 1200); // o navegador só deixa fechar abas abertas por script; se não fechar, fica o aviso
  }
  addEventListener('beforeunload', e => { if (S.loc.size) { e.preventDefault(); e.returnValue = ''; } });
  inicia();
})();
