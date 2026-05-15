export async function reservationsRoutes(fastify, options) {
  const { reservationsService } = options;

  fastify.post('/api/v1/reservations/tables', async (request, reply) => {
    const { tenantId, label, capacity } = request.body;
    if (!tenantId || !label || !capacity) {
      return reply.code(400).send({ message: 'tenantId, label and capacity are required' });
    }

    const table = reservationsService.createTable({ tenantId, label, capacity });
    return reply.code(201).send(table);
  });

  fastify.get('/api/v1/reservations/tables', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }
    return reply.send({ items: reservationsService.listTables(tenantId) });
  });

  fastify.patch('/api/v1/reservations/tables/:tableId/status', async (request, reply) => {
    const { tableId } = request.params;
    const { tenantId, status } = request.body;
    if (!tenantId || !status) {
      return reply.code(400).send({ message: 'tenantId and status are required' });
    }
    const updated = reservationsService.updateTableStatus({ tenantId, tableId, status });
    if (!updated) {
      return reply.code(404).send({ message: 'Table not found for tenant' });
    }
    return reply.send(updated);
  });

  fastify.post('/api/v1/reservations', async (request, reply) => {
    const { tenantId, guestName, seats } = request.body;
    if (!tenantId || !guestName || !seats) {
      return reply.code(400).send({ message: 'tenantId, guestName and seats are required' });
    }
    const result = reservationsService.createReservation({ tenantId, guestName, seats });
    if (!result.ok) {
      return reply.code(409).send({ message: result.reason });
    }
    return reply.code(201).send(result.reservation);
  });

  fastify.get('/api/v1/reservations', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }
    return reply.send({ items: reservationsService.listReservations(tenantId) });
  });

  fastify.post('/api/v1/reservations/waitlist', async (request, reply) => {
    const { tenantId, guestName, seats, priority } = request.body;
    if (!tenantId || !guestName || !seats) {
      return reply.code(400).send({ message: 'tenantId, guestName and seats are required' });
    }
    return reply.code(201).send(reservationsService.enqueueWaitlist({ tenantId, guestName, seats, priority }));
  });

  fastify.get('/api/v1/reservations/waitlist', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }
    return reply.send({ items: reservationsService.listWaitlist(tenantId) });
  });

  fastify.post('/api/v1/reservations/waitlist/promote', async (request, reply) => {
    const { tenantId } = request.body;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }

    const result = reservationsService.promoteFromWaitlist(tenantId);
    if (!result.ok) {
      return reply.code(409).send({ message: result.reason });
    }
    return reply.code(201).send(result.reservation);
  });
}

