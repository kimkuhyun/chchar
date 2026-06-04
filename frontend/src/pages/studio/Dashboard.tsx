import { useNavigate } from 'react-router-dom'
import { Images, Gamepad2, Loader, Cpu, Sparkles, Blocks, ArrowRight } from 'lucide-react'
import { useStudio } from '../../store/studio'
import { userById } from '../../mock/users'
import PageHeader from '../../ui/PageHeader'
import Stat from '../../ui/Stat'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import AssetCard from '../../components/AssetCard'
import LevelCard from '../../components/LevelCard'

export default function Dashboard() {
  const navigate = useNavigate()
  const uid = useStudio((s) => s.currentUserId)
  const user = uid ? userById(uid) : null
  const assets = useStudio((s) => s.assets).filter((a) => a.ownerId === uid)
  const levels = useStudio((s) => s.levels).filter((l) => l.ownerId === uid)
  const jobs = useStudio((s) => s.jobs).filter((j) => j.userId === uid)
  const gpu = useStudio((s) => s.gpu)
  const activeJobs = jobs.filter((j) => j.status !== 'done' && j.status !== 'failed').length

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        eyebrow={`안녕하세요, ${user?.displayName ?? ''}님`}
        icon={Sparkles}
        title="스튜디오 대시보드"
        actions={<><Button variant="ghost" onClick={() => navigate('/studio/builder')}><Blocks size={16} /> 씬 조립기</Button><Button onClick={() => navigate('/studio/generate')}><Sparkles size={16} /> 생성</Button></>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Images} label="내 에셋" value={assets.length} accent="#6d5efc" />
        <Stat icon={Gamepad2} label="내 레벨" value={levels.length} accent="#15c2e8" />
        <Stat icon={Loader} label="진행 중 잡" value={activeJobs} accent="#f59e2e" />
        <Stat icon={Cpu} label="GPU 상태" value={gpu.status === 'online' ? '온라인' : '오프라인'} accent={gpu.status === 'online' ? '#15bd8e' : '#9aa0bd'} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">최근 에셋</h2>
            <button onClick={() => navigate('/studio/assets')} className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">전체 <ArrowRight size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {assets.slice(0, 6).map((a) => <AssetCard key={a.id} asset={a} onOpen={() => navigate(`/studio/asset/${a.id}`)} />)}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">내 레벨</h2>
            <button onClick={() => navigate('/studio/levels')} className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">전체 <ArrowRight size={14} /></button>
          </div>
          <div className="space-y-4">
            {levels.slice(0, 2).map((l) => <LevelCard key={l.id} level={l} onOpen={() => navigate('/studio/levels')} />)}
            {levels.length === 0 && <Card className="p-6 text-center text-sm text-[var(--color-faint)]">아직 레벨이 없어요.</Card>}
          </div>
        </section>
      </div>
    </div>
  )
}
