import { escapeHtml } from './app-screen-template.js';

export function renderCockpitScreenHtml(model) {
  const lastUpdatedAt = model.lastUpdatedAt || 'agora';
  const tenantLabel = model.tenantId === 'sollu' ? 'Sollu' : model.tenantId === 'bica' ? 'Bica Bar' : 'AMP 213';

  return `
    <section class="levay-app-shell cockpit-shell" data-tenant="${escapeHtml(model.tenantId)}">
      <main class="levay-app-main">
        <header class="levay-app-topbar cockpit-topbar">
          <div class="topbar-left">
            <p class="eyebrow">Levay OS · Mesa do Diretor</p>
            <h1>Bom dia, Erick.</h1>
            <div class="topbar-meta">
              <span class="topbar-chip">Atualizado ${escapeHtml(lastUpdatedAt)}</span>
              <span class="topbar-chip tone-accent">${escapeHtml(tenantLabel)}</span>
            </div>
          </div>
          <div class="topbar-right">
            <button type="button" class="action-secondary" data-action="refresh-cockpit">Sincronizar</button>
            <button type="button" class="action-primary" data-action="open-settings">Configurações</button>
          </div>
        </header>

        <section class="cockpit-capture">
          <div class="capture-header">
            <span class="capture-icon">🧠</span>
            <h2>Despejo Bruto (Brain Dump)</h2>
          </div>
          <p class="capture-hint">Tire da cabeça, WhatsApp ou Lembretes. O Nonô organiza para você.</p>
          <div class="capture-input-wrapper">
            <textarea placeholder="Ex: Resolver contrato da Sollu com Jade amanhã. Jade precisa cobrar o feedback da Bica também..." data-capture-input></textarea>
            <button type="button" class="btn-process" data-action="process-capture">Processar com Nonô</button>
          </div>
        </section>

        <div class="cockpit-grid">
          <section class="cockpit-column tone-hoje" data-status-cockpit="HOJE">
            <header class="column-header">
              <span class="column-icon">🔥</span>
              <h3>Hoje (Max 3)</h3>
              <span class="column-count" data-count-hoje>0</span>
            </header>
            <div class="column-hint">Movimentos reais para agora.</div>
            <ul class="cockpit-list" data-list-hoje>
              <!-- Itens injetados via JS -->
            </ul>
          </section>

          <section class="cockpit-column tone-decidir" data-status-cockpit="DECIDIR">
            <header class="column-header">
              <span class="column-icon">⚖️</span>
              <h3>Decidir</h3>
              <span class="column-count" data-count-decidir>0</span>
            </header>
            <div class="column-hint">O que só você bate o martelo.</div>
            <ul class="cockpit-list" data-list-decidir>
              <!-- Itens injetados via JS -->
            </ul>
          </section>

          <section class="cockpit-column tone-delegar" data-status-cockpit="DELEGAR">
            <header class="column-header">
              <span class="column-icon">👥</span>
              <h3>Delegar</h3>
              <span class="column-count" data-count-delegar>0</span>
            </header>
            <div class="column-hint">Com Jade, Thaynan ou Time.</div>
            <ul class="cockpit-list" data-list-delegar>
              <!-- Itens injetados via JS -->
            </ul>
          </section>

          <section class="cockpit-column tone-alertas">
            <header class="column-header">
              <span class="column-icon">⚠️</span>
              <h3>Alertas</h3>
              <span class="column-count" data-count-alertas>0</span>
            </header>
            <div class="column-hint">O que vira problema se não olhar.</div>
            <ul class="cockpit-list" data-list-alertas>
              <!-- Itens injetados via JS -->
            </ul>
          </section>
        </div>
      </main>
    </section>
  `.trim();
}

export const COCKPIT_CSS = `
.cockpit-shell {
  background: var(--semantic-color-background-canvas);
}

.cockpit-topbar h1 {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.cockpit-capture {
  background: var(--semantic-color-background-surface);
  border: 1px solid var(--semantic-color-border-default);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.capture-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.capture-icon {
  font-size: 1.5rem;
}

.cockpit-capture h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--semantic-color-text-primary);
}

.capture-hint {
  color: var(--semantic-color-text-secondary);
  font-size: 0.9rem;
  margin: 0 0 16px;
}

.capture-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cockpit-capture textarea {
  width: 100%;
  min-height: 100px;
  background: var(--semantic-color-background-canvas);
  border: 1px solid var(--semantic-color-border-default);
  border-radius: 12px;
  color: var(--semantic-color-text-primary);
  padding: 16px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.2s;
}

.cockpit-capture textarea:focus {
  outline: none;
  border-color: var(--semantic-color-kpi-highlight);
}

.btn-process {
  align-self: flex-end;
  background: var(--semantic-color-kpi-highlight);
  color: #000;
  border: none;
  border-radius: 999px;
  padding: 10px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s;
}

.btn-process:active {
  transform: scale(0.98);
}

.cockpit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.cockpit-column {
  background: var(--semantic-color-background-surface);
  border: 1px solid var(--semantic-color-border-default);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.column-icon {
  font-size: 1.2rem;
}

.cockpit-column h3 {
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
}

.column-count {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--semantic-color-border-default);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 0.8rem;
  color: var(--semantic-color-text-secondary);
}

.column-hint {
  font-size: 0.8rem;
  color: var(--semantic-color-text-secondary);
  opacity: 0.7;
}

.cockpit-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cockpit-item {
  background: var(--semantic-color-background-elevated);
  border: 1px solid var(--semantic-color-border-default);
  border-radius: 12px;
  padding: 14px;
  transition: transform 0.2s, border-color 0.2s;
}

.cockpit-item:hover {
  border-color: rgba(255,255,255,0.1);
  transform: translateY(-2px);
}

.item-title {
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0 0 6px;
}

.item-movimento {
  font-size: 0.8rem;
  color: var(--semantic-color-kpi-highlight);
  background: rgba(211, 181, 119, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 8px;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--semantic-color-text-secondary);
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.item-actions button {
  background: transparent;
  border: 1px solid var(--semantic-color-border-default);
  border-radius: 6px;
  color: var(--semantic-color-text-secondary);
  font-size: 0.75rem;
  padding: 4px 10px;
  cursor: pointer;
}

.item-actions button:hover {
  background: rgba(255,255,255,0.05);
  color: var(--semantic-color-text-primary);
}

.tone-hoje { border-top: 4px solid var(--core-color-error-500); }
.tone-decidir { border-top: 4px solid var(--core-color-warning-500); }
.tone-delegar { border-top: 4px solid var(--core-color-success-500); }
.tone-alertas { border-top: 4px solid var(--semantic-color-kpi-highlight); }
`;
