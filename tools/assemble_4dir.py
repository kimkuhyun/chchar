# 잘라낸 figure들에서 4방향 세트 조립 (오른쪽 = 왼쪽 거울)
# 모든 스프라이트를 같은 캔버스에 '발 기준(하단 중앙)' 정렬 -> 게임에서 바로 사용
# 사용법: python assemble_4dir.py <down#> <up#> <left#>
#   예)   python assemble_4dir.py 4 3 1
import sys, os
from PIL import Image, ImageDraw

SLICED = r"C:\Users\kimkuhyn\Documents\ComfyUI\output\sliced"
DST    = r"C:\Users\kimkuhyn\Documents\ComfyUI\output\char_4dir"
os.makedirs(DST, exist_ok=True)

down_n, up_n, left_n = (int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv)>3 else (4,3,1)

def load(n): return Image.open(os.path.join(SLICED, f"fig{n:02d}.png")).convert("RGBA")
down, up, left = load(down_n), load(up_n), load(left_n)
right = left.transpose(Image.FLIP_LEFT_RIGHT)          # 오른쪽 = 왼쪽 거울
dirs = {"down":down, "up":up, "left":left, "right":right}

# 공통 캔버스(발 기준 하단중앙 정렬)
cw = max(i.width  for i in dirs.values())
ch = max(i.height for i in dirs.values())
for name, im in dirs.items():
    canvas = Image.new("RGBA", (cw, ch), (0,0,0,0))
    canvas.paste(im, ((cw-im.width)//2, ch-im.height), im)   # 하단 정렬 = 발 맞춤
    canvas.save(os.path.join(DST, f"{name}.png"))
    print(f"  {name}.png  {cw}x{ch}")

# 미리보기(체커보드)
def checker(w,h,s=12):
    bg=Image.new("RGB",(w,h),(255,255,255)); d=ImageDraw.Draw(bg)
    for yy in range(0,h,s):
        for xx in range(0,w,s):
            if (xx//s+yy//s)%2: d.rectangle([xx,yy,xx+s,yy+s],fill=(208,208,208))
    return bg
prev=checker(cw*4, ch+22); d=ImageDraw.Draw(prev)
for i,name in enumerate(["down","up","left","right"]):
    c=Image.open(os.path.join(DST,f"{name}.png"))
    prev.paste(c,(i*cw,22),c); d.text((i*cw+4,4),name,fill=(190,0,0))
prev.save(os.path.join(DST,"_preview.png"))
print("[done]", DST)
