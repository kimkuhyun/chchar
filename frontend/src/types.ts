/* ============================================================
   chchar 공유 타입 — 서비스 DB v5 (docs/ERD.md) 7차 paper-doll Pawn
   12테이블과 1:1 (snake_case ↔ camelCase 매핑은 lib/api에서 처리)
   ============================================================ */

/* ─────────── DB 타입 (12테이블) ─────────── */

export interface User {
  id: number
  handle: string
  email: string
  displayName: string
  avatarUrl?: string | null
  plan: 'free' | 'pro'
  lastLoginAt?: string | null
}

export interface OAuthAccount {
  id: number
  userId: number
  provider: string
  providerUid: string
}

export type WorkflowPurpose =
  | 'pawn_atlas' | 'weapon' | 'shield' | 'tile' | 'prop' | 'effect' | 'style_ref' | 'bg_remove'

export type BaseModel = 'sd15' | 'sd15-lcm' | 'sdxl-turbo-int8' | 'rmbg-2.0'

export interface Workflow {
  id: number
  name: string
  purpose: WorkflowPurpose
  baseModel: BaseModel
  description: string
  /** ComfyUI API-format 호환 JSON (브라우저 런타임이 해석) */
  apiJson: Record<string, unknown>
  paramMap: Record<string, unknown>
  promptPrefix: string
  promptSuffix: string
  negativePrompt: string
  version: number
  isActive: boolean
  /** 가중치 파일 메타 (캐시 추적·UI 표시용) */
  weights: WorkflowWeight[]
}

export interface WorkflowWeight {
  /** 안정 식별자 (sha256 8자리 등) */
  key: string
  label: string
  /** 다운로드 URL (CDN) — MVP는 mock */
  url: string
  bytes: number
  kind: 'checkpoint' | 'lora' | 'vae' | 'rmbg'
}

export type PartKind =
  | 'body' | 'shadow' | 'cape' | 'faction_mark'
  | 'face_front' | 'face_side' | 'face_back' | 'head_back'
  | 'hair_front' | 'hair_side' | 'hair_back'
  | 'helmet_front' | 'helmet_side' | 'helmet_back'
  | 'weapon' | 'shield'
  | 'tile' | 'prop' | 'effect'

export interface AssetPart {
  id: number
  ownerId: number | null // null = 공식 라이브러리
  ownerName?: string | null // 역정규화(표시용)
  kind: PartKind
  name: string
  url: string
  thumbnailUrl: string
  width: number
  height: number
  anchorX: number
  anchorY: number
  transparent: boolean
  sourceWorkflowId?: number | null
  prompt: string
  seed: number
  status: 'ok' | 'bg_removal_failed'
  isPublic: boolean
  tags: string[]
  likeCount: number
  createdAt: string
}

export type Direction = 'S' | 'SE' | 'E' | 'NE' | 'N' | 'NW' | 'W' | 'SW'

export interface SlotRule {
  z: number
  dx: number
  dy: number
  scale: number
  show: boolean
  /** 좌우 대칭 활용(예: SE→SW 미러) */
  mirror?: boolean
}

export interface PawnTemplate {
  id: number
  name: string
  slots: PartKind[]
  /** 방향별 슬롯 규칙 */
  directionRules: Record<Direction, Partial<Record<PartKind, SlotRule>>>
  /** 타원 몸체 파라미터 */
  baseShape: { rx: number; ry: number; offsetY: number }
  isActive: boolean
}

export interface Pawn {
  id: number
  ownerId: number
  ownerName?: string
  templateId: number
  name: string
  bodyColor: string
  factionColor: string
  scale: number
  /** {slot: part_id} */
  composition: Partial<Record<PartKind, number>>
  /** {slot: "#rrggbb"} */
  tints: Partial<Record<PartKind, string>>
  thumbnailUrl?: string | null
  isPublic: boolean
  likeCount: number
  createdAt: string
}

export interface Tag {
  id: number
  name: string
}

export type SceneGenre = 'click' | 'defense' | 'survivor' | 'topdown_rpg' | 'tactical'

export interface SceneConfig {
  bgColor: string
  bgTile?: number | null // asset_part.id (kind=tile)
  bgImage?: string | null
  canvasW: number
  canvasH: number
  /** 장르별 자유 설정 (난이도·웨이브 등) */
  [k: string]: unknown
}

export interface Placement {
  /** UI 키 (id는 JSON에 없음, 빌더 로컬용) */
  id: string
  kind: 'pawn' | 'tile' | 'prop'
  refId: number
  x: number
  y: number
  direction: Direction
  scale: number
}

export interface Scene {
  id: number
  ownerId: number
  ownerName?: string
  name: string
  description: string
  genre: SceneGenre
  config: SceneConfig
  placements: Placement[]
  isPublic: boolean
  thumbnailUrl?: string | null
  playCount: number
  likeCount: number
  createdAt: string
}

export type CommentTarget = 'part' | 'pawn' | 'scene'

export interface Comment {
  id: number
  userId: number
  userName: string
  avatarUrl?: string | null
  targetType: CommentTarget
  targetId: number
  body: string
  createdAt: string
}

export interface PlayRecord {
  id: number
  sceneId: number
  playerId: number | null
  cleared: boolean
  timeMs?: number | null
  score?: number | null
  createdAt: string
}

/* ─────────── UI 전용 타입 (DB 없음) ─────────── */

export type WebGpuLevel = 'ok' | 'no-adapter' | 'no-webgpu' | 'unknown'

export interface WebGpuCapability {
  level: WebGpuLevel
  vendor?: string
  architecture?: string
  /** 추정 VRAM (GB). 정확하진 않음(브라우저는 알려주지 않음) */
  vramGuessGb?: number
}

export interface ModelCacheEntry {
  key: string
  label: string
  bytes: number
  /** 0~1 다운로드 진행률. null=완료 후 캐시됨, undefined=다운 안 받음 */
  progress?: number | null
  cachedAt?: string | null
}

export type GenStage =
  | 'idle' | 'loading-model' | 'warmup' | 'sampling' | 'vae' | 'rmbg' | 'done' | 'error' | 'oom'

export interface GenerationState {
  stage: GenStage
  /** sampling일 때 step/totalSteps */
  step?: number
  totalSteps?: number
  /** 0~1 전체 진행률 */
  progress: number
  /** intermediate preview data URL (있을 때) */
  preview?: string | null
  error?: string | null
}

/* ─────────── 라벨 ─────────── */

export const PART_KIND_LABEL: Record<PartKind, string> = {
  body: '몸체',
  shadow: '그림자',
  cape: '망토',
  faction_mark: '진영 마크',
  face_front: '얼굴(앞)',
  face_side: '얼굴(옆)',
  face_back: '얼굴(뒤)',
  head_back: '뒤통수',
  hair_front: '머리(앞)',
  hair_side: '머리(옆)',
  hair_back: '머리(뒤)',
  helmet_front: '투구(앞)',
  helmet_side: '투구(옆)',
  helmet_back: '투구(뒤)',
  weapon: '무기',
  shield: '방패',
  tile: '타일',
  prop: '오브젝트',
  effect: '이펙트',
}

export const PART_CATEGORY = {
  character: ['body', 'shadow', 'cape', 'faction_mark', 'face_front', 'face_side', 'face_back', 'head_back', 'hair_front', 'hair_side', 'hair_back', 'helmet_front', 'helmet_side', 'helmet_back', 'weapon', 'shield'] as PartKind[],
  world: ['tile', 'prop', 'effect'] as PartKind[],
} as const

export const WORKFLOW_PURPOSE_LABEL: Record<WorkflowPurpose, string> = {
  pawn_atlas: '캐릭터 파츠',
  weapon: '무기',
  shield: '방패',
  tile: '타일',
  prop: '오브젝트',
  effect: '이펙트',
  style_ref: '스타일 레퍼런스',
  bg_remove: '배경 제거',
}

export const SCENE_GENRE_LABEL: Record<SceneGenre, string> = {
  click: '클리커',
  defense: '디펜스',
  survivor: '서바이버',
  topdown_rpg: '탑다운 RPG',
  tactical: '전술',
}

export const DIRECTION_LABEL: Record<Direction, string> = {
  S: '↓', SE: '↘', E: '→', NE: '↗', N: '↑', NW: '↖', W: '←', SW: '↙',
}

export const STAGE_LABEL: Record<GenStage, string> = {
  idle: '대기',
  'loading-model': '모델 로딩',
  warmup: '워밍업',
  sampling: '샘플링',
  vae: 'VAE 디코드',
  rmbg: '배경 제거',
  done: '완료',
  error: '오류',
  oom: '메모리 부족',
}
