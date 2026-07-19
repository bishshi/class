import json
import re
import shutil
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "gzhh"
CACHE = ROOT / ".tmp" / "gzhh-images"
RAW = CACHE / "raw"
MANIFEST = CACHE / "manifest.json"
LOCAL_MAP = CACHE / "local-map.json"
OUTPUT = ROOT / "public" / "assets" / "article-images"

IMAGE_RE = re.compile(r"!\[([^\]]*)\]\((https?://[^\s\)]+)\)")
FRONTMATTER_RE = re.compile(r"\A---\s*\n(?P<meta>.*?)\n---\s*\n", re.DOTALL)


def category_for(title: str) -> str:
    if re.search(r"毕业|高考|成人礼|壮行|远足|百日誓师|教师风采|班级之星|612|陆壹贰|往年今日", title):
        return "毕业时刻" if re.search(r"毕业|高考|成人礼|壮行", title) else "班级记忆"
    if re.search(r"考试|四六级|四.六级|CET|竞赛|考生|准考证|成绩|普通话|数学建模|挂科|重修|招生", title):
        return "考试升学"
    if re.search(r"春节|元旦|除夕|小年|圣诞|清明|父亲节|母亲节|儿童节|六一|五四|新年", title):
        return "节日来信"
    if re.search(r"通知|通告|说明|提醒|返校|课程表|网站|公众号|AI功能|招聘|邀请函", title):
        return "校园通知"
    return "班级记忆"


def yaml_string(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def normalize_url(value: str) -> str:
    return value.replace("&amp;", "&").replace(r"\_", "_")


def export_images() -> dict[str, str]:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    local_by_hash: dict[str, str] = {}
    local_by_url: dict[str, str] = {}

    for item in manifest:
        if item.get("status") != "ok" or not item.get("file") or not item.get("hash"):
            continue

        source_path = RAW / item["file"]
        content_hash = item["hash"]
        if content_hash in local_by_hash:
            local_by_url[normalize_url(item["url"])] = local_by_hash[content_hash]
            continue

        suffix = source_path.suffix.lower()
        output_name = f"{content_hash[:16]}{suffix}" if suffix in {".gif", ".svg"} else f"{content_hash[:16]}.webp"
        output_path = OUTPUT / output_name
        if output_path.exists():
            local_path = f"/assets/article-images/{output_name}"
            local_by_hash[content_hash] = local_path
            local_by_url[normalize_url(item["url"])] = local_path
            continue

        if suffix in {".gif", ".svg"}:
            shutil.copyfile(source_path, output_path)
        else:
            with Image.open(source_path) as image:
                if getattr(image, "is_animated", False):
                    shutil.copyfile(source_path, output_path)
                else:
                    frame = ImageOps.exif_transpose(image)
                    if frame.width > 1800:
                        height = max(1, round(frame.height * 1800 / frame.width))
                        frame = frame.resize((1800, height), Image.Resampling.LANCZOS)
                    has_alpha = "A" in frame.getbands() or "transparency" in image.info
                    frame = frame.convert("RGBA" if has_alpha else "RGB")
                    frame.save(output_path, "WEBP", quality=84, method=6)

        local_path = f"/assets/article-images/{output_name}"
        local_by_hash[content_hash] = local_path
        local_by_url[normalize_url(item["url"])] = local_path

    LOCAL_MAP.write_text(
        json.dumps(local_by_url, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return local_by_url


def get_existing_metadata(raw: str) -> tuple[dict[str, str], str] | None:
    match = FRONTMATTER_RE.match(raw)
    if not match:
        return None
    metadata: dict[str, str] = {}
    for line in match.group("meta").splitlines():
        key, separator, value = line.partition(":")
        if not separator:
            continue
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] == "'":
            value = value[1:-1].replace("''", "'")
        metadata[key.strip()] = value
    return metadata, raw[match.end() :]


def get_raw_metadata(raw: str, file_path: Path) -> tuple[dict[str, str], str]:
    title_match = re.search(r"\r?\n([^\r\n]{2,120})\r?\n={3,}\r?\n", raw)
    title = title_match.group(1).strip() if title_match else file_path.stem.replace("_", " ")
    date_match = re.search(r"\b(20\d{2}-\d{2}-\d{2})\b", raw)
    source_match = re.search(r"^>\s*原文地址:.*$", raw, re.MULTILINE)
    body = raw[source_match.end() :] if source_match else raw
    return (
        {
            "title": title,
            "date": date_match.group(1) if date_match else "",
            "category": category_for(title),
            "slug": file_path.stem,
        },
        body,
    )


def clean_body(body: str, local_by_url: dict[str, str]) -> str:
    body = body.replace("\r\n", "\n")

    def replace_image(match: re.Match[str]) -> str:
        alt, remote_url = match.groups()
        local_path = local_by_url.get(normalize_url(remote_url))
        return f"![{alt}]({local_path})" if local_path else (f"*{alt}*" if alt else "")

    body = IMAGE_RE.sub(replace_image, body)
    body = re.sub(r"!\[[^\]]*\]\(data:image[^\n]+", "", body)
    body = re.sub(r"\[([^\]]+)\]\(https?://[^\s\)]+\)", r"\1", body)
    body = re.sub(r"<a\b[^>]*>", "", body, flags=re.IGNORECASE)
    body = re.sub(r"</a>", "", body, flags=re.IGNORECASE)
    body = re.sub(r"<((?:https?://)[^>]+)>", r"\1", body)

    kept_lines = []
    for line in body.splitlines():
        stripped = line.strip()
        if stripped == "(unknown)":
            continue
        if "data:image/svg+xml" in line:
            continue
        if re.search(r"!\[[^\]]*\]\([^\)]+\).*2024届612", line):
            continue
        if "sns_opr_btn" in line or "__bottom-bar__" in line:
            continue
        kept_lines.append(line.rstrip())

    body = "\n".join(kept_lines).strip()
    body = re.sub(r"\n{4,}", "\n\n\n", body)
    return body + "\n"


def localize_articles(local_by_url: dict[str, str]) -> int:
    count = 0
    for file_path in sorted(SOURCE.glob("*.md")):
        raw = file_path.read_text(encoding="utf-8")
        existing = get_existing_metadata(raw)
        if existing:
            metadata, body = existing
            metadata.setdefault("title", file_path.stem.replace("_", " "))
            metadata.setdefault("date", "")
            metadata.setdefault("category", category_for(metadata["title"]))
            metadata.setdefault("slug", file_path.stem)
        else:
            metadata, body = get_raw_metadata(raw, file_path)

        clean = clean_body(body, local_by_url)
        frontmatter = "\n".join(
            [
                "---",
                f"title: {yaml_string(metadata['title'])}",
                f"date: {yaml_string(metadata['date'])}",
                f"category: {yaml_string(metadata['category'])}",
                f"slug: {yaml_string(metadata['slug'])}",
                "---",
                "",
            ]
        )
        file_path.write_text(frontmatter + clean, encoding="utf-8", newline="\n")
        count += 1
    return count


local_map = export_images()
article_count = localize_articles(local_map)
output_bytes = sum(path.stat().st_size for path in OUTPUT.iterdir() if path.is_file())
print(
    json.dumps(
        {
            "articles": article_count,
            "remoteImages": len(local_map),
            "localFiles": len(list(OUTPUT.iterdir())),
            "bytes": output_bytes,
            "output": str(OUTPUT.relative_to(ROOT)),
        },
        ensure_ascii=False,
    )
)
