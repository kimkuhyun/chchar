import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Dice5, Cpu, FlaskConical, AlertTriangle, Plug, Loader2, Scissors } from 'lucide-react'
import { useStudio } from '../../store/studio'
import PageHeader from '../../ui/PageHeader'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import { ROLE_LABEL } from '../../types'
import { generateSheet, pingComfy } from '../../lib/comfy'

const EXAMPLES = ['은빛 갑옷의 기사, 파란 망토', '네온 사이버펑크 닌자', '떠다니는 수정 동굴 배경', '용암 함정이 있는 화산 플랫폼']

export default function Generate() {
  const navigate = useNavigate()
  const presets = useStudio((s) => s.presets).filter((p) => p.isActive)
  const enqueueJob = useStudio((s) => s.enqueueJob)
  const gpu = useStudio((s) => s.gpu)
  const [presetId, setPresetId] = useState(presets[0]?.id)
  const [prompt, setPrompt] = useState('')
  const [batch, setBatch] = useState(4)

  const preset = presets.find((p) => p.id === presetId) ?? presets[0]
  const online = gpu.status === 'online'
  const canSubmit = prompt.trim().length > 0 && !!preset && online

  const submit = () => {
    if (!canSubmit) return
    enqueueJob(prompt.trim(), preset.id, batch)
    navigate('/studio/queue')
  }

  // 실제 ComfyUI 연동 (베타)
  const [comfy, setComfy] = useState<{ ok: boolean; version?: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => { pingComfy().then(setComfy) }, [])

  const realGenerate = async () => {
    if (!prompt.trim()) return
    setBusy(true); setErr(null); setResultUrl(null); setElapsed(0)
    try {
      const url = await generateSheet(prompt.trim(), { onTick: setElapsed })
      setResultUrl(url)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
      <PageHeader eyebrow="컨셉 한 줄이면 충분해요" icon={Sparkles} title="에셋 생성" />

      {!online && (
        <Card className="mb-5 flex items-center gap-3 border-[#ffd9a8] bg-[#fff8ee] p-4">
          <AlertTriangle size={18} className="text-[var(--color-warn)]" />
          <div className="flex-1 text-sm">
            <b>GPU가 오프라인입니다.</b> <span className="text-[var(--color-dim)]">생성하려면 내 ComfyUI 연결이 필요해요.</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/studio/gpu')}><Cpu size={15} /> 연결하기</Button>
        </Card>
      )}

      <Card className="p-6 md:p-7">
        <label className="label">컨셉 프롬프트</label>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="예: 은빛 갑옷의 기사, 파란 망토, 빛나는 검" className="textarea" />

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} className="chip" onClick={() => setPrompt(ex)}><Dice5 size={12} /> {ex}</button>
          ))}
        </div>

        <label className="label mt-6">스타일 프리셋</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {presets.map((p) => {
            const sel = p.id === presetId
            return (
              <button key={p.id} onClick={() => setPresetId(p.id)} className={`rounded-xl border p-4 text-left transition ${sel ? 'border-[var(--color-primary)] bg-[rgba(109,94,252,0.06)] shadow-[0_0_0_3px_rgba(109,94,252,0.1)]' : 'border-[var(--color-line2)] hover:border-[var(--color-primary)]'}`}>
                <div className="text-xs text-[var(--color-faint)]">{ROLE_LABEL[p.role]}{p.ownerId === null ? ' · 공식' : ''}</div>
                <div className="mt-0.5 font-semibold">{p.name}</div>
                <div className="mt-2 truncate text-[11px] text-[var(--color-faint)]">{p.lora ?? p.checkpoint.replace('.safetensors', '')}</div>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <label className="label mb-0">배치 수량</label>
          <input type="range" min={1} max={8} value={batch} onChange={(e) => setBatch(Number(e.target.value))} className="max-w-xs flex-1" />
          <span className="text-sm font-semibold text-[var(--color-primary)]">{batch}장</span>
        </div>

        {preset && (
          <div className="mt-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface2)] p-3">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[var(--color-faint)]"><Cpu size={12} /> 내 ComfyUI 전송 프롬프트</div>
            <code className="block text-[12px] leading-relaxed text-[var(--color-dim)]">
              <span className="text-[var(--color-primary)]">{preset.promptPrefix}</span>{prompt || '〈프롬프트〉'}<span className="text-[var(--color-accent)]">{preset.promptSuffix}</span>
            </code>
          </div>
        )}

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#f3c6cf] bg-[#fff0f3] px-3 py-1 text-xs text-[var(--color-danger)]">
          <FlaskConical size={12} /> 목업 — 실제 ComfyUI 호출이 아니라 시뮬레이션됩니다
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-[var(--color-faint)]">예상 ~{Math.round((preset?.steps ?? 28) * 1.4 * batch)}초 · 내 GPU 순차 생성</div>
          <Button size="lg" onClick={submit} disabled={!canSubmit}><Sparkles size={18} /> 생성 시작</Button>
        </div>
      </Card>

      {/* 실제 ComfyUI 연동 (베타) */}
      <Card className="mt-5 p-6">
        <div className="mb-3 flex items-center gap-2">
          <Plug size={16} className="text-[var(--color-primary)]" />
          <span className="font-semibold">내 ComfyUI로 실제 생성</span>
          <span className="rounded-full bg-[rgba(109,94,252,0.1)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">베타</span>
          {comfy && (comfy.ok ? (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-[var(--color-success)]"><span className="dot dot-on" /> 연결됨 {comfy.version && `v${comfy.version}`}</span>
          ) : (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-[var(--color-danger)]"><span className="dot dot-off" /> ComfyUI 꺼짐 (localhost:8000)</span>
          ))}
        </div>
        <p className="mb-3 text-xs text-[var(--color-dim)]">표준 레시피(WAI-illustrious + rpg LoRA)로 멀티뷰 시트 1장을 생성합니다. 위 프롬프트의 캐릭터 설명이 그대로 들어가요. 생성 후 <b>슬라이서</b>에서 방향별로 자르면 됩니다.</p>
        <div className="flex items-center gap-3">
          <Button onClick={realGenerate} disabled={busy || !prompt.trim() || !comfy?.ok}>
            {busy ? <><Loader2 size={16} className="animate-spin" /> 생성 중…</> : <><Sparkles size={16} /> 시트 생성</>}
          </Button>
          {busy && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-faint)]">
              <Loader2 size={13} className="animate-spin" /> 생성 중… {Math.floor(elapsed / 1000)}초 <span className="text-[var(--color-faint)]">(보통 30~60초)</span>
            </div>
          )}
        </div>
        {err && <div className="mt-3 rounded-lg border border-[#f3c6cf] bg-[#fff0f3] p-2.5 text-xs text-[var(--color-danger)]">{err}</div>}
        {resultUrl && (
          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold text-[var(--color-dim)]">생성된 시트</div>
            <div className="inline-block rounded-xl border border-[var(--color-line)] p-2" style={{ background: 'repeating-conic-gradient(#eef0f4 0% 25%, #fff 0% 50%) 0 0 / 18px 18px' }}>
              <img src={resultUrl} alt="생성된 시트" className="max-h-80 rounded-lg" />
            </div>
            <div className="mt-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/studio/slicer')}><Scissors size={14} /> 슬라이서로 가기</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
