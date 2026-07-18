import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / ".tmp" / "gzhh-images"
AUDIT = BASE / "audit.json"
OUTPUT = ROOT / "public" / "assets" / "wechat-archive"

SELECTED_IDS = [
    81, 84, 85, 88, 89,
    117, 121, 129, 132,
    145, 146, 150, 151, 152, 153,
    159, 160, 161, 162,
    176, 178, 180, 181,
    193, 196, 197,
    368, 370, 373, 375,
    382, 387, 388, 391,
    396, 405, 408, 411,
    446, 455, 459,
    470, 480, 490, 499,
]

records = {item["id"]: item for item in json.loads(AUDIT.read_text(encoding="utf-8"))}
OUTPUT.mkdir(parents=True, exist_ok=True)

exported = []
for image_id in SELECTED_IDS:
    record = records[image_id]
    source_path = ROOT / record["path"]
    output_name = f"wechat-{image_id:03d}.webp"
    output_path = OUTPUT / output_name
    with Image.open(source_path) as image:
        frame = ImageOps.exif_transpose(image).convert("RGB")
        frame.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
        frame.save(output_path, "WEBP", quality=84, method=6)
    exported.append({
        "id": image_id,
        "file": output_name,
        "source": record.get("sources", [""])[0],
        "width": frame.width,
        "height": frame.height,
        "bytes": output_path.stat().st_size,
    })

(BASE / "selected-manifest.json").write_text(
    json.dumps(exported, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
print(json.dumps({
    "selected": len(exported),
    "bytes": sum(item["bytes"] for item in exported),
    "output": str(OUTPUT.relative_to(ROOT)),
}, ensure_ascii=False))
