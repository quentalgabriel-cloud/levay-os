export async function analyticsRoutes(fastify, options) {
  const { analyticsService, crmService, billingService, reservationsService, eventsService } = options;

  analyticsService.setServices({ crmService, billingService, reservationsService, eventsService });

  fastify.post('/api/v1/analytics/events', async (request, reply) => {
    const { tenantId, revenue, conversion, efficiency, createdAt } = request.body;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }
    analyticsService.ingest({ tenantId, revenue, conversion, efficiency, createdAt });
    return reply.code(202).send({ accepted: true });
  });

  fastify.get('/api/v1/analytics/executive', async (request, reply) => {
    const role = request.headers['x-role'] || 'operator';
    const { tenantId, from, to } = request.query;

    if (role !== 'ceo' && !tenantId) {
      return reply.code(403).send({ message: 'tenantId is required for non-ceo role' });
    }

    const result = await analyticsService.getExecutiveKpis({ tenantId, from, to, role });
    return reply.send(result);
  });
}

