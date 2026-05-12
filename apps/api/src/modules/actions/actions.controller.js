export async function actionsRoutes(fastify, options) {
  const { actionsService } = options;

  fastify.post('/api/v1/actions/intent', async (request, reply) => {
    const { tenantId, actionId, payload, actor, role, actorType } = request.body || {};
    if (!tenantId || !actionId) {
      return reply.code(400).send({ ok: false, reason: 'tenant_and_action_required' });
    }

    const result = actionsService.handleIntent({
      tenantId,
      actionId,
      payload,
      actor,
      role,
      actorType
    });

    if (!result.ok) {
      let statusCode = 400;
      if (['lead_not_found', 'receivable_not_found', 'gate_not_found'].includes(result.reason)) {
        statusCode = 404;
      } else if (['forbidden'].includes(result.reason)) {
        statusCode = 403;
      } else if (['role_required'].includes(result.reason)) {
        statusCode = 401;
      }
      return reply.code(statusCode).send(result);
    }

    return reply.code(202).send(result);
  });
}
