// ── DialogSystem ─────────────────────────────────────────────────────────────
// Manages the Lily dialog box: showing/hiding, sequencing lines, and
// animating position between top-left and screen center.
class DialogSystem {
  /**
   * @param {HTMLElement} boxEl   The outer dialog container
   * @param {HTMLElement} nameEl  The speaker name element
   * @param {HTMLElement} textEl  The line text element
   * @param {SoundSystem} sound   For dialog beep sounds
   */
  constructor(boxEl, nameEl, textEl, sound) {
    this._box   = boxEl;
    this._name  = nameEl;
    this._text  = textEl;
    this._sound = sound;
    this._timer = null;
  }

  show() {
    this._box.style.display = 'block';
  }

  hide() {
    this._box.style.display = 'none';
    this._clearTimer();
  }

  /** Immediately display a single line (no auto-advance). */
  say(speaker, text) {
    this._name.textContent = speaker;
    this._text.textContent = text;
    if (this._sound) this._sound.dialogBeep();
  }

  /**
   * Play an array of { speaker, text } lines sequentially.
   * Each line is shown for `interval` ms, then the next appears.
   * Calls `onComplete` when the last line has been shown (after its interval).
   */
  playSequence(lines, interval, onComplete) {
    this._clearTimer();
    const queue = [...lines];

    const next = () => {
      if (queue.length === 0) {
        if (onComplete) onComplete();
        return;
      }
      const line = queue.shift();
      this.say(line.speaker || 'LILY', line.text);
      this._timer = setTimeout(next, interval);
    };

    next();
  }

  /**
   * Move the dialog box to a preset position.
   * CSS transition handles the animation (defined in style.css).
   * @param {'topLeft'|'center'} position
   */
  moveTo(position) {
    if (position === 'center') {
      this._box.classList.add('centered');
    } else {
      this._box.classList.remove('centered');
    }
  }

  _clearTimer() {
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
}
