export class OperationsSummaryClient {
  constructor({ baseUrl = 'http://localhost:3000', fetchImpl = fetch } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchImpl = fetchImpl;
  }

  async fetchSummary({ tenantId, flow } = {}) {
    if (!tenantId) {
      throw new Error('tenantId is required');
    }

    const params = new URLSearchParams({ tenantId });
    if (flow) {
      params.set('flow', flow);
    }

    const response = await this.fetchImpl(`${this.baseUrl}/api/v1/operations/events/summary?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`summary_request_failed:${response.status}`);
    }

    return response.json();
  }
}
