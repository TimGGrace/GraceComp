import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { type Connect, defineConfig, type ViteDevServer } from "vite";

import { auth } from "./src/server/auth";

const betterAuthDevHandler = {
  name: "better-auth-dev-handler",
  configureServer(server: ViteDevServer) {
    server.middlewares.use(async (req: Connect.IncomingMessage, res: any, next: Connect.NextFunction) => {
      if (!req.url?.startsWith("/api/auth")) {
        next();
        return;
      }

      const targetUrl = new URL(req.url, `http://${req.headers.host ?? "localhost:3001"}`);
      const body = req.method !== "GET" && req.method !== "HEAD"
        ? await new Promise<Buffer | undefined>((resolve, reject) => {
            const chunks: Buffer[] = [];
            req.on("data", (chunk: Buffer | string) => {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });
            req.on("end", () => resolve(chunks.length > 0 ? Buffer.concat(chunks) : undefined));
            req.on("error", reject);
          })
        : undefined;

      const request = new Request(targetUrl, {
        method: req.method,
        headers: req.headers as HeadersInit,
        body: body ? body.toString("utf-8") : undefined,
      });

      const response = await auth.handler(request);
      res.statusCode = response.status;
      res.statusMessage = response.statusText;

      const setCookieHeader = response.headers.getSetCookie?.();
      if (setCookieHeader?.length) {
        res.setHeader("set-cookie", setCookieHeader);
      }

      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") return;
        res.setHeader(key, value);
      });

      const responseText = await response.text();
      res.end(responseText);
    });
  },
};

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3001,
  },
  preview: {
    host: "0.0.0.0",
    port: 3001,
    allowedHosts: ["food.tgrace.dev"],
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tailwindcss(), tanstackStart(), viteReact(), betterAuthDevHandler],
});
