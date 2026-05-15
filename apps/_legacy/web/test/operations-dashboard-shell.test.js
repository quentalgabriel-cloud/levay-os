import { describe, it, expect } from 'vitest';
import { OperationsDashboardShell } from '../src/modules/operations/operations-dashboard-shell.js';

function createFakeStreamClient() {
  const handlers = {};
  return {
    connect(args) {
      Object.assign(handlers, args);
    },
    disconnect() {},
    emit(name, payload) {
      handlers[name]?.(payload);
    }
  };
}

describe('operations dashboard shell', () => {
  it('starts monitor and loads summary for tenant', async () => {
    const streamClient = createFakeStreamClient();
    const summaryClient = {
      async fetchSummary({ tenantId, flow }) {
        expect(tenantId).toBe('sollu');
        expect(flow).toBe(null);
        return {
          total: 10,
          success: 7,
          retry: 2,
          deadLetter: 1
        };
      }
    };

    const shell = new OperationsDashboardShell({ streamClient, summaryClient });
    await shell.start({ tenantId: 'sollu' });
    streamClient.emit('onConnected', {});

    const view = shell.getViewModel();
    expect(view.summaryState).toBe('ready');
    expect(view.cards[0].value).toBe(10);
    expect(view.filters.tenantId).toBe('sollu');
  });

  it('applies filters and refreshes summary', async () => {
    const calls = [];
    const shell = new OperationsDashboardShell({
      streamClient: createFakeStreamClient(),
      summaryClient: {
        async fetchSummary(filters) {
          calls.push(filters);
          return {
            total: 4,
            success: 3,
            retry: 1,
            deadLetter: 0
          };
        }
      }
    });

    await shell.start({ tenantId: 'sollu' });
    await shell.applyFilters({ flow: 'sollu.followup', type: 'followup.dispatched', status: 'success' });

    expect(calls).toHaveLength(2);
    expect(calls[1]).toEqual({ tenantId: 'sollu', flow: 'sollu.followup' });
    const view = shell.getViewModel();
    expect(view.filters.flow).toBe('sollu.followup');
    expect(view.filters.type).toBe('followup.dispatched');
    expect(view.filters.status).toBe('success');
  });

  it('exposes summary error state when request fails', async () => {
    const shell = new OperationsDashboardShell({
      streamClient: createFakeStreamClient(),
      summaryClient: {
        async fetchSummary() {
          throw new Error('summary unavailable');
        }
      }
    });

    await shell.start({ tenantId: 'sollu' });
    const view = shell.getViewModel();
    expect(view.summaryState).toBe('error');
    expect(view.summaryError).toBe('summary unavailable');
  });

  it('generates screen model for responsive UI integration', async () => {
    const streamClient = createFakeStreamClient();
    const shell = new OperationsDashboardShell({
      streamClient,
      summaryClient: {
        async fetchSummary() {
          return { total: 2, success: 1, retry: 1, deadLetter: 0 };
        }
      }
    });

    await shell.start({ tenantId: 'sollu' });
    streamClient.emit('onConnected', {});
    streamClient.emit('onInit', {
      events: [
        { id: 'e1', type: 'followup.dispatched', status: 'success', flow: 'sollu.followup' }
      ]
    });

    const screen = shell.getScreenModel({ viewport: 'mobile' });
    expect(screen.layout.shell).toBe('mobile-stack');
    expect(screen.topBar.tenantTag).toBe('sollu');
    expect(screen.heroKpis[0].value).toBe(2);
  });

  it('renders concrete html screen from shell', async () => {
    const streamClient = createFakeStreamClient();
    const shell = new OperationsDashboardShell({
      streamClient,
      summaryClient: {
        async fetchSummary() {
          return { total: 1, success: 1, retry: 0, deadLetter: 0 };
        }
      }
    });

    await shell.start({ tenantId: 'sollu' });
    streamClient.emit('onConnected', {});
    streamClient.emit('onInit', {
      events: [{ id: 'e1', type: 'followup.dispatched', status: 'success', flow: 'sollu.followup' }]
    });

    const html = shell.renderScreenHtml({ viewport: 'desktop' });
    expect(html).toContain('ops-screen');
    expect(html).toContain('Painel Operacional');
    expect(html).toContain('Timeline Operacional');
  });
});
