import { useState } from 'react'
import { Scissors, Save, Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../ui/PageHeader'
import Button from '../../ui/Button'
import EmptyState from '../../ui/EmptyState'
import { useStudio } from '../../store/studio'
import { PART_KIND_LABEL, type PartKind } from '../../types'

interface Region { id: string; x: number; y: number; w: number; h: number; kind: PartKind; name: string }

export default function Slicer() {
  const parts = useStudio((s) => s.parts)
  const recent = [...parts].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0]
  const [src, setSrc] = useState<string | null>(recent?.url ?? null)
  const [regions, setRegions] = useState<Region[]>([
    { id: 'r1', x: 0, y: 0, w: 256, h: 256, kind: 'face_front', name: '얼굴(앞)' },
    { id: 'r2', x: 256, y: 0, w: 256, h: 256, kind: 'face_side', name: '얼굴(옆)' },
  ])

  const add = () => setRegions((s) => [...s, { id: `r${s.length + 1}`, x: 0, y: 0, w: 200, h: 200, kind: 'body', name: '새 영역' }])
  const remove = (id: string) => setRegions((s) => s.filter((r) => r.id !== id))

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="후처리"
        icon={Scissors}
        title="파츠 슬라이서"
        desc="멀티뷰 atlas / 시트 결과를 영역으로 잘라 각 kind 파츠로 저장"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSrc(recent?.url ?? null)}>최근 결과 가져오기</Button>
            <span className="text-xs text-[var(--color-faint)]">또는 라이브러리에서 선택</span>
          </div>
          <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl bg-[var(--color-surface2)]">
            {src ? (
              <>
                <img src={src} alt="source" className="h-full w-full object-contain" />
                {regions.map((r) => (
                  <div
                    key={r.id}
                    className="pointer-events-none absolute rounded-md border-2 border-[var(--color-primary)] bg-[rgba(109,94,252,0.08)]"
                    style={{
                      left: `${(r.x / 512) * 100}%`,
                      top: `${(r.y / 512) * 100}%`,
                      width: `${(r.w / 512) * 100}%`,
                      height: `${(r.h / 512) * 100}%`,
                    }}
                  >
                    <span className="absolute -top-5 left-0 rounded bg-[var(--color-primary)] px-1 py-0.5 text-[10px] font-semibold text-white">
                      {r.name}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <EmptyState icon={Scissors} title="원본이 없어요" desc="생성 후 자동 진입되거나, 라이브러리에서 선택하세요" />
            )}
          </div>
        </div>

        <aside className="space-y-3">
          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold">분할 영역 {regions.length}</h3>
              <Button size="sm" variant="ghost" onClick={add}><Plus size={13} /> 추가</Button>
            </div>
            <div className="space-y-2">
              {regions.map((r) => (
                <div key={r.id} className="rounded-lg border border-[var(--color-line)] bg-white p-2 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      value={r.name}
                      onChange={(e) => setRegions((s) => s.map((x) => x.id === r.id ? { ...x, name: e.target.value } : x))}
                      className="input"
                      style={{ padding: '4px 8px' }}
                    />
                    <button onClick={() => remove(r.id)} className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-faint)] hover:bg-[var(--color-surface2)] hover:text-[var(--color-danger)]">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <select
                    value={r.kind}
                    onChange={(e) => setRegions((s) => s.map((x) => x.id === r.id ? { ...x, kind: e.target.value as PartKind } : x))}
                    className="select mt-1.5"
                    style={{ padding: '4px 8px' }}
                  >
                    {(Object.keys(PART_KIND_LABEL) as PartKind[]).map((k) => (
                      <option key={k} value={k}>{PART_KIND_LABEL[k]}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" disabled={!src || !regions.length}><Save size={15} /> {regions.length}개 파츠로 저장</Button>
        </aside>
      </div>
    </div>
  )
}
