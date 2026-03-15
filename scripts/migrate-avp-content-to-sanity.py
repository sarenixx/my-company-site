#!/usr/bin/env python3
"""
Scrape avp.vc content and upsert it into Sanity.

Usage:
  python3 scripts/migrate-avp-content-to-sanity.py
  python3 scripts/migrate-avp-content-to-sanity.py --dry-run
  python3 scripts/migrate-avp-content-to-sanity.py --verify-only
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import os
import re
import subprocess
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlencode, urljoin

import requests
from bs4 import BeautifulSoup


DEFAULT_PROJECT_ID = "lv33ldxk"
DEFAULT_DATASET = "production"
DEFAULT_API_VERSION = "2025-03-06"
AVP_BASE = "https://www.avp.vc"


def strip_ansi(text: str) -> str:
    return re.sub(r"\x1b\[[0-9;]*m", "", text)


def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\xa0", " ").replace("\u00ad", "")
    text = text.replace("\u200b", "").replace("\ufeff", "")
    return re.sub(r"\s+", " ", text).strip()


def slugify(value: str) -> str:
    value = clean_text(value).lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = value.strip("-")
    return value or "item"


def titleize_slug(value: str) -> str:
    words = [w for w in re.split(r"[-_]+", value) if w]
    return " ".join(word.capitalize() for word in words) if words else "Unknown Company"


def parse_month_day_year(value: str) -> str | None:
    value = clean_text(value)
    for fmt in ("%b %d %Y", "%B %d %Y"):
        try:
            parsed = dt.datetime.strptime(value, fmt)
            return parsed.strftime("%Y-%m-%dT00:00:00Z")
        except ValueError:
            continue
    return None


def pt_block(text: str, style: str = "normal", list_item: str | None = None) -> dict[str, Any]:
    block: dict[str, Any] = {
        "_type": "block",
        "_key": uuid.uuid4().hex[:12],
        "style": style,
        "markDefs": [],
        "children": [
            {
                "_type": "span",
                "_key": uuid.uuid4().hex[:12],
                "text": clean_text(text),
                "marks": [],
            }
        ],
    }
    if list_item:
        block["listItem"] = list_item
        block["level"] = 1
    return block


def normalize_url(url: str) -> str:
    url = clean_text(url)
    if not url:
        return ""
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if url.startswith("/"):
        return urljoin(AVP_BASE, url)
    return f"https://{url}"


def parse_source_and_date(raw_meta: str) -> tuple[str | None, str | None]:
    meta = clean_text(raw_meta)
    if not meta:
        return None, None
    if "/" in meta:
        left, right = meta.split("/", 1)
        source = clean_text(left)
        date_value = clean_text(right)
    else:
        source = meta
        date_value = ""
    date_iso = parse_month_day_year(date_value) if date_value else None
    return source or None, date_iso


def get_cli_token(repo_root: Path) -> str | None:
    env_token = (
        os.getenv("SANITY_AUTH_TOKEN")
        or os.getenv("SANITY_API_WRITE_TOKEN")
        or os.getenv("SANITY_TOKEN")
        or os.getenv("SANITY_API_TOKEN")
    )
    if env_token:
        return env_token

    studio_dir = repo_root / "studio"
    if not studio_dir.exists():
        return None

    cmd = ["npx", "sanity", "debug", "--secrets"]
    proc = subprocess.run(
        cmd,
        cwd=studio_dir,
        capture_output=True,
        text=True,
        env={**os.environ, "NO_COLOR": "1"},
        check=False,
    )
    output = strip_ansi(proc.stdout or "") + "\n" + strip_ansi(proc.stderr or "")
    match = re.search(r"Auth token:\s*'([^']+)'", output)
    return match.group(1) if match else None


@dataclass
class SanityApi:
    project_id: str
    dataset: str
    api_version: str
    token: str

    def __post_init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            }
        )
        self.query_url = (
            f"https://{self.project_id}.api.sanity.io/v{self.api_version}/data/query/{self.dataset}"
        )
        self.mutate_url = (
            f"https://{self.project_id}.api.sanity.io/v{self.api_version}/data/mutate/{self.dataset}"
        )

    def query(self, groq: str) -> Any:
        params = {"query": groq}
        response = self.session.get(self.query_url, params=params, timeout=60)
        response.raise_for_status()
        payload = response.json()
        return payload.get("result")

    def upsert_documents(self, docs: list[dict[str, Any]], batch_size: int = 75) -> int:
        written = 0
        for start in range(0, len(docs), batch_size):
            chunk = docs[start : start + batch_size]
            payload = {"mutations": [{"createOrReplace": doc} for doc in chunk]}
            response = self.session.post(self.mutate_url, json=payload, timeout=120)
            response.raise_for_status()
            written += len(chunk)
        return written


def fetch_html(url: str) -> BeautifulSoup:
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")


def parse_homepage_and_about(soup: BeautifulSoup) -> tuple[dict[str, Any], dict[str, Any]]:
    hero_text = clean_text((soup.select_one(".about-overview-container h3") or {}).get_text(" ", strip=True))
    hero_logo = ""
    hero_img = soup.select_one(".about-overview-container img")
    if hero_img and hero_img.get("src"):
        hero_logo = normalize_url(hero_img["src"])

    meta_desc = ""
    meta_desc_tag = soup.select_one('meta[name="description"]')
    if meta_desc_tag and meta_desc_tag.get("content"):
        meta_desc = clean_text(meta_desc_tag["content"])

    callouts = []
    for li in soup.select(".about-text-container li"):
        text = clean_text(li.get_text(" ", strip=True))
        if text:
            callouts.append(text)

    sectors: list[dict[str, str]] = []
    for modal in soup.select('div.modal[id^="detail-list-modal-"]'):
        title = clean_text((modal.select_one(".modal-header h2") or {}).get_text(" ", strip=True))
        body_parts = [
            clean_text(p.get_text(" ", strip=True))
            for p in modal.select(".detail-list-body-container p")
            if clean_text(p.get_text(" ", strip=True))
        ]
        if title and body_parts:
            sectors.append({"title": title, "description": " ".join(body_parts)})

    homepage_doc = {
        "_id": "homepage-main",
        "_type": "homepage",
        "title": hero_text,
        "subtitle": meta_desc,
        "buttonText": "Open Sanity Studio",
        "buttonLink": "/studio",
        "heroImageUrl": hero_logo,
        "aboutHeadline": "Investment Focus",
        "aboutParagraph": callouts[0] if callouts else meta_desc,
        "aboutPoints": callouts,
    }

    about_blocks: list[dict[str, Any]] = []
    if hero_text:
        about_blocks.append(pt_block(hero_text, style="h3"))
    if meta_desc:
        about_blocks.append(pt_block(meta_desc))
    if callouts:
        about_blocks.append(pt_block("How we invest", style="h4"))
        for point in callouts:
            about_blocks.append(pt_block(point, list_item="bullet"))
    if sectors:
        about_blocks.append(pt_block("Priority sectors", style="h4"))
        for sector in sectors:
            about_blocks.append(pt_block(sector["title"], style="h5"))
            about_blocks.append(pt_block(sector["description"]))

    about_doc = {
        "_id": "about-main",
        "_type": "about",
        "title": "About Us",
        "content": about_blocks,
    }

    return homepage_doc, about_doc


def parse_team(soup: BeautifulSoup) -> list[dict[str, Any]]:
    seen_ids: set[str] = set()
    team_docs: list[dict[str, Any]] = []

    for modal in soup.select('div.modal[id^="team-modal-"]'):
        heading = modal.select_one(".modal-header h2")
        if not heading:
            continue

        role = clean_text((heading.select_one(".text-muted") or {}).get_text(" ", strip=True))
        heading_text = clean_text(heading.get_text(" ", strip=True))

        name = heading_text
        if role:
            name = clean_text(re.sub(rf"-\s*{re.escape(role)}\s*$", "", heading_text))
        if " - " in name:
            name = clean_text(name.split(" - ", 1)[0])
        if not name:
            continue

        modal_body = modal.select_one(".modal-body")
        if not modal_body:
            continue

        bio_paragraphs = [
            clean_text(p.get_text(" ", strip=True))
            for p in modal_body.select(".team-member .col-md-8 > p")
            if clean_text(p.get_text(" ", strip=True))
        ]
        bio_blocks = [pt_block(p) for p in bio_paragraphs]

        photo_url = ""
        photo = modal_body.select_one(".team-contact img")
        if photo and photo.get("src"):
            photo_url = normalize_url(photo["src"])

        linkedin = ""
        linkedin_link = modal_body.select_one('.team-contact a[href*="linkedin.com"]')
        if linkedin_link and linkedin_link.get("href"):
            linkedin = normalize_url(linkedin_link["href"])

        email = ""
        email_link = modal_body.select_one('.team-contact a[href^="mailto:"]')
        if email_link and email_link.get("href"):
            email = clean_text(email_link["href"].replace("mailto:", ""))

        base_id = f"teamMember-{slugify(name)}"
        doc_id = base_id
        suffix = 2
        while doc_id in seen_ids:
            doc_id = f"{base_id}-{suffix}"
            suffix += 1
        seen_ids.add(doc_id)

        team_docs.append(
            {
                "_id": doc_id,
                "_type": "teamMember",
                "name": name,
                "role": role or None,
                "photoExternalUrl": photo_url or None,
                "linkedin": linkedin or None,
                "email": email or None,
                "bio": bio_blocks,
            }
        )

    return team_docs


def map_status(raw_status: str) -> str | None:
    value = clean_text(raw_status).lower()
    if value in {"current", "active"}:
        return "active"
    if value in {"exited", "exit"}:
        return "exited"
    if value in {"ipo", "public"}:
        return "ipo"
    return None


def parse_investments(
    soup: BeautifulSoup,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, str]]:
    modal_to_slug: dict[str, str] = {}
    for trigger in soup.select('a[data-target^="#investment-modal-"]'):
        target = clean_text(trigger.get("data-target", "")).lstrip("#")
        if not target:
            continue
        card = trigger.select_one(".card-investments")
        if not card:
            continue
        classes = card.get("class", [])
        slug = ""
        for cls in classes:
            if cls.startswith("card-") and cls != "card-investments":
                slug = cls.replace("card-", "", 1)
                break
        if slug:
            modal_to_slug[target] = slug

    investment_docs: list[dict[str, Any]] = []
    investment_id_by_slug: dict[str, str] = {}
    news_rows: list[dict[str, Any]] = []

    for modal in soup.select('div.modal[id^="investment-modal-"]'):
        modal_id = clean_text(modal.get("id", ""))
        if not modal_id:
            continue

        left_col = modal.select_one(".investment-detail .col-md-4")
        right_col = modal.select_one(".investment-detail .col-md-8")
        if not left_col:
            continue

        image = left_col.select_one("img")
        image_alt = clean_text(image.get("alt", "")) if image else ""
        image_src = normalize_url(image.get("src", "")) if image and image.get("src") else ""

        slug_hint = modal_to_slug.get(modal_id) or image_alt or modal_id.replace("investment-modal-", "")
        company_slug = slugify(slug_hint)
        company_name = titleize_slug(company_slug)

        website = ""
        website_link = left_col.select_one(".investment-external-link")
        if website_link and website_link.get("href"):
            website = normalize_url(website_link["href"])

        raw_left_text = clean_text(left_col.get_text(" ", strip=True))
        status_match = re.search(r"Status:\s*([A-Za-z]+)", raw_left_text, flags=re.IGNORECASE)
        status_value = map_status(status_match.group(1) if status_match else "")

        description = ""
        if right_col:
            first_p = right_col.select_one("p")
            description = clean_text(first_p.get_text(" ", strip=True)) if first_p else ""

        investment_id = f"investment-{company_slug}"
        investment_id_by_slug[company_slug] = investment_id
        investment_docs.append(
            {
                "_id": investment_id,
                "_type": "investment",
                "companyName": company_name,
                "website": website or None,
                "description": description or None,
                "status": status_value,
                "logoExternalUrl": image_src or None,
            }
        )

        if right_col:
            for item in right_col.select(".investment-news .news-item"):
                link = item.select_one("a[href]")
                heading = item.select_one("h4")
                meta = item.select_one(".text-muted")
                title = clean_text(heading.get_text(" ", strip=True)) if heading else ""
                external_url = normalize_url(link.get("href", "")) if link else ""
                source, published_at = parse_source_and_date(
                    meta.get_text(" ", strip=True) if meta else ""
                )
                if title and external_url:
                    news_rows.append(
                        {
                            "title": title,
                            "externalUrl": external_url,
                            "source": source,
                            "publishedAt": published_at,
                            "relatedInvestmentId": investment_id,
                        }
                    )

    return investment_docs, news_rows, investment_id_by_slug


def parse_news_page(soup: BeautifulSoup) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for item in soup.select(".news-item"):
        heading = item.select_one("h4")
        link = item.select_one("a[href]")
        meta = item.select_one(".text-muted")
        title = clean_text(heading.get_text(" ", strip=True)) if heading else ""
        external_url = normalize_url(link.get("href", "")) if link else ""
        source, published_at = parse_source_and_date(meta.get_text(" ", strip=True) if meta else "")
        if title and external_url:
            rows.append(
                {
                    "title": title,
                    "externalUrl": external_url,
                    "source": source,
                    "publishedAt": published_at,
                    "relatedInvestmentId": None,
                }
            )
    return rows


def build_news_docs(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    dedup: dict[str, dict[str, Any]] = {}

    for row in rows:
        key = row["externalUrl"] or f"{row['title']}::{row.get('publishedAt') or ''}"
        if key not in dedup:
            dedup[key] = dict(row)
            continue
        existing = dedup[key]
        if not existing.get("publishedAt") and row.get("publishedAt"):
            existing["publishedAt"] = row["publishedAt"]
        if not existing.get("source") and row.get("source"):
            existing["source"] = row["source"]
        if not existing.get("relatedInvestmentId") and row.get("relatedInvestmentId"):
            existing["relatedInvestmentId"] = row["relatedInvestmentId"]

    docs: list[dict[str, Any]] = []
    for row in dedup.values():
        key_basis = row["externalUrl"] or f"{row['title']}::{row.get('publishedAt') or ''}"
        key_hash = hashlib.sha1(key_basis.encode("utf-8")).hexdigest()[:16]
        slug_value = f"{slugify(row['title'])[:70]}-{key_hash[:6]}"
        excerpt = row.get("source") or "External press coverage"
        body_blocks = [pt_block(f"Source: {row['source']}")] if row.get("source") else []
        if row.get("publishedAt"):
            body_blocks.append(pt_block(f"Published: {row['publishedAt'][:10]}"))

        doc: dict[str, Any] = {
            "_id": f"newsArticle-{key_hash}",
            "_type": "newsArticle",
            "title": row["title"],
            "slug": {"_type": "slug", "current": slug_value},
            "publishedAt": row.get("publishedAt"),
            "excerpt": excerpt,
            "body": body_blocks or None,
            "sourcePublication": row.get("source"),
            "externalUrl": row["externalUrl"],
        }
        related = row.get("relatedInvestmentId")
        if related:
            doc["relatedInvestment"] = {"_type": "reference", "_ref": related}
        docs.append(doc)

    return docs


def print_counts(client: SanityApi) -> None:
    query = """{
      "homepage": count(*[_type == "homepage"]),
      "about": count(*[_type == "about"]),
      "teamMember": count(*[_type == "teamMember"]),
      "investment": count(*[_type == "investment"]),
      "newsArticle": count(*[_type == "newsArticle"])
    }"""
    result = client.query(query)
    print("Current Sanity counts:")
    for key in ["homepage", "about", "teamMember", "investment", "newsArticle"]:
        print(f"  {key}: {result.get(key, 0)}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Migrate AVP content into Sanity")
    parser.add_argument("--project-id", default=os.getenv("SANITY_PROJECT_ID", DEFAULT_PROJECT_ID))
    parser.add_argument("--dataset", default=os.getenv("SANITY_DATASET", DEFAULT_DATASET))
    parser.add_argument("--api-version", default=DEFAULT_API_VERSION)
    parser.add_argument("--dry-run", action="store_true", help="Parse and print counts without writing")
    parser.add_argument("--verify-only", action="store_true", help="Only print current Sanity counts")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    token = get_cli_token(repo_root)
    if not token:
        print(
            "Could not resolve Sanity auth token. "
            "Set SANITY_AUTH_TOKEN (or SANITY_API_WRITE_TOKEN) and retry.",
            file=sys.stderr,
        )
        return 1

    client = SanityApi(
        project_id=args.project_id,
        dataset=args.dataset,
        api_version=args.api_version,
        token=token,
    )

    if args.verify_only:
        print_counts(client)
        return 0

    print("Fetching AVP source pages...")
    home_soup = fetch_html(f"{AVP_BASE}/")
    team_soup = fetch_html(f"{AVP_BASE}/team")
    investments_soup = fetch_html(f"{AVP_BASE}/investments")
    news_soup = fetch_html(f"{AVP_BASE}/news")

    homepage_doc, about_doc = parse_homepage_and_about(home_soup)
    team_docs = parse_team(team_soup)
    investment_docs, investment_news_rows, _investment_id_map = parse_investments(investments_soup)
    news_rows = parse_news_page(news_soup)
    news_docs = build_news_docs(investment_news_rows + news_rows)
    docs: list[dict[str, Any]] = [homepage_doc, about_doc]
    docs.extend(team_docs)
    docs.extend(investment_docs)
    docs.extend(news_docs)

    print("Parsed content summary:")
    print(f"  homepage docs: 1")
    print(f"  about docs: 1")
    print(f"  team docs: {len(team_docs)}")
    print(f"  investment docs: {len(investment_docs)}")
    print(f"  news docs: {len(news_docs)}")
    print(f"  total docs: {len(docs)}")

    if args.dry_run:
        print("Dry run only. No documents were written.")
        return 0

    print(f"Upserting documents to Sanity project={args.project_id} dataset={args.dataset} ...")
    written = client.upsert_documents(docs)
    print(f"Wrote {written} documents.")
    print_counts(client)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
