# chchar — ComfyUI 워크플로우 연결 가이드 (무료·로컬 전용)

> 앱 구조 = **ComfyUI 워크플로우(JSON)만 연결**. 각 에셋 타입마다 워크플로우 1개를 두고,
> backend가 프롬프트만 끼워 `POST /prompt` 로 보냄. **클라우드·유료 SaaS는 전부 제외**(PixelLab/Retro Diffusion 웹/Scenario/Leonardo/Gemini 템플릿 등 — 워크플로우가 아니라 외부 서비스).

## 0. 공통 준비 (1회)
1. **런타임**: `patientx/ComfyUI-Zluda` (RX 7800 XT 지원). **`.safetensors`만** (GGUF 금지).
2. **노드 설치**: ComfyUI-Manager로 아래 커스텀 노드 설치. (전부 무료·오픈, **후처리 노드는 CPU/Python이라 AMD 무관하게 동작**)
3. **모델/LoRA 다운로드**: 아래 Civitai id.
4. **금지**: LayerDiffuse·xformers·DirectML (AMD에서 깨짐) → 투명은 **RMBG**로 대체.

### 설치할 커스텀 노드
| 노드 | 용도 | 레포 |
|---|---|---|
| **ComfyUI-RMBG** | 배경 제거(투명 PNG) | `1038lab/ComfyUI-RMBG` |
| **ComfyUI-PixelArt-Detector** | 픽셀화·팔레트 축소·디더 | `dimtoneff/ComfyUI-PixelArt-Detector` |
| **ComfyUI-spritefusion-pixel-snapper** | 그리드 스냅(프레임 색 흔들림 정리) | `x0x0b/...` |
| **ComfyUI-seamless-tiling** | 심리스 타일(Seamless Tile + Circular VAE) | `spinagon/ComfyUI-seamless-tiling` (SDXL만) |
| **ComfyUI_TiledKSampler** | 큰 배경 16GB 분할 생성 | `BlenderNeko/...` |
| **ComfyUI-SpriteSheetMaker** | 프레임들을 시트 PNG로 합침 | `OSAnimate/...` |
| **ComfyUI-controlnet-aux** | OpenPose 전처리(애니용) | `Fannovel16/comfyui_controlnet_aux` |
| **ComfyUI_IPAdapter_plus** | 캐릭터 일관성(레퍼 고정) | `cubiq/ComfyUI_IPAdapter_plus` |

### 다운로드할 모델/LoRA (Civitai)
| 용도 | 모델 | id / 비고 |
|---|---|---|
| 캐릭터 | **Game Character Sprites/Assets** (LoRA, Illustrious) | **1936887** · trigger `pixel_character_sprite` |
| 캐릭터(대안) | **nerijs Pixel Art XL** (LoRA, SDXL) | **120096** · **fp16-fix VAE 필수**(madebyollin) |
| 올인원 | **Pixel Art Diffusion XL** (체크포인트) | **277680** |
| 배경·환경 | **Pixo** (LoRA, 사이드스크롤·아이템·환경) | **1821405** |
| 타일셋 | **SomeTile** (LoRA) | **1260880** · trigger `sometile` |
| 아이콘·아이템 | **Pixel Art Game UI Icons** (LoRA) | **2443581** |
| 애니 포즈 | **걷기/뛰기 8방향 포즈팩** | **56307** |
| 애니 컨트롤 | ControlNet OpenPose (SDXL) | HF `thibaud/controlnet-openpose-sdxl-1.0` |

---

## 1. 워크플로우 5종 (앱이 연결할 것)

각 워크플로우 = ComfyUI에서 만들고 **"Save (API Format)"** 로 JSON 추출 → backend에 내장 → 프롬프트만 주입.

### ① `character.json` — 캐릭터
```
Load Checkpoint(SDXL) → Load LoRA(1936887) → CLIP Text(프롬프트) → KSampler
 → VAE Decode → ComfyUI-RMBG(투명) → PixelArt-Detector(다운스케일 ×8/팔레트) → Save
```
참고 JSON: civitai **448101**(Sprite Sheet Maker, 다각도 시트). 일관성 필요 시 IPAdapter 추가.

### ② `background.json` — 배경(사이드스크롤)
```
Checkpoint(SDXL) → LoRA(Pixo 1821405) → KSampler(1280×720) → VAE Decode
 → PixelArt-Detector(팔레트) → Save
```
패럴랙스 3레이어는 civitai article **3662** 워크플로우 참고.

### ③ `tileset.json` — 타일/플랫폼 (심리스)
```
Checkpoint(SDXL) → LoRA(SomeTile 1260880) → Seamless Tile(spinagon) → Make Circular VAE
 → KSampler → Circular VAE Decode → PixelArt-Detector → pixel-snapper → Save
```
→ 이음매 없는 타일. (SDXL 전용 — Flux 안 됨)

### ④ `prop.json` — 프롭/아이템/아이콘
```
Checkpoint(SDXL) → LoRA(Pixo/아이콘 2443581) → KSampler → VAE Decode
 → ComfyUI-RMBG(투명) → PixelArt-Detector → Save
```

### ⑤ `animation.json` — 애니메이션 (ComfyUI 전용 = 포즈로 강제)
```
포즈팩(56307) 각 프레임 → ControlNet OpenPose Apply + Checkpoint+LoRA + seed 고정
 → KSampler(프레임별) → pixel-snapper(그리드/팔레트 통일) → SpriteSheetMaker(시트 합치기) → Save
```
> **정직한 한계**: ComfyUI 전용·로컬이면 애니는 이 "포즈팩 강제" 방식이 최선이고 **약간의 수작업 정리**가 듭니다. (자동 완벽은 클라우드 PixelLab뿐인데 그건 제외했으니, 걷기 정도는 이 방식으로 충분히 나옵니다.)

---

## 2. 앱 연동 (이미 설계와 맞음)
- `style_preset` 테이블이 **checkpoint·lora·sampler·steps·cfg·w·h·postprocess** 를 들고 있음 → 이게 워크플로우 파라미터.
- backend = 위 5개 워크플로우 JSON **템플릿** 보관 → 프리셋 값 + 프롬프트 주입 → `POST http://localhost:8188/prompt` → `/ws` 진행률 → 결과 PNG 저장.
- 즉 **앱은 "프리셋 선택 → 해당 워크플로우 JSON에 끼워 ComfyUI로 전송"** 만 하면 끝. 새 스타일은 LoRA만 바꾼 프리셋 추가로 확장.

## 3. 제외한 것 (유료/클라우드 = 연결 구조 부적합)
PixelLab · Retro Diffusion(웹/Gumroad) · Scenario · Leonardo · Rosebud · 공식 ComfyUI "Sprite Sheet" 템플릿(실제 Gemini/Nano-Banana 클라우드 호출). — 전부 ComfyUI 워크플로우가 아니므로 제외.

## 출처
patientx/ComfyUI-Zluda · 1038lab/ComfyUI-RMBG · dimtoneff/ComfyUI-PixelArt-Detector · x0x0b/ComfyUI-spritefusion-pixel-snapper · spinagon/ComfyUI-seamless-tiling · BlenderNeko/ComfyUI_TiledKSampler · OSAnimate/ComfyUI-SpriteSheetMaker · Fannovel16/comfyui_controlnet_aux · cubiq/ComfyUI_IPAdapter_plus · civitai 1936887/120096/277680/1821405/1260880/2443581/56307/448101 · HF thibaud/controlnet-openpose-sdxl-1.0
