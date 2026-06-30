import { betterAuth } from "better-auth";
import {createAuthClient} from "better-auth/react";
export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 7 * 24 * 60 * 60, // 7 days cache duration
            strategy: "jwe",
            refreshCache: {updateAge: 60}, // Enable stateless refresh 60s before expiry
        },
    },
    account: {
        storeStateStrategy: "cookie",
        storeAccountCookie: true, // Store provider account data after OAuth flow in an encrypted cookie
    }
});

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
})