// ============================================================================
//  PROCEDURAL MEDIEVAL CITY  (1 unit = 10 m)
// ============================================================================
const CITY_CFG = {
  jankent: { seed: 11, shape: 'rect', W: 58, D: 48, wallH: 1.0, thick: 1.0, towerEvery: 2, gates: [.12, .62], citadel: { x: -17, z: -13, w: 18, d: 14, h: 1.1 }, workshop: [14, 12], yurts: [-48, -30, 16], river: [[-120, 44], [-60, 38], [0, 46], [60, 40], [120, 50]], fields: [[-40, 22, 60, 12]], caravanFrom: [110, -10], banner: true, tobe: .45 },
  jent: { seed: 22, shape: 'rect', W: 40, D: 36, wallH: .9, thick: .9, towerEvery: 2, gates: [.12, .62], citadel: { x: 11, z: -9, w: 12, d: 10, h: .9 }, mosque: [0, 2], minaret: true, river: [[-45, -120], [-38, -40], [-42, 20], [-34, 120]], fields: [[-30, 26, 26, 12]], caravanFrom: [80, 60], yurts: [40, -40, 10], tobe: .4 },
  zhuara: { seed: 33, shape: 'rect', W: 26, D: 22, wallH: .75, thick: .8, towerEvery: 2, gates: [.12], citadel: null, river: [[-100, 30], [-40, 26], [20, 34], [100, 28]], fields: [[-22, 16, 40, 8]], yurts: [-30, -24, 22], caravanFrom: [70, -40], workshop: [5, 4], tobe: .35 },
  asanas: { seed: 44, shape: 'rect', W: 36, D: 30, wallH: .9, thick: .9, towerEvery: 2, gates: [.12, .62], citadel: { x: -9, z: -7, w: 11, d: 9, h: .9 }, moat: true, river: [[-120, 48], [-40, 44], [30, 52], [120, 46]], fields: [[-20, 30, 50, 10]], caravanFrom: [90, -50], yurts: [36, -36, 10], tobe: .4 },
  kuyuk: { seed: 55, shape: 'round', W: 30, D: 26, wallH: .9, thick: 1.1, towerEvery: 2, gates: [.25], citadel: { x: 0, z: -2, w: 9, d: 8, h: .8 }, marsh: true, tobe: .6, yurts: [40, 30, 8] },
  sauran: { seed: 66, shape: 'oval', W: 72, D: 54, wallH: 1.1, thick: 1.2, towerEvery: 3, gates: [0, .5], mosque: [0, 0], madrasa: true, minaret: true, farMinaret: [70, -40], karez: [[0, -110], [0, -30]], fields: [[-50, 34, 100, 14]], caravanFrom: [140, 0], turq: true, tobe: .45 },
  sygnak: { seed: 77, shape: 'rect', W: 36, D: 32, wallH: 1.0, thick: 1.0, towerEvery: 2, gates: [.12, .62], citadel: { x: 0, z: -2, w: 12, d: 10, h: 1.3 }, mosque: [-9, 9], minaret: true, mausoleum: [-48, 26, false], river: [[-120, -45], [-50, -40], [20, -50], [120, -42]], tobe: 1.4, caravanFrom: [90, 50], banner: true, yurts: [44, 30, 10] },
  otrar: { seed: 88, shape: 'poly', pts: [[-30, -18], [-6, -30], [26, -22], [32, 10], [8, 28], [-26, 20]], wallH: 1.1, thick: 1.1, towerEvery: 2, gates: [.05, .55], citadel: { x: 4, z: -12, w: 16, d: 11, h: 1.2 }, mosque: [-8, 6], minaret: true, workshop: [14, 10], bath: [-16, -6], mausoleum: [-62, 34, true], river: [[60, -120], [52, -40], [64, 30], [55, 120]], fields: [[-46, 36, 40, 12]], caravanFrom: [100, 60], turq: true, tobe: 1.0 },
  sutkent: { seed: 99, shape: 'rect', W: 30, D: 26, wallH: .9, thick: .9, towerEvery: 2, gates: [.12, .62], citadel: { x: 8, z: -6, w: 9, d: 8, h: .8 }, hills: true, fields: [[-25, 22, 50, 14]], river: [[-110, 60], [-40, 52], [30, 62], [110, 55]], yurts: [-36, -30, 14], caravanFrom: [80, 40], tobe: .4 },
  karnak: { seed: 111, shape: 'rect', W: 32, D: 28, wallH: .9, thick: .9, towerEvery: 2, gates: [.12, .62], workshop: [6, 6], workshopBig: true, mosque: [-6, -4], minaret: true, fields: [[-30, 24, 60, 12]], caravanFrom: [90, -20], river: [[-110, 50], [-30, 42], [40, 52], [110, 44]], tobe: .45 }
};

function cityPoly(cfg) {
  if (cfg.shape === 'rect') { const w = cfg.W / 2, d = cfg.D / 2; return [new THREE.Vector2(-w, -d), new THREE.Vector2(w, -d), new THREE.Vector2(w, d), new THREE.Vector2(-w, d)]; }
  if (cfg.shape === 'poly') return cfg.pts.map(([x, z]) => new THREE.Vector2(x, z));
  const n = 40, out = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; out.push(new THREE.Vector2(Math.cos(a) * cfg.W / 2 * (1 + .04 * Math.sin(a * 3)), Math.sin(a) * cfg.D / 2)); } return out;
}
function samplePerimeter(poly, step) {
  const seg = []; let L = 0;
  for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; const l = a.distanceTo(b); seg.push({ a, b, l, s: L }); L += l; }
  const n = Math.max(8, Math.round(L / step)); const pts = [];
  for (let i = 0; i < n; i++) {
    const d = i / n * L; const sg = seg.find(s => d >= s.s && d < s.s + s.l) || seg[seg.length - 1];
    const t = (d - sg.s) / sg.l; pts.push({ p: sg.a.clone().lerp(sg.b, t), d, t: d / L });
  }
  return { pts, L, corners: seg.map(s => s.s / L) };
}

// platform mound under a polygon
function mound(poly, h, spread, m) {
  const g = new THREE.ExtrudeGeometry(shapeXZ(poly), { depth: .05, bevelEnabled: true, bevelThickness: h, bevelSize: spread, bevelSegments: 4, curveSegments: 6 });
  g.rotateX(-PI / 2); const o = new THREE.Mesh(g, m); o.receiveShadow = true; o.castShadow = true; return o;
}

function instanced(geo, m, list, cast = true) { // list of {p,r,s,c}
  const im = new THREE.InstancedMesh(geo, m, Math.max(1, list.length)); const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), col = new THREE.Color();
  list.forEach((it, i) => { E.set(it.rx || 0, it.r || 0, it.rz || 0); Q.setFromEuler(E); M.compose(it.p, Q, it.s); im.setMatrixAt(i, M); if (it.c !== undefined) im.setColorAt(i, col.set(it.c)); });
  im.count = list.length; im.castShadow = cast; im.receiveShadow = true; return im;
}
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

function camelGeo() {
  const parts = [];
  const add = (g, x, y, z, rz = 0, sx = 1, sy = 1, sz = 1) => { g.scale(sx, sy, sz); if (rz) g.rotateZ(rz); g.translate(x, y, z); parts.push(g); };
  add(new THREE.SphereGeometry(1, 10, 8), 0, 1.5, 0, 0, 1.15, .55, .45);
  add(new THREE.SphereGeometry(.42, 8, 6), -.38, 2.0, 0); add(new THREE.SphereGeometry(.42, 8, 6), .38, 2.0, 0);
  add(new THREE.CylinderGeometry(.17, .22, 1.1, 6), 1.25, 1.95, 0, -.65);
  add(new THREE.BoxGeometry(.6, .26, .26), 1.75, 2.35, 0);
  for (const [x, z] of [[-.7, .25], [-.7, -.25], [.7, .25], [.7, -.25]]) add(new THREE.CylinderGeometry(.09, .07, 1.25, 5), x, .62, z);
  return mergeGeometries(parts.map(g => g.toNonIndexed()));
}
function yurtGeos() {
  const wall = new THREE.CylinderGeometry(1, 1, .75, 16, 1, true); wall.translate(0, .375, 0);
  const roof = new THREE.SphereGeometry(1.04, 16, 6, 0, TAU, 0, PI * .36); roof.scale(1, .75, 1); roof.translate(0, .58, 0);
  return { wall, roof };
}

function buildCity(slide) {
  const cfg = CITY_CFG[slide.model]; srand(cfg.seed);
  const scene = new THREE.Scene();
  const sunDir = V3(-.5, .55, .35).normalize();
  scene.add(skyDome(0x5d8fc7, 0xf3d6a6, sunDir));
  scene.fog = new THREE.Fog(0xe9cfa2, 120, 420);
  scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x8a6a40, .9));
  const sun = new THREE.DirectionalLight(0xfff0d6, 2.6); sun.position.copy(sunDir).multiplyScalar(150); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 10, far: 400 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = .03;
  scene.add(sun);
  const anim = []; const HS = {}; const recon = new THREE.Group(), ruin = new THREE.Group(); ruin.visible = false; scene.add(recon, ruin);
  const smoke = smokeSystem(scene, 0xe8e2d8, 2.2, 1.6, 6, .3);

  // materials
  const mud = texMud(); mud.repeat.set(.5, .5);
  const mWall = mat(0xffffff, { map: mud });
  const mud2 = texMud('#c9a57a'); const mHouse = mat(0xffffff, { map: mud2 });
  const mRuin = mat(0xd2b48a, { map: texSand('#c7a77c', 'rgba(110,80,45,.2)', 'rgba(255,240,210,.15)', 501) });
  const brick = texBrick(); brick.repeat.set(.6, .6); const mBrick = mat(0xffffff, { map: brick });
  const mTurq = mat(0x2fa7a4, { roughness: .35, metalness: .15 });
  const mDark = mat(0x2a1d12, { roughness: 1 });

  // ground with dunes
  const gtex = texSand('#cfae7c', 'rgba(120,90,50,.2)', 'rgba(255,240,210,.18)', 502); gtex.repeat.set(60, 60);
  const gg = new THREE.PlaneGeometry(800, 800, 160, 160); gg.rotateX(-PI / 2);
  const gp = gg.attributes.position;
  for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), z = gp.getZ(i); const r = Math.hypot(x, z); gp.setY(i, (fbm(x * .015, z * .015, 4) - .45) * 7 * smooth(70, 160, r) + (cfg.hills && z < -60 ? Math.max(0, fbm(x * .02 + 9, z * .02, 4) - .3) * 60 * smooth(-60, -130, z) : 0)); }
  gg.computeVertexNormals();
  const ground = mesh(gg, mat(0xffffff, { map: gtex, roughness: 1 }), 0, 0, 0, false, true); scene.add(ground);
  ground.userData.ground = true;

  const poly = cityPoly(cfg); const tobe = cfg.tobe;
  const tobeM = mound(poly, tobe, 4, mat(0xffffff, { map: gtex })); scene.add(tobeM);
  const base = tobe + .05;

  // ---- walls ------------------------------------------------------------
  const per = samplePerimeter(poly, 2.2); const cen = centroid(poly);
  const gw = 3.2; const isGate = (d) => cfg.gates.some(g => { const gd = g * per.L; let dd = Math.abs(d - gd); dd = Math.min(dd, per.L - dd); return dd < gw / 2 + .6; });
  const walls = [], wallsR = [], merl = [], towers = [], towersR = [], caps = [];
  const N = per.pts.length;
  for (let i = 0; i < N; i++) {
    const a = per.pts[i].p, b = per.pts[(i + 1) % N].p; const mid = a.clone().add(b).multiplyScalar(.5);
    const dmid = (per.pts[i].d + (i + 1 < N ? per.pts[i + 1].d : per.L)) / 2;
    if (isGate(dmid)) continue;
    const len = a.distanceTo(b) + .25, ang = -Math.atan2(b.y - a.y, b.x - a.x);
    walls.push({ p: V3(mid.x, base + cfg.wallH / 2, mid.y), r: ang, s: V3(len, cfg.wallH, cfg.thick) });
    wallsR.push({ p: V3(mid.x, base + .05, mid.y), r: ang, s: V3(len, cfg.wallH * .55, cfg.thick * 2.6) });
    const out = mid.clone().sub(cen).normalize();
    for (const k of [-.25, .25]) { const q = mid.clone().add(new THREE.Vector2(Math.cos(-ang), Math.sin(-ang)).multiplyScalar(k * len)).add(out.clone().multiplyScalar(cfg.thick * .3)); merl.push({ p: V3(q.x, base + cfg.wallH + .12, q.y), r: ang, s: V3(.45, .26, cfg.thick * .4) }); }
  }
  for (let i = 0; i < N; i++) {
    const pt = per.pts[i]; if (isGate(pt.d)) continue;
    const corner = per.corners.some(c => Math.abs(c - pt.t) < .004);
    if (i % cfg.towerEvery && !corner) continue;
    const out = pt.p.clone().sub(cen).normalize().multiplyScalar(.45); const q = pt.p.clone().add(out);
    const r = corner ? 1.15 : .9, h = cfg.wallH * 1.32;
    towers.push({ p: V3(q.x, base + h / 2, q.y), s: V3(r, h, r) }); caps.push({ p: V3(q.x, base + h + .06, q.y), s: V3(r * 1.12, .12, r * 1.12) });
    towersR.push({ p: V3(q.x, base, q.y), s: V3(r * 1.5, cfg.wallH * .7, r * 1.5) });
  }
  if (cfg.shape === 'rect' || cfg.shape === 'poly') poly.forEach(c => {
    const q = c.clone().add(c.clone().sub(cen).normalize().multiplyScalar(.5)); const h = cfg.wallH * 1.4;
    towers.push({ p: V3(q.x, base + h / 2, q.y), s: V3(1.25, h, 1.25) }); caps.push({ p: V3(q.x, base + h + .06, q.y), s: V3(1.4, .12, 1.4) }); towersR.push({ p: V3(q.x, base, q.y), s: V3(2, cfg.wallH * .8, 2) });
  });
  // gates
  const gateObjs = [];
  for (const g of cfg.gates) {
    const d = g * per.L; const i = per.pts.findIndex(p => p.d >= d) % N; const p = per.pts[Math.max(0, i)].p; const nb = per.pts[(Math.max(0, i) + 1) % N].p;
    const tang = nb.clone().sub(p).normalize(); const out = p.clone().sub(cen).normalize(); const ang = -Math.atan2(tang.y, tang.x);
    for (const sgn of [-1, 1]) { const q = p.clone().add(tang.clone().multiplyScalar(sgn * (gw / 2 + .7))).add(out.clone().multiplyScalar(.5)); const h = cfg.wallH * 1.6; towers.push({ p: V3(q.x, base + h / 2, q.y), s: V3(1.3, h, 1.3) }); caps.push({ p: V3(q.x, base + h + .06, q.y), s: V3(1.45, .14, 1.45) }); towersR.push({ p: V3(q.x, base, q.y), s: V3(2, cfg.wallH * .9, 2) }); }
    const lintel = mesh(box(gw + .6, .45, cfg.thick * 1.1), mWall, p.x, base + cfg.wallH * 1.0, p.y); lintel.rotation.y = ang; recon.add(lintel);
    gateObjs.push({ p, out, ang });
  }
  HS.gate = V3(gateObjs[0].p.x, base + cfg.wallH * 2, gateObjs[0].p.y);
  const towerGeo = new THREE.CylinderGeometry(1, 1.12, 1, 14); const unit = new THREE.BoxGeometry(1, 1, 1);
  const ridgeGeo = new THREE.CylinderGeometry(.5, .5, 1, 9, 1); ridgeGeo.rotateZ(PI / 2); ridgeGeo.translate(0, 0, 0);
  const halfRidge = ridgeGeo.clone(); // centered; we lower it so it looks eroded
  recon.add(instanced(unit, mWall, walls), instanced(towerGeo, mWall, towers), instanced(unit, mWall, merl), instanced(new THREE.CylinderGeometry(1, 1, 1, 14), mWall, caps));
  ruin.add(instanced(halfRidge, mRuin, wallsR), instanced(new THREE.SphereGeometry(.5, 10, 6, 0, TAU, 0, PI / 2), mRuin, towersR));
  const wq = per.pts[Math.floor(N * .37)].p; HS.wall = V3(wq.x, base + cfg.wallH + 1.2, wq.y);

  // ---- citadel -----------------------------------------------------------
  let citBox = null;
  if (cfg.citadel) {
    const c = cfg.citadel; citBox = c;
    const cp = [new THREE.Vector2(c.x - c.w / 2, c.z - c.d / 2), new THREE.Vector2(c.x + c.w / 2, c.z - c.d / 2), new THREE.Vector2(c.x + c.w / 2, c.z + c.d / 2), new THREE.Vector2(c.x - c.w / 2, c.z + c.d / 2)];
    const cm = mound(cp, c.h, 2.2, mat(0xffffff, { map: gtex })); cm.position.y = base - .05; scene.add(cm);
    const cb = base + c.h + .05;
    const cper = samplePerimeter(cp, 1.8); const cw = [], ct = [], cr = [];
    cper.pts.forEach((pt, i) => {
      const a = pt.p, b = cper.pts[(i + 1) % cper.pts.length].p; const mid = a.clone().add(b).multiplyScalar(.5); const len = a.distanceTo(b) + .2, ang = -Math.atan2(b.y - a.y, b.x - a.x);
      if (i === Math.floor(cper.pts.length * .62)) return; // citadel gate gap (south side)
      cw.push({ p: V3(mid.x, cb + .4, mid.y), r: ang, s: V3(len, .8, .7) }); cr.push({ p: V3(mid.x, cb, mid.y), r: ang, s: V3(len, .45, 1.6) });
    });
    cp.forEach(q => ct.push({ p: V3(q.x, cb + .55, q.y), s: V3(.85, 1.1, .85) }));
    recon.add(instanced(unit, mWall, cw), instanced(towerGeo, mWall, ct)); ruin.add(instanced(halfRidge, mRuin, cr));
    // palace (orda)
    const pw = c.w * .5, pd = c.d * .42;
    recon.add(mesh(box(pw, .9, pd, 1.5), mBrick, c.x, cb + .45, c.z - c.d * .12));
    const dome = mesh(new THREE.SphereGeometry(pd * .38, 18, 10, 0, TAU, 0, PI / 2), cfg.turq ? mTurq : mBrick, c.x, cb + .9, c.z - c.d * .12); recon.add(dome);
    recon.add(mesh(box(pw * .45, 1.35, .5, 1.5), mBrick, c.x, cb + .675, c.z - c.d * .12 + pd / 2 + .2));
    recon.add(mesh(box(pw * .22, .9, .55), mDark, c.x, cb + .45, c.z - c.d * .12 + pd / 2 + .25, false));
    // side buildings
    recon.add(mesh(box(c.w * .22, .6, c.d * .6, 1.5), mHouse, c.x - c.w * .33, cb + .3, c.z), mesh(box(c.w * .22, .6, c.d * .6, 1.5), mHouse, c.x + c.w * .33, cb + .3, c.z));
    HS.citadel = V3(c.x, cb + 2.6, c.z);
    if (cfg.banner) { // yabgu banner with horse-tail tug
      recon.add(mesh(new THREE.CylinderGeometry(.04, .05, 4, 6), mat(0x4a3420), c.x + pw * .3, cb + 2.9, c.z - c.d * .12));
      const fg = new THREE.PlaneGeometry(1.6, .9, 16, 6); fg.translate(.8, 0, 0);
      const flag = mesh(fg, mat(0x2b7bbf, { side: THREE.DoubleSide, roughness: .8 }), c.x + pw * .3, cb + 4.3, c.z - c.d * .12, true, false);
      recon.add(flag); const fp0 = fg.attributes.position.array.slice();
      anim.push((dt, t) => { const a = fg.attributes.position; for (let i = 0; i < a.count; i++) { const x = fp0[i * 3]; a.setZ(i, Math.sin(x * 3.5 - t * 6) * .12 * x); } a.needsUpdate = true; fg.computeVertexNormals(); });
      const sunE = mesh(new THREE.CircleGeometry(.18, 16), basic(0xffd25a, { side: THREE.DoubleSide }), c.x + pw * .3 + .55, cb + 4.35, c.z - c.d * .12 + .01, false, false); recon.add(sunE);
    }
    // excavation (ruin mode) at citadel gate
    const ex = mesh(box(4, .3, 2.6), mat(0x6b4a2c, { roughness: 1 }), c.x, cb - .05, c.z + c.d / 2 - .4, false); ruin.add(ex);
    for (let k = 0; k < 3; k++) ruin.add(mesh(box(.25, .55, 2.2), mRuin, c.x - 1.2 + k * 1.2, cb + .1, c.z + c.d / 2 - .4));
    ruin.add(mesh(box(3, .55, .25), mRuin, c.x, cb + .1, c.z + c.d / 2 - 1.5));
    HS.excavation = V3(c.x, cb + 1.8, c.z + c.d / 2);
  }

  // ---- streets & houses --------------------------------------------------------
  const center = new THREE.Vector2(cfg.mosque ? cfg.mosque[0] : cen.x, cfg.mosque ? cfg.mosque[1] : cen.y);
  const streets = gateObjs.map(g => [g.p, center]);
  const inner = offsetPoly(poly, -2.6); const houses = [], houses2 = [], bumps = [];
  const hcol = ['#c9a57a', '#d1b086', '#bf9a6e', '#d8b98f', '#c49f73'];
  for (let x = -80; x < 80; x += 3.3) for (let z = -60; z < 60; z += 3.3) {
    const px = x + R(-.4, .4), pz = z + R(-.4, .4);
    if (!inPoly(px, pz, inner)) continue;
    if (citBox && Math.abs(px - citBox.x) < citBox.w / 2 + 3.5 && Math.abs(pz - citBox.z) < citBox.d / 2 + 3.5) continue;
    if (streets.some(([a, b]) => distSeg(px, pz, a, b) < 1.5)) continue;
    if ((cfg.mosque || cfg.madrasa) && Math.hypot(px - center.x, pz - center.y) < 6.5) continue;
    if (cfg.workshop && Math.hypot(px - cfg.workshop[0], pz - cfg.workshop[1]) < (cfg.workshopBig ? 6 : 4)) continue;
    if (cfg.bath && Math.hypot(px - cfg.bath[0], pz - cfg.bath[1]) < 3.5) continue;
    if (rnd() < .12) continue;
    const w = R(1.8, 2.7), d = R(1.8, 2.7), h = R(.32, .5), r = R(-.05, .05), c = pick(hcol);
    houses.push({ p: V3(px, base + h / 2, pz - d * .25), r, s: V3(w, h, d * .5), c });
    houses2.push({ p: V3(px - w * .32, base + h * .45, pz + d * .2), r, s: V3(w * .36, h * .9, d * .45), c });
    if (rnd() < .4) bumps.push({ p: V3(px, base - .05, pz), s: V3(w * .7, R(.12, .25), d * .7) });
    if (rnd() < .05) smoke.add(V3(px, base + h + .1, pz), 4);
  }
  recon.add(instanced(unit, mHouse, houses), instanced(unit, mHouse, houses2));
  ruin.add(instanced(new THREE.SphereGeometry(.5, 8, 5, 0, TAU, 0, PI / 2), mRuin, bumps));
  if (houses.length) { const h0 = houses[Math.floor(houses.length * .55)]; HS.houses = V3(h0.p.x, base + 1.6, h0.p.z); }
  // excavation of houses (ruin)
  if (houses.length) { const h1 = houses[Math.floor(houses.length * .3)].p; ruin.add(mesh(box(5, .25, 4), mat(0x6b4a2c), h1.x, base - .05, h1.z, false)); for (let k = 0; k < 4; k++) ruin.add(mesh(box(k % 2 ? 4.6 : .22, .4, k % 2 ? .22 : 3.6), mRuin, h1.x + (k === 0 ? -2.2 : k === 2 ? 2.2 : 0), base + .05, h1.z + (k === 1 ? -1.7 : k === 3 ? 1.7 : 0))); if (!HS.excavation) HS.excavation = V3(h1.x, base + 1.5, h1.z); }

  // ---- mosque / madrasa / minaret ---------------------------------------------
  if (cfg.mosque) {
    const [mx, mz] = cfg.mosque; const g = new THREE.Group(); g.position.set(mx, base, mz);
    g.add(mesh(box(6, 1.1, 5, 1.5), mBrick, 0, .55, 0));
    g.add(mesh(new THREE.CylinderGeometry(1.5, 1.5, .5, 16), mBrick, 0, 1.35, 0));
    g.add(mesh(new THREE.SphereGeometry(1.5, 20, 10, 0, TAU, 0, PI / 2), cfg.turq ? mTurq : mBrick, 0, 1.6, 0));
    g.add(mesh(box(2.4, 1.8, .7, 1.5), mBrick, 0, .9, 2.7)); g.add(mesh(box(1.1, 1.2, .3), mDark, 0, .6, 3.05, false));
    if (cfg.minaret) { g.add(mesh(new THREE.CylinderGeometry(.28, .45, 3.6, 12), mBrick, 2.6, 1.8, -2.0)); g.add(mesh(new THREE.CylinderGeometry(.42, .32, .4, 12), mBrick, 2.6, 3.8, -2.0)); g.add(mesh(new THREE.ConeGeometry(.3, .5, 12), cfg.turq ? mTurq : mBrick, 2.6, 4.25, -2.0)); HS.minaret = V3(mx + 2.6, base + 5, mz - 2); }
    if (cfg.madrasa) { const md = new THREE.Group(); md.position.set(0, 0, -7.5); for (const [x, z, w, d] of [[0, -2.5, 8, 1.2], [-3.4, 0, 1.2, 6], [3.4, 0, 1.2, 6]]) md.add(mesh(box(w, .8, d, 1.5), mBrick, x, .4, z)); md.add(mesh(box(3, 2, .8, 1.5), mBrick, 0, 1, 2.6)); md.add(mesh(box(1.4, 1.4, .3), mDark, 0, .7, 3.0, false)); g.add(md); }
    recon.add(g); HS.mosque = V3(mx, base + 3.6, mz);
    const mr = mesh(new THREE.SphereGeometry(3.4, 14, 8, 0, TAU, 0, PI / 2), mRuin, mx, base - .1, mz); mr.scale.y = .25; ruin.add(mr);
  }
  if (cfg.farMinaret) {
    const [x, z] = cfg.farMinaret; const g = new THREE.Group(); g.position.set(x, 0, z);
    g.add(mesh(new THREE.CylinderGeometry(.55, .95, 6, 14), mBrick, 0, 3, 0)); g.add(mesh(new THREE.CylinderGeometry(.75, .55, .5, 14), mBrick, 0, 6.2, 0)); g.add(mesh(new THREE.CylinderGeometry(.45, .5, 1, 14), mBrick, 0, 6.9, 0)); g.add(mesh(new THREE.ConeGeometry(.5, .8, 14), mTurq, 0, 7.8, 0));
    recon.add(g); const gr = mesh(new THREE.CylinderGeometry(.6, 1.0, 1.6, 14), mRuin, x, .8, z); ruin.add(gr);
    HS.minaret = V3(x, 9.2, z);
  }
  // ---- workshop: kilns + jars --------------------------------------------------------
  if (cfg.workshop) {
    const [wx, wz] = cfg.workshop; const n = cfg.workshopBig ? 7 : 4; const kilnM = mat(0x9b6b44, { map: brick });
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, r = cfg.workshopBig ? 3.2 : 2; const x = wx + Math.cos(a) * r, z = wz + Math.sin(a) * r;
      recon.add(mesh(new THREE.SphereGeometry(.7, 12, 8, 0, TAU, 0, PI / 2), kilnM, x, base, z));
      recon.add(mesh(new THREE.CylinderGeometry(.12, .15, .5, 8), kilnM, x, base + .8, z));
      smoke.add(V3(x, base + 1.05, z), 6);
    }
    const jarGeo = new THREE.LatheGeometry([[0, 0], [.18, .02], [.26, .2], [.22, .42], [.1, .5], [.11, .58], [0, .58]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
    const jars = []; for (let i = 0; i < 22; i++) jars.push({ p: V3(wx + R(-1.4, 1.4), base, wz + R(-1.4, 1.4)), s: V3(1, 1, 1).multiplyScalar(R(.7, 1.3)) });
    const tt = texTerracotta(); recon.add(instanced(jarGeo, mat(0xffffff, { map: tt }), jars));
    HS.workshop = V3(wx, base + 2.6, wz);
  }
  if (cfg.bath) { const [bx, bz] = cfg.bath; for (const [dx, dz, r] of [[0, 0, 1.1], [1.6, .4, .8], [-1.4, .6, .7], [.3, -1.5, .7]]) recon.add(mesh(new THREE.SphereGeometry(r, 14, 8, 0, TAU, 0, PI / 2), mBrick, bx + dx, base + .4, bz + dz)); recon.add(mesh(box(4.6, .4, 3.6, 1.5), mBrick, bx, base + .2, bz)); }

  // ---- mausoleum outside ----------------------------------------------------------
  if (cfg.mausoleum) {
    const [x, z, turq] = cfg.mausoleum; const g = new THREE.Group(); g.position.set(x, 0, z);
    g.add(mesh(box(4, 3, 4, 1.5), mBrick, 0, 1.5, 0)); g.add(mesh(new THREE.CylinderGeometry(1.7, 1.7, .8, 16), mBrick, 0, 3.4, 0));
    g.add(mesh(new THREE.SphereGeometry(1.7, 20, 10, 0, TAU, 0, PI / 2), turq ? mTurq : mBrick, 0, 3.8, 0));
    g.add(mesh(box(2.6, 4.2, .8, 1.5), mBrick, 0, 2.1, 2.2)); g.add(mesh(box(1.2, 2.0, .3), mDark, 0, 1.0, 2.62, false));
    if (turq) { for (const sx of [-1.5, 1.5]) { g.add(mesh(new THREE.CylinderGeometry(.22, .3, 5, 10), mBrick, sx, 2.5, 2.3)); g.add(mesh(new THREE.ConeGeometry(.26, .5, 10), mTurq, sx, 5.25, 2.3)); } g.add(mesh(new THREE.SphereGeometry(1.1, 16, 8, 0, TAU, 0, PI / 2), mTurq, 0, 2.6, -2.8)); g.add(mesh(box(2.6, 2.6, 2.6, 1.5), mBrick, 0, 1.3, -2.8)); }
    g.rotation.y = .4; scene.add(g); HS.mausoleum = V3(x, 6.5, z);
  }

  // ---- river with reeds and trees ---------------------------------------------------
  if (cfg.river) {
    const rp = smoothPath(cfg.river.map(([x, z]) => new THREE.Vector2(x, z)), 160);
    const wm = waterMat(0x2d6f86, .92, .25); anim.push((dt, t) => wm.uniforms.t.value = t);
    scene.add(new THREE.Mesh(ribbon(rp, i => 9 + Math.sin(i * 12) * 2, .25), wm));
    const bank = new THREE.Mesh(ribbon(rp, 16, .12), mat(0x7c8a4e, { roughness: 1 })); bank.receiveShadow = true; scene.add(bank);
    const reeds = [], crowns = [], trunks = [];
    rp.forEach((p, i) => { if (i % 1) return; for (let k = 0; k < 6; k++) { const side = rnd() < .5 ? -1 : 1; const a = rp[Math.min(i + 1, rp.length - 1)].clone().sub(p).normalize(); const n = new THREE.Vector2(-a.y, a.x).multiplyScalar(side * R(4.5, 7.5)); reeds.push({ p: V3(p.x + n.x, .1, p.y + n.y), rx: R(-.2, .2), rz: R(-.2, .2), s: V3(1, R(.7, 1.4), 1) }); }
      if (i % 3 === 0) { const side = rnd() < .5 ? -1 : 1; const a = rp[Math.min(i + 1, rp.length - 1)].clone().sub(p).normalize(); const n = new THREE.Vector2(-a.y, a.x).multiplyScalar(side * R(8, 14)); const h = R(1.2, 2.2); trunks.push({ p: V3(p.x + n.x, h / 2, p.y + n.y), s: V3(1, h, 1) }); crowns.push({ p: V3(p.x + n.x, h + .7, p.y + n.y), s: V3(R(.7, 1.1), R(1.4, 2), R(.7, 1.1)), c: pick(['#6f8a3c', '#7d9446', '#5f7a34', '#8a9a50']) }); } });
    const reedGeo = new THREE.ConeGeometry(.08, 1.3, 4); reedGeo.translate(0, .65, 0);
    scene.add(instanced(reedGeo, mat(0xb8b064), reeds, false), instanced(new THREE.CylinderGeometry(.08, .12, 1, 5), mat(0x5b4630), trunks), instanced(new THREE.SphereGeometry(1, 8, 6), mat(0xffffff, { roughness: 1 }), crowns));
    const mid = rp[Math.floor(rp.length * .55)]; HS.river = V3(mid.x, 2.5, mid.y);
  }
  // ---- marsh -----------------------------------------------------------
  if (cfg.marsh) {
    const wm = waterMat(0x3b6e6a, .9, .3); anim.push((dt, t) => wm.uniforms.t.value = t);
    const ring = new THREE.Mesh(new THREE.RingGeometry(cfg.W / 2 + 4.5, 90, 64), wm); ring.rotation.x = -PI / 2; ring.position.y = .2; scene.add(ring);
    const reeds = []; for (let i = 0; i < 3000; i++) { const a = R(0, TAU), r = R(cfg.W / 2 + 5, 85); if (fbm(Math.cos(a) * r * .05, Math.sin(a) * r * .05, 3) < .45) continue; reeds.push({ p: V3(Math.cos(a) * r, .2, Math.sin(a) * r), rx: R(-.25, .25), rz: R(-.25, .25), s: V3(1, R(.8, 1.6), 1) }); }
    const reedGeo = new THREE.ConeGeometry(.09, 1.5, 4); reedGeo.translate(0, .75, 0); scene.add(instanced(reedGeo, mat(0xa9a85e), reeds, false));
    HS.marsh = V3(cfg.W / 2 + 14, 2.5, 8);
  }
  // ---- moat ------------------------------------------------------------
  if (cfg.moat) {
    const outer = offsetPoly(poly, 9.5), innerM = offsetPoly(poly, 6.5);
    const s = shapeXZ(outer); s.holes.push(new THREE.Path(innerM.map(p => new THREE.Vector2(p.x, -p.y))));
    const g = new THREE.ShapeGeometry(s); g.rotateX(-PI / 2); const wm = waterMat(0x2f6a7c, .92, .4); anim.push((dt, t) => wm.uniforms.t.value = t);
    const m = new THREE.Mesh(g, wm); m.position.y = .12; scene.add(m);
    const bank = new THREE.Mesh(new THREE.ShapeGeometry((() => { const s2 = shapeXZ(offsetPoly(poly, 10.5)); s2.holes.push(new THREE.Path(offsetPoly(poly, 5.8).map(p => new THREE.Vector2(p.x, -p.y)))); return s2; })()).rotateX(-PI / 2), mat(0x6e6a44)); bank.position.y = .06; scene.add(bank);
    const q = outer[1]; HS.moat = V3(q.x - 6, 2, q.y - 2);
  }
  // ---- fields -------------------------------------------------------------
  if (cfg.fields) for (const [fx, fz, fw, fd] of cfg.fields) {
    const cols = [['#7f9447', '#6c8239'], ['#c9b45c', '#b39c48'], ['#90a352', '#7b8e44'], ['#a7a35a', '#918d4b']];
    let x = fx; let k = 0; while (x < fx + fw) { const w = R(5, 9); const [c1, c2] = cols[k++ % cols.length]; const t = texField(c1, c2); t.repeat.set(w / 3, 1); const f = mesh(new THREE.PlaneGeometry(w - .6, fd), mat(0xffffff, { map: t, roughness: 1 }), x + w / 2, .14, fz + fd / 2, false, true); f.rotation.x = -PI / 2; f.rotation.z = R(-.03, .03); scene.add(f); x += w; }
    const wm = waterMat(0x3a7f95, .9, .5); anim.push((dt, t) => wm.uniforms.t.value = t);
    const canal = mesh(new THREE.PlaneGeometry(fw, .6), wm, fx + fw / 2, .17, fz - .4, false, false); canal.rotation.x = -PI / 2; scene.add(canal);
    HS.fields = V3(fx + fw * .5, 2.2, fz + fd / 2);
  }
  // ---- karez ---------------------------------------------------------------
  if (cfg.karez) { const [a, b] = cfg.karez.map(([x, z]) => new THREE.Vector2(x, z)); const n = Math.floor(a.distanceTo(b) / 3.5); const ks = []; for (let i = 0; i < n; i++) { const p = a.clone().lerp(b, i / n); ks.push({ p: V3(p.x + Math.sin(i * .5) * 1.5, 0, p.y), s: V3(.8, .3, .8) }); } scene.add(instanced(new THREE.TorusGeometry(1, .5, 6, 10).rotateX(PI / 2), mRuin, ks)); const m = a.clone().lerp(b, .5); HS.karez = V3(m.x + 2, 2.5, m.y); }
  if (cfg.hills) HS.hills = V3(-20, 14, -110);

  // ---- yurts (nomad camp) -----------------------------------------------------
  if (cfg.yurts) {
    const [yx, yz, n] = cfg.yurts; const { wall, roof } = yurtGeos(); const ws = [], rs = []; const felt = texFelt();
    for (let i = 0; i < n; i++) { const a = i / n * TAU + R(-.2, .2), r = R(3, 9); const x = yx + Math.cos(a) * r, z = yz + Math.sin(a) * r; const s = R(.45, .6); ws.push({ p: V3(x, 0, z), s: V3(s, s, s), r: R(0, TAU) }); rs.push({ p: V3(x, 0, z), s: V3(s, s, s) }); if (rnd() < .3) smoke.add(V3(x, s * 1.4, z), 4); }
    scene.add(instanced(wall, mat(0xffffff, { map: felt, side: THREE.DoubleSide }), ws), instanced(roof, mat(0xf0e8d6), rs));
    // horses
    const hg = camelGeo(); const horses = []; for (let i = 0; i < 8; i++) horses.push({ p: V3(yx + R(-12, 12), 0, yz + R(10, 16) * (yz > 0 ? -1 : 1)), r: R(0, TAU), s: V3(.16, .14, .16), c: pick(['#5a3a22', '#2e2018', '#8a6a48', '#d8cdb8']) });
    scene.add(instanced(hg, mat(0xffffff), horses));
    HS.yurts = V3(yx, 2.4, yz);
  }
  // ---- caravan ------------------------------------------------------------------
  const camels = [];
  if (cfg.caravanFrom && gateObjs.length) {
    const g0 = gateObjs[0]; const start = new THREE.Vector2(...cfg.caravanFrom);
    const pts = [start, start.clone().lerp(g0.p, .5).add(new THREE.Vector2(R(-10, 10), R(-10, 10))), g0.p.clone().add(g0.out.clone().multiplyScalar(8)), g0.p.clone(), g0.p.clone().lerp(center, .5), center.clone()];
    const curve = new THREE.CatmullRomCurve3(pts.map((p, i) => V3(p.x, i >= 3 ? base : 0, p.y)));
    const cg = camelGeo(); const cm = mat(0xa07850); const bag = new THREE.BoxGeometry(.5, .45, .9);
    for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(cg, cm); c.scale.setScalar(.2); c.castShadow = true; const b = mesh(bag, mat(pick([0x8b2a1f, 0x2b5f8f, 0x6b4a2c])), 0, 2.15, 0); c.add(b); scene.add(c); camels.push({ c, off: i * .018 }); }
    let tt = 0; anim.push((dt) => { tt = (tt + dt * .012) % 1; camels.forEach(({ c, off }) => { const u = ((tt - off) % 1 + 1) % 1; const p = curve.getPointAt(u), q = curve.getPointAt(Math.min(1, u + .002)); c.position.copy(p); c.position.y += Math.abs(Math.sin(u * 900)) * .02; c.rotation.y = -Math.atan2(q.z - p.z, q.x - p.x); c.visible = u < .985; }); });
    const hp = curve.getPointAt(.3); HS.caravan = V3(hp.x, 2.2, hp.z);
  }
  // scattered saxaul bushes
  const bushes = []; for (let i = 0; i < 500; i++) { const a = R(0, TAU), r = R(cfg.W * .7 + 10, 200); bushes.push({ p: V3(Math.cos(a) * r, 0, Math.sin(a) * r), s: V3(1, 1, 1).multiplyScalar(R(.3, .8)), r: R(0, TAU) }); }
  scene.add(instanced(new THREE.IcosahedronGeometry(1, 0), mat(0xa39a70, { flatShading: true }), bushes, false));

  const hsList = buildHotspots(scene, slide, HS, ruin);
  const vr = Math.max(cfg.W || 60, cfg.D || 50);
  return {
    name: 'site', scene, clickables: [], hotspots: hsList,
    view: { pos: V3(vr * .55, vr * .62 + 8, vr * 1.05), target: V3(0, 1, 0) },
    limits: { min: 3, max: 220, maxPolar: 1.48 }, hsDist: 18,
    toggleRuin(on) { recon.visible = !on; ruin.visible = on; hsList.forEach(h => { if (h.key === 'excavation') h.obj.visible = on; }); },
    hasRuin: true,
    update(dt, t) { anim.forEach(f => f(dt, t)); smoke.update(dt); }
  };
}

// hotspot pins (CSS2D) ---------------------------------------------------------
function buildHotspots(scene, slide, HS, ruinGroup) {
  const out = [];
  const keys = Object.keys(HS);
  const order = Object.keys(slide.hotspots || {}).filter(k => HS[k]).concat(keys.filter(k => !(slide.hotspots || {})[k]));
  for (const key of order) {
    const spec = (slide.hotspots || {})[key] || C.generic[key]; if (!spec) continue;
    const audio = (slide.hotspots || {})[key] ? `hs_${slide.id}_${key}` : `gen_${key}`;
    const data = { key, ...spec, audio, pos: HS[key].clone() };
    const obj = label(`i<span class="tip">${spec.title}</span>`, 'hs', () => UI.openHotspot(data, obj));
    obj.position.copy(HS[key]); scene.add(obj);
    if (key === 'excavation') obj.visible = false;
    out.push({ key, obj, data });
  }
  return out;
}
