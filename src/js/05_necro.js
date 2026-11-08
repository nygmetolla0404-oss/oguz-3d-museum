// ============================================================================
//  MANGYSTAU NECROPOLES  (1 unit = 1 m) – modelled after the project photos
// ============================================================================
function steppeScene(opts) {
  const scene = new THREE.Scene();
  const sunDir = opts.sunDir.clone().normalize();
  scene.add(skyDome(opts.top, opts.hor, sunDir, opts.sunCol));
  scene.fog = new THREE.Fog(opts.hor, 60, 330);
  scene.add(new THREE.HemisphereLight(0xd6e6ff, 0x8a7350, opts.hemi || .85));
  const sun = new THREE.DirectionalLight(opts.sunCol, opts.sunI || 2.8); sun.position.copy(sunDir).multiplyScalar(80); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 5, far: 220 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = .02;
  scene.add(sun);
  const gtex = texSteppe(opts.ground || '#ad9a70', opts.seed || 11); gtex.repeat.set(70, 70);
  const gg = new THREE.PlaneGeometry(700, 700, 140, 140); gg.rotateX(-PI / 2);
  const gp = gg.attributes.position;
  for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), z = gp.getZ(i); const r = Math.hypot(x, z); gp.setY(i, (fbm(x * .03, z * .03, 4) - .5) * 1.2 * smooth(15, 60, r) + (fbm(x * .3, z * .3, 2) - .5) * .06); }
  gg.computeVertexNormals();
  const ground = mesh(gg, mat(0xffffff, { map: gtex, roughness: 1 }), 0, 0, 0, false, true); ground.userData.ground = true; scene.add(ground);
  // dry grass tufts
  srand(opts.seed || 5); const tufts = [];
  for (let i = 0; i < 2600; i++) { const a = R(0, TAU), r = Math.sqrt(rnd()) * 120; tufts.push({ p: V3(Math.cos(a) * r, 0, Math.sin(a) * r), r: R(0, TAU), s: V3(1, 1, 1).multiplyScalar(R(.18, .5)), c: pick(['#c2ad7a', '#b09d6c', '#cdb784', '#a69a6a', '#bba97c']) }); }
  const tuftGeo = new THREE.IcosahedronGeometry(1, 0); tuftGeo.scale(1, .55, 1); tuftGeo.translate(0, .3, 0);
  scene.add(instanced(tuftGeo, mat(0xffffff, { flatShading: true, roughness: 1 }), tufts, false));
  return scene;
}

// --- building blocks ------------------------------------------------------------
function headstoneGeo(w, h, t) { // slab with rounded top
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, PI, false); s.lineTo(-w / 2, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 1 }); g.translate(0, 0, -t / 2); return g;
}
function wallArch(w, h, t, aw, ah) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.lineTo(-w / 2, 0);
  const hole = new THREE.Path(); hole.moveTo(-aw / 2, .02); hole.lineTo(aw / 2, .02); hole.lineTo(aw / 2, ah - aw / 2); hole.absarc(0, ah - aw / 2, aw / 2, 0, PI, false); hole.lineTo(-aw / 2, .02); s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }); g.translate(0, 0, -t / 2);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * .5, uv.getY(i) * .5); return g;
}
function sarcophagus(m, mRib, x, z, r = 0, opts = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r;
  const L = opts.L || 1.7;
  g.add(mesh(rockGeo(1.0, .1, L + .6, x * 3 + z, .1, .05, 3), m, 0, .05, 0));
  if (opts.plain) g.add(mesh(new RoundedBoxGeometry(.5, .38, L, 2, .04), m, 0, .3, 0));
  else { const b = mesh(new RoundedBoxGeometry(.5, .42, L, 2, .05), [m, m, m, m, m, m], 0, .32, 0); b.material = mRib; g.add(b); }
  if (!opts.noHeads) for (const sz of [-1, 1]) { const hs = mesh(headstoneGeo(.36, .72, .12), m, 0, .1, sz * (L / 2 + .08)); g.add(hs); }
  return g;
}
function gabledTomb(m, mDark, x, z, r, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r; g.scale.setScalar(s);
  const nSl = 2 + Math.floor(rnd() * 3);
  for (let i = 0; i < nSl; i++) g.add(mesh(rockGeo(R(.8, 1.3), R(.1, .18), R(.7, 1.2), x + i * 7, .1, .08, 3), m, R(-.6, .6), .06, R(-.4, .4)));
  const prof = new THREE.Shape(); prof.moveTo(-.28, 0); prof.lineTo(.28, 0); prof.lineTo(.28, .5); prof.lineTo(0, .72); prof.lineTo(-.28, .5); prof.lineTo(-.28, 0);
  const pg = new THREE.ExtrudeGeometry(prof, { depth: 1.4, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 1 }); pg.translate(0, 0, -.7);
  const uv = pg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * .4, uv.getY(i) * .4);
  g.add(mesh(pg, m, 0, .14, 0));
  for (const sx of [-1, 1]) g.add(mesh(box(.02, .32, 1.0), mDark, sx * .295, .42, 0, false));
  if (rnd() < .5) g.add(mesh(box(.75, .14, 1.7), m, 0, .07, 0));
  return g;
}
function ramStone(m, mHerr, x, z, r = 0, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r; g.scale.setScalar(s);
  g.add(mesh(rockGeo(1.25, .78, .7, 7 + x, .15, .06, 4), m, 0, .39, 0));
  g.add(mesh(new RoundedBoxGeometry(1.65, .14, .95, 2, .03), m, 0, .85, 0));
  g.add(mesh(new RoundedBoxGeometry(1.15, .12, .62, 2, .03), m, 0, .98, 0));
  for (let k = 0; k < 3; k++) { const rb = mesh(new RoundedBoxGeometry(1.05 - k * .02, .1, .5 - k * .02, 2, .04), mHerr, 0, 1.09 + k * .1, 0); g.add(rb); }
  const roll = mesh(new THREE.CylinderGeometry(.27, .27, 1.05, 18), m, 0, 1.4, 0); roll.rotation.z = PI / 2; g.add(roll);
  return g;
}
function kulpytas(m, mCarve, x, z, r = 0, h = 1.6) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r;
  const pillar = mesh(box(.3, h, .3), mCarve ? [m, m, m, m, mCarve, m] : m, 0, h / 2, 0); g.add(pillar);
  const cap = mesh(new THREE.ConeGeometry(.24, .32, 4), m, 0, h + .16, 0); cap.rotation.y = PI / 4; g.add(cap);
  g.add(mesh(box(.42, .16, .42), m, 0, .08, 0));
  return g;
}
function steppedTomb(m, x, z, r = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r;
  [[1.05, .62], [.88, .5], [.72, .42]].forEach(([w, d], i) => g.add(mesh(new RoundedBoxGeometry(w, .24, d, 2, .03), m, 0, .12 + i * .24, 0)));
  const roll = mesh(new THREE.CylinderGeometry(.17, .17, .74, 14), m, 0, .86, 0); roll.rotation.z = PI / 2; g.add(roll);
  return g;
}
function stackedEnclosure(m, x, z, w, d, h, r = 0, gapSide = 2) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r; const list = [];
  const rows = Math.round(h / .17);
  const sides = [[V3(-w / 2, 0, -d / 2), V3(w / 2, 0, -d / 2)], [V3(w / 2, 0, -d / 2), V3(w / 2, 0, d / 2)], [V3(w / 2, 0, d / 2), V3(-w / 2, 0, d / 2)], [V3(-w / 2, 0, d / 2), V3(-w / 2, 0, -d / 2)]];
  sides.forEach(([a, b], si) => {
    const L = a.distanceTo(b); const dir = b.clone().sub(a).normalize(); const ang = -Math.atan2(dir.z, dir.x);
    for (let k = 0; k < rows; k++) {
      let s = (k % 2) * .3; while (s < L) {
        const l = R(.45, .85); const t = Math.min(s + l / 2, L - .1);
        if (si === gapSide && Math.abs(t - L / 2) < .5 && k > 0) { s += l; continue; }
        const top = k === rows - 1 && rnd() < .35;
        const p = a.clone().add(dir.clone().multiplyScalar(t));
        list.push({ p: V3(p.x + R(-.03, .03), .085 + k * .17 + (rnd() < .1 ? .03 : 0), p.z + R(-.03, .03)), r: ang + R(-.06, .06), rz: R(-.04, .04), s: V3(l * .97, .15, R(.38, .5)) });
        if (top) list[list.length - 1].p.y += .02;
        s += l;
      }
    }
  });
  g.add(instanced(new RoundedBoxGeometry(1, 1, 1, 1, .08), m, list)); return g;
}
function domedMausoleum(m, x, z, r = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r;
  g.add(mesh(box(3.4, 2.8, 3.4, 1.4), m, 0, 1.4, 0));
  g.add(mesh(box(3.6, .18, 3.6, 1.4), m, 0, 2.89, 0));
  const drum = mesh(new THREE.CylinderGeometry(1.35, 1.45, .7, 8), m, 0, 3.33, 0); drum.rotation.y = PI / 8; g.add(drum);
  for (let k = 0; k < 4; k++) { const c = mesh(new THREE.CylinderGeometry(1.3 - k * .3, 1.38 - k * .3, .38, 8), m, 0, 3.87 + k * .38, 0); c.rotation.y = PI / 8; g.add(c); }
  g.add(mesh(new THREE.ConeGeometry(.22, .6, 8), m, 0, 5.6, 0));
  g.add(mesh(box(.8, 1.3, .2), mat(0x241a10), 0, .65, 1.71, false));
  return g;
}

function buildKenti(slide) {
  const scene = steppeScene({ top: 0x2f6fd0, hor: 0xcfe0f2, sunDir: V3(.45, .7, .5), sunCol: 0xfff3dc, ground: '#a9986f', seed: 17 });
  const HS = {}; const anim = []; srand(1234);
  const lime = texLime('#ddd0ad', true, 21, .6); lime.repeat.set(.5, .5);
  const limeP = texLime('#d8cfb4', false, 22, .9); limeP.repeat.set(1, 1);
  const pink = texLime('#d8b9a2', true, 23, .4); pink.repeat.set(.5, .5);
  const mBlock = mat(0xffffff, { map: lime }); const mStone = mat(0xffffff, { map: limeP }); const mPink = mat(0xffffff, { map: pink });
  const mGray = mat(0xc9c4b4, { map: limeP });
  const mWarm = mat(0xffffff, { map: (() => { const t = texLime('#e6c89a', false, 24, .2); return t; })() });
  const rib = texRibs(); const mRib = mat(0xffffff, { map: rib });
  const herr = texHerring(); const mHerr = mat(0xffffff, { map: herr });
  const mDark = mat(0x2b261e);
  const saber = new THREE.MeshStandardMaterial({ map: texCarved('saber'), roughness: .95 });

  // ---------- Kenti-baba zone -------------------------------------------------
  // Mausoleum A: tall tapered square tower with dentil frieze
  const A = new THREE.Group(); A.position.set(-5, 0, -3); A.rotation.y = .12; scene.add(A);
  const ag = new THREE.BoxGeometry(4.4, 6, 4.4, 1, 6, 1); const ap = ag.attributes.position;
  for (let i = 0; i < ap.count; i++) { const y = ap.getY(i); const k = lerp(1, .9, (y + 3) / 6); ap.setX(i, ap.getX(i) * k); ap.setZ(i, ap.getZ(i) * k); }
  boxUV(ag, 4.4, 6, 4.4, 2); ag.computeVertexNormals();
  A.add(mesh(ag, mBlock, 0, 3, 0));
  A.add(mesh(box(4.1, .22, 4.1, 2), mBlock, 0, 6.1, 0));
  A.add(mesh(box(.75, 1.15, .3), mDark, 0, .58, 2.12, false));
  A.add(mesh(box(.6, .4, .1), mStone, 0, 5.55, 2.0));
  for (let gI = -1; gI <= 1; gI++) for (let k = 0; k < 5; k++) A.add(mesh(box(.12, .22, .08), mDark, gI * 1.2 + (k - 2) * .2, 5.1, 2.02, false));
  // stele in front (photo)
  const st = mesh(rockGeo(.7, 1.1, .35, 3, .7, .1), mWarm, -3.2, .55, 1.2); st.rotation.y = .3; scene.add(st);
  HS.maus_a = V3(-5, 7.6, -3);

  // Mausoleum B: open-roof stepped enclosure with arched doorway, sarcophagi inside
  const B = new THREE.Group(); B.position.set(3.6, 0, -2.6); B.rotation.y = .12; scene.add(B);
  const Wd = 4.8, Dd = 4.4, T = .5;
  B.add(mesh(box(Wd, 2.7, T, 1.5), mBlock, 0, 1.35, -Dd / 2 + T / 2)); // back
  B.add(mesh(wallArch(Wd, 2.3, T, 1.0, 1.75), mBlock, 0, 0, Dd / 2 - T / 2)); // front with arch
  // left wall (straight) and right wall with stepped top
  B.add(mesh(box(T, 2.5, Dd - T * 2, 1.5), mBlock, -Wd / 2 + T / 2, 1.25, 0));
  [[2.7, -1.3], [2.3, 0], [1.9, 1.3]].forEach(([h, z]) => B.add(mesh(box(T, h, 1.3, 1.5), mBlock, Wd / 2 - T / 2, h / 2, z * .9)));
  B.add(mesh(box(Wd - T * 2, .04, Dd - T * 2), mat(0x8a5a36, { roughness: 1 }), 0, .02, 0, false));
  // sarcophagi as in the photo
  B.add(sarcophagus(mWarm, mRib, -1.15, -.25, 0, { L: 1.6 }));
  B.add(sarcophagus(mWarm, mRib, .35, .55, PI / 2 + .05, { L: 1.4 }));
  B.add(sarcophagus(mWarm, mRib, .95, -1.1, PI / 2, { plain: true, noHeads: true, L: 1.1 }));
  B.add(sarcophagus(mWarm, mRib, -1.3, 1.25, PI / 2, { plain: true, noHeads: true, L: .9 }));
  // ritual pole with cloth
  B.add(mesh(new THREE.CylinderGeometry(.035, .045, 2.6, 6), mat(0x5a4028), -.3, 1.3, -.4));
  const cl = mesh(new THREE.PlaneGeometry(.12, .3), mat(0xf4f0e6, { side: THREE.DoubleSide }), -.24, 1.9, -.4, false, false); B.add(cl);
  // arkhar horns pile
  for (let k = 0; k < 9; k++) { const hrn = mesh(new THREE.TorusGeometry(.22, .05, 6, 12, PI * 1.3), mat(0xcdbb98), 1.55 + R(-.3, .3), .15 + R(0, .25), 1.45 + R(-.3, .3)); hrn.rotation.set(R(0, PI), R(0, PI), R(0, PI)); B.add(hrn); }
  // loose stones
  for (let k = 0; k < 4; k++) B.add(mesh(rockGeo(R(.3, .5), R(.25, .4), R(.2, .3), k * 3, .5), mWarm, R(-1.8, 1.8), .15, -1.8 + R(0, .2)));
  HS.maus_b = V3(3.6, 4.0, -2.6); HS.horns = B.localToWorld(V3(1.55, 1.1, 1.45));
  B.updateMatrixWorld(); HS.horns = B.localToWorld(V3(1.55, 1.0, 1.45));
  const insideCam = { pos: B.localToWorld(V3(0, 1.75, 1.6)), target: B.localToWorld(V3(-.2, .35, -.8)) };

  // tombs around Kenti-baba
  scene.add(ramStone(mStone, mHerr, 7, 5, -.3)); HS.ram = V3(7, 2.6, 5);
  scene.add(steppedTomb(mGray, 3.5, 6.5, .1)); scene.add(kulpytas(mGray, null, 3.5, 6.0, .1, 1.7));
  scene.add(steppedTomb(mGray, 1.3, 7.6, -.05)); scene.add(kulpytas(mGray, null, 1.3, 7.1, -.05, 1.3));
  const sk = kulpytas(mGray, saber, -6.5, 5, .2, 1.9); scene.add(sk); scene.add(steppedTomb(mGray, -6.5, 5.6, .2)); HS.saber = V3(-6.5, 2.8, 5);
  scene.add(kulpytas(mGray, saber, -8.5, 2.5, -.2, 1.5));
  for (let i = 0; i < 10; i++) { const x = R(-14, 14), z = R(8, 18); if (rnd() < .5) scene.add(steppedTomb(mGray, x, z, R(-.2, .2))); else scene.add(sarcophagus(mGray, mGray, x, z, R(-.2, .2), { plain: true })); if (rnd() < .6) scene.add(kulpytas(mGray, rnd() < .3 ? saber : null, x, z - .55, R(-.2, .2), R(1.1, 1.8))); }
  const zK = label('Кенті-баба', 'zone'); zK.position.set(0, 9, -3); scene.add(zK);

  // ---------- Qanga-baba field ---------------------------------------------------
  const kx = -32, kz = 6;
  for (let i = 0; i < 42; i++) { const x = kx + R(-11, 11), z = kz + R(-9, 9); scene.add(gabledTomb(mGray, mDark, x, z, R(-.25, .25) + .1, R(.8, 1.15))); }
  for (let i = 0; i < 8; i++) { const x = kx + R(-10, 10), z = kz + R(-8, 8), L = R(3, 6), r = R(0, PI); const s = mesh(box(L, .25, .3, 1), mGray, x, .12, z); s.rotation.y = r; scene.add(s); }
  HS.kanga = V3(kx, 3, kz);
  const zQ = label('Қаңға-баба', 'zone'); zQ.position.set(kx, 4.5, kz - 10); scene.add(zQ);

  // ---------- Ushtam -----------------------------------------------------------
  const ux = 30, uz = -8;
  scene.add(stackedEnclosure(mGray, ux, uz, 4.4, 3.4, 1.05, .15, 2));
  scene.add(stackedEnclosure(mGray, ux + 7, uz - 2, 3.6, 3, .9, .1, 0));
  scene.add(stackedEnclosure(mGray, ux - 4, uz - 7, 5, 3.6, 1.2, .05, 2));
  HS.ushtam = V3(ux, 2.4, uz);
  scene.add(domedMausoleum(mPink, ux + 6, uz - 14, .1)); scene.add(domedMausoleum(mPink, ux - 6, uz - 18, -.1)); scene.add(domedMausoleum(mPink, ux + 15, uz - 10, .2));
  scene.add(steppedTomb(mGray, ux + 2, uz + 7, 0)); scene.add(kulpytas(mGray, null, ux + 2, uz + 6.4, 0, 1.7));
  scene.add(steppedTomb(mGray, ux - .5, uz + 8.4, .05)); scene.add(kulpytas(mGray, null, ux - .5, uz + 7.8, .05, 2.1));
  HS.kumbez = V3(ux + 6, 7.2, uz - 14);
  const zU = label('Үштам', 'zone'); zU.position.set(ux + 4, 8.5, uz - 12); scene.add(zU);
  // chalk mesa behind (as in the Ushtam photo)
  const chalk = texChalk(); chalk.repeat.set(6, 1);
  const mes = new THREE.CylinderGeometry(30, 46, 18, 40, 6); const mp = mes.attributes.position;
  for (let i = 0; i < mp.count; i++) { const x = mp.getX(i), y = mp.getY(i), z = mp.getZ(i); const n = fbm(x * .08, z * .08 + y * .05, 3); const k = 1 + (n - .5) * .5; mp.setX(i, x * k); mp.setZ(i, z * k); if (y > 8) mp.setY(i, y + (n - .5) * 4); }
  mes.computeVertexNormals();
  const mesa = mesh(mes, mat(0xffffff, { map: chalk, roughness: 1 }), 60, 8, -80, true, true); mesa.scale.set(1.4, 1, .8); scene.add(mesa);
  const mesa2 = mesa.clone(); mesa2.position.set(-50, 6, -110); mesa2.scale.set(1.8, .7, .7); scene.add(mesa2);
  // modern fence line (as in photo) – subtle
  for (let i = 0; i < 40; i++) scene.add(mesh(new THREE.CylinderGeometry(.04, .04, 1, 4), mat(0x6d5a40), ux - 20 + i * 1.6, .5, uz - 26));

  // scattered stones
  const stones = []; for (let i = 0; i < 260; i++) stones.push({ p: V3(R(-60, 60), 0, R(-40, 40)), r: R(0, TAU), rx: R(-.2, .2), s: V3(R(.15, .6), R(.08, .25), R(.15, .5)) });
  scene.add(instanced(new THREE.DodecahedronGeometry(1, 0), mGray, stones));

  const hsList = buildHotspots(scene, slide, HS);
  return {
    name: 'site', scene, clickables: [], hotspots: hsList,
    view: { pos: V3(16, 18, 34), target: V3(0, 1.5, 0) },
    limits: { min: .6, max: 140, maxPolar: 1.52 }, hsDist: 9,
    inside: insideCam,
    update(dt, t) { cl.rotation.y = Math.sin(t * 2) * .4; }
  };
}

function buildBeyneu(slide) {
  const scene = steppeScene({ top: 0x6f9fd8, hor: 0xf1d9b4, sunDir: V3(-.8, .32, .25), sunCol: 0xffd9a0, sunI: 3.0, hemi: .7, ground: '#a58f66', seed: 29 });
  const HS = {}; srand(4321);
  const limeP = texLime('#cfc6b0', false, 31, 1.0); const mStone = mat(0xffffff, { map: limeP });
  const limeY = texLime('#d6c39a', false, 32, 1.2); const mStoneY = mat(0xffffff, { map: limeY });
  const carveK = new THREE.MeshStandardMaterial({ map: texCarved('kulpytas'), roughness: .95 });
  const carveW = new THREE.MeshStandardMaterial({ map: texCarved('warrior'), roughness: .95 });
  const carveT = new THREE.MeshStandardMaterial({ map: texCarved('tamga'), roughness: .95 });
  const carveL = new THREE.MeshStandardMaterial({ map: texCarved('lines'), roughness: .95 });

  // main slab enclosure (photo: big broken slab box)
  const E = new THREE.Group(); E.position.set(0, 0, 0); scene.add(E);
  const ring = [[-2.2, -1.4], [-1, -1.6], [.3, -1.6], [1.6, -1.5], [2.4, -.6], [2.4, .6], [1.5, 1.5], [.2, 1.6], [-1.1, 1.5], [-2.3, .7], [-2.4, -.4]];
  ring.forEach(([x, z], i) => { const up = rnd() < .45; const w = R(1.0, 1.6), h = up ? R(.6, 1.0) : R(.22, .35), d = up ? R(.18, .28) : R(.6, 1.0); const s = mesh(rockGeo(w, h, d, i * 13, .2, .07), rnd() < .5 ? mStone : mStoneY, x, h / 2 - .05, z); s.rotation.y = Math.atan2(z, x) + PI / 2 + R(-.3, .3); s.rotation.z = up ? R(-.35, .35) : R(-.1, .1); E.add(s); });
  for (let i = 0; i < 9; i++) { const s = mesh(rockGeo(R(.6, 1.4), R(.15, .3), R(.4, .9), 50 + i, .2, .08), mStone, R(-3.5, 3.5), .1, R(-3, 3)); s.rotation.y = R(0, TAU); s.rotation.z = R(-.4, .4); E.add(s); }
  HS.enclosure = V3(0, 2.2, 0);

  // upright slab box (photo)
  const SB = new THREE.Group(); SB.position.set(-9, 0, 6); SB.rotation.y = .4; scene.add(SB);
  [[0, -.6, 1.6, 1.0, .24, 0, 0], [.85, 0, .24, 1.1, 1.2, 0, .12], [-.85, 0, .24, .9, 1.2, 0, -.1], [-.1, .65, 1.0, 1.05, .26, .35, 0]].forEach(([x, z, w, h, d, tx, tz], i) => { const s = mesh(rockGeo(w, h, d, 80 + i, .25, .06), mStoneY, x, h / 2 - .05, z); s.rotation.x = tx; s.rotation.z = tz; SB.add(s); });
  for (let i = 0; i < 18; i++) SB.add(mesh(new THREE.IcosahedronGeometry(R(.08, .16), 0), mat(0x8a7448, { flatShading: true }), R(-.6, .6), R(.2, .7), R(-.4, .4)));
  HS.slabbox = V3(-9, 2.1, 6);

  // fallen carved kulpytas with round scroll head (photo)
  const K = new THREE.Group(); K.position.set(6.5, 0, 4.5); K.rotation.y = -.35; scene.add(K);
  K.add(mesh(box(2.7, .34, .38), [mStone, mStone, carveK, mStone, mStone, mStone], 0, .17, 0));
  const head = mesh(new THREE.CylinderGeometry(.34, .34, .3, 24), [mStone, carveK, mStone], -1.55, .3, 0); head.rotation.x = 0; head.rotation.z = 0; K.add(head);
  const head2 = mesh(new THREE.CylinderGeometry(.18, .18, .28, 18), mStone, -1.25, .22, .12); K.add(head2);
  HS.carved = V3(6.5, 1.5, 4.5);

  // warrior stela (photo)
  const W = mesh(rockGeo(.8, 1.55, .5, 99, .55, .07), [mStoneY, mStoneY, mStoneY, mStoneY, carveW, mStoneY], -4, .75, -7); W.rotation.y = .5; scene.add(W);
  scene.add(mesh(rockGeo(1.2, .3, .7, 98, .2, .1), mStoneY, -3.8, .12, -6.5));
  HS.warrior = V3(-4, 2.4, -7);
  // rounded upright kulpytas (photo)
  const U = mesh(rockGeo(.62, .95, .32, 77, .7, .07), [mStone, mStone, mStone, mStone, carveL, mStone], 5, .47, -5.5); U.rotation.y = -.4; scene.add(U);
  scene.add(mesh(rockGeo(.9, .35, .6, 76, .5, .1), mStone, 5.5, .15, -5)); HS.stone = V3(5, 1.9, -5.5);
  // tamga on a flat stone at ground level (photo)
  const TS = mesh(rockGeo(1.1, .14, .9, 66, .3, .05), [mStoneY, mStoneY, carveT, mStoneY, mStoneY, mStoneY], 1.5, .04, 8); TS.rotation.y = .3; scene.add(TS);
  const glow = new THREE.PointLight(0xffc870, 0, 3); glow.position.set(1.5, .6, 8); scene.add(glow);
  HS.tamga = V3(1.5, 1.2, 8);

  // further graves in the distance
  for (let i = 0; i < 26; i++) { const a = R(0, TAU), r = R(12, 50); const x = Math.cos(a) * r, z = Math.sin(a) * r; const g = new THREE.Group(); g.position.set(x, 0, z); for (let k = 0; k < 4; k++) { const s = mesh(rockGeo(R(.5, 1.1), R(.15, .5), R(.3, .7), i * 10 + k, .3, .08), mStone, R(-1, 1), .12, R(-.8, .8)); s.rotation.y = R(0, TAU); g.add(s); } if (rnd() < .5) g.add(mesh(rockGeo(.4, R(.7, 1.1), .25, i, .7, .07), mStoneY, 0, .45, 0)); scene.add(g); }
  const stones = []; for (let i = 0; i < 300; i++) stones.push({ p: V3(R(-60, 60), 0, R(-50, 50)), r: R(0, TAU), s: V3(R(.1, .45), R(.05, .2), R(.1, .4)) });
  scene.add(instanced(new THREE.DodecahedronGeometry(1, 0), mStone, stones));
  const zB = label('Гүндіз Алп әскербасының қорымы', 'zone'); zB.position.set(0, 4.2, -2); scene.add(zB);

  const hsList = buildHotspots(scene, slide, HS);
  return {
    name: 'site', scene, clickables: [], hotspots: hsList,
    view: { pos: V3(11, 8, 16), target: V3(0, .6, 0) },
    limits: { min: .6, max: 110, maxPolar: 1.52 }, hsDist: 5,
    update(dt, t) { glow.intensity = UI.hsActive === 'tamga' ? 2 + Math.sin(t * 4) : 0; }
  };
}
