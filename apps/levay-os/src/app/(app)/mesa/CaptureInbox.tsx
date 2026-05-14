import { createClient } from '@/lib/supabase/server'

export default async function CaptureInbox() {
  const supabase = await createClient()
  const { data: captures } = await supabase
    .from('captures')
    .select('*')
    .is('processed_at', null)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!captures?.length) return null

  return (
    <div className="bg-card border border-border rounded-[2rem] shadow-sm shadow-black/5 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-foreground/[0.02]">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Capturas para processar</h2>
        <span className="text-[10px] font-black text-white bg-accent px-2.5 py-1 rounded-full shadow-lg shadow-accent/40">
          {captures.length}
        </span>
      </div>
      <div className="divide-y divide-border">
        {captures.map((c) => (
          <div key={c.id} className="group px-6 py-4 flex items-start gap-4 hover:bg-foreground/[0.03] transition-all cursor-pointer">
            <span className="text-[10px] font-black text-muted flex-shrink-0 mt-1 uppercase tracking-tighter">
              {new Date(c.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <p className="text-sm font-medium text-foreground flex-1 group-hover:text-accent transition-colors line-clamp-2">{c.raw_text ?? c.transcript}</p>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">{c.source}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
