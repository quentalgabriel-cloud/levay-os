export class OperationsEventPublisher {
  constructor({ baseUrl = process.env.LEVAY_API_BASE_URL || 'http://localhost:3000', fetchImpl = fetch } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchImpl = fetchImpl;
  }

  async publish(event) {
    const tenantId = event?.tenantId;
    if (!tenantId) {
      return;
    }

    try {
      await this.fetchImpl(`${this.baseUrl}/api/v1/operations/events`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': tenantId,
          'x-role': 'worker'
        },
        body: JSON.stringify(event)
      });
    } catch {
      // No-op on publishing failure to avoid blocking operational workers.
    }
  }
}
