export class EventsService {
  constructor(repository) {
    this.repository = repository;
  }

  createEvent(payload) {
    const event = this.repository.createEvent(payload);
    this.recomputeConflicts(payload.tenantId);
    return event;
  }

  listEvents({ tenantId, from, to }) {
    const events = this.repository.listEvents(tenantId);
    if (!from && !to) {
      return events;
    }

    const fromDate = from ? new Date(from).getTime() : Number.MIN_SAFE_INTEGER;
    const toDate = to ? new Date(to).getTime() : Number.MAX_SAFE_INTEGER;

    return events.filter((event) => {
      const starts = new Date(event.startsAt).getTime();
      const ends = new Date(event.endsAt).getTime();
      return starts <= toDate && ends >= fromDate;
    });
  }

  updateEvent({ tenantId, eventId, updates }) {
    const updated = this.repository.updateEvent({ tenantId, eventId, updates });
    if (!updated) {
      return null;
    }
    this.recomputeConflicts(tenantId);
    this.repository.addAudit({
      tenantId,
      eventId,
      action: 'event.updated',
      metadata: updates
    });
    return updated;
  }

  listAudit(tenantId) {
    return this.repository.listAudit(tenantId);
  }

  recomputeConflicts(tenantId) {
    const events = this.repository.listEvents(tenantId);
    for (const event of events) {
      event.hasConflict = false;
    }

    for (let i = 0; i < events.length; i += 1) {
      for (let j = i + 1; j < events.length; j += 1) {
        const a = events[i];
        const b = events[j];
        const overlap = new Date(a.startsAt).getTime() < new Date(b.endsAt).getTime()
          && new Date(b.startsAt).getTime() < new Date(a.endsAt).getTime()
          && a.venue === b.venue;
        if (overlap) {
          a.hasConflict = true;
          b.hasConflict = true;
        }
      }
    }
  }
}

