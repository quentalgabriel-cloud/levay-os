import { describe, it, expect } from 'vitest';
import { renderOperationsPageDocument } from '../src/modules/operations/operations-page-document.js';

describe('operations page document', () => {
  it('renders full html document with runtime bootstrap config', () => {
    const html = renderOperationsPageDocument({
      tenantId: 'sollu',
      apiBaseUrl: 'http://localhost:3000'
    });

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('id="app-root"');
    expect(html).toContain('window.__LEVAY_OPS_CONFIG__');
    expect(html).toContain('"tenantId":"sollu"');
    expect(html).toContain('/src/runtime/operations-page.js');
  });
});
