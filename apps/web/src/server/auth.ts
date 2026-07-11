import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { config as loadEnvFile } from "dotenv";
import { betterAuth } from "better-auth";

const envFilePaths = [
  path.resolve(process.cwd(), "apps/web/.env"),
  path.resolve(process.cwd(), ".env"),
].filter((candidate) => existsSync(candidate));

for (const envFilePath of envFilePaths) {
  loadEnvFile({ path: envFilePath });
}

function getEnv(name: string): string | undefined {
  const metaEnv = typeof import.meta !== "undefined" && "env" in import.meta
    ? (import.meta as ImportMeta & { env?: Record<string, string | boolean | undefined> }).env
    : undefined;

  const fromMeta = metaEnv?.[name];
  if (typeof fromMeta === "string" && fromMeta.length > 0) {
    return fromMeta;
  }

  const fromProcess = process.env?.[name];
  if (typeof fromProcess === "string" && fromProcess.length > 0) {
    return fromProcess;
  }

  return undefined;
}

const baseUrl = getEnv("VITE_BETTER_AUTH_URL") ?? "http://localhost:3001";
const googleClientId = getEnv("VITE_GOOGLE_CLIENT_ID") ?? "";
const googleClientSecret = getEnv("VITE_GOOGLE_CLIENT_SECRET") ?? "";
const allowedUsersFilePath = getEnv("VITE_ALLOWED_USERS_FILE") ?? "./src/auth/allowed-users.json";
const authSecret = getEnv("BETTER_AUTH_SECRET") ?? getEnv("VITE_BETTER_AUTH_SECRET") ?? "gracecomp-local-development-secret";

function resolveAllowedUsersFilePath() {
  if (!allowedUsersFilePath) {
    return path.resolve(process.cwd(), "src/auth/allowed-users.json");
  }

  return path.isAbsolute(allowedUsersFilePath)
    ? allowedUsersFilePath
    : path.resolve(process.cwd(), allowedUsersFilePath);
}

type AllowedUsersFile = {
  allowedUsers?: string[];
  allowedEmails?: string[];
};

function getAllowedUsers(): string[] {
  const filePath = resolveAllowedUsersFilePath();

  if (!existsSync(filePath)) {
    throw new Error(`Missing authorized users file at ${filePath}`);
  }

  const parsed = JSON.parse(readFileSync(filePath, "utf-8")) as AllowedUsersFile;
  const emails = parsed.allowedUsers ?? parsed.allowedEmails ?? [];

  return emails.map((email) => email.trim().toLowerCase()).filter(Boolean);
}

function isAllowedEmail(email?: string | null) {
  if (!email) return false;
  return getAllowedUsers().includes(email.trim().toLowerCase());
}

export const auth = betterAuth({
  baseURL: baseUrl,
  basePath: "/api/auth",
  secret: authSecret,
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = user.email?.toLowerCase();
          if (!isAllowedEmail(email)) {
            throw new Error("This Google account is not authorized to access this application.");
          }

          return { data: user };
        },
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60,
      strategy: "jwe",
      refreshCache: { updateAge: 60 },
    },
  },
  account: {
    storeStateStrategy: "cookie",
    storeAccountCookie: true,
  },
});
