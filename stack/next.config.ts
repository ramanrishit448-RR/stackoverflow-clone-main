import type { NextConfig } from "next";
import path from "path";

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
  webpack(config, { isServer }) {
    if (isServer) {
      // Tell webpack to not bundle these native/optional packages —
      // they'll be available at runtime in the serverless environment
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "twilio",
        "pdfkit",
        "aws4",
        "kerberos",
        "snappy",
        "@mongodb-js/zstd",
        "@aws-sdk/credential-providers",
        "mongodb-client-encryption",
      ];
    }
    // Resolve server-side node_modules from the stack folder
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      "node_modules",
    ];
    return config;
  },
};

export default nextConfig;
