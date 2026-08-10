import {RecipeCollection, Recipe} from './recipeApp';
import {useState} from "react";

export default function CollapsibleMenu({collections, recipeStateChanger} : {collections: RecipeCollection[] | null, recipeStateChanger: (recipe: Recipe) => void}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {  
    return (
      <aside className="sidebar-container collapsed justify-items-end">
        <button 
          id="sidebar-toggle" 
          className="sidebar-toggle" 
          aria-label="Toggle sidebar"
          onClick={_ => setIsOpen(true)}>▷</button>
      </aside>
    )
  }
  return (
    <aside className="sidebar-container justify-items-end">
        <button 
          id="sidebar-toggle" 
          className="sidebar-toggle" 
          aria-label="Toggle sidebar"
          onClick={_ => setIsOpen(false)}>◁</button>
          <SideMenu collections={collections} recipeStateChanger={recipeStateChanger} />
      </aside>
  )
}

function SideMenu(
  {collections,recipeStateChanger} : {collections: RecipeCollection[] | null, recipeStateChanger: (recipe: Recipe) => void}) {
  if (!collections || collections.length === 0) {
    return (
    <nav className="side-menu">
      <div>Loading Recipes</div>
    </nav>)
  }
  return (
    <nav className="side-menu p-4">
    {
      collections.map(collection=>{
        return (
          <div className="menu-collection" key={`${collection.heading}_header`}>
            <h2>{collection.heading}</h2>
            <ul>
              {
                collection.recipes.map((recipe, index)=>{
                  return (
                    <li key={`${collection.heading}_${index}`}>
                      <a href="#" className="menu-link" onClick={(e)=>{
                        e.preventDefault();
                        recipeStateChanger(recipe);
                      }}>{recipe.name}</a>
                    </li>
                  );
                })
              }
            </ul>
          </div>
        )
      })
    }
    </nav>
  )
}