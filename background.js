/* Multi-bubble animated dot field with Gaussian “lens” distortion.
   - Configurable random delay & movement speed per bubble
   - Dots bright & always visible
   - No mouse interaction (mobile-friendly)
   - Adaptive quality if too heavy (useful when maxDots is large, e.g. 5000)
*/

(() => {
  // ----------------------------- CONFIG ----------------------------- //
  const CONFIG = {
    // Rendering / canvas
    maxDevicePixelRatio: 2,            // cap DPR on mobile for perf
    spacing: 28,                       // px between dots (lower = denser)
    maxDots: 5000,                     // you set this higher; keep adaptiveQuality on
    minDots: 1200,                     // adaptive lower bound
    baseDotRadius: 2.2,                // base dot radius (before scaling)
    dotColor: 'rgba(255,255,255,0.20)',

    // Bubbles
    bubbleCount: 3,                    // number of bubbles
    bubbleMinFrac: 0.10,               // min radius as fraction of min(screen W,H)
    bubbleMaxFrac: 0.18,               // max radius fraction

    // >>> Timing & movement (per-bubble randomized) <<<
    targetChangeMsMin: 1600,           // min delay between picking new targets
    targetChangeMsMax: 2200,           // max delay (higher = longer “rest”)
    centerEaseMin: 0.001,              // min easing toward new center (lower = slower move)
    centerEaseMax: 0.010,              // max easing toward new center (higher = faster)
    radiusEaseMin: 0.001,              // min easing toward new radius
    radiusEaseMax: 0.010,              // max easing toward new radius
    startPhaseDesyncMs: 2000,          // random initial offset so bubbles don't change together

    // Distortion field
    sigmaMult: 0.65,                   // influence radius = bubble.r * sigmaMult
    pullStrength: 0.45,                // positional pull (0..1). Lower = gentler
    minScaleAtCenter: 0.5,             // 0.5 = 2x smaller at center

    // Skip far-away influence: beyond skipSigmaMult * sigma => ignore bubble
    skipSigmaMult: 3.0,

    // Animation
    respectReducedMotion: true,        // freeze on first frame if user prefers
    fpsCap: 0,                         // 0 = uncapped; else set e.g. 30 to cap
    adaptiveQuality: true,             // reduce dot count if frame is slow
    slowFrameMs: 22,                   // ~45 fps threshold
    qualityStep: 200                   // change dots by this amount when adapting
  };
  // ------------------------------------------------------------------ //

  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d', { alpha: true });
  let DPR = Math.min(CONFIG.maxDevicePixelRatio, window.devicePixelRatio || 1);

  let W = 0, H = 0;
  let points = [];
  let spacing = CONFIG.spacing;
  let dotCap = CONFIG.maxDots;

  const reduceMotion = CONFIG.respectReducedMotion &&
                       window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Bubble array
  const bubbles = [];
  function rand(a, b) { return a + Math.random() * (b - a); }

  function newBubble(now) {
    const mid = Math.min(W, H);
    const r = mid * rand(CONFIG.bubbleMinFrac, CONFIG.bubbleMaxFrac);
    const padX = innerWidth * 0.15, padY = innerHeight * 0.15;
    const cx = (padX + Math.random() * (innerWidth - padX * 2)) * DPR;
    const cy = (padY + Math.random() * (innerHeight - padY * 2)) * DPR;

    // Randomize timing & speed per bubble
    const changeInterval = rand(CONFIG.targetChangeMsMin, CONFIG.targetChangeMsMax);
    const cEase = rand(CONFIG.centerEaseMin, CONFIG.centerEaseMax);
    const rEase = rand(CONFIG.radiusEaseMin, CONFIG.radiusEaseMax);

    // Random initial desync so they don't “tick” together
    const phaseOffset = rand(0, CONFIG.startPhaseDesyncMs);

    return {
      cx, cy, r,
      tx: cx, ty: cy, tr: r,
      lastWander: (now || performance.now()) - phaseOffset,
      changeInterval,                  // per-bubble delay
      centerEase: cEase,               // per-bubble center speed
      radiusEase: rEase,               // per-bubble radius speed
      sigma: r * CONFIG.sigmaMult,
      sigma2: (r * CONFIG.sigmaMult) ** 2
    };
  }

  function resize() {
    W = canvas.width  = Math.floor(innerWidth  * DPR);
    H = canvas.height = Math.floor(innerHeight * DPR);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';

    buildGrid();

    // Rebuild bubbles with fresh sizes relative to new viewport
    const now = performance.now();
    bubbles.length = 0;
    for (let i = 0; i < CONFIG.bubbleCount; i++) bubbles.push(newBubble(now));
  }

  function buildGrid() {
    points.length = 0;
    const cols = Math.ceil(innerWidth / spacing);
    const rows = Math.ceil(innerHeight / spacing);
    const total = Math.min(cols * rows, dotCap);
    const sx = (innerWidth  - (cols - 1) * spacing) / 2;
    const sy = (innerHeight - (rows - 1) * spacing) / 2;

    let placed = 0;
    for (let r = 0; r < rows && placed < total; r++) {
      for (let c = 0; c < cols && placed < total; c++) {
        const x = (sx + c * spacing) * DPR;
        const y = (sy + r * spacing) * DPR;
        points.push({ x, y });
        placed++;
      }
    }
  }

  function wanderBubble(b, now) {
    if (now - b.lastWander > b.changeInterval) {
      b.lastWander = now;

      // New target center
      const padX = innerWidth * 0.15, padY = innerHeight * 0.15;
      b.tx = (padX + Math.random() * (innerWidth - padX * 2)) * DPR;
      b.ty = (padY + Math.random() * (innerHeight - padY * 2)) * DPR;

      // New radius
      const minR = Math.min(W, H) * CONFIG.bubbleMinFrac;
      const maxR = Math.min(W, H) * CONFIG.bubbleMaxFrac;
      b.tr = minR + Math.random() * (maxR - minR);

      // New interval & speeds for next hop (keep them evolving)
      b.changeInterval = rand(CONFIG.targetChangeMsMin, CONFIG.targetChangeMsMax);
      b.centerEase = rand(CONFIG.centerEaseMin, CONFIG.centerEaseMax);
      b.radiusEase = rand(CONFIG.radiusEaseMin, CONFIG.radiusEaseMax);
    }
    // Ease center & radius toward targets
    b.cx += (b.tx - b.cx) * b.centerEase;
    b.cy += (b.ty - b.cy) * b.centerEase;
    b.r  += (b.tr - b.r) * b.radiusEase;

    // Update sigma for this bubble
    b.sigma  = b.r * CONFIG.sigmaMult;
    b.sigma2 = b.sigma * b.sigma;
  }

  // Adaptive quality helpers
  let lastFrameTime = performance.now();
  let acc = 0;
  function maybeAdaptQuality(now) {
    if (!CONFIG.adaptiveQuality) return;
    const dt = now - lastFrameTime;
    lastFrameTime = now;

    // Moving “pressure” toward reducing dots if frequently slow
    acc = 0.92 * acc + 0.08 * Math.max(0, dt - CONFIG.slowFrameMs);

    if (acc > 3 && dotCap > CONFIG.minDots) {
      dotCap = Math.max(CONFIG.minDots, dotCap - CONFIG.qualityStep);
      buildGrid();
      acc = 0;
    } else if (acc === 0 && dotCap < CONFIG.maxDots) {
      dotCap = Math.min(CONFIG.maxDots, dotCap + CONFIG.qualityStep);
      buildGrid();
    }
  }

  // FPS cap (optional)
  let lastDraw = 0;
  const frameInterval = CONFIG.fpsCap > 0 ? 1000 / CONFIG.fpsCap : 0;

  function draw(now) {
    // fps cap check
    if (frameInterval && now - lastDraw < frameInterval) {
      requestAnimationFrame(draw);
      return;
    }
    lastDraw = now || performance.now();

    // wander all bubbles
    for (let i = 0; i < bubbles.length; i++) wanderBubble(bubbles[i], lastDraw);

    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();

    const baseR = CONFIG.baseDotRadius * DPR;
    const pull = CONFIG.pullStrength;
    const skipMul = CONFIG.skipSigmaMult;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      // Accumulate influence from all bubbles
      let offx = 0, offy = 0, wSum = 0;

      for (let j = 0; j < bubbles.length; j++) {
        const b = bubbles[j];
        const dx = p.x - b.cx;
        const dy = p.y - b.cy;

        // Skip if outside cutoff (saves exp())
        const cutoff = (skipMul * b.sigma);
        if (Math.abs(dx) > cutoff || Math.abs(dy) > cutoff) continue;
        const d2 = dx * dx + dy * dy;
        if (d2 > cutoff * cutoff) continue;

        // Gaussian falloff
        const w = Math.exp(-d2 / (2 * b.sigma2));

        // Positional lens
        offx += -dx * pull * w;
        offy += -dy * pull * w;

        // For scaling, sum weights; clamp later
        wSum += w;
      }

      const x = p.x + offx;
      const y = p.y + offy;

      // Combined scale from all bubbles (clamped 0..1)
      const wClamped = Math.min(1, wSum);
      const scale = 1.0 - (1.0 - CONFIG.minScaleAtCenter) * wClamped;
      const r = baseR * scale;

      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
    }

    ctx.fillStyle = CONFIG.dotColor;
    ctx.fill();

    maybeAdaptQuality(lastDraw);

    requestAnimationFrame(draw);
  }

  function init() {
    resize();
    if (reduceMotion) {
      // Draw one frame only
      const now = performance.now();
      for (let i = 0; i < bubbles.length; i++) wanderBubble(bubbles[i], now);
      draw(now);
    } else {
      requestAnimationFrame(draw);
    }
  }

  addEventListener('resize', () => {
    // Recompute DPR in case of zoom/device change
    DPR = Math.min(CONFIG.maxDevicePixelRatio, window.devicePixelRatio || 1);
    resize();
  }, { passive: true });

  init();
})();