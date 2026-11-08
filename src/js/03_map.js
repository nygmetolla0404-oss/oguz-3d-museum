// ============================================================================
//  LIVING MAP OF KAZAKHSTAN
// ============================================================================
const KX = 2, KZ = 2.9, LON0 = 66, LAT0 = 47.5;
const P = (lon, lat, y = 0) => new THREE.Vector3((lon - LON0) * KX, y, -(lat - LAT0) * KZ);
const P2 = (lon, lat) => new THREE.Vector2((lon - LON0) * KX, -(lat - LAT0) * KZ); // x,z

// simplified outline (lon,lat) – stylised for an educational map
const ARAL = [[59.6, 43.55], [60.6, 43.9], [61.0, 44.6], [61.15, 45.25], [61.35, 45.65], [61.7, 46.1], [61.45, 46.6], [60.6, 46.75], [59.6, 46.6], [58.7, 46.3], [58.3, 45.7], [58.35, 45.35], [58.2, 44.9], [58.5, 44.2], [59.0, 43.7]];
const KZ_OUT = [
  [46.5, 48.4], [47.0, 49.2], [46.8, 49.9], [47.6, 50.4], [48.7, 50.6], [49.4, 51.1], [50.6, 51.7], [52.3, 51.8], [54.0, 51.2], [55.6, 50.6], [57.2, 50.9], [58.5, 51.1], [59.6, 50.6], [61.6, 51.2],
  [61.0, 52.2], [60.9, 53.0], [61.4, 53.9], [63.0, 54.4], [65.2, 54.6], [67.0, 54.9], [69.2, 55.4], [70.8, 55.2], [71.2, 54.2], [73.0, 54.0], [73.7, 54.4], [76.0, 54.4], [76.8, 53.8], [77.9, 53.3], [79.0, 52.4],
  [80.1, 50.8], [81.4, 50.9], [82.7, 50.8], [83.9, 50.3], [85.0, 49.9], [86.2, 49.5], [87.3, 49.2], [86.7, 48.5], [85.6, 48.1], [85.4, 47.1], [83.0, 47.2], [82.3, 45.6], [80.2, 45.0], [80.5, 44.0],
  [80.3, 43.0], [80.2, 42.2], [79.2, 42.8], [77.5, 42.9], [75.7, 42.8], [74.3, 43.2], [73.5, 42.5], [71.8, 42.8], [70.9, 42.3], [70.0, 41.5], [69.0, 41.3], [68.6, 40.6], [68.0, 41.0], [66.6, 41.1],
  [66.0, 42.0], [66.0, 42.9], [64.9, 43.7], [63.0, 43.9], [61.9, 44.4],
  // notch around the northern Aral Sea
  [61.15, 45.25], [61.35, 45.65], [61.7, 46.1], [61.45, 46.6], [60.6, 46.75], [59.6, 46.6], [58.7, 46.3], [58.3, 45.7], [58.35, 45.35],
  [56.0, 45.0], [56.0, 41.3], [55.4, 41.3], [54.2, 42.3], [53.0, 42.1], [52.5, 41.8],
  [52.8, 42.3], [52.0, 42.9], [51.4, 43.2], [51.2, 43.65], [51.0, 44.1], [50.3, 44.45], [50.8, 44.7], [51.3, 45.0], [51.6, 45.4], [52.6, 45.4], [53.2, 45.3], [53.1, 46.2], [52.0, 46.9], [51.0, 46.9], [50.0, 46.6], [49.2, 46.4], [48.6, 46.7], [48.0, 47.4], [47.2, 47.8]
];
const CASPIAN = [[49.2, 46.4], [50.0, 46.6], [51.0, 46.9], [52.0, 46.9], [53.1, 46.2], [53.2, 45.3], [52.6, 45.4], [51.6, 45.4], [51.3, 45.0], [50.8, 44.7], [50.3, 44.45], [51.0, 44.1], [51.2, 43.65], [51.4, 43.2], [52.0, 42.9], [52.8, 42.3], [52.5, 41.8], [52.9, 40.8], [53.6, 39.6], [53.9, 38.2], [53.0, 36.9], [51.0, 36.7], [49.0, 37.5], [48.9, 38.6], [49.4, 39.6], [49.6, 40.4], [49.0, 41.2], [48.2, 42.0], [47.5, 43.0], [47.3, 44.0], [46.8, 44.7], [47.3, 45.5], [47.9, 46.1], [48.6, 46.3]];
const BALKHASH = [[73.5, 46.2], [74.3, 46.85], [75.3, 46.9], [76.5, 46.65], [77.6, 46.6], [78.7, 46.75], [79.25, 46.5], [79.1, 46.25], [78.0, 46.3], [76.7, 46.35], [75.3, 46.55], [74.6, 46.3], [74.0, 45.85]];
const RIVERS = {
  'Сырдария': [[68.6, 40.75], [68.05, 41.2], [67.95, 41.7], [68.1, 42.3], [68.15, 42.85], [67.9, 43.35], [67.65, 43.85], [67.3, 44.2], [66.7, 44.5], [66.0, 44.65], [65.5, 44.82], [64.7, 44.95], [63.8, 45.3], [63.0, 45.5], [62.1, 45.72], [61.7, 46.08]],
  'Жаңадария': [[65.6, 44.75], [65.0, 44.4], [64.4, 44.0], [63.5, 43.75], [62.4, 43.6], [61.0, 43.85]],
  'Қуаңдария': [[65.3, 44.8], [64.3, 44.62], [63.4, 44.58], [62.4, 44.55], [61.4, 44.75]],
  'Арыс': [[70.3, 42.4], [69.5, 42.38], [68.8, 42.55], [68.25, 42.85]],
  'Жайық': [[51.4, 51.3], [51.5, 50.0], [51.8, 48.5], [51.9, 47.0]],
  'Ертіс': [[85.3, 48.0], [83.6, 48.8], [82.6, 49.9], [80.2, 50.4], [77.0, 52.3], [75.6, 53.6], [74.6, 54.4]],
  'Іле': [[80.2, 43.9], [78.0, 44.0], [76.5, 44.6], [74.9, 45.9]],
  'Шу': [[75.0, 43.0], [73.0, 43.7], [70.8, 44.6], [69.0, 45.3]],
  'Есіл': [[68.0, 50.3], [70.5, 51.2], [71.5, 51.15], [69.3, 53.2], [69.2, 54.9]]
};
const RANGES = [ // mountain chains [points], height
  [[[70.4, 42.6], [72.5, 42.7], [74.5, 42.95], [76.5, 42.95], [78.5, 42.95], [80.1, 42.6]], 1.8],
  [[[78.6, 44.9], [80.0, 45.1], [81.8, 45.3]], 1.4],
  [[[84.0, 49.0], [85.4, 49.3], [86.8, 49.0]], 1.6],
  [[[67.7, 44.2], [68.6, 43.6], [69.5, 43.1], [70.4, 42.75]], .8],
  [[[82.0, 47.4], [84.5, 47.5]], .9],
  [[[73.0, 49.3], [75.5, 49.6]], .55]
];

function mapTexture(minX, maxX, minY, maxY) {
  const W = 1800, H = Math.round(W * (maxY - minY) / (maxX - minX));
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const img = g.createImageData(W, H); const d = img.data;
  const toLL = (px, py) => { const x = minX + px / W * (maxX - minX), y = maxY - py / H * (maxY - minY); return [x / KX + LON0, y / KZ + LAT0]; };
  const rect = (lon, lat, a, b, c2, d2, f) => smooth(0, f, Math.min(lon - a, b - lon, lat - c2, d2 - lat));
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const [lon, lat] = toLL(px, py); const n = fbm(lon * 1.3, lat * 1.3, 4), n2 = fbm(lon * 6, lat * 6, 2);
    const t = smooth(44, 53, lat + (n - .5) * 2.5);
    let r = lerp(206, 112, t), gg = lerp(176, 132, t), b = lerp(116, 70, t);
    const sand = Math.max(rect(lon, lat, 61.5, 67.5, 40.5, 44.6, 1.2), rect(lon, lat, 69, 73.6, 43.4, 45.4, .9), rect(lon, lat, 59.5, 63.2, 45.5, 47.4, .9), rect(lon, lat, 47, 50.5, 46.4, 48.6, 1), rect(lon, lat, 74, 77.3, 44.2, 45.6, .7)) * smooth(.35, .6, n);
    r = lerp(r, 222, sand); gg = lerp(gg, 186, sand); b = lerp(b, 118, sand);
    const ust = rect(lon, lat, 54.5, 58.2, 41.5, 45.6, 1.2) + rect(lon, lat, 50.5, 54, 43, 45.2, 1) * .7;
    r = lerp(r, 214, ust * .7); gg = lerp(gg, 204, ust * .7); b = lerp(b, 176, ust * .7);
    const v = (n2 - .5) * 34; const i = (py * W + px) * 4;
    d[i] = r + v; d[i + 1] = gg + v; d[i + 2] = b + v * .8; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const xy = (lon, lat) => [((lon - LON0) * KX - minX) / (maxX - minX) * W, (maxY - (lat - LAT0) * KZ) / (maxY - minY) * H];
  const stroke = (pts, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, k) => { const [x, y] = xy(p[0], p[1]); k ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); };
  // green flood plains
  for (const pts of Object.values(RIVERS)) { stroke(pts, 34, 'rgba(95,125,60,.18)'); stroke(pts, 16, 'rgba(85,120,55,.25)'); }
  // mountains shading
  for (const [pts] of RANGES) { stroke(pts, 60, 'rgba(90,80,70,.25)'); stroke(pts, 30, 'rgba(70,62,58,.3)'); }
  // Oghuz realm highlight
  const oghuz = [[50.0, 44.0], [52.5, 46.6], [56.5, 47.6], [60.5, 48.2], [64.5, 47.2], [67.6, 45.6], [69.3, 43.6], [68.6, 42.3], [66.5, 42.8], [62.5, 43.2], [58.0, 43.0], [54.0, 42.5], [51.0, 43.0]];
  g.fillStyle = 'rgba(232,170,60,.16)'; g.strokeStyle = 'rgba(190,120,30,.55)'; g.lineWidth = 3; g.setLineDash([14, 10]);
  g.beginPath(); oghuz.forEach((p, k) => { const [x, y] = xy(p[0], p[1]); k ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); g.stroke(); g.setLineDash([]);
  // graticule
  g.strokeStyle = 'rgba(60,40,20,.13)'; g.lineWidth = 1.5;
  for (let lo = 45; lo <= 90; lo += 5) stroke([[lo, 38], [lo, 58]], 1.2, 'rgba(60,40,20,.13)');
  for (let la = 40; la <= 56; la += 5) stroke([[44, la], [90, la]], 1.2, 'rgba(60,40,20,.13)');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

function buildMap() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060912);
  scene.fog = new THREE.FogExp2(0x0b1020, 0.0062);
  const anim = []; const clickables = [];
  const TOP = 0.68;

  scene.add(new THREE.HemisphereLight(0xc8d8ff, 0x3a2a14, .8));
  const sun = new THREE.DirectionalLight(0xffe0b0, 2.2); sun.position.set(-40, 70, 30); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 40, bottom: -40, near: 1, far: 200 }); sun.shadow.bias = -0.0008;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x6fa8ff, .5); rim.position.set(50, 30, -40); scene.add(rim);

  // ground beyond Kazakhstan
  const gtex = texSand('#2a2a2c', 'rgba(0,0,0,.25)', 'rgba(120,110,90,.08)', 201); gtex.repeat.set(30, 30);
  const ground = mesh(new THREE.PlaneGeometry(900, 900), mat(0x3a3530, { map: gtex, roughness: 1 }), 0, -0.02, 0, false, true);
  ground.rotation.x = -PI / 2; scene.add(ground);
  // neighbouring lands faint tint around
  const grat = []; for (let lo = 40; lo <= 95; lo += 5) grat.push(P(lo, 34, .01), P(lo, 60, .01)); for (let la = 35; la <= 60; la += 5) grat.push(P(38, la, .01), P(95, la, .01));
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grat), new THREE.LineBasicMaterial({ color: 0x8a7650, transparent: true, opacity: .18 })));

  // Kazakhstan slab
  const outline = KZ_OUT.map(([lo, la]) => new THREE.Vector2((lo - LON0) * KX, (la - LAT0) * KZ));
  const shape = new THREE.Shape(outline);
  shape.holes.push(new THREE.Path(BALKHASH.map(([lo, la]) => new THREE.Vector2((lo - LON0) * KX, (la - LAT0) * KZ))));
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9; outline.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
  const mtex = mapTexture(minX, maxX, minY, maxY);
  mtex.repeat.set(1 / (maxX - minX), 1 / (maxY - minY)); mtex.offset.set(-minX / (maxX - minX), -minY / (maxY - minY));
  const kgeo = new THREE.ExtrudeGeometry(shape, { depth: .6, bevelEnabled: true, bevelThickness: .08, bevelSize: .08, bevelSegments: 2, curveSegments: 4 });
  kgeo.rotateX(-PI / 2);
  const kz = new THREE.Mesh(kgeo, [mat(0xffffff, { map: mtex, roughness: .95 }), mat(0x5a3d1c, { roughness: .6, metalness: .4 })]);
  kz.position.y = 0; kz.receiveShadow = true; kz.castShadow = true; scene.add(kz);
  // golden border glow
  const bpts = KZ_OUT.map(([lo, la]) => P(lo, la, TOP + .02)); bpts.push(bpts[0].clone());
  const bcurve = new THREE.CatmullRomCurve3(bpts, false, 'catmullrom', 0);
  const border = new THREE.Mesh(new THREE.TubeGeometry(bcurve, 900, .07, 5, false), flowMat(0xc8923a, 0xfff0c0, 0, .3)); scene.add(border); anim.push(border.material);

  // waters
  const wm = waterMat(0x1d5f80, .93, .35); anim.push(wm);
  const mkWater = (pts, y) => { const s = new THREE.Shape(pts.map(([lo, la]) => new THREE.Vector2((lo - LON0) * KX, (la - LAT0) * KZ))); const g = new THREE.ShapeGeometry(s, 8); g.rotateX(-PI / 2); const m = new THREE.Mesh(g, wm); m.position.y = y; scene.add(m); return m; };
  mkWater(CASPIAN, .25); mkWater(ARAL, .25); mkWater(BALKHASH, .3);

  // rivers (glowing tubes)
  const rivMat = flowMat(0x2f9ccf, 0xc8f4ff, 0, 1, .9); anim.push(rivMat);
  for (const [name, pts] of Object.entries(RIVERS)) {
    const curve = new THREE.CatmullRomCurve3(pts.map(([lo, la]) => P(lo, la, TOP + .03)));
    const big = name === 'Сырдария';
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, pts.length * 20, big ? .16 : .08, 6, false), rivMat));
  }

  // mountains (instanced cones)
  srand(301);
  const mGeo = new THREE.ConeGeometry(1, 1, 6, 1); mGeo.translate(0, .5, 0);
  const cones = []; for (const [pts, hgt] of RANGES) {
    const curve = new THREE.CatmullRomCurve3(pts.map(([lo, la]) => P(lo, la, 0)));
    const n = Math.round(curve.getLength() * 2.2);
    for (let i = 0; i < n; i++) { const p = curve.getPointAt(i / n); for (let k = 0; k < 6; k++) cones.push([p.x + R(-1.3, 1.3), p.z + R(-1.1, 1.1), hgt * R(.35, 1.1), R(.35, .85)]); }
  }
  const mIM = new THREE.InstancedMesh(mGeo, mat(0x6c6258, { flatShading: true, roughness: 1 }), cones.length);
  const sIM = new THREE.InstancedMesh(mGeo, mat(0xf4f1ea, { flatShading: true, roughness: .8 }), cones.length);
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), V = new THREE.Vector3();
  let si = 0;
  cones.forEach(([x, z, h, r], i) => {
    Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), R(0, TAU));
    M4.compose(V.set(x, TOP - .05, z), Q, S.set(r, h, r)); mIM.setMatrixAt(i, M4);
    if (h > .9) { M4.compose(V.set(x, TOP - .05 + h * .62, z), Q, S.set(r * .38, h * .38, r * .38)); sIM.setMatrixAt(si++, M4); }
  });
  sIM.count = si; mIM.castShadow = true; mIM.receiveShadow = true; scene.add(mIM, sIM);

  // geo labels
  const geo = [['Каспий теңізі', 50.2, 43.0], ['Арал теңізі', 59.9, 45.2], ['Балқаш', 76.3, 46.0], ['Сырдария', 64.4, 45.35], ['Жаңадария', 63.0, 43.55], ['Қаратау', 69.3, 43.6], ['Үстірт', 56.8, 43.6], ['Қызылқұм', 64.5, 42.3], ['Маңғыстау', 52.5, 44.25], ['ХОРЕЗМ', 60.4, 41.7], ['ЕДІЛ БОЙЫ', 46.3, 47.6], ['МАУЕРАННАХР', 67.6, 40.0], ['ДЕШТІ ҚЫПШАҚ', 66.5, 50.2]];
  for (const [t, lo, la] of geo) { const l = label(t, 'geo'); l.position.copy(P(lo, la, TOP + .3)); scene.add(l); }
  const realm = label('ОҒЫЗ ЖАБҒУЛЫҒЫ · IX–XI ғғ.', 'geo'); Object.assign(realm.element.style, { color: 'rgba(255,215,140,.8)', fontSize: '15px', letterSpacing: '.3em', fontFamily: 'Noto Serif,serif' }); realm.position.copy(P(58.5, 47.4, TOP + .4)); scene.add(realm);
  const cities = [['Қызылорда', 65.5, 44.85], ['Түркістан', 68.25, 43.3], ['Ақтау', 51.2, 43.65], ['Астана', 71.45, 51.17], ['Алматы', 76.9, 43.25], ['Қазалы', 62.1, 45.76], ['Атырау', 51.9, 47.1], ['Шымкент', 69.6, 42.32], ['Бейнеу', 55.1, 45.32]];
  for (const [t, lo, la] of cities) { const l = label(t, 'geo city'); l.position.copy(P(lo, la, TOP + .15)); scene.add(l); }
  for (const [lo, la] of cities) { const d = mesh(new THREE.SphereGeometry(.09, 8, 6), basic(0xffffff, { transparent: true, opacity: .5 }), 0, 0, 0, false, false); d.position.copy(P(lo, la, TOP + .05)); scene.add(d); }

  // site markers
  const markers = {}; const beamTex = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 128; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, 0, 4, 128); return new THREE.CanvasTexture(c); })();
  const side = { jankent: 'L', zhuara: 'R', jent: 'R', kuyuk: 'L', asanas: 'R', sauran: 'L', sutkent: 'L', karnak: 'R', otrar: 'R', sygnak: 'R', kenti: 'R', beyneu: 'R' };
  const ph = { sutkent: 2.6, sygnak: 2.2, karnak: 1.3, sauran: 1.6, otrar: 1.4, jankent: 2.0, zhuara: 1.5, kuyuk: 1.7, jent: 1.9, asanas: 1.6, kenti: 1.8, beyneu: 1.8 };
  C.slides.forEach((s, idx) => {
    if (s.kind !== 'site') return;
    const teal = s.type === 'necropolis'; const col = teal ? 0x5fd4d0 : 0xe8c374;
    const g = new THREE.Group(); g.position.copy(P(s.lon, s.lat, TOP)); scene.add(g);
    const h = ph[s.id] || 1.6;
    const pin = mesh(new THREE.CylinderGeometry(.045, .045, h, 6), mat(col, { emissive: col, emissiveIntensity: .6, metalness: .6, roughness: .3 }), 0, h / 2, 0); g.add(pin);
    const gem = mesh(new THREE.OctahedronGeometry(.3), mat(col, { emissive: col, emissiveIntensity: .9, metalness: .7, roughness: .2 }), 0, h + .25, 0); g.add(gem);
    const ring = mesh(new THREE.RingGeometry(.35, .5, 40), basic(col, { transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }), 0, .03, 0, false, false); ring.rotation.x = -PI / 2; g.add(ring);
    const beam = mesh(new THREE.CylinderGeometry(.22, .22, 9, 16, 1, true), basic(col, { map: beamTex, transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 0, 4.5, 0, false, false); g.add(beam);
    const hit = mesh(new THREE.SphereGeometry(1.1, 8, 6), new THREE.MeshBasicMaterial({ visible: false }), 0, h / 2 + .3, 0, false, false); g.add(hit);
    hit.userData.onClick = () => UI.siteClick(idx); clickables.push(hit);
    const lab = label(`<b>${s.num}</b><span>${shortName(s)}</span>`, 'mlabel' + (teal ? ' teal' : ''), () => UI.siteClick(idx));
    if (side[s.id] === 'L') lab.element.style.flexDirection = 'row-reverse';
    lab.position.set(0, h + .5, 0); g.add(lab);
    markers[s.id] = { g, gem, ring, beam, lab, h, pos: g.position.clone() };
  });

  // caravan routes
  const site = (id) => { const s = C.slides.find(x => x.id === id); return [s.lon, s.lat]; };
  const routes = [
    [[60.6, 41.6], site('kuyuk'), site('jent'), site('zhuara'), site('jankent'), [58.0, 46.9], site('beyneu'), [50.5, 47.6], [47.2, 48.3]],
    [site('jankent'), site('zhuara'), [65.4, 44.95], site('asanas'), site('sygnak'), site('sutkent'), site('sauran'), site('karnak'), site('otrar'), [69.2, 41.4]],
    [site('beyneu'), [53.0, 44.6], site('kenti')],
    [site('beyneu'), [57.5, 43.2], [60.6, 41.6]]
  ];
  const routeMat = flowMat(0xd9a441, 0xfff3c4, 60, 1, .95); anim.push(routeMat);
  const caravans = []; const cTex = softTex(64, 'rgba(255,240,200,1)', 'rgba(255,200,100,0)');
  routes.forEach((r, ri) => {
    const pts = []; for (let i = 0; i < r.length - 1; i++) { const a = P(r[i][0], r[i][1], TOP + .06), b = P(r[i + 1][0], r[i + 1][1], TOP + .06); for (let k = 0; k < 10; k++) { const v = a.clone().lerp(b, k / 10); v.y += Math.sin(k / 10 * PI) * .25; pts.push(v); } }
    pts.push(P(r[r.length - 1][0], r[r.length - 1][1], TOP + .06));
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, pts.length * 6, .05, 4, false), routeMat);
    tube.material = routeMat.clone(); tube.material.uniforms.d.value = curve.getLength() * 1.4; anim.push(tube.material); scene.add(tube);
    for (let k = 0; k < 3; k++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cTex, color: 0xffe7a8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      sp.scale.set(.9, .9, .9); scene.add(sp); caravans.push({ sp, curve, t: k / 3 + ri * .1, speed: .012 + ri * .002 });
    }
  });

  // fog particles + clouds + dust + stars
  const fogTex = softTex(128, 'rgba(255,255,255,.55)', 'rgba(255,255,255,0)');
  const FN = 900; const fpos = new Float32Array(FN * 3); const fvel = [];
  srand(401);
  for (let i = 0; i < FN; i++) { fpos[i * 3] = R(-55, 55); fpos[i * 3 + 1] = R(.9, 4.5); fpos[i * 3 + 2] = R(-30, 26); fvel.push(R(.15, .6)); }
  const fgeo = new THREE.BufferGeometry(); fgeo.setAttribute('position', new THREE.BufferAttribute(fpos, 3));
  const fog = new THREE.Points(fgeo, new THREE.PointsMaterial({ map: fogTex, size: 7, color: 0xd6dcea, transparent: true, opacity: .16, depthWrite: false, sizeAttenuation: true }));
  scene.add(fog);
  const cloudTex = canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 22; i++) { const x = R(50, 206), y = R(90, 166), r = R(25, 60); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }, 1);
  cloudTex.wrapS = cloudTex.wrapT = THREE.ClampToEdgeWrapping;
  const clouds = []; for (let i = 0; i < 16; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, color: 0xdfe6f5, transparent: true, opacity: R(.18, .34), depthWrite: false })); sp.position.set(R(-70, 70), R(7, 13), R(-35, 30)); const s = R(18, 34); sp.scale.set(s, s * .55, 1); sp.userData.v = R(.4, 1.1); scene.add(sp); clouds.push(sp); }
  const DN = 400; const dpos = new Float32Array(DN * 3); for (let i = 0; i < DN; i++) { dpos[i * 3] = R(-40, 10); dpos[i * 3 + 1] = R(.8, 6); dpos[i * 3 + 2] = R(-5, 22); }
  const dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({ map: softTex(32), size: .35, color: 0xffd98a, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(dust);
  const SN = 1500; const spos = new Float32Array(SN * 3); for (let i = 0; i < SN; i++) { const th = R(0, TAU), ph2 = R(.05, 1.3), r = 700; spos[i * 3] = r * Math.sin(ph2) * Math.cos(th); spos[i * 3 + 1] = r * Math.cos(ph2) * .6 + 60; spos[i * 3 + 2] = r * Math.sin(ph2) * Math.sin(th); }
  const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
  scene.add(new THREE.Points(sgeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: .7, fog: false })));

  let active = null;
  return {
    name: 'map', scene, clickables, markers,
    view: { pos: new THREE.Vector3(3, 64, 40), target: new THREE.Vector3(3, 0, -12) },
    limits: { min: 5, max: 160, maxPolar: 1.32 },
    setActive(id) { active = id; for (const [k, m] of Object.entries(markers)) m.lab.element.classList.toggle('active', k === id); },
    update(dt, t) {
      anim.forEach(m => m.uniforms.t.value = t);
      for (const [k, m] of Object.entries(markers)) {
        const a = k === active; const s = 1 + ((t * .8) % 1) * (a ? 2.4 : 1.4);
        m.ring.scale.set(s, s, s); m.ring.material.opacity = (1 - (t * .8) % 1) * (a ? 1 : .7);
        m.gem.rotation.y = t * 1.5; m.gem.position.y = m.h + .25 + Math.sin(t * 2 + m.pos.x) * .08;
        m.beam.material.opacity = a ? .45 : .16; m.gem.scale.setScalar(a ? 1.5 : 1);
      }
      for (const c of caravans) { c.t = (c.t + dt * c.speed) % 1; c.sp.position.copy(c.curve.getPointAt(c.t)); c.sp.position.y += .12; }
      const fp = fgeo.attributes.position; for (let i = 0; i < FN; i++) { let x = fp.getX(i) + fvel[i] * dt; if (x > 55) x = -55; fp.setX(i, x); fp.setY(i, fp.getY(i) + Math.sin(t * .5 + i) * .002); } fp.needsUpdate = true;
      for (const c of clouds) { c.position.x += c.userData.v * dt; if (c.position.x > 75) c.position.x = -75; }
      const dp = dgeo.attributes.position; for (let i = 0; i < DN; i++) { dp.setY(i, dp.getY(i) + Math.sin(t + i * 1.7) * .004); dp.setX(i, dp.getX(i) + Math.cos(t * .3 + i) * .003); } dp.needsUpdate = true;
      dust.material.opacity = .5 + .3 * Math.sin(t * 1.3);
    }
  };
}
function shortName(s) {
  const map = { kenti: 'Кенті-баба · Үштам · Қаңға-баба', beyneu: 'Бейнеу · Гүндіз Алп' };
  return map[s.id] || s.title.split(' (')[0];
}
