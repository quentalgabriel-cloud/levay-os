#!/usr/bin/env node
// LevAI Memory Search — semantic-like search using simple keyword + graph traversal
// Replicates Obsidian's local graph search without embedding API dependency

import { readFileSync, readdirSync, statSync } from 'fs';
import { existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = '/Users/gabrielquental/Documents/AIOS/projects/sistemainterno-grupo-levay';
const INDEX_PATH = `${PROJECT_ROOT}/.memory/index/index.json`;
const NOTES_DIR = `${PROJECT_ROOT}/.memory/notes`;
const DECISIONS_DIR = `${PROJECT_ROOT}/.memory/decisions`;
const CONTEXT_DIR = `${PROJECT_ROOT}/.memory/context`;

function getIndex() {
  if (!existsSync(INDEX_PATH)) return null;
  return JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
}

function scoreContent(content, terms) {
  const contentLower = content.toLowerCase();
  let score = 0;
  const matchedTerms = [];
  
  for (const term of terms) {
    const termLower = term.toLowerCase();
    const count = (contentLower.match(new RegExp(termLower, 'g')) || []).length;
    if (count > 0) {
      score += count * (contentLower.includes(termLower + 's') ? 2 : 1);
      matchedTerms.push({ term, count });
    }
  }
  
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    for (const term of terms) {
      if (titleMatch[1].toLowerCase().includes(term.toLowerCase())) {
        score += 5;
      }
    }
  }
  
  return { score, matchedTerms };
}

function search(query, limit = 10) {
  const index = getIndex();
  if (!index) {
    console.log('No memory index found. Run: node memory-manager.mjs index');
    return;
  }
  
  const terms = query.split(/\s+/).filter(t => t.length > 1);
  if (terms.length === 0) {
    console.log('Enter search terms');
    return;
  }
  
  const allDirs = [
    { dir: NOTES_DIR, type: 'note' },
    { dir: DECISIONS_DIR, type: 'decision' },
    { dir: CONTEXT_DIR, type: 'context' }
  ];
  
  const results = [];
  
  for (const { dir, type } of allDirs) {
    if (!existsSync(dir)) continue;
    
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (!entry.endsWith('.md')) continue;
      
      const fullPath = join(dir, entry);
      const content = readFileSync(fullPath, 'utf-8');
      const { score, matchedTerms } = scoreContent(content, terms);
      
      if (score > 0) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const tagsMatch = content.match(/tags:\s*\[([^\]]+)\]/);
        
        results.push({
          id: entry.replace('.md', ''),
          title: titleMatch ? titleMatch[1] : entry,
          type,
          path: fullPath.replace(PROJECT_ROOT, '.'),
          score,
          matchedTerms,
          tags: tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, '')) : [],
          links: extractLinks(content)
        });
      }
    }
  }
  
  for (const link of index.links || []) {
    for (const term of terms) {
      if (link.from.toLowerCase().includes(term.toLowerCase()) || 
          link.to.toLowerCase().includes(term.toLowerCase())) {
        const existing = results.find(r => r.id === link.from || r.id === link.to);
        if (existing) existing.score += 3;
      }
    }
  }
  
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

function extractLinks(content) {
  const pattern = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  while ((match = pattern.exec(content)) !== null) {
    links.push(match[1]);
  }
  return links;
}

function printResults(results, query) {
  if (results.length === 0) {
    console.log(`\n🔍 No results for: "${query}"\n`);
    return;
  }
  
  console.log(`\n🔍 Search: "${query}" — ${results.length} results\n`);
  console.log('─'.repeat(60));
  
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const badges = [];
    if (r.type === 'decision') badges.push('🔶 DECISION');
    else if (r.type === 'context') badges.push('📌 CONTEXT');
    if (r.links.length > 0) badges.push(`🔗 ${r.links.length} links`);
    if (r.tags.length > 0) badges.push(`🏷️ ${r.tags.slice(0, 3).join(', ')}`);
    
    console.log(`\n${i + 1}. ${r.title}`);
    console.log(`   ${r.path}`);
    if (badges.length > 0) console.log(`   ${badges.join(' · ')}`);
    if (r.matchedTerms.length > 0) {
      console.log(`   Matched: ${r.matchedTerms.map(m => `"${m.term}" (${m.count}x)`).join(', ')}`);
    }
  }
  
  console.log('\n' + '─'.repeat(60));
}

function graphExplore(startSlug, depth = 2) {
  const index = getIndex();
  if (!index) return;
  
  const visited = new Set();
  const queue = [{ slug: startSlug, depth: 0 }];
  const graph = { nodes: [], edges: [] };
  
  while (queue.length > 0) {
    const { slug, depth: currentDepth } = queue.shift();
    if (visited.has(slug) || currentDepth > depth) continue;
    visited.add(slug);
    
    graph.nodes.push({ id: slug, depth: currentDepth });
    
    const outgoing = index.links.filter(l => l.from === slug);
    const incoming = index.links.filter(l => l.to === slug);
    
    for (const link of outgoing) {
      graph.edges.push({ from: slug, to: link.to, type: link.type });
      if (!visited.has(link.to)) queue.push({ slug: link.to, depth: currentDepth + 1 });
    }
    
    for (const link of incoming) {
      graph.edges.push({ from: link.from, to: slug, type: link.type });
      if (!visited.has(link.from)) queue.push({ slug: link.from, depth: currentDepth + 1 });
    }
  }
  
  console.log(`\n🕸️  Graph: ${startSlug} (depth ${depth})`);
  console.log(`   Nodes: ${graph.nodes.length} | Edges: ${graph.edges.length}`);
  console.log('\nNodes:');
  for (const node of graph.nodes) {
    console.log(`  ${'  '.repeat(node.depth)}• ${node.id}`);
  }
  console.log('\nEdges:');
  for (const edge of graph.edges) {
    console.log(`  ${edge.from} → ${edge.to} (${edge.type})`);
  }
}

const command = process.argv[2];
const query = process.argv.slice(3).join(' ');

switch (command) {
  case 'search':
    if (!query) {
      console.log('Usage: node memory-search.mjs search <query>');
    } else {
      const results = search(query);
      printResults(results, query);
    }
    break;
  case 'graph':
    graphExplore(process.argv[3] || '', parseInt(process.argv[4]) || 2);
    break;
  default:
    console.log(`
🔍 LevAI Memory Search

Usage:
  node memory-search.mjs search <query>    Search notes
  node memory-search.mjs graph <slug> [depth]  Explore graph
`);
}
