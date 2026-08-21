import {Recipe} from "./recipeApp";
import IngredientsTable from "./ingredientsSection";
import ClipboardButton from "./uiElems/clipboardButton";
import {formatForCopy} from "./ingredientsSection";

export default function RecipePanel({ recipe }: { recipe: Recipe|null }) {
    if (!recipe) return (<div className="paperContainer">No Recipe Loaded.</div>)

    const copyString = formatForCopy(recipe.ingredients)
    return (
        <div className="paperContainer sm:max-w-xl">
        <div className="paperSection">
            <h1>{recipe.name}</h1>
        </div>
        <div className="paperSection">
            <div className="flex flex-row gap-2 justify-start">
                <h2>Ingredients</h2>
                <ClipboardButton props={{ toCopy: copyString }} />
            </div>
            <IngredientsTable ingredients={recipe.ingredients} recipeName={recipe.name} />
        </div>
        <div className="paperSection">
            <h2>Instructions</h2>
            <ol>
            {
                recipe.steps.map((step, index) => {return <li key={"instr_"+index}>{step}</li>})
            }
            </ol>
        </div>
        {
            recipe.reference? (
            <div className="paperSection flex flex-row justify-start">
                <h2 className="mr-10">Credit</h2>
                <div className="flex flex-col">
                    <div><b>Author</b>: {recipe.reference.author} </div> 
                    <div><b>Link</b>: <a href={recipe.reference.weblink} target="_blank">{recipe.reference.weblink}</a></div>
                </div>
            </div>
            ) : (
            <>
            </>
            )
        }
        
        </div>
    )
}