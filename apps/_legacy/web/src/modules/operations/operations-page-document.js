import { OPERATIONS_SCREEN_CSS } from './operations-screen-template.js';

const TOKEN_FALLBACK_CSS = `
:root {
  --semantic-color-background-canvas: #141414;
  --semantic-color-background-surface: #1d1d1d;
  --semantic-color-background-elevated: #252525;
  --semantic-color-text-primary: #f4f3f0;
  --semantic-color-text-secondary: #cbcbc7;
  --semantic-color-text-muted: #9a9a93;
  --semantic-color-border-default: #3a3a37;
  --semantic-color-kpi-highlight: #d3b577;
  --core-color-success-500: #4e9e72;
  --core-color-warning-500: #d6b15a;
  --core-color-error-500: #c26152;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--semantic-color-background-canvas); }
`.trim();

export function renderOperationsPageDocument({
  tenantId = 'sollu',
  apiBaseUrl = 'http://localhost:3000'
} = {}) {
  const runtimeConfig = {
    tenantId,
    apiBaseUrl
  };

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Levay OS · Operations</title>
    <style>
${TOKEN_FALLBACK_CSS}
${OPERATIONS_SCREEN_CSS}
    </style>
  </head>
  <body>
    <div id="app-root"></div>
    <script>
      window.__LEVAY_OPS_CONFIG__ = ${JSON.stringify(runtimeConfig)};
    </script>
    <script type="module" src="/src/runtime/operations-page.js"></script>
  </body>
</html>`;
}
