import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const CSV_PATH = path.join(ROOT_DIR, 'Tarefas mapeadas no notion/Tarefas 0fc73fa6ae2683e1891381d7ff045495.csv');
const API_URL = 'http://localhost:3001/api/v1/tasks'; // Using port 3001 for API

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
      continue;
    }
    current += c;
  }
  fields.push(current.trim());
  return fields;
}

function mapTenant(empresa) {
  if (empresa.includes('Bica Bar Sensorial')) return 'bica';
  if (empresa.includes('AMP213')) return 'amp213';
  if (empresa.includes('Sollu')) return 'sollu';
  if (empresa.includes('Pessoal')) return 'pessoal';
  return 'sollu'; // default fallback
}

function mapPriority(prioridade) {
  if (prioridade === 'Hoje') return 'high';
  if (prioridade === 'Depois') return 'low';
  return 'normal'; // 'Esta semana'
}

function requestPost(url, data, tenantId) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(data);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-tenant-id': tenantId
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body || '{}'));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('--- Levay OS: Iniciando migração de Tarefas do Notion ---');
  
  if (!fs.existsSync(CSV_PATH)) {
    console.error('ERRO: Arquivo CSV não encontrado:', CSV_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = raw.replace(/\r/g, '').split('\n').filter(l => l.trim());
  const header = parseCSVLine(lines[0]);
  
  const tasks = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const obj = {};
    header.forEach((h, idx) => obj[h] = fields[idx] || '');
    if (obj.Tarefa) {
      tasks.push(obj);
    }
  }

  console.log(`Encontradas ${tasks.length} tarefas no CSV.`);
  let successCount = 0;
  let failCount = 0;

  for (const t of tasks) {
    const tenantId = mapTenant(t.Empresa);
    const payload = {
      title: t.Tarefa,
      priority: mapPriority(t['Prioridade saudável']),
      dueDate: t.Prazo,
      block: t.Bloco
    };

    try {
      await requestPost(API_URL, payload, tenantId);
      successCount++;
    } catch (err) {
      console.error(`Falha ao injetar tarefa: "${t.Tarefa}" - ${err.message}`);
      failCount++;
    }
  }

  console.log('--- Migração Concluída ---');
  console.log(`✅ Sucesso: ${successCount}`);
  console.log(`❌ Falha: ${failCount}`);
}

run().catch(console.error);
