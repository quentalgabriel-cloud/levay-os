import { logger } from '../../middleware/logger.middleware.js';

export const observabilityRoutes = (app, opts, done) => {
  app.get('/api/v1/observability/logs', async (request, reply) => {
    const tenantId = request.session?.tenantId;
    if (!tenantId) {
      return reply.code(401).send({ message: 'tenant required' });
    }

    const { startDate, endDate, level, module, eventType, limit } = request.query;

    const logs = logger.queryLogs({
      tenantId,
      startDate,
      endDate,
      level,
      module,
      eventType,
      limit: limit ? parseInt(limit, 10) : 100
    });

    return reply.send({ items: logs, count: logs.length });
  });

  app.get('/api/v1/observability/stats', async (request, reply) => {
    const tenantId = request.session?.tenantId;
    if (!tenantId) {
      return reply.code(401).send({ message: 'tenant required' });
    }

    const stats = logger.getStats({ tenantId });
    return reply.send(stats);
  });

  app.get('/api/v1/observability/health', async (request, reply) => {
    const tenantId = request.session?.tenantId || 'system';
    const stats = logger.getStats({ tenantId });
    
    const healthy = stats.errorRate === '0%' || stats.errorRate < '5%';
    
    return reply.send({
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      metrics: {
        totalLogs: stats.total,
        errorRate: stats.errorRate,
        lastLog: stats.newest
      }
    });
  });

  app.post('/api/v1/observability/cleanup', async (request, reply) => {
    const tenantId = request.session?.tenantId;
    if (!tenantId) {
      return reply.code(401).send({ message: 'tenant required' });
    }

    const { days = 30 } = request.body || {};
    const result = logger.clearOldLogs({ days });

    return reply.send({
      message: 'Cleanup completed',
      ...result
    });
  });

  done();
};