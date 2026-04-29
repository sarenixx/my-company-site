import { SiteShell } from "@/components/site-shell";
import { newsPageQuery } from "@/lib/queries";
import { sanityFetch } from "@/lib/sanity";

type NewsArticle = {
  _id: string;
  title?: string;
  excerpt?: string;
  sourcePublication?: string;
  externalUrl?: string;
  publishedAt?: string;
  relatedInvestmentName?: string;
};

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

export default async function NewsPage() {
  const news = await sanityFetch<NewsArticle[]>({
    query: newsPageQuery,
    tags: ["news", "type:newsArticle"],
    revalidate: 300,
  });

  return (
    <SiteShell active="news">
      <main className="news-page">
        <section className="page-hero">
          <h1>News</h1>
        </section>

        <section className="news-list-page">
          {news.map((article) => (
            <article key={article._id} className="news-row">
              {article.externalUrl ? (
                <a href={article.externalUrl} target="_blank" rel="noreferrer">
                  <h2>{article.title}</h2>
                </a>
              ) : (
                <h2>{article.title}</h2>
              )}
              <p className="news-meta">
                {article.sourcePublication || article.excerpt || "External"}{" "}
                {article.publishedAt ? `/ ${formatDate(article.publishedAt)}` : ""}
                {article.relatedInvestmentName ? ` / ${article.relatedInvestmentName}` : ""}
              </p>
            </article>
          ))}
        </section>
      </main>
    </SiteShell>
  );
}
