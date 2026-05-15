import {
  OperationsDashboardShell,
  OperationsStreamClient,
  OperationsSummaryClient
} from '../modules/operations/index.js';

const DEFAULT_CONFIG = {
  tenantId: 'sollu',
  apiBaseUrl: 'http://localhost:3000'
};

function getViewport() {
  if (window.innerWidth < 768) return 'mobile';
  if (window.innerWidth < 1024) return 'tablet';
  return 'desktop';
}

function renderInto(root, shell) {
  root.innerHTML = shell.renderScreenHtml({ viewport: getViewport(), role: 'operations' });
}

async function bootstrap() {
  const root = document.getElementById('app-root');
  if (!root) return;

  const config = {
    ...DEFAULT_CONFIG,
    ...(window.__LEVAY_OPS_CONFIG__ || {})
  };

  const shell = new OperationsDashboardShell({
    streamClient: new OperationsStreamClient({ baseUrl: config.apiBaseUrl }),
    summaryClient: new OperationsSummaryClient({ baseUrl: config.apiBaseUrl })
  });

  await shell.start({ tenantId: config.tenantId });
  renderInto(root, shell);

  const summaryInterval = window.setInterval(async () => {
    await shell.refreshSummary();
    renderInto(root, shell);
  }, 15000);

  const renderInterval = window.setInterval(() => {
    renderInto(root, shell);
  }, 1000);

  window.addEventListener('resize', () => renderInto(root, shell));
  window.addEventListener('beforeunload', () => {
    window.clearInterval(summaryInterval);
    window.clearInterval(renderInterval);
    shell.stop();
  });
}

bootstrap();
