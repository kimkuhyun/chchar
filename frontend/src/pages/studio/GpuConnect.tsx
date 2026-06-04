import { Cpu, Wifi, WifiOff, Box, Boxes, Info, RefreshCw } from 'lucide-react'
import { useStudio } from '../../store/studio'
import PageHeader from '../../ui/PageHeader'
import Card from '../../ui/Card'
import Button from '../../ui/Button'

const KIND_LABEL: Record<string, string> = { checkpoint: '체크포인트', lora: 'LoRA', vae: 'VAE' }

export default function GpuConnect() {
  const gpu = useStudio((s) => s.gpu)
  const setGpuUrl = useStudio((s) => s.setGpuUrl)
  const toggleGpu = useStudio((s) => s.toggleGpu)
  const online = gpu.status === 'online'

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 md:px-10">
      <PageHeader eyebrow="개인 GPU 연결" icon={Cpu} title="내 ComfyUI" desc="생성은 내 PC의 ComfyUI에서 실행됩니다. 브라우저가 직접 호출하므로 클라우드 비용이 0이에요." />

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className={`grid h-12 w-12 place-items-center rounded-xl ${online ? 'bg-[#e9f9f2] text-[var(--color-success)]' : 'bg-[var(--color-surface2)] text-[var(--color-faint)]'}`}>
            {online ? <Wifi size={22} /> : <WifiOff size={22} />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold">{gpu.label}</span>
              <span className={`badge ${online ? '' : 'badge-soft'}`} style={online ? { color: '#15bd8e', background: '#15bd8e1a', border: '1px solid #15bd8e33' } : {}}>
                <span className={`dot ${online ? 'dot-on' : 'dot-off'}`} /> {online ? '온라인' : '오프라인'}
              </span>
            </div>
            <div className="text-[13px] text-[var(--color-faint)]">마지막 확인 {new Date(gpu.lastSeenAt).toLocaleString('ko-KR')}</div>
          </div>
          <Button variant="ghost" onClick={toggleGpu}><RefreshCw size={15} /> 연결 테스트</Button>
        </div>

        <div className="mt-5">
          <label className="label">ComfyUI 주소</label>
          <input className="input font-mono text-[13px]" value={gpu.comfyUrl} onChange={(e) => setGpuUrl(e.target.value)} />
          <p className="mt-1.5 text-[12px] text-[var(--color-faint)]">보통 로컬에서 실행 중인 ComfyUI 주소(기본 http://localhost:8188)를 입력합니다.</p>
        </div>
      </Card>

      <Card className="mt-5 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-bold"><Boxes size={18} className="text-[var(--color-primary)]" /> 설치된 모델 <span className="text-sm font-normal text-[var(--color-faint)]">{gpu.models.length}개</span></h3>
        <div className="space-y-2">
          {gpu.models.map((m) => (
            <div key={m.name} className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface2)] px-3 py-2.5">
              <Box size={15} className="text-[var(--color-accent)]" />
              <span className="badge badge-soft">{KIND_LABEL[m.kind] ?? m.kind}</span>
              <span className="truncate font-mono text-[13px]">{m.name}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface2)] p-4 text-[13px] text-[var(--color-dim)]">
        <Info size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
        <span>목업 화면입니다. 실제로는 브라우저가 이 주소의 ComfyUI <code className="rounded bg-white px-1 py-0.5">/prompt</code> API를 호출하고, 생성된 PNG를 클라우드 스토리지에 업로드합니다.</span>
      </div>
    </div>
  )
}
