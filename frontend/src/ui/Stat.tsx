import type { LucideIcon } from 'lucide-react'
import Card from './Card'

export default function Stat({
  icon: Icon,
  label,
  value,
  accent = '#6d5efc',
}: {
  icon: LucideIcon
  label: string
  value: string | number
  accent?: string
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
        style={{ background: `${accent}18`, color: accent }}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold leading-tight">{value}</div>
        <div className="truncate text-[13px] text-[var(--color-dim)]">{label}</div>
      </div>
    </Card>
  )
}
