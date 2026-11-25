// Sizzle Rush — all canvas drawing: the kitchen, the food, the chef,
// the order board, the timer and the screens. Every sprite is drawn
// from shapes here; the game ships no image assets.

import { GAME, INGREDIENTS, RECIPE_BY_ID } from './config.js';
import { STATIONS } from './world.js';

const W = GAME.width;
const H = GAME.height;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'center', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// --- Ingredient icons (vector, one per catalogue entry) -----------------
export function drawIngredientIcon(ctx, item, state, x, y, s) {
  const def = INGREDIENTS[item];
  if (!def) return;
  const u = s / 40;
  ctx.save();
  ctx.translate(x, y);
  if (item === 'bun') {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(0, 2 * u, 17 * u, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = def.dark;
    ctx.fillRect(-17 * u, 0, 34 * u, 5 * u);
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(-6 * u, -7 * u, 1.6 * u, 0, 7);
    ctx.arc(5 * u, -9 * u, 1.6 * u, 0, 7);
    ctx.fill();
  } else if (item === 'patty') {
    ctx.fillStyle = state === 'cooked' ? '#6e4526' : state === 'burnt' ? '#2e1c12' : def.color;
    rr(ctx, -17 * u, -7 * u, 34 * u, 14 * u, 7 * u);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(i * 6 * u, (i % 2 ? -2 : 2) * u, 1.4 * u, 0, 7);
      ctx.fill();
    }
    if (state === 'cooked') {
      ctx.strokeStyle = '#ffb347';
      ctx.lineWidth = 2 * u;
      ctx.beginPath();
      ctx.moveTo(-12 * u, -8 * u);
      ctx.lineTo(12 * u, -8 * u);
      ctx.stroke();
    }
  } else if (item === 'lettuce') {
    ctx.fillStyle = state === 'chopped' ? '#8fd45a' : def.color;
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const r = 15 * u + (i % 2 ? 3 * u : 0);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = def.dark;
    ctx.lineWidth = 1.5 * u;
    ctx.beginPath();
    ctx.moveTo(0, -12 * u);
    ctx.lineTo(0, 12 * u);
    ctx.moveTo(-11 * u, 0);
    ctx.lineTo(11 * u, 0);
    ctx.stroke();
  } else if (item === 'tomato') {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(0, 1 * u, 15 * u, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#3f9e3f';
    ctx.beginPath();
    ctx.moveTo(0, -13 * u);
    ctx.lineTo(-6 * u, -6 * u);
    ctx.lineTo(0, -9 * u);
    ctx.lineTo(6 * u, -6 * u);
    ctx.closePath();
    ctx.fill();
    if (state === 'chopped') {
      ctx.fillStyle = '#ff8a7a';
      ctx.beginPath();
      ctx.arc(-4 * u, 2 * u, 6 * u, 0, 7);
      ctx.arc(5 * u, 3 * u, 5 * u, 0, 7);
      ctx.fill();
    }
  } else if (item === 'cheese') {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.moveTo(-16 * u, 10 * u);
    ctx.lineTo(16 * u, 10 * u);
    ctx.lineTo(16 * u, -2 * u);
    ctx.lineTo(-16 * u, -10 * u);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = def.dark;
    ctx.beginPath();
    ctx.arc(-5 * u, 2 * u, 2 * u, 0, 7);
    ctx.arc(6 * u, 4 * u, 2 * u, 0, 7);
    ctx.arc(8 * u, -3 * u, 1.6 * u, 0, 7);
    ctx.fill();
  } else if (item === 'onion') {
    ctx.fillStyle = '#efe6f7';
    ctx.beginPath();
    ctx.arc(0, 0, 15 * u, 0, 7);
    ctx.fill();
    ctx.strokeStyle = def.dark;
    ctx.lineWidth = 1.6 * u;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, (5 + i * 4) * u, 0.3, Math.PI - 0.3);
      ctx.stroke();
    }
    ctx.fillStyle = '#7fc24a';
    ctx.beginPath();
    ctx.moveTo(0, -14 * u);
    ctx.lineTo(-3 * u, -22 * u);
    ctx.lineTo(3 * u, -22 * u);
    ctx.closePath();
    ctx.fill();
  } else if (item === 'egg') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 16 * u, 0, 7);
    ctx.fill();
    ctx.fillStyle = state === 'cooked' ? '#f6c945' : '#f6e27a';
    ctx.beginPath();
    ctx.arc(2 * u, 1 * u, 7 * u, 0, 7);
    ctx.fill();
  } else if (item === 'bacon') {
    ctx.strokeStyle = state === 'cooked' ? '#a03d33' : def.color;
    ctx.lineWidth = 7 * u;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14 * u, -6 * u);
    ctx.quadraticCurveTo(0, 8 * u, 14 * u, -6 * u);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-14 * u, 6 * u);
    ctx.quadraticCurveTo(0, 18 * u, 14 * u, 6 * u);
    ctx.stroke();
  }
  ctx.restore();
}

// --- The kitchen ---------------------------------------------------------
function drawFloor(ctx) {
  ctx.fillStyle = '#e9d8b8';
  ctx.fillRect(0, 92, W, H - 92);
  ctx.fillStyle = '#e2cda6';
  const tile = 64;
  for (let y = 92; y < H; y += tile) {
    for (let x = 0; x < W; x += tile) {
      if (((x / tile + y / tile) | 0) % 2 === 0) ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fillRect(0, 92, W, 4);
}

function drawCrate(ctx, crate, highlight) {
  const { x, y, w, h } = crate;
  ctx.fillStyle = highlight ? '#ffe9b0' : '#c98f4e';
  rr(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = '#a96f33';
  ctx.fillRect(x + 4, y + h - 12, w - 8, 8);
  drawIngredientIcon(ctx, crate.item, 'raw', x + w / 2, y + h / 2 - 6, 34);
  text(ctx, crate.label, x + w / 2, y + h - 20, 12, '#5d3a1a');
}

function drawStationBase(ctx, rect, top, side, label, highlight) {
  ctx.fillStyle = highlight ? '#ffe9b0' : side;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = top;
  rr(ctx, rect.x + 4, rect.y + 4, rect.w - 8, 18, 6);
  ctx.fill();
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h - 14, 13, '#4a3220');
}

export function drawKitchen(ctx, state) {
  drawFloor(ctx);
  const near = state.nearest ? state.nearest.id : null;
  for (const c of STATIONS.crates) drawCrate(ctx, c, near === c.id);
  const b = STATIONS.board;
  drawStationBase(ctx, b, '#f3e2c2', '#b98a5a', 'CHOP BOARD', near === b.id);
  // Knife + chopped bits on the board.
  ctx.strokeStyle = '#8a8f98';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(b.x + 30, b.y + 55);
  ctx.lineTo(b.x + 95, b.y + 40);
  ctx.stroke();
  ctx.fillStyle = '#7dc242';
  ctx.beginPath();
  ctx.arc(b.x + 110, b.y + 70, 7, 0, 7);
  ctx.arc(b.x + 126, b.y + 78, 5, 0, 7);
  ctx.fill();
  const bin = STATIONS.bin;
  drawStationBase(ctx, bin, '#9aa5ad', '#6b7a82', 'BIN', near === bin.id);
  ctx.fillStyle = '#3d4a51';
  rr(ctx, bin.x + 18, bin.y + 30, bin.w - 36, 26, 4);
  ctx.fill();
  const pl = STATIONS.plates;
  drawStationBase(ctx, pl, '#f3e2c2', '#b98a5a', 'PLATES', near === pl.id);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(pl.x + pl.w / 2, pl.y + 34 + i * 12, 34, 7, 0, 0, 7);
    ctx.fill();
    ctx.strokeStyle = '#c9d4dc';
    ctx.stroke();
  }
  // Assembly counters with their plates.
  for (const a of STATIONS.assembly) {
    drawStationBase(ctx, a, '#e8eef2', '#8fa3ad', a.label, near === a.id);
    const plate = state.plates[a.id];
    if (plate && plate.items.length > 0) drawPlate(ctx, plate.items, a.x + a.w / 2, a.y + a.h / 2 + 4, 44);
    else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(a.x + a.w / 2, a.y + a.h / 2 + 4, 34, 9, 0, 0, 7);
      ctx.fill();
      ctx.strokeStyle = '#c9d4dc';
      ctx.stroke();
    }
  }
  // Grill with two slots.
  const g = STATIONS.grill;
  drawStationBase(ctx, g, '#3a3f46', '#22262b', 'GRILL', near === g.id);
  for (let i = 0; i < 2; i++) {
    const sx = g.x + 24 + i * 68;
    const sy = g.y + 52;
    ctx.fillStyle = '#17191c';
    rr(ctx, sx, sy, 56, 56, 8);
    ctx.fill();
    const slot = state.grill[i];
    if (slot) {
      const cooked = Math.min(1, slot.t / 6);
      drawIngredientIcon(ctx, slot.item, slot.burnt ? 'burnt' : cooked >= 1 ? 'cooked' : 'raw', sx + 28, sy + 28, 36);
      ctx.fillStyle = slot.burnt ? '#e84a3a' : '#f7c948';
      ctx.fillRect(sx + 4, sy + 62, 48 * Math.min(1, slot.t / 12), 5);
    }
    // Grill bars.
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 2;
    for (let k = 1; k < 4; k++) {
      ctx.beginPath();
      ctx.moveTo(sx + 4, sy + k * 14);
      ctx.lineTo(sx + 52, sy + k * 14);
      ctx.stroke();
    }
  }
  // Service window.
  const win = STATIONS.window;
  const winGlow = state.plateReady;
  ctx.fillStyle = winGlow ? '#ffe9b0' : '#7a5c3e';
  rr(ctx, win.x, win.y, win.w, win.h, 10);
  ctx.fill();
  ctx.fillStyle = '#f7ead0';
  rr(ctx, win.x + 6, win.y + 6, win.w - 12, 30, 6);
  ctx.fill();
  text(ctx, 'SERVE  •  WINDOW', win.x + win.w / 2, win.y + 22, 14, '#7a4a1a');
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(win.x + 10, win.y + 44, win.w - 20, 6);
  if (winGlow) {
    ctx.fillStyle = '#2f7d32';
    text(ctx, 'PLATE READY — SERVE IT!', win.x + win.w / 2, win.y + 66, 15, '#2f7d32');
  } else {
    text(ctx, 'bring a finished plate here', win.x + win.w / 2, win.y + 66, 12, '#e8d9bd');
  }
}

// A plate with its stacked ingredients, drawn from the side.
export function drawPlate(ctx, items, x, y, size) {
  const u = size / 44;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(x, y, 26 * u, 8 * u, 0, 0, 7);
  ctx.fill();
  ctx.strokeStyle = '#c9d4dc';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  items.forEach((entry, i) => {
    const [item, state] = entry.split(':');
    drawIngredientIcon(ctx, item, state || 'raw', x, y - 8 * u - i * 9 * u, 30);
  });
}

// --- The chef -------------------------------------------------------------
export function drawChef(ctx, chef, holding) {
  ctx.save();
  ctx.translate(chef.x, chef.y);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 16, 20, 7, 0, 0, 7);
  ctx.fill();
  // Body / apron.
  ctx.fillStyle = '#f2f2f2';
  ctx.beginPath();
  ctx.arc(0, 2, 17, 0, 7);
  ctx.fill();
  ctx.fillStyle = '#3f7fd0';
  rr(ctx, -12, -2, 24, 16, 6);
  ctx.fill();
  // Head + toque.
  ctx.fillStyle = '#f6c89f';
  ctx.beginPath();
  ctx.arc(0, -16, 11, 0, 7);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-6, -26, 7, 0, 7);
  ctx.arc(0, -29, 8, 0, 7);
  ctx.arc(6, -26, 7, 0, 7);
  ctx.fill();
  ctx.fillRect(-11, -28, 22, 6);
  // Eyes look toward movement.
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(-4 + chef.faceX * 2, -16, 1.8, 0, 7);
  ctx.arc(4 + chef.faceX * 2, -16, 1.8, 0, 7);
  ctx.fill();
  ctx.restore();
  // Held item floats above the chef's hands.
  if (holding) {
    if (holding.kind === 'plate') {
      drawPlate(ctx, holding.items, chef.x, chef.y - 34, 36);
    } else {
      drawIngredientIcon(ctx, holding.item, holding.state, chef.x, chef.y - 34, 34);
    }
  }
}

// --- Order board + HUD -----------------------------------------------------
function drawTicket(ctx, order, x, y, w, h) {
  const recipe = RECIPE_BY_ID[order.recipeId];
  const frac = Math.max(0, order.patience / order.maxPatience);
  ctx.fillStyle = '#fffaf0';
  rr(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = frac < 0.3 ? '#e84a3a' : '#d8c49a';
  ctx.lineWidth = frac < 0.3 ? 3 : 1.5;
  ctx.stroke();
  text(ctx, `#${order.uid} ${recipe.name}`, x + 10, y + 14, 13, '#4a3220', 'left');
  text(ctx, `$${recipe.price}`, x + w - 10, y + 14, 13, '#2f7d32', 'right');
  recipe.needs.forEach((need, i) => {
    const [item, st] = need.split(':');
    drawIngredientIcon(ctx, item, st || 'raw', x + 22 + i * 34, y + 40, 26);
  });
  // Patience bar.
  ctx.fillStyle = '#e8dcc2';
  rr(ctx, x + 10, y + h - 14, w - 20, 7, 3);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#7dc242' : frac > 0.25 ? '#f7c948' : '#e84a3a';
  rr(ctx, x + 10, y + h - 14, (w - 20) * frac, 7, 3);
  ctx.fill();
}

export function drawHud(ctx, state) {
  // Top strip.
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(0, 0, W, 92);
  ctx.fillStyle = '#3a2d20';
  ctx.fillRect(0, 88, W, 4);
  text(ctx, 'SIZZLE RUSH', 16, 24, 22, '#ffd166', 'left');
  text(ctx, 'lunch-rush kitchen', 16, 48, 12, '#c9b18a', 'left');
  // Order tickets.
  state.orders.orders.forEach((o, i) => drawTicket(ctx, o, 210 + i * 200, 8, 188, 76));
  if (state.orders.orders.length === 0) {
    text(ctx, 'No orders yet — the lunch rush is coming…', 300, 46, 14, '#c9b18a', 'left');
  }
  // Timer.
  const t = Math.max(0, Math.ceil(state.timeLeft));
  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(t % 60).padStart(2, '0');
  const urgent = t <= 15;
  text(ctx, `${mm}:${ss}`, 1130, 30, 34, urgent ? '#ff6b5e' : '#ffffff');
  text(ctx, 'TIME LEFT', 1130, 58, 11, '#c9b18a');
  ctx.fillStyle = '#4a3a28';
  rr(ctx, 1030, 72, 200, 8, 4);
  ctx.fill();
  ctx.fillStyle = urgent ? '#ff6b5e' : '#7dc242';
  rr(ctx, 1030, 72, 200 * (state.timeLeft / GAME.roundSeconds), 8, 4);
  ctx.fill();
  // Score / coins / combo.
  text(ctx, `SCORE ${state.score}`, 1010, 24, 18, '#ffd166', 'right');
  text(ctx, `COINS $${state.coins}`, 1010, 48, 14, '#ffffff', 'right');
  if (state.combo >= 2) text(ctx, `COMBO x${state.combo}`, 1010, 70, 14, '#ff9f43', 'right');
  text(ctx, `TARGET ${GAME.targetScore}`, 880, 24, 13, '#c9b18a', 'right');
  // Progress to target.
  ctx.fillStyle = '#4a3a28';
  rr(ctx, 800, 36, 110, 8, 4);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  rr(ctx, 800, 36, 110 * Math.min(1, state.score / GAME.targetScore), 8, 4);
  ctx.fill();
}

// --- Screens ---------------------------------------------------------------
function overlay(ctx, alpha) {
  ctx.fillStyle = `rgba(20,12,6,${alpha})`;
  ctx.fillRect(0, 0, W, H);
}

export function drawTitle(ctx, state) {
  drawKitchen(ctx, state);
  drawHud(ctx, state);
  overlay(ctx, 0.55);
  text(ctx, 'SIZZLE RUSH', W / 2, 190, 72, '#ffd166');
  text(ctx, 'a lunch-rush cooking game', W / 2, 250, 22, '#ffffff');
  text(ctx, 'Orders are coming in. Chop it, grill it, plate it, serve it — before the timer runs out.', W / 2, 300, 17, '#ffe9b0');
  const recipes = ['Classic Burger', 'Cheese Melt', 'Garden Salad', 'Sunrise Stack', 'Veggie Crunch'];
  text(ctx, 'On the menu: ' + recipes.join('  •  '), W / 2, 340, 16, '#c9b18a');
  text(ctx, 'WASD / arrows — move      E — pick up / chop / grill / plate      Q — bin it', W / 2, 400, 17, '#ffffff');
  text(ctx, 'Mouse — click to walk, click a station to use it      P — pause      M — mute', W / 2, 430, 17, '#ffffff');
  text(ctx, 'Serve the right dish while the ticket is still patient — tips shrink as patience drains.', W / 2, 470, 15, '#ffe9b0');
  text(ctx, 'PRESS ENTER OR CLICK TO START', W / 2, 540, 22, '#7dc242');
  text(ctx, `Round: ${GAME.roundSeconds}s  •  Target: ${GAME.targetScore} points  •  Seeded orders, same rush every time`, W / 2, 580, 14, '#c9b18a');
}

export function drawPause(ctx) {
  overlay(ctx, 0.5);
  text(ctx, 'PAUSED', W / 2, 320, 54, '#ffffff');
  text(ctx, 'Press P or Esc to keep cooking', W / 2, 380, 18, '#ffe9b0');
}

export function drawGameOver(ctx, state) {
  overlay(ctx, 0.62);
  const won = state.score >= GAME.targetScore;
  text(ctx, won ? 'SERVICE COMPLETE!' : 'SHIFT OVER', W / 2, 170, 54, won ? '#7dc242' : '#ffd166');
  text(ctx, `You served ${state.served} dish${state.served === 1 ? '' : 'es'} and earned ${state.score} points (${state.coins} coins).`, W / 2, 240, 20, '#ffffff');
  text(ctx, won ? `Target ${GAME.targetScore} beaten — the lunch rush is yours!` : `Target was ${GAME.targetScore} — so close. The rush will wait for a rematch.`, W / 2, 275, 17, '#ffe9b0');
  // Stars.
  const stars = state.stars;
  for (let i = 0; i < 3; i++) {
    const x = W / 2 + (i - 1) * 70;
    ctx.fillStyle = i < stars ? '#ffd166' : 'rgba(255,255,255,0.25)';
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', x, 350);
  }
  text(ctx, `Best combo x${state.bestCombo}   •   Orders lost: ${state.lost}   •   Wrong serves: ${state.wrongServes}`, W / 2, 420, 16, '#c9b18a');
  text(ctx, 'Press R or click to cook again', W / 2, 500, 22, '#7dc242');
}
