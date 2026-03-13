import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const baseTags = ["homepage", "investments", "news", "team", "about", "jobs"];

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "Missing SANITY_REVALIDATE_SECRET." },
      { status: 500 },
    );
  }

  const providedSecret =
    request.headers.get("x-sanity-webhook-secret") ||
    request.nextUrl.searchParams.get("secret");

  if (providedSecret !== secret) {
    return NextResponse.json({ message: "Invalid revalidation secret." }, { status: 401 });
  }

  let payload: { _type?: string } = {};
  try {
    payload = await request.json();
  } catch {
    // Sanity webhooks can be configured without payload.
  }

  const tags = [...baseTags];
  if (payload?._type) {
    tags.push(`type:${payload._type}`);
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({
    revalidated: true,
    tags,
    timestamp: new Date().toISOString(),
  });
}
