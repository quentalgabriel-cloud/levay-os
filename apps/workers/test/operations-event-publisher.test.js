import { describe, it, expect } from 'vitest';
import { OperationsEventPublisher } from '../src/core/operations.event-publisher.js';

describe('operations event publisher', () => {
  it('sends tenant and worker headers when publishing to api', async () => {
    const calls = [];
    const publisher = new OperationsEventPublisher({
      baseUrl: 'http://localhost:3000',
      fetchImpl: async (url, options) => {
        calls.push({ url, options });
        return { ok: true };
      }
    });

    await publisher.publish({
      tenantId: 'sollu',
      type: 'followup.dispatched',
      flow: 'sollu.followup',
      status: 'success'
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('http://localhost:3000/api/v1/operations/events');
    expect(calls[0].options.headers['x-tenant-id']).toBe('sollu');
    expect(calls[0].options.headers['x-role']).toBe('worker');
  });

  it('skips publishing when tenant id is absent', async () => {
    const calls = [];
    const publisher = new OperationsEventPublisher({
      fetchImpl: async (url, options) => {
        calls.push({ url, options });
        return { ok: true };
      }
    });

    await publisher.publish({
      type: 'followup.dispatched',
      flow: 'sollu.followup',
      status: 'success'
    });

    expect(calls).toHaveLength(0);
  });
});
