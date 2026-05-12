import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderOperationsPageDocument } from './modules/operations/operations-page-document.js';
import { renderAppPageDocument } from './modules/app/app-page-document.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = normalize(join(__dirname, '..'));
const PORT = Number(process.env.PORT || 3200);
const DEFAULT_API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

function send(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': contentType });
  res.end(body);
}

function sanitizePath(pathname) {
  const cleaned = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  return cleaned.startsWith('/') ? cleaned.slice(1) : cleaned;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname === '/health') {
      return send(res, 200, JSON.stringify({ ok: true }), MIME_TYPES['.json']);
    }

    if (pathname === '/' || pathname === '/operations') {
      const tenantId = url.searchParams.get('tenantId') || 'sollu';
      const apiBaseUrl = url.searchParams.get('apiBaseUrl') || DEFAULT_API_BASE_URL;
      const html = renderOperationsPageDocument({ tenantId, apiBaseUrl });
      return send(res, 200, html, MIME_TYPES['.html']);
    }

    if (pathname === '/app') {
      const tenantId = url.searchParams.get('tenantId') || 'sollu';
      const apiBaseUrl = url.searchParams.get('apiBaseUrl') || DEFAULT_API_BASE_URL;
      const role = url.searchParams.get('role') || 'operations';
      const html = renderAppPageDocument({ tenantId, apiBaseUrl, role });
      return send(res, 200, html, MIME_TYPES['.html']);
    }

    if (pathname.startsWith('/src/')) {
      const relative = sanitizePath(pathname);
      const absolute = join(PROJECT_ROOT, relative);
      const content = await readFile(absolute);
      const mime = MIME_TYPES[extname(absolute)] || 'application/octet-stream';
      return send(res, 200, content, mime);
    }

    return send(res, 404, 'Not Found');
  } catch (error) {
    return send(res, 500, `Internal Error: ${String(error.message || error)}`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`@levay/web running at http://localhost:${PORT}`);
});
