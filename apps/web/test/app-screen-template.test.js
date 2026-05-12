import { describe, it, expect } from 'vitest';
import { renderAppScreenHtml, APP_SCREEN_CSS } from '../src/modules/app/app-screen-template.js';

describe('app screen template', () => {
  it('renders cards, sections and actions', () => {
    const html = renderAppScreenHtml({
      tenantId: 'sollu',
      role: 'operations',
      roleLabel: 'Operacoes',
      tenantOptions: [
        { id: 'sollu', label: 'Sollu' },
        { id: 'amp213', label: 'AMP 213' },
        { id: 'bica', label: 'Bica Bar' }
      ],
      roleOptions: [
        { id: 'ceo', label: 'CEO' },
        { id: 'commercial', label: 'Comercial' },
        { id: 'operations', label: 'Operacoes' }
      ],
      cards: [{ id: 'leads', label: 'Leads Sollu', value: 4, tone: 'accent' }],
      sections: [
        {
          id: 'crm',
          title: 'CRM Sollu',
          meta: '4 leads',
          items: [{
            id: 'lead-1',
            title: 'Lead A',
            subtitle: 'proposal',
            detail: 'amanha',
            actions: [{ id: 'crm.advance-proposal', label: 'Avancar para Proposta' }]
          }]
        }
      ],
      actions: [{ id: 'bootstrap-demo', label: 'Popular demo', kind: 'primary' }],
      recommendedAction: {
        id: 'gates.bulk.approve.pending',
        label: 'Aprovar gates',
        priorityScore: 6,
        queueSize: 2
      },
      recommendationInsights: {
        executions: 5,
        successRate: 80
      },
      errors: []
    });

    expect(html).toContain('Centro de Operacoes');
    expect(html).toContain('Leads Sollu');
    expect(html).toContain('data-action="bootstrap-demo"');
    expect(html).toContain('CRM Sollu');
    expect(html).toContain('data-item-action="crm.advance-proposal"');
    expect(html).toContain('data-item-id="lead-1"');
    expect(html).toContain('data-role-switch="ceo"');
    expect(html).toContain('data-tenant-switch="amp213"');
    expect(html).toContain('Perfil ativo: Operacoes');
    expect(html).toContain('data-search-input');
    expect(html).toContain('data-section-filter');
    expect(html).toContain('Todos os modulos');
    expect(html).toContain('Proxima melhor acao');
    expect(html).toContain('data-action="execute-recommended"');
    expect(html).toContain('Fila: 2 item(ns)');
    expect(html).toContain('Score: 6');
    expect(html).toContain('Execucoes: 5');
    expect(html).toContain('Sucesso: 80%');
  });

  it('renders resource errors when present', () => {
    const html = renderAppScreenHtml({
      tenantId: 'sollu',
      cards: [],
      sections: [],
      actions: [],
      errors: [{ resource: 'crm', message: 'crm down' }]
    });

    expect(html).toContain('Recursos com falha parcial');
    expect(html).toContain('crm: crm down');
  });

  it('renders feedback message when provided', () => {
    const html = renderAppScreenHtml({
      tenantId: 'sollu',
      cards: [],
      sections: [],
      actions: [],
      errors: [],
      feedback: { message: 'Acao executada com sucesso.', tone: 'success' }
    });

    expect(html).toContain('Acao executada com sucesso.');
    expect(html).toContain('app-feedback is-success');
  });

  it('renders no-critical-queue state when no recommendation exists', () => {
    const html = renderAppScreenHtml({
      tenantId: 'sollu',
      cards: [],
      sections: [],
      actions: [],
      errors: [],
      recommendedAction: null
    });

    expect(html).toContain('Nenhuma fila critica no momento');
    expect(html).not.toContain('data-action="execute-recommended"');
  });

  it('exposes premium css primitives', () => {
    expect(APP_SCREEN_CSS).toContain('radial-gradient');
    expect(APP_SCREEN_CSS).toContain('font-family: Manrope');
    expect(APP_SCREEN_CSS).toContain('grid-template-columns: repeat(4, minmax(0, 1fr))');
    expect(APP_SCREEN_CSS).toContain('.app-controls');
  });
});
