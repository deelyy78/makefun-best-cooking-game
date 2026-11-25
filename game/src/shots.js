// Sizzle Rush — deterministic screenshot scenes.
// ?shot=start|cover|rush|end&seed=1 stages a real game state (the same
// code path the player reaches by playing) so screenshots are renders
// of the game itself, never mockups.

import { GAME, starsForScore } from './config.js';

function ticket(state, uid, recipeId, patienceFrac) {
  state.orders.orders.push({
    uid,
    recipeId,
    patience: 70 * patienceFrac,
    maxPatience: 70,
    bornAt: 0,
  });
}

export function applyShot(state, shot) {
  if (shot === 'start') {
    // Title screen over the empty kitchen; nothing to stage.
    state.mode = 'title';
    return;
  }

  if (shot === 'cover') {
    // The money shot: full order board, ingredients on the counters,
    // a burger mid-assembly, a finished salad ready to serve, the
    // grill sizzling and the timer running.
    state.mode = 'playing';
    state.elapsed = 78;
    state.timeLeft = 72;
    state.score = 340;
    state.coins = 260;
    state.combo = 2;
    state.bestCombo = 3;
    state.served = 3;
    ticket(state, 4, 'classic-burger', 0.62);
    ticket(state, 5, 'cheese-melt', 0.82);
    ticket(state, 6, 'garden-salad', 0.38);
    state.chef.x = 600;
    state.chef.y = 470;
    state.chef.faceX = 0;
    state.chef.faceY = -1;
    state.holding = { kind: 'item', item: 'tomato', state: 'chopped' };
    state.plates['counter-a'].items = ['bun', 'patty:cooked'];
    state.plates['counter-b'].items = ['lettuce:chopped', 'tomato:chopped', 'onion:chopped', 'cheese'];
    state.grill[0] = { item: 'patty', t: 4, burnt: false };
    state.grill[1] = { item: 'bacon', t: 6.5, burnt: false };
    state.prompt = 'E — add chopped tomato to the plate';
    state.nearest = { id: 'counter-a', kind: 'assembly', x: 480, y: 330, w: 150, h: 96 };
    return;
  }

  if (shot === 'rush') {
    // The final minute: timer nearly gone, tickets nearly out of
    // patience, grill full, a finished burger waiting on the counter.
    state.mode = 'playing';
    state.elapsed = 132;
    state.timeLeft = 18;
    state.score = 820;
    state.coins = 640;
    state.combo = 4;
    state.bestCombo = 4;
    state.served = 7;
    ticket(state, 9, 'sunrise-stack', 0.28);
    ticket(state, 10, 'classic-burger', 0.45);
    ticket(state, 11, 'veggie-crunch', 0.18);
    state.chef.x = 1060;
    state.chef.y = 470;
    state.chef.faceX = 1;
    state.chef.faceY = 0;
    state.holding = { kind: 'item', item: 'patty', state: 'cooked' };
    state.plates['counter-a'].items = ['bun', 'patty:cooked', 'lettuce:chopped', 'tomato:chopped'];
    state.plates['counter-b'].items = ['bun', 'egg:cooked'];
    state.grill[0] = { item: 'bacon', t: 5, burnt: false };
    state.grill[1] = { item: 'egg', t: 11, burnt: false };
    state.prompt = 'E — add the cooked patty, then serve the burger!';
    state.nearest = { id: 'counter-a', kind: 'assembly', x: 480, y: 330, w: 150, h: 96 };
    return;
  }

  if (shot === 'end') {
    // Results screen after a winning shift.
    state.mode = 'over';
    state.elapsed = GAME.roundSeconds;
    state.timeLeft = 0;
    state.score = 1240;
    state.coins = 980;
    state.combo = 0;
    state.bestCombo = 5;
    state.served = 9;
    state.lost = 1;
    state.wrongServes = 0;
    state.stars = starsForScore(state.score);
    return;
  }
}
