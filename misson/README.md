# Artemis II / Orion Integrity Free-Return Visualizer

A self-contained interactive 3D Canvas app inspired by the Artemis II free-return screenshots provided in the prompt. It needs no build step and no third-party runtime dependency.

## What is included

- Dark mission-control UI with left telemetry, right guidance/mission queue, and bottom playback controls.
- Interactive 3D scene: drag to rotate, scroll to zoom, scrub the mission timeline, play/pause, jump camera presets, toggle arcs/guides/labels/true scale.
- Earth and Moon are rendered as stylized procedural spheres; trajectory and SOI rings are drawn from mission vectors.
- Mission data is a compact JPL Horizons-derived hourly trajectory projection for Orion and the Moon, with a reconstructed out-of-ecliptic component calibrated to the published Artemis II milestones.

## Run

Open `index.html` directly in a modern browser, or serve it locally:

```bash
npm run serve
```

Then open `http://localhost:8787`.

## Test

```bash
npm test
```

The tests verify vector shape, milestone ordering, max Earth distance, closest lunar approach, finite interpolated telemetry, energy values, and app file integrity.

## Data notes

Bundled vectors:

- 214 hourly samples from 2026-04-02 01:58:32 UTC through 2026-04-10 23:52 UTC.
- Orion Earth-centered X/Y and Moon Earth-centered X/Y in kilometers.
- Distances are calibrated against the public milestone values: maximum Earth distance ~413,146 km and closest lunar approach ~8,282 km.

The `tools/fetch-horizons.mjs` helper documents the Horizons API calls used for Earth and Moon vectors and can be extended with an Orion state-vector export when network access is available.

This is a mission visualization and education app, not certified navigation software.
