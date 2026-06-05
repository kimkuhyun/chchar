import { Heart, Lock, User2 } from 'lucide-react'
import type { Pawn } from '../types'
import PawnCanvas from './PawnCanvas'
import { fmtCount } from '../lib/format'
import { useStudio } from '../store/studio'

export default function PawnCard({
  pawn, onClick, size = 128,
}: {
  pawn: Pawn
  onClick?: () => void
  size?: number
}) {
  const template = useStudio((s) => s.pawnTemplates.find((t) => t.id === pawn.templateId))
  if (!template) return null
  return (
    <button onClick={onClick} className="card card-hover block w-full overflow-hidden p-3 text-left">
      <div className="grid place-items-center rounded-xl bg-[var(--color-surface2)] p-2">
        <PawnCanvas pawn={pawn} template={template} size={size} animate="idle" />
      </div>
      <div className="mt-2.5 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{pawn.name}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--color-faint)]">
            <User2 size={11} /> {pawn.ownerName ?? '익명'}
          </div>
        </div>
        {!pawn.isPublic && (
          <span title="비공개" className="grid h-5 w-5 place-items-center text-[var(--color-faint)]">
            <Lock size={11} />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-dim)]">
        <span className="flex items-center gap-1"><Heart size={11} /> {fmtCount(pawn.likeCount)}</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ background: pawn.bodyColor }} />
          <span className="inline-block h-3 w-3 rounded" style={{ background: pawn.factionColor }} />
        </span>
      </div>
    </button>
  )
}
