/* ===================== config.js — endereços do Estúdio Problems (dados públicos por natureza) ===================== */
'use strict';
const PREP_CONFIG = {
  // servidor da equipe (Cloudflare, turma-ia): rotas /preparativos, /preparativos/arquivo, /preparativos/acao e /ideias
  servidor: 'https://turma-ia.problemsraiz.workers.dev',
  // para onde o preparativo vai depois de pronto
  destinos: [['animador', 'Animador'], ['shorts', 'Criar Shorts'], ['editor', 'Editor']],
  status: [['rascunho', 'Rascunho'], ['gravando', 'Gravando'], ['pronto', 'Pronto']],
  // canal do YouTube em que o vídeo vai sair (pedido da dona, 10/11/2026; o Publicações usa os mesmos). IDs públicos dos canais.
  canais: [{ id: 'UC3V4c447QO0zEyTJlsqqSWQ', nome: 'Turma do Problems' }, { id: 'UCrcBZDofBltcgGxphNia2tw', nome: 'Problems' }],
  // canal que entra sozinho ao escolher o destino; Criar Shorts não tem padrão (a pessoa escolhe)
  canalPadrao: { animador: 'UC3V4c447QO0zEyTJlsqqSWQ', editor: 'UCrcBZDofBltcgGxphNia2tw' },
  // áudio de cada fala: Opus em WebM, leve (a nuvem está no limite)
  audioBits: 48000,
  audioMaxSeg: 120,
};
