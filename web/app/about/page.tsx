import { aboutPageQuery } from "@/lib/queries";
import { PortableTextBlock, portableTextToPlainText } from "@/lib/portableText";
import { sanityFetch } from "@/lib/sanity";

type AboutDocument = {
  _id: string;
  title?: string;
  content?: PortableTextBlock[];
} | null;

export default async function AboutPage() {
  const about = await sanityFetch<AboutDocument>({
    query: aboutPageQuery,
    tags: ["about", "type:about"],
    revalidate: 300,
  });

  return (
    <main style={{ padding: 24, maxWidth: 920, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>{about?.title || "About"}</h1>
      <p style={{ marginTop: 16, lineHeight: 1.7 }}>
        {portableTextToPlainText(about?.content) ||
          "Add an About document in Sanity Studio to populate this page."}
      </p>
    </main>
  );
}
