# Particle World 🌊

An AR text adventure game that runs in your browser. Point your camera at real-world objects — blue particles swarm together and spell out what they see. Discover **10 objects** to complete your mission.

## How to Play

1. Open the game in a browser that supports camera access (Chrome / Edge / Safari)
2. Click **START SCANNING** and allow camera permissions
3. Hold everyday objects in front of the camera
4. Watch blue particles gather and form the object's name
5. Scan 10 **different** objects to win!

## What Can Be Scanned?

The AI (COCO-SSD) recognises ~80 common objects, including:

> person · chair · couch · cup · bottle · book · laptop · phone ·
> keyboard · mouse · clock · vase · plant · tv · remote · backpack ·
> umbrella · scissors · toothbrush · and many more…

## Run Locally

No build step needed — pure HTML, CSS, and JavaScript.

```bash
# Python 3
python -m http.server 8080
# then open http://localhost:8080
```

Or use the **VS Code Live Server** extension.

> **Note:** The AI model (~5 MB) is loaded from CDN on first launch — an internet connection is required.

## Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch / `/ (root)`
4. Your game will be live at `https://<your-username>.github.io/<repo-name>/`

## Tech Stack

| Layer | Technology |
|---|---|
| Camera | WebRTC `getUserMedia` |
| Object detection | TensorFlow.js + COCO-SSD |
| Particle engine | HTML5 Canvas + `requestAnimationFrame` |
| Hosting | GitHub Pages |

## Visual Design

- Everything is built from **blue glowing particles** (`hsl 193–221°`)
- **Float state** — particles drift like a calm blue ocean
- **Gather state** — particles swarm and form the detected object's name
- **Scatter state** — particles explode and dissolve back into the ocean
