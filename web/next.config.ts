import type { NextConfig } from "next";

const studioOrigin =
  process.env.SANITY_STUDIO_ORIGIN ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:3333" : undefined);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async rewrites() {
    if (!studioOrigin) {
      return [];
    }

    return [
      {
        source: "/studio",
        destination: studioOrigin,
      },
      {
        source: "/studio/:path*",
        destination: `${studioOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
