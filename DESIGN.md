# chchrac — 설계 확정본 (DB + 화면 + 상호검증)

> 상태: **DB v1 확정** (2026-06-02). 이 문서는 다음 채팅(구현)의 입력.
> 이 채팅 범위 = 시장·기술 검증 + DB 설계 + 화면 설계 + 상호 검증. **코드 구현은 다음 채팅.**

## Context

RX 7800 XT(16GB, ROCm) 환경에서 **100% 로컬·무료**로 텍스트→스프라이트→플레이 가능한 플랫포머 파이프라인.
차별점 = 클라우드 의존 0 + LangGraph 오픈 오케스트레이션 + 생성물을 그 자리에서 플레이.

---

## 1. 기술 검증 결과 (웹 실조사 2026-06-02)

| # | 항목 | 판정 | 근거 |
|---|---|---|---|
| 1 | ROCm Windows + ComfyUI | ✅ | 공식 AMD ROCm 지원이 **ComfyUI Desktop v0.7.0+**부터(blog.comfy.org). ROCm 7.1/7.2 가이드 다수. RDNA3 지원. 대안 ComfyUI-ZLUDA(RDNA1~4) |
| 2 | GGUF 금지 주장 | ✅(강) | 실사용자: "RX 7800 XT는 GGUF(UNET)에서 현저히 저활용, **.safetensor는 272W로 완벽**"(blog.comfy.org). city96/ComfyUI-GGUF#48 AMD 저속 |
| 3 | ComfyUI HTTP API | ✅ | 공식 "api and backend". `/prompt` POST + `/ws` 표준 → **직접 httpx 구현** |
| 4 | Phaser 4 | ✅ | **4 정식 출시**(신규 WebGL 렌더러). 공식 `phaserjs/template-vite` + React/TS 템플릿 |
| 5 | 픽셀 LoRA + 경쟁사 | ✅ | `nerijs/pixel-art-xl` 현역. 경쟁(PixelLab/Scenario/RetroDiffusion) **전부 클라우드+구독** → "로컬+무료+AMD"는 빈 칸 |
| 6 | Ollama 모델 | ✅ | Llama 3.1-8B / Qwen2.5~3 7B가 프롬프트 확장·JSON 구조화에 충분 |
| 7 | 오케스트레이션 OSS | ✅ | SwarmUI=무거운 풀UI, ComfyDeploy=클라우드 → 통째 재사용 부적합, LangGraph 직접 구성이 맞음 |

- **VRAM 16GB**: SDXL(~6-7GB)+4bit 7B LLM(~5GB) 빠듯 → LangGraph 노드 **순차 실행**으로 회피. P0 실측.
- **LangGraph**: 선형 파이프라인엔 약간 오버킬이나 체크포인트·유연성·학습목적으로 유지 합리적(사용자 확정).

## 2. 재사용 / 적응 / 직접

| 구분 | 항목 |
|---|---|
| 그대로 재사용 | Phaser 4 + `template-vite`(React/TS), ComfyUI(+ROCm), rembg, nerijs/pixel-art-xl, IPAdapter+OpenPose ControlNet, Pillow NEAREST 픽셀 정규화 |
| 적응(클라우드→로컬) | 스프라이트 일관성 → seed고정 + IPAdapter + ControlNet 직접 조립(1클릭 무료판 없음) |
| 직접(=차별점) | LangGraph 오케스트레이션, 프리셋 시스템, 생성 큐·무한 갤러리, 씬 조립기, 플레이 뷰, 로컬·무료·AMD 통합 |

> P7 애니메이션 리스크: 걷기 8프레임 일관성은 IPAdapter 단발론 흔들림 → LoRA 학습(AMD 24~48h) 트레이드오프. MVP(P5)는 정적이라 무관.

---

## 3. DB 스키마 v1 (SQLite + SQLModel) — 9테이블

설계 원칙: ① 파이프라인 각 단계 산출물이 행으로 남는다(추적·재시작) ② 게임 정합 핵심값(크기·앵커)을 asset이 직접 보유 ③ 갤러리·씬 조립이 빠르게 필터되게 역정규화 일부 허용.

```
style_preset 1───* generation_job 1───* asset *───* tag
                        │1                  │
                        ▼1                  │ (character/background)
                     concept                ▼
                                   scene *───* asset (platform, 좌표 포함)
```

### style_preset — **DB가 1차 소스(확정).** S8에서 CRUD, 초기 3종 시드 주입.
`id PK · name unique · role(char|bg|platform) · checkpoint · lora? · prompt_prefix · prompt_suffix · negative_prompt · sampler · steps · cfg · width · height · postprocess(JSON[]) · is_active(bool) · created_at · updated_at`

### generation_job — 큐 1단위
`id PK · user_prompt · preset_id FK · batch_size · status(queued|expanding|generating|postprocessing|tagging|done|failed) · comfy_prompt_id? · progress(0~1) · error? · created_at · updated_at`

### concept — expand_concept(Ollama) 산출
`id PK · job_id FK · raw_json(JSON) · summary`

### asset — 생성 최종 에셋(핵심, 게임 정합값 보유)
`id PK · job_id FK · preset_id FK(역정규화) · role(역정규화) · raw_path · processed_path · thumbnail_path · width · height · anchor_x · anchor_y(발 중심 앵커) · seed · palette(JSON?, MVP 미채움) · status(ok|bg_removal_failed|normalize_failed) · favorite · created_at`

### tag / asset_tag — auto_tag N:M
`tag(id PK · name unique)` · `asset_tag(asset_id FK · tag_id FK)`

### scene — 씬 조립기 → 플레이
`id PK · name · character_asset_id FK · background_asset_id FK · config(JSON: 중력·점프력·이동속도·캔버스크기)`

### scene_platform — 플랫폼 배치(N:M + 좌표)
`id PK · scene_id FK · platform_asset_id FK · x · y · scale?`

---

## 4. 화면 설계 v1 (React + Vite) — 8화면

| # | 화면 | 핵심 동작 | 주 데이터원 |
|---|---|---|---|
| S1 | 생성 | 프롬프트 + 프리셋 드롭다운 + batch → 제출 | POST job → style_preset |
| S2 | 생성 큐(live) | 진행 job 카드 + 진행률, SSE/WS | generation_job |
| S3 | 무한 갤러리 | role 탭 + tag 검색 + favorite, react-virtuoso | asset(+tag) |
| S4 | 에셋 상세 | 원본/정규화 비교, 메타, 태그, seed, 재생성 | asset + concept + tag |
| S5 | 씬 조립기 | char·bg 1택 + platform **수동 드래그 배치** + config 슬라이더 → 저장 | asset → scene/scene_platform |
| S6 | 플레이 뷰 | Phaser가 scene 로드, 이동+점프+충돌 | scene + scene_platform + asset.processed_path |
| S7 | (P4) 파이프 viz | LangGraph 노드 그래프, React Flow | 정적 그래프 + job status |
| S8 | 프리셋 관리(CRUD) | 프리셋 생성/수정/비활성, 파라미터 편집 | style_preset 전 컬럼 |

---

## 5. DB ↔ 화면 상호 검증

### 방향 A — 화면 요구 데이터가 DB에 다 있나? → 전부 ✅
프리셋 드롭다운(preset.name/role) · 진행률·실패(job.status/progress/error) · role필터·태그·즐겨찾기(asset.role/favorite+tag) · 원본↔정규화(raw/processed_path) · 재생성(seed+preset_id) · 플랫폼 드래그 좌표(scene_platform.x/y/scale) · **캐릭터 앵커·크기(asset.anchor/width/height — 정합 핵심 확보)** · 물리값(scene.config) · 프리셋 편집(style_preset 전 컬럼+is_active)

### 방향 B — DB 컬럼을 읽는 화면이 있나? (죽은 컬럼 탐지)
전부 소비처 존재. 유일 예외 **asset.palette = MVP 미채움(nullable 유지)**. style_preset.postprocess는 화면 아닌 백엔드 런타임 소비.

### 정책 결정 — 확정
1. **프리셋 소스 = DB** → 시드 마이그레이션 + S8 CRUD 화면.
2. **플랫폼 배치 = 수동 드래그** → scene_platform.x/y/scale 사용. ⚠ **신규 정합 검증: S5 드래그 좌표계 = Phaser(S6) 월드 좌표계 1:1 일치**(원점·Y축·스케일). 불일치 시 배치가 플레이에서 어긋남.
3. **asset.palette = nullable 유지, 미채움.**
4. **concept↔asset** = 직접 FK 없이 asset→job→concept 2홉 허용.

> **결론(확정)**: 8화면 ↔ 9테이블 빠짐없이 매핑, 죽은 컬럼 없음. 게임 정합 핵심(앵커·크기)은 asset 귀속. **DB v1 구조적으로 확실.** 유일 잔여 리스크는 스키마가 아닌 구현 사항(좌표 변환 1곳).

---

## 6. 다음 채팅(구현) 시작점
- **P0**: ComfyUI(.safetensor) API 1회 호출 → 캐릭터1·배경1 디스크 저장 + VRAM 동시성 실측.
- **DB**: SQLModel 9테이블 생성 → 더미 job 1건 queued→done 전이 + asset 행 생성 확인.
- **정합**: 생성 캐릭터 processed_path를 Phaser template-vite에 로드 → 앵커 기준 바닥 착지 확인.
- 디렉토리(예정): `backend/{pipeline,clients,models.py,db.py,api.py}` · `frontend/{gallery,game}` · `presets/` (DB 시드용)
