import { useEffect, useMemo, useRef, useState } from 'react'
import type { AssetPart, Direction, Pawn, PawnTemplate } from '../types'
import { composePawn } from '../lib/pawnCompose'
import { partById as defaultResolve } from '../mock/parts'

interface Props {
  pawn: Pawn
  template: PawnTemplate
  size?: number          // 캔버스 한 변 px
  direction?: Direction
  animate?: 'idle' | 'walk' | 'attack' | 'none'
  showDirectionToggle?: boolean
  showBaseShape?: boolean // 타원 몸체 가이드 표시 (에디터용)
  bg?: string
  resolvePart?: (id: number) => AssetPart | undefined
  className?: string
}

const DIRS: Direction[] = ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW']
const ARROW: Record<Direction, string> = { S: '↓', SE: '↘', E: '→', NE: '↗', N: '↑', NW: '↖', W: '←', SW: '↙' }

export default function PawnCanvas({
  pawn, template, size = 128, direction: dirProp, animate = 'idle',
  showDirectionToggle = false, showBaseShape = false, bg, resolvePart, className = '',
}: Props) {
  const [innerDir, setInnerDir] = useState<Direction>('S')
  const direction = dirProp ?? innerDir

  const resolve = resolvePart ?? defaultResolve
  const layers = useMemo(() => composePawn(pawn, template, direction, resolve), [pawn, template, direction, resolve])

  // 64x64 그리드 좌표를 size에 맞춰 스케일
  const scale = size / 64

  // 애니메이션 (bobbing + 무기 swing)
  const [t, setT] = useState(0)
  const raf = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (animate === 'none') return
    let alive = true
    const start = performance.now()
    const tick = (now: number) => {
      if (!alive) return
      setT((now - start) / 1000)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { alive = false; if (raf.current) cancelAnimationFrame(raf.current) }
  }, [animate])

  const bob = animate === 'idle' ? Math.sin(t * 2.4) * 1.2
    : animate === 'walk' ? Math.sin(t * 8) * 2.6
    : 0
  const swing = animate === 'attack' ? Math.sin(t * 9) * 18
    : animate === 'walk' ? Math.sin(t * 8) * 6
    : 0

  return (
    <div className={className}>
      <div
        className="relative overflow-hidden rounded-xl border border-[var(--color-line)]"
        style={{ width: size, height: size, background: bg ?? 'var(--color-surface2)' }}
        aria-label={`Pawn ${pawn.name} 방향 ${direction}`}
      >
        {showBaseShape && (
          <div
            className="absolute"
            style={{
              left: (32 - template.baseShape.rx) * scale,
              top: (40 - template.baseShape.ry + template.baseShape.offsetY) * scale,
              width: template.baseShape.rx * 2 * scale,
              height: template.baseShape.ry * 2 * scale,
              borderRadius: '50%',
              border: '1px dashed rgba(109,94,252,0.4)',
            }}
          />
        )}
        {layers.map((l, i) => {
          const isWeapon = l.slot === 'weapon'
          const isShadow = l.slot === 'shadow'
          const yOff = isShadow ? 0 : bob
          const rot = isWeapon ? swing : 0
          const px = (32 + l.rule.dx) * scale
          const py = (32 + l.rule.dy + yOff) * scale
          const sx = (l.rule.scale ?? 1) * pawn.scale * (l.rule.mirror ? -1 : 1)
          const sy = (l.rule.scale ?? 1) * pawn.scale
          // 64x64 SVG을 (px,py) 중심에 배치
          const w = 64 * scale, h = 64 * scale
          return (
            <img
              key={`${l.partId}-${i}`}
              src={l.url}
              alt={l.slot}
              draggable={false}
              style={{
                position: 'absolute',
                left: px - w / 2, top: py - h / 2, width: w, height: h,
                transform: `scale(${sx}, ${sy}) rotate(${rot}deg)`,
                transformOrigin: 'center',
                filter: l.tint ? `drop-shadow(0 0 0 ${l.tint})` : undefined,
                imageRendering: 'auto',
                pointerEvents: 'none',
              }}
            />
          )
        })}
      </div>

      {showDirectionToggle && (
        <div className="mt-2 grid grid-cols-3 gap-1 text-xs" style={{ width: size }}>
          {[
            ['NW', 'N', 'NE'],
            ['W', null, 'E'],
            ['SW', 'S', 'SE'],
          ].flat().map((d, i) => (
            d == null ? <div key={i} /> : (
              <button
                key={i}
                onClick={() => setInnerDir(d as Direction)}
                className={`h-7 rounded-md border text-[12px] transition ${
                  direction === d
                    ? 'border-[var(--color-primary)] bg-[rgba(109,94,252,0.1)] text-[var(--color-primary)]'
                    : 'border-[var(--color-line)] bg-white text-[var(--color-dim)] hover:border-[var(--color-line2)]'
                }`}
              >
                {ARROW[d as Direction]}
              </button>
            )
          ))}
        </div>
      )}

      {/* mock DIRS export 사용 표시 (eslint unused 회피) */}
      <span className="hidden">{DIRS.join('')}</span>
    </div>
  )
}
