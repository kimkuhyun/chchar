/** S5 팔레트의 데모 스프라이트(에너미/함정).
 *  DB v1 의 asset.role 은 char|bg|platform 뿐 → 에너미·함정은 생성 에셋이 아니라
 *  고정 데모(=v1.1 scene_entity 제안 대상). 게임 컨셉(검·점프·함정·에너미) 구현용. */
import type { PlacementKind } from '../types'

export interface DemoSprite {
  kind: Exclude<PlacementKind, 'platform'>
  name: string
  sprite: string
  w: number
  h: number
}

export const demoHazards: DemoSprite[] = [
  { kind: 'spike', name: '스파이크', sprite: '/sample-assets/spike.svg', w: 32, h: 32 },
]

export const demoEnemies: DemoSprite[] = [
  { kind: 'enemy', name: '슬라임', sprite: '/sample-assets/slime.svg', w: 32, h: 32 },
  { kind: 'enemy', name: '박쥐', sprite: '/sample-assets/bat.svg', w: 32, h: 32 },
]

export const goalSprite = '/sample-assets/flag.svg'
