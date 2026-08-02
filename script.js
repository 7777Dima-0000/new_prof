// ===== PDRN Practicum — скрипты =====

document.addEventListener("DOMContentLoaded", () => {
  // Мобильное меню
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  if (burger && nav) {
    burger.addEventListener("click", () => {
      nav.classList.toggle("nav-open");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => nav.classList.remove("nav-open"));
    });
  }

  // FAQ-аккордеон
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-q");
    const answer = item.querySelector(".faq-a");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".faq-item.open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".faq-a").style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove("open");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // Форма заявки
  const form = document.getElementById("apply-form");
  const success = document.getElementById("form-success");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const consent = form.consent ? form.consent.checked : true;

      if (!name || !phone || !consent) {
        return;
      }

      const payload = {
        name,
        phone,
        email: form.email ? form.email.value.trim() : "",
        city: form.city ? form.city.value.trim() : "",
        source: "Сайт — семинар PDRN-бабочка",
      };

      // Заявки собираются в Битрикс24. Впишите сюда реальный URL
      // входящего вебхука/CRM-формы Битрикс — тогда данные будут
      // уходить туда автоматически. Пока webhook не задан, форма
      // просто показывает пользователю сообщение об успехе.
      const webhook = form.dataset.bitrixWebhook;

      if (webhook) {
        try {
          await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch (err) {
          console.error("Не удалось отправить заявку в Битрикс24:", err);
        }
      } else {
        console.warn(
          "Bitrix24 webhook не настроен (data-bitrix-webhook на #apply-form). " +
            "Заявка не отправлена в CRM:",
          payload
        );
      }

      success.classList.add("visible");
      form.reset();
    });
  }
});

// Плавающие кнопки: наверх и чат
document.addEventListener("DOMContentLoaded", () => {
  const topBtn = document.getElementById("float-top");
  const chatBtn = document.getElementById("float-chat");
  const chatMenu = document.getElementById("float-chat-menu");

  if (topBtn) {
    const toggleTopBtn = () => {
      topBtn.classList.toggle("visible", window.scrollY > 500);
    };

    toggleTopBtn();
    window.addEventListener("scroll", toggleTopBtn);

    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (chatBtn && chatMenu) {
    chatBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      chatMenu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!chatMenu.contains(e.target)) {
        chatMenu.classList.remove("open");
      }
    });
  }
});

// Обратный отсчёт до семинара
document.addEventListener("DOMContentLoaded", () => {
  const countdown = document.getElementById("price-countdown");
  if (!countdown) return;

  const target = new Date(countdown.dataset.target).getTime();
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-mins");
  const secsEl = document.getElementById("cd-secs");

  const pad = (n) => String(n).padStart(2, "0");

  const tick = () => {
    const diff = target - Date.now();

    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minsEl.textContent = "00";
      secsEl.textContent = "00";
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(mins);
    secsEl.textContent = pad(secs);
  };

  tick();
  const timer = setInterval(tick, 1000);
});

// Анимация появления при скролле
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // секции — блоками, карточки внутри — по очереди
  const sections = document.querySelectorAll(
    "section:not(.hero):not(.page-hero)"
  );
  const items = document.querySelectorAll(
    ".advantage-list li, .stat-card, .testimonial-card, .guarantee-card, " +
      ".price-option, .stage-card, .faq-item, .pf-row, .contact-list li"
  );

  if (reduceMotion || !("IntersectionObserver" in window)) {
    return;
  }

  sections.forEach((el) => el.classList.add("reveal"));
  items.forEach((el, i) => {
    el.classList.add("reveal-item");
    el.style.transitionDelay = `${Math.min((i % 6) * 70, 420)}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );

  document
    .querySelectorAll(".reveal, .reveal-item")
    .forEach((el) => observer.observe(el));

  // страховка: если что-то осталось скрытым выше первого экрана
  requestAnimationFrame(() => {
    document.querySelectorAll(".reveal, .reveal-item").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("in-view");
      }
    });
  });
});
