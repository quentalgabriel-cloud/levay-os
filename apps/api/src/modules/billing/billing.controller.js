export async function billingRoutes(fastify, options) {
  const { billingService } = options;

  fastify.post('/api/v1/billing/receivables', async (request, reply) => {
    const { tenantId, customerName, amount, dueDate } = request.body;
    if (!tenantId || !customerName || amount == null || !dueDate) {
      return reply.code(400).send({ message: 'tenantId, customerName, amount and dueDate are required' });
    }

    const receivable = billingService.createReceivable({ tenantId, customerName, amount, dueDate });
    return reply.code(201).send(receivable);
  });

  fastify.get('/api/v1/billing/receivables', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }

    return reply.send({ items: billingService.listReceivables(tenantId) });
  });

  fastify.post('/api/v1/billing/receivables/:receivableId/collect', async (request, reply) => {
    const { receivableId } = request.params;
    const { tenantId, channel } = request.body;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }

    const result = billingService.triggerCollection({ tenantId, receivableId, channel });
    if (!result) {
      return reply.code(404).send({ message: 'Receivable not found for tenant' });
    }

    return reply.code(202).send(result);
  });

  fastify.post('/api/v1/billing/collect-pending', async (request, reply) => {
    const { tenantId, channel } = request.body;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }

    const pendingReceivables = billingService
      .listReceivables(tenantId)
      .filter((item) => item.status === 'pending');

    let processed = 0;
    for (const receivable of pendingReceivables) {
      const result = billingService.triggerCollection({
        tenantId,
        receivableId: receivable.id,
        channel: channel || 'whatsapp'
      });
      if (result) {
        processed += 1;
      }
    }

    return reply.code(202).send({
      processed,
      totalPending: pendingReceivables.length
    });
  });

  fastify.post('/api/v1/billing/payment-callback', async (request, reply) => {
    const { tenantId, providerPayload } = request.body;
    if (!tenantId || !providerPayload) {
      return reply.code(400).send({ message: 'tenantId and providerPayload are required' });
    }

    const updated = await billingService.applyPaymentCallback({ tenantId, providerPayload });
    if (!updated) {
      return reply.code(404).send({ message: 'Receivable not found for tenant' });
    }

    return reply.send(updated);
  });

  fastify.get('/api/v1/billing/events', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }

    return reply.send({ items: billingService.listBillingEvents(tenantId) });
  });
}
