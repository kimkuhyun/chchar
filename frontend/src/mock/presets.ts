import type { StylePreset } from '../types'

/** 공식 시드 3종(ownerId=null) + 내 프리셋 1종 */
export const seedPresets: StylePreset[] = [
  {
    id: 1, ownerId: null, name: '픽셀 히어로', role: 'char',
    checkpoint: 'sdxl_base_1.0.safetensors', lora: 'nerijs/pixel-art-xl',
    promptPrefix: 'pixel art, game character sprite, ',
    promptSuffix: ', side view, full body, transparent background, crisp pixels',
    negativePrompt: 'blurry, 3d render, photo, text, watermark, extra limbs',
    sampler: 'dpmpp_2m_karras', steps: 28, cfg: 6.5, width: 768, height: 1024,
    postprocess: ['rembg', 'pixel_normalize_nearest'], isActive: true, isPublic: true,
  },
  {
    id: 2, ownerId: null, name: '사이드스크롤 배경', role: 'bg',
    checkpoint: 'sdxl_base_1.0.safetensors', lora: null,
    promptPrefix: 'pixel art side-scroller background, ',
    promptSuffix: ', parallax layers, vibrant, 16-bit, wide shot',
    negativePrompt: 'characters, people, text, blurry, watermark',
    sampler: 'dpmpp_2m_karras', steps: 30, cfg: 7, width: 1280, height: 720,
    postprocess: ['pixel_normalize_nearest'], isActive: true, isPublic: true,
  },
  {
    id: 3, ownerId: null, name: '플랫폼 타일', role: 'platform',
    checkpoint: 'sdxl_base_1.0.safetensors', lora: 'nerijs/pixel-art-xl',
    promptPrefix: 'pixel art platform tile, ',
    promptSuffix: ', seamless edges, grass top, game asset, transparent background',
    negativePrompt: 'characters, blurry, text, watermark',
    sampler: 'euler_ancestral', steps: 24, cfg: 6, width: 512, height: 256,
    postprocess: ['rembg', 'pixel_normalize_nearest'], isActive: true, isPublic: true,
  },
  {
    id: 10, ownerId: 1, name: '내 네온 캐릭터', role: 'char',
    checkpoint: 'sdxl_base_1.0.safetensors', lora: 'nerijs/pixel-art-xl',
    promptPrefix: 'pixel art, neon cyberpunk character, glowing edges, ',
    promptSuffix: ', side view, transparent background',
    negativePrompt: 'blurry, realistic, text',
    sampler: 'dpmpp_2m_karras', steps: 26, cfg: 6.5, width: 768, height: 1024,
    postprocess: ['rembg', 'pixel_normalize_nearest'], isActive: true, isPublic: false,
  },
]
