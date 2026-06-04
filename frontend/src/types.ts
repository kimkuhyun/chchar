/* ============================================================
   chchar 공유 타입 — 서비스 DB v2 (docs/ERD.md)와 1:1 대응
   ============================================================ */

export type Role = 'char' | 'bg' | 'platform'
export type JobStatus =
  | 'queued' | 'expanding' | 'generating' | 'postprocessing' | 'tagging' | 'done' | 'failed'
export type AssetStatus = 'ok' | 'bg_removal_failed' | 'normalize_failed'
export type Visibility = 'public' | 'private'

/* ── 계정 ── */
export interface User {
  id: number
  handle: string
  displayName: string
  email: string
  avatarUrl?: string | null
  plan: 'free' | 'pro'
}

/* ── 개인 GPU ── */
export interface InstalledModel {
  kind: 'checkpoint' | 'lora' | 'vae'
  name: string
}
export interface GpuNode {
  id: number
  userId: number
  label: string
  comfyUrl: string
  status: 'online' | 'offline'
  lastSeenAt: string
  models: InstalledModel[]
}

/* ── 생성 ── */
export interface StylePreset {
  id: number
  ownerId: number | null // null = 공식 시드
  name: string
  role: Role
  checkpoint: string
  lora?: string | null
  promptPrefix: string
  promptSuffix: string
  negativePrompt: string
  sampler: string
  steps: number
  cfg: number
  width: number
  height: number
  postprocess: string[]
  isActive: boolean
  isPublic: boolean
}

export interface GenerationJob {
  id: number
  userId: number
  gpuNodeId: number | null
  presetId: number
  userPrompt: string
  batchSize: number
  status: JobStatus
  comfyPromptId?: string | null
  progress: number
  error?: string | null
  createdAt: string
  updatedAt: string
}

export interface Asset {
  id: number
  ownerId: number
  ownerName: string // 역정규화(표시용)
  jobId: number | null
  presetId: number
  role: Role
  rawUrl: string
  processedUrl: string
  thumbnailUrl: string
  width: number
  height: number
  anchorX: number
  anchorY: number
  seed: number
  prompt: string
  status: AssetStatus
  favorite: boolean
  isPublic: boolean
  tags: string[]
  likeCount: number
  createdAt: string
}

/* ── 씬/레벨 ── */
export type PlacementKind = 'platform' | 'spike' | 'enemy'
export interface Placement {
  id: string
  kind: PlacementKind
  assetId: number | null
  sprite: string
  x: number
  y: number
  w: number
  h: number
  scale: number
}
export interface SceneConfig {
  gravity: number
  jump: number
  speed: number
  canvasW: number
  canvasH: number
}
export interface Level {
  id: number
  ownerId: number
  ownerName: string
  name: string
  description: string
  characterAssetId: number | null
  backgroundAssetId: number | null
  config: SceneConfig
  placements: Placement[]
  playerStart: { x: number; y: number }
  goal: { x: number; y: number }
  visibility: Visibility
  thumbnailUrl: string
  playCount: number
  likeCount: number
  createdAt: string
}

/* ── 소셜 ── */
export interface Comment {
  id: number
  userId: number
  userName: string
  avatarUrl?: string | null
  targetType: 'asset' | 'level'
  targetId: number
  body: string
  createdAt: string
}

export const ROLE_LABEL: Record<Role, string> = {
  char: '캐릭터',
  bg: '배경',
  platform: '플랫폼',
}
export const STATUS_LABEL: Record<JobStatus, string> = {
  queued: '대기',
  expanding: '컨셉 확장',
  generating: '생성 중',
  postprocessing: '후처리',
  tagging: '태깅',
  done: '완료',
  failed: '실패',
}
