import { InvestmentsDirectory, type Investment } from "@/components/investments-directory";
import { SiteShell } from "@/components/site-shell";
import { investmentsQuery } from "@/lib/queries";
import { sanityFetch } from "@/lib/sanity";

export default async function InvestmentsPage() {
  const investments = await sanityFetch<Investment[]>({
    query: investmentsQuery,
    tags: ["investments", "news", "type:investment", "type:newsArticle"],
    revalidate: 300,
  });

  return (
    <SiteShell active="investments" whiteBackground>
      <main className="investments-page">
        <InvestmentsDirectory investments={investments} />
      </main>
    </SiteShell>
  );
}
