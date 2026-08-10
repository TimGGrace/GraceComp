import { Toaster } from "@GraceRecipe/ui/components/sonner";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";

import appCss from "../index.css?url";
import Header from "@/components/header";
import {ThemeProvider} from "@/components/theme-provider"

export interface RouterAppContext {}

import web_manifest from "../images/site.webmanifest?url";
import apple_icon from "../images/apple-touch-icon.png";
import fav_16 from "../images/favicon-16x16.png";
import fav_32 from "../images/favicon-32x32.png";

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
      {
        rel: "icon",
        type:"image/png",
        sizes:"32x32",
        href:fav_32
      },
      {
        rel:"icon",
        type:"image/png",
        sizes:"16x16",
        href:fav_16
      },
      {
        rel: "apple-touch-icon",
        sizes:"180x180",
        href:apple_icon
      },
      {
        rel:"manifest",
        href:web_manifest
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <Header />
          <div className="grid h-svh grid-rows-[auto_1fr]">
            <div id="app">
              <Outlet />
            </div>
          </div>
        </ThemeProvider>
        <Toaster richColors />
        <Scripts />
        
      </body>
    </html>
  );
}
