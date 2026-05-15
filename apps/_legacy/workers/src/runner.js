import { createServer } from 'node:http';
import { FollowupQueue } from './core/followup.queue.js';
import { OperationsEventPublisher } from './core/operations.event-publisher.js';
import { FollowupDispatcher } from './jobs/followup.dispatcher.js';
import { WhatsAppClient } from '../../../packages/integrations/src/whatsapp/client.js';

const POLL_INTERVAL_MS = Number(process.env.WORKERS_POLL_INTERVAL_MS || 5000);
const PORT = Number(process.env.PORT || process.env.WORKERS_PORT || 3400);

const queue = new FollowupQueue();
const auditLog = [];
const operationsPublisher = new OperationsEventPublisher();
const dispatcher = new FollowupDispatcher({
  queue,
  whatsappClient: new WhatsAppClient(),
  auditLog,
  operationsPublisher
});

let lastRunAt = null;
let running = false;

async function processQueue() {
  if (running) {
    return;
  }

  running = true;
  try {
    await dispatcher.dispatchDueJobs(new Date());
    lastRunAt = new Date().toISOString();
  } finally {
    running = false;
  }
}

const server = createServer((req, res) => {
  if (req.url === '/health') {
    const body = JSON.stringify({
      ok: true,
      queueDepth: queue.pendingUntil(new Date('2999-01-01T00:00:00.000Z')).length,
      deadLetters: queue.deadLetters.length,
      processed: queue.jobs.filter((item) => item.status === 'processed').length,
      lastRunAt
    });
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(body);
    return;
  }

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

const interval = setInterval(() => {
  processQueue().catch((error) => {
    console.error(`@levay/workers dispatch failed: ${String(error.message || error)}`);
  });
}, POLL_INTERVAL_MS);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`@levay/workers running at http://localhost:${PORT}`);
});

processQueue().catch((error) => {
  console.error(`@levay/workers bootstrap failed: ${String(error.message || error)}`);
});

function shutdown() {
  clearInterval(interval);
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
