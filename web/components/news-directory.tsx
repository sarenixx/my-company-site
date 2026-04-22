"use client";

import { useMemo, useState } from "react";

export type NewsArticle = {
  _id: string;
  title?: string;
  excerpt?: string;
  sourcePublication?: string;
  externalUrl?: string;
  publishedAt?: string;
  relatedInvestmentId?: string;
  relatedInvestmentName?: string;
};

export type PortfolioCompany = {
  _id: string;
  companyName?: string;
};

const ALL_COMPANIES = "all";

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

function normalizeText(value?: string) {
  return (value || "").trim().toLowerCase();
}

export function NewsDirectory({
  news,
  portfolioCompanies,
}: {
  news: NewsArticle[];
  portfolioCompanies: PortfolioCompany[];
}) {
  const [companySearch, setCompanySearch] = useState("");
  const [rawSelectedCompanyId, setRawSelectedCompanyId] = useState<string>(ALL_COMPANIES);
  const normalizedCompanySearch = normalizeText(companySearch);

  const selectedCompanyId = useMemo(() => {
    if (rawSelectedCompanyId === ALL_COMPANIES) return ALL_COMPANIES;
    return portfolioCompanies.some((company) => company._id === rawSelectedCompanyId)
      ? rawSelectedCompanyId
      : ALL_COMPANIES;
  }, [portfolioCompanies, rawSelectedCompanyId]);

  const selectedCompany = useMemo(
    () => portfolioCompanies.find((company) => company._id === selectedCompanyId) || null,
    [portfolioCompanies, selectedCompanyId],
  );

  const selectedCompanyName = useMemo(() => {
    if (selectedCompanyId === ALL_COMPANIES) return "";
    return selectedCompany?.companyName || "";
  }, [selectedCompany, selectedCompanyId]);

  const searchMatches = useMemo(() => {
    if (!normalizedCompanySearch) return portfolioCompanies;
    return portfolioCompanies.filter((company) => normalizeText(company.companyName).includes(normalizedCompanySearch));
  }, [normalizedCompanySearch, portfolioCompanies]);

  const filteredNews = useMemo(() => {
    if (selectedCompanyId === ALL_COMPANIES) return news;
    return news.filter((article) => article.relatedInvestmentId === selectedCompanyId);
  }, [news, selectedCompanyId]);

  const resultCountLabel = `${filteredNews.length} ${filteredNews.length === 1 ? "article" : "articles"}`;
  const resultSummary = selectedCompanyName ? `${resultCountLabel} for ${selectedCompanyName}` : resultCountLabel;

  return (
    <>
      <section aria-label="News portfolio filter" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}>
        <div style={{ width: "min(420px, 100%)", display: "grid", gap: "0.45rem" }}>
          <label htmlFor="avp-news-company-search">Search portfolio companies</label>
          <input
            id="avp-news-company-search"
            type="search"
            placeholder="Type to find a company"
            value={companySearch}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              if (!searchMatches.length) return;
              const firstMatch = searchMatches[0];
              setRawSelectedCompanyId(firstMatch._id);
              setCompanySearch(firstMatch.companyName || "");
            }}
            onChange={(event) => {
              const nextValue = event.target.value;
              const normalizedValue = normalizeText(nextValue);

              setCompanySearch(nextValue);

              if (!normalizedValue) {
                setRawSelectedCompanyId(ALL_COMPANIES);
                return;
              }

              const exactMatch = portfolioCompanies.find(
                (company) => normalizeText(company.companyName) === normalizedValue,
              );
              if (exactMatch) setRawSelectedCompanyId(exactMatch._id);
            }}
          />
          {normalizedCompanySearch ? (
            <ul
              aria-label="Matching companies"
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                border: "1px solid #e7e7e7",
                maxHeight: "12rem",
                overflowY: "auto",
                background: "#fff",
              }}
            >
              {searchMatches.length ? (
                searchMatches.slice(0, 8).map((company) => (
                  <li key={company._id}>
                    <button
                      type="button"
                      onClick={() => {
                        setRawSelectedCompanyId(company._id);
                        setCompanySearch(company.companyName || "");
                      }}
                      style={{
                        width: "100%",
                        border: 0,
                        background: "#fff",
                        color: "#212529",
                        margin: 0,
                        padding: "0.5rem 0.7rem",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      {company.companyName || "Untitled company"}
                    </button>
                  </li>
                ))
              ) : (
                <li style={{ padding: "0.5rem 0.7rem", color: "#666", fontSize: "0.85rem" }}>
                  No matching portfolio companies
                </li>
              )}
            </ul>
          ) : null}

          <p style={{ margin: "0.2rem 0 0", color: "#666", fontSize: "0.8rem", lineHeight: 1.25 }}>{resultSummary}</p>
        </div>
      </section>

      <section className="news-list-page" aria-label="News articles">
        {filteredNews.length ? (
          filteredNews.map((article) => (
            <article key={article._id} className="news-row">
              {article.externalUrl ? (
                <a href={article.externalUrl} target="_blank" rel="noreferrer">
                  <h2>{article.title || "Untitled news item"}</h2>
                </a>
              ) : (
                <h2>{article.title || "Untitled news item"}</h2>
              )}

              <p className="news-meta">
                {article.sourcePublication || article.excerpt || "External"}
                {article.publishedAt ? ` / ${formatDate(article.publishedAt)}` : ""}
                {article.relatedInvestmentName ? ` / ${article.relatedInvestmentName}` : ""}
              </p>
            </article>
          ))
        ) : (
          <p style={{ margin: 0, color: "#666", fontSize: "0.95rem", lineHeight: 1.6 }}>
            No news articles match the selected portfolio company yet. Try a different company or reset to all.
          </p>
        )}
      </section>
    </>
  );
}
