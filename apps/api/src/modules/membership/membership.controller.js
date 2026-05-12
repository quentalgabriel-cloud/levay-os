export async function membershipRoutes(fastify, options) {
  const { membershipService } = options;

  fastify.post('/api/v1/membership/members', async (request, reply) => {
    const { tenantId, name, tier, validUntil, actor } = request.body;
    if (!tenantId || !name || !tier || !validUntil) {
      return reply.code(400).send({ message: 'tenantId, name, tier and validUntil are required' });
    }
    return reply.code(201).send(membershipService.createMember({ tenantId, name, tier, validUntil }, actor));
  });

  fastify.get('/api/v1/membership/members', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }
    return reply.send({ items: membershipService.listMembers(tenantId) });
  });

  fastify.post('/api/v1/membership/members/:memberId/renew', async (request, reply) => {
    const { memberId } = request.params;
    const { tenantId, validUntil, actor } = request.body;
    const updated = membershipService.renewMember({ tenantId, memberId, validUntil }, actor);
    if (!updated) {
      return reply.code(404).send({ message: 'Member not found for tenant' });
    }
    return reply.send(updated);
  });

  fastify.post('/api/v1/membership/members/:memberId/expire', async (request, reply) => {
    const { memberId } = request.params;
    const { tenantId, actor } = request.body;
    const updated = membershipService.expireMember({ tenantId, memberId }, actor);
    if (!updated) {
      return reply.code(404).send({ message: 'Member not found for tenant' });
    }
    return reply.send(updated);
  });

  fastify.post('/api/v1/membership/members/:memberId/cancel', async (request, reply) => {
    const { memberId } = request.params;
    const { tenantId, actor } = request.body;
    const updated = membershipService.cancelMember({ tenantId, memberId }, actor);
    if (!updated) {
      return reply.code(404).send({ message: 'Member not found for tenant' });
    }
    return reply.send(updated);
  });

  fastify.post('/api/v1/membership/benefits', async (request, reply) => {
    const { tenantId, name, eligibleTiers } = request.body;
    if (!tenantId || !name) {
      return reply.code(400).send({ message: 'tenantId and name are required' });
    }
    return reply.code(201).send(membershipService.createBenefit({ tenantId, name, eligibleTiers }));
  });

  fastify.post('/api/v1/membership/eligibility', async (request, reply) => {
    const { tenantId, memberId, benefitId } = request.body;
    if (!tenantId || !memberId || !benefitId) {
      return reply.code(400).send({ message: 'tenantId, memberId and benefitId are required' });
    }
    return reply.send(membershipService.checkBenefitEligibility({ tenantId, memberId, benefitId }));
  });

  fastify.get('/api/v1/membership/operational-view', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }
    return reply.send(membershipService.listOperationalView(tenantId));
  });

  fastify.get('/api/v1/membership/audit', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }
    return reply.send({ items: membershipService.listAudit(tenantId) });
  });
}

