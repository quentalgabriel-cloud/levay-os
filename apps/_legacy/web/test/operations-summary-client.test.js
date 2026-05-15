import { describe, it, expect } from 'vitest';
import { OperationsSummaryClient } from '../src/modules/operations/operations-summary-client.js';

describe('operations summary client', () => {
  it('builds summary request with tenant and flow', async () => {
    const calls = [];
    const client = new OperationsSummaryClient({
      fetchImpl: async (url) => {
        calls.push(url);
        return {
          ok: true,
          async json() {
            return { total: 1, success: 1, retry: 0, deadLetter: 0 };
          }
        };
      }
    });

    const result = await client.fetchSummary({ tenantId: 'sollu', flow: 'sollu.followup' });
    expect(calls[0]).toBe('http://localhost:3000/api/v1/operations/events/summary?tenantId=sollu&flow=sollu.followup');
    expect(result.total).toBe(1);
  });

  it('throws on non-ok response', async () => {
    const client = new OperationsSummaryClient({
      fetchImpl: async () => ({ ok: false, status: 500 })
    });

    await expect(client.fetchSummary({ tenantId: 'sollu' })).rejects.toThrow('summary_request_failed:500');
  });
});
