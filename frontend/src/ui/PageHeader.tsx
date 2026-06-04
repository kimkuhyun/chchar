import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export default function PageHeader({
  title,
  eyebrow,
  icon: Icon,
  desc,
  actions,
}: {
  title: string
  eyebrow?: string
  icon?: LucideIcon
  desc?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)]">
            {Icon && <Icon size={15} />} {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-bold md:text-[28px]">{title}</h1>
        {desc && <p className="mt-1.5 max-w-xl text-sm text-[var(--color-dim)]">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
