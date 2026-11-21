#!/usr/bin/env python3
"""
Publish photography to the gallery (Supabase Storage + `works` table).

Usage
  python3 scripts/publish-photos.py --manifest photos.json [--dry-run]

Manifest format (photos.json)
{
  "photos": [
    {
      "file": "photos-inbox/IMG_0421.HEIC",   // path on disk
      "slug": "21-harbour-light-at-dusk",     // unique, used in the URL
      "title_ar": "ضوء الميناء",
      "title_en": "Harbour Light",
      "cat": "photo",
      "tags": ["light", "sea", "night"],      // tag keys from js/app.js
      "year": 2026,
      "sort": 40
    }
  ]
}

Credentials: a `.env` file in the repo root (never committed)
  SUPABASE_URL=https://xxxx.supabase.co
  SUPABASE_SERVICE_KEY=eyJ...        # service_role — keep it secret
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUCKET = "gallery"
SIZES = {"thumb": 720, "full": 1700}


def load_env():
    path = os.path.join(ROOT, ".env")
    if not os.path.exists(path):
        return {}
    env = {}
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def request(url, data=None, headers=None, method=None, timeout=120):
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read()
            return r.status, body
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except urllib.error.URLError as e:
        return 0, str(e).encode()


def resize(src, dst, longest):
    """macOS sips: converts HEIC/JPEG/PNG and bakes in the EXIF rotation."""
    cmd = [
        "sips", "-s", "format", "jpeg",
        "-s", "formatOptions", "80",
        "-Z", str(longest),
        src, "--out", dst,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0 or not os.path.exists(dst):
        raise RuntimeError("sips failed for %s\n%s" % (src, res.stderr.strip()))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", required=True)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    env = load_env()
    url = env.get("SUPABASE_URL", "").rstrip("/")
    key = env.get("SUPABASE_SERVICE_KEY", "")
    if not url or not key:
        sys.exit("Missing SUPABASE_URL / SUPABASE_SERVICE_KEY in .env")

    manifest = json.load(open(args.manifest, encoding="utf-8"))
    photos = manifest.get("photos") or []
    if not photos:
        sys.exit("Manifest has no photos")

    seen = set()
    ok = 0
    for i, p in enumerate(photos, 1):
        slug = p["slug"]
        if slug in seen:
            sys.exit("Duplicate slug: " + slug)
        seen.add(slug)

        src = p["file"]
        if not os.path.isabs(src):
            src = os.path.join(ROOT, src)
        if not os.path.exists(src):
            print("  ! missing file:", src)
            continue

        print("[%d/%d] %s" % (i, len(photos), slug))
        if args.dry_run:
            ok += 1
            continue

        with tempfile.TemporaryDirectory() as tmp:
            for kind, size in SIZES.items():
                out = os.path.join(tmp, "%s.jpg" % kind)
                resize(src, out, size)
                data = open(out, "rb").read()
                path = "%ss/%s.jpg" % (kind, slug)
                st, body = request(
                    "%s/storage/v1/object/%s/%s" % (url, BUCKET, path),
                    data=data,
                    method="POST",
                    headers={
                        "Authorization": "Bearer " + key,
                        "apikey": key,
                        "Content-Type": "image/jpeg",
                        "x-upsert": "true",
                        "Cache-Control": "public, max-age=31536000",
                    },
                )
                if st not in (200, 201):
                    sys.exit("Upload failed (%s): %s" % (st, body[:300]))
                print("   ↑ %s (%d KB)" % (path, len(data) // 1024))

        row = {
            "slug": slug,
            "title_ar": p.get("title_ar") or p.get("title_en") or slug,
            "title_en": p.get("title_en") or p.get("title_ar") or slug,
            "cat": p.get("cat") or "photo",
            "tags": p.get("tags") or [],
            "thumb_url": "%s/storage/v1/object/public/%s/thumbs/%s.jpg" % (url, BUCKET, slug),
            "full_url": "%s/storage/v1/object/public/%s/fulls/%s.jpg" % (url, BUCKET, slug),
            "year": p.get("year") or 2026,
            "sort": p.get("sort") or 0,
            "published": True,
        }
        st, body = request(
            "%s/rest/v1/works?on_conflict=slug" % url,
            data=json.dumps(row).encode(),
            method="POST",
            headers={
                "apikey": key,
                "Authorization": "Bearer " + key,
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
        )
        if st not in (200, 201, 204):
            sys.exit("Row insert failed (%s): %s" % (st, body[:300]))
        ok += 1

    print("\nDone: %d/%d published." % (ok, len(photos)))
    if not args.dry_run:
        print("Showed up at:", url.replace("supabase.co", "supabase.co"))


if __name__ == "__main__":
    main()
