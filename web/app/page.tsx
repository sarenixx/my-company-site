import { sanityFetch } from "../lib/sanity";
import { homepageQuery } from "../lib/queries";
import { PortableTextBlock, portableTextToPlainText } from "../lib/portableText";

type HomepageResponse = {
  homepage: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    heroImageUrl?: string;
    aboutHeadline?: string;
    aboutParagraph?: string;
    aboutPoints?: string[];
  } | null;
  investments: Array<{
    _id: string;
    companyName?: string;
    description?: string;
    website?: string;
    status?: string;
    logoUrl?: string;
  }>;
  news: Array<{
    _id: string;
    title?: string;
    excerpt?: string;
    externalUrl?: string;
    publishedAt?: string;
  }>;
  team: Array<{
    _id: string;
    name?: string;
    role?: string;
    photoUrl?: string;
    bio?: PortableTextBlock[];
  }>;
  aboutPage: {
    _id: string;
    title?: string;
    content?: PortableTextBlock[];
  } | null;
  jobs: Array<{
    _id: string;
    title?: string;
    department?: string;
    location?: string;
    applyUrl?: string;
    description?: PortableTextBlock[];
  }>;
};

export default async function Home() {
  const data = await sanityFetch<HomepageResponse>({
    query: homepageQuery,
    tags: [
      "homepage",
      "investments",
      "news",
      "team",
      "about",
      "jobs",
      "type:homepage",
      "type:investment",
      "type:newsArticle",
      "type:teamMember",
      "type:about",
      "type:jobPosting",
    ],
    revalidate: 300,
  });
  const homepage = data?.homepage;
  const aboutPreview = portableTextToPlainText(data?.aboutPage?.content);
  const studioLink = homepage?.buttonLink || process.env.SANITY_STUDIO_ORIGIN || "/";

  return (
    <main className="home-shell">
      <section className="hero panel">
        <div>
          <p className="eyebrow">Editorially Controlled In Sanity</p>
          <h1>{homepage?.title || "Investing In Category-Defining Companies"}</h1>
          <p className="lede">
            {homepage?.subtitle || "Update this hero copy from Sanity Studio and watch it go live on your site."}
          </p>
          <a className="cta" href={studioLink}>
            {homepage?.buttonText || "Open Sanity Studio"}
          </a>
        </div>
        <div className="hero-media" aria-hidden="true">
          {homepage?.heroImageUrl ? (
            <img src={homepage.heroImageUrl} alt="Hero" />
          ) : (
            <div className="media-fallback">Add a hero image in Sanity</div>
          )}
        </div>
      </section>

      <section className="about panel">
        <h2>{homepage?.aboutHeadline || "About"}</h2>
        <p>{homepage?.aboutParagraph || "Shape this section from the homepage document in Sanity."}</p>
        {!!homepage?.aboutPoints?.length && (
          <ul>
            {homepage.aboutPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>{data?.aboutPage?.title || "About The Firm"}</h2>
          <a href="/about">Read full story</a>
        </div>
        <p>{aboutPreview || "Create an About document in Sanity to populate this preview."}</p>
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>Portfolio</h2>
          <a href="/investments">View all</a>
        </div>
        <div className="card-grid">
          {data?.investments?.length ? (
            data.investments.map((investment) => (
              <article className="card" key={investment._id}>
                {investment.logoUrl && <img className="logo" src={investment.logoUrl} alt="" />}
                <h3>{investment.companyName}</h3>
                {investment.description && <p>{investment.description}</p>}
                <div className="meta-row">
                  {investment.status && <span className="badge">{investment.status}</span>}
                  {investment.website && (
                    <a href={investment.website} target="_blank" rel="noreferrer">
                      Website
                    </a>
                  )}
                </div>
              </article>
            ))
          ) : (
            <p className="empty">No investments yet. Add documents in Sanity Studio.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>Latest News</h2>
        </div>
        <div className="news-list">
          {data?.news?.length ? (
            data.news.map((article) => (
              <article key={article._id} className="news-item">
                <h3>{article.title}</h3>
                <p>{article.excerpt || "No excerpt provided yet."}</p>
                <div className="meta-row">
                  <span>
                    {article.publishedAt
                      ? new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(article.publishedAt))
                      : "Draft"}
                  </span>
                  {article.externalUrl && (
                    <a href={article.externalUrl} target="_blank" rel="noreferrer">
                      Read more
                    </a>
                  )}
                </div>
              </article>
            ))
          ) : (
            <p className="empty">No news yet. Create a News document in Sanity.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>Open Roles</h2>
          <a href="/jobs">View all roles</a>
        </div>
        <div className="news-list">
          {data?.jobs?.length ? (
            data.jobs.map((job) => {
              const details = [job.department, job.location].filter(Boolean).join(" • ");
              return (
                <article key={job._id} className="news-item">
                  <h3>{job.title || "Untitled role"}</h3>
                  <p>{portableTextToPlainText(job.description) || "Add role details in Sanity."}</p>
                  <div className="meta-row">
                    <span>{details || "Details coming soon"}</span>
                    {job.applyUrl && (
                      <a href={job.applyUrl} target="_blank" rel="noreferrer">
                        Apply
                      </a>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <p className="empty">No active roles yet. Add Jobs documents in Sanity.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Team</h2>
        <div className="team-grid">
          {data?.team?.length ? (
            data.team.map((member) => (
              <article className="team-card" key={member._id}>
                {member.photoUrl && <img src={member.photoUrl} alt={member.name || "Team member"} />}
                <h3>{member.name}</h3>
                <p className="role">{member.role || "Role coming soon"}</p>
                <p>{portableTextToPlainText(member.bio) || "Add bio details in Sanity."}</p>
              </article>
            ))
          ) : (
            <p className="empty">No team members yet. Add Team documents in Sanity.</p>
          )}
        </div>
      </section>
    </main>
  );
}
