import { AuditService } from './audit.service.js';
import { auditRepository } from './audit.repository.js';

const auditService = new AuditService(auditRepository);

export const auditRoutes = (app, opts, done) => {
  app.get('/api/v1/audit/events', async (request, reply) => {
    const tenantId = request.session?.tenantId;
    if (!tenantId) {
      return reply.code(401).send({ message: 'tenant required' });
    }

    const { type, actor, since, until, limit } = request.query;

    const events = auditService.listEvents({
      tenantId,
      type,
      actor,
      since,
      until,
      limit: limit ? parseInt(limit, 10) : 100
    });

    return reply.send({ items: events });
  });

  app.get('/api/v1/audit/event-types', async (request, reply) => {
    const tenantId = request.session?.tenantId;
    if (!tenantId) {
      return reply.code(401).send({ message: 'tenant required' });
    }

    return reply.send({ items: auditService.getEventTypes() });
  });

  app.get('/api/v1/audit/stats', async (request, reply) => {
    const tenantId = request.session?.tenantId;
    if (!tenantId) {
      return reply.code(401).send({ message: 'tenant required' });
    }

    const stats = auditRepository.getStats({ tenantId });
    return reply.send(stats);
  });

  app.post('/api/v1/audit/retention', async (request, reply) => {
    const tenantId = request.session?.tenantId;
    if (!tenantId) {
      return reply.code(401).send({ message: 'tenant required' });
    }

    const { retentionDays = 365 } = request.body || {};

    const result = auditService.applyRetentionPolicy({ tenantId, retentionDays });
    return reply.send({ message: 'Retention policy applied', ...result });
  });

  done();
};

export { auditService };