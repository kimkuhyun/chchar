import type { GpuNode, User } from '../types'

export const CURRENT_USER_ID = 1

export const users: User[] = [
  { id: 1, handle: 'me', displayName: '김구현', email: 'rngus225@gmail.com', avatarUrl: null, plan: 'free' },
  { id: 2, handle: 'pixelforge', displayName: '픽셀공방', email: '', avatarUrl: null, plan: 'pro' },
  { id: 3, handle: 'neondev', displayName: 'NeonDev', email: '', avatarUrl: null, plan: 'free' },
  { id: 4, handle: 'dotmaster', displayName: '도트마스터', email: '', avatarUrl: null, plan: 'pro' },
]

export const userById = (id: number) => users.find((u) => u.id === id)
export const userName = (id: number) => userById(id)?.displayName ?? '익명'

/** 현재 사용자의 GPU 노드(개인 ComfyUI) */
export const myGpu: GpuNode = {
  id: 1,
  userId: 1,
  label: '내 PC · RX 7800 XT',
  comfyUrl: 'http://localhost:8188',
  status: 'online',
  lastSeenAt: '2026-06-03T09:00:00Z',
  models: [
    { kind: 'checkpoint', name: 'sdxl_base_1.0.safetensors' },
    { kind: 'lora', name: 'nerijs/pixel-art-xl' },
    { kind: 'vae', name: 'sdxl_vae.safetensors' },
  ],
}
