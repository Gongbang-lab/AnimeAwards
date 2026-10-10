"""Convert character JPG/PNG images to WebP and update existing data references.
Requires Pillow. Originals are retained; existing WebP files are never overwritten.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'image' / 'charimg'


def convert(source):
    target = source.with_suffix('.webp')
    if target.exists() or any(source.with_suffix(ext).exists() for ext in ('.jpg', '.jpeg', '.png') if ext != source.suffix):
        target = source.with_name(source.name + '.webp')
    if target.exists():
        raise FileExistsError(f'Refusing to overwrite: {target}')
    try:
        with Image.open(source) as original:
            image = ImageOps.exif_transpose(original)
            image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
            image.save(target, 'WEBP', quality=85, method=6)
        return {
            'source': source.relative_to(ROOT).as_posix(),
            'target': target.relative_to(ROOT).as_posix(),
            'before': source.stat().st_size,
            'after': target.stat().st_size,
        }
    except Exception:
        if target.exists():
            target.unlink()
        raise


if __name__ == '__main__':
    sources = sorted(p for p in SOURCE.rglob('*') if p.suffix.lower() in ('.jpg', '.jpeg', '.png'))
    with ThreadPoolExecutor(max_workers=8) as pool:
        rows = list(pool.map(convert, sources))
    changed = []
    for path in (ROOT / 'data').rglob('*.js'):
        text = path.read_text(encoding='utf-8')
        updated = text
        for row in rows:
            # Replace complete quoted paths only, without changing data schemas.
            for quote in ('"', "'"):
                updated = updated.replace(quote + row['source'] + quote, quote + row['target'] + quote)
        if updated != text:
            path.write_text(updated, encoding='utf-8')
            changed.append(path.relative_to(ROOT).as_posix())
    report = {'quality': 85, 'resized': False, 'originalsRetained': True,
              'count': len(rows), 'before': sum(r['before'] for r in rows),
              'after': sum(r['after'] for r in rows), 'updatedData': changed, 'files': rows}
    (ROOT / 'dataCollector' / 'char-webp-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'files'}, ensure_ascii=False))
