// Use Vite's glob import to bundle recipe JSON files for the browser

type Recipe = {
  name: string;
  ingredients: NamedList[] | string[];
  steps: string[];
  reference?: Reference;
}

type NamedList = {
  name: string;
  items: string[];
}

type RecipeCollection = {
  heading: string;
  recipes: Recipe[];
}
type Reference = {
  author: string;
  weblink: string;
}

function createIngredientsTable(ingredients: Recipe['ingredients']): HTMLTableElement {
  const table = document.createElement('table');
  table.className = 'recipe-ingredients-table';

  const colgroup = document.createElement('colgroup');
  const columnCount = ingredients.length > 0 && typeof ingredients[0] === 'object'
    ? (ingredients as NamedList[]).length
    : 1;

  for (let index = 0; index < columnCount; index++) {
    const col = document.createElement('col');
    col.style.width = `${100 / columnCount}%`;
    colgroup.appendChild(col);
  }

  table.appendChild(colgroup);

  const tbody = document.createElement('tbody');

  if (ingredients.length > 0 && typeof ingredients[0] === 'object') {
    const sections = ingredients as NamedList[];

    const headerRow = document.createElement('tr');
    sections.forEach((section) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = section.name;
      headerRow.appendChild(th);
    });
    tbody.appendChild(headerRow);

    const row = document.createElement('tr');

    sections.forEach((section) => {
      const cell = document.createElement('td');
      const list = document.createElement('ul');

      section.items.forEach((value) => {
        const item = document.createElement('li');
        item.textContent = value;
        list.appendChild(item);
      });

      cell.appendChild(list);
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  } else {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    const list = document.createElement('ul');

    (ingredients as string[]).forEach((value) => {
      const item = document.createElement('li');
      item.textContent = value;
      list.appendChild(item);
    });

    cell.appendChild(list);
    row.appendChild(cell);
    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  return table;
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

  ingredientsSection.appendChild(createIngredientsTable(r.ingredients));

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

  if (r.reference) {
    const referenceSection = document.createElement('div');
    referenceSection.className = 'paperSection';
    referenceSection.style.display = 'flex';
    referenceSection.style.flexDirection = 'row';
    

    const referenceHeading = document.createElement('h2');
    referenceHeading.textContent = 'Credit';
    referenceHeading.style.marginRight = '10px';
    referenceSection.appendChild(referenceHeading);

    const referenceContent = document.createElement('p');
    referenceContent.innerHTML = `<b>Author</b>: ${r.reference.author} <br> <b>Link</b>: <a href="${r.reference.weblink}" target="_blank">${r.reference.weblink}</a>`;
    referenceSection.appendChild(referenceContent);

    container.appendChild(referenceSection);
  }

  return container;
}

async function loadRecipeCollections(): Promise<RecipeCollection[]> {
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