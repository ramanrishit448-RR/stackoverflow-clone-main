import type { NextApiRequest, NextApiResponse } from "next";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

let app: any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!app) {
    const candidates = [
      path.resolve(process.cwd(), "..", "server", "index.js"), // when cwd is stack
      path.resolve(process.cwd(), "server", "index.js"), // when server copied into stack
      path.resolve(process.cwd(), "..", "..", "server", "index.js"), // extra fallback
    ];

    let loaded: any = null;
    for (const p of candidates) {
      try {
        loaded = await import(pathToFileURL(p).href);
        if (loaded) {
          app = loaded.default;
          break;
        }
      } catch (err) {
        // ignore and try next
      }
    }
    if (!app) {
      throw new Error(
        "Server entry not found in any expected location: " +
          candidates.join(", "),
      );
    }
  }

  if (req.url?.startsWith("/api")) {
    req.url = req.url.replace(/^\/api/, "");
  }
  return app(req, res);
}
