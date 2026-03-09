// ── Particle ───────────────────────────────────────────────────────────────
class Particle {
  constructor(w, h) {
    this._init(w, h);
    this.state = 'float'; // 'float' | 'gather' | 'scatter'
    this.targetX = 0;
    this.targetY = 0;
  }

  _init(w, h) {
    this.x  = Math.random() * w;
    this.y  = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 1.8;
    this.vy = (Math.random() - 0.5) * 1.8;
    this.r  = Math.random() * 1.4 + 1.0;       // radius 1.0–2.4 px
    this.a  = Math.random() * 0.35 + 0.55;      // alpha 0.55–0.9
    this.hue = 218 + Math.random() * 12;        // deep blue: 218–230°
  }

  update(w, h) {
    switch (this.state) {

      case 'float': {
        // Gentle Brownian drift
        this.vx += (Math.random() - 0.5) * 0.07;
        this.vy += (Math.random() - 0.5) * 0.07;
        const s = Math.hypot(this.vx, this.vy);
        if (s > 1.2) { this.vx *= 1.2 / s; this.vy *= 1.2 / s; }
        this.x += this.vx;
        this.y += this.vy;
        // Wrap edges
        if (this.x < -4) this.x = w + 4;
        else if (this.x > w + 4) this.x = -4;
        if (this.y < -4) this.y = h + 4;
        else if (this.y > h + 4) this.y = -4;
        break;
      }

      case 'gather': {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        // Spring toward target, strong damping
        this.vx = this.vx * 0.72 + dx * 0.14;
        this.vy = this.vy * 0.72 + dy * 0.14;
        this.x += this.vx;
        this.y += this.vy;
        // Alive jitter once at target
        if (Math.hypot(dx, dy) < 3) {
          this.x += (Math.random() - 0.5) * 1.2;
          this.y += (Math.random() - 0.5) * 1.2;
        }
        break;
      }

      case 'scatter': {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.965;
        this.vy *= 0.965;
        // Once slow, transition back to floating ocean
        if (Math.hypot(this.vx, this.vy) < 0.35) {
          this.vx = (Math.random() - 0.5) * 1.5;
          this.vy = (Math.random() - 0.5) * 1.5;
          this.state = 'float';
        }
        break;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.a;
    ctx.fillStyle   = '#000';   // pure black
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}


// ── ParticleSystem ─────────────────────────────────────────────────────────
class ParticleSystem {
  constructor() {
    this.particles   = [];
    this.canvas      = null;
    this.ctx         = null;
    this._raf        = null;
    this._running    = false;
    this._video      = null;       // camera feed for pixelated B&W rendering
    this._pixelCanvas = null;      // offscreen canvas for downscale
    this.PIXEL_SIZE  = 11;         // block size: higher = more pixelated
  }

  /** Attach to a <canvas> element and start the render loop. */
  init(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this._populate();
    this._loop();
  }

  _populate() {
    this.particles = [];
    const { width: w, height: h } = this.canvas;
    for (let i = 0; i < 1000; i++) this.particles.push(new Particle(w, h));
  }

  _loop() {
    this._running = true;
    const step = () => {
      if (!this._running) return;
      const { width: w, height: h } = this.canvas;
      this.particles.forEach(p => p.update(w, h));
      this.ctx.clearRect(0, 0, w, h);
      // Draw pixelated B&W camera frame under particles
      if (this._video && this._video.readyState >= 2) {
        this._drawPixelated(w, h);
      }
      this.particles.forEach(p => p.draw(this.ctx));
      this._raf = requestAnimationFrame(step);
    };
    step();
  }

  /** Attach a video element to render as pixelated B&W background. */
  setVideo(videoEl) {
    this._video = videoEl;
  }

  /** Downscale video → grayscale → upscale with no smoothing = pixel art look. */
  _drawPixelated(w, h) {
    const P  = this.PIXEL_SIZE;
    const pw = Math.ceil(w / P);
    const ph = Math.ceil(h / P);

    if (!this._pixelCanvas) this._pixelCanvas = document.createElement('canvas');
    this._pixelCanvas.width  = pw;
    this._pixelCanvas.height = ph;

    const pc = this._pixelCanvas.getContext('2d');
    // Draw without filter — Safari does not support ctx.filter
    pc.drawImage(this._video, 0, 0, pw, ph);

    // Manual grayscale + contrast (works on all browsers including Safari/iOS)
    const imageData = pc.getImageData(0, 0, pw, ph);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const gray = Math.min(255, (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) * 1.15);
      d[i] = d[i + 1] = d[i + 2] = gray;
    }
    pc.putImageData(imageData, 0, 0);

    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this._pixelCanvas, 0, 0, w, h);
    this.ctx.restore();
  }

  /**
   * Drive particles to spell `text` centred at (cx, cy).
   * Any previously gathered particles are scattered first.
   */
  formText(text, cx, cy) {
    // Scatter existing text particles
    this.particles.forEach(p => {
      if (p.state === 'gather') {
        p.state = 'scatter';
        p.vx = (Math.random() - 0.5) * 20;
        p.vy = (Math.random() - 0.5) * 20;
      }
    });

    const targets = this._sampleText(text.toUpperCase(), cx, cy);
    if (targets.length === 0) return;

    // Shuffle particle pool and assign to targets
    const pool = [...this.particles].sort(() => Math.random() - 0.5);
    const n    = Math.min(targets.length, pool.length);
    for (let i = 0; i < n; i++) {
      pool[i].targetX = targets[i].x;
      pool[i].targetY = targets[i].y;
      pool[i].state   = 'gather';
    }
  }

  /** Scatter only the particles currently forming text. */
  scatterText() {
    this.particles.forEach(p => {
      if (p.state === 'gather') {
        p.state = 'scatter';
        p.vx = (Math.random() - 0.5) * 18;
        p.vy = (Math.random() - 0.5) * 18;
      }
    });
  }

  /** Scatter every particle (celebration / reset). */
  scatterAll() {
    this.particles.forEach(p => {
      p.state = 'scatter';
      p.vx = (Math.random() - 0.5) * 24;
      p.vy = (Math.random() - 0.5) * 24;
    });
  }

  // ── Text Sampling ────────────────────────────────────────────────────────
  _sampleText(text, cx, cy) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Offscreen canvas — same size as main canvas
    const off    = document.createElement('canvas');
    off.width    = w;
    off.height   = h;
    const offCtx = off.getContext('2d');

    // Adaptive font: shrink for long words, cap for short ones
    const maxByWidth = (w * 0.85) / (text.length * 0.55);
    const fontSize   = Math.max(44, Math.min(maxByWidth, 115));

    offCtx.font          = `bold ${fontSize}px 'Courier New', monospace`;
    offCtx.fillStyle     = '#fff';
    offCtx.textAlign     = 'center';
    offCtx.textBaseline  = 'middle';
    offCtx.fillText(text, cx, cy);

    const data    = offCtx.getImageData(0, 0, w, h).data;
    const allTargets = [];

    // Fine step (5px) to densely sample letter pixels
    const step = 5;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (data[(y * w + x) * 4 + 3] > 100) {
          allTargets.push({ x, y });
        }
      }
    }

    // Subsample down to at most 700 targets so we don't exceed particle count
    const MAX = 700;
    if (allTargets.length <= MAX) return allTargets;
    // Random subsample
    for (let i = allTargets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTargets[i], allTargets[j]] = [allTargets[j], allTargets[i]];
    }
    return allTargets.slice(0, MAX);
  }

  stop() {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }
}
