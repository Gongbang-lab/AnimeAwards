"""Generate static posters beside local meme videos. Requires imageio-ffmpeg.
Run with the Python used to install imageio-ffmpeg.
"""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.cache-thumbnail-tools'))
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
for source in (ROOT / 'image' / 'meme').rglob('*'):
    if source.suffix.lower() not in {'.mp4', '.webm', '.mov', '.m4v', '.ogv'}:
        continue
    poster = Path(str(source) + '.poster.jpg')
    if poster.exists() and poster.stat().st_mtime >= source.stat().st_mtime:
        continue
    subprocess.run([
        ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
        '-frames:v', '1', '-vf', 'scale=480:480:force_original_aspect_ratio=decrease',
        '-q:v', '4', str(poster)
    ], check=True)
    print(poster.name)
