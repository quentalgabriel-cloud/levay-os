'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Calendar, 
  Phone, 
  Mail, 
  MessageCircle,
  FileText,
  Plus,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit
} from 'lucide-react'
import Link from 'next/link'

interface Collaborator {
  id: string
  name: string
  email: string | null
  whatsapp: string | null
  default_company_id: string | null
  active: boolean
  created_at: string
  profile_data?: {
    role?: string
    position?: string
    contract_type?: string
    strengths?: string
    specialty?: string
    impact_phrase?: string
    evaluation_status?: string
  } | null
}

interface Company {
  id: string
  name: string
  slug: string
}

interface Task {
  id: string
  title: string
  status: string
  due_at: string | null
}

const STATUS_LABELS: Record<string, string> = {
  'a_fazer': 'A fazer',
  'em_andamento': 'Em andamento',
  'aguardando': 'Aguardando',
  'standby': 'Standby',
  'fechando_ciclo': 'Fechar ciclo',
  'cancelado': 'Cancelado',
}

export default function ColaboradorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) loadData()
  }, [params.id])

  async function loadData() {
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    if (!id) return

    const [collabRes, companyRes] = await Promise.all([
      supabase.from('collaborators').select('*').eq('id', id).single(),
      supabase.from('companies').select('id, name, slug')
    ])

    if (collabRes.data) {
      const d = collabRes.data
      setCollaborator({
        id: d.id,
        name: d.name,
        email: d.email,
        whatsapp: d.whatsapp,
        default_company_id: d.default_company_id,
        active: d.active,
        created_at: d.created_at,
        profile_data: d.profile_data as Collaborator['profile_data'],
      })
    }
    setCompanies(companyRes.data || [])

    const tasksRes = await supabase
      .from('tasks')
      .select('id, title, status, due_at')
      .eq('owner_collaborator_id', id)
      .order('due_at', { ascending: true })
      .limit(10)
    
    setTasks(tasksRes.data || [])
    setLoading(false)
  }

  function getCompanyName(companyId: string | null) {
    if (!companyId) return null
    const company = companies.find(c => c.id === companyId)
    return company?.name || null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full" />
      </div>
    )
  }

  if (!collaborator) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-500">Colaborador não encontrado</p>
        <Link href="/colaboradores" className="text-purple-600 hover:underline mt-2 inline-block">
          Voltar para lista
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link 
        href="/colaboradores" 
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para lista
      </Link>

      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          <User className="w-12 h-12" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{collaborator.name}</h1>
            <span className={`px-3 py-1 text-sm rounded-full ${
              collaborator.active 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              {collaborator.active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          
          {collaborator.profile_data?.role && (
            <p className="text-gray-500 mt-1">{collaborator.profile_data.role}</p>
          )}

          {collaborator.profile_data?.impact_phrase && (
            <p className="text-sm text-gray-400 mt-3 italic">
              "{collaborator.profile_data.impact_phrase}"
            </p>
          )}

          <div className="flex gap-2 mt-4">
            {collaborator.email && (
              <a href={`mailto:${collaborator.email}`} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                <Mail className="w-4 h-4 text-gray-600" />
              </a>
            )}
            {collaborator.whatsapp && (
              <a href={`https://wa.me/${collaborator.whatsapp}`} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                <MessageCircle className="w-4 h-4 text-gray-600" />
              </a>
            )}
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Pessoais */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase">Email</p>
                <p className="text-gray-700">{collaborator.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">WhatsApp</p>
                <p className="text-gray-700">{collaborator.whatsapp || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Empresa Principal</p>
                <p className="text-gray-700">{getCompanyName(collaborator.default_company_id) || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Tipo de vínculo</p>
                <p className="text-gray-700">{collaborator.profile_data?.contract_type || '—'}</p>
              </div>
            </div>
          </div>

          {/* Dados Funcionais */}
          {collaborator.profile_data?.strengths && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Forças & Especialidades</h3>
              <div className="space-y-3">
                {collaborator.profile_data.strengths && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Forças</p>
                    <p className="text-gray-700">{collaborator.profile_data.strengths}</p>
                  </div>
                )}
                {collaborator.profile_data.specialty && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Especialidade</p>
                    <p className="text-gray-700">{collaborator.profile_data.specialty}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tarefas */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Tarefas</h3>
              <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'em_andamento' ? 'bg-blue-500' :
                        task.status === 'a_fazer' ? 'bg-gray-400' :
                        'bg-green-500'
                      }`} />
                      <span className="text-gray-700">{task.title}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {STATUS_LABELS[task.status] || task.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">
                Nenhuma tarefa atribuída
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Cadastrado em</span>
                <span className="text-gray-700">
                  {new Date(collaborator.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Avaliação</span>
                <span className={`px-2 py-1 text-xs rounded ${
                  collaborator.profile_data?.evaluation_status === 'positivo' 
                    ? 'bg-green-100 text-green-700'
                    : collaborator.profile_data?.evaluation_status === 'atenção'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {collaborator.profile_data?.evaluation_status || 'Sem avaliação'}
                </span>
              </div>
            </div>
          </div>

          {/* Anotações */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Anotações</h3>
              <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Nova
              </button>
            </div>
            <p className="text-gray-400 text-sm text-center py-4">
              Nenhuma anotação ainda
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
            <h3 className="font-semibold text-purple-900 mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded-lg">
                + Nova tarefa para {collaborator.name.split(' ')[0]}
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded-lg">
                + Adicionar a outra empresa
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded-lg">
                + Fazer anotação
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}