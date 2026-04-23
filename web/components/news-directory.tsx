"use client";

import { useMemo, useState } from "react";
import styles from "./news-directory.module.css";

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
      <mark className={styles.matchHighlight}>{name.slice(matchStart, matchEnd)}</mark>
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
  const showSuggestions = normalizedCompanySearch.length > 0;

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
      <section aria-label="News portfolio filter" className={styles.filterSection}>
        <div className={styles.filterCard}>
          <label htmlFor="avp-news-company-search" className={styles.filterLabel}>
            Search Portfolio Companies
          </label>
          <div className={styles.inputWrap}>
            <span aria-hidden className={styles.searchIcon}>
              ⌕
            </span>
            <input
              id="avp-news-company-search"
              type="search"
              placeholder="Type to find a company"
              value={companySearch}
              className={styles.filterInput}
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
                className={styles.clearButton}
              >
                Clear
              </button>
            ) : null}
          </div>
          {showSuggestions ? (
            <ul aria-label="Matching companies" role="listbox" className={styles.suggestionList}>
              {visibleSuggestions.length ? (
                visibleSuggestions.map((company, index) => (
                  <li key={company._id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === effectiveActiveSuggestionIndex}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                      onClick={() => chooseCompany(company)}
                      className={`${styles.suggestionButton} ${
                        index === effectiveActiveSuggestionIndex ? styles.suggestionButtonActive : ""
                      }`}
                    >
                      {renderHighlightedCompanyName(company.companyName || "Untitled company", normalizedCompanySearch)}
                    </button>
                  </li>
                ))
              ) : (
                <li className={styles.suggestionEmpty}>No matching portfolio companies</li>
              )}
            </ul>
          ) : null}

          <p className={styles.filterSummary}>{resultSummary}</p>
        </div>
      </section>

      <section className="avp-news-list" aria-label="News articles">
        {filteredNews.length ? (
          filteredNews.map((article) => (
            <article key={article._id} className="avp-news-item">
              {article.externalUrl ? (
                <a href={article.externalUrl} target="_blank" rel="noreferrer">
                  <h2>{article.title || "Untitled news item"}</h2>
                </a>
              ) : (
                <h2>{article.title || "Untitled news item"}</h2>
              )}

              <p className="avp-news-meta">
                {article.sourcePublication || article.excerpt || "External"}
                {article.publishedAt ? ` / ${formatDate(article.publishedAt)}` : ""}
                {article.relatedInvestmentName ? ` / ${article.relatedInvestmentName}` : ""}
              </p>
            </article>
          ))
        ) : (
          <p className="avp-news-empty">
            No news articles match the selected portfolio company yet. Try a different company or reset to all.
          </p>
        )}
      </section>
    </>
  );
}
