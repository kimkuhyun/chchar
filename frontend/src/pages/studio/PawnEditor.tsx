import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserCog, Save, Play } from 'lucide-react'
import PageHeader from '../../ui/PageHeader'
import Button from '../../ui/Button'
import PawnCanvas from '../../components/PawnCanvas'
import SlotPicker from '../../components/SlotPicker'
import ColorSwatch from '../../components/ColorSwatch'
import { useStudio } from '../../store/studio'
import type { Pawn, PartKind } from '../../types'
import { PART_CATEGORY } from '../../types'

export default function PawnEditor() {
  const navigate = useNavigate()
  const { id: idStr } = useParams()
  const editingId = idStr ? Number(idStr) : null
  const user = useStudio((s) => s.currentUser)!
  const templates = useStudio((s) => s.pawnTemplates)
  const parts = useStudio((s) => s.parts)
  const existing = useStudio((s) => s.pawns.find((p) => p.id === editingId))
  const savePawn = useStudio((s) => s.savePawn)

  const initial: Pawn = useMemo(() => existing ?? {
    id: 0, ownerId: user.id, ownerName: user.displayName,
    templateId: templates[0].id, name: '새 Pawn',
    bodyColor: '#c8a07a', factionColor: '#6d5efc', scale: 1,
    composition: {}, tints: {}, thumbnailUrl: null,
    isPublic: false, likeCount: 0, createdAt: new Date().toISOString(),
  }, [existing, user, templates])

  const [pawn, setPawn] = useState<Pawn>(initial)
  const template = templates.find((t) => t.id === pawn.templateId) ?? templates[0]
  const [animate, setAnimate] = useState<'idle' | 'walk' | 'attack'>('idle')

  const pickSlot = (slot: PartKind, partId: number | null) =>
    setPawn((p) => ({ ...p, composition: { ...p.composition, [slot]: partId ?? undefined } }))

  const characterSlots = template.slots.filter((s) => PART_CATEGORY.character.includes(s))

  const onSave = () => {
    const id = savePawn(pawn)
    navigate(`/studio/pawn/${id}`)
  }

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow={editingId ? '편집' : '새로 만들기'}
        icon={UserCog}
        title="Pawn 에디터"
        desc="템플릿 슬롯에 파츠를 얹어 paper-doll 캐릭터를 조립"
        actions={<Button onClick={onSave}><Save size={15} /> 저장</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* 좌: 미리보기 + 메타 */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="grid place-items-center">
              <PawnCanvas
                pawn={pawn} template={template} size={260}
                animate={animate}
                showDirectionToggle
                showBaseShape
                bg="var(--color-surface2)"
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {(['idle', 'walk', 'attack'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAnimate(a)}
                  className={`chip ${animate === a ? 'chip-active' : ''}`}
                >
                  <Play size={11} /> {a === 'idle' ? '대기' : a === 'walk' ? '걷기' : '공격'}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <div>
              <div className="label">이름</div>
              <input className="input" value={pawn.name} onChange={(e) => setPawn((p) => ({ ...p, name: e.target.value }))} />
            </div>

            <div>
              <div className="label">템플릿</div>
              <div className="flex gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPawn((p) => ({ ...p, templateId: t.id }))}
                    className={`chip ${pawn.templateId === t.id ? 'chip-active' : ''}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorSwatch label="몸체 색" value={pawn.bodyColor} onChange={(v) => setPawn((p) => ({ ...p, bodyColor: v }))} />
              <ColorSwatch label="진영 색" value={pawn.factionColor} onChange={(v) => setPawn((p) => ({ ...p, factionColor: v }))} />
            </div>

            <div>
              <div className="label">스케일 ({pawn.scale.toFixed(2)})</div>
              <input type="range" min={0.7} max={1.4} step={0.05} value={pawn.scale} onChange={(e) => setPawn((p) => ({ ...p, scale: Number(e.target.value) }))} />
            </div>

            <div className="flex items-center justify-between">
              <div className="label mb-0">공개</div>
              <label className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-dim)]">{pawn.isPublic ? '공개됨' : '비공개'}</span>
                <input type="checkbox" checked={pawn.isPublic} onChange={(e) => setPawn((p) => ({ ...p, isPublic: e.target.checked }))} />
              </label>
            </div>
          </div>
        </div>

        {/* 우: 슬롯 픽커 */}
        <aside className="space-y-3">
          <div className="text-sm font-semibold text-[var(--color-dim)]">슬롯 ({characterSlots.length})</div>
          <div className="space-y-3">
            {characterSlots.map((slot) => (
              <SlotPicker
                key={slot}
                slot={slot}
                current={pawn.composition[slot] ?? null}
                parts={parts.filter((p) => p.kind === slot && (p.ownerId === null || p.ownerId === user.id || p.isPublic))}
                onPick={(id) => pickSlot(slot, id)}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
