/* ===================== inteiro.js — PÔR O ÁUDIO INTEIRO (Preparativos) =====================
   A pessoa solta um ou mais áudios inteiros (um por personagem ou um com todos) e o programa acha cada fala do roteiro sozinho:
   Whisper no navegador + alinhar + apara pela energia do ARQUIVO ORIGINAL (motor comum /estudio-edicao.js, o mesmo do Shorts e do Animador).
   Nada é limpo nem normalizado. Cada fala ganha o PRÓPRIO arquivo (um WAV do trecho, com as folgas), como uma gravação comum, e além disso
   f.fonte = { audio: <chave do áudio inteiro, subido uma vez>, ini, dur, de: <chave do trecho> }, f.auto = true e f.aviso = [...].
   O Animador usa f.fonte (o áudio inteiro com ini/dur, corte não destrutivo) enquanto fonte.de === f.audio; regravou = volta o trecho próprio.
   Carregado na hora pelo app.js (botão "Pôr o áudio inteiro" na aba Falas). Usa o que o app.js deixa no escopo global:
   S, Falas, Nuvem, DB, Roteiro, Cortes, aviso, pergunta, ic, esc, h, ava, giro, tempo, pode, coresDoRoteiro, salvaPrep, marcaSujo. */
'use strict';
const Inteiro = {
  /* o motor comum vem do porteiro (/estudio-edicao.js); só carrega na primeira vez */
  motor() { if (window.EstudioEdicao) return Promise.resolve(window.EstudioEdicao);
    return this._m || (this._m = new Promise((ok, no) => { const s = document.createElement('script'); s.src = '/estudio-edicao.js'; s.onload = () => window.EstudioEdicao ? ok(window.EstudioEdicao) : no(new Error('o motor de edição não carregou'));
      s.onerror = () => { this._m = null; no(new Error('Não consegui carregar o motor de edição. Confira a internet e tente de novo.')); }; document.head.append(s); })); },
  css() { if (document.getElementById('ai-css')) return; const s = document.createElement('style'); s.id = 'ai-css'; s.textContent = `
.ai-veu{position:fixed;inset:0;z-index:86;background:var(--veu,rgba(0,0,0,.45));backdrop-filter:blur(4px)}
.ai-pn{position:fixed;top:0;right:0;bottom:0;z-index:87;width:min(460px,100vw);display:flex;flex-direction:column;background:var(--elevado,var(--panel));color:var(--texto,var(--text));border-left:1px solid var(--linha,var(--line));box-shadow:var(--sombra-3,0 24px 70px rgba(0,0,0,.55));animation:ai-entra var(--painel,.35s) var(--curva-entra,cubic-bezier(.1,.9,.2,1))}
@keyframes ai-entra{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.ai-pn{animation:none}}
.ai-topo{height:52px;flex:none;display:flex;align-items:center;gap:8px;padding:0 8px 0 16px;border-bottom:1px solid var(--linha,var(--line))}
.ai-topo b{font-size:17px;font-weight:600;flex:1}
.ai-x{width:44px;height:44px;border:0;border-radius:var(--raio-controle,8px);background:transparent;color:var(--texto-2,var(--muted));cursor:pointer;display:grid;place-items:center}
.ai-x:hover{background:var(--fundo-4,var(--panel-3))}
.ai-corpo{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.ai-corpo>p{margin:0;color:var(--texto-2,var(--muted));font-size:14px;line-height:1.45}
.ai-rod{flex:none;display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--linha,var(--line))}
.ai-rod .bt,.ai-arq select,.ai-ouvir{min-height:44px}
.ai-arq{display:flex;flex-direction:column;gap:8px;padding:12px;border:1px solid var(--linha,var(--line));border-radius:var(--raio-cartao,12px);background:var(--fundo-2,var(--panel-2))}
.ai-arq b{font-size:14px;word-break:break-all}.ai-arq small{color:var(--texto-3,var(--muted));font-size:12px}
.ai-arq label{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--texto-2,var(--muted))}
.ai-arq select{border-radius:var(--raio-controle,8px);border:1px solid var(--linha-forte,var(--line));background:var(--fundo-2,var(--panel));color:var(--texto,var(--text));padding:0 10px;font:inherit}
.ai-passo{display:flex;flex-direction:column;align-items:center;gap:12px;padding:32px 8px;text-align:center;color:var(--texto-2,var(--muted))}
.ai-barra{width:200px;height:4px;border-radius:2px;background:var(--fundo-3,var(--panel-3));overflow:hidden}.ai-barra i{display:block;height:100%;width:0;background:var(--acento,var(--accent));transition:width .2s}
.ai-res{font-size:13px;color:var(--texto-2,var(--muted))}
.ai-f{display:grid;grid-template-columns:44px 1fr;gap:4px 10px;align-items:start;padding:10px 0;border-bottom:1px solid var(--linha,var(--line))}
.ai-f:last-child{border-bottom:0}
.ai-ouvir{width:44px;border-radius:50%;border:1px solid var(--linha-forte,var(--line));background:var(--fundo-3,var(--panel-3));color:var(--texto,var(--text));display:grid;place-items:center;cursor:pointer}
.ai-ouvir:hover{background:var(--fundo-4,var(--panel-3))}.ai-ouvir[disabled]{opacity:.4;cursor:default}
.ai-ouvir.on{background:var(--acento,var(--accent));color:var(--acento-tx,#04223a);border-color:transparent}
.ai-txt{min-width:0;font-size:14px;line-height:1.4}.ai-txt b{font-weight:600;margin-right:4px}
.ai-meta{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:4px;font-size:12px;color:var(--texto-3,var(--muted))}
.ai-usa{display:flex;align-items:center;gap:8px;min-height:44px;font-size:13px;color:var(--texto-2,var(--muted));cursor:pointer}
.ai-usa input{width:18px;height:18px;accent-color:var(--acento,var(--accent))}
.ai-ja{color:var(--texto-3,var(--muted))}
`; document.head.append(s); },

  /* painel na lateral direita (regra de janelas do sistema Celeste): título + X em cima, corpo que rola, ações embaixo */
  painel(titulo) { this.css(); this.fecha?.(); const veu = h('<div class="ai-veu"></div>'), pn = h(`<aside class="ai-pn" role="dialog" aria-modal="true" aria-label="${esc(titulo)}"><div class="ai-topo"><b>${esc(titulo)}</b><button class="ai-x" title="Fechar" aria-label="Fechar">${ic('mais', 18).replace('<svg', '<svg style="transform:rotate(45deg)"')}</button></div><div class="ai-corpo"></div><div class="ai-rod"></div></aside>`);
    let aoFechar = null; const tecla = e => { if (e.key === 'Escape' && !this.ocupado) fecha(); };
    const fecha = () => { if (this.ocupado) return; this.para(); veu.remove(); pn.remove(); removeEventListener('keydown', tecla); this.fecha = null; aoFechar?.(); };
    veu.onclick = fecha; $('.ai-x', pn).onclick = fecha; addEventListener('keydown', tecla); document.body.append(veu, pn); this.fecha = fecha;
    return { pn, corpo: $('.ai-corpo', pn), rod: $('.ai-rod', pn), fecha, aoFechar: f => { aoFechar = f; } }; },

  /* ---------- 1) escolher os arquivos e de quem é cada um ---------- */
  async abre() {
    const P = S.P; if (!P) return;
    if (P.novo || !P.mod) return aviso('Mande o roteiro para a nuvem primeiro (botão "Mandar para a nuvem" lá em cima).', 'info', 6000);
    const inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true; inp.accept = 'audio/*,video/*,.mp3,.wav,.ogg,.oga,.opus,.m4a,.webm,.mpeg,.mpg,.flac,.aac,.mp4,.mov';
    inp.onchange = () => { const arqs = [...inp.files].filter(a => a.size <= 200 * 1048576); if (arqs.length < inp.files.length) aviso('Arquivo com mais de 200 MB ficou de fora.', 'erro'); if (arqs.length) this.deQuem(arqs); };
    inp.click();
  },
  deQuem(arqs) {
    const ps = Roteiro.personagens(S.P.partes); if (!ps.length) return aviso('Ainda não há falas no roteiro.', 'info');
    const W = this.painel('Pôr o áudio inteiro');
    W.corpo.innerHTML = `<p>Escolha de quem é cada áudio. O programa ouve o áudio, acha cada fala do roteiro e mostra a lista para você conferir antes de guardar.</p>
      ${arqs.map((a, i) => { const sug = Falas.pelaNomeArq(a.name, ps); return `<div class="ai-arq"><b>${esc(a.name)}</b><small>${(a.size / 1048576).toFixed(1).replace('.', ',')} MB</small>
        <label>De quem é este áudio?<select data-q="${i}"><option value="">Todos (vários personagens, na ordem do roteiro)</option>${ps.map(p => `<option value="${esc(p.chave)}" ${sug?.chave === p.chave ? 'selected' : ''}>${esc(p.nome)} (${p.n} fala${p.n === 1 ? '' : 's'})</option>`).join('')}</select></label></div>`; }).join('')}`;
    W.rod.innerHTML = `<button class="bt" data-c>Cancelar</button><button class="bt pri" data-ok>${ic('ok', 15)} Achar as falas</button>`;
    $('[data-c]', W.rod).onclick = W.fecha;
    $('[data-ok]', W.rod).onclick = () => this.analisa(W, arqs.map((arq, i) => ({ arq, quem: $(`[data-q="${i}"]`, W.corpo).value })));
  },

  /* ---------- 2) ouvir e achar as falas (nada é guardado ainda) ---------- */
  async analisa(W, itens) {
    const passo = (t, p) => { W.corpo.innerHTML = `<div class="ai-passo">${giro()}<span>${esc(t)}</span><div class="ai-barra"><i style="width:${Math.round((p || 0) * 100)}%"></i></div></div>`; };
    W.rod.innerHTML = ''; this.ocupado = true; const todas = S.P.partes.flatMap(p => p.falas), achados = new Map(); // fala (id + versão) → resultado
    try {
      passo('Abrindo o motor de edição…', 0); const E = await this.motor();
      for (const [n, it] of itens.entries()) {
        const pre = itens.length > 1 ? `Áudio ${n + 1} de ${itens.length}: ` : '';
        passo(pre + 'lendo o arquivo…', n / itens.length);
        const A = await Cortes.decodifica(it.arq); it.A = A;
        const buf = new AudioBuffer({ length: Math.max(1, A.d.length), numberOfChannels: 1, sampleRate: A.sr }); buf.copyToChannel(A.d, 0);
        // as falas deste áudio, na ordem do roteiro (personagem escolhido = só as dele; fala de vários = a versão dele)
        const alvo = todas.filter(f => !it.quem || Roteiro.quem(f).includes(it.quem));
        if (!alvo.length) continue;
        const falas = alvo.map(f => ({ quem: it.quem || Roteiro.chave(f.personagem), texto: f.texto, nota: f.nota || '' }));
        passo(pre + 'procurando as falas e as pausas…', n / itens.length); await new Promise(r => setTimeout(r, 30));
        const mp = E.voz.mapa(buf), dec = E.voz.decupar(buf, falas); if (!mp.blobs.length) { aviso(`Não achei voz em "${it.arq.name}".`, 'erro', 7000); continue; }
        let al = null, ouv = null;
        try { ouv = await E.whisper.transcrever(buf, pg => { const t = E.whisper.frase(pg); if (t) passo(pre + t, (n + (pg.st === 'asr' ? (pg.i + 1) / Math.max(1, pg.n) : 0)) / itens.length); });
          if (ouv?.length) al = E.voz.alinhar(ouv, mp.blobs, falas); }
        catch (e) { aviso(`O reconhecedor de fala não rodou (${e.message || e}). Cortei pelas pausas e pelo tamanho do texto: confira cada fala.`, 'erro', 9000); }
        let cortes = alvo.map((f, i) => al?.cortes[i] || dec?.cortes?.[i] || null);
        cortes = E.voz.apara(cortes, buf, null, al?.viz);
        const conf = E.voz.confere(buf, cortes, alvo.map(f => f.texto), dec?.aviso, ouv), av = {}; conf.forEach(x => (av[x.i] ||= []).push(x.aviso));
        alvo.forEach((f, i) => { if (al && !al.cortes[i] && cortes[i]) (av[i] ||= []).push('o reconhecedor não ouviu esta fala (cortei pelas pausas)'); });
        alvo.forEach((f, i) => { const vez = it.quem && Falas.varios(f) ? it.quem : '', k = f.id + (vez ? '@' + vez : ''), c = cortes[i], nota = al ? al.notaFala[i] || 0 : 0.1;
          const r = { f, vez, it, c: c ? [+c[0].toFixed(2), +c[1].toFixed(2)] : null, aviso: [...new Set(av[i] || [])], nota };
          const velho = achados.get(k); if (!velho || (!velho.c && r.c) || (r.c && r.nota > velho.nota)) achados.set(k, r); }); // a mesma fala em dois áudios: fica a mais parecida com o texto
      }
    } catch (e) { this.ocupado = false; W.corpo.innerHTML = `<p>${esc(e.message || String(e))}</p>`; W.rod.innerHTML = '<button class="bt" data-c>Fechar</button>'; $('[data-c]', W.rod).onclick = W.fecha; return; }
    this.ocupado = false;
    this.lista(W, [...achados.values()].sort((a, b) => todas.indexOf(a.f) - todas.indexOf(b.f)));
  },

  /* ---------- 3) lista para conferir: ouvir SÓ o trecho, aviso em amarelo, escolher o que entra ---------- */
  lista(W, rs) {
    const cs = coresDoRoteiro(), temAudio = r => !!(r.vez ? r.f.audios?.[r.vez]?.audio : r.f.audio) || !!Falas._loc?.has(r.f.id + (r.vez ? '@' + r.vez : ''));
    const achadas = rs.filter(r => r.c).length, comAviso = rs.filter(r => r.c && r.aviso.length).length;
    W.corpo.innerHTML = `<p class="ai-res">Achei <b>${achadas}</b> de <b>${rs.length}</b> falas${comAviso ? ` · <b>${comAviso}</b> com aviso para conferir` : ''}. Ouça cada uma; desmarque o que não deve entrar.</p>
      <div>${rs.map((r, i) => { const nome = r.vez ? (r.f.personagens?.find(p => Roteiro.chave(p) === r.vez) || r.vez) : r.f.personagem, cor = cs.get(Roteiro.chave(nome)) || 'var(--texto-2)';
        const avs = r.c ? r.aviso : ['não achei esta fala no áudio: ela fica sem áudio'];
        return `<div class="ai-f"><button class="ai-ouvir" data-ouvir="${i}" ${r.c ? '' : 'disabled'} title="${r.c ? 'Ouvir só este trecho' : 'Sem trecho'}" aria-label="Ouvir só este trecho">${ic('play', 16)}</button>
          <div class="ai-txt"><b style="color:${cor}">${esc(nome)}</b>${esc(r.f.texto)}
            <div class="ai-meta">${r.c ? `<span>${tempo(r.c[0])} → ${tempo(r.c[1])} (${tempo(r.c[1] - r.c[0])})</span>` : ''}${temAudio(r) ? '<span class="ai-ja">· já tem áudio</span>' : ''}${avs.map(a => `<span class="ai-av">${ic('alerta', 12)} ${esc(a)}</span>`).join('')}</div>
            ${r.c ? `<label class="ai-usa"><input type="checkbox" data-usa="${i}" checked> Usar este trecho</label>` : ''}</div></div>`; }).join('')}</div>`;
    W.rod.innerHTML = `<button class="bt" data-c>Cancelar</button><button class="bt pri" data-ok>${ic('ok', 15)} Pôr nas falas</button>`;
    const conta = () => { const n = $$('[data-usa]:checked', W.corpo).length, b = $('[data-ok]', W.rod); b.innerHTML = `${ic('ok', 15)} Pôr em ${n} fala${n === 1 ? '' : 's'}`; b.disabled = !n; }; conta();
    W.corpo.onchange = conta; $('[data-c]', W.rod).onclick = W.fecha;
    $$('[data-ouvir]', W.corpo).forEach(b => b.onclick = () => this.ouve(rs[+b.dataset.ouvir], b));
    $('[data-ok]', W.rod).onclick = async () => { const usar = $$('[data-usa]:checked', W.corpo).map(x => rs[+x.dataset.usa]); if (!usar.length) return;
      let fica = usar; const ja = usar.filter(temAudio);
      if (ja.length) { const r = await pergunta(`${ja.length} fala${ja.length === 1 ? ' já tem' : 's já têm'} áudio`, 'Trocar o áudio que elas já têm pelo trecho novo? O áudio antigo sai da nuvem (e a gravação ainda não enviada, deste computador).', [['Cancelar', null], ['Só as sem áudio', 'sem'], ['Trocar', 'trocar', 'pri']]);
        if (!r) return; if (r === 'sem') fica = usar.filter(x => !temAudio(x)); }
      if (!fica.length) return aviso('Nenhuma fala sem áudio na escolha.', 'info');
      this.guarda(W, fica); };
  },
  /* toca só [ini, fim] do áudio original (nada é cortado para ouvir) */
  para() { try { this.tocando?.s.stop(); } catch { } if (this.tocando) { this.tocando.b.classList.remove('on'); this.tocando.b.innerHTML = ic('play', 16); } this.tocando = null; },
  ouve(r, b) { const era = this.tocando?.b === b; this.para(); if (era || !r.c) return;
    const ctx = this.ctx || (this.ctx = new (window.AudioContext || window.webkitAudioContext)()), A = r.it.A, bf = ctx.createBuffer(1, A.d.length, A.sr); bf.copyToChannel(A.d, 0);
    const s = ctx.createBufferSource(); s.buffer = bf; s.connect(ctx.destination); s.onended = () => { if (this.tocando?.s === s) this.para(); };
    ctx.resume?.(); s.start(0, r.c[0], r.c[1] - r.c[0]); b.classList.add('on'); b.innerHTML = ic('parar', 16); this.tocando = { s, b }; },

  /* ---------- 4) guardar: o áudio inteiro sobe UMA vez; cada fala ganha o seu trecho (WAV do original) + f.fonte ---------- */
  async guarda(W, rs) {
    this.para(); const P = S.P, t36 = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 4), sobe = async (k, blob) => Nuvem.pede('/preparativos/arquivo?k=' + encodeURIComponent(k), { method: 'POST', headers: { 'content-type': blob.type || 'application/octet-stream' }, body: blob });
    W.rod.innerHTML = ''; this.ocupado = true; const passo = (t, p) => { W.corpo.innerHTML = `<div class="ai-passo">${giro()}<span>${esc(t)}</span><div class="ai-barra"><i style="width:${Math.round(p * 100)}%"></i></div></div>`; };
    const feitas = [];
    try {
      // o roteiro com mudanças só neste computador vai antes (as falas novas precisam existir na nuvem)
      if (S.sujo && (pode('roteiro') || pode('organizar'))) { passo('Mandando o roteiro para a nuvem…', 0); await salvaPrep(null, true); }
      const its = [...new Set(rs.map(r => r.it))];
      for (const [n, it] of its.entries()) { passo(its.length > 1 ? `Subindo o áudio inteiro ${n + 1} de ${its.length}…` : 'Subindo o áudio inteiro…', .05 + .3 * n / its.length);
        const ext = (String(it.arq.name).toLowerCase().match(/\.(mp3|wav|ogg|m4a|webm|opus|oga)$/) || [])[1], ex2 = ext === 'opus' || ext === 'oga' ? 'ogg' : ext;
        it.k = null;
        if (ex2 && it.arq.size <= 20 * 1048576) { const k = `preparativos/${P.id}/aud/inteiro-${t36()}.${ex2}`; try { await sobe(k, it.arq); it.k = k; } catch (e) { if (e.status !== 415 && e.status !== 413) throw e; } }
        if (!it.k) { const b = await Cortes.comprime(it.A), e2 = /ogg/.test(b.type) ? 'ogg' : 'wav', k = `preparativos/${P.id}/aud/inteiro-${t36()}.${e2}`; await sobe(k, b); it.k = k; } } // formato que a nuvem não aceita (ou grande demais): vai comprimido, com os mesmos tempos
      for (const [i, r] of rs.entries()) { passo(`Guardando o trecho de cada fala: ${i + 1} de ${rs.length}…`, .35 + .55 * i / rs.length);
        const A = r.it.A, i0 = Math.max(0, Math.floor(r.c[0] * A.sr)), i1 = Math.min(A.d.length, Math.ceil(r.c[1] * A.sr)), blob = Cortes.wav({ sr: A.sr, d: A.d.slice(i0, i1) });
        const k = `preparativos/${P.id}/aud/${r.f.id}-${t36()}.wav`; await sobe(k, blob);
        feitas.push({ r, k, dur: +((i1 - i0) / A.sr).toFixed(2) }); }
      passo('Ligando os áudios às falas…', .93);
      const resp = await Nuvem.acao({ acao: 'falas', id: P.id, falas: feitas.map(x => ({ id: x.r.f.id, ...(x.r.vez ? { de: x.r.vez } : {}), audio: x.k, duracao: x.dur })) });
      for (const x of feitas) { const f = Falas.acha(x.r.f.id) || x.r.f, ini = x.r.c[0], dur = +(x.r.c[1] - x.r.c[0]).toFixed(2); // a fala de AGORA (o salvar pode ter refeito as partes)
        if (x.r.vez) f.audios = { ...(f.audios || {}), [x.r.vez]: { audio: x.k, duracao: x.dur } };
        else { f.audio = x.k; f.duracao = x.dur; delete f.regravar; f.fonte = { audio: x.r.it.k, ini, dur, de: x.k }; f.auto = true; if (x.r.aviso.length) f.aviso = x.r.aviso; else delete f.aviso; }
        await DB.del('aud', P.id + '/' + f.id + (x.r.vez ? '@' + x.r.vez : '')).catch(() => { }); }
      if (!S.sujo) { P.mod = resp.mod || P.mod; S.base.mod = P.mod; } S.lista = null;
      // f.fonte / f.auto / f.aviso vão junto com o roteiro (a ação "falas" da nuvem só guarda o áudio e a duração)
      if (pode('roteiro') || pode('organizar')) { marcaSujo(); await salvaPrep(null, true); }
      else aviso('Os áudios foram para a nuvem. O começo de cada fala no áudio inteiro ficou só neste computador (sua conta não muda o roteiro).', 'info', 8000);
      this.ocupado = false; W.fecha(); aviso(`${feitas.length} fala${feitas.length === 1 ? '' : 's'} com áudio novo, cortado${feitas.length === 1 ? '' : 's'} do áudio inteiro.`, 'ok', 6000);
      pintaBarraPrep(); Falas.pinta(Falas.c);
    } catch (e) { this.ocupado = false; W.corpo.innerHTML = `<p>Parou no meio: ${esc(e.message || String(e))}</p><p>${feitas.length ? 'Os trechos que já subiram não foram ligados às falas; nada mudou no roteiro.' : 'Nada mudou no roteiro.'} Tente de novo.</p>`;
      W.rod.innerHTML = '<button class="bt" data-c>Fechar</button>'; $('[data-c]', W.rod).onclick = W.fecha; }
  },
};
window.Inteiro = Inteiro;
