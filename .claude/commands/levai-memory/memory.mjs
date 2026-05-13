#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { exit } from 'process';

const PROJECT_ROOT = '/Users/gabrielquental/Documents/AIOS/projects/sistemainterno-grupo-levay';
const NOTES_DIR = `${PROJECT_ROOT}/.memory/notes`;
const DECISIONS_DIR = `${PROJECT_ROOT}/.memory/decisions`;
const CONTEXT_DIR = `${PROJECT_ROOT}/.memory/context`;

function extractTitle(content) {
  const m = content.match(/^#+\s*(.+)$/m);
  return m ? m[1] : 'Untitled';
}

function extractTags(content) {
  const tags = [];
  const re = /#([a-zA-Z0-9_-]+)/g;
  let m;
  while ((m = re.exec(content)) !== null) tags.push(m[1]);
  return tags;
}

function extractLinks(content) {
  const links = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(content)) !== null) links.push(m[1]);
  return links;
}

function readAllFromDir(dir, type) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith('.md')) continue;
    try {
      const content = readFileSync(join(dir, entry), 'utf-8');
      results.push({
        id: entry.replace('.md', ''),
        title: extractTitle(content),
        type,
        tags: extractTags(content),
        links: extractLinks(content),
        content
      });
    } catch {}
  }
  return results;
}

function readAllNotes() {
  return [
    ...readAllFromDir(NOTES_DIR, 'note'),
    ...readAllFromDir(DECISIONS_DIR, 'decision'),
    ...readAllFromDir(CONTEXT_DIR, 'context')
  ];
}

function recall(slug) {
  const dirs = [NOTES_DIR, DECISIONS_DIR, CONTEXT_DIR];
  for (const dir of dirs) {
    const path = join(dir, `${slug}.md`);
    if (existsSync(path)) return { content: readFileSync(path, 'utf-8'), path };
  }
  return null;
}

function searchNotes(query) {
  const all = readAllNotes();
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  return all
    .map(n => {
      let score = 0;
      for (const term of terms) {
        if (n.title.toLowerCase().includes(term)) score += 5;
        if (n.id.toLowerCase().includes(term)) score += 3;
        if (n.content.toLowerCase().includes(term)) score += 1;
        for (const tag of n.tags) if (tag.toLowerCase().includes(term)) score += 4;
      }
      return { ...n, score };
    })
    .filter(n => n.score > 0)
    .sort((a, b) => b.score - a.score);
}

function getAllLinks() {
  const all = readAllNotes();
  const links = [];
  for (const n of all) {
    for (const l of n.links) {
      links.push({ from: n.id, to: l, type: 'wiki-link' });
    }
  }
  return links;
}

const command = process.argv[2];

if (!command) {
  console.log('\n📚 LEVAI Memory — Quick Reference\n');
  console.log('  /memory:note       Create note');
  console.log('  /memory:search     Search notes');
  console.log('  /memory:recall     Read note');
  console.log('  /memory:decision   Record decision');
  console.log('  /memory:stats      Show statistics');
  console.log('  /memory:graph      Explore graph');
  console.log('  /memory:save       Save session');
  console.log('  /memory:context    Show context\n');
  exit(0);
}

switch (command) {
  case 'stats': {
    const all = readAllNotes();
    const decisions = all.filter(n => n.type === 'decision');
    const allTags = new Set();
    all.forEach(n => n.tags.forEach(t => allTags.add(t)));
    const allLinks = getAllLinks();
    console.log(`\n📊 LevAI Memory Stats`);
    console.log(`   Total entries: ${all.length}`);
    console.log(`   Decisions: ${decisions.length}`);
    console.log(`   Tags: ${allTags.size}`);
    console.log(`   Wiki-links: ${allLinks.length}\n`);
    if (allTags.size > 0) console.log(`   Tags: ${Array.from(allTags).join(', ')}\n`);
    break;
  }

  case 'search': {
    const query = process.argv.slice(3).join(' ');
    if (!query) { console.log('Usage: memory search <query>'); exit(1); }
    const results = searchNotes(query);
    if (results.length === 0) { console.log(`No results for: ${query}`); exit(0); }
    console.log(`\n🔍 Results for "${query}":\n`);
    for (const r of results) {
      console.log(`  [${r.type}] ${r.title} (${r.id})`);
      if (r.tags.length) console.log(`    Tags: ${r.tags.join(', ')}`);
      console.log(`    Score: ${r.score}`);
    }
    console.log();
    break;
  }

  case 'graph': {
    const slug = process.argv[3];
    if (!slug) { console.log('Usage: memory graph <slug> [depth]'); exit(1); }
    const depth = parseInt(process.argv[4]) || 2;
    const allLinks = getAllLinks();
    const visited = new Set();
    const queue = [{ slug, depth: 0 }];
    const nodes = [];
    const edges = [];

    while (queue.length > 0) {
      const { slug: s, depth: d } = queue.shift();
      if (visited.has(s) || d > depth) continue;
      visited.add(s);
      nodes.push({ id: s, depth: d });
      for (const l of allLinks.filter(l => l.from === s)) {
        edges.push(`${l.from} → ${l.to} (${l.type})`);
        if (!visited.has(l.to)) queue.push({ slug: l.to, depth: d + 1 });
      }
      for (const l of allLinks.filter(l => l.to === s)) {
        edges.push(`${l.from} → ${l.to} (${l.type})`);
        if (!visited.has(l.from)) queue.push({ slug: l.from, depth: d + 1 });
      }
    }

    console.log(`\n🕸️  Graph: ${slug} (depth ${depth})`);
    console.log(`   Nodes: ${nodes.length} | Edges: ${edges.length}\n`);
    for (const n of nodes) console.log(`  ${'  '.repeat(n.depth)}• ${n.id}`);
    if (edges.length > 0) { console.log('\nEdges:'); for (const e of edges) console.log(`  ${e}`); }
    console.log();
    break;
  }

  case 'recall': {
    const slug = process.argv[3];
    if (!slug) { console.log('Usage: memory recall <slug>'); exit(1); }
    const result = recall(slug);
    if (!result) { console.log(`Note not found: ${slug}`); exit(1); }
    console.log(result.content);
    break;
  }

  case 'context': {
    const all = readAllNotes();
    const decisions = all.filter(n => n.type === 'decision').slice(-5);
    console.log('\n🧠 Project Context:\n');
    if (decisions.length > 0) {
      console.log('  Recent Decisions:');
      for (const d of decisions) console.log(`    • ${d.title}`);
    }
    console.log(`\n  Total notes: ${all.length}`);
    console.log(`  Total tags: ${new Set(all.flatMap(n => n.tags)).size}\n`);
    break;
  }

  default:
    console.log(`Unknown command: ${command}`);
    console.log('Available: stats, search, recall, context, graph');
}
