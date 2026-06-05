import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import initializeApp from "../components/recipeApp";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  useEffect(() => {
    (async () => {
      try {
        if (typeof initializeApp === "function") await initializeApp();
      } catch (err) {
        console.error('Error initializing recipe app:', err);
      }
    })();
  }, []);

  return null; // `initializeApp` renders the UI into #app
}
