(() => {
  const config = window.KUBTEL_HOTSPOT || {};
  const searchParams = new URLSearchParams(window.location.search);
  const languageKey = "kubtel-hotspot-language";
  const supportedLanguages = ["ru", "en"];

  if (["0", "1"].includes(searchParams.get("ad")) && config.ad) {
    config.ad.enabled = searchParams.get("ad") === "1";
  }

  if (["0", "1"].includes(searchParams.get("announcement")) && config.announcement) {
    config.announcement.enabled = searchParams.get("announcement") === "1";
  }

  const messages = {
    ru: {
      "choice.title": "Выберите способ идентификации",
      "choice.lead":
        "Для доступа к интернету подтвердите номер телефона или используйте индивидуальный код.",
      "choice.call": "По звонку",
      "choice.voucher": "По индивидуальному коду",
      "phone.title": "Введите номер телефона",
      "phone.lead": "После ввода номера появится бесплатный номер для завершения идентификации.",
      "phone.label": "Ваш телефон",
      "phone.placeholder": "999 123-45-67",
      "phone.hint": "Только российский номер, без SMS и платных звонков.",
      "phone.submit": "Продолжить",
      "voucher.title": "Введите номер ваучера и код",
      "voucher.lead": "Используйте данные, которые выдал администратор точки доступа.",
      "voucher.number": "Номер ваучера",
      "voucher.code": "Код",
      "voucher.submit": "Подключиться",
      "call.title": "Позвоните для завершения идентификации",
      "call.lead": "Звонок бесплатный. После короткого сигнала вернитесь на эту страницу.",
      "call.done": "Я позвонил, проверить подключение",
      "connected.title": "Интернет подключен",
      "connected.lead": "Идентификация завершена. Можно закрыть страницу или перейти дальше.",
      "connected.submit": "Перейти на сайт Кубтел",
      "common.back": "Назад",
      "footer.helpPrefix": "Если у Вас возникли вопросы, обращайтесь по телефонам:",
      "footer.or": "или",
      "footer.provider": "Услуга предоставляется",
      "footer.consent": "Проходя идентификацию, я даю согласие на обработку своих",
      "footer.personalData": "персональных данных",
      "form.phoneError": "Введите 10 цифр российского номера.",
      "form.codeError": "Заполните оба поля кода.",
      "form.ready": "Проверяем данные..."
    },
    en: {
      "choice.title": "Choose identification method",
      "choice.lead": "Confirm your phone number or use an individual code to access the internet.",
      "choice.call": "By phone call",
      "choice.voucher": "By individual code",
      "phone.title": "Enter your phone number",
      "phone.lead":
        "After entering the number, you will see a toll-free number to complete identification.",
      "phone.label": "Your phone",
      "phone.placeholder": "999 123-45-67",
      "phone.hint": "Russian phone number only. No SMS or paid calls.",
      "phone.submit": "Continue",
      "voucher.title": "Enter voucher number and code",
      "voucher.lead": "Use the details provided by the hotspot administrator.",
      "voucher.number": "Voucher number",
      "voucher.code": "Code",
      "voucher.submit": "Connect",
      "call.title": "Call to complete identification",
      "call.lead": "The call is free. After the short signal, return to this page.",
      "call.done": "I have called, check connection",
      "connected.title": "Internet is connected",
      "connected.lead": "Identification is complete. You can close this page or continue.",
      "connected.submit": "Go to Kubtel website",
      "common.back": "Back",
      "footer.helpPrefix": "If you have questions, please call:",
      "footer.or": "or",
      "footer.provider": "Service is provided by",
      "footer.consent": "By completing identification, I consent to processing of my",
      "footer.personalData": "personal data",
      "form.phoneError": "Enter 10 digits of a Russian phone number.",
      "form.codeError": "Fill in both code fields.",
      "form.ready": "Checking data..."
    }
  };

  function getInitialLanguage() {
    const stored = localStorage.getItem(languageKey);
    if (supportedLanguages.includes(stored)) {
      return stored;
    }

    if (supportedLanguages.includes(config.defaultLanguage)) {
      return config.defaultLanguage;
    }

    return "ru";
  }

  function readLocalized(value, language) {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    return value[language] || value.ru || value.en || "";
  }

  function translatePage(language) {
    document.documentElement.lang = language;
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (messages[language]?.[key]) {
        node.textContent = messages[language][key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      const key = node.getAttribute("data-i18n-placeholder");
      if (messages[language]?.[key]) {
        node.setAttribute("placeholder", messages[language][key]);
      }
    });

    const toggle = document.querySelector("[data-language-toggle]");
    if (toggle) {
      toggle.textContent = language === "ru" ? "ENG" : "RU";
      toggle.setAttribute(
        "aria-label",
        language === "ru" ? "Switch to English" : "Переключить на русский"
      );
    }
  }

  function createElement(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) {
      node.className = className;
    }
    if (text) {
      node.textContent = text;
    }
    return node;
  }

  function renderAnnouncement(language) {
    const slot = document.querySelector("[data-announcement-slot]");
    if (!slot) {
      return;
    }

    if (!config.announcement?.enabled) {
      slot.remove();
      return;
    }

    const title = readLocalized(config.announcement.title, language);
    const text = readLocalized(config.announcement.text, language);
    const tone = config.announcement.tone === "warning" ? "warning" : "info";

    slot.replaceChildren();
    const announcement = createElement("div", `announcement announcement-${tone}`);
    announcement.append(createElement("strong", "", title), createElement("span", "", text));
    slot.append(announcement);
  }

  function renderAd(language) {
    const slot = document.querySelector("[data-ad-slot]");
    const panel = document.querySelector(".auth-panel");
    if (!slot || !panel) {
      return;
    }

    if (!config.ad?.enabled) {
      slot.remove();
      panel.classList.remove("has-promo");
      return;
    }

    panel.classList.add("has-promo");
    slot.replaceChildren();
    const mark = createElement("div", "promo-mark");
    mark.setAttribute("aria-hidden", "true");
    const link = createElement("a", "", readLocalized(config.ad.cta, language));
    link.href = config.ad.href || "#";
    slot.append(
      mark,
      createElement("strong", "", readLocalized(config.ad.title, language)),
      createElement("p", "", readLocalized(config.ad.text, language)),
      link
    );
  }

  function normalizePhone(rawValue) {
    const digits = rawValue.replace(/\D/g, "").replace(/^7|^8/, "").slice(0, 10);
    const parts = [];

    if (digits.length > 0) {
      parts.push(digits.slice(0, 3));
    }
    if (digits.length >= 4) {
      parts.push(digits.slice(3, 6));
    }
    if (digits.length >= 7) {
      parts.push(digits.slice(6, 8));
    }
    if (digits.length >= 9) {
      parts.push(digits.slice(8, 10));
    }

    const formatted =
      digits.length <= 3
        ? digits
        : `${parts[0]} ${parts[1] || ""}${parts[2] ? `-${parts[2]}` : ""}${parts[3] ? `-${parts[3]}` : ""}`;

    return { digits, formatted };
  }

  function setupInputs() {
    const phoneInput = document.querySelector("[data-phone-input]");
    if (phoneInput) {
      phoneInput.addEventListener("input", () => {
        phoneInput.value = normalizePhone(phoneInput.value).formatted;
      });
    }

    document.querySelectorAll("[data-code-input]").forEach((input) => {
      input.addEventListener("input", () => {
        input.value = input.value.toUpperCase().replace(/\s+/g, "");
      });
    });
  }

  function setupForms() {
    document.querySelectorAll("[data-hotspot-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        const message = form.querySelector("[data-form-message]");
        const language = currentLanguage;
        const phoneInput = form.querySelector("[data-phone-input]");
        const codeInputs = [...form.querySelectorAll("[data-code-input]")];

        if (phoneInput && normalizePhone(phoneInput.value).digits.length !== 10) {
          event.preventDefault();
          phoneInput.focus();
          message.textContent = messages[language]["form.phoneError"];
          message.dataset.state = "error";
          return;
        }

        if (codeInputs.length && codeInputs.some((input) => !input.value.trim())) {
          event.preventDefault();
          const firstEmpty = codeInputs.find((input) => !input.value.trim());
          firstEmpty?.focus();
          message.textContent = messages[language]["form.codeError"];
          message.dataset.state = "error";
          return;
        }

        if (message) {
          message.textContent = messages[language]["form.ready"];
          message.dataset.state = "ok";
        }
      });
    });
  }

  function setupRedirect() {
    const redirectLink = document.querySelector("[data-redirect-link]");
    if (redirectLink && config.redirectUrl) {
      redirectLink.href = config.redirectUrl;
    }
  }

  function applyLanguage(language) {
    localStorage.setItem(languageKey, language);
    translatePage(language);
    renderAnnouncement(language);
    renderAd(language);
  }

  let currentLanguage = getInitialLanguage();
  applyLanguage(currentLanguage);
  setupInputs();
  setupForms();
  setupRedirect();

  document.querySelector("[data-language-toggle]")?.addEventListener("click", () => {
    currentLanguage = currentLanguage === "ru" ? "en" : "ru";
    applyLanguage(currentLanguage);
  });
})();
