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
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const phone = form.phone.value.trim();

      if (!name || !phone) {
        return;
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
