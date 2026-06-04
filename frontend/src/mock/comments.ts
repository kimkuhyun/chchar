import type { Comment } from '../types'

export const seedComments: Comment[] = [
  { id: 1, userId: 2, userName: '픽셀공방', avatarUrl: null, targetType: 'level', targetId: 301, body: '함정 배치가 절묘하네요! 3번 죽고 깼습니다 😂', createdAt: '2026-06-03T06:10:00Z' },
  { id: 2, userId: 3, userName: 'NeonDev', avatarUrl: null, targetType: 'level', targetId: 301, body: '네온 배경이랑 캐릭터 조합 미쳤다', createdAt: '2026-06-03T06:30:00Z' },
  { id: 3, userId: 4, userName: '도트마스터', avatarUrl: null, targetType: 'level', targetId: 302, body: '하늘섬 점프 구간이 진짜 짜릿함', createdAt: '2026-06-03T05:00:00Z' },
  { id: 4, userId: 1, userName: '김구현', avatarUrl: null, targetType: 'level', targetId: 303, body: '수정 미궁 클리어! 디자인 너무 예뻐요', createdAt: '2026-06-03T04:20:00Z' },
]
