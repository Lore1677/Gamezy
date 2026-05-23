document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.querySelector(".login-container");
  const loginForm = document.querySelector("form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  // Animazione al caricamento della pagina
  setTimeout(() => {
    loginContainer.classList.add("active");
  }, 100);

  // Gestione dello stile degli input
  function handleInputFocus(input) {
    input.parentElement.classList.add("focused");
  }

  function handleInputBlur(input) {
    input.parentElement.classList.remove("focused");
  }

  [usernameInput, passwordInput].forEach((input) => {
    input.addEventListener("focus", () => handleInputFocus(input));
    input.addEventListener("blur", () => handleInputBlur(input));
  });

  // Gestione dell'invio del form
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Rimuove stati di errore precedenti
    usernameInput.parentElement.classList.remove("error");
    passwordInput.parentElement.classList.remove("error");

    // Validazione base
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username) {
      usernameInput.parentElement.classList.add("error");
      showErrorAlert(loginContainer, "Inserisci il tuo username");
      return;
    }

    if (!password) {
      passwordInput.parentElement.classList.add("error");
      showErrorAlert(loginContainer, "Inserisci la tua password");
      return;
    }

    // Controlla i dati utente salvati
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const user = storedUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Login avvenuto con successo
      window.loginUser(username);
      window.updateNavBarLoginState();

      loginContainer.classList.add("login-success");

      setTimeout(() => {
        window.location.href = "../games/gamepage.html";
      }, 600);
    } else {
      // Login fallito
      usernameInput.parentElement.classList.add("error");
      passwordInput.parentElement.classList.add("error");
      showErrorAlert(loginContainer, "Username o password non corretti");
    }
  });

  // Funzione per mostrare messaggi di errore
  function showErrorAlert(container, message) {
    const existingAlert = container.querySelector(".error-alert");
    if (existingAlert) {
      container.removeChild(existingAlert);
    }

    const errorAlert = document.createElement("div");
    errorAlert.className = "error-alert";
    errorAlert.textContent = message;
    container.appendChild(errorAlert);

    // Trigger reflow
    errorAlert.offsetHeight;

    errorAlert.classList.add("show");

    // Rimuove l'avviso dopo 3 secondi
    setTimeout(() => {
      errorAlert.classList.remove("show");
      setTimeout(() => {
        container.removeChild(errorAlert);
      }, 300);
    }, 3000);
  }
});
