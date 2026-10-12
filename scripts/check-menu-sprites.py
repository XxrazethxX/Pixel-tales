"""Verify the authored sequences grow/fragment and remain anchored."""
import hashlib
import numpy as np
from menu_sprite_frames import frames


def components(mask):
    seen, counts = set(), []
    for y, x in zip(*np.nonzero(mask)):
        if (y, x) in seen:
            continue
        stack, count = [(int(y), int(x))], 0
        seen.add((y, x))
        while stack:
            y, x = stack.pop(); count += 1
            for dy, dx in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                yy, xx = y + dy, x + dx
                if 0 <= yy < mask.shape[0] and 0 <= xx < mask.shape[1] and mask[yy, xx] and (yy, xx) not in seen:
                    seen.add((yy, xx)); stack.append((yy, xx))
        if count >= 15:
            counts.append(count)
    return len(counts)

for kind in ('fire', 'smoke', 'lantern', 'river'):
    sequence = [np.asarray(frame) for frame in frames(kind)]
    assert len(sequence) == 16
    silhouettes = [rgba[..., 3] > 40 for rgba in sequence]
    assert len({hashlib.sha256(mask.tobytes()).digest() for mask in silhouettes}) == 16
    areas = [int(mask.sum()) for mask in silhouettes]
    assert max(areas) > areas[0] * 2, f'{kind} does not grow'
    if kind in ('smoke', 'river'):
        assert areas[-1] < max(areas) * .15, f'{kind} must dissipate'
        assert max(components(mask) for mask in silhouettes[9:]) > 1, f'Late {kind} must break into fragments'
    else:
        bottoms = [np.nonzero(mask)[0].max() for mask in silhouettes]
        assert max(bottoms) - min(bottoms) <= 1, 'Flame base drifts off logs'
    print(f'{kind}: sixteen distinct silhouettes, growth and ' + ('dissipation/fragmentation' if kind in ('smoke', 'river') else 'fixed flame base') + ' verified')


from menu_sprite_frames import draw_river, river_position
from PIL import Image
# The foreground current must advance downstream, never oscillate backwards.
path = [river_position(age, 0) for age in np.linspace(0, 1, 33)]
assert all(b[1] > a[1] for a, b in zip(path, path[1:]))
turns = np.sign(np.diff(np.array(path)[:, 0]))
assert np.sum(turns[:-1] != turns[1:]) <= 1, 'Current repeatedly reverses instead of going around rocks'
# A hole represents a fixed rock; no sprite may paint outside the water mask.
box = (1210, 839, 1515, 941)
mask = np.zeros((102, 305), dtype='uint8')
mask[15:90, 20:285] = 255
mask[35:65, 140:180] = 0
base = Image.new('RGB', (1672, 941), '#24343f')
for phase in (0, .13, .31, .7):
    frame = base.copy()
    draw_river(frame, phase, 0, box, mask, 1, 1)
    changed = np.any(np.asarray(frame)[839:941, 1210:1515] != np.asarray(base)[839:941, 1210:1515], axis=2)
    assert np.any(changed), 'Foam did not render on water'
    assert not np.any(changed[mask == 0]), 'Foam crosses a bank or rock'
print('river: downstream advection and fixed bank/rock masks verified')
