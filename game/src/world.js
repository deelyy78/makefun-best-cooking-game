// Sizzle Rush — the kitchen: stations, walls and collision.
// Layout (1280x720 canvas; HUD strip occupies y 0..92):
//   top wall: pantry crates (one per ingredient)
//   left wall: chopping board + bin
//   centre: two assembly counters with plates
//   right wall: grill with two slots
//   bottom right: service window, bottom left: clean-plate stack

export const STATIONS = {
  crates: [
    { id: 'crate-bun',     item: 'bun',     x: 30,  y: 108, w: 92, h: 74, label: 'BUN' },
    { id: 'crate-patty',   item: 'patty',   x: 132, y: 108, w: 92, h: 74, label: 'PATTY' },
    { id: 'crate-lettuce', item: 'lettuce', x: 234, y: 108, w: 92, h: 74, label: 'LETTUCE' },
    { id: 'crate-tomato',  item: 'tomato',  x: 336, y: 108, w: 92, h: 74, label: 'TOMATO' },
    { id: 'crate-cheese',  item: 'cheese',  x: 438, y: 108, w: 92, h: 74, label: 'CHEESE' },
    { id: 'crate-onion',   item: 'onion',   x: 540, y: 108, w: 92, h: 74, label: 'ONION' },
    { id: 'crate-egg',     item: 'egg',     x: 642, y: 108, w: 92, h: 74, label: 'EGG' },
    { id: 'crate-bacon',   item: 'bacon',   x: 744, y: 108, w: 92, h: 74, label: 'BACON' },
  ],
  board: { id: 'board', x: 30, y: 300, w: 150, h: 110, label: 'CHOP' },
  bin: { id: 'bin', x: 30, y: 440, w: 90, h: 90, label: 'BIN' },
  plates: { id: 'plates', x: 30, y: 560, w: 110, h: 90, label: 'PLATES' },
  assembly: [
    { id: 'counter-a', x: 480, y: 330, w: 150, h: 96, label: 'PLATE A' },
    { id: 'counter-b', x: 660, y: 330, w: 150, h: 96, label: 'PLATE B' },
  ],
  grill: { id: 'grill', x: 1090, y: 240, w: 160, h: 170, label: 'GRILL' },
  window: { id: 'window', x: 1000, y: 600, w: 250, h: 100, label: 'SERVE' },
};

// Every solid rectangle the chef cannot walk through.
export function solidRects() {
  const rects = [];
  for (const c of STATIONS.crates) rects.push({ x: c.x, y: c.y, w: c.w, h: c.h });
  rects.push(STATIONS.board, STATIONS.bin, STATIONS.plates);
  for (const a of STATIONS.assembly) rects.push(a);
  rects.push(STATIONS.grill, STATIONS.window);
  // Outer walls (HUD strip is a wall too).
  rects.push({ x: 0, y: 0, w: 1280, h: 92 });
  rects.push({ x: 0, y: 0, w: 14, h: 720 });
  rects.push({ x: 1266, y: 0, w: 14, h: 720 });
  rects.push({ x: 0, y: 706, w: 1280, h: 14 });
  return rects;
}

// Circle-vs-rectangle collision: push the chef out of every solid rect.
export function collide(chef, rects) {
  for (const r of rects) {
    const cx = Math.max(r.x, Math.min(chef.x, r.x + r.w));
    const cy = Math.max(r.y, Math.min(chef.y, r.y + r.h));
    const dx = chef.x - cx;
    const dy = chef.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < chef.r * chef.r) {
      if (d2 === 0) {
        chef.y = r.y - chef.r;
        continue;
      }
      const d = Math.sqrt(d2);
      chef.x = cx + (dx / d) * chef.r;
      chef.y = cy + (dy / d) * chef.r;
    }
  }
}

// Nearest point on a station rect to the chef (for interaction prompts).
export function stationDistance(chef, rect) {
  const cx = Math.max(rect.x, Math.min(chef.x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(chef.y, rect.y + rect.h));
  return Math.hypot(chef.x - cx, chef.y - cy);
}

// All interactable stations with their kind, for prompts and clicks.
export function interactables() {
  const list = [];
  for (const c of STATIONS.crates) list.push({ ...c, kind: 'crate' });
  list.push({ ...STATIONS.board, kind: 'board' });
  list.push({ ...STATIONS.bin, kind: 'bin' });
  list.push({ ...STATIONS.plates, kind: 'plates' });
  for (const a of STATIONS.assembly) list.push({ ...a, kind: 'assembly' });
  list.push({ ...STATIONS.grill, kind: 'grill' });
  list.push({ ...STATIONS.window, kind: 'window' });
  return list;
}
