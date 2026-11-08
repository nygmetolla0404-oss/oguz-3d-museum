// ============================================================================
//  BOOT + RENDER LOOP
// ============================================================================
$('#introTitle').textContent = C.project.title;
$('#introLead').textContent = C.project.subtitle;
$('#introAuthor').textContent = C.project.author;
$('#introSup').textContent = C.project.supervisor;
UI.init();

const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  if (fly.active) {
    fly.t += dt / fly.dur; const k = ease(Math.min(1, fly.t));
    camera.position.lerpVectors(fly.from, fly.to, k);
    const span = fly.from.distanceTo(fly.to); camera.position.y += Math.sin(k * PI) * Math.min(span * .18, 25) * (world && world.name === 'map' ? 1 : .3);
    controls.target.lerpVectors(fly.fromT, fly.toT, k);
    if (fly.t >= 1) fly.active = false;
  }
  controls.update();
  if (world) { world.update(dt, t); renderer.render(world.scene, camera); labelRenderer.render(world.scene, camera); }
}

// build the map while the intro is shown
setTimeout(() => {
  try {
    mapWorld = buildMap(); setWorld(mapWorld, true);
    camera.position.set(0, 150, 130); controls.target.set(0, 0, 0); controls.autoRotate = true; controls.autoRotateSpeed = .35;
    fly.active = false;
    frame();
    $('#loading').textContent = 'Дайын ✓'; $('#startBtn').disabled = false;
    // deep link for presenting / testing:  index.html#5  or  #5-in  (slide 5, enter 3D)
    const m = location.hash.match(/^#(\d+)(-in)?(-ruin)?/);
    if (m) { $('#intro').classList.add('gone'); controls.autoRotate = false; UI.voiceOn = false; UI.go(+m[1], { silent: true }).then(() => { if (m[2]) UI.enterSite().then(() => { if (m[3]) document.querySelector('[data-a=ruin]')?.click(); }); }); }
  } catch (e) { console.error(e); $('#loading').textContent = 'Қате: ' + e.message + ' (WebGL қолдайтын браузер қажет)'; }
}, 50);

$('#startBtn').onclick = () => {
  $('#intro').classList.add('gone'); controls.autoRotate = false; controls.autoRotateSpeed = .5;
  Music.start(); $('#tMusic').classList.add('on');
  UI.go(0);
};
window.__app = { UI, camera, controls, get world() { return world; } }; // debugging hook
