import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Wand2, Shuffle, Cpu } from 'lucide-react'
import PageHeader from '../../ui/PageHeader'
import Button from '../../ui/Button'
import Badge from '../../ui/Badge'
import ModelCacheBadge from '../../components/ModelCacheBadge'
import GenerationProgress from '../../components/GenerationProgress'
import UnsupportedNotice from '../../components/UnsupportedNotice'
import { useStudio } from '../../store/studio'
import { WORKFLOW_PURPOSE_LABEL } from '../../types'

const SUGGESTIONS = [
  '용맹한 기사, 갑옷, 정면',
  '엘프 궁수, 후드, 옆모습',
  '마법사 지팡이, 오크 가지, 단일',
  '돌멩이 더미, 무광',
]

export default function Generate() {
  const navigate = useNavigate()
  const workflows = useStudio((s) => s.workflows)
  const generation = useStudio((s) => s.generation)
  const generate = useStudio((s) => s.generate)
  const cancel = useStudio((s) => s.cancelGeneration)
  const cap = useStudio((s) => s.webgpu)
  const [workflowId, setWorkflowId] = useState(workflows[0]?.id ?? 0)
  const [prompt, setPrompt] = useState(SUGGESTIONS[0])
  const [seed, setSeed] = useState(0)
  const [open, setOpen] = useState(false)
  const wf = workflows.find((w) => w.id === workflowId)

  if (cap && cap.level !== 'ok') {
    return (
      <div className="p-6">
        <PageHeader eyebrow="파츠 생성" icon={Sparkles} title="새 파츠 만들기" />
        <UnsupportedNotice variant="gate" action={<Button onClick={() => navigate('/explore/parts')}>공개 파츠 보기</Button>} />
      </div>
    )
  }

  const run = async () => {
    setOpen(true)
    await generate(workflowId, prompt)
  }

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="파츠 생성"
        icon={Sparkles}
        title="새 파츠 만들기"
        desc="워크플로우 + 프롬프트 → 브라우저 WebGPU에서 추론 → 라이브러리에 저장"
        actions={
          <span className="flex items-center gap-1.5 rounded-lg border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-xs text-[var(--color-dim)]">
            <Cpu size={12} className="text-[var(--color-primary)]" /> WebGPU · VRAM ≈ {cap?.vramGuessGb}GB
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="card p-5">
            <div className="label">워크플로우 선택</div>
            <div className="grid gap-2 md:grid-cols-2">
              {workflows.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWorkflowId(w.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    workflowId === w.id
                      ? 'border-[var(--color-primary)] bg-[rgba(109,94,252,0.05)]'
                      : 'border-[var(--color-line)] bg-white hover:border-[var(--color-line2)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{w.name}</span>
                    <Badge>{WORKFLOW_PURPOSE_LABEL[w.purpose]}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-dim)] line-clamp-2">{w.description}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="badge badge-soft text-[10.5px]">{w.baseModel}</span>
                    <ModelCacheBadge weights={w.weights} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="label mb-0">프롬프트</div>
              <div className="flex gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => setPrompt(s)} className="chip" title={s}>
                    {s.length > 14 ? s.slice(0, 14) + '…' : s}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="textarea" />
            {wf && (
              <div className="mt-2 text-xs text-[var(--color-faint)]">
                <span className="opacity-70">{wf.promptPrefix}</span>
                <b className="text-[var(--color-ink)]">{'{프롬프트}'}</b>
                <span className="opacity-70">{wf.promptSuffix}</span>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <div className="label">시드</div>
                <div className="flex gap-2">
                  <input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value))} className="input" />
                  <Button variant="ghost" onClick={() => setSeed(Math.floor(Math.random() * 900000))}>
                    <Shuffle size={14} />
                  </Button>
                </div>
              </div>
              <div>
                <div className="label">샘플링 스텝 (자동)</div>
                <input className="input" value={wf?.baseModel === 'sd15-lcm' ? '4 (LCM)' : wf?.baseModel === 'sdxl-turbo-int8' ? '2 (Turbo)' : '24'} disabled />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button onClick={run} disabled={!prompt.trim() || generation.stage !== 'idle' && generation.stage !== 'done'}>
                <Wand2 size={15} /> 생성
              </Button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold">자동 후처리</h3>
            <ul className="mt-2 space-y-1 text-xs text-[var(--color-dim)]">
              <li>· RMBG로 배경 제거 (투명 PNG)</li>
              <li>· anchor 자동 측정</li>
              <li>· 멀티뷰는 슬라이서에서 kind 분할</li>
            </ul>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-bold">팁</h3>
            <ul className="mt-2 space-y-1 text-xs text-[var(--color-dim)]">
              <li>· 정면·측면·후면을 따로 만들어 슬롯에 맞춰주세요</li>
              <li>· 8GB VRAM에선 SD1.5/LCM이 가장 안정적</li>
              <li>· SDXL-Turbo는 1~2스텝으로 빠른 무기/방패용</li>
            </ul>
          </div>
        </aside>
      </div>

      <GenerationProgress
        open={open}
        state={generation}
        onClose={() => setOpen(false)}
        onCancel={() => { cancel(); setOpen(false) }}
        onRetry={run}
        onUse={() => navigate('/studio/slicer')}
      />
    </div>
  )
}
