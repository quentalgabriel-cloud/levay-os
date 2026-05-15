'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { X, Calendar, Building2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'

interface TaskFormData {
  title: string
  minimum_movement: string
  company_id: string
  due_at: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: string
}

interface Task {
  id: string
  title: string
  minimum_movement?: string
  company_id?: string
  due_at?: string
  priority?: string
  status?: string
}

interface Company {
  id: string
  name: string
  color: string
}

interface TaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: TaskFormData) => Promise<void>
  initialData?: Partial<Task>
  companies: Company[]
  mode: 'create' | 'edit'
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

const dialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.15 }
  }
}

export function TaskDialog({ isOpen, onClose, onSubmit, initialData, companies, mode }: TaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    minimum_movement: initialData?.minimum_movement || '',
    company_id: initialData?.company_id || '',
    due_at: initialData?.due_at ? initialData.due_at.split('T')[0] : '',
    priority: (initialData?.priority as TaskFormData['priority']) || 'medium',
    status: initialData?.status || 'a_fazer'
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { 
      document.body.style.overflow = '' 
      setFormData({
        title: '',
        minimum_movement: '',
        company_id: '',
        due_at: '',
        priority: 'medium',
        status: 'a_fazer'
      })
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.minimum_movement.trim()) return
    
    setIsLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Task submit error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
        >
          <motion.div
            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  mode === 'create' ? 'bg-accent/10 text-accent' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {mode === 'create' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {mode === 'create' ? 'Nova Tarefa' : 'Editar Tarefa'}
                  </h2>
                  <p className="text-xs text-muted">
                    {mode === 'create' ? 'Adicione uma nova tarefa à fila' : 'Atualize os detalhes da tarefa'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Título
                  <span className="text-destructive text-xs">*obrigatório</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted/50"
                  placeholder="O que precisa ser feito?"
                  autoFocus
                />
              </div>

              {/* Minimum Movement */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Próximo Movimento
                  <span className="text-accent text-xs">*obrigatório</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent font-bold">→</span>
                  <input
                    type="text"
                    value={formData.minimum_movement}
                    onChange={(e) => setFormData(p => ({ ...p, minimum_movement: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted/50"
                    placeholder="Ação mínima para avançar"
                  />
                </div>
                <p className="text-xs text-muted">
                  Qual é o menor próximo passo para resolver isso?
                </p>
              </div>

              {/* Company & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted" />
                    Empresa
                  </label>
                  <select
                    value={formData.company_id}
                    onChange={(e) => setFormData(p => ({ ...p, company_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  >
                    <option value="">Selecionar...</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted" />
                    Prazo
                  </label>
                  <input
                    type="date"
                    value={formData.due_at}
                    onChange={(e) => setFormData(p => ({ ...p, due_at: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Prioridade</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high', 'critical'] as const).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, priority }))}
                      className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                        formData.priority === priority
                          ? priority === 'critical' 
                            ? 'border-red-500 bg-red-500/10 text-red-500'
                            : priority === 'high'
                              ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                              : priority === 'medium'
                                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                                : 'border-green-500 bg-green-500/10 text-green-500'
                          : 'border-border text-muted hover:border-foreground/20 hover:text-foreground'
                      }`}
                    >
                      {priority === 'critical' && '🔴'}
                      {priority === 'high' && '🟠'}
                      {priority === 'medium' && '🟡'}
                      {priority === 'low' && '🟢'}
                      <span className="ml-1 capitalize">{priority}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl border border-border hover:bg-foreground/5 transition-colors font-semibold text-muted hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.minimum_movement.trim()}
                  className="px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : mode === 'create' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Criar Tarefa
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}