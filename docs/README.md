# 📁 Documentação — LEVAY OS

> Documentação técnica e de processo do Sistema Interno Grupo Levay.

---

## 📋 Planos & Auditorias

| Arquivo | Descrição |
|---------|-----------|
| `PLANO-MELHORIAS-V1.1.md` | Plano de melhorias completo derivado da auditoria Notion (12/mai/2026) + sessão Erick+Thaynan (11/mai/2026). **Contém 6 prioridades, 9 migrations, e 5 contradições pendentes de validação.** |
| `SESSAO-CONTEXTO-E-APRENDIZADOS.md` | Registro do aprendizado, nuances e insights da sessão de análise. Inclui visão geral do LEVAY OS, regras de negócio, convenções de design, sistemas externos, lições aprendidas e estado atual do código. |

---

## ⚡ Links Rápidos

### Código
- **Schema Prisma:** `/prisma/schema.prisma`
- **Frontend Next.js:** `/apps/levay-os/`
- **API:** `/apps/api/`
- **Workers:** `/apps/workers/`

### Configuração
- **AGENTS.md (Frontend):** `/apps/levay-os/AGENTS.md`
- **Stack obrigatória:** Next.js 16 + React 19 + Tailwind v4 + Supabase SSR + Prisma

---

## 🎯 Próximos Passos (para retomar)

1. **Revisar** `PLANO-MELHORIAS-V1.1.md`
2. **Validar** as 5 contradições pendentes (seção "Contradições a validar" no plano)
3. **Executar** primeira migration (schema completo - Prioridade 1)
4. **Implementar** workflows de capture/triage (Prioridade 2)

---

## 📞 Referência de Contexto

Este projeto segue o **LEVAY OS** - sistema interno documentado no Notion. O plano de melhorias traduz os requisitos do Notion em implementação de código.

Para dúvidas sobre vocabulário operacional, regras de negócio, ou processos, consultar o plano de melhorias para mapeamento entre documento Notion → código.