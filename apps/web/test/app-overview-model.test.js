import { describe, it, expect } from 'vitest';
import { buildAppOverviewModel } from '../src/modules/app/app-overview-model.js';

describe('app overview model', () => {
  it('builds summary cards and sections from fulfilled snapshot', () => {
    const snapshot = {
      crm: { status: 'fulfilled', value: { items: [{ id: 'lead-1', name: 'Lead A', stageId: 'new' }] } },
      billing: { status: 'fulfilled', value: { items: [{ id: 'rec-1', customerName: 'Cliente 1', amount: 500, status: 'pending' }] } },
      events: { status: 'fulfilled', value: { items: [{ title: 'Evento A' }] } },
      reservations: { status: 'fulfilled', value: { items: [{ guestName: 'Mesa 1' }] } },
      membership: { status: 'fulfilled', value: { activeMembers: 3 } },
      qualityGates: { status: 'fulfilled', value: { items: [{ id: 'gate-1', flowName: 'billing.collection', stepName: 'send_whatsapp', reason: 'manual' }] } },
      contracts: { status: 'fulfilled', value: { items: [{ customerName: 'Contrato A' }] } },
      analytics: { status: 'fulfilled', value: { consolidated: { revenue: 1000, conversion: 0.3, efficiency: 0.8 } } },
      operations: { status: 'fulfilled', value: { total: 4, breakdownByType: [{ type: 'followup.dispatched', count: 2 }] } },
      operationsEvents: { status: 'fulfilled', value: { items: [{ type: 'followup.dispatched', status: 'success', createdAt: '2026-03-19T12:00:00.000Z' }] } },
      recommendationEvents: { status: 'fulfilled', value: { items: [] } }
    };

    const model = buildAppOverviewModel(snapshot, { tenantId: 'sollu', role: 'commercial' });
    expect(model.state).toBe('ready');
    expect(model.cards).toHaveLength(5);
    expect(model.cards[0].value).toBe(1);
    expect(model.sections[0].title).toBe('Prioridades de hoje');
    expect(model.sections.find((section) => section.id === 'crm').items[0].actions[0].id).toBe('crm.advance-proposal');
    expect(model.sections.find((section) => section.id === 'billing').items[0].actions[0].id).toBe('billing.collect');
    expect(model.sections.find((section) => section.id === 'quality-gates').items[0].actions).toHaveLength(2);
    expect(model.sections.find((section) => section.id === 'operations').items[0].title).toBe('followup.dispatched');
    expect(model.sections.find((section) => section.id === 'priorities').items).toHaveLength(3);
    expect(model.sections.map((section) => section.id)).toEqual([
      'priorities',
      'crm',
      'billing',
      'quality-gates',
      'contracts',
      'recommendation-efficiency',
      'operations',
      'operations-timeline'
    ]);
    expect(model.roleLabel).toBe('Comercial');
    expect(model.tenantOptions.map((tenant) => tenant.id)).toEqual(['sollu', 'amp213', 'bica']);
    expect(model.recommendationInsights.executions).toBe(0);
  });

  it('surfaces partial state and resource errors', () => {
    const snapshot = {
      crm: { status: 'rejected', reason: new Error('crm down') },
      billing: { status: 'fulfilled', value: { items: [] } },
      events: { status: 'fulfilled', value: { items: [] } },
      reservations: { status: 'fulfilled', value: { items: [] } },
      membership: { status: 'fulfilled', value: {} },
      qualityGates: { status: 'fulfilled', value: { items: [] } },
      contracts: { status: 'fulfilled', value: { items: [] } },
      analytics: { status: 'fulfilled', value: { consolidated: {} } },
      operations: { status: 'fulfilled', value: { total: 0, breakdownByType: [] } },
      operationsEvents: { status: 'fulfilled', value: { items: [] } },
      recommendationEvents: { status: 'fulfilled', value: { items: [] } }
    };

    const model = buildAppOverviewModel(snapshot, { tenantId: 'sollu', role: 'commercial' });
    expect(model.state).toBe('partial');
    expect(model.errors).toEqual([{ resource: 'crm', message: 'crm down' }]);
  });

  it('assigns section statuses when data is missing or errored', () => {
    const snapshot = {
      crm: { status: 'rejected', reason: new Error('crm down') },
      billing: { status: 'fulfilled', value: { items: [] } },
      events: { status: 'fulfilled', value: { items: [] } },
      reservations: { status: 'fulfilled', value: { items: [] } },
      membership: { status: 'fulfilled', value: {} },
      qualityGates: { status: 'fulfilled', value: { items: [] } },
      contracts: { status: 'fulfilled', value: { items: [] } },
      analytics: { status: 'fulfilled', value: { consolidated: {} } },
      operations: { status: 'fulfilled', value: { total: 0, breakdownByType: [] } },
      operationsEvents: { status: 'fulfilled', value: { items: [] } },
      recommendationEvents: { status: 'fulfilled', value: { items: [] } }
    };

    const model = buildAppOverviewModel(snapshot, { tenantId: 'sollu', role: 'commercial' });
    const crmSection = model.sections.find((section) => section.id === 'crm');
    const billingSection = model.sections.find((section) => section.id === 'billing');
    expect(crmSection.sectionStatus).toBe('error');
    expect(billingSection.sectionStatus).toBe('empty');
  });

  it('filters cards and sections for ceo role', () => {
    const snapshot = {
      crm: { status: 'fulfilled', value: { items: [] } },
      billing: { status: 'fulfilled', value: { items: [] } },
      events: { status: 'fulfilled', value: { items: [] } },
      reservations: { status: 'fulfilled', value: { items: [] } },
      membership: { status: 'fulfilled', value: {} },
      qualityGates: { status: 'fulfilled', value: { items: [] } },
      contracts: { status: 'fulfilled', value: { items: [] } },
      analytics: { status: 'fulfilled', value: { consolidated: {} } },
      operations: { status: 'fulfilled', value: { total: 0, breakdownByType: [] } },
      operationsEvents: { status: 'fulfilled', value: { items: [] } },
      recommendationEvents: { status: 'fulfilled', value: { items: [] } }
    };

    const model = buildAppOverviewModel(snapshot, { tenantId: 'sollu', role: 'ceo' });
    expect(model.roleLabel).toBe('CEO');
    expect(model.cards.map((c) => c.id)).toEqual(['receivables', 'quality-gates', 'events', 'operations']);
    expect(model.sections.map((s) => s.id)).toEqual([
      'priorities',
      'billing',
      'quality-gates',
      'analytics',
      'recommendation-efficiency',
      'operations',
      'operations-timeline'
    ]);
  });

  it('exposes role-specific bulk actions for operations', () => {
    const snapshot = {
      crm: { status: 'fulfilled', value: { items: [] } },
      billing: { status: 'fulfilled', value: { items: [] } },
      events: { status: 'fulfilled', value: { items: [] } },
      reservations: { status: 'fulfilled', value: { items: [] } },
      membership: { status: 'fulfilled', value: {} },
      qualityGates: { status: 'fulfilled', value: { items: [] } },
      contracts: { status: 'fulfilled', value: { items: [] } },
      analytics: { status: 'fulfilled', value: { consolidated: {} } },
      operations: { status: 'fulfilled', value: { total: 0, breakdownByType: [] } },
      operationsEvents: { status: 'fulfilled', value: { items: [] } },
      recommendationEvents: { status: 'fulfilled', value: { items: [] } }
    };

    const model = buildAppOverviewModel(snapshot, { tenantId: 'sollu', role: 'operations' });
    expect(model.actions.map((action) => action.id)).toEqual([
      'gates.bulk.approve.pending',
      'billing.bulk.collect.pending',
      'crm.bulk.advance.proposal',
      'bootstrap-demo',
      'refresh-all'
    ]);
    expect(model.recommendedAction).toBeNull();
    expect(model.recommendationInsights.successRate).toBeNull();
  });

  it('reorders actions by operational impact when queues are non-empty', () => {
    const snapshot = {
      crm: {
        status: 'fulfilled',
        value: { items: [{ id: 'lead-1', stageId: 'new' }, { id: 'lead-2', stageId: 'new' }, { id: 'lead-3', stageId: 'new' }] }
      },
      billing: {
        status: 'fulfilled',
        value: { items: [{ id: 'r-1', status: 'pending' }] }
      },
      events: { status: 'fulfilled', value: { items: [] } },
      reservations: { status: 'fulfilled', value: { items: [] } },
      membership: { status: 'fulfilled', value: {} },
      qualityGates: {
        status: 'fulfilled',
        value: { items: [{ id: 'g-1', status: 'pending' }, { id: 'g-2', status: 'pending' }] }
      },
      contracts: { status: 'fulfilled', value: { items: [] } },
      analytics: { status: 'fulfilled', value: { consolidated: {} } },
      operations: { status: 'fulfilled', value: { total: 0, breakdownByType: [] } },
      operationsEvents: { status: 'fulfilled', value: { items: [] } },
      recommendationEvents: { status: 'fulfilled', value: { items: [] } }
    };

    const model = buildAppOverviewModel(snapshot, { tenantId: 'sollu', role: 'operations' });
    expect(model.actions.map((action) => action.id).slice(0, 3)).toEqual([
      'gates.bulk.approve.pending',
      'crm.bulk.advance.proposal',
      'billing.bulk.collect.pending'
    ]);
    expect(model.recommendedAction.id).toBe('gates.bulk.approve.pending');
    expect(model.recommendedAction.queueSize).toBe(2);
    expect(model.recommendedAction.priorityScore).toBe(6);
  });

  it('computes recommendation telemetry insights from operations timeline', () => {
    const snapshot = {
      crm: { status: 'fulfilled', value: { items: [] } },
      billing: { status: 'fulfilled', value: { items: [] } },
      events: { status: 'fulfilled', value: { items: [] } },
      reservations: { status: 'fulfilled', value: { items: [] } },
      membership: { status: 'fulfilled', value: {} },
      qualityGates: { status: 'fulfilled', value: { items: [] } },
      contracts: { status: 'fulfilled', value: { items: [] } },
      analytics: { status: 'fulfilled', value: { consolidated: {} } },
      operations: { status: 'fulfilled', value: { total: 0, breakdownByType: [] } },
      operationsEvents: {
        status: 'fulfilled',
        value: { items: [] }
      },
      recommendationEvents: {
        status: 'fulfilled',
        value: {
          items: [
            { flow: 'sollu.recommendation', type: 'recommendation.presented', status: 'success', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
            { flow: 'sollu.recommendation', type: 'recommendation.executed', status: 'success', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), payload: { actionId: 'gates.bulk.approve.pending' } },
            { flow: 'sollu.recommendation', type: 'recommendation.executed', status: 'retry', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), payload: { actionId: 'crm.bulk.advance.proposal' } },
            { flow: 'sollu.recommendation', type: 'recommendation.executed', status: 'dead-letter', createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), payload: { actionId: 'gates.bulk.approve.pending' } },
            { flow: 'sollu.recommendation', type: 'recommendation.executed', status: 'dead-letter', createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), payload: { actionId: 'billing.bulk.collect.pending' } }
          ]
        }
      }
    };

    const model = buildAppOverviewModel(snapshot, { tenantId: 'sollu', role: 'operations' });
    expect(model.recommendationInsights.displayed).toBe(1);
    expect(model.recommendationInsights.executions).toBe(4);
    expect(model.recommendationInsights.success).toBe(1);
    expect(model.recommendationInsights.partial).toBe(1);
    expect(model.recommendationInsights.failed).toBe(2);
    expect(model.recommendationInsights.successRate).toBe(25);
    expect(model.recommendationEfficiency.executed).toBe(4);
    expect(model.recommendationEfficiency.successRate).toBe(25);
    expect(model.recommendationEfficiency.trend).toBe('subindo');
    expect(model.recommendationEfficiency.topActionId).toBe('gates.bulk.approve.pending');
    expect(model.sections.find((section) => section.id === 'recommendation-efficiency').items[0].subtitle).toBe('4 executadas');
  });
});
