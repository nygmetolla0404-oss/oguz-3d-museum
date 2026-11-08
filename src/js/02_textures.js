// ============================================================================
//  PROCEDURAL TEXTURES (canvas)
// ============================================================================
const TEX = {};
function canvasTex(w, h, draw, repeat = 1, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function speckle(g, w, h, amp, seed = 1) {
  srand(seed); const d = g.getImageData(0, 0, w, h);
  for (let i = 0; i < d.data.length; i += 4) { const n = (rnd() - .5) * amp; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n * .9; }
  g.putImageData(d, 0, 0);
}
function blotches(g, w, h, n, col, rmin, rmax, seed = 2) {
  srand(seed);
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = rnd() * h, r = R(rmin, rmax);
    for (const [ox, oy] of [[0, 0], [w, 0], [-w, 0], [0, h], [0, -h]]) {
      const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
      gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
    }
  }
}
// mud brick / pakhsa walls
function texMud(base = '#b8916a') {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    blotches(g, w, h, 30, 'rgba(90,60,30,.12)', 10, 40, 3); blotches(g, w, h, 20, 'rgba(255,240,210,.12)', 10, 40, 4);
    speckle(g, w, h, 26, 5);
    g.strokeStyle = 'rgba(70,45,22,.30)'; g.lineWidth = 2;
    for (let y = 0; y < h; y += 16) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
      const off = (y / 16) % 2 ? 0 : 16;
      for (let x = off; x < w; x += 32) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 16); g.stroke(); }
    }
  });
}
function texBrick() { // fired brick for mosques/mausolea
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#9a6b45'; g.fillRect(0, 0, w, h);
    srand(9);
    for (let y = 0; y < h; y += 12) { const off = (y / 12) % 2 ? 0 : 14; for (let x = -off; x < w; x += 28) { const l = R(-18, 18); g.fillStyle = `rgb(${190 + l},${140 + l},${95 + l * .8})`; g.fillRect(x + 1, y + 1, 26, 10); } }
    speckle(g, w, h, 18, 10);
  });
}
function texSand(base = '#c9a877', dark = 'rgba(120,90,50,.18)', light = 'rgba(255,240,210,.15)', seed = 1) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    blotches(g, w, h, 60, dark, 20, 70, seed); blotches(g, w, h, 50, light, 20, 70, seed + 1);
    speckle(g, w, h, 30, seed + 2);
  });
}
function texSteppe(base = '#a89468', seed = 11) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    blotches(g, w, h, 70, 'rgba(90,80,45,.25)', 10, 50, seed); blotches(g, w, h, 40, 'rgba(230,215,170,.18)', 20, 80, seed + 1);
    speckle(g, w, h, 34, seed + 2);
    srand(seed + 3); g.strokeStyle = 'rgba(70,60,35,.35)'; g.lineWidth = 1;
    for (let i = 0; i < 900; i++) { const x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + R(-3, 3), y - R(2, 6)); g.stroke(); }
  });
}
// Mangystau limestone / shell rock with pores and lichen
function texLime(base = '#dccdaa', blocks = false, seed = 21, lichen = .5) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    blotches(g, w, h, 40, 'rgba(120,100,70,.16)', 10, 60, seed);
    blotches(g, w, h, Math.round(60 * lichen), 'rgba(205,150,40,.35)', 3, 14, seed + 1);
    blotches(g, w, h, Math.round(40 * lichen), 'rgba(90,95,80,.25)', 3, 12, seed + 2);
    speckle(g, w, h, 40, seed + 3);
    srand(seed + 4); g.fillStyle = 'rgba(60,50,35,.35)';
    for (let i = 0; i < 1400; i++) { const r = R(.5, 2); g.beginPath(); g.arc(rnd() * w, rnd() * h, r, 0, TAU); g.fill(); }
    if (blocks) {
      g.strokeStyle = 'rgba(80,65,45,.45)'; g.lineWidth = 2.5; srand(seed + 5);
      for (let y = 0; y < h; y += 64) {
        g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
        let x = R(0, 60); while (x < w) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); x += R(70, 140); }
      }
    }
  });
}
function texChalk() {
  return canvasTex(256, 512, (g, w, h) => {
    srand(31);
    for (let y = 0; y < h; y += 2) { const v = fbm(0, y * .03, 3); const c = 200 + v * 50; g.fillStyle = `rgb(${c + 10},${c + 2},${c - 18})`; g.fillRect(0, y, w, 2); }
    blotches(g, w, h, 30, 'rgba(160,130,90,.2)', 10, 40, 32); speckle(g, w, h, 20, 33);
  });
}
function texField(c1, c2) {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = c1; g.fillRect(0, 0, w, h); g.fillStyle = c2;
    for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 4, h);
    speckle(g, w, h, 30, 41);
  });
}
function texFelt() {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#efe6d2'; g.fillRect(0, 0, w, h); speckle(g, w, h, 20, 51);
    g.fillStyle = '#8b2a1f'; g.fillRect(0, h * .78, w, h * .08);
    g.strokeStyle = '#8b2a1f'; g.lineWidth = 3;
    for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, h * .78); g.quadraticCurveTo(x + 8, h * .62, x + 16, h * .72); g.quadraticCurveTo(x + 24, h * .62, x + 32, h * .78); g.stroke(); }
  }, 1);
}
// Kazakh ornament band (qoshqar muiz-like)
function drawOrnament(g, x0, y0, w, h, col = '#e8c374', lw = 3) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
  const s = h * .9; const n = Math.ceil(w / s);
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * s + s / 2, cy = y0 + h / 2, r = s * .22;
    g.beginPath(); g.moveTo(cx, cy + r * 1.6); g.lineTo(cx, cy);
    g.bezierCurveTo(cx, cy - r * 1.8, cx - r * 2.2, cy - r * 1.8, cx - r * 2, cy - r * .2);
    g.bezierCurveTo(cx - r * 1.9, cy + r * .8, cx - r * .8, cy + r * .6, cx - r * .9, cy - r * .2);
    g.moveTo(cx, cy);
    g.bezierCurveTo(cx, cy - r * 1.8, cx + r * 2.2, cy - r * 1.8, cx + r * 2, cy - r * .2);
    g.bezierCurveTo(cx + r * 1.9, cy + r * .8, cx + r * .8, cy + r * .6, cx + r * .9, cy - r * .2);
    g.stroke();
  }
  g.beginPath(); g.moveTo(x0, y0 + 2); g.lineTo(x0 + w, y0 + 2); g.moveTo(x0, y0 + h - 2); g.lineTo(x0 + w, y0 + h - 2); g.stroke();
  g.restore();
}
// Kayi-like tamga  (IYI form)
function drawTamga(g, cx, cy, s, col = '#3a2a18', lw = 6) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(cx - s * .55, cy - s * .5); g.lineTo(cx - s * .55, cy + s * .5);
  g.moveTo(cx + s * .55, cy - s * .5); g.lineTo(cx + s * .55, cy + s * .5);
  g.moveTo(cx, cy + s * .5); g.lineTo(cx, cy);
  g.moveTo(cx - s * .3, cy - s * .5); g.lineTo(cx, cy); g.lineTo(cx + s * .3, cy - s * .5);
  g.stroke(); g.restore();
}
// carved stone face: inscription panels + interlace + tamga
function texCarved(kind) {
  return canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#cfc2a2'; g.fillRect(0, 0, w, h); blotches(g, w, h, 40, 'rgba(110,90,60,.2)', 10, 50, 61);
    blotches(g, w, h, 30, 'rgba(200,140,40,.3)', 3, 12, 62); speckle(g, w, h, 34, 63);
    const groove = (fn) => { g.save(); g.strokeStyle = 'rgba(70,55,35,.85)'; g.lineWidth = 7; fn(); g.restore(); g.save(); g.strokeStyle = 'rgba(255,245,220,.35)'; g.lineWidth = 2; g.translate(-2, -2); fn(); g.restore(); };
    if (kind === 'kulpytas') {
      // inscription panel
      groove(() => { g.strokeRect(300, 30, 420, 110); });
      srand(64);
      for (let k = 0; k < 4; k++) groove(() => {
        const x = 320 + k * 100; g.beginPath(); g.moveTo(x, 120); g.bezierCurveTo(x + 10, 50, x + 40, 50, x + 50, 100);
        g.moveTo(x + 55, 60); g.lineTo(x + 55, 125); g.moveTo(x + 62, 90); g.quadraticCurveTo(x + 80, 70, x + 88, 110); g.stroke();
      });
      // interlace band
      groove(() => { g.strokeRect(300, 160, 420, 60); g.beginPath(); for (let x = 310; x < 710; x += 40) { g.moveTo(x, 210); g.bezierCurveTo(x + 10, 165, x + 30, 165, x + 40, 210); } g.stroke(); });
      // round head ornament
      groove(() => { g.beginPath(); g.arc(120, 128, 80, 0, TAU); g.moveTo(170, 128); g.arc(120, 128, 50, 0, TAU); g.stroke(); });
      g.save(); drawTamga(g, 860, 120, 90, 'rgba(70,55,35,.9)', 9); g.restore();
    } else if (kind === 'warrior') {
      groove(() => {
        const cx = w / 2; g.beginPath(); g.arc(cx, 60, 30, 0, TAU);
        g.moveTo(cx, 90); g.lineTo(cx, 190); g.moveTo(cx - 60, 110); g.lineTo(cx, 140); g.lineTo(cx + 60, 110);
        g.moveTo(cx + 60, 110); g.quadraticCurveTo(cx + 120, 170, cx + 70, 230); g.moveTo(cx - 40, 240); g.lineTo(cx, 190); g.lineTo(cx + 40, 240); g.stroke();
      });
    } else if (kind === 'tamga') {
      g.save(); drawTamga(g, w / 2, h / 2, 170, 'rgba(60,45,30,.9)', 14); g.restore();
    } else if (kind === 'saber') {
      groove(() => { g.beginPath(); g.moveTo(80, 150); g.quadraticCurveTo(500, 190, 900, 90); g.lineTo(890, 120); g.quadraticCurveTo(500, 210, 90, 175); g.closePath(); g.moveTo(80, 120); g.lineTo(80, 200); g.stroke(); });
    } else if (kind === 'lines') {
      groove(() => { g.beginPath(); g.moveTo(w * .45, 40); g.lineTo(w * .5, 200); g.lineTo(w * .58, 40); g.moveTo(w * .5, 200); g.lineTo(w * .5, 240); g.stroke(); });
    }
  });
}
function texHerring() {
  return canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = '#cbbd98'; g.fillRect(0, 0, w, h); speckle(g, w, h, 30, 71);
    g.strokeStyle = 'rgba(70,55,35,.75)'; g.lineWidth = 3;
    for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 4); g.lineTo(x + 10, h / 2); g.lineTo(x, h - 4); g.stroke(); }
    blotches(g, w, h, 12, 'rgba(200,140,40,.35)', 3, 9, 72);
  });
}
function texRibs() { // horizontal grooves for sarcophagi
  return canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = '#d4b48a'; g.fillRect(0, 0, w, h); speckle(g, w, h, 24, 81);
    for (let y = 20; y < h; y += 40) { g.fillStyle = 'rgba(90,60,35,.5)'; g.fillRect(0, y, w, 5); g.fillStyle = 'rgba(255,240,215,.3)'; g.fillRect(0, y + 5, w, 2); }
  });
}
function texTerracotta() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#b5683c'; g.fillRect(0, 0, w, h); speckle(g, w, h, 22, 91);
    for (let y = 0; y < h; y += 6) { g.fillStyle = `rgba(80,40,20,${.04 + .04 * Math.sin(y)})`; g.fillRect(0, y, w, 2); }
    g.fillStyle = '#6d2618'; g.fillRect(0, h * .55, w, 14); g.fillRect(0, h * .62, w, 4);
    g.strokeStyle = '#6d2618'; g.lineWidth = 3;
    for (let x = 0; x < w; x += 22) { g.beginPath(); g.moveTo(x, h * .5); g.quadraticCurveTo(x + 11, h * .4, x + 22, h * .5); g.stroke(); }
  });
}
function texMarble() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#17131a'; g.fillRect(0, 0, w, h);
    srand(101); g.strokeStyle = 'rgba(232,195,116,.10)';
    for (let i = 0; i < 40; i++) { g.lineWidth = R(.5, 2); g.beginPath(); let x = rnd() * w, y = rnd() * h; g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += R(-40, 60); y += R(-30, 30); g.lineTo(x, y); } g.stroke(); }
    speckle(g, w, h, 10, 102);
  });
}
function texLattice() {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#efe6d2'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#9b6a3c'; g.lineWidth = 3;
    for (let x = -h; x < w + h; x += 18) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.moveTo(x + h, 0); g.lineTo(x, h); g.stroke(); }
    g.fillStyle = '#8b2a1f'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10);
  });
}
function texCoin() {
  return canvasTex(256, 256, (g, w, h) => {
    const gr = g.createRadialGradient(110, 100, 10, 128, 128, 128); gr.addColorStop(0, '#e2a868'); gr.addColorStop(1, '#8a5428');
    g.fillStyle = gr; g.fillRect(0, 0, w, h); speckle(g, w, h, 30, 111);
    g.strokeStyle = 'rgba(70,35,15,.85)'; g.lineWidth = 4;
    g.beginPath(); g.arc(128, 128, 110, 0, TAU); g.stroke(); g.beginPath(); g.arc(128, 128, 78, 0, TAU); g.stroke();
    srand(112);
    for (let a = 0; a < TAU; a += .32) { const x = 128 + Math.cos(a) * 94, y = 128 + Math.sin(a) * 94; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + R(-8, 8), y + R(-8, 8), x + Math.cos(a + 1.6) * 9, y + Math.sin(a + 1.6) * 9); g.stroke(); }
    drawTamga(g, 128, 128, 80, 'rgba(70,35,15,.9)', 7);
  }, 1);
}
