# XOIA Quality — Check Before Ship

## Mandatory Check

Antes de todo push, execute:

```bash
npm run lint        # Code style
npm test            # Unit/integration tests
npm run typecheck   # TypeScript validation
```

Os três devem passar. Se algum falhar, corrija antes de prosseguir.

## Code Standards

- Siga padrões existentes no codebase
- TypeScript/JavaScript best practices
- Absolute imports com `@/` alias quando configurado
- Testes para toda funcionalidade nova
- Código semântico e limpo — legível por não-devs quando possível

## CRO Quality (Landing Pages — Automatico no CHECK)

Para landing pages, o CHECK aplica automaticamente:

- **Attention Ratio 1:1** — uma página, um objetivo, um CTA
- **Message Match** — headline da página = mensagem do anúncio
- **Core Web Vitals** — LCP < 2.5s, CLS < 0.1, INP < 200ms
- **MECLABS Heuristic** — C = 4m + 3v + 2(i-f) - 2a

## CodeRabbit (Opcional)

Se configurado, CodeRabbit pode ser usado para review automatizado:
```bash
wsl bash -c 'cd ${PROJECT_ROOT} && ~/.local/bin/coderabbit --prompt-only -t uncommitted'
```
