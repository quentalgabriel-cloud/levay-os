export const OPERATIONS_PANEL_TOKENS = {
  panelBg: '{semantic.color.background-surface}',
  panelBorder: '{semantic.color.border-default}',
  headline: '{semantic.color.text-primary}',
  accent: '{semantic.color.kpi-highlight}',
  success: '{semantic.color.success}',
  warning: '{semantic.color.warning}',
  danger: '{semantic.color.error}'
};

function buildKpiCards(counters) {
  return [
    {
      id: 'total',
      label: 'Total de eventos',
      value: counters.total,
      tone: 'accent'
    },
    {
      id: 'success',
      label: 'Sucesso',
      value: counters.success,
      tone: 'success'
    },
    {
      id: 'retry',
      label: 'Retry',
      value: counters.retry,
      tone: 'warning'
    },
    {
      id: 'dead-letter',
      label: 'Dead-letter',
      value: counters.deadLetter,
      tone: 'danger'
    }
  ];
}

function formatEventLabel(event) {
  return event.type ? event.type.replace(/\./g, ' · ') : 'Evento operacional';
}

function buildRecentEvents(events, limit = 6) {
  return events.slice(0, limit).map((event) => ({
    id: event.id,
    title: formatEventLabel(event),
    subtitle: event.payload?.leadId || event.payload?.messageId || event.flow || 'Fluxo operacional',
    status: event.status,
    statusTone:
      event.status === 'success' ? 'success' : event.status === 'retry' ? 'warning' : 'danger',
    tenantId: event.tenantId,
    flow: event.flow,
    occurredAt: event.createdAt,
    actorType: event.actorType,
    payload: event.payload || {}
  }));
}

function buildHeader(viewModel) {
  return {
    title: 'Painel Operacional',
    tenantId: viewModel.tenantId || 'all',
    connectionStatus: viewModel.connectionStatus,
    connectionLabel:
      viewModel.connectionStatus === 'connecting'
        ? 'Conectando'
        : viewModel.connectionStatus === 'connected'
          ? 'Conectado'
          : viewModel.connectionStatus === 'error'
            ? 'Erro'
            : 'Inativo'
  };
}

function buildEmptyState(viewModel) {
  if (viewModel.connectionStatus === 'connecting') {
    return {
      title: 'Conectando ao fluxo operacional',
      description: 'Aguardando o stream de eventos da Sollu.',
      actionLabel: 'Aguardar sincronizacao'
    };
  }

  return {
    title: 'Sem eventos operacionais',
    description: 'Nenhum follow-up, retry ou dead-letter registrado ainda.',
    actionLabel: 'Aguardando atividade'
  };
}

export class OperationsPanel {
  constructor(monitor) {
    this.monitor = monitor;
  }

  getViewModel(filters = {}) {
    const monitorViewModel = this.monitor.getViewModel(filters);
    const cards = buildKpiCards(monitorViewModel.counters || {
      total: 0,
      success: 0,
      retry: 0,
      deadLetter: 0
    });
    const events = buildRecentEvents(monitorViewModel.events || []);
    const header = buildHeader(monitorViewModel);
    const emptyState = buildEmptyState(monitorViewModel);

    if (monitorViewModel.error) {
      return {
        state: 'error',
        tokens: OPERATIONS_PANEL_TOKENS,
        header,
        error: monitorViewModel.error,
        cards,
        events: [],
        emptyState: {
          title: 'Falha ao carregar o painel',
          description: monitorViewModel.error,
          actionLabel: 'Tentar novamente'
        }
      };
    }

    if (monitorViewModel.connectionStatus === 'connecting') {
      return {
        state: 'connecting',
        tokens: OPERATIONS_PANEL_TOKENS,
        header,
        cards,
        events,
        emptyState
      };
    }

    if (cards.every((card) => card.value === 0)) {
      return {
        state: 'empty',
        tokens: OPERATIONS_PANEL_TOKENS,
        header,
        cards,
        events: [],
        emptyState
      };
    }

    return {
      state: 'ready',
      tokens: OPERATIONS_PANEL_TOKENS,
      header,
      filters: {
        tenantId: monitorViewModel.tenantId || null,
        type: filters.type || null,
        status: filters.status || null
      },
      cards,
      events
    };
  }
}

export { buildKpiCards, buildRecentEvents, buildHeader, buildEmptyState };
