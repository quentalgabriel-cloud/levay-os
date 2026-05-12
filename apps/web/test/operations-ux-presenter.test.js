import { describe, it, expect } from 'vitest';
import { buildOperationsScreenModel, OPERATIONS_UI_THEME } from '../src/modules/operations/operations-ux-presenter.js';

describe('operations ux presenter', () => {
  it('builds desktop screen model with timeline badges and assistive labels', () => {
    const model = buildOperationsScreenModel({
      state: 'ready',
      header: {
        title: 'Painel Operacional',
        tenantId: 'sollu',
        connectionLabel: 'Conectado'
      },
      cards: [{ id: 'total', label: 'Total de eventos', value: 6, tone: 'accent' }],
      events: [
        {
          id: 'e1',
          title: 'followup · dispatched',
          subtitle: 'lead-1',
          status: 'success',
          tenantId: 'sollu',
          flow: 'sollu.followup',
          occurredAt: '2026-03-19T12:00:00.000Z'
        }
      ]
    });

    expect(model.layout.shell).toBe('desktop-three-zone');
    expect(model.heroKpis).toHaveLength(1);
    expect(model.timeline[0].badge.label).toBe('Sucesso');
    expect(model.timeline[0].assistiveLabel).toContain('Sucesso');
  });

  it('switches layout based on viewport', () => {
    const base = { state: 'empty', header: {}, cards: [], events: [] };
    expect(buildOperationsScreenModel(base, { viewport: 'tablet' }).layout.shell).toBe('tablet-split');
    expect(buildOperationsScreenModel(base, { viewport: 'mobile' }).layout.shell).toBe('mobile-stack');
  });

  it('exposes token-driven theme only (no hardcoded visual values)', () => {
    expect(OPERATIONS_UI_THEME.color.canvas).toBe('{semantic.color.background-canvas}');
    expect(OPERATIONS_UI_THEME.typography.display).toBe('Manrope');
    expect(OPERATIONS_UI_THEME.motion.standard).toBe('220ms ease-out');
  });
});
