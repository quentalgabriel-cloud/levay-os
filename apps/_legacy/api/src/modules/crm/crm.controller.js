export async function crmRoutes(fastify, options) {
  const { crmService } = options;

  fastify.get('/api/v1/crm/pipeline', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }

    return reply.send({ items: crmService.listPipeline(tenantId) });
  });

  fastify.post('/api/v1/crm/pipeline/stages', async (request, reply) => {
    const { tenantId, stageName } = request.body;
    if (!tenantId || !stageName) {
      return reply.code(400).send({ message: 'tenantId and stageName are required' });
    }

    const stage = crmService.addStage(tenantId, stageName);
    return reply.code(201).send(stage);
  });

  fastify.post('/api/v1/crm/leads', async (request, reply) => {
    const { tenantId, name, stageId, nextFollowUpAt } = request.body;
    if (!tenantId || !name) {
      return reply.code(400).send({ message: 'tenantId and name are required' });
    }

    const lead = crmService.createLead({ tenantId, name, stageId, nextFollowUpAt });
    return reply.code(201).send(lead);
  });

  fastify.get('/api/v1/crm/leads', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }

    return reply.send({ items: crmService.listLeads(tenantId) });
  });

  fastify.put('/api/v1/crm/leads/:leadId/stage', async (request, reply) => {
    const { leadId } = request.params;
    const { tenantId, stageId, actor } = request.body;

    if (!tenantId || !stageId) {
      return reply.code(400).send({ message: 'tenantId and stageId are required' });
    }

    const updated = crmService.updateLeadStage({ tenantId, leadId, stageId, actor });
    if (!updated) {
      return reply.code(404).send({ message: 'Lead or stage not found for tenant' });
    }

    return reply.send(updated);
  });

  fastify.post('/api/v1/crm/leads/advance-proposal', async (request, reply) => {
    const { tenantId, actor } = request.body;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }

    const leads = crmService.listLeads(tenantId).filter((lead) => lead.stageId !== 'proposal');
    let processed = 0;
    for (const lead of leads) {
      const updated = crmService.updateLeadStage({
        tenantId,
        leadId: lead.id,
        stageId: 'proposal',
        actor: actor || 'system-bulk'
      });
      if (updated) {
        processed += 1;
      }
    }

    return reply.send({
      processed,
      totalCandidates: leads.length
    });
  });

  fastify.get('/api/v1/crm/audit-events', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }

    return reply.send({ items: crmService.listAuditEvents(tenantId) });
  });
}
