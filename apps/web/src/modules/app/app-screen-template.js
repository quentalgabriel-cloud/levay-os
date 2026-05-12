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

function renderCards(cards) {
  return cards
    .map((card) => `
      <article class="app-kpi ${TONE_CLASS[card.tone] || TONE_CLASS.accent}">
        <p class="app-kpi-label">${escapeHtml(card.label)}</p>
        <p class="app-kpi-value">${escapeHtml(card.value)}</p>
      </article>
    `)
    .join('');
}

const NAV_LABELS = {
  priorities: { label: 'Prioridades', short: 'PR' },
  crm: { label: 'CRM Sollu', short: 'CR' },
  billing: { label: 'Cobrancas', short: 'CB' },
  'quality-gates': { label: 'Quality Gates', short: 'QG' },
  contracts: { label: 'Contratos', short: 'CT' },
  operations: { label: 'Operacoes', short: 'OP' },
  'operations-timeline': { label: 'Timeline', short: 'TL' },
  'recommendation-efficiency': { label: 'Eficiencia', short: 'EF' },
  analytics: { label: 'Analytics', short: 'AN' },
  events: { label: 'Eventos', short: 'EV' },
  reservations: { label: 'Reservas', short: 'RS' },
  membership: { label: 'Membership', short: 'MB' }
};

const PRIORITY_SECTIONS = {
  crm: { badge: 'Prioridade CRM', tone: 'accent' },
  billing: { badge: 'Prioridade cobranca', tone: 'warning' }
};

function sectionPriority(sectionId) {
  return PRIORITY_SECTIONS[sectionId] || null;
}

function buildNavItems(sections = []) {
  const items = sections.map((section) => {
    const preset = NAV_LABELS[section.id] || {};
    const label = preset.label || section.title || section.id;
    const short = preset.short || label
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return {
      id: section.id,
      label,
      short,
      count: section.items?.length || 0,
      meta: section.meta || ''
    };
  });
  return [
    {
      id: 'all',
      label: 'Visao geral',
      short: 'VG',
      count: sections.length,
      meta: 'Todas as frentes'
    },
    ...items
  ];
}

function renderSidebar(model) {
  const navItems = buildNavItems(model.sections || []);
  const focus = model.operationalFocus || {};
  const contractRole = model.contract?.role || model.roleLabel?.toLowerCase() || model.role || 'operacoes';
  const cardsCount = (model.contract?.cards || model.cards || []).length;
  const sectionsCount = (model.contract?.sections || model.sections || []).length;
  return `
    <aside class="levay-sidebar" data-sidebar>
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <div class="sidebar-logo">LO</div>
          <div class="sidebar-brand-text">
            <span>Levay OS</span>
            <small>${escapeHtml(model.tenantId || 'sollu')}</small>
          </div>
        </div>
        <button type="button" class="sidebar-toggle" data-sidebar-toggle>Recolher</button>
      </div>
      <div class="sidebar-metrics">
        <p class="sidebar-label">Fila critica</p>
        <div class="sidebar-metric">
          <span>${escapeHtml(focus.criticalQueue || 0)} itens</span>
          <small>${escapeHtml(focus.pendingReceivables || 0)} cobrancas · ${escapeHtml(focus.pendingQualityGates || 0)} gates</small>
        </div>
      </div>
      <div class="sidebar-contract">
        <p>Visão contratada</p>
        <strong>${escapeHtml(contractRole)}</strong>
        <small>${cardsCount} cards · ${sectionsCount} seções</small>
      </div>
      <div class="sidebar-nav">
        <p class="sidebar-label">Navegacao</p>
        ${navItems
          .map(
            (item) => `
            <button type="button" class="sidebar-item ${sectionPriority(item.id) ? 'is-priority' : ''}" data-nav-target="${escapeHtml(item.id)}">
              <span class="sidebar-icon">${escapeHtml(item.short)}</span>
              <span class="sidebar-text">${escapeHtml(item.label)}</span>
              <span class="sidebar-pill">${escapeHtml(item.count)}</span>
            </button>
          `
          )
          .join('')}
      </div>
      <div class="sidebar-footer">
        <p>${escapeHtml(model.roleLabel || 'Operacoes')}</p>
        <small>Perfil ativo</small>
      </div>
    </aside>
  `;
}

function renderSections(sections) {
  return sections
    .map((section) => `
      <section class="app-section ${sectionPriority(section.id) ? 'is-priority' : ''}" data-section-anchor="${escapeHtml(section.id)}">
        <header class="app-section-header">
          <div>
            <h2>${escapeHtml(section.title)}</h2>
            <span>${escapeHtml(section.meta || '')}</span>
          </div>
          ${
            sectionPriority(section.id)
              ? `<span class="section-badge badge-${escapeHtml(sectionPriority(section.id).tone)}">${escapeHtml(sectionPriority(section.id).badge)}</span>`
              : ''
          }
        </header>
        ${section.sectionStatus && section.sectionStatus !== 'ready' ? `<div class="section-status section-status-${escapeHtml(section.sectionStatus)}">${escapeHtml(section.statusMessage)}</div>` : ''}
        <ul class="app-list">
          ${section.items.length
            ? section.items.map((item) => `
            <li class="app-list-item">
              <div data-section-id="${escapeHtml(section.id)}" data-filter-text="${escapeHtml(`${item.title || ''} ${item.subtitle || ''} ${item.detail || ''}`)}"></div>
              <p class="app-item-title">${escapeHtml(item.title)}</p>
              <div class="app-item-meta">
                ${
                  item.subtitle
                    ? `<span class="app-item-pill pill-${escapeHtml(inferStatusTone(section.id, item))}">${escapeHtml(item.subtitle)}</span>`
                    : ''
                }
                <span class="app-item-detail">${escapeHtml(item.detail)}</span>
              </div>
              ${(item.actions || []).length ? `
                <div class="app-item-actions">
                  ${(item.actions || [])
                    .map(
                      (action) => `
                        <button
                          type="button"
                          data-item-action="${escapeHtml(action.id)}"
                          data-section-id="${escapeHtml(section.id)}"
                          data-item-id="${escapeHtml(item.id || '')}"
                        >
                          ${escapeHtml(action.label)}
                        </button>
                      `
                    )
                    .join('')}
                </div>
              ` : ''}
            </li>
          `).join('')
            : '<li class="app-list-empty">Sem itens para o filtro atual.</li>'}
        </ul>
      </section>
    `)
    .join('');
}

function renderErrors(errors) {
  if (!errors.length) return '';
  return `
    <section class="app-errors" role="alert">
      <h2>Recursos com falha parcial</h2>
      <ul>
        ${errors.map((error) => `<li>${escapeHtml(error.resource)}: ${escapeHtml(error.message)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderFeedback(feedback) {
  if (!feedback?.message) {
    return '<section class="app-feedback is-hidden" aria-live="polite" data-feedback></section>';
  }
  const toneClass = feedback.tone === 'error' ? 'is-error' : feedback.tone === 'success' ? 'is-success' : 'is-info';
  return `
    <section class="app-feedback ${toneClass}" aria-live="polite" data-feedback>
      ${escapeHtml(feedback.message)}
    </section>
  `;
}

function renderControls(sections) {
  const chipOptions = [
    { id: 'all', label: 'Todos' },
    ...sections.map((section) => ({ id: section.id, label: section.title }))
  ];
  return `
    <section class="app-controls">
      <label>
        Busca rapida
        <input type="search" placeholder="Buscar por nome, status ou detalhe" data-search-input />
      </label>
      <label>
        Filtro de modulo
        <select data-section-filter>
          <option value="all">Todos os modulos</option>
          ${sections.map((section) => `<option value="${escapeHtml(section.id)}">${escapeHtml(section.title)}</option>`).join('')}
        </select>
      </label>
      <div class="app-filter-chips">
        ${chipOptions
          .map(
            (option) => `
            <button type="button" class="app-filter-chip" data-filter-chip="${escapeHtml(option.id)}">
              ${escapeHtml(option.label)}
            </button>
          `
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderOperationalFocus(focus = {}) {
  const focusItems = [
    {
      id: 'billing',
      label: 'Cobrancas pendentes',
      value: focus.pendingReceivables || 0,
      detail: 'Recuperar receita perdida',
      action: 'billing.bulk.collect.pending',
      actionLabel: 'Cobrar agora',
      tone: 'warning'
    },
    {
      id: 'crm',
      label: 'Leads sem proposta',
      value: focus.leadsToAdvance || 0,
      detail: 'Evitar esfriamento do funil',
      action: 'crm.bulk.advance.proposal',
      actionLabel: 'Avancar leads',
      tone: 'accent'
    },
    {
      id: 'gates',
      label: 'Quality gates pendentes',
      value: focus.pendingQualityGates || 0,
      detail: 'Destravar execucao',
      action: 'gates.bulk.approve.pending',
      actionLabel: 'Aprovar gates',
      tone: 'danger'
    }
  ];

  return `
    <section class="app-focus">
      ${focusItems
        .map(
          (item) => `
          <article class="app-focus-card tone-${escapeHtml(item.tone)}">
            <div>
              <p class="app-focus-label">${escapeHtml(item.label)}</p>
              <p class="app-focus-value">${escapeHtml(item.value)}</p>
              <p class="app-focus-detail">${escapeHtml(item.detail)}</p>
            </div>
            ${
              item.value > 0
                ? `<button type="button" data-action="${escapeHtml(item.action)}">${escapeHtml(item.actionLabel)}</button>`
                : `<span class="app-focus-empty">Sem fila</span>`
            }
          </article>
        `
        )
        .join('')}
    </section>
  `;
}

function inferStatusTone(sectionId, item = {}) {
  const text = `${item.subtitle || ''} ${item.detail || ''}`.toLowerCase();
  if (text.includes('rejeit') || text.includes('overdue') || text.includes('falha') || text.includes('error')) {
    return 'danger';
  }
  if (text.includes('pend') || text.includes('aguard') || text.includes('pending')) {
    return 'warning';
  }
  if (text.includes('aprov') || text.includes('pago') || text.includes('paid') || text.includes('ativo')) {
    return 'success';
  }
  if (sectionId === 'quality-gates') return 'warning';
  if (sectionId === 'billing') return 'warning';
  return 'accent';
}

function renderRecommendedAction(recommendedAction, recommendationInsights) {
  if (!recommendedAction) {
    return `
      <section class="app-recommended">
        <p class="app-recommended-eyebrow">Proxima melhor acao</p>
        <p class="app-recommended-title">Nenhuma fila critica no momento</p>
      </section>
    `;
  }

  return `
    <section class="app-recommended is-actionable">
      <div>
        <p class="app-recommended-eyebrow">Proxima melhor acao</p>
        <p class="app-recommended-title">${escapeHtml(recommendedAction.label)}</p>
        <p class="app-recommended-meta">
          Fila: ${escapeHtml(recommendedAction.queueSize || 0)} item(ns) · Score: ${escapeHtml(Math.round(recommendedAction.priorityScore || 0))}
        </p>
        ${
          recommendationInsights?.executions
            ? `<p class="app-recommended-meta">Execucoes: ${escapeHtml(recommendationInsights.executions)} · Sucesso: ${escapeHtml(recommendationInsights.successRate ?? 0)}%</p>`
            : ''
        }
      </div>
      <button
        type="button"
        data-action="execute-recommended"
        data-recommended-action-id="${escapeHtml(recommendedAction.id)}"
      >
        Executar agora
      </button>
    </section>
  `;
}

export function renderAppScreenHtml(model) {
  const sidebar = renderSidebar(model);
  const lastUpdatedAt = model.lastUpdatedAt || 'agora';
  const focus = model.operationalFocus || {};
  return `
    <section class="levay-app-shell" data-tenant="${escapeHtml(model.tenantId)}">
      ${sidebar}
      <main class="levay-app-main">
        <header class="levay-app-topbar">
          <div>
            <p class="eyebrow">Levay OS</p>
            <h1>Centro de Operacoes</h1>
            <p class="role-indicator">Perfil ativo: ${escapeHtml(model.roleLabel || 'Operacoes')}</p>
            <div class="topbar-meta">
              <span class="topbar-chip">Atualizado ${escapeHtml(lastUpdatedAt)}</span>
              <span class="topbar-chip tone-${escapeHtml(focus.queueTone || 'accent')}">Fila critica: ${escapeHtml(focus.criticalQueue || 0)}</span>
            </div>
            <div class="app-contract-banner">
              <p>Dashboard contratado</p>
              <strong>${escapeHtml(model.contract?.role || model.role || 'operacoes')}</strong>
              <span>${escapeHtml((model.contract?.cards || []).length || 0)} cards · ${escapeHtml((model.contract?.sections || []).length || 0)} seções</span>
            </div>
            <div class="tenant-switcher">
              ${(model.tenantOptions || []).map((tenant) => `
                <button
                  type="button"
                  data-tenant-switch="${escapeHtml(tenant.id)}"
                  class="${tenant.id === model.tenantId ? 'tenant-active' : ''}"
                >
                  ${escapeHtml(tenant.label)}
                </button>
              `).join('')}
            </div>
            <div class="role-switcher">
              ${(model.roleOptions || []).map((role) => `
                <button
                  type="button"
                  data-role-switch="${escapeHtml(role.id)}"
                  class="${role.id === model.role ? 'role-active' : ''}"
                >
                  ${escapeHtml(role.label)}
                </button>
              `).join('')}
            </div>
            ${model.persistedProfileActive && model.persistedProfile ? `
              <div class="topbar-persisted">
                Perfil gravado: ${escapeHtml(model.persistedProfile.role || model.role)} · ${escapeHtml(model.persistedProfile.tenantId || model.tenantId)}
              </div>
            ` : ''}
          </div>
          <div class="topbar-actions">
            ${model.actions.map((action) => `<button type="button" data-action="${escapeHtml(action.id)}" class="action-${escapeHtml(action.kind)}">${escapeHtml(action.label)}</button>`).join('')}
          </div>
        </header>
        ${renderFeedback(model.feedback)}
        ${renderRecommendedAction(model.recommendedAction, model.recommendationInsights)}
        ${renderOperationalFocus(model.operationalFocus)}
        ${renderControls(model.sections || [])}
        ${renderErrors(model.errors || [])}
        <section class="app-kpi-grid">
          ${renderCards(model.cards || [])}
        </section>
        <section class="app-sections-grid">
          ${renderSections(model.sections || [])}
        </section>
      </main>
    </section>
  `.trim();
}

export const APP_SCREEN_CSS = `
.levay-app-shell {
  --app-canvas: var(--semantic-color-background-canvas);
  --app-surface: var(--semantic-color-background-surface);
  --app-elevated: var(--semantic-color-background-elevated);
  --app-text-primary: var(--semantic-color-text-primary);
  --app-text-secondary: var(--semantic-color-text-secondary);
  --app-border: var(--semantic-color-border-default);
  --app-accent: var(--semantic-color-kpi-highlight);
  --app-success: var(--core-color-success-500);
  --app-warning: var(--core-color-warning-500);
  --app-danger: var(--core-color-error-500);

  min-height: 100vh;
  display: flex;
  gap: 0;
  background:
    radial-gradient(circle at top left, rgba(211, 181, 119, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(255,255,255,0.02), transparent 25%),
    var(--app-canvas);
  color: var(--app-text-primary);
  font-family: Inter, system-ui, sans-serif;
}

.levay-app-main {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.topbar-persisted {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--app-text-secondary);
  margin-top: 6px;
}

.topbar-persisted span {
  font-weight: 600;
}

.levay-sidebar {
  width: 248px;
  min-height: 100vh;
  background: var(--app-surface);
  border-right: 1px solid var(--app-border);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: 0;
}

.levay-app-shell.is-collapsed .levay-sidebar {
  width: 80px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-logo {
  height: 42px;
  width: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(211,181,119,0.35), rgba(211,181,119,0.1));
  display: grid;
  place-items: center;
  font-weight: 700;
  color: var(--app-text-primary);
}

.sidebar-brand-text {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

.sidebar-brand-text small {
  color: var(--app-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.65rem;
}

.sidebar-toggle {
  border: 1px solid var(--app-border);
  background: var(--app-elevated);
  color: var(--app-text-secondary);
  border-radius: 999px;
  font-size: 0.7rem;
  padding: 6px 10px;
  cursor: pointer;
}

.sidebar-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--app-text-secondary);
  margin: 0 0 8px;
}

.sidebar-metric {
  display: grid;
  gap: 4px;
  background: var(--app-elevated);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 0.82rem;
}

.sidebar-metric small {
  color: var(--app-text-secondary);
  font-size: 0.7rem;
}

.sidebar-nav {
  display: grid;
  gap: 8px;
}

.sidebar-contract {
  margin: 16px 0;
  padding: 12px;
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(214, 177, 90, 0.25), rgba(50, 34, 78, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f5f3ec;
}

.sidebar-contract strong {
  font-size: 1rem;
  margin-bottom: 2px;
  display: block;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  padding: 8px 10px;
  background: transparent;
  color: var(--app-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-item:hover {
  background: var(--app-elevated);
  color: var(--app-text-primary);
}

.sidebar-item.is-active {
  background: linear-gradient(135deg, rgba(211,181,119,0.2), rgba(211,181,119,0.05));
  border-color: rgba(211,181,119,0.35);
  color: var(--app-text-primary);
}

.sidebar-item.is-priority {
  border-color: rgba(214, 177, 90, 0.25);
}

.sidebar-item.is-priority .sidebar-icon {
  border-color: rgba(214, 177, 90, 0.4);
  color: var(--app-warning);
}

.sidebar-icon {
  height: 32px;
  width: 32px;
  border-radius: 10px;
  background: var(--app-elevated);
  border: 1px solid var(--app-border);
  display: grid;
  place-items: center;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--app-text-primary);
}

.sidebar-text {
  font-size: 0.85rem;
  font-weight: 600;
}

.sidebar-pill {
  margin-left: auto;
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--app-border);
  background: var(--app-elevated);
  color: var(--app-text-secondary);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--app-border);
  display: grid;
  gap: 4px;
  font-size: 0.8rem;
}

.sidebar-footer small {
  color: var(--app-text-secondary);
  font-size: 0.7rem;
}

.levay-app-shell.is-collapsed .sidebar-brand-text,
.levay-app-shell.is-collapsed .sidebar-label,
.levay-app-shell.is-collapsed .sidebar-text,
.levay-app-shell.is-collapsed .sidebar-pill,
.levay-app-shell.is-collapsed .sidebar-metrics,
.levay-app-shell.is-collapsed .sidebar-footer {
  display: none;
}

.levay-app-shell.is-collapsed .sidebar-header {
  justify-content: center;
}

.levay-app-shell.is-collapsed .sidebar-item {
  justify-content: center;
  padding: 8px;
}

.levay-app-topbar,
.app-errors,
.app-section,
.app-kpi {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 16px;
}

.levay-app-topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  margin-bottom: 18px;
  position: sticky;
  top: 0;
  z-index: 5;
  backdrop-filter: blur(6px);
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--app-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
}

.levay-app-topbar h1 {
  margin: 0;
  font-family: Manrope, sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
}

.topbar-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.role-indicator {
  margin: 10px 0 6px;
  color: var(--app-text-secondary);
  font-size: 0.82rem;
}

.topbar-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.topbar-chip {
  border-radius: 999px;
  border: 1px solid var(--app-border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--app-text-secondary);
  font-size: 0.7rem;
  padding: 4px 10px;
}

.role-switcher {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tenant-switcher {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.tenant-switcher button,
.role-switcher button {
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: #fff;
  font-size: 0.75rem;
  padding: 6px 12px;
  cursor: pointer;
}

.tenant-switcher button.tenant-active {
  background: rgba(211, 181, 119, 0.35);
  border-color: rgba(211, 181, 119, 0.6);
}

.role-switcher button.role-active {
  background: linear-gradient(135deg, rgba(211, 181, 119, 0.45), rgba(211, 181, 119, 0.2));
  border-color: rgba(211, 181, 119, 0.6);
}

.topbar-actions button {
  border-radius: 999px;
  padding: 10px 14px;
  border: 1px solid var(--app-border);
  cursor: pointer;
  color: var(--app-text-primary);
  background: var(--app-elevated);
}

.topbar-actions .action-primary {
  background: linear-gradient(135deg, rgba(211,181,119,0.18), rgba(211,181,119,0.08));
  border-color: rgba(211,181,119,0.35);
}

.app-contract-banner {
  margin-top: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-contract-banner strong {
  font-size: 1rem;
  color: #fefcf4;
}

.app-contract-banner span {
  font-size: 0.75rem;
  opacity: 0.9;
}

.app-errors {
  margin-bottom: 18px;
  padding: 16px 18px;
}

.app-feedback {
  margin-bottom: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
}

.app-feedback.is-hidden {
  display: none;
}

.app-feedback.is-success {
  border-color: rgba(78, 158, 114, 0.45);
  background: linear-gradient(180deg, rgba(78, 158, 114, 0.14), transparent), var(--app-surface);
}

.app-feedback.is-error {
  border-color: rgba(194, 97, 82, 0.45);
  background: linear-gradient(180deg, rgba(194, 97, 82, 0.14), transparent), var(--app-surface);
}

.app-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.app-recommended {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  position: sticky;
  top: 96px;
  z-index: 4;
}

.app-recommended.is-actionable {
  background: linear-gradient(180deg, rgba(211,181,119,0.12), transparent), var(--app-surface);
  border-color: rgba(211,181,119,0.35);
}

.app-recommended-eyebrow {
  margin: 0 0 4px;
  color: var(--app-text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.app-recommended-title {
  margin: 0;
  font-weight: 600;
}

.app-recommended-meta {
  margin: 6px 0 0;
  color: var(--app-text-secondary);
  font-size: 0.8rem;
}

.app-recommended button {
  border-radius: 999px;
  border: 1px solid var(--app-border);
  background: var(--app-elevated);
  color: var(--app-text-primary);
  padding: 8px 12px;
  cursor: pointer;
}

.app-focus {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.app-focus-card {
  border-radius: 14px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.app-focus-label {
  margin: 0;
  color: var(--app-text-secondary);
  font-size: 0.78rem;
}

.app-focus-value {
  margin: 6px 0 0;
  font-family: "JetBrains Mono", monospace;
  font-size: 1.4rem;
}

.app-focus-detail {
  margin: 6px 0 0;
  color: var(--app-text-secondary);
  font-size: 0.72rem;
}

.app-focus-card button {
  border-radius: 999px;
  border: 1px solid var(--app-border);
  background: rgba(255, 255, 255, 0.02);
  color: var(--app-text-primary);
  padding: 6px 10px;
  font-size: 0.75rem;
  cursor: pointer;
}

.app-focus-empty {
  color: var(--app-text-secondary);
  font-size: 0.75rem;
}

.app-controls label {
  display: grid;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--app-text-secondary);
}

.app-controls input,
.app-controls select {
  border-radius: 10px;
  border: 1px solid var(--app-border);
  background: var(--app-elevated);
  color: var(--app-text-primary);
  padding: 10px 12px;
}

.app-filter-chips {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.app-filter-chip {
  border-radius: 999px;
  border: 1px solid var(--app-border);
  background: var(--app-elevated);
  color: var(--app-text-secondary);
  font-size: 0.7rem;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-filter-chip:hover {
  color: var(--app-text-primary);
  border-color: rgba(211,181,119,0.35);
}

.app-filter-chip.is-active {
  color: var(--app-text-primary);
  border-color: rgba(211,181,119,0.45);
  background: linear-gradient(135deg, rgba(211,181,119,0.18), rgba(211,181,119,0.05));
}

.app-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.app-kpi {
  padding: 14px 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent), var(--app-surface);
}

.app-kpi-label,
.app-item-subtitle,
.app-section-header span,
.app-item-detail {
  color: var(--app-text-secondary);
}

.app-kpi-value {
  margin: 6px 0 0;
  font-family: "JetBrains Mono", monospace;
  font-size: 1.3rem;
}

.app-sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.app-section {
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01)), var(--app-surface);
  box-shadow: 0 12px 40px rgba(16, 16, 16, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.app-section:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 50px rgba(8, 8, 8, 0.25);
}

.app-section-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: baseline;
  margin-bottom: 12px;
}

.app-section-header > div {
  display: grid;
  gap: 4px;
}

.app-section.is-priority {
  border-color: rgba(214, 177, 90, 0.4);
  background: linear-gradient(180deg, rgba(214, 177, 90, 0.08), transparent), var(--app-surface);
}

.section-badge {
  border-radius: 999px;
  border: 1px solid var(--app-border);
  padding: 4px 10px;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.section-badge.badge-accent {
  border-color: rgba(211,181,119,0.45);
  color: var(--app-accent);
  background: rgba(211,181,119,0.12);
}

.section-badge.badge-warning {
  border-color: rgba(214, 177, 90, 0.45);
  color: var(--app-warning);
  background: rgba(214, 177, 90, 0.12);
}

.section-status {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.78rem;
  border: 1px solid transparent;
}

.section-status-empty {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.04);
  color: var(--app-text-secondary);
}

.section-status-error {
  border-color: rgba(194, 97, 82, 0.6);
  background: rgba(194, 97, 82, 0.12);
  color: var(--app-danger);
}

.app-section-header h2 {
  margin: 0;
  font-family: Manrope, sans-serif;
  font-size: 1rem;
}

.app-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.app-list-item {
  padding: 12px;
  border-radius: 12px;
  background: var(--app-elevated);
  border: 1px solid var(--app-border);
}

.app-item-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.app-item-actions button {
  border-radius: 999px;
  border: 1px solid var(--app-border);
  background: rgba(255, 255, 255, 0.02);
  color: var(--app-text-primary);
  font-size: 0.75rem;
  padding: 6px 10px;
  cursor: pointer;
}

.app-item-title,
.app-item-detail {
  margin: 0;
}

.app-item-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.app-item-pill {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid var(--app-border);
  background: rgba(255, 255, 255, 0.03);
}

.app-item-pill.pill-success {
  border-color: rgba(78, 158, 114, 0.45);
  color: var(--app-success);
  background: rgba(78, 158, 114, 0.12);
}

.app-item-pill.pill-warning {
  border-color: rgba(214, 177, 90, 0.45);
  color: var(--app-warning);
  background: rgba(214, 177, 90, 0.12);
}

.app-item-pill.pill-danger {
  border-color: rgba(194, 97, 82, 0.45);
  color: var(--app-danger);
  background: rgba(194, 97, 82, 0.12);
}

.app-item-pill.pill-accent {
  border-color: rgba(211, 181, 119, 0.45);
  color: var(--app-accent);
  background: rgba(211, 181, 119, 0.12);
}

.app-list-empty {
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--app-elevated);
  color: var(--app-text-secondary);
  border: 1px dashed var(--app-border);
}

.app-item-title {
  font-weight: 600;
}

.tone-accent { color: var(--app-accent); }
.tone-success { color: var(--app-success); }
.tone-warning { color: var(--app-warning); }
.tone-danger { color: var(--app-danger); }

@media (max-width: 900px) {
  .levay-app-shell {
    flex-direction: column;
  }

  .levay-sidebar {
    width: 100%;
    min-height: unset;
    position: relative;
    border-right: none;
    border-bottom: 1px solid var(--app-border);
  }

  .levay-app-shell.is-collapsed .levay-sidebar {
    width: 100%;
  }

  .sidebar-nav {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }

  .sidebar-item {
    justify-content: flex-start;
  }

  .app-controls {
    grid-template-columns: 1fr;
  }

  .app-recommended {
    position: static;
  }

  .app-kpi-grid,
  .app-sections-grid {
    grid-template-columns: 1fr;
  }

  .app-focus {
    grid-template-columns: 1fr;
  }

  .levay-app-topbar {
    flex-direction: column;
  }
}
`.trim();
