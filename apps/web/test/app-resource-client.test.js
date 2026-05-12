import { describe, it, expect } from 'vitest';
import { AppResourceClient } from '../src/modules/app/app-resource-client.js';

describe('app resource client actions', () => {
  it('sends expected payloads for operational actions', async () => {
    const calls = [];
    const client = new AppResourceClient({
      fetchImpl: async (url, options = {}) => {
        calls.push({ url, options });
        return {
          ok: true,
          async json() {
            return { ok: true };
          }
        };
      }
    });

    await client.updateLeadStage({ tenantId: 'sollu', leadId: 'lead-1', stageId: 'proposal', actor: 'erick' });
    await client.triggerCollection({ tenantId: 'sollu', receivableId: 'rec-1' });
    await client.decideQualityGate({
      tenantId: 'sollu',
      gateId: 'gate-1',
      decision: 'approved',
      actor: 'erick',
      justification: 'ok'
    });
    await client.collectPendingReceivables({ tenantId: 'sollu' });
    await client.advanceLeadsToProposal({ tenantId: 'sollu', actor: 'erick' });
    await client.approvePendingGates({ tenantId: 'sollu', actor: 'erick', justification: 'bulk' });
    await client.publishOperationalEvent({
      tenantId: 'sollu',
      type: 'recommendation.presented',
      flow: 'sollu.recommendation',
      status: 'success',
      payload: { actionId: 'billing.bulk.collect.pending' }
    });

    expect(calls[0].url).toContain('/api/v1/crm/leads/lead-1/stage');
    expect(calls[1].url).toContain('/api/v1/billing/receivables/rec-1/collect');
    expect(calls[2].url).toContain('/api/v1/quality-gates/gate-1/decision');
    expect(calls[3].url).toContain('/api/v1/billing/collect-pending');
    expect(calls[4].url).toContain('/api/v1/crm/leads/advance-proposal');
    expect(calls[5].url).toContain('/api/v1/quality-gates/approve-pending');
    expect(calls[6].url).toContain('/api/v1/operations/events');
    calls.slice(0, 7).forEach((call) => {
      expect(call.options.headers['x-tenant-id']).toBe('sollu');
    });
  });

  it('passes x-role header when loading snapshot analytics', async () => {
    const calls = [];
    const client = new AppResourceClient({
      fetchImpl: async (url, options = {}) => {
        calls.push({ url, options });
        return {
          ok: true,
          async json() {
            return { items: [] };
          }
        };
      }
    });

    await client.loadSnapshot({ tenantId: 'sollu', role: 'ceo' });

    const analyticsCall = calls.find((call) => call.url.includes('/api/v1/analytics/executive'));
    const recommendationCall = calls.find(
      (call) => call.url.includes('/api/v1/operations/events') && call.url.includes('flow=sollu.recommendation')
    );
    expect(analyticsCall).toBeTruthy();
    expect(recommendationCall).toBeTruthy();
    expect(recommendationCall.url).toContain('since=');
    expect(analyticsCall.options.headers['x-role']).toBe('ceo');
    expect(analyticsCall.options.headers['x-tenant-id']).toBe('sollu');
  });
});
