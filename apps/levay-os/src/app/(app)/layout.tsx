import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getWorkspaceContext } from '@/lib/tenant-context'
import Sidebar from '@/components/Sidebar'
import NewTaskButton from '@/components/NewTaskButton'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { workspaceId } = await getWorkspaceContext(supabase)

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, color, slug')
    .eq('workspace_id', workspaceId)
    .order('name')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-14 border-b border-border flex items-center justify-end px-6 bg-card/80 backdrop-blur-md shrink-0 z-30">
          <NewTaskButton companies={companies ?? []} />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}