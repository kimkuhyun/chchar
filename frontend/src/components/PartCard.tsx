import { Heart, Lock } from 'lucide-react'
import type { AssetPart } from '../types'
import { PART_KIND_LABEL } from '../types'
import Badge from '../ui/Badge'
import { fmtCount } from '../lib/format'

export default function PartCard({
  part, onClick, action,
}: {
  part: AssetPart
  onClick?: () => void
  action?: React.ReactNode
}) {
  return (
    <div className="card card-hover overflow-hidden">
      <button onClick={onClick} className="block w-full p-4 text-left">
        <div className="grid aspect-square place-items-center rounded-xl bg-[var(--color-surface2)]">
          <img src={part.thumbnailUrl} alt={part.name} className="h-20 w-20" />
        </div>
        <div className="mt-3 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{part.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--color-faint)]">
              <span>{PART_KIND_LABEL[part.kind]}</span>
              <span>·</span>
              <span className="truncate">{part.ownerName ?? '공식'}</span>
            </div>
          </div>
          {!part.isPublic && (
            <span title="비공개" className="grid h-5 w-5 place-items-center rounded text-[var(--color-faint)]">
              <Lock size={11} />
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-dim)]">
          <span className="flex items-center gap-1"><Heart size={11} /> {fmtCount(part.likeCount)}</span>
          {part.ownerId == null && <Badge color="#15c2e8">공식</Badge>}
        </div>
      </button>
      {action && <div className="border-t border-[var(--color-line)] px-3 py-2">{action}</div>}
    </div>
  )
}
