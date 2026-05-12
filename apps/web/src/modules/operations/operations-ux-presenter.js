export const OPERATIONS_UI_THEME = {
  typography: {
    display: 'Manrope',
    body: 'Inter',
    mono: 'JetBrains Mono'
  },
  color: {
    canvas: '{semantic.color.background-canvas}',
    surface: '{semantic.color.background-surface}',
    elevated: '{semantic.color.background-elevated}',
    textPrimary: '{semantic.color.text-primary}',
    textSecondary: '{semantic.color.text-secondary}',
    textMuted: '{semantic.color.text-muted}',
    border: '{semantic.color.border-default}',
    accent: '{semantic.color.kpi-highlight}',
    success: '{core.color.success-500}',
    warning: '{core.color.warning-500}',
    danger: '{core.color.error-500}',
    tenantSollu: '{semantic.color.tenant-sollu}'
  },
  motion: {
    quick: '160ms ease-out',
    standard: '220ms ease-out'
  }
};

function statusMeta(status) {
  if (status === 'success') {
    return { icon: 'check-circle', label: 'Sucesso', tone: 'success' };
  }
  if (status === 'retry') {
    return { icon: 'rotate-cw', label: 'Retry', tone: 'warning' };
  }
  if (status === 'dead-letter') {
    return { icon: 'alert-triangle', label: 'Dead-letter', tone: 'danger' };
  }
  return { icon: 'dot', label: status || 'Desconhecido', tone: 'accent' };
}

function toTimelineItems(events) {
  return events.map((event) => {
    const meta = statusMeta(event.status);
    return {
      id: event.id,
      title: event.title,
      subtitle: event.subtitle,
      timestamp: event.occurredAt,
      badge: {
        icon: meta.icon,
        label: meta.label,
        tone: meta.tone
      },
      tenantId: event.tenantId,
      flow: event.flow,
      actorType: event.actorType,
      assistiveLabel: `${meta.label}: ${event.title}`
    };
  });
}

function layoutForViewport(viewport) {
  if (viewport === 'mobile') {
    return {
      shell: 'mobile-stack',
      zones: ['topBar', 'main', 'bottomNav']
    };
  }
  if (viewport === 'tablet') {
    return {
      shell: 'tablet-split',
      zones: ['topBar', 'main', 'drawerRail']
    };
  }
  return {
    shell: 'desktop-three-zone',
    zones: ['topBar', 'leftNav', 'main', 'rightRail']
  };
}

export function buildOperationsScreenModel(panelViewModel, { viewport = 'desktop', role = 'operations' } = {}) {
  const layout = layoutForViewport(viewport);
  const timeline = toTimelineItems(panelViewModel.events || []);

  return {
    role,
    viewport,
    state: panelViewModel.state,
    theme: OPERATIONS_UI_THEME,
    layout,
    topBar: {
      title: panelViewModel.header?.title || 'Painel Operacional',
      tenantTag: panelViewModel.header?.tenantId || 'all',
      connectionLabel: panelViewModel.header?.connectionLabel || 'Inativo'
    },
    heroKpis: panelViewModel.cards || [],
    timeline,
    rightRail: {
      title: 'Acoes Rapidas',
      actions: [
        { id: 'refresh-summary', label: 'Atualizar indicadores', kind: 'secondary' },
        { id: 'open-quality-gates', label: 'Abrir Quality Gates', kind: 'primary' }
      ]
    },
    emptyState: panelViewModel.emptyState || null,
    error: panelViewModel.error || null
  };
}
