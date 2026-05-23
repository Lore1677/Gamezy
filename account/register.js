document.addEventListener("DOMContentLoaded", () => {
  const registerContainer = document.querySelector(".login-container");
  const registerForm = document.querySelector("form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  // Animazione del container al caricamento
  setTimeout(() => {
    registerContainer.classList.add("active");
  }, 100);

  // Gestione dello stile degli input
  function handleInputFocus(input) {
    input.parentElement.classList.add("focused");
  }

  function handleInputBlur(input) {
    input.parentElement.classList.remove("focused");
  }

  [usernameInput, passwordInput, confirmPasswordInput].forEach((input) => {
    input.addEventListener("focus", () => handleInputFocus(input));
    input.addEventListener("blur", () => handleInputBlur(input));
  });

  // Gestione dell'invio del form
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Rimuove stati di errore precedenti
    [usernameInput, passwordInput, confirmPasswordInput].forEach((input) => {
      input.parentElement.classList.remove("error");
    });

    // Controlli di validazione
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Regole di validazione
    const MIN_USERNAME_LENGTH = 3;
    const MIN_PASSWORD_LENGTH = 6;

    // Validazione username
    if (!username) {
      usernameInput.parentElement.classList.add("error");
      showErrorAlert(registerContainer, "Inserisci un username");
      return;
    }

    if (username.length < MIN_USERNAME_LENGTH) {
      usernameInput.parentElement.classList.add("error");
      showErrorAlert(
        registerContainer,
        `L'username deve essere lungo almeno ${MIN_USERNAME_LENGTH} caratteri`
      );
      return;
    }

    // Validazione password
    if (!password) {
      passwordInput.parentElement.classList.add("error");
      showErrorAlert(registerContainer, "Inserisci una password");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      passwordInput.parentElement.classList.add("error");
      showErrorAlert(
        registerContainer,
        `La password deve essere lunga almeno ${MIN_PASSWORD_LENGTH} caratteri`
      );
      return;
    }

    // Conferma password
    if (password !== confirmPassword) {
      passwordInput.parentElement.classList.add("error");
      confirmPasswordInput.parentElement.classList.add("error");
      showErrorAlert(registerContainer, "Le password non corrispondono");
      return;
    }

    // Controllo se l'username esiste già
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const userExists = storedUsers.some((u) => u.username === username);

    if (userExists) {
      usernameInput.parentElement.classList.add("error");
      showErrorAlert(registerContainer, "Questo username è già in uso");
      return;
    }

    // Creazione nuovo utente
    const newUser = {
      username: username,
      password: password,
    };
    storedUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(storedUsers));

    // Accesso automatico del nuovo utente
    window.loginUser(username);

    // Animazione registrazione completata
    registerContainer.classList.add("register-success");

    setTimeout(() => {
      window.location.href = "../games/gamepage.html";
    }, 600);
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
