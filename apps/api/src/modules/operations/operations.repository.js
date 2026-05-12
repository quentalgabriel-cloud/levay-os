export class OperationsRepository {
  constructor({ maxEvents = 1000 } = {}) {
    this.maxEvents = maxEvents;
    this.events = [];
    this.subscribers = new Set();
  }

  addEvent(event) {
    this.events.unshift(event);
    if (this.events.length > this.maxEvents) {
      this.events.length = this.maxEvents;
    }

    for (const subscriber of this.subscribers) {
      subscriber(event);
    }

    return event;
  }

  listEvents({ tenantId, type, status, flow, limit = 100, since } = {}) {
    const normalizedLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
    const sinceTime = since ? Date.parse(since) : Number.NaN;

    return this.events
      .filter((item) => {
        if (tenantId && item.tenantId !== tenantId) return false;
        if (type && item.type !== type) return false;
        if (status && item.status !== status) return false;
        if (flow && item.flow !== flow) return false;
        if (!Number.isNaN(sinceTime) && Date.parse(item.createdAt) < sinceTime) return false;
        return true;
      })
      .slice(0, normalizedLimit);
  }

  summarizeEvents({ tenantId, flow, since } = {}) {
    const events = this.listEvents({ tenantId, flow, since, limit: this.maxEvents });
    const breakdown = new Map();
    let success = 0;
    let retry = 0;
    let deadLetter = 0;

    for (const event of events) {
      breakdown.set(event.type, (breakdown.get(event.type) || 0) + 1);

      if (event.status === 'success') {
        success += 1;
      } else if (event.status === 'retry') {
        retry += 1;
      } else if (event.status === 'dead-letter') {
        deadLetter += 1;
      }
    }

    return {
      tenantId: tenantId || null,
      flow: flow || null,
      total: events.length,
      success,
      retry,
      deadLetter,
      breakdownByType: Array.from(breakdown.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type))
    };
  }

  subscribe(listener) {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }
}
