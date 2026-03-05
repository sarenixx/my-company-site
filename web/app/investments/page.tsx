import { sanity } from '@/lib/sanityClient'

export default async function InvestmentsPage() {
  const investments = await sanity.fetch(`
    *[_type == "investment"]{
      _id,
      companyName,
      website,
      description
    }
  `)

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Investments</h1>

      {investments?.length === 0 && <p>No investments yet.</p>}

      {investments?.map((inv: any) => (
        <div key={inv._id} style={{ marginTop: 20 }}>
          <h2>{inv.companyName}</h2>
          {inv.website && <a href={inv.website}>{inv.website}</a>}
          {inv.description && <p>{inv.description}</p>}
        </div>
      ))}
    </main>
  )
}
