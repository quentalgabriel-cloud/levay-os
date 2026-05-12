export async function eventsRoutes(fastify, options) {
  const { eventsService } = options;

  fastify.post('/api/v1/events', async (request, reply) => {
    const { tenantId, title, venue, startsAt, endsAt, status } = request.body;
    if (!tenantId || !title || !venue || !startsAt || !endsAt) {
      return reply.code(400).send({ message: 'tenantId, title, venue, startsAt, endsAt are required' });
    }

    const event = eventsService.createEvent({ tenantId, title, venue, startsAt, endsAt, status });
    return reply.code(201).send(event);
  });

  fastify.get('/api/v1/events', async (request, reply) => {
    const { tenantId, from, to } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }

    return reply.send({ items: eventsService.listEvents({ tenantId, from, to }) });
  });

  fastify.put('/api/v1/events/:eventId', async (request, reply) => {
    const { eventId } = request.params;
    const { tenantId, updates } = request.body;
    if (!tenantId || !updates) {
      return reply.code(400).send({ message: 'tenantId and updates are required' });
    }

    const updated = eventsService.updateEvent({ tenantId, eventId, updates });
    if (!updated) {
      return reply.code(404).send({ message: 'Event not found for tenant' });
    }
    return reply.send(updated);
  });

  fastify.get('/api/v1/events/audit', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }

    return reply.send({ items: eventsService.listAudit(tenantId) });
  });
}

