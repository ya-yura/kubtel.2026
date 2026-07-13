import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
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
const basePathFromUrl = new URL(baseUrl).pathname.replace(/\/$/, "");
const pathPrefix = (
  process.env.UX_SMOKE_PATH_PREFIX ?? (basePathFromUrl === "/" ? "" : basePathFromUrl)
).replace(/\/$/, "");
const screenshotDir = process.env.UX_SMOKE_SCREENSHOT_DIR;
const chromePath = findChrome();
const userDataDir = await mkdtemp(join(tmpdir(), "kubtel-ux-smoke-"));
const remoteDebuggingPort = await getFreePort();
const results = [];

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--disable-breakpad",
    "--disable-crash-reporter",
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
  await checkPaymentRoutes(client, sessionId);
  await checkContextualHeaderPhone(client, sessionId);
  await checkTariffCtaPath(client, sessionId);
  await checkMobilePath(client, sessionId);
  await checkMobileB2GRequest(client, sessionId);
  await checkBusinessInternetProfiles(client, sessionId);
  await checkBusinessCalculator(client, sessionId);
  await submitLeadForm(client, sessionId);
  await submitBusinessLeadForm(client, sessionId);
  await checkReadabilityToggle(client, sessionId);
  if (screenshotDir) {
    await captureVisualSamples(client, sessionId, screenshotDir);
  }

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

  await removeTemporaryProfile(userDataDir);
}

async function removeTemporaryProfile(directory) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await rm(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
      return;
    } catch (error) {
      if (!isTemporaryProfileCleanupError(error) || attempt === 7) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Temporary Chrome profile was not removed: ${directory}`);
        console.warn(message);
        return;
      }
      await delay(250);
    }
  }
}

function isTemporaryProfileCleanupError(error) {
  return Boolean(error && ["EBUSY", "EPERM", "ENOTEMPTY"].includes(error.code));
}

async function checkRoute(client, sessionId, path, expectedText) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, path);
  await waitForExpression(
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
  const response = await fetch(routeUrl("/api/health.json"));
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
  const response = await fetch(routeUrl("/legal/smallbusiness/inet/?utm=ux-smoke"), {
    redirect: "manual"
  });
  const location = response.headers.get("location") ?? "";

  assert(response.status === 301, "legacy B2B URL did not return 301");
  assert(
    location.includes(routePath("/business/request/")) || location.includes("/business/request/"),
    "legacy B2B redirect target is wrong"
  );
  assert(location.includes("service=internet"), "legacy B2B redirect lost service target");
  assert(location.includes("utm=ux-smoke"), "legacy B2B redirect did not preserve query string");
  results.push("legacy B2B redirect ok");
}

async function assertB2GLegacyRedirect() {
  const response = await fetch(routeUrl("/legal/govsector/?utm=ux-smoke"), {
    redirect: "manual"
  });
  const location = response.headers.get("location") ?? "";

  assert(response.status === 301, "legacy B2G URL did not return 301");
  assert(
    location.includes(routePath("/business/b2g/")) || location.includes("/business/b2g/"),
    "legacy B2G redirect target is wrong"
  );
  assert(location.includes("utm=ux-smoke"), "legacy B2G redirect did not preserve query string");
  results.push("legacy B2G redirect ok");
}

async function assertDatacenterAccessLegacyRedirect() {
  const response = await fetch(routeUrl("/legal/smallbusiness/datac/admission/?utm=ux-smoke"), {
    redirect: "manual"
  });
  const location = response.headers.get("location") ?? "";

  assert(response.status === 301, "legacy datacenter access URL did not return 301");
  assert(
    location.includes(routePath("/business/datacenter-access/")) ||
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
      const payment = tools.querySelector(".payment-tool-card");
      const hrefs = [...tools.querySelectorAll('a[href]')].map((link) => link.href);
      return (
        payment !== null &&
        tools.querySelector("form") === null &&
        tools.querySelector("input") === null &&
        hrefs.some((href) => href.startsWith("https://my.kubtel.ru/")) &&
        hrefs.some((href) => href.startsWith("https://kubtel.ru/individual/pay")) &&
        hrefs.some((href) => new URL(href).pathname.endsWith("/payment/"))
      );
    })()`,
    "home exposes safe cabinet and official payment links"
  );
  results.push("home audience switch, cabinet link and official payment links ok");
}

async function checkPaymentRoutes(client, sessionId) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, "/payment/");
  const paymentState = await evaluate(
    client,
    sessionId,
    `(() => {
      const hrefs = [...document.querySelectorAll('a[href]')].map((link) => link.href);
      const state = {
        hasOfficialPayment: hrefs.some((href) => href.startsWith("https://kubtel.ru/individual/pay")),
        hasLegalRequest: hrefs.some((href) => href.includes("/business/request/?segment=legal&service=documents-payment")),
        hasB2GRequest: hrefs.some((href) => href.includes("/business/request/?segment=b2g")),
        hasB2GPhone: hrefs.some((href) => href === "tel:+78612001032"),
        hasB2GEmail: hrefs.some((href) => href === "mailto:tender@kubtel.ru"),
        hasRouteCards: document.querySelectorAll(".service-hub-card").length >= 3,
        hrefs
      };
      return { ok: Object.entries(state).every(([key, value]) => key === "hrefs" || value === true), ...state };
    })()`
  );
  assert(
    paymentState.ok === true,
    `payment page separates physical, legal and B2G routes: ${JSON.stringify(paymentState)}`
  );
  await assertExpression(
    client,
    sessionId,
    `document.querySelector('form') === null && document.querySelector('input[name="account"]') === null`,
    "payment page does not emulate payment collection"
  );
  results.push("payment routes ok");
}

async function checkContextualHeaderPhone(client, sessionId) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, "/");
  await assertHeaderPhone(client, sessionId, "8 800 222-17-30", "tel:+78002221730");

  await navigate(client, sessionId, "/business/");
  await assertHeaderPhone(client, sessionId, "8 861 200-10-60", "tel:+78612001060");

  await navigate(client, sessionId, "/business/b2g/");
  await assertHeaderPhone(client, sessionId, "8 861 200-10-32", "tel:+78612001032");

  await navigate(client, sessionId, "/business/request/?segment=b2g&service=b2g-consultation");
  await assertHeaderPhone(client, sessionId, "8 861 200-10-32", "tel:+78612001032");

  results.push("contextual header phone ok");
}

async function assertHeaderPhone(client, sessionId, expectedText, expectedHref) {
  await waitForExpression(
    client,
    sessionId,
    `(() => {
      const link = document.querySelector(".header-phone");
      return link?.innerText.trim() === ${JSON.stringify(expectedText)} &&
        link?.getAttribute("href") === ${JSON.stringify(expectedHref)};
    })()`,
    `header phone should be ${expectedText}`
  );
}

async function checkTariffCtaPath(client, sessionId) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, "/tariffs/");
  const load = client.waitForEvent("Page.loadEventFired", { sessionId, timeoutMs: 10000 });
  await evaluate(
    client,
    sessionId,
    `(() => {
      const link = document.querySelector('a[href*="/connect/?tariff="]');
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
    `location.pathname === ${JSON.stringify(routePath("/connect/"))} && location.search.includes("tariff=")`,
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
    `getComputedStyle(document.body).fontFamily.toLowerCase().includes("andika")`,
    "readability mode uses the Cyrillic-capable literacy font"
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const style = getComputedStyle(document.body);
      return style.filter === "none" && style.color === "rgb(0, 0, 0)";
    })()`,
    "readability mode uses token-driven achromatic colors without CSS filters"
  );
  const readableContrastState = await evaluate(
    client,
    sessionId,
    `(() => {
      const selectors = [
        ".business-hero-copy p",
        ".business-routing-contacts a",
        '.business-calculator-form input:not([type="checkbox"])'
      ];
      const parse = (value) => (value.match(/[\\d.]+/g) || []).slice(0, 3).map(Number);
      const luminance = (value) => {
        const channels = parse(value).map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      };
      const background = (element) => {
        let current = element;
        while (current) {
          const value = getComputedStyle(current).backgroundColor;
          if (value && !value.endsWith(", 0)")) return value;
          current = current.parentElement;
        }
        return "rgb(255, 255, 255)";
      };
      return selectors.map((selector) => {
        const element = document.querySelector(selector);
        if (!element) return { selector, ok: true, skipped: true };
        const foreground = getComputedStyle(element).color;
        const elementBackground = getComputedStyle(element).backgroundColor;
        const surface = background(element);
        const foregroundLuminance = luminance(foreground);
        const backgroundLuminance = luminance(surface);
        const ratio =
          (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
          (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
        return {
          selector,
          foreground,
          elementBackground,
          background: surface,
          ratio,
          matchesReadableControl: element.matches(
            'body.is-readable .business-page input:not([type="checkbox"]):not([type="radio"])'
          ),
          parentClass: element.parentElement?.className ?? "",
          ok: ratio >= 7
        };
      });
    })()`
  );
  assert(
    readableContrastState.every((item) => item.ok),
    `readability mode keeps business text and form controls at AAA contrast: ${JSON.stringify(readableContrastState)}`
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
    `document.querySelectorAll("[data-business-calculator]").length === 4`,
    "business page exposes exactly four calculators"
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      return ["internet", "wifi-auth", "vdi"].every((slug) =>
        document.querySelector(\`[data-service-panel="\${slug}"] [data-business-calculator]\`) === null
      );
    })()`,
    "internet, Hot-spot and VDI do not expose calculators"
  );
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
  await waitForExpression(
    client,
    sessionId,
    `document.querySelector('[data-service-panel="vps"] [data-calculator-monthly]')?.innerText.includes("Индивидуальный расчёт") === true`,
    "business calculator hides unapproved monthly totals"
  );
  await waitForExpression(
    client,
    sessionId,
    `(() => {
      const href = document.querySelector('[data-service-panel="vps"] [data-calculator-cta]')?.href ?? "";
      return href.includes("configurationSummary=") &&
        !href.includes("monthlyEstimate=") &&
        !href.includes("oneTimeEstimate=");
    })()`,
    "business calculator passes configuration without unapproved estimates"
  );
  await navigate(client, sessionId, "/business/?calculator=colocation#business-calculators");
  await waitForExpression(
    client,
    sessionId,
    `(() => {
      const panel = document.querySelector('[data-service-panel="colocation"].is-active');
      const monthly = panel?.querySelector('[data-calculator-monthly]')?.innerText ?? "";
      const oneTime = panel?.querySelector('[data-calculator-onetime]')?.innerText ?? "";
      const power = panel?.querySelector('input[name="powerWatts"]');
      const text = panel?.innerText ?? "";
      return monthly.replace(/\\D/g, "").includes("11260") &&
        oneTime.replace(/\\D/g, "").includes("1200") &&
        power?.max === "10000" &&
        text.includes("Интернет") &&
        text.includes("1 Гбит/с (50 ТБ)") &&
        text.includes("Первичное размещение оборудования") &&
        !text.includes("Удалённые работы инженера");
    })()`,
    "colocation calculator uses approved prices and options"
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const panel = document.querySelector('[data-service-panel="telephony"]');
      const text = panel?.innerText ?? "";
      return text.includes("Внутризоновая связь") &&
        text.includes("Междугородная связь") &&
        text.includes("Международная связь") &&
        panel?.querySelector('a[href="https://kubtel.ru/files/file/tariffs-megafon.pdf"]') !== null;
    })()`,
    "telephony directions are shown as official tariff links, not calculators"
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
      const comments = hrefs.map((href) => new URL(href).searchParams.get("configurationSummary"));
      return hrefs.length === 3 &&
        hrefs.every((href) => href.includes("/business/request/")) &&
        hrefs.every((href) => href.includes("service=internet")) &&
        hrefs.every((href) => href.includes("officeProfile=")) &&
        JSON.stringify(comments) === JSON.stringify([
          "Малый офис 10-20 Мбит/с",
          "Средний офис 30-50 Мбит/с",
          "Крупный офис 70-100 Мбит/с"
        ]);
    })()`,
    "internet profile CTA links pass selected profile into request"
  );
  const smallOfficeComment = "Малый офис 10-20 Мбит/с";
  await navigate(
    client,
    sessionId,
    `/business/request/?segment=legal&service=internet&officeProfile=small&configurationSummary=${encodeURIComponent(smallOfficeComment)}`
  );
  await assertExpression(
    client,
    sessionId,
    `document.querySelector('textarea[name="configurationSummary"]')?.value === ${JSON.stringify(smallOfficeComment)} &&
      document.querySelector('input[name="officeProfile"]')?.value === "small"`,
    "internet profile is copied into the request comment"
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
      const form = document.querySelector("#lead-form");
      const text = document.querySelector(".form-status")?.innerText ?? "";
      const isStaticPreview = form?.closest("[data-static-preview='true']") !== null;
      if (text.includes("Демо-заявка")) return false;
      return isStaticPreview
        ? text.includes("Заявка не отправлена с этого адреса")
        : text.includes("Заявка принята");
    })()`,
    "lead form shows real server success or static-preview error"
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const form = document.querySelector("#lead-form");
      const text = document.querySelector(".form-status")?.innerText ?? "";
      const isStaticPreview = form?.closest("[data-static-preview='true']") !== null;
      return isStaticPreview
        ? text.includes("8 800 222-17-30") || text.includes("kubtel@kubtel.ru")
        : text.includes("KBT-");
    })()`,
    "lead form confirms production lead id or direct static-preview contact"
  );
  results.push("lead form submit path ok");
}

async function submitBusinessLeadForm(client, sessionId) {
  await setViewport(client, sessionId, desktopViewport());
  await navigate(client, sessionId, "/business/request/?service=internet&officeProfile=small");
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
      form.querySelector('input[name="officeProfile"]').value = "small";
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
      const form = document.querySelector(".business-request-form");
      const text = document.querySelector(".form-status")?.innerText ?? "";
      const isStaticPreview = form?.dataset.staticPreview === "true";
      if (text.includes("Демо-заявка")) return false;
      return isStaticPreview
        ? text.includes("Заявка не отправлена с этого адреса")
        : text.includes("B2B-заявка принята");
    })()`,
    `business lead form shows real server success or static-preview error: ${businessStatusText}`
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const status = document.querySelector(".form-status");
      const title = status?.querySelector("strong");
      if (!status || !title) return false;
      const contrast = () => {
        const parse = (color) => (color.match(/[\\d.]+/g) ?? []).slice(0, 3).map(Number);
        const luminance = (color) => {
          const channels = parse(color).map((channel) => {
            const value = channel / 255;
            return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
        };
        const foreground = luminance(getComputedStyle(title).color);
        const background = luminance(getComputedStyle(status).backgroundColor);
        return (Math.max(foreground, background) + 0.05) /
          (Math.min(foreground, background) + 0.05);
      };
      const originalClass = status.className;
      status.className = "form-status is-success";
      const successContrast = contrast();
      status.className = "form-status is-error";
      const errorContrast = contrast();
      status.className = originalClass;
      return successContrast >= 4.5 && errorContrast >= 4.5;
    })()`,
    "form status titles meet AA contrast in success and error states"
  );
  await assertExpression(
    client,
    sessionId,
    `(() => {
      const form = document.querySelector(".business-request-form");
      const text = document.querySelector(".form-status")?.innerText ?? "";
      const isStaticPreview = form?.dataset.staticPreview === "true";
      return form?.querySelector('input[name="officeProfile"]')?.value === "small" &&
        (isStaticPreview ? text.includes("kubtel@kubtel.ru") : text.includes("KBT-B2B-"));
    })()`,
    "business lead form preserves office profile and confirms delivery mode"
  );
  results.push("business lead form submit path ok");
}

async function captureVisualSamples(client, sessionId, directory) {
  await mkdir(directory, { recursive: true });
  await evaluate(
    client,
    sessionId,
    `(() => {
      localStorage.setItem("kubtel-readable-mode", "false");
      document.body.classList.remove("is-readable");
      return true;
    })()`
  );
  const routes = [
    { path: "/", name: "home" },
    { path: "/business/", name: "business" },
    { path: "/business/request/", name: "business-request" },
    { path: "/design-system/", name: "design-system" }
  ];
  const viewports = [
    { name: "320", viewport: { width: 320, height: 720, deviceScaleFactor: 2, mobile: true } },
    { name: "390", viewport: mobileViewport() },
    { name: "768", viewport: { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false } },
    { name: "1440", viewport: desktopViewport() }
  ];

  for (const { path, name } of routes) {
    for (const { name: viewportName, viewport } of viewports) {
      await setViewport(client, sessionId, viewport);
      await navigate(client, sessionId, path);
      await assertExpression(
        client,
        sessionId,
        "document.documentElement.scrollWidth <= window.innerWidth",
        `${path} has no horizontal overflow for screenshot viewport ${viewportName}`
      );
      await writeScreenshot(client, sessionId, join(directory, `${name}-${viewportName}.png`));
    }
  }

  await setViewport(client, sessionId, mobileViewport());
  await navigate(client, sessionId, "/design-system/");
  await evaluate(
    client,
    sessionId,
    `(() => {
      localStorage.setItem("kubtel-readable-mode", "true");
      document.body.classList.add("is-readable");
      return true;
    })()`
  );
  await writeScreenshot(client, sessionId, join(directory, "design-system-readable-390.png"));
  results.push(`visual screenshots captured: ${directory}`);
}

async function writeScreenshot(client, sessionId, filePath) {
  const { data } = await client.send(
    "Page.captureScreenshot",
    { format: "png", captureBeyondViewport: false, fromSurface: true },
    sessionId
  );
  await writeFile(filePath, Buffer.from(data, "base64"));
}

async function navigate(client, sessionId, path) {
  const load = client.waitForEvent("Page.loadEventFired", { sessionId, timeoutMs: 15000 });
  await client.send("Page.navigate", { url: routeUrl(path).href }, sessionId);
  await load.catch(() => undefined);
  await waitForReady(client, sessionId);
}

async function waitForReady(client, sessionId) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
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

function routeUrl(path) {
  return new URL(routePath(path), baseUrl);
}

function routePath(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${pathPrefix}${normalizedPath}`;
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
