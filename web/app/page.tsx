import { SiteShell } from "@/components/site-shell";
import { aboutLandingQuery } from "@/lib/queries";
import { PortableTextBlock, portableTextToParagraphs } from "@/lib/portableText";
import { sanityFetch } from "@/lib/sanity";

type AboutLandingResponse = {
  homepage: {
    title?: string;
    subtitle?: string;
    heroImageUrl?: string;
    aboutPoints?: string[];
  } | null;
  aboutPage: {
    _id: string;
    title?: string;
    content?: PortableTextBlock[];
  } | null;
};

type Sector = {
  title: string;
  description: string;
};

function parseSectors(content?: PortableTextBlock[]): Sector[] {
  if (!content?.length) return [];
  const sectors: Sector[] = [];
  let current: Sector | null = null;

  for (const block of content) {
    const text = (block.children || []).map((child) => child.text || "").join("").trim();
    if (!text) continue;

    if (block.style === "h5") {
      if (current) {
        sectors.push(current);
      }
      current = { title: text, description: "" };
      continue;
    }

    if (!current) continue;
    current.description = `${current.description} ${text}`.trim();
  }

  if (current) {
    sectors.push(current);
  }

  return sectors;
}

export default async function Home() {
  const data = await sanityFetch<AboutLandingResponse>({
    query: aboutLandingQuery,
    tags: ["homepage", "about", "type:homepage", "type:about"],
    revalidate: 300,
  });

  const homepage = data.homepage;
  const aboutContent = data.aboutPage?.content || [];
  const callouts =
    homepage?.aboutPoints?.filter(Boolean) ||
    aboutContent
      .filter((block) => block.listItem === "bullet")
      .map((block) => portableTextToParagraphs([block])[0])
      .filter(Boolean);
  const sectors = parseSectors(aboutContent);

  return (
    <SiteShell active="about">
      <main className="about-page">
        <section className="about-top">
          <div className="about-summary">
            {homepage?.heroImageUrl ? (
              <img src={homepage.heroImageUrl} alt="Advance Venture Partners logo" className="about-logo" />
            ) : (
              <div className="about-logo-fallback">AVP</div>
            )}
            <h1>{homepage?.title || "Advance Venture Partners"}</h1>
            {homepage?.subtitle ? <p className="about-subtitle">{homepage.subtitle}</p> : null}
          </div>

          <div className="about-callouts">
            <ul>
              {(callouts || []).map((point, index) => (
                <li key={`${point}-${index}`}>{point}</li>
              ))}
            </ul>
          </div>
        </section>

        {sectors.length ? (
          <section className="sector-section">
            <h2>Priority Sectors</h2>
            <div className="sector-grid">
              {sectors.map((sector) => (
                <article key={sector.title} className="sector-card">
                  <h3>{sector.title}</h3>
                  <p>{sector.description}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </SiteShell>
  );
}
