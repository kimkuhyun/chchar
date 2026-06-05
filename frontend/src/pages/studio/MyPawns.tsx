import { useNavigate } from 'react-router-dom'
import { Users2, Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../ui/PageHeader'
import Button from '../../ui/Button'
import EmptyState from '../../ui/EmptyState'
import PawnCard from '../../components/PawnCard'
import { useStudio } from '../../store/studio'

export default function MyPawns() {
  const navigate = useNavigate()
  const user = useStudio((s) => s.currentUser)!
  const pawns = useStudio((s) => s.pawns).filter((p) => p.ownerId === user.id)
  const del = useStudio((s) => s.deletePawn)

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="컬렉션"
        icon={Users2}
        title="내 Pawn"
        desc="만든 조립체들 — 씬에 배치하거나 공개로 전환할 수 있어요"
        actions={<Button onClick={() => navigate('/studio/pawn')}><Plus size={15} /> 새 Pawn</Button>}
      />

      {pawns.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pawns.map((p) => (
            <div key={p.id} className="relative">
              <PawnCard pawn={p} onClick={() => navigate(`/studio/pawn/${p.id}`)} />
              <button
                onClick={(e) => { e.stopPropagation(); if (confirm('삭제할까요?')) del(p.id) }}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-[var(--color-faint)] shadow-sm hover:text-[var(--color-danger)]"
                title="삭제"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users2}
          title="아직 Pawn이 없어요"
          desc="라이브러리 파츠로 첫 캐릭터를 조립해 보세요"
          action={<Button onClick={() => navigate('/studio/pawn')}><Plus size={15} /> 새 Pawn</Button>}
        />
      )}
    </div>
  )
}
