import { useEffect, useMemo, useRef, useState } from 'react'
import type { Pawn, Placement, Scene } from '../types'
import { partById } from '../mock/parts'
import { pawnById } from '../mock/pawns'
import { templateById } from '../mock/templates'
import PawnCanvas from './PawnCanvas'

interface Props {
  scene: Scene
  /** width 픽셀 (height는 비율로 자동) */
  width?: number
  /** 컨테이너에 꽉 채우기 */
  fit?: boolean
  animate?: 'idle' | 'walk' | 'none'
  /** 선택된 placement id (편집 가이드) */
  selected?: string | null
  onPick?: (id: string | null) => void
}

export default function SceneStage({
  scene, width: widthProp, fit, animate = 'idle', selected, onPick,
}: Props) {
  const wrap = useRef<HTMLDivElement | null>(null)
  const [containerW, setContainerW] = useState<number>(widthProp ?? scene.config.canvasW)

  useEffect(() => {
    if (!fit) return
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setContainerW(Math.floor(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [fit])

  const scale = containerW / scene.config.canvasW
  const height = scene.config.canvasH * scale

  const sortedPlacements = useMemo(() => sortForRender(scene.placements), [scene.placements])

  return (
    <div ref={wrap} className="relative w-full" onClick={() => onPick?.(null)}>
      <div
        className="relative overflow-hidden"
        style={{
          width: containerW, height,
          background: scene.config.bgColor,
          backgroundImage: scene.config.bgImage ? `url(${scene.config.bgImage})` : undefined,
        }}
      >
        {sortedPlacements.map((p) => {
          const isSel = selected === p.id
          const x = p.x * scale
          const y = p.y * scale
          if (p.kind === 'tile' || p.kind === 'prop') {
            const part = partById(p.refId)
            if (!part) return null
            const size = 64 * scale * p.scale
            return (
              <img
                key={p.id}
                src={part.url}
                alt={part.name}
                draggable={false}
                onClick={(e) => { e.stopPropagation(); onPick?.(p.id) }}
                className={onPick ? 'cursor-pointer' : ''}
                style={{
                  position: 'absolute', left: x, top: y, width: size, height: size,
                  outline: isSel ? '2px solid var(--color-primary)' : 'none',
                  outlineOffset: 2,
                  pointerEvents: onPick ? 'auto' : 'none',
                }}
              />
            )
          }
          // pawn
          const pawn: Pawn | undefined = pawnById(p.refId)
          if (!pawn) return null
          const template = templateById(pawn.templateId)
          if (!template) return null
          const size = 64 * scale * p.scale
          return (
            <div
              key={p.id}
              onClick={(e) => { e.stopPropagation(); onPick?.(p.id) }}
              style={{
                position: 'absolute', left: x, top: y,
                outline: isSel ? '2px solid var(--color-primary)' : 'none',
                outlineOffset: 2,
                cursor: onPick ? 'pointer' : 'default',
              }}
            >
              <PawnCanvas pawn={pawn} template={template} direction={p.direction} size={size} animate={animate} bg="transparent" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Y가 큰 것이 앞에 그려지도록 + tile은 가장 뒤 */
function sortForRender(arr: Placement[]) {
  return [...arr].sort((a, b) => {
    if (a.kind !== b.kind) {
      const order = { tile: 0, prop: 1, pawn: 2 } as const
      return order[a.kind] - order[b.kind]
    }
    return a.y - b.y
  })
}
