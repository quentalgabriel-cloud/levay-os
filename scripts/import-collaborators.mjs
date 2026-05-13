import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://anwtivdognjrghipardd.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3RpdmRvZ25qcmdoaXBhcmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NDAyODksImV4cCI6MjA5NDExNjI4OX0.T0bdzjSE9iC2juSnpwp3EXWgg7LF2qKYu3smik_va0o'

const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'

function cleanText(text) {
  if (!text) return ''
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
    
    if (row.Nome && row.Nome.trim()) {
      data.push(row)
    }
  }
  return data
}

function extractDefaultCompany(alocacoesStr) {
  if (!alocacoesStr) return null
  if (alocacoesStr.toLowerCase().includes('bica')) {
    return '10000000-0000-0000-0000-000000000003'
  }
  if (alocacoesStr.toLowerCase().includes('amp')) {
    return '10000000-0000-0000-0000-000000000002'
  }
  return null
}

async function importFromCSV(filePath, sourceName) {
  console.log(`\n📥 Importando ${sourceName}...`)
  console.log('─'.repeat(50))
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const collaborators = parseCSV(content)
    console.log(`   Total de registros: ${collaborators.length}`)
    
    let imported = 0
    let skipped = 0
    let errors = 0
    
    for (const colab of collaborators) {
      try {
        const defaultCompany = extractDefaultCompany(colab.Alocações || '')
        
        // Check existing by name + workspace
        const checkRes = await fetch(
          `${SUPABASE_URL}/rest/v1/collaborators?workspace_id=eq.${WORKSPACE_ID}&name=eq.${encodeURIComponent(colab.Nome)}`,
          {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
          }
        )
        const existing = await checkRes.json()
        
        if (existing && existing.length > 0) {
          skipped++
          console.log(`   ⏭️  Já existe: ${colab.Nome}`)
          continue
        }
        
        const record = {
          workspace_id: WORKSPACE_ID,
          name: cleanText(colab.Nome),
          email: colab['E-mail'] || null,
          whatsapp: colab.Telefone || null,
          default_company_id: defaultCompany,
          active: colab.Status?.toLowerCase() === 'ativo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        Object.keys(record).forEach(key => {
          if (record[key] === null || record[key] === undefined) delete record[key]
        })
        
        const insertRes = await fetch(
          `${SUPABASE_URL}/rest/v1/collaborators`,
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
          console.log(`   ❌ Erro ao inserir ${colab.Nome}: ${err}`)
          errors++
        } else {
          imported++
          console.log(`   ✅ ${colab.Nome}`)
        }
      } catch (e) {
        console.log(`   ❌ Exceção: ${e.message}`)
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
  console.log('🚀 Importando Colaboradores do Notion')
  console.log('='.repeat(50))
  
  const basePath = path.join(__dirname, '..', 'export-notion-total', 'Particular e Compartilhado', 'SISTEMA → Gabriel Quental', 'Produtos para Clientes', 'LEVAY OS', 'BICA + AMP — Operação compartilhada', '👥 Gestão de Pessoas — Bica & AMP 213')
  
  const colabsPath = path.join(basePath, '🧑‍🍳 Colaboradores 79473fa6ae26821dbdc101a449f10f7e_all.csv')
  
  if (fs.existsSync(colabsPath)) {
    await importFromCSV(colabsPath, 'Colaboradores Bica + AMP')
  }
  
  // List all collaborators
  const verifyRes = await fetch(
    `${SUPABASE_URL}/rest/v1/collaborators?workspace_id=eq.${WORKSPACE_ID}&select=id,name,default_company_id,active&order=name`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  )
  const collabs = await verifyRes.json()
  console.log('\n📋 Colaboradores no banco:')
  collabs?.forEach(c => console.log(`   - ${c.name} (${c.active ? 'ativo' : 'inativo'})`))
}

main().catch(console.error)