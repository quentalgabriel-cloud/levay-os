import { AppResourceClient } from '../modules/app/app-resource-client.js';
import { buildAppOverviewModel } from '../modules/app/app-overview-model.js';
import { renderAppScreenHtml } from '../modules/app/app-screen-template.js';

const DEFAULT_CONFIG = {
  tenantId: 'sollu',
  apiBaseUrl: 'http://localhost:3000',
  role: 'operations'
};

const STORAGE_KEYS = {
  tenant: 'levay.tenantId',
  role: 'levay.role'
};

const URL_PARAMS = ['tenantId', 'role', 'apiBaseUrl'];

function safeLocalStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key, value) {
  try {
    if (value == null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}

function applyStoredConfig(config) {
  const storedRole = safeLocalStorageGet(STORAGE_KEYS.role);
  if (storedRole) {
    config.role = storedRole;
  }
  const storedTenant = safeLocalStorageGet(STORAGE_KEYS.tenant);
  if (storedTenant) {
    config.tenantId = storedTenant;
  }
  return { role: storedRole, tenantId: storedTenant };
}

function applyUrlOverrides(config) {
  const params = new URLSearchParams(window.location.search);
  URL_PARAMS.forEach((param) => {
    const value = params.get(param);
    if (!value) return;
    if (param === 'tenantId') {
      config.tenantId = value;
    } else if (param === 'role') {
      config.role = value;
    } else if (param === 'apiBaseUrl') {
      config.apiBaseUrl = value;
    }
  });
}

function persistSelection(config) {
  safeLocalStorageSet(STORAGE_KEYS.role, config.role);
  safeLocalStorageSet(STORAGE_KEYS.tenant, config.tenantId);
  config.persistedProfileActive = true;
  config.persistedProfile = {
    role: config.role,
    tenantId: config.tenantId
  };
}

function replaceUrlParam(key, value) {
  const nextUrl = new URL(window.location.href);
  if (value == null) {
    nextUrl.searchParams.delete(key);
  } else {
    nextUrl.searchParams.set(key, value);
  }
  window.history.replaceState({}, '', nextUrl.toString());
}

function buildLoadingHtml() {
  return `
    <section class="levay-app-shell" data-tenant="loading">
      <aside class="levay-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-brand">
            <div class="sidebar-logo">LO</div>
            <div class="sidebar-brand-text">
              <span>Levay OS</span>
              <small>loading</small>
            </div>
          </div>
        </div>
      </aside>
      <main class="levay-app-main">
        <header class="levay-app-topbar">
          <div>
            <p class="eyebrow">Levay OS</p>
            <h1>Centro de Operacoes</h1>
          </div>
        </header>
        <section class="app-errors"><h2>Carregando modulos</h2><p>Sincronizando recursos do grupo.</p></section>
      </main>
    </section>
  `.trim();
}

function unwrapSnapshotItems(result) {
  if (result?.status !== 'fulfilled') return [];
  const value = result.value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value)) return value;
  return [];
}

async function bootstrap() {
  const root = document.getElementById('app-root');
  if (!root) return;

  const config = {
    ...DEFAULT_CONFIG,
    ...(window.__LEVAY_APP_CONFIG__ || {}),
    persistedProfileActive: false,
    persistedProfile: null
  };
  const storedProfile = applyStoredConfig(config);
  if (storedProfile.role || storedProfile.tenantId) {
    config.persistedProfileActive = true;
    config.persistedProfile = {
      role: storedProfile.role || config.role,
      tenantId: storedProfile.tenantId || config.tenantId
    };
  }
  applyUrlOverrides(config);
  if (config.persistedProfileActive) {
    const matchesStored =
      (!storedProfile.role || storedProfile.role === config.role) &&
      (!storedProfile.tenantId || storedProfile.tenantId === config.tenantId);
    if (!matchesStored) {
      config.persistedProfileActive = false;
      config.persistedProfile = null;
    }
  }

  const client = new AppResourceClient({ baseUrl: config.apiBaseUrl });
  root.innerHTML = buildLoadingHtml();
  let rendering = false;
  let disposed = false;
  let pollId = null;
  let feedbackTimeout = null;
  let latestSnapshot = null;
  let lastRecommendationFingerprint = '';
  const uiState = {
    search: '',
    sectionFilter: 'all',
    feedback: null,
    sidebarCollapsed: false
  };
  try {
    const stored = window.localStorage.getItem('levay.sidebar.collapsed');
    if (stored === '1') {
      uiState.sidebarCollapsed = true;
    }
  } catch {
    // ignore storage failures
  }

  const pushFeedback = (message, tone = 'info') => {
    uiState.feedback = { message, tone };
    if (feedbackTimeout) {
      window.clearTimeout(feedbackTimeout);
    }
    feedbackTimeout = window.setTimeout(async () => {
      uiState.feedback = null;
      await renderSnapshot();
    }, 4000);
  };

  const applyListFilters = () => {
    const searchValue = uiState.search.trim().toLowerCase();
    const sectionValue = uiState.sectionFilter;
    const listItems = root.querySelectorAll('.app-list-item');
    const sections = root.querySelectorAll('[data-section-anchor]');

    listItems.forEach((item) => {
      const probe = item.querySelector('[data-section-id][data-filter-text]');
      if (!probe) return;
      const itemSection = probe.getAttribute('data-section-id') || '';
      const itemText = (probe.getAttribute('data-filter-text') || '').toLowerCase();
      const sectionMatch = sectionValue === 'all' || itemSection === sectionValue;
      const searchMatch = !searchValue || itemText.includes(searchValue);
      item.hidden = !(sectionMatch && searchMatch);
    });

    sections.forEach((section) => {
      const sectionId = section.getAttribute('data-section-anchor');
      if (!sectionId) return;
      section.hidden = sectionValue !== 'all' && sectionId !== sectionValue;
    });
  };

  const emitOperationalEvent = async ({
    type,
    status = 'success',
    payload = {},
    flow = 'sollu.recommendation'
  }) => {
    try {
      await client.publishOperationalEvent({
        tenantId: config.tenantId,
        type,
        flow,
        status,
        actorType: 'human',
        payload: {
          role: config.role,
          ...payload
        }
      });
    } catch {
      // Telemetry should not block user flow.
    }
  };

  const emitBulkExecutionEvent = async ({ actionId, source, result }) => {
    let status = 'success';
    if (result.failed > 0 && result.success > 0) {
      status = 'retry';
    } else if (result.failed > 0 && result.success === 0) {
      status = 'dead-letter';
    }

    await emitOperationalEvent({
      type: 'recommendation.executed',
      status,
      payload: {
        actionId,
        source,
        success: result.success,
        failed: result.failed,
        skipped: result.skipped
      }
    });
  };

  const runBulkAction = async (actionId) => {
    const snapshot = latestSnapshot;
    if (!snapshot) {
      return { success: 0, failed: 0, skipped: 0 };
    }

    const precheck = {
      'billing.bulk.collect.pending': () =>
        unwrapSnapshotItems(snapshot.billing).filter((item) => item.status === 'pending').length,
      'crm.bulk.advance.proposal': () =>
        unwrapSnapshotItems(snapshot.crm).filter((lead) => lead.stageId !== 'proposal').length,
      'gates.bulk.approve.pending': () =>
        unwrapSnapshotItems(snapshot.qualityGates).filter((gate) => gate.status !== 'approved').length
    };

    const pendingCount = precheck[actionId]?.() ?? 0;
    if (pendingCount === 0) {
      return { success: 0, failed: 0, skipped: 0 };
    }

    const intent = await client.submitActionIntent({
      tenantId: config.tenantId,
      actionId,
      actor: `ui-${config.role}`,
      role: config.role,
      payload: {
        channel: 'whatsapp',
        justification: 'aprovado em lote pelo painel operacional'
      }
    });

    const result = intent?.result || {};
    return {
      success: Number(result.processed || 0),
      failed: Number(result.failed || 0),
      skipped: 0
    };
  };

  const renderSnapshot = async () => {
    if (disposed || rendering) return;
    rendering = true;
    try {
      const snapshot = await client.loadSnapshot({ tenantId: config.tenantId, role: config.role });
      latestSnapshot = snapshot;
      const dashboardContract = snapshot.dashboardContext?.contract || null;
      const model = buildAppOverviewModel(snapshot, {
        tenantId: config.tenantId,
        role: config.role,
        contract: dashboardContract
      });
      model.dashboardContract = dashboardContract;
      model.lastUpdatedAt = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      model.feedback = uiState.feedback;
      model.persistedProfileActive = config.persistedProfileActive;
      model.persistedProfile = config.persistedProfile;

      if (model.recommendedAction) {
        const fingerprint = `${model.recommendedAction.id}:${model.recommendedAction.queueSize}:${Math.round(model.recommendedAction.priorityScore || 0)}`;
        if (fingerprint !== lastRecommendationFingerprint) {
          lastRecommendationFingerprint = fingerprint;
          void emitOperationalEvent({
            type: 'recommendation.presented',
            status: 'success',
            payload: {
              actionId: model.recommendedAction.id,
              queueSize: model.recommendedAction.queueSize,
              score: Math.round(model.recommendedAction.priorityScore || 0)
            }
          });
        }
      } else {
        lastRecommendationFingerprint = '';
      }

      root.innerHTML = renderAppScreenHtml(model);
      const shell = root.querySelector('.levay-app-shell');
      if (shell) {
        shell.classList.toggle('is-collapsed', uiState.sidebarCollapsed);
      }
      applyListFilters();

      const sidebarToggle = root.querySelector('[data-sidebar-toggle]');
      const updateSidebarToggle = () => {
        if (!sidebarToggle) return;
        sidebarToggle.textContent = uiState.sidebarCollapsed ? 'Expandir' : 'Recolher';
      };
      updateSidebarToggle();
      if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
          uiState.sidebarCollapsed = !uiState.sidebarCollapsed;
          try {
            window.localStorage.setItem('levay.sidebar.collapsed', uiState.sidebarCollapsed ? '1' : '0');
          } catch {
            // ignore storage failures
          }
          const shellEl = root.querySelector('.levay-app-shell');
          if (shellEl) {
            shellEl.classList.toggle('is-collapsed', uiState.sidebarCollapsed);
          }
          updateSidebarToggle();
        });
      }

      const navItems = root.querySelectorAll('[data-nav-target]');
      const updateNavActive = () => {
        navItems.forEach((item) => {
          const target = item.getAttribute('data-nav-target');
          item.classList.toggle('is-active', uiState.sectionFilter === target);
        });
      };
      const filterChips = root.querySelectorAll('[data-filter-chip]');
      const updateFilterChips = () => {
        filterChips.forEach((chip) => {
          const target = chip.getAttribute('data-filter-chip');
          chip.classList.toggle('is-active', uiState.sectionFilter === target);
        });
      };
      updateNavActive();
      updateFilterChips();

      navItems.forEach((item) => {
        item.addEventListener('click', () => {
          const target = item.getAttribute('data-nav-target');
          if (!target) return;
          uiState.sectionFilter = target;
          applyListFilters();
          updateNavActive();
          updateFilterChips();
          if (target === 'all') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          const anchor = root.querySelector(`[data-section-anchor="${target}"]`);
          if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      filterChips.forEach((chip) => {
        chip.addEventListener('click', () => {
          const target = chip.getAttribute('data-filter-chip');
          if (!target) return;
          uiState.sectionFilter = target;
          applyListFilters();
          updateNavActive();
          updateFilterChips();
        });
      });

      const searchInput = root.querySelector('[data-search-input]');
      if (searchInput) {
        searchInput.value = uiState.search;
        searchInput.addEventListener('input', () => {
          uiState.search = searchInput.value || '';
          applyListFilters();
        });
      }

      const sectionFilter = root.querySelector('[data-section-filter]');
      if (sectionFilter) {
        sectionFilter.value = uiState.sectionFilter;
        sectionFilter.addEventListener('change', () => {
          uiState.sectionFilter = sectionFilter.value || 'all';
          applyListFilters();
          updateNavActive();
          updateFilterChips();
        });
      }

      const bootstrapButton = root.querySelector('[data-action="bootstrap-demo"]');
      if (bootstrapButton) {
        bootstrapButton.addEventListener('click', async () => {
          bootstrapButton.disabled = true;
          bootstrapButton.textContent = 'Populando...';
          try {
            await client.bootstrapDemo({ tenantId: config.tenantId });
            pushFeedback('Base de demo populada com sucesso.', 'success');
          } catch {
            pushFeedback('Falha ao popular demo. Verifique a API.', 'error');
          }
          await renderSnapshot();
        }, { once: true });
      }

      const refreshButton = root.querySelector('[data-action="refresh-all"]');
      if (refreshButton) {
        refreshButton.addEventListener('click', async () => {
          refreshButton.disabled = true;
          refreshButton.textContent = 'Atualizando...';
          await renderSnapshot();
          pushFeedback('Dados atualizados.', 'success');
        }, { once: true });
      }

      const topbarActionButtons = root.querySelectorAll('[data-action]');
      topbarActionButtons.forEach((button) => {
        const actionId = button.getAttribute('data-action');
        if (
          !actionId ||
          actionId === 'bootstrap-demo' ||
          actionId === 'refresh-all' ||
          actionId === 'execute-recommended'
        ) return;

        button.addEventListener('click', async () => {
          button.disabled = true;
          const previousLabel = button.textContent;
          button.textContent = 'Executando...';
          try {
            const result = await runBulkAction(actionId);
            await emitBulkExecutionEvent({ actionId, source: 'topbar', result });
            if (result.failed > 0) {
              pushFeedback(`Acao em lote concluida com ${result.success} sucesso(s) e ${result.failed} falha(s).`, 'error');
            } else {
              pushFeedback(`Acao em lote concluida: ${result.success} item(ns) processado(s).`, 'success');
            }
          } finally {
            button.textContent = previousLabel || 'Executar';
            await renderSnapshot();
          }
        }, { once: true });
      });

      const recommendedButton = root.querySelector('[data-action="execute-recommended"]');
      if (recommendedButton) {
        recommendedButton.addEventListener('click', async () => {
          const recommendedActionId = recommendedButton.getAttribute('data-recommended-action-id');
          if (!recommendedActionId) return;

          recommendedButton.disabled = true;
          const previousLabel = recommendedButton.textContent;
          recommendedButton.textContent = 'Executando...';
          try {
            const result = await runBulkAction(recommendedActionId);
            await emitBulkExecutionEvent({ actionId: recommendedActionId, source: 'recommended', result });
            if (result.failed > 0) {
              pushFeedback(`Acao recomendada finalizada com ${result.success} sucesso(s) e ${result.failed} falha(s).`, 'error');
            } else {
              pushFeedback(`Acao recomendada concluida: ${result.success} item(ns).`, 'success');
            }
          } finally {
            recommendedButton.textContent = previousLabel || 'Executar agora';
            await renderSnapshot();
          }
        }, { once: true });
      }

      const itemActionButtons = root.querySelectorAll('[data-item-action]');
      itemActionButtons.forEach((button) => {
        button.addEventListener('click', async () => {
          const actionId = button.getAttribute('data-item-action');
          const sectionId = button.getAttribute('data-section-id');
          const itemId = button.getAttribute('data-item-id');
          if (!actionId || !sectionId) return;

          button.disabled = true;
          const prevLabel = button.textContent;
          button.textContent = 'Executando...';
          let actionSucceeded = false;

          try {
            if (
              actionId === 'billing.bulk.collect.pending' ||
              actionId === 'crm.bulk.advance.proposal' ||
              actionId === 'gates.bulk.approve.pending'
            ) {
              const result = await runBulkAction(actionId);
              await emitBulkExecutionEvent({ actionId, source: `section:${sectionId}`, result });
              if (result.failed > 0) {
                pushFeedback(`Lote finalizado com ${result.success} sucesso(s) e ${result.failed} falha(s).`, 'error');
              } else {
                pushFeedback(`Lote finalizado: ${result.success} item(ns).`, 'success');
              }
            } else {
              const payload = {
                leadId: actionId === 'crm.advance-proposal' ? itemId : undefined,
                receivableId: actionId === 'billing.collect' ? itemId : undefined,
                gateId: actionId === 'gates.approve' || actionId === 'gates.reject' ? itemId : undefined,
                justification: actionId === 'gates.reject'
                  ? 'rejeitado pelo painel operacional'
                  : 'aprovado pelo painel operacional',
                channel: 'whatsapp'
              };

              const intentResult = await client.submitActionIntent({
                tenantId: config.tenantId,
                actionId,
                payload,
                actor: `ui-${config.role}`,
                role: config.role
              });

              if (!intentResult?.ok) {
                pushFeedback('Acao falhou. Verifique permissao ou dados.', 'error');
              }
            }
            actionSucceeded = true;
          } catch {
            pushFeedback('Acao falhou. Tente novamente em alguns segundos.', 'error');
          } finally {
            button.textContent = prevLabel || 'Executar';
            if (actionSucceeded) {
              pushFeedback('Acao executada com sucesso.', 'success');
            }
            await renderSnapshot();
          }
        }, { once: true });
      });

      const handleRoleSwitch = async (nextRole) => {
        config.role = nextRole;
        persistSelection(config);
        replaceUrlParam('role', nextRole);
        await renderSnapshot();
      };

      const handleTenantSwitch = async (nextTenantId) => {
        config.tenantId = nextTenantId;
        persistSelection(config);
        replaceUrlParam('tenantId', nextTenantId);
        await renderSnapshot();
      };

      const roleButtons = root.querySelectorAll('[data-role-switch]');
      roleButtons.forEach((button) => {
        button.addEventListener('click', async () => {
          const nextRole = button.getAttribute('data-role-switch');
          if (!nextRole || nextRole === config.role) return;
          button.disabled = true;
          try {
            await handleRoleSwitch(nextRole);
          } finally {
            button.disabled = false;
          }
        });
      });

      const tenantButtons = root.querySelectorAll('[data-tenant-switch]');
      tenantButtons.forEach((button) => {
        button.addEventListener('click', async () => {
          const nextTenantId = button.getAttribute('data-tenant-switch');
          if (!nextTenantId || nextTenantId === config.tenantId) return;
          button.disabled = true;
          try {
            await handleTenantSwitch(nextTenantId);
          } finally {
            button.disabled = false;
          }
        });
      });
    } catch {
      root.innerHTML = `
        <section class="levay-app-shell" data-tenant="${config.tenantId}">
          <section class="app-errors" role="alert">
            <h2>Falha ao sincronizar modulos</h2>
            <p>Verifique a API em ${config.apiBaseUrl} e tente novamente.</p>
          </section>
        </section>
      `.trim();
    } finally {
      rendering = false;
    }
  };

  await renderSnapshot();
  pollId = window.setInterval(renderSnapshot, 20000);
  window.addEventListener('beforeunload', () => {
    disposed = true;
    if (pollId) {
      window.clearInterval(pollId);
    }
    if (feedbackTimeout) {
      window.clearTimeout(feedbackTimeout);
    }
  });
}

bootstrap();
