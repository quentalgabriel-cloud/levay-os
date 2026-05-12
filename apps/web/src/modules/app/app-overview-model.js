function unwrapItems(result, fallback = []) {
  if (result?.status !== 'fulfilled') {
    return fallback;
  }
  const value = result.value;
  if (Array.isArray(value?.items)) {
    return value.items;
  }
  if (Array.isArray(value)) {
    return value;
  }
  return fallback;
}

function unwrapObject(result, fallback = {}) {
  if (result?.status !== 'fulfilled') {
    return fallback;
  }
  return result.value || fallback;
}

function getSettledError(result) {
  if (!result || result.status !== 'rejected') {
    return null;
  }
  return String(result.reason?.message || result.reason || 'unknown_error');
}

export const APP_UI_THEME = {
  color: {
    canvas: '{semantic.color.background-canvas}',
    surface: '{semantic.color.background-surface}',
    elevated: '{semantic.color.background-elevated}',
    textPrimary: '{semantic.color.text-primary}',
    textSecondary: '{semantic.color.text-secondary}',
    border: '{semantic.color.border-default}',
    accent: '{semantic.color.kpi-highlight}',
    tenantSollu: '{semantic.color.tenant-sollu}'
  },
  typography: {
    display: 'Manrope',
    body: 'Inter',
    mono: 'JetBrains Mono'
  }
};

function roleLabel(role) {
  if (role === 'ceo') return 'CEO';
  if (role === 'commercial') return 'Comercial';
  return 'Operacoes';
}

function priorityTone(count) {
  if (count <= 0) return 'success';
  if (count <= 2) return 'warning';
  return 'danger';
}

function cardAllowed(role, cardId) {
  const byRole = {
    ceo: new Set(['receivables', 'quality-gates', 'events', 'operations', 'tasks']),
    commercial: new Set(['leads', 'receivables', 'quality-gates', 'contracts', 'operations', 'tasks']),
    operations: new Set(['quality-gates', 'contracts', 'events', 'reservations', 'members', 'operations', 'tasks'])
  };
  return (byRole[role] || byRole.operations).has(cardId);
}

function sectionAllowed(role, sectionId) {
  const byRole = {
    ceo: new Set(['priorities', 'analytics', 'operations', 'operations-timeline', 'recommendation-efficiency', 'quality-gates', 'billing']),
    commercial: new Set(['priorities', 'crm', 'billing', 'quality-gates', 'operations', 'operations-timeline', 'recommendation-efficiency', 'contracts']),
    operations: new Set(['priorities', 'operations', 'operations-timeline', 'recommendation-efficiency', 'quality-gates', 'contracts', 'reservations', 'membership', 'events'])
  };
  return (byRole[role] || byRole.operations).has(sectionId);
}

function sectionPriorityIndex(sectionId) {
  if (sectionId === 'priorities') return 0;
  if (sectionId === 'crm') return 1;
  if (sectionId === 'billing') return 2;
  if (sectionId === 'quality-gates') return 3;
  return 10;
}

function sectionResourceMap(sectionId) {
  const map = {
    priorities: 'operations',
    crm: 'crm',
    billing: 'billing',
    'quality-gates': 'qualityGates',
    events: 'events',
    reservations: 'reservations',
    membership: 'membership',
    contracts: 'contracts',
    operations: 'operations',
    'operations-timeline': 'operationsEvents',
    'recommendation-efficiency': 'recommendationEvents',
    analytics: 'analytics',
    tasks: 'tasks'
  };
  return map[sectionId] || null;
}

const CONTRACT_SECTION_ID_MAP = {
  operationsTimeline: 'operations-timeline',
  recommendationEfficiency: 'recommendation-efficiency',
  qualityGates: 'quality-gates'
};

function normalizeContractSectionId(sectionId) {
  return CONTRACT_SECTION_ID_MAP[sectionId] || sectionId;
}

function determineSectionStatus(sectionId, items, errors) {
  const resource = sectionResourceMap(sectionId);
  const error = errors.find((entry) => entry.resource === resource);
  if (error) {
    return { status: 'error', message: error.message };
  }
  if (!items || items.length === 0) {
    return { status: 'empty', message: 'Sem dados no momento' };
  }
  return { status: 'ready' };
}

function roleActionCatalog(role) {
  const base = [{ id: 'refresh-all', label: 'Atualizar tudo', kind: 'secondary' }];
  if (role === 'commercial') {
    return [
      { id: 'billing.bulk.collect.pending', label: 'Cobrar pendentes', kind: 'primary' },
      { id: 'crm.bulk.advance.proposal', label: 'Avancar leads', kind: 'secondary' },
      { id: 'bootstrap-demo', label: 'Popular demo', kind: 'secondary' },
      ...base
    ];
  }
  if (role === 'operations') {
    return [
      { id: 'gates.bulk.approve.pending', label: 'Aprovar gates', kind: 'primary' },
      { id: 'billing.bulk.collect.pending', label: 'Cobrar pendentes', kind: 'secondary' },
      { id: 'crm.bulk.advance.proposal', label: 'Avancar leads', kind: 'secondary' },
      { id: 'bootstrap-demo', label: 'Popular demo', kind: 'secondary' },
      ...base
    ];
  }
  if (role === 'ceo') {
    return [{ id: 'bootstrap-demo', label: 'Popular demo', kind: 'primary' }, ...base];
  }
  return [{ id: 'bootstrap-demo', label: 'Popular demo', kind: 'primary' }, ...base];
}

function actionImpactScore(actionId, focus) {
  if (actionId === 'gates.bulk.approve.pending') {
    return (focus.pendingQualityGates || 0) * 3;
  }
  if (actionId === 'billing.bulk.collect.pending') {
    return (focus.pendingReceivables || 0) * 2;
  }
  if (actionId === 'crm.bulk.advance.proposal') {
    return (focus.leadsToAdvance || 0) * 1.5;
  }
  if (actionId === 'bootstrap-demo') {
    return 0;
  }
  if (actionId === 'refresh-all') {
    return -1;
  }
  return 0;
}

function actionQueueSize(actionId, focus) {
  if (actionId === 'gates.bulk.approve.pending') {
    return Number(focus.pendingQualityGates || 0);
  }
  if (actionId === 'billing.bulk.collect.pending') {
    return Number(focus.pendingReceivables || 0);
  }
  if (actionId === 'crm.bulk.advance.proposal') {
    return Number(focus.leadsToAdvance || 0);
  }
  return 0;
}

function roleActions(role, focus) {
  const catalog = roleActionCatalog(role);
  const withOrder = catalog.map((action, index) => ({
    ...action,
    priorityScore: actionImpactScore(action.id, focus),
    queueSize: actionQueueSize(action.id, focus),
    _defaultOrder: index
  }));

  withOrder.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return a._defaultOrder - b._defaultOrder;
  });

  return withOrder.map(({ _defaultOrder, ...action }) => action);
}

function pickRecommendedAction(actions) {
  const bulkActionIds = new Set([
    'gates.bulk.approve.pending',
    'billing.bulk.collect.pending',
    'crm.bulk.advance.proposal'
  ]);

  const candidate = (actions || []).find(
    (action) => bulkActionIds.has(action.id) && (action.priorityScore || 0) > 0
  );

  if (!candidate) {
    return null;
  }

  return {
    id: candidate.id,
    label: candidate.label,
    priorityScore: candidate.priorityScore,
    queueSize: candidate.queueSize
  };
}

function buildRecommendationInsights(operationsEvents) {
  const displayed = operationsEvents.filter(
    (event) =>
      event.flow === 'sollu.recommendation' &&
      event.type === 'recommendation.presented'
  ).length;

  const executedEvents = operationsEvents.filter(
    (event) =>
      event.flow === 'sollu.recommendation' &&
      event.type === 'recommendation.executed'
  );

  const executions = executedEvents.length;
  const success = executedEvents.filter((event) => event.status === 'success').length;
  const partial = executedEvents.filter((event) => event.status === 'retry').length;
  const failed = executedEvents.filter((event) => event.status === 'dead-letter').length;
  const successRate = executions > 0 ? Math.round((success / executions) * 100) : null;

  return {
    displayed,
    executions,
    success,
    partial,
    failed,
    successRate
  };
}

function buildRecommendationEfficiency(recommendationEvents) {
  const presented = recommendationEvents.filter((event) => event.type === 'recommendation.presented');
  const executed = recommendationEvents.filter((event) => event.type === 'recommendation.executed');
  const success = executed.filter((event) => event.status === 'success');
  const successRate = executed.length ? Math.round((success.length / executed.length) * 100) : 0;

  const now = Date.now();
  const twelveHoursMs = 12 * 60 * 60 * 1000;
  let currentSuccess = 0;
  let currentTotal = 0;
  let previousSuccess = 0;
  let previousTotal = 0;
  const actionCounts = new Map();

  executed.forEach((event) => {
    const createdAt = Date.parse(event.createdAt || '');
    const actionId = event.payload?.actionId || 'unknown';
    actionCounts.set(actionId, (actionCounts.get(actionId) || 0) + 1);

    if (Number.isNaN(createdAt)) {
      return;
    }

    const age = now - createdAt;
    if (age <= twelveHoursMs) {
      currentTotal += 1;
      if (event.status === 'success') {
        currentSuccess += 1;
      }
      return;
    }

    if (age <= twelveHoursMs * 2) {
      previousTotal += 1;
      if (event.status === 'success') {
        previousSuccess += 1;
      }
    }
  });

  const currentRate = currentTotal ? Math.round((currentSuccess / currentTotal) * 100) : 0;
  const previousRate = previousTotal ? Math.round((previousSuccess / previousTotal) * 100) : 0;
  const delta = currentRate - previousRate;

  let trend = 'estavel';
  if (delta >= 5) {
    trend = 'subindo';
  } else if (delta <= -5) {
    trend = 'caindo';
  }

  const topAction = Array.from(actionCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] || null;

  return {
    presented: presented.length,
    executed: executed.length,
    successRate,
    trend,
    delta,
    topActionId: topAction?.[0] || null,
    topActionCount: topAction?.[1] || 0
  };
}

export function buildAppOverviewModel(snapshot, { tenantId = 'sollu', role = 'operations', contract = null } = {}) {
  const leads = unwrapItems(snapshot.crm);
  const receivables = unwrapItems(snapshot.billing);
  const events = unwrapItems(snapshot.events);
  const reservations = unwrapItems(snapshot.reservations);
  const contracts = unwrapItems(snapshot.contracts);
  const pendingGates = unwrapItems(snapshot.qualityGates);
  const operationsEvents = unwrapItems(snapshot.operationsEvents);
  const recommendationEvents = unwrapItems(snapshot.recommendationEvents);
  const analytics = unwrapObject(snapshot.analytics, { tenants: [], consolidated: {} });
  const operations = unwrapObject(snapshot.operations, {});
  const membership = unwrapObject(snapshot.membership, {});
  const tasks = unwrapItems(snapshot.tasks);
  const pendingReceivables = receivables.filter((item) => item.status === 'pending');
  const nonProposalLeads = leads.filter((lead) => lead.stageId !== 'proposal');
  const pendingQualityGates = pendingGates.filter((gate) => gate.status !== 'approved');
  const urgentTasks = tasks.filter(t => t.priority === 'high');

  const errors = [
    ['crm', getSettledError(snapshot.crm)],
    ['billing', getSettledError(snapshot.billing)],
    ['events', getSettledError(snapshot.events)],
    ['reservations', getSettledError(snapshot.reservations)],
    ['membership', getSettledError(snapshot.membership)],
    ['qualityGates', getSettledError(snapshot.qualityGates)],
    ['contracts', getSettledError(snapshot.contracts)],
    ['analytics', getSettledError(snapshot.analytics)],
    ['operations', getSettledError(snapshot.operations)],
    ['operationsEvents', getSettledError(snapshot.operationsEvents)],
    ['recommendationEvents', getSettledError(snapshot.recommendationEvents)],
    ['tasks', getSettledError(snapshot.tasks)]
  ]
    .filter(([, value]) => value)
    .map(([resource, message]) => ({ resource, message }));

  const cards = [
    { id: 'leads', label: 'Leads Sollu', value: leads.length, tone: 'accent' },
    { id: 'receivables', label: 'Recebiveis', value: receivables.length, tone: 'warning' },
    { id: 'quality-gates', label: 'Quality Gates', value: pendingGates.length, tone: 'danger' },
    { id: 'contracts', label: 'Contratos', value: contracts.length, tone: 'success' },
    { id: 'events', label: 'Eventos AMP 213', value: events.length, tone: 'accent' },
    { id: 'reservations', label: 'Reservas Bica', value: reservations.length, tone: 'success' },
    { id: 'members', label: 'Members Bica', value: membership.members?.length || membership.activeMembers || 0, tone: 'accent' },
    { id: 'operations', label: 'Eventos Operacionais', value: operations.total || 0, tone: 'warning' },
    { id: 'tasks', label: 'Tarefas Ativas', value: tasks.length, tone: 'warning' }
  ];

  const sections = [
    {
      id: 'priorities',
      title: 'Prioridades de hoje',
      meta: 'Execucao rapida',
      items: [
        {
          id: 'prio-tasks',
          title: 'Tarefas urgentes',
          subtitle: `${urgentTasks.length} para hoje`,
          detail: 'Resolve as pendencias operacionais do dia',
          actions: []
        },
        {
          id: 'prio-billing',
          title: 'Cobrancas pendentes',
          subtitle: `${pendingReceivables.length} pendentes`,
          detail: 'Dispare cobrancas em lote para reduzir perdas',
          actions: pendingReceivables.length
            ? [{ id: 'billing.bulk.collect.pending', label: 'Cobrar agora' }]
            : []
        },
        {
          id: 'prio-crm',
          title: 'Leads sem proposta',
          subtitle: `${nonProposalLeads.length} aguardando`,
          detail: 'Avance leads para proposta e reduza esfriamento',
          actions: nonProposalLeads.length
            ? [{ id: 'crm.bulk.advance.proposal', label: 'Avancar em lote' }]
            : []
        },
        {
          id: 'prio-gates',
          title: 'Quality gates pendentes',
          subtitle: `${pendingQualityGates.length} aguardando aprovacao`,
          detail: 'Limpe bloqueios para destravar execucao',
          actions: pendingQualityGates.length
            ? [{ id: 'gates.bulk.approve.pending', label: 'Aprovar pendentes' }]
            : []
        }
      ]
    },
    {
      id: 'crm',
      title: 'CRM Sollu',
      meta: `${leads.length} leads`,
      items: leads.slice(0, 5).map((lead) => ({
        id: lead.id,
        title: lead.name || 'Lead',
        subtitle: lead.stageId || 'new',
        detail: lead.nextFollowUpAt || 'sem follow-up',
        actions: lead.stageId === 'proposal'
          ? []
          : [{ id: 'crm.advance-proposal', label: 'Avancar para Proposta' }]
      }))
    },
    {
      id: 'billing',
      title: 'Financeiro',
      meta: `${receivables.length} recebiveis`,
      items: receivables.slice(0, 5).map((item) => ({
        id: item.id,
        title: item.customerName || 'Cliente',
        subtitle: item.status || 'pending',
        detail: `${item.amount || 0}`,
        actions: item.status === 'pending'
          ? [{ id: 'billing.collect', label: 'Disparar cobranca' }]
          : []
      }))
    },
    {
      id: 'events',
      title: 'Eventos AMP 213',
      meta: `${events.length} registros`,
      items: events.slice(0, 5).map((item) => ({
        title: item.title || item.name || 'Evento',
        subtitle: item.status || item.eventType || 'scheduled',
        detail: item.startAt || item.date || 'sem horario'
      }))
    },
    {
      id: 'reservations',
      title: 'Reservas Bica',
      meta: `${reservations.length} reservas`,
      items: reservations.slice(0, 5).map((item) => ({
        title: item.guestName || 'Reserva',
        subtitle: item.status || 'pendente',
        detail: `${item.seats || item.partySize || 0} lugares`
      }))
    },
    {
      id: 'membership',
      title: 'Membership Bica',
      meta: `${membership.members?.length || membership.activeMembers || 0} ativos`,
      items: (membership.members || []).slice(0, 5).map((item) => ({
        title: item.name || item.memberName || 'Membro',
        subtitle: item.status || 'active',
        detail: item.plan || item.tier || 'standard'
      }))
    },
    {
      id: 'quality-gates',
      title: 'Quality Gates',
      meta: `${pendingGates.length} pendentes`,
      items: pendingGates.slice(0, 5).map((item) => ({
        id: item.id,
        title: item.flowName || 'Gate',
        subtitle: item.stepName || item.status || 'pending',
        detail: item.reason || 'sem motivo',
        actions: [
          { id: 'gates.approve', label: 'Aprovar' },
          { id: 'gates.reject', label: 'Rejeitar' }
        ]
      }))
    },
    {
      id: 'contracts',
      title: 'Contratos',
      meta: `${contracts.length} contratos`,
      items: contracts.slice(0, 5).map((item) => ({
        title: item.customerName || 'Contrato',
        subtitle: item.status || 'uploaded',
        detail: item.driveFileId || item.path || 'sem arquivo'
      }))
    },
    {
      id: 'operations',
      title: 'Operacoes',
      meta: `${operations.total || 0} eventos`,
      items: (operations.breakdownByType || []).slice(0, 5).map((item) => ({
        title: item.type,
        subtitle: 'operational event',
        detail: `${item.count}`
      }))
    },
    {
      id: 'tasks',
      title: 'Tarefas',
      meta: `${tasks.length} ativas`,
      items: tasks.slice(0, 10).map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.block || 'geral',
        detail: item.dueDate || 'sem prazo',
        actions: [{ id: 'task.complete', label: 'Concluir' }]
      }))
    },
    {
      id: 'operations-timeline',
      title: 'Timeline operacional',
      meta: `${operationsEvents.length} registros recentes`,
      items: operationsEvents.slice(0, 8).map((item) => ({
        title: item.type || 'operation.event',
        subtitle: item.status || item.flow || 'unknown',
        detail: item.createdAt || item.flow || 'sem timestamp'
      }))
    },
    {
      id: 'recommendation-efficiency',
      title: 'Eficiencia da recomendacao (24h)',
      meta: `${recommendationEvents.length} eventos`,
      items: []
    },
    {
      id: 'analytics',
      title: 'Analytics',
      meta: 'KPI consolidado',
      items: [
        {
          title: 'Receita',
          subtitle: 'Consolidado',
          detail: `${analytics.consolidated?.revenue || 0}`
        },
        {
          title: 'Conversao',
          subtitle: 'Consolidado',
          detail: `${analytics.consolidated?.conversion || 0}`
        },
        {
          title: 'Eficiencia',
          subtitle: 'Consolidado',
          detail: `${analytics.consolidated?.efficiency || 0}`
        }
      ]
    }
  ];

  const allowedCardIds = contract?.cards?.map((card) => card.id);
  const allowedSectionIds = contract?.sections?.map((section) => section.id);
  const visibleCards = cards.filter((card) => {
    if (Array.isArray(allowedCardIds)) {
      return allowedCardIds.includes(card.id);
    }
    return cardAllowed(role, card.id);
  });

  const sectionsWithStatus = sections.map((section) => {
    const statusInfo = determineSectionStatus(section.id, section.items, errors);
    return {
      ...section,
      sectionStatus: statusInfo.status,
      statusMessage: statusInfo.message
    };
  });

  const sectionsById = sectionsWithStatus.reduce((acc, section) => {
    acc[section.id] = section;
    return acc;
  }, {});

  const contractSectionIds = Array.isArray(contract?.sections)
    ? contract.sections.map((section) => normalizeContractSectionId(section.id))
    : null;

  const fallbackSections = sectionsWithStatus
    .filter((section) => {
      if (Array.isArray(allowedSectionIds)) {
        return allowedSectionIds.includes(section.id);
      }
      return sectionAllowed(role, section.id);
    })
    .sort((a, b) => {
      const priorityDiff = sectionPriorityIndex(a.id) - sectionPriorityIndex(b.id);
      if (priorityDiff !== 0) return priorityDiff;
      return a.title.localeCompare(b.title);
    });

  const visibleSections = Array.isArray(contractSectionIds) && contractSectionIds.length
    ? contractSectionIds.map((sectionId) => sectionsById[sectionId]).filter(Boolean)
    : fallbackSections;
  const criticalQueue = pendingReceivables.length + pendingQualityGates.length;
  const operationalFocus = {
    pendingReceivables: pendingReceivables.length,
    leadsToAdvance: nonProposalLeads.length,
    pendingQualityGates: pendingQualityGates.length,
    criticalQueue,
    queueTone: priorityTone(criticalQueue)
  };

  const actions = roleActions(role, operationalFocus);
  const recommendedAction = pickRecommendedAction(actions);
  const recommendationInsights = buildRecommendationInsights(recommendationEvents);
  const recommendationEfficiency = buildRecommendationEfficiency(recommendationEvents);
  const efficiencySection = sectionsWithStatus.find((section) => section.id === 'recommendation-efficiency');
  if (efficiencySection) {
    efficiencySection.items = [
      {
        title: 'Execucoes 24h',
        subtitle: `${recommendationEfficiency.executed} executadas`,
        detail: `${recommendationEfficiency.presented} recomendacoes exibidas`
      },
      {
        title: 'Taxa de sucesso',
        subtitle: `${recommendationEfficiency.successRate}%`,
        detail: `tendencia ${recommendationEfficiency.trend}`
      },
      {
        title: 'Variacao',
        subtitle: `${recommendationEfficiency.delta >= 0 ? '+' : ''}${recommendationEfficiency.delta} pts`,
        detail: 'comparado com as 12h anteriores'
      },
      {
        title: 'Acao dominante',
        subtitle: recommendationEfficiency.topActionId || 'sem execucoes',
        detail: `${recommendationEfficiency.topActionCount} ocorrencia(s)`
      }
    ];
  }

  return {
    state: errors.length ? 'partial' : 'ready',
    tenantId,
    tenantOptions: [
      { id: 'sollu', label: 'Sollu' },
      { id: 'amp213', label: 'AMP 213' },
      { id: 'bica', label: 'Bica Bar' },
      { id: 'pessoal', label: 'Pessoal (Erick)' }
    ],
    role,
    roleLabel: roleLabel(role),
    roleOptions: [
      { id: 'ceo', label: 'CEO' },
      { id: 'commercial', label: 'Comercial' },
      { id: 'operations', label: 'Operacoes' }
    ],
    operationalFocus,
    theme: APP_UI_THEME,
    cards: visibleCards,
    sections: visibleSections,
    actions,
    recommendedAction,
    recommendationInsights,
    recommendationEfficiency,
    contract,
    errors
  };
}
