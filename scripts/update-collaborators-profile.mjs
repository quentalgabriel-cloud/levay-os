import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://anwtivdognjrghipardd.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3RpdmRvZ25qcmdoaXBhcmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NDAyODksImV4cCI6MjA5NDExNjI4OX0.T0bdzjSE9iC2juSnpwp3EXWgg7LF2qKYu3smik_va0o'

const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'

const COMPANY_MAP = {
  'bica': '10000000-0000-0000-0000-000000000003',
  'amp213': '10000000-0000-0000-0000-000000000002',
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
    
    if (row.Nome && row.Nome.trim()) {
      data.push(row)
    }
  }
  return data
}

function extractCompany(alocacoes) {
  if (!alocacoes) return null
  if (alocacoes.toLowerCase().includes('bica')) return COMPANY_MAP['bica']
  if (alocacoes.toLowerCase().includes('amp')) return COMPANY_MAP['amp213']
  return null
}

async function updateCollaborators() {
  console.log('📥 Lendo dados do Notion...')
  
  const csvPath = path.join(__dirname, '..', 'export-notion-total', 'Particular e Compartilhado', 'SISTEMA → Gabriel Quental', 'Produtos para Clientes', 'LEVAY OS', 'BICA + AMP — Operação compartilhada', '👥 Gestão de Pessoas — Bica & AMP 213', '🧑‍🍳 Colaboradores 79473fa6ae26821dbdc101a449f10f7e_all.csv')
  
  const content = fs.readFileSync(csvPath, 'utf-8')
  const notionData = parseCSV(content)
  
  console.log(`   ${notionData.length} registros encontrados`)
  
  // Get all collaborators
  const collabRes = await fetch(
    `${SUPABASE_URL}/rest/v1/collaborators?workspace_id=eq.${WORKSPACE_ID}&select=id,name`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  )
  const collaborators = await collabRes.json()
  
  console.log(`\n🔄 Atualizando ${collaborators.length} colaboradores...`)
  
  let updated = 0
  
  for (const collab of collaborators) {
    const notionRec = notionData.find(n => n.Nome?.toLowerCase() === collab.name.toLowerCase())
    
    if (!notionRec) continue
    
    const companyId = extractCompany(notionRec.Alocações)
    
    const profileData = {
      role: cleanText(notionRec['🎭 Função']),
      contract_type: cleanText(notionRec['Tipo de vínculo principal']),
      strengths: cleanText(notionRec['⚡ Forças']),
      specialty: cleanText(notionRec['🌟 Especialidade']),
      impact_phrase: cleanText(notionRec['💬 Frase de impacto']),
      observation: cleanText(notionRec['Observações de RH']),
    }
    
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/collaborators?id=eq.${collab.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          default_company_id: companyId,
          profile_data: profileData,
        })
      }
    )
    
    if (updateRes.ok) {
      console.log(`   ✅ ${collab.name}`)
      updated++
    }
  }
  
  console.log(`\n📊 Total atualizado: ${updated} de ${collaborators.length}`)
}

updateCollaborators().catch(console.error)