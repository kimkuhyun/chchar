import { useNavigate } from 'react-router-dom'
import { Map as MapIcon, Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../ui/PageHeader'
import Button from '../../ui/Button'
import EmptyState from '../../ui/EmptyState'
import SceneCard from '../../components/SceneCard'
import { useStudio } from '../../store/studio'

export default function MyScenes() {
  const navigate = useNavigate()
  const user = useStudio((s) => s.currentUser)!
  const scenes = useStudio((s) => s.scenes).filter((s) => s.ownerId === user.id)
  const del = useStudio((s) => s.deleteScene)

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="컬렉션"
        icon={MapIcon}
        title="내 씬"
        desc="내가 만든 보드들 — 장르별로 플레이·공유"
        actions={<Button onClick={() => navigate('/studio/scenes')}><Plus size={15} /> 새 씬</Button>}
      />

      {scenes.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenes.map((s) => (
            <div key={s.id} className="relative">
              <SceneCard scene={s} onClick={() => navigate(`/studio/scene/${s.id}`)} />
              <button
                onClick={(e) => { e.stopPropagation(); if (confirm('삭제할까요?')) del(s.id) }}
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
          icon={MapIcon}
          title="아직 씬이 없어요"
          desc="장르 보드에 Pawn·타일·prop을 배치해 보세요"
          action={<Button onClick={() => navigate('/studio/scenes')}><Plus size={15} /> 새 씬</Button>}
        />
      )}
    </div>
  )
}
