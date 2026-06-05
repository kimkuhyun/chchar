import type { WebGpuCapability } from '../types'

/** 브라우저에서 WebGPU 지원 여부와 어댑터/한계를 확인.
 *  주의: 정확한 VRAM은 브라우저 API로 못 가져옴. maxBufferSize/limits로 대략 추정.
 */
export async function detectWebGpu(): Promise<WebGpuCapability> {
  const nav = (typeof navigator !== 'undefined' ? navigator : null) as
    | (Navigator & { gpu?: { requestAdapter: (opts?: unknown) => Promise<unknown> } })
    | null
  const gpu = nav?.gpu
  if (!gpu) return { level: 'no-webgpu' }
  try {
    const adapter = (await gpu.requestAdapter({ powerPreference: 'high-performance' })) as
      | { limits?: { maxBufferSize?: number }; requestAdapterInfo?: () => Promise<{ vendor?: string; architecture?: string }> }
      | null
    if (!adapter) return { level: 'no-adapter' }
    const info = adapter.requestAdapterInfo ? await adapter.requestAdapterInfo() : undefined
    const maxBuf = adapter.limits?.maxBufferSize ?? 0
    const vramGuessGb = maxBuf >= 268435456 ? 8 : maxBuf >= 134217728 ? 4 : 2
    return {
      level: 'ok',
      vendor: info?.vendor,
      architecture: info?.architecture,
      vramGuessGb,
    }
  } catch {
    return { level: 'no-adapter' }
  }
}

/** 데모/개발 편의용 — querystring `?gpu=ok|no-webgpu|no-adapter` 강제 */
export function detectWebGpuMock(): WebGpuCapability | null {
  if (typeof window === 'undefined') return null
  const force = new URLSearchParams(window.location.search).get('gpu')
  if (!force) return null
  if (force === 'no-webgpu') return { level: 'no-webgpu' }
  if (force === 'no-adapter') return { level: 'no-adapter' }
  return { level: 'ok', vendor: 'mock', architecture: 'rdna3', vramGuessGb: 8 }
}
