// ── DialogSystem ──────────────────────────────────────────────────────────────
// Manages the Lily dialog box: showing/hiding, tap-to-continue text,
// choice buttons, and position transitions.
class DialogSystem {
  /**
   * @param {HTMLElement} boxEl      The outer dialog container
   * @param {HTMLElement} nameEl     The speaker name element
   * @param {HTMLElement} textEl     The line text element
   * @param {HTMLElement} choicesEl  The choices container
   * @param {HTMLElement} hintEl     The "tap to continue" hint
   * @param {SoundSystem} sound      For dialog beep sounds
   */
  constructor(boxEl, nameEl, textEl, choicesEl, hintEl, sound) {
    this._box     = boxEl;
    this._name    = nameEl;
    this._text    = textEl;
    this._choices = choicesEl;
    this._hint    = hintEl;
    this._sound   = sound;
    this.advanceable = false;
  }

  /** Show the dialog box (bottom-center by default). */
  show() {
    this._box.classList.remove('hidden', 'centered', 'shrink');
  }

  /** Hide the dialog box. */
  hide() {
    this._box.classList.add('hidden');
    this.advanceable = false;
  }

  /**
   * Display a text line. Player must tap anywhere to advance.
   * @param {string} speaker
   * @param {string} text
   */
  say(speaker, text) {
    this._name.textContent      = speaker;
    this._text.textContent      = text;
    this._choices.innerHTML     = '';
    this._hint.style.visibility = 'visible';
    this.advanceable            = true;
    if (this._sound) this._sound.dialogBeep();
  }

  /**
   * Show two choice buttons. Tap-advance is blocked until a choice is made.
   * @param {string[]}         options   Array of option labels
   * @param {function(number)} onChoice  Called with the chosen index
   */
  showChoices(options, onChoice) {
    this._hint.style.visibility = 'hidden';
    this.advanceable            = false;
    this._choices.innerHTML     = options
      .map((opt, i) => `<button class="choice-btn" data-idx="${i}">${opt}</button>`)
      .join('');
    this._choices.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => onChoice(parseInt(btn.dataset.idx)));
    });
  }

  /**
   * Show a single action button (no tap-advance).
   * @param {string}   label    Button text
   * @param {function} onClick  Called when clicked
   */
  showButton(label, onClick) {
    this._hint.style.visibility = 'hidden';
    this.advanceable            = false;
    this._choices.innerHTML     = `<button class="choice-btn" id="dlg-action-btn">${label}</button>`;
    document.getElementById('dlg-action-btn').addEventListener('click', onClick);
  }

  /**
   * Move the dialog box to a preset position.
   * @param {'bottom'|'center'} position
   */
  moveTo(position) {
    if (position === 'center') {
      this._box.classList.add('centered');
      this._box.classList.remove('hidden');
    } else {
      this._box.classList.remove('centered');
    }
  }

  /**
   * Shrink the dialog box out, then call onComplete.
   * Used before the cross animation in Part 3.
   */
  shrink(onComplete) {
    this._box.classList.add('shrink');
    setTimeout(() => {
      this._box.classList.add('hidden');
      onComplete?.();
    }, 500);
  }
}
