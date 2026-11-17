/* ===================== config.js — endereços do Estúdio Problems (dados públicos por natureza) ===================== */
'use strict';
const PREP_CONFIG = {
  // servidor da equipe (Cloudflare, turma-ia): rotas /preparativos, /preparativos/arquivo, /preparativos/acao e /ideias
  servidor: 'https://turma-ia.problemsraiz.workers.dev',
  // para onde o preparativo vai depois de pronto
  destinos: [['animador', 'Animador'], ['shorts', 'Criar Shorts'], ['editor', 'Editor']],
  status: [['rascunho', 'Rascunho'], ['gravando', 'Gravando'], ['pronto', 'Pronto']],
  // canal do YouTube em que o vídeo vai sair (pedido da dona, 10/11/2026; o Publicações usa os mesmos). IDs públicos dos canais.
  canais: [{ id: 'UC3V4c447QO0zEyTJlsqqSWQ', nome: 'Turma do Problems', foto: 'https://yt3.googleusercontent.com/_6RPpNFdU-vvfq6BCqreyL8SJV_vTcUlaKmhH6rb_xg-GUmIPulgJrOmvg1JFWmg7SNpbnXV=s88-c-k-c0x00ffffff-no-rj' }, { id: 'UCrcBZDofBltcgGxphNia2tw', nome: 'Problems', foto: 'https://yt3.googleusercontent.com/AuhtqoWAKXrVq9lQchbDSmXjDk_0RMvr6u1FRbrxQ6ic8aYFf3wWLPDO411u6jBFrxOS93drVw=s88-c-k-c0x00ffffff-no-rj' }, { id: 'UC8cP4kV1GIbxRH-mlilSniQ', nome: 'Problems Raiz', foto: 'https://yt3.googleusercontent.com/NA1N99kaC6pQY60HZ_lWSk1tF_E59Am0YrIQIGtkOB8Bah7bB0d1O27dpXlSEQyqWX9jAjz6Z2c=s88-c-k-c0x00ffffff-no-rj' }], // foto = a mesma do Publicações (endereço público do canal)
  // canal que entra sozinho ao escolher o destino; Criar Shorts não tem padrão (a pessoa escolhe)
  canalPadrao: { animador: 'UC3V4c447QO0zEyTJlsqqSWQ', editor: 'UCrcBZDofBltcgGxphNia2tw' },
  // áudio de cada fala: Opus em WebM, leve (a nuvem está no limite)
  audioBits: 48000,
  audioMaxSeg: 120,
};
