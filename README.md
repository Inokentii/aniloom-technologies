# Aniloom Technologies

One-tool-per-category affiliate landing page. Fast, static, deploys on GitHub Pages.

## Live
https://<username>.github.io/<repo>/

## Structure
- index.html        # markup
- styles.css        # tokens, layout
- background.js     # animated dot-field + bubble lens (config at top)

## Local preview
Just open index.html in a browser.
(Or use a local server: `npx serve`)

## Deploy (GitHub Pages)
Settings → Pages → Source: main / root → Save.

## Config knobs (background.js)
- bubbleCount, bubbleMinFrac, bubbleMaxFrac
- targetChangeMsMin/Max (delay between moves)
- centerEaseMin/Max, radiusEaseMin/Max (movement speed)
- spacing, maxDots (density), pullStrength, sigmaMult, minScaleAtCenter

## License
CC BY-NC-ND 4.0
