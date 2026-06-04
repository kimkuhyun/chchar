import type { GenerationJob } from '../types'

export const seedJobs: GenerationJob[] = [
  { id: 11, userId: 1, gpuNodeId: 1, userPrompt: '은빛 갑옷의 기사, 파란 망토', presetId: 1, batchSize: 4, status: 'generating', comfyPromptId: 'cmfy-8a2f', progress: 0.42, error: null, createdAt: '2026-06-03T08:00:00Z', updatedAt: '2026-06-03T08:02:00Z' },
  { id: 10, userId: 1, gpuNodeId: 1, userPrompt: '노을 진 환상 하늘 배경', presetId: 2, batchSize: 1, status: 'done', comfyPromptId: 'cmfy-71bd', progress: 1, error: null, createdAt: '2026-06-03T07:50:00Z', updatedAt: '2026-06-03T07:52:00Z' },
  { id: 9, userId: 1, gpuNodeId: 1, userPrompt: '수정 동굴 플랫폼 타일', presetId: 3, batchSize: 2, status: 'queued', comfyPromptId: null, progress: 0, error: null, createdAt: '2026-06-03T08:05:00Z', updatedAt: '2026-06-03T08:05:00Z' },
  { id: 8, userId: 1, gpuNodeId: 1, userPrompt: '불 뿜는 드래곤 보스 (batch 8)', presetId: 1, batchSize: 8, status: 'failed', comfyPromptId: 'cmfy-3c10', progress: 0.2, error: 'VRAM OOM — batch_size 축소 또는 순차 실행 필요', createdAt: '2026-06-03T07:30:00Z', updatedAt: '2026-06-03T07:31:00Z' },
]
