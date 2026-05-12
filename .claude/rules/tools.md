# XOIA Tools — Selection Priority

## Rule: Native Tools First

ALWAYS prefer native Claude Code tools over MCP servers:

| Task | Use This | NOT This |
|------|----------|----------|
| Read files | `Read` tool | docker-gateway |
| Write files | `Write` / `Edit` tools | docker-gateway |
| Run commands | `Bash` tool | docker-gateway |
| Search files | `Glob` tool | docker-gateway |
| Search content | `Grep` tool | docker-gateway |

## MCP Servers — When to Use

### Direct (global ~/.claude.json)
| MCP | When |
|-----|------|
| **playwright** | Browser automation, screenshots, web testing |
| **desktop-commander** | Docker container operations |

### Inside Docker (via docker-gateway)
| MCP | When |
|-----|------|
| **EXA** | Web search, research, competitor analysis |
| **Context7** | Library documentation lookup |
| **Apify** | Web scraping, social media data extraction |

## Tool Examples

### Context7 — Library Docs
- `resolve-library-id("react")` then `get-library-docs` with topic

### Git — Version Control
- `git diff --stat` — summary of changes
- `git log --oneline -10` — recent commits

### Supabase — Database
- `supabase db push` — apply migrations
- `supabase migration list` — check status

### GitHub CLI
- `gh pr create --title 'feat: ...' --body '## Summary...'`
- `gh issue list --state open`

## Response Filtering

When processing MCP tool responses, apply filters to reduce token consumption:
- **content** — extract main info, discard noise (navigation, ads, boilerplate)
- **schema** — select only relevant fields from JSON responses
- **field** — project specific columns from tabular data

Filter configs defined in `.xoia-core/data/tool-registry.yaml`.

## Known Issues

### Docker MCP Secrets Bug
Docker MCP secrets/template interpolation broken. Workaround: edit `~/.docker/mcp/catalogs/docker-mcp.yaml` with hardcoded env values.
