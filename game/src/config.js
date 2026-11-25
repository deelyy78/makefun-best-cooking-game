// Sizzle Rush — game configuration: recipes, ingredients, tuning.
// Every ingredient is an original drawing; every recipe is this game's own.

export const GAME = {
  width: 1280,
  height: 720,
  roundSeconds: 150,
  targetScore: 900,
  maxOrders: 3,
  orderPatience: 70,
  spawnEvery: 16,
  rushAfter: 75,
  spawnEveryRush: 11,
  chefSpeed: 265,
  chefRadius: 19,
  chopSeconds: 1.6,
  grillSeconds: 6,
  burnAfter: 12,
  serveTipMax: 40,
  wrongServePenalty: 25,
  expirePenalty: 30,
};

// Ingredient catalogue. kind: 'raw' (usable as-is) | 'chop' (needs the board)
// | 'grill' (needs the grill). state flows raw -> chopped / cooked.
export const INGREDIENTS = {
  bun:     { name: 'Bun',     kind: 'raw',   color: '#e8b25c', dark: '#b97f2e' },
  patty:   { name: 'Patty',   kind: 'grill', color: '#8a5a3b', dark: '#5d3a24' },
  lettuce: { name: 'Lettuce', kind: 'chop',  color: '#7dc242', dark: '#4e8a24' },
  tomato:  { name: 'Tomato',  kind: 'chop',  color: '#e84a3a', dark: '#a92c20' },
  cheese:  { name: 'Cheese',  kind: 'raw',   color: '#f7c948', dark: '#c79a1d' },
  onion:   { name: 'Onion',   kind: 'chop',  color: '#c9a0dc', dark: '#8a63a3' },
  egg:     { name: 'Egg',     kind: 'grill', color: '#f6e27a', dark: '#c9a83c' },
  bacon:   { name: 'Bacon',   kind: 'grill', color: '#d96a5f', dark: '#a03d33' },
};

// Recipes: the exact multiset of prepared ingredients a plate must hold.
// `needs` uses prepared forms: 'bun', 'patty:cooked', 'lettuce:chopped', ...
export const RECIPES = [
  {
    id: 'classic-burger',
    name: 'Classic Burger',
    price: 120,
    needs: ['bun', 'patty:cooked', 'lettuce:chopped', 'tomato:chopped'],
  },
  {
    id: 'cheese-melt',
    name: 'Cheese Melt',
    price: 140,
    needs: ['bun', 'patty:cooked', 'cheese', 'bacon:cooked'],
  },
  {
    id: 'garden-salad',
    name: 'Garden Salad',
    price: 90,
    needs: ['lettuce:chopped', 'tomato:chopped', 'onion:chopped', 'cheese'],
  },
  {
    id: 'sunrise-stack',
    name: 'Sunrise Stack',
    price: 160,
    needs: ['bun', 'egg:cooked', 'bacon:cooked', 'cheese'],
  },
  {
    id: 'veggie-crunch',
    name: 'Veggie Crunch',
    price: 100,
    needs: ['bun', 'lettuce:chopped', 'tomato:chopped', 'onion:chopped'],
  },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

// Points for a perfect serve, before tip and combo.
export function recipeBaseScore(recipe) {
  return recipe.price;
}

// Star thresholds on final score.
export function starsForScore(score) {
  if (score >= 1400) return 3;
  if (score >= GAME.targetScore) return 2;
  if (score >= 500) return 1;
  return 0;
}
