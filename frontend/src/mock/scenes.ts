import type { Placement, Scene } from '../types'
import { userName } from './users'
import { parts } from './parts'
import { pawns } from './pawns'

let seq = 300
let pseq = 0
const iso = (d = 0) => new Date(Date.now() - d * 86_400_000).toISOString()

const partId = (name: string) => parts.find((p) => p.name === name)?.id ?? 0
const pawnId = (name: string) => pawns.find((p) => p.name === name)?.id ?? 0

const place = (kind: Placement['kind'], refId: number, x: number, y: number, dir: Placement['direction'] = 'S', scale = 1): Placement => ({
  id: `pl-${++pseq}`, kind, refId, x, y, direction: dir, scale,
})

/** 8x6 잔디 보드 + Pawn 2~3 + 나무·통 */
const grassBoardPlacements = (): Placement[] => {
  const out: Placement[] = []
  const tile = partId('잔디 타일')
  for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) {
    out.push(place('tile', tile, c * 64, r * 64))
  }
  out.push(place('prop', partId('나무'), 64, 64))
  out.push(place('prop', partId('나무'), 384, 256))
  out.push(place('prop', partId('나무통'), 192, 192))
  out.push(place('pawn', pawnId('기사'), 128, 160, 'S'))
  out.push(place('pawn', pawnId('궁수'), 256, 192, 'SW'))
  out.push(place('pawn', pawnId('마법사'), 320, 96, 'E'))
  return out
}

const stoneBoardPlacements = (): Placement[] => {
  const out: Placement[] = []
  const tile = partId('돌바닥 타일')
  for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) out.push(place('tile', tile, c * 64, r * 64))
  out.push(place('prop', partId('보물상자'), 320, 160))
  out.push(place('prop', partId('횃불'), 64, 64))
  out.push(place('prop', partId('횃불'), 448, 64))
  out.push(place('pawn', pawnId('검은 기사'), 256, 192, 'N'))
  return out
}

const sandSurvivorPlacements = (): Placement[] => {
  const out: Placement[] = []
  const tile = partId('모래 타일')
  for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) out.push(place('tile', tile, c * 64, r * 64))
  out.push(place('prop', partId('나무'), 64, 256))
  out.push(place('pawn', pawnId('레인저'), 256, 192, 'S'))
  return out
}

export const scenes: Scene[] = [
  {
    id: ++seq, ownerId: 2, ownerName: userName(2),
    name: '숲의 입구', description: '튜토리얼용 첫 보드. 평화로운 풀밭.',
    genre: 'topdown_rpg',
    config: { bgColor: '#f5f6fb', canvasW: 512, canvasH: 384 },
    placements: grassBoardPlacements(),
    isPublic: true, thumbnailUrl: null,
    playCount: 1284, likeCount: 198, createdAt: iso(7),
  },
  {
    id: ++seq, ownerId: 4, ownerName: userName(4),
    name: '잊혀진 던전', description: '횃불과 보물상자가 있는 좁은 보드.',
    genre: 'tactical',
    config: { bgColor: '#2a2440', canvasW: 512, canvasH: 384 },
    placements: stoneBoardPlacements(),
    isPublic: true, thumbnailUrl: null,
    playCount: 642, likeCount: 117, createdAt: iso(3),
  },
  {
    id: ++seq, ownerId: 3, ownerName: userName(3),
    name: '사막의 추격', description: '오픈 사막에서 적을 피해 살아남기.',
    genre: 'survivor',
    config: { bgColor: '#f0d28a', canvasW: 512, canvasH: 384 },
    placements: sandSurvivorPlacements(),
    isPublic: true, thumbnailUrl: null,
    playCount: 415, likeCount: 92, createdAt: iso(5),
  },
  {
    id: ++seq, ownerId: 5, ownerName: userName(5),
    name: '클리커: 보물상자', description: '상자를 빨리 깨자!',
    genre: 'click',
    config: { bgColor: '#f5f6fb', canvasW: 512, canvasH: 384 },
    placements: [
      place('tile', partId('나무 바닥'), 0, 0),
      place('prop', partId('보물상자'), 224, 144, 'S', 1.5),
    ],
    isPublic: true, thumbnailUrl: null,
    playCount: 220, likeCount: 38, createdAt: iso(10),
  },
  {
    id: ++seq, ownerId: 2, ownerName: userName(2),
    name: '방어전 1막', description: '입구를 막아라.',
    genre: 'defense',
    config: { bgColor: '#f5f6fb', canvasW: 512, canvasH: 384 },
    placements: grassBoardPlacements(),
    isPublic: true, thumbnailUrl: null,
    playCount: 188, likeCount: 41, createdAt: iso(14),
  },

  // 내 씬
  {
    id: ++seq, ownerId: 1, ownerName: userName(1),
    name: '내 테스트 씬', description: '연습용 보드.',
    genre: 'topdown_rpg',
    config: { bgColor: '#f5f6fb', canvasW: 512, canvasH: 384 },
    placements: grassBoardPlacements(),
    isPublic: false, thumbnailUrl: null,
    playCount: 0, likeCount: 0, createdAt: iso(1),
  },
]

export const sceneById = (id: number) => scenes.find((s) => s.id === id)
export const publicScenes = () => scenes.filter((s) => s.isPublic)
export const myScenes = (uid: number) => scenes.filter((s) => s.ownerId === uid)
