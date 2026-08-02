import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {Recipe, RecipeCollection, loadRecipeCollections} from "../components/recipeApp";
import RecipePanel from "../components/recipePanel";
import CollapsibleMenu from "../components/sidePanel";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [recipeList, setRecipeList] = useState<RecipeCollection[] | null>(null);

  //Load the recipes on startup
  useEffect(() => {
    loadRecipeCollections()
      .then((collections) => {
        setRecipeList(collections)
        setCurrentRecipe(collections[0].recipes[0])
      })
      .catch((err) => console.error('Error loading recipe collections:', err));
  }, []);

  return (
    <div className="recipe-app-layout">
      <CollapsibleMenu collections={recipeList} recipeStateChanger={setCurrentRecipe} />
      <main id="display-area">
        <RecipePanel recipe={currentRecipe} />
      </main>
    </div>
  )
}
