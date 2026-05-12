import { describe, it, expect } from 'vitest';
import { renderOperationsScreenHtml, OPERATIONS_SCREEN_CSS } from '../src/modules/operations/operations-screen-template.js';

describe('operations screen template', () => {
  it('renders ready state with kpis and timeline', () => {
    const html = renderOperationsScreenHtml({
      state: 'ready',
      layout: { shell: 'desktop-three-zone' },
      topBar: { title: 'Painel Operacional', tenantTag: 'sollu', connectionLabel: 'Conectado' },
      heroKpis: [{ id: 'total', label: 'Total de eventos', value: 8, tone: 'accent' }],
      timeline: [
        {
          id: 'e1',
          title: 'followup · dispatched',
          subtitle: 'lead-1',
          timestamp: '2026-03-19T12:00:00.000Z',
          badge: { label: 'Sucesso', tone: 'success' },
          assistiveLabel: 'Sucesso: followup · dispatched'
        }
      ],
      rightRail: { title: 'Acoes Rapidas', actions: [{ id: 'refresh-summary', label: 'Atualizar indicadores' }] }
    });

    expect(html).toContain('Painel Operacional');
    expect(html).toContain('Total de eventos');
    expect(html).toContain('followup · dispatched');
    expect(html).toContain('data-action="refresh-summary"');
  });

  it('renders empty/error fallback states', () => {
    const empty = renderOperationsScreenHtml({
      state: 'empty',
      layout: { shell: 'mobile-stack' },
      topBar: {},
      heroKpis: [],
      timeline: [],
      emptyState: { title: 'Sem eventos', description: 'Nada por aqui' },
      rightRail: { actions: [] }
    });

    const error = renderOperationsScreenHtml({
      state: 'error',
      layout: { shell: 'mobile-stack' },
      topBar: {},
      heroKpis: [],
      timeline: [],
      error: 'stream down',
      rightRail: { actions: [] }
    });

    expect(empty).toContain('Sem eventos');
    expect(error).toContain('Falha ao carregar o painel');
    expect(error).toContain('stream down');
  });

  it('exposes token-driven css variables', () => {
    expect(OPERATIONS_SCREEN_CSS).toContain('--ops-canvas: var(--semantic-color-background-canvas)');
    expect(OPERATIONS_SCREEN_CSS).toContain('font-family: Manrope');
    expect(OPERATIONS_SCREEN_CSS).toContain('var(--core-color-success-500)');
  });
});
