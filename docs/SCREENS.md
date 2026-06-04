# chchar — 화면 설계 (서비스 v2)

> 서비스 DB(13테이블, `docs/ERD.md`)에 맞춘 전체 화면 설계 + 디자인 시스템.
> 2영역 구조: **공개(둘러보기·플레이)** + **스튜디오(로그인, 만들기)**.

## 1. 디자인 시스템 — "Studio Light"

밝고 깔끔한 크리에이티브 SaaS 톤. (이전 다크 네온이 너무 어둡고 산만 → 정리)

| 토큰 | 값 | 용도 |
|---|---|---|
| bg | `#f5f6fb` | 앱 배경(연한 쿨그레이) |
| surface | `#ffffff` | 카드 |
| surface-2 | `#fafbff` | 인풋·서브 |
| border | `#e7e9f3` | 보더 |
| text | `#1b2140` | 본문 |
| text-dim | `#6b7191` | 보조 |
| **primary** | `#6d5efc` (바이올렛) | 주요 액션·브랜드 |
| accent | `#15c2e8` (시안) | 보조 강조 |
| success | `#15bd8e` | 성공·온라인 |
| danger | `#ff5470` | 위험·삭제 |

- **브랜드 그라데이션**: `120deg, #6d5efc → #8a7bff → #15c2e8`
- **폰트**: **Pretendard**(한글+라틴, 깔끔) — 헤딩 700/800
- **섀도**: 소프트(`0 6px 24px rgba(22,28,70,.08)`), 라운드 14~16px, 8px 간격 스케일
- **컴포넌트 라이브러리**: Button(primary/ghost/subtle/danger) · Card · Input/Textarea/Select · Chip · Badge · Avatar · Toggle(공개/비공개) · Stat · EmptyState · PageHeader · Modal
- 게임 캔버스만 어두운 스테이지(#15192e)로 프레이밍 → 콘텐츠 돋보임

## 2. 화면 맵

### 🌐 공개 영역 (비로그인 OK) — `PublicLayout`(상단바)
| 화면 | 라우트 | 핵심 | 주 테이블 |
|---|---|---|---|
| 랜딩 | `/` | 히어로 + 인기 레벨/에셋 + 로그인 유도 | scene·asset(public) |
| 탐색·레벨 | `/explore` | 공개 레벨 그리드(제작자·❤·▶수·정렬) | scene(public)·user |
| 탐색·에셋 | `/explore/assets` | 공개 에셋(role/태그) | asset(public)·tag |
| 레벨 상세+플레이 | `/level/:id` | 바로 플레이 + ❤·댓글·기록 + 복제 | scene·asset·like·comment·play_record |
| 프로필 | `/u/:handle` | 그 사람 공개물 | user·scene·asset |
| 로그인 | `/login` | 구글(가짜) | user·oauth_account |

### 🛠 스튜디오 (로그인) — `StudioLayout`(사이드바 + GPU상태)
| 화면 | 라우트 | 핵심 | 주 테이블 |
|---|---|---|---|
| 대시보드 | `/studio` | 내 요약(잡·에셋·레벨·GPU) | 전반 |
| **GPU 연결 ★** | `/studio/gpu` | 내 ComfyUI 등록·연결테스트·모델목록 | gpu_node·installed_model |
| 생성 (S1) | `/studio/generate` | 프롬프트+프리셋+batch | generation_job·style_preset·gpu_node |
| 큐 (S2) | `/studio/queue` | 내 잡 진행 | generation_job |
| 내 갤러리 (S3) | `/studio/assets` | role/태그/즐겨찾기 + 공개토글 | asset(owner)·tag |
| 에셋 상세 (S4) | `/studio/asset/:id` | 메타+공개+❤·댓글 | asset·tag·like·comment |
| 씬 조립기 (S5) | `/studio/builder/:id?` | 조립·config·공개 저장 | scene·asset |
| 플레이 (S6) | `/studio/play/:id` | 테스트 플레이 | scene·asset |
| 내 레벨 | `/studio/levels` | 목록·통계·공유 | scene(owner)·play_record |
| 프리셋 (S8) | `/studio/presets` | 내+공식 프리셋 | style_preset |
| 설정 | `/studio/settings` | 닉네임·아바타·플랜 | user |
| 파이프 (S7, 옵션) | `/studio/pipeline` | LangGraph viz | generation_job.status |

## 3. DB ↔ 화면 커버리지 (13테이블 전부 ✅)
user→로그인/프로필/설정/대시보드 · oauth_account→로그인 · gpu_node·installed_model→GPU연결 · style_preset→프리셋/생성 · generation_job→생성/큐 · asset→갤러리/상세/탐색 · tag·asset_tag→필터 · scene→조립/플레이/내레벨/탐색/상세 · like·comment→상세 · play_record→플레이/통계

## 4. 생성 흐름 (브라우저 오케스트레이션)
```
S1 제출 → POST /jobs(queued) → 브라우저가 내 localhost ComfyUI 호출 + 진행률
→ 결과 PNG 스토리지 업로드 → asset(storage_url) 생성 → 내 갤러리
```
GPU 오프라인이면 S1에서 경고 + GPU연결로 유도.

## 5. 구현 메모
- 인증·소셜·스토리지·ComfyUI = **전부 목업**(가짜 로그인, 좋아요/댓글 로컬 상태). 다음 단계에서 실제 API로 교체.
- 좌표 계약(`lib/coords.ts`)·Phaser 플레이는 그대로 유지.
- 기존 단일사용자 8화면은 스튜디오 영역으로 흡수.
