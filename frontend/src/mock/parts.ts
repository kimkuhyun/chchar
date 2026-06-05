import type { AssetPart, PartKind } from '../types'
import { userName } from './users'
import {
  svgBody, svgShadow, svgFaceFront, svgFaceSide, svgFaceBack,
  svgHairFront, svgHairSide, svgHairBack,
  svgHelmetFront, svgHelmetSide, svgHelmetBack,
  svgWeaponSword, svgWeaponBow, svgWeaponStaff, svgShield, svgCape, svgFactionMark,
  svgTileGrass, svgTileStone, svgTileSand, svgTileWood,
  svgPropBarrel, svgPropTree, svgPropChest, svgPropTorch, svgEffectSpark,
} from './svg'

let seq = 100
const iso = (offsetMin = 0) =>
  new Date(Date.now() - offsetMin * 60_000).toISOString()

const make = (
  ownerId: number | null,
  kind: PartKind,
  name: string,
  url: string,
  opts: Partial<AssetPart> = {},
): AssetPart => ({
  id: ++seq,
  ownerId,
  ownerName: ownerId ? userName(ownerId) : '공식',
  kind,
  name,
  url,
  thumbnailUrl: url,
  width: 64,
  height: 64,
  anchorX: 0.5,
  anchorY: 0.5,
  transparent: true,
  sourceWorkflowId: 1,
  prompt: '',
  seed: Math.floor(Math.random() * 900000),
  status: 'ok',
  isPublic: ownerId == null,
  tags: [],
  likeCount: Math.floor(Math.random() * 80),
  createdAt: iso(Math.floor(Math.random() * 60 * 24 * 14)),
  ...opts,
})

export const parts: AssetPart[] = [
  /* ── 공식 라이브러리 (owner null, is_public 자동 true) ── */

  // 몸체·그림자·망토·마크
  make(null, 'body', '기본 몸체', svgBody('#c8a07a'), { tags: ['기본', '인간'] }),
  make(null, 'body', '엘프 몸체', svgBody('#e9c1a0'), { tags: ['엘프'] }),
  make(null, 'shadow', '기본 그림자', svgShadow()),
  make(null, 'cape', '붉은 망토', svgCape('#ff5470'), { tags: ['장식'] }),
  make(null, 'cape', '파랑 망토', svgCape('#15c2e8')),
  make(null, 'faction_mark', '별 마크', svgFactionMark('#15c2e8'), { tags: ['진영'] }),

  // 얼굴
  make(null, 'face_front', '기본 얼굴(앞)', svgFaceFront()),
  make(null, 'face_side', '기본 얼굴(옆)', svgFaceSide()),
  make(null, 'face_back', '기본 뒤통수', svgFaceBack()),

  // 머리
  make(null, 'hair_front', '단발(앞)', svgHairFront('#3a2f1f')),
  make(null, 'hair_side', '단발(옆)', svgHairSide('#3a2f1f')),
  make(null, 'hair_back', '단발(뒤)', svgHairBack('#3a2f1f')),
  make(null, 'hair_front', '금발(앞)', svgHairFront('#e8c878')),

  // 투구
  make(null, 'helmet_front', '강철투구(앞)', svgHelmetFront('#7c8295')),
  make(null, 'helmet_side', '강철투구(옆)', svgHelmetSide('#7c8295')),
  make(null, 'helmet_back', '강철투구(뒤)', svgHelmetBack('#7c8295')),

  // 무기·방패
  make(null, 'weapon', '롱소드', svgWeaponSword(), { tags: ['검'] }),
  make(null, 'weapon', '단궁', svgWeaponBow(), { tags: ['활'] }),
  make(null, 'weapon', '마법 지팡이', svgWeaponStaff(), { tags: ['지팡이'] }),
  make(null, 'shield', '카이트 실드', svgShield('#6d5efc')),

  // 월드 — 타일
  make(null, 'tile', '잔디 타일', svgTileGrass(), { tags: ['지형', '풀'] }),
  make(null, 'tile', '돌바닥 타일', svgTileStone(), { tags: ['지형'] }),
  make(null, 'tile', '모래 타일', svgTileSand(), { tags: ['지형', '사막'] }),
  make(null, 'tile', '나무 바닥', svgTileWood(), { tags: ['지형', '실내'] }),

  // 월드 — prop·effect
  make(null, 'prop', '나무통', svgPropBarrel(), { tags: ['오브젝트'] }),
  make(null, 'prop', '나무', svgPropTree(), { tags: ['자연'] }),
  make(null, 'prop', '보물상자', svgPropChest(), { tags: ['보물'] }),
  make(null, 'prop', '횃불', svgPropTorch(), { tags: ['조명'] }),
  make(null, 'effect', '스파크', svgEffectSpark(), { tags: ['이펙트'] }),

  /* ── 사용자 #1 (나) ── */
  make(1, 'weapon', '내 마법검', svgWeaponSword('#ffd24d', '#15c2e8'), { isPublic: false, tags: ['검'] }),
  make(1, 'cape', '내 보라 망토', svgCape('#8a7bff'), { isPublic: true, tags: ['장식'] }),
  make(1, 'hair_front', '실험: 푸른 머리', svgHairFront('#15c2e8'), { isPublic: false }),

  /* ── 다른 사용자 공개 ── */
  make(2, 'weapon', 'PF · 거대 도끼', svgWeaponSword('#f59e2e', '#1b2140'), { isPublic: true, tags: ['도끼'] }),
  make(3, 'prop', 'Armoria · 신비한 보물', svgPropChest(), { isPublic: true, tags: ['보물'] }),
  make(4, 'cape', 'rimwight · 검은 망토', svgCape('#1b2140'), { isPublic: true }),
  make(5, 'tile', '타일스미스 · 보랏빛 돌', svgTileStone(), { isPublic: true, tags: ['지형'] }),
]

export const partById = (id: number) => parts.find((p) => p.id === id)
export const partsByKind = (kind: PartKind) => parts.filter((p) => p.kind === kind)
export const officialParts = () => parts.filter((p) => p.ownerId == null)
export const myParts = (uid: number) => parts.filter((p) => p.ownerId === uid)
export const publicPartsByOthers = (uid: number) =>
  parts.filter((p) => p.isPublic && p.ownerId !== uid && p.ownerId !== null)
