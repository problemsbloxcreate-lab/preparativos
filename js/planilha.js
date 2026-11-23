// CRONOGRAMA (pedido da dona, 23/11/2026): a planilha "Organização Turma do Problems" manda na data, no status e no responsável.
// Cada vídeo da planilha é uma pasta do Drive com o Google Docs do roteiro e os áudios.
//  - Roteiros (início): seção "Do cronograma" com os vídeos da planilha; "Trazer do Drive" cria o roteiro a partir do Docs
//    (js/docs.js converte) e liga o roteiro à pasta (P.drive = { pasta, doc, em }).
//  - Roteiro aberto: faixa com a data, o status e o responsável que vêm da planilha.
//  - Passo 2 (Vozes): os áudios da pasta aparecem prontos para usar (vão para o mesmo quadro de "Solte aqui o áudio").
// Rotas do turma-ia: GET /cronograma · /cronograma/pasta?id= · /cronograma/doc?id= · /cronograma/arquivo?id=
const Planilha = {
  _l: null, _em: 0,
  PESSOA: { luigi: ['#fcd5d2', '#b3261e'], miriam: ['#ffe0c7', '#a84300'], problems: ['#c9f1f7', '#00707f'] },
  ST: { pronto: ['#b7e1c7', '#0d5c2a'], fazendo: ['#c6dafc', '#174ea6'], aguardando: ['#fce8b2', '#7a4f00'], parado: ['#f6c7c3', '#a50e0e'] },
  EXT_AUDIO: /\.(mp3|wav|m4a|ogg|oga|opus|webm|flac|aac|wma|mp4|mov)$/i,

  async lista(forcar) {
    if (!forcar && this._l && Date.now() - this._em < 60e3) return this._l;
    const r = await Nuvem.pede('/cronograma'); this._l = r.itens || []; this._em = Date.now(); return this._l;
  },
  doRoteiro(P) { const id = P?.drive?.pasta; return id && this._l ? this._l.find(x => x.pasta === id) || null : null; },
  stKey(s) { s = String(s || '').toLowerCase(); return /pronto/.test(s) ? 'pronto' : /aguard/.test(s) ? 'aguardando' : /parad/.test(s) ? 'parado' : s ? 'fazendo' : ''; },
  dia(d) { if (!d) return 'Sem data'; const [a, m, dd] = d.split('-').map(Number), dt = new Date(a, m - 1, dd);
    return dt.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).replace('.', ''); },
  chip(txt, [bg, fg]) { return `<span class="cr-chip" style="background:${bg};color:${fg}">${esc(txt)}</span>`; },
  chipSt(s) { const k = this.stKey(s); return k ? this.chip(s, this.ST[k]) : ''; },
  chipResp(r) { const k = String(r || '').toLowerCase(); return r ? this.chip('● ' + r.toUpperCase(), this.PESSOA[k] || ['#e6e9f0', '#3c4a6b']) : '<span class="cr-chip cr-vz">sem responsável</span>'; },
  linkPasta(id) { return 'https://drive.google.com/drive/folders/' + encodeURIComponent(id); },

  // ---- Roteiros (início): seção "Do cronograma" ----
  // lista = S.lista (roteiros da nuvem) para achar o roteiro já ligado a cada pasta
  secao(lista) {
    const box = h(`<section class="cr-sec"><h3 class="pb-h">${ic('cal', 15)} Do cronograma <small>a planilha manda na data, no status e no responsável</small><span class="esp"></span><button class="bt ic" data-cr-at title="Ler a planilha de novo">${ic('atualizar', 15)}</button></h3><div class="cr-lista">${giro('Lendo a planilha')}</div></section>`);
    $('[data-cr-at]', box).onclick = () => this.enche(box, lista, true);
    this.enche(box, lista);
    return box;
  },
  async enche(box, lista, forcar) {
    const L = $('.cr-lista', box); if (forcar) L.innerHTML = giro('Lendo a planilha');
    let itens; try { itens = await this.lista(forcar); } catch (e) { L.innerHTML = `<div class="vazio erro">${esc(e.message)}</div>`; return; }
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const vis = itens.filter(x => x.aba === 'Cronograma' && !x.postado)
      .sort((a, b) => (a.data || '9999') < (b.data || '9999') ? -1 : (a.data || '9999') > (b.data || '9999') ? 1 : 0);
    if (!vis.length) { L.innerHTML = '<div class="vazio">Nenhum vídeo na planilha agora.</div>'; return; }
    const porPasta = new Map((lista || []).filter(x => x.pasta).map(x => [x.pasta, x]));
    L.innerHTML = '';
    for (const x of vis) {
      const rot = x.pasta && porPasta.get(x.pasta), passou = x.data && new Date(x.data + 'T00:00') < hoje && this.stKey(x.status) !== 'pronto';
      const lin = h(`<div class="cr-lin${passou ? ' atrasado' : ''}">
        <span class="cr-dia${x.data ? '' : ' sem'}">${esc(this.dia(x.data))}</span>
        <span class="cr-tit"><b>${esc(x.titulo)}</b>${x.formato === 'Longo' ? ' <span class="cr-chip cr-longo">vídeo longo</span>' : ''}${x.aguardando ? `<small>aguardando: ${esc(x.aguardando)}</small>` : ''}</span>
        ${this.chipSt(x.status)}${this.chipResp(x.resp)}
        <span class="cr-acao"></span></div>`);
      const ac = $('.cr-acao', lin);
      if (rot) { const b = h(`<button class="bt suave">${ic('doc', 14)} Abrir roteiro</button>`); b.onclick = async () => { b.innerHTML = giro(); try { abrePrep(await Nuvem.abre(rot.id)); } catch (e) { aviso(e.message, 'erro'); } }; ac.appendChild(b); }
      else if (x.pasta && pode('roteiro')) { const b = h(`<button class="bt pri">${ic('upload', 14)} Trazer do Drive</button>`); b.onclick = () => this.traz(x, b); ac.appendChild(b); }
      else if (!x.pasta) ac.appendChild(h('<span class="cr-chip cr-vz">sem pasta</span>'));
      if (x.pasta) { const a = h(`<a class="bt ic" target="_blank" rel="noopener" title="Abrir a pasta no Drive" href="${esc(this.linkPasta(x.pasta))}">${ic('pasta', 15)}</a>`); ac.appendChild(a); }
      L.appendChild(lin);
    }
  },

  // ---- Trazer do Drive: o Docs da pasta vira o roteiro ----
  async pasta(id) { return (await Nuvem.pede('/cronograma/pasta?id=' + encodeURIComponent(id))).itens || []; },
  async docDe(pasta) {
    const itens = await this.pasta(pasta), docs = itens.filter(i => i.tipo === 'doc');
    if (!docs.length) throw new Error('Não achei nenhum Google Docs nesta pasta do Drive.');
    let d = docs[0];
    if (docs.length > 1) { const k = await pergunta('Qual Docs é o roteiro?', 'Esta pasta tem mais de um Google Docs.', [...docs.map(x => [x.nome, x.id]), ['Cancelar', null]]); if (!k) return null; d = docs.find(x => x.id === k); }
    const { html } = await Nuvem.pede('/cronograma/doc?id=' + encodeURIComponent(d.id));
    return { doc: d, ...PrepDocs.converter(html) };
  },
  async traz(x, bt) {
    const v = bt?.innerHTML; if (bt) { bt.disabled = true; bt.innerHTML = giro('Lendo o Docs'); }
    try {
      const r = await this.docDe(x.pasta); if (!r) return;
      if (!r.texto.trim()) throw new Error('O Docs está vazio.');
      const P = novoPrep(r.titulo || x.titulo, r.texto);
      P.drive = { pasta: x.pasta, doc: r.doc.id, em: Date.now() };
      P.destino = x.formato === 'Longo' ? 'editor' : 'animador';
      P.canal = PREP_CONFIG.canais.find(c => c.id === PREP_CONFIG.canalPadrao[P.destino]) || null;
      P.manter = true; // as cores dos personagens continuam as da equipe (as do Docs não são usadas) S.sub = 'roteiro';
      await abrePrep(P); marcaSujo();
      await salvaPrep(null, true); // já vai para a nuvem: a ligação com a pasta fica para a equipe toda
      aviso(`Roteiro trazido do Docs: ${P.partes.flatMap(p => p.falas || []).length} falas. Confira em "Como o Preparativos entendeu".`, 'ok', 6000);
    } catch (e) { aviso(e.message, 'erro', 7000); }
    finally { if (bt && bt.isConnected) { bt.disabled = false; bt.innerHTML = v; } }
  },
  // passo 1 › Mais opções: troca o texto pelo Docs de novo (pergunta antes)
  async trazDeNovo() {
    const P = S.P; if (!P?.drive?.pasta) return;
    if (!await pergunta('Trazer o texto do Docs de novo?', 'O texto do roteiro aqui vai ser trocado pelo que está no Google Docs agora. Os áudios das falas que não mudaram continuam.', [['Cancelar', false], ['Trazer de novo', true]])) return;
    try { const r = await this.docDe(P.drive.pasta); if (!r) return; P.roteiro = r.texto; P.partes = Roteiro.separa(P.roteiro, P.partes); P.drive.doc = r.doc.id; P.drive.em = Date.now(); marcaSujo(); Simples.corpo(); aviso('Texto trazido do Docs de novo.', 'ok'); }
    catch (e) { aviso(e.message, 'erro'); }
  },

  // ---- roteiro aberto: faixa da planilha (embaixo do nome) ----
  async faixa(P) {
    const pai = $('.prep .ps-main'); if (!pai || !P?.drive?.pasta) return; $('.cr-faixa', pai)?.remove();
    const f = h(`<div class="cr-faixa">${ic('cal', 14)} <span class="cr-faixa-in">${giro()}</span><span class="esp"></span><a class="cr-faixa-l" target="_blank" rel="noopener" href="${esc(this.linkPasta(P.drive.pasta))}">${ic('pasta', 13)} Pasta no Drive</a></div>`);
    pai.insertBefore(f, $('.ps-corpo', pai));
    try { await this.lista(); } catch { }
    const x = this.doRoteiro(P), inn = $('.cr-faixa-in', f); if (!inn) return;
    inn.innerHTML = x ? `<b>${esc(this.dia(x.data))}</b> ${this.chipSt(x.status)} ${this.chipResp(x.resp)} <small>vem da planilha${x.postado ? ' · já postado' : ''}</small>` : '<small>Ligado à pasta do Drive (não achei a linha dele na planilha agora).</small>';
  },

  // ---- passo 2: os áudios da pasta ----
  async caixaAudios(c) {
    const P = S.P; if (!P?.drive?.pasta || !pode('gravar')) return; const alvo = $('[data-solta]', c); if (!alvo) return;
    const box = h(`<div class="cr-aud">${ic('pasta', 16)} <span>${giro('Olhando os áudios da pasta do Drive')}</span></div>`);
    alvo.insertAdjacentElement('beforebegin', box);
    let auds; try { auds = (await this.pasta(P.drive.pasta)).filter(i => i.tipo === 'arquivo' && this.EXT_AUDIO.test(i.nome)); } catch (e) { box.remove(); return; }
    if (!box.isConnected) return; if (!auds.length) { box.remove(); return; }
    box.innerHTML = `<div class="cr-aud-t">${ic('pasta', 16)} <b>Áudios na pasta do Drive</b><small>Marque os que são deste roteiro e clique em Usar. Eles entram como se você tivesse soltado aqui.</small></div>
      <div class="cr-aud-l">${auds.map((a, i) => `<label><input type="checkbox" data-i="${i}" checked> ${esc(a.nome)}</label>`).join('')}</div>
      <div class="cr-aud-b"><button class="bt pri" data-usar>${ic('upload', 15)} Usar estes áudios</button></div>`;
    $('[data-usar]', box).onclick = async e => {
      const b = e.currentTarget, sel = $$('input[data-i]', box).filter(i => i.checked).map(i => auds[+i.dataset.i]); if (!sel.length) return aviso('Marque pelo menos um áudio.', 'info');
      b.disabled = true; const v = b.innerHTML;
      try { const arqs = []; for (const [n, a] of sel.entries()) { b.innerHTML = giro(`Baixando ${n + 1} de ${sel.length}`); const bl = await Nuvem.pede('/cronograma/arquivo?id=' + encodeURIComponent(a.id), { blob: true }); arqs.push(new File([bl], a.nome, { type: bl.type || 'audio/mpeg' })); }
        b.innerHTML = v; await Simples.solta(arqs); }
      catch (er) { aviso(er.message, 'erro'); } finally { if (b.isConnected) { b.disabled = false; b.innerHTML = v; } }
    };
  }
};
window.Planilha = Planilha;
