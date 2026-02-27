import { Timestamp } from 'firebase/firestore';

export type UserLevel = 'admin' | 'operador';

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  nivel: UserLevel;
  ativo: boolean;
  criadoEm: Timestamp;
}

export interface Empreendimento {
  id: string;
  nome: string;
  responsavel: string;
  observacoes: string;
  criadoEm: Timestamp;
}

export type PontoStatus = 'ativo' | 'encerrado';

export interface PontoCaptacao {
  id: string;
  nomePonto: string;
  cnpj: string;
  endereco: string;
  empreendimentoId: string;
  responsavel: string;
  valorReal: number;
  valorFechado: number;
  percentual: number;
  valorRepassado: number;
  margemLucro: number;
  dataInicio: Timestamp;
  tempoContrato: number; // meses
  dataTermino: Timestamp;
  status: PontoStatus;
  criadoEm: Timestamp;
}

export interface Relatorio {
  id: string;
  periodoInicio: Timestamp;
  periodoFim: Timestamp;
  totalFaturado: number;
  totalRepassado: number;
  lucroTotal: number;
  geradoPor: string;
  criadoEm: Timestamp;
}
