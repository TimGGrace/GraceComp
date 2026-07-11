import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { betterAuth } from "better-auth";

const baseUrl = (import.meta.env.VITE_BETTER_AUTH_URL as string | undefined) ?? "http://localhost:3001";
const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? "";
const googleClientSecret = (import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string | undefined) ?? "";
const allowedUsersFilePath = (import.meta.env.VITE_ALLOWED_USERS_FILE as string | undefined) ?? "./src/auth/allowed-users.json";

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
