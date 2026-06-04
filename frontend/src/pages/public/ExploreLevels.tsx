import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'
import { useStudio } from '../../store/studio'
import LevelCard from '../../components/LevelCard'
import PageHeader from '../../ui/PageHeader'

export default function ExploreLevels() {
  const navigate = useNavigate()
  const all = useStudio((s) => s.levels).filter((l) => l.visibility === 'public')
  const [sort, setSort] = useState<'popular' | 'recent'>('popular')
  const levels = [...all].sort((a, b) => (sort === 'popular' ? b.playCount - a.playCount : b.id - a.id))

  return (
    <div>
      <PageHeader
        eyebrow="레벨 탐색"
        icon={Gamepad2}
        title="커뮤니티 레벨"
        desc="다른 제작자들이 만든 레벨을 바로 플레이하세요."
        actions={
          <div className="flex gap-1 rounded-xl border border-[var(--color-line)] bg-white p-1">
            {(['popular', 'recent'] as const).map((s) => (
              <button key={s} onClick={() => setSort(s)} className={`rounded-lg px-3 py-1.5 text-sm transition ${sort === s ? 'bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]' : 'text-[var(--color-dim)]'}`}>
                {s === 'popular' ? '인기순' : '최신순'}
              </button>
            ))}
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {levels.map((l) => (
          <LevelCard key={l.id} level={l} onOpen={() => navigate(`/level/${l.id}`)} />
        ))}
      </div>
    </div>
  )
}
