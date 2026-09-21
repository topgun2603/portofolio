/**
 * Turns a portrait into a grid of 0s and 1s by reading its pixels.
 *
 * Runs once per image: the analysis canvas is deliberately tiny (about 92
 * columns), while the canvas that displays the result can be any size. Nothing
 * here belongs in an animation frame.
 */

export type BinaryCell = {
  col: number;
  row: number;
  char: "0" | "1";
  /** 0-1 source brightness, used to bias how strongly the cell is drawn. */
  brightness: number;
};

export type BinaryPortrait = {
  columns: number;
  rows: number;
  cells: BinaryCell[];
};

/**
 * Below this the pixel is treated as backdrop and no character is emitted.
 *
 * The console reads `public/gowtham-source.png`, which has no alpha channel:
 * it is a photograph shot against black, so this cutoff is what does the
 * separating and the `alpha < 30` test below only earns its keep if a cut-out
 * source is swapped in. It is deliberately low, and it can afford to be - the
 * backdrop measures a true 0.00 while the hair and the suit sit around
 * 0.13-0.16, so there is daylight between them. Raising it starts hollowing the
 * figure out. A portrait shot against anything lighter needs a higher cutoff,
 * or the subject cut out first.
 */
export const BACKGROUND_CUTOFF = 0.02;

/** Dark pixels become 1, light pixels become 0. */
export const CHAR_THRESHOLD = 0.45;

const cache = new Map<string, Promise<BinaryPortrait>>();

export function imageToBinary(src: string, columns = 92): Promise<BinaryPortrait> {
  const key = `${src}@${columns}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const job = analyse(src, columns);
  cache.set(key, job);
  // A failed decode should not poison the cache for the rest of the session.
  job.catch(() => cache.delete(key));
  return job;
}

async function analyse(src: string, columns: number): Promise<BinaryPortrait> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;
  await image.decode();

  const rows = Math.max(
    1,
    Math.round((image.naturalHeight / image.naturalWidth) * columns),
  );

  const canvas = document.createElement("canvas");
  canvas.width = columns;
  canvas.height = rows;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");

  ctx.drawImage(image, 0, 0, columns, rows);
  const { data } = ctx.getImageData(0, 0, columns, rows);

  const cells: BinaryCell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const i = (row * columns + col) * 4;
      const alpha = data[i + 3];
      if (alpha < 30) continue; // genuine transparency, if the source has any

      const brightness =
        (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      if (brightness < BACKGROUND_CUTOFF) continue;

      cells.push({
        col,
        row,
        char: brightness < CHAR_THRESHOLD ? "1" : "0",
        brightness,
      });
    }
  }

  return { columns, rows, cells };
}
