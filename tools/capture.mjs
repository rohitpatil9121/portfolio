/* Capture N deterministic frames of scene.html via CDP. */
import { writeFileSync, mkdirSync } from 'node:fs';
const [PORT, URL_, OUTDIR, FRAMES] = process.argv.slice(2);
const N = +FRAMES;
mkdirSync(OUTDIR, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (m, p = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });

await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 640, height: 360, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: URL_ });
await sleep(1600);

for (let i = 0; i < N; i++) {
  await send('Runtime.evaluate', { expression: `setT(${(i / N).toFixed(5)})` });
  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 640, height: 360, scale: 1 }
  });
  writeFileSync(`${OUTDIR}/f${String(i).padStart(3, '0')}.png`, Buffer.from(shot.result.data, 'base64'));
}
console.log(`captured ${N} frames -> ${OUTDIR}`);
ws.close();
