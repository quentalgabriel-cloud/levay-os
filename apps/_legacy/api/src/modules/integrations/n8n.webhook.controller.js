import { verifyN8nSignature } from './n8n.signature.js';

export async function n8nWebhookRoutes(fastify, options) {
  const { n8nService, n8nSecret = 'n8n-secret-dev' } = options;

  fastify.post('/api/v1/integrations/n8n/webhook', async (request, reply) => {
    const signature = request.headers['x-n8n-signature'];
    const rawBody = JSON.stringify(request.body || {});

    const validSignature = verifyN8nSignature({
      rawBody,
      signature,
      secret: n8nSecret
    });

    if (!validSignature) {
      return reply.code(401).send({ message: 'Invalid signature' });
    }

    const result = n8nService.ingestLead(request.body || {});
    if (!result.ok) {
      return reply.code(400).send({ message: 'Invalid payload' });
    }

    return reply.code(202).send({ accepted: true, duplicate: !!result.duplicate, leadId: result.leadId || null });
  });

  fastify.get('/api/v1/integrations/logs', async (request, reply) => {
    const { tenantId } = request.query;
    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }
    return reply.send({ items: n8nService.listLogs(tenantId) });
  });
}

