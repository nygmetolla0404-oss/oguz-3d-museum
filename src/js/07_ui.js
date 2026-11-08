// ============================================================================
//  WORLD MANAGER · CAMERA FLIGHTS · UI
// ============================================================================
let world = null; let mapWorld = null; let siteWorld = null; let museumWorld = null;
const fly = { active: false };
const SNAP = /snap/.test(location.hash);
function flyTo(pos, target, dur = 2.2, arc = 0) {
  if (SNAP) dur = .001;
  Object.assign(fly, { active: true, t: 0, dur, arc, from: camera.position.clone(), fromT: controls.target.clone(), to: pos.clone(), toT: target.clone() });
}
function setLimits(l) { controls.minDistance = l.min; controls.maxDistance = l.max; controls.maxPolarAngle = l.maxPolar; }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function setWorld(w, instant = false) {
  if (world === w) return;
  if (!instant && !SNAP) { $('#fade').classList.add('on'); await sleep(560); }
  if (world) { world.scene.traverse(o => { if (o.isCSS2DObject) o.element.style.display = 'none'; }); }
  if (world && world.name === 'site' && w !== world) disposeWorld(world);
  world = w; setLimits(w.limits); controls.autoRotate = UI.autoRotate && w.name !== 'map';
  camera.position.copy(w.view.pos).add(new THREE.Vector3(0, w.name === 'map' ? 40 : 10, w.name === 'map' ? 30 : 14)); controls.target.copy(w.view.target);
  flyTo(w.view.pos, w.view.target, 2.0);
  $('#fade').classList.remove('on');
}
function disposeWorld(w) {
  w.scene.traverse(o => {
    if (o.isCSS2DObject) o.element.remove();
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
  });
  if (siteWorld === w) siteWorld = null;
}

// raycasting & clicks ----------------------------------------------------------------
const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
let downXY = null;
function pickAt(cx, cy, list) { ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.intersectObjects(list, false)[0]; }
canvas.addEventListener('pointerdown', e => { downXY = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', e => {
  if (!downXY || Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]) > 6) return;
  simulateClick(e.clientX, e.clientY);
});
function simulateClick(x, y) {
  // HTML elements first (labels / hotspots) – used by hand control
  const el = document.elementFromPoint(x, y);
  if (el && el !== canvas && el.closest('.hs,.mlabel,.zone,button,#panel,#card')) { el.click(); return; }
  if (!world) return;
  const hit = pickAt(x, y, world.clickables); if (hit && hit.object.userData.onClick) { hit.object.userData.onClick(); return; }
}
canvas.addEventListener('pointermove', e => {
  if (!world || e.buttons) return; const hit = pickAt(e.clientX, e.clientY, world.clickables);
  canvas.style.cursor = hit ? 'pointer' : 'grab';
});
canvas.addEventListener('dblclick', e => { // fly to a point on the ground
  if (!world) return; const grounds = []; world.scene.traverse(o => { if (o.userData.ground) grounds.push(o); });
  const hit = pickAt(e.clientX, e.clientY, grounds.concat(world.scene.children.filter(o => o.isMesh || o.isGroup)));
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  const h2 = ray.intersectObjects(world.scene.children, true).find(i => i.object.isMesh && i.object.material && i.object.material.visible !== false && !i.object.material.transparent);
  const p = (h2 || hit) && (h2 || hit).point; if (!p) return;
  const off = camera.position.clone().sub(controls.target).multiplyScalar(.55);
  flyTo(p.clone().add(off), p, 1.2);
});

// ----------------------------------------------------------------------------
const UI = {
  cur: 0, voiceOn: true, autoRotate: false, inSite: false, hsActive: null,
  slides: C.slides,
  init() {
    const chips = $('#chips');
    C.slides.forEach((s, i) => {
      const b = document.createElement('button');
      b.innerHTML = s.kind === 'intro' ? '<i>★</i>Кіріспе' : s.kind === 'map' ? '<i>🗺</i>Карта' : s.kind === 'museum' ? '<i>🏺</i>Музей' : s.kind === 'outro' ? '<i>✦</i>Қорытынды' : `<i>${s.num}</i>${shortName(s).split(' · ')[0]}`;
      b.onclick = () => UI.go(i); chips.appendChild(b);
    });
    $('#prev').onclick = () => UI.go(UI.cur - 1); $('#next').onclick = () => UI.go(UI.cur + 1);
    $('#panelHead').onclick = () => $('#panel').classList.toggle('collapsed');
    $('#cardX').onclick = () => UI.hideCard();
    $('#galX').onclick = () => $('#gallery').classList.remove('show');
    $('#lightbox').onclick = () => $('#lightbox').classList.remove('show');
    $('#tHelp').onclick = () => $('#help').classList.add('show'); $('#helpX').onclick = () => $('#help').classList.remove('show');
    $('#tFull').onclick = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); };
    $('#tReset').onclick = () => world && flyTo(world.view.pos, world.view.target, 1.6);
    $('#tRotate').onclick = () => { UI.autoRotate = !UI.autoRotate; controls.autoRotate = UI.autoRotate; $('#tRotate').classList.toggle('on', UI.autoRotate); };
    $('#tVoice').onclick = () => { UI.voiceOn = !UI.voiceOn; $('#tVoice').classList.toggle('on', UI.voiceOn); $('#tVoice').textContent = UI.voiceOn ? '🔊' : '🔇'; if (!UI.voiceOn) Narrator.stop(); };
    $('#tMusic').onclick = () => { Music.toggle(); $('#tMusic').classList.toggle('on', Music.on); };
    $('#tHand').onclick = () => Hands.toggle();
    $('#speakStop').onclick = () => Narrator.stop();
    addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') UI.go(UI.cur + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') UI.go(UI.cur - 1);
      else if (e.key === 'Escape') { UI.hideCard(); $('#gallery').classList.remove('show'); $('#lightbox').classList.remove('show'); $('#help').classList.remove('show'); }
      else if (e.key.toLowerCase() === 'm' || e.key === 'ь') $('#tMusic').click();
      else if (e.key.toLowerCase() === 'v' || e.key === 'м') $('#tVoice').click();
    });
    $('#tVoice').classList.add('on');
  },
  toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(UI._tt); UI._tt = setTimeout(() => t.classList.remove('show'), ms); },

  async go(i, opts = {}) {
    if (i < 0 || i >= C.slides.length) return;
    UI.cur = i; const s = C.slides[i]; UI.hideCard(); Narrator.stop();
    document.querySelectorAll('#chips button').forEach((b, k) => b.classList.toggle('active', k === i));
    const ab = document.querySelectorAll('#chips button')[i]; ab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    $('#prev').disabled = i === 0; $('#next').disabled = i === C.slides.length - 1;
    $('#progress').style.width = (i / (C.slides.length - 1) * 100) + '%';
    UI.inSite = false; UI.renderSiteBar(null);
    if (s.kind === 'museum') {
      if (!museumWorld) museumWorld = buildMuseum(s);
      await setWorld(museumWorld);
    } else {
      await setWorld(mapWorld);
      mapWorld.setActive(s.kind === 'site' ? s.id : null);
      if (s.kind === 'site') { const m = mapWorld.markers[s.id]; const p = m.pos; flyTo(p.clone().add(new THREE.Vector3(2.5, 11, 12)), p.clone().add(new THREE.Vector3(0, .8, 0)), 2.6); }
      else if (s.kind === 'intro') flyTo(new THREE.Vector3(-10, 34, 40), new THREE.Vector3(-6, 0, 2), 3.5);
      else flyTo(mapWorld.view.pos, mapWorld.view.target, 2.4);
    }
    UI.renderPanel(s);
    if (UI.voiceOn && !opts.silent) Narrator.play('slide_' + s.id, s.narration);
  },
  siteClick(idx) { if (UI.cur === idx && !UI.inSite) UI.enterSite(); else UI.go(idx); },

  async enterSite() {
    const s = C.slides[UI.cur]; if (s.kind !== 'site') return;
    $('#fade').classList.add('on'); await sleep(400);
    const w = s.type === 'necropolis' ? (s.model === 'kenti' ? buildKenti(s) : buildBeyneu(s)) : buildCity(s);
    siteWorld = w; await setWorld(w, true); UI.inSite = true;
    $('#panel').classList.add('collapsed'); UI.renderSiteBar(s); UI.renderPanel(s);
    UI.toast(s.type === 'necropolis' ? 'Алтын «i» белгілерін басып, ескерткіштермен танысыңыз' : 'Алтын «i» белгілерін басыңыз · «Қазіргі күйі» батырмасы – бүгінгі қирандылар');
  },
  async exitSite() { const i = UI.cur; await UI.go(i, { silent: true }); },

  renderPanel(s) {
    const p = $('#panel'); p.classList.remove('hidden');
    const num = $('#pNum'); num.className = 'num' + (s.type === 'necropolis' ? ' teal' : '');
    num.textContent = s.kind === 'site' ? s.num : s.kind === 'intro' ? '★' : s.kind === 'map' ? '🗺' : s.kind === 'museum' ? '🏺' : '✦';
    $('#pTitle').textContent = s.title; $('#pSub').textContent = s.sub || '';
    let h = '';
    if (s.kind === 'intro') h += `<div class="authors"><span>Тақырып:</span><b>${C.project.title}</b><span>Жоба авторы:</span><b>${C.project.author}</b><span>Жетекшісі:</span><b>${C.project.supervisor}</b></div>`;
    h += s.text.map(t => `<p>${t}</p>`).join('');
    if (s.facts && s.facts.length) h += `<ul class="facts">${s.facts.map(f => `<li>✦ ${f}</li>`).join('')}</ul>`;
    if (s.sources) h += `<p><b>Дереккөздер:</b></p><ol class="src">${s.sources.map(x => `<li>${x}</li>`).join('')}</ol>`;
    h += '<div class="acts">';
    if (s.kind === 'site') h += UI.inSite ? `<button class="btn primary" data-a="exit">🗺 Картаға оралу</button>` : `<button class="btn primary" data-a="enter">${s.type === 'necropolis' ? '🏛 Қорымға кіру (3D)' : '🏛 Қалаға кіру (3D)'}</button>`;
    if (s.kind === 'site') h += `<button class="btn" data-a="photos">📷 Фотолар</button>`;
    if (s.kind === 'intro') h += `<button class="btn primary" data-a="next">Картаға өту ›</button>`;
    if (s.kind === 'map') h += `<button class="btn primary" data-a="next">1-нысаннан бастау ›</button>`;
    if (s.kind === 'museum') h += C.museum.map((m, k) => `<button class="btn" data-a="mus" data-k="${k}">${m.title}</button>`).join('');
    if (s.kind === 'outro') h += `<button class="btn primary" data-a="restart">↺ Басынан</button>`;
    h += `<button class="btn" data-a="listen">🔊 Тыңдау</button></div>`;
    const body = $('#pBody'); body.innerHTML = h; body.scrollTop = 0;
    body.querySelectorAll('[data-a]').forEach(b => b.onclick = (e) => {
      e.stopPropagation(); const a = b.dataset.a;
      if (a === 'enter') UI.enterSite(); else if (a === 'exit') UI.exitSite(); else if (a === 'photos') UI.openGallery(s);
      else if (a === 'next') UI.go(UI.cur + 1); else if (a === 'restart') UI.go(0);
      else if (a === 'mus') museumWorld.focus(+b.dataset.k);
      else if (a === 'listen') Narrator.play('slide_' + s.id, s.narration, true);
    });
  },
  renderSiteBar(s) {
    const bar = $('#siteBar'); if (!s) { bar.classList.add('hidden'); bar.innerHTML = ''; return; }
    bar.classList.remove('hidden');
    let h = `<button class="btn" data-a="exit">🗺 Картаға</button>`;
    if (siteWorld && siteWorld.hasRuin) h += `<button class="btn" data-a="ruin">🏜 Қазіргі күйі</button>`;
    if (siteWorld && siteWorld.inside) h += `<button class="btn" data-a="inside">🚶 Кесене ішіне кіру</button>`;
    h += `<button class="btn" data-a="tour">🎥 Нысан бойынша тур</button><button class="btn" data-a="photos">📷 Фотолар</button>`;
    bar.innerHTML = h;
    bar.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      if (a === 'exit') UI.exitSite();
      else if (a === 'ruin') { const on = !b.classList.contains('on'); b.classList.toggle('on', on); b.textContent = on ? '🏛 Қайта құру (реконструкция)' : '🏜 Қазіргі күйі'; siteWorld.toggleRuin(on); UI.toast(on ? 'Қазіргі күйі: археологиялық төбе мен қазба орындары' : 'Қалпына келтірілген көрінісі (реконструкция)'); }
      else if (a === 'inside') { const c = siteWorld.inside; flyTo(c.pos, c.target, 2.2); }
      else if (a === 'tour') UI.tour();
      else if (a === 'photos') UI.openGallery(s);
    });
  },
  async tour() { // visit each hotspot in turn
    if (!siteWorld) return; const w = siteWorld; UI._tourId = (UI._tourId || 0) + 1; const id = UI._tourId;
    for (const h of w.hotspots) {
      if (UI._tourId !== id || siteWorld !== w) return; if (!h.obj.visible) continue;
      UI.openHotspot(h.data, h.obj);
      await new Promise(r => { const start = performance.now(); const tick = () => { if (UI._tourId !== id) return r(); if (!Narrator.speaking && performance.now() - start > 3500) return r(); setTimeout(tick, 400); }; setTimeout(tick, 2500); });
    }
  },
  openHotspot(d, obj) {
    obj && obj.element.classList.add('seen'); UI.hsActive = d.key;
    if (world && world.name === 'site') {
      const dist = world.hsDist || 12; const dir = camera.position.clone().sub(d.pos); dir.y = Math.max(dir.y, dir.length() * .35); dir.normalize();
      flyTo(d.pos.clone().add(dir.multiplyScalar(dist)), d.pos.clone().add(new THREE.Vector3(0, -dist * .08, 0)), 1.6);
    }
    UI.showCard(d);
  },
  showCard(d, museum = false) {
    $('#cardTitle').textContent = d.title; $('#cardText').textContent = d.text;
    $('#cardImg').innerHTML = d.photo ? `<img src="${d.photo}" alt="${d.title}">` : '';
    $('#cardExtra').innerHTML = '';
    if (d.key === 'tamga' || (museum && d.audio === 'mus_tamga')) { const c = document.createElement('canvas'); c.width = 220; c.height = 120; c.className = 'tamga'; const g = c.getContext('2d'); drawTamga(g, 110, 60, 80, '#e8c374', 7); $('#cardExtra').appendChild(c); }
    const img = $('#cardImg img'); if (img) img.onclick = () => UI.lightbox(d.photo, d.title);
    $('#cardActs').innerHTML = `<button class="btn" id="cListen">🔊 Тыңдау</button>` + (d.photo ? `<button class="btn" id="cZoom">🔍 Фотоны үлкейту</button>` : '');
    $('#cListen').onclick = () => Narrator.play(d.audio, d.title + '. ' + d.text, true);
    if (d.photo) $('#cZoom').onclick = () => UI.lightbox(d.photo, d.title);
    $('#card').classList.add('show');
    if (UI.voiceOn) Narrator.play(d.audio, d.title + '. ' + d.text);
  },
  hideCard() { $('#card').classList.remove('show'); UI.hsActive = null; if (museumWorld) museumWorld.unfocus(); },
  lightbox(src, cap) { const lb = $('#lightbox'); lb.querySelector('img').src = src; lb.querySelector('div').textContent = cap || ''; lb.classList.add('show'); },

  async openGallery(s) {
    $('#galTitle').textContent = '📷 ' + s.title; const grid = $('#galGrid'); grid.innerHTML = ''; $('#gallery').classList.add('show');
    const local = Object.values(s.hotspots || {}).filter(h => h.photo);
    const add = (src, cap, full, link) => { const f = document.createElement('figure'); f.innerHTML = `<img loading="lazy" src="${src}" alt=""><figcaption>${cap}${link ? ` · <a href="${link}" target="_blank" rel="noopener">Wikimedia Commons</a>` : ''}</figcaption>`; f.querySelector('img').onclick = () => UI.lightbox(full || src, cap); grid.appendChild(f); };
    local.forEach(h => add(h.photo, h.title + ' (жоба фотосы)'));
    $('#galNote').textContent = local.length ? 'Жоба авторы ұсынған далалық фотолар' : '';
    if (s.commons && s.commons.length) {
      $('#galNote').textContent += (local.length ? ' · ' : '') + 'Wikimedia Commons-тан жүктелуде…';
      try {
        const seen = new Set(); let n = 0;
        for (const q of s.commons) {
          const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=24&gsrsearch=${encodeURIComponent(q.q + ' filetype:bitmap')}&prop=imageinfo&iiprop=url&iiurlwidth=900`;
          const j = await (await fetch(url)).json(); const pages = Object.values((j.query || {}).pages || {}).sort((a, b) => a.index - b.index);
          for (const p of pages) {
            const t = p.title.toLowerCase(); if (!q.kw.some(k => t.includes(k))) continue; const ii = (p.imageinfo || [])[0]; if (!ii || seen.has(ii.url)) continue; seen.add(ii.url);
            add(ii.thumburl, p.title.replace(/^File:/, '').replace(/\.(jpe?g|png|tiff?)$/i, '').replace(/_/g, ' '), ii.thumburl, ii.descriptionurl); n++;
          }
        }
        $('#galNote').textContent = (local.length ? 'Жоба фотолары · ' : '') + (n ? `Интернеттен ${n} фото (Wikimedia Commons, ашық лицензия)` : 'Интернеттен сәйкес фото табылмады');
      } catch (e) { $('#galNote').textContent = 'Интернет байланысы жоқ – тек жоба фотолары көрсетілді'; }
    } else if (!local.length) {
      grid.innerHTML = `<p class="note">Бұл нысанның ашық лицензиялы фотосы табылмады. Нысан туралы ғылыми деректер негізінде жасалған 3D реконструкцияны қараңыз.</p>`;
    }
  }
};
