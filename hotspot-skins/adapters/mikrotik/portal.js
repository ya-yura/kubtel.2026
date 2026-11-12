(() => {
  const languageKey = "cp-language";
  const supportedLanguages = ["ru", "en"];
  let currentLanguage = localStorage.getItem(languageKey) || document.documentElement.lang || "ru";

  if (!supportedLanguages.includes(currentLanguage)) {
    currentLanguage = "ru";
  }

  const i18n = {
    ru: {
      phoneRequired: "Введите 10 цифр российского номера.",
      codeRequired: "Введите код подтверждения.",
      voucherRequired: "Введите номер ваучера и код.",
      consentRequired: "Подтвердите согласие с правилами доступа.",
      codeSent: "Код отправлен. Если он не пришел, запросите повторно через таймер.",
      checking: "Проверяем данные...",
      sendCode: "Получить код",
      resendIn: "Повтор через {seconds} с",
      switchLabel: "Switch to English"
    },
    en: {
      phoneRequired: "Enter 10 digits of a Russian phone number.",
      codeRequired: "Enter the confirmation code.",
      voucherRequired: "Enter voucher number and code.",
      consentRequired: "Accept the access rules.",
      codeSent: "Code has been sent. If it does not arrive, request it again after the timer.",
      checking: "Checking data...",
      sendCode: "Get code",
      resendIn: "Retry in {seconds}s",
      switchLabel: "Переключить на русский"
    }
  };

  function text(key) {
    return i18n[currentLanguage]?.[key] || i18n.ru[key] || key;
  }

  function localize() {
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-ru][data-en]").forEach((node) => {
      node.textContent = currentLanguage === "en" ? node.dataset.en : node.dataset.ru;
    });

    document.querySelectorAll("[data-placeholder-ru][data-placeholder-en]").forEach((node) => {
      node.setAttribute(
        "placeholder",
        currentLanguage === "en" ? node.dataset.placeholderEn : node.dataset.placeholderRu
      );
    });

    document.querySelectorAll("[data-code-request]").forEach((button) => {
      if (!button.dataset.counting) {
        button.textContent = text("sendCode");
      }
    });

    const toggle = document.querySelector("[data-language-toggle]");
    if (toggle) {
      toggle.textContent = currentLanguage === "ru" ? "ENG" : "RU";
      toggle.setAttribute("aria-label", text("switchLabel"));
    }
  }

  function normalizePhone(rawValue) {
    const digits = rawValue.replace(/\D/g, "").replace(/^7|^8/, "").slice(0, 10);
    const parts = [];

    if (digits.length > 0) parts.push(digits.slice(0, 3));
    if (digits.length >= 4) parts.push(digits.slice(3, 6));
    if (digits.length >= 7) parts.push(digits.slice(6, 8));
    if (digits.length >= 9) parts.push(digits.slice(8, 10));

    const formatted =
      digits.length <= 3
        ? digits
        : `${parts[0]} ${parts[1] || ""}${parts[2] ? `-${parts[2]}` : ""}${parts[3] ? `-${parts[3]}` : ""}`;

    return { digits, formatted };
  }

  function setMessage(form, message, state = "") {
    const target = form.querySelector("[data-form-message]");
    if (!target) return;
    target.textContent = message;
    if (state) {
      target.dataset.state = state;
    } else {
      delete target.dataset.state;
    }
  }

  function getActivePanel(form) {
    const explicit = form.closest("[data-auth-panel]");
    if (explicit && !explicit.hidden) return explicit;
    return form;
  }

  function validateForm(form) {
    const panel = getActivePanel(form);
    const phoneInput = panel.querySelector("[data-phone-input]");
    const codeInput = panel.querySelector("[data-code-input]");
    const voucherInputs = [...panel.querySelectorAll("[data-voucher-input]")];
    const consentInput = form.querySelector("[data-consent-input]");

    if (phoneInput && normalizePhone(phoneInput.value).digits.length !== 10) {
      setMessage(form, text("phoneRequired"), "error");
      phoneInput.focus();
      return false;
    }

    if (codeInput && !codeInput.value.trim()) {
      setMessage(form, text("codeRequired"), "error");
      codeInput.focus();
      return false;
    }

    if (voucherInputs.length && voucherInputs.some((input) => !input.value.trim())) {
      setMessage(form, text("voucherRequired"), "error");
      voucherInputs.find((input) => !input.value.trim())?.focus();
      return false;
    }

    if (consentInput && !consentInput.checked) {
      setMessage(form, text("consentRequired"), "error");
      consentInput.focus();
      return false;
    }

    setMessage(form, text("checking"), "success");
    return true;
  }

  function startCountdown(button) {
    let seconds = Number(button.dataset.countdown || 60);
    const original = text("sendCode");
    button.disabled = true;
    button.dataset.counting = "true";

    const timer = window.setInterval(() => {
      button.textContent = text("resendIn").replace("{seconds}", String(seconds));
      seconds -= 1;

      if (seconds < 0) {
        window.clearInterval(timer);
        button.disabled = false;
        delete button.dataset.counting;
        button.textContent = original;
      }
    }, 1000);
  }

  function setupTabs() {
    document.querySelectorAll("[data-auth-tabs]").forEach((tabList) => {
      const tabs = [...tabList.querySelectorAll("[data-auth-tab]")];
      const panels = tabs
        .map((tab) => document.getElementById(tab.getAttribute("aria-controls") || ""))
        .filter(Boolean);

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
          panels.forEach((panel) => {
            panel.hidden = panel.id !== tab.getAttribute("aria-controls");
          });
        });
      });
    });
  }

  function setupInputs() {
    document.querySelectorAll("[data-phone-input]").forEach((input) => {
      input.addEventListener("input", () => {
        input.value = normalizePhone(input.value).formatted;
      });
    });

    document.querySelectorAll("[data-code-input], [data-voucher-input]").forEach((input) => {
      input.addEventListener("input", () => {
        input.value = input.value.toUpperCase().replace(/\s+/g, "");
      });
    });
  }

  function setupButtons() {
    document.querySelectorAll("[data-code-request]").forEach((button) => {
      button.addEventListener("click", () => {
        const form = button.closest("form");
        const phoneInput = form?.querySelector("[data-phone-input]");

        if (form && phoneInput && normalizePhone(phoneInput.value).digits.length !== 10) {
          setMessage(form, text("phoneRequired"), "error");
          phoneInput.focus();
          return;
        }

        if (form) {
          setMessage(form, text("codeSent"), "success");
        }

        startCountdown(button);
      });
    });
  }

  function setupForms() {
    document.querySelectorAll("[data-cp-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        if (!validateForm(form)) {
          event.preventDefault();
          return;
        }

        const demoNext = form.dataset.demoNext;
        if (demoNext) {
          event.preventDefault();
          window.location.href = demoNext;
        }
      });
    });
  }

  function setupLanguage() {
    document.querySelector("[data-language-toggle]")?.addEventListener("click", () => {
      currentLanguage = currentLanguage === "ru" ? "en" : "ru";
      localStorage.setItem(languageKey, currentLanguage);
      localize();
    });
  }

  setupTabs();
  setupInputs();
  setupButtons();
  setupForms();
  setupLanguage();
  localize();
})();
