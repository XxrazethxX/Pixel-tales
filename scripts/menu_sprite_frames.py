"""Play separately drawn sprite cells; no texture distortion for fire or puffs."""
from functools import lru_cache
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

@lru_cache(maxsize=2)
def frames(kind):
    path = ROOT / 'assets/animation' / ('campfire-frames.png' if kind == 'fire' else 'chimney-smoke-frames.png')
    sheet = Image.open(path).convert('RGBA')
    width, height = round(sheet.width / 4) + 24, round(sheet.height / 4) + 24
    result = []
    for index in range(16):
        column, row = index % 4, index // 4
        cell = sheet.crop((round(column * sheet.width / 4), round(row * sheet.height / 4),
                           round((column + 1) * sheet.width / 4), round((row + 1) * sheet.height / 4)))
        rgba = np.asarray(cell).copy()
        # Generator matte noise has alpha 1–8; exclude it from anchor detection
        # and compositing without changing the drawn opaque sprite shapes.
        rgba[rgba[..., 3] <= 8] = 0
        cell = Image.fromarray(rgba)
        ys, xs = np.nonzero(rgba[..., 3] > 40)
        canvas = Image.new('RGBA', (width, height))
        if len(xs):
            center_x = (int(xs.min()) + int(xs.max())) / 2
            dx = round(width / 2 - center_x)
            if kind == 'fire':
                dy = height - 12 - int(ys.max())
            else:
                dy = round(height / 2 - (int(ys.min()) + int(ys.max())) / 2)
            canvas.paste(cell, (dx, dy))
        result.append(canvas)
    return tuple(result)

@lru_cache(maxsize=32)
def resized(kind, index):
    size = 140 if kind == 'fire' else 88
    return frames(kind)[index].resize((size, size), Image.Resampling.LANCZOS)

def draw_fire(frame, scene_phase, scale_x, scale_y):
    # Six 16-drawing cycles in eight seconds = twelve authored poses/second.
    index = int(scene_phase * 96) % 16
    art = resized('fire', index)
    base = (frames('fire')[index].height - 12) / frames('fire')[index].height * art.height
    art = art.resize((round(140 * scale_x), round(140 * scale_y)), Image.Resampling.LANCZOS)
    frame.paste(art, (round((950 - 70) * scale_x), round((719 - base) * scale_y)), art)

def draw_chimney(frame, scene_phase, scale_x, scale_y):
    # Three staggered four-second lifetimes. The artwork supplies growth and
    # fragmentation; ordinary translation supplies upward drift between poses.
    for puff in range(3):
        age = (scene_phase * 2 + puff / 3) % 1
        position = age * 16
        index = min(15, int(position))
        fraction = position - index
        a = resized('smoke', index)
        b = resized('smoke', index + 1) if index < 15 else Image.new('RGBA', a.size)
        # Crossfade premultiplied colors to avoid blue/black alpha edge halos.
        aa, bb = np.asarray(a).astype(float), np.asarray(b).astype(float)
        aa[..., :3] *= aa[..., 3:] / 255
        bb[..., :3] *= bb[..., 3:] / 255
        rgba = aa * (1 - fraction) + bb * fraction
        rgba[..., :3] *= 255 / np.maximum(rgba[..., 3:], .001)
        # Dense at birth, progressively thinner as the puff dissipates.
        rgba[..., 3] *= min(1, age * 10) * (1 - age) ** .5 * .52
        art = Image.fromarray(np.clip(rgba, 0, 255).astype('uint8'))
        x = 1569 + age * 29
        y = 347 - age * 61
        art = art.resize((round(88 * scale_x), round(88 * scale_y)), Image.Resampling.LANCZOS)
        frame.paste(art, (round((x - 44) * scale_x), round((y - 44) * scale_y)), art)
