document.addEventListener("DOMContentLoaded", () => {
  // Selezione degli elementi DOM
  const grid = document.getElementById("grid");
  const columnButtons = document.querySelectorAll(".column-button");
  const cells = document.querySelectorAll(".grid-cell");
  const resetButton = document.getElementById("reset-button");
  const resetStatsButton = document.getElementById("reset-stats");
  const currentTurnDisplay = document.getElementById("current-turn");
  const redWinsDisplay = document.getElementById("red-wins");
  const yellowWinsDisplay = document.getElementById("yellow-wins");
  const tiesDisplay = document.getElementById("ties");
  const resultOverlay = document.getElementById("game-result-overlay");
  const resultMessage = document.getElementById("result-message");
  const playAgainButton = document.getElementById("play-again-button");

  // Costanti del gioco
  const ROWS = 6;
  const COLUMNS = 7;
  const EMPTY = null;
  const RED = "red";
  const YELLOW = "yellow";

  // Stato del gioco
  let gameBoard = Array(ROWS)
    .fill()
    .map(() => Array(COLUMNS).fill(EMPTY));
  let currentPlayer = RED;
  let gameActive = true;
  let scores = {
    red: 0,
    yellow: 0,
    ties: 0,
  };

  // Carica i punteggi salvati
  loadScores();

  // Aggiunge gli event listener
  columnButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const column = parseInt(button.getAttribute("data-column"));
      if (gameActive) {
        dropDisc(column);
      }
    });
  });

  resetButton.addEventListener("click", resetGame);
  resetStatsButton.addEventListener("click", resetStats);
  playAgainButton.addEventListener("click", () => {
    resultOverlay.style.display = "none";
    resetGame();
  });

  // Funzione per far cadere un disco in una colonna
  function dropDisc(column) {
    // Trova la prima cella vuota nella colonna (dal basso verso l'alto)
    for (let row = ROWS - 1; row >= 0; row--) {
      if (gameBoard[row][column] === EMPTY) {
        // Aggiorna lo stato del gioco
        gameBoard[row][column] = currentPlayer;

        // Aggiorna l'aspetto visivo
        const cell = document.querySelector(
          `.grid-cell[data-row="${row}"][data-column="${column}"]`
        );
        const disc = document.createElement("span");
        disc.textContent = currentPlayer === RED ? "🔴" : "🟡";
        disc.classList.add(currentPlayer === RED ? "red-disc" : "yellow-disc");
        disc.classList.add("drop-animation");
        cell.appendChild(disc);

        // Controlla se c'è una vittoria
        if (checkWin(row, column)) {
          endGame(`${currentPlayer === RED ? "Rosso" : "Giallo"} ha vinto!`);
          scores[currentPlayer]++;
          updateScoresDisplay();
          saveScores();
          return;
        }

        // Controlla se è un pareggio
        if (checkTie()) {
          endGame("Pareggio!");
          scores.ties++;
          updateScoresDisplay();
          saveScores();
          return;
        }

        // Cambia giocatore
        currentPlayer = currentPlayer === RED ? YELLOW : RED;
        currentTurnDisplay.textContent = currentPlayer === RED ? "🔴" : "🟡";
        currentTurnDisplay.className = `score-value ${
          currentPlayer === RED ? "red-disc" : "yellow-disc"
        }`;

        // Verifica se la colonna è piena e disabilita il pulsante se necessario
        if (gameBoard[0][column] !== EMPTY) {
          columnButtons[column].disabled = true;
        }

        return;
      }
    }
  }

  // Funzione per controllare se c'è un vincitore
  function checkWin(row, col) {
    const player = gameBoard[row][col];
    const directions = [
      { dr: 0, dc: 1 }, // orizzontale
      { dr: 1, dc: 0 }, // verticale
      { dr: 1, dc: 1 }, // diagonale ↘
      { dr: 1, dc: -1 }, // diagonale ↙
    ];

    for (const { dr, dc } of directions) {
      let count = 1;
      const winCells = [[row, col]];

      // Controlla in una direzione
      for (let i = 1; i < 4; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (
          r >= 0 &&
          r < ROWS &&
          c >= 0 &&
          c < COLUMNS &&
          gameBoard[r][c] === player
        ) {
          count++;
          winCells.push([r, c]);
        } else {
          break;
        }
      }

      // Controlla nella direzione opposta
      for (let i = 1; i < 4; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (
          r >= 0 &&
          r < ROWS &&
          c >= 0 &&
          c < COLUMNS &&
          gameBoard[r][c] === player
        ) {
          count++;
          winCells.push([r, c]);
        } else {
          break;
        }
      }

      // Se ci sono 4 o più dischi dello stesso colore in fila, abbiamo un vincitore
      if (count >= 4) {
        // Evidenzia le celle vincenti
        highlightWinCells(winCells);
        return true;
      }
    }

    return false;
  }

  // Funzione per evidenziare le celle vincenti
  function highlightWinCells(winCells) {
    winCells.forEach(([row, col]) => {
      const cell = document.querySelector(
        `.grid-cell[data-row="${row}"][data-column="${col}"]`
      );
      cell.classList.add("win-cell");
    });
  }

  // Controlla se c'è un pareggio (tutte le celle sono piene)
  function checkTie() {
    for (let col = 0; col < COLUMNS; col++) {
      if (gameBoard[0][col] === EMPTY) {
        return false;
      }
    }
    return true;
  }

  // Funzione per terminare il gioco
  function endGame(message) {
    gameActive = false;
    resultMessage.textContent = message;
    resultOverlay.style.display = "flex";

    // Disabilita tutti i pulsanti delle colonne
    columnButtons.forEach((button) => {
      button.disabled = true;
    });
  }

  // Funzione per resettare il gioco
  function resetGame() {
    // Resetta la tavola di gioco
    gameBoard = Array(ROWS)
      .fill()
      .map(() => Array(COLUMNS).fill(EMPTY));

    // Resetta l'aspetto visivo
    cells.forEach((cell) => {
      cell.innerHTML = "";
      cell.classList.remove("win-cell");
    });

    // Resetta i pulsanti delle colonne
    columnButtons.forEach((button) => {
      button.disabled = false;
    });

    // Resetta altre variabili di stato
    currentPlayer = RED;
    gameActive = true;

    // Aggiorna l'indicatore del turno
    currentTurnDisplay.textContent = "🔴";
    currentTurnDisplay.className = "score-value red-disc";
  }

  // Funzione per resettare le statistiche
  function resetStats() {
    scores = {
      red: 0,
      yellow: 0,
      ties: 0,
    };
    updateScoresDisplay();
    saveScores();
  }

  // Funzione per aggiornare il display dei punteggi
  function updateScoresDisplay() {
    redWinsDisplay.textContent = scores.red;
    yellowWinsDisplay.textContent = scores.yellow;
    tiesDisplay.textContent = scores.ties;
  }

  // Funzione per salvare i punteggi nel localStorage
  function saveScores() {
    localStorage.setItem("forza4-scores", JSON.stringify(scores));
  }

  // Funzione per caricare i punteggi dal localStorage
  function loadScores() {
    const savedScores = localStorage.getItem("forza4-scores");
    if (savedScores) {
      scores = JSON.parse(savedScores);
      updateScoresDisplay();
    }
  }
});
