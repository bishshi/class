import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / ".tmp" / "gzhh-images"
RAW = BASE / "raw"
MANIFEST = BASE / "manifest.json"
AUDIT = BASE / "audit.json"
SHEETS = BASE / "contact-sheets"

CELL_WIDTH = 280
CELL_HEIGHT = 220
COLS = 5
ROWS = 4
PER_SHEET = COLS * ROWS


def font(size: int):
    paths = [
        Path("C:/Windows/Fonts/msyh.ttc"),
        Path("C:/Windows/Fonts/simhei.ttf"),
    ]
    for path in paths:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


small_font = font(14)
label_font = font(16)
title_font = font(22)


manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
unique_entries = []
seen_files = set()

for entry in manifest:
    file_name = entry.get("file")
    if entry.get("status") != "ok" or not file_name or file_name in seen_files:
        continue
    seen_files.add(file_name)
    image_path = RAW / file_name
    record = {
        "id": len(unique_entries) + 1,
        "file": file_name,
        "path": image_path.relative_to(ROOT).as_posix(),
        "sources": entry.get("sources", []),
        "alts": entry.get("alts", []),
        "bytes": entry.get("bytes", 0),
        "hash": entry.get("hash", ""),
    }
    try:
        with Image.open(image_path) as image:
            record["width"], record["height"] = image.size
            record["format"] = image.format
            preview = image.convert("RGB")
            preview.thumbnail((128, 128))
            record["entropy"] = round(preview.convert("L").entropy(), 3)
            record["candidate"] = (
                record["width"] * record["height"] >= 200_000
                and min(record["width"], record["height"]) >= 280
                and 0.32 <= record["width"] / record["height"] <= 3.2
                and record["entropy"] >= 3.2
            )
    except Exception as error:
        record["error"] = str(error)
        record["candidate"] = False
    unique_entries.append(record)

AUDIT.write_text(json.dumps(unique_entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
SHEETS.mkdir(parents=True, exist_ok=True)

candidates = [item for item in unique_entries if item.get("candidate")]

for sheet_index in range(math.ceil(len(candidates) / PER_SHEET)):
    page_items = candidates[sheet_index * PER_SHEET : (sheet_index + 1) * PER_SHEET]
    sheet = Image.new("RGB", (CELL_WIDTH * COLS, 48 + CELL_HEIGHT * ROWS), "#f7f3e8")
    draw = ImageDraw.Draw(sheet)
    draw.text(
        (18, 10),
        f"公众号图片候选 {sheet_index + 1}/{math.ceil(len(candidates) / PER_SHEET)} · {len(candidates)} 张",
        fill="#1f2b2a",
        font=title_font,
    )
    for item_index, item in enumerate(page_items):
        col = item_index % COLS
        row = item_index // COLS
        x = col * CELL_WIDTH
        y = 48 + row * CELL_HEIGHT
        draw.rectangle((x + 5, y + 5, x + CELL_WIDTH - 5, y + CELL_HEIGHT - 5), fill="#ffffff", outline="#d6d7cf")
        try:
            with Image.open(ROOT / item["path"]) as source:
                preview = ImageOps.contain(source.convert("RGB"), (CELL_WIDTH - 24, 154))
                px = x + (CELL_WIDTH - preview.width) // 2
                py = y + 12 + (154 - preview.height) // 2
                sheet.paste(preview, (px, py))
        except Exception:
            pass
        source_name = Path(item["sources"][0]).stem if item["sources"] else "未知来源"
        source_name = source_name[:20]
        draw.text((x + 12, y + 170), f"#{item['id']:03d}  {item['width']}×{item['height']}", fill="#376d5a", font=label_font)
        draw.text((x + 12, y + 192), source_name, fill="#596563", font=small_font)
    sheet.save(SHEETS / f"sheet-{sheet_index + 1:02d}.jpg", quality=90)

summary = {
    "unique": len(unique_entries),
    "candidates": len(candidates),
    "rejected_by_shape_or_size": len(unique_entries) - len(candidates),
    "sheets": math.ceil(len(candidates) / PER_SHEET),
}
print(json.dumps(summary, ensure_ascii=False))
