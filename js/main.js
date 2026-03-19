// ── Element refs ─────────────────────────────────────────────────────────────
const canvas        = document.getElementById('particle-canvas');
const crossCanvas   = document.getElementById('cross-canvas');
const video         = document.getElementById('camera');
const welcomeScreen = document.getElementById('welcome-screen');
const startBtn      = document.getElementById('start-btn');
const langBtn       = document.getElementById('lang-btn');
const loadingMsg    = document.getElementById('loading-msg');
const dialogBox     = document.getElementById('dialog-box');
const dialogName    = document.getElementById('dialog-name');
const dialogText    = document.getElementById('dialog-text');
const dialogChoices = document.getElementById('dialog-choices');
const tapHintEl     = document.getElementById('tap-hint');
const blackoutEl    = document.getElementById('blackout');
const fadeOverlay   = document.getElementById('fade-overlay');
const endingOverlay = document.getElementById('ending-overlay');

// ── Core objects ─────────────────────────────────────────────────────────────
const ps       = new ParticleSystem();
const detector = new ObjectDetector();
const game     = new Game();
const sound    = new SoundSystem();
const dialog   = new DialogSystem(dialogBox, dialogName, dialogText, dialogChoices, tapHintEl, sound);

const NORMAL_PIXEL_SIZE = 11;
let detectionTimer = null;
let phase          = 'welcome'; // welcome | intro | ar | ending | done

// ── Canvas resize ─────────────────────────────────────────────────────────────
function resizeCanvas() {
  canvas.width       = window.innerWidth;
  canvas.height      = window.innerHeight;
  crossCanvas.width  = window.innerWidth;
  crossCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── Boot ─────────────────────────────────────────────────────────────────────
ps.init(canvas);

detector.load(msg => {
  loadingMsg.textContent = msg;
  if (msg === 'Model ready!') {
    setTimeout(() => { loadingMsg.textContent = ''; }, 1500);
  }
});

// ── i18n ─────────────────────────────────────────────────────────────────────
function applyI18n() {
  document.querySelector('.subtitle').textContent = t('subtitle');
  startBtn.textContent                            = t('startBtn');
  langBtn.textContent                             = t('langToggle');
  tapHintEl.textContent                           = t('tapHint');
}
applyI18n();

langBtn.addEventListener('click', () => {
  if (phase !== 'welcome') return;
  toggleLang();
  applyI18n();
});

// ── Start button ─────────────────────────────────────────────────────────────
startBtn.addEventListener('click', async () => {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
    });
  } catch {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
    } catch {
      alert('Camera access denied.\nPlease allow camera permissions and reload the page.');
      return;
    }
  }

  video.srcObject = stream;
  await video.play();

  welcomeScreen.style.display = 'none';
  phase = 'intro';
  dialog.show();
  startIntroDlg();
});

// ── Part 1: Intro dialogue ────────────────────────────────────────────────────
let introStep = 0;

function startIntroDlg() {
  introStep = 0;
  showIntroStep(0);
}

function showIntroStep(n) {
  const steps = getIntroDlg();
  if (n >= steps.length) return;
  const step = steps[n];
  if (step.type === 'text') {
    dialog.say(t('speaker'), step.text);
  } else if (step.type === 'choice') {
    dialog.showChoices(step.options, () => advanceIntro());
  }
}

function advanceIntro() {
  const steps = getIntroDlg();
  const step  = steps[introStep];

  if (step?.afterAction === 'openCamera') {
    ps.setVideo(video);
    ps.scatterAll();
  } else if (step?.afterAction === 'startGame') {
    startARPhase();
    return;
  }

  introStep++;
  if (introStep < steps.length) {
    showIntroStep(introStep);
  }
}

// ── Part 2: AR phase ──────────────────────────────────────────────────────────
let arDlgPhase = 0;   // 0 = object reaction, 1 = "continue exploring" prompt
let lastScan   = false;

function startARPhase() {
  dialog.hide();
  phase = 'ar';
  lastScan = false;
  startDetection();
  scheduleBlackout();
  schedulePixelSpike();
}

function showObjectReaction(label) {
  stopDetection();
  const lang = LANG[currentLang];
  const text = lang.objectResponses[label.toLowerCase()]
    ?? lang.genericResponses[Math.floor(Math.random() * lang.genericResponses.length)];
  arDlgPhase = 0;
  dialog.show();
  dialog.say(t('speaker'), text);
}

function advanceAR() {
  if (arDlgPhase === 0) {
    if (lastScan) {
      // After 5th object reaction, fade directly to Part 3
      dialog.hide();
      fadeToEnding();
    } else {
      arDlgPhase = 1;
      dialog.say(t('speaker'), t('continueExplore'));
    }
  } else {
    // arDlgPhase === 1
    dialog.hide();
    startDetection();
  }
}

function fadeToEnding() {
  ps.scatterAll();
  fadeOverlay.style.transition    = 'opacity 1s ease';
  fadeOverlay.style.opacity       = '1';
  fadeOverlay.style.pointerEvents = 'all';
  setTimeout(() => startEnding(), 1200);
}

// ── Detection loop ────────────────────────────────────────────────────────────
function startDetection() {
  detectionTimer = setInterval(async () => {
    const detection = await detector.detect(video);
    const action    = game.process(detection);
    handleAction(action);
  }, 900);
}

function stopDetection() {
  clearInterval(detectionTimer);
  detectionTimer = null;
}

// ── Game action handler ───────────────────────────────────────────────────────
function handleAction(action) {
  const cx = canvas.width  / 2;
  const cy = canvas.height / 2;

  switch (action.type) {
    case 'form': {
      ps.formText(action.label, cx, cy);
      if (action.isNew) {
        sound.discovery();
        showObjectReaction(action.label);
      }
      break;
    }
    case 'scatter': {
      ps.scatterText();
      break;
    }
    case 'complete': {
      stopDetection();
      sound.discovery();
      ps.formText(action.label, cx, cy);
      lastScan = true;
      showObjectReaction(action.label);
      break;
    }
    default:
      break;
  }
}

// ── Random: Blackout (eye pain) ───────────────────────────────────────────────
function scheduleBlackout() {
  const delay = 20000 + Math.random() * 20000;
  setTimeout(() => {
    if (phase !== 'ar' || detectionTimer === null) return;
    triggerBlackout();
  }, delay);
}

function triggerBlackout() {
  stopDetection();
  ps.setVideo(null);
  blackoutEl.style.display = 'block';

  const duration = 3000 + Math.random() * 2000;
  setTimeout(() => {
    if (phase !== 'ar') return;
    blackoutEl.style.display = 'none';
    ps.setVideo(video);
    startDetection();
    scheduleBlackout();
  }, duration);
}

// ── Random: Pixel spike (blurry vision) ───────────────────────────────────────
function schedulePixelSpike() {
  const delay = 12000 + Math.random() * 14000;
  setTimeout(() => {
    if (phase !== 'ar' || detectionTimer === null) return;
    triggerPixelSpike();
  }, delay);
}

function triggerPixelSpike() {
  ps.PIXEL_SIZE = 36;

  const duration = 2000 + Math.random() * 1500;
  setTimeout(() => {
    if (phase !== 'ar') return;
    ps.PIXEL_SIZE = NORMAL_PIXEL_SIZE;
    schedulePixelSpike();
  }, duration);
}

// ── Part 3: Ending ────────────────────────────────────────────────────────────
function startEnding() {
  phase = 'ending';
  ps.PIXEL_SIZE = NORMAL_PIXEL_SIZE;
  blackoutEl.style.display = 'none';
  ps.setVideo(null);
  ps.scatterAll();
  sound.complete();
  dialog.show();
  dialog.moveTo('center');
  showEndingStep('start');
}

// Ending state machine
const ENDING_NEXT = {
  monologue_1: 'monologue_2',
  monologue_2: 'monologue_3',
  monologue_3: 'monologue_4',
  monologue_4: 'cross_anim',
  final:       'game_over',
};

let endingState = 'start';

function showEndingStep(state) {
  endingState = state;
  const p3 = getP3();

  switch (state) {
    case 'start':
      dialog.say(t('speaker'), p3.line1);
      dialog.showButton(p3.btn_okay, () => showEndingStep('response'));
      break;

    case 'response':
      dialog.say(t('speaker'), p3.line2);
      dialog.showChoices([p3.branchA, p3.branchB], (idx) => {
        showEndingStep(idx === 0 ? 'branch_a' : 'monologue_1');
      });
      break;

    case 'branch_a':
      dialog.say(t('speaker'), p3.lineA1);
      dialog.showChoices([p3.btnDarkness, p3.btnGoodbye], (idx) => {
        if (idx === 0) showEndingStep('monologue_1');
        else           endGame();
      });
      break;

    case 'monologue_1':
      dialog.say(t('speaker'), p3.mono1);
      break;
    case 'monologue_2':
      dialog.say(t('speaker'), p3.mono2);
      break;
    case 'monologue_3':
      dialog.say(t('speaker'), p3.mono3);
      break;
    case 'monologue_4':
      dialog.say(t('speaker'), p3.mono4);
      break;

    case 'cross_anim':
      dialog.shrink(() => {
        runCrossAnimation(() => {
          dialog.show();
          dialog.moveTo('center');
          showEndingStep('final');
        });
      });
      break;

    case 'final':
      dialog.say(t('speaker'), p3.final);
      break;

    case 'game_over':
      endGame();
      break;
  }
}

function advanceEnding() {
  const next = ENDING_NEXT[endingState];
  if (next) showEndingStep(next);
}

// ── Cross animation ───────────────────────────────────────────────────────────
function runCrossAnimation(onComplete) {
  const ctx = crossCanvas.getContext('2d');
  const W   = crossCanvas.width;
  const H   = crossCanvas.height;
  ctx.clearRect(0, 0, W, H);

  const COLS = 13, ROWS = 9;
  function easeIO(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }

  const crosses = Array.from({ length: COLS * ROWS }, (_, i) => {
    const arm   = 4 + Math.random() * 6;          // size variety: 4–10 px
    const angle = Math.random() < 0.3
      ? Math.PI / 4 : 0;                          // 30% × shape, 70% + shape
    const speed = 0.0016 + Math.random() * 0.004; // twinkle speed per cross
    // slow drift for float phase
    const dir   = Math.random() * Math.PI * 2;
    const spd   = 0.06 + Math.random() * 0.10;    // pixels/frame
    return {
      gx:    ((i % COLS) + 1) * (W / (COLS + 1)),
      gy:    (Math.floor(i / COLS) + 1) * (H / (ROWS + 1)),
      sx:    Math.random() * W,
      sy:    Math.random() * H,
      tx:    Math.random() * W,
      ty:    Math.random() * H,
      x: 0, y: 0,
      phase: Math.random() * Math.PI * 2,
      arm, angle, speed,
      vx: Math.cos(dir) * spd,
      vy: Math.sin(dir) * spd,
    };
  });

  // Phase durations (ms)
  const P1  = 2000;  // gather → grid
  const P2A = 2500;  // scatter: grid → random
  const P2B = 4000;  // float: drift + twinkle
  const P2C = 2000;  // pulse: arm size breathes
  const P3  = 1500;  // fade out
  const TOTAL = P1 + P2A + P2B + P2C + P3;

  const T0 = performance.now();
  let floatStartX, floatStartY; // positions at start of P2B
  let floatInitDone = false;

  function drawCross(x, y, arm, angle, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 1.4;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-arm, 0); ctx.lineTo(arm, 0);
    ctx.moveTo(0, -arm); ctx.lineTo(0, arm);
    ctx.stroke();
    ctx.restore();
  }

  function frame(now) {
    const t = now - T0;
    ctx.clearRect(0, 0, W, H);

    crosses.forEach((c, i) => {
      let x, y, alpha, arm = c.arm;

      if (t < P1) {
        // Phase 1: gather from random start → grid
        const p = easeIO(t / P1);
        x     = c.sx + (c.gx - c.sx) * p;
        y     = c.sy + (c.gy - c.sy) * p;
        alpha = p * 0.75;

      } else if (t < P1 + P2A) {
        // Phase 2A: scatter from grid → random targets
        const p = easeIO((t - P1) / P2A);
        x     = c.gx + (c.tx - c.gx) * p;
        y     = c.gy + (c.ty - c.gy) * p;
        alpha = 0.35 + 0.55 * Math.abs(Math.sin(now * c.speed + c.phase));

      } else if (t < P1 + P2A + P2B) {
        // Phase 2B: float (drift) + twinkle
        if (!floatInitDone) {
          // Capture position at end of 2A
          floatStartX = crosses.map(c => c.tx);
          floatStartY = crosses.map(c => c.ty);
          floatInitDone = true;
        }
        const elapsed = t - P1 - P2A;
        x = floatStartX[i] + c.vx * elapsed;
        y = floatStartY[i] + c.vy * elapsed;
        // Wrap around screen edges
        x = ((x % W) + W) % W;
        y = ((y % H) + H) % H;
        alpha = 0.2 + 0.7 * Math.abs(Math.sin(now * c.speed + c.phase));
        // Save position so P2C can start from here
        c.x = x; c.y = y;

      } else if (t < P1 + P2A + P2B + P2C) {
        // Phase 2C: pulse arm size (breathe in/out), continue slow drift
        const elapsed2 = t - P1 - P2A - P2B;
        x = c.x + c.vx * elapsed2;
        y = c.y + c.vy * elapsed2;
        x = ((x % W) + W) % W;
        y = ((y % H) + H) % H;
        arm   = c.arm + 2.5 * Math.sin(now * 0.0042 + c.phase);
        alpha = 0.25 + 0.65 * Math.abs(Math.sin(now * c.speed + c.phase));
        c.x = x; c.y = y;

      } else {
        // Phase 3: fade out from current position
        const p = Math.min(1, (t - P1 - P2A - P2B - P2C) / P3);
        x     = c.x;
        y     = c.y;
        arm   = c.arm + 2.5 * Math.sin(now * 0.0042 + c.phase);
        alpha = (1 - p) * (0.25 + 0.65 * Math.abs(Math.sin(now * c.speed + c.phase)));
      }

      drawCross(x, y, Math.max(2, arm), c.angle, alpha);
    });

    if (t >= TOTAL) {
      ctx.clearRect(0, 0, W, H);
      onComplete();
    } else {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

// ── End game ──────────────────────────────────────────────────────────────────
function endGame() {
  phase = 'done';
  dialog.hide();
  const thankyou = getP3().thankyou;
  setTimeout(() => {
    endingOverlay.style.display = 'flex';
    endingOverlay.textContent   = thankyou;
  }, 600);
}

// ── Global tap dispatcher ─────────────────────────────────────────────────────
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('choice-btn')) return;

  if      (phase === 'intro'  && dialog.advanceable) advanceIntro();
  else if (phase === 'ar'     && dialog.advanceable) advanceAR();
  else if (phase === 'ending' && dialog.advanceable) advanceEnding();
});
