import { useNavigate } from 'react-router-dom'
import { Blocks, Gamepad2 } from 'lucide-react'
import { useStudio } from '../../store/studio'
import GamePlayer from '../../components/GamePlayer'
import Button from '../../ui/Button'
import EmptyState from '../../ui/EmptyState'

export default function Play() {
  const navigate = useNavigate()
  const draft = useStudio((s) => s.draft)
  const hasChar = useStudio((s) => s.assets.some((a) => a.id === draft.characterAssetId))

  if (!hasChar) {
    return (
      <div className="p-10">
        <EmptyState icon={Gamepad2} title="플레이할 캐릭터가 없어요" desc="씬 조립기에서 캐릭터를 먼저 골라주세요." action={<Button onClick={() => navigate('/studio/builder')}><Blocks size={16} /> 씬 조립기로</Button>} />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b border-[var(--color-line)] bg-white/85 px-5 py-2.5 backdrop-blur">
        <Gamepad2 size={18} className="text-[var(--color-primary)]" />
        <span className="font-semibold">{draft.name}</span>
        <span className="text-sm text-[var(--color-faint)]">테스트 플레이</span>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => navigate('/studio/builder')}><Blocks size={15} /> 조립기로</Button>
      </div>
      <div className="min-h-0 flex-1 bg-[#06080f] p-3 md:p-5">
        <GamePlayer level={draft} />
      </div>
    </div>
  )
}
