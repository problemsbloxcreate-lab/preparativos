// Docs → roteiro do Preparativos.
// Lê o HTML exportado do Google Docs (export?format=html) e devolve o texto no formato do Preparativos.
// Regras (Cérebro: Aprendizados/SHORTS 7 Docs → Preparativos):
//  - 1º parágrafo (título) e "Short · Turma do Problems · ~N s" saem; o título vira o nome do roteiro.
//  - Fala: o nome de quem fala é um trecho com FUNDO COLORIDO no começo da linha (a cor do personagem);
//    "(nota)" em itálico logo depois vira a nota; o resto é a fala  →  "Nome (nota): fala".
//  - Linha inteira em itálico = cena  →  "*texto*"; se começa com corte/close/câmera  →  "[texto]".
//  - Linha com link (ex.: "Referência da dança: https://…")  →  comentário "// …".
(function (raiz) {
  'use strict';

  const limpa = (s) => String(s || '').replace(/ /g, ' ').replace(/[ \t]+/g, ' ').trim();

  function estilosDe(css) {
    const mapa = {};
    const re = /\.([\w-]+)\{([^}]*)\}/g;
    let m;
    while ((m = re.exec(css))) mapa[m[1]] = (mapa[m[1]] || '') + ';' + m[2];
    return mapa;
  }

  function estiloDoTrecho(el, mapa) {
    let s = el.getAttribute('style') || '';
    (el.getAttribute('class') || '').split(/\s+/).forEach((c) => { if (mapa[c]) s += ';' + mapa[c]; });
    return {
      italico: /font-style:\s*italic/.test(s),
      fundo: ((s.match(/background-color:\s*(#[0-9a-f]{3,6})/i) || [])[1] || '').toLowerCase(),
      tamanho: parseFloat((s.match(/font-size:\s*([\d.]+)pt/) || [])[1] || '11'),
      cinza: /color:\s*#666666/i.test(s)
    };
  }

  const ehCena = (t) => /^(corte|close|c[aâ]mera|plano|zoom|tela preta|transi)/i.test(t);

  // html: texto do export?format=html. DOMParser vem do navegador (ou é passado nos testes).
  function converter(html, DOMParserCls) {
    const DP = DOMParserCls || raiz.DOMParser;
    const doc = new DP().parseFromString(html, 'text/html');
    const css = Array.from(doc.querySelectorAll('style')).map((s) => s.textContent).join('\n');
    const mapa = estilosDe(css);
    const linhas = [];
    let titulo = '';
    const cores = {};
    let n = 0;
    Array.from(doc.querySelectorAll('body p, body li')).forEach((p) => {
      const trechos = Array.from(p.querySelectorAll('span')).filter((s) => !s.querySelector('span'));
      const texto = limpa(p.textContent);
      if (!texto) return;
      n++;
      const est = trechos.map((s) => ({ t: s.textContent.replace(/ /g, ' '), e: estiloDoTrecho(s, mapa) }))
        .filter((x) => x.t.trim() !== '' || x.e.fundo);
      const primeiro = est[0] || { t: texto, e: {} };
      // título e subtítulo
      if (!titulo && n === 1 && (primeiro.e.tamanho > 13 || est.length <= 1)) { titulo = texto; return; }
      if (/^short\s*·/i.test(texto) || (primeiro.e.cinza && n <= 3)) return;
      // link solto
      if (/https?:\/\//i.test(texto) && !primeiro.e.fundo) { linhas.push('// ' + texto); return; }
      // fala: começa com trecho de fundo colorido (não amarelo de cena) e sem itálico
      const fundoNome = primeiro.e.fundo && !primeiro.e.italico && primeiro.e.fundo !== '#ffe599' && primeiro.e.fundo !== '#ffffff';
      if (fundoNome) {
        const nome = limpa(primeiro.t);
        let resto = est.slice(1);
        let nota = '';
        if (resto[0] && resto[0].e.italico && /^\s*\(/.test(resto[0].t)) {
          nota = limpa(resto[0].t).replace(/^\(|\)$/g, '').trim();
          resto = resto.slice(1);
        }
        const fala = limpa(resto.map((x) => x.t).join(''));
        if (nome && !cores[nome.toLowerCase()]) cores[nome.toLowerCase()] = primeiro.e.fundo;
        linhas.push(nome + (nota ? ' (' + nota + ')' : '') + ': ' + fala);
        return;
      }
      // cena
      const tudoItalico = est.length && est.every((x) => x.e.italico || !x.t.trim());
      if (tudoItalico || primeiro.e.fundo === '#ffe599') {
        linhas.push(ehCena(texto) ? '[' + texto + ']' : '*' + texto + '*');
        return;
      }
      // sobrou: linha comum (deixa como cena para não virar fala errada)
      linhas.push('*' + texto + '*');
    });
    return { titulo, texto: linhas.join('\n'), cores };
  }

  const api = { converter };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  raiz.PrepDocs = api;
})(typeof window !== 'undefined' ? window : globalThis);
