import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Heart, RefreshCw, Hash, Ruler, Crosshair, Blocks, Globe } from 'lucide-react'
import { useStudio } from '../../store/studio'
import { ROLE_LABEL } from '../../types'
import type { LucideIcon } from 'lucide-react'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Toggle from '../../ui/Toggle'
import Badge from '../../ui/Badge'
import EmptyState from '../../ui/EmptyState'

function Meta({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface2)] px-3 py-2.5">
      <Icon size={15} className="text-[var(--color-primary)]" />
      <span className="text-xs text-[var(--color-dim)]">{label}</span>
      <span className="ml-auto text-[12px] font-semibold">{value}</span>
    </div>
  )
}

export default function AssetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const asset = useStudio((s) => s.assets.find((a) => a.id === Number(id)))
  const presets = useStudio((s) => s.presets)
  const toggleFavorite = useStudio((s) => s.toggleFavorite)
  const setAssetPublic = useStudio((s) => s.setAssetPublic)
  const setCharacter = useStudio((s) => s.setCharacter)
  const setBackground = useStudio((s) => s.setBackground)
  const enqueueJob = useStudio((s) => s.enqueueJob)

  if (!asset) return <div className="p-10"><EmptyState icon={Hash} title="에셋을 찾을 수 없어요" action={<Button variant="ghost" onClick={() => navigate('/studio/assets')}>갤러리로</Button>} /></div>

  const preset = presets.find((p) => p.id === asset.presetId)
  const useInScene = () => {
    if (asset.role === 'char') setCharacter(asset.id)
    else if (asset.role === 'bg') setBackground(asset.id)
    navigate('/studio/builder')
  }
  const regenerate = () => { enqueueJob(asset.prompt || asset.tags.join(' '), asset.presetId, 1); navigate('/studio/queue') }

  return (
    <div className="px-6 py-8 md:px-10">
      <button onClick={() => navigate(-1)} className="mb-5 flex items-center gap-1 text-sm text-[var(--color-dim)] hover:text-[var(--color-ink)]"><ArrowLeft size={16} /> 뒤로</button>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-[var(--color-line)] px-4 py-2 text-xs text-[var(--color-dim)]">원본 · raw</div>
            <div className="grid aspect-square place-items-center p-6" style={{ background: 'radial-gradient(circle, #2a2440, #0b1020)' }}>
              <img src={asset.rawUrl} alt="" className="pixelated max-h-full max-w-full" />
            </div>
          </Card>
          <Card className="overflow-hidden p-0">
            <div className="border-b border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-primary)]">정규화 · processed</div>
            <div className="grid aspect-square place-items-center p-6" style={{ backgroundColor: '#eef0f7', backgroundImage: 'linear-gradient(45deg,#dfe2ee 25%,transparent 25%),linear-gradient(-45deg,#dfe2ee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#dfe2ee 75%),linear-gradient(-45deg,transparent 75%,#dfe2ee 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0,0 10px,10px -10px,-10px 0' }}>
              <img src={asset.processedUrl} alt="" className="pixelated max-h-full max-w-full" />
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <Badge color="#6d5efc">{ROLE_LABEL[asset.role]}</Badge>
            <button onClick={() => toggleFavorite(asset.id)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-line2)] transition hover:scale-110">
              <Heart size={16} className={asset.favorite ? 'text-[var(--color-danger)]' : 'text-[var(--color-faint)]'} fill={asset.favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          <h1 className="mt-3 text-xl font-bold">에셋 #{asset.id}</h1>
          <div className="mt-1 text-sm text-[var(--color-dim)]">{asset.prompt || '—'} · {preset?.name}</div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {asset.tags.map((t) => <span key={t} className="chip">#{t}</span>)}
          </div>

          <div className="mt-5 grid gap-2">
            <Meta icon={Hash} label="seed" value={String(asset.seed)} />
            <Meta icon={Ruler} label="크기" value={`${asset.width}×${asset.height}`} />
            <Meta icon={Crosshair} label="앵커" value={`${asset.anchorX.toFixed(2)}, ${asset.anchorY.toFixed(2)}`} />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-surface2)] px-4 py-3">
            <div className="flex items-center gap-2 text-sm"><Globe size={15} className="text-[var(--color-success)]" /> 커뮤니티에 공개</div>
            <Toggle checked={asset.isPublic} onChange={(v) => setAssetPublic(asset.id, v)} />
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {asset.role !== 'platform' && <Button onClick={useInScene}><Blocks size={16} /> {asset.role === 'char' ? '이 캐릭터로 씬 시작' : '배경으로 사용'}</Button>}
            <Button variant="ghost" onClick={regenerate}><RefreshCw size={15} /> 같은 seed 계열로 재생성</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
