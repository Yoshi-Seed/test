import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MISSION, MILESTONES, SAMPLE_COUNT, VECTORS, assertVectorShape,
} from '../src/data/artemisVectors.js';
import {
  computeMissionStats, getState, samplesForCharts, formatUtc,
} from '../src/data/ephemeris.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function approx(actual, expected, tolerance, label) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected} +/- ${tolerance}, got ${actual}`);
}

assert.equal(assertVectorShape(), true, 'vector shape should validate');
assert.equal(SAMPLE_COUNT, 214, 'hourly sample count');
assert.deepEqual(Object.keys(VECTORS).sort(), ['mx', 'my', 'ox', 'oy']);

const stats = computeMissionStats();
assert.equal(stats.maxEarth.index, 117, 'max Earth range should be in closest-approach hourly bin');
assert.equal(stats.minMoon.index, 117, 'closest Moon approach should be in closest-approach hourly bin');
approx(stats.maxEarth.value, 413146, 5, 'max Earth distance');
approx(stats.minMoon.value, 8292, 20, 'closest Moon distance');
assert.ok(stats.maxSpeed.value > 5.5 && stats.maxSpeed.value < 6.2, 'Earth-relative speed after TLI is realistic');

for (const index of [0, 10, 22, 53.5, 100, 117, 134, 192, 213]) {
  const s = getState(index);
  assert.ok(Number.isFinite(s.earthRange), `earth range finite at ${index}`);
  assert.ok(Number.isFinite(s.moonRange), `moon range finite at ${index}`);
  assert.ok(Number.isFinite(s.speedEarth), `speed finite at ${index}`);
  assert.ok(s.date instanceof Date, `date is Date at ${index}`);
  assert.match(formatUtc(s.date), /UTC$/, `UTC formatter at ${index}`);
}

let last = -Infinity;
for (const event of MILESTONES) {
  assert.ok(event.index >= last, `milestone order: ${event.label}`);
  last = event.index;
  assert.ok(event.iso && !Number.isNaN(new Date(event.iso).getTime()), `milestone ISO: ${event.label}`);
}

const charts = samplesForCharts();
assert.equal(charts.length, SAMPLE_COUNT, 'chart samples length');
assert.ok(charts.every(s => Number.isFinite(s.kineticGJ) && Number.isFinite(s.potentialGJ)), 'energy values finite');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const id of ['spaceCanvas', 'timeSlider', 'missionQueue', 'overviewCanvas', 'velocitySpark', 'trueScaleToggle']) {
  assert.ok(html.includes(`id="${id}"`), `index contains #${id}`);
}
for (const rel of ['src/main.js', 'src/style.css', 'src/data/ephemeris.js', 'src/data/artemisVectors.js']) {
  assert.ok(fs.existsSync(path.join(root, rel)), `${rel} exists`);
}
assert.equal(MISSION.source.includes('JPL Horizons'), true, 'source provenance names JPL Horizons');

console.log('All Artemis II ephemeris and app static tests passed.');
