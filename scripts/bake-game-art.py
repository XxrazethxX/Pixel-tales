"""Bake generated source atlases into small, self-contained game textures.
Optional art pipeline: Pillow. Runtime uses embedded PNGs, including file:// play.
"""
from pathlib import Path
from io import BytesIO
import base64
import json
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SPEC = {
    'heroes': ('companions-source.png', 6, 3, 30, 40),
    'props': ('scenery-source.png', 6, 3, 64, 64),
    'enemies': ('enemies-source.png', 4, 3, 48, 48),
}
def scenery_objects(source):
    """Isolate each of the 18 disconnected objects, not nominal grid cells.

    Oversized canopies and roofs cross the generated grid. Alpha-connected
    components preserve those complete silhouettes without importing neighbors.
    """
    rgba = np.asarray(source)
    solid = rgba[..., 3] > 100
    seen = np.zeros(solid.shape, dtype=bool)
    objects = []
    for yy, xx in zip(*np.nonzero(solid)):
        if seen[yy, xx]: continue
        stack, points = [(int(yy), int(xx))], []
        seen[yy, xx] = True
        while stack:
            y, x = stack.pop(); points.append((y, x))
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                a, b = y + dy, x + dx
                if 0 <= a < solid.shape[0] and 0 <= b < solid.shape[1] and solid[a,b] and not seen[a,b]:
                    seen[a,b] = True; stack.append((a,b))
        if len(points) < 1000: continue
        ys, xs = zip(*points)
        bounds = (max(0,min(xs)-2),max(0,min(ys)-2),min(source.width,max(xs)+3),min(source.height,max(ys)+3))
        mask = np.zeros(solid.shape, dtype=np.uint8)
        for y,x in points: mask[y,x] = 255
        # Keep the object's own antialiased outline, with no neighboring matte.
        mask = np.asarray(Image.fromarray(mask).filter(ImageFilter.MaxFilter(5)))
        data = rgba.copy(); data[mask == 0] = 0
        centre = ((min(xs)+max(xs))/2, (min(ys)+max(ys))/2)
        objects.append((centre, Image.fromarray(data).crop(bounds)))
    assert len(objects) == 18, f'Expected 18 distinct scenery objects, found {len(objects)}'
    ordered = []
    for low, high in ((0,400),(400,700),(700,source.height)):
        row = sorted((o for o in objects if low <= o[0][1] < high), key=lambda o:o[0][0])
        assert len(row) == 6, 'Scenery row must have six isolated objects'
        ordered.extend(o[1] for o in row)
    return ordered

manifest = {}
for kind, (name, columns, rows, width, height) in SPEC.items():
    source = Image.open(ROOT / 'assets/game-art' / name).convert('RGBA')
    atlas = Image.new('RGBA', (columns * width, rows * height))
    isolated = scenery_objects(source) if kind == 'props' else None
    for index in range(columns * rows):
        col, row = index % columns, index // columns
        if isolated is not None:
            cell = isolated[index]
        else:
            if kind == 'heroes':
                top, bottom = (0,352,684,1024)[row:row + 2]
            else:
                top, bottom = round(row * source.height / rows), round((row + 1) * source.height / rows)
            cell = source.crop((round(col * source.width / columns), top,
                                round((col + 1) * source.width / columns), bottom))
        rgba = np.asarray(cell).copy()
        rgba[rgba[..., 3] <= 16] = 0
        # Use the actual solid object, ignoring almost-transparent matte noise.
        mask = Image.fromarray(np.where(rgba[..., 3] > 48, 255, 0).astype('uint8'))
        bounds = mask.getbbox()
        assert bounds, (kind, index, 'empty object')
        cell = Image.fromarray(rgba).crop(bounds)
        cell.thumbnail((width - 2, height - 2), Image.Resampling.LANCZOS)
        if kind == 'heroes':
            # Drop detached scraps from neighboring atlas cells at native scale.
            data = np.asarray(cell).copy()
            mask = data[..., 3] > 48
            seen = set()
            for yy, xx in zip(*np.nonzero(mask)):
                if (yy, xx) in seen: continue
                stack, points = [(int(yy), int(xx))], []
                seen.add((yy, xx))
                while stack:
                    y, x = stack.pop(); points.append((y, x))
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            a, b = y + dy, x + dx
                            if 0 <= a < mask.shape[0] and 0 <= b < mask.shape[1] and mask[a, b] and (a, b) not in seen:
                                seen.add((a, b)); stack.append((a, b))
                if len(points) < 6 or (len(points) < 15 and max(y for y, x in points) < 3):
                    for y, x in points: data[y, x] = 0
            cell = Image.fromarray(data)
        # Quantize once at native sprite scale; alpha remains intact.
        cell = cell.quantize(colors=48, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).convert('RGBA')
        atlas.paste(cell, (col * width + (width - cell.width) // 2,
                          row * height + height - cell.height - 1))
    path = ROOT / 'assets/game-art' / f'{kind}-native.png'
    atlas.save(path, optimize=True)
    blob = BytesIO(); atlas.save(blob, format='PNG', optimize=True)
    manifest[kind] = {'columns': columns, 'rows': rows, 'width': width, 'height': height,
                      'png': base64.b64encode(blob.getvalue()).decode()}
    print(f'{kind}: {columns * rows} native sprites; {len(blob.getvalue()):,} embedded bytes')
(ROOT / 'src/art-assets.js').write_text('// Generated by scripts/bake-game-art.py; original artwork in assets/game-art.\n'
                                      'export const gameArtData = ' + json.dumps(manifest, separators=(',', ':')) + ';\n')
