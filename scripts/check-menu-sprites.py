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

for kind in ('fire', 'smoke'):
    sequence = [np.asarray(frame) for frame in frames(kind)]
    assert len(sequence) == 16
    silhouettes = [rgba[..., 3] > 40 for rgba in sequence]
    assert len({hashlib.sha256(mask.tobytes()).digest() for mask in silhouettes}) == 16
    areas = [int(mask.sum()) for mask in silhouettes]
    assert max(areas) > areas[0] * 2, f'{kind} does not grow'
    if kind == 'smoke':
        assert areas[-1] < max(areas) * .1, 'Smoke must dissipate'
        assert max(components(mask) for mask in silhouettes[9:]) > 1, 'Late smoke must break into fragments'
    else:
        bottoms = [np.nonzero(mask)[0].max() for mask in silhouettes]
        assert max(bottoms) - min(bottoms) <= 1, 'Flame base drifts off logs'
    print(f'{kind}: sixteen distinct silhouettes, growth and ' + ('dissipation/fragmentation' if kind == 'smoke' else 'fixed flame base') + ' verified')
