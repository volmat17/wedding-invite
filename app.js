// app.js — Матвей & Анастасия • 04.04.2026 • Москва

// ====== CONFIG (всё уже заполнено под вашу свадьбу) ======
const CONFIG = {
  couple: "Матвей & Анастасия",
  city: "Москва",

  // Таймер считаем до первой встречи (ЗАГС)
  weddingStartISO: "2026-04-04T09:00:00+03:00",
  // Для календаря — общий интервал всего дня
  weddingEndISO: "2026-04-04T20:00:00+03:00",

  zags: {
    name: "Грибоедовский ЗАГС №1",
    address: "Малый Харитоньевский пер., 10, Москва, Россия, 101990",
    mapQuery:
      "Грибоедовский ЗАГС №1, Малый Харитоньевский переулок 10, Москва",
  },

  loft: {
    name: "Лофт",
    address: "г. Москва, Головинское шоссе 11 (метро Водный стадион)",
    mapQuery: "Головинское шоссе 11, Москва",
  },

  // Если реквизиты не нужны — оставьте пустую строку ""
  giftRequisites: "",

  // Локальный дедлайн RSVP (можно поменять или оставить как есть)
  rsvpDeadlineISO: "2026-03-15T23:59:59+03:00",
};

const el = (id) => document.getElementById(id);

// ====== Mobile nav ======
(() => {
  const hamburger = el("hamburger");
  const mobileNav = el("mobileNav");

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      const isOpen = mobileNav.style.display === "block";
      mobileNav.style.display = isOpen ? "none" : "block";
    });

    mobileNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => (mobileNav.style.display = "none"));
    });
  }
})();

// ====== Date text ======
(() => {
  const weddingDateText = el("weddingDateText");
  if (!weddingDateText) return;

  // ВАЖНО: здесь специально фиксируем таймзону Москвы (Europe/Moscow),
  // чтобы дата не "съезжала" у гостей из других стран.
  const fmt = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  });

  weddingDateText.textContent = fmt.format(new Date(CONFIG.weddingStartISO));
})();

// ====== Countdown ======
(() => {
  const countdownEl = el("countdown");
  if (!countdownEl) return;

  // Также фиксируем Europe/Moscow, чтобы "до встречи у ЗАГСа" было корректно,
  // независимо от таймзоны гостя.
  function nowInMs() {
    // Date() всегда хранит UTC-милисекунды. Нам достаточно обычного now.
    return Date.now();
  }

  const targetMs = new Date(CONFIG.weddingStartISO).getTime();

  function tickCountdown() {
    const diff = targetMs - nowInMs();

    if (diff <= 0) {
      countdownEl.textContent = "уже началось";
      return;
    }

    const sec = Math.floor(diff / 1000);
    const days = Math.floor(sec / (3600 * 24));
    const hours = Math.floor((sec % (3600 * 24)) / 3600);
    const mins = Math.floor((sec % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} д`);
    parts.push(`${hours} ч`);
    parts.push(`${mins} мин`);

    countdownEl.textContent = parts.join(" ");
  }

  tickCountdown();
  setInterval(tickCountdown, 30_000);
})();

// ====== RSVP (LocalStorage) ======
(() => {
  const rsvpForm = el("rsvpForm");
  const rsvpStatus = el("rsvpStatus");
  const clearBtn = el("clearRsvp");

  if (!rsvpForm) return;

  const STORAGE_KEY = "wedding_rsvp_v1";

  function safeSetStatus(msg) {
    if (rsvpStatus) rsvpStatus.textContent = msg;
  }

  function loadRsvp() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveRsvp(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function fillForm(data) {
    if (!data) return;
    for (const [k, v] of Object.entries(data)) {
      const field = rsvpForm.elements[k];
      if (field) field.value = v;
    }
  }

  const existing = loadRsvp();
  if (existing) {
    fillForm(existing);
    safeSetStatus("Ранее сохранённый RSVP загружен.");
  }

  rsvpForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(rsvpForm);
    const data = Object.fromEntries(formData.entries());

    const guests = Number(data.guests);
    if (!Number.isFinite(guests) || guests < 1 || guests > 6) {
      safeSetStatus("Количество гостей должно быть от 1 до 6.");
      return;
    }

    const deadline = new Date(CONFIG.rsvpDeadlineISO).getTime();
    const now = Date.now();

    saveRsvp(data);

    if (now > deadline) {
      safeSetStatus(
        "RSVP после дедлайна. Напишите нам напрямую, чтобы подтвердить."
      );
    } else {
      safeSetStatus("Сохранено. Спасибо!");
    }
  });

  clearBtn?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    rsvpForm.reset();
    safeSetStatus("Очищено.");
  });
})();

// ====== Gallery Lightbox ======
(() => {
  const lightbox = el("lightbox");
  const lightboxImg = el("lightboxImg");
  const lightboxClose = el("lightboxClose");

  if (!lightbox || !lightboxImg) return;

  document.querySelectorAll(".photo").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-src");
      if (!src) return;
      lightboxImg.src = src;
      lightbox.setAttribute("aria-hidden", "false");
    });
  });

  function close() {
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
  }

  lightboxClose?.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

// ====== Back to top ======
(() => {
  const backToTop = el("backToTop");
  if (!backToTop) return;

  backToTop.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();