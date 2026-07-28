import sys, glob, os
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
files = sorted(glob.glob(f"{src}/f*.png"))
frames = [Image.open(f).convert("RGB") for f in files]
# GIF: adaptive palette, no dither -> flat vector art stays clean and compresses well
pal = [f.convert("P", palette=Image.ADAPTIVE, colors=128, dither=Image.NONE) for f in frames]
pal[0].save(f"{out}.gif", save_all=True, append_images=pal[1:],
            duration=60, loop=0, optimize=True, disposal=2)
frames[0].save(f"{out}.webp", save_all=True, append_images=frames[1:],
               duration=60, loop=0, quality=72, method=5)
g = os.path.getsize(f"{out}.gif"); w = os.path.getsize(f"{out}.webp")
print(f"  {out}.gif   {g/1024:7.0f} KB   {len(frames)} frames, {len(frames)*60/1000:.1f}s")
print(f"  {out}.webp  {w/1024:7.0f} KB   ({g/w:.0f}x smaller)")
