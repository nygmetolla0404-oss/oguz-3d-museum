// ============================================================================
//  AUDIO: generative kobyz-like melody + steppe wind, and Kazakh narration
// ============================================================================
const Music = {
  on: false, ctx: null,
  init() {
    if (this.ctx) return; const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = ctx.createGain(); this.master.gain.value = 0; this.master.connect(ctx.destination);
    this.duckG = ctx.createGain(); this.duckG.gain.value = 1; this.duckG.connect(this.master);
    // reverb
    const len = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    this.rev = ctx.createConvolver(); this.rev.buffer = ir; const rg = ctx.createGain(); rg.gain.value = .55; this.rev.connect(rg); rg.connect(this.duckG);
    this.dry = ctx.createGain(); this.dry.gain.value = .7; this.dry.connect(this.duckG);
    // drone (D2 + A2) – like the low open string of a kobyz
    const dg = ctx.createGain(); dg.gain.value = .045; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 2;
    dg.connect(lp); lp.connect(this.dry); lp.connect(this.rev);
    for (const [f, det] of [[73.42, 0], [73.42, 6], [110, -4], [146.83, 3]]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; o.connect(dg); o.start(); }
    const lfo = ctx.createOscillator(); lfo.frequency.value = .07; const lg = ctx.createGain(); lg.gain.value = .022; lfo.connect(lg); lg.connect(dg.gain); lfo.start();
    const lfo2 = ctx.createOscillator(); lfo2.frequency.value = .05; const lg2 = ctx.createGain(); lg2.gain.value = 180; lfo2.connect(lg2); lg2.connect(lp.frequency); lfo2.start();
    // wind
    const nb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate); const nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = .8;
    const wg = ctx.createGain(); wg.gain.value = .035; ns.connect(bp); bp.connect(wg); wg.connect(this.duckG); ns.start();
    const wl = ctx.createOscillator(); wl.frequency.value = .09; const wlg = ctx.createGain(); wlg.gain.value = 300; wl.connect(wlg); wlg.connect(bp.frequency); wl.start();
    const wl2 = ctx.createOscillator(); wl2.frequency.value = .13; const wlg2 = ctx.createGain(); wlg2.gain.value = .025; wl2.connect(wlg2); wlg2.connect(wg.gain); wl2.start();
    // melody voice chain (formants of a horsehair bowed string)
    this.voiceIn = ctx.createGain(); this.voiceIn.gain.value = 1;
    const f1 = ctx.createBiquadFilter(); f1.type = 'peaking'; f1.frequency.value = 850; f1.Q.value = 2.2; f1.gain.value = 9;
    const f2 = ctx.createBiquadFilter(); f2.type = 'peaking'; f2.frequency.value = 2300; f2.Q.value = 3; f2.gain.value = 6;
    const f3 = ctx.createBiquadFilter(); f3.type = 'lowpass'; f3.frequency.value = 3600;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 160;
    this.voiceIn.connect(hp); hp.connect(f1); f1.connect(f2); f2.connect(f3); f3.connect(this.dry); f3.connect(this.rev);
    this.prevF = 293.66; this.nextT = ctx.currentTime + 1.5;
    this.timer = setInterval(() => this.schedule(), 200);
  },
  // D dorian-ish scale (Kazakh küi flavour)
  scale: [146.83, 164.81, 174.61, 196.0, 220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0],
  deg: 7,
  schedule() {
    const ctx = this.ctx; if (!this.on) return;
    while (this.nextT < ctx.currentTime + 1.2) {
      // phrase logic: random walk, cadence to D / A
      const r = Math.random(); let step = r < .35 ? -1 : r < .7 ? 1 : r < .8 ? -2 : r < .9 ? 2 : 0;
      this.deg = clamp(this.deg + step, 2, 11);
      if (Math.random() < .12) this.deg = pick([4, 7, 7, 11]);
      const long = Math.random() < .3; const dur = long ? R(2.2, 3.6) : R(.5, 1.3);
      if (Math.random() < .25) this.note(this.scale[Math.min(11, this.deg + 1)], .14, this.nextT, .5); // grace note
      this.note(this.scale[this.deg], dur, this.nextT + (Math.random() < .25 ? .14 : 0), long ? .9 : .7);
      this.nextT += dur + (Math.random() < .15 ? R(1, 2.5) : 0);
    }
  },
  note(f, dur, t, vel = .8) {
    const ctx = this.ctx; const g = ctx.createGain(); g.gain.value = 0; g.connect(this.voiceIn);
    const os = [ctx.createOscillator(), ctx.createOscillator()]; os[0].type = 'sawtooth'; os[1].type = 'sawtooth'; os[1].detune.value = 9;
    const vib = ctx.createOscillator(); vib.frequency.value = R(4.8, 6.2); const vg = ctx.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * .012, t + Math.min(dur, 1.2)); vib.connect(vg);
    for (const o of os) { o.frequency.setValueAtTime(this.prevF, t); o.frequency.exponentialRampToValueAtTime(f, t + .12); vg.connect(o.frequency); o.connect(g); o.start(t); o.stop(t + dur + 1); }
    vib.start(t); vib.stop(t + dur + 1);
    const a = .07 * vel; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + .22); g.gain.linearRampToValueAtTime(a * .8, t + dur * .6); g.gain.linearRampToValueAtTime(0, t + dur + .5);
    this.prevF = f;
  },
  start() { this.init(); this.ctx.resume(); this.on = true; this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.linearRampToValueAtTime(.8, this.ctx.currentTime + 3); this.nextT = Math.max(this.nextT, this.ctx.currentTime + .5); },
  stop() { if (!this.ctx) return; this.on = false; this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.2); },
  toggle() { this.on ? this.stop() : this.start(); },
  duck(v) { if (!this.ctx) return; this.duckG.gain.cancelScheduledValues(this.ctx.currentTime); this.duckG.gain.linearRampToValueAtTime(v, this.ctx.currentTime + .6); }
};

const Narrator = {
  audio: new Audio(), speaking: false, keys: new Set(C.audio || []),
  play(key, text, force = false) {
    if (!UI.voiceOn && !force) return;
    this.stop();
    if (this.keys.has(key)) {
      this.audio.src = 'audio/' + key + '.mp3'; this.audio.play().then(() => this._start()).catch(() => this.speak(text));
      this.audio.onended = () => this._end();
    } else this.speak(text);
  },
  speak(text) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text); const vs = speechSynthesis.getVoices();
    const v = vs.find(v => /^kk/i.test(v.lang)) || vs.find(v => /^tr|^ru/i.test(v.lang)); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'kk-KZ';
    u.rate = .95; u.onstart = () => this._start(); u.onend = () => this._end(); speechSynthesis.speak(u);
  },
  _start() { this.speaking = true; $('#speak').classList.add('show'); Music.duck(.28); },
  _end() { this.speaking = false; $('#speak').classList.remove('show'); Music.duck(1); },
  stop() { this.audio.pause(); this.audio.onended = null; if ('speechSynthesis' in window) speechSynthesis.cancel(); this._end(); }
};
