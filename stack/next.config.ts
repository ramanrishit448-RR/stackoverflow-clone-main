import type { NextConfig } from "next";

// All packages that live in server/node_modules and must NOT be bundled by webpack
const SERVER_ONLY_PACKAGES = [
  "bcryptjs",
  "mongoose",
  "mongodb",
  "express",
  "jsonwebtoken",
  "nodemailer",
  "pdfkit",
  "razorpay",
  "cors",
  "dotenv",
  "twilio",
  "aws4",
  "kerberos",
  "snappy",
  "@mongodb-js/zstd",
  "@aws-sdk/credential-providers",
  "mongodb-client-encryption",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next.js 15: skip bundling these packages, require() them at runtime
  serverExternalPackages: SERVER_ONLY_PACKAGES,
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
      // webpack externals: emit `require('pkg')` instead of bundling or resolving
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        ({ request }: { request: string }, callback: Function) => {
          const pkg = request?.split("/")[0];
          if (pkg && SERVER_ONLY_PACKAGES.includes(pkg)) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }
    return config;
  },
};

export default nextConfig;

