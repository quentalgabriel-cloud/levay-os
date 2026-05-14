export const STATUS = {
  task: {
    inbox: 'inbox',
    em_andamento: 'em_andamento',
    aguardando: 'aguardando',
    fechar_ciclo: 'fechar_ciclo',
    ciclo_fechado: 'ciclo_fechado',
    a_fazer: 'a_fazer',
    standby: 'standby',
    cancelado: 'cancelado',
  },
  project: {
    ativo: 'ativo',
    pausado: 'pausado',
    concluido: 'concluido',
    arquivado: 'arquivado',
  },
  decision: {
    rascunho: 'rascunho',
    decidido: 'decidido',
    revisao: 'revisao',
  },
} as const

export const STATUS_LABEL: Record<string, string> = {
  inbox: 'Inbox',
  em_andamento: 'Em movimento',
  em_movimento: 'Em movimento', // Legacy compatibility
  aguardando: 'Aguardando',
  standby: 'Standby',
  a_fazer: 'A fazer',
  fechar_ciclo: 'Pede atenção',
  ciclo_fechado: 'Ciclo fechado',
  cancelado: 'Cancelado',
  ativo: 'Ativo',
  pausado: 'Pausado',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
  rascunho: 'Rascunho',
  decidido: 'Decidido',
  revisao: 'Em revisão',
}

export const PRIORITY_LABEL: Record<string, string> = {
  urgente: 'Urgente',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

export const COMPANY_COLOR: Record<string, string> = {
  sollu: '#2563EB',
  amp213: '#EA580C',
  bicabar: '#7C3AED',
  bica: '#7C3AED',
  shared: '#6B7280',
}

export const COMPANY_LABEL: Record<string, string> = {
  sollu: 'Sollu',
  amp213: 'AMP 213',
  bicabar: 'Bica Bar',
  bica: 'Bica Bar',
  shared: 'Compartilhado',
}

export const BICA_AMP_CONFIG: {
  bica: { slug: string; name: string; color: string; accent: string; anchor: string[]; systems: string[] }
  amp: { slug: string; name: string; color: string; accent: string; anchor: string[]; systems: string[] }
  shared: { slug: string; name: string; color: string; resources: string[] }
} = {
  bica: {
    slug: 'bica',
    name: 'Bica Bar',
    color: '#7C3AED',
    accent: '#FDE68A',
    anchor: ['Ruan', 'Camilla'],
    systems: ['iReserve (diário)', 'Anota.ai (segunda)'],
  },
  amp: {
    slug: 'amp213',
    name: 'AMP 213',
    color: '#EA580C',
    accent: '#FECACA',
    anchor: [],
    systems: [],
  },
  shared: {
    slug: 'shared',
    name: 'Compartilhado',
    color: '#6B7280',
    resources: ['Lana (escala)', 'Cozinha', 'Prédio (Rua do Amparo, 213)'],
  },
}

export const ACTIONS = {
  capturar: 'Capturar',
  destravar: 'Destravar',
  delegar: 'Delegar',
  decidir: 'Decidir',
  fecharCiclo: 'Fechar ciclo',
} as const
