/* ===================== roteiro.js — o texto do roteiro vira partes e falas por personagem =====================
   Formato do texto (o mesmo que o "Organizar" escreve):
     ## Episódio 1 parte 1          ← começa uma parte nomeada (também aceita "# …" ou uma linha só com "Parte 2", "Episódio 3…", "Cena 4…")
     PROBLEMS: Oi, gente!           ← fala: NOME: texto (o nome tem até 40 letras e até 4 palavras)
     (rindo) Bem-vindos.            ← linha seguida, sem linha em branco no meio = continua a mesma fala
     [a câmera se aproxima]         ← indicação de cena: não vira fala
     // anotação                    ← comentário: não vira fala
   Uma "(nota)" no começo da fala vira a nota de como falar (não entra na legenda).
   Funciona igual no navegador e no Node (para testar: node js/roteiro.js). */
'use strict';
const Roteiro = (() => {
  const norm = s => String(s || '').normalize('NFC').trim().replace(/\s+/g, ' ');
  // nome do personagem para comparar (cores, filtros): sem diferenciar maiúscula e minúscula
  const chave = s => norm(s).toLocaleLowerCase('pt-BR');
  const uid = p => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  const PARTE = /^(?:#{1,6}\s*(.+)|((?:epis[oó]dio|parte|cena|cap[ií]tulo|ato)\b.{0,80}))$/i;
  const PARTE_NUM = /^(?:epis[oó]dio|parte|cena|cap[ií]tulo|ato)\s+\d/i; // "Cena 2: a casa" é parte, não fala de um tal "Cena 2"
  const FALA = /^([^:\[\]()#/][^:\[\]()]{0,39}?)\s*:\s*(.*)$/;

  // texto → partes. "anterior" = partes que já existiam: a fala igual (mesmo personagem e texto) continua com o áudio dela;
  // a fala que mudou de texto, mas está no mesmo lugar (mesma parte, mesma vez daquele personagem), fica com o áudio e a marca "regravar".
  function separa(texto, anterior = []) {
    const partes = []; let parte = null, fala = null;
    const novaParte = nome => { parte = { id: null, nome: norm(nome).slice(0, 80) || `Parte ${partes.length + 1}`, falas: [] }; partes.push(parte); fala = null; };
    for (const bruta of String(texto || '').replace(/\r/g, '').split('\n')) {
      const l = bruta.trim();
      if (!l) { fala = null; continue; }
      if (l.startsWith('//') || /^\[.*\]$/.test(l)) { fala = null; continue; }
      const mp = l.match(PARTE); if (mp && (mp[1] || !FALA.test(l) || PARTE_NUM.test(l))) { novaParte((mp[1] || mp[2]).replace(/:\s*$/, '')); continue; }
      const mf = l.match(FALA);
      if (mf && mf[1].trim().split(/\s+/).length <= 4) {
        if (!parte) novaParte('Parte 1');
        let t = norm(mf[2]), nota = '';
        const mn = t.match(/^\(([^)]{1,80})\)\s*(.*)$/); if (mn) { nota = mn[1].trim(); t = mn[2]; }
        fala = { id: null, personagem: norm(mf[1]).slice(0, 40), texto: t, nota, audio: null, duracao: 0 };
        parte.falas.push(fala); continue;
      }
      if (fala) { fala.texto = norm(fala.texto + ' ' + l); continue; } // continuação da fala
      // linha solta (narração/ação): não vira fala
    }
    for (const p of partes) for (const f of p.falas) if (!f.texto) f.texto = '';
    return casa(partes.filter(p => p.falas.length || partes.length === 1), anterior);
  }

  // liga as falas novas às antigas (ids e áudios)
  function casa(partes, anterior) {
    const velhas = (anterior || []).flatMap(p => (p.falas || []).map(f => ({ ...f, _p: chave(p.nome) })));
    const usadas = new Set(), porTexto = new Map();
    for (const f of velhas) { const k = chave(f.personagem) + '|' + chave(f.texto); if (!porTexto.has(k)) porTexto.set(k, []); porTexto.get(k).push(f); }
    const partesVelhas = new Map((anterior || []).map(p => [chave(p.nome), p]));
    for (const p of partes) {
      const pv = partesVelhas.get(chave(p.nome)); p.id = pv?.id || uid('p');
      // 1) mesmo personagem e mesmo texto
      for (const f of p.falas) { const l = porTexto.get(chave(f.personagem) + '|' + chave(f.texto)) || [], v = l.find(x => !usadas.has(x.id) && x._p === chave(p.nome)) || l.find(x => !usadas.has(x.id));
        if (v) { usadas.add(v.id); f.id = v.id; f.audio = v.audio || null; f.duracao = v.duracao || 0; if (v.regravar) f.regravar = true; if (v.por) f.por = v.por; if (v.em) f.em = v.em; } }
      // 2) mesmo lugar (n-ésima fala daquele personagem na mesma parte), texto mudou
      if (pv) { const conta = {}, contaV = {}, lugarV = new Map();
        for (const v of pv.falas || []) { const c = chave(v.personagem); contaV[c] = (contaV[c] || 0) + 1; lugarV.set(c + '#' + contaV[c], v); }
        for (const f of p.falas) { const c = chave(f.personagem); conta[c] = (conta[c] || 0) + 1; if (f.id) continue; const v = lugarV.get(c + '#' + conta[c]);
          if (v && !usadas.has(v.id)) { usadas.add(v.id); f.id = v.id; if (v.audio) { f.audio = v.audio; f.duracao = v.duracao || 0; f.regravar = true; if (v.por) f.por = v.por; if (v.em) f.em = v.em; } } } }
      for (const f of p.falas) if (!f.id) f.id = uid('f');
    }
    return partes;
  }

  // partes → texto (o "Organizar" usa para escrever o roteiro arrumado)
  function escreve(partes) {
    return (partes || []).map(p => [`## ${norm(p.nome) || 'Parte'}`, ...(p.falas || []).map(f => `${norm(f.personagem).toUpperCase()}: ${f.nota ? `(${norm(f.nota)}) ` : ''}${norm(f.texto)}`)].join('\n')).join('\n\n') + '\n';
  }

  // personagens do roteiro (na ordem em que aparecem), sem repetir por maiúscula/minúscula
  function personagens(partes) {
    const m = new Map(); for (const p of partes || []) for (const f of p.falas || []) { const k = chave(f.personagem); if (!k) continue; const o = m.get(k) || { nome: f.personagem, n: 0, g: 0 }; o.n++; if (f.audio) o.g++; m.set(k, o); }
    return [...m.entries()].map(([k, o]) => ({ chave: k, ...o }));
  }

  return { separa, escreve, personagens, chave, norm, uid };
})();
if (typeof module !== 'undefined') module.exports = Roteiro;

// teste rápido: node js/roteiro.js
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  const t = `## Episódio 1 parte 1\nPROBLEMS: Oi, gente!\n(continua) tudo bem?\n[câmera]\nClara: (rindo) Oi Problems.\n\nParte 2\nproblems: Tchau.\n// fim`;
  const a = Roteiro.separa(t); console.log(JSON.stringify(a, null, 1));
  a[0].falas[0].audio = 'preparativos/x/aud/a.webm'; a[0].falas[0].duracao = 1.2;
  const b = Roteiro.separa(t.replace('Oi, gente!', 'Olá, gente!'), a);
  console.log('mantém id:', b[0].falas[0].id === a[0].falas[0].id, 'regravar:', b[0].falas[0].regravar, 'personagens:', JSON.stringify(Roteiro.personagens(b)));
  console.log(Roteiro.escreve(b));
}
