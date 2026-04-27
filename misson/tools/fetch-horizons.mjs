#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..', 'data', 'raw');
await fs.mkdir(outDir, { recursive: true });

const base = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const common = new URLSearchParams({
  format: 'text',
  OBJ_DATA: 'NO',
  MAKE_EPHEM: 'YES',
  EPHEM_TYPE: 'VECTORS',
  START_TIME: '2026-Apr-02 01:58:32',
  STOP_TIME: '2026-Apr-10 23:52:00',
  STEP_SIZE: '60 min',
  VEC_TABLE: '2',
  CSV_FORMAT: 'YES',
  REF_PLANE: 'ECLIPTIC',
  OUT_UNITS: 'KM-S',
});

const jobs = [
  { name: 'earth_ssb.txt', params: { COMMAND: '399', CENTER: '500@0' } },
  { name: 'moon_geo.txt', params: { COMMAND: '301', CENTER: '500' } },
  // Orion/Integrity spacecraft is commonly listed as body -1024 for Artemis II datasets.
  // Availability depends on the current Horizons catalog/export permissions.
  { name: 'orion_ssb.txt', params: { COMMAND: '-1024', CENTER: '500@0' } },
];

for (const job of jobs) {
  const url = new URL(base);
  const qs = new URLSearchParams(common);
  Object.entries(job.params).forEach(([k, v]) => qs.set(k, v));
  url.search = qs.toString();
  console.log(`Fetching ${job.name} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${job.name}: HTTP ${res.status}`);
  const text = await res.text();
  await fs.writeFile(path.join(outDir, job.name), text);
  console.log(`Saved ${job.name} (${text.length.toLocaleString()} bytes)`);
}
