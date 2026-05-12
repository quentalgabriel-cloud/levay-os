import { spawn } from 'node:child_process';

const START_TIMEOUT_MS = 20000;
const POLL_INTERVAL_MS = 250;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`${url} -> ${response.status} ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return { response, data };
}

async function waitFor(url, validate, timeoutMs = START_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const result = await validate(url);
      return result;
    } catch (error) {
      lastError = error;
      await delay(POLL_INTERVAL_MS);
    }
  }

  throw lastError || new Error(`Timed out waiting for ${url}`);
}

async function main() {
  const child = spawn('npm', ['start'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env
  });

  let apiBaseUrl = null;
  let webBaseUrl = null;
  let workersBaseUrl = null;

  const onOutput = (chunk) => {
    const text = chunk.toString();
    process.stdout.write(text);

    const apiMatch = text.match(/\[stack\] api at (http:\/\/localhost:\d+)/);
    const webMatch = text.match(/\[stack\] web at (http:\/\/localhost:\d+)/);
    const workersMatch = text.match(/\[stack\] workers at (http:\/\/localhost:\d+)/);

    if (apiMatch) apiBaseUrl = apiMatch[1];
    if (webMatch) webBaseUrl = webMatch[1];
    if (workersMatch) workersBaseUrl = workersMatch[1];
  };

  child.stdout.on('data', onOutput);
  child.stderr.on('data', onOutput);

  try {
    await waitFor('stack-urls', async () => {
      if (!apiBaseUrl || !webBaseUrl || !workersBaseUrl) {
        throw new Error('waiting for stack urls');
      }
      return true;
    });

    await waitFor(`${webBaseUrl}/health`, async (url) => {
      const { data } = await fetchJson(url);
      if (!data?.ok) throw new Error('web health not ok');
      return data;
    });

    await waitFor(`${workersBaseUrl}/health`, async (url) => {
      const { data } = await fetchJson(url);
      if (!data?.ok) throw new Error('workers health not ok');
      return data;
    });

    await waitFor(`${apiBaseUrl}/api/v1/operations/events/summary?tenantId=sollu`, async (url) => {
      try {
        await fetchJson(`${apiBaseUrl}/api/v1/demo/bootstrap?tenantId=sollu`, {
          method: 'POST'
        });
        return true;
      } catch (error) {
        throw new Error(`API bootstrap failed: ${error.message}`);
      }
    });

    const operationsSummary = await waitFor(
      `${apiBaseUrl}/api/v1/operations/events/summary?tenantId=sollu`,
      async (url) => {
        const result = await fetchJson(url, {
          headers: {
            Origin: webBaseUrl
          }
        });
        if ((result.data?.total || 0) < 1) {
          throw new Error('operations summary still empty');
        }
        return result;
      }
    );

    const analytics = await fetchJson(`${apiBaseUrl}/api/v1/analytics/executive`, {
      headers: {
        'x-tenant-id': 'hq',
        'x-role': 'ceo'
      }
    });

    if ((analytics.data?.tenants || []).length < 1) {
      throw new Error('analytics executive returned no tenants after bootstrap');
    }

    const workersHealth = await fetchJson(`${workersBaseUrl}/health`);

    console.log('[smoke] ok');
    console.log(`[smoke] api ${apiBaseUrl}`);
    console.log(`[smoke] web ${webBaseUrl}`);
    console.log(`[smoke] workers ${workersBaseUrl}`);
    console.log(`[smoke] operations total ${operationsSummary.data.total}`);
    console.log(`[smoke] analytics tenants ${analytics.data.tenants.length}`);
    console.log(`[smoke] workers lastRunAt ${workersHealth.data.lastRunAt}`);
  } finally {
    child.kill('SIGINT');
    await new Promise((resolve) => child.once('exit', resolve));
  }
}

main().catch((error) => {
  console.error(`[smoke] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
