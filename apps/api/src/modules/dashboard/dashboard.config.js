const CARD_DEFINITIONS = {
  receivables: { label: 'Recebíveis', description: 'Fluxo de cobrança' },
  qualityGates: { label: 'Quality Gates', description: 'Aprovações pendentes' },
  events: { label: 'Eventos', description: 'Agenda AMP 213' },
  reservations: { label: 'Reservas', description: 'Filas Bica Bar' },
  members: { label: 'Membership', description: 'Clube Cadastrado' },
  operations: { label: 'Operações', description: 'Eventos e automações' }
};

const SECTION_DEFINITIONS = {
  priorities: { label: 'Prioridades', meta: 'Execução rápida' },
  crm: { label: 'CRM Sollu', meta: 'Funil comercial' },
  billing: { label: 'Financeiro', meta: 'Recebíveis e cobranças' },
  qualityGates: { label: 'Quality Gates', meta: 'Bloqueios operacionais' },
  events: { label: 'Eventos AMP 213', meta: 'Experiências proprietárias' },
  reservations: { label: 'Reservas Bica', meta: 'Mesas e filas' },
  membership: { label: 'Membership Bica', meta: 'Clube premium' },
  contracts: { label: 'Contratos', meta: 'Documentos críticos' },
  operations: { label: 'Operações', meta: 'Eventos e fluxo' },
  operationsTimeline: { label: 'Timeline', meta: 'Fluxo operacional' },
  recommendationEfficiency: { label: 'Eficiência da recomendação', meta: 'Score de ações' },
  analytics: { label: 'Analytics', meta: 'KPIs consolidados' }
};

const ROLE_ALLOWED_CARDS = {
  ceo: ['receivables', 'qualityGates', 'events', 'operations'],
  commercial: ['receivables', 'qualityGates', 'crm', 'contracts'],
  operations: ['receivables', 'qualityGates', 'events', 'reservations', 'members', 'operations']
};

const ROLE_ALLOWED_SECTIONS = {
  ceo: [
    'priorities',
    'operations',
    'operationsTimeline',
    'recommendationEfficiency',
    'qualityGates',
    'analytics'
  ],
  commercial: [
    'priorities',
    'crm',
    'billing',
    'qualityGates',
    'operations',
    'operationsTimeline',
    'recommendationEfficiency',
    'contracts'
  ],
  operations: [
    'priorities',
    'operations',
    'operationsTimeline',
    'recommendationEfficiency',
    'qualityGates',
    'contracts',
    'reservations',
    'membership',
    'events'
  ]
};

function buildList(definitions, ids = []) {
  return ids
    .map((id) => {
      const def = definitions[id] || {};
      return {
        id,
        label: def.label || id,
        meta: def.meta || def.description || ''
      };
    })
    .filter(Boolean);
}

export function buildDashboardContract(role = 'operations') {
  const canonicalRole = ['ceo', 'commercial', 'operations'].includes(role) ? role : 'operations';
  return {
    role: canonicalRole,
    cards: buildList(CARD_DEFINITIONS, ROLE_ALLOWED_CARDS[canonicalRole] || []),
    sections: buildList(SECTION_DEFINITIONS, ROLE_ALLOWED_SECTIONS[canonicalRole] || [])
  };
}
