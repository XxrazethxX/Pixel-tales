"""Validate exported media and motion in the scene's real feature regions."""
from pathlib import Path
import json
import subprocess
import numpy as np
from PIL import Image, ImageSequence

ROOT = Path(__file__).resolve().parent.parent
video = ROOT / 'assets/main-menu-loop.mp4'
metadata = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)]))
stream = metadata['streams'][0]
assert (stream['width'], stream['height']) == (1600, 900)
assert stream['r_frame_rate'] == '30/1'
assert len(metadata['streams']) == 1 and stream['codec_type'] == 'video'
assert abs(float(metadata['format']['duration']) - 8) < .02
indices = [0, 21, 48, 75, 102, 129, 156, 183, 210, 239]
selection = 'select=' + '+'.join(f'eq(n\\,{index})' for index in indices)
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(video), '-vf', selection,
                               '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
frames = np.frombuffer(raw, dtype=np.uint8).reshape(len(indices), 900, 1600, 3)
sx, sy = 1600 / 1672, 900 / 941
regions = {
    'campfire': (905, 620, 1010, 730),
    'mage orb': (1460, 545, 1511, 595),
    'left lantern': (27, 270, 53, 315),
    'wagon lantern': (865, 332, 889, 372),
    'village chimney smoke': (1549, 277, 1632, 353),
    'second chimney smoke': (1625, 307, 1670, 358),
    'settlement windows': (1300, 290, 1671, 415),
    'castle lights': (1405, 112, 1420, 130),
    'far hamlet lights': (1098, 290, 1118, 302),
    'foreground river': (1355, 868, 1488, 918),
    'distant river': (1380, 460, 1505, 511),
    'lake reflections': (1190, 247, 1400, 278),
}
for name, (x, y, r, b) in regions.items():
    crop = frames[:, round(y * sy):round(b * sy), round(x * sx):round(r * sx)].astype(float)
    movement = float(np.std(crop, axis=0).mean())
    assert movement > .08, f'{name} has no meaningful motion: {movement}'
    print(f'{name}: decoded motion verified ({movement:.3f})')
# The nearby shield bearer's face and bridge masonry must not warp with water.
for name, (x, y, r, b) in {'companion face': (653, 521, 695, 558), 'bridge': (1400, 445, 1460, 460)}.items():
    crop = frames[:, round(y * sy):round(b * sy), round(x * sx):round(r * sx)].astype(float)
    assert float(np.std(crop, axis=0).mean()) < .5, f'{name} moves unintentionally'
seam = float(np.abs(frames[0].astype(float) - frames[-1].astype(float)).mean())
assert seam < .8, f'Loop seam is too abrupt: {seam}'
print(f'Loop seam verified ({seam:.3f})')
gif = Image.open(ROOT / 'docs/screenshots/main-menu-animation.gif')
assert gif.size == (1280, 720) and gif.n_frames >= 180 and gif.info['loop'] == 0
duration = sum(frame.info.get('duration', 0) for frame in ImageSequence.Iterator(gif))
assert abs(duration - 8000) <= 100
print(f'GIF verified: {gif.n_frames} frames, {duration} ms, infinite loop')
