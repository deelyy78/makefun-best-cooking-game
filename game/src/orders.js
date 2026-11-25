// Sizzle Rush — orders: the ticket rail, patience, spawning.
// An order is a recipe plus a patience bar; serve the matching plate
// before patience runs out. Spawning follows the seeded deck, so the
// same seed always serves the same lunch rush.

import { GAME, RECIPES } from './config.js';

let orderSeq = 0;

export function makeOrderDeck(rng) {
  // A shuffled deck of recipe ids, reshuffled when exhausted.
  let deck = [];
  return {
    next() {
      if (deck.length === 0) deck = rng.shuffle(RECIPES.map((r) => r.id));
      return deck.pop();
    },
  };
}

export function createOrderManager(rng) {
  const deck = makeOrderDeck(rng);
  const orders = [];
  let spawnTimer = 2.5;

  function spawn() {
    if (orders.length >= GAME.maxOrders) return;
    const id = deck.next();
    orderSeq += 1;
    orders.push({
      uid: orderSeq,
      recipeId: id,
      patience: GAME.orderPatience,
      maxPatience: GAME.orderPatience,
      bornAt: 0,
    });
  }

  return {
    orders,
    update(dt, elapsed) {
      spawnTimer -= dt;
      const every = elapsed > GAME.rushAfter ? GAME.spawnEveryRush : GAME.spawnEvery;
      if (spawnTimer <= 0) {
        spawn();
        spawnTimer = every;
      }
      const expired = [];
      for (const o of orders) {
        o.patience -= dt;
        if (o.patience <= 0) expired.push(o);
      }
      for (const o of expired) {
        const i = orders.indexOf(o);
        if (i >= 0) orders.splice(i, 1);
      }
      return expired;
    },
    // The open order whose recipe matches this plate's contents, if any.
    findMatch(plateItems) {
      const want = plateItems.slice().sort().join('|');
      for (const o of orders) {
        const recipe = RECIPES.find((r) => r.id === o.recipeId);
        if (recipe.needs.slice().sort().join('|') === want) return { order: o, recipe };
      }
      return null;
    },
    remove(order) {
      const i = orders.indexOf(order);
      if (i >= 0) orders.splice(i, 1);
    },
    // Patience fraction left (1 = fresh, 0 = about to walk out).
    patienceFraction(order) {
      return Math.max(0, order.patience / order.maxPatience);
    },
  };
}

// Reset the global order counter (a fresh round starts at ticket #1).
export function resetOrderCounter() {
  orderSeq = 0;
}
