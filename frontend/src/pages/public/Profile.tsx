import { Link, useNavigate, useParams } from 'react-router-dom'
import { User as UserIcon } from 'lucide-react'
import Avatar from '../../ui/Avatar'
import EmptyState from '../../ui/EmptyState'
import Button from '../../ui/Button'
import PawnCard from '../../components/PawnCard'
import SceneCard from '../../components/SceneCard'
import PartCard from '../../components/PartCard'
import { useStudio } from '../../store/studio'

export default function Profile() {
  const { handle } = useParams()
  const navigate = useNavigate()
  const users = useStudio((s) => s.users)
  const parts = useStudio((s) => s.parts)
  const pawns = useStudio((s) => s.pawns)
  const scenes = useStudio((s) => s.scenes)

  const user = users.find((u) => u.handle === handle)
  if (!user) {
    return <EmptyState icon={UserIcon} title="사용자를 찾을 수 없어요" action={<Link to="/"><Button>홈으로</Button></Link>} />
  }
  const myParts = parts.filter((p) => p.ownerId === user.id && p.isPublic)
  const myPawns = pawns.filter((p) => p.ownerId === user.id && p.isPublic)
  const myScenes = scenes.filter((s) => s.ownerId === user.id && s.isPublic)

  return (
    <div>
      <div className="card mb-8 flex items-center gap-5 p-6">
        <Avatar name={user.displayName} src={user.avatarUrl} size={72} />
        <div>
          <h1 className="text-2xl font-bold">{user.displayName}</h1>
          <div className="text-sm text-[var(--color-dim)]">@{user.handle}</div>
          <div className="mt-2 flex gap-3 text-xs text-[var(--color-dim)]">
            <span><b className="text-[var(--color-ink)]">{myPawns.length}</b> Pawn</span>
            <span><b className="text-[var(--color-ink)]">{myParts.length}</b> 파츠</span>
            <span><b className="text-[var(--color-ink)]">{myScenes.length}</b> 씬</span>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold">공개 Pawn</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {myPawns.map((p) => <PawnCard key={p.id} pawn={p} onClick={() => navigate(`/pawn/${p.id}`)} />)}
          {!myPawns.length && <p className="text-sm text-[var(--color-faint)]">아직 없음</p>}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold">공개 씬</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myScenes.map((s) => <SceneCard key={s.id} scene={s} onClick={() => navigate(`/scene/${s.id}`)} />)}
          {!myScenes.length && <p className="text-sm text-[var(--color-faint)]">아직 없음</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">공개 파츠</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {myParts.map((p) => <PartCard key={p.id} part={p} />)}
          {!myParts.length && <p className="text-sm text-[var(--color-faint)]">아직 없음</p>}
        </div>
      </section>
    </div>
  )
}
