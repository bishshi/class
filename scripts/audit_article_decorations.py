import json
import math
import re
import sys
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ARTICLE_DIR = ROOT / "gzhh"
IMAGE_DIR = ROOT / "public" / "assets" / "article-images"
OUTPUT = ROOT / ".tmp" / "article-decoration-audit"
SHEETS = OUTPUT / "sheets"
AUDIT = OUTPUT / "suspects.json"
ARTICLE_SUMMARY = OUTPUT / "article-summary.json"

IMAGE_RE = re.compile(
    r"(?:!\[[^\]]*\]\(|(?:src=[\"']))(/assets/article-images/[^\s\)\"']+)"
)
CELL_WIDTH = 300
CELL_HEIGHT = 230
COLS = 4
ROWS = 4
PER_SHEET = COLS * ROWS


def font(size: int):
    for candidate in [Path("C:/Windows/Fonts/msyh.ttc"), Path("C:/Windows/Fonts/simhei.ttf")]:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


small_font = font(13)
label_font = font(15)
title_font = font(21)

# These low-information images still carry article content: screenshots, photos,
# schedules, and the animated A4-life grid used by its source article.
KEEP_SUSPECT_PREFIXES = {
    "0d3b245d02b09b39",
    "13d8e23e065f93f1",
    "29c1d15bf3c2faf1",
    "2bb9ea5796a262b4",
    "3700067244fe5014",
    "3a7428906e89e5ac",
    "4db9a8f973d1bbff",
    "5076e8467ecd83ee",
    "60cb6a1301d0e13e",
    "6a84bc8238505ffd",
    "6f4c9a480aade7d2",
    "7e1d95f34e1abc87",
    "9bd41a528c55752e",
    "b404ae6d872f42d0",
    "b56a90c829b5b2e3",
    "bccbd4bc049c23d8",
    "bf1fd45f7a3a1eeb",
    "c019ca0c2ae29485",
    "c65120175f30cf83",
    "e2a6118081651a11",
    "e604efcd82065fed",
    "eb5cacf2e888480c",
    "f92f08eeb2ef26ad",
}

# Larger assets that visual review confirmed are also generic WeChat-layout
# material rather than article evidence.
EXTRA_REMOVE_PREFIXES = {
    "0c04484cc5aeb3ad",  # Mother's Day sticker
    "3849f22d62c338fd",  # generic parent-and-child illustration
    "3df276b70b1aab09",  # decorative heart
    "55544625b4b09f0c",  # decorative leaf
    "5a7bd73fda12f580",  # redundant Spring Festival poster
    "5e75df20512098f2",  # stock parent-and-child photo
    "6ad20a7a8fefc393",  # missing-image placeholder
    "7b0a4c5746ab34eb",  # Spring Festival background strip
    "7b104f0a0b25bdfc",  # decorative whale
    "7b4af7516586bda8",  # WeChat QR code
    "84d1989a5d7cf6ff",  # decorative whale
    "8c9ac2b3160ef1b1",  # response-card ornament
    "92087eb65158d93d",  # decorative camera
    "986cf9b560db0a35",  # decorative umbrella
    "9adb9c2af3eb6602",  # decorative blue background
    "b7878e6a72b53dca",  # stock room photo
    "ec6d6d3f25f8b1c7",  # obsolete QR code
    "f6773429abc5f58f",  # Spring Festival background strip
    "fbc54d3acd9921f4",  # Spring Festival background strip
    "fd3db9def651620a",  # Christmas ornament
}

articles_by_image: dict[str, list[str]] = defaultdict(list)
for markdown_path in sorted(ARTICLE_DIR.glob("*.md")):
    markdown = markdown_path.read_text(encoding="utf-8")
    for reference in IMAGE_RE.findall(markdown):
        file_name = Path(reference).name
        if markdown_path.stem not in articles_by_image[file_name]:
            articles_by_image[file_name].append(markdown_path.stem)

suspects = []
for image_path in sorted(IMAGE_DIR.iterdir()):
    if image_path.name not in articles_by_image:
        continue
    record = {
        "file": image_path.name,
        "path": image_path.relative_to(ROOT).as_posix(),
        "articles": articles_by_image[image_path.name],
        "bytes": image_path.stat().st_size,
        "reasons": [],
    }
    try:
        with Image.open(image_path) as image:
            record["width"], record["height"] = image.size
            record["format"] = image.format
            if getattr(image, "is_animated", False):
                image.seek(max(0, image.n_frames // 2))
            preview = image.convert("RGB")
            preview.thumbnail((128, 128))
            record["entropy"] = round(preview.convert("L").entropy(), 3)
    except Exception as error:
        record["error"] = str(error)
        record["reasons"].append("无法生成预览")

    width = record.get("width", 0)
    height = record.get("height", 0)
    if width and height:
        ratio = width / height
        if min(width, height) < 180:
            record["reasons"].append("尺寸过小")
        if width * height < 160_000:
            record["reasons"].append("低像素")
        if ratio > 3.4:
            record["reasons"].append("横向分隔条")
        if ratio < 0.28:
            record["reasons"].append("纵向装饰条")
        if record.get("entropy", 9) < 3.1:
            record["reasons"].append("低信息量")
    if len(record["articles"]) > 1:
        record["reasons"].append("跨文章复用")
    if record["reasons"]:
        suspects.append(record)

OUTPUT.mkdir(parents=True, exist_ok=True)
SHEETS.mkdir(parents=True, exist_ok=True)
AUDIT.write_text(json.dumps(suspects, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
suspect_files = {item["file"] for item in suspects}
article_summary = []
for markdown_path in sorted(ARTICLE_DIR.glob("*.md")):
    markdown = markdown_path.read_text(encoding="utf-8")
    references = [Path(reference).name for reference in IMAGE_RE.findall(markdown)]
    article_summary.append(
        {
            "article": markdown_path.stem,
            "images": len(references),
            "suspects": sum(reference in suspect_files for reference in references),
            "headings": len(re.findall(r"^#{1,6}\s+", markdown, re.MULTILINE)),
            "lists": len(re.findall(r"^\s*(?:[-*+] |\d+[.)]\s+)", markdown, re.MULTILINE)),
            "nonemptyLines": len([line for line in markdown.splitlines() if line.strip()]),
        }
    )
article_summary.sort(key=lambda item: (-item["suspects"], -item["images"], item["article"]))
ARTICLE_SUMMARY.write_text(json.dumps(article_summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

for sheet_index in range(math.ceil(len(suspects) / PER_SHEET)):
    items = suspects[sheet_index * PER_SHEET : (sheet_index + 1) * PER_SHEET]
    sheet = Image.new("RGB", (CELL_WIDTH * COLS, 48 + CELL_HEIGHT * ROWS), "#f4f7f8")
    draw = ImageDraw.Draw(sheet)
    draw.text(
        (18, 10),
        f"疑似无意义装饰 {sheet_index + 1}/{math.ceil(len(suspects) / PER_SHEET)} · {len(suspects)} 张",
        fill="#18364b",
        font=title_font,
    )
    for item_index, item in enumerate(items):
        col = item_index % COLS
        row = item_index // COLS
        x = col * CELL_WIDTH
        y = 48 + row * CELL_HEIGHT
        draw.rectangle((x + 5, y + 5, x + CELL_WIDTH - 5, y + CELL_HEIGHT - 5), fill="#ffffff", outline="#ccd8df")
        try:
            with Image.open(ROOT / item["path"]) as source:
                if getattr(source, "is_animated", False):
                    source.seek(max(0, source.n_frames // 2))
                preview = ImageOps.contain(source.convert("RGB"), (CELL_WIDTH - 24, 145))
                px = x + (CELL_WIDTH - preview.width) // 2
                py = y + 10 + (145 - preview.height) // 2
                sheet.paste(preview, (px, py))
        except Exception:
            draw.text((x + 18, y + 70), "SVG / 无预览", fill="#8b4b4b", font=label_font)
        dimensions = f"{item.get('width', '?')}×{item.get('height', '?')}"
        draw.text((x + 12, y + 162), f"{item['file'][:16]}  {dimensions}", fill="#276a5d", font=label_font)
        draw.text((x + 12, y + 184), "、".join(item["reasons"])[:28], fill="#7c4c34", font=small_font)
        article = item["articles"][0][:22]
        draw.text((x + 12, y + 204), article, fill="#536773", font=small_font)
    sheet.save(SHEETS / f"suspects-{sheet_index + 1:02d}.jpg", quality=91)


def clean_articles() -> dict:
    removal_files = {
        item["file"]
        for item in suspects
        if not any(item["file"].startswith(prefix) for prefix in KEEP_SUSPECT_PREFIXES)
    }
    for image_path in IMAGE_DIR.iterdir():
        if any(image_path.name.startswith(prefix) for prefix in EXTRA_REMOVE_PREFIXES):
            removal_files.add(image_path.name)

    changed_articles = 0
    removed_references = 0
    removed_duplicates = 0
    for markdown_path in sorted(ARTICLE_DIR.glob("*.md")):
        markdown = markdown_path.read_text(encoding="utf-8")
        seen_images = set()
        output_lines = []
        changed = False
        for line in markdown.splitlines():
            matches = IMAGE_RE.findall(line)
            remove_references = []
            for reference in matches:
                file_name = Path(reference).name
                if file_name in removal_files:
                    remove_references.append(reference)
                    removed_references += 1
                    changed = True
                elif file_name in seen_images:
                    remove_references.append(reference)
                    removed_duplicates += 1
                    changed = True
                else:
                    seen_images.add(file_name)
            for reference in remove_references:
                line = re.sub(
                    rf"!\[[^\]]*\]\({re.escape(reference)}\)",
                    "",
                    line,
                )
                line = re.sub(
                    rf"<img\b[^>]*\bsrc=[\"']{re.escape(reference)}[\"'][^>]*>",
                    "",
                    line,
                    flags=re.IGNORECASE,
                )
            output_lines.append(line.rstrip())

        cleaned = "\n".join(output_lines)
        cleaned = re.sub(r"\n{4,}", "\n\n\n", cleaned).strip() + "\n"
        if changed or cleaned != markdown:
            markdown_path.write_text(cleaned, encoding="utf-8", newline="\n")
            changed_articles += 1

    referenced_files = set()
    for markdown_path in ARTICLE_DIR.glob("*.md"):
        referenced_files.update(
            Path(reference).name
            for reference in IMAGE_RE.findall(markdown_path.read_text(encoding="utf-8"))
        )

    image_root = IMAGE_DIR.resolve()
    deleted_files = []
    for image_path in IMAGE_DIR.iterdir():
        resolved = image_path.resolve()
        if resolved.parent != image_root:
            raise RuntimeError(f"Refusing to delete outside {image_root}: {resolved}")
        if image_path.is_file() and image_path.name not in referenced_files:
            image_path.unlink()
            deleted_files.append(image_path.name)

    summary = {
        "changedArticles": changed_articles,
        "removedReferences": removed_references,
        "removedDuplicateReferences": removed_duplicates,
        "deletedFiles": len(deleted_files),
        "remainingFiles": len([path for path in IMAGE_DIR.iterdir() if path.is_file()]),
    }
    (OUTPUT / "clean-summary.json").write_text(
        json.dumps({**summary, "deleted": deleted_files}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return summary


clean_summary = clean_articles() if "--clean" in sys.argv else None

print(
    json.dumps(
        {
            "suspects": len(suspects),
            "sheets": math.ceil(len(suspects) / PER_SHEET),
            "mostAffectedArticles": article_summary[:15],
            "clean": clean_summary,
        },
        ensure_ascii=False,
    )
)
