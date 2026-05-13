import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const supabaseUrl = 'https://anwtivdognjrghipardd.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3RpdmRvZ25qcmdoaXBhcmRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODU0MDI4OSwiZXhwIjoyMDk0MTE2Mjg5fQ.pW2_9g3vY1xH_8kP6jL2mN4qR7tY9zX8cB3vU6sJ0dE'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'

// Mapping de empresas do Notion para o ID no Supabase
const COMPANY_MAP = {
  'sollu': '10000000-0000-0000-0000-000000000001',
  'bica bar sensorial': '10000000-0000-0000-0000-000000000003',
  'bica': '10000000-0000-0000-0000-000000000003',
  'amp213': '10000000-0000-0000-0000-000000000002',
  'amp 213': '10000000-0000-0000-0000-000000000002',
  'quental': '10000000-0000-0000-0000-000000000004',
  'pessoal': null,
  'pessoal do erick': null,
  'massa hub': '10000000-0000-0000-0000-000000000005',
}

// Mapping de status do Notion para o schema do sistema
const STATUS_MAP = {
  'a fazer': 'a_fazer',
  'em andamento': 'em_andamento',
  'aguardando': 'aguardando',
  'fechar ciclo': 'fechar_ciclo',
  'concluído': 'concluido',
  'concluido': 'concluido',
  'cancelado': 'cancelado',
  'standby': 'standby',
}

// Mapping de "Quando" (prioridade temporal)
const PRIORITY_MAP = {
  'hoje': 'urgente',
  'esta semana': 'alta',
  'depois': 'baixa',
  'sem data': 'normal',
  '🔴 atrasada': 'urgente',
  '🔵 depois': 'baixa',
  '🟡 esta semana': 'alta',
}

// Função para limpar texto
function cleanText(text) {
  if (!text) return ''
  return text.replace(/^"|"$/g, '').trim()
}

// Função para converter data DD/MM/YYYY para ISO
function parseDate(dateStr) {
  if (!dateStr || dateStr === 'Sem data') return null
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return null
}

// Função para extrair empresa do texto
function extractCompany(companyStr) {
  if (!companyStr) return null
  const normalized = companyStr.toLowerCase().trim()
  
  // Verificar mapping direto
  if (COMPANY_MAP[normalized]) {
    return COMPANY_MAP[normalized]
  }
  
  // Tentar match parcial
  for (const [key, value] of Object.entries(COMPANY_MAP)) {
    if (normalized.includes(key)) {
      return value
    }
  }
  
  return null
}

// Função para parsear CSV simples
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

// Função para criar tarefa no Supabase
async function importTask(taskData) {
  const companyId = extractCompany(taskData.Empresa || taskData['🏢 Empresa'])
  
  // Mapear status
  let status = 'a_fazer'
  const statusStr = taskData.Status || ''
  for (const [key, value] of Object.entries(STATUS_MAP)) {
    if (statusStr.toLowerCase().includes(key)) {
      status = value
      break
    }
  }
  
  // Mapear prioridade do "Quando"
  const whenStr = taskData.Quando || ''
  let priority = 'normal'
  for (const [key, value] of Object.entries(PRIORITY_MAP)) {
    if (whenStr.toLowerCase().includes(key.toLowerCase())) {
      priority = value
      break
    }
  }
  
  // Determinar movimento mínimo
  const movimentoMinimo = taskData['Movimento mínimo'] || taskData['Notas'] || ''
  
  // Determinar o dono
  const dono = cleanText(taskData.Dono || taskData.Dono)
  
  // Determinar tipo (bloco)
  const tipo = cleanText(taskData.Bloco || taskData['OPCIONAL — Bloco'] || '')
  
  // Esforço
  const effortStr = taskData['Esforço'] || taskData['OPCIONAL — Estimativa (h)'] || ''
  const effort = effortStr ? parseInt(effortStr) : null
  
  // Criar registro
  const record = {
    workspace_id: WORKSPACE_ID,
    title: cleanText(taskData.Tarefa),
    description: movimentoMinimo || null,
    status: status,
    priority: priority,
    company_id: companyId,
    minimum_movement: movimentoMinimo || null,
    due_date: parseDate(taskData.Prazo),
    tags: JSON.stringify([dono, tipo].filter(Boolean)),
    effort_hours: effort,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  // Filtrar valores nulos
  Object.keys(record).forEach(key => {
    if (record[key] === null || record[key] === undefined) {
      delete record[key]
    }
  })
  
  return record
}

// Função principal de importação
async function importFromCSV(filePath, sourceName) {
  console.log(`\n📥 Importando ${sourceName}...`)
  console.log('─'.repeat(50))
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const tasks = parseCSV(content)
    
    console.log(`   Total de registros encontrados: ${tasks.length}`)
    
    let imported = 0
    let skipped = 0
    let errors = 0
    
    for (const task of tasks) {
      try {
        const record = await importTask(task)
        
        // Verificar se já existe (por título + workspace)
        const { data: existing } = await supabase
          .from('tasks')
          .select('id')
          .eq('workspace_id', WORKSPACE_ID)
          .eq('title', record.title)
          .limit(1)
        
        if (existing && existing.length > 0) {
          skipped++
          continue
        }
        
        const { error } = await supabase
          .from('tasks')
          .insert(record)
        
        if (error) {
          console.log(`   ⚠️ Erro: ${error.message}`)
          errors++
        } else {
          imported++
        }
      } catch (e) {
        errors++
      }
    }
    
    console.log(`   ✅ Importadas: ${imported}`)
    console.log(`   ⏭️  Puladas (já existiam): ${skipped}`)
    console.log(`   ❌ Erros: ${errors}`)
    
    return { imported, skipped, errors }
  } catch (e) {
    console.log(`   ❌ Erro ao ler arquivo: ${e.message}`)
    return { imported: 0, skipped: 0, errors: 1 }
  }
}

// Main
async function main() {
  console.log('🚀 Iniciando importação de tarefas do Notion')
  console.log('='.repeat(50))
  
  const basePath = path.join(__dirname, '..', 'export-notion-total', 'Particular e Compartilhado')
  
  const results = {
    total: { imported: 0, skipped: 0, errors: 0 }
  }
  
  // 1. Tarefas do LEVAY OS (Erick)
  const levayTasksPath = path.join(basePath, 'SISTEMA → Gabriel Quental', 'Produtos para Clientes', 'LEVAY OS', 'Tarefas 0fc73fa6ae2683e1891381d7ff045495.csv')
  if (fs.existsSync(levayTasksPath)) {
    const r1 = await importFromCSV(levayTasksPath, 'Tarefas LEVAY OS (Erick)')
    results.total.imported += r1.imported
    results.total.skipped += r1.skipped
    results.total.errors += r1.errors
  }
  
  // 2. Minhas Tarefas (Gabriel)
  const minhasTarefasPath = path.join(basePath, 'Minhas Tarefas 5893f8c0e9584827b0049f5dff8ed284_all.csv')
  if (fs.existsSync(minhasTarefasPath)) {
    const r2 = await importFromCSV(minhasTarefasPath, 'Minhas Tarefas (Gabriel)')
    results.total.imported += r2.imported
    results.total.skipped += r2.skipped
    results.total.errors += r2.errors
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMO TOTAL')
  console.log('─'.repeat(50))
  console.log(`   Total importado: ${results.total.imported}`)
  console.log(`   Total pulado: ${results.total.skipped}`)
  console.log(`   Total erros: ${results.total.errors}`)
  console.log('='.repeat(50))
  
  // Mostrar tarefas importadas
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, company_id')
    .eq('workspace_id', WORKSPACE_ID)
    .order('created_at', { ascending: false })
    .limit(10)
  
  console.log('\n📋 Últimas tarefas importadas:')
  tasks?.forEach(t => console.log(`   - ${t.title?.substring(0, 50)}... [${t.status}]`))
}

main().catch(console.error)