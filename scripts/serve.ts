import { spawn } from "node:child_process";

const child = spawn("bun", ["dist/server/server.js"], {
  cwd: "apps/web",
  env: {
    ...process.env,
    PORT: process.env.PORT ?? "3001",
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});