import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const mode = process.argv[2];

if (!mode || !['lint', 'typecheck', 'build'].includes(mode)) {
  console.error('Usage: node scripts/run-gate-checks.mjs <lint|typecheck|build>');
  process.exit(1);
}

function walkFiles(dir, predicate, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === '.aiox' || entry === '.aiox-core') continue;
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walkFiles(fullPath, predicate, acc);
      continue;
    }
    if (predicate(fullPath)) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function runNodeCheck(filePath) {
  const result = spawnSync(process.execPath, ['--check', filePath], {
    cwd: rootDir,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Syntax check failed for ${filePath}`);
  }
}

async function runLint() {
  const jsFiles = walkFiles(rootDir, (filePath) => filePath.endsWith('.js') || filePath.endsWith('.mjs'));

  for (const filePath of jsFiles) {
    runNodeCheck(filePath);
  }

  console.log(`lint ok (${jsFiles.length} files checked)`);
}

async function runTypecheck() {
  const modules = [
    'apps/api/src/app.js',
    'apps/web/src/modules/operations/operations-page-document.js',
    'apps/web/src/modules/app/app-page-document.js',
    'apps/workers/src/jobs/followup.scheduler.js',
    'apps/workers/src/jobs/followup.dispatcher.js',
    'packages/integrations/src/whatsapp/client.js',
    'packages/integrations/src/google-drive/client.js',
    'packages/integrations/src/payments/payment.adapter.js'
  ];

  for (const modulePath of modules) {
    await import(pathToFileURL(join(rootDir, modulePath)).href);
  }

  console.log(`typecheck ok (${modules.length} modules loaded)`);
}

async function runBuild() {
  const { buildApp } = await import(pathToFileURL(join(rootDir, 'apps/api/src/app.js')).href);
  const { renderOperationsPageDocument } = await import(
    pathToFileURL(join(rootDir, 'apps/web/src/modules/operations/operations-page-document.js')).href
  );
  const { renderAppPageDocument } = await import(
    pathToFileURL(join(rootDir, 'apps/web/src/modules/app/app-page-document.js')).href
  );
  const { scheduleFollowups } = await import(
    pathToFileURL(join(rootDir, 'apps/workers/src/jobs/followup.scheduler.js')).href
  );

  const app = buildApp();
  await app.ready();

  const operationsHtml = renderOperationsPageDocument({
    tenantId: 'sollu',
    apiBaseUrl: 'http://localhost:3000'
  });
  const appHtml = renderAppPageDocument({
    tenantId: 'sollu',
    apiBaseUrl: 'http://localhost:3000',
    role: 'operations'
  });
  const followups = scheduleFollowups({
    tenantId: 'sollu',
    leadId: 'lead-build-check',
    phone: '+5581999999999'
  });

  if (!operationsHtml.includes('<html') || !appHtml.includes('<html')) {
    throw new Error('Document rendering check failed');
  }

  if (followups.length !== 3) {
    throw new Error('Follow-up scheduling build check failed');
  }

  await app.close();

  console.log('build ok (api ready, web rendered, workers scheduled)');
}

const tasks = {
  lint: runLint,
  typecheck: runTypecheck,
  build: runBuild
};

tasks[mode]().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`${mode} failed: ${message}`);
  process.exit(1);
});
