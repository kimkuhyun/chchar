# chchar — 화면 설계 (서비스 v5 · paper-doll Pawn · WebGPU)

> 서비스 DB(12테이블, [`ERD.md`](ERD.md))와 **1:1 대조**한 전체 화면 설계 + 디자인 시스템.
> 제품 = decal-atlas **Pawn** 시스템. 2영역: **공개**(둘러보기·플레이) + **스튜디오**(로그인·만들기).
> 생성=**브라우저 WebGPU**(8GB VRAM 타깃, SD1.5/LCM/SDXL-Turbo int8), 워크플로우·메타·조립·저장·소셜=서버.
> 사용자 설치 0. WebGPU 미지원 브라우저는 **탐색·플레이는 허용, 생성만 차단**(친절 안내).

## 1. 디자인 시스템 — "Studio Light"

밝고 깔끔한 크리에이티브 SaaS 톤 + Armello/Wildermyth 일러스트 통일감.

| 토큰 | 값 | 용도 |
|---|---|---|
| bg `#f5f6fb` / surface `#fff` / surface-2 `#fafbff` / border `#e7e9f3` | | 배경·카드·인풋·보더 |
| text `#1b2140` / dim `#6b7191` | | 본문·보조 |
| **primary** `#6d5efc` / accent `#15c2e8` / success `#15bd8e` / danger `#ff5470` | | 액션·강조·성공·위험 |

- 브랜드 그라데이션 `120deg, #6d5efc → #8a7bff → #15c2e8`, 폰트 **Pretendard**(헤딩 700/800), 소프트 섀도, 라운드 14~16px.

### 공통 컴포넌트
- Button(primary/ghost/subtle/danger) · Card · Input/Select · Chip · Badge · Avatar · Toggle(공개) · Stat · EmptyState · PageHeader · Modal · ColorSwatch(body/faction 색) · SlotPicker(슬롯↔파츠)

### ★ 7차 신규 컴포넌트
| 이름 | 역할 |
|---|---|
| **PawnCanvas** | 2D 파츠 합성 + 방향 규칙 + 코드 애니(bobbing·squash/stretch·weapon swing). 모든 Pawn/씬 미리보기·플레이의 공통 렌더 코어 |
| **WebGpuGate** | 첫 진입 온보딩. WebGPU 지원 체크 → adapter/VRAM 추정 → 기본 모델 다운로드 진행률 → 캐시 완료시 자동 해제 |
| **UnsupportedNotice** | WebGPU 미지원시 친절 안내(Chrome/Edge/Safari 18+ 권고, 모바일 한계 설명). "탐색·플레이는 그대로 가능" 강조 |
| **GenerationProgress** | 스텝별 진행률(로딩→워밍→샘플링 N/M→VAE→RMBG) + intermediate 미리보기(매 K스텝 디코드) + 취소·OOM 폴백 |
| **ModelCacheBadge** | 캐시 상태(✓ 캐시됨 / ↓ 다운로드 필요 / ⚠ 손상) + 용량(예: 1.4GB) 인라인 표시 |
| **VramHud** | 추정 사용중/여유 VRAM 작은 인디케이터(생성 화면 우상단) |

## 2. 화면 맵

### 🌐 공개 영역 (비로그인 OK) — `PublicLayout`
| 화면 | 라우트 | 핵심 | 주 테이블 | WebGPU |
|---|---|---|---|---|
| 랜딩 | `/` | 히어로 + 인기 Pawn/씬 + 로그인 유도 | `pawn`·`scene`(public) | 불필요 |
| 탐색·Pawn | `/explore` | 공개 Pawn 그리드(제작자·❤·정렬, 토큰 미리보기) | `pawn`(public)·`user` | 불필요 |
| 탐색·파츠 | `/explore/parts` | 공개 파츠 라이브러리(kind/태그 필터) | `asset_part`(public)·`tag`·`part_tag` | 불필요 |
| 탐색·씬 | `/explore/scenes` | 공개 씬(장르별) | `scene`(public) | 불필요 |
| Pawn 상세 | `/pawn/:id` | PawnCanvas 미리보기·8방향 토글 + ❤·댓글 + 복제 | `pawn`·`pawn_template`·`asset_part`·`like`·`comment` | 불필요(2D 합성만) |
| 씬 상세+플레이 | `/scene/:id` | PawnCanvas 플레이 + ❤·댓글·기록 + 복제 | `scene`·`pawn`·`asset_part`·`like`·`comment`·`play_record` | 불필요 |
| 프로필 | `/u/:handle` | 그 사람 공개 Pawn/파츠/씬 | `user`·`pawn`·`asset_part`·`scene` | 불필요 |
| 로그인 | `/login` | 이메일 dev 로그인(MVP) / 구글 OAuth(추후) | `user`·`oauth_account` | 불필요 |

→ **공개 영역은 WebGPU 0의존.** 미지원 브라우저도 100% 동작. PawnCanvas는 2D Canvas/WebGL 레벨이라 어디서나 돎.

### 🛠 스튜디오 (로그인 필수) — `StudioLayout`
사이드바 + 상단 사용자 메뉴. 옛 GpuConnect/Queue/Pipeline/Presets 행은 전부 제거.

| 화면 | 라우트 | 핵심 | 주 테이블 | WebGPU |
|---|---|---|---|---|
| **온보딩 게이트 ★** | `/studio/onboarding` | WebGpuGate: 지원 체크 → adapter/VRAM 안내 → 기본 모델(SD1.5 fp16 ≈ 1.4GB, RMBG ≈ 180MB) 다운로드 진행률 → IndexedDB 캐시 → 완료 자동 리다이렉트. 미지원이면 UnsupportedNotice + "둘러보기로 가기" | `workflow`(active 목록만 조회) | 체크·다운로드 |
| 대시보드 | `/studio` | 내 Pawn/파츠/씬 요약·바로가기. 캐시 미완료면 게이트로 자동 리다이렉트(URL 강제진입시) | 전반 | 불필요 |
| **파츠 생성 ★** | `/studio/generate` | (1) workflow(목적) 선택 — ModelCacheBadge로 그 모델 캐시 여부 표시 (2) 프롬프트·시드·step·LoRA 강도 (3) **생성 버튼** → GenerationProgress 모달(스텝 진행률·intermediate 미리보기·OOM시 해상도 강등 폴백·취소) (4) 결과 미리보기 → kind 지정 → 업로드 → `asset_part` 행. WebGPU 미지원시 UnsupportedNotice로 진입 차단 | `workflow`·`asset_part` | **필수** |
| **파츠 슬라이서** | `/studio/slicer` | 멀티뷰 atlas/시트 결과를 영역→`kind` 지정해 분할·투명화·업로드. 생성 직후 자동 진입 또는 라이브러리에서 단일 파츠 진입 | `asset_part` | RMBG만(브라우저 ONNX) |
| **파츠 라이브러리 ★** | `/studio/parts` | 내+공식 파츠(kind/태그 필터·공개 토글·삭제). 공식=`owner_id null` | `asset_part`(owner+official)·`tag`·`part_tag` | 불필요 |
| **Pawn 에디터 ★** | `/studio/pawn/:id?` | 템플릿 선택 → 슬롯에 파츠 얹기(SlotPicker) + body/faction 색·스케일·tint + **8방향 미리보기**(direction_rules) + PawnCanvas 코드애니 → 저장·공개 | `pawn`·`pawn_template`·`asset_part` | 불필요 |
| 내 Pawn | `/studio/pawns` | 내 Pawn 목록·공개·복제·삭제 | `pawn`(owner) | 불필요 |
| **씬 빌더** | `/studio/scene/:id?` | 장르 보드(`scene.config`) + pawn/tile/prop 배치(placements JSON) + 저장·공개 | `scene`·`pawn`·`asset_part` | 불필요 |
| 미리보기/플레이 | `/studio/scene/:id/play` | 테스트 플레이 (장르별 룰 — 클릭·디펜스·서바이버·탑다운RPG·전술) | `scene`·`pawn`·`asset_part`·`play_record` | 불필요 |
| **설정** | `/studio/settings` | 프로필(handle/display_name/avatar) · 플랜(읽기전용 free) · **로컬 모델 관리 ★**(워크플로우별 캐시 용량·다운로드·삭제 — ModelCacheBadge 목록) · 로그아웃 | `user`·`workflow`(목록) | 불필요(관리만) |

### 🔧 운영자 — MVP는 시드 스크립트로 대체 (UI 없음)
- 공식 `workflow`(SD1.5 sprite·SDXL-Turbo·RMBG·bg_remove 등) JSON 시드
- 공식 `pawn_template`(humanoid/quadruped + direction_rules) 시드
- 공식 `asset_part`(샘플 파츠 팩) 시드
- 정식 백오피스는 v6 이후. MVP는 `backend/seed/` 디렉토리에 JSON+Python 스크립트.

## 3. ★ DB ↔ 화면 1:1 대조 (12테이블)

| 테이블 | 쓰는 화면 | 핵심 컬럼 사용 | 상태 |
|---|---|---|---|
| `user` | 로그인·프로필·설정·대시보드·각종 owner 표시 | handle/email/display_name/avatar_url/plan | ✅ |
| `oauth_account` | 로그인(구글 추후) | provider/provider_uid | ✅ |
| `workflow` | **온보딩 게이트**(active 목록·기본 모델 표시)·**파츠 생성**(목록·선택·api_json 해석)·**설정·로컬 모델**(캐시 관리 단위) | name/purpose/base_model/api_json/param_map/prompt_*/is_active | ✅ |
| `asset_part` | 파츠 생성(insert)·슬라이서(insert 분할)·라이브러리·Pawn 에디터(파츠 소스)·씬 빌더(tile/prop 소스)·탐색·상세 | kind/url/anchor_x/y/transparent/source_workflow_id/is_public | ✅ |
| `pawn` | Pawn 에디터(CRUD)·내Pawn·씬 빌더(pawn 소스)·상세·탐색·랜딩 | template_id/composition/tints/body_color/faction_color/scale/is_public | ✅ |
| `pawn_template` | Pawn 에디터(템플릿 선택+슬롯+direction_rules 적용)·운영자(시드만) | slots/direction_rules/base_shape | ✅ |
| `tag` | 파츠 필터·탐색 | name | ✅ |
| `part_tag` | 파츠 태깅·필터 | part_id/tag_id | ✅ |
| `scene` | 씬 빌더·플레이·탐색·상세 | genre/config/placements/is_public/thumbnail_url/play_count/like_count | ✅ |
| `like` | Pawn/씬/파츠 상세 | target_type/target_id | ✅ |
| `comment` | Pawn/씬/파츠 상세 | target_type/target_id/body | ✅ |
| `play_record` | 씬 플레이·통계 | scene_id/player_id/cleared/time_ms/score | ✅ |

**→ 12테이블 전부 화면에서 소비됨. 모든 화면의 데이터가 스키마에 존재함. 누락/과잉 없음.**

### ⚠️ 대조 중 짚어야 할 점
1. **`scene.placements`의 `ref_id`는 다형성**(kind="pawn"이면 `pawn.id`, "tile"/"prop"이면 `asset_part.id`) — JSON이라 DB FK 없음. 빌더/플레이가 `kind`로 분기. (의도된 유연성, 무결성은 앱이 보장)
2. **타일/prop/effect = `asset_part.kind`** (별도 테이블 아님). → 라이브러리는 **카테고리 필터로 캐릭터 슬롯 vs tile/prop 분리** 표시. Pawn 에디터는 캐릭터 슬롯 kind만, 씬 빌더는 tile/prop kind만 사용.
3. **씬 배경**: 별도 컬럼 없음 → `scene.config`(JSON: bg_color/bg_tile/bg_image_url)에 보관. 빌더가 config 편집.
4. **`is_public` 통일**: asset_part·pawn·scene 전부 bool `is_public` → "공개" 토글이 3종 모두 동일 매핑.
5. **생성 진행상황 테이블 없음**: `generation_job` 폐기됨. 파츠 생성 진행률은 **클라이언트 상태**(GenerationProgress 컴포넌트가 WebGPU 파이프라인 스텝 콜백 수신). 서버 큐/잡 목록 화면 없음. ✅ 일치.
6. **atlas → 파츠 분할**: 생성이 멀티뷰 시트를 낼 수 있음 → **슬라이서**가 영역을 `kind`로 잘라 각 `asset_part` 행 생성. 같은 생성에서 나온 파츠 그룹핑(atlas_id)은 MVP 미포함(추후 확장).
7. **Pawn 애니메이션 = 코드** (DB 없음). 저장형 모션 `pawn_animation_clip`은 추후. ✅ 의도대로.
8. **워크플로우 ↔ 모델 캐시 매핑**: `workflow.api_json`이 참조하는 모델 가중치 URL을 브라우저 런타임이 추출 → IndexedDB/Cache API에 SHA로 키잉. 설정의 "로컬 모델 관리"는 워크플로우 단위로 표시(여러 workflow가 같은 베이스 모델 공유시 1개로 카운트). DB 컬럼 추가 불필요.
9. **WebGPU 미지원 사용자도 가입·조립 가능**: 다른 사람이 만든 공개 파츠로 Pawn/씬 만들고 플레이·공유 OK. **본인이 새 파츠만 못 만듦.** → "파츠 생성" 외 모든 스튜디오 화면은 미지원 환경에서도 동작해야 함.

## 4. 생성·조립 흐름 (E2E)

```
[온보딩] /studio 첫 진입
  WebGpuGate: navigator.gpu 체크 → adapter.requestAdapterInfo (벤더/한계)
   → workflow(active=true) 목록에서 기본 모델 URL·해시 수집
   → IndexedDB/Cache API에 다운로드 (진행률·재개)
   → 캐시 완료 시 /studio 자동 리다이렉트
  (미지원시 UnsupportedNotice → 둘러보기로 가기)

[생성] /studio/generate
  workflow 선택(ModelCacheBadge로 캐시 확인) + 프롬프트
   → GenerationProgress 모달:
        load model    (캐시 hit이면 0s, 아니면 다운)
        warm up       (WebGPU 파이프라인 컴파일·셰이더 캐시)
        sampling 1/N..N/N   (intermediate 미리보기 매 K스텝)
        VAE decode
        RMBG (투명화)
   → OOM 감지시 해상도 강등(예: 768→512) 후 자동 재시도, 또 실패면 user 안내
   → (멀티뷰면) 슬라이서로 kind 분할
   → presigned URL로 S3/R2 업로드 → asset_part 행 생성

[조립] /studio/pawn/:id?
  pawn_template(슬롯+direction_rules) + 라이브러리 파츠 → composition 저장
   → PawnCanvas: 방향=direction_rules, 모션=코드 (squash/stretch·bobbing·weapon swing)

[배치] /studio/scene/:id?
  scene.placements 에 pawn/tile/prop 좌표·방향 → 장르별 플레이/공유
```

## 5. WebGPU 미지원 동작 매트릭스

| 화면 | 미지원 환경에서 | 안내 |
|---|---|---|
| 공개 영역 전체 | 100% 동작 | 없음 |
| `/studio/onboarding` | UnsupportedNotice 표시 | "Chrome/Edge/Safari 18+ 권고. 둘러보기로 가기" 버튼 |
| `/studio` 대시보드 | 동작(생성 외 진입 가능) | 상단 배너로 "현 환경에선 파츠 생성 불가" 한 줄 |
| `/studio/generate` | 진입 차단 | UnsupportedNotice + "다른 사람 공개 파츠로 Pawn 만들어보기"로 라이브러리 유도 |
| `/studio/parts`·`/studio/pawn/*`·`/studio/scene/*` | 동작 | 없음 (조립은 2D Canvas만) |
| `/studio/slicer` | RMBG가 WebGPU/ONNX → CPU(WASM) 폴백 | "조금 느릴 수 있어요" 토스트 |
| `/studio/settings` | 동작 (관리 기능만) | 로컬 모델 섹션에 "WebGPU 미지원 환경" 회색 처리 |

## 6. 구현 메모 (현재 mock → 신설계 매핑)

현재 `frontend/`는 옛 픽셀-플랫포머 mock 전체. 교체 매핑:

| 현 파일 | 처리 |
|---|---|
| `pages/studio/GpuConnect.tsx` | **제거** (옛 BYO-GPU 로컬 에이전트 화면, 7차 무관) |
| `pages/studio/Queue.tsx`·`Pipeline.tsx` | **제거** (서버 큐·LangGraph viz 없음) |
| `pages/studio/Presets.tsx` | **제거** → `workflow` 선택 UI로 흡수(파츠 생성 안) |
| `pages/studio/Builder.tsx`·`Play.tsx`(플랫포머 옆모습) | **씬 빌더/플레이로 재작성** (탑다운/보드, PawnCanvas 사용) |
| `pages/studio/Generate.tsx` | **재작성** — workflow 선택 + GenerationProgress + 슬라이서 진입 |
| `pages/studio/Slicer.tsx` | **재작성** — atlas → kind 분할 + RMBG |
| `pages/studio/MyAssets.tsx` | **재작성** → `/studio/parts` 파츠 라이브러리 |
| `pages/studio/AssetDetail.tsx` | **재작성** → 파츠/Pawn/씬 공통 상세 패턴 |
| `pages/public/Explore*.tsx` | **재작성** → Pawn/파츠/씬 3 탭 |
| (없음) | **신규**: `pages/studio/Onboarding.tsx`(WebGpuGate), `pages/studio/PawnEditor.tsx`, `pages/studio/MyPawns.tsx`, `pages/studio/Settings.tsx`(로컬 모델 섹션) |
| (없음) | **신규 컴포넌트**: `PawnCanvas`, `WebGpuGate`, `UnsupportedNotice`, `GenerationProgress`, `ModelCacheBadge`, `VramHud`, `SlotPicker`, `ColorSwatch` |
| `lib/coords.ts`(Y=중력) | **폐기** → 탑다운/보드 좌표계로 재정의(원점·타일 그리드는 `scene.config`) |
| 인증·소셜·스토리지·생성 | **전부 백엔드 미구현**(현재 mock). 인증 일부는 `archive/byo-gpu` 브랜치에서 참고 가능(이메일 dev 로그인+JWT) |

### 라우팅·가드 요약
- `PublicLayout`: 모든 공개 화면. 인증 무관.
- `StudioLayout`: 인증 가드 + **온보딩 가드**(`localStorage.chchar_models_ready` 없으면 `/studio/onboarding` 강제) + WebGPU 가드(생성 화면만).
- `/login`: 인증되어 있으면 `/studio`로 리다이렉트.
