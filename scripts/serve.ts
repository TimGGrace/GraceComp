import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type BunFile = {
  exists: () => Promise<boolean> | boolean;
  text: () => Promise<string>;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

type BunServeOptions = {
  hostname: string;
  port: number;
  fetch: (request: Request) => Response | Promise<Response>;
};

declare const Bun: {
  serve: (options: BunServeOptions) => unknown;
  file: (path: string) => BunFile;
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const clientDistDir = path.resolve(scriptDir, "../apps/web/dist/client");
const serverEntryPath = path.resolve(scriptDir, "../apps/web/dist/server/server.js");

const serverModule = await import(pathToFileURL(serverEntryPath).href);
const app = serverModule.default as { fetch: (request: Request) => Response | Promise<Response> };

Bun.serve({
  hostname: "0.0.0.0",
  port: Number(process.env.PORT ?? "3001"),
  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === "/robots.txt") {
      const robotsPath = path.join(clientDistDir, "robots.txt");
      return new Response(await Bun.file(robotsPath).text(), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (url.pathname.startsWith("/assets/")) {
      const assetPath = path.join(clientDistDir, url.pathname.slice(1));
      if (await Bun.file(assetPath).exists()) {
        const contentType = assetPath.endsWith(".css")
          ? "text/css; charset=utf-8"
          : "application/javascript; charset=utf-8";
        return new Response(await Bun.file(assetPath).arrayBuffer(), {
          headers: { "Content-Type": contentType },
        });
      }
    }

    return await app.fetch(request);
  },
});