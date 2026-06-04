import type { Level, Placement, PlacementKind, SceneConfig } from '../types'
import { userName } from './users'

const GRASS = '/sample-assets/plat-grass.svg'
const STONE = '/sample-assets/plat-stone.svg'
const CRYSTAL = '/sample-assets/plat-crystal.svg'
const SLIME = '/sample-assets/slime.svg'
const BAT = '/sample-assets/bat.svg'
const SPIKE = '/sample-assets/spike.svg'

const P = (kind: PlacementKind, sprite: string, x: number, y: number, w: number, h: number, assetId: number | null = null): Placement => ({
  id: `${kind}-${x}-${y}`, kind, assetId, sprite, x, y, w, h, scale: 1,
})
const ground = (sprite = GRASS, assetId = 108): Placement[] =>
  Array.from({ length: 14 }, (_, i) => P('platform', sprite, i * 96, 688, 96, 32, assetId))

const config: SceneConfig = { gravity: 900, jump: 470, speed: 220, canvasW: 1280, canvasH: 720 }

interface LevelOpt {
  id: number; ownerId: number; name: string; description: string
  charId: number; bgId: number; bgFile: string
  placements: Placement[]; visibility: 'public' | 'private'
  playCount?: number; likeCount?: number
}
const L = (o: LevelOpt): Level => ({
  id: o.id, ownerId: o.ownerId, ownerName: userName(o.ownerId), name: o.name, description: o.description,
  characterAssetId: o.charId, backgroundAssetId: o.bgId, config, placements: o.placements,
  playerStart: { x: 64, y: 600 }, goal: { x: 1184, y: 640 },
  visibility: o.visibility, thumbnailUrl: o.bgFile,
  playCount: o.playCount ?? 0, likeCount: o.likeCount ?? 0, createdAt: '2026-06-02T10:00:00Z',
})

export const seedLevels: Level[] = [
  L({
    id: 1, ownerId: 1, name: '숲의 시작', description: '튜토리얼용 첫 레벨. 점프와 검을 익혀보세요.',
    charId: 101, bgId: 105, bgFile: '/sample-assets/bg-forest.svg', visibility: 'public', playCount: 312, likeCount: 24,
    placements: [
      ...ground(GRASS, 108),
      P('platform', GRASS, 288, 560, 96, 32, 108),
      P('platform', CRYSTAL, 576, 456, 96, 32, 111),
      P('platform', STONE, 832, 552, 96, 32, 110),
      P('spike', SPIKE, 448, 656, 32, 32),
      P('enemy', SLIME, 640, 656, 32, 32),
      P('enemy', BAT, 864, 456, 32, 32),
    ],
  }),
  L({
    id: 2, ownerId: 1, name: '비밀 연습장', description: '비공개 초안.', charId: 104, bgId: 107,
    bgFile: '/sample-assets/bg-sky.svg', visibility: 'private', playCount: 0, likeCount: 0,
    placements: [...ground(GRASS, 108), P('platform', CRYSTAL, 480, 520, 96, 32, 111), P('enemy', BAT, 700, 420, 32, 32)],
  }),
  L({
    id: 301, ownerId: 3, name: '네온 동굴 러시', description: '스파이크 지옥. 한 번의 실수도 용납 안 됨.',
    charId: 205, bgId: 203, bgFile: '/sample-assets/bg-cave.svg', visibility: 'public', playCount: 1240, likeCount: 89,
    placements: [
      ...ground(STONE, 110),
      P('platform', STONE, 320, 540, 96, 32, 110),
      P('platform', CRYSTAL, 560, 440, 96, 32, 111),
      P('platform', STONE, 800, 540, 96, 32, 110),
      P('spike', SPIKE, 256, 656, 32, 32), P('spike', SPIKE, 480, 656, 32, 32), P('spike', SPIKE, 704, 656, 32, 32),
      P('enemy', BAT, 600, 380, 32, 32), P('enemy', SLIME, 900, 656, 32, 32),
    ],
  }),
  L({
    id: 302, ownerId: 2, name: '하늘섬 모험', description: '구름 위 플랫폼을 건너 보물에 도달하세요.',
    charId: 201, bgId: 107, bgFile: '/sample-assets/bg-sky.svg', visibility: 'public', playCount: 870, likeCount: 64,
    placements: [
      ...ground(CRYSTAL, 111),
      P('platform', CRYSTAL, 260, 540, 96, 32, 111),
      P('platform', CRYSTAL, 520, 460, 96, 32, 111),
      P('platform', CRYSTAL, 780, 540, 96, 32, 111),
      P('enemy', BAT, 420, 400, 32, 32), P('enemy', BAT, 980, 420, 32, 32),
    ],
  }),
  L({
    id: 303, ownerId: 4, name: '수정 미궁', description: '박쥐 떼를 검으로 베며 미궁을 탈출하라.',
    charId: 202, bgId: 203, bgFile: '/sample-assets/bg-cave.svg', visibility: 'public', playCount: 2100, likeCount: 156,
    placements: [
      ...ground(STONE, 110),
      P('platform', CRYSTAL, 300, 520, 96, 32, 111),
      P('platform', CRYSTAL, 600, 440, 96, 32, 111),
      P('platform', CRYSTAL, 880, 520, 96, 32, 111),
      P('enemy', BAT, 360, 380, 32, 32), P('enemy', BAT, 660, 320, 32, 32), P('enemy', SLIME, 760, 656, 32, 32),
      P('spike', SPIKE, 512, 656, 32, 32),
    ],
  }),
]

export const levelById = (id: number) => seedLevels.find((l) => l.id === id)
export const sampleLevel = seedLevels[0]
