import { Toaster } from "@GraceRecipe/ui/components/sonner";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";

import appCss from "../index.css?url";
import Header from "../components/header";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Grace Recipes",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        <div className="grid h-svh grid-rows-[auto_1fr]">
          <div id="app">
            <Outlet />
          </div>
        </div>
        <Toaster richColors />
        <Scripts />
      </body>
    </html>
  );
}
