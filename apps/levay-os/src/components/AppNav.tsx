'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutGrid, 
  CheckSquare, 
  FolderKanban, 
  Scale, 
  Building2, 
  Users, 
  TrendingUp,
  Hexagon,
  Bell,
  Settings,
  Kanban,
  GitCommit
} from 'lucide-react'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import { CommandPalette } from '@/components/overlays/CommandPalette'

const nav = [
  { href: '/mesa', label: 'Mesa', icon: LayoutGrid },
  { href: '/tarefas', label: 'Tarefas', icon: CheckSquare },
  { href: '/kanban', label: 'Kanban', icon: Kanban },
  { href: '/projetos', label: 'Projetos', icon: FolderKanban },
  { href: '/decisoes', label: 'Decisões', icon: Scale },
  { href: '/timeline', label: 'Timeline', icon: GitCommit },
  { href: '/empresas', label: 'Empresas', icon: Building2 },
  { href: '/bica-amp', label: 'Bica+AMP', icon: Building2 },
  { href: '/crm/sollu', label: 'Sollu', icon: TrendingUp },
  { href: '/colaboradores', label: 'Pessoas', icon: Users },
  { href: '/equipe', label: 'Equipe', icon: Users },
  { href: '/executive', label: 'CEO', icon: TrendingUp },
]

export default function AppNav() {
  const pathname = usePathname()
  const router = useRouter()

  const commandItems = [
    {
      id: 'goto-mesa',
      title: 'Mesa',
      description: 'Ir para a mesa de trabalho',
      icon: LayoutGrid,
      action: () => router.push('/mesa'),
      category: 'navigation' as const,
      keywords: ['home', 'dashboard']
    },
    {
      id: 'goto-tarefas',
      title: 'Tarefas',
      description: 'Ver todas as tarefas',
      icon: CheckSquare,
      action: () => router.push('/tarefas'),
      category: 'navigation' as const,
      keywords: ['tasks', 'to-do']
    },
    {
      id: 'goto-kanban',
      title: 'Kanban',
      description: 'Visualização em quadros',
      icon: Kanban,
      action: () => router.push('/kanban'),
      category: 'navigation' as const,
      keywords: ['board', 'drag', 'drop']
    },
    {
      id: 'goto-projetos',
      title: 'Projetos',
      description: 'Navegar projetos',
      icon: FolderKanban,
      action: () => router.push('/projetos'),
      category: 'navigation' as const
    },
    {
      id: 'goto-decisoes',
      title: 'Decisões',
      description: 'Ver decisões',
      icon: Scale,
      action: () => router.push('/decisoes'),
      category: 'navigation' as const
    },
    {
      id: 'goto-timeline',
      title: 'Timeline',
      description: 'Linha do tempo de decisões',
      icon: GitCommit,
      action: () => router.push('/timeline'),
      category: 'navigation' as const,
      keywords: ['history', 'chronology']
    },
    {
      id: 'goto-empresas',
      title: 'Empresas',
      description: 'Gerenciar empresas',
      icon: Building2,
      action: () => router.push('/empresas'),
      category: 'navigation' as const
    },
    {
      id: 'goto-equipe',
      title: 'Equipe',
      description: 'Ver equipe',
      icon: Users,
      action: () => router.push('/equipe'),
      category: 'navigation' as const
    },
    {
      id: 'goto-executive',
      title: 'CEO',
      description: 'Painel executivo',
      icon: TrendingUp,
      action: () => router.push('/executive'),
      category: 'navigation' as const
    },
  ]

  return (
    <div className="flex items-center gap-4">
      <Link href="/mesa" className="flex items-center gap-2 text-foreground font-bold tracking-tight text-sm hover:text-accent transition-colors">
        <Hexagon className="w-5 h-5 text-accent" />
        <span className="hidden lg:inline">Levay OS</span>
      </Link>
      
      {/* Command Palette - só mostra em telas maiores */}
      <div className="hidden md:block">
        <CommandPalette items={commandItems} />
      </div>
      
      <nav className="hidden xl:flex items-center gap-1">
        {nav.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                isActive
                  ? 'bg-accent text-[var(--accent-foreground)] shadow-lg shadow-accent/40 scale-105'
                  : 'text-muted hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-[var(--accent-foreground)]' : ''}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      
      <div className="flex items-center gap-2 ml-auto">
        {/* Mobile Command Palette */}
        <button className="md:hidden p-2 rounded-lg hover:bg-foreground/5 text-muted">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        
        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        
        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="hidden md:block ml-2 pl-4 border-l border-border">
          <WorkspaceSwitcher />
        </div>
      </div>
    </div>
  )
}