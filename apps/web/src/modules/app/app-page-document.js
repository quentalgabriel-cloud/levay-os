import { APP_SCREEN_CSS } from './app-screen-template.js';
import { COCKPIT_CSS } from './cockpit-template.js';

const BASE_CSS = `
:root {
  --semantic-color-background-canvas: #121314;
  --semantic-color-background-surface: #1b1d1f;
  --semantic-color-background-elevated: #23262a;
  --semantic-color-text-primary: #f4f3f0;
  --semantic-color-text-secondary: #c1c0ba;
  --semantic-color-border-default: #3a3e44;
  --semantic-color-kpi-highlight: #d3b577;
  --core-color-success-500: #4e9e72;
  --core-color-warning-500: #d6b15a;
  --core-color-error-500: #c26152;
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700&display=swap');

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
body { background: var(--semantic-color-background-canvas); color: var(--semantic-color-text-primary); }
`.trim();

export function renderAppPageDocument({
  tenantId = 'sollu',
  apiBaseUrl = 'http://localhost:3000',
  role = 'operations'
} = {}) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Levay OS · ${role === 'ceo' ? 'Mesa do Diretor' : 'Centro de Operações'}</title>
    <style>
${BASE_CSS}
${APP_SCREEN_CSS}
${COCKPIT_CSS}
    </style>
  </head>
  <body>
    <div id="app-root"></div>
    <script>
      window.__LEVAY_APP_CONFIG__ = ${JSON.stringify({ tenantId, apiBaseUrl, role })};
    </script>
    <script type="module" src="/src/runtime/app-page.js"></script>
  </body>
</html>`;
}
