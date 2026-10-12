"""Render the complete menu scene as an eight-second silent loop.
Optional art pipeline: Python, Pillow, NumPy and FFmpeg; not needed to play.
The clean plate was edited with imagegen; source textures retain the art style.
"""
from pathlib import Path
import math
import subprocess
import numpy as np
from PIL import Image, ImageChops, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SIZE = (1280, 720)
FPS, SECONDS = 24, 8
source = Image.open(ROOT / 'assets/main-menu-camp.png').convert('RGB')
plate = Image.open(ROOT / 'assets/main-menu-clean-plate.png').convert('RGB').resize(SIZE, Image.Resampling.LANCZOS)
SX, SY = SIZE[0] / source.width, SIZE[1] / source.height

def sprite(box, blue=False):
    raw = np.asarray(source.crop(box)).astype(float)
    r, g, b = raw[:, :, 0], raw[:, :, 1], raw[:, :, 2]
    if blue:
        alpha = np.clip((b - r - 15) / 70, 0, 1) * np.clip((b - 90) / 80, 0, 1)
    else:
        alpha = np.clip((r - b - 45) / 70, 0, 1) * np.clip((r - 150) / 75, 0, 1) * np.clip((g - 65) / 65, 0, 1)
    alpha = np.asarray(Image.fromarray((alpha * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.45)))
    return np.dstack((raw.astype('uint8'), alpha))

firebox = (887, 608, 1012, 720)
fire = sprite(firebox)
orbbox = (1461, 541, 1510, 590)
orb = sprite(orbbox, True)
staffbox = (1601, 483, 1633, 521)
staff = sprite(staffbox, True)
lanterns = [((27, 270, 53, 315), sprite((27, 270, 53, 315))),
            ((865, 332, 889, 372), sprite((865, 332, 889, 372)))]
glow_cache = {}

def glow(frame, x, y, radius, color, strength, stretch=1):
    key = (radius, color, stretch)
    if key not in glow_cache:
        w, h = max(2, round(radius * 2 * SX)), max(2, round(radius * 2 * SY * stretch))
        yy, xx = np.mgrid[-1:1:complex(h), -1:1:complex(w)]
        fade = np.clip(1 - np.sqrt(xx * xx + yy * yy), 0, 1) ** 2
        glow_cache[key] = Image.fromarray((fade[:, :, None] * np.array(color)[None, None, :]).astype('uint8'))
    light = ImageEnhance.Brightness(glow_cache[key]).enhance(max(0, strength))
    left, top = round(x * SX - light.width / 2), round(y * SY - light.height / 2)
    box = (left, top, left + light.width, top + light.height)
    frame.paste(ImageChops.screen(frame.crop(box), light), (left, top))

def paste(frame, pixels, box, alpha=1):
    im = Image.fromarray(pixels, 'RGBA')
    if alpha != 1:
        im.putalpha(im.getchannel('A').point(lambda n: round(n * alpha)))
    im = im.resize((round(im.width * SX), round(im.height * SY)), Image.Resampling.LANCZOS)
    frame.paste(im, (round(box[0] * SX), round(box[1] * SY)), im)

def render(index):
    phase = index / (FPS * SECONDS)
    q = phase * math.tau
    frame = plate.copy()
    # Warp the actual painted flame texture. The base stays fixed on the logs;
    # its tips bend and stretch independently rather than pulsing rectangles.
    yy, xx = np.indices(fire.shape[:2])
    tip = np.clip((100 - yy) / 100, 0, 1)
    xshift = tip ** 1.5 * (4 * np.sin(q * 5 + yy * .09) + 2 * np.sin(q * 9 + xx * .1))
    yshift = tip * (4 * np.sin(q * 7 + xx * .13) + 2 * np.sin(q * 3))
    xi = np.clip(np.rint(xx + xshift).astype(int), 0, fire.shape[1] - 1)
    yi = np.clip(np.rint(yy + yshift).astype(int), 0, fire.shape[0] - 1)
    flicker = .78 + .12 * math.sin(q * 7) + .08 * math.sin(q * 11 + 1)
    paste(frame, fire[yi, xi], firebox, flicker)
    glow(frame, 950, 680, 85, (250, 142, 55), .13 + .06 * flicker, .7)
    for i in range(14):
        age = (phase * (1 + i % 3) + i * .137) % 1
        fade = math.sin(age * math.pi) ** 2
        glow(frame, 946 + math.sin(i * 2.7) * 22 + math.sin(age * 6 + i) * age * 18,
             685 - age * (70 + i % 4 * 15), 2, (255, 179, 82), fade * .8, 1.3)
    for i in range(7):
        age = (phase + i / 7) % 1
        glow(frame, 948 + math.sin(age * 5 + i) * 14, 655 - age * 120,
             15 + i % 3 * 5, (133, 131, 123), math.sin(age * math.pi) ** 2 * .11, .8)
    # The mage's blue texture breathes and gently turns over the clean hand.
    magic = .8 + .15 * math.sin(q * 2)
    rotated = Image.fromarray(orb, 'RGBA').rotate(7 * math.sin(q * 2), Image.Resampling.BICUBIC)
    paste(frame, np.asarray(rotated), orbbox, magic)
    glow(frame, 1486, 572, 35, (64, 128, 244), .13 + .06 * math.sin(q * 2))
    paste(frame, staff, staffbox, .82 + .12 * math.sin(q * 2 + 1))
    glow(frame, 1617, 503, 23, (66, 126, 230), .12 + .04 * math.sin(q * 2 + 1))
    for i in range(5):
        age = (phase * 2 + i / 5) % 1
        glow(frame, 1486 + math.sin(age * 6 + i * 2) * (5 + age * 12), 576 - age * 30,
             2, (125, 196, 255), math.sin(age * math.pi) ** 2 * .5)
    for i, (box, pixels) in enumerate(lanterns):
        strength = .71 + .16 * math.sin(q * 5 + i) + .1 * math.sin(q * 9 + i * 2)
        paste(frame, pixels, box, strength)
        x, y = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
        glow(frame, x, y, 33, (244, 172, 76), .12 + strength * .08)
    glow(frame, 1450, 106, 38, (91, 142, 240), .04 + .025 * math.sin(q))
    for i in range(16):
        x = 640 + i * 67 % 950 + math.sin(q + i) * 5
        y = 447 + i * 43 % 285 + math.cos(q + i) * 4
        glow(frame, x, y, 2, (232, 209, 112), max(0, math.sin(q + i * 2)) ** 2 * .5)
    return frame

out = ROOT / 'assets/main-menu-loop.mp4'
command = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1280x720',
           '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
           '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(out)]
process = subprocess.Popen(command, stdin=subprocess.PIPE)
try:
    for index in range(FPS * SECONDS):
        frame = render(index)
        process.stdin.write(frame.tobytes())
        if index in (0, 48, 96, 144):
            frame.save(f'/tmp/menu-loop-frame-{index}.png')
        if index % FPS == 0:
            print(f'Rendered {index // FPS}/{SECONDS} seconds', flush=True)
finally:
    process.stdin.close()
if process.wait() != 0:
    raise SystemExit('FFmpeg encoding failed')
print(f'Encoded {out.name}: {out.stat().st_size:,} bytes', flush=True)
