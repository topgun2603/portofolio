/**
 * Synthesised sound, not audio files.
 *
 * A torch click and a light switch are both short transients - noise bursts
 * shaped by a filter and an envelope. Generating them with the Web Audio API
 * costs no network request, no licensing, and lets every hit be scheduled
 * against the audio clock so the switch snap lands exactly on the visual beat
 * instead of "roughly when the file decodes".
 *
 * Everything routes through one master gain, so muting is a single node.
 */

const MUTE_KEY = "flashlight-portfolio:muted";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

// ---- mute, as an external store so React can read it without an effect ----

let muted: boolean | null = null;
const listeners = new Set<() => void>();

export function isMuted(): boolean {
  if (muted === null) {
    try {
      muted = localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      muted = false;
    }
  }
  return muted;
}

export function getServerMuted(): boolean {
  return false;
}

export function setMuted(next: boolean) {
  if (muted === next) return;
  muted = next;
  try {
    localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  } catch {
    // blocked storage: the choice just does not survive a reload
  }
  for (const listener of listeners) listener();
}

export function subscribeMuted(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ---- graph ----------------------------------------------------------------

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/**
 * Created lazily on the first sound. The torch and switch cues fire from
 * clicks, so the context is born inside a gesture and autoplay never blocks
 * them. The portrait assembly does not - see `playBinaryAssembly`.
 */
function audio(): { c: AudioContext; out: GainNode } | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!AC) return null; // no Web Audio: the experience is silent, not broken
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return master ? { c: ctx, out: master } : null;
}

function noise(c: AudioContext) {
  if (!noiseBuffer || noiseBuffer.sampleRate !== c.sampleRate) {
    const length = Math.floor(c.sampleRate * 0.5);
    noiseBuffer = c.createBuffer(1, length, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/** A mechanical tick: filtered noise with a near-instant attack. */
function tick(
  c: AudioContext,
  out: GainNode,
  at: number,
  freq: number,
  q: number,
  gain: number,
  dur: number,
) {
  const src = c.createBufferSource();
  src.buffer = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(bp).connect(g).connect(out);
  src.start(at);
  src.stop(at + dur + 0.02);
}

/** A pitched body: what gives a click weight rather than just brightness. */
function tone(
  c: AudioContext,
  out: GainNode,
  at: number,
  from: number,
  to: number,
  gain: number,
  dur: number,
  type: OscillatorType = "sine",
) {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + dur * 0.22);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g).connect(out);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

/** Air moving: noise opening through a rising low-pass. */
function swell(
  c: AudioContext,
  out: GainNode,
  at: number,
  fromHz: number,
  toHz: number,
  gain: number,
  dur: number,
) {
  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(fromHz, at);
  lp.frequency.exponentialRampToValueAtTime(toHz, at + dur * 0.7);
  lp.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(lp).connect(g).connect(out);
  src.start(at);
  src.stop(at + dur + 0.02);
}

// ---- the two sounds -------------------------------------------------------

/** Thumb slider snapping forward, then the filament coming up to temperature. */
export function playTorchOn() {
  if (isMuted()) return;
  const a = audio();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime + 0.01;

  tick(c, out, t, 2600, 1.2, 0.30, 0.045); // slider
  tick(c, out, t + 0.032, 1750, 1.6, 0.14, 0.028); // spring settling
  tone(c, out, t + 0.01, 180, 88, 0.10, 0.14); // body of the click
  swell(c, out, t + 0.03, 320, 1400, 0.05, 0.45); // filament warming
  tone(c, out, t + 0.04, 90, 196, 0.07, 0.4, "triangle");
}

/**
 * A wall switch: rocker travel, contact, then the room flooding with light.
 * The 0.33s offset puts the flood underneath the screen flash in `flipSwitch`.
 */
export function playSwitchFlip() {
  if (isMuted()) return;
  const a = audio();
  if (!a) return;
  const { c, out } = a;
  const t = c.currentTime + 0.01;

  tick(c, out, t, 1400, 1.0, 0.38, 0.05); // rocker travels
  tone(c, out, t + 0.004, 84, 52, 0.20, 0.13); // plastic thunk
  tick(c, out, t + 0.058, 3200, 2.0, 0.28, 0.035); // contact closes

  swell(c, out, t + 0.33, 260, 6000, 0.10, 0.85); // lights flood the room
  tone(c, out, t + 0.33, 130, 440, 0.06, 0.8, "triangle");
}

// ---- the binary portrait -------------------------------------------------

/**
 * A scattered field of digits pulling itself into a face.
 *
 * The blips are spaced on a square curve so they crowd the start and thin out,
 * mirroring the ease-out the particles actually move on; their pitch spread
 * narrows as they converge, and a short confirm lands on the settle.
 *
 * Returns false when autoplay policy refused to let the context run, so the
 * caller can decide what to do about it - `binary-portrait.tsx` re-runs the
 * whole assembly on the visitor's first gesture rather than playing a sound
 * with no picture attached to it.
 */
export async function playBinaryAssembly(): Promise<boolean> {
  if (isMuted()) return false;
  const a = audio();
  if (!a) return false;
  const { c, out } = a;

  // `audio()` kicks off resume() without awaiting, so a context that was
  // created suspended still reports "suspended" here. Give the resume a moment
  // to land - but race it, because a browser that is still refusing leaves the
  // promise pending forever rather than rejecting, which would hang this call.
  if (c.state === "suspended") {
    await Promise.race([
      c.resume().catch(() => undefined),
      new Promise((resolve) => setTimeout(resolve, 400)),
    ]);
  }

  if (c.state !== "running") return false;

  const t = c.currentTime + 0.02;
  const BLIPS = 26;

  for (let i = 0; i < BLIPS; i++) {
    const p = i / BLIPS;
    const at = t + p * p * 1.15;
    // Wide and scattered at first, converging on one pitch as the face forms.
    const spread = (1 - p) * 900;
    const freq = 2400 - p * 1100 + (Math.random() - 0.5) * spread;
    tick(c, out, at, Math.max(320, freq), 6, 0.09 + (1 - p) * 0.07, 0.03);
  }

  tone(c, out, t, 55, 165, 0.07, 1.3, "triangle"); // the field gathering
  swell(c, out, t, 5200, 420, 0.05, 1.25); // closing in, not opening out

  // settled - a short terminal confirm
  tick(c, out, t + 1.33, 3000, 2, 0.12, 0.04);
  tone(c, out, t + 1.33, 520, 784, 0.1, 0.16);
  tone(c, out, t + 1.43, 784, 1175, 0.08, 0.2);

  return true;
}

// ---- typing ---------------------------------------------------------------

/**
 * Minimum gap between key clicks, in seconds.
 *
 * A line can type faster than a click decays, and without a floor the
 * individual keys smear into one continuous hiss. Dropping the clicks in
 * between costs nothing: nobody counts them, they only hear a rhythm.
 */
const KEY_GAP = 0.022;
let lastKeyAt = 0;

/**
 * One key of a keyboard: a short plastic click with a little body under it.
 *
 * Silent unless the context is actually `running`. Typing starts before the
 * visitor has clicked anything, and scheduling a few hundred nodes into a
 * suspended context would fire the whole paragraph as one burst the moment it
 * resumes - see `primeAudio`.
 */
export function playKeystroke() {
  if (isMuted()) return;
  const a = audio();
  if (!a) return;
  const { c, out } = a;
  if (c.state !== "running") return;

  const t = c.currentTime + 0.005;
  if (t - lastKeyAt < KEY_GAP) return;
  lastKeyAt = t;

  // No two keys on a board sound alike, and a fixed pitch reads as a machine.
  tick(c, out, t, 1900 + Math.random() * 1500, 3.2, 0.05 + Math.random() * 0.025, 0.018);
  tone(c, out, t, 300 + Math.random() * 110, 140, 0.02, 0.03);
}

/**
 * Arms the audio context to start on the visitor's first gesture, and returns
 * the teardown.
 *
 * The intro types itself before anyone has clicked anything, and no browser
 * will let a page make noise until they have. Nothing can make a cold first
 * load audible - but this means a click, tap or keypress anywhere brings the
 * rest of the line in, and a replayed intro, which follows a click by
 * definition, types with sound from its first character.
 *
 * The resume has to happen inside the handler; a `resume()` left pending from
 * an earlier call is not what unblocks a context.
 */
export function primeAudio() {
  if (typeof window === "undefined") return () => {};

  const events = ["pointerdown", "keydown", "touchstart"] as const;
  const wake = () => {
    stop();
    const a = audio();
    if (a && a.c.state === "suspended") void a.c.resume();
  };
  const stop = () => {
    for (const type of events) window.removeEventListener(type, wake);
  };

  for (const type of events) window.addEventListener(type, wake, { passive: true });
  return stop;
}

// ---- fireworks ------------------------------------------------------------

/**
 * How long after the switch is thrown the display begins.
 *
 * Exported because the canvas has to wait exactly as long as the audio does.
 * They ran off two separate numbers to begin with and drifted apart by half a
 * second, which is long enough to watch a shell burst in silence.
 */
export const FIREWORKS_LEAD_MS = 500;

/**
 * How fast the display runs, as a multiplier on real time. Below 1 and the
 * whole thing plays in slow motion - shells further apart, sparks drifting
 * out rather than snapping out, crackle spread over a longer fall.
 *
 * Shared with the canvas so the picture and the sound stretch together.
 */
export const FIREWORKS_SPEED = 0.55;

/** How long shells keep going up for, once the lead-in has passed. */
export const FIREWORKS_LAUNCH_MS = Math.round(1800 / FIREWORKS_SPEED);

/**
 * How many shells go up. Shared so there is a burst for every bang: the two
 * are timed independently - one on the audio clock, one on the frame clock -
 * but they should at least agree on how many there are.
 */
export const FIREWORKS_SHELLS = 9;

let room: { ctx: AudioContext; send: GainNode } | null = null;

/**
 * Open air, as a convolution reverb built from generated noise.
 *
 * This is most of the difference between a bang and a firework. A cracker is
 * heard outdoors: the transient arrives dry and then the sound rolls back off
 * everything around you for a second or two. Without that tail even a
 * well-shaped burst sounds like a click in a padded box.
 *
 * The impulse response is noise under an exponential decay, generated once and
 * cached. A recorded one would be more accurate and would also be a file to
 * ship, license and wait for - the same trade the rest of this module makes.
 */
function space(c: AudioContext, out: GainNode): GainNode {
  if (room && room.ctx === c) return room.send;

  const seconds = 2.4;
  const length = Math.floor(c.sampleRate * seconds);
  const ir = c.createBuffer(2, length, c.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = ir.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // The short ramp at the head keeps the early reflections tight. Without
      // it the tail starts at full level and the burst arrives pre-echoed.
      const head = t < 0.02 ? t / 0.02 : 1;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6) * head;
    }
  }

  const convolver = c.createConvolver();
  convolver.buffer = ir;

  const send = c.createGain();
  const wet = c.createGain();
  wet.gain.value = 0.5;
  send.connect(convolver).connect(wet).connect(out);

  room = { ctx: c, send };
  return send;
}

/** Stereo placement, where the browser has it. Older Safari simply gets mono. */
function placed(c: AudioContext, amount: number): StereoPannerNode | null {
  if (typeof c.createStereoPanner !== "function") return null;
  const node = c.createStereoPanner();
  node.pan.value = Math.max(-1, Math.min(1, amount));
  return node;
}

/**
 * The bang.
 *
 * Broadband noise with a two-millisecond attack under a low-pass falling from
 * bright to dull. That sweep is what makes it read as an explosion opening out
 * rather than a burst of static. `distance` takes the top off and pulls the
 * level down, so shells at the edges sit behind the ones overhead.
 */
function crack(
  c: AudioContext,
  out: GainNode,
  at: number,
  gain: number,
  distance: number,
  pan: number,
) {
  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true; // the noise buffer is shorter than the tail

  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 110;

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(5400 - distance * 3600, at);
  lp.frequency.exponentialRampToValueAtTime(240, at + 0.45);

  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  // The attack is the whole character of a bang. Anything slower is a whoosh.
  g.gain.linearRampToValueAtTime(gain, at + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);

  const spread = placed(c, pan);
  const chain: AudioNode = src.connect(hp).connect(lp).connect(g);
  const end = spread ? (chain.connect(spread), spread) : chain;
  end.connect(out);
  end.connect(space(c, out));

  src.start(at);
  src.stop(at + 0.55);

  // The part you feel rather than hear.
  tone(c, out, at, 62, 33, gain * 1.05, 0.26);
}

/**
 * The string of pops raining down after the burst.
 *
 * Timed on a biased random rather than an even sequence - real crackle is
 * ragged, and anything evenly spaced turns into a rattle. Every pop shares one
 * bus, so a shell costs one panner and one reverb send rather than thirty.
 */
function crackle(
  c: AudioContext,
  out: GainNode,
  at: number,
  spread: number,
  count: number,
  gain: number,
  pan: number,
) {
  const bus = c.createGain();
  const placement = placed(c, pan);
  const end = placement ? (bus.connect(placement), placement) : bus;
  end.connect(out);
  end.connect(space(c, out));

  for (let i = 0; i < count; i++) {
    // Biased towards the start, so the sparks crowd the burst and thin out.
    const when = at + Math.pow(Math.random(), 1.7) * spread;
    const level = gain * (0.35 + Math.random() * 0.65);

    const src = c.createBufferSource();
    src.buffer = noise(c);
    src.playbackRate.value = 1 + Math.random();

    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1700 + Math.random() * 4300;
    bp.Q.value = 2.5 + Math.random() * 3;

    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(level, when + 0.0015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);

    src.connect(bp).connect(g).connect(bus);
    src.start(when);
    src.stop(when + 0.07);
  }
}

/**
 * The display that goes up when the lights come on.
 *
 * Each shell is four sounds: the whistle of it climbing, the crack of the
 * burst, the thump underneath it and the crackle raining down - all of it
 * through the generated open air, and panned to the side of the screen its own
 * burst is drawn on.
 *
 * Safe to fire without checking the context: this only ever runs from the
 * light-switch click, so the gesture that unlocks audio has already happened.
 */
export function playFireworks() {
  if (isMuted()) return;
  const a = audio();
  if (!a) return;
  const { c, out } = a;
  if (c.state !== "running") return;

  // The lead-in keeps the first shell behind the screen flash, rather than
  // going off before the switch has finished being thrown.
  const start = c.currentTime + FIREWORKS_LEAD_MS / 1000;
  // Everything below is written at full speed and stretched by this, so the
  // sound slows down with the picture instead of racing ahead of it.
  const stretch = 1 / FIREWORKS_SPEED;
  const span = FIREWORKS_LAUNCH_MS / 1000;

  for (let i = 0; i < FIREWORKS_SHELLS; i++) {
    const at = start + (i / FIREWORKS_SHELLS) * span + Math.random() * 0.18;

    // Alternating sides, matching how the canvas throws its shells out towards
    // the left and right edges.
    const pan = (i % 2 === 0 ? -1 : 1) * (0.35 + Math.random() * 0.45);
    const distance = Math.random();

    // going up
    const climb = 0.24 * stretch;
    tone(c, out, at - climb, 340 + Math.random() * 220, 1250, 0.022, climb);

    crack(c, out, at, 0.26 - distance * 0.12, distance, pan);
    crackle(
      c,
      out,
      at + 0.05,
      0.75 * stretch,
      18 + Math.floor(Math.random() * 9),
      0.05 - distance * 0.02,
      pan,
    );
  }
}
