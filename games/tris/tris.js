document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const gridCells = document.querySelectorAll(".grid-cell");
  const currentTurnDisplay = document.getElementById("current-turn");
  const resetButton = document.getElementById("reset-button");
  const resetStatsButton = document.getElementById("reset-stats");
  const xWinsDisplay = document.getElementById("x-wins");
  const oWinsDisplay = document.getElementById("o-wins");
  const tiesDisplay = document.getElementById("ties");

  // Statistiche
  let stats = {
    xWins: parseInt(localStorage.getItem("tris-x-wins") || 0),
    oWins: parseInt(localStorage.getItem("tris-o-wins") || 0),
    ties: parseInt(localStorage.getItem("tris-ties") || 0),
  };

  // Stato del gioco
  let board = ["", "", "", "", "", "", "", "", ""];
  let currentPlayer = "X";
  let gameActive = true;

  // Combinazioni vincenti
  const winningCombinations = [
    [0, 1, 2], // Prima riga
    [3, 4, 5], // Seconda riga
    [6, 7, 8], // Terza riga
    [0, 3, 6], // Prima colonna
    [1, 4, 7], // Seconda colonna
    [2, 5, 8], // Terza colonna
    [0, 4, 8], // Diagonale principale
    [2, 4, 6], // Diagonale secondaria
  ];

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
    xWinsDisplay.textContent = stats.xWins;
    oWinsDisplay.textContent = stats.oWins;
    tiesDisplay.textContent = stats.ties;
  }

  // Aggiorna statistiche
  function updateStats(result) {
    if (result === "X") {
      stats.xWins++;
      localStorage.setItem("tris-x-wins", stats.xWins);
      xWinsDisplay.textContent = stats.xWins;
    } else if (result === "O") {
      stats.oWins++;
      localStorage.setItem("tris-o-wins", stats.oWins);
      oWinsDisplay.textContent = stats.oWins;
    } else if (result === "tie") {
      stats.ties++;
      localStorage.setItem("tris-ties", stats.ties);
      tiesDisplay.textContent = stats.ties;
    }
  }

  // Reset statistiche
  function resetStats() {
    stats = { xWins: 0, oWins: 0, ties: 0 };
    localStorage.setItem("tris-x-wins", 0);
    localStorage.setItem("tris-o-wins", 0);
    localStorage.setItem("tris-ties", 0);
    xWinsDisplay.textContent = 0;
    oWinsDisplay.textContent = 0;
    tiesDisplay.textContent = 0;
  }

  // Gestione click cella
  function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute("data-index"));

    if (board[clickedCellIndex] !== "" || !gameActive) return;

    board[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer === "X" ? "x-symbol" : "o-symbol");
    clickedCell.classList.add("spawn");

    setTimeout(() => clickedCell.classList.remove("spawn"), 300);

    checkResult();
  }

  // Controlla risultato
  function checkResult() {
    let roundWon = false;
    let winningLine = null;

    for (let i = 0; i < winningCombinations.length; i++) {
      const [a, b, c] = winningCombinations[i];
      const symbolA = board[a];
      const symbolB = board[b];
      const symbolC = board[c];

      if (symbolA === "" || symbolB === "" || symbolC === "") continue;

      if (symbolA === symbolB && symbolB === symbolC) {
        roundWon = true;
        winningLine = winningCombinations[i];
        break;
      }
    }

    // Gestione vincitore
    if (roundWon) {
      highlightWinningLine(winningLine);
      gameActive = false;
      updateStats(currentPlayer);
      setTimeout(() => showGameResult(`${currentPlayer} ha vinto!`), 500);
      return;
    }

    // Controlla pareggio
    if (!board.includes("")) {
      gameActive = false;
      updateStats("tie");
      setTimeout(() => showGameResult("Pareggio!"), 500);
      return;
    }

    // Cambia giocatore
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    currentTurnDisplay.textContent = currentPlayer;
    currentTurnDisplay.className =
      "score-value " + (currentPlayer === "X" ? "x-symbol" : "o-symbol");
  }

  // Evidenzia linea vincente
  function highlightWinningLine(winningLine) {
    for (const index of winningLine) {
      gridCells[index].classList.add("win-cell");
    }
  }

  // Ottieni colore del simbolo
  function getSymbolColor(symbol) {
    const computedStyle = getComputedStyle(document.documentElement);
    if (symbol === "X") {
      return computedStyle.getPropertyValue("--x-color").trim();
    } else if (symbol === "O") {
      return computedStyle.getPropertyValue("--o-color").trim();
    }
    return "white";
  }

  // Mostra risultato
  function showGameResult(message) {
    const gameResultOverlay = document.createElement("div");
    gameResultOverlay.id = "game-result-overlay";

    const resultMessage = document.createElement("h2");
    resultMessage.textContent = message;

    if (message.includes("X")) {
      resultMessage.className = "x-symbol";
    } else if (message.includes("O")) {
      resultMessage.className = "o-symbol";
    }

    const playAgainButton = document.createElement("button");
    playAgainButton.textContent = "Gioca Ancora";
    playAgainButton.addEventListener("click", () => {
      document.body.removeChild(gameResultOverlay);
      resetGame();
    });

    gameResultOverlay.appendChild(resultMessage);
    gameResultOverlay.appendChild(playAgainButton);

    document.body.appendChild(gameResultOverlay);
  }

  // Reset gioco
  function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    currentTurnDisplay.textContent = currentPlayer;
    currentTurnDisplay.className = "score-value x-symbol";

    gridCells.forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove("x-symbol", "o-symbol", "win-cell");
    });
  }

  // Event listeners
  gridCells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick);
  });

  resetButton.addEventListener("click", resetGame);
  resetStatsButton.addEventListener("click", resetStats);

  initStats();
});
