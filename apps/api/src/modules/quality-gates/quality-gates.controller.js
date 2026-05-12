export async function qualityGatesRoutes(fastify, options) {
  const { qualityGatesService } = options;

  fastify.post('/api/v1/quality-gates', async (request, reply) => {
    const { tenantId, flowName, stepName, reason } = request.body;
    if (!tenantId || !flowName || !stepName || !reason) {
      return reply.code(400).send({ message: 'tenantId, flowName, stepName and reason are required' });
    }

    const gate = qualityGatesService.createGate({ tenantId, flowName, stepName, reason });
    return reply.code(201).send(gate);
  });

  fastify.get('/api/v1/quality-gates/pending', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }
    return reply.send({ items: qualityGatesService.listPending(tenantId) });
  });

  fastify.post('/api/v1/quality-gates/:gateId/decision', async (request, reply) => {
    const { gateId } = request.params;
    const { tenantId, actor, decision, justification } = request.body;
    if (!tenantId || !decision) {
      return reply.code(400).send({ message: 'tenantId and decision are required' });
    }

    const result = qualityGatesService.decideGate({
      tenantId,
      gateId,
      actor,
      decision,
      justification
    });

    if (!result.ok) {
      return reply.code(409).send({ message: result.reason });
    }
    return reply.send(result.gate);
  });

  fastify.post('/api/v1/quality-gates/approve-pending', async (request, reply) => {
    const { tenantId, actor, justification } = request.body;
    if (!tenantId || !actor || !justification) {
      return reply.code(400).send({ message: 'tenantId, actor and justification are required' });
    }

    const pending = qualityGatesService.listPending(tenantId);
    let processed = 0;
    let failed = 0;

    for (const gate of pending) {
      const result = qualityGatesService.decideGate({
        tenantId,
        gateId: gate.id,
        actor,
        decision: 'approved',
        justification
      });
      if (result.ok) {
        processed += 1;
      } else {
        failed += 1;
      }
    }

    return reply.send({
      processed,
      failed,
      totalPending: pending.length
    });
  });

  fastify.get('/api/v1/quality-gates/decisions', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }
    return reply.send({ items: qualityGatesService.listDecisions(tenantId) });
  });
}
