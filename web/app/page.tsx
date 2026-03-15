import { HeroLogoParallax } from "@/components/hero-logo-parallax";
import { StatCountUp } from "@/components/stat-count-up";
import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { homepageMockupQuery } from "@/lib/queries";
import { sanityFetch } from "@/lib/sanity";

type TickerItem = {
  label?: string;
  logoUrl?: string;
  logoAlt?: string;
};

type StatItem = {
  value?: string;
  label?: string;
};

type LinkItem = {
  label?: string;
  url?: string;
};

type HomepageDocument = {
  title?: string;
  subtitle?: string;
  heroImageUrl?: string;
  heroHeadline?: string;
  heroHeadlineEmphasis?: string;
  heroSubheadline?: string;
  heroBackgroundLogoUrl?: string;
  portfolioTickerItems?: TickerItem[];
  portfolioTickerCompanies?: InvestmentTickerFallback[];
  portfolioCtaText?: string;
  portfolioCtaLink?: string;
  aboutSectionTitle?: string;
  aboutParagraph?: string;
  aboutParagraphs?: string[];
  aboutStats?: StatItem[];
  teamSectionTitle?: string;
  teamSectionSubtitle?: string;
  teamSectionDescription?: string;
  teamPrimaryCtaText?: string;
  teamPrimaryCtaLink?: string;
  teamSecondaryCtaText?: string;
  teamSecondaryCtaLink?: string;
  platformSectionTitle?: string;
  platformSectionSubtitle?: string;
  resourcesSectionTitle?: string;
  resourcesSectionSubtitle?: string;
  resourcesCtaText?: string;
  resourcesCtaLink?: string;
  footerBrand?: string;
  footerEmail?: string;
  footerSocialLinks?: LinkItem[];
  footerLinks?: LinkItem[];
};

type InvestmentTickerFallback = {
  _id: string;
  companyName?: string;
  website?: string;
  logoUrl?: string;
};

type NewsItem = {
  _id: string;
  title?: string;
  sourcePublication?: string;
  externalUrl?: string;
};

type HomepageResponse = {
  homepage: HomepageDocument | null;
  investments: InvestmentTickerFallback[];
  latestNews: NewsItem[];
  teamCount: number;
  openRolesCount: number;
};

const FALLBACK_TICKER_LABELS = [
  "Midi",
  "Conceivable",
  "Boulder",
  "Ditto",
  "Openly",
  "Morning Consult",
  "GrayMatter Robotics",
  "Affinity",
];

const FALLBACK_ABOUT_PARAGRAPHS = [
  "As an evergreen, family-funded firm, we're able to give founders the undivided attention their visions deserve. We're sector-agnostic because world-changing ideas come in all forms.",
  "We have the flexibility to invest at any stage - when the moment is right, we'll be there. We write seven and eight figure checks, then grow them with craft, clarity, and conviction.",
];

const FALLBACK_ABOUT_STATS = [
  { value: "$1B+", label: "AUM" },
  { value: "25+", label: "Exited Companies" },
  { value: "10+", label: "Team Members" },
];

const FALLBACK_FOOTER_SOCIAL = [
  { label: "LinkedIn", url: "https://www.linkedin.com/company/advance-venture-partners" },
  { label: "X", url: "https://x.com" },
];

const FALLBACK_FOOTER_LINKS = [
  { label: "Contact Us", url: "/#resources" },
  { label: "Privacy Policy", url: "#privacy" },
  { label: "Terms of Service", url: "#terms" },
];

function isExternalUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("mailto:");
}

function normalizeHref(value?: string, fallback = "#") {
  if (!value) return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function normalizeTickerItems(homepage: HomepageDocument | null, investments: InvestmentTickerFallback[]) {
  const fromReferences = (homepage?.portfolioTickerCompanies || [])
    .filter((item) => item.companyName || item.logoUrl)
    .map((item) => ({
      label: item.companyName || "Portfolio Company",
      logoUrl: item.logoUrl,
      logoAlt: item.companyName || "Portfolio company logo",
    }));
  if (fromReferences.length) return fromReferences;

  const fromHomepage = (homepage?.portfolioTickerItems || []).filter((item) => item.label || item.logoUrl);
  if (fromHomepage.length) return fromHomepage;

  const fromInvestments = investments
    .filter((item) => item.companyName || item.logoUrl)
    .slice(0, 8)
    .map((item) => ({
      label: item.companyName || "Portfolio Company",
      logoUrl: item.logoUrl,
      logoAlt: item.companyName || "Portfolio company logo",
    }));

  if (fromInvestments.length) return fromInvestments;

  return FALLBACK_TICKER_LABELS.map(
    (label): TickerItem => ({ label, logoUrl: undefined, logoAlt: `${label} logo` }),
  );
}

function normalizeAboutParagraphs(homepage: HomepageDocument | null) {
  const fromArray = (homepage?.aboutParagraphs || []).map((value) => value.trim()).filter(Boolean);
  if (fromArray.length) return fromArray;
  if (homepage?.aboutParagraph?.trim()) return [homepage.aboutParagraph.trim()];
  return FALLBACK_ABOUT_PARAGRAPHS;
}

function normalizeStats(homepage: HomepageDocument | null, teamCount: number) {
  const fromHomepage = (homepage?.aboutStats || []).filter((stat) => stat.value || stat.label);
  if (fromHomepage.length) return fromHomepage;

  return FALLBACK_ABOUT_STATS.map((stat) => {
    if (stat.label === "Team Members" && teamCount > 0) {
      return { value: `${teamCount}+`, label: stat.label };
    }
    return stat;
  });
}

function ActionLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className: string;
}) {
  if (isExternalUrl(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export default async function Home() {
  const data = await sanityFetch<HomepageResponse>({
    query: homepageMockupQuery,
    tags: ["homepage", "investments", "news", "team", "jobs", "type:homepage", "type:investment", "type:newsArticle", "type:teamMember", "type:jobPosting"],
    revalidate: 300,
  });

  const homepage = data.homepage;
  const tickerItems = normalizeTickerItems(homepage, data.investments);
  const tickerLoop = [...tickerItems, ...tickerItems];

  const heroHeadline = homepage?.heroHeadline || "We invest in human potential";
  const heroEmphasis = homepage?.heroHeadlineEmphasis || "first";
  const heroSubheadline = homepage?.heroSubheadline || "Because great companies begin with conviction.";

  const aboutTitle = homepage?.aboutSectionTitle || "About AVP";
  const aboutParagraphs = normalizeAboutParagraphs(homepage);
  const aboutStats = normalizeStats(homepage, data.teamCount || 0);

  const teamTitle = homepage?.teamSectionTitle || "Our Team";
  const teamSubtitle =
    homepage?.teamSectionSubtitle || "Investment professionals, operational experts, and industry leaders";
  const teamDescription =
    homepage?.teamSectionDescription ||
    "Our team combines deep domain expertise with a track record of backing transformative companies. We provide more than capital-we offer strategic guidance, operational support, and access to our extensive network.";

  const openRolesLabel =
    homepage?.teamSecondaryCtaText ||
    `Careers (${data.openRolesCount > 0 ? data.openRolesCount : 8} Open Positions)`;

  const resourcesCtaLink =
    homepage?.resourcesCtaLink || data.latestNews[0]?.externalUrl || "/news";

  const footerSocialLinks =
    (homepage?.footerSocialLinks || []).filter((item) => item.label && item.url) || [];
  const footerLinks = (homepage?.footerLinks || []).filter((item) => item.label && item.url) || [];

  return (
    <SiteShell active="about" fluid>
      <main className="mockup-homepage">
        <HeroLogoParallax />
        <section className="mockup-hero">
          <div className="mockup-hero-background" aria-hidden="true">
            <div className="mockup-hero-gradient-orb" />
            {(homepage?.heroBackgroundLogoUrl || homepage?.heroImageUrl) ? (
              <img
                src={homepage.heroBackgroundLogoUrl || homepage.heroImageUrl}
                alt=""
                className="mockup-hero-background-logo"
              />
            ) : null}
          </div>

          <div className="mockup-container">
            <div className="mockup-hero-content">
              <h1>
                {heroHeadline} <em>{heroEmphasis}</em>
              </h1>
              <p>{heroSubheadline}</p>
            </div>
          </div>
        </section>

        <section id="portfolio" className="mockup-portfolio">
          <div className="mockup-portfolio-ticker" aria-label="Portfolio company ticker">
            <div className="mockup-ticker-wrapper">
              <div className="mockup-ticker-track">
                {tickerLoop.map((item, index) => (
                  <div className="mockup-ticker-item" key={`${item.label || "ticker"}-${index}`}>
                    {item.logoUrl ? (
                      <img src={item.logoUrl} alt={item.logoAlt || item.label || "Portfolio logo"} />
                    ) : (
                      <span>{item.label || "Portfolio Company"}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mockup-container mockup-center">
            <ActionLink
              href={normalizeHref(homepage?.portfolioCtaLink, "/investments")}
              label={homepage?.portfolioCtaText || "View Full Portfolio"}
              className="mockup-secondary-button"
            />
          </div>
        </section>

        <section id="about" className="mockup-about mockup-section">
          <div className="mockup-container">
            <h2>{aboutTitle}</h2>
            <div className="mockup-about-content">
              <div className="mockup-about-text">
                {aboutParagraphs.map((paragraph, index) => (
                  <p key={`about-paragraph-${index}`}>{paragraph}</p>
                ))}
              </div>

              <div className="mockup-about-stats">
                {aboutStats.map((stat, index) => (
                  <div className="mockup-stat" key={`${stat.value || "stat"}-${index}`}>
                    <h3>
                      <StatCountUp value={stat.value || "-"} delayMs={index * 130} />
                    </h3>
                    <p>{stat.label || "Metric"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="team" className="mockup-team mockup-section">
          <div className="mockup-container">
            <h2>{teamTitle}</h2>
            <p className="mockup-section-subtitle">{teamSubtitle}</p>

            <div className="mockup-team-content">
              <div className="mockup-team-description">
                <p>{teamDescription}</p>
              </div>

              <div className="mockup-team-actions">
                <ActionLink
                  href={normalizeHref(homepage?.teamPrimaryCtaLink, "/team")}
                  label={homepage?.teamPrimaryCtaText || "View Team ->"}
                  className="mockup-secondary-button"
                />
                <ActionLink
                  href={normalizeHref(homepage?.teamSecondaryCtaLink, "https://jobs.avp.vc/jobs")}
                  label={openRolesLabel}
                  className="mockup-secondary-button"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="programs" className="mockup-programs mockup-section">
          <div className="mockup-container">
            <h2>{homepage?.platformSectionTitle || "Our Platform"}</h2>
            <p className="mockup-section-subtitle">
              {homepage?.platformSectionSubtitle || "Building ecosystems and developing talent"}
            </p>
          </div>
        </section>

        <section id="resources" className="mockup-resources mockup-section">
          <div className="mockup-container">
            <h2>{homepage?.resourcesSectionTitle || "Resources & Insights"}</h2>
            <p className="mockup-section-subtitle">
              {homepage?.resourcesSectionSubtitle ||
                "Thought leadership from our team and portfolio founders"}
            </p>
            <div className="mockup-center">
              <ActionLink
                href={normalizeHref(resourcesCtaLink, "/news")}
                label={homepage?.resourcesCtaText || "View All Resources"}
                className="mockup-secondary-button"
              />
            </div>
          </div>
        </section>

        <footer className="mockup-footer">
          <div className="mockup-container">
            <div className="mockup-footer-content">
              <div className="mockup-footer-left">
                <h3>{homepage?.footerBrand || "AVP"}</h3>
                <p>
                  <a href={`mailto:${homepage?.footerEmail || "hello@avp.vc"}`}>
                    {homepage?.footerEmail || "hello@avp.vc"}
                  </a>
                </p>
                <div className="mockup-footer-social">
                  {(footerSocialLinks.length ? footerSocialLinks : FALLBACK_FOOTER_SOCIAL).map((item, index) => (
                    <a href={item.url} target="_blank" rel="noreferrer" key={`${item.label || "social"}-${index}`}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="mockup-footer-right">
                {(footerLinks.length ? footerLinks : FALLBACK_FOOTER_LINKS).map((item, index) => (
                  <ActionLink
                    key={`${item.label || "footer-link"}-${index}`}
                    href={normalizeHref(item.url, "#")}
                    label={item.label || "Link"}
                    className="mockup-footer-link"
                  />
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </SiteShell>
  );
}
