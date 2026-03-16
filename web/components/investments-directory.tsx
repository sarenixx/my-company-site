"use client";

import { useMemo, useState } from "react";

export type InvestmentNews = {
  _id: string;
  title?: string;
  sourcePublication?: string;
  externalUrl?: string;
  publishedAt?: string;
};

export type Investment = {
  _id: string;
  companyName?: string;
  website?: string;
  description?: string;
  status?: string;
  category?: string;
  isFeatured?: boolean;
  logoUrl?: string;
  relatedNews?: InvestmentNews[];
};

type CategoryFilter = "featured" | "enterprise" | "commerce" | "healthcare" | "all";
type StatusFilter = "current" | "exited";
const FEATURED_LIMIT = 12;

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

function normalizeWebsiteUrl(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

function formatWebsiteLabel(value?: string) {
  if (!value) return "";
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function statusBucket(value?: string): "current" | "exited" {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "exited") return "exited";
  return "current";
}

function normalizeCategory(value?: string): "enterprise" | "commerce" | "healthcare" | null {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "enterprise" || normalized === "commerce" || normalized === "healthcare") {
    return normalized;
  }
  return null;
}

function formatStatus(value?: string) {
  const normalized = (value || "").trim().toLowerCase();
  if (!normalized) return "Active";
  if (normalized === "ipo") return "IPO";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function InvestmentsDirectory({ investments }: { investments: Investment[] }) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("featured");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("current");

  const hasFeaturedFlags = useMemo(
    () => investments.some((investment) => typeof investment.isFeatured === "boolean"),
    [investments],
  );
  const fallbackFeaturedIds = useMemo(
    () => new Set(investments.slice(0, FEATURED_LIMIT).map((investment) => investment._id)),
    [investments],
  );

  const filteredInvestments = useMemo(() => {
    return investments.filter((investment) => {
      const category = normalizeCategory(investment.category);
      const isFeatured = hasFeaturedFlags
        ? Boolean(investment.isFeatured)
        : fallbackFeaturedIds.has(investment._id);

      const matchesCategory =
        categoryFilter === "all"
          ? true
          : categoryFilter === "featured"
            ? isFeatured
            : category === categoryFilter;

      const matchesStatus = statusBucket(investment.status) === statusFilter;
      return matchesCategory && matchesStatus;
    });
  }, [categoryFilter, fallbackFeaturedIds, hasFeaturedFlags, investments, statusFilter]);

  return (
    <>
      <section className="page-hero">
        <h1>Investments</h1>
      </section>

      <section className="investment-filter-bar" aria-label="Investment filters">
        <div className="investment-filter-group" role="group" aria-label="Investment scope">
          <button
            type="button"
            className={categoryFilter === "featured" ? "is-active" : undefined}
            onClick={() => setCategoryFilter("featured")}
          >
            Featured
          </button>
          <button
            type="button"
            className={categoryFilter === "enterprise" ? "is-active" : undefined}
            onClick={() => setCategoryFilter("enterprise")}
          >
            Enterprise
          </button>
          <button
            type="button"
            className={categoryFilter === "commerce" ? "is-active" : undefined}
            onClick={() => setCategoryFilter("commerce")}
          >
            Commerce
          </button>
          <button
            type="button"
            className={categoryFilter === "healthcare" ? "is-active" : undefined}
            onClick={() => setCategoryFilter("healthcare")}
          >
            Healthcare
          </button>
          <button
            type="button"
            className={categoryFilter === "all" ? "is-active" : undefined}
            onClick={() => setCategoryFilter("all")}
          >
            All
          </button>
        </div>

        <div className="investment-filter-group" role="group" aria-label="Investment status">
          <button
            type="button"
            className={statusFilter === "current" ? "is-active" : undefined}
            onClick={() => setStatusFilter("current")}
          >
            Current
          </button>
          <button
            type="button"
            className={statusFilter === "exited" ? "is-active" : undefined}
            onClick={() => setStatusFilter("exited")}
          >
            Exited
          </button>
        </div>
      </section>

      <section className="investment-logo-grid">
        {filteredInvestments.map((investment) => (
          <a key={investment._id} href={`#${investment._id}`} className="investment-logo-card">
            {investment.logoUrl ? (
              <img src={investment.logoUrl} alt={investment.companyName || "Portfolio company"} />
            ) : (
              <span>{investment.companyName || "Company"}</span>
            )}
          </a>
        ))}
      </section>

      <section className="investment-details">
        {filteredInvestments.map((investment) => {
          const websiteHref = normalizeWebsiteUrl(investment.website);
          const statusLabel = formatStatus(investment.status);

          return (
            <article id={investment._id} key={investment._id} className="investment-detail">
              <div className="investment-side">
                {investment.logoUrl ? (
                  <img src={investment.logoUrl} alt={investment.companyName || "Company logo"} />
                ) : (
                  <div className="logo-fallback">{investment.companyName || "Company"}</div>
                )}

                <div className="investment-side-meta">
                  {websiteHref ? (
                    <a href={websiteHref} target="_blank" rel="noreferrer">
                      {formatWebsiteLabel(investment.website)}
                    </a>
                  ) : null}

                  <p className="status">
                    <span className="status-label">Status</span>
                    <span className="status-pill">{statusLabel}</span>
                  </p>
                </div>
              </div>

              <div className="investment-main">
                <h2>{investment.companyName || "Untitled Company"}</h2>
                {investment.description ? <p>{investment.description}</p> : null}

                {investment.relatedNews?.length ? (
                  <div className="related-news">
                    <h3 className="related-news-heading">Recent News</h3>
                    {investment.relatedNews.map((newsItem) => (
                      <div key={newsItem._id} className="related-news-item">
                        {newsItem.externalUrl ? (
                          <a href={newsItem.externalUrl} target="_blank" rel="noreferrer">
                            <h4>{newsItem.title}</h4>
                          </a>
                        ) : (
                          <h4>{newsItem.title}</h4>
                        )}
                        <p>
                          {newsItem.sourcePublication || "External"}{" "}
                          {newsItem.publishedAt ? `/ ${formatDate(newsItem.publishedAt)}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
