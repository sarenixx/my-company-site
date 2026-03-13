import { jobsQuery } from "@/lib/queries";
import { PortableTextBlock, portableTextToPlainText } from "@/lib/portableText";
import { sanityFetch } from "@/lib/sanity";

type JobPosting = {
  _id: string;
  title?: string;
  department?: string;
  location?: string;
  applyUrl?: string;
  description?: PortableTextBlock[];
};

export default async function JobsPage() {
  const jobs = await sanityFetch<JobPosting[]>({
    query: jobsQuery,
    tags: ["jobs", "type:jobPosting"],
    revalidate: 300,
  });

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Open Roles</h1>

      {!jobs?.length && <p style={{ marginTop: 16 }}>No active roles right now.</p>}

      {jobs?.map((job) => {
        const details = [job.department, job.location].filter(Boolean).join(" • ");
        return (
          <article
            key={job._id}
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.12)",
            }}
          >
            <h2 style={{ margin: 0 }}>{job.title || "Untitled role"}</h2>
            <p style={{ opacity: 0.75, marginTop: 8 }}>{details || "Details coming soon"}</p>
            <p style={{ marginTop: 12 }}>
              {portableTextToPlainText(job.description) || "Add role details in Sanity."}
            </p>
            {job.applyUrl && (
              <a href={job.applyUrl} target="_blank" rel="noreferrer">
                Apply now
              </a>
            )}
          </article>
        );
      })}
    </main>
  );
}
