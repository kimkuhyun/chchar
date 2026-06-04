import { create } from 'zustand'
import type {
  Asset, Comment, GenerationJob, GpuNode, JobStatus, Level, Placement,
  Role, SceneConfig, StylePreset, User,
} from '../types'
import { CURRENT_USER_ID, myGpu, users, userName } from '../mock/users'
import { seedPresets } from '../mock/presets'
import { seedAssets } from '../mock/assets'
import { seedJobs } from '../mock/jobs'
import { seedLevels, sampleLevel } from '../mock/levels'
import { seedComments } from '../mock/comments'

const STAGES: JobStatus[] = ['queued', 'expanding', 'generating', 'postprocessing', 'tagging', 'done']
const roleSprites: Record<Role, string[]> = {
  char: ['char-knight.svg', 'char-mage.svg', 'char-ninja.svg'],
  bg: ['bg-forest.svg', 'bg-cave.svg', 'bg-sky.svg'],
  platform: ['plat-grass.svg', 'plat-stone.svg', 'plat-crystal.svg'],
}
const iso = () => new Date().toISOString()
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T
let assetSeq = 1000, jobSeq = 100, presetSeq = 100, levelSeq = 400, commentSeq = 100

const blankDraft = (): Level => {
  const base = clone(sampleLevel)
  return {
    ...base,
    id: 0,
    name: '새 레벨',
    description: '',
    ownerId: CURRENT_USER_ID,
    ownerName: userName(CURRENT_USER_ID),
    visibility: 'private',
    playCount: 0,
    likeCount: 0,
    placements: base.placements.filter((p) => p.kind === 'platform' && p.y === 688), // 지면만
  }
}

interface StudioState {
  currentUserId: number | null
  login: () => void
  logout: () => void

  users: User[]
  gpu: GpuNode
  presets: StylePreset[]
  jobs: GenerationJob[]
  assets: Asset[]
  levels: Level[]
  comments: Comment[]
  likes: Record<string, boolean>
  draft: Level

  /* 생성 */
  enqueueJob: (prompt: string, presetId: number, batch: number) => number
  toggleFavorite: (assetId: number) => void
  setAssetPublic: (assetId: number, pub: boolean) => void

  /* GPU */
  setGpuUrl: (url: string) => void
  toggleGpu: () => void

  /* 프리셋 */
  newPreset: (role: Role) => StylePreset
  upsertPreset: (p: StylePreset) => void
  deletePreset: (id: number) => void
  togglePresetActive: (id: number) => void

  /* 빌더 드래프트 */
  newDraft: () => void
  loadDraft: (levelId: number) => void
  forkLevel: (levelId: number) => number
  setDraftMeta: (patch: Partial<Pick<Level, 'name' | 'description' | 'visibility'>>) => void
  setCharacter: (assetId: number) => void
  setBackground: (assetId: number) => void
  addPlacement: (p: Omit<Placement, 'id'>) => void
  updatePlacement: (id: string, patch: Partial<Placement>) => void
  removePlacement: (id: string) => void
  setConfig: (patch: Partial<SceneConfig>) => void
  setPlayerStart: (x: number, y: number) => void
  setGoal: (x: number, y: number) => void
  clearPlacements: () => void
  saveDraft: () => number

  /* 소셜 */
  isLiked: (type: 'asset' | 'level', id: number) => boolean
  toggleLike: (type: 'asset' | 'level', id: number) => void
  addComment: (type: 'asset' | 'level', id: number, body: string) => void
  recordPlay: (levelId: number) => void
}

export const useStudio = create<StudioState>((set, get) => ({
  currentUserId: CURRENT_USER_ID, // 데모: 로그인 상태로 시작
  login: () => set({ currentUserId: CURRENT_USER_ID }),
  logout: () => set({ currentUserId: null }),

  users,
  gpu: clone(myGpu),
  presets: seedPresets,
  jobs: seedJobs,
  assets: seedAssets,
  levels: seedLevels,
  comments: seedComments,
  likes: {},
  draft: clone(sampleLevel),

  enqueueJob: (prompt, presetId, batch) => {
    const id = ++jobSeq
    const uid = get().currentUserId ?? CURRENT_USER_ID
    const job: GenerationJob = {
      id, userId: uid, gpuNodeId: get().gpu.id, userPrompt: prompt, presetId, batchSize: batch,
      status: 'queued', comfyPromptId: null, progress: 0, error: null, createdAt: iso(), updatedAt: iso(),
    }
    set((s) => ({ jobs: [job, ...s.jobs] }))
    let stage = 0
    const tick = () => {
      if (!get().jobs.some((j) => j.id === id)) return
      stage++
      if (stage >= STAGES.length - 1) {
        const preset = get().presets.find((p) => p.id === presetId)
        const role: Role = preset?.role ?? 'char'
        const pool = roleSprites[role]
        const created: Asset[] = Array.from({ length: batch }, (_, i) => {
          const aid = ++assetSeq
          const url = `/sample-assets/${pool[(aid + i) % pool.length]}`
          return {
            id: aid, ownerId: uid, ownerName: userName(uid), jobId: id, presetId, role,
            rawUrl: url, processedUrl: url, thumbnailUrl: url,
            width: role === 'bg' ? 1280 : role === 'platform' ? 96 : 32,
            height: role === 'bg' ? 720 : role === 'platform' ? 32 : 40,
            anchorX: 0.5, anchorY: role === 'char' ? 1 : 0.5,
            seed: Math.floor(Math.random() * 900000), prompt, status: 'ok',
            favorite: false, isPublic: false, tags: prompt.split(/[\s,]+/).filter(Boolean).slice(0, 3),
            likeCount: 0, createdAt: iso(),
          }
        })
        set((s) => ({
          jobs: s.jobs.map((j) => (j.id === id ? { ...j, status: 'done', progress: 1, comfyPromptId: `cmfy-${id}`, updatedAt: iso() } : j)),
          assets: [...created, ...s.assets],
        }))
        return
      }
      set((s) => ({
        jobs: s.jobs.map((j) => (j.id === id ? { ...j, status: STAGES[stage], progress: stage / (STAGES.length - 1), comfyPromptId: stage >= 2 ? `cmfy-${id}` : j.comfyPromptId, updatedAt: iso() } : j)),
      }))
      window.setTimeout(tick, 850)
    }
    window.setTimeout(tick, 600)
    return id
  },

  toggleFavorite: (id) => set((s) => ({ assets: s.assets.map((a) => (a.id === id ? { ...a, favorite: !a.favorite } : a)) })),
  setAssetPublic: (id, pub) => set((s) => ({ assets: s.assets.map((a) => (a.id === id ? { ...a, isPublic: pub } : a)) })),

  setGpuUrl: (url) => set((s) => ({ gpu: { ...s.gpu, comfyUrl: url } })),
  toggleGpu: () => set((s) => ({ gpu: { ...s.gpu, status: s.gpu.status === 'online' ? 'offline' : 'online', lastSeenAt: iso() } })),

  newPreset: (role) => {
    const id = ++presetSeq
    const p: StylePreset = {
      id, ownerId: get().currentUserId, name: '새 프리셋', role,
      checkpoint: 'sdxl_base_1.0.safetensors', lora: role === 'bg' ? null : 'nerijs/pixel-art-xl',
      promptPrefix: 'pixel art, ', promptSuffix: ', game asset, transparent background',
      negativePrompt: 'blurry, text, watermark', sampler: 'dpmpp_2m_karras', steps: 26, cfg: 6.5,
      width: role === 'bg' ? 1280 : 768, height: role === 'bg' ? 720 : 1024,
      postprocess: role === 'bg' ? ['pixel_normalize_nearest'] : ['rembg', 'pixel_normalize_nearest'],
      isActive: true, isPublic: false,
    }
    set((s) => ({ presets: [...s.presets, p] }))
    return p
  },
  upsertPreset: (p) => set((s) => ({ presets: s.presets.some((x) => x.id === p.id) ? s.presets.map((x) => (x.id === p.id ? p : x)) : [...s.presets, p] })),
  deletePreset: (id) => set((s) => ({ presets: s.presets.filter((p) => p.id !== id) })),
  togglePresetActive: (id) => set((s) => ({ presets: s.presets.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)) })),

  newDraft: () => set({ draft: blankDraft() }),
  loadDraft: (levelId) => {
    const lv = get().levels.find((l) => l.id === levelId)
    if (lv) set({ draft: clone(lv) })
  },
  forkLevel: (levelId) => {
    const lv = get().levels.find((l) => l.id === levelId)
    const uid = get().currentUserId ?? CURRENT_USER_ID
    if (!lv) return 0
    set({ draft: { ...clone(lv), id: 0, ownerId: uid, ownerName: userName(uid), name: `${lv.name} (복제)`, visibility: 'private', playCount: 0, likeCount: 0 } })
    return 0
  },
  setDraftMeta: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  setCharacter: (assetId) => set((s) => ({ draft: { ...s.draft, characterAssetId: assetId } })),
  setBackground: (assetId) => set((s) => ({ draft: { ...s.draft, backgroundAssetId: assetId } })),
  addPlacement: (p) => set((s) => ({ draft: { ...s.draft, placements: [...s.draft.placements, { ...p, id: `pl-${Math.random().toString(36).slice(2, 8)}` }] } })),
  updatePlacement: (id, patch) => set((s) => ({ draft: { ...s.draft, placements: s.draft.placements.map((p) => (p.id === id ? { ...p, ...patch } : p)) } })),
  removePlacement: (id) => set((s) => ({ draft: { ...s.draft, placements: s.draft.placements.filter((p) => p.id !== id) } })),
  setConfig: (patch) => set((s) => ({ draft: { ...s.draft, config: { ...s.draft.config, ...patch } } })),
  setPlayerStart: (x, y) => set((s) => ({ draft: { ...s.draft, playerStart: { x, y } } })),
  setGoal: (x, y) => set((s) => ({ draft: { ...s.draft, goal: { x, y } } })),
  clearPlacements: () => set((s) => ({ draft: { ...s.draft, placements: s.draft.placements.filter((p) => p.kind === 'platform' && p.y === 688) } })),
  saveDraft: () => {
    const d = get().draft
    if (d.id && get().levels.some((l) => l.id === d.id)) {
      set((s) => ({ levels: s.levels.map((l) => (l.id === d.id ? { ...d } : l)) }))
      return d.id
    }
    const id = ++levelSeq
    const saved: Level = { ...d, id, createdAt: iso() }
    set((s) => ({ levels: [saved, ...s.levels], draft: saved }))
    return id
  },

  isLiked: (type, id) => !!get().likes[`${type}:${id}`],
  toggleLike: (type, id) => {
    const key = `${type}:${id}`
    const liked = !get().likes[key]
    set((s) => {
      const likes = { ...s.likes, [key]: liked }
      const delta = liked ? 1 : -1
      return {
        likes,
        assets: type === 'asset' ? s.assets.map((a) => (a.id === id ? { ...a, likeCount: a.likeCount + delta } : a)) : s.assets,
        levels: type === 'level' ? s.levels.map((l) => (l.id === id ? { ...l, likeCount: l.likeCount + delta } : l)) : s.levels,
      }
    })
  },
  addComment: (type, id, body) => {
    const uid = get().currentUserId ?? CURRENT_USER_ID
    const c: Comment = { id: ++commentSeq, userId: uid, userName: userName(uid), avatarUrl: null, targetType: type, targetId: id, body, createdAt: iso() }
    set((s) => ({ comments: [...s.comments, c] }))
  },
  recordPlay: (levelId) => set((s) => ({ levels: s.levels.map((l) => (l.id === levelId ? { ...l, playCount: l.playCount + 1 } : l)) })),
}))
