import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  width = 460,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  width?: number
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 grid place-items-center bg-[rgba(20,24,50,0.4)] p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.94, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 16, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="card w-full p-6"
            style={{ maxWidth: width }}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">{title}</h3>
                <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-dim)] hover:bg-[var(--color-surface2)]">
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
