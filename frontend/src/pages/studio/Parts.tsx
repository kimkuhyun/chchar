import { useMemo, useState } from 'react'
import { Images, Search, Sparkles, Trash2, Globe2, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../ui/PageHeader'
import Button from '../../ui/Button'
import EmptyState from '../../ui/EmptyState'
import Toggle from '../../ui/Toggle'
import PartCard from '../../components/PartCard'
import { useStudio } from '../../store/studio'
import { PART_KIND_LABEL, PART_CATEGORY, type PartKind } from '../../types'

type Owner = 'mine' | 'official' | 'community'
type Cat = 'all' | 'character' | 'world'

export default function Parts() {
  const navigate = useNavigate()
  const user = useStudio((s) => s.currentUser)!
  const parts = useStudio((s) => s.parts)
  const setPub = useStudio((s) => s.setPartPublic)
  const delPart = useStudio((s) => s.deletePart)

  const [owner, setOwner] = useState<Owner>('mine')
  const [cat, setCat] = useState<Cat>('all')
  const [kind, setKind] = useState<PartKind | 'all'>('all')
  const [q, setQ] = useState('')

  const visibleKinds = useMemo<PartKind[]>(() => {
    if (cat === 'character') return [...PART_CATEGORY.character]
    if (cat === 'world') return [...PART_CATEGORY.world]
    return [...PART_CATEGORY.character, ...PART_CATEGORY.world]
  }, [cat])

  const items = useMemo(() => {
    return parts.filter((p) => {
      if (owner === 'mine' && p.ownerId !== user.id) return false
      if (owner === 'official' && p.ownerId !== null) return false
      if (owner === 'community' && (p.ownerId === user.id || p.ownerId === null || !p.isPublic)) return false
      if (cat !== 'all' && !visibleKinds.includes(p.kind)) return false
      if (kind !== 'all' && p.kind !== kind) return false
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [parts, owner, cat, kind, q, user.id, visibleKinds])

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="라이브러리"
        icon={Images}
        title="파츠 라이브러리"
        desc="내가 만든 / 공식 / 다른 사용자 공개 파츠를 한 곳에서"
        actions={<Button onClick={() => navigate('/studio/generate')}><Sparkles size={15} /> 파츠 생성</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl border border-[var(--color-line)] bg-white p-1">
          {(['mine', 'official', 'community'] as Owner[]).map((o) => (
            <button key={o} onClick={() => setOwner(o)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${owner === o ? 'bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]' : 'text-[var(--color-dim)]'}`}>
              {o === 'mine' ? '내 파츠' : o === 'official' ? '공식' : '커뮤니티'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-xl border border-[var(--color-line)] bg-white p-1">
          {(['all', 'character', 'world'] as Cat[]).map((c) => (
            <button key={c} onClick={() => { setCat(c); setKind('all') }} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${cat === c ? 'bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]' : 'text-[var(--color-dim)]'}`}>
              {c === 'all' ? '전체' : c === 'character' ? '캐릭터' : '월드'}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-56">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-faint)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름·태그" className="input pl-9" />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        <button onClick={() => setKind('all')} className={`chip ${kind === 'all' ? 'chip-active' : ''}`}>전체 slot</button>
        {visibleKinds.map((k) => (
          <button key={k} onClick={() => setKind(k)} className={`chip ${kind === k ? 'chip-active' : ''}`}>{PART_KIND_LABEL[k]}</button>
        ))}
      </div>

      {items.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((p) => (
            <PartCard
              key={p.id}
              part={p}
              action={owner === 'mine' && (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <label className="flex items-center gap-1.5">
                    {p.isPublic ? <Globe2 size={12} className="text-[var(--color-success)]" /> : <Lock size={12} className="text-[var(--color-faint)]" />}
                    <span className="text-[var(--color-dim)]">공개</span>
                    <Toggle checked={p.isPublic} onChange={(v) => setPub(p.id, v)} />
                  </label>
                  <button onClick={() => { if (confirm('삭제하시겠어요?')) delPart(p.id) }} className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-faint)] hover:bg-[var(--color-surface2)] hover:text-[var(--color-danger)]">
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Images}
          title={owner === 'mine' ? '아직 만든 파츠가 없어요' : '조건에 맞는 파츠가 없어요'}
          desc={owner === 'mine' ? '파츠 생성 화면으로 가서 첫 파츠를 만들어 보세요' : undefined}
          action={owner === 'mine' && <Button onClick={() => navigate('/studio/generate')}><Sparkles size={15} /> 파츠 생성</Button>}
        />
      )}
    </div>
  )
}
