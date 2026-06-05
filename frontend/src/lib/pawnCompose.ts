import type { AssetPart, Direction, Pawn, PartKind, PawnTemplate, SlotRule } from '../types'

export interface ComposeLayer {
  partId: number
  url: string
  slot: PartKind
  rule: SlotRule
  tint?: string
}

/**
 * Pawn + Template + 방향 → 화면에 그릴 레이어 배열 (z 오름차순 정렬).
 * 누락 슬롯(파츠 미장착) 또는 show:false 슬롯은 제외.
 * 측면 mirror가 true면 PawnCanvas가 scaleX(-1)로 그림.
 */
export function composePawn(
  pawn: Pawn,
  template: PawnTemplate,
  direction: Direction,
  resolvePart: (id: number) => AssetPart | undefined,
): ComposeLayer[] {
  const rules = template.directionRules[direction] || {}
  const layers: ComposeLayer[] = []
  for (const slot of template.slots) {
    const rule = rules[slot]
    if (!rule || !rule.show) continue
    const partId = pawn.composition[slot]
    if (!partId) continue
    const part = resolvePart(partId)
    if (!part) continue
    layers.push({ partId, url: part.url, slot, rule, tint: pawn.tints[slot] })
  }
  return layers.sort((a, b) => a.rule.z - b.rule.z)
}
