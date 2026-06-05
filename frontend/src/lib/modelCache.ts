import type { ModelCacheEntry, WorkflowWeight } from '../types'

const LS_KEY = 'chchar_model_cache_v1'

type Stored = Record<string, { bytes: number; label: string; cachedAt: string }>

const load = (): Stored => {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(window.localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
const save = (s: Stored) => {
  if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEY, JSON.stringify(s))
}

export function cacheState(weights: WorkflowWeight[]): ModelCacheEntry[] {
  const cached = load()
  return weights.map((w) => ({
    key: w.key,
    label: w.label,
    bytes: w.bytes,
    progress: cached[w.key] ? null : undefined, // null = 캐시됨
    cachedAt: cached[w.key]?.cachedAt ?? null,
  }))
}

export function isCached(key: string) { return !!load()[key] }
export function isAllCached(weights: WorkflowWeight[]) {
  const c = load(); return weights.every((w) => !!c[w.key])
}

export function markCached(w: WorkflowWeight) {
  const s = load()
  s[w.key] = { bytes: w.bytes, label: w.label, cachedAt: new Date().toISOString() }
  save(s)
}

export function removeCached(key: string) {
  const s = load(); delete s[key]; save(s)
}

export function clearCache() { save({}) }

/** 다운로드 시뮬레이션 — 실제 fetch 대신 가짜 진행률 emit
 *  (PoC 후 web-stable-diffusion/onnxruntime-web으로 교체 예정)
 */
export function simulateDownload(
  w: WorkflowWeight,
  onProgress: (p: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let p = 0
    const step = 1 / 30 // 약 3초
    const tick = () => {
      if (signal?.aborted) return reject(new Error('aborted'))
      p = Math.min(1, p + step + Math.random() * 0.02)
      onProgress(p)
      if (p >= 1) { markCached(w); resolve(); return }
      window.setTimeout(tick, 100)
    }
    window.setTimeout(tick, 80)
  })
}
