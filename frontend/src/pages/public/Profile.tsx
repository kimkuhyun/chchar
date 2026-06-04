import { useParams, useNavigate } from 'react-router-dom'
import { Gamepad2, Images } from 'lucide-react'
import { useStudio } from '../../store/studio'
import Avatar from '../../ui/Avatar'
import Badge from '../../ui/Badge'
import LevelCard from '../../components/LevelCard'
import AssetCard from '../../components/AssetCard'
import EmptyState from '../../ui/EmptyState'

export default function Profile() {
  const { handle } = useParams()
  const navigate = useNavigate()
  const users = useStudio((s) => s.users)
  const levels = useStudio((s) => s.levels)
  const assets = useStudio((s) => s.assets)

  const user = users.find((u) => u.handle === handle)
  if (!user) {
    return <EmptyState icon={Gamepad2} title="프로필을 찾을 수 없어요" desc={`@${handle}`} />
  }
  const myLevels = levels.filter((l) => l.ownerId === user.id && l.visibility === 'public')
  const myAssets = assets.filter((a) => a.ownerId === user.id && a.isPublic)

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Avatar name={user.displayName} src={user.avatarUrl} size={72} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold">{user.displayName}</h1>
            <Badge color={user.plan === 'pro' ? '#6d5efc' : undefined}>{user.plan === 'pro' ? 'Pro' : 'Free'}</Badge>
          </div>
          <div className="text-sm text-[var(--color-dim)]">@{user.handle}</div>
          <div className="mt-1 text-[13px] text-[var(--color-faint)]">레벨 {myLevels.length} · 에셋 {myAssets.length}</div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 flex items-center gap-1.5 text-lg font-bold"><Gamepad2 size={18} className="text-[var(--color-primary)]" /> 공개 레벨</h2>
        {myLevels.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myLevels.map((l) => <LevelCard key={l.id} level={l} onOpen={() => navigate(`/level/${l.id}`)} />)}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-faint)]">아직 공개 레벨이 없어요.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-1.5 text-lg font-bold"><Images size={18} className="text-[var(--color-accent)]" /> 공개 에셋</h2>
        {myAssets.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {myAssets.map((a) => <AssetCard key={a.id} asset={a} />)}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-faint)]">아직 공개 에셋이 없어요.</p>
        )}
      </section>
    </div>
  )
}
