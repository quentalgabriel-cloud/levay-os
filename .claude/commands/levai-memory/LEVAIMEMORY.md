# LevAI Memory — Comandos

## /memory:save
Save current session context to memory.

**Usage:**
```
/memory:save <summary> | <leftOff> | <nextSteps...> | <decisions...> | <blockers...>
```

**Example:**
```
/memory:save Added authentication flow | Still working on auth context | Complete token refresh | Implemented Supabase auth, decided against NextAuth due to custom JWT needs | Waiting for API keys
```

## /memory:search
Search across all memory entries.

**Usage:**
```
/memory:search <query>
```

**Example:**
```
/memory:search Supabase authentication decisions
/memory:search auth middleware tenant
```

## /memory:note
Create a new note in the knowledge base.

**Usage:**
```
/memory:note <title> | <content>
```

**Example:**
```
/memory:note Supabase Auth Setup | Auth via email/password using Supabase Auth. JWT stored in httpOnly cookie.
```

## /memory:decision
Record a significant decision with reasoning.

**Usage:**
```
/memory:decision <what> | <why>
```

**Example:**
```
/memory:decision Using Prisma with SQLite | Fast iteration, zero infra, easy migrate to Postgres later
```

## /memory:recall
Recall a specific note by slug.

**Usage:**
```
/memory:recall <slug>
```

**Example:**
```
/memory:recall supabase-auth-setup
```

## /memory:link
Create wiki-style link between two notes.

**Usage:**
```
/memory:link <from-slug> <to-slug> [type]
```

**Example:**
```
/memory:link supabase-auth-setup auth-middleware extends
```

## /memory:stats
Show memory system statistics.

**Usage:**
```
/memory:stats
```

## /memory:graph
Explore linked notes around a topic.

**Usage:**
```
/memory:graph <slug> [depth]
```

**Example:**
```
/memory:graph authentication 2
```

## /memory:context
Show recent decisions and context from this project.

**Usage:**
```
/memory:context
```

---

**Quick patterns:**
- `[[note-slug]]` in any note creates a link
- `#tag` in any note adds categorization
- Decisions auto-tagged with `decision`
- All entries searchable by content and linked terms
