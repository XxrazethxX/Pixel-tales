"""Play separately drawn flame, smoke and river foam sprite sequences."""
from functools import lru_cache
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent

@lru_cache(maxsize=4)
def frames(kind):
    names = {'fire': 'campfire-frames.png', 'smoke': 'chimney-smoke-frames.png',
             'lantern': 'campfire-frames.png', 'river': 'river-foam-frames.png'}
    path = ROOT / 'assets/animation' / names[kind]
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
        if kind == 'river':
            # Isolate the fine painted foam clusters from the generator's
            # diffuse matte fringe, so no rectangular glow travels with them.
            luminance = rgba[..., :3].astype(float).mean(axis=2)
            blurred = np.asarray(Image.fromarray(luminance.astype('uint8')).filter(ImageFilter.GaussianBlur(3)))
            detail = np.clip((luminance - blurred - 1) / 12, 0, 1)
            rgba[..., 3] = (rgba[..., 3].astype(float) * detail).astype('uint8')
        cell = Image.fromarray(rgba)
        ys, xs = np.nonzero(rgba[..., 3] > 40)
        canvas = Image.new('RGBA', (width, height))
        if len(xs):
            center_x = (int(xs.min()) + int(xs.max())) / 2
            dx = round(width / 2 - center_x)
            if kind in ('fire', 'lantern'):
                dy = height - 12 - int(ys.max())
            else:
                dy = round(height / 2 - (int(ys.min()) + int(ys.max())) / 2)
            canvas.paste(cell, (dx, dy))
        result.append(canvas)
    return tuple(result)

@lru_cache(maxsize=64)
def resized(kind, index):
    size = {'fire': 98, 'smoke': 88, 'lantern': 24, 'river': 112}[kind]
    height = round(size * frames(kind)[index].height / frames(kind)[index].width) if kind == 'river' else size
    return frames(kind)[index].resize((size, height), Image.Resampling.LANCZOS)

def draw_fire(frame, scene_phase, scale_x, scale_y):
    # Four slow 16-pose cycles in eight seconds = eight drawings per second.
    index = int(scene_phase * 64) % 16
    art = resized('fire', index)
    base = (frames('fire')[index].height - 12) / frames('fire')[index].height * art.height
    art = art.resize((round(98 * scale_x), round(98 * scale_y)), Image.Resampling.LANCZOS)
    frame.paste(art, (round((950 - 49) * scale_x), round((719 - base) * scale_y)), art)

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


def blend_pose(kind, age):
    position = min(age * 16, 15.999)
    index, fraction = int(position), position % 1
    a, b = resized(kind, index), resized(kind, (index + 1) % 16)
    aa, bb = np.asarray(a).astype(float), np.asarray(b).astype(float)
    aa[..., :3] *= aa[..., 3:] / 255
    bb[..., :3] *= bb[..., 3:] / 255
    rgba = aa * (1 - fraction) + bb * fraction
    rgba[..., :3] *= 255 / np.maximum(rgba[..., 3:], .001)
    return Image.fromarray(np.clip(rgba, 0, 255).astype('uint8'))


def draw_lantern(frame, scene_phase, number, scale_x, scale_y):
    index = (int(scene_phase * 48) + number * 7) % 16
    art = resized('lantern', index)
    anchor = (frames('lantern')[index].height - 12) / frames('lantern')[index].height * art.height
    x, y = ((40, 308) if number == 0 else (877, 365))
    # The housing and panes stay on the background; only the flame is redrawn.
    art = art.resize((round(24 * scale_x), round(24 * scale_y)), Image.Resampling.LANCZOS)
    frame.paste(art, (round((x - 12) * scale_x), round((y - anchor) * scale_y)), art)
    return lantern_energy(index)


def river_position(age, region):
    if region == 0:
        # Cubic path around the foreground boulders, always downstream.
        points = np.array([(1500, 880), (1454, 884), (1398, 903), (1445, 948)], float)
        b = 1 - age
        return b ** 3 * points[0] + 3 * b * b * age * points[1] + 3 * b * age * age * points[2] + age ** 3 * points[3]
    if region == 1:
        return np.array([1498 + age * 85, 481 + age * 18])
    return np.array([1395 - age * 215, 262 + age * 4])


def draw_river(frame, scene_phase, region, box, alpha, scale_x, scale_y):
    layer = Image.new('RGBA', (box[2] - box[0], box[3] - box[1]))
    count = 4 if region == 0 else 3
    size = (64, 18, 24)[region]
    for crest in range(count):
        age = (scene_phase * 2 + crest / count + region * .13) % 1
        art = blend_pose('river', age)
        art = art.resize((size, round(size * art.height / art.width)), Image.Resampling.LANCZOS)
        rgba = np.asarray(art).copy()
        opacity = (.4, .3, .24)[region] * np.sin(age * np.pi) ** .7
        rgba[..., 3] = (rgba[..., 3] * opacity).astype('uint8')
        art = Image.fromarray(rgba)
        x, y = river_position(age, region)
        y += (crest % 3 - 1) * (4 if region == 0 else 1)
        layer.alpha_composite(art, (round(x - box[0] - art.width / 2), round(y - box[1] - art.height / 2)))
    # Fixed shoreline masks prevent foam from painting the rocks or banks.
    rgba = np.asarray(layer).copy()
    rgba[..., 3] = (rgba[..., 3].astype(float) * alpha.astype(float) / 255).astype('uint8')
    layer = Image.fromarray(rgba).resize((round(layer.width * scale_x), round(layer.height * scale_y)), Image.Resampling.LANCZOS)
    frame.paste(layer, (round(box[0] * scale_x), round(box[1] * scale_y)), layer)


@lru_cache(maxsize=16)
def lantern_energy(index):
    areas = [np.asarray(pose)[..., 3].astype(float).sum() for pose in frames('lantern')]
    return (areas[index] * .5 + areas[(index - 1) % 16] * .25 + areas[(index + 1) % 16] * .25) / max(areas)
