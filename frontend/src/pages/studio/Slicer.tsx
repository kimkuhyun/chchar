import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Scissors, Upload, Download, FlipHorizontal2, Play, Pause, Trash2, RotateCcw, Info,
} from 'lucide-react'
import Button from '../../ui/Button'

type Region = { id: number; x: number; y: number; w: number; h: number }
type Dir = 'down' | 'up' | 'left' | 'right'
type Frame = { rid: number; mirror: boolean }

const DIRS: Dir[] = ['down', 'up', 'left', 'right']
const DIR_LABEL: Record<Dir, string> = { down: '정면 ↓', up: '뒤 ↑', left: '왼쪽 ←', right: '오른쪽 →' }
const SAMPLE = '/sample-assets/sample-sheet.png'

/** 알파 기준 연결성분 → figure 박스 자동 검출 */
function detectRegions(cv: HTMLCanvasElement): Region[] {
  const W = cv.width, H = cv.height, N = W * H
  const ctx = cv.getContext('2d', { willReadFrequently: true })!
  const data = ctx.getImageData(0, 0, W, H).data
  let fg = new Uint8Array(N)
  for (let i = 0; i < N; i++) fg[i] = data[i * 4 + 3] > 24 ? 1 : 0
  // 살짝 팽창(끊긴 외곽선 잇기)
  for (let k = 0; k < 3; k++) {
    const nx = new Uint8Array(N)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x
      if (fg[i] || (x > 0 && fg[i - 1]) || (x < W - 1 && fg[i + 1]) || (y > 0 && fg[i - W]) || (y < H - 1 && fg[i + W])) nx[i] = 1
    }
    fg = nx
  }
  const seen = new Uint8Array(N)
  const stack = new Int32Array(N)
  const out: Region[] = []
  for (let p = 0; p < N; p++) {
    if (!fg[p] || seen[p]) continue
    let sp = 0; stack[sp++] = p; seen[p] = 1
    let minx = W, miny = H, maxx = 0, maxy = 0, count = 0
    while (sp > 0) {
      const c = stack[--sp], cx = c % W, cy = (c / W) | 0
      if (cx < minx) minx = cx; if (cx > maxx) maxx = cx
      if (cy < miny) miny = cy; if (cy > maxy) maxy = cy
      count++
      const nb = [c - 1, c + 1, c - W, c + W, c - W - 1, c - W + 1, c + W - 1, c + W + 1]
      for (let j = 0; j < 8; j++) {
        const n = nb[j]
        if (n < 0 || n >= N) continue
        if (Math.abs((n % W) - cx) > 1) continue
        if (fg[n] && !seen[n]) { seen[n] = 1; stack[sp++] = n }
      }
    }
    const w = maxx - minx + 1, h = maxy - miny + 1
    if (w < 55 || h < 75 || count < 2200) continue
    out.push({ id: 0, x: minx, y: miny, w, h })
  }
  out.sort((a, b) => (a.y >> 7) - (b.y >> 7) || a.x - b.x)
  return out.map((r, i) => ({ ...r, id: i }))
}

/** region을 (cw,ch) 셀에 비율유지·하단중앙·옵션거울로 그림 */
function drawFrame(ctx: CanvasRenderingContext2D, src: CanvasImageSource, r: Region, mirror: boolean, cw: number, ch: number) {
  const s = Math.min(cw / r.w, ch / r.h)
  const dw = r.w * s, dh = r.h * s
  const dx = (cw - dw) / 2, dy = ch - dh
  ctx.save()
  if (mirror) { ctx.translate(dx + dw, dy); ctx.scale(-1, 1); ctx.drawImage(src, r.x, r.y, r.w, r.h, 0, 0, dw, dh) }
  else ctx.drawImage(src, r.x, r.y, r.w, r.h, dx, dy, dw, dh)
  ctx.restore()
}

function download(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export default function Slicer() {
  const [imgUrl, setImgUrl] = useState(SAMPLE)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [regions, setRegions] = useState<Region[]>([])
  const [frames, setFrames] = useState<Record<Dir, Frame[]>>({ down: [], up: [], left: [], right: [] })
  const [active, setActive] = useState<Dir>('down')
  const [hover, setHover] = useState<number | null>(null)
  const [playing, setPlaying] = useState(true)
  const [fps, setFps] = useState(6)

  const srcCanvas = useRef<HTMLCanvasElement | null>(null)
  const previewRef = useRef<HTMLCanvasElement | null>(null)
  const tick = useRef(0)

  // 이미지 로드 → 오프스크린 캔버스 + 자동 검출
  useEffect(() => {
    let alive = true
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (!alive) return
      const cv = document.createElement('canvas')
      cv.width = img.naturalWidth; cv.height = img.naturalHeight
      cv.getContext('2d')!.drawImage(img, 0, 0)
      srcCanvas.current = cv
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
      setRegions(detectRegions(cv))
      setFrames({ down: [], up: [], left: [], right: [] })
    }
    img.src = imgUrl
    return () => { alive = false }
  }, [imgUrl])

  // 미리보기 애니메이션
  useEffect(() => {
    const cv = previewRef.current; if (!cv) return
    const ctx = cv.getContext('2d')!
    const render = () => {
      ctx.clearRect(0, 0, cv.width, cv.height)
      const fs = frames[active]
      if (!fs.length || !srcCanvas.current) return
      const f = fs[tick.current % fs.length]
      const r = regions[f.rid]; if (r) drawFrame(ctx, srcCanvas.current, r, f.mirror, cv.width, cv.height)
    }
    render()
    if (!playing || frames[active].length < 2) return
    const id = window.setInterval(() => { tick.current++; render() }, 1000 / fps)
    return () => window.clearInterval(id)
  }, [frames, active, regions, playing, fps])

  const addFrame = useCallback((rid: number) => {
    setFrames((p) => ({ ...p, [active]: [...p[active], { rid, mirror: false }] }))
  }, [active])
  const removeFrame = (dir: Dir, i: number) => setFrames((p) => ({ ...p, [dir]: p[dir].filter((_, j) => j !== i) }))
  const clearDir = (dir: Dir) => setFrames((p) => ({ ...p, [dir]: [] }))
  const mirrorFromLeft = () => setFrames((p) => ({ ...p, right: p.left.map((f) => ({ rid: f.rid, mirror: !f.mirror })) }))

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) setImgUrl(URL.createObjectURL(f))
  }

  // 셀 크기 = 사용된 프레임들의 최대 박스
  const cell = useMemo(() => {
    let cw = 1, ch = 1
    for (const d of DIRS) for (const f of frames[d]) { const r = regions[f.rid]; if (r) { cw = Math.max(cw, r.w); ch = Math.max(ch, r.h) } }
    return { cw: Math.ceil(cw), ch: Math.ceil(ch) }
  }, [frames, regions])
  const cols = Math.max(1, ...DIRS.map((d) => frames[d].length))
  const totalFrames = DIRS.reduce((n, d) => n + frames[d].length, 0)

  const exportSheet = () => {
    if (!srcCanvas.current || !totalFrames) return
    const { cw, ch } = cell
    const cv = document.createElement('canvas')
    cv.width = cw * cols; cv.height = ch * DIRS.length
    const ctx = cv.getContext('2d')!
    DIRS.forEach((d, row) => frames[d].forEach((f, col) => {
      const r = regions[f.rid]; if (r) { ctx.save(); ctx.translate(col * cw, row * ch); drawFrame(ctx, srcCanvas.current!, r, f.mirror, cw, ch); ctx.restore() }
    }))
    cv.toBlob((b) => b && download(b, 'spritesheet.png'), 'image/png')
    const meta = { frameWidth: cw, frameHeight: ch, columns: cols, rows: DIRS.length, order: DIRS, fps, frames: Object.fromEntries(DIRS.map((d) => [d, frames[d].length])) }
    download(new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' }), 'spritesheet.json')
  }

  return (
    <div className="flex h-screen flex-col">
      {/* 상단 바 */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-line)] bg-white/85 px-5 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2 font-semibold">
          <span className="brand-bg grid h-7 w-7 place-items-center rounded-lg text-white"><Scissors size={15} /></span>
          스프라이트 슬라이서
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--color-line2)] bg-white px-3 py-1.5 text-sm hover:border-[var(--color-primary)]">
          <Upload size={14} /> 시트 불러오기
          <input type="file" accept="image/png,image/webp" onChange={onUpload} className="hidden" />
        </label>
        <button onClick={() => setImgUrl(SAMPLE)} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-line2)] px-3 py-1.5 text-sm text-[var(--color-dim)] hover:text-[var(--color-ink)]">
          <RotateCcw size={14} /> 샘플
        </button>
        <span className="text-xs text-[var(--color-faint)]">검출 {regions.length}개 · 프레임 {totalFrames}개</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" onClick={() => setPlaying((v) => !v)}>{playing ? <Pause size={15} /> : <Play size={15} />} {fps}fps</Button>
          <input type="range" min={2} max={12} value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-20" />
          <Button onClick={exportSheet}><Download size={16} /> 시트 내보내기</Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* 좌측: 미리보기 + 방향 레인 */}
        <aside className="w-[300px] shrink-0 space-y-4 overflow-y-auto border-r border-[var(--color-line)] bg-white p-4">
          <div>
            <div className="mb-1.5 text-xs font-semibold text-[var(--color-dim)]">미리보기 · {DIR_LABEL[active]}</div>
            <div className="grid place-items-center rounded-xl border border-[var(--color-line)] py-3" style={{ background: 'repeating-conic-gradient(#eef0f4 0% 25%, #fff 0% 50%) 0 0 / 22px 22px' }}>
              <canvas ref={previewRef} width={120} height={150} className="h-[150px] w-[120px]" />
            </div>
            {frames[active].length === 0 && <div className="mt-1.5 text-center text-[11px] text-[var(--color-faint)]">오른쪽에서 캐릭터를 클릭해 추가</div>}
          </div>

          <div className="space-y-2">
            {DIRS.map((d) => (
              <div key={d} className={`rounded-xl border p-2 transition ${active === d ? 'border-[var(--color-primary)] bg-[rgba(109,94,252,0.05)]' : 'border-[var(--color-line2)]'}`}>
                <button onClick={() => { setActive(d); tick.current = 0 }} className="mb-1.5 flex w-full items-center gap-2 text-sm font-semibold">
                  <span className={active === d ? 'text-[var(--color-primary)]' : ''}>{DIR_LABEL[d]}</span>
                  <span className="text-[11px] font-normal text-[var(--color-faint)]">{frames[d].length}프레임</span>
                  {d === 'right' && (
                    <span onClick={(e) => { e.stopPropagation(); mirrorFromLeft() }} title="왼쪽을 거울로 복사" className="ml-auto flex items-center gap-1 rounded-md border border-[var(--color-line2)] px-1.5 py-0.5 text-[10px] text-[var(--color-dim)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                      <FlipHorizontal2 size={11} /> 거울
                    </span>
                  )}
                  {frames[d].length > 0 && d !== 'right' && (
                    <span onClick={(e) => { e.stopPropagation(); clearDir(d) }} className="ml-auto text-[var(--color-faint)] hover:text-[var(--color-danger)]"><Trash2 size={13} /></span>
                  )}
                </button>
                <div className="flex flex-wrap gap-1.5">
                  {frames[d].map((f, i) => {
                    const r = regions[f.rid]
                    return (
                      <button key={i} onClick={() => removeFrame(d, i)} title="클릭해 제거" className="group relative h-12 w-10 overflow-hidden rounded-md border border-[var(--color-line2)] bg-[var(--color-surface2)]">
                        {r && srcCanvas.current && <FrameThumb src={srcCanvas.current} r={r} mirror={f.mirror} />}
                        <span className="absolute inset-0 hidden place-items-center bg-black/40 text-white group-hover:grid"><Trash2 size={12} /></span>
                      </button>
                    )
                  })}
                  {frames[d].length === 0 && <span className="py-1.5 text-[11px] text-[var(--color-faint)]">비었음</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-1.5 rounded-lg bg-[var(--color-surface2)] p-2.5 text-[11px] text-[var(--color-dim)]">
            <Info size={13} className="mt-0.5 shrink-0" />
            <span>방향 선택 → 오른쪽 시트에서 캐릭터 클릭 = 그 방향 프레임 추가. 여러 개 넣으면 걷기 애니. <b>오른쪽=왼쪽 거울</b> 버튼으로 반대편 자동.</span>
          </div>
        </aside>

        {/* 우측: 시트 + 검출 박스 */}
        <div className="flex min-w-0 flex-1 items-start justify-center overflow-auto p-6" style={{ background: 'repeating-conic-gradient(#e7e9ef 0% 25%, #fbfbfd 0% 50%) 0 0 / 24px 24px' }}>
          <div className="relative w-full max-w-[680px] rounded-lg shadow-sm">
            <img src={imgUrl} alt="sheet" className="block w-full select-none rounded-lg" draggable={false} />
            {imgSize.w > 0 && regions.map((r) => {
              const used = frames[active].findIndex((f) => f.rid === r.id)
              return (
                <button
                  key={r.id}
                  onClick={() => addFrame(r.id)}
                  onMouseEnter={() => setHover(r.id)}
                  onMouseLeave={() => setHover((h) => (h === r.id ? null : h))}
                  className="absolute rounded-md transition"
                  style={{
                    left: `${(r.x / imgSize.w) * 100}%`, top: `${(r.y / imgSize.h) * 100}%`,
                    width: `${(r.w / imgSize.w) * 100}%`, height: `${(r.h / imgSize.h) * 100}%`,
                    outline: used >= 0 ? '2px solid var(--color-primary)' : hover === r.id ? '2px solid rgba(109,94,252,0.7)' : '1.5px dashed rgba(109,94,252,0.35)',
                    background: hover === r.id ? 'rgba(109,94,252,0.12)' : used >= 0 ? 'rgba(109,94,252,0.06)' : 'transparent',
                  }}
                >
                  {used >= 0 && (
                    <span className="absolute left-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white shadow">{used + 1}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/** 프레임 썸네일(작은 캔버스) */
function FrameThumb({ src, r, mirror }: { src: CanvasImageSource; r: Region; mirror: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d')!; ctx.clearRect(0, 0, cv.width, cv.height)
    drawFrame(ctx, src, r, mirror, cv.width, cv.height)
  }, [src, r, mirror])
  return <canvas ref={ref} width={40} height={48} className="h-full w-full" />
}
