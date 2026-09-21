/**
 * Beam state lives outside React on purpose.
 *
 * The pointer can fire 120+ events per second. Routing that through useState
 * would re-render the whole tree every frame. Instead the pointer handler and
 * the rAF draw loop both mutate this singleton, and React only hears about
 * discrete events (a zone was discovered, the switch was found).
 */

export const BASE_RADIUS = 275;

/**
 * A fixed radius that feels like a torch on a desktop monitor lights up most of
 * a phone, which kills the sense of discovery. Scale it to the short edge.
 */
export function computeRadius() {
  const short = Math.min(window.innerWidth, window.innerHeight);
  return Math.max(175, Math.min(short * 0.34, BASE_RADIUS));
}

export type PointerKind = "mouse" | "touch";

export const beam = {
  /** smoothed position, what actually gets drawn */
  x: -9999,
  y: -9999,
  /** raw pointer target, what we lerp toward */
  tx: -9999,
  ty: -9999,
  /** smoothed radius */
  radius: 0,
  /** desired radius; set this to the viewport diagonal to "turn the lights on" */
  targetRadius: 0,
  /** how hard the beam trails the cursor. lower = heavier, more physical */
  ease: 0.17,
  radiusEase: 0.09,
  /** true once the torch has been picked up */
  live: false,
  /** finger is currently down (touch only) */
  dragging: false,
  pointerKind: "mouse" as PointerKind,
};

export function resetBeam() {
  beam.x = beam.tx = -9999;
  beam.y = beam.ty = -9999;
  beam.radius = 0;
  beam.targetRadius = 0;
  beam.ease = 0.17;
  beam.radiusEase = 0.09;
  beam.live = false;
  beam.dragging = false;
}

/** Shortest distance from a point to the edge of a rect (0 if inside). */
export function distanceToRect(x: number, y: number, rect: DOMRect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

export function viewportDiagonal() {
  return Math.hypot(window.innerWidth, window.innerHeight);
}
