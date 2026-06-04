import { useNavigate } from 'react-router-dom'
import { Gamepad2, Plus } from 'lucide-react'
import { useStudio } from '../../store/studio'
import LevelCard from '../../components/LevelCard'
import PageHeader from '../../ui/PageHeader'
import Button from '../../ui/Button'
import EmptyState from '../../ui/EmptyState'

export default function MyLevels() {
  const navigate = useNavigate()
  const uid = useStudio((s) => s.currentUserId)
  const levels = useStudio((s) => s.levels).filter((l) => l.ownerId === uid)
  const loadDraft = useStudio((s) => s.loadDraft)
  const newDraft = useStudio((s) => s.newDraft)

  const open = (id: number) => { loadDraft(id); navigate('/studio/builder') }
  const create = () => { newDraft(); navigate('/studio/builder') }

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader eyebrow="내 레벨" icon={Gamepad2} title={`내 레벨 · ${levels.length}`} actions={<Button onClick={create}><Plus size={16} /> 새 레벨</Button>} />
      {levels.length === 0 ? (
        <EmptyState icon={Gamepad2} title="레벨이 없어요" desc="에셋을 만들고 씬 조립기에서 첫 레벨을 만들어보세요." action={<Button onClick={create}><Plus size={16} /> 새 레벨 만들기</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {levels.map((l) => <LevelCard key={l.id} level={l} onOpen={() => open(l.id)} />)}
        </div>
      )}
    </div>
  )
}
