import { buildDashboardContract } from './dashboard.config.js';
import { resolveTenantId, resolveRole } from '../session/session.context.js';

export function dashboardRoutes(fastify, options) {
  fastify.get('/api/v1/dashboard/context', async (request, reply) => {
    const tenantId = resolveTenantId(request);
    if (!tenantId) {
      return reply.code(401).send({ message: 'tenant context is required' });
    }

    const role = resolveRole(request);
    const contract = buildDashboardContract(role);

    reply.send({
      tenantId,
      role,
      contract,
      timestamp: new Date().toISOString()
    });
  });
}
