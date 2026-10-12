"""Render the complete menu scene as an eight-second silent loop.
Optional art pipeline: Python, Pillow, NumPy and FFmpeg; not needed to play.
The clean plate was edited with imagegen; source textures retain the art style.
"""
from pathlib import Path
import math
import subprocess
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SIZE = (1600, 900)
FPS, SECONDS = 30, 8
source = Image.open(ROOT / 'assets/main-menu-camp.png').convert('RGB')
original_plate = Image.open(ROOT / 'assets/main-menu-clean-plate.png').convert('RGB')
smoke_plate = Image.open(ROOT / 'assets/main-menu-smoke-plate.png').convert('RGB').resize(source.size)
# Restrict the generator edit to the two smoke plumes, keeping the original
# characters, trees, buildings and river everywhere else.
clean_mask = Image.new('L', source.size)
d = ImageDraw.Draw(clean_mask)
d.polygon([(1549, 346), (1558, 317), (1580, 301), (1590, 281), (1618, 273),
           (1631, 291), (1618, 319), (1590, 331), (1581, 352)], fill=255)
d.polygon([(1628, 357), (1633, 330), (1642, 310), (1662, 309), (1669, 327),
           (1651, 350)], fill=255)
clean = Image.composite(smoke_plate, original_plate, clean_mask.filter(ImageFilter.GaussianBlur(2)))
plate = clean.resize(SIZE, Image.Resampling.LANCZOS)
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

def displace(pixels, dx, dy):
    """Subpixel texture flow with premultiplied alpha prevents dark edge halos."""
    yy, xx = np.indices(pixels.shape[:2], dtype=float)
    x = np.clip(xx + dx, 0, pixels.shape[1] - 1.001)
    y = np.clip(yy + dy, 0, pixels.shape[0] - 1.001)
    x0, y0 = np.floor(x).astype(int), np.floor(y).astype(int)
    fx, fy = (x - x0)[..., None], (y - y0)[..., None]
    data = pixels.astype(float)
    data[..., :3] *= data[..., 3:] / 255
    result = ((data[y0, x0] * (1 - fx) + data[y0, x0 + 1] * fx) * (1 - fy) +
              (data[y0 + 1, x0] * (1 - fx) + data[y0 + 1, x0 + 1] * fx) * fy)
    result[..., :3] *= 255 / np.maximum(result[..., 3:], .001)
    return np.clip(result, 0, 255).astype('uint8')


def smoke_sprite(box):
    rgb = np.asarray(source.crop(box)).astype(float)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    background = np.asarray(smoke_plate.crop(box)).astype(float)
    difference = rgb.mean(axis=2) - background.mean(axis=2)
    a = np.clip((r - 48) / 60, 0, 1) * np.clip((95 - np.abs(b - r)) / 35, 0, 1)
    a *= np.clip((g - r + 5) / 10, 0, 1) * np.clip((difference - 3) / 30, 0, 1)
    edge = Image.new('L', (rgb.shape[1], rgb.shape[0]), 255)
    ImageDraw.Draw(edge).rectangle((0, 0, edge.width - 1, edge.height - 1), outline=0, width=3)
    a *= np.asarray(edge.filter(ImageFilter.GaussianBlur(2))) / 255
    alpha = Image.fromarray((a * 240).astype('uint8')).filter(ImageFilter.GaussianBlur(.6))
    return np.dstack((rgb.astype('uint8'), np.asarray(alpha)))


smoke_sources = [((1549, 277, 1632, 353), smoke_sprite((1549, 277, 1632, 353))),
                 ((1625, 307, 1670, 358), smoke_sprite((1625, 307, 1670, 358)))]


def water_layer(box, polygon, blue_only=True):
    rgb = np.asarray(original_plate.crop(box))
    mask = Image.new('L', (box[2] - box[0], box[3] - box[1]))
    ImageDraw.Draw(mask).polygon([(x - box[0], y - box[1]) for x, y in polygon], fill=255)
    a = np.asarray(mask.filter(ImageFilter.GaussianBlur(.8))).astype(float)
    if blue_only:
        r, g, b = rgb[..., 0].astype(float), rgb[..., 1].astype(float), rgb[..., 2].astype(float)
        a *= np.clip((b - r - 4) / 14, 0, 1) * np.clip((g - r + 1) / 10, 0, 1)
    return box, np.dstack((rgb, a.astype('uint8')))


waters = [
    water_layer((1210, 839, 1515, 941), [(1357, 878), (1390, 861), (1490, 850),
        (1508, 870), (1480, 894), (1434, 908), (1345, 933), (1275, 940),
        (1225, 940), (1301, 920), (1360, 900)]),
    water_layer((1380, 460, 1505, 511), [(1402, 466), (1424, 471), (1466, 482),
        (1496, 486), (1476, 502), (1420, 489), (1394, 478)]),
    water_layer((1140, 240, 1465, 286), [(1145, 259), (1198, 250), (1265, 248),
        (1320, 244), (1400, 255), (1460, 264), (1420, 275), (1355, 268),
        (1300, 279), (1228, 273), (1170, 275)], False),
]

# Find existing warm window pixels instead of scattering invented lights over
# rooftops. Connected components isolate each independently flickering window.
window_rgb = np.asarray(original_plate).astype(float)
r, green, blue = window_rgb[..., 0], window_rgb[..., 1], window_rgb[..., 2]
window_mask = (r > 130) & (green > 75) & (r > green * 1.15) & (green > blue * 1.25) & (blue < 130)
allowed_windows = Image.new('L', source.size)
allowed_draw = ImageDraw.Draw(allowed_windows)
allowed_draw.rectangle((1300, 290, 1671, 414), fill=255)
allowed_draw.rectangle((960, 284, 1228, 326), fill=255)
allowed_draw.polygon([(1330, 195), (1340, 167), (1381, 163), (1380, 114),
    (1402, 151), (1410, 116), (1424, 145), (1433, 70), (1445, 102),
    (1453, 146), (1465, 112), (1475, 149), (1535, 170), (1550, 210),
    (1500, 211), (1450, 209), (1370, 208)], fill=255)
window_mask &= np.asarray(allowed_windows) > 0
seen, windows = set(), []
for py, px in zip(*np.nonzero(window_mask)):
    if (py, px) in seen:
        continue
    points, stack = [], [(int(py), int(px))]
    seen.add((py, px))
    while stack:
        y, x = stack.pop()
        points.append((y, x))
        for dy, dx in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < source.height and 0 <= nx < source.width and window_mask[ny, nx] and (ny, nx) not in seen:
                seen.add((ny, nx)); stack.append((ny, nx))
    ys, xs = zip(*points)
    if 2 <= len(points) <= 35 and max(xs) - min(xs) < 8 and max(ys) - min(ys) < 10:
        box = (min(xs) - 1, min(ys) - 1, max(xs) + 2, max(ys) + 2)
        rgba = np.asarray(original_plate.crop(box).convert('RGBA')).copy()
        rgba[..., 3] = 0
        for y, x in points:
            rgba[y - box[1], x - box[0], 3] = 255
        windows.append((box, rgba))


def animate_environment(frame, phase, q):
    for number, (box, water) in enumerate(waters):
        yy, xx = np.indices(water.shape[:2], dtype=float)
        # The current carries texture diagonally; smaller crossing waves and
        # moving luminance ridges add ripples without moving banks or rocks.
        dx = 2.2 * np.sin(q * 3 + yy * .12) + .8 * np.sin(q * 5 + xx * .1)
        dy = 1.1 * np.sin(q * 2 + xx * .08)
        flowing = displace(water, dx, dy)
        flowing[..., 3] = np.minimum(flowing[..., 3], water[..., 3])
        reflection = 1 + .09 * np.sin((xx - yy) * .15 + q * 3 + number)
        flowing[..., :3] = np.clip(flowing[..., :3].astype(float) * reflection[..., None], 0, 255)
        paste(frame, flowing, box)
    for number, (box, smoke) in enumerate(smoke_sources):
        yy, xx = np.indices(smoke.shape[:2], dtype=float)
        tip = 1 - yy / smoke.shape[0]
        dx = tip * (3 * np.sin(q + yy * .08 + number) + 1.5 * np.sin(q * 2 + xx * .1))
        dy = tip * 1.4 * np.sin(q * 2 + xx * .09)
        paste(frame, displace(smoke, dx, dy), box, .8 + .1 * math.sin(q + number))
        for i in range(5):
            age = (phase + i / 5 + number * .13) % 1
            # Soft textured plumes rise from the chimney and fade before reset.
            glow(frame, box[0] + (25 if number == 0 else 13) + age * 32,
                 box[3] - 8 - age * (66 if number == 0 else 40),
                 7 + i % 3 * 2, (120, 127, 136), math.sin(age * math.pi) ** 2 * .065, .8)
    for i, (box, rgba) in enumerate(windows):
        # Different phases and periods, with gentle intensity variation; never
        # flash the entire town or extinguish every window at once.
        strength = .9 + .16 * math.sin(q * (2 + i % 3) + i * 1.7) + .06 * math.sin(q * 7 + i)
        changed = rgba.copy()
        changed[..., :3] = np.clip(changed[..., :3].astype(float) * strength, 0, 255)
        paste(frame, changed, box)


def render(index):
    phase = index / (FPS * SECONDS)
    q = phase * math.tau
    frame = plate.copy()
    animate_environment(frame, phase, q)
    # Warp the actual painted flame texture. The base stays fixed on the logs;
    # its tips bend and stretch independently rather than pulsing rectangles.
    yy, xx = np.indices(fire.shape[:2])
    tip = np.clip((100 - yy) / 100, 0, 1)
    xshift = tip ** 1.5 * (4 * np.sin(q * 5 + yy * .09) + 2 * np.sin(q * 9 + xx * .1))
    yshift = tip * (4 * np.sin(q * 7 + xx * .13) + 2 * np.sin(q * 3))
    flicker = .78 + .12 * math.sin(q * 7) + .08 * math.sin(q * 11 + 1)
    paste(frame, displace(fire, xshift, yshift), firebox, flicker)
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
command = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{SIZE[0]}x{SIZE[1]}',
           '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16',
           '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(out)]
process = subprocess.Popen(command, stdin=subprocess.PIPE)
try:
    for index in range(FPS * SECONDS):
        frame = render(index)
        process.stdin.write(frame.tobytes())
        if index in (0, 60, 120, 180):
            frame.save(f'/tmp/menu-loop-frame-{index}.png')
        if index % FPS == 0:
            print(f'Rendered {index // FPS}/{SECONDS} seconds', flush=True)
finally:
    process.stdin.close()
if process.wait() != 0:
    raise SystemExit('FFmpeg encoding failed')
print(f'Encoded {out.name}: {out.stat().st_size:,} bytes', flush=True)
