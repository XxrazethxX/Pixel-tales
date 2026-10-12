"""Optional close-up GIF previews of the rendered sprite sequences."""
from pathlib import Path
import os
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent.parent

def label(text):
    return f"drawtext=text='{text}':fontcolor=0xead8ac:fontsize=18:x=12:y=12:box=1:boxcolor=0x172323cc:boxborderw=6"

studies = {
    'fire-and-smoke-study.gif':
        f"[0:v]split[f][s];[f]crop=220:220:800:495,scale=420:420:flags=lanczos,{label('Campfire')}[a];"
        f"[s]crop=170:170:1420:230,scale=420:420:flags=lanczos,{label('Chimney smoke')}[b];[a][b]hstack",
    'river-and-lantern-study.gif':
        f"[0:v]split=3[l][w][r];[l]crop=63:90:7:240,scale=280:400:flags=lanczos,{label('Left lantern')}[a];"
        f"[w]crop=63:90:808:295,scale=280:400:flags=lanczos,{label('Wagon lantern')}[b];"
        f"[r]crop=330:100:1170:800,scale=600:182:flags=lanczos,pad=600:400:0:109:color=0x172323,{label('River current')}[c];"
        "[a][b][c]hstack=inputs=3",
}
with tempfile.TemporaryDirectory(prefix='pixel-menu-studies-') as cache:
    for name, composition in studies.items():
        graph = composition + ",fps=24,split[x][y];[x]palettegen=stats_mode=diff[p];[y][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle"
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(ROOT / 'assets/main-menu-loop.mp4'),
                        '-filter_complex', graph, '-t', '8', '-loop', '0', str(ROOT / 'docs/screenshots' / name)],
                       check=True, env={**os.environ, 'XDG_CACHE_HOME': cache})
        print(f'Exported {name}', flush=True)
