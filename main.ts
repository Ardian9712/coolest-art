// coolest-art-01 entry: the art is entry.png beside this file — a glowing whale
// drifting through a starlit night sky above a sleeping city, lanterns and a full
// moon below it. This program places that single PNG at /output/entry.png so the
// sealed gate reads exactly these bytes. Node 22, standard library only.
//
// Outside the grader's container MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// The artwork lives next to this program; it is the one file the entry submits.
const ARTWORK_PATH = fileURLToPath(new URL('./entry.png', import.meta.url));
const OUTPUT_NAME = 'entry.png';

// The gate refuses an image larger than 1 MiB, so check the size before
// writing anything: an over-limit file would be scored 0 no matter its art.
const MAX_BYTES = 1048576;

// /output is where the grader looks; the env var overrides it for local runs.
function outputDirectory(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
}

function main(): void {
  // Guard: without the artwork there is nothing to enter, so say so and stop
  // rather than writing a truncated or empty file the gate would refuse.
  if (!existsSync(ARTWORK_PATH)) {
    console.error(`entry source not found: ${ARTWORK_PATH} — keep entry.png beside main.ts`);
    process.exitCode = 1;
    return;
  }

  // Read the whole image, then write those exact bytes out: the judge sees the
  // file's bytes and nothing else, so a plain read/write keeps them identical.
  const imageBytes = readFileSync(ARTWORK_PATH);

  // Size guard: the gate caps the file at 1 MiB (1048576 bytes). Refuse loudly
  // instead of shipping an entry the scorer would mark invalid.
  if (imageBytes.byteLength > MAX_BYTES) {
    console.error(
      `entry too large: ${imageBytes.byteLength} bytes, limit is ${MAX_BYTES} (1 MiB) — shrink ${ARTWORK_PATH}`,
    );
    process.exitCode = 1;
    return;
  }

  // Make sure the destination directory exists first: MAKEFUN_OUTPUT_DIR may
  // point at a path nobody created yet, and writeFileSync does not mkdir.
  // recursive: true also creates any missing parents, and is a no-op when the
  // directory is already there, so a second run behaves exactly like the first.
  mkdirSync(outputDirectory(), { recursive: true });

  const destination = join(outputDirectory(), OUTPUT_NAME);
  writeFileSync(destination, imageBytes);

  console.log(`wrote ${imageBytes.byteLength} bytes to ${destination}`);
}

main();
