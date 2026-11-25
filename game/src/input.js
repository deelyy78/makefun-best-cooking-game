// Sizzle Rush — keyboard and mouse input.
// WASD / arrows move, E interacts, Q bins held food, Space serves at the
// window, P pauses, M mutes, R restarts, Enter starts. Clicking sets a
// walk target; clicking a nearby station interacts with it.

export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set();
  let click = null;
  let clickStation = null;

  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    KeyE: 'interact',
    KeyQ: 'trash',
    Space: 'serve',
    KeyP: 'pause',
    Escape: 'pause',
    KeyM: 'mute',
    KeyR: 'restart',
    Enter: 'start',
  };

  function onKeyDown(e) {
    const action = KEYMAP[e.code];
    if (!action) return;
    if (['up', 'down', 'left', 'right', 'serve', 'start'].includes(action)) e.preventDefault();
    if (!e.repeat) pressed.add(action);
    keys.add(action);
  }

  function onKeyUp(e) {
    const action = KEYMAP[e.code];
    if (action) keys.delete(action);
  }

  function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    click = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousedown', onMouseDown);

  return {
    // Held movement direction, normalised.
    moveVector() {
      let x = 0;
      let y = 0;
      if (keys.has('left')) x -= 1;
      if (keys.has('right')) x += 1;
      if (keys.has('up')) y -= 1;
      if (keys.has('down')) y += 1;
      if (x !== 0 && y !== 0) {
        const inv = 1 / Math.hypot(x, y);
        x *= inv;
        y *= inv;
      }
      return { x, y };
    },
    // True once for the frame the key went down.
    wasPressed(action) {
      return pressed.has(action);
    },
    // True while the key is held down.
    isHeld(action) {
      return keys.has(action);
    },
    takeClick() {
      const c = click;
      click = null;
      return c;
    },
    setClickStation(station) {
      clickStation = station;
    },
    takeClickStation() {
      const s = clickStation;
      clickStation = null;
      return s;
    },
    endFrame() {
      pressed.clear();
    },
  };
}
