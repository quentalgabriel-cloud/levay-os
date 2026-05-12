import { randomUUID } from 'node:crypto';

export class OperationsService {
  constructor(repository) {
    this.repository = repository;
  }

  publish(eventInput) {
    const event = {
      id: randomUUID(),
      tenantId: eventInput.tenantId,
      type: eventInput.type,
      flow: eventInput.flow,
      status: eventInput.status,
      actorType: eventInput.actorType || 'worker',
      payload: eventInput.payload || {},
      createdAt: new Date().toISOString()
    };

    return this.repository.addEvent(event);
  }

  list(filters = {}) {
    return this.repository.listEvents(filters);
  }

  summarize(filters = {}) {
    return this.repository.summarizeEvents(filters);
  }

  subscribe(listener) {
    return this.repository.subscribe(listener);
  }
}
