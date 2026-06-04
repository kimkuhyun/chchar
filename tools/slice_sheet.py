# 캐릭터 시트(흰 배경) -> 개별 figure 자동 분리 + 배경 투명 + 타이트 크롭
# 사용법:
#   python slice_sheet.py                      (output 폴더의 최신 chibi_* 시트 사용)
#   python slice_sheet.py "경로\시트.png"      (특정 파일)
import sys, os, glob
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

OUT = r"C:\Users\kimkuhyn\Documents\ComfyUI\output"
DST = os.path.join(OUT, "sliced")
os.makedirs(DST, exist_ok=True)

# ---- 입력 시트 결정 ----
if len(sys.argv) > 1:
    src = sys.argv[1]
else:
    cands = sorted(glob.glob(os.path.join(OUT, "chibi_*png")), key=os.path.getmtime)
    if not cands:
        print("시트를 못 찾음. 경로를 인자로 주세요."); sys.exit(1)
    src = cands[-1]
print("[sheet]", src)

im = Image.open(src).convert("RGB")
A = np.asarray(im); H, W = A.shape[:2]

# ---- figure 마스크(비백색) ----
fg = A.min(axis=2) < 225
fg = ndimage.binary_dilation(fg, iterations=3)
lbl, n = ndimage.label(fg)
boxes = ndimage.find_objects(lbl)

def cut_bg(crop):
    """크롭 가장자리에 연결된 흰색만 투명 처리(내부 흰색 보존)"""
    a = np.asarray(crop.convert("RGB"))
    white = a.min(axis=2) > 236
    wl, _ = ndimage.label(white)
    border = set(np.unique(np.concatenate([wl[0,:], wl[-1,:], wl[:,0], wl[:,-1]])))
    border.discard(0)
    bg = np.isin(wl, list(border))
    rgba = np.dstack([a, np.where(bg, 0, 255).astype(np.uint8)])
    return Image.fromarray(rgba, "RGBA")

figs = []
for sl in boxes:
    if sl is None: continue
    y0,y1 = sl[0].start, sl[0].stop; x0,x1 = sl[1].start, sl[1].stop
    w,h = x1-x0, y1-y0
    if w < 70 or h < 90 or w*h < 9000:   # 작은 아이템/점 제외
        continue
    figs.append([x0,y0,x1,y1,w,h])

figs.sort(key=lambda b:(b[1]//200, b[0]))   # 행 우선 정렬
print("[figures]", len(figs))

pad = 6
saved = []
for i,(x0,y0,x1,y1,w,h) in enumerate(figs, 1):
    crop = im.crop((max(0,x0-pad), max(0,y0-pad), min(W,x1+pad), min(H,y1+pad)))
    cut = cut_bg(crop)
    bb = cut.getbbox()
    if bb: cut = cut.crop(bb)            # 투명 여백 제거
    p = os.path.join(DST, f"fig{i:02d}.png")
    cut.save(p); saved.append(cut)
    print(f"  fig{i:02d}  {cut.size}")

# ---- 번호 붙인 컨택트 시트(체커보드 위) ----
def checker(w,h,s=12):
    bg = Image.new("RGB",(w,h),(255,255,255)); d=ImageDraw.Draw(bg)
    for yy in range(0,h,s):
        for xx in range(0,w,s):
            if (xx//s+yy//s)%2: d.rectangle([xx,yy,xx+s,yy+s], fill=(210,210,210))
    return bg
cw = max(c.width for c in saved)+12; ch = max(c.height for c in saved)+12
cols = min(len(saved),6); rows=(len(saved)+cols-1)//cols
contact = checker(cw*cols, ch*rows)
d = ImageDraw.Draw(contact)
for i,c in enumerate(saved):
    cx=(i%cols)*cw; cy=(i//cols)*ch
    contact.paste(c,(cx+6,cy+6),c)
    d.text((cx+4,cy+2), str(i+1), fill=(200,0,0))
cpath = os.path.join(DST, "_contact.png")
contact.save(cpath)
print("[done] 개별:", DST, " / 미리보기:", cpath)
