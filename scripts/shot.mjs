#!/usr/bin/env node
/**
 * Tiny headless-Chrome screenshot helper (no npm dependencies).
 * Uses the DevTools protocol over Node's built-in WebSocket.
 *
 *   node scripts/shot.mjs --url http://127.0.0.1:8732/index.html \
 *        --out /tmp/shot.jpg --w 1440 --h 1000 [--full] [--eval "js"] [--wait 600]
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) {
      const next = arr[i + 1];
      acc.push([cur.slice(2), next && !next.startsWith("--") ? next : "true"]);
    }
    return acc;
  }, [])
);

const url = args.url || "about:blank";
const out = args.out || "shot.jpg";
const W = Number(args.w || 1440);
const H = Number(args.h || 1000);
const wait = Number(args.wait || 700);
const full = args.full === "true";
const port = 9000 + Math.floor(Math.random() * 800);
const profile = mkdtempSync(join(tmpdir(), "cdp-"));

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`,
  `--window-size=${W},${H}`,
  "about:blank"
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("chrome did not start");
}

function client(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const events = new Map();
  const ready = new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
    } else if (msg.method) {
      const list = events.get(msg.method) || [];
      list.forEach((fn) => fn(msg.params));
      events.delete(msg.method);
    }
  };
  return {
    ready,
    send(method, params = {}) {
      return new Promise((res, rej) => {
        const n = ++id;
        pending.set(n, { res, rej });
        ws.send(JSON.stringify({ id: n, method, params }));
      });
    },
    once(method, timeout = 20000) {
      return new Promise((res, rej) => {
        const list = events.get(method) || [];
        list.push(res);
        events.set(method, list);
        setTimeout(() => rej(new Error("timeout: " + method)), timeout);
      });
    },
    close() { try { ws.close(); } catch {} }
  };
}

try {
  const wsUrl = await target();
  const c = client(wsUrl);
  await c.ready;
  await c.send("Page.enable");
  await c.send("Runtime.enable");

  const loaded = c.once("Page.loadEventFired", 30000).catch(() => null);
  await c.send("Page.navigate", { url });
  await loaded;
  await sleep(wait);

  if (args.eval) {
    const r = await c.send("Runtime.evaluate", {
      expression: args.eval,
      awaitPromise: true,
      returnByValue: true
    });
    if (r.exceptionDetails) console.error("eval error:", r.exceptionDetails.text, r.exceptionDetails.exception?.description || "");
    else if (r.result && r.result.value !== undefined) console.log("eval:", JSON.stringify(r.result.value));
  }

  // wait for every <img> to settle
  await c.send("Runtime.evaluate", {
    awaitPromise: true,
    expression: `new Promise(res => {
      const imgs = [...document.images];
      let left = imgs.filter(i => !i.complete).length;
      if (!left) return res(imgs.length);
      const t = setTimeout(() => res('timeout'), 12000);
      imgs.forEach(i => {
        if (i.complete) return;
        const done = () => { if (--left <= 0) { clearTimeout(t); res(imgs.length); } };
        i.addEventListener('load', done, { once: true });
        i.addEventListener('error', done, { once: true });
      });
    })`
  });

  let shotH = H;
  if (full) {
    const m = await c.send("Page.getLayoutMetrics");
    shotH = Math.min(Math.ceil(m.cssContentSize.height), 16000);
    await c.send("Emulation.setDeviceMetricsOverride", {
      width: W, height: shotH, deviceScaleFactor: 1, mobile: false
    });
    await sleep(400);
  }

  const shot = await c.send("Page.captureScreenshot", {
    format: "jpeg",
    quality: Number(args.q || 80),
    captureBeyondViewport: !!full
  });
  writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log("saved", out);
  c.close();
} catch (e) {
  console.error("ERROR", e.message);
  process.exitCode = 1;
} finally {
  chrome.kill("SIGKILL");
  setTimeout(() => { try { rmSync(profile, { recursive: true, force: true }); } catch {} }, 300);
}
