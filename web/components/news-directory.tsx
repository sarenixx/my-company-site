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

function renderHighlightedCompanyName(name: string, normalizedQuery: string) {
  if (!normalizedQuery) return name;

  const normalizedName = name.toLowerCase();
  const matchStart = normalizedName.indexOf(normalizedQuery);
  if (matchStart === -1) return name;

  const matchEnd = matchStart + normalizedQuery.length;
  return (
    <>
      {name.slice(0, matchStart)}
      <mark style={{ background: "#fff1b8", padding: 0 }}>{name.slice(matchStart, matchEnd)}</mark>
      {name.slice(matchEnd)}
    </>
  );
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
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
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
  const visibleSuggestions = useMemo(() => searchMatches.slice(0, 8), [searchMatches]);
  const effectiveActiveSuggestionIndex =
    activeSuggestionIndex >= 0 && activeSuggestionIndex < visibleSuggestions.length ? activeSuggestionIndex : -1;

  const filteredNews = useMemo(() => {
    if (selectedCompanyId === ALL_COMPANIES) return news;
    return news.filter((article) => article.relatedInvestmentId === selectedCompanyId);
  }, [news, selectedCompanyId]);

  const resultCountLabel = `${filteredNews.length} ${filteredNews.length === 1 ? "article" : "articles"}`;
  const resultSummary = selectedCompanyName ? `${resultCountLabel} for ${selectedCompanyName}` : resultCountLabel;
  const clearSearch = () => {
    setCompanySearch("");
    setRawSelectedCompanyId(ALL_COMPANIES);
    setActiveSuggestionIndex(-1);
  };
  const chooseCompany = (company: PortfolioCompany) => {
    setRawSelectedCompanyId(company._id);
    setCompanySearch(company.companyName || "");
    setActiveSuggestionIndex(-1);
  };

  return (
    <>
      <section aria-label="News portfolio filter" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}>
        <div style={{ width: "min(420px, 100%)", display: "grid", gap: "0.45rem" }}>
          <label htmlFor="avp-news-company-search">Search portfolio companies</label>
          <div style={{ position: "relative", display: "grid" }}>
            <input
              id="avp-news-company-search"
              type="search"
              placeholder="Type to find a company"
              value={companySearch}
              style={{ paddingRight: "2.25rem" }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  if (!visibleSuggestions.length) return;
                  event.preventDefault();
                  setActiveSuggestionIndex((previousIndex) =>
                    previousIndex < 0 || previousIndex >= visibleSuggestions.length - 1 ? 0 : previousIndex + 1,
                  );
                  return;
                }

                if (event.key === "ArrowUp") {
                  if (!visibleSuggestions.length) return;
                  event.preventDefault();
                  setActiveSuggestionIndex((previousIndex) =>
                    previousIndex <= 0 ? visibleSuggestions.length - 1 : previousIndex - 1,
                  );
                  return;
                }

                if (event.key === "Enter") {
                  if (!visibleSuggestions.length) return;
                  event.preventDefault();
                  const suggestionToUse =
                    effectiveActiveSuggestionIndex === -1
                      ? visibleSuggestions[0]
                      : visibleSuggestions[effectiveActiveSuggestionIndex];
                  if (suggestionToUse) chooseCompany(suggestionToUse);
                  return;
                }

                if (event.key === "Escape") {
                  setActiveSuggestionIndex(-1);
                }
              }}
              onChange={(event) => {
                const nextValue = event.target.value;
                const normalizedValue = normalizeText(nextValue);

                setCompanySearch(nextValue);

                if (!normalizedValue) {
                  clearSearch();
                  return;
                }

                setActiveSuggestionIndex(0);
                const exactMatch = portfolioCompanies.find(
                  (company) => normalizeText(company.companyName) === normalizedValue,
                );
                if (exactMatch) {
                  setRawSelectedCompanyId(exactMatch._id);
                } else {
                  setRawSelectedCompanyId(ALL_COMPANIES);
                }
              }}
            />
            {companySearch || selectedCompanyId !== ALL_COMPANIES ? (
              <button
                type="button"
                aria-label="Clear company search"
                onClick={clearSearch}
                style={{
                  position: "absolute",
                  right: "0.45rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: 0,
                  background: "transparent",
                  color: "#6b7280",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  lineHeight: 1,
                  padding: "0.15rem",
                }}
              >
                Clear
              </button>
            ) : null}
          </div>
          {normalizedCompanySearch ? (
            <ul
              aria-label="Matching companies"
              role="listbox"
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
              {visibleSuggestions.length ? (
                visibleSuggestions.map((company, index) => (
                  <li key={company._id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === effectiveActiveSuggestionIndex}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                      onClick={() => chooseCompany(company)}
                      style={{
                        width: "100%",
                        border: 0,
                        background: index === effectiveActiveSuggestionIndex ? "#f3f4f6" : "#fff",
                        color: "#212529",
                        margin: 0,
                        padding: "0.5rem 0.7rem",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      {renderHighlightedCompanyName(company.companyName || "Untitled company", normalizedCompanySearch)}
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
