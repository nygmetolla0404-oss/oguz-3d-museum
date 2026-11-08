// ============================================================================
//  HAND CONTROL (webcam + MediaPipe Hand Landmarker)
//  open palm moves -> orbit camera · quick pinch -> click · hold pinch + up/down -> zoom
// ============================================================================
const Hands = {
  on: false, lm: null, video: null, last: null, pinch: false, pinchStart: 0, pinchY: 0, moved: 0,
  async toggle() { this.on ? this.stop() : this.start(); },
  async start() {
    UI.toast('🖐 Камера мен қол модельі жүктелуде…', 4000);
    try {
      if (!this.lm) {
        const v = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
        const fs = await v.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
        this.lm = await v.HandLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task', delegate: 'GPU' }, runningMode: 'VIDEO', numHands: 1 });
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
      this.video = $('#hand video'); this.video.srcObject = stream; await this.video.play();
      this.on = true; $('#hand').classList.add('show'); $('#tHand').classList.add('on'); $('#cursor').style.display = 'block';
      UI.toast('Алақанды жылжытыңыз – айналдыру · Сұқ саусақ пен бас бармақты қысу – басу · Қысып тұрып жоғары/төмен – үлкейту', 6000);
      this.loop();
    } catch (e) { console.warn(e); UI.toast('Камераға рұқсат берілмеді немесе интернет жоқ. Сайтты http://localhost арқылы ашыңыз (start.command).', 6000); }
  },
  stop() {
    this.on = false; $('#hand').classList.remove('show'); $('#tHand').classList.remove('on'); $('#cursor').style.display = 'none';
    if (this.video && this.video.srcObject) this.video.srcObject.getTracks().forEach(t => t.stop());
  },
  loop() {
    if (!this.on) return; requestAnimationFrame(() => this.loop());
    if (this.video.readyState < 2) return;
    const res = this.lm.detectForVideo(this.video, performance.now());
    const cv = $('#hand canvas'); cv.width = 200; cv.height = 150; const g = cv.getContext('2d'); g.clearRect(0, 0, 200, 150);
    const lms = res.landmarks && res.landmarks[0]; const cur = $('#cursor');
    if (!lms) { this.last = null; return; }
    g.fillStyle = '#5fd4d0'; lms.forEach(p => { g.beginPath(); g.arc(p.x * 200, p.y * 150, 2.5, 0, TAU); g.fill(); });
    const tip = lms[8], th = lms[4], palm = lms[9];
    const sx = (1 - tip.x) * innerWidth, sy = tip.y * innerHeight; cur.style.left = sx + 'px'; cur.style.top = sy + 'px';
    const pd = Math.hypot(tip.x - th.x, tip.y - th.y); const isPinch = pd < .055;
    cur.classList.toggle('pinch', isPinch);
    const now = performance.now();
    if (isPinch && !this.pinch) { this.pinch = true; this.pinchStart = now; this.pinchY = palm.y; this.moved = 0; this.clickXY = [sx, sy]; }
    else if (!isPinch && this.pinch) { this.pinch = false; if (now - this.pinchStart < 450 && this.moved < .04) simulateClick(this.clickXY[0], this.clickXY[1]); }
    if (this.last) {
      const dx = palm.x - this.last.x, dy = palm.y - this.last.y; this.moved += Math.hypot(dx, dy);
      const off = camera.position.clone().sub(controls.target); const sph = new THREE.Spherical().setFromVector3(off);
      if (this.pinch && now - this.pinchStart > 300) { sph.radius = clamp(sph.radius * (1 + dy * 3), controls.minDistance, controls.maxDistance); }
      else if (!this.pinch && Math.hypot(dx, dy) > .004) { sph.theta += dx * 4.5; sph.phi = clamp(sph.phi - dy * 3, .1, controls.maxPolarAngle); }
      off.setFromSpherical(sph); camera.position.copy(controls.target).add(off);
    }
    this.last = { x: palm.x, y: palm.y };
  }
};
