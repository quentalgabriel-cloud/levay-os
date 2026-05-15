---
name: everything-claude-code
description: "Comprehensive collection of AI agent skills, agents, commands, and workflows for enhanced Claude Code capabilities. Includes 58 specialized agents, 220 skills, 74 commands, automated hook workflows, and performance optimization systems."
metadata:
  author: affaan-m
  version: "2.0.0-rc.1"
---

# Everything Claude Code Skill

This skill integrates the Everything Claude Code (ECC) system into your project, providing:

## Core Components

- **58 Specialized Agents** - Domain experts for planning, architecture, testing, review, security, and more
- **220 Workflow Skills** - Reusable workflow definitions covering TDD, security, documentation, DevOps, ML, and language-specific patterns
- **74 Commands** - Slash-command interface for quick agent and skill invocation
- **Automated Hook System** - Trigger-based automations for session management, quality gates, and continuous learning
- **Performance Optimization** - Token optimization, memory persistence, and context management systems
- **Multi-Harness Support** - Works across Claude Code, Cursor, Codex, OpenCode, Gemini, and other AI agent harnesses

## Key Capabilities

### Agent-First Development
Delegate complex tasks to specialized agents:
- `@planner` - Feature implementation planning
- `@architect` - System design and scalability decisions  
- `@tdd-guide` - Test-driven development enforcement
- `@code-reviewer` - Code quality and maintainability review
- `@security-reviewer` - Vulnerability detection and security auditing
- `@database-reviewer` - PostgreSQL/Supabase specialist
- `@build-error-resolver` - Automatic build/type error resolution
- `@e2e-runner` - End-to-end Playwright testing
- `@refactor-cleaner` - Dead code cleanup
- `@doc-updater` - Documentation synchronization

### Skills-Based Workflow
Primary workflow surface through skills:
- `tdd-workflow` - Test-driven development methodology
- `security-review` - Comprehensive security checklist
- `continuous-learning-v2` - Instinct-based learning system
- `e2e-testing` - Playwright end-to-end testing patterns
- `docs-lookup` - Context7-powered documentation lookup
- `skill-create` - Generate skills from git history
- `evolve` - Cluster instincts into reusable skills
- `search-first` - Research-before-coding workflow

### Quality Gates
Automated quality validation:
- 80%+ test coverage requirement
- Security vulnerability scanning
- Build error resolution
- Type checking and linting
- Conventional commit enforcement

## Supabase Integration
When working with Supabase (as in this project), the everything-claude-code skill provides:
- Enhanced database design and optimization skills
- Specialized Supabase/database reviewer agents
- Security checklist automation for RLS and authentication
- Migration workflow assistance
- Edge Function development patterns

## Usage

Invoke skills directly:
```
/skill tdd-workflow "Create user authentication feature"
/skill security-review "Audit Supabase RLS policies"
/skill docs-lookup "Supabase Realtime subscription patterns"
```

Or delegate to agents:
```
@architect Design multi-tenant architecture for Levay OS
@tdd-guide Implement tenant isolation with tests first
@code-reviewer Review auth middleware implementation
@security-reviewer Audit JWT handling and session security
```

## Configuration

The skill automatically integrates with your existing `.xoia-core` development system. No additional configuration is required for basic usage.

For advanced configuration:
- Customize hook behavior via `ECC_HOOK_PROFILE` and `ECC_DISABLED_HOOKS` environment variables
- Configure MCP servers in `.mcp.json`
- Adjust package manager detection via `CLAUDE_PACKAGE_MANAGER`

## References

- Source: https://github.com/affaan-m/everything-claude-code
- Documentation: See the cloned repository in `.claude/skills/everything-claude-code/`
- Quick Reference: `COMMANDS-QUICK-REF.md` in the repository
- Agent Catalog: `agents/` directory in the repository
- Skill Catalog: `skills/` directory in the repository