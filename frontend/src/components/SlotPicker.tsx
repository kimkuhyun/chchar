import { useState } from 'react'
import { Search, X, Check } from 'lucide-react'
import type { AssetPart, PartKind } from '../types'
import { PART_KIND_LABEL } from '../types'

interface Props {
  slot: PartKind
  current?: number | null
  parts: AssetPart[]
  onPick: (partId: number | null) => void
}

export default function SlotPicker({ slot, current, parts, onPick }: Props) {
  const [q, setQ] = useState('')
  const filtered = parts
    .filter((p) => p.kind === slot)
    .filter((p) => (q ? p.name.toLowerCase().includes(q.toLowerCase()) : true))

  return (
    <div className="card p-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="text-sm font-semibold">{PART_KIND_LABEL[slot]}</div>
        <span className="text-xs text-[var(--color-faint)]">{filtered.length}개</span>
        <div className="relative ml-auto w-40">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-faint)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="검색"
            className="input pl-7 text-xs"
            style={{ padding: '5px 8px 5px 26px' }}
          />
        </div>
        {current != null && (
          <button
            onClick={() => onPick(null)}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-faint)] hover:bg-[var(--color-surface2)] hover:text-[var(--color-danger)]"
            title="이 슬롯 비우기"
          >
            <X size={13} />
          </button>
        )}
      </div>
      <div className="grid max-h-44 grid-cols-5 gap-1.5 overflow-y-auto">
        {filtered.map((p) => {
          const sel = current === p.id
          return (
            <button
              key={p.id}
              onClick={() => onPick(p.id)}
              title={p.name}
              className={`relative grid aspect-square place-items-center rounded-lg border transition ${sel ? 'border-[var(--color-primary)] ring-2 ring-[rgba(109,94,252,0.25)]' : 'border-[var(--color-line)] hover:border-[var(--color-line2)]'}`}
              style={{ background: 'var(--color-surface2)' }}
            >
              <img src={p.thumbnailUrl} alt={p.name} className="h-10 w-10" />
              {sel && (
                <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-[var(--color-primary)] text-white">
                  <Check size={10} />
                </span>
              )}
            </button>
          )
        })}
        {!filtered.length && (
          <div className="col-span-5 grid h-20 place-items-center rounded-lg border border-dashed border-[var(--color-line2)] text-xs text-[var(--color-faint)]">
            맞는 파츠가 없어요
          </div>
        )}
      </div>
    </div>
  )
}
