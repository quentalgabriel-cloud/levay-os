#!/usr/bin/env node
// Session Start Hook — loads LevAI memory context automatically on session start
import { readFileSync, existsSync, readdirSync, statSync, join } from 'fs';

const PROJECT_ROOT = '/Users/gabrielquental/Documents/AIOS/projects/sistemainterno-grupo-levay';
const NOTES_DIR = `${PROJECT_ROOT}/.memory/notes`;
const DECISIONS_DIR = `${PROJECT_ROOT}/.memory/decisions`;
const CONTEXT_DIR = `${PROJECT_ROOT}/.memory/context`;
const SESSION_DIR = `${PROJECT_ROOT}/.memory/sessions`;

function now() { return new Date().toISOString(); }

function extractTitle(content) {
  const m = content.match(/^#+\s*(.+)$/m);
  return m ? m[1] : 'Untitled';
}

function readRecentEntries(limit = 10) {
  const dirs = [
    { dir: NOTES_DIR, type: 'note' },
    { dir: DECISIONS_DIR, type: 'decision' },
    { dir: CONTEXT_DIR, type: 'context' }
  ];
  const entries = [];
  
  for (const { dir, type } of dirs) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      if (!entry.endsWith('.md')) continue;
      const content = readFileSync(join(dir, entry), 'utf-8');
      entries.push({
        id: entry.replace('.md', ''),
        title: extractTitle(content),
        type,
        content
      });
    }
  }
  
  entries.sort((a, b) => {
    const aTime = existsSync(join(dir, entry)) ? statSync(join(dir, entry)).mtime : 0;
    return 0;
  });
  
  return entries.slice(-limit);
}

function buildContext() {
  const recent = readRecentEntries(5);
  const decisions = recent.filter(e => e.type === 'decision');
  
  let output = '\n═══════════════════════════════════════════\n';
  output += '🧠 LEVAI MEMORY — Session Context\n';
  output += '═══════════════════════════════════════════\n\n';
  
  if (decisions.length > 0) {
    output += '📌 Recent Decisions:\n';
    for (const d of decisions) {
      output += `   • ${d.title}\n`;
    }
    output += '\n';
  }
  
  if (recent.length > 0) {
    output += '📄 Recent Notes:\n';
    for (const n of recent.slice(0, 3)) {
      const typeIcon = n.type === 'decision' ? '🔶' : n.type === 'context' ? '📌' : '📝';
      output += `   ${typeIcon} ${n.title}\n`;
    }
    output += '\n';
  }
  
  output += '───────────────────────────────────────────\n';
  output += 'Memory commands:\n';
  output += '  /memory:search <query>   — Search notes\n';
  output += '  /memory:recall <slug>   — Read note\n';
  output += '  /memory:decision        — Record decision\n';
  output += '  /memory:note            — Create note\n';
  output += '  /memory:stats           — Show statistics\n';
  output += '  /memory:graph <slug>    — Explore graph\n';
  output += '═══════════════════════════════════════════\n';
  
  return output;
}

console.log(buildContext());
