// ── Element refs ───────────────────────────────────────────────────────────
const canvas         = document.getElementById('particle-canvas');
const video          = document.getElementById('camera');
const welcomeScreen  = document.getElementById('welcome-screen');
const hud            = document.getElementById('hud');
const countEl        = document.getElementById('count');
const dotsEl         = document.getElementById('scan-dots');
const loadingMsg     = document.getElementById('loading-msg');
const completeScreen = document.getElementById('complete-screen');
const discoveredList = document.getElementById('discovered-list');
const startBtn       = document.getElementById('start-btn');
const restartBtn     = document.getElementById('restart-btn');

// ── Core objects ───────────────────────────────────────────────────────────
const ps       = new ParticleSystem();
const detector = new ObjectDetector();
const game     = new Game();

let detectionTimer = null;

// ── Canvas resize ──────────────────────────────────────────────────────────
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── Boot ───────────────────────────────────────────────────────────────────
ps.init(canvas);

// Preload model in background while user reads the welcome screen
detector.load(msg => {
  loadingMsg.textContent = msg;
  if (msg === 'Model ready!') {
    setTimeout(() => { loadingMsg.textContent = ''; }, 1500);
  }
});

// ── Welcome → Game ─────────────────────────────────────────────────────────
startBtn.addEventListener('click', async () => {
  // Prompt camera
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
    });
  } catch {
    // Fallback: try any camera
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      alert('Camera access denied.\nPlease allow camera permissions and reload the page.');
      return;
    }
  }

  video.srcObject = stream;
  await video.play();

  // Show game UI — video stays hidden; canvas renders it pixelated
  welcomeScreen.style.display = 'none';
  hud.style.display           = 'block';
  updateHUD();

  // Hand video to particle system for pixelated B&W rendering
  ps.setVideo(video);

  // Scatter welcome particles dramatically
  ps.scatterAll();

  // Wait for model if it hasn't finished loading yet
  while (!detector.ready) {
    loadingMsg.textContent = 'Waiting for AI model…';
    await sleep(250);
  }
  loadingMsg.textContent = '';

  // Start detection loop
  startDetection();
});

// ── Detection loop ─────────────────────────────────────────────────────────
function startDetection() {
  detectionTimer = setInterval(async () => {
    const detection = await detector.detect(video);
    const action    = game.process(detection);
    handleAction(action);
  }, 900); // every 900 ms — balance between responsiveness and CPU
}

function stopDetection() {
  clearInterval(detectionTimer);
  detectionTimer = null;
}

// ── Game action handler ────────────────────────────────────────────────────
function handleAction(action) {
  const cx = canvas.width  / 2;
  const cy = canvas.height / 2;

  switch (action.type) {
    case 'form': {
      ps.formText(action.label, cx, cy);
      if (action.isNew) updateHUD();
      break;
    }
    case 'scatter': {
      ps.scatterText();
      break;
    }
    case 'complete': {
      ps.formText('COMPLETE!', cx, cy);
      updateHUD();
      setTimeout(() => showCompleteScreen(action.list), 2500);
      stopDetection();
      break;
    }
    default:
      break; // 'none'
  }
}

// ── HUD ────────────────────────────────────────────────────────────────────
function updateHUD() {
  countEl.textContent = game.count;
  dotsEl.textContent  = Array.from({ length: game.GOAL }, (_, i) =>
    i < game.count ? '✦' : '□'
  ).join(' ');
}

// ── Complete Screen ────────────────────────────────────────────────────────
function showCompleteScreen(list) {
  ps.setVideo(null);  // stop pixelated rendering on complete screen
  hud.style.display = 'none';

  discoveredList.innerHTML = list
    .map(label => `<span class="obj-tag">${label}</span>`)
    .join('');

  completeScreen.style.display = 'flex';
  ps.scatterAll();
}

// ── Restart ────────────────────────────────────────────────────────────────
restartBtn.addEventListener('click', () => {
  // Stop camera
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }

  game.reset();
  stopDetection();

  completeScreen.style.display = 'none';
  welcomeScreen.style.display  = 'flex';

  updateHUD();
  ps.scatterAll();
});

// ── Utility ────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
