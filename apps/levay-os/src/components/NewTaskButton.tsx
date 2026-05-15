'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { TaskDialog } from '@/components/dialogs/TaskDialog'

interface Props {
  companies: { id: string; name: string; color: string | null }[]
}

interface TaskFormData {
  title: string
  minimum_movement: string
  company_id: string
  due_at: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: string
}

export default function NewTaskButton({ companies }: Props) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (task: TaskFormData) => {
    // Server action would be called here
    // await createTaskAction(task)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-accent hover:opacity-90 text-white text-sm px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-accent hover:shadow-lg active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" />
        Tarefa
      </button>
      <TaskDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        companies={companies.map(c => ({ ...c, color: c.color ?? '#6b7280' }))}
        mode="create"
      />
    </>
  )
}
