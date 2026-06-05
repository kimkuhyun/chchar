import type { Workflow } from '../types'

export const workflows: Workflow[] = [
  {
    id: 1,
    name: '캐릭터 파츠 · SD1.5 Sprite',
    purpose: 'pawn_atlas',
    baseModel: 'sd15',
    description: '캐릭터 단일 파츠(투명 PNG) 생성. paper-doll 슬롯 단위.',
    apiJson: {},
    paramMap: {},
    promptPrefix: 'centered character part, pixel art, clean lineart, ',
    promptSuffix: ', white background, 768x768, single object, sprite asset',
    negativePrompt: 'blurry, jpeg, watermark, text, low quality, multiple subjects',
    version: 3,
    isActive: true,
    weights: [
      { key: 'sd15-base', label: 'SD1.5 base (fp16)', url: '/models/sd15-fp16.safetensors', bytes: 1_460_000_000, kind: 'checkpoint' },
      { key: 'sprite-lora', label: 'sprite paper-doll LoRA', url: '/loras/sprite.safetensors', bytes: 110_000_000, kind: 'lora' },
      { key: 'rmbg-2', label: 'RMBG 2.0', url: '/models/rmbg-2.0.onnx', bytes: 180_000_000, kind: 'rmbg' },
    ],
  },
  {
    id: 2,
    name: '캐릭터 파츠 · SD1.5 LCM (4스텝)',
    purpose: 'pawn_atlas',
    baseModel: 'sd15-lcm',
    description: '저사양·빠른 생성. 4스텝 LCM. 품질은 약간 양보.',
    apiJson: {},
    paramMap: {},
    promptPrefix: 'centered character part, pixel art, ',
    promptSuffix: ', white background, single object',
    negativePrompt: 'blurry, jpeg, watermark, text',
    version: 1,
    isActive: true,
    weights: [
      { key: 'sd15-lcm', label: 'SD1.5 LCM (fp16)', url: '/models/sd15-lcm.safetensors', bytes: 1_490_000_000, kind: 'checkpoint' },
      { key: 'rmbg-2', label: 'RMBG 2.0', url: '/models/rmbg-2.0.onnx', bytes: 180_000_000, kind: 'rmbg' },
    ],
  },
  {
    id: 3,
    name: '무기 단품 · SDXL-Turbo int8',
    purpose: 'weapon',
    baseModel: 'sdxl-turbo-int8',
    description: '무기 한 자루(검·활·창 등)을 깔끔한 측면 실루엣으로.',
    apiJson: {},
    paramMap: {},
    promptPrefix: 'single weapon, side view, clean silhouette, ',
    promptSuffix: ', white background, no character',
    negativePrompt: 'character, hand, person, watermark, text',
    version: 1,
    isActive: true,
    weights: [
      { key: 'sdxl-turbo-int8', label: 'SDXL-Turbo int8', url: '/models/sdxl-turbo-int8.onnx', bytes: 3_200_000_000, kind: 'checkpoint' },
      { key: 'rmbg-2', label: 'RMBG 2.0', url: '/models/rmbg-2.0.onnx', bytes: 180_000_000, kind: 'rmbg' },
    ],
  },
  {
    id: 4,
    name: '타일 (심리스)',
    purpose: 'tile',
    baseModel: 'sd15',
    description: '64×64 심리스 타일. 잔디·돌·모래 등 지형용.',
    apiJson: {},
    paramMap: {},
    promptPrefix: 'seamless tileable texture, top-down, ',
    promptSuffix: ', 64x64, repeating pattern',
    negativePrompt: 'character, object, watermark',
    version: 2,
    isActive: true,
    weights: [
      { key: 'sd15-base', label: 'SD1.5 base (fp16)', url: '/models/sd15-fp16.safetensors', bytes: 1_460_000_000, kind: 'checkpoint' },
    ],
  },
  {
    id: 5,
    name: '오브젝트 (prop)',
    purpose: 'prop',
    baseModel: 'sd15',
    description: '나무·통·상자 등 씬 오브젝트.',
    apiJson: {},
    paramMap: {},
    promptPrefix: 'single prop, isometric or top-down, ',
    promptSuffix: ', white background, game asset',
    negativePrompt: 'character, weapon, watermark',
    version: 1,
    isActive: true,
    weights: [
      { key: 'sd15-base', label: 'SD1.5 base (fp16)', url: '/models/sd15-fp16.safetensors', bytes: 1_460_000_000, kind: 'checkpoint' },
      { key: 'rmbg-2', label: 'RMBG 2.0', url: '/models/rmbg-2.0.onnx', bytes: 180_000_000, kind: 'rmbg' },
    ],
  },
]

export const workflowById = (id: number) => workflows.find((w) => w.id === id)

/** 유니크 weight 목록 (캐시 관리 화면용) */
export const allWeights = () => {
  const m = new Map<string, Workflow['weights'][number]>()
  for (const w of workflows) for (const x of w.weights) if (!m.has(x.key)) m.set(x.key, x)
  return Array.from(m.values())
}
