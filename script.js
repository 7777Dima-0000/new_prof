// ===== PDRN Practicum — скрипты =====

// Отправка заявки в Битрикс24 (crm.lead.add через входящий вебхук)
async function sendLeadToBitrix(webhook, { name, phone, email, city }) {
  const fields = {
    TITLE: "Заявка с сайта — семинар PDRN-бабочка",
    NAME: name,
    PHONE: [{ VALUE: phone, VALUE_TYPE: "WORK" }],
    SOURCE_ID: "WEB",
    SOURCE_DESCRIPTION: "Сайт — семинар «Лифтинг и регенерация. PDRN-бабочка»",
  };

  if (email) {
    fields.EMAIL = [{ VALUE: email, VALUE_TYPE: "WORK" }];
  }
  if (city) {
    fields.COMMENTS = `Город: ${city}`;
  }

  const response = await fetch(`${webhook}crm.lead.add.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }
  return data;
}

function bindApplyForm(form, successEl) {
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const consent = form.consent ? form.consent.checked : true;

    if (!name || !phone || !consent) {
      return;
    }

    const email = form.email ? form.email.value.trim() : "";
    const city = form.city ? form.city.value.trim() : "";
    const webhook = form.dataset.bitrixWebhook;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (webhook) {
      if (submitBtn) submitBtn.disabled = true;
      try {
        await sendLeadToBitrix(webhook, { name, phone, email, city });
      } catch (err) {
        console.error("Не удалось отправить заявку в Битрикс24:", err);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    } else {
      console.warn(
        "Bitrix24 webhook не настроен (data-bitrix-webhook). Заявка не отправлена в CRM:",
        { name, phone, email, city }
      );
    }

    successEl.classList.add("visible");
    form.reset();
  });
}

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
  bindApplyForm(
    document.getElementById("apply-form"),
    document.getElementById("form-success")
  );
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

// Модальное окно заявки
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const closeBtn = document.getElementById("modal-close");
  const modalForm = document.getElementById("modal-apply-form");
  const modalSuccess = document.getElementById("modal-form-success");

  const openModal = () => {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  };

  document.querySelectorAll(".js-open-modal").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  bindApplyForm(modalForm, modalSuccess);
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
