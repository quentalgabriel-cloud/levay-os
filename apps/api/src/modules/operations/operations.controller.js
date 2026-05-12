function sseEventChunk(type, data) {
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function operationsRoutes(fastify, options) {
  const { operationsService } = options;

  fastify.post('/api/v1/operations/events', async (request, reply) => {
    const { tenantId, type, flow, status, actorType, payload } = request.body || {};
    if (!tenantId || !type || !flow || !status) {
      return reply.code(400).send({ message: 'tenantId, type, flow and status are required' });
    }

    const created = operationsService.publish({ tenantId, type, flow, status, actorType, payload });
    return reply.code(201).send(created);
  });

  fastify.get('/api/v1/operations/events', async (request, reply) => {
    const { tenantId, type, status, flow, limit, since } = request.query || {};
    const items = operationsService.list({ tenantId, type, status, flow, limit, since });
    return reply.send({ items });
  });

  fastify.get('/api/v1/operations/events/summary', async (request, reply) => {
    const { tenantId, flow, since } = request.query || {};

    if (!tenantId) {
      return reply.code(400).send({ message: 'tenantId is required' });
    }

    const summary = operationsService.summarize({ tenantId, flow, since });
    return reply.send(summary);
  });

  fastify.get('/api/v1/operations/events/stream', async (request, reply) => {
    const { tenantId, limit } = request.query || {};
    let closed = false;

    const safeWrite = (chunk) => {
      if (closed) return;
      try {
        reply.raw.write(chunk);
      } catch {
        closed = true;
      }
    };

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Access-Control-Allow-Origin': fastify.resolveAllowedOrigin(request),
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'content-type,x-role,x-tenant-id',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    reply.hijack();

    safeWrite(sseEventChunk('connected', { connected: true, at: new Date().toISOString() }));

    const recent = operationsService.list({ tenantId, limit: limit || 50 });
    if (recent.length) {
      safeWrite(sseEventChunk('init', { events: recent }));
    }

    const unsubscribe = operationsService.subscribe((event) => {
      if (tenantId && event.tenantId !== tenantId) {
        return;
      }
      safeWrite(sseEventChunk('event', event));
    });

    const heartbeat = setInterval(() => {
      safeWrite(sseEventChunk('heartbeat', { alive: true, at: new Date().toISOString() }));
    }, 30000);

    request.raw.on('close', () => {
      closed = true;
      clearInterval(heartbeat);
      unsubscribe();
      reply.raw.end();
    });
  });
}
