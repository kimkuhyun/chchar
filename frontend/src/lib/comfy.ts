// ComfyUI 브라우저 클라이언트 — 표준 레시피로 캐릭터 멀티뷰 시트 생성
// HTTP만 사용(프록시 /comfy). ws는 ComfyUI가 Origin을 따져 브라우저에서 불안정 → /history 폴링으로 대체.
// 개발: Vite 프록시(/comfy → 127.0.0.1:8000). 운영: 사용자 로컬 ComfyUI(+CORS).
const BASE = '/comfy'

// 표준 생성 레시피 (캐릭터 설명만 교체) — 검증된 조합
const CKPT = 'WAI-illustrious-SDXL_16.safetensors'
const LORA = 'rpg_sv_actors-anima1.0-v1.safetensors'

/** 캐릭터 설명을 끼운 멀티뷰 시트 프롬프트 그래프 */
export function buildSheetGraph(charDesc: string, opts: { seed?: number; rmbg?: boolean } = {}) {
  const seed = opts.seed ?? Math.floor(Math.random() * 1e15)
  const rmbg = opts.rmbg ?? true
  const pos = `rpgchara, chibi, character reference sheet, multiple views, full body, simple flat colors, thick outline, white background, ${charDesc}`
  const neg = 'blurry, text, watermark, realistic, 3d, detailed background, extra limbs'
  const g: Record<string, { class_type: string; inputs: Record<string, unknown> }> = {
    '1': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: CKPT } },
    '2': { class_type: 'LoraLoader', inputs: { model: ['1', 0], clip: ['1', 1], lora_name: LORA, strength_model: 0.8, strength_clip: 0.8 } },
    '9': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 1], text: pos } },
    '10': { class_type: 'CLIPTextEncode', inputs: { clip: ['2', 1], text: neg } },
    '11': { class_type: 'EmptyLatentImage', inputs: { width: 1024, height: 1024, batch_size: 1 } },
    '12': { class_type: 'KSampler', inputs: { model: ['2', 0], positive: ['9', 0], negative: ['10', 0], latent_image: ['11', 0], seed, steps: 26, cfg: 6.5, sampler_name: 'euler', scheduler: 'normal', denoise: 1 } },
    '13': { class_type: 'VAEDecode', inputs: { samples: ['12', 0], vae: ['1', 2] } },
  }
  // RMBG(투명) — ComfyUI 재시작 후 등록됨. 없으면 rmbg:false 로.
  if (rmbg) {
    g['15'] = { class_type: 'RMBG', inputs: { image: ['13', 0], model: 'RMBG-2.0', sensitivity: 1.0, process_res: 1024, mask_blur: 0, mask_offset: 0, invert_output: false, refine_foreground: false, background: 'Alpha' } }
    g['14'] = { class_type: 'SaveImage', inputs: { images: ['15', 0], filename_prefix: 'app_sheet' } }
  } else {
    g['14'] = { class_type: 'SaveImage', inputs: { images: ['13', 0], filename_prefix: 'app_sheet' } }
  }
  return g
}

/** ComfyUI 연결/버전 확인 (샘플링 안 함 → 안전) */
export async function pingComfy(): Promise<{ ok: boolean; version?: string }> {
  try {
    const r = await fetch(`${BASE}/system_stats`)
    if (!r.ok) return { ok: false }
    const d = await r.json()
    return { ok: true, version: d?.system?.comfyui_version }
  } catch {
    return { ok: false }
  }
}

function viewUrl(img: { filename: string; subfolder?: string; type?: string }) {
  const q = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder ?? '', type: img.type ?? 'output' })
  return `${BASE}/view?${q.toString()}`
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function extractError(status: { messages?: unknown[] } | undefined): string {
  for (const m of status?.messages ?? []) {
    if (Array.isArray(m) && m[0] === 'execution_error') {
      const d = m[1] as { exception_message?: string; node_type?: string }
      return `${d.node_type ?? ''} ${String(d.exception_message ?? '').slice(0, 200)}`.trim()
    }
  }
  return '알 수 없는 오류'
}

/** 시트 1장 생성 → 결과 이미지 URL. /history 폴링으로 완료 감지. */
export async function generateSheet(
  charDesc: string,
  opts: { onTick?: (elapsedMs: number) => void; rmbg?: boolean; signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<string> {
  const post = await fetch(`${BASE}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: buildSheetGraph(charDesc, { rmbg: opts.rmbg }) }),
  })
  if (!post.ok) throw new Error(`큐 등록 실패 (${post.status}): ${(await post.text()).slice(0, 300)}`)
  const { prompt_id } = (await post.json()) as { prompt_id: string }

  const started = Date.now()
  const timeout = opts.timeoutMs ?? 300_000
  for (;;) {
    if (opts.signal?.aborted) throw new Error('취소됨')
    await sleep(1200)
    opts.onTick?.(Date.now() - started)
    let entry: { status?: { status_str?: string; messages?: unknown[] }; outputs?: Record<string, { images?: { filename: string; subfolder?: string; type?: string }[] }> } | undefined
    try {
      const h = await fetch(`${BASE}/history/${prompt_id}`).then((r) => r.json())
      entry = h[prompt_id]
    } catch {
      if (Date.now() - started > timeout) throw new Error('시간 초과')
      continue
    }
    if (entry) {
      if (entry.status?.status_str === 'error') throw new Error('생성 실패: ' + extractError(entry.status))
      const img = entry.outputs?.['14']?.images?.[0]
      if (img) return viewUrl(img)
    }
    if (Date.now() - started > timeout) throw new Error('시간 초과 (ComfyUI가 응답하지 않음)')
  }
}
