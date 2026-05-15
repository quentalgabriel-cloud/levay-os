import { describe, it, expect } from 'vitest';
import { ExecutiveDashboard } from '../src/modules/analytics/executive-dashboard.js';

describe('executive dashboard', () => {
  it('renders KPI cards from executive endpoint data', async () => {
    const apiClient = {
      async fetchExecutive() {
        return {
          tenants: [{ tenantId: 'sollu', revenue: 1000, conversion: 0.4, efficiency: 0.8 }],
          consolidated: { revenue: 1000, conversion: 0.4, efficiency: 0.8 }
        };
      }
    };

    const dashboard = new ExecutiveDashboard(apiClient);
    await dashboard.load();

    const view = dashboard.getViewModel();
    expect(view.state).toBe('ready');
    expect(view.cards).toHaveLength(3);
  });

  it('updates view when tenant and period filters change', async () => {
    const calls = [];
    const apiClient = {
      async fetchExecutive(filters) {
        calls.push(filters);
        return {
          tenants: [{ tenantId: filters.tenantId || 'all', revenue: 700, conversion: 0.2, efficiency: 0.6 }],
          consolidated: { revenue: 700, conversion: 0.2, efficiency: 0.6 }
        };
      }
    };

    const dashboard = new ExecutiveDashboard(apiClient);
    await dashboard.applyFilters({ tenantId: 'sollu', from: '2026-03-01', to: '2026-03-31' });

    expect(calls).toHaveLength(1);
    expect(calls[0].tenantId).toBe('sollu');
    expect(dashboard.getViewModel().filters.from).toBe('2026-03-01');
  });

  it('handles loading, empty and error states', async () => {
    const emptyClient = {
      async fetchExecutive() {
        return { tenants: [], consolidated: { revenue: 0, conversion: 0, efficiency: 0 } };
      }
    };

    const emptyDashboard = new ExecutiveDashboard(emptyClient);
    const loadingState = emptyDashboard.getViewModel();
    expect(loadingState.state).toBe('empty');

    await emptyDashboard.load();
    expect(emptyDashboard.getViewModel().state).toBe('empty');

    const errorClient = {
      async fetchExecutive() {
        throw new Error('network_error');
      }
    };

    const errorDashboard = new ExecutiveDashboard(errorClient);
    await errorDashboard.load();
    expect(errorDashboard.getViewModel().state).toBe('error');
  });
});
