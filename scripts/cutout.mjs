/**
 * Gives a portrait photo a real alpha channel.
 *
 *   node scripts/cutout.mjs public/photo.png public/photo-cutout.png [cutoff]
 *
 * Why a flood fill and not a colour key: these photos are shot on black, and
 * so is the hair and the suit. Keying out "everything dark" punches holes
 * through the subject. Flooding inward from the frame's borders removes only
 * darkness that is *connected to the edge*, which is the backdrop by
 * definition, and leaves enclosed dark areas alone.
 *
 * The resulting alpha does real work in two places: the hero `<Image>` needs it
 * so the photo is not a visible rectangle, and the console's binary portrait
 * uses `alpha < 30` to tell subject from background.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const [src, out, cutoffArg, keepTopArg] = process.argv.slice(2);
if (!src || !out) {
  console.error("usage: node scripts/cutout.mjs <src.png> <out.png> [cutoff] [keepTop]");
  process.exit(1);
}

/** Brightness below which a border-connected pixel counts as backdrop. */
const CUTOFF = Number(cutoffArg ?? 0.035);
/**
 * Fraction of the silhouette to keep, measured from the top. A full-length
 * photo makes a fine hero, but the console renders a *face* out of binary - at
 * full height the head is a handful of glyphs. 0.66 lands around mid-torso.
 */
const KEEP_TOP = Number(keepTopArg ?? 1);
/** Box-blur passes over the alpha mask, so the edge is not stair-stepped. */
const FEATHER = 2;

const png = PNG.sync.read(readFileSync(src));
const { width: W, height: H, data: d } = png;
const n = W * H;

const bright = new Float32Array(n);
for (let i = 0; i < n; i++) {
  const p = i * 4;
  bright[i] = (d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114) / 255;
}

// Flood inward from every border pixel dark enough to be backdrop.
const bg = new Uint8Array(n);
const queue = new Int32Array(n);
let head = 0;
let tail = 0;
const push = (i) => {
  if (!bg[i] && bright[i] < CUTOFF) {
    bg[i] = 1;
    queue[tail++] = i;
  }
};
for (let x = 0; x < W; x++) {
  push(x);
  push((H - 1) * W + x);
}
for (let y = 0; y < H; y++) {
  push(y * W);
  push(y * W + W - 1);
}
while (head < tail) {
  const i = queue[head++];
  const x = i % W;
  const y = (i / W) | 0;
  if (x > 0) push(i - 1);
  if (x < W - 1) push(i + 1);
  if (y > 0) push(i - W);
  if (y < H - 1) push(i + W);
}

let removed = 0;
const alpha = new Float32Array(n);
for (let i = 0; i < n; i++) {
  alpha[i] = bg[i] ? 0 : 255;
  if (bg[i]) removed++;
}

const tmp = new Float32Array(n);
for (let pass = 0; pass < FEATHER; pass++) {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          sum += alpha[yy * W + xx];
          count++;
        }
      }
      tmp[y * W + x] = sum / count;
    }
  }
  alpha.set(tmp);
}

for (let i = 0; i < n; i++) {
  const a = alpha[i];
  d[i * 4 + 3] = a < 1 ? 0 : a > 254 ? 255 : Math.round(a);
}

// Report where the subject ended up, so a bad cutoff is obvious rather than
// something you only notice on the page.
let minX = W;
let maxX = 0;
let minY = H;
let maxY = 0;
let kept = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (d[(y * W + x) * 4 + 3] > 30) {
      kept++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

// Trim the now-transparent margins. Both consumers fit the image to a box -
// the hero with `object-contain`, the console by fitting the binary grid - so
// dead space around the subject shrinks him and pushes him off centre. Cropping
// to the silhouette makes the file's edges mean something.
const keepY = minY + Math.round((maxY - minY + 1) * KEEP_TOP) - 1;
const cropped = new PNG({ width: maxX - minX + 1, height: keepY - minY + 1 });
PNG.bitblt(png, cropped, minX, minY, cropped.width, cropped.height, 0, 0);
writeFileSync(out, PNG.sync.write(cropped));

const pct = (v) => Math.round((v / n) * 100) + "%";
console.log(`${src} -> ${out}`);
console.log(`  ${W}x${H} -> ${cropped.width}x${cropped.height}, cutoff ${CUTOFF}`);
console.log(`  backdrop removed : ${pct(removed)}`);
console.log(`  subject kept     : ${pct(kept)}`);
console.log(`  corner alpha     : ${d[3]} ${d[3] === 0 ? "(transparent)" : "(NOT transparent)"}`);
console.log(
  `  subject spans    : x ${(minX / W).toFixed(3)}-${(maxX / W).toFixed(3)}, ` +
    `y ${(minY / H).toFixed(3)}-${(maxY / H).toFixed(3)}`,
);
