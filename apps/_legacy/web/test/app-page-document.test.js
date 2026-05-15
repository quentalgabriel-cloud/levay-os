import { describe, it, expect } from 'vitest';
import { renderAppPageDocument } from '../src/modules/app/app-page-document.js';

describe('app page document', () => {
  it('renders app html shell and runtime config', () => {
    const html = renderAppPageDocument({
      tenantId: 'sollu',
      apiBaseUrl: 'http://localhost:3000',
      role: 'commercial'
    });

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('window.__LEVAY_APP_CONFIG__');
    expect(html).toContain('"tenantId":"sollu"');
    expect(html).toContain('"role":"commercial"');
    expect(html).toContain('/src/runtime/app-page.js');
  });
});
