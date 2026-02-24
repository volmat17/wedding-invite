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
    // без текста, просто нули
    countdownEl.textContent = "00:00:00:00";
    return;
  }

  const totalSec = Math.floor(diff / 1000);

  const days = Math.floor(totalSec / (3600 * 24));
  const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const pad2 = (n) => String(n).padStart(2, "0");

  // Формат: DD:HH:MM:SS (дни могут быть больше 99 — это ок)
  countdownEl.textContent = `${days}:${pad2(hours)}:${pad2(mins)}:${pad2(secs)}`;
 }

  tickCountdown();
  setInterval(tickCountdown, 1000);
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

// ====== Ultra-smooth anchor scroll (без дерганья, с инерцией) ======
(() => {
  const OFFSET_EXTRA = 0; // хотим остановиться на 20px выше секции
  const header = document.querySelector(".topbar");

  // если у пользователя включено "уменьшение анимаций" — уважим это
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  let rafId = 0; // чтобы отменять прошлую анимацию при новом клике

  function getHeaderHeight() {
    return header ? header.getBoundingClientRect().height : 0;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  // Очень мягкий easing, без "перелёта" (даёт ощущение iOS/macOS)
  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function getTargetY(hash) {
    const target = document.querySelector(hash);
    if (!target) return null;

    const rect = target.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;

    // учитываем липкую шапку + дополнительно 20px выше
    const y = absoluteTop - getHeaderHeight() - OFFSET_EXTRA;
    return Math.max(0, Math.round(y));
  }

  function animateScrollTo(toY) {
    // отменяем предыдущую анимацию, чтобы не дёргалось при повторных кликах
    if (rafId) cancelAnimationFrame(rafId);

    const fromY = window.scrollY;
    const distance = toY - fromY;
    const abs = Math.abs(distance);

    // Длительность зависит от расстояния: длинные переходы — заметно медленнее
    // (но без бесконечности)
    const duration = clamp(550 + abs * 0.45, 650, 1700);

    if (prefersReducedMotion || abs < 2) {
      window.scrollTo(0, toY);
      return;
    }

    const start = performance.now();

    const step = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = easeInOutSine(t);

      // округляем до subpixel меньше — браузеру легче, визуально мягче
      const y = fromY + distance * eased;
      window.scrollTo(0, y);

      if (t < 1) rafId = requestAnimationFrame(step);
      else window.scrollTo(0, toY);
    };

    rafId = requestAnimationFrame(step);
  }

  function scrollToHash(hash) {
    if (!hash || hash === "#") return;
    const y = getTargetY(hash);
    if (y === null) return;
    animateScrollTo(y);
  }

  // Перехват кликов по якорям
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href.length < 2) return;

    if (!document.querySelector(href)) return;

    e.preventDefault();

    // закрываем мобильное меню, если открыто
    const mobileNav = document.getElementById("mobileNav");
    if (mobileNav && mobileNav.style.display === "block") {
      mobileNav.style.display = "none";
    }

    history.pushState(null, "", href);
    scrollToHash(href);
  });

  // Если открыли страницу сразу с якорем
  window.addEventListener("load", () => {
    if (location.hash && document.querySelector(location.hash)) {
      // небольшая задержка на отрисовку шапки
      setTimeout(() => scrollToHash(location.hash), 80);
    }
  });

  // Если пользователь сам крутит колесо/тач — прекращаем анимацию, чтобы не дралось
  ["wheel", "touchstart", "keydown"].forEach((evt) => {
    window.addEventListener(evt, () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    }, { passive: true });
  });
})();

// ====== Gallery carousel arrows (листать по 3 фото) ======
(() => {
  const viewport = document.getElementById("galleryViewport");
  const prev = document.getElementById("galleryPrev");
  const next = document.getElementById("galleryNext");

  if (!viewport || !prev || !next) return;

  function updateButtons() {
    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    prev.disabled = viewport.scrollLeft <= 2;
    next.disabled = viewport.scrollLeft >= maxScrollLeft - 2;
  }

  function pageScroll(direction) {
    // листаем ровно на ширину видимой области (то есть на "страницу" = 3 фото)
    viewport.scrollBy({ left: direction * viewport.clientWidth, behavior: "smooth" });
  }

  prev.addEventListener("click", () => pageScroll(-1));
  next.addEventListener("click", () => pageScroll(1));

  viewport.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);

  // первичная инициализация
  updateButtons();
})();
