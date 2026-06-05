import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import PageHeader from '../../ui/PageHeader'
import PawnCard from '../../components/PawnCard'
import { useStudio } from '../../store/studio'

type Sort = 'hot' | 'new'

export default function ExplorePawns() {
  const navigate = useNavigate()
  const pawns = useStudio((s) => s.pawns).filter((p) => p.isPublic)
  const [sort, setSort] = useState<Sort>('hot')

  const sorted = [...pawns].sort((a, b) =>
    sort === 'hot' ? b.likeCount - a.likeCount : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <>
      <PageHeader
        eyebrow="공개 Pawn"
        icon={Compass}
        title="Pawn 탐색"
        desc="다른 제작자들이 공개한 paper-doll 캐릭터들"
        actions={
          <div className="flex gap-1 rounded-xl border border-[var(--color-line)] bg-white p-1">
            <button onClick={() => setSort('hot')} className={`rounded-lg px-3 py-1 text-sm font-medium ${sort === 'hot' ? 'bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]' : 'text-[var(--color-dim)]'}`}>인기순</button>
            <button onClick={() => setSort('new')} className={`rounded-lg px-3 py-1 text-sm font-medium ${sort === 'new' ? 'bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]' : 'text-[var(--color-dim)]'}`}>최신순</button>
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {sorted.map((p) => (
          <PawnCard key={p.id} pawn={p} size={132} onClick={() => navigate(`/pawn/${p.id}`)} />
        ))}
      </div>
    </>
  )
}
