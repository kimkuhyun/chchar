import type { Comment } from '../types'
import { userName } from './users'

let seq = 400
const iso = (h = 0) => new Date(Date.now() - h * 3_600_000).toISOString()

export const comments: Comment[] = [
  { id: ++seq, userId: 3, userName: userName(3), avatarUrl: null, targetType: 'pawn', targetId: 201, body: '디자인 너무 깔끔해요! 헬멧 색감이 특히 좋네요.', createdAt: iso(2) },
  { id: ++seq, userId: 4, userName: userName(4), avatarUrl: null, targetType: 'pawn', targetId: 201, body: '복제해서 살짝 수정해도 될까요?', createdAt: iso(6) },
  { id: ++seq, userId: 2, userName: userName(2), avatarUrl: null, targetType: 'pawn', targetId: 202, body: '활 들고 있는 포즈 자연스러워요.', createdAt: iso(12) },
  { id: ++seq, userId: 5, userName: userName(5), avatarUrl: null, targetType: 'scene', targetId: 301, body: '튜토리얼로 딱이에요. 잘 만드셨네요.', createdAt: iso(8) },
  { id: ++seq, userId: 3, userName: userName(3), avatarUrl: null, targetType: 'scene', targetId: 302, body: '횃불 배치가 분위기 있어요 🔥', createdAt: iso(20) },
  { id: ++seq, userId: 2, userName: userName(2), avatarUrl: null, targetType: 'part', targetId: 117, body: '롱소드 실루엣 깔끔하네요. 잘 쓰겠습니다.', createdAt: iso(36) },
]

export const commentsFor = (type: Comment['targetType'], id: number) =>
  comments.filter((c) => c.targetType === type && c.targetId === id)
