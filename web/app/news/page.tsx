import { NewsDirectory, type NewsArticle, type PortfolioCompany } from "@/components/news-directory";
import { SiteShell } from "@/components/site-shell";
import { newsPageWithCompaniesQuery } from "@/lib/news-page-query";
import { sanityFetch } from "@/lib/sanity";

type NewsPageData = {
  news: NewsArticle[];
  portfolioCompanies: PortfolioCompany[];
};

export default async function NewsPage() {
  const data = await sanityFetch<NewsPageData>({
    query: newsPageWithCompaniesQuery,
    tags: ["news", "investments", "type:newsArticle", "type:investment"],
    revalidate: 300,
  });

  return (
    <SiteShell active="news">
      <main className="avp-news-page">
        <NewsDirectory news={data.news} portfolioCompanies={data.portfolioCompanies} />
      </main>
    </SiteShell>
  );
}
