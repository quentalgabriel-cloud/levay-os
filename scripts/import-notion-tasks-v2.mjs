import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://anwtivdognjrghipardd.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3RpdmRvZ25qcmdoaXBhcmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NDAyODksImV4cCI6MjA5NDExNjI4OX0.T0bdzjSE9iC2juSnpwp3EXWgg7LF2qKYu3smik_va0o'

const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'

const COMPANY_MAP = {
  'sollu': '10000000-0000-0000-0000-000000000001',
  'bica bar sensorial': '10000000-0000-0000-0000-000000000003',
  'bica': '10000000-0000-0000-0000-000000000003',
  'amp213': '10000000-0000-0000-0000-000000000002',
  'amp 213': '10000000-0000-0000-0000-000000000002',
  'quental': '10000000-0000-0000-0000-000000000004',
  'pessoal': null,
  'pessoal do erick': null,
}

const STATUS_MAP = {
  'a fazer': 'a_fazer',
  'em andamento': 'em_andamento',
  'concluído': 'concluido',
  'cancelado': 'cancelado',
}

function cleanText(text) {
  if (!text) return ''
  return text.replace(/^"|"$/g, '').trim()
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === 'Sem data') return null
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return null
}

function extractCompany(companyStr) {
  if (!companyStr) return null
  const normalized = companyStr.toLowerCase().trim()
  
  if (COMPANY_MAP[normalized]) return COMPANY_MAP[normalized]
  
  for (const [key, value] of Object.entries(COMPANY_MAP)) {
    if (normalized.includes(key)) return value
  }
  return null
}

function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = []
    let current = ''
    let inQuotes = false
    
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    if (row.Tarefa && row.Tarefa.trim()) {
      data.push(row)
    }
  }
  return data
}

async function insertTask(taskData) {
  const companyId = extractCompany(taskData.Empresa || taskData['🏢 Empresa'])
  
  let status = 'a_fazer'
  const statusStr = taskData.Status || ''
  for (const [key, value] of Object.entries(STATUS_MAP)) {
    if (statusStr.toLowerCase().includes(key)) {
      status = value
      break
    }
  }
  
  const movimentoMinimo = taskData['Movimento mínimo'] || taskData['Notas'] || ''
  const dono = cleanText(taskData.Dono || '')
  const tipo = cleanText(taskData['OPCIONAL — Bloco'] || '')
  
  const record = {
    workspace_id: WORKSPACE_ID,
    title: cleanText(taskData.Tarefa),
    description: movimentoMinimo || null,
    status: status,
    company_id: companyId,
    minimum_movement: movimentoMinimo || null,
    due_date: parseDate(taskData.Prazo),
    tags: JSON.stringify([dono, tipo].filter(Boolean)),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  Object.keys(record).forEach(key => {
    if (record[key] === null || record[key] === undefined) {
      delete record[key]
    }
  })
  
  return record
}

async function importFromCSV(filePath, sourceName) {
  console.log(`\n📥 Importando ${sourceName}...`)
  console.log('─'.repeat(50))
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const tasks = parseCSV(content)
    console.log(`   Total de registros: ${tasks.length}`)
    
    let imported = 0
    let skipped = 0
    let errors = 0
    
    for (const task of tasks) {
      try {
        const record = await insertTask(task)
        
        // Check existing via REST
        const checkRes = await fetch(
          `${SUPABASE_URL}/rest/v1/tasks?workspace_id=eq.${WORKSPACE_ID}&title=eq.${encodeURIComponent(record.title)}`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          }
        )
        const existing = await checkRes.json()
        
        if (existing && existing.length > 0) {
          skipped++
          continue
        }
        
        // Insert
        const insertRes = await fetch(
          `${SUPABASE_URL}/rest/v1/tasks`,
          {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(record)
          }
        )
        
        if (!insertRes.ok) {
          const err = await insertRes.text()
          console.log(`   Insert error: ${insertRes.status} - ${err.substring(0, 100)}`)
          if (err.includes('duplicate') || err.includes('23505')) {
            skipped++
          } else {
            errors++
          }
        } else {
          imported++
        }
      } catch (e) {
        errors++
      }
    }
    
    console.log(`   ✅ Importadas: ${imported}`)
    console.log(`   ⏭️  Puladas: ${skipped}`)
    console.log(`   ❌ Erros: ${errors}`)
    
    return { imported, skipped, errors }
  } catch (e) {
    console.log(`   ❌ Erro: ${e.message}`)
    return { imported: 0, skipped: 0, errors: 1 }
  }
}

async function main() {
  console.log('🚀 Iniciando importação de tarefas (via REST API)')
  console.log('='.repeat(50))
  
  const basePath = path.join(__dirname, '..', 'export-notion-total', 'Particular e Compartilhado')
  
  const results = { total: { imported: 0, skipped: 0, errors: 0 } }
  
  // 1. Tarefas do LEVAY OS (Erick)
  const levayPath = path.join(basePath, 'SISTEMA → Gabriel Quental', 'Produtos para Clientes', 'LEVAY OS', 'Tarefas 0fc73fa6ae2683e1891381d7ff045495.csv')
  if (fs.existsSync(levayPath)) {
    const r = await importFromCSV(levayPath, 'Tarefas LEVAY OS (Erick)')
    results.total.imported += r.imported
    results.total.skipped += r.skipped
    results.total.errors += r.errors
  }
  
  // 2. Minhas Tarefas (Gabriel)
  const minhasPath = path.join(basePath, 'Minhas Tarefas 5893f8c0e9584827b0049f5dff8ed284_all.csv')
  if (fs.existsSync(minhasPath)) {
    const r = await importFromCSV(minhasPath, 'Minhas Tarefas (Gabriel)')
    results.total.imported += r.imported
    results.total.skipped += r.skipped
    results.total.errors += r.errors
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMO TOTAL')
  console.log(`   Total importado: ${results.total.imported}`)
  console.log(`   Total pulado: ${results.total.skipped}`)
  console.log(`   Total erros: ${results.total.errors}`)
  console.log('='.repeat(50))
  
  // Verify
  const verifyRes = await fetch(
    `${SUPABASE_URL}/rest/v1/tasks?workspace_id=eq.${WORKSPACE_ID}&select=id,title,status&order=created_at.desc&limit=5`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  )
  const tasks = await verifyRes.json()
  console.log('\n📋 Tarefas no banco:')
  tasks?.forEach(t => console.log(`   - ${t.title?.substring(0, 40)}... [${t.status}]`))
}

main().catch(console.error)