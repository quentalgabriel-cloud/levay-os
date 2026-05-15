const TONE_CLASS = {
  accent: 'tone-accent',
  success: 'tone-success',
  warning: 'tone-warning',
  danger: 'tone-danger'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderKpis(cards) {
  return cards
    .map((card) => {
      const toneClass = TONE_CLASS[card.tone] || TONE_CLASS.accent;
      return `
        <article class="kpi-card ${toneClass}" aria-label="${escapeHtml(card.label)}">
          <p class="kpi-label">${escapeHtml(card.label)}</p>
          <p class="kpi-value">${escapeHtml(card.value)}</p>
        </article>
      `;
    })
    .join('');
}

function renderTimeline(items) {
  if (!items.length) {
    return '<div class="timeline-empty">Nenhum evento recente.</div>';
  }

  return `
    <ul class="timeline-list">
      ${items
        .map(
          (item) => `
            <li class="timeline-item">
              <div class="timeline-item-header">
                <span class="status-badge ${TONE_CLASS[item.badge.tone] || TONE_CLASS.accent}" aria-label="${escapeHtml(item.assistiveLabel)}">
                  ${escapeHtml(item.badge.label)}
                </span>
                <time class="timeline-time">${escapeHtml(item.timestamp || '')}</time>
              </div>
              <p class="timeline-title">${escapeHtml(item.title)}</p>
              <p class="timeline-subtitle">${escapeHtml(item.subtitle)}</p>
            </li>
          `
        )
        .join('')}
    </ul>
  `;
}

function renderBody(model) {
  if (model.state === 'error') {
    return `
      <section class="state-panel state-error" role="alert">
        <h2>Falha ao carregar o painel</h2>
        <p>${escapeHtml(model.error || 'Erro desconhecido')}</p>
      </section>
    `;
  }

  if (model.state === 'empty' || model.state === 'connecting') {
    return `
      <section class="state-panel state-empty">
        <h2>${escapeHtml(model.emptyState?.title || 'Sem dados')}</h2>
        <p>${escapeHtml(model.emptyState?.description || '')}</p>
      </section>
    `;
  }

  return `
    <section class="kpi-grid">
      ${renderKpis(model.heroKpis || [])}
    </section>

    <section class="timeline-panel">
      <header class="panel-header">
        <h2>Timeline Operacional</h2>
      </header>
      ${renderTimeline(model.timeline || [])}
    </section>
  `;
}

export function renderOperationsScreenHtml(model) {
  return `
    <section class="ops-screen ${escapeHtml(model.layout?.shell || 'desktop-three-zone')}" data-tenant="${escapeHtml(
      model.topBar?.tenantTag || 'all'
    )}">
      <header class="ops-topbar">
        <div class="topbar-title-wrap">
          <h1>${escapeHtml(model.topBar?.title || 'Painel Operacional')}</h1>
          <span class="tenant-tag">${escapeHtml(model.topBar?.tenantTag || 'all')}</span>
        </div>
        <div class="connection-tag" aria-live="polite">${escapeHtml(model.topBar?.connectionLabel || 'Inativo')}</div>
      </header>

      <main class="ops-main">
        ${renderBody(model)}
      </main>

      <aside class="ops-rail">
        <h3>${escapeHtml(model.rightRail?.title || 'Acoes Rapidas')}</h3>
        <ul>
          ${(model.rightRail?.actions || [])
            .map((action) => `<li><button type="button" data-action="${escapeHtml(action.id)}">${escapeHtml(action.label)}</button></li>`)
            .join('')}
        </ul>
      </aside>
    </section>
  `.trim();
}

export const OPERATIONS_SCREEN_CSS = `
.ops-screen {
  --ops-canvas: var(--semantic-color-background-canvas);
  --ops-surface: var(--semantic-color-background-surface);
  --ops-elevated: var(--semantic-color-background-elevated);
  --ops-text-primary: var(--semantic-color-text-primary);
  --ops-text-secondary: var(--semantic-color-text-secondary);
  --ops-border: var(--semantic-color-border-default);
  --ops-accent: var(--semantic-color-kpi-highlight);
  --ops-success: var(--core-color-success-500);
  --ops-warning: var(--core-color-warning-500);
  --ops-danger: var(--core-color-error-500);

  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 20px;
  background: var(--ops-canvas);
  color: var(--ops-text-primary);
  font-family: Inter, system-ui, sans-serif;
}

.ops-screen.desktop-three-zone {
  grid-template-columns: 1fr 300px;
}

.ops-topbar {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--ops-surface);
  border: 1px solid var(--ops-border);
  border-radius: 12px;
  padding: 14px 16px;
}

.topbar-title-wrap h1 {
  margin: 0;
  font-family: Manrope, sans-serif;
  font-size: 1.15rem;
}

.tenant-tag,
.connection-tag {
  color: var(--ops-text-secondary);
  font-size: 0.88rem;
}

.ops-main,
.ops-rail {
  background: var(--ops-surface);
  border: 1px solid var(--ops-border);
  border-radius: 12px;
  padding: 16px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.kpi-card {
  background: var(--ops-elevated);
  border: 1px solid var(--ops-border);
  border-radius: 10px;
  padding: 12px;
}

.kpi-label {
  margin: 0;
  color: var(--ops-text-secondary);
  font-size: 0.8rem;
}

.kpi-value {
  margin: 4px 0 0;
  font-family: "JetBrains Mono", monospace;
  font-size: 1.15rem;
}

.timeline-panel {
  margin-top: 16px;
}

.timeline-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.timeline-item {
  background: var(--ops-elevated);
  border: 1px solid var(--ops-border);
  border-radius: 10px;
  padding: 10px 12px;
}

.timeline-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.status-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid currentColor;
}

.timeline-title {
  margin: 6px 0 2px;
  font-size: 0.9rem;
}

.timeline-subtitle,
.timeline-time {
  margin: 0;
  color: var(--ops-text-secondary);
  font-size: 0.78rem;
}

.tone-accent { color: var(--ops-accent); }
.tone-success { color: var(--ops-success); }
.tone-warning { color: var(--ops-warning); }
.tone-danger { color: var(--ops-danger); }

@media (max-width: 900px) {
  .ops-screen.desktop-three-zone,
  .ops-screen.tablet-split,
  .ops-screen.mobile-stack {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
`.trim();
