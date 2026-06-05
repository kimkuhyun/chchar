import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users2 } from 'lucide-react'
import PageHeader from '../../ui/PageHeader'
import SceneCard from '../../components/SceneCard'
import { useStudio } from '../../store/studio'
import { SCENE_GENRE_LABEL, type SceneGenre } from '../../types'

export default function ExploreScenes() {
  const navigate = useNavigate()
  const scenes = useStudio((s) => s.scenes).filter((s) => s.isPublic)
  const [genre, setGenre] = useState<SceneGenre | 'all'>('all')

  const items = genre === 'all' ? scenes : scenes.filter((s) => s.genre === genre)

  return (
    <>
      <PageHeader eyebrow="공개 씬" icon={Users2} title="씬 탐색" desc="장르별 미니 보드를 둘러보고 바로 플레이" />

      <div className="mb-5 flex flex-wrap gap-1.5">
        <button onClick={() => setGenre('all')} className={`chip ${genre === 'all' ? 'chip-active' : ''}`}>전체</button>
        {(Object.keys(SCENE_GENRE_LABEL) as SceneGenre[]).map((g) => (
          <button key={g} onClick={() => setGenre(g)} className={`chip ${genre === g ? 'chip-active' : ''}`}>
            {SCENE_GENRE_LABEL[g]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => <SceneCard key={s.id} scene={s} onClick={() => navigate(`/scene/${s.id}`)} />)}
      </div>
    </>
  )
}
