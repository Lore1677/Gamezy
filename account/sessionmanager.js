function isUserLoggedIn() {
  return localStorage.getItem("currentUser") !== null;
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}

function loginUser(username) {
  localStorage.setItem("currentUser", JSON.stringify({ username }));
  updateNavBarLoginState();
}

function logoutUser() {
  localStorage.removeItem("currentUser");
  updateNavBarLoginState();
}

function updateNavBarLoginState() {
  const loginBtn = document.querySelector("a.login-btn");

  if (!loginBtn) return;

  // Determina il percorso base in base alla posizione corrente
  let basePath = "";
  const currentPath = window.location.pathname;

  if (
    currentPath.includes("/games/") &&
    currentPath.endsWith("/gamepage.html")
  ) {
    basePath = "../";
  } else if (
    currentPath.includes("/games/") ||
    currentPath.includes("/footer/")
  ) {
    basePath = "../../";
  } else if (
    currentPath.includes("/account/") ||
    currentPath.includes("/support/")
  ) {
    basePath = "../";
  } else {
    basePath = "../";
  }

  if (isUserLoggedIn()) {
    const user = getCurrentUser();

    // Crea il dropdown utente per l'utente loggato
    const userDropdown = document.createElement("div");
    userDropdown.className = "dropdown user-dropdown";
    userDropdown.innerHTML = `
      <div class="nav-link login-btn">
        <img src="${basePath}images/icons/profile-icon.png" alt="Profile Icon" class="nav-icon" />
        ${user.username}
      </div>
      <ul class="dropdown-menu">
        <li>
          <a href="#" class="dropdown-item logout-btn">
            <img src="${basePath}images/icons/logout-icon.png" alt="Logout Icon" class="nav-icon" />
            Logout
          </a>
        </li>
      </ul>
    `;

    loginBtn.parentNode.replaceChild(userDropdown, loginBtn);

    // Gestisce il logout
    const logoutBtn = userDropdown.querySelector(".logout-btn");
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
      window.location.href = `${basePath}account/login.html`;
    });
  } else {
    // Ripristina il pulsante di login per utente non loggato
    const userDropdown = document.querySelector(".user-dropdown");
    if (userDropdown) {
      const newLoginBtn = document.createElement("a");
      newLoginBtn.href = `${basePath}account/login.html`;
      newLoginBtn.className = "nav-link login-btn";
      newLoginBtn.textContent = "Login";

      userDropdown.parentNode.replaceChild(newLoginBtn, userDropdown);
    }
  }
}

// Espone le funzioni globalmente
window.isUserLoggedIn = isUserLoggedIn;
window.getCurrentUser = getCurrentUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.updateNavBarLoginState = updateNavBarLoginState;

// Aggiorna lo stato della navigazione al caricamento della pagina
document.addEventListener("DOMContentLoaded", updateNavBarLoginState);
