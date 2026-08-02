export type Recipe = {
  name: string;
  ingredients: NamedList[] | string[];
  steps: string[];
  reference?: Reference;
}

export type NamedList = {
  name: string;
  items: string[];
}

export type RecipeCollection = {
  heading: string;
  recipes: Recipe[];
}
export type Reference = {
  author: string;
  weblink: string;
}


export async function loadRecipeCollections(): Promise<RecipeCollection[]> {
  const collections: RecipeCollection[] = [];

  const modules = import.meta.glob('./recipes/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;

  for (const [key, value] of Object.entries(modules)) {
    const fileName = key.replace(/^.*\//, '');
    try {
      const parsedJson = value as any;
      const isValidCollection = parsedJson && (parsedJson.heading || parsedJson.title) && Array.isArray(parsedJson.recipes);
      if (!isValidCollection) {
        console.warn(`⚠️ Skipped "${fileName}": Missing a valid "heading/title" string or "recipes" array.`);
        continue;
      }

      
      if (parsedJson.title && !parsedJson.heading) parsedJson.heading = parsedJson.title;

      parsedJson.recipes = parsedJson.recipes.map((r: any) => {
        if (r.instructions && !r.steps) r.steps = r.instructions;
        
        if (Array.isArray(r.ingredients)) {
          r.ingredients = r.ingredients.map((ing: any) => {
            if (ing.ingredients && !ing.items) {
              ing.items = ing.ingredients;
            }
            return ing;
          });
        }
        return r;
      });

      const collection = parsedJson as RecipeCollection;
      collections.push(collection);
      console.log(`✅ Loaded collection: "${collection.heading}" with ${collection.recipes.length} recipe(s) [File: ${fileName}]`);
    } catch (err) {
      console.error(`❌ Error loading "${fileName}":`, err);
    }
  }

  return collections;
}