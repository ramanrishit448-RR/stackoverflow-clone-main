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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!app) {
    const modulePath = path.resolve(process.cwd(), "..", "server", "index.js");
    const loaded = await import(pathToFileURL(modulePath).href);
    app = loaded.default;
  }

  if (req.url?.startsWith("/api")) {
    req.url = req.url.replace(/^\/api/, "");
  }
  return app(req, res);
}
