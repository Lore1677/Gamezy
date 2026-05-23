document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;
  const logoImg = document.querySelector(".nav-logo img");

  // Determina percorso base
  function determineBasePath() {
    const currentPath = window.location.pathname;

    if (
      currentPath.includes("/games/") &&
      currentPath.endsWith("/gamepage.html")
    ) {
      return "../";
    } else if (
      currentPath.includes("/games/") ||
      currentPath.includes("/footer/")
    ) {
      return "../../";
    } else if (
      currentPath.includes("/account/") ||
      currentPath.includes("/support/")
    ) {
      return "../";
    } else {
      return "../";
    }
  }

  const basePath = determineBasePath();

  // Percorsi delle immagini
  const logoWhiteSrc = `${basePath}images/icons/logowhite.png`;
  const logoBlackSrc = `${basePath}images/icons/logoblack.png`;

  // Precarica immagini
  const logoWhite = new Image();
  logoWhite.src = logoWhiteSrc;

  const logoBlack = new Image();
  logoBlack.src = logoBlackSrc;

  // Tema salvato (dark predefinito)
  const savedTheme = localStorage.getItem("theme") || "dark";

  if (savedTheme === "light") {
    body.classList.add("light-theme");
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    logoImg.src = logoBlackSrc;
  } else {
    body.classList.remove("light-theme");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    logoImg.src = logoWhiteSrc;
  }

  // Gestione cambio tema
  themeToggle.addEventListener("click", () => {
    themeToggle.style.transition = "transform 0.4s ease";
    themeToggle.style.transform = "rotate(180deg)";

    logoImg.classList.add("disable-logo-animations");
    logoImg.classList.remove("hover-rotate", "leave-rotate", "reset-rotate");
    logoImg.style.transition = "opacity 0.2s ease";
    logoImg.style.opacity = "0";

    setTimeout(() => {
      if (body.classList.contains("light-theme")) {
        body.classList.remove("light-theme");
        localStorage.setItem("theme", "dark");
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        logoImg.src = logoWhiteSrc;
      } else {
        body.classList.add("light-theme");
        localStorage.setItem("theme", "light");
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        logoImg.src = logoBlackSrc;
      }

      setTimeout(() => {
        themeToggle.style.transform = "rotate(0deg)";
        logoImg.style.opacity = "1";

        setTimeout(() => {
          logoImg.classList.remove("disable-logo-animations");
          logoImg.classList.remove(
            "hover-rotate",
            "leave-rotate",
            "reset-rotate"
          );
        }, 100);
      }, 50);
    }, 200);
  });
});

// Animazione logo
document.addEventListener("DOMContentLoaded", function () {
  const logo = document.querySelector(".nav-logo img");

  if (logo) {
    // Animazione all'hover
    logo.addEventListener("mouseenter", () => {
      logo.classList.remove("leave-rotate", "reset-rotate");
      logo.classList.add("hover-rotate");
    });

    // Animazione all'uscita
    logo.addEventListener("mouseleave", () => {
      logo.classList.remove("hover-rotate");
      logo.classList.add("leave-rotate");

      setTimeout(() => {
        logo.classList.remove("leave-rotate");
        logo.classList.add("reset-rotate");
      }, 100);

      logo.addEventListener(
        "animationend",
        () => {
          logo.classList.remove("reset-rotate");
        },
        { once: true }
      );
    });
  }
});
