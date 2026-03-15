import { TeamDirectory, type TeamMember } from "@/components/team-directory";
import { SiteShell } from "@/components/site-shell";
import { teamPageQuery } from "@/lib/queries";
import { sanityFetch } from "@/lib/sanity";

export default async function TeamPage() {
  const team = await sanityFetch<TeamMember[]>({
    query: teamPageQuery,
    tags: ["team", "type:teamMember"],
    revalidate: 300,
  });

  return (
    <SiteShell active="team">
      <main className="team-page">
        <section className="page-hero">
          <h1>Team</h1>
        </section>
        <TeamDirectory team={team} />
      </main>
    </SiteShell>
  );
}
