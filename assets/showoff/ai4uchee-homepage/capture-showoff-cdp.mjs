#!/usr/bin/env node
/**
 *Zero-dependency Chrome DevTools Protocol (CDP) multi-ratio section screenshot capture
 * for `ak:show-off` (`horizontal` 1920x1080, `vertical` 1080x1920, `square` 1080x1080).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'index.html');
const outDir = path.join(__dirname, 'images');
fs.mkdirSync(outDir, { recursive: true });

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RATIOS = [
  { name: 'horizontal', width: 1920, height: 1080 },
  { name: 'vertical', width: 1080, height: 1920 },
  { name: 'square', width: 1080, height: 1080 },
];
const SECTIONS = [
  'hero',
  'video-guide',
  'six-books-labs',
  'problem-solving',
  'whitebox-copilot',
  'calc-sheet-cta',
];

function launchChrome(profileDir) {
  const proc = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--hide-scrollbars',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
  return new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => reject(new Error('Chrome DevTools timeout')), 15000);
    proc.stderr.on('data', (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) {
        clearTimeout(timer);
        resolve({ proc, wsUrl: m[1] });
      }
    });
    proc.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited (${code})`));
    });
  });
}

function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  return new Promise((resolve, reject) => {
    ws.onopen = () => resolve({ send, close: () => ws.close() });
    ws.onerror = reject;
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'showoff-cdp-'));
const { proc, wsUrl } = await launchChrome(profileDir);
const cdp = await connectCdp(wsUrl);

try {
  const { targetInfos } = await cdp.send('Target.getTargets');
  const pageTarget = targetInfos.find((t) => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', {
    targetId: pageTarget.targetId,
    flatten: true,
  });

  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.navigate', { url: pathToFileURL(htmlPath).href }, sessionId);
  await sleep(1000);

  const captured = [];
  for (const ratio of RATIOS) {
    await cdp.send(
      'Emulation.setDeviceMetricsOverride',
      { width: ratio.width, height: ratio.height, deviceScaleFactor: 1, mobile: false },
      sessionId,
    );
    await sleep(250);

    for (const secId of SECTIONS) {
      await cdp.send(
        'Runtime.evaluate',
        {
          expression: `(() => {
            const el = document.getElementById('${secId}');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
          })()`,
        },
        sessionId,
      );
      await sleep(200);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
      const file = path.join(outDir, `${ratio.name}-${secId}.png`);
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
      captured.push(path.basename(file));
    }
  }
  console.log(JSON.stringify({ success: true, count: captured.length, files: captured }, null, 2));
} finally {
  cdp.close();
  proc.kill();
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch { /* ignore */ }
}
