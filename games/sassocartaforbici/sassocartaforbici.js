document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const choiceButtons = document.querySelectorAll(".choice-button");
  const playerIcon = document.getElementById("player-icon");
  const computerIcon = document.getElementById("computer-icon");
  const resultMessage = document.getElementById("result-message");
  const playAgainButton = document.getElementById("play-again-button");
  const resetStatsButton = document.getElementById("reset-stats");
  const playerWinsDisplay = document.getElementById("player-wins");
  const computerWinsDisplay = document.getElementById("computer-wins");
  const tiesDisplay = document.getElementById("ties");

  // Statistiche
  let stats = {
    playerWins: parseInt(localStorage.getItem("rps-player-wins") || 0),
    computerWins: parseInt(localStorage.getItem("rps-computer-wins") || 0),
    ties: parseInt(localStorage.getItem("rps-ties") || 0)
  };

  // Stato del gioco
  let gameActive = true;
  
  // Possibili scelte
  const choices = ["sasso", "carta", "forbici"];
  
  // Mappa delle scelte che vincono contro altre scelte
  const winConditions = {
    "sasso": "forbici",
    "carta": "sasso",
    "forbici": "carta"
  };

  // Aggiorna tema
  function updateGameTheme() {
    const isDarkTheme = document.body.classList.contains("light-theme")
      ? false
      : true;

    if (isDarkTheme) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }

  updateGameTheme();

  // Gestione tema
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      setTimeout(updateGameTheme, 50);
    });
  }

  // Inizializza statistiche
  function initStats() {
    playerWinsDisplay.textContent = stats.playerWins;
    computerWinsDisplay.textContent = stats.computerWins;
    tiesDisplay.textContent = stats.ties;
  }

  // Aggiorna statistiche
  function updateStats(result) {
    if (result === "win") {
      stats.playerWins++;
      localStorage.setItem("rps-player-wins", stats.playerWins);
      playerWinsDisplay.textContent = stats.playerWins;
    } else if (result === "lose") {
      stats.computerWins++;
      localStorage.setItem("rps-computer-wins", stats.computerWins);
      computerWinsDisplay.textContent = stats.computerWins;
    } else if (result === "tie") {
      stats.ties++;
      localStorage.setItem("rps-ties", stats.ties);
      tiesDisplay.textContent = stats.ties;
    }
  }

  // Reset statistiche
  function resetStats() {
    stats = { playerWins: 0, computerWins: 0, ties: 0 };
    localStorage.setItem("rps-player-wins", 0);
    localStorage.setItem("rps-computer-wins", 0);
    localStorage.setItem("rps-ties", 0);
    playerWinsDisplay.textContent = "0";
    computerWinsDisplay.textContent = "0";
    tiesDisplay.textContent = "0";
  }
  
  // Genera scelta random per il computer
  function getComputerChoice() {
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
  }
  
  // Determina il vincitore
  function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
      return "tie";
    } else if (winConditions[playerChoice] === computerChoice) {
      return "win";
    } else {
      return "lose";
    }
  }
  
  // Gestione click su scelta
  function handleChoiceClick(event) {
    if (!gameActive) return;
    
    // Rimuovi selezione precedente
    choiceButtons.forEach(button => {
      button.classList.remove("selected");
    });
    
    const clickedButton = event.currentTarget;
    const playerChoice = clickedButton.getAttribute("data-choice");
    
    // Evidenzia la scelta selezionata
    clickedButton.classList.add("selected");
    
    // Aggiorna icona giocatore
    playerIcon.src = `../../images/games/${playerChoice}.png`;
    playerIcon.alt = playerChoice;
    playerIcon.classList.add("spawn");
    
    // Genera scelta computer
    const computerChoice = getComputerChoice();
    
    // Simula "pensiero" del computer
    computerIcon.src = "../../images/icons/thinking.png";
    computerIcon.alt = "Pensando...";
    
    // Disabilita gioco durante l'animazione
    gameActive = false;
    
    // Dopo un breve ritardo, mostra la scelta del computer e il risultato
    setTimeout(() => {
      computerIcon.src = `../../images/games/${computerChoice}.png`;
      computerIcon.alt = computerChoice;
      computerIcon.classList.add("spawn");
      
      // Determina e mostra il risultato
      const result = determineWinner(playerChoice, computerChoice);
      displayResult(result, playerChoice, computerChoice);
      
      // Aggiorna statistiche
      updateStats(result);
    }, 1000);
  }

  // Mostra risultato
  function displayResult(result, playerChoice, computerChoice) {
    let message = "";
    
    if (result === "win") {
      message = `Hai vinto! ${capitalizeFirstLetter(playerChoice)} batte ${computerChoice}.`;
      resultMessage.className = "result-display win-message";
    } else if (result === "lose") {
      message = `Hai perso! ${capitalizeFirstLetter(computerChoice)} batte ${playerChoice}.`;
      resultMessage.className = "result-display lose-message";
    } else {
      message = "Pareggio!";
      resultMessage.className = "result-display tie-message";
    }
    
    resultMessage.textContent = message;
  }
  
  // Capitalizza prima lettera
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Reset gioco
  function resetGame() {
    gameActive = true;
    
    choiceButtons.forEach(button => {
      button.classList.remove("selected");
    });
    
    playerIcon.src = "../../images/icons/contacts-icon.png";
    playerIcon.alt = "In attesa di scelta";
    computerIcon.src = "../../images/icons/contacts-icon.png";
    computerIcon.alt = "In attesa di scelta";
    
    // Rimuovi classi animate
    playerIcon.classList.remove("spawn");
    computerIcon.classList.remove("spawn");
    
    resultMessage.textContent = "Fai la tua scelta!";
    resultMessage.className = "result-display";
  }

  // Event listeners
  choiceButtons.forEach(button => {
    button.addEventListener("click", handleChoiceClick);
  });

  playAgainButton.addEventListener("click", resetGame);
  resetStatsButton.addEventListener("click", resetStats);

  // Inizializza statistiche
  initStats();
});