'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  ArrowRight, 
  Plus, 
  LayoutGrid, 
  CheckSquare, 
  FolderKanban, 
  Scale, 
  Building2, 
  Users, 
  TrendingUp,
  Calendar,
  Clock,
  Bell,
  Settings,
  Command,
  X,
  Hash
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: typeof Search
  action: () => void
  shortcut?: string[]
  category: 'navigation' | 'action' | 'recent'
  keywords?: string[]
}

interface CommandPaletteProps {
  items?: CommandItem[]
}

const defaultCommands: CommandItem[] = [
  {
    id: 'goto-mesa',
    title: 'Mesa',
    description: 'Ir para a mesa de trabalho',
    icon: LayoutGrid,
    action: () => {},
    category: 'navigation',
    keywords: ['home', 'dashboard', 'início']
  },
  {
    id: 'goto-tarefas',
    title: 'Tarefas',
    description: 'Ver todas as tarefas',
    icon: CheckSquare,
    action: () => {},
    category: 'navigation',
    keywords: ['tasks', 'to-do', 'ações']
  },
  {
    id: 'goto-projetos',
    title: 'Projetos',
    description: 'Navegar projetos',
    icon: FolderKanban,
    action: () => {},
    category: 'navigation',
    keywords: ['projects']
  },
  {
    id: 'goto-decisoes',
    title: 'Decisões',
    description: 'Ver decisões',
    icon: Scale,
    action: () => {},
    category: 'navigation',
    keywords: ['decisions', 'decisions']
  },
  {
    id: 'goto-empresas',
    title: 'Empresas',
    description: 'Gerenciar empresas',
    icon: Building2,
    action: () => {},
    category: 'navigation',
    keywords: ['companies', 'firms']
  },
  {
    id: 'goto-equipe',
    title: 'Equipe',
    description: 'Ver equipe',
    icon: Users,
    action: () => {},
    category: 'navigation',
    keywords: ['team', 'members']
  },
  {
    id: 'goto-executive',
    title: 'CEO',
    description: 'Painel executivo',
    icon: TrendingUp,
    action: () => {},
    category: 'navigation',
    keywords: ['executive', 'dashboard']
  },
  {
    id: 'action-new-task',
    title: 'Nova Tarefa',
    description: 'Criar uma nova tarefa',
    icon: Plus,
    action: () => {},
    shortcut: ['n', 't'],
    category: 'action',
    keywords: ['create', 'adicionar']
  },
]

export function CommandPalette({ items = defaultCommands }: CommandPaletteProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return items

    const lowerQuery = query.toLowerCase()
    return items.filter(cmd => 
      cmd.title.toLowerCase().includes(lowerQuery) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(lowerQuery)) ||
      cmd.description?.toLowerCase().includes(lowerQuery)
    )
  }, [query, items])

  // Handle keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle keyboard navigation when open
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            setOpen(false)
            setQuery('')
          }
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, filteredCommands])

  const handleSelect = useCallback((command: CommandItem) => {
    command.action()
    setOpen(false)
    setQuery('')
  }, [])

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = []
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredCommands])

  const categoryLabels: Record<string, string> = {
    navigation: 'Navegação',
    action: 'Ações',
    recent: 'Recentes'
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted bg-card/50 border border-border rounded-lg hover:border-foreground/20 hover:text-foreground transition-all"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-foreground/5 rounded border border-border">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />
            
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl z-50"
            >
              <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                  <Search className="w-5 h-5 text-muted flex-shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar comandos, páginas, ações..."
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none text-lg"
                    autoFocus
                  />
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1 rounded hover:bg-foreground/5 text-muted"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto p-2">
                  {filteredCommands.length === 0 ? (
                    <div className="py-12 text-center text-muted">
                      <p>Nenhum resultado encontrado</p>
                      <p className="text-sm mt-1">Tente buscar por outros termos</p>
                    </div>
                  ) : (
                    Object.entries(groupedCommands).map(([category, commands]) => (
                      <div key={category} className="mb-2">
                        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted/60">
                          {categoryLabels[category] || category}
                        </div>
                        {commands.map((cmd, i) => {
                          const globalIndex = filteredCommands.indexOf(cmd)
                          const Icon = cmd.icon
                          const isSelected = globalIndex === selectedIndex
                          
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => handleSelect(cmd)}
                              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                                isSelected 
                                  ? 'bg-accent/10 text-accent' 
                                  : 'text-foreground hover:bg-foreground/5'
                              }`}
                            >
                              <div className={`p-2 rounded-lg ${
                                isSelected ? 'bg-accent/20' : 'bg-foreground/5'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium">{cmd.title}</p>
                                {cmd.description && (
                                  <p className={`text-sm ${isSelected ? 'text-accent/70' : 'text-muted'}`}>
                                    {cmd.description}
                                  </p>
                                )}
                              </div>
                              {cmd.shortcut && (
                                <div className="flex gap-1">
                                  {cmd.shortcut.map((key, i) => (
                                    <kbd 
                                      key={i}
                                      className="px-2 py-1 text-xs bg-foreground/5 rounded border border-border"
                                    >
                                      {key}
                                    </kbd>
                                  ))}
                                </div>
                              )}
                              <ArrowRight className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                            </button>
                          )
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-foreground/[0.02]">
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-foreground/5 rounded border border-border">↑</kbd>
                      <kbd className="px-1.5 py-0.5 bg-foreground/5 rounded border border-border">↓</kbd>
                      <span>Navegar</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-foreground/5 rounded border border-border">↵</kbd>
                      <span>Selecionar</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-foreground/5 rounded border border-border">esc</kbd>
                      <span>Fechar</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Hook for easy access
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return { isOpen, setIsOpen }
}