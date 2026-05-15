import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://anwtivdognjrghipardd.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3RpdmRvZ25qcmdoaXBhcmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NDAyODksImV4cCI6MjA5NDExNjI4OX0.T0bdzjSE9iC2juSnpwp3EXWgg7LF2qKYu3smik_va0o'

const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'

const COMPANY_MAP = {
  'bica bar sensorial': '10000000-0000-0000-0000-000000000003',
  'bica': '10000000-0000-0000-0000-000000000003',
  'amp213': '10000000-0000-0000-0000-000000000002',
  'amp 213': '10000000-0000-0000-0000-000000000002',
  'sollu': '10000000-0000-0000-0000-000000000001',
  'geral': '10000000-0000-0000-0000-000000000002',
}

function cleanText(text) {
  if (!text) return null
  return text.replace(/^"|"$/g, '').trim()
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
      if (char === '"') inQuotes = !inQuotes
      else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else current += char
    }
    values.push(current.trim())
    
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    if (row.Decisão && row.Decisão.trim()) {
      data.push(row)
    }
  }
  return data
}

function extractCompany(companyStr) {
  if (!companyStr) return COMPANY_MAP['geral']
  const normalized = companyStr.toLowerCase()
  for (const [key, value] of Object.entries(COMPANY_MAP)) {
    if (normalized.includes(key)) return value
  }
  return COMPANY_MAP['geral']
}

function mapDecisionType(tipo) {
  if (!tipo) return 'estrategica'
  const t = tipo.toLowerCase()
  if (t.includes('finance')) return 'financeira'
  if (t.includes('operac')) return 'operacional'
  if (t.includes('estrat')) return 'estrategica'
  return 'estrategica'
}

function mapReversible(rev) {
  if (!rev) return 'não'
  const r = rev.toLowerCase()
  if (r.includes('sim') || r.includes('custosa')) return 'sim'
  return 'não'
}

async function importFromCSV(filePath, sourceName) {
  console.log(`\n📥 Importando ${sourceName}...`)
  console.log('─'.repeat(50))
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const decisions = parseCSV(content)
    console.log(`   Total de registros: ${decisions.length}`)
    
    let imported = 0
    let skipped = 0
    let errors = 0
    
    for (const dec of decisions) {
      try {
        const companyId = extractCompany(dec.Empresa)
        
        const record = {
          workspace_id: WORKSPACE_ID,
          title: cleanText(dec.Decisão),
          decision_type: mapDecisionType(dec.Tipo),
          company_id: companyId,
          reversibility: mapReversible(dec.Reversível),
        }
        
        // Check existing by title + workspace
        const checkRes = await fetch(
          `${SUPABASE_URL}/rest/v1/decisions?workspace_id=eq.${WORKSPACE_ID}&title=eq.${encodeURIComponent(record.title.substring(0, 100))}`,
          {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
          }
        )
        const existing = await checkRes.json()
        
        if (existing && existing.length > 0) {
          skipped++
          continue
        }
        
        const insertRes = await fetch(
          `${SUPABASE_URL}/rest/v1/decisions`,
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
          console.log(`   ❌ ${record.title?.substring(0,30)}: ${err.substring(0,100)}`)
          errors++
        } else {
          imported++
        }
      } catch (e) {
        errors++
      }
    }
    
    console.log(`\n   📊 Importados: ${imported} | Pulados: ${skipped} | Erros: ${errors}`)
    return { imported, skipped, errors }
  } catch (e) {
    console.log(`   ❌ Erro: ${e.message}`)
    return { imported: 0, skipped: 0, errors: 1 }
  }
}

async function main() {
  console.log('🚀 Importando Decisões do Notion')
  console.log('='.repeat(50))
  
  const basePath = path.join(__dirname, '..', 'export-notion-total', 'Particular e Compartilhado', 'SISTEMA → Gabriel Quental', 'Produtos para Clientes', 'LEVAY OS')
  
  const decisionsPath = path.join(basePath, 'Decisões acd73fa6ae2682af801d0102060b3a48_all.csv')
  
  if (fs.existsSync(decisionsPath)) {
    await importFromCSV(decisionsPath, 'Decisões LEVAY OS')
  }
  
  // Verify
  const verifyRes = await fetch(
    `${SUPABASE_URL}/rest/v1/decisions?workspace_id=eq.${WORKSPACE_ID}&select=id,title,decision_type,company_id&order=created_at.desc&limit=10`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  )
  const decisions = await verifyRes.json()
  console.log('\n📋 Decisões no banco:')
  decisions?.forEach(d => console.log(`   - ${d.title?.substring(0, 50)}... [${d.decision_type}]`))
}

main().catch(console.error)