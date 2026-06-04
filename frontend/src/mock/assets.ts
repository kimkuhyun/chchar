import type { Asset, Role } from '../types'
import { userName } from './users'

interface Opt {
  id: number
  owner: number
  role: Role
  file: string
  tags: string[]
  prompt: string
  pub?: boolean
  fav?: boolean
  likes?: number
}
const dim = (role: Role) =>
  role === 'bg' ? { w: 1280, h: 720 } : role === 'platform' ? { w: 96, h: 32 } : { w: 32, h: 40 }

const A = (o: Opt): Asset => {
  const { w, h } = dim(o.role)
  const url = `/sample-assets/${o.file}`
  return {
    id: o.id,
    ownerId: o.owner,
    ownerName: userName(o.owner),
    jobId: null,
    presetId: o.role === 'char' ? 1 : o.role === 'bg' ? 2 : 3,
    role: o.role,
    rawUrl: url,
    processedUrl: url,
    thumbnailUrl: url,
    width: w,
    height: h,
    anchorX: 0.5,
    anchorY: o.role === 'char' ? 1 : 0.5,
    seed: 100000 + o.id * 777,
    prompt: o.prompt,
    status: 'ok',
    favorite: o.fav ?? false,
    isPublic: o.pub ?? false,
    tags: o.tags,
    likeCount: o.likes ?? 0,
    createdAt: '2026-06-02T10:00:00Z',
  }
}

export const seedAssets: Asset[] = [
  // ── 내 에셋 (owner=1) ──
  A({ id: 101, owner: 1, role: 'char', file: 'char-knight.svg', tags: ['기사', '전사', '검'], prompt: '은빛 갑옷의 기사', pub: true, fav: true, likes: 42 }),
  A({ id: 102, owner: 1, role: 'char', file: 'char-knight.svg', tags: ['기사', '은색'], prompt: '은빛 기사 변형' }),
  A({ id: 103, owner: 1, role: 'char', file: 'char-mage.svg', tags: ['마법사', '보라'], prompt: '보라 로브 마법사', pub: true, likes: 18 }),
  A({ id: 104, owner: 1, role: 'char', file: 'char-ninja.svg', tags: ['닌자', '핑크'], prompt: '네온 닌자', pub: true, fav: true, likes: 31 }),
  A({ id: 105, owner: 1, role: 'bg', file: 'bg-forest.svg', tags: ['숲', '낮'], prompt: '초록 숲 배경', pub: true, likes: 12 }),
  A({ id: 106, owner: 1, role: 'bg', file: 'bg-cave.svg', tags: ['동굴', '보라'], prompt: '수정 동굴' }),
  A({ id: 107, owner: 1, role: 'bg', file: 'bg-sky.svg', tags: ['하늘', '노을'], prompt: '노을 하늘섬', pub: true, fav: true, likes: 27 }),
  A({ id: 108, owner: 1, role: 'platform', file: 'plat-grass.svg', tags: ['잔디', '흙'], prompt: '잔디 플랫폼', pub: true, likes: 9 }),
  A({ id: 109, owner: 1, role: 'platform', file: 'plat-grass.svg', tags: ['잔디', '변형'], prompt: '잔디 변형' }),
  A({ id: 110, owner: 1, role: 'platform', file: 'plat-stone.svg', tags: ['돌', '회색'], prompt: '돌 플랫폼', pub: true, likes: 6 }),
  A({ id: 111, owner: 1, role: 'platform', file: 'plat-crystal.svg', tags: ['수정', '시안'], prompt: '수정 플랫폼', pub: true, fav: true, likes: 14 }),
  // ── 다른 제작자 공개 에셋 ──
  A({ id: 201, owner: 2, role: 'char', file: 'char-knight.svg', tags: ['기사', '클래식'], prompt: '클래식 기사', pub: true, likes: 88 }),
  A({ id: 202, owner: 3, role: 'char', file: 'char-mage.svg', tags: ['마법사', '네온'], prompt: '네온 마법사', pub: true, likes: 64 }),
  A({ id: 203, owner: 4, role: 'bg', file: 'bg-cave.svg', tags: ['동굴', '미궁'], prompt: '수정 미궁 배경', pub: true, likes: 120 }),
  A({ id: 204, owner: 2, role: 'platform', file: 'plat-crystal.svg', tags: ['수정', '발광'], prompt: '발광 수정 타일', pub: true, likes: 53 }),
  A({ id: 205, owner: 3, role: 'char', file: 'char-ninja.svg', tags: ['닌자', '그림자'], prompt: '그림자 닌자', pub: true, likes: 47 }),
]

export const assetById = (id: number) => seedAssets.find((a) => a.id === id)
