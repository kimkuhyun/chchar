import type { Pawn, PartKind } from '../types'
import { userName } from './users'
import { parts } from './parts'

let seq = 200
const iso = (d = 0) => new Date(Date.now() - d * 86_400_000).toISOString()

/** kind로 첫 공식 파츠 찾기 (mock 편의) */
const pick = (kind: PartKind, ownerNull = true) =>
  parts.find((p) => p.kind === kind && (ownerNull ? p.ownerId === null : true))?.id ?? 0

const baseHumanoid = (
  name: string,
  ownerId: number,
  body: string,
  faction: string,
  weapon: PartKind | null,
  helmet = false,
  extra: Partial<Pawn> = {},
): Pawn => {
  const composition: Pawn['composition'] = {
    shadow: pick('shadow'),
    body: pick('body'),
    face_front: pick('face_front'),
    face_side: pick('face_side'),
    face_back: pick('face_back'),
    hair_front: pick('hair_front'),
    hair_side: pick('hair_side'),
    hair_back: pick('hair_back'),
  }
  if (helmet) {
    composition.helmet_front = pick('helmet_front')
    composition.helmet_side = pick('helmet_side')
    composition.helmet_back = pick('helmet_back')
  }
  if (weapon) composition.weapon = pick(weapon)
  return {
    id: ++seq,
    ownerId,
    ownerName: userName(ownerId),
    templateId: 1,
    name,
    bodyColor: body,
    factionColor: faction,
    scale: 1,
    composition,
    tints: {},
    thumbnailUrl: null,
    isPublic: ownerId !== 1, // 다른 사용자는 기본 공개
    likeCount: Math.floor(Math.random() * 200),
    createdAt: iso(Math.floor(Math.random() * 12)),
    ...extra,
  }
}

export const pawns: Pawn[] = [
  baseHumanoid('기사', 2, '#c8a07a', '#6d5efc', 'weapon', true, { likeCount: 412, isPublic: true }),
  baseHumanoid('궁수', 3, '#e9c1a0', '#15bd8e', 'weapon', false, { likeCount: 287, isPublic: true,
    composition: {
      shadow: pick('shadow'), body: pick('body'),
      face_front: pick('face_front'), face_side: pick('face_side'), face_back: pick('face_back'),
      hair_front: pick('hair_front'), hair_side: pick('hair_side'), hair_back: pick('hair_back'),
      weapon: parts.find((p) => p.name === '단궁')?.id ?? 0,
      cape: parts.find((p) => p.name === '파랑 망토')?.id ?? 0,
    }}),
  baseHumanoid('마법사', 4, '#f4d3b8', '#8a7bff', 'weapon', false, { likeCount: 198, isPublic: true,
    composition: {
      shadow: pick('shadow'), body: pick('body'),
      face_front: pick('face_front'), face_side: pick('face_side'), face_back: pick('face_back'),
      hair_front: pick('hair_front'), hair_side: pick('hair_side'), hair_back: pick('hair_back'),
      weapon: parts.find((p) => p.name === '마법 지팡이')?.id ?? 0,
      cape: parts.find((p) => p.name === '붉은 망토')?.id ?? 0,
    }}),
  baseHumanoid('검은 기사', 4, '#a07a5a', '#1b2140', 'weapon', true, { likeCount: 365, isPublic: true,
    composition: {
      shadow: pick('shadow'), body: pick('body'),
      face_front: pick('face_front'), face_side: pick('face_side'), face_back: pick('face_back'),
      hair_front: pick('hair_front'), hair_side: pick('hair_side'), hair_back: pick('hair_back'),
      helmet_front: pick('helmet_front'), helmet_side: pick('helmet_side'), helmet_back: pick('helmet_back'),
      weapon: parts.find((p) => p.name === '롱소드')?.id ?? 0,
      cape: parts.find((p) => p.name === '내 보라 망토')?.id ?? parts.find((p) => p.name === '붉은 망토')?.id ?? 0,
      faction_mark: pick('faction_mark'),
    }}),
  baseHumanoid('레인저', 3, '#e9c1a0', '#15bd8e', 'weapon', false, { likeCount: 92, isPublic: true,
    composition: {
      shadow: pick('shadow'), body: pick('body'),
      face_front: pick('face_front'), face_side: pick('face_side'), face_back: pick('face_back'),
      hair_front: parts.find((p) => p.name === '금발(앞)')?.id ?? pick('hair_front'),
      hair_side: pick('hair_side'), hair_back: pick('hair_back'),
      weapon: parts.find((p) => p.name === '단궁')?.id ?? 0,
    }}),
  baseHumanoid('수습 마법사', 5, '#f4d3b8', '#15c2e8', 'weapon', false, { likeCount: 47, isPublic: true,
    composition: {
      shadow: pick('shadow'), body: pick('body'),
      face_front: pick('face_front'), face_side: pick('face_side'), face_back: pick('face_back'),
      hair_front: pick('hair_front'), hair_side: pick('hair_side'), hair_back: pick('hair_back'),
      weapon: parts.find((p) => p.name === '마법 지팡이')?.id ?? 0,
    }}),

  // 내 Pawn 두 개
  baseHumanoid('내 첫 캐릭터', 1, '#c8a07a', '#6d5efc', 'weapon', false, { likeCount: 3, isPublic: false }),
  baseHumanoid('실험: 푸른머리', 1, '#f4d3b8', '#15c2e8', null, false, { likeCount: 0, isPublic: false,
    composition: {
      shadow: pick('shadow'), body: pick('body'),
      face_front: pick('face_front'), face_side: pick('face_side'), face_back: pick('face_back'),
      hair_front: parts.find((p) => p.name === '실험: 푸른 머리')?.id ?? pick('hair_front'),
      hair_side: pick('hair_side'), hair_back: pick('hair_back'),
    }}),
]

export const pawnById = (id: number) => pawns.find((p) => p.id === id)
export const publicPawns = () => pawns.filter((p) => p.isPublic)
export const myPawns = (uid: number) => pawns.filter((p) => p.ownerId === uid)
