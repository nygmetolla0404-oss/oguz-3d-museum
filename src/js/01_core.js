// ============================================================================
//  CORE: three.js setup, helpers, random/noise
// ============================================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const C = window.CONTENT;
const $ = (s) => document.querySelector(s);
const PI = Math.PI, TAU = PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// seeded random ------------------------------------------------------------
let _seed = 1;
const srand = (s) => { _seed = (s >>> 0) % 2147483647 || 1; };
const rnd = () => { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; };
const R = (a, b) => a + (b - a) * rnd();
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

function hash2(x, y) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, o = 4) { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= .5; } return s; }

// renderer -------------------------------------------------------------------
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
labelRenderer.domElement.className = 'labels';
document.body.appendChild(labelRenderer.domElement);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 3000);
camera.position.set(0, 160, 140);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.autoRotateSpeed = 0.5;
controls.screenSpacePanning = false;

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); labelRenderer.setSize(innerWidth, innerHeight);
});

// animated things registry (per world) ------------------------------------------
// each world: { scene, update(dt,t), clickables:[], view:{pos,target}, limits, dispose }
const ANIM_GLOBAL = [];

// generic helpers -----------------------------------------------------------
function mat(color, o = {}) { return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .92, metalness: 0 }, o)); }
function basic(color, o = {}) { return new THREE.MeshBasicMaterial(Object.assign({ color }, o)); }
function mesh(geo, m, x = 0, y = 0, z = 0, cast = true, recv = true) {
  const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = cast; o.receiveShadow = recv; return o;
}
// rescale box UVs so textures tile in world units (s = units per tile)
function boxUV(geo, w, h, d, s = 1) {
  const uv = geo.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  const per = uv.count / 6;
  for (let f = 0; f < 6; f++) for (let i = 0; i < per; i++) {
    const k = f * per + i; uv.setXY(k, uv.getX(k) * dims[f][0] / s, uv.getY(k) * dims[f][1] / s);
  }
  uv.needsUpdate = true; return geo;
}
function box(w, h, d, s) { const g = new THREE.BoxGeometry(w, h, d); return s ? boxUV(g, w, h, d, s) : g; }

function label(html, cls, onClick) {
  const el = document.createElement('div'); el.className = cls; el.innerHTML = html;
  if (onClick) { el.addEventListener('pointerdown', e => e.stopPropagation()); el.addEventListener('click', e => { e.stopPropagation(); onClick(e); }); }
  return new CSS2DObject(el);
}

// sky dome shader --------------------------------------------------------------
function skyDome(top, horizon, sunDir, sunCol = 0xffe3b0, r = 1500) {
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(top) }, hor: { value: new THREE.Color(horizon) }, sun: { value: sunDir.clone().normalize() }, sc: { value: new THREE.Color(sunCol) } },
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 top,hor,sun,sc; varying vec3 vD;
      void main(){ float h = clamp(vD.y,0.,1.); vec3 c = mix(hor, top, pow(h,.55));
        float s = max(dot(vD, sun),0.); c += sc*pow(s,180.)*1.6 + sc*pow(s,8.)*.25;
        if(vD.y<0.) c = hor*.92;
        gl_FragColor = vec4(c,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const s = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), m); s.renderOrder = -10; return s;
}

// water shader (with fog) ----------------------------------------------------------
function waterMat(color = 0x1f5f7a, opacity = .9, scale = 1) {
  const m = new THREE.ShaderMaterial({
    transparent: true, fog: true, depthWrite: false,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { t: { value: 0 }, c: { value: new THREE.Color(color) }, o: { value: opacity }, k: { value: scale } }]),
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
      #include <fog_vertex>
      }`,
    fragmentShader: `uniform float t,o,k; uniform vec3 c; varying vec3 vW;
      #include <fog_pars_fragment>
      void main(){ vec2 p = vW.xz*k;
        float w = sin(p.x*1.7+t*1.3)*sin(p.y*1.3-t*1.1) + .5*sin((p.x+p.y)*3.1+t*2.) + .3*sin(p.x*5.3-p.y*4.1+t*2.7);
        vec3 col = c*(.85+.18*w) + vec3(.55,.65,.7)*smoothstep(1.25,1.6,w)*.5;
        gl_FragColor = vec4(col,o);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`
  });
  return m;
}

// glowing animated line material for tubes (rivers / routes)
function flowMat(color, glow, dash = 0, speed = 1, opacity = 1) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { t: { value: 0 }, c: { value: new THREE.Color(color) }, g: { value: new THREE.Color(glow) }, d: { value: dash }, sp: { value: speed }, o: { value: opacity } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float t,d,sp,o; uniform vec3 c,g; varying vec2 vUv;
      void main(){ float s = sin(vUv.x*240.-t*4.*sp)*.5+.5; vec3 col = mix(c,g,smoothstep(.75,1.,s));
        float a = o; if(d>0.){ float f = fract(vUv.x*d - t*.6*sp); if(f>.55) discard; a *= smoothstep(0.,.1,f); }
        gl_FragColor = vec4(col*a, a); }`
  });
}

// soft round sprite texture
function softTex(size = 128, inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// smoke emitters ------------------------------------------------------------------
function smokeSystem(scene, color = 0xdddddd, size = 1.5, rise = 1.2, life = 5, opacity = .35) {
  const tex = softTex(64, 'rgba(255,255,255,.9)', 'rgba(255,255,255,0)');
  const parts = []; const emitters = [];
  return {
    add(pos, n = 10) {
      emitters.push(pos);
      for (let i = 0; i < n; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, depthWrite: false, opacity: 0 }));
        sp.userData = { e: pos, age: Math.random() * life, dx: (Math.random() - .5) * .3 };
        scene.add(sp); parts.push(sp);
      }
    },
    update(dt) {
      for (const p of parts) {
        const u = p.userData; u.age += dt; if (u.age > life) u.age -= life;
        const k = u.age / life;
        p.position.set(u.e.x + u.dx * k * 4 + k * rise * .8, u.e.y + k * rise * 3, u.e.z + u.dx * k * 2);
        const s = size * (.4 + k * 1.6); p.scale.set(s, s, s);
        p.material.opacity = opacity * Math.sin(k * PI);
      }
    }
  };
}

// polygon helpers --------------------------------------------------------------------
function inPoly(x, z, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (((a.y > z) !== (b.y > z)) && (x < (b.x - a.x) * (z - a.y) / (b.y - a.y) + a.x)) c = !c;
  }
  return c;
}
function centroid(poly) { const c = new THREE.Vector2(); poly.forEach(p => c.add(p)); return c.multiplyScalar(1 / poly.length); }
function offsetPoly(poly, d) {
  const c = centroid(poly);
  return poly.map(p => { const v = p.clone().sub(c); const l = v.length(); return c.clone().add(v.multiplyScalar((l + d) / l)); });
}
function distSeg(px, pz, a, b) {
  const dx = b.x - a.x, dz = b.y - a.y; const t = clamp(((px - a.x) * dx + (pz - a.y) * dz) / (dx * dx + dz * dz), 0, 1);
  return Math.hypot(px - (a.x + dx * t), pz - (a.y + dz * t));
}
// shape in XZ plane -> horizontal mesh geometry (shape y = -z)
function shapeXZ(pts) { const s = new THREE.Shape(); pts.forEach((p, i) => i ? s.lineTo(p.x, -p.y) : s.moveTo(p.x, -p.y)); s.closePath(); return s; }

// ribbon geometry along XZ polyline
function ribbon(points, width, y = 0.02) {
  const pos = [], uv = [], idx = []; let acc = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i], a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
    const dx = b.x - a.x, dz = b.y - a.y, l = Math.hypot(dx, dz) || 1; const nx = -dz / l, nz = dx / l;
    const w = (typeof width === 'function' ? width(i / (points.length - 1)) : width) / 2;
    if (i) acc += p.distanceTo(points[i - 1]);
    pos.push(p.x + nx * w, y, p.y + nz * w, p.x - nx * w, y, p.y - nz * w); uv.push(acc, 0, acc, 1);
    if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function smoothPath(pts, n = 200) { // Vector2[] -> Vector2[] via catmull
  const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p.x, 0, p.y)));
  return c.getSpacedPoints(n).map(v => new THREE.Vector2(v.x, v.z));
}

// noisy rock geometry ---------------------------------------------------------------
function rockGeo(w, h, d, seed = 1, round = .5, rough = .08, seg = 6) {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg + 2, seg);
  const p = g.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    // round the top corners
    const ty = (v.y + h / 2) / h;
    const sx = v.x / (w / 2), sz = v.z / (d / 2);
    const r = Math.max(0, ty - (1 - round)) / round;
    const shrink = 1 - .35 * r * r * (Math.abs(sx) + Math.abs(sz)) * .5;
    v.x *= shrink; v.z *= shrink;
    if (ty > .99) { v.y -= h * .1 * round * (sx * sx + sz * sz) * .5; }
    const n = (fbm(v.x * 3 + seed * 7.1, v.y * 3 + v.z * 2.3 + seed, 3) - .5) * rough;
    v.x += n * w; v.y += n * h * .5; v.z += n * d;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
}
