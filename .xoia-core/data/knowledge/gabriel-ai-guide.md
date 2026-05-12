# Guia da IA — Gabriel (Mapeamento para Levay OS)

> Extraído em 2026-05-12. Fonte: Documentos pessoais do Gabriel (Plano de Gestão & Guia da IA).

## Identidade & Papel
**Gabriel** é o Arquiteto / Camada Tecnológica.
**Regra de Ouro:** Thaynan resolve o presente. Gabriel constrói o futuro. Erick decide o destino.

O comportamento esperado da IA (Nonô/XOIA) ao interagir com Gabriel:
- **Ativa, não passiva.** Não pergunte "o que quer fazer?". Proponha caminhos com *trade-offs*.
- **Comandos de aprovação:** Ao ouvir `go` ou `pode seguir`, execute o plano aprovado em blocos (chunks). Ao ouvir `next smart step`, tome a decisão arquitetural correta.
- **Mentalidade Sistêmica:** Tudo deve ter "Zoom in / Zoom out". Antes de criar algo novo, pergunte onde se encaixa. Conexão > Duplicação.
- **Auditoria:** Revisão sempre precede execução.

## Vocabulário & Padrões (Notion ➔ Levay OS)

| Termo Original (Notion) | Tradução no Levay OS (Código) |
| :--- | :--- |
| **Cockpit** | Dashboard Web (`app-page-document.js`). A interface unificada por Role (ex: CEO, Comercial). |
| **Vidraça** | Seções / Listas filtradas no Dashboard (ex: `pendingReceivables`, `urgentTasks`). Cada vidraça responde a uma dor específica. |
| **Movimento Mínimo** | Ação rápida disparada nos botões da UI (ex: `billing.collect`, `task.complete`). |
| **Modo Proteção** | Regra de negócio na UI que restringe a visão para apenas 1-4 itens essenciais quando a carga cognitiva está alta. |
| **Quick Actions** | Botões globais de ação em lote (`[data-action]`). |
| **📝 Log** | Precisamos implementar um sistema de *Changelog* ou *Versionamento* visível dentro do App Levay OS. |

## Anti-Padrões a Evitar no Código
- **Widgets inúteis:** Não adicionar gráficos ou contadores que não acionam uma decisão (ex: remover relógios, focar em `KPIs`).
- **Listar tudo:** Nunca renderizar listas sem filtros. Toda View (Vidraça) deve ter um propósito.
- **Duplicação:** Reutilizar componentes web e serviços (DRY).

## Próximos Passos de Integração (Roadmap Influenciado)
1. **Adoção do Vocabulário:** Renomear as "Seções" da UI para o conceito de "Vidraças" nas conversas e na documentação.
2. **Log de Versão no App:** Adicionar um componente visual no final do Dashboard (`app-overview-model.js`) que puxa o último release/log do sistema, espelhando o comportamento da tag `📝 Log`.
3. **Modo Proteção (Feature):** Criar um toggle no Dashboard que oculta tudo exceto as 4 tarefas vitais do dia.
