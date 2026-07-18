import hashlib
import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".tmp" / "gzhh-images"
RAW = CACHE / "raw"
MANIFEST = CACHE / "manifest.json"
ARTICLES = ROOT / "src" / "data" / "articles.generated.json"
OUTPUT = ROOT / "public" / "assets" / "article-covers"

manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
by_url = {
    item["url"]: item
    for item in manifest
    if item.get("status") == "ok" and item.get("file")
}
articles = json.loads(ARTICLES.read_text(encoding="utf-8"))
OUTPUT.mkdir(parents=True, exist_ok=True)

exported = 0
missing = []
used_files = set()

for article in articles:
    source_url = article.get("coverSourceUrl") or article.get("cover", "")
    if not source_url.startswith("http"):
        continue
    cache_entry = by_url.get(source_url)
    if not cache_entry:
        missing.append({"title": article.get("title", ""), "url": source_url})
        continue

    key = hashlib.sha256(source_url.encode("utf-8")).hexdigest()[:12]
    output_name = f"cover-{key}.webp"
    output_path = OUTPUT / output_name
    with Image.open(RAW / cache_entry["file"]) as image:
        frame = ImageOps.exif_transpose(image).convert("RGB")
        frame.thumbnail((960, 960), Image.Resampling.LANCZOS)
        frame.save(output_path, "WEBP", quality=82, method=6)

    article["coverSourceUrl"] = source_url
    article["cover"] = f"/assets/article-covers/{output_name}"
    used_files.add(output_name)
    exported += 1

ARTICLES.write_text(
    json.dumps(articles, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)

summary = {
    "articles": len(articles),
    "exported": exported,
    "uniqueFiles": len(used_files),
    "missing": len(missing),
    "bytes": sum((OUTPUT / name).stat().st_size for name in used_files),
}
print(json.dumps(summary, ensure_ascii=False))
if missing:
    raise RuntimeError(f"Missing {len(missing)} cached cover images")
