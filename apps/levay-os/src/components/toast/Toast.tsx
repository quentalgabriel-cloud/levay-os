'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (type: ToastType, message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Return mock functions if not in provider
    return {
      toasts: [],
      addToast: () => {},
      removeToast: () => {}
    }
  }
  return context
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles = {
  success: {
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-500',
    title: 'text-emerald-400'
  },
  error: {
    border: 'border-red-500/50',
    bg: 'bg-red-500/10',
    icon: 'text-red-500',
    title: 'text-red-400'
  },
  info: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    icon: 'text-blue-500',
    title: 'text-blue-400'
  },
  warning: {
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
    icon: 'text-amber-500',
    title: 'text-amber-400'
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(7)
    const newToast: Toast = { id, type, message, duration }
    
    setToasts(prev => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-3 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          const style = styles[toast.type]
          
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md ${style.border} ${style.bg} shadow-lg`}
            >
              <Icon className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{toast.message}</p>
              </div>
              <button
                onClick={() => onRemove(toast.id)}
                className="p-1 rounded hover:bg-foreground/10 text-muted hover:text-foreground transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// Hook exports for easy usage
export const toast = {
  success: (message: string, duration?: number) => {
    // Will be implemented via context
  },
  error: (message: string, duration?: number) => {
  },
  info: (message: string, duration?: number) => {
  },
  warning: (message: string, duration?: number) => {
  }
}