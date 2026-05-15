// Structured Logger with Correlation ID
// Implements tenant-scoped logging with full traceability

import { randomUUID } from 'node:crypto';

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LEVEL = process.env.LOG_LEVEL ? LOG_LEVELS[process.env.LOG_LEVEL] : LOG_LEVELS.INFO;

class StructuredLogger {
  constructor() {
    this.logs = [];
    this.tenantIndex = new Map();
  }

  createLogEntry({ level, message, tenantId, module, eventType, correlationId, metadata = {} }) {
    const entry = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      message,
      tenantId: tenantId || 'system',
      module: module || 'unknown',
      eventType: eventType || 'general',
      correlationId,
      ...metadata
    };

    if (LOG_LEVELS[level] <= CURRENT_LEVEL) {
      this.logs.push(entry);
      
      if (tenantId) {
        if (!this.tenantIndex.has(tenantId)) {
          this.tenantIndex.set(tenantId, []);
        }
        this.tenantIndex.get(tenantId).push(entry);
      }
    }

    return entry;
  }

  error({ message, tenantId, module, eventType, correlationId, error, stack }) {
    const isProduction = process.env.NODE_ENV === 'production';
    const metadata = { error: error?.message || error };
    if (!isProduction && stack) {
      metadata.stack = stack;
    }
    return this.createLogEntry({
      level: 'ERROR',
      message,
      tenantId,
      module,
      eventType,
      correlationId,
      metadata
    });
  }

  warn({ message, tenantId, module, eventType, correlationId }) {
    return this.createLogEntry({
      level: 'WARN',
      message,
      tenantId,
      module,
      eventType
    });
  }

  info({ message, tenantId, module, eventType, correlationId, durationMs }) {
    return this.createLogEntry({
      level: 'INFO',
      message,
      tenantId,
      module,
      eventType,
      metadata: { durationMs }
    });
  }

  debug({ message, tenantId, module, eventType, correlationId }) {
    return this.createLogEntry({
      level: 'DEBUG',
      message,
      tenantId,
      module,
      eventType
    });
  }

  logWorkerExecution({ tenantId, workerName, action, status, durationMs, correlationId }) {
    return this.createLogEntry({
      level: status === 'failed' ? 'ERROR' : 'INFO',
      message: `Worker ${workerName}: ${action} - ${status}`,
      tenantId,
      module: 'workers',
      eventType: `worker.${action}`,
      correlationId,
      metadata: { workerName, action, status, durationMs }
    });
  }

  logSecurityEvent({ tenantId, event, actor, ip, result }) {
    return this.createLogEntry({
      level: result === 'blocked' ? 'WARN' : 'INFO',
      message: `Security event: ${event}`,
      tenantId,
      module: 'security',
      eventType: `security.${event}`,
      metadata: { actor, ip, result }
    });
  }

  queryLogs({ tenantId, startDate, endDate, level, module, eventType, limit = 100 }) {
    let results = this.logs;

    if (tenantId) {
      results = results.filter(l => l.tenantId === tenantId);
    }

    if (startDate) {
      results = results.filter(l => new Date(l.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      results = results.filter(l => new Date(l.timestamp) <= new Date(endDate));
    }

    if (level) {
      results = results.filter(l => l.level === level);
    }

    if (module) {
      results = results.filter(l => l.module === module);
    }

    if (eventType) {
      results = results.filter(l => l.eventType.startsWith(eventType));
    }

    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return results.slice(0, limit);
  }

  getStats({ tenantId }) {
    const logs = tenantId ? this.tenantIndex.get(tenantId) || [] : this.logs;
    
    const byLevel = {};
    const byModule = {};
    const byEventType = {};
    let errorCount = 0;

    logs.forEach(log => {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
      byModule[log.module] = (byModule[log.module] || 0) + 1;
      byEventType[log.eventType] = (byEventType[log.eventType] || 0) + 1;
      
      if (log.level === 'ERROR') errorCount++;
    });

    const timestamps = logs.map(l => new Date(l.timestamp).getTime());
    const oldest = timestamps.length ? new Date(Math.min(...timestamps)).toISOString() : null;
    const newest = timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : null;

    return {
      total: logs.length,
      errorCount,
      errorRate: logs.length ? (errorCount / logs.length * 100).toFixed(2) + '%' : '0%',
      byLevel,
      byModule,
      byEventType,
      oldest,
      newest
    };
  }

  clearOldLogs({ days = 30 }) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString();

    const before = this.logs.length;
    this.logs = this.logs.filter(l => l.timestamp >= cutoffStr);
    
    this.tenantIndex.clear();
    this.logs.forEach(log => {
      if (log.tenantId) {
        if (!this.tenantIndex.has(log.tenantId)) {
          this.tenantIndex.set(log.tenantId, []);
        }
        this.tenantIndex.get(log.tenantId).push(log);
      }
    });

    return { cleared: before - this.logs.length };
  }
}

export const logger = new StructuredLogger();

export function createLogMiddleware(request, reply) {
  const correlationId = request.headers['x-correlation-id'] || randomUUID();
  request.correlationId = correlationId;
  
  const startTime = Date.now();
  
  reply.raw.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const tenantId = request.session?.tenantId || request.headers['x-tenant-id'];
    
    logger.info({
      message: `${request.method} ${request.url}`,
      tenantId,
      module: 'http',
      eventType: 'request.completed',
      correlationId,
      metadata: {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs
      }
    });
  });
}