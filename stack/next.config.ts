import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "",
  },
  async rewrites() {
    return [
      { source: "/user/:path*", destination: "/api/user/:path*" },
      { source: "/question/:path*", destination: "/api/question/:path*" },
      { source: "/answer/:path*", destination: "/api/answer/:path*" },
      { source: "/feed/:path*", destination: "/api/feed/:path*" },
      { source: "/follow/:path*", destination: "/api/follow/:path*" },
      { source: "/notifications/:path*", destination: "/api/notifications/:path*" },
      { source: "/admin/:path*", destination: "/api/admin/:path*" },
      { source: "/payment/:path*", destination: "/api/payment/:path*" },
      { source: "/articles/:path*", destination: "/api/articles/:path*" },
      { source: "/teams/:path*", destination: "/api/teams/:path*" },
      { source: "/collectives/:path*", destination: "/api/collectives/:path*" },
      { source: "/companies/:path*", destination: "/api/companies/:path*" },
    ];
  },
};

export default nextConfig;
