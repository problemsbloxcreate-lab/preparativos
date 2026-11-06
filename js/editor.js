/* ===================== editor.js — a folha do roteiro =====================
   Uma folha branca editável (contenteditable). O TEXTO é a fonte de verdade (o mesmo formato de js/roteiro.js);
   a cada mudança a linha é pintada de novo pelo Roteiro.classifica: parte = título, nome do personagem na cor dele,
   *itálico* com marca-texto amarelo (ação / como falar; os * continuam no texto, só não aparecem), [cena] e // comentários.
   O que está na folha é EXATAMENTE o texto, então separar depois é só ler o texto.
   Colar de outro editor: o itálico de lá vira *itálico*, título 1 vira "# " e título 2/3 vira "## ".
   Mudanças pelo menu da seleção perguntam antes (o.confirma); o.aoPintar avisa depois de pintar (as páginas são montadas no app.js).
   Desfazer/refazer próprios (Ctrl+Z, Ctrl+Y / Ctrl+Shift+Z), Ctrl+I = itálico (ação). */
'use strict';
const Editor = (() => {
  const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // *itálico* e (nota) dentro da fala, com os sinais clarinhos
  const inline = t => esc(t).replace(/\*([^*\n]+)\*/g, '<span class="it"><span class="mk">*</span>$1<span class="mk">*</span></span>').replace(/\(([^)\n]{1,120})\)/g, '<span class="it">($1)</span>');
  function linhaHtml(o, cor) {
    const L = o.linha;
    if (o.t === 'v') return L ? `<div class="l v">${esc(L)}</div>` : '<div class="l v"><br></div>';
    if (o.t === 'h') { const m = L.match(/^(\s*#{1,6}\s*)(.*)$/); return `<div class="l h h${o.nivel || 2}">${m ? `<span class="mk">${esc(m[1])}</span>${esc(m[2])}` : esc(L)}</div>`; }
    if (o.t === 'f' && o.nomes) { const pedacos = o.nome.split(/(\s*(?:,|\+|&|\s+e\s+)\s*)/i).map((x, i) => i % 2 ? `<span class="nm-sep">${esc(x)}</span>` : x ? `<span class="nm" style="--c:${cor(x.trim())}">${esc(x)}</span>` : '').join('');
      return `<div class="l f varios" style="--c:${cor(o.nomes[0])}">${esc(o.pre)}${pedacos}<span class="dp">${inline(o.meio)}</span>${inline(o.resto)}</div>`; }
    if (o.t === 'f') return `<div class="l f" style="--c:${cor(o.nome)}">${esc(o.pre)}<span class="nm">${esc(o.nome)}</span><span class="dp">${inline(o.meio)}</span>${inline(o.resto)}</div>`;
    if (o.t === 'f2') return `<div class="l f2">${inline(L)}</div>`;
    if (o.t === 'a') { const m = L.match(/^(\s*)\*(.+)\*(\s*)$/); if (m) return `<div class="l a">${esc(m[1])}<span class="ac"><span class="mk">*</span>${esc(m[2])}<span class="mk">*</span></span>${esc(m[3])}</div>`; }
    return `<div class="l ${o.t}">${esc(L)}</div>`;
  }
  // texto colado de outro editor → roteiro: itálico vira *…*, títulos viram "## ", cada bloco uma linha
  function deHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html'); let out = '';
    const BLOCO = /^(P|DIV|LI|H[1-6]|TR|BLOCKQUOTE|PRE)$/;
    const anda = (n, it) => {
      if (n.nodeType === 3) { out += n.nodeValue.replace(/\n/g, ' '); return; }
      if (n.nodeType !== 1 || /^(STYLE|SCRIPT|META|TITLE)$/.test(n.tagName)) return;
      if (n.tagName === 'BR') { out += '\n'; return; }
      const st = n.getAttribute('style') || '', ehIt = !it && (/^(I|EM)$/.test(n.tagName) || /font-style:\s*italic/i.test(st)) && n.textContent.trim();
      const bloco = BLOCO.test(n.tagName); if (bloco && out && !out.endsWith('\n')) out += '\n';
      if (/^H[1-3]$/.test(n.tagName) && n.textContent.trim()) out += n.tagName === 'H1' ? '# ' : '## ';
      if (ehIt) out += '*'; for (const c of n.childNodes) anda(c, it || ehIt); if (ehIt) { out = out.replace(/(\s*)$/, '*$1'); }
      if (bloco && !out.endsWith('\n')) out += '\n';
    };
    anda(doc.body, false);
    return out.replace(/ /g, ' ').replace(/\*([ \t]*)\*/g, '$1').replace(/\n{3,}/g, '\n\n').replace(/\n$/, '');
  }

  function cria(raiz, o = {}) {
    const ed = document.createElement('div'); ed.className = 'folha-txt'; ed.contentEditable = o.somenteLer ? 'false' : 'true'; ed.spellcheck = true; ed.lang = 'pt-BR';
    ed.setAttribute('role', 'textbox'); ed.setAttribute('aria-multiline', 'true'); ed.setAttribute('aria-label', 'Roteiro');
    raiz.appendChild(ed);
    let texto = String(o.texto || '').replace(/\r/g, ''), info = [], hist = [{ t: texto, c: 0 }], hi = 0, tHist = 0, compondo = false;
    const cor = n => (o.cor ? o.cor(n) : '#3d9bff');
    // ---- texto do DOM: uma linha por bloco de cima ----
    const blocos = () => [...ed.childNodes].filter(n => !(n.nodeType === 3 && !n.nodeValue && ed.childNodes.length > 1));
    const textoDe = n => (n.nodeType === 3 ? n.nodeValue : n.nodeName === 'BR' ? '' : n.textContent).replace(/\n/g, '').replace(/ /g, ' ');
    function leDom() { const bs = blocos(); return bs.length ? bs.map(textoDe).join('\n') : ''; }
    function pos(no, off) { // posição no texto inteiro
      const bs = blocos(); if (no === ed) { let p = 0; for (let i = 0; i < Math.min(off, bs.length); i++) p += textoDe(bs[i]).length + 1; return off >= bs.length ? Math.max(0, p - 1) : p; }
      let b = no; while (b && b.parentNode !== ed) b = b.parentNode; const i = bs.indexOf(b); if (i < 0) return 0;
      let p = 0; for (let k = 0; k < i; k++) p += textoDe(bs[k]).length + 1;
      const r = document.createRange(); r.selectNodeContents(b); try { r.setEnd(no, off); } catch { return p; } return p + r.toString().replace(/\n/g, '').length;
    }
    function cursor() { const s = getSelection(); if (!s.rangeCount) return null; const r = s.getRangeAt(0); if (!ed.contains(r.startContainer)) return null; const a = pos(r.startContainer, r.startOffset), b = pos(r.endContainer, r.endOffset); return { a: Math.min(a, b), b: Math.max(a, b) }; }
    function ponto(p) { // posição → (nó, deslocamento)
      const bs = [...ed.children]; let i = 0; for (; i < bs.length; i++) { const n = bs[i].textContent.length; if (p <= n) break; p -= n + 1; }
      const b = bs[Math.min(i, bs.length - 1)]; if (!b) return [ed, 0]; if (i >= bs.length) p = b.textContent.length;
      const w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT), ns = []; let t; while ((t = w.nextNode())) ns.push(t);
      const esc0 = n => !!n.parentElement?.closest('.it .mk, .l.a .mk, .l.h .mk'); // sinais "*" e "#" que não aparecem
      for (let j = 0; j < ns.length; j++) { const n = ns[j], L = n.nodeValue.length;
        if (p < L) { if (p === 0 && esc0(n) && j > 0 && !esc0(ns[j - 1])) return [ns[j - 1], ns[j - 1].nodeValue.length]; return [n, p]; }
        if (p === L && (!esc0(n) || j === ns.length - 1)) return [n, L];
        p -= L; }
      return ns.length ? [ns[ns.length - 1], ns[ns.length - 1].nodeValue.length] : [b, 0];
    }
    // ---- OS "*" ESCONDIDOS (pedido da dona, 06/11): o cursor nunca fica "dentro" deles; Enter/Backspace/Delete agem no que se VÊ ----
    function linhaInfo(p) { const ini = texto.lastIndexOf('\n', p - 1) + 1, f0 = texto.indexOf('\n', p), fim = f0 < 0 ? texto.length : f0, i = texto.slice(0, ini).split('\n').length - 1, x = info[i] || {}, L = texto.slice(ini, fim), H = new Set();
      let vIni = ini, vFim = fim, acao = false, tit = false;
      if (x.t === 'h') { const m = L.match(/^(\s*#{1,6}\s*)/); if (m) { tit = true; vIni = ini + m[1].length; for (let q = ini; q < vIni; q++) H.add(q); } } // o "# " do título não aparece
      else if (x.t === 'a') { const m = L.match(/^(\s*)\*(.+)\*(\s*)$/); if (m) { acao = true; vIni = ini + m[1].length + 1; vFim = fim - m[3].length - 1; H.add(vIni - 1); H.add(vFim); } }
      else if (x.t === 'f' || x.t === 'f2') { const marca = (txt, base) => { for (const mm of txt.matchAll(/\*([^*\n]+)\*/g)) { H.add(base + mm.index); H.add(base + mm.index + mm[0].length - 1); } };
        if (x.t === 'f2') marca(L, ini); else { const b1 = ini + (x.pre || '').length + (x.nome || '').length; marca(x.meio || '', b1); marca(x.resto || '', b1 + (x.meio || '').length); } }
      return { ini, fim, vIni, vFim, acao, tit, H, i }; }
    const visivel = p => { const l = linhaInfo(p); return l.acao ? Math.max(l.vIni, Math.min(l.vFim, p)) : l.tit ? Math.max(l.vIni, p) : p; };
    function poeCursor(a, b = a) { const s = getSelection(), r = document.createRange(); const [n1, o1] = ponto(a), [n2, o2] = ponto(b); r.setStart(n1, o1); r.setEnd(n2, o2); s.removeAllRanges(); s.addRange(r); }
    // ---- pinta (só as linhas que mudaram) ----
    function pinta() {
      info = Roteiro.classifica(texto); const html = info.map(x => linhaHtml(x, cor));
      const fs = [...ed.childNodes];
      if (fs.length !== html.length || fs.some(n => n.nodeType !== 1)) { ed.innerHTML = html.join(''); [...ed.children].forEach((d, i) => { d._h = html[i]; }); }
      else html.forEach((h, i) => { const d = fs[i]; if (d._h !== h || d.textContent.replace(/ /g, ' ') !== info[i].linha) { const tp = document.createElement('template'); tp.innerHTML = h; const n = tp.content.firstElementChild; n._h = h; d.replaceWith(n); } });
      [...ed.children].forEach((d, i) => { d.dataset.i = i; }); o.aoPintar?.();
    }
    const avisa = () => { o.aoMudar?.(texto); o.aoMover?.(); };
    function guardaHist(c, junta) { clearTimeout(tHist); if (junta && hi === hist.length - 1 && hist[hi]._aberto) { hist[hi] = { t: texto, c, _aberto: true }; } else { hist = hist.slice(0, hi + 1); hist.push({ t: texto, c, _aberto: !!junta }); if (hist.length > 300) hist.shift(); hi = hist.length - 1; } tHist = setTimeout(() => { if (hist[hi]) hist[hi]._aberto = false; }, 800); }
    function troca(a, b, s, cAntes) { texto = texto.slice(0, a) + s + texto.slice(b); pinta(); poeCursor(a + s.length); guardaHist(a + s.length, false); avisa(); }
    function vaiHist(d) { const n = hi + d; if (n < 0 || n >= hist.length) return; hi = n; texto = hist[hi].t; pinta(); poeCursor(Math.min(hist[hi].c, texto.length)); avisa(); }
    // ---- eventos ----
    ed.addEventListener('compositionstart', () => { compondo = true; });
    ed.addEventListener('compositionend', () => { compondo = false; ed.dispatchEvent(new Event('input')); });
    ed.addEventListener('beforeinput', e => { if (/^format|^history/.test(e.inputType)) e.preventDefault(); });
    ed.addEventListener('input', () => { if (compondo) return; const c = cursor(); texto = leDom(); pinta(); if (c) poeCursor(c.a, c.b); guardaHist(c?.a || 0, true); avisa(); });
    let semFormato = false, ajustando = false;
    document.addEventListener('selectionchange', () => { if (ajustando || compondo || document.activeElement !== ed || o.somenteLer) return; const s0 = getSelection(); if (!s0.rangeCount || !s0.isCollapsed) return;
      const c = cursor(); if (!c) return; const v = visivel(c.a); if (v !== c.a) { ajustando = true; poeCursor(v); setTimeout(() => { ajustando = false; }, 0); } });
    const ehLinha = n => texto.split('\n')[n];
    function moveLinha(d) { const c = cursor(); if (!c) return; const ls = texto.split('\n'), i = texto.slice(0, c.a).split('\n').length - 1, j = i + d; if (j < 0 || j >= ls.length) return;
      const col = c.a - (texto.lastIndexOf('\n', c.a - 1) + 1); [ls[i], ls[j]] = [ls[j], ls[i]]; const nv = ls.join('\n'); texto = nv; pinta(); let pp = 0; for (let k = 0; k < j; k++) pp += ls[k].length + 1; poeCursor(pp + Math.min(col, ls[j].length)); guardaHist(pp, false); avisa(); }
    ed.addEventListener('keydown', e => {
      if (o.somenteLer) return; const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
      if (mod && e.key === '/') { e.preventDefault(); o.atalhos?.(); return; }
      if (e.altKey && e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); moveLinha(e.key === 'ArrowUp' ? -1 : 1); return; }
      if (mod && e.altKey && /^[012]$/.test(e.key)) { e.preventDefault(); const t = { 0: 'normal', 1: 'capitulo', 2: 'parte' }[e.key]; ed.dispatchEvent(new CustomEvent('estilo', { detail: t })); return; }
      if (mod && e.shiftKey && k === 'v') { semFormato = true; setTimeout(() => { semFormato = false; }, 800); return; } // colar sem formatação
      const c0 = cursor();
      // ENTER: na borda de uma ação, a linha nova nasce antes/depois dela; no meio, as DUAS partes continuam sendo ação
      if (e.key === 'Enter') { e.preventDefault(); if (!c0) return; if (c0.a !== c0.b) return troca(c0.a, c0.b, '\n');
        const p = visivel(c0.a), l = linhaInfo(p);
        if (l.acao) { if (p <= l.vIni) { texto = texto.slice(0, l.ini) + '\n' + texto.slice(l.ini); pinta(); poeCursor(l.vIni + 1); guardaHist(l.vIni + 1, false); avisa(); return; }
          if (p >= l.vFim) return troca(l.fim, l.fim, '\n'); return troca(p, p, '*\n*'); }
        if (l.tit && p <= l.vIni) { texto = texto.slice(0, l.ini) + '\n' + texto.slice(l.ini); pinta(); poeCursor(l.vIni + 1); guardaHist(l.vIni + 1, false); avisa(); return; }
        return troca(p, p, '\n'); }
      // BACKSPACE / DELETE pulam os "*" escondidos e, na borda da linha, só juntam as linhas
      if ((e.key === 'Backspace' || e.key === 'Delete') && c0 && c0.a === c0.b && !mod && !e.altKey) {
        const p = visivel(c0.a), l = linhaInfo(p);
        if (e.key === 'Backspace' && l.tit && p <= l.vIni) { e.preventDefault(); texto = texto.slice(0, l.ini) + texto.slice(l.vIni); pinta(); poeCursor(l.ini); guardaHist(l.ini, false); avisa(); return; } // título → texto normal
        if (e.key === 'Backspace') { let q = p - 1; while (q >= l.ini && l.H.has(q)) q--;
          if (q < l.ini || (l.acao && p <= l.vIni)) { e.preventDefault(); if (l.ini > 0) { texto = texto.slice(0, l.ini - 1) + texto.slice(l.ini); pinta(); poeCursor(visivel(l.ini - 1)); guardaHist(l.ini - 1, false); avisa(); } return; }
          if (q !== p - 1 || p !== c0.a) { e.preventDefault(); texto = texto.slice(0, q) + texto.slice(q + 1); pinta(); poeCursor(visivel(q)); guardaHist(q, false); avisa(); } return; }
        let q = p; while (q < l.fim && l.H.has(q)) q++;
        if (q >= l.fim || (l.acao && p >= l.vFim)) { e.preventDefault(); if (l.fim < texto.length) { texto = texto.slice(0, l.fim) + texto.slice(l.fim + 1); pinta(); poeCursor(visivel(p)); guardaHist(p, false); avisa(); } return; }
        if (q !== p || p !== c0.a) { e.preventDefault(); texto = texto.slice(0, q) + texto.slice(q + 1); pinta(); poeCursor(visivel(p)); guardaHist(p, false); avisa(); } return; }
      if (e.key === 'Tab') { e.preventDefault(); return; }
      if (mod && k === 'z' && !e.shiftKey) { e.preventDefault(); vaiHist(-1); return; }
      if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); vaiHist(1); return; }
      if (mod && k === 'i') { e.preventDefault(); italico(); return; }
      if (mod && (k === 'b' || k === 'u')) { e.preventDefault(); return; }
    });
    ed.addEventListener('paste', e => { if (o.somenteLer) return; e.preventDefault(); const d = e.clipboardData, h = d.getData('text/html'); const t = (h && !semFormato ? deHtml(h) : d.getData('text/plain')).replace(/\r/g, ''); semFormato = false; const c = cursor() || { a: texto.length, b: texto.length }; troca(c.a, c.b, t); });
    ed.addEventListener('drop', e => { e.preventDefault(); });
    ed.addEventListener('copy', e => { const c = cursor(); if (!c || c.a === c.b) return; e.preventDefault(); e.clipboardData.setData('text/plain', texto.slice(c.a, c.b)); });
    ed.addEventListener('cut', e => { const c = cursor(); if (!c || c.a === c.b || o.somenteLer) return; e.preventDefault(); e.clipboardData.setData('text/plain', texto.slice(c.a, c.b)); troca(c.a, c.b, ''); });
    ed.addEventListener('keyup', () => o.aoMover?.(cursor())); ed.addEventListener('mouseup', () => o.aoMover?.(cursor()));
    function italico() { const c = cursor(); if (!c) return; const sel = texto.slice(c.a, c.b);
      if (!sel) { troca(c.a, c.b, '**'); poeCursor(c.a + 1); return; }
      if (/^\*[^*]+\*$/.test(sel)) return troca(c.a, c.b, sel.slice(1, -1));
      const t = sel.replace(/^(\s*)(.*?)(\s*)$/s, '$1*$2*$3'); troca(c.a, c.b, t); poeCursor(c.a, c.a + t.length); }
    // ---- MENU DA SELEÇÃO (pedido da dona): selecionou (ou clique direito no que está selecionado) → diz o que aquele trecho é ----
    const linhaDe = p => { const ini = texto.lastIndexOf('\n', p - 1) + 1, f = texto.indexOf('\n', p); return [ini, f < 0 ? texto.length : f]; };
    const svg = d => `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    const menu = document.createElement('div'); menu.className = 'sel-menu'; menu.hidden = true; menu.setAttribute('role', 'menu');
    menu.innerHTML = `<button data-m="nome" role="menuitem">${svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>')} É o nome do personagem</button>
      <button data-m="acao" role="menuitem">${svg('<path d="M10 4h8M6 20h8M14 4l-4 16"/>')} É ação / explicação da cena</button>
      <button data-m="capitulo" role="menuitem">${svg('<path d="M5 4v16M15 4v16M5 12h10M19 8v12"/>')} É o título de um capítulo</button>
      <button data-m="parte" role="menuitem">${svg('<path d="M6 4v16M18 4v16M6 12h12"/>')} É o título de uma parte</button>
      <button data-m="normal" role="menuitem">${svg('<path d="M5 12h14"/>')} Texto normal</button>
      <hr><button data-m="comentar" role="menuitem">${svg('<path d="M4 5h16v11H9l-5 4z"/>')} Comentário para a equipe</button>`;
    document.body.appendChild(menu);
    let selMenu = null;
    const esconde = () => { menu.hidden = true; selMenu = null; };
    function mostraMenu(x, y, embaixo) { const c = cursor(); if (!c || c.a === c.b || o.somenteLer || !texto.slice(c.a, c.b).trim()) return esconde();
      // a seleção JÁ É o nome de um personagem (linha de fala com esse nome)? então o item vira "Editar personagem (só neste roteiro)…"
      const selT = texto.slice(c.a, c.b).trim(), achado = selT && info.find(x => x.t === 'f' && Roteiro.chave(x.nome) === Roteiro.chave(selT)), bN = menu.querySelector('[data-m="nome"],[data-m="editaPers"]');
      if (bN) { const ed2 = !!(achado && o.editaPers); bN.dataset.m = ed2 ? 'editaPers' : 'nome'; bN.lastChild.textContent = ed2 ? ' Editar personagem (só neste roteiro)…' : ' É o nome do personagem'; bN.dataset.nome = ed2 ? achado.nome.trim() : ''; }
      selMenu = c; menu.hidden = false; const w = menu.offsetWidth, h = menu.offsetHeight;
      menu.style.left = Math.max(8, Math.min(innerWidth - w - 8, x - (embaixo ? 0 : w / 2))) + 'px';
      menu.style.top = (embaixo ? Math.min(innerHeight - h - 8, y) : (y - h - 10 < 8 ? y + 28 : y - h - 10)) + 'px'; }
    menu.addEventListener('mousedown', e => e.preventDefault()); // não perde a seleção
    menu.addEventListener('click', e => { const b = e.target.closest('[data-m]'); const c = selMenu; esconde(); if (!b || !c) return; if (b.dataset.m === 'editaPers') return o.editaPers?.(b.dataset.nome); FAZ[b.dataset.m](c, true); });
    // mudança pelo menu (botão direito / seleção) pergunta antes, mostrando como a linha fica (pedido da dona)
    async function aplica(a, b, s, msg, perguntar) {
      if (perguntar && o.confirma) { const [i, f] = linhaDe(a), [i2, f2] = linhaDe(Math.max(a, b)); const antes = texto.slice(i, f2), depois = (texto.slice(i, a) + s + texto.slice(b, f2)).replace(/^\n+/, '');
        if (!await o.confirma(msg, antes, depois)) return; }
      troca(a, b, s);
    }
    const FAZ = {
      nome(c, q) { // "Problems Oi gente" com "Problems" selecionado → "Problems: Oi gente"; nome sozinho na linha + fala na linha de baixo → junta
        const [ini, fim] = linhaDe(c.a), b = Math.min(c.b, fim), nome = texto.slice(c.a, b).replace(/[*:#\[\]()]/g, '').trim().slice(0, 40); if (!nome) return;
        let resto = (texto.slice(ini, c.a) + ' ' + texto.slice(b, fim)).replace(/^[\s*]*$/, '').trim().replace(/^[:\-–—]\s*/, ''), ate = fim;
        if (!resto && fim < texto.length) { const [i2, f2] = linhaDe(fim + 1); const l2 = texto.slice(i2, f2).trim(); if (l2 && Roteiro.classifica(l2)[0].t !== 'h' && Roteiro.classifica(l2)[0].t !== 'f') { resto = l2; ate = f2; } }
        aplica(ini, ate, `${nome}: ${resto}`, `Marcar "${nome}" como nome de personagem?`, q); },
      acao(c, q) { const [ini, fim] = linhaDe(c.a), l = texto.slice(ini, fim), sel = texto.slice(c.a, c.b);
        if (sel.trim() === l.trim() && c.b <= fim) { const t = l.trim().replace(/^[*_]+|[*_]+$/g, ''); return aplica(ini, fim, `*${t}*`, 'Marcar esta linha como ação / explicação da cena?', q); }
        if (/^\*[^*]+\*$/.test(sel)) return aplica(c.a, c.b, sel.slice(1, -1), 'Tirar a marcação de ação deste trecho?', q);
        aplica(c.a, c.b, sel.replace(/^(\s*)(.*?)(\s*)$/s, '$1*$2*$3'), 'Marcar este trecho como ação / como falar?', q); },
      titulo(c, q, nivel) { const [ini, fim] = linhaDe(c.a), t = (texto.slice(c.a, Math.min(c.b, fim)).trim() || texto.slice(ini, fim).trim()).replace(/^#+\s*/, '').replace(/[*:]/g, '').trim(); if (!t) return;
        const antes = texto.slice(0, ini); aplica(ini, fim, (antes && !/\n\s*\n$/.test(antes) ? '\n' : '') + (nivel === 1 ? '# ' : '## ') + t, `Transformar "${t}" em título de ${nivel === 1 ? 'capítulo' : 'parte'}?`, q); },
      parte(c, q) { FAZ.titulo(c, q, 2); }, capitulo(c, q) { FAZ.titulo(c, q, 1); },
      normal(c, q) { const sel = texto.slice(c.a, c.b); const [ini, fim] = linhaDe(c.a);
        if (/^\s*#{1,6}\s*/.test(texto.slice(ini, fim)) && c.b <= fim) return aplica(ini, fim, texto.slice(ini, fim).replace(/^\s*#{1,6}\s*/, ''), 'Voltar este título para texto normal?', q);
        aplica(c.a, c.b, sel.replace(/\*/g, ''), 'Voltar este trecho para texto normal?', q); },
      async comentar(c) { // comentário da equipe: uma linha "// Nome: texto (sobre "trecho")" logo abaixo da linha
        const trecho = texto.slice(c.a, c.b).replace(/\s+/g, ' ').trim().slice(0, 50), t = await o.pedeTexto?.('Comentário para a equipe', trecho ? `Sobre "${trecho}"` : 'Comentário'); if (!t) return;
        const [, fim] = linhaDe(c.b), quem = (o.autor?.() || '').replace(/[:\n]/g, '').trim(), linha = `\n// ${quem ? quem + ': ' : ''}${t.replace(/\n/g, ' ')}${trecho ? ` (sobre "${trecho}")` : ''}`;
        troca(fim, fim, linha); },
    };
    ed.addEventListener('mouseup', () => setTimeout(() => { const s = getSelection(); if (!s.rangeCount || s.isCollapsed) return esconde(); const r = s.getRangeAt(0).getBoundingClientRect(); mostraMenu(r.left + r.width / 2, r.top); }, 0));
    ed.addEventListener('keyup', e => { if (!e.shiftKey) return; const s = getSelection(); if (!s.rangeCount || s.isCollapsed) return esconde(); const r = s.getRangeAt(0).getBoundingClientRect(); mostraMenu(r.left + r.width / 2, r.top); });
    ed.addEventListener('contextmenu', e => { const s = getSelection(); if (!s.rangeCount || s.isCollapsed || o.somenteLer) return; e.preventDefault(); mostraMenu(e.clientX, e.clientY, true); });
    ed.addEventListener('input', esconde); ed.addEventListener('blur', () => setTimeout(() => { if (!menu.matches(':hover')) esconde(); }, 150));
    addEventListener('scroll', esconde, true); addEventListener('keydown', e => { if (e.key === 'Escape') esconde(); });
    const some = new MutationObserver(() => { if (!raiz.isConnected) { menu.remove(); some.disconnect(); } }); some.observe(document.body, { childList: true, subtree: true });

    pinta();
    return {
      el: ed, get texto() { return texto; },
      poe(t) { texto = String(t || '').replace(/\r/g, ''); pinta(); guardaHist(0, false); },
      foca() { ed.focus(); },
      // insere numa linha nova logo depois da linha do cursor (ou no fim)
      novaLinha(s, opc = {}) { ed.focus(); const c = cursor(); let p = texto.length; if (c) { const fim = texto.indexOf('\n', c.b); p = fim < 0 ? texto.length : fim; }
        const antes = texto.slice(0, p), pre = !antes ? '' : antes.endsWith('\n') ? '' : opc.espaco && !/\n\s*$/.test(antes) ? '\n\n' : '\n';
        troca(p, p, pre + s); if (opc.recua) poeCursor(p + pre.length + s.length - opc.recua);
        ed.querySelector(`[data-i="${Roteiro.classifica(texto.slice(0, p + pre.length + s.length)).length - 1}"]`)?.scrollIntoView({ block: 'nearest' }); },
      italico, desfaz: () => vaiHist(-1), refaz: () => vaiHist(1),
      // estilo da linha (a caixa "Texto normal / Título de parte / Ação / Comentário" da barra): com seleção vale para ela, sem seleção para a linha
      estilo(t) { ed.focus(); let c = cursor(); if (!c) return; if (c.a === c.b) { const [i, f] = linhaDe(c.a); if (i === f) return; c = { a: i, b: f }; }
        if (t === 'comentario') { const [i, f] = linhaDe(c.a); return troca(i, f, '// ' + texto.slice(i, f).replace(/^\s*\/\/\s*/, '')); }
        if (t === 'normal') { const [i, f] = linhaDe(c.a); const l = texto.slice(i, f); if (/^\s*(\/\/|#)/.test(l) || /^\s*\*.*\*\s*$/.test(l)) return troca(i, f, l.replace(/^\s*(\/\/|#{1,6})\s*/, '').replace(/^\s*\*(.*)\*\s*$/, '$1')); }
        FAZ[t]?.(c, false); },
      tipoAtual() { const c = cursor(); if (!c) return null; return info[texto.slice(0, c.a).split('\n').length - 1]?.t || null; },
      tudo() { ed.focus(); poeCursor(0, texto.length); },
      irPara(linha) { const d = ed.querySelector(`[data-i="${linha}"]`); if (!d) return; d.scrollIntoView({ block: 'center', behavior: 'smooth' }); ed.focus(); let p = 0; const ls = texto.split('\n'); for (let i = 0; i < linha; i++) p += ls[i].length + 1; poeCursor(p + ls[linha].length); },
      linhas: () => info,
      nivelAtual() { const c = cursor(); if (!c) return 0; return info[texto.slice(0, c.a).split('\n').length - 1]?.nivel || 0; },
      comentar() { ed.focus(); const c = cursor() || { a: texto.length, b: texto.length }; FAZ.comentar(c); },
      // troca o texto inteiro como UMA edição (Ctrl+Z volta ao que era; usado pelo Organizar)
      trocaTudo(t) { ed.focus(); troca(0, texto.length, String(t || '').replace(/\r/g, '')); poeCursor(0); },
      repinta: () => { const c = document.activeElement === ed ? cursor() : null; ed.innerHTML = ''; pinta(); if (c) poeCursor(c.a, c.b); },
    };
  }
  return { cria, deHtml };
})();
