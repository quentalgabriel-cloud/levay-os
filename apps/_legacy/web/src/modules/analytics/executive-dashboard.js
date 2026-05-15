import { buildKpiCards } from './kpi-cards.js';
import { buildAlerts } from './alerts-panel.js';

export const DASHBOARD_TOKENS = {
  panelBg: '{semantic.color.background-surface}',
  panelBorder: '{semantic.color.border-default}',
  headline: '{semantic.color.text-primary}',
  accent: '{semantic.color.kpi-highlight}'
};

export class ExecutiveDashboard {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.state = {
      loading: false,
      error: null,
      data: null,
      filters: {
        tenantId: null,
        from: null,
        to: null
      }
    };
  }

  async load(filters = {}) {
    this.state.loading = true;
    this.state.error = null;
    this.state.filters = { ...this.state.filters, ...filters };

    try {
      const data = await this.apiClient.fetchExecutive(this.state.filters);
      this.state.data = data;
      this.state.loading = false;
      return data;
    } catch (error) {
      this.state.error = String(error.message || error);
      this.state.loading = false;
      this.state.data = null;
      return null;
    }
  }

  async applyFilters(nextFilters) {
    return this.load(nextFilters);
  }

  getViewModel() {
    if (this.state.loading) {
      return { state: 'loading', tokens: DASHBOARD_TOKENS, cards: [], alerts: [] };
    }
    if (this.state.error) {
      return { state: 'error', tokens: DASHBOARD_TOKENS, error: this.state.error, cards: [], alerts: [] };
    }
    if (!this.state.data || !(this.state.data.tenants || []).length) {
      return { state: 'empty', tokens: DASHBOARD_TOKENS, cards: [], alerts: [] };
    }

    return {
      state: 'ready',
      tokens: DASHBOARD_TOKENS,
      filters: this.state.filters,
      cards: buildKpiCards(this.state.data),
      alerts: buildAlerts(this.state.data),
      tenants: this.state.data.tenants
    };
  }
}
