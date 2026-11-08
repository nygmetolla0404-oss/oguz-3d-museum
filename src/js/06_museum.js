// ============================================================================
//  VIRTUAL MUSEUM HALL
// ============================================================================
function lathe(pts, seg = 32) { return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg); }

const ARTIFACTS = {
  jug() {
    const g = new THREE.Group(); const m = mat(0xffffff, { map: texTerracotta(), roughness: .8 });
    g.add(mesh(lathe([[0, 0], [.2, 0], [.28, .1], [.34, .3], [.3, .5], [.16, .66], [.12, .8], [.15, .9], [.13, .92], [0, .92]]), m));
    const h = mesh(new THREE.TorusGeometry(.17, .035, 8, 16, PI * 1.2), m, .2, .65, 0); h.rotation.z = -PI * .35; g.add(h);
    return g;
  },
  khum() {
    const g = new THREE.Group(); const t = texTerracotta(); const m = mat(0xd9a07a, { map: t, roughness: .85 });
    g.add(mesh(lathe([[0, 0], [.18, 0], [.38, .25], [.46, .55], [.42, .85], [.26, 1.0], [.24, 1.08], [.28, 1.1], [0, 1.1]]), m));
    return g;
  },
  lamp() {
    const g = new THREE.Group(); const m = mat(0xffffff, { map: texTerracotta(), roughness: .8 });
    g.add(mesh(lathe([[0, 0], [.18, 0], [.24, .06], [.2, .14], [.08, .18], [.06, .22], [0, .22]]), m, 0, .3, 0));
    const sp = mesh(new THREE.CylinderGeometry(.045, .07, .3, 10), m, .3, .38, 0); sp.rotation.z = PI / 2.4; g.add(sp);
    const hd = mesh(new THREE.TorusGeometry(.07, .025, 6, 12), m, -.24, .42, 0); g.add(hd);
    const flame = mesh(new THREE.SphereGeometry(.05, 8, 6), basic(0xffb347), .43, .47, 0, false, false); flame.scale.y = 1.8; g.add(flame);
    const pl = new THREE.PointLight(0xffa040, 1.2, 2); pl.position.set(.43, .55, 0); g.add(pl); g.userData.flame = flame;
    return g;
  },
  coin() {
    const g = new THREE.Group(); const t = texCoin(); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    const side = mat(0x9a5c2a, { metalness: .8, roughness: .35 }); const face = mat(0xffffff, { map: t, metalness: .75, roughness: .38 });
    const c = mesh(new THREE.CylinderGeometry(.4, .4, .05, 48), [side, face, face], 0, .55, 0); c.rotation.x = PI / 2; g.add(c); return g;
  },
  sword() {
    const g = new THREE.Group();
    const s = new THREE.Shape(); s.moveTo(0, -.03); s.quadraticCurveTo(.6, -.02, 1.15, .12); s.lineTo(1.2, .16); s.quadraticCurveTo(.6, .05, 0, .03); s.lineTo(0, -.03);
    const blade = mesh(new THREE.ExtrudeGeometry(s, { depth: .01, bevelEnabled: true, bevelThickness: .006, bevelSize: .008, bevelSegments: 1 }), mat(0xdfe6ee, { metalness: .95, roughness: .2 }), 0, 0, 0); g.add(blade);
    g.add(mesh(box(.04, .16, .06), mat(0xc9a14a, { metalness: .9, roughness: .3 }), -.02, 0, .005));
    const grip = mesh(new THREE.CylinderGeometry(.025, .025, .28, 8), mat(0x3d2414), -.17, -.02, .005); grip.rotation.z = PI / 2 - .12; g.add(grip);
    g.add(mesh(new THREE.SphereGeometry(.035, 10, 8), mat(0xc9a14a, { metalness: .9, roughness: .3 }), -.32, -.04, .005));
    g.rotation.z = .5; g.position.set(-.35, .45, 0); const w = new THREE.Group(); w.add(g); return w;
  },
  arrows() {
    const g = new THREE.Group(); const m = mat(0x5a4a3c, { metalness: .6, roughness: .6 });
    for (let i = 0; i < 3; i++) { const a = new THREE.Group(); const hd = mesh(new THREE.ConeGeometry(.06, .22, 4), m, 0, .11, 0); hd.scale.z = .35; a.add(hd); a.add(mesh(new THREE.CylinderGeometry(.012, .012, .14, 6), m, 0, -.07, 0)); a.rotation.z = (i - 1) * .45; a.position.set((i - 1) * .2, .5, 0); g.add(a); }
    g.add(mesh(box(.8, .05, .35), mat(0x3a2c22), 0, .3, 0)); return g;
  },
  tamga() {
    const t = new THREE.MeshStandardMaterial({ map: texCarved('tamga'), roughness: .95 }); const m = mat(0xffffff, { map: texLime('#d2c5a5', false, 41, .7) });
    return mesh(rockGeo(.5, .8, .2, 5, .6, .06), [m, m, m, m, t, m], 0, .4, 0);
  },
  ram() { const herr = texHerring(); const g = ramStone(mat(0xffffff, { map: texLime('#d8cfb4', false, 42, .8) }), mat(0xffffff, { map: herr }), 0, 0, 0, .55); return g; },
  kobyz() {
    const g = new THREE.Group(); const wood = mat(0x7a4a26, { roughness: .55 });
    const body = mesh(new THREE.SphereGeometry(.22, 20, 14, 0, TAU, 0, PI / 2), wood, 0, .3, 0); body.scale.set(1, 1.5, .8); body.rotation.x = PI; g.add(body);
    g.add(mesh(new THREE.CircleGeometry(.22, 20), mat(0xe9dcc0, { side: THREE.DoubleSide }), 0, .3, 0)).children;
    const skin = g.children[1]; skin.rotation.x = -PI / 2; skin.scale.set(1, .8, 1);
    g.add(mesh(box(.07, .55, .06), wood, 0, .58, -.05));
    const hd = mesh(new THREE.TorusGeometry(.1, .03, 8, 16, PI * 1.3), wood, -.05, .92, -.05); hd.rotation.z = PI * .2; g.add(hd);
    for (const x of [-.02, .02]) g.add(mesh(new THREE.CylinderGeometry(.004, .004, .7, 4), basic(0xf5ebd8), x, .55, .02, false, false));
    const bow = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(V3(.25, .2, .12), V3(.45, .55, .12), V3(.3, .95, .12)), 20, .012, 5), wood); g.add(bow);
    g.rotation.x = -.25; g.position.y = .1; const w = new THREE.Group(); w.add(g); return w;
  },
  yurt() {
    const g = new THREE.Group(); const lat = texLattice(); lat.repeat.set(3, 1);
    g.add(mesh(new THREE.CylinderGeometry(.42, .42, .3, 24, 1, true), mat(0xffffff, { map: lat, side: THREE.DoubleSide }), 0, .45, 0));
    const roof = mesh(new THREE.SphereGeometry(.44, 24, 8, 0, TAU, 0, PI * .36), mat(0xffffff, { map: texFelt(), side: THREE.DoubleSide }), 0, .5, 0); roof.scale.y = .7; g.add(roof);
    g.add(mesh(new THREE.TorusGeometry(.09, .015, 6, 20), mat(0x9b6a3c), 0, .78, 0)).children; g.children[2].rotation.x = PI / 2;
    g.add(mesh(box(.14, .2, .02), mat(0x8b2a1f), 0, .4, .42));
    return g;
  }
};

function buildMuseum(slide) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b090e); scene.fog = new THREE.Fog(0x0b090e, 18, 40);
  scene.add(new THREE.HemisphereLight(0x8a7a9a, 0x2a1e10, 1.1));
  const R0 = 16, H = 7;
  const marble = texMarble(); marble.repeat.set(4, 4);
  const floor = mesh(new THREE.CircleGeometry(R0, 64), mat(0xffffff, { map: marble, roughness: .25, metalness: .3 }), 0, 0, 0, false, true); floor.rotation.x = -PI / 2; floor.userData.ground = true; scene.add(floor);
  // golden inlay rings on floor
  for (const r of [3.2, 6.6, 11.4]) { const ring = mesh(new THREE.RingGeometry(r, r + .06, 96), basic(0xb8862f, { side: THREE.DoubleSide }), 0, .005, 0, false, false); ring.rotation.x = -PI / 2; scene.add(ring); }
  // walls with ornament band
  const wallTex = canvasTex(2048, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#120e14'); gr.addColorStop(1, '#2a1f1c'); g.fillStyle = gr; g.fillRect(0, 0, w, h); drawOrnament(g, 0, h * .12, w, h * .14, '#b8862f', 4); drawOrnament(g, 0, h * .72, w, h * .1, '#7a5a26', 3); speckle(g, w, h, 8, 7); }, 1);
  wallTex.repeat.set(4, 1);
  scene.add(mesh(new THREE.CylinderGeometry(R0, R0, H, 64, 1, true), mat(0xffffff, { map: wallTex, side: THREE.BackSide, roughness: .9 }), 0, H / 2, 0, false, true));
  const ceil = mesh(new THREE.CircleGeometry(R0, 64), mat(0x0d0a10, { side: THREE.DoubleSide }), 0, H, 0, false, false); ceil.rotation.x = PI / 2; scene.add(ceil);
  // central shanyrak emblem
  const sh = new THREE.Group(); sh.position.set(0, 2.2, 0); scene.add(sh);
  const gold = mat(0xe8c374, { metalness: 1, roughness: .25, emissive: 0x3a2508 });
  sh.add(mesh(new THREE.TorusGeometry(1.1, .08, 12, 64), gold));
  for (let k = 0; k < 3; k++) { const b = mesh(new THREE.CylinderGeometry(.04, .04, 2.2, 8), gold); b.rotation.z = PI / 2; b.rotation.y = k * PI / 3; sh.add(b); }
  for (let k = 0; k < 3; k++) { const b = mesh(new THREE.TorusGeometry(.75, .035, 8, 40, PI), gold); b.rotation.y = k * PI / 3 + PI / 6; sh.add(b); }
  scene.add(mesh(new THREE.CylinderGeometry(1.3, 1.5, .5, 48), mat(0x1c1418, { roughness: .4, metalness: .3 }), 0, .25, 0));
  for (let k = 0; k < 8; k++) { const wl = new THREE.PointLight(0xffc878, 6, 9); wl.position.set(Math.cos(k / 8 * TAU) * 14, 5.5, Math.sin(k / 8 * TAU) * 14); scene.add(wl); }
  const cl = new THREE.PointLight(0xffd690, 18, 9); cl.position.set(0, 5, 0); scene.add(cl);
  const t0 = label('ОҒЫЗ МҰРАСЫ', 'zone'); t0.position.set(0, 4.0, 0); scene.add(t0);

  const items = []; const clickables = [];
  C.museum.forEach((it, i) => {
    const a = i / C.museum.length * TAU + PI / 2; const r = 8.5; const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = -a - PI / 2; scene.add(g);
    g.add(mesh(new THREE.CylinderGeometry(.75, .85, 1.1, 32), mat(0x1e171c, { roughness: .35, metalness: .25 }), 0, .55, 0));
    const rr = mesh(new THREE.TorusGeometry(.76, .025, 8, 48), gold, 0, 1.08, 0); rr.rotation.x = PI / 2; g.add(rr);
    const glass = mesh(new THREE.BoxGeometry(1.4, 1.6, 1.4), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: .07, roughness: .05, metalness: .1, depthWrite: false }), 0, 1.9, 0, false, false); g.add(glass);
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({ color: 0xb8862f, transparent: true, opacity: .55 }))).children; g.children[g.children.length - 1].position.y = 1.9;
    const art = ARTIFACTS[it.id](); art.position.y = 1.1; g.add(art);
    const spot = new THREE.SpotLight(0xffe2b0, 30, 7, .45, .5, 1.6); spot.position.set(0, 5.5, .8); spot.target = art; g.add(spot);
    const lab = label(`${i + 1}. ${it.title}`, 'zone', () => focus(i)); lab.element.style.cssText += ';pointer-events:auto;cursor:pointer;font-size:13px'; lab.position.set(0, 2.95, 0); g.add(lab);
    const hit = mesh(new THREE.CylinderGeometry(.8, .8, 3, 12), new THREE.MeshBasicMaterial({ visible: false }), 0, 1.5, 0, false, false); g.add(hit); hit.userData.onClick = () => focus(i); clickables.push(hit);
    items.push({ g, art, it, spin: 0 });
  });
  let focused = -1;
  function focus(i) {
    focused = i; const { g, it } = items[i]; const wp = new THREE.Vector3(); items[i].art.getWorldPosition(wp); wp.y += .35;
    const dir = wp.clone().setY(0).normalize();
    flyTo(wp.clone().sub(dir.multiplyScalar(2.6)).setY(1.95), wp, 1.4);
    UI.showCard({ title: it.title, text: it.text, audio: 'mus_' + it.id }, true);
  }
  return {
    name: 'museum', scene, clickables,
    view: { pos: V3(Math.cos(PI / 2 + PI / 10) * 13, 4.2, Math.sin(PI / 2 + PI / 10) * 13), target: V3(0, 1.6, 0) },
    limits: { min: .6, max: 14, maxPolar: 1.5 },
    focus,
    unfocus() { focused = -1; },
    update(dt, t) {
      sh.rotation.y = t * .25; sh.position.y = 2.2 + Math.sin(t) * .08;
      items.forEach((o, i) => { o.art.rotation.y += dt * (i === focused ? .6 : .25); if (o.art.userData.flame) o.art.userData.flame.scale.y = 1.6 + Math.sin(t * 13) * .3; });
    }
  };
}
