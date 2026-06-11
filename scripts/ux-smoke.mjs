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
  await checkRoute(client, sessionId, "/connect/", "Заявка на подключение");
  await checkRoute(client, sessionId, "/support/", "Поддержка");
  await checkRoute(client, sessionId, "/contacts/", "Контакты");
  await checkRoute(client, sessionId, "/about/", "Kubtel");
  await checkRoute(client, sessionId, "/devices/", "Оборудование");
  await checkRoute(client, sessionId, "/search/", "Найти раздел");
  await checkRoute(client, sessionId, "/business/", "Услуги связи для бизнеса");
  await checkRoute(client, sessionId, "/business/b2g/", "44-ФЗ");
  await checkRoute(client, sessionId, "/business/datacenter-access/", "Заявка на доступ в ЦОД");
  await checkRoute(client, sessionId, "/business/request/", "Заявка для бизнеса");
  await checkRoute(
    client,
    sessionId,
    "/business/?calculator=telephony#business-calculators",
    "Внутризоновая связь"
  );

  await assertHealthEndpoint();
  await assertLegacyRedirect();
  await assertB2GLegacyRedirect();
  await assertDatacenterAccessLegacyRedirect();
  await checkHomeAudienceSwitch(client, sessionId);
  await checkTariffCtaPath(client, sessionId);
  await checkReadabilityToggle(client, sessionId);
  await checkMobilePath(client, sessionId);
  await checkMobileB2GRequest(client, sessionId);
  await checkBusinessInternetProfiles(client, sessionId);
  await checkBusinessCalculator(client, sessionId);
  await submitLeadForm(client, sessionId);
  await submitBusinessLeadForm(client, sessionId);

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

async function assertLegacyRedirect() {
  const response = await fetch(new URL("/legal/smallbusiness/inet/?utm=ux-smoke", baseUrl), {
    redirect: "manual"
  });
  const location = response.headers.get("location") ?? "";

  assert(response.status === 301, "legacy B2B URL did not return 301");
  assert(location.includes("/business/request/"), "legacy B2B redirect target is wrong");
  assert(location.includes("service=internet"), "legacy B2B redirect lost service target");
  assert(location.includes("utm=ux-smoke"), "legacy B2B redirect did not preserve query string");
  results.push("legacy B2B redirect ok");
}

async function assertB2GLegacyRedirect() {
  const response = await fetch(new URL("/legal/govsector/?utm=ux-smoke", baseUrl), {
    redirect: "manual"
  });
  const location = response.headers.get("location") ?? "";

  assert(response.status === 301, "legacy B2G URL did not return 301");
  assert(location.includes("/business/b2g/"), "legacy B2G redirect target is wrong");
  assert(location.includes("utm=ux-smoke"), "legacy B2G redirect did not preserve query string");
  results.push("legacy B2G redirect ok");
}

async function assertDatacenterAccessLegacyRedirect() {
  const response = await fetch(
    new URL("/legal/smallbusiness/datac/admission/?utm=ux-smoke", baseUrl),
    {
      redirect: "manual"
    }
  );
  const location = response.headers.get("location") ?? "";

  assert(response.status === 301, "legacy datacenter access URL did not return 301");
  assert(
    location.includes("/business/datacenter-access/"),
    "legacy datacenter access redirect target is wrong"
  );
  assert(
    location.includes("utm=ux-smoke"),
    "legacy datacenter access redirect did not preserve query string"
  );
  results.push("legacy datacenter access redirect ok");
}

async function checkHomeAudienceSwitch(client, sessionId) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, "/");
  await assertExpression(
    client,
    sessionId,
    `document.querySelector(".audience-switch")?.textContent.includes("Для бизнеса") === true`,
    "home first screen exposes business choice"
  );
  await assertExpression(
    client,
    sessionId,
    `document.querySelector(".audience-switch")?.textContent.includes("Для дома") === true`,
    "home first screen exposes residential choice"
  );
  await assertExpression(
    client,
    sessionId,
    `document.querySelector('a[href="https://my.kubtel.ru/"]') !== null`,
    "subscriber cabinet link is present"
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const tools = document.querySelector(".subscriber-tools");
      if (!tools) return false;
      const cabinet = tools.querySelector('form[action="https://my.kubtel.ru/"]');
      const payment = tools.querySelector(".payment-tool-card");
      return (
        tools.innerText.includes("Личный кабинет Кубтел") &&
        tools.innerText.includes("Пополнение счёта") &&
        cabinet?.querySelector('input[name="login"][required]') !== null &&
        cabinet?.querySelector('input[name="password"][required]') !== null &&
        payment?.querySelector('input[name="account"][required]') !== null &&
        payment?.querySelector('input[name="amount"][required]') !== null &&
        payment?.querySelector('a[href="/payment/"]') !== null
      );
    })()`,
    "home exposes subscriber cabinet and payment forms"
  );
  results.push("home audience switch, cabinet link and payment forms ok");
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

async function checkMobileB2GRequest(client, sessionId) {
  await setViewport(client, sessionId, mobileViewport());
  await navigate(client, sessionId, "/business/request/?segment=b2g&service=b2g-consultation");
  await assertExpression(
    client,
    sessionId,
    `document.documentElement.scrollWidth <= window.innerWidth`,
    "B2G request has no horizontal overflow on mobile"
  );
  await assertExpression(
    client,
    sessionId,
    `document.querySelector('input[name="mobilePhone"]') !== null`,
    "B2G request exposes optional mobile phone"
  );
  await assertExpression(
    client,
    sessionId,
    `document.querySelectorAll('input[name="preferredContact"]').length === 3`,
    "B2G request exposes contact preference choices"
  );
  results.push("mobile B2G request path ok");
}

async function checkReadabilityToggle(client, sessionId) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, "/business/");
  await evaluate(
    client,
    sessionId,
    `(() => {
      const button = document.querySelector("[data-readability-toggle]");
      if (!button) return false;
      button.click();
      return document.body.classList.contains("is-readable");
    })()`
  );
  await assertExpression(
    client,
    sessionId,
    `document.body.classList.contains("is-readable") === true`,
    "readability mode can be enabled"
  );
  await assertExpression(
    client,
    sessionId,
    `document.querySelector("[data-readability-toggle]")?.getAttribute("aria-pressed") === "true"`,
    "readability toggle exposes pressed state"
  );
  await assertExpression(
    client,
    sessionId,
    `getComputedStyle(document.body).fontFamily.toLowerCase().includes("golos")`,
    "readability mode uses a Cyrillic-readable font"
  );
  await assertExpression(
    client,
    sessionId,
    `getComputedStyle(document.body).filter.includes("grayscale")`,
    "readability mode applies grayscale palette"
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const link = document.querySelector(".business-quick-actions .business-link");
      if (!link) return false;
      const style = getComputedStyle(link);
      return style.color !== style.backgroundColor;
    })()`,
    "readability mode keeps secondary business links visible"
  );
  results.push("readability mode toggle ok");
}

async function checkBusinessCalculator(client, sessionId) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, "/business/?calculator=vps#business-calculators");
  await assertExpression(
    client,
    sessionId,
    `document.querySelector('[data-service-panel="vps"].is-active [data-business-calculator]') !== null`,
    "VPS page contains business calculator"
  );
  await evaluate(
    client,
    sessionId,
    `(() => {
      const cpu = document.querySelector('[data-service-panel="vps"] input[name="vCpu"]');
      if (!cpu) return false;
      cpu.value = "8";
      cpu.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    })()`
  );
  await assertExpression(
    client,
    sessionId,
    `document.querySelector('[data-service-panel="vps"] [data-calculator-monthly]')?.innerText.includes("₽") === true`,
    "business calculator shows monthly result"
  );
  await assertExpression(
    client,
    sessionId,
    `document.querySelector('[data-service-panel="vps"] [data-calculator-cta]')?.href.includes("configurationSummary=") === true`,
    "business calculator passes configuration into request link"
  );
  results.push("business calculator path ok");
}

async function checkBusinessInternetProfiles(client, sessionId) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, "/business/?calculator=internet#business-calculators");
  await assertExpression(
    client,
    sessionId,
    `document.querySelector('[data-service-panel="internet"].is-active .office-profile-panel') !== null`,
    "internet tab shows office profile panel"
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const text = document.querySelector('[data-service-panel="internet"]')?.innerText ?? "";
      return text.includes("Малый офис") &&
        text.includes("Средний офис") &&
        text.includes("Крупный офис") &&
        text.includes("10-20 Мбит/с") &&
        text.includes("30-50 Мбит/с") &&
        text.includes("70-100 Мбит/с");
    })()`,
    "internet tab exposes office size speed profiles"
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const hrefs = [...document.querySelectorAll('[data-service-panel="internet"] .office-profile-card a')]
        .map((link) => link.href);
      return hrefs.length === 3 &&
        hrefs.every((href) => href.includes("/business/request/")) &&
        hrefs.every((href) => href.includes("service=internet")) &&
        hrefs.every((href) => href.includes("configurationSummary="));
    })()`,
    "internet profile CTA links pass selected profile into request"
  );
  results.push("business internet office profiles ok");
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
      const suffix = String(Date.now()).slice(-4);
      form.querySelector('input[name="formStartedAt"]').value = String(Date.now() - 5000);
      form.querySelector('input[name="address"]').value = "Красная, 1";
      form.querySelector('input[name="name"]').value = "Тестовая заявка";
      form.querySelector('input[name="phone"]').value = \`+7 900 123 \${suffix.slice(0, 2)} \${suffix.slice(2)}\`;
      form.querySelector('input[name="consent"]').checked = true;
      form.requestSubmit();
      return "submitted";
    })()`
  );
  await load.catch(() => undefined);
  await waitForReady(client, sessionId);
  await waitForExpression(
    client,
    sessionId,
    `document.querySelector(".form-status") !== null`,
    "lead form status appeared"
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const text = document.querySelector(".form-status.is-success")?.innerText ?? "";
      return text.includes("Заявка принята") || text.includes("Демо-заявка принята");
    })()`,
    "lead form shows success state"
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const text = document.querySelector(".form-status.is-success")?.innerText ?? "";
      return text.includes("KBT-") || text.includes("В боевом режиме");
    })()`,
    "lead form shows lead number"
  );
  results.push("lead form submit path ok");
}

async function submitBusinessLeadForm(client, sessionId) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, "/business/request/?service=internet");
  await delay(1300);
  const load = client.waitForEvent("Page.loadEventFired", { sessionId, timeoutMs: 15000 });
  await evaluate(
    client,
    sessionId,
    `(() => {
      const form = document.querySelector(".business-request-form");
      if (!form) return "missing-form";
      const suffix = String(Date.now()).slice(-4);
      form.querySelector('input[name="formStartedAt"]').value = String(Date.now() - 5000);
      form.querySelector('input[name="phone"]').value = \`+7 900 765 \${suffix.slice(0, 2)} \${suffix.slice(2)}\`;
      form.querySelector('input[name="companyName"]').value = "Тест Бизнес";
      form.querySelector('input[name="contactPerson"]').value = "Иван Тестов";
      form.querySelector('select[name="service"]').value = "internet";
      form.querySelector('input[name="address"]').value = "Красная, 1";
      form.querySelector('textarea[name="configurationSummary"]').value = "Офис на 12 сотрудников, интернет 300 Мбит/с и статический IP";
      form.querySelector('input[name="consent"]').checked = true;
      form.requestSubmit();
      return "submitted";
    })()`
  );
  await load.catch(() => undefined);
  await waitForReady(client, sessionId);
  await waitForExpression(
    client,
    sessionId,
    `(document.querySelector(".form-status")?.innerText ?? "").trim().length > 0`,
    "business lead form status appeared with text"
  );
  const businessStatusText = await evaluate(
    client,
    sessionId,
    `document.querySelector(".form-status")?.innerText ?? ""`
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const text = document.querySelector(".form-status.is-success")?.innerText ?? "";
      return text.includes("B2B-заявка принята") || text.includes("Демо-заявка принята");
    })()`,
    `business lead form shows success state: ${businessStatusText}`
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const text = document.querySelector(".form-status.is-success")?.innerText ?? "";
      return text.includes("KBT-B2B-") || text.includes("Для боевой отправки");
    })()`,
    "business lead form confirms production or preview handling"
  );
  results.push("business lead form submit path ok");
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

async function waitForExpression(client, sessionId, expression, message, timeoutMs = 5000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if ((await evaluate(client, sessionId, expression)) === true) {
      return;
    }

    await delay(100);
  }

  throw new Error(message);
}

async function setViewport(client, sessionId, viewport) {
  await client.send("Emulation.setDeviceMetricsOverride", viewport, sessionId);
}

async function assertExpression(client, sessionId, expression, message) {
  const value = await evaluate(client, sessionId, expression);
  if (value === true) {
    return;
  }

  if (message.includes("horizontal overflow")) {
    const offenders = await evaluate(
      client,
      sessionId,
      `(() => {
        return [...document.body.querySelectorAll("*")]
          .map((node) => {
            const rect = node.getBoundingClientRect();
            return {
              tag: node.tagName.toLowerCase(),
              className: typeof node.className === "string" ? node.className : "",
              id: node.id,
              text: (node.innerText || node.textContent || "").trim().slice(0, 80),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            };
          })
          .filter((item) => item.width > 0 && (item.right > window.innerWidth || item.left < 0))
          .slice(0, 8);
      })()`
    );
    throw new Error(`${message}: ${JSON.stringify(offenders)}`);
  }

  throw new Error(message);
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
