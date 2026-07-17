import type { NextApiRequest, NextApiResponse } from "next";
// @ts-ignore
import app from "../../../../server/index.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.url?.startsWith("/api")) {
    req.url = req.url.replace(/^\/api/, "");
  }
  return (app as any)(req, res);
}
