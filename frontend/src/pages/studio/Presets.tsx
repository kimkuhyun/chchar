import { useEffect, useState, type ReactNode } from 'react'
import { Plus, Trash2, Save, SlidersHorizontal, Power } from 'lucide-react'
import { useStudio } from '../../store/studio'
import PageHeader from '../../ui/PageHeader'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Toggle from '../../ui/Toggle'
import Badge from '../../ui/Badge'
import { ROLE_LABEL, type Role, type StylePreset } from '../../types'

const SAMPLERS = ['dpmpp_2m_karras', 'euler_ancestral', 'dpmpp_sde', 'euler', 'ddim']
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>
}

export default function Presets() {
  const presets = useStudio((s) => s.presets)
  const upsertPreset = useStudio((s) => s.upsertPreset)
  const deletePreset = useStudio((s) => s.deletePreset)
  const togglePresetActive = useStudio((s) => s.togglePresetActive)
  const newPreset = useStudio((s) => s.newPreset)

  const [selId, setSelId] = useState<number | undefined>(presets[0]?.id)
  const [draft, setDraft] = useState<StylePreset | null>(presets[0] ?? null)

  useEffect(() => {
    const p = presets.find((x) => x.id === selId)
    setDraft(p ? { ...p } : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selId])

  const set = <K extends keyof StylePreset>(k: K, v: StylePreset[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d))
  const addPreset = (role: Role) => { const p = newPreset(role); setSelId(p.id) }
  const remove = () => { if (selId == null) return; deletePreset(selId); setSelId(presets.find((p) => p.id !== selId)?.id) }
  const official = draft?.ownerId === null

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        eyebrow="생성 레시피" icon={SlidersHorizontal} title="프리셋"
        actions={(['char', 'bg', 'platform'] as Role[]).map((r) => (
          <button key={r} onClick={() => addPreset(r)} className="flex items-center gap-1 rounded-lg border border-[var(--color-line2)] bg-white px-3 py-1.5 text-sm text-[var(--color-dim)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"><Plus size={14} /> {ROLE_LABEL[r]}</button>
        ))}
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-2">
          {presets.map((p) => (
            <div key={p.id} onClick={() => setSelId(p.id)} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${p.id === selId ? 'border-[var(--color-primary)] bg-[rgba(109,94,252,0.06)]' : 'border-[var(--color-line)] hover:border-[var(--color-primary)]'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-1.5"><span className="text-sm font-semibold">{p.name}</span>{p.ownerId === null && <Badge>공식</Badge>}</div>
                <div className="text-xs text-[var(--color-faint)]">{ROLE_LABEL[p.role]}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); togglePresetActive(p.id) }} className={`grid h-7 w-7 place-items-center rounded-lg transition ${p.isActive ? 'bg-[#e9f9f2] text-[var(--color-success)]' : 'bg-[var(--color-surface2)] text-[var(--color-faint)]'}`} title={p.isActive ? '활성' : '비활성'}><Power size={14} /></button>
            </div>
          ))}
        </div>

        {draft ? (
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="이름"><input className="input" value={draft.name} onChange={(e) => set('name', e.target.value)} /></Field>
              <Field label="역할 (role)"><select className="select" value={draft.role} onChange={(e) => set('role', e.target.value as Role)}><option value="char">캐릭터</option><option value="bg">배경</option><option value="platform">플랫폼</option></select></Field>
              <Field label="checkpoint"><input className="input" value={draft.checkpoint} onChange={(e) => set('checkpoint', e.target.value)} /></Field>
              <Field label="LoRA (선택)"><input className="input" value={draft.lora ?? ''} onChange={(e) => set('lora', e.target.value || null)} /></Field>
              <Field label="프롬프트 prefix"><input className="input" value={draft.promptPrefix} onChange={(e) => set('promptPrefix', e.target.value)} /></Field>
              <Field label="프롬프트 suffix"><input className="input" value={draft.promptSuffix} onChange={(e) => set('promptSuffix', e.target.value)} /></Field>
              <div className="sm:col-span-2"><Field label="negative prompt"><input className="input" value={draft.negativePrompt} onChange={(e) => set('negativePrompt', e.target.value)} /></Field></div>
              <Field label="sampler"><select className="select" value={draft.sampler} onChange={(e) => set('sampler', e.target.value)}>{SAMPLERS.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="steps"><input type="number" className="input" value={draft.steps} onChange={(e) => set('steps', Number(e.target.value))} /></Field>
                <Field label="cfg"><input type="number" step="0.5" className="input" value={draft.cfg} onChange={(e) => set('cfg', Number(e.target.value))} /></Field>
              </div>
              <Field label="width"><input type="number" className="input" value={draft.width} onChange={(e) => set('width', Number(e.target.value))} /></Field>
              <Field label="height"><input type="number" className="input" value={draft.height} onChange={(e) => set('height', Number(e.target.value))} /></Field>
              <div className="sm:col-span-2"><Field label="postprocess (쉼표 구분)"><input className="input" value={draft.postprocess.join(', ')} onChange={(e) => set('postprocess', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} /></Field></div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-5">
              <label className="flex items-center gap-2 text-sm text-[var(--color-dim)]"><Toggle checked={draft.isActive} onChange={(v) => set('isActive', v)} /> 활성</label>
              <label className="flex items-center gap-2 text-sm text-[var(--color-dim)]"><Toggle checked={draft.isPublic} onChange={(v) => set('isPublic', v)} /> 공개</label>
              <div className="ml-auto flex gap-2">
                <Button variant="danger" onClick={remove} disabled={official}><Trash2 size={15} /> 삭제</Button>
                <Button onClick={() => upsertPreset(draft)}><Save size={15} /> 저장</Button>
              </div>
            </div>
            {official && <p className="mt-3 text-xs text-[var(--color-faint)]">공식 프리셋입니다. 삭제할 수 없어요 (수정 후 저장은 가능).</p>}
          </Card>
        ) : (
          <Card className="grid place-items-center p-16 text-[var(--color-faint)]">프리셋을 선택하거나 새로 만드세요.</Card>
        )}
      </div>
    </div>
  )
}
