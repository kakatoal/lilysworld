// ── SoundSystem ─────────────────────────────────────────────────────────────
// Generates sounds procedurally via Web Audio API — no audio files needed.
class SoundSystem {
  constructor() {
    this._ctx = null;
  }

  _init() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browsers require user gesture first)
    if (this._ctx.state === 'suspended') this._ctx.resume();
  }

  _tone(freq, duration, type = 'sine', volume = 0.28, delay = 0) {
    this._init();
    const ctx  = this._ctx;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.value = freq;

    const start = ctx.currentTime + delay;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.start(start);
    osc.stop(start + duration);
  }

  /** Short ascending chime — played when a new object is discovered. */
  discovery() {
    this._tone(523.25, 0.25, 'sine', 0.25, 0.00); // C5
    this._tone(659.25, 0.25, 'sine', 0.25, 0.15); // E5
    this._tone(783.99, 0.45, 'sine', 0.28, 0.30); // G5
  }

  /** Resonant chord — played when all 10 objects are found. */
  complete() {
    [523.25, 659.25, 783.99, 1046.5].forEach(f =>
      this._tone(f, 1.8, 'sine', 0.18)
    );
  }

  /** Tiny soft click — played with each dialog line advance. */
  dialogBeep() {
    this._tone(900, 0.07, 'square', 0.06);
  }
}
