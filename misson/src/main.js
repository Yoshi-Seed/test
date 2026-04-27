import {
  MISSION, MILESTONES, SAMPLE_COUNT, SCALE_KM_PER_UNIT,
  getState, buildTrajectory, buildMoonPath, computeMissionStats,
  sceneFromKm, samplesForCharts, formatUtc, clamp, kmToScene
} from './data/ephemeris.js';

const $ = (id) => document.getElementById(id);
const canvas = $('spaceCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const hud = $('hudCanvas');
const hudCtx = hud.getContext('2d');
const labelsLayer = $('labelsLayer');

const sparks = {
  velocity: $('velocitySpark'), earth: $('earthRangeSpark'), moon: $('moonRangeSpark'), overview: $('overviewCanvas')
};
const sparkCtx = Object.fromEntries(Object.entries(sparks).map(([k, c]) => [k, c.getContext('2d')]));

const trajectory = buildTrajectory(0.25);
const moonPath = buildMoonPath(1);
const chartSamples = samplesForCharts();
const stats = computeMissionStats();

const state = {
  index: 0,
  playing: false,
  speed: 1,
  yaw: -0.68,
  pitch: 0.28,
  distance: 15.5,
  zoom: 1240,
  target: [kmToScene(-60000), 0, kmToScene(-165000)],
  trueScale: false,
  showOutbound: true,
  showInbound: true,
  showLabels: true,
  showTrails: true,
  showGuides: true,
  lastFrame: performance.now(),
  pointer: null,
};

const refs = {
  playBtn: $('playBtn'), resetBtn: $('resetBtn'), slider: $('timeSlider'), preset: $('presetSelect'),
  trueScale: $('trueScaleToggle'), outbound: $('outboundArc'), inbound: $('inboundArc'), labels: $('showLabels'), trails: $('showTrails'), guides: $('showGuides')
};

const telemetryEls = {
  met: $('metText'), utc: $('utcText'), earth: $('earthRangeText'), moon: $('moonRangeText'), phase: $('phaseText'),
  eventCode: $('eventCode'), eventTitle: $('eventTitle'), eventDescription: $('eventDescription'),
  speed: $('speedText'), earthChart: $('earthChartText'), moonChart: $('moonChartText'), footerMet: $('footerMet'),
  vectorTag: $('vectorTag'), overviewMode: $('overviewMode'), guidanceMoon: $('guidanceMoon'), guidanceEarth: $('guidanceEarth')
};

const eventDescriptions = {
  sep: 'Orion separates from the upper stage and begins the high elliptical Earth-orbit checkout arc.',
  burn: 'A planned maneuver changes the state vector; watch the trajectory and energy charts jump at this point.',
  soi: 'The Moon becomes the dominant local gravity field. The green SOI ring is drawn at 62,800 km.',
  encounter: 'The free-return turn occurs here: Orion is farthest from Earth and closest to the Moon in the same hourly bin.',
  entry: 'The coast has folded back toward Earth; the capsule is approaching the entry corridor.'
};

const starField = Array.from({ length: 920 }, (_, n) => {
  const seed = Math.sin(n * 91.731) * 10000;
  const r = seed - Math.floor(seed);
  const seed2 = Math.sin((n + 2.17) * 47.19) * 10000;
  const r2 = seed2 - Math.floor(seed2);
  const seed3 = Math.sin((n + 8.11) * 13.79) * 10000;
  const r3 = seed3 - Math.floor(seed3);
  return { x: r, y: r2, size: 0.35 + r3 * 1.35, alpha: 0.16 + r * 0.84 };
});

const moonCraters = Array.from({ length: 34 }, (_, n) => {
  const a = (n * 137.5) * Math.PI / 180;
  const rr = Math.sqrt(((Math.sin(n * 9.37) * 1000) % 1 + 1) % 1) * 0.82;
  return { x: Math.cos(a) * rr, y: Math.sin(a) * rr, r: 0.025 + (((Math.sin(n * 3.1) * 1000) % 1 + 1) % 1) * 0.075 };
});

function dpr() { return Math.max(1, Math.min(2.5, window.devicePixelRatio || 1)); }
function resizeCanvas(c, context = null) {
  const ratio = dpr();
  const rect = c.getBoundingClientRect();
  c.width = Math.max(2, Math.round(rect.width * ratio));
  c.height = Math.max(2, Math.round(rect.height * ratio));
  if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function resizeAll() {
  resizeCanvas(canvas, ctx);
  resizeCanvas(hud, hudCtx);
  Object.values(sparks).forEach((c) => resizeCanvas(c, c.getContext('2d')));
  drawStaticCharts();
  render();
}

function cameraProject(p) {
  const x = p[0] - state.target[0];
  const y = p[1] - state.target[1];
  const z = p[2] - state.target[2];
  const cy = Math.cos(state.yaw), sy = Math.sin(state.yaw);
  const cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
  const x1 = cy * x - sy * z;
  const z1 = sy * x + cy * z;
  const y1 = cp * y - sp * z1;
  const z2 = sp * y + cp * z1;
  const camZ = state.distance + z2;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const scale = state.zoom / Math.max(1.6, camZ);
  return {
    x: w / 2 + x1 * scale,
    y: h / 2 - y1 * scale,
    z: camZ,
    scale,
    visible: camZ > 1.2 && Number.isFinite(scale)
  };
}

function pathPoint(p) { return sceneFromKm(p.x, p.y, p.z); }
function stateOrionPoint(s) { return sceneFromKm(s.orion.x, s.orion.y, s.orion.z); }
function stateMoonPoint(s) { return sceneFromKm(s.moon.x, s.moon.y, s.moon.z); }

function clearScene() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const g = ctx.createRadialGradient(w * 0.48, h * 0.36, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.78);
  g.addColorStop(0, '#071126');
  g.addColorStop(0.55, '#020612');
  g.addColorStop(1, '#000106');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (const star of starField) {
    const twinkle = 0.7 + 0.3 * Math.sin(performance.now() * 0.0004 + star.x * 20);
    ctx.globalAlpha = star.alpha * twinkle;
    ctx.fillStyle = '#cfeaff';
    ctx.beginPath();
    ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawLine3(points, color, width = 1, alpha = 1, dash = null) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  let started = false;
  for (const p of points) {
    const q = cameraProject(p);
    if (!q.visible) { started = false; continue; }
    if (!started) { ctx.moveTo(q.x, q.y); started = true; }
    else ctx.lineTo(q.x, q.y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawSegmentedTrajectory(currentIndex) {
  const cut = currentIndex;
  for (let i = 0; i < trajectory.length - 1; i++) {
    const a = trajectory[i];
    const b = trajectory[i + 1];
    const mid = (a.i + b.i) * 0.5;
    const outbound = mid <= 117;
    if ((outbound && !state.showOutbound) || (!outbound && !state.showInbound)) continue;
    const pa = cameraProject(pathPoint(a));
    const pb = cameraProject(pathPoint(b));
    if (!pa.visible || !pb.visible) continue;
    const past = mid <= cut;
    let alpha = past ? 0.92 : 0.25;
    if (state.showTrails && past) alpha *= 0.45 + 0.55 * clamp(1 - (cut - mid) / 75, 0, 1);
    const hueColor = outbound ? `rgba(111,232,255,${alpha})` : `rgba(255,216,112,${alpha})`;
    ctx.strokeStyle = hueColor;
    ctx.lineWidth = past ? 2.4 : 1.25;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }
}

function drawGrid() {
  if (!state.showGuides) return;
  const extent = 10;
  const lines = [];
  for (let i = -extent; i <= extent; i++) {
    lines.push([[i, 0, -extent], [i, 0, extent]]);
    lines.push([[-extent, 0, i], [extent, 0, i]]);
  }
  for (const [a, b] of lines) drawLine3([a, b], 'rgba(91, 164, 255, 0.11)', 1, 1);
  drawLine3([[-extent, 0, 0], [extent, 0, 0]], 'rgba(121,231,255,0.22)', 1, 1);
  drawLine3([[0, 0, -extent], [0, 0, extent]], 'rgba(121,231,255,0.22)', 1, 1);
}

function circlePoints(center, radius, count = 96, vertical = false) {
  const pts = [];
  for (let i = 0; i <= count; i++) {
    const a = (i / count) * Math.PI * 2;
    pts.push(vertical
      ? [center[0] + Math.cos(a) * radius, center[1] + Math.sin(a) * radius, center[2]]
      : [center[0] + Math.cos(a) * radius, center[1], center[2] + Math.sin(a) * radius]
    );
  }
  return pts;
}

function drawGuides(current) {
  if (!state.showGuides) return;
  const moonCenter = stateMoonPoint(current);
  const moonOrbit = moonPath.map((p) => sceneFromKm(p.x, p.y, p.z));
  drawLine3(moonOrbit, 'rgba(185,197,218,0.16)', 1, 1, [3, 7]);
  drawLine3(circlePoints(moonCenter, MISSION.lunarSoiKm / SCALE_KM_PER_UNIT, 144), 'rgba(112,246,189,0.32)', 1.2, 1, [6, 6]);
  drawLine3([[0, 0, 0], moonCenter], 'rgba(121,231,255,0.08)', 1, 1);
}

function drawEarth(center, radiusScene) {
  const p = cameraProject(center);
  if (!p.visible) return;
  const r = Math.max(5, radiusScene * p.scale);
  ctx.save();
  ctx.shadowBlur = r * 0.55;
  ctx.shadowColor = 'rgba(63,201,255,0.4)';
  const g = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.45, r * 0.08, p.x, p.y, r * 1.05);
  g.addColorStop(0, '#78f7ff');
  g.addColorStop(0.28, '#0e8ac4');
  g.addColorStop(0.56, '#083d78');
  g.addColorStop(1, '#01192f');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.clip();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#3cf0a8';
  for (let i = 0; i < 14; i++) {
    const a = i * 1.91 + 0.7;
    const x = p.x + Math.cos(a) * r * (0.15 + (i % 5) * 0.12);
    const y = p.y + Math.sin(a * 1.7) * r * (0.12 + (i % 4) * 0.13);
    ctx.beginPath();
    ctx.ellipse(x, y, r * (0.08 + (i % 3) * 0.035), r * (0.035 + (i % 4) * 0.018), a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = '#9cf8ff';
  ctx.lineWidth = 0.8;
  for (let k = -4; k <= 4; k++) {
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + (k / 5) * r, r * Math.sqrt(1 - Math.pow(k / 5, 2)), r * 0.08, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let k = -5; k <= 5; k++) {
    ctx.beginPath();
    ctx.ellipse(p.x + (k / 10) * r * 0.16, p.y, r * 0.12, r, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = 'rgba(121,231,255,0.28)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r + 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawMoon(center, radiusScene) {
  const p = cameraProject(center);
  if (!p.visible) return;
  const r = Math.max(4, radiusScene * p.scale);
  ctx.save();
  ctx.shadowBlur = r * 0.24;
  ctx.shadowColor = 'rgba(255,255,255,0.3)';
  const g = ctx.createRadialGradient(p.x - r * 0.28, p.y - r * 0.35, r * 0.1, p.x, p.y, r);
  g.addColorStop(0, '#f3f4f7');
  g.addColorStop(0.4, '#9aa0aa');
  g.addColorStop(1, '#343946');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.clip();
  ctx.shadowBlur = 0;
  for (const c of moonCraters) {
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = '#111722';
    ctx.beginPath();
    ctx.arc(p.x + c.x * r, p.y + c.y * r, c.r * r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.13;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  }
  ctx.restore();
}

function drawOrion(current) {
  const p = cameraProject(stateOrionPoint(current));
  if (!p.visible) return;
  const pulse = 0.75 + 0.25 * Math.sin(performance.now() * 0.007);
  ctx.save();
  ctx.shadowBlur = 24 * pulse;
  ctx.shadowColor = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 4.5 + 1.5 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(121,231,255,0.82)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p.x - 12, p.y); ctx.lineTo(p.x + 12, p.y);
  ctx.moveTo(p.x, p.y - 12); ctx.lineTo(p.x, p.y + 12);
  ctx.stroke();
  ctx.restore();
}

function drawMilestones() {
  for (const m of MILESTONES) {
    if (m.index < 0 || m.index >= SAMPLE_COUNT) continue;
    const sample = getState(m.index);
    const p = cameraProject(stateOrionPoint(sample));
    if (!p.visible) continue;
    const isBurn = m.kind === 'burn';
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = isBurn ? '#ff8b62' : m.kind === 'soi' ? '#70f6bd' : '#ffd772';
    ctx.shadowBlur = 14;
    ctx.shadowColor = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(p.x, p.y, isBurn ? 4.2 : 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function setLabel(key, className, text, worldPoint, dy = -8) {
  let el = labelsLayer.querySelector(`[data-key="${key}"]`);
  if (!el) {
    el = document.createElement('div');
    el.dataset.key = key;
    el.className = `scene-label ${className}`;
    labelsLayer.appendChild(el);
  }
  const p = cameraProject(worldPoint);
  el.textContent = text;
  el.style.display = state.showLabels && p.visible ? 'block' : 'none';
  el.style.left = `${p.x}px`;
  el.style.top = `${p.y + dy}px`;
}

function updateLabels(current) {
  if (!state.showLabels) {
    labelsLayer.replaceChildren();
    return;
  }
  setLabel('earth', 'earth', 'EARTH', [0, 0, 0], -18);
  setLabel('moon', 'moon', 'MOON', stateMoonPoint(current), -10);
  setLabel('orion', 'orion', 'ORION', stateOrionPoint(current), -14);
  const active = current.nearestEvent;
  if (active) setLabel('event', 'event', active.short, stateOrionPoint(getState(active.index)), -26);
  else {
    const e = labelsLayer.querySelector('[data-key="event"]');
    if (e) e.style.display = 'none';
  }
}

function drawHudGlow() {
  const w = hud.clientWidth, h = hud.clientHeight;
  hudCtx.clearRect(0, 0, w, h);
  hudCtx.save();
  hudCtx.strokeStyle = 'rgba(121,231,255,0.055)';
  hudCtx.lineWidth = 1;
  for (let x = 0; x < w; x += 42) {
    hudCtx.beginPath(); hudCtx.moveTo(x, 0); hudCtx.lineTo(x, h); hudCtx.stroke();
  }
  for (let y = 0; y < h; y += 42) {
    hudCtx.beginPath(); hudCtx.moveTo(0, y); hudCtx.lineTo(w, y); hudCtx.stroke();
  }
  hudCtx.restore();
}

function render() {
  if (!ctx) return;
  clearScene();
  const current = getState(state.index);
  drawGrid();
  drawGuides(current);
  drawSegmentedTrajectory(state.index);
  drawMilestones();
  const earthRadius = state.trueScale ? MISSION.earthRadiusKm / SCALE_KM_PER_UNIT : 0.78;
  const moonRadius = state.trueScale ? MISSION.moonRadiusKm / SCALE_KM_PER_UNIT : 0.22;
  drawEarth([0, 0, 0], earthRadius);
  drawMoon(stateMoonPoint(current), moonRadius);
  drawOrion(current);
  drawHudGlow();
  updateLabels(current);
}

function formatKm(value) { return `${Math.round(value).toLocaleString()} km`; }
function formatSpeed(value) { return `${value.toFixed(value < 1 ? 3 : 2)} km/s`; }
function formatGJ(value) { return `${value.toFixed(Math.abs(value) < 10 ? 1 : 0)} GJ`; }

function updateTelemetry() {
  const s = getState(state.index);
  telemetryEls.met.textContent = s.met;
  telemetryEls.footerMet.textContent = s.met;
  telemetryEls.utc.textContent = formatUtc(s.date);
  telemetryEls.earth.textContent = formatKm(s.earthRange);
  telemetryEls.moon.textContent = formatKm(s.moonRange);
  telemetryEls.phase.textContent = s.phase;
  telemetryEls.speed.textContent = formatSpeed(s.speedEarth);
  telemetryEls.earthChart.textContent = formatKm(s.earthRange);
  telemetryEls.moonChart.textContent = formatKm(s.moonRange);
  telemetryEls.vectorTag.textContent = state.index < 117 ? 'OUTBOUND' : 'INBOUND';
  telemetryEls.overviewMode.textContent = state.index < 100 ? 'EARTH-MOON' : 'RETURN MAP';
  const event = s.nearestEvent;
  if (event) {
    telemetryEls.eventCode.textContent = event.short.toUpperCase();
    telemetryEls.eventTitle.textContent = event.label;
    telemetryEls.eventDescription.textContent = eventDescriptions[event.kind] || 'Mission event captured in the ephemeris timeline.';
  } else {
    telemetryEls.eventCode.textContent = s.phase.includes('Outbound') ? 'COAST' : 'NAV';
    telemetryEls.eventTitle.textContent = s.phase;
    telemetryEls.eventDescription.textContent = `Earth-relative speed ${formatSpeed(s.speedEarth)}; specific orbital energy ${(s.totalGJ).toFixed(1)} GJ.`;
  }
  refs.slider.value = String(state.index);
  drawDynamicCharts();
  updateQueue();
}

function drawSpark(canvasEl, data, valueFn, color, currentIndex, minOverride = null, maxOverride = null, fill = false) {
  const c = canvasEl.getContext('2d');
  const w = canvasEl.clientWidth, h = canvasEl.clientHeight;
  c.clearRect(0, 0, w, h);
  const values = data.map(valueFn);
  const min = minOverride ?? Math.min(...values);
  const max = maxOverride ?? Math.max(...values);
  const pad = 7;
  c.save();
  c.strokeStyle = 'rgba(122,160,220,0.16)';
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(0, h - pad); c.lineTo(w, h - pad); c.stroke();
  c.beginPath();
  values.forEach((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - pad - ((v - min) / Math.max(1e-9, max - min)) * (h - pad * 2);
    if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
  });
  if (fill) {
    c.lineTo(w, h - pad); c.lineTo(0, h - pad); c.closePath();
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, color.replace('1)', '0.35)'));
    g.addColorStop(1, color.replace('1)', '0.02)'));
    c.fillStyle = g; c.fill();
  }
  c.strokeStyle = color;
  c.lineWidth = 2;
  c.stroke();
  const xNow = (currentIndex / (SAMPLE_COUNT - 1)) * w;
  c.strokeStyle = 'rgba(255,255,255,0.55)';
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(xNow, 3); c.lineTo(xNow, h - 3); c.stroke();
  c.restore();
}

function drawStaticCharts() {
  drawDynamicCharts();
  drawOverview();
}

function drawDynamicCharts() {
  drawSpark(sparks.velocity, chartSamples, s => s.speedEarth, 'rgba(121,231,255,1)', state.index, null, null, false);
  drawSpark(sparks.earth, chartSamples, s => s.earthRange, 'rgba(118,170,255,1)', state.index, 0, stats.maxEarth.value, true);
  drawSpark(sparks.moon, chartSamples, s => s.moonRange, 'rgba(255,216,112,1)', state.index, 0, Math.max(...chartSamples.map(s => s.moonRange)), true);
  drawOverview();
}

function drawOverview() {
  const c = sparkCtx.overview;
  const w = sparks.overview.clientWidth, h = sparks.overview.clientHeight;
  c.clearRect(0, 0, w, h);
  c.save();
  c.fillStyle = 'rgba(1,6,20,0.75)'; c.fillRect(0, 0, w, h);
  c.strokeStyle = 'rgba(121,231,255,0.08)'; c.lineWidth = 1;
  for (let x = 0; x < w; x += 22) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  const bounds = { minX: -400000, maxX: 210000, minY: -430000, maxY: 25000 };
  const map = (x, y) => [
    12 + ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * (w - 24),
    12 + (1 - (y - bounds.minY) / (bounds.maxY - bounds.minY)) * (h - 24)
  ];
  c.beginPath();
  trajectory.forEach((p, i) => {
    const [x, y] = map(p.x, p.y);
    if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
  });
  c.strokeStyle = 'rgba(121,231,255,0.68)'; c.lineWidth = 1.5; c.stroke();
  const now = getState(state.index);
  const [ex, ey] = map(0, 0);
  const [mx, my] = map(now.moon.x, now.moon.y);
  const [ox, oy] = map(now.orion.x, now.orion.y);
  c.fillStyle = '#79e7ff'; c.beginPath(); c.arc(ex, ey, 4, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#d7d7df'; c.beginPath(); c.arc(mx, my, 3.2, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(ox, oy, 3.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#8aa5ca'; c.font = '10px ui-monospace, monospace'; c.fillText('EARTH', ex + 7, ey + 4); c.fillText('MOON', mx + 7, my + 4); c.fillText('ORION', ox + 7, oy - 5);
  c.restore();
}

function buildTicks() {
  const strip = $('tickStrip');
  strip.replaceChildren();
  for (let h = 0; h <= 213; h += 24) {
    const div = document.createElement('div');
    div.className = 'tick';
    div.style.left = `${(h / 213) * 100}%`;
    div.textContent = `T+${Math.floor((h + 3.4) / 24)}d`;
    strip.appendChild(div);
  }
}

function buildQueue() {
  const q = $('missionQueue');
  q.replaceChildren();
  for (const m of MILESTONES.filter((m, idx) => idx === 0 || m.index !== MILESTONES[idx - 1].index || m.kind === 'encounter')) {
    const item = document.createElement('div');
    item.className = 'queue-item';
    item.dataset.index = String(m.index);
    item.innerHTML = `<b>${m.label}</b><span>${m.met}</span>`;
    q.appendChild(item);
  }
}

function updateQueue() {
  document.querySelectorAll('.queue-item').forEach((el) => {
    const idx = Number(el.dataset.index);
    el.classList.toggle('passed', idx < state.index - 0.6);
    el.classList.toggle('active', Math.abs(idx - state.index) < 3.5);
  });
}

function applyPreset(name) {
  if (name === 'flyby') {
    const s = getState(117);
    state.target = stateMoonPoint(s);
    state.distance = 4.2; state.zoom = 960; state.yaw = -0.7; state.pitch = 0.36; state.index = 112;
  } else if (name === 'earth') {
    state.target = [0, 0, 0]; state.distance = 6.5; state.zoom = 1120; state.yaw = -0.88; state.pitch = 0.36; state.index = 22;
  } else if (name === 'return') {
    state.target = [kmToScene(-80000), 0, kmToScene(-250000)]; state.distance = 12; state.zoom = 1260; state.yaw = -0.55; state.pitch = 0.22; state.index = 168;
  } else {
    state.target = [kmToScene(-60000), 0, kmToScene(-165000)]; state.distance = 15.5; state.zoom = 1240; state.yaw = -0.68; state.pitch = 0.28;
  }
  refs.slider.value = String(state.index);
  updateTelemetry();
  render();
}

function setupEvents() {
  refs.playBtn.addEventListener('click', () => {
    state.playing = !state.playing;
    refs.playBtn.textContent = state.playing ? 'Pause' : 'Play';
  });
  refs.resetBtn.addEventListener('click', () => { state.index = 0; state.playing = false; refs.playBtn.textContent = 'Play'; updateTelemetry(); render(); });
  refs.slider.addEventListener('input', (e) => { state.index = Number(e.target.value); state.playing = false; refs.playBtn.textContent = 'Play'; updateTelemetry(); render(); });
  document.querySelectorAll('.speed').forEach(btn => btn.addEventListener('click', () => {
    state.speed = Number(btn.dataset.speed);
    document.querySelectorAll('.speed').forEach(b => b.classList.toggle('active', b === btn));
  }));
  refs.preset.addEventListener('change', (e) => applyPreset(e.target.value));
  refs.trueScale.addEventListener('change', (e) => { state.trueScale = e.target.checked; render(); });
  refs.outbound.addEventListener('change', (e) => { state.showOutbound = e.target.checked; render(); });
  refs.inbound.addEventListener('change', (e) => { state.showInbound = e.target.checked; render(); });
  refs.labels.addEventListener('change', (e) => { state.showLabels = e.target.checked; render(); });
  refs.trails.addEventListener('change', (e) => { state.showTrails = e.target.checked; render(); });
  refs.guides.addEventListener('change', (e) => { state.showGuides = e.target.checked; render(); });

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    state.pointer = { x: e.clientX, y: e.clientY, yaw: state.yaw, pitch: state.pitch };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!state.pointer) return;
    const dx = e.clientX - state.pointer.x;
    const dy = e.clientY - state.pointer.y;
    state.yaw = state.pointer.yaw + dx * 0.006;
    state.pitch = clamp(state.pointer.pitch + dy * 0.004, -1.1, 1.15);
    render();
  });
  canvas.addEventListener('pointerup', () => { state.pointer = null; });
  canvas.addEventListener('pointercancel', () => { state.pointer = null; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0012);
    state.zoom = clamp(state.zoom * factor, 420, 3200);
    render();
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); refs.playBtn.click(); }
    else if (e.code === 'ArrowRight') { state.index = clamp(state.index + 1, 0, SAMPLE_COUNT - 1); updateTelemetry(); render(); }
    else if (e.code === 'ArrowLeft') { state.index = clamp(state.index - 1, 0, SAMPLE_COUNT - 1); updateTelemetry(); render(); }
  });
  window.addEventListener('resize', resizeAll);
}

function animate(now) {
  const dt = Math.min(0.08, (now - state.lastFrame) / 1000);
  state.lastFrame = now;
  if (state.playing) {
    state.index += dt * state.speed;
    if (state.index >= SAMPLE_COUNT - 1) { state.index = SAMPLE_COUNT - 1; state.playing = false; refs.playBtn.textContent = 'Play'; }
    updateTelemetry();
  }
  render();
  requestAnimationFrame(animate);
}

function bootstrap() {
  if (!ctx) {
    document.body.innerHTML = '<main style="padding:2rem;color:white;background:#02040c;font-family:sans-serif">Canvas rendering is not available in this browser.</main>';
    return;
  }
  buildTicks();
  buildQueue();
  setupEvents();
  telemetryEls.guidanceMoon.textContent = `${Math.round(stats.minMoon.value).toLocaleString()} km center`;
  telemetryEls.guidanceEarth.textContent = `${Math.round(stats.maxEarth.value).toLocaleString()} km`;
  resizeAll();
  updateTelemetry();
  window.__ARTEMIS_APP_READY__ = true;
  requestAnimationFrame(animate);
}

bootstrap();
