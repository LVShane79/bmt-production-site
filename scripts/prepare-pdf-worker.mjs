import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL('../', import.meta.url));

// Keep PDF.js and its worker byte-for-byte aligned, without a third-party CDN.
export async function preparePdfWorker(destinationRoot = projectRoot) {
  const source = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs');
  const destination = path.join(destinationRoot, 'public/labs/pdfjs/pdf.worker.min.mjs');
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
  return destination;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await preparePdfWorker();
}
