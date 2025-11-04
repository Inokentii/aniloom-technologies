# Aniloom Technologies Web Experience

Multi-page marketing site for Aniloom Technologies featuring a cinematic Three.js landing page and supporting sections.

## Pages

- `index.html` — immersive home experience with scroll-driven camera over AI domes, theme & quality toggles.
- `education.html` — placeholder for learning resources.
- `unity-assets.html` — overview of upcoming Unity tooling.
- `world-clock.html` — live clocks for key collaboration cities.
- `test-scene.html` — lightweight Three.js diagnostic scene to verify WebGL rendering.
- `life-weeks.html` — interactive life calendar plotting weeks lived with survival projections.

## Assets & Structure

- `assets/css/styles.css` — shared visual language, translucent panels, responsive layout, light/dark themes.
- `assets/js/theme.js` — theme persistence, quality switch, and global events for the 3D scene.
- `assets/js/main.js` — Three.js scene setup, animated domes, clouds, and scroll-based camera choreography.
- `assets/js/world-clock.js` — timezone rendering for preset collaboration cities.
- `assets/js/test-scene.js` — compact background scene for the diagnostic page.
- `assets/js/life-weeks.js` — renders the life calendar visualization with longevity statistics.

## Usage

Open `index.html` in a modern browser. All pages load locally; no build step is required. The scene favors WebGL 2 capable browsers.

## License

This project follows the terms in `LICENSE` (Creative Commons BY-NC-ND 4.0).
