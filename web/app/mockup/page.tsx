import { sanityFetch } from "@/lib/sanity";
import { homepageQuery } from "@/lib/queries";
import { PortableTextBlock, portableTextToPlainText } from "@/lib/portableText";

type MockupData = {
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
};

export default async function MockupPage() {
  const data = await sanityFetch<MockupData>({
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

  return (
    <main style={{ padding: 32, maxWidth: 1100, margin: "0 auto", fontFamily: "Georgia, serif" }}>
      <p style={{ letterSpacing: 2, textTransform: "uppercase", fontSize: 12, opacity: 0.65 }}>
        Sandbox Route / Safe To Experiment
      </p>
      <h1 style={{ fontSize: "clamp(2rem, 4vw, 4rem)", marginTop: 8 }}>
        {data.homepage?.title || "Mockup Playground"}
      </h1>
      <p style={{ fontSize: "1.15rem", maxWidth: 760 }}>
        {data.homepage?.subtitle || "This route is connected to Sanity. Replace this layout with your old mockup code."}
      </p>

      <section style={{ marginTop: 36 }}>
        <h2>Live sanity checks</h2>
        <ul>
          <li>Homepage title: {data.homepage?.title || "(empty)"}</li>
          <li>Investments count: {data.investments.length}</li>
          <li>News count: {data.news.length}</li>
          <li>Team count: {data.team.length}</li>
        </ul>
      </section>

      <section style={{ marginTop: 36, display: "grid", gap: 16 }}>
        {data.investments.slice(0, 3).map((item) => (
          <article key={item._id} style={{ padding: 16, border: "1px solid #d3d3d3", borderRadius: 8 }}>
            <h3 style={{ margin: 0 }}>{item.companyName || "Untitled"}</h3>
            <p>{item.description || "No description"}</p>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 36, display: "grid", gap: 16 }}>
        {data.team.slice(0, 3).map((member) => (
          <article key={member._id} style={{ padding: 16, border: "1px solid #d3d3d3", borderRadius: 8 }}>
            <h3 style={{ margin: 0 }}>{member.name || "Unnamed"}</h3>
            <p style={{ opacity: 0.75 }}>{member.role || "Role missing"}</p>
            <p>{portableTextToPlainText(member.bio) || "Bio missing"}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
