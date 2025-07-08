import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
  className?: string
}

const Toaster: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  onClose, 
  className 
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000) // Auto close after 5 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 flex items-center justify-between min-w-[300px] max-w-[500px] p-4 rounded-lg shadow-lg border animate-in slide-in-from-top-2"
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`
    }
  }

  return (
    <div className={cn(getToastStyles(), className)}>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 p-1 rounded-md hover:bg-black/5 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export { Toaster, type ToastProps }
