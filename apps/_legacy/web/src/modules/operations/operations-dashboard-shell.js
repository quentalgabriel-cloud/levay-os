import { OperationsStreamClient } from './operations-stream-client.js';
import { OperationsSummaryClient } from './operations-summary-client.js';
import { OperationsMonitor } from './operations-monitor.js';
import { OperationsPanel } from './operations-panel.js';
import { buildOperationsScreenModel } from './operations-ux-presenter.js';
import { renderOperationsScreenHtml } from './operations-screen-template.js';

function toCardsFromSummary(summary) {
  if (!summary) return null;
  return [
    { id: 'total', label: 'Total de eventos', value: summary.total || 0, tone: 'accent' },
    { id: 'success', label: 'Sucesso', value: summary.success || 0, tone: 'success' },
    { id: 'retry', label: 'Retry', value: summary.retry || 0, tone: 'warning' },
    { id: 'dead-letter', label: 'Dead-letter', value: summary.deadLetter || 0, tone: 'danger' }
  ];
}

export class OperationsDashboardShell {
  constructor({
    streamClient = new OperationsStreamClient(),
    summaryClient = new OperationsSummaryClient()
  } = {}) {
    this.monitor = new OperationsMonitor(streamClient);
    this.panel = new OperationsPanel(this.monitor);
    this.summaryClient = summaryClient;
    this.state = {
      filters: {
        tenantId: null,
        flow: null,
        type: null,
        status: null
      },
      loadingSummary: false,
      summaryError: null,
      summary: null
    };
  }

  async start({ tenantId, flow = null, limit = 50 } = {}) {
    this.state.filters = {
      ...this.state.filters,
      tenantId: tenantId || null,
      flow,
      type: null,
      status: null
    };

    this.monitor.start({ tenantId, limit });
    await this.refreshSummary();
  }

  stop() {
    this.monitor.stop();
  }

  async applyFilters(nextFilters = {}) {
    this.state.filters = {
      ...this.state.filters,
      ...nextFilters
    };
    await this.refreshSummary();
  }

  async refreshSummary() {
    const { tenantId, flow } = this.state.filters;
    if (!tenantId) {
      this.state.summary = null;
      this.state.summaryError = null;
      this.state.loadingSummary = false;
      return null;
    }

    this.state.loadingSummary = true;
    this.state.summaryError = null;
    try {
      const data = await this.summaryClient.fetchSummary({ tenantId, flow });
      this.state.summary = data;
      this.state.loadingSummary = false;
      return data;
    } catch (error) {
      this.state.summary = null;
      this.state.summaryError = String(error?.message || error);
      this.state.loadingSummary = false;
      return null;
    }
  }

  getViewModel() {
    const panelView = this.panel.getViewModel({
      type: this.state.filters.type,
      status: this.state.filters.status
    });

    const summaryCards = toCardsFromSummary(this.state.summary);
    return {
      ...panelView,
      cards: summaryCards || panelView.cards,
      summary: this.state.summary,
      summaryState: this.state.loadingSummary
        ? 'loading'
        : this.state.summaryError
          ? 'error'
          : this.state.summary
            ? 'ready'
            : 'idle',
      summaryError: this.state.summaryError,
      filters: {
        tenantId: this.state.filters.tenantId,
        flow: this.state.filters.flow,
        type: this.state.filters.type,
        status: this.state.filters.status
      }
    };
  }

  getScreenModel(options = {}) {
    return buildOperationsScreenModel(this.getViewModel(), options);
  }

  renderScreenHtml(options = {}) {
    return renderOperationsScreenHtml(this.getScreenModel(options));
  }
}
