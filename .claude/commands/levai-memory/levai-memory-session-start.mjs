#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = '/Users/gabrielquental/Documents/AIOS/projects/sistemainterno-grupo-levay';
const NOTES_DIR = `${PROJECT_ROOT}/.memory/notes`;
const DECISIONS_DIR = `${PROJECT_ROOT}/.memory/decisions`;
const CONTEXT_DIR = `${PROJECT_ROOT}/.memory/context`;
const OPERATIONS_DIR = `${PROJECT_ROOT}/.memory/operations`;
const BOTTLENECKS_DIR = `${PROJECT_ROOT}/.memory/bottlenecks`;
const OPPORTUNITIES_DIR = `${PROJECT_ROOT}/.memory/opportunities`;
const SESSION_DIR = `${PROJECT_ROOT}/.memory/sessions`;

function extractTitle(content) {
  const m = content.match(/^#\s+(.+)$/m);
  return m ? m[1] : 'Untitled';
}

function readAllFromDir(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith('.md')) continue;
    try {
      const content = readFileSync(join(dir, entry), 'utf-8');
      const stat = statSync(join(dir, entry));
      results.push({ id: entry.replace('.md', ''), title: extractTitle(content), content, mtime: stat.mtime });
    } catch {}
  }
  return results;
}

function getCurrentSession() {
  if (!existsSync(SESSION_DIR)) return null;
  const current = `${SESSION_DIR}/current.json`;
  if (!existsSync(current)) return null;
  try {
    return JSON.parse(readFileSync(current, 'utf-8'));
  } catch { return null; }
}

function buildStartupContext() {
  const notes = readAllFromDir(NOTES_DIR);
  const decisions = readAllFromDir(DECISIONS_DIR);
  const context = readAllFromDir(CONTEXT_DIR);
  const operations = readAllFromDir(OPERATIONS_DIR);
  const bottlenecks = readAllFromDir(BOTTLENECKS_DIR);
  const opportunities = readAllFromDir(OPPORTUNITIES_DIR);
  
  decisions.sort((a, b) => b.mtime - a.mtime);
  
  let out = '\n';
  out += '═══════════════════════════════════════════\n';
  out += '🧠 LEVAI MEMORY — Session Context\n';
  out += '═══════════════════════════════════════════\n\n';
  
  // ⚠️ IMPORTANTE para qualquer AI Agent
  out += '⚠️  IMPORTANTE: Leia .memory/schema.md para entender\n';
  out += '   como operar esta memória (válido para qualquer agent).\n\n';
  
  if (decisions.length > 0) {
    out += '📌 Recent Decisions:\n';
    for (const d of decisions.slice(0, 5)) {
      out += `   • ${d.title}\n`;
    }
    out += '\n';
  }
  
  const totalNotes = notes.length + decisions.length + context.length + operations.length + bottlenecks.length + opportunities.length;
  out += `📊 Total entries: ${totalNotes}\n`;
  out += `   • ${decisions.length} decisions\n`;
  out += `   • ${context.length} context\n`;
  out += `   • ${operations.length} operations\n`;
  out += `   • ${bottlenecks.length} bottlenecks\n`;
  out += `   • ${opportunities.length} opportunities\n\n`;
  
  if (operations.length > 0) {
    out += '🏢 Operations:\n';
    for (const o of operations) {
      out += `   📍 ${o.title}\n`;
    }
    out += '\n';
  }
  
  if (bottlenecks.length > 0) {
    out += '⚠️  Bottlenecks:\n';
    for (const b of bottlenecks) {
      out += `   🔴 ${b.title}\n`;
    }
    out += '\n';
  }
  
  if (notes.length > 0) {
    out += '📄 Recent Notes:\n';
    for (const n of notes.slice(-3)) {
      out += `   📝 ${n.title}\n`;
    }
    out += '\n';
  }
  
  out += '───────────────────────────────────────────\n';
  out += 'Memory Commands (Technical):\n';
  out += '  /memory:search <query>  — Search notes\n';
  out += '  /memory:recall <slug>  — Read note\n';
  out += '  /memory:decision       — Record decision\n';
  out += '  /memory:note           — Create note\n';
  out += '  /memory:stats          — Show statistics\n';
  out += '  /memory:graph <slug>   — Explore graph\n';
  out += '\n';
  out += 'Memory Commands (Business):\n';
  out += '  /memory operations     — Map current operations\n';
  out += '  /memory bottlenecks    — Identify bottlenecks\n';
  out += '  /memory opportunities  — Find opportunities\n';
  out += '  /memory analyze [topic] — Deep analysis\n';
  out += '═══════════════════════════════════════════\n';
  
  return out;
}

process.stdout.write(buildStartupContext());
