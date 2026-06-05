import { useState, useMemo } from 'react'
import { Sparkles, Search } from 'lucide-react'
import PageHeader from '../../ui/PageHeader'
import PartCard from '../../components/PartCard'
import { useStudio } from '../../store/studio'
import { PART_KIND_LABEL, PART_CATEGORY, type PartKind } from '../../types'

type Cat = 'all' | 'character' | 'world'

export default function ExploreParts() {
  const parts = useStudio((s) => s.parts)
  const [cat, setCat] = useState<Cat>('all')
  const [kind, setKind] = useState<PartKind | 'all'>('all')
  const [q, setQ] = useState('')

  const visibleKinds: PartKind[] = useMemo(() => {
    if (cat === 'character') return [...PART_CATEGORY.character]
    if (cat === 'world') return [...PART_CATEGORY.world]
    return [...PART_CATEGORY.character, ...PART_CATEGORY.world]
  }, [cat])

  const items = useMemo(() => {
    return parts.filter((p) => {
      if (!p.isPublic && p.ownerId !== null) return false
      if (kind !== 'all' && p.kind !== kind) return false
      if (cat !== 'all' && !visibleKinds.includes(p.kind)) return false
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [parts, kind, cat, q, visibleKinds])

  return (
    <>
      <PageHeader
        eyebrow="공개 파츠"
        icon={Sparkles}
        title="파츠 탐색"
        desc="공식 + 다른 사용자가 공개한 파츠 라이브러리"
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl border border-[var(--color-line)] bg-white p-1">
          {(['all', 'character', 'world'] as Cat[]).map((c) => (
            <button
              key={c}
              onClick={() => { setCat(c); setKind('all') }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${cat === c ? 'bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]' : 'text-[var(--color-dim)]'}`}
            >
              {c === 'all' ? '전체' : c === 'character' ? '캐릭터 슬롯' : '월드'}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-faint)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름·키워드" className="input pl-9" />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        <button onClick={() => setKind('all')} className={`chip ${kind === 'all' ? 'chip-active' : ''}`}>전체 slot</button>
        {visibleKinds.map((k) => (
          <button key={k} onClick={() => setKind(k)} className={`chip ${kind === k ? 'chip-active' : ''}`}>
            {PART_KIND_LABEL[k]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((p) => <PartCard key={p.id} part={p} />)}
      </div>
    </>
  )
}
