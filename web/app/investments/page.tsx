import { investmentsQuery } from "@/lib/queries";
import { sanityFetch } from "@/lib/sanity";

type Investment = {
  _id: string;
  companyName?: string;
  website?: string;
  description?: string;
  status?: string;
};

export default async function InvestmentsPage() {
  const investments = await sanityFetch<Investment[]>({
    query: investmentsQuery,
    tags: ["investments", "type:investment"],
    revalidate: 300,
  });

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Investments</h1>

      {investments?.length === 0 && <p>No investments yet.</p>}

      {investments?.map((inv) => (
        <div key={inv._id} style={{ marginTop: 20 }}>
          <h2>{inv.companyName || "Untitled Company"}</h2>
          {inv.status && <p style={{ opacity: 0.7 }}>{inv.status}</p>}
          {inv.website && (
            <a href={inv.website} target="_blank" rel="noreferrer">
              {inv.website}
            </a>
          )}
          {inv.description && <p>{inv.description}</p>}
        </div>
      ))}
    </main>
  );
}
