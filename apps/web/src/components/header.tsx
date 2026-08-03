import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { authClient } from "../server/auth-client";

export default function Header() {
  const links = [
    { to: "https://www.tgrace.dev", label: "Sims" },
    {to: "https://blog.tgrace.dev", label: "Blog" }
  ] as const;

  const { data: session, isPending, refetch } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.has("error")) {
      void authClient.signOut().catch(() => undefined);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "";
  const isAuthenticated = Boolean(session?.user);

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      setIsSubmitting(true);
      try {
        await authClient.signOut();
        await refetch();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.href,
        errorCallbackURL: window.location.href,
      });

      if (response.error) {
        await authClient.signOut().catch(() => undefined);
      }
    } catch {
      await authClient.signOut().catch(() => undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            if (to[0] === "/") {
              return (
                <Link key={to} to={to as any}>
                  {label}
                </Link>
              );
            }
            if (to[0] === "h") {
              return (
                <a key={to} href={to}>
                  {label}
                </a>
              );
            }
            return null;
          })}
        </nav>
        <div className="flex items-center gap-2">
          {displayName ? <span className="text-sm">Hello, {displayName}</span> : null}
          <button
            type="button"
            onClick={handleAuthClick}
            disabled={isPending || isSubmitting}
            className="rounded border border-white/20 px-3 py-1 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Loading..." : isAuthenticated ? "Logout" : "Login with Google"}
          </button>
        </div>
      </div>
      <hr />
    </div>
  );
}
