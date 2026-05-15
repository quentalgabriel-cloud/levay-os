#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = '/Users/gabrielquental/Documents/AIOS/projects/sistemainterno-grupo-levay';
const NOTES_DIR = `${PROJECT_ROOT}/.memory/notes`;
const DECISIONS_DIR = `${PROJECT_ROOT}/.memory/decisions`;
const CONTEXT_DIR = `${PROJECT_ROOT}/.memory/context`;
const SESSION_FILE = `${PROJECT_ROOT}/.memory/sessions/current.json`;

function now() {
  return new Date().toISOString();
}

function loadSession() {
  if (!existsSync(SESSION_FILE)) return { entries: [], decisions: [], context: [] };
  return JSON.parse(readFileSync(SESSION_FILE, 'utf-8'));
}

function saveSession(session) {
  session.lastSaved = now();
  writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
}

function addEntry(type, content, tags = []) {
  const session = loadSession();
  const slug = content.split('\n')[0].replace(/^#+\s*/, '').substring(0, 60)
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  const entry = {
    id: `${Date.now()}`,
    type,
    content,
    tags,
    createdAt: now()
  };
  
  session.entries.push(entry);
  
  if (type === 'decision') {
    const dir = DECISIONS_DIR;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const path = `${dir}/${slug}-${Date.now()}.md`;
    writeFileSync(path, `---
title: ${content.split('\n')[0].replace(/^#+\s*/, '')}
type: decision
created: ${now().split('T')[0]}
tags: ${JSON.stringify(tags)}
---

${content}

---
*Decision logged: ${now()}*
`);
    console.log(`✅ Decision saved: ${path}`);
  } else if (type === 'context') {
    const dir = CONTEXT_DIR;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const path = `${dir}/${slug}.md`;
    writeFileSync(path, `---
title: ${content.split('\n')[0].replace(/^#+\s*/, '')}
type: context
created: ${now().split('T')[0]}
tags: ${JSON.stringify(tags)}
---

${content}
`);
    console.log(`✅ Context saved: ${path}`);
  }
  
  saveSession(session);
  return entry;
}

function showCurrentSession() {
  const session = loadSession();
  if (session.entries.length === 0) {
    console.log('\n📭 No entries in current session\n');
    return;
  }
  
  console.log('\n📋 Current Session\n' + '═'.repeat(50));
  for (const entry of session.entries) {
    console.log(`\n[${entry.type}] ${entry.createdAt}`);
    console.log(entry.content.split('\n')[0]);
    if (entry.tags.length > 0) console.log(`Tags: ${entry.tags.join(', ')}`);
  }
}

function exportSession() {
  const session = loadSession();
  const exportPath = `${PROJECT_ROOT}/.memory/sessions/session-${Date.now()}.json`;
  writeFileSync(exportPath, JSON.stringify(session, null, 2));
  console.log(`✅ Session exported: ${exportPath}`);
}

function addDecision(decision, reason, tags = []) {
  const content = `# Decision\n\n**What:** ${decision}\n\n**Why:** ${reason}`;
  return addEntry('decision', content, tags);
}

function addContext(title, content, tags = []) {
  return addEntry('context', `# ${title}\n\n${content}`, tags);
}

function linkEntries(fromId, toId, linkType = 'related') {
  const session = loadSession();
  session.entries.push({
    id: `link-${Date.now()}`,
    type: 'link',
    from: fromId,
    to: toId,
    linkType,
    createdAt: now()
  });
  saveSession(session);
  console.log(`🔗 Linked: ${fromId} → ${toId}`);
}

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'decision':
    if (args.length < 2) {
      console.log('Usage: node memory-session.mjs decision "<what>" "<why>" [tags...]');
    } else {
      addDecision(args[0], args[1], args.slice(2));
    }
    break;
  case 'context':
    if (args.length < 2) {
      console.log('Usage: node memory-session.mjs context "<title>" "<content>" [tags...]');
    } else {
      addContext(args[0], args[1], args.slice(2));
    }
    break;
  case 'session':
    showCurrentSession();
    break;
  case 'export':
    exportSession();
    break;
  case 'link':
    linkEntries(args[0], args[1], args[2] || 'related');
    break;
  default:
    console.log(`
📋 LevAI Memory Session Manager

Usage:
  node memory-session.mjs decision "<what>" "<why>" [tags...]
  node memory-session.mjs context "<title>" "<content>" [tags...]
  node memory-session.mjs session        Show current session
  node memory-session.mjs export        Export session
  node memory-session.mjs link <from> <to> [type]
`);
}

export { addDecision, addContext, showCurrentSession, exportSession };
