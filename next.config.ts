import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // old event links (e.g. in emails already sent)
  redirects: async () => [{ source: "/dashboard/events/:path*", destination: "/event/:path*", permanent: true }],
  /* config options here */
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
