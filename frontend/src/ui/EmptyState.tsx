import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export default function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: LucideIcon
  title: string
  desc?: string
  action?: ReactNode
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-[var(--color-line2)] bg-[var(--color-surface2)] px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-[var(--color-faint)] shadow-sm">
        <Icon size={26} />
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      {desc && <p className="mt-1 max-w-sm text-sm text-[var(--color-dim)]">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
