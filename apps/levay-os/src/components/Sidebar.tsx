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
  GitCommit,
  ShoppingCart,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useUI } from '@/hooks/use-app-store'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import { CommandPalette } from '@/components/overlays/CommandPalette'

const navGroups = [
  {
    label: undefined as string | undefined,
    items: [
      { href: '/mesa', label: 'Mesa', icon: LayoutGrid },
    ],
  },
  {
    label: 'Trabalho' as string | undefined,
    items: [
      { href: '/tarefas', label: 'Tarefas', icon: CheckSquare },
      { href: '/kanban', label: 'Kanban', icon: Kanban },
      { href: '/projetos', label: 'Projetos', icon: FolderKanban },
      { href: '/decisoes', label: 'Decisões', icon: Scale },
      { href: '/timeline', label: 'Timeline', icon: GitCommit },
    ],
  },
  {
    label: 'Empresas' as string | undefined,
    items: [
      { href: '/empresas', label: 'Empresas', icon: Building2 },
      { href: '/bica-amp', label: 'Bica+AMP', icon: Building2 },
      { href: '/crm/sollu', label: 'Sollu CRM', icon: TrendingUp },
      { href: '/compras', label: 'Compras', icon: ShoppingCart },
    ],
  },
  {
    label: 'Pessoas' as string | undefined,
    items: [
      { href: '/colaboradores', label: 'Colaboradores', icon: Users },
      { href: '/equipe', label: 'Equipe', icon: Users },
    ],
  },
  {
    label: 'Analytics' as string | undefined,
    items: [
      { href: '/executive', label: 'CEO Dashboard', icon: TrendingUp },
    ],
  },
  {
    label: 'Sistema' as string | undefined,
    items: [
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar } = useUI()

  const allNavItems = navGroups.flatMap(g => g.items)

  const commandItems = allNavItems.map(item => ({
    id: `goto-${item.href.replace(/\//g, '')}`,
    title: item.label,
    description: `Ir para ${item.label}`,
    icon: item.icon,
    action: () => router.push(item.href),
    category: 'navigation' as const,
  }))

  return (
    <aside
      className={`
        flex flex-col border-r border-border bg-card/90 backdrop-blur-md
        transition-[width] duration-300 ease-in-out shrink-0 h-screen sticky top-0 z-40
        ${sidebarCollapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Topo: logo + toggle */}
      <div
        className={`h-14 flex items-center border-b border-border shrink-0 px-3 ${
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!sidebarCollapsed && (
          <Link
            href="/mesa"
            className="flex items-center gap-2 text-foreground font-bold tracking-tight text-sm hover:text-accent transition-colors"
          >
            <Hexagon className="w-5 h-5 text-accent shrink-0" />
            <span>Levay OS</span>
          </Link>
        )}
        {sidebarCollapsed && (
          <Link href="/mesa" className="text-accent" aria-label="Mesa">
            <Hexagon className="w-5 h-5" />
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors shrink-0"
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {sidebarCollapsed
            ? <PanelLeftOpen className="w-4 h-4" />
            : <PanelLeftClose className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Command palette — apenas no modo expandido */}
      {!sidebarCollapsed && (
        <div className="px-3 pt-3 pb-1">
          <CommandPalette items={commandItems} />
        </div>
      )}

      {/* Itens de navegação agrupados */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {navGroups.map((group, gi) => (
          <div key={gi} className="space-y-0.5">
            {/* Label de seção — só no modo expandido */}
            {group.label && !sidebarCollapsed && (
              <p className="px-3 pb-1 text-[8px] font-black uppercase tracking-[0.2em] text-muted/60 select-none">
                {group.label}
              </p>
            )}
            {/* Separador no modo colapsado */}
            {group.label && sidebarCollapsed && gi > 0 && (
              <div className="mx-3 border-t border-border/50 mb-1" />
            )}
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-semibold tracking-wide
                    transition-all duration-200
                    ${isActive
                      ? 'bg-accent text-[var(--accent-foreground)] shadow-sm shadow-accent/20'
                      : 'text-muted hover:text-foreground hover:bg-foreground/5'
                    }
                    ${sidebarCollapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Rodapé: workspace + ações utilitárias */}
      <div className="border-t border-border p-3 space-y-2 shrink-0">
        {!sidebarCollapsed && <WorkspaceSwitcher />}
        <div
          className={`flex gap-1 ${
            sidebarCollapsed ? 'flex-col items-center' : 'items-center'
          }`}
        >
          <button
            className="p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors"
            aria-label="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
