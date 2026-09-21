/**
 * Timing for the console's typing effect.
 *
 * Plain module, not part of the "use client" component: server components call
 * `typedSchedule` while rendering, and every export of a client module is a
 * client reference that cannot be invoked on the server.
 */

export const CHAR_MS = 24;
export const LINE_GAP_MS = 300;

/**
 * Works out when each line should start typing, so a stack of them plays as one
 * sequence instead of all at once. Returns a start delay per line.
 */
export function typedSchedule(lines: string[], startAt = 220) {
  let clock = startAt;
  return lines.map((line) => {
    const start = clock;
    clock += line.length * CHAR_MS + LINE_GAP_MS;
    return start;
  });
}
