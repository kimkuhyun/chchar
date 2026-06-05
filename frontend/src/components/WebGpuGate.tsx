import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cpu, Download, CheckCircle2, Compass } from 'lucide-react'
import Button from '../ui/Button'
import UnsupportedNotice from './UnsupportedNotice'
import { useStudio } from '../store/studio'
import { fmtBytes } from '../lib/format'

/** /studio 진입 게이트.
 *  - WebGPU 체크
 *  - 기본 워크플로우(첫번째 active) 가중치 다운로드
 *  - 완료시 children 렌더 (또는 onReady)
 */
export default function WebGpuGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const cap = useStudio((s) => s.webgpu)
  const detect = useStudio((s) => s.detectWebGpu)
  const workflows = useStudio((s) => s.workflows)
  const modelsReady = useStudio((s) => s.modelsReady)
  const downloadWorkflowModels = useStudio((s) => s.downloadWorkflowModels)
  const refreshModelsReady = useStudio((s) => s.refreshModelsReady)

  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})

  useEffect(() => { if (!cap) detect() }, [cap, detect])

  if (!cap) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-[var(--color-dim)]">
        <div className="flex items-center gap-2"><Cpu className="spin" size={16} /> 환경 점검 중…</div>
      </div>
    )
  }

  if (cap.level !== 'ok') {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <UnsupportedNotice
          variant="gate"
          action={
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Compass size={16} /> 둘러보기로 가기
            </Button>
          }
        />
      </div>
    )
  }

  if (modelsReady) return <>{children}</>

  const wf = workflows.find((w) => w.isActive) ?? workflows[0]
  const total = wf.weights.reduce((a, b) => a + b.bytes, 0)
  const downloaded = wf.weights.reduce((a, b) => a + b.bytes * (progress[b.key] ?? 0), 0)
  const overall = total > 0 ? downloaded / total : 0

  const start = async () => {
    setRunning(true)
    await downloadWorkflowModels(wf.id, (k, p) => setProgress((s) => ({ ...s, [k]: p })))
    refreshModelsReady()
    setRunning(false)
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="card p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[rgba(109,94,252,0.12)] text-[var(--color-primary)]">
            <Cpu size={22} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold">스튜디오 환경 준비</h2>
            <p className="mt-1 text-sm text-[var(--color-dim)]">
              파츠 생성을 위해 브라우저에 모델을 한 번 받아둘게요. 다음 방문엔 바로 시작됩니다.
            </p>
            <div className="mt-2 flex flex-wrap gap-1 text-xs text-[var(--color-faint)]">
              <span className="badge badge-soft">WebGPU {cap.vendor ?? 'OK'}</span>
              <span className="badge badge-soft">VRAM ≈ {cap.vramGuessGb}GB</span>
              <span className="badge badge-soft">{wf.name}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {wf.weights.map((w) => {
            const p = progress[w.key]
            const done = p === 1 || (p == null && false)
            return (
              <div key={w.key} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface2)] p-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{w.label}</div>
                    <div className="text-xs text-[var(--color-faint)]">{w.kind} · {fmtBytes(w.bytes)}</div>
                  </div>
                  {done
                    ? <CheckCircle2 size={18} className="text-[var(--color-success)]" />
                    : <span className="text-xs text-[var(--color-dim)]">{Math.round((p ?? 0) * 100)}%</span>}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-line)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(p ?? 0) * 100}%`, background: 'var(--brand)' }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="text-xs text-[var(--color-dim)]">
            합계 {fmtBytes(total)} · IndexedDB에 저장돼요
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Compass size={15} /> 둘러보기
            </Button>
            <Button onClick={start} disabled={running}>
              <Download size={15} />
              {running ? `다운로드 중 ${Math.round(overall * 100)}%` : '다운로드 시작'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
