import {NamedList} from "./recipeApp";
import CheckedItem from "./uiElems/checkedBox";

function IngredientList({namedList, recipeName} : {namedList: NamedList, recipeName: string}) {
  return (
    <div className="flex-col gap-2 grow">
      {namedList.name!=""? <h2>{namedList.name}</h2>: null}
      <ul className="list-none">
        {namedList.items.map((item, index) => 
        <li key={recipeName + namedList.name+"_"+index}>
          <CheckedItem itemLabel={item} />
        </li>)}
      </ul>
    </div>
  );
}
export default function IngredientsTable({ingredients, recipeName}:{ingredients: NamedList[] | string[], recipeName: string}) {
  if (ingredients.length === 0) return (<div className="paperSection">No Ingredients Found.</div>)

  if (typeof ingredients[0] === 'object') {
    return (<div className="paperSection flex justify-around justify-items-start">
      {
        (ingredients as NamedList[]).map((namedList, index) => {
          return <IngredientList key={`ingredients_table_${index}`} namedList={namedList as NamedList} recipeName={recipeName}/>
        })
      }
    </div>
    )
  } else {
    return (
      <div className="paperSection">
        <IngredientList namedList={{ name: "", items: ingredients as string[] }} recipeName={recipeName} />
      </div>
    )
  }

  return (<div className="paperSection"> Ingredients List Error.</div>)
}

export function formatForCopy(ingredients: NamedList[] | string[]): string {
  if (typeof ingredients[0] === 'object') {
    return (ingredients as NamedList[])
              .map(namedList=>namedList.items.join("\n"))
              .join("\n");
  } else {
    return (ingredients as string[]).join("\n");
  }
}