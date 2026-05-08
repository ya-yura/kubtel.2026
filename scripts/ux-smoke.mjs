import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createServer } from "node:net";

class CdpClient {
  constructor(url) {
    this.url = url;
    this.id = 0;
    this.pending = new Map();
    this.listeners = [];
  }

  async open() {
    this.ws = new WebSocket(this.url);
    this.ws.addEventListener("message", (event) => this.handleMessage(event));
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
  }

  async close() {
    this.ws?.close();
  }

  send(method, params = {}, sessionId = undefined) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) {
      payload.sessionId = sessionId;
    }

    this.ws.send(JSON.stringify(payload));

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  waitForEvent(method, { sessionId, timeoutMs }) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.listeners = this.listeners.filter((listener) => listener !== listenerRecord);
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);

      const listenerRecord = {
        method,
        sessionId,
        resolve: (message) => {
          clearTimeout(timeout);
          this.listeners = this.listeners.filter((listener) => listener !== listenerRecord);
          resolve(message);
        }
      };

      this.listeners.push(listenerRecord);
    });
  }

  handleMessage(event) {
    const message = JSON.parse(event.data);

    if (message.id && this.pending.has(message.id)) {
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);

      if (message.error) {
        pending.reject(new Error(message.error.message));
        return;
      }

      pending.resolve(message.result ?? {});
      return;
    }

    this.listeners
      .filter(
        (listener) =>
          listener.method === message.method &&
          (!listener.sessionId || listener.sessionId === message.sessionId)
      )
      .forEach((listener) => listener.resolve(message));
  }
}

const baseUrl = process.env.UX_SMOKE_BASE_URL ?? "http://127.0.0.1:4321";
const chromePath = findChrome();
const userDataDir = await mkdtemp(join(tmpdir(), "kubtel-ux-smoke-"));
const remoteDebuggingPort = await getFreePort();
const results = [];

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${remoteDebuggingPort}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank"
  ],
  {
    stdio: ["ignore", "ignore", "pipe"]
  }
);

let stderr = "";
chrome.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
});

try {
  await waitForChrome(remoteDebuggingPort);
  const version = await fetchJson(`http://127.0.0.1:${remoteDebuggingPort}/json/version`);
  const client = new CdpClient(version.webSocketDebuggerUrl);
  await client.open();

  const { targetId } = await client.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await client.send("Target.attachToTarget", {
    targetId,
    flatten: true
  });

  await client.send("Page.enable", {}, sessionId);
  await client.send("Runtime.enable", {}, sessionId);
  await client.send("Emulation.setDeviceMetricsOverride", desktopViewport(), sessionId);

  await checkRoute(client, sessionId, "/", "Домашний интернет");
  await checkRoute(client, sessionId, "/tariffs/", "Тарифы");
  await checkRoute(client, sessionId, "/connect/", "Проверим адрес");
  await checkRoute(client, sessionId, "/support/", "Поддержка");
  await checkRoute(client, sessionId, "/contacts/", "Контакты");
  await checkRoute(client, sessionId, "/about/", "Kubtel");

  await assertHealthEndpoint();
  await checkTariffCtaPath(client, sessionId);
  await checkMobilePath(client, sessionId);
  await submitLeadForm(client, sessionId);

  await client.close();
  console.log("UX smoke passed");
  results.forEach((result) => console.log(`- ${result}`));
} catch (error) {
  console.error("UX smoke failed");
  results.forEach((result) => console.error(`- ${result}`));
  if (stderr.trim()) {
    console.error("Chrome stderr:");
    console.error(stderr.trim());
  }
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  if (chrome.exitCode === null) {
    chrome.kill("SIGTERM");
    await Promise.race([new Promise((resolve) => chrome.once("exit", resolve)), delay(1000)]);
  }

  await rm(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

async function checkRoute(client, sessionId, path, expectedText) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, path);
  await assertExpression(
    client,
    sessionId,
    `document.body.innerText.includes(${JSON.stringify(expectedText)})`,
    `${path} contains ${expectedText}`
  );
  await assertExpression(
    client,
    sessionId,
    "document.documentElement.scrollWidth <= window.innerWidth",
    `${path} has no horizontal overflow on desktop`
  );
  results.push(`desktop route ok: ${path}`);
}

async function assertHealthEndpoint() {
  const response = await fetch(new URL("/api/health.json", baseUrl));
  assert(response.ok, "health endpoint returned non-OK status");
  const health = await response.json();
  assert(health.status === "ok", "health endpoint status is not ok");
  assert(
    Array.isArray(health.checks) && health.checks.every((check) => check.ok),
    "health endpoint has failed checks"
  );
  results.push("health endpoint ok: /api/health.json");
}

async function checkTariffCtaPath(client, sessionId) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, "/tariffs/");
  const load = client.waitForEvent("Page.loadEventFired", { sessionId, timeoutMs: 10000 });
  await evaluate(
    client,
    sessionId,
    `(() => {
      const link = document.querySelector('a[href^="/connect/?tariff="]');
      if (!link) return false;
      link.click();
      return true;
    })()`
  );
  await load.catch(() => undefined);
  await waitForReady(client, sessionId);
  await assertExpression(
    client,
    sessionId,
    `location.pathname === "/connect/" && location.search.includes("tariff=")`,
    "tariff CTA opened connect page with tariff query"
  );
  await assertExpression(
    client,
    sessionId,
    `document.querySelector('#address-check') !== null`,
    "connect page contains address form after tariff CTA"
  );
  results.push("tariff CTA path ok");
}

async function checkMobilePath(client, sessionId) {
  await setViewport(client, sessionId, mobileViewport());
  await navigate(client, sessionId, "/");
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const sticky = document.querySelector(".sticky-cta");
      if (!sticky) return false;
      const style = getComputedStyle(sticky);
      const rect = sticky.getBoundingClientRect();
      return style.display !== "none" && rect.height >= 44;
    })()`,
    "mobile sticky CTA is visible and tappable"
  );
  await assertExpression(
    client,
    sessionId,
    `document.documentElement.scrollWidth <= window.innerWidth`,
    "home has no horizontal overflow on mobile"
  );
  await evaluate(
    client,
    sessionId,
    `(() => {
      const menu = document.querySelector(".mobile-nav");
      if (!menu) return false;
      menu.open = true;
      return menu.querySelectorAll('a[href]').length >= 6;
    })()`
  );
  await assertExpression(
    client,
    sessionId,
    `document.querySelector(".mobile-nav")?.open === true`,
    "mobile menu can be opened"
  );
  results.push("mobile navigation path ok");
}

async function submitLeadForm(client, sessionId) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, "/connect/");
  await delay(1300);
  const load = client.waitForEvent("Page.loadEventFired", { sessionId, timeoutMs: 15000 });
  await evaluate(
    client,
    sessionId,
    `(() => {
      const form = document.querySelector("#lead-form");
      if (!form) return "missing-form";
      form.querySelector('input[name="formStartedAt"]').value = String(Date.now() - 5000);
      form.querySelector('input[name="address"]').value = "Красная, 1";
      form.querySelector('input[name="name"]').value = "Тестовая заявка";
      form.querySelector('input[name="phone"]').value = "+7 900 123 45 67";
      form.querySelector('input[name="consent"]').checked = true;
      form.requestSubmit();
      return "submitted";
    })()`
  );
  await load.catch(() => undefined);
  await waitForReady(client, sessionId);
  await assertExpression(
    client,
    sessionId,
    `document.querySelector(".form-status.is-success")?.innerText.includes("Заявка принята") === true`,
    "lead form shows success state"
  );
  await assertExpression(
    client,
    sessionId,
    `document.querySelector(".form-status.is-success")?.innerText.includes("KBT-") === true`,
    "lead form shows lead number"
  );
  results.push("lead form submit path ok");
}

async function navigate(client, sessionId, path) {
  const load = client.waitForEvent("Page.loadEventFired", { sessionId, timeoutMs: 15000 });
  await client.send("Page.navigate", { url: new URL(path, baseUrl).href }, sessionId);
  await load.catch(() => undefined);
  await waitForReady(client, sessionId);
}

async function waitForReady(client, sessionId) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const ready = await evaluate(client, sessionId, "document.readyState", false);
    if (ready === "complete" || ready === "interactive") {
      return;
    }
    await delay(100);
  }
  throw new Error("Page did not become ready");
}

async function setViewport(client, sessionId, viewport) {
  await client.send("Emulation.setDeviceMetricsOverride", viewport, sessionId);
}

async function assertExpression(client, sessionId, expression, message) {
  const value = await evaluate(client, sessionId, expression);
  assert(value === true, message);
}

async function evaluate(client, sessionId, expression, awaitPromise = true) {
  const response = await client.send(
    "Runtime.evaluate",
    {
      expression,
      awaitPromise,
      returnByValue: true
    },
    sessionId
  );

  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text ?? "Runtime evaluation failed");
  }

  return response.result?.value;
}

function desktopViewport() {
  return {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false
  };
}

function mobileViewport() {
  return {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  };
}

async function waitForChrome(port) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (chrome.exitCode !== null) {
      throw new Error(`Chrome exited before DevTools was ready: ${stderr.trim()}`);
    }

    try {
      await fetchJson(`http://127.0.0.1:${port}/json/version`);
      return;
    } catch {
      await delay(100);
    }
  }

  throw new Error("Chrome DevTools endpoint did not become ready");
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url} ${response.status}`);
  }
  return response.json();
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  ].filter(Boolean);

  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error("Chrome or Edge was not found. Set CHROME_PATH to run UX smoke.");
  }

  return found;
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (typeof address === "object" && address !== null) {
          resolve(address.port);
          return;
        }
        reject(new Error("Could not allocate a local port"));
      });
    });
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
