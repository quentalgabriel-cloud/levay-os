import { describe, it, expect } from 'vitest';
import { OperationsPanel } from '../src/modules/operations/operations-panel.js';

function createMonitorStub(viewModel) {
  return {
    getViewModel(filters = {}) {
      return typeof viewModel === 'function' ? viewModel(filters) : viewModel;
    }
  };
}

describe('operations panel', () => {
  it('renders connecting state with KPI cards', () => {
    const monitor = createMonitorStub({
      connectionStatus: 'connecting',
      tenantId: 'sollu',
      counters: { total: 0, success: 0, retry: 0, deadLetter: 0 },
      events: []
    });

    const panel = new OperationsPanel(monitor);
    const view = panel.getViewModel();

    expect(view.state).toBe('connecting');
    expect(view.cards).toHaveLength(4);
    expect(view.emptyState.title).toContain('Conectando');
    expect(view.header.connectionLabel).toBe('Conectando');
  });

  it('renders empty state when there are no events', () => {
    const monitor = createMonitorStub({
      connectionStatus: 'idle',
      tenantId: 'sollu',
      counters: { total: 0, success: 0, retry: 0, deadLetter: 0 },
      events: []
    });

    const panel = new OperationsPanel(monitor);
    const view = panel.getViewModel();

    expect(view.state).toBe('empty');
    expect(view.cards.map((card) => card.id)).toEqual(['total', 'success', 'retry', 'dead-letter']);
    expect(view.emptyState.title).toBe('Sem eventos operacionais');
  });

  it('renders error state with fallback empty state', () => {
    const monitor = createMonitorStub({
      connectionStatus: 'error',
      tenantId: 'sollu',
      error: 'stream down',
      counters: { total: 3, success: 2, retry: 1, deadLetter: 0 },
      events: []
    });

    const panel = new OperationsPanel(monitor);
    const view = panel.getViewModel();

    expect(view.state).toBe('error');
    expect(view.error).toBe('stream down');
    expect(view.emptyState.actionLabel).toBe('Tentar novamente');
    expect(view.events).toHaveLength(0);
  });

  it('builds recent events and applies filters from monitor view model', () => {
    const monitor = createMonitorStub((filters) => {
      const events = [
        {
          id: 'e1',
          type: 'followup.dispatched',
          status: 'success',
          tenantId: 'sollu',
          flow: 'sollu.followup',
          createdAt: '2026-03-19T11:00:00.000Z',
          actorType: 'worker',
          payload: { leadId: 'lead-1' }
        },
        {
          id: 'e2',
          type: 'followup.retry_scheduled',
          status: 'retry',
          tenantId: 'sollu',
          flow: 'sollu.followup',
          createdAt: '2026-03-19T11:05:00.000Z',
          actorType: 'worker',
          payload: { leadId: 'lead-2' }
        },
        {
          id: 'e3',
          type: 'billing.collection_triggered',
          status: 'success',
          tenantId: 'sollu',
          flow: 'sollu.billing',
          createdAt: '2026-03-19T11:10:00.000Z',
          actorType: 'human',
          payload: { receivableId: 'r-1' }
        }
      ];

      return {
        connectionStatus: 'connected',
        tenantId: 'sollu',
        counters: { total: 3, success: 2, retry: 1, deadLetter: 0 },
        events: events.filter((event) => {
          if (filters.type && event.type !== filters.type) return false;
          if (filters.status && event.status !== filters.status) return false;
          return true;
        })
      };
    });

    const panel = new OperationsPanel(monitor);
    const view = panel.getViewModel({ type: 'followup.dispatched', status: 'success' });

    expect(view.state).toBe('ready');
    expect(view.filters).toEqual({
      tenantId: 'sollu',
      type: 'followup.dispatched',
      status: 'success'
    });
    expect(view.cards[0]).toEqual({
      id: 'total',
      label: 'Total de eventos',
      value: 3,
      tone: 'accent'
    });
    expect(view.events).toHaveLength(1);
    expect(view.events[0].title).toBe('followup · dispatched');
    expect(view.events[0].subtitle).toBe('lead-1');
    expect(view.events[0].statusTone).toBe('success');
  });
});
