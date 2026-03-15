import { SiteShell } from "@/components/site-shell";
import { teamPageQuery } from "@/lib/queries";
import { PortableTextBlock, portableTextToParagraphs } from "@/lib/portableText";
import { sanityFetch } from "@/lib/sanity";

type TeamMember = {
  _id: string;
  name?: string;
  role?: string;
  photoUrl?: string;
  linkedin?: string;
  email?: string;
  bio?: PortableTextBlock[];
};

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

        <section className="team-grid">
          {team.map((member) => (
            <a key={member._id} href={`#${member._id}`} className="team-card-link">
              <article className="team-card">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name || "Team member"} />
                ) : (
                  <div className="avatar-fallback">{(member.name || "AVP").slice(0, 2).toUpperCase()}</div>
                )}
                <p>{member.name || "Unnamed"}</p>
              </article>
            </a>
          ))}
        </section>

        <section className="team-details">
          {team.map((member) => {
            const bioParagraphs = portableTextToParagraphs(member.bio);
            return (
              <article id={member._id} key={member._id} className="team-detail">
                <div className="team-detail-side">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name || "Team member"} />
                  ) : (
                    <div className="avatar-fallback large">{(member.name || "AVP").slice(0, 2).toUpperCase()}</div>
                  )}
                  <div className="team-contact-links">
                    {member.linkedin ? (
                      <a href={member.linkedin} target="_blank" rel="noreferrer">
                        LinkedIn
                      </a>
                    ) : null}
                    {member.email ? <a href={`mailto:${member.email}`}>Email</a> : null}
                  </div>
                </div>

                <div className="team-detail-main">
                  <h2>
                    {member.name || "Unnamed"}
                    {member.role ? <span>{member.role}</span> : null}
                  </h2>
                  {bioParagraphs.map((paragraph, index) => (
                    <p key={`${member._id}-bio-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </SiteShell>
  );
}
