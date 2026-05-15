// Audit Repository - In-memory store for audit events
// Production: Replace with database persistence

class AuditRepository {
  constructor() {
    this.events = [];
    this.archivedEvents = [];
  }

  addAuditEvent(event) {
    this.events.push({
      ...event,
      archived: false
    });
    return event;
  }

  listEvents({ tenantId, type, actor, since, until, limit = 100 }) {
    let results = this.events.filter(e => e.tenantId === tenantId && !e.archived);

    if (type) {
      results = results.filter(e => e.type.startsWith(type) || e.type === type);
    }

    if (actor) {
      results = results.filter(e => e.actor?.toLowerCase().includes(actor.toLowerCase()));
    }

    if (since) {
      const sinceDate = new Date(since);
      results = results.filter(e => new Date(e.createdAt) >= sinceDate);
    }

    if (until) {
      const untilDate = new Date(until);
      results = results.filter(e => new Date(e.createdAt) <= untilDate);
    }

    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return results.slice(0, limit);
  }

  archiveOldEvents({ tenantId, cutoff }) {
    const cutoffDate = new Date(cutoff);
    let archived = 0;

    this.events = this.events.map(e => {
      if (e.tenantId === tenantId && !e.archived && new Date(e.createdAt) < cutoffDate) {
        e.archived = true;
        this.archivedEvents.push(e);
        archived++;
      }
      return e;
    });

    return { archived };
  }

  getStats({ tenantId }) {
    const active = this.events.filter(e => e.tenantId === tenantId && !e.archived);
    const byType = {};

    active.forEach(e => {
      const baseType = e.type.split('.')[0];
      byType[baseType] = (byType[baseType] || 0) + 1;
    });

    return {
      total: active.length,
      byType,
      oldest: active.length > 0 ? active[active.length - 1].createdAt : null,
      newest: active.length > 0 ? active[0].createdAt : null
    };
  }
}

export const auditRepository = new AuditRepository();