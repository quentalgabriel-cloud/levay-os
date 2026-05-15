export async function contractsRoutes(fastify, options) {
  const { contractsService } = options;

  fastify.post('/api/v1/contracts/upload', async (request, reply) => {
    const { tenantId, customerName, contentBase64, folderId, simulateFailCount } = request.body;
    if (!tenantId || !customerName || !contentBase64) {
      return reply.code(400).send({ message: 'tenantId, customerName and contentBase64 are required' });
    }

    const result = await contractsService.uploadContract({
      tenantId,
      customerName,
      contentBase64,
      folderId,
      simulateFailCount
    });

    if (!result.ok) {
      return reply.code(502).send({ message: result.reason });
    }
    return reply.code(201).send(result.metadata);
  });

  fastify.get('/api/v1/contracts', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }
    return reply.send({ items: contractsService.listContracts(tenantId) });
  });

  fastify.get('/api/v1/contracts/audit', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }
    return reply.send({ items: contractsService.listAudit(tenantId) });
  });
}

