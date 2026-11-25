// Sizzle Rush — game loop, state machine, interactions and scoring.
// One round: orders arrive on a seeded schedule, the chef fetches
// ingredients, chops and grills them, builds plates on the assembly
// counters and serves them at the window before patience runs out.

import { GAME, INGREDIENTS, recipeBaseScore, starsForScore } from './config.js';
import { makeRng } from './random.js';
import { STATIONS, solidRects, collide, stationDistance, interactables } from './world.js';
import { createOrderManager, resetOrderCounter } from './orders.js';
import { createInput } from './input.js';
import { createSound } from './sound.js';
import { drawKitchen, drawChef, drawHud, drawTitle, drawPause, drawGameOver } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = GAME.width;
const H = GAME.height;

const input = createInput(canvas);
const sound = createSound();
const rects = solidRects();

let seed = 7;
let runCount = 0;

function freshState() {
  const rng = makeRng(seed);
  resetOrderCounter();
  return {
    mode: 'title',
    rng,
    orders: createOrderManager(rng),
    chef: { x: 640, y: 520, r: GAME.chefRadius, faceX: 0, faceY: 1, moveTarget: null, pendingStation: null },
    holding: null,
    plates: { 'counter-a': { items: [] }, 'counter-b': { items: [] } },
    grill: [null, null],
    chop: { progress: 0, item: null },
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    lost: 0,
    wrongServes: 0,
    timeLeft: GAME.roundSeconds,
    elapsed: 0,
    toasts: [],
    prompt: '',
    nearest: null,
    plateReady: false,
    stars: 0,
    lastTickSecond: -1,
  };
}

let state = freshState();

function toast(text, color = '#ffe9b0') {
  state.toasts.push({ text, color, life: 2.4 });
  if (state.toasts.length > 3) state.toasts.shift();
}

function startRound() {
  runCount += 1;
  seed = 7 + runCount;
  state = freshState();
  state.mode = 'playing';
  state.orders.update(0, 0);
  toast('Lunch rush! First orders are coming in.', '#7dc242');
}

function endRound() {
  state.mode = 'over';
  state.stars = starsForScore(state.score);
  sound.bell();
}

function nearestStation() {
  let best = null;
  let bestD = 78;
  for (const s of interactables()) {
    const d = stationDistance(state.chef, s);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

function plateKey(items) {
  return items.slice().sort().join('|');
}

function heldPlateMatches() {
  if (!state.holding || state.holding.kind !== 'plate') return null;
  return state.orders.findMatch(state.holding.items);
}

function counterPlateMatches(counterId) {
  const plate = state.plates[counterId];
  if (!plate || plate.items.length === 0) return null;
  return state.orders.findMatch(plate.items);
}

function refreshPlateReady() {
  state.plateReady = !!heldPlateMatches()
    || !!counterPlateMatches('counter-a')
    || !!counterPlateMatches('counter-b');
}

function servePlate(items) {
  const match = state.orders.findMatch(items);
  if (!match) {
    state.score = Math.max(0, state.score - GAME.wrongServePenalty);
    state.combo = 0;
    state.wrongServes += 1;
    toast(`Wrong dish! No ticket wants that. -${GAME.wrongServePenalty}`, '#ff6b5e');
    sound.bad();
    return false;
  }
  const frac = state.orders.patienceFraction(match.order);
  const tip = Math.round(GAME.serveTipMax * frac);
  const comboBonus = state.combo * 15;
  const gained = recipeBaseScore(match.recipe) + tip + comboBonus;
  state.score += gained;
  state.coins += match.recipe.price + tip;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.served += 1;
  state.orders.remove(match.order);
  toast(`Served ${match.recipe.name}! +${gained}  (tip $${tip}${comboBonus ? `, combo +${comboBonus}` : ''})`, '#7dc242');
  sound.serve();
  return true;
}

function interact(station) {
  const holding = state.holding;
  switch (station.kind) {
    case 'crate': {
      if (holding) {
        toast('Hands full — serve or bin something first.', '#ff9f43');
        return;
      }
      state.holding = { kind: 'item', item: station.item, state: 'raw' };
      sound.pickup();
      break;
    }
    case 'plates': {
      if (holding) {
        toast('Hands full.', '#ff9f43');
        return;
      }
      state.holding = { kind: 'plate', items: [] };
      sound.pickup();
      break;
    }
    case 'bin': {
      if (!holding) return;
      state.holding = null;
      state.chop.progress = 0;
      sound.bad();
      toast('Binned.', '#c9b18a');
      break;
    }
    case 'board': {
      // Chopping is hold-to-work; a tap here just reminds the player.
      if (holding && holding.kind === 'item' && INGREDIENTS[holding.item].kind === 'chop' && holding.state === 'raw') {
        toast('Hold E at the board to chop.', '#ffe9b0');
      }
      break;
    }
    case 'grill': {
      if (holding && holding.kind === 'item' && INGREDIENTS[holding.item].kind === 'grill' && holding.state === 'raw') {
        const slot = state.grill[0] === null ? 0 : state.grill[1] === null ? 1 : -1;
        if (slot === -1) {
          toast('Grill is full!', '#ff9f43');
          return;
        }
        state.grill[slot] = { item: holding.item, t: 0, burnt: false };
        state.holding = null;
        sound.sizzle();
      } else if (!holding) {
        const slot = state.grill[0] && state.grill[0].t >= GAME.grillSeconds ? 0
          : state.grill[1] && state.grill[1].t >= GAME.grillSeconds ? 1 : -1;
        if (slot === -1) {
          toast('Nothing cooked on the grill yet.', '#c9b18a');
          return;
        }
        const g = state.grill[slot];
        state.holding = { kind: 'item', item: g.item, state: g.burnt ? 'burnt' : 'cooked' };
        state.grill[slot] = null;
        sound.pickup();
        if (state.holding.state === 'burnt') toast('Burnt! Bin it.', '#ff6b5e');
      }
      break;
    }
    case 'assembly': {
      const plate = state.plates[station.id];
      if (holding && holding.kind === 'item') {
        if (holding.state === 'burnt') {
          toast('Burnt food goes in the bin, not on a plate.', '#ff6b5e');
          return;
        }
        if (plate.items.length >= 4) {
          toast('Plate is full.', '#ff9f43');
          return;
        }
        plate.items.push(holding.state === 'raw' ? holding.item : `${holding.item}:${holding.state}`);
        state.holding = null;
        sound.pickup();
        refreshPlateReady();
      } else if (holding && holding.kind === 'plate') {
        if (plate.items.length > 0) {
          toast('That counter already has a plate.', '#ff9f43');
          return;
        }
        plate.items = holding.items;
        state.holding = null;
        sound.pickup();
        refreshPlateReady();
      } else if (!holding) {
        if (plate.items.length === 0) {
          toast('Nothing on this plate yet.', '#c9b18a');
          return;
        }
        state.holding = { kind: 'plate', items: plate.items };
        plate.items = [];
        sound.pickup();
        refreshPlateReady();
      }
      break;
    }
    case 'window': {
      if (holding && holding.kind === 'plate') {
        if (holding.items.length === 0) {
          toast('Empty plate — build a dish first.', '#ff9f43');
          return;
        }
        if (servePlate(holding.items)) state.holding = null;
        else state.holding = null;
        refreshPlateReady();
      } else {
        toast('Bring a finished plate to the window.', '#c9b18a');
      }
      break;
    }
    default:
      break;
  }
}

function promptFor(station) {
  const holding = state.holding;
  if (!station) return 'WASD / arrows to move — grab ingredients from the crates up top.';
  const itemName = (it) => INGREDIENTS[it]?.name ?? it;
  switch (station.kind) {
    case 'crate':
      return holding ? 'Hands full.' : `E — take ${itemName(station.item)}`;
    case 'plates':
      return holding ? 'Hands full.' : 'E — take a clean plate';
    case 'bin':
      return holding ? 'E — throw it away' : 'Bin: throw away spoiled food here.';
    case 'board':
      if (holding && holding.kind === 'item' && INGREDIENTS[holding.item].kind === 'chop' && holding.state === 'raw') {
        return `Hold E — chop the ${itemName(holding.item)}`;
      }
      return 'Chop board: bring lettuce, tomato or onion here.';
    case 'grill':
      if (holding && holding.kind === 'item' && INGREDIENTS[holding.item].kind === 'grill' && holding.state === 'raw') {
        return `E — grill the ${itemName(holding.item)} (6s, don't burn it)`;
      }
      if (!holding) return 'E — take cooked food off the grill';
      return 'Grill: patties, eggs and bacon cook here.';
    case 'assembly': {
      const plate = state.plates[station.id];
      if (holding && holding.kind === 'item') return `E — add ${itemName(holding.item)} to the plate`;
      if (holding && holding.kind === 'plate') return plate.items.length ? 'Counter busy.' : 'E — set the plate down';
      if (plate.items.length) {
        const match = counterPlateMatches(station.id);
        return match ? 'E — pick up the finished plate, then serve it!' : 'E — pick up the plate';
      }
      return 'Assembly counter: build dishes here.';
    }
    case 'window':
      if (holding && holding.kind === 'plate') {
        const match = heldPlateMatches();
        return match ? `E / Space — serve ${match.recipe.name}!` : 'E — serve (this plate matches no ticket!)';
      }
      return 'Service window: bring a finished plate here.';
    default:
      return '';
  }
}

function updatePlaying(dt) {
  state.elapsed += dt;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    endRound();
    return;
  }
  const second = Math.ceil(state.timeLeft);
  if (second !== state.lastTickSecond) {
    state.lastTickSecond = second;
    if (second <= 10) sound.tick();
  }

  // Orders.
  const expired = state.orders.update(dt, state.elapsed);
  for (const o of expired) {
    state.lost += 1;
    state.combo = 0;
    state.score = Math.max(0, state.score - GAME.expirePenalty);
    toast(`Order #${o.uid} walked out! -${GAME.expirePenalty}`, '#ff6b5e');
    sound.bad();
  }

  // Grill cooks; overcooking burns.
  for (const slot of state.grill) {
    if (!slot) continue;
    slot.t += dt;
    if (slot.t >= GAME.burnAfter && !slot.burnt) {
      slot.burnt = true;
      toast('Something is burning on the grill!', '#ff6b5e');
      sound.bad();
    }
  }

  // Movement: keys first, then click-to-walk. Each axis moves and
  // collides separately, so the chef slides along counters instead of
  // getting stuck on their corners.
  function moveChef(dx, dy) {
    chef.x += dx;
    collide(chef, rects);
    chef.y += dy;
    collide(chef, rects);
  }
  const mv = input.moveVector();
  const chef = state.chef;
  if (mv.x !== 0 || mv.y !== 0) {
    chef.moveTarget = null;
    chef.pendingStation = null;
    moveChef(mv.x * GAME.chefSpeed * dt, mv.y * GAME.chefSpeed * dt);
    chef.faceX = mv.x;
    chef.faceY = mv.y;
  } else if (chef.moveTarget) {
    const dx = chef.moveTarget.x - chef.x;
    const dy = chef.moveTarget.y - chef.y;
    const d = Math.hypot(dx, dy);
    // Arrived at a station: the chef stops one radius out from its edge,
    // which is still inside interaction range — use the station, don't
    // wait for the unreachable point on its edge.
    if (chef.pendingStation && stationDistance(chef, chef.pendingStation) < 70) {
      const st = chef.pendingStation;
      chef.pendingStation = null;
      chef.moveTarget = null;
      interact(st);
    } else if (d < 6) {
      chef.moveTarget = null;
      chef.pendingStation = null;
    } else {
      const step = GAME.chefSpeed * dt;
      moveChef((dx / d) * step, (dy / d) * step);
      chef.faceX = dx / d;
      chef.faceY = dy / d;
    }
  }

  // Click handling.
  const click = input.takeClick();
  if (click) {
    const hit = interactables().find((s) => click.x >= s.x && click.x <= s.x + s.w && click.y >= s.y && click.y <= s.y + s.h);
    if (hit) {
      if (stationDistance(chef, hit) < 90) interact(hit);
      else {
        // Walk to the station, then use it.
        const cx = Math.max(hit.x, Math.min(chef.x, hit.x + hit.w));
        const cy = Math.max(hit.y, Math.min(chef.y, hit.y + hit.h));
        chef.moveTarget = { x: cx, y: cy };
        chef.pendingStation = hit;
      }
    } else {
      chef.moveTarget = { x: click.x, y: click.y };
      chef.pendingStation = null;
    }
  }

  // Nearest station + prompts.
  state.nearest = nearestStation();

  // Chopping: hold E at the board with a choppable raw ingredient.
  const board = STATIONS.board;
  const holding = state.holding;
  const chopping = state.nearest && state.nearest.id === 'board'
    && holding && holding.kind === 'item'
    && INGREDIENTS[holding.item].kind === 'chop' && holding.state === 'raw'
    && input.isHeld('interact');
  if (chopping) {
    state.chop.progress += dt;
    state.chop.item = holding.item;
    if (Math.floor(state.chop.progress * 4) !== Math.floor((state.chop.progress - dt) * 4)) sound.chop();
    if (state.chop.progress >= GAME.chopSeconds) {
      holding.state = 'chopped';
      state.chop.progress = 0;
      toast(`${INGREDIENTS[holding.item].name} chopped!`, '#7dc242');
      sound.ding();
    }
  } else {
    state.chop.progress = 0;
    state.chop.item = null;
  }

  // Tap-to-interact (E) and serve (Space).
  if (input.wasPressed('interact') && state.nearest && !chopping) interact(state.nearest);
  if (input.wasPressed('serve')) {
    if (state.nearest && state.nearest.kind === 'window') interact(state.nearest);
    else if (state.nearest) interact(state.nearest);
  }
  if (input.wasPressed('trash') && state.holding) {
    state.holding = null;
    state.chop.progress = 0;
    toast('Binned.', '#c9b18a');
  }
  if (input.wasPressed('pause')) state.mode = 'paused';
  if (input.wasPressed('mute')) sound.toggleMute();
  if (input.wasPressed('restart')) startRound();

  state.prompt = promptFor(state.nearest);
  refreshPlateReady();

  // Toasts age out.
  for (const t of state.toasts) t.life -= dt;
  state.toasts = state.toasts.filter((t) => t.life > 0);
}

function update(dt) {
  if (input.wasPressed('mute')) sound.toggleMute();
  if (state.mode === 'title') {
    if (input.wasPressed('start') || input.takeClick()) startRound();
    return;
  }
  if (state.mode === 'paused') {
    if (input.wasPressed('pause') || input.wasPressed('start')) state.mode = 'playing';
    if (input.wasPressed('restart')) startRound();
    return;
  }
  if (state.mode === 'over') {
    if (input.wasPressed('restart') || input.wasPressed('start') || input.takeClick()) startRound();
    return;
  }
  updatePlaying(dt);
}

function render() {
  ctx.clearRect(0, 0, W, H);
  if (state.mode === 'title') {
    drawTitle(ctx, state);
    return;
  }
  drawKitchen(ctx, state);
  drawChef(ctx, state.chef, state.holding);
  // Chop progress ring above the board.
  if (state.chop.progress > 0 && state.chop.item) {
    const b = STATIONS.board;
    const cx = b.x + b.w / 2;
    const cy = b.y - 16;
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, 7);
    ctx.stroke();
    ctx.strokeStyle = '#7dc242';
    ctx.beginPath();
    ctx.arc(cx, cy, 16, -Math.PI / 2, -Math.PI / 2 + (state.chop.progress / GAME.chopSeconds) * Math.PI * 2);
    ctx.stroke();
  }
  drawHud(ctx, state);
  // Prompt bar + toasts.
  if (state.mode === 'playing') {
    ctx.fillStyle = 'rgba(20,14,8,0.88)';
    const lines = state.prompt ? [state.prompt] : [];
    if (lines.length) {
      const w = 520;
      const h = 34;
      ctx.beginPath();
      ctx.roundRect((W - w) / 2, H - h - 12, w, h, 10);
      ctx.fill();
      ctx.fillStyle = '#ffe9b0';
      ctx.font = '700 15px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lines[0], W / 2, H - h / 2 - 12 + 1);
    }
    state.toasts.forEach((t, i) => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, t.life);
      ctx.fillStyle = t.color;
      ctx.font = '700 20px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.text, W / 2, 208 + i * 28);
      ctx.restore();
    });
  }
  if (state.mode === 'paused') drawPause(ctx);
  if (state.mode === 'over') drawGameOver(ctx, state);
}

// Deterministic screenshot scenes (?shot=...&seed=...), real game states.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
if (Number.isInteger(seedParam) && seedParam > 0) seed = seedParam;
if (shot) {
  state = freshState();
  applyShot(state, shot, { startRound, servePlate, toast });
}

// Expose a small read-only handle for automated play-testing.
window.__game = {
  get state() {
    return state;
  },
  start: startRound,
  interact: (stationId) => {
    const s = interactables().find((x) => x.id === stationId);
    if (s) interact(s);
  },
};

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  update(dt);
  render();
  input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
