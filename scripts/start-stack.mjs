import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const children = [];
let shuttingDown = false;

function findAvailablePort(preferredPort) {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        resolve(findAvailablePort(preferredPort + 1));
        return;
      }
      reject(error);
    });

    server.once('listening', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : preferredPort;
      server.close(() => resolve(port));
    });

    server.listen(preferredPort, '0.0.0.0');
  });
}

function stopAll(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  setTimeout(() => process.exit(code), 100);
}

async function main() {
  const apiPort = await findAvailablePort(Number(process.env.API_PORT || 3000));
  const webPort = await findAvailablePort(Number(process.env.WEB_PORT || 3200));
  const workersPort = await findAvailablePort(Number(process.env.WORKERS_PORT || 3400));
  const apiBaseUrl = `http://localhost:${apiPort}`;
  const services = [
    {
      name: 'api',
      command: 'npm',
      args: ['run', 'start', '--workspace', '@levay/api'],
      env: {
        PORT: String(apiPort),
        ALLOWED_ORIGIN: `http://localhost:${webPort}`
      }
    },
    {
      name: 'web',
      command: 'npm',
      args: ['run', 'start', '--workspace', '@levay/web'],
      env: {
        PORT: String(webPort),
        API_BASE_URL: apiBaseUrl
      }
    },
    {
      name: 'workers',
      command: 'npm',
      args: ['run', 'start', '--workspace', '@levay/workers'],
      env: {
        PORT: String(workersPort),
        WORKERS_PORT: String(workersPort),
        LEVAY_API_BASE_URL: apiBaseUrl
      }
    }
  ];

  for (const service of services) {
    const child = spawn(service.command, service.args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...service.env
    }
    });

    child.on('exit', (code) => {
      if (!shuttingDown && code !== 0) {
        console.error(`[stack] ${service.name} exited with code ${code}`);
        stopAll(code || 1);
        return;
      }

      if (!shuttingDown) {
        console.error(`[stack] ${service.name} stopped unexpectedly`);
        stopAll(1);
      }
    });

    children.push(child);
  }

  console.log(`[stack] api at ${apiBaseUrl}`);
  console.log(`[stack] web at http://localhost:${webPort}`);
  console.log(`[stack] workers at http://localhost:${workersPort}`);
  console.log('[stack] press Ctrl+C to stop');
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

main().catch((error) => {
  console.error(`[stack] failed to start: ${error instanceof Error ? error.message : String(error)}`);
  stopAll(1);
});
