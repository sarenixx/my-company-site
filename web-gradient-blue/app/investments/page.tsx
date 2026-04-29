import { SiteShell } from "@/components/site-shell";
import { investmentsQuery } from "@/lib/queries";
import { sanityFetch } from "@/lib/sanity";

type InvestmentNews = {
  _id: string;
  title?: string;
  sourcePublication?: string;
  externalUrl?: string;
  publishedAt?: string;
};

type Investment = {
  _id: string;
  companyName?: string;
  website?: string;
  description?: string;
  status?: string;
  logoUrl?: string;
  relatedNews?: InvestmentNews[];
};

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

export default async function InvestmentsPage() {
  const investments = await sanityFetch<Investment[]>({
    query: investmentsQuery,
    tags: ["investments", "news", "type:investment", "type:newsArticle"],
    revalidate: 300,
  });

  return (
    <SiteShell active="investments">
      <main className="investments-page">
        <section className="page-hero">
          <h1>Investments</h1>
        </section>

        <section className="investment-logo-grid">
          {investments.map((investment) => (
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
          {investments.map((investment) => (
            <article id={investment._id} key={investment._id} className="investment-detail">
              <div className="investment-side">
                {investment.logoUrl ? (
                  <img src={investment.logoUrl} alt={investment.companyName || "Company logo"} />
                ) : (
                  <div className="logo-fallback">{investment.companyName || "Company"}</div>
                )}
                {investment.website ? (
                  <a href={investment.website} target="_blank" rel="noreferrer">
                    {investment.website.replace(/^https?:\/\//, "")}
                  </a>
                ) : null}
                <p className="status">
                  <strong>Status:</strong> {investment.status || "active"}
                </p>
              </div>

              <div className="investment-main">
                <h2>{investment.companyName || "Untitled Company"}</h2>
                {investment.description ? <p>{investment.description}</p> : null}

                {investment.relatedNews?.length ? (
                  <div className="related-news">
                    {investment.relatedNews.map((newsItem) => (
                      <div key={newsItem._id} className="related-news-item">
                        {newsItem.externalUrl ? (
                          <a href={newsItem.externalUrl} target="_blank" rel="noreferrer">
                            <h3>{newsItem.title}</h3>
                          </a>
                        ) : (
                          <h3>{newsItem.title}</h3>
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
          ))}
        </section>
      </main>
    </SiteShell>
  );
}
