// Use Vite's glob import to bundle recipe JSON files for the browser

type Recipe = {
  name: string;
  ingredients: NamedList[] | string[];
  steps: string[];
}

type NamedList = {
  name: string;
  items: string[];
}

type RecipeCollection = {
  heading: string;
  recipes: Recipe[];
}

function printRecipe(r: Recipe): HTMLElement {
  const container = document.createElement('div');
  container.className = 'paperContainer';

  const titleSection = document.createElement('div');
  titleSection.className = 'paperSection';
  
  const h1 = document.createElement('h1');
  h1.textContent = r.name;
  
  titleSection.appendChild(h1);
  container.appendChild(titleSection);

  const ingredientsSection = document.createElement('div');
  ingredientsSection.className = 'paperSection';
  
  const ingredientsHeading = document.createElement('h2');
  ingredientsHeading.textContent = 'Ingredients';
  ingredientsSection.appendChild(ingredientsHeading);

  if (r.ingredients.length > 0 && typeof r.ingredients[0] === 'object') {
    const flexContainer = document.createElement('div');
    flexContainer.style.display = 'flex';
    flexContainer.style.flexDirection = 'row';
    flexContainer.style.justifyContent = 'space-around';
    flexContainer.style.alignItems = 'flex-start';
    flexContainer.style.gap = '2rem';

    (r.ingredients as NamedList[]).forEach((section) => {
      const colDiv = document.createElement('div');
      colDiv.style.display = 'flex';
      colDiv.style.flexDirection = 'column';

      const h3 = document.createElement('h3');
      h3.textContent = section.name;
      colDiv.appendChild(h3);

      const ul = document.createElement('ul');
      section.items.forEach((value) => {
        const li = document.createElement('li');
        li.textContent = value;
        ul.appendChild(li);
      });

      colDiv.appendChild(ul);
      flexContainer.appendChild(colDiv);
    });

    ingredientsSection.appendChild(flexContainer);
  } else {
    const ul = document.createElement('ul');
    (r.ingredients as string[]).forEach((value) => {
      const li = document.createElement('li');
      li.textContent = value;
      ul.appendChild(li);
    });
    
    ingredientsSection.appendChild(ul);
  }

  container.appendChild(ingredientsSection);

  const instructionsSection = document.createElement('div');
  instructionsSection.className = 'paperSection';

  const instructionsHeading = document.createElement('h2');
  instructionsHeading.textContent = 'Instructions';
  instructionsSection.appendChild(instructionsHeading);

  const ol = document.createElement('ol');
  r.steps.forEach((value) => {
    const li = document.createElement('li');
    li.textContent = value;
    ol.appendChild(li);
  });

  instructionsSection.appendChild(ol);
  container.appendChild(instructionsSection);

  return container;
}

async function loadRecipeCollections(): Promise<RecipeCollection[]> {
  const collections: RecipeCollection[] = [];

  // Import JSON file URLs, then fetch them to ensure the browser receives JSON text.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const modules = import.meta.glob('./recipes/*.json', { as: 'url', eager: true }) as Record<string, string>;

  for (const key in modules) {
    const url = modules[key];
    const fileName = key.replace(/^.*\//, '');
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`⚠️ Failed to fetch "${fileName}": ${res.status}`);
        continue;
      }
      const parsedJson = await res.json();
      const isValidCollection = parsedJson && (parsedJson.heading || parsedJson.title) && Array.isArray(parsedJson.recipes || parsedJson.recipes);
      if (!isValidCollection) {
        console.warn(`⚠️ Skipped "${fileName}": Missing a valid "heading/title" string or "recipes" array.`);
        continue;
      }

      // Normalize fields: accept `title` as `heading`, and `instructions` as `steps`.
      if (parsedJson.title && !parsedJson.heading) parsedJson.heading = parsedJson.title;
      parsedJson.recipes = parsedJson.recipes.map((r: any) => {
        if (r.instructions && !r.steps) r.steps = r.instructions;
        // Normalize nested ingredient objects: convert `ingredients` to `items`
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

function createSideMenu(collections: RecipeCollection[]): HTMLElement {
  const nav = document.createElement('nav');
  nav.className = 'side-menu';

  collections.forEach((collection) => {
    const collectionDiv = document.createElement('div');
    collectionDiv.className = 'menu-collection';

    const heading = document.createElement('h2');
    heading.textContent = collection.heading;
    collectionDiv.appendChild(heading);

    const ul = document.createElement('ul');

    collection.recipes.forEach((recipe, index) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'menu-link';
      a.textContent = recipe.name;

      // add clicks and active handling
      a.addEventListener('click', (event) => {
        event.preventDefault();
        // toggle active class
        const allLinks = nav.querySelectorAll('.menu-link');
        allLinks.forEach((ln) => ln.classList.remove('active'));
        a.classList.add('active');
        loadRecipe(recipe);
      });

      // make first recipe active by default
      if (index === 0 && !nav.querySelector('.menu-link.active')) {
        a.classList.add('active');
      }

      li.appendChild(a);
      ul.appendChild(li);
    });

    collectionDiv.appendChild(ul);
    nav.appendChild(collectionDiv);
  });

  return nav;
}

function loadRecipe(r : Recipe) {
  const targetArea = document.getElementById('display-area');
  if (!targetArea) return;

  const recipeElement = printRecipe(r);
  
  targetArea.replaceChildren(recipeElement);
}

async function initializeApp(): Promise<void> {
  const appRoot = document.getElementById('app') || document.body;

  appRoot.innerHTML = `
    <div class="recipe-app-layout">
      <aside id="sidebar-container">
        <button id="sidebar-toggle" class="sidebar-toggle" aria-label="Toggle sidebar">☰</button>
        <div id="sidebar-content"></div>
      </aside>
      <main id="display-area"></main>
    </div>
  `;

  const collections = await loadRecipeCollections();

  if (!collections || collections.length === 0) {
    const displayArea = document.getElementById('display-area');
    if (displayArea) displayArea.textContent = 'No recipe collections found.';
    return;
  }

  const sidebarContent = document.getElementById('sidebar-content');
  if (sidebarContent) {
    const sideMenuElement = createSideMenu(collections);
    sidebarContent.replaceChildren(sideMenuElement);
  }

  // Setup sidebar collapse/expand toggle
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar-container');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '☰';
    });
  }

  const firstCollection = collections[0];
  const firstRecipe = firstCollection.recipes[0];
  if (firstRecipe) {
    loadRecipe(firstRecipe);
  }
}

export default initializeApp;