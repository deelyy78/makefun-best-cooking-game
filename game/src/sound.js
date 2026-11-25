// Sizzle Rush — tiny synthesised sound effects (WebAudio, no audio files).
// Everything is an oscillator blip, so the game ships zero sound assets.

export function createSound() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, dur, type, vol, when = 0) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ac.currentTime + when);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + when + dur);
      osc.connect(gain).connect(ac.destination);
      osc.start(ac.currentTime + when);
      osc.stop(ac.currentTime + when + dur);
    } catch {
      // Sound is garnish; never break the game.
    }
  }

  return {
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    pickup() { tone(520, 0.08, 'sine', 0.12); },
    chop() { tone(180, 0.06, 'square', 0.08); tone(240, 0.05, 'square', 0.06, 0.05); },
    sizzle() { tone(1400, 0.18, 'sawtooth', 0.03); },
    ding() { tone(880, 0.25, 'sine', 0.14); tone(1320, 0.3, 'sine', 0.1, 0.08); },
    serve() { tone(660, 0.1, 'sine', 0.14); tone(880, 0.12, 'sine', 0.14, 0.09); tone(1100, 0.18, 'sine', 0.12, 0.18); },
    bad() { tone(220, 0.2, 'sawtooth', 0.1); tone(160, 0.25, 'sawtooth', 0.08, 0.1); },
    tick() { tone(1000, 0.05, 'square', 0.05); },
    bell() { tone(1174, 0.15, 'sine', 0.12); tone(1568, 0.2, 'sine', 0.1, 0.1); },
  };
}
