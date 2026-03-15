#!/usr/bin/env python3
"""
Upsert mockup-style homepage section content into Sanity homepage-main.

Usage:
  python3 scripts/seed-mockup-homepage.py
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import requests

DEFAULT_PROJECT_ID = "lv33ldxk"
DEFAULT_DATASET = "production"
DEFAULT_API_VERSION = "2025-03-06"


def strip_ansi(text: str) -> str:
    return re.sub(r"\x1b\[[0-9;]*m", "", text)


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

    proc = subprocess.run(
        ["npx", "sanity", "debug", "--secrets"],
        cwd=studio_dir,
        capture_output=True,
        text=True,
        env={**os.environ, "NO_COLOR": "1"},
        check=False,
    )
    output = strip_ansi(proc.stdout or "") + "\n" + strip_ansi(proc.stderr or "")
    match = re.search(r"Auth token:\s*'([^']+)'", output)
    return match.group(1) if match else None


def keyed_object(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "_type": "object",
        "_key": uuid.uuid4().hex[:12],
        **payload,
    }


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
        response = self.session.get(self.query_url, params={"query": groq}, timeout=60)
        response.raise_for_status()
        return response.json().get("result")

    def mutate(self, mutations: list[dict[str, Any]]) -> Any:
        response = self.session.post(self.mutate_url, json={"mutations": mutations}, timeout=60)
        response.raise_for_status()
        return response.json()


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]

    project_id = os.getenv("SANITY_PROJECT_ID", DEFAULT_PROJECT_ID)
    dataset = os.getenv("SANITY_DATASET", DEFAULT_DATASET)
    api_version = os.getenv("SANITY_API_VERSION", DEFAULT_API_VERSION)

    token = get_cli_token(repo_root)
    if not token:
        print("Unable to find a Sanity auth token. Login with `cd studio && npx sanity login`.", file=sys.stderr)
        return 1

    api = SanityApi(project_id=project_id, dataset=dataset, api_version=api_version, token=token)

    investments = api.query(
        '*[_type == "investment"] | order(companyName asc)[0...6]{companyName, "logoUrl": coalesce(logo.asset->url, logoExternalUrl)}'
    ) or []
    open_roles_count = api.query('count(*[_type == "jobPosting" && coalesce(isActive, true) == true])') or 0

    ticker_items = []
    for item in investments:
        label = (item.get("companyName") or "").strip()
        logo_url = (item.get("logoUrl") or "").strip()
        if not label and not logo_url:
            continue
        ticker_items.append(
            keyed_object(
                {
                    "label": label or "Portfolio Company",
                    "logoUrl": logo_url or None,
                    "logoAlt": f"{label} logo" if label else "Portfolio company logo",
                }
            )
        )

    if not ticker_items:
        for label in ["Conceivable", "MIDI", "Company 3", "Company 4", "Company 5", "Company 6"]:
            ticker_items.append(keyed_object({"label": label, "logoAlt": f"{label} logo"}))

    about_paragraphs = [
        "As an evergreen, family-funded firm, we're able to give founders the undivided attention their visions deserve. We're sector-agnostic because world-changing ideas come in all forms.",
        "We have the flexibility to invest at any stage - when the moment is right, we'll be there. We write seven and eight figure checks, then grow them with craft, clarity, and conviction.",
    ]

    stats = [
        keyed_object({"value": "$1B+", "label": "AUM"}),
        keyed_object({"value": "25+", "label": "Exited Companies"}),
        keyed_object({"value": "10+", "label": "Team Members"}),
    ]

    social_links = [
        keyed_object({"label": "LinkedIn", "url": "https://www.linkedin.com/company/advance-venture-partners"}),
        keyed_object({"label": "X", "url": "https://x.com"}),
    ]

    footer_links = [
        keyed_object({"label": "Contact Us", "url": "/#resources"}),
        keyed_object({"label": "Privacy Policy", "url": "#privacy"}),
        keyed_object({"label": "Terms of Service", "url": "#terms"}),
    ]

    set_payload: dict[str, Any] = {
        "title": "Advance Venture Partners",
        "subtitle": "Because great companies begin with conviction.",
        "buttonText": "View Full Portfolio",
        "buttonLink": "/investments",
        "aboutHeadline": "About AVP",
        "aboutParagraph": about_paragraphs[0],
        "aboutPoints": about_paragraphs,
        "heroHeadline": "We invest in human potential",
        "heroHeadlineEmphasis": "first",
        "heroSubheadline": "Because great companies begin with conviction.",
        "portfolioTickerItems": ticker_items,
        "portfolioCtaText": "View Full Portfolio",
        "portfolioCtaLink": "/investments",
        "aboutSectionTitle": "About AVP",
        "aboutParagraphs": about_paragraphs,
        "aboutStats": stats,
        "teamSectionTitle": "Our Team",
        "teamSectionSubtitle": "Investment professionals, operational experts, and industry leaders",
        "teamSectionDescription": "Our team combines deep domain expertise with a track record of backing transformative companies. We provide more than capital-we offer strategic guidance, operational support, and access to our extensive network.",
        "teamPrimaryCtaText": "View Team ->",
        "teamPrimaryCtaLink": "/team",
        "teamSecondaryCtaText": f"Careers ({open_roles_count if open_roles_count > 0 else 8} Open Positions)",
        "teamSecondaryCtaLink": "https://jobs.avp.vc/jobs",
        "platformSectionTitle": "Our Platform",
        "platformSectionSubtitle": "Building ecosystems and developing talent",
        "resourcesSectionTitle": "Resources & Insights",
        "resourcesSectionSubtitle": "Thought leadership from our team and portfolio founders",
        "resourcesCtaText": "View All Resources",
        "resourcesCtaLink": "/news",
        "footerBrand": "AVP",
        "footerEmail": "hello@avp.vc",
        "footerSocialLinks": social_links,
        "footerLinks": footer_links,
    }

    result = api.mutate(
        [
            {"createIfNotExists": {"_id": "homepage-main", "_type": "homepage"}},
            {"patch": {"id": "homepage-main", "set": set_payload}},
        ]
    )

    tx = result.get("transactionId", "unknown")
    print(f"Upserted homepage-main with mockup section content. transactionId={tx}")
    print(json.dumps({"tickerItems": len(ticker_items), "openRolesCount": open_roles_count}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
