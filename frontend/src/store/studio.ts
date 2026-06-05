import { create } from 'zustand'
import type {
  AssetPart, Comment, GenerationState, ModelCacheEntry, Pawn, PawnTemplate,
  Scene, User, WebGpuCapability, Workflow, PartKind,
} from '../types'
import {
  CURRENT_USER_ID, users, userById, userName,
  workflows, allWeights,
  pawnTemplates,
  parts as seedParts,
  pawns as seedPawns,
  scenes as seedScenes,
  comments as seedComments,
} from '../mock'
import { detectWebGpu, detectWebGpuMock } from '../lib/webgpu'
import { cacheState, isAllCached, simulateDownload } from '../lib/modelCache'

const iso = () => new Date().toISOString()
let partSeq = 1000
let pawnSeq = 2000
let sceneSeq = 3000
let commentSeq = 4000

interface StudioState {
  /* 인증(아주 단순 — 이메일 dev) */
  currentUser: User | null
  login: (email: string) => void
  logout: () => void

  /* 기준 데이터 */
  users: User[]
  workflows: Workflow[]
  pawnTemplates: PawnTemplate[]

  /* 컬렉션 */
  parts: AssetPart[]
  pawns: Pawn[]
  scenes: Scene[]
  comments: Comment[]
  likes: Record<string, boolean>

  /* WebGPU */
  webgpu: WebGpuCapability | null
  modelsReady: boolean
  detectWebGpu: () => Promise<void>
  refreshModelsReady: () => void
  downloadWorkflowModels: (workflowId: number, onProgress?: (key: string, p: number) => void) => Promise<void>
  modelCache: () => ModelCacheEntry[]

  /* 생성 (브라우저 WebGPU 시뮬) */
  generation: GenerationState
  generate: (workflowId: number, prompt: string) => Promise<AssetPart | null>
  cancelGeneration: () => void

  /* 파츠 */
  addPart: (p: Omit<AssetPart, 'id' | 'createdAt'>) => AssetPart
  setPartPublic: (id: number, pub: boolean) => void
  deletePart: (id: number) => void

  /* Pawn */
  savePawn: (p: Pawn) => number
  deletePawn: (id: number) => void
  forkPawn: (id: number) => number

  /* Scene */
  saveScene: (s: Scene) => number
  deleteScene: (id: number) => void
  forkScene: (id: number) => number

  /* 소셜 */
  isLiked: (type: 'part' | 'pawn' | 'scene', id: number) => boolean
  toggleLike: (type: 'part' | 'pawn' | 'scene', id: number) => void
  addComment: (type: 'part' | 'pawn' | 'scene', id: number, body: string) => void
  recordPlay: (sceneId: number) => void
}

let cancelToken: AbortController | null = null

export const useStudio = create<StudioState>((set, get) => ({
  currentUser: userById(CURRENT_USER_ID) ?? null,
  login: (email) => {
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase())
      ?? users.find((x) => x.handle === email.split('@')[0])
      ?? users[0]
    set({ currentUser: u })
  },
  logout: () => set({ currentUser: null }),

  users,
  workflows,
  pawnTemplates,

  parts: seedParts,
  pawns: seedPawns,
  scenes: seedScenes,
  comments: seedComments,
  likes: {},

  webgpu: null,
  modelsReady: isAllCached(workflows[0]?.weights ?? []),
  detectWebGpu: async () => {
    const mocked = detectWebGpuMock()
    const w = mocked ?? await detectWebGpu()
    set({ webgpu: w })
  },
  refreshModelsReady: () => set({ modelsReady: isAllCached(workflows[0]?.weights ?? []) }),
  downloadWorkflowModels: async (workflowId, onProgress) => {
    const wf = get().workflows.find((w) => w.id === workflowId)
    if (!wf) return
    for (const weight of wf.weights) {
      await simulateDownload(weight, (p) => onProgress?.(weight.key, p))
    }
    set({ modelsReady: isAllCached(get().workflows[0]?.weights ?? []) })
  },
  modelCache: () => cacheState(allWeights()),

  generation: { stage: 'idle', progress: 0 },
  generate: async (workflowId, prompt) => {
    const wf = get().workflows.find((w) => w.id === workflowId)
    if (!wf) return null
    cancelToken?.abort()
    const ctrl = new AbortController()
    cancelToken = ctrl
    const setStage = (s: Partial<GenerationState>) =>
      set({ generation: { ...get().generation, ...s } })
    try {
      setStage({ stage: 'loading-model', progress: 0.05, error: null })
      await sleep(450, ctrl.signal)
      setStage({ stage: 'warmup', progress: 0.12 })
      await sleep(500, ctrl.signal)
      const steps = wf.baseModel === 'sd15-lcm' ? 4 : wf.baseModel === 'sdxl-turbo-int8' ? 2 : 24
      for (let i = 1; i <= steps; i++) {
        await sleep(wf.baseModel === 'sd15-lcm' ? 240 : 90, ctrl.signal)
        setStage({ stage: 'sampling', step: i, totalSteps: steps, progress: 0.15 + (0.55 * i) / steps })
      }
      setStage({ stage: 'vae', progress: 0.78 })
      await sleep(360, ctrl.signal)
      setStage({ stage: 'rmbg', progress: 0.9 })
      await sleep(420, ctrl.signal)
      // 결과 = mock SVG (랜덤 색)
      const colors = ['#6d5efc', '#15c2e8', '#15bd8e', '#ff5470', '#f59e2e', '#8a7bff']
      const c = colors[Math.floor(Math.random() * colors.length)]
      const url =
        `data:image/svg+xml;utf8,` + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="${c}"/><text x="32" y="36" text-anchor="middle" font-size="8" fill="white" font-family="sans-serif">new</text></svg>`,
        )
      const uid = get().currentUser?.id ?? CURRENT_USER_ID
      const kind: PartKind = wf.purpose === 'pawn_atlas' ? 'body'
        : wf.purpose === 'weapon' ? 'weapon'
        : wf.purpose === 'shield' ? 'shield'
        : wf.purpose === 'tile' ? 'tile'
        : wf.purpose === 'prop' ? 'prop'
        : wf.purpose === 'effect' ? 'effect' : 'body'
      const part = get().addPart({
        ownerId: uid, ownerName: userName(uid),
        kind, name: prompt.slice(0, 24) || '새 파츠', url, thumbnailUrl: url,
        width: 64, height: 64, anchorX: 0.5, anchorY: 0.5, transparent: true,
        sourceWorkflowId: wf.id, prompt, seed: Math.floor(Math.random() * 900000),
        status: 'ok', isPublic: false, tags: [], likeCount: 0,
      })
      setStage({ stage: 'done', progress: 1, preview: url })
      return part
    } catch (e) {
      if ((e as Error).message === 'aborted') {
        setStage({ stage: 'idle', progress: 0 })
      } else {
        setStage({ stage: 'error', error: (e as Error).message })
      }
      return null
    }
  },
  cancelGeneration: () => { cancelToken?.abort(); set({ generation: { stage: 'idle', progress: 0 } }) },

  addPart: (p) => {
    const part: AssetPart = { ...p, id: ++partSeq, createdAt: iso() }
    set((s) => ({ parts: [part, ...s.parts] }))
    return part
  },
  setPartPublic: (id, pub) =>
    set((s) => ({ parts: s.parts.map((p) => (p.id === id ? { ...p, isPublic: pub } : p)) })),
  deletePart: (id) => set((s) => ({ parts: s.parts.filter((p) => p.id !== id) })),

  savePawn: (p) => {
    if (p.id && get().pawns.some((x) => x.id === p.id)) {
      set((s) => ({ pawns: s.pawns.map((x) => (x.id === p.id ? p : x)) }))
      return p.id
    }
    const id = ++pawnSeq
    const np: Pawn = { ...p, id, createdAt: iso() }
    set((s) => ({ pawns: [np, ...s.pawns] }))
    return id
  },
  deletePawn: (id) => set((s) => ({ pawns: s.pawns.filter((p) => p.id !== id) })),
  forkPawn: (id) => {
    const src = get().pawns.find((x) => x.id === id)
    const uid = get().currentUser?.id ?? CURRENT_USER_ID
    if (!src) return 0
    const nid = ++pawnSeq
    const copy: Pawn = { ...src, id: nid, ownerId: uid, ownerName: userName(uid),
      name: `${src.name} (복제)`, isPublic: false, likeCount: 0, createdAt: iso() }
    set((s) => ({ pawns: [copy, ...s.pawns] }))
    return nid
  },

  saveScene: (sc) => {
    if (sc.id && get().scenes.some((x) => x.id === sc.id)) {
      set((s) => ({ scenes: s.scenes.map((x) => (x.id === sc.id ? sc : x)) }))
      return sc.id
    }
    const id = ++sceneSeq
    const ns: Scene = { ...sc, id, createdAt: iso() }
    set((s) => ({ scenes: [ns, ...s.scenes] }))
    return id
  },
  deleteScene: (id) => set((s) => ({ scenes: s.scenes.filter((sc) => sc.id !== id) })),
  forkScene: (id) => {
    const src = get().scenes.find((x) => x.id === id)
    const uid = get().currentUser?.id ?? CURRENT_USER_ID
    if (!src) return 0
    const nid = ++sceneSeq
    const copy: Scene = { ...src, id: nid, ownerId: uid, ownerName: userName(uid),
      name: `${src.name} (복제)`, isPublic: false, playCount: 0, likeCount: 0, createdAt: iso() }
    set((s) => ({ scenes: [copy, ...s.scenes] }))
    return nid
  },

  isLiked: (type, id) => !!get().likes[`${type}:${id}`],
  toggleLike: (type, id) => {
    const key = `${type}:${id}`
    const liked = !get().likes[key]
    set((s) => {
      const likes = { ...s.likes, [key]: liked }
      const d = liked ? 1 : -1
      return {
        likes,
        parts: type === 'part' ? s.parts.map((p) => (p.id === id ? { ...p, likeCount: Math.max(0, p.likeCount + d) } : p)) : s.parts,
        pawns: type === 'pawn' ? s.pawns.map((p) => (p.id === id ? { ...p, likeCount: Math.max(0, p.likeCount + d) } : p)) : s.pawns,
        scenes: type === 'scene' ? s.scenes.map((p) => (p.id === id ? { ...p, likeCount: Math.max(0, p.likeCount + d) } : p)) : s.scenes,
      }
    })
  },
  addComment: (type, id, body) => {
    const u = get().currentUser; if (!u) return
    const c: Comment = {
      id: ++commentSeq, userId: u.id, userName: u.displayName, avatarUrl: u.avatarUrl ?? null,
      targetType: type, targetId: id, body, createdAt: iso(),
    }
    set((s) => ({ comments: [...s.comments, c] }))
  },
  recordPlay: (sceneId) =>
    set((s) => ({ scenes: s.scenes.map((sc) => (sc.id === sceneId ? { ...sc, playCount: sc.playCount + 1 } : sc)) })),
}))

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new Error('aborted'))
    const t = window.setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => { window.clearTimeout(t); reject(new Error('aborted')) }, { once: true })
  })
}
