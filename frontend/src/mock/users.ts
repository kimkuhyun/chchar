import type { User } from '../types'

export const CURRENT_USER_ID = 1

export const users: User[] = [
  { id: 1, handle: 'me', email: 'rngus225@gmail.com', displayName: '김구현', avatarUrl: null, plan: 'free' },
  { id: 2, handle: 'pixelforge', email: '', displayName: '픽셀공방', avatarUrl: null, plan: 'pro' },
  { id: 3, handle: 'armoria', email: '', displayName: 'Armoria', avatarUrl: null, plan: 'free' },
  { id: 4, handle: 'rimwight', email: '', displayName: 'rimwight', avatarUrl: null, plan: 'pro' },
  { id: 5, handle: 'tilesmith', email: '', displayName: '타일스미스', avatarUrl: null, plan: 'free' },
]

export const userById = (id: number | null | undefined) =>
  id == null ? undefined : users.find((u) => u.id === id)
export const userName = (id: number | null | undefined) => userById(id)?.displayName ?? '익명'
