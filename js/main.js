// ── Element refs ────────────────────────────────────────────────────────────
const canvas         = document.getElementById('particle-canvas');
const video          = document.getElementById('camera');
const welcomeScreen  = document.getElementById('welcome-screen');
const hud            = document.getElementById('hud');
const countEl        = document.getElementById('count');
const dotsEl         = document.getElementById('scan-dots');
const loadingMsg     = document.getElementById('loading-msg');
const startBtn       = document.getElementById('start-btn');
const dialogBox      = document.getElementById('dialog-box');
const dialogName     = document.getElementById('dialog-name');
const dialogText     = document.getElementById('dialog-text');
const blackoutEl     = document.getElementById('blackout');
const endingOverlay  = document.getElementById('ending-overlay');

// ── Core objects ────────────────────────────────────────────────────────────
const ps       = new ParticleSystem();
const detector = new ObjectDetector();
const game     = new Game();
const sound    = new SoundSystem();
const dialog   = new DialogSystem(dialogBox, dialogName, dialogText, sound);

let detectionTimer = null;
let gameActive     = false;   // true while player is scanning

// ── Lily's dialog content ───────────────────────────────────────────────────
const OPENING_LINES = [
  { speaker: 'LILY', text: 'Hello.' },
  { speaker: 'LILY', text: "I'm Lily. This is my 'world'." },
  { speaker: 'LILY', text: 'Will you explore it with me?' },
];

const DISCOVERY_LINES = [
  'That thing. Still exactly the same.',
  'How dull. Nothing ever changes.',
  "I've stared at that a thousand times.",
  'Everything looks the same in black and white.',
  'Do you ever wonder why we bother looking?',
  'The floaters drift right past it. Unbothered.',
  'I used to think colour would make this exciting.',
  'Another object. Another blur.',
  'My eyes ache just looking.',
  'Ten things. And yet nothing feels different.',
];

const ENDING_LINES = [
  { speaker: 'LILY', text: 'Do you see it now?' },
  { speaker: 'LILY', text: 'This is the world through my eyes.' },
  { speaker: 'LILY', text: 'I have a severe eye condition.' },
  { speaker: 'LILY', text: 'My world has always been blurry and black-and-white.' },
  { speaker: 'LILY', text: 'Floaters everywhere — like mosquitoes that never leave.' },
  { speaker: 'LILY', text: "I complain. But I've made peace with it." },
  { speaker: 'LILY', text: "I've accepted this reality." },
  { speaker: 'LILY', text: 'This. Is. My world.' },
];

const NORMAL_PIXEL_SIZE = 11;

// ── Canvas resize ───────────────────────────────────────────────────────────
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── Boot ────────────────────────────────────────────────────────────────────
ps.init(canvas);

detector.load(msg => {
  loadingMsg.textContent = msg;
  if (msg === 'Model ready!') {
    setTimeout(() => { loadingMsg.textContent = ''; }, 1500);
  }
});

// ── Welcome → Opening Cinematic → Game ──────────────────────────────────────
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
  dialog.show();

  dialog.playSequence(OPENING_LINES, 5000, async () => {
    while (!detector.ready) {
      dialog.say('LILY', 'Waiting for the world to load…');
      await sleep(250);
    }

    ps.setVideo(video);
    ps.scatterAll();

    hud.style.display = 'block';
    updateHUD();

    dialogText.textContent = '';

    gameActive = true;
    startDetection();
    scheduleBlackout();
    schedulePixelSpike();
  });
});

// ── Detection loop ──────────────────────────────────────────────────────────
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

// ── Game action handler ─────────────────────────────────────────────────────
function handleAction(action) {
  const cx = canvas.width  / 2;
  const cy = canvas.height / 2;

  switch (action.type) {
    case 'form': {
      ps.formText(action.label, cx, cy);
      if (action.isNew) {
        updateHUD();
        sound.discovery();
        const line = DISCOVERY_LINES[action.lineIndex] ?? DISCOVERY_LINES[DISCOVERY_LINES.length - 1];
        dialog.say('LILY', line);
      }
      break;
    }
    case 'scatter': {
      ps.scatterText();
      break;
    }
    case 'complete': {
      ps.formText('COMPLETE!', cx, cy);
      updateHUD();
      sound.discovery();
      setTimeout(() => runEndingSequence(), 2500);
      stopDetection();
      break;
    }
    default:
      break;
  }
}

// ── HUD ─────────────────────────────────────────────────────────────────────
function updateHUD() {
  countEl.textContent = game.count;
  dotsEl.textContent  = Array.from({ length: game.GOAL }, (_, i) =>
    i < game.count ? '✦' : '□'
  ).join(' ');
}

// ── Random: Blackout (eye pain) ──────────────────────────────────────────────
function scheduleBlackout() {
  const delay = 20000 + Math.random() * 20000; // 20–40 s
  setTimeout(() => {
    if (!gameActive) return;
    triggerBlackout();
  }, delay);
}

function triggerBlackout() {
  stopDetection();
  ps.setVideo(null);
  blackoutEl.style.display = 'block';
  dialog.say('LILY', 'Sorry. My eyes suddenly hurt.');

  const duration = 3000 + Math.random() * 2000; // 3–5 s
  setTimeout(() => {
    if (!gameActive) return;
    blackoutEl.style.display = 'none';
    ps.setVideo(video);
    dialog.say('LILY', '');
    startDetection();
    scheduleBlackout();
  }, duration);
}

// ── Random: Pixel spike (blurry vision) ──────────────────────────────────────
function schedulePixelSpike() {
  const delay = 12000 + Math.random() * 14000; // 12–26 s
  setTimeout(() => {
    if (!gameActive) return;
    triggerPixelSpike();
  }, delay);
}

function triggerPixelSpike() {
  ps.PIXEL_SIZE = 36;
  dialog.say('LILY', 'Sorry.');

  const duration = 2000 + Math.random() * 1500; // 2–3.5 s
  setTimeout(() => {
    if (!gameActive) return;
    ps.PIXEL_SIZE = NORMAL_PIXEL_SIZE;
    dialog.say('LILY', '');
    schedulePixelSpike();
  }, duration);
}

// ── Ending sequence ──────────────────────────────────────────────────────────
function runEndingSequence() {
  gameActive = false;          // stop all random events
  ps.PIXEL_SIZE = NORMAL_PIXEL_SIZE;
  blackoutEl.style.display = 'none';

  ps.setVideo(null);
  ps.scatterAll();
  sound.complete();

  dialog.moveTo('center');

  dialog.playSequence(ENDING_LINES, 4500, () => {
    endingOverlay.style.background = '#fff';
    endingOverlay.style.display    = 'flex';

    setTimeout(() => {
      endingOverlay.style.transition = 'none';
      endingOverlay.style.background = '#0c0c0c';
      dialog.hide();
      hud.style.display = 'none';
    }, 120);

    setTimeout(() => {
      endingOverlay.textContent = 'THANK YOU FOR PLAYING.';
    }, 3200);
  });
}

// ── Utility ─────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
