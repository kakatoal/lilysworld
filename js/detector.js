// ── ObjectDetector ─────────────────────────────────────────────────────────
// Wraps TensorFlow.js COCO-SSD for real-time object detection in the browser.
class ObjectDetector {
  constructor() {
    this.model   = null;
    this.ready   = false;
    this.loading = false;
  }

  /**
   * Load the COCO-SSD model.
   * @param {function} onStatusChange  Called with status strings during loading.
   */
  async load(onStatusChange) {
    if (this.ready || this.loading) return;
    this.loading = true;
    try {
      if (onStatusChange) onStatusChange('Loading AI model…');
      this.model   = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      this.ready   = true;
      this.loading = false;
      if (onStatusChange) onStatusChange('Model ready!');
    } catch (err) {
      this.loading = false;
      console.error('[Detector] Failed to load model:', err);
      if (onStatusChange) onStatusChange('Model failed to load.');
    }
  }

  /**
   * Run inference on a video/canvas element.
   * @param  {HTMLVideoElement} videoEl
   * @returns {{ label: string, score: number, bbox: number[] } | null}
   */
  async detect(videoEl) {
    if (!this.ready || !this.model) return null;
    if (videoEl.readyState < 2) return null; // video not ready yet

    try {
      const predictions = await this.model.detect(videoEl);
      if (!predictions || predictions.length === 0) return null;

      // Pick the highest-confidence prediction above threshold
      const best = predictions.reduce(
        (top, p) => (p.score > top.score ? p : top),
        { score: 0 }
      );

      if (best.score < 0.52) return null;

      return {
        label : best.class.toUpperCase(),
        score : best.score,
        bbox  : best.bbox, // [x, y, width, height] in video pixels
      };
    } catch {
      return null;
    }
  }
}
