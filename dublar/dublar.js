/* ===================== dublar.js — página PÚBLICA do link de dublagem (Preparativos, 06/11/2026) =====================
   Abre em /dublar/#t=<token> (servida pelo porteiro, sem login). Mostra só as falas do link, grava cada uma no navegador (ou usa um
   arquivo pronto), deixa ouvir/andar pelo áudio/regravar e envia. Fala só com /dublar/api/* (mesmo endereço). SEGURANÇA: nada que vem
   de fora vira HTML (tudo por textContent); o token fica no "#" e vai só no cabeçalho x-dub-token.
   Visual (07/11): passos numerados (1 quem grava · 2 microfone · 3 falas), microfone completo (permissão, qual microfone, volume, filtros,
   ouvir a própria voz, teste com medidor) e cartões de fala no estilo Metro. */
'use strict';
(() => {
  const app = document.getElementById('app'), $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const tok = (new URLSearchParams(location.hash.slice(1)).get('t') || '').trim();
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const bt = (txt, cls, fn, title) => { const b = el('button', 'bt ' + (cls || ''), txt); b.type = 'button'; if (fn) b.onclick = fn; if (title) b.title = title; return b; };
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
  const faixa = (msg, falaId, info) => { if (!info) anota(msg, falaId); $('.faixa-erro')?.remove(); const f = el('div', 'aviso faixa-erro ' + (info ? 'info' : 'erro')); const x = bt('Fechar', '', () => f.remove()); f.append(el('p', null, msg)); if (!info) suporte(f); f.append(x); app.prepend(f); f.scrollIntoView({ block: 'nearest' }); };
  addEventListener('error', e => faixa('Algo deu errado nesta página (' + String(e.message || 'erro inesperado').slice(0, 120) + '). Tente de novo ou gere o relatório de suporte.'));
  addEventListener('unhandledrejection', e => faixa('Algo deu errado nesta página (' + String(e.reason?.message || 'erro inesperado').slice(0, 120) + ').'));
  const SVG = { mic: 'M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3', up: 'M12 15V4M7 9l5-5 5 5M5 14v5h14v-5', lixo: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', env: 'M4 12l16-8-6 16-3-7z', ok: 'M5 12l5 5 9-10' };
  const ico = (k, s = 16) => { const n = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); n.setAttribute('width', s); n.setAttribute('height', s); n.setAttribute('viewBox', '0 0 24 24'); n.setAttribute('fill', 'none'); n.setAttribute('stroke', 'currentColor'); n.setAttribute('stroke-width', '2'); n.setAttribute('stroke-linecap', 'round'); n.setAttribute('stroke-linejoin', 'round');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', SVG[k]); n.append(p); return n; };
  const btI = (k, txt, cls, fn, title) => { const b = bt('', cls, fn, title); b.append(ico(k, 15)); if (txt) b.append(el('span', null, txt)); return b; };

  /* ---------- MICROFONE: permissão, qual microfone, volume, filtros, ouvir a própria voz (guardado neste navegador) ---------- */
  const MIC = {
    cfg() { let c = {}; try { c = JSON.parse(localStorage.getItem('ep-dublar-mic') || '{}') || {}; } catch { } return { dev: '', monitor: false, ruido: true, eco: true, agc: true, vol: 1, grave: true, comp: false, qual: 'alta', conta: true, ...c }; },
    kbps() { return { normal: 64000, alta: 96000, max: 128000 }[this.cfg().qual] || 96000; },
    salva(c) { try { localStorage.setItem('ep-dublar-mic', JSON.stringify(c)); } catch { } },
    async permissao() { try { return (await navigator.permissions.query({ name: 'microphone' })).state; } catch { } try { return (await navigator.mediaDevices.enumerateDevices()).some(x => x.kind === 'audioinput' && x.label) ? 'granted' : 'prompt'; } catch { return 'prompt'; } },
    // o som já tratado (filtros do navegador + volume) vai para "dest", que é o que se grava; "an" mede o nível
    async abre() { const c = this.cfg(), base = { echoCancellation: c.eco, noiseSuppression: c.ruido, autoGainControl: c.agc };
      let st; try { st = await navigator.mediaDevices.getUserMedia({ audio: c.dev ? { ...base, deviceId: { exact: c.dev } } : base }); } catch (e) { if (!c.dev) throw e; st = await navigator.mediaDevices.getUserMedia({ audio: base }); }
      const ac = new AudioContext(), src = ac.createMediaStreamSource(st), g = ac.createGain(), an = ac.createAnalyser(), dest = ac.createMediaStreamDestination(); g.gain.value = c.vol; an.fftSize = 2048;
      let no = src; if (c.grave) { const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 80; no.connect(hp); no = hp; }
      if (c.comp) { const k = ac.createDynamicsCompressor(); k.threshold.value = -24; k.knee.value = 20; k.ratio.value = 3; k.attack.value = .005; k.release.value = .2; no.connect(k); no = k; }
      no.connect(g); g.connect(an); g.connect(dest); if (c.monitor) g.connect(ac.destination);
      return { st, ac, an, g, dest, fecha() { try { st.getTracks().forEach(t => t.stop()); } catch { } try { ac.close(); } catch { } } }; },
    nivel(an, buf) { an.getByteTimeDomainData(buf); let s = 0, pico = 0; for (const v of buf) { const x = (v - 128) / 128; s += x * x; pico = Math.max(pico, Math.abs(x)); } return { rms: Math.sqrt(s / buf.length), pico }; },
    teste: null,
    paraTeste() { if (this.teste) { this.teste.para(); this.teste = null; } },
    async pinta(box) {
      this.paraTeste(); box.replaceChildren(); const perm = await this.permissao(), c = this.cfg();
      if (perm === 'denied') { box.className = 'mic bloq'; box.append(el('p', 'mic-st', 'O microfone está BLOQUEADO para esta página.'));
        const ol = el('ol'); ['Clique no cadeado (ou nos ajustes) à esquerda do endereço, lá em cima.', 'Em "Microfone", escolha "Permitir".', 'Clique em "Tentar de novo".'].forEach(t => ol.append(el('li', null, t))); box.append(ol, bt('Tentar de novo', 'pri', () => this.pinta(box))); return; }
      if (perm !== 'granted') { box.className = 'mic pede'; box.append(el('p', 'mic-st', 'Para gravar, a página precisa usar o seu microfone.'), el('p', 'dica', 'Clique no botão e escolha "Permitir" na janelinha do navegador. Depois aparecem as configurações.'));
        box.append(btI('mic', 'Permitir o microfone', 'pri', async () => { try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach(t => t.stop()); } catch { } this.pinta(box); })); return; }
      box.className = 'mic ok'; const cab = el('div', 'mic-cab'); cab.append(el('span', 'mic-ok', '✓ microfone permitido')); const bT = btI('mic', 'Testar', '', () => this.teste ? (this.paraTeste(), bT.lastChild.textContent = 'Testar') : this.testa(box, bT)); cab.append(el('span', 'esp'), bT); box.append(cab);
      const grade = el('div', 'mic-grade');
      const campo = (rot, ctl) => { const l = el('label', 'mic-campo'); l.append(el('small', null, rot), ctl); return l; };
      const sel = el('select'); sel.append(new Option('Microfone padrão do computador', '')); try { for (const d of (await navigator.mediaDevices.enumerateDevices()).filter(x => x.kind === 'audioinput')) sel.append(new Option(d.label || 'Microfone', d.deviceId)); } catch { } sel.value = c.dev;
      sel.onchange = () => this.muda('dev', sel.value, box, bT);
      const vol = el('input'); vol.type = 'range'; vol.min = 0; vol.max = 2; vol.step = .05; vol.value = c.vol; const vv = el('b', null, Math.round(c.vol * 100) + '%');
      vol.oninput = () => { vv.textContent = Math.round(vol.value * 100) + '%'; this.salva({ ...this.cfg(), vol: +vol.value }); if (this.teste) this.teste.m.g.gain.value = +vol.value; };
      const lv = el('small'); lv.append('Volume do microfone ', vv); const lvol = el('label', 'mic-campo'); lvol.append(lv, vol);
      const med = el('div', 'mic-med'), barra = el('i'), pico = el('span'), aviso2 = el('small', 'mic-alto', ''); med.append(barra, pico);
      const lmed = el('div', 'mic-campo'); lmed.append(el('small', null, 'Nível (clique em Testar e fale)'), med, aviso2);
      grade.append(campo('Qual microfone', sel), lvol, lmed); box.append(grade);
      const chaves = el('div', 'mic-chaves');
      const chave = (k, rot, dica) => { const l = el('label', 'chave'), i = el('input'); i.type = 'checkbox'; i.checked = !!c[k]; l.title = dica; l.append(i, el('span', 'trilho'), el('span', null, rot));
        i.onchange = () => { if (k === 'monitor' && i.checked) faixa('Use fone de ouvido: sem fone, o som da caixa volta para o microfone (microfonia).', null, true); this.muda(k, i.checked, box, bT); }; return l; };
      chaves.append(chave('ruido', 'Redução de ruído', 'Tira chiado e barulho de fundo'), chave('eco', 'Cancelar eco', 'Tira o eco do som que sai das caixas'), chave('agc', 'Volume automático', 'O navegador ajusta o volume sozinho'), chave('monitor', 'Ouvir a minha voz', 'Você se escuta enquanto testa e grava (use fone)'));
      // MAIS CONFIGURAÇÕES
      const mais = el('div', 'mic-sub'), lm = el('div', 'mic-linha'); mais.append(el('small', null, 'Mais configurações'));
      const seg = el('div', 'seg'); [['normal', 'Normal'], ['alta', 'Alta'], ['max', 'Máxima']].forEach(([k, t]) => { const b = bt(t, c.qual === k ? 'on' : '', () => { this.muda('qual', k, box, bT); $$('button', seg).forEach(x => x.classList.toggle('on', x === b)); }); seg.append(b); });
      const lq = el('span', 'mic-campo'); lq.append(el('small', null, 'Qualidade da gravação'), seg);
      lm.append(lq, chave('grave', 'Filtro de graves', 'Tira ronco, vento e batidas no microfone (corta abaixo de 80 Hz)'), chave('comp', 'Compressor', 'Deixa o volume mais igual entre partes baixas e altas'), chave('conta', 'Contagem 3, 2, 1', 'Conta antes de começar a gravar'));
      mais.append(lm); box.append(chaves, mais, el('p', 'dica', 'Dica: lugar quieto, celular longe, e a boca a um palmo do microfone. Você pode ouvir e regravar quantas vezes quiser antes de enviar.'));
      this._med = { barra, pico, aviso2 };
    },
    muda(k, v, box, bT) { this.salva({ ...this.cfg(), [k]: v }); if (this.teste) { this.paraTeste(); this.testa(box, bT); } },
    async testa(box, bT) { try { const m = await this.abre(), buf = new Uint8Array(m.an.fftSize), { barra, pico, aviso2 } = this._med; let raf;
        const anda = () => { const n = this.nivel(m.an, buf); barra.style.width = Math.min(100, n.rms * 300) + '%'; pico.style.left = Math.min(100, n.pico * 100) + '%'; aviso2.textContent = n.pico > .97 ? 'Muito alto: baixe o volume ou se afaste um pouco.' : ''; raf = requestAnimationFrame(anda); }; anda();
        this.teste = { m, para: () => { cancelAnimationFrame(raf); m.fecha(); barra.style.width = '0'; aviso2.textContent = ''; } }; bT.lastChild.textContent = 'Parar o teste'; }
      catch { faixa('Não consegui usar o microfone. Confira se ele está ligado e permitido.'); } },
  };

  async function inicia() {
    if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) faixa('Este navegador não grava áudio. Use o Chrome, o Edge ou o Firefox atualizados (dá para usar "Arquivo").');
    if (!/^[A-Za-z0-9_-]{43}$/.test(tok)) return aviso('Link incompleto', 'Abra o link exatamente como você recebeu (com tudo depois do "#").', 'erro');
    try { S.d = await api('ver'); } catch (e) { return aviso('Não deu para abrir', e.message, 'erro'); }
    if (S.d.quem?.conta) S.nome = S.d.quem.nome;
    $('#sub').textContent = (S.d.roteiro || 'Roteiro') + (S.d.rotulo ? ' · ' + S.d.rotulo : '');
    const t = $('#tempo'); const pintaT = () => { if (!S.d.expira) { t.textContent = 'sem prazo'; return; } const f = S.d.expira - Date.now(); t.textContent = f > 0 ? 'vale mais ' + Math.max(1, Math.round(f / 60000)) + ' min' : 'o link venceu'; };
    pintaT(); setInterval(pintaT, 30000);
    pinta();
  }
  const passo = (n, titulo, sub) => { const s = el('section', 'passo'), h = el('div', 'passo-cab'); h.append(el('span', 'passo-n', String(n)), el('h2', null, titulo)); if (sub) h.append(el('small', null, sub)); s.append(h); return s; };

  function pinta() {
    const d = S.d, rolagem = scrollY; app.replaceChildren();
    // 1 · QUEM GRAVA
    const p1 = passo(1, 'quem está gravando');
    if (d.quem?.conta) { const c = el('div', 'conta'); c.append('Gravando como ', el('b', null, d.quem.nome), ' (conta do Estúdio).'); p1.append(c); }
    else { const i = el('input', 'nome'); i.type = 'text'; i.maxLength = 40; i.placeholder = 'Escreva o seu nome'; i.value = S.nome; i.autocomplete = 'name';
      i.oninput = () => { S.nome = i.value.replace(/[<>"'`\\{}]/g, ''); try { localStorage.setItem('ep-dublar-nome', S.nome); } catch { } };
      p1.append(i, el('p', 'dica', 'Sem conta do Estúdio: as gravações ficam com o nome que você escrever.')); }
    app.append(p1);
    // 2 · MICROFONE
    const p2 = passo(2, 'microfone', 'escolher, testar, filtros e volume'), mic = el('div', 'mic'); p2.append(mic); app.append(p2); MIC.pinta(mic);
    // 3 · FALAS
    const n = d.falas.length, env = Object.keys(d.enviadas || {}).length, aqui = d.falas.filter(f => S.loc.has(f.id)).length;
    const p3 = passo(3, 'falas', `${env} de ${n} enviada${n === 1 ? '' : 's'}${aqui ? ` · ${aqui} gravada${aqui === 1 ? '' : 's'} aqui (falta enviar)` : ''}`);
    const prog = el('div', 'prog'), pi = el('i'), pa = el('i', 'aqui'); pi.style.width = (n ? env / n * 100 : 0) + '%'; pa.style.width = (n ? aqui / n * 100 : 0) + '%'; prog.append(pi, pa); p3.append(prog);
    if (window.Cortes && n > 1) { const ac = el('div', 'acoes'), paraC = f => ({ id: f.id, rotulo: f.voce || f.personagem, texto: f.texto, nota: f.nota, junto: (f.juntoCom || []).map(x => x.nome).join(', ') });
      const recebe = ps => { for (const x of ps) poeLocal(x.fala, x.blob, x.duracao); };
      ac.append(btI('mic', 'Gravar tudo em sequência', '', async () => { MIC.paraTeste(); try { await Cortes.sequencia({ falas: d.falas.map(paraC), abreMic: async () => { const m = await MIC.abre(); return { stream: m.dest.stream, fecha: m.fecha }; }, aoTerminar: async (blob, tr) => { const R = await Cortes.paraRevisao(blob, tr, d.falas.map(f => f.id)); Cortes.revisao({ dados: R.dados, falas: d.falas.map(paraC), marcas: R.marcas, dono: R.quem.map(id => d.falas.findIndex(f => f.id === id)), titulo: 'Revisar a gravação', aviso: 'Os cortes são os Enter que você apertou. Arraste para acertar.', aoSalvar: recebe }); } }); } catch (e) { faixa(e.message); } }, 'Uma fala atrás da outra: Enter passa para a próxima'),
        btI('up', 'Subir um áudio com várias falas', '', () => { const i = el('input'); i.type = 'file'; i.accept = ACEITA; i.onchange = async () => { const a = i.files[0]; if (!a) return; if (a.size > 200 * 1048576) return faixa('Esse arquivo é grande demais (máx. 200 MB).');
          try { const A = await Cortes.decodifica(a), marcas = Cortes.silencios(A, d.falas.length); await Cortes.revisao({ dados: A, blob: a, falas: d.falas.map(paraC), marcas, titulo: 'Separar o áudio nas falas', aviso: Cortes.avisoPausas(marcas, d.falas.length), aoSalvar: recebe }); } catch (e) { faixa(e.message); } }; i.click(); }, 'Um arquivo com todas as falas em sequência: a página separa em cada fala'));
      p3.append(ac); }
    d.falas.forEach((f, i) => p3.append(cartao(f, i + 1)));
    app.append(p3);
    // RODAPÉ: progresso + Terminei
    const fim = el('div', 'fim'), txt = el('span', 'fim-t', aqui ? `${aqui} gravação(ões) ainda não enviada(s): "Terminei" envia tudo.` : env === n ? 'Tudo enviado. Clique em "Terminei".' : `${n - env} fala(s) sem gravação.`);
    const bf = btI('ok', 'Terminei', 'pri', termina, 'Avisa que você acabou. O que ainda não foi enviado é enviado antes.'); fim.append(txt, bf); app.append(fim);
    scrollTo(0, rolagem);
  }

  function cartao(f, num) {
    const d = S.d, c = el('article', 'fala'), loc = S.loc.get(f.id), env = d.enviadas?.[f.id], gravando = S.rec?.f === f.id;
    c.classList.add(gravando ? 'gravando' : loc ? 'local' : env ? 'enviada' : 'nova');
    const cab = el('div', 'fala-cab'); cab.append(el('span', 'fala-n', String(num)), el('span', 'quem', f.voce || f.personagem));
    if (f.parte) cab.append(el('span', 'parte', f.parte)); cab.append(el('span', 'esp'), el('span', 'chip ' + (gravando ? 'rec' : loc ? 'aq' : env ? 'ok' : ''), gravando ? '● gravando' : loc ? `gravada aqui · ${tempo(loc.dur)}` : env ? `✓ enviada · ${tempo(env.dur)}` : 'sem gravação')); c.append(cab);
    if (f.antes) { const a = el('div', 'antes'); a.append(el('b', null, f.antes.personagem + ': '), f.antes.texto); c.append(a); }
    if (f.voce) c.append(el('div', 'nota', 'Fala de vários: grave só a parte de ' + f.voce + '.'));
    if (f.juntoCom?.length) { const j = el('div', 'junto'); j.append(el('span', null, 'Dita ao MESMO TEMPO que:'));
      for (const o of f.juntoCom) { const p = el('span', 'jp'); p.append(el('b', null, o.nome)); if (o.tem) { p.append(bt('▶ Ouvir', 'mini', async () => { try { const a = await outro(f, o); S.tocando?.pause(); S.tocando = a; a.play(); } catch (e) { faixa(e.message, f.id); } }), bt('Gravar ouvindo ' + o.nome, 'mini', () => grava(f, o))); } else p.append(el('small', null, '(ainda sem gravação aceita)')); j.append(p); }
      c.append(j); }
    if (f.nota) c.append(el('div', 'nota', f.nota)); c.append(el('div', 'texto', f.texto));
    if (gravando) { const nv = el('div', 'nivel-rec'), i = el('i'); nv.append(i); c.append(nv); S.rec.barra = i; }
    if (loc) c.append(player(loc));
    const l = el('div', 'fala-bts');
    const gr = btI('mic', gravando ? 'Parar' : loc || env ? 'Regravar' : 'Gravar', 'rec ' + (gravando ? 'on' : loc || env ? 'neutro' : ''), () => grava(f), gravando ? 'Parar a gravação' : 'Gravar esta fala');
    l.append(gr, btI('up', 'Arquivo', '', () => sobe(f), 'Usar um arquivo já gravado (mp3, wav, mpeg, vídeo…)'));
    if (loc) l.append(btI('env', 'Enviar', 'pri', e => envia(f, e.currentTarget)), btI('lixo', '', 'apagar', () => apaga(f), 'Apagar esta gravação'));
    c.append(l); return c;
  }
  async function apaga(f) { if (!confirm('Apagar esta gravação? Isso não dá para desfazer.')) return; const v = S.loc.get(f.id); if (v) URL.revokeObjectURL(v.url); S.loc.delete(f.id); pinta(); }

  // PLAYER: play/pause, barra para ir a qualquer ponto e tempo; no fim volta para o começo
  function player(loc) {
    const p = el('div', 'player'), a = new Audio(loc.url), b = bt('▶', 'tocar'), r = el('input'), t = el('span', 't', '0:00 / ' + tempo(loc.dur));
    r.type = 'range'; r.min = 0; r.max = 1000; r.value = 0; r.setAttribute('aria-label', 'Posição do áudio');
    b.onclick = () => { if (a.paused) { S.tocando?.pause(); S.tocando = a; a.play(); } else a.pause(); };
    a.onplay = () => { b.textContent = '❚❚'; }; a.onpause = () => { b.textContent = '▶'; }; a.onended = () => { b.textContent = '▶'; a.currentTime = 0; r.value = 0; };
    a.ontimeupdate = () => { const du = isFinite(a.duration) ? a.duration : loc.dur; if (du) { r.value = Math.round(a.currentTime / du * 1000); t.textContent = tempo(a.currentTime) + ' / ' + tempo(du); } };
    r.oninput = () => { const du = isFinite(a.duration) ? a.duration : loc.dur; if (du) a.currentTime = r.value / 1000 * du; };
    p.append(b, r, t); return p;
  }
  // a gravação ACEITA do outro personagem desta fala (o servidor só deixa essa, e só por este link)
  async function outro(f, o) { let r; try { r = await fetch('/dublar/api/ouvir?fala=' + encodeURIComponent(f.id) + '&de=' + encodeURIComponent(o.k), { headers: { 'x-dub-token': tok }, cache: 'no-store' }); } catch { throw new Error('Sem conexão.'); }
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error?.message || 'Não deu para ouvir.'); } return new Audio(URL.createObjectURL(await r.blob())); }
  async function grava(f, ouvindo) {
    if (S.rec) { const era = S.rec.f === f.id; S.rec.parar(); if (era) return; }
    let guia = null; if (ouvindo?.k) { try { guia = await outro(f, ouvindo); } catch (e) { return faixa(e.message, f.id); } faixa('Use fone de ouvido: assim o áudio de ' + ouvindo.nome + ' não entra na sua gravação.', null, true); }
    MIC.paraTeste();
    let m; try { m = await MIC.abre(); } catch { return faixa('Não consegui usar o microfone. Veja o passo 2 (microfone) aqui em cima.'); }
    if (MIC.cfg().conta) await contagem();
    const tipo = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => window.MediaRecorder?.isTypeSupported?.(t)) || '';
    const mr = new MediaRecorder(m.dest.stream, { ...(tipo ? { mimeType: tipo } : {}), audioBitsPerSecond: MIC.kbps() }), ped = [], t0 = performance.now(), buf = new Uint8Array(m.an.fftSize);
    const lim = setTimeout(() => S.rec?.parar(), (S.d.maxSeg || 120) * 1000); let raf;
    const anda = () => { if (S.rec?.barra) { const n = MIC.nivel(m.an, buf); S.rec.barra.style.width = Math.min(100, n.rms * 300) + '%'; } raf = requestAnimationFrame(anda); };
    mr.ondataavailable = e => e.data.size && ped.push(e.data);
    mr.onstop = () => { clearTimeout(lim); cancelAnimationFrame(raf); m.fecha(); S.rec = null; const dur = (performance.now() - t0) / 1000;
      if (dur < 0.4) return pinta(); const blob = new Blob(ped, { type: mr.mimeType || tipo || 'audio/webm' }); poeLocal(f.id, blob, dur); };
    mr.start(250); if (guia) { guia.currentTime = 0; guia.play().catch(() => { }); } // começam juntos
    S.rec = { f: f.id, parar: () => { try { guia?.pause(); mr.stop(); } catch { } } }; pinta(); anda();
  }
  // 3, 2, 1 antes de gravar (com o microfone já aberto, para não cortar o começo)
  const contagem = () => new Promise(ok => { const o = el('div', 'conta3'), b = el('b', null, '3'); o.append(b); document.body.append(o); let n = 3; const t = setInterval(() => { n--; if (n <= 0) { clearInterval(t); o.remove(); ok(); } else b.textContent = String(n); }, 700); });
  const poeLocal = (id, blob, dur) => { const v = S.loc.get(id); if (v) URL.revokeObjectURL(v.url); S.loc.set(id, { blob, dur, url: URL.createObjectURL(blob) }); pinta(); };
  const ACEITA = 'audio/*,video/*,.mp3,.wav,.ogg,.oga,.opus,.m4a,.webm,.mpeg,.mpg,.mp2,.mpga,.flac,.aac,.wma,.amr,.3gp,.mov,.mp4,.mkv,.avi';
  function sobe(f) {
    const i = el('input'); i.type = 'file'; i.accept = ACEITA;
    i.onchange = async () => { const a = i.files[0]; if (!a) return; if (a.size > 200 * 1048576) return faixa('Esse arquivo passa de 200 MB.', f.id);
      if (window.Cortes) { try { const A = await Cortes.decodifica(a), b = await Cortes.comprime(A); if (b.size > (S.d.maxMb || 20) * 1048576) return faixa('Esse áudio ficou grande demais (máx. 20 MB). Corte em pedaços menores.', f.id); return poeLocal(f.id, b, A.d.length / A.sr); } catch (e) { return faixa('Não consegui ler esse arquivo: ' + e.message, f.id); } }
      let dur = 0; try { const ac = new OfflineAudioContext(1, 2, 44100); dur = (await ac.decodeAudioData(await a.arrayBuffer())).duration; } catch { return faixa('Não consegui ler esse arquivo como áudio (use mp3, wav, ogg, m4a ou webm).', f.id); }
      poeLocal(f.id, a, dur); };
    i.click();
  }
  async function envia(f, b) {
    if (!S.d.quem?.conta && !(S.nome || '').trim()) { faixa('Escreva o seu nome no passo 1 antes de enviar.', null, true); $('input.nome')?.focus(); return false; }
    const v = S.loc.get(f.id); if (!v) return true; if (b) { b.disabled = true; b.lastChild.textContent = 'Enviando…'; }
    try { await api('enviar?fala=' + encodeURIComponent(f.id) + '&dur=' + (Math.round(v.dur * 100) / 100), { method: 'POST', body: v.blob, headers: { 'content-type': 'application/octet-stream' } });
      URL.revokeObjectURL(v.url); S.loc.delete(f.id); S.d.enviadas = { ...(S.d.enviadas || {}), [f.id]: { em: Date.now(), dur: v.dur } }; pinta(); return true; }
    catch (e) { faixa('O envio falhou: ' + e.message, f.id); if (b) { b.disabled = false; b.lastChild.textContent = 'Enviar'; } return false; }
  }
  async function termina(e) {
    const b = e.currentTarget, falta = S.d.falas.filter(f => !S.loc.has(f.id) && !S.d.enviadas?.[f.id]).length;
    if (falta && !confirm(`${falta} fala${falta === 1 ? '' : 's'} ainda sem gravação. Terminar mesmo assim?`)) return;
    b.disabled = true; b.lastChild.textContent = 'Enviando…';
    for (const f of S.d.falas) if (S.loc.has(f.id) && !(await envia(f))) { b.disabled = false; b.lastChild.textContent = 'Terminei'; return; }
    try { await api('terminar', { method: 'POST' }); } catch (er) { faixa(er.message); b.disabled = false; b.lastChild.textContent = 'Terminei'; return; }
    MIC.paraTeste(); aviso('Pronto, obrigado!', 'As gravações foram enviadas para a equipe. Pode fechar esta aba.', 'ok');
    setTimeout(() => { try { window.close(); } catch { } }, 1200); // o navegador só deixa fechar abas abertas por script; se não fechar, fica o aviso
  }
  window.Cortes?.aoAvisar?.(t => { if (t) faixa(t, null, true); else $('.faixa-erro')?.remove(); });
  addEventListener('beforeunload', e => { if (S.loc.size) { e.preventDefault(); e.returnValue = ''; } });
  inicia();
})();
