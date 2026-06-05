import type { Direction, PartKind, PawnTemplate, SlotRule } from '../types'

const DIRS: Direction[] = ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW']

/** 보조: SlotRule 기본값 */
const r = (z: number, dx = 0, dy = 0, scale = 1, show = true, mirror = false): SlotRule => ({
  z, dx, dy, scale, show, mirror,
})

/* humanoid: 사람형 paper-doll
   front: S/SE/SW · side: E/W (W는 mirror) · back: N/NE/NW */
function humanoidRules() {
  const out = {} as Record<Direction, Partial<Record<PartKind, SlotRule>>>
  for (const d of DIRS) {
    const isBack = d === 'N' || d === 'NE' || d === 'NW'
    const isSide = d === 'E' || d === 'W'
    const mirror = d === 'W' || d === 'NW' || d === 'SW'

    const slot: Partial<Record<PartKind, SlotRule>> = {
      shadow: r(0, 0, 18, 1),
      body: r(1, 0, 0, 1),
      cape: isBack ? r(2, 0, 4, 1) : r(0.5, 0, 4, 1),
      faction_mark: r(3, 0, 2, 0.5, !isBack),
    }
    // 얼굴/머리/투구
    if (isBack) {
      slot.face_back = r(4, 0, -10, 1)
      slot.hair_back = r(5, 0, -12, 1)
      slot.helmet_back = r(6, 0, -14, 1, false) // 기본 false (장착 시 true)
    } else if (isSide) {
      slot.face_side = r(4, 0, -10, 1, true, mirror)
      slot.hair_side = r(5, 0, -12, 1, true, mirror)
      slot.helmet_side = r(6, 0, -14, 1, false, mirror)
    } else {
      slot.face_front = r(4, 0, -10, 1)
      slot.hair_front = r(5, 0, -12, 1)
      slot.helmet_front = r(6, 0, -14, 1, false)
    }
    // 무기·방패 — 측면일 때 손 위치 차이
    slot.weapon = r(7, isSide ? (mirror ? -14 : 14) : 12, isBack ? 4 : -2, 1, true, mirror)
    slot.shield = r(2.5, isSide ? (mirror ? 12 : -12) : -12, 4, 1, !isBack, mirror)

    out[d] = slot
  }
  return out
}

/* quadruped: 4족 */
function quadrupedRules() {
  const out = {} as Record<Direction, Partial<Record<PartKind, SlotRule>>>
  for (const d of DIRS) {
    const isBack = d === 'N' || d === 'NE' || d === 'NW'
    const mirror = d === 'W' || d === 'NW' || d === 'SW'
    out[d] = {
      shadow: r(0, 0, 16, 1.3),
      body: r(1, 0, 4, 1.3),
      face_front: r(2, 8, -4, 0.8, !isBack, mirror),
      face_back: r(2, -8, -4, 0.8, isBack, mirror),
    }
  }
  return out
}

export const pawnTemplates: PawnTemplate[] = [
  {
    id: 1,
    name: 'humanoid',
    slots: [
      'shadow', 'body', 'cape', 'faction_mark',
      'face_front', 'face_side', 'face_back', 'head_back',
      'hair_front', 'hair_side', 'hair_back',
      'helmet_front', 'helmet_side', 'helmet_back',
      'weapon', 'shield',
    ],
    directionRules: humanoidRules(),
    baseShape: { rx: 14, ry: 18, offsetY: 0 },
    isActive: true,
  },
  {
    id: 2,
    name: 'quadruped',
    slots: ['shadow', 'body', 'face_front', 'face_back'],
    directionRules: quadrupedRules(),
    baseShape: { rx: 22, ry: 12, offsetY: 4 },
    isActive: true,
  },
]

export const templateById = (id: number) => pawnTemplates.find((t) => t.id === id)
