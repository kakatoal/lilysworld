// ── Game ───────────────────────────────────────────────────────────────────
// Manages the scanning state: which objects have been found, progress, and
// the win condition (10 unique objects).
class Game {
  constructor() {
    this.GOAL             = 5;
    this.scanned          = new Set();   // unique labels discovered
    this.currentLabel     = null;        // label currently being shown
    this.noDetectCount    = 0;           // frames with no detection (for scatter delay)
    this.NO_DETECT_THRESHOLD = 2;        // frames before we scatter particles
    this.discoveryLineIndex = 0;         // which Lily line to use next (0–9)
  }

  /**
   * Feed a detection result (or null) into the game.
   * Returns an action object for main.js to act on.
   *
   * Actions:
   *  { type: 'none'     }                              — nothing changed
   *  { type: 'form',    label, isNew }                 — new object detected
   *  { type: 'scatter'  }                              — object left the frame
   *  { type: 'complete', label, list }                 — 10th object scanned!
   */
  process(detection) {
    if (!detection) {
      this.noDetectCount++;
      if (this.noDetectCount >= this.NO_DETECT_THRESHOLD && this.currentLabel) {
        this.currentLabel = null;
        this.noDetectCount = 0;
        return { type: 'scatter' };
      }
      return { type: 'none' };
    }

    // Object detected
    this.noDetectCount = 0;
    const { label } = detection;

    // Same as current — particles already formed
    if (label === this.currentLabel) return { type: 'none' };

    // New or different object
    this.currentLabel = label;
    const isNew = !this.scanned.has(label);
    if (isNew) this.scanned.add(label);

    if (isNew && this.scanned.size >= this.GOAL) {
      return { type: 'complete', label, list: [...this.scanned] };
    }

    // Advance discovery line index for each new object found
    const lineIndex = isNew ? this.discoveryLineIndex++ : -1;
    return { type: 'form', label, isNew, lineIndex };
  }

  get count()       { return this.scanned.size; }
  get list()        { return [...this.scanned]; }
  get isComplete()  { return this.scanned.size >= this.GOAL; }

  reset() {
    this.scanned.clear();
    this.currentLabel       = null;
    this.noDetectCount      = 0;
    this.discoveryLineIndex = 0;
  }
}
