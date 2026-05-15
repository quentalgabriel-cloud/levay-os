#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { exit } from 'process';

const PROJECT_ROOT = '/Users/gabrielquental/Documents/AIOS/projects/sistemainterno-grupo-levay';
const INDEX_PATH = `${PROJECT_ROOT}/.memory/index/index.json`;
const NOTES_DIR = `${PROJECT_ROOT}/.memory/notes`;
const DECISIONS_DIR = `${PROJECT_ROOT}/.memory/decisions`;
const CONTEXT_DIR = `${PROJECT_ROOT}/.memory/context`;

function getIndex() {
  if (!existsSync(INDEX_PATH)) return { version: '1.0.0', lastUpdated: new Date().toISOString(), stats: { totalNotes: 0, totalDecisions: 0, totalLinks: 0, lastIndexed: null }, tags: [], links: [] };
  return JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
}

function saveIndex(index) {
  index.lastUpdated = new Date().toISOString();
  writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractLinks(content) {
  const linkPattern = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    links.push(match[1]);
  }
  return links;
}

function extractTags(content) {
  const tagPattern = /#([a-zA-Z0-9_-]+)/g;
  const tags = new Set();
  let match;
  while ((match = tagPattern.exec(content)) !== null) {
    tags.add(match[1]);
  }
  return Array.from(tags);
}

function scanDirectory(dir, type) {
  if (!existsSync(dir)) return [];
  const files = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...scanDirectory(fullPath, type));
    } else if (entry.endsWith('.md')) {
      const content = readFileSync(fullPath, 'utf-8');
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : entry.replace('.md', '');
      files.push({
        id: entry.replace('.md', ''),
        slug: slugify(entry.replace('.md', '')),
        title,
        path: fullPath,
        type,
        links: extractLinks(content),
        tags: extractTags(content)
      });
    }
  }
  return files;
}

function buildIndex() {
  console.log('🔍 Indexing memory files...');
  const index = getIndex();
  
  const notes = scanDirectory(NOTES_DIR, 'note');
  const decisions = scanDirectory(DECISIONS_DIR, 'decision');
  const context = scanDirectory(CONTEXT_DIR, 'context');
  
  index.stats.totalNotes = notes.length + decisions.length + context.length;
  index.stats.totalDecisions = decisions.length;
  index.stats.lastIndexed = new Date().toISOString();
  
  const allItems = [...notes, ...decisions, ...context];
  const allTags = new Set();
  const allLinks = [];
  
  for (const item of allItems) {
    item.tags.forEach(t => allTags.add(t));
    item.links.forEach(l => {
      allLinks.push({ from: item.id, to: l, type: 'wiki-link' });
    });
  }
  
  index.tags = Array.from(allTags).sort();
  index.links = allLinks;
  
  saveIndex(index);
  console.log(`✅ Indexed: ${notes.length} notes, ${decisions.length} decisions, ${context.length} context items`);
  console.log(`📊 Tags: ${index.tags.length} | Links: ${allLinks.length}`);
  return index;
}

function showStats() {
  const index = getIndex();
  console.log('\n📚 LEVAI Memory Stats');
  console.log('═══════════════════════════════');
  console.log(`   Total entries: ${index.stats.totalNotes}`);
  console.log(`   Decisions:     ${index.stats.totalDecisions}`);
  console.log(`   Tags:          ${index.tags.length}`);
  console.log(`   Wiki-links:    ${index.links.length}`);
  console.log(`   Last indexed:  ${index.stats.lastIndexed || 'never'}`);
  if (index.tags.length > 0) {
    console.log(`\n🏷️  Tags: ${index.tags.join(', ')}`);
  }
}

function addNote(title, content, type = 'note') {
  const slug = slugify(title);
  const dir = type === 'decision' ? DECISIONS_DIR : type === 'context' ? CONTEXT_DIR : NOTES_DIR;
  const path = `${dir}/${slug}.md`;
  
  if (existsSync(path)) {
    console.error(`⚠️  Note already exists: ${path}`);
    exit(1);
  }
  
  const date = new Date().toISOString().split('T')[0];
  const frontmatter = `---
title: ${title}
type: ${type}
created: ${date}
tags: []
---

`;
  
  writeFileSync(path, frontmatter + content);
  buildIndex();
  console.log(`✅ Created ${type}: ${title}`);
  return slug;
}

function searchNotes(query) {
  const index = getIndex();
  const results = [];
  const queryLower = query.toLowerCase();
  
  const allDirs = [NOTES_DIR, DECISIONS_DIR, CONTEXT_DIR];
  for (const dir of allDirs) {
    if (!existsSync(dir)) continue;
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (!entry.endsWith('.md')) continue;
      const fullPath = join(dir, entry);
      const content = readFileSync(fullPath, 'utf-8');
      if (content.toLowerCase().includes(queryLower)) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const typeMatch = content.match(/type:\s*(\w+)/);
        results.push({
          id: entry.replace('.md', ''),
          title: titleMatch ? titleMatch[1] : entry,
          type: typeMatch ? typeMatch[1] : 'note',
          path: fullPath
        });
      }
    }
  }
  
  if (results.length === 0) {
    console.log(`🔍 No results for: "${query}"`);
    return;
  }
  
  console.log(`\n🔍 Results for "${query}":\n`);
  for (const r of results) {
    console.log(`  📄 [${r.type}] ${r.title}`);
    console.log(`     ${r.path.replace(PROJECT_ROOT, '.')}`);
    console.log();
  }
}

function recallNote(slug) {
  const allDirs = [NOTES_DIR, DECISIONS_DIR, CONTEXT_DIR];
  for (const dir of allDirs) {
    const path = `${dir}/${slug}.md`;
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      console.log(content);
      
      const index = getIndex();
      index.lastAccessed = { slug, at: new Date().toISOString() };
      saveIndex(index);
      return;
    }
  }
  console.error(`⚠️  Note not found: ${slug}`);
  exit(1);
}

function linkNotes(fromSlug, toSlug, linkType = 'related') {
  const index = getIndex();
  const existingLink = index.links.find(l => l.from === fromSlug && l.to === toSlug);
  if (existingLink) {
    console.log(`🔗 Link already exists: ${fromSlug} → ${toSlug}`);
    return;
  }
  
  index.links.push({ from: fromSlug, to: toSlug, type: linkType });
  saveIndex(index);
  console.log(`🔗 Linked: ${fromSlug} → ${toSlug} (${linkType})`);
}

const command = process.argv[2];

switch (command) {
  case 'index':
  case 'build':
    buildIndex();
    break;
  case 'stats':
    showStats();
    break;
  case 'add':
    addNote(process.argv[3] || 'Untitled', process.argv[4] || '');
    break;
  case 'search':
    searchNotes(process.argv[3] || '');
    break;
  case 'recall':
    recallNote(process.argv[3] || '');
    break;
  case 'link':
    linkNotes(process.argv[3] || '', process.argv[4] || '', process.argv[5] || 'related');
    break;
  case 'help':
  default:
    console.log(`
📚 LEVAI Memory Manager

Usage:
  node memory-manager.mjs <command> [args]

Commands:
  index                      Build/update the memory index
  stats                      Show memory statistics
  add <title> <content>      Add a new note
  search <query>             Search notes by content
  recall <slug>              Read a specific note
  link <from> <to> [type]    Link two notes (wiki-style)
  help                       Show this help

Wiki-links in notes:
  [[note-slug]]              Creates a link to another note
  #tag-name                   Tags for categorization
`);
}

export { buildIndex, addNote, searchNotes, recallNote, linkNotes };
