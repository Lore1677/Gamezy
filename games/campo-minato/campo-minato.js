document.addEventListener("DOMContentLoaded", function () {
  // Configurazione dei livelli di difficoltà
  const config = {
    easy: { rows: 9, columns: 9, mines: 10 },
    medium: { rows: 16, columns: 16, mines: 40 },
    hard: { rows: 16, columns: 30, mines: 99 },
  };

  // Stato del gioco
  let gameState = {
    grid: [],
    minesCount: 0,
    minesLeft: 0,
    revealed: 0,
    gameOver: false,
    firstClick: true,
    timer: 0,
    timerInterval: null,
    difficulty: "easy",
  };

  // Elementi DOM
  const gameboardElement = document.getElementById("gameboard");
  const difficultySelector = document.getElementById("difficulty");
  const newGameButton = document.getElementById("new-game-btn");
  const minesLeftElement = document.getElementById("mines-left");
  const timerElement = document.getElementById("timer");

  // Inizializzazione
  difficultySelector.value = "easy";
  initGame();

  // Event Listeners
  difficultySelector.addEventListener("change", function () {
    gameState.difficulty = this.value;
    initGame();
  });

  newGameButton.addEventListener("click", initGame);

  // Inizializza una nuova partita
  function initGame() {
    // Reset dello stato
    clearInterval(gameState.timerInterval);
    gameState.grid = [];
    gameState.gameOver = false;
    gameState.firstClick = true;
    gameState.timer = 0;
    gameState.revealed = 0;
    timerElement.textContent = "0";

    const { rows, columns, mines } = config[gameState.difficulty];
    gameState.minesCount = mines;
    gameState.minesLeft = mines;
    minesLeftElement.textContent = mines;

    gameboardElement.style.setProperty("--rows", rows);
    gameboardElement.style.setProperty("--columns", columns);

    createEmptyGrid(rows, columns);
    renderGrid();
  }

  // Crea una griglia vuota senza mine
  function createEmptyGrid(rows, columns) {
    gameState.grid = [];

    for (let row = 0; row < rows; row++) {
      gameState.grid[row] = [];
      for (let col = 0; col < columns; col++) {
        gameState.grid[row][col] = {
          row,
          col,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        };
      }
    }
  }

  // Posiziona le mine evitando la prima cella cliccata
  function placeMines(rows, columns, mines, firstClickRow, firstClickCol) {
    // Area sicura intorno al primo click
    const safeArea = [];
    for (let r = firstClickRow - 1; r <= firstClickRow + 1; r++) {
      for (let c = firstClickCol - 1; c <= firstClickCol + 1; c++) {
        if (r >= 0 && r < rows && c >= 0 && c < columns) {
          safeArea.push({ row: r, col: c });
        }
      }
    }

    // Piazza le mine
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * columns);

      const isSafe = safeArea.some(
        (pos) => pos.row === randomRow && pos.col === randomCol
      );

      if (!gameState.grid[randomRow][randomCol].isMine && !isSafe) {
        gameState.grid[randomRow][randomCol].isMine = true;
        minesPlaced++;
      }
    }

    // Calcola numero mine vicine
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (!gameState.grid[row][col].isMine) {
          gameState.grid[row][col].neighborMines = countNeighborMines(row, col);
        }
      }
    }
  }

  // Conta le mine nelle celle adiacenti
  function countNeighborMines(row, col) {
    const { rows, columns } = config[gameState.difficulty];
    let count = 0;

    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < rows && c >= 0 && c < columns) {
          if (r === row && c === col) continue;
          if (gameState.grid[r][c].isMine) count++;
        }
      }
    }

    return count;
  }

  // Visualizza la griglia nell'interfaccia
  function renderGrid() {
    gameboardElement.innerHTML = "";
    const { rows, columns } = config[gameState.difficulty];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cell = gameState.grid[row][col];
        const cellElement = document.createElement("div");
        cellElement.className = "cell";
        cellElement.dataset.row = row;
        cellElement.dataset.col = col;

        if (cell.isRevealed) {
          cellElement.classList.add("revealed");

          if (cell.isMine) {
            cellElement.classList.add("mine");
            if (cell.isExploded) {
              cellElement.classList.add("exploded");
            }
          } else if (cell.neighborMines > 0) {
            cellElement.textContent = cell.neighborMines;
            cellElement.classList.add(`value-${cell.neighborMines}`);
          }
        } else if (cell.isFlagged) {
          cellElement.classList.add("flagged");
        }

        cellElement.addEventListener("click", function () {
          handleCellClick(
            parseInt(this.dataset.row),
            parseInt(this.dataset.col)
          );
        });

        cellElement.addEventListener("contextmenu", function (e) {
          e.preventDefault();
          handleRightClick(
            parseInt(this.dataset.row),
            parseInt(this.dataset.col)
          );
        });

        gameboardElement.appendChild(cellElement);
      }
    }
  }

  // Gestione del click sinistro su una cella
  function handleCellClick(row, col) {
    const cell = gameState.grid[row][col];

    if (gameState.gameOver || cell.isRevealed || cell.isFlagged) {
      return;
    }

    // Primo click
    if (gameState.firstClick) {
      gameState.firstClick = false;
      const { rows, columns, mines } = config[gameState.difficulty];
      placeMines(rows, columns, mines, row, col);
      startTimer();
    }

    if (cell.isMine) {
      cell.isExploded = true;
      revealAllMines();
      endGame(false);
    } else {
      revealCell(row, col);
      checkWinCondition();
    }
  }

  // Gestione del click destro (bandierina)
  function handleRightClick(row, col) {
    const cell = gameState.grid[row][col];

    if (gameState.gameOver || cell.isRevealed) {
      return;
    }

    if (gameState.firstClick) {
      gameState.firstClick = false;
      const { rows, columns, mines } = config[gameState.difficulty];
      placeMines(rows, columns, mines, -1, -1);
      startTimer();
    }

    // Gestione bandiera
    if (cell.isFlagged) {
      cell.isFlagged = false;
      gameState.minesLeft++;
    } else {
      cell.isFlagged = true;
      gameState.minesLeft--;
    }

    minesLeftElement.textContent = gameState.minesLeft;
    renderGrid();
  }

  // Rivela una cella e, se vuota, le celle adiacenti
  function revealCell(row, col) {
    const cell = gameState.grid[row][col];

    if (cell.isRevealed || cell.isFlagged) {
      return;
    }

    cell.isRevealed = true;
    gameState.revealed++;

    // Rivela celle adiacenti se vuota
    if (cell.neighborMines === 0) {
      const { rows, columns } = config[gameState.difficulty];

      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < rows && c >= 0 && c < columns) {
            if (r === row && c === col) continue;
            revealCell(r, c);
          }
        }
      }
    }
  }

  // Rivela tutte le mine alla fine del gioco
  function revealAllMines() {
    const { rows, columns } = config[gameState.difficulty];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (gameState.grid[row][col].isMine) {
          gameState.grid[row][col].isRevealed = true;
        }
      }
    }

    renderGrid();
  }

  // Verifica se il giocatore ha vinto
  function checkWinCondition() {
    const { rows, columns, mines } = config[gameState.difficulty];
    const totalCells = rows * columns;

    if (gameState.revealed === totalCells - mines) {
      endGame(true);
    } else {
      renderGrid();
    }
  }

  // Avvia il contatore del tempo
  function startTimer() {
    gameState.timer = 0;
    timerElement.textContent = "0";

    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(function () {
      gameState.timer++;
      timerElement.textContent = gameState.timer;
    }, 1000);
  }

  // Termina il gioco (vittoria o sconfitta)
  function endGame(isWin) {
    gameState.gameOver = true;
    clearInterval(gameState.timerInterval);

    if (!isWin) {
      revealAllMines();
    }

    setTimeout(() => {
      showGameOverScreen(isWin);
    }, 500);
  }

  // Mostra la schermata di fine gioco
  function showGameOverScreen(isWin) {
    const gameOverOverlay = document.createElement("div");
    gameOverOverlay.className = "game-over-overlay";

    const gameOverMessage = document.createElement("h2");
    gameOverMessage.className = "game-over-message";

    const gameOverSubtitle = document.createElement("div");
    gameOverSubtitle.className = "game-over-subtitle";

    if (isWin) {
      gameOverMessage.textContent = "Hai Vinto!";
      gameOverSubtitle.textContent = `Tempo: ${gameState.timer} secondi`;
    } else {
      gameOverMessage.textContent = "Game Over!";
      gameOverSubtitle.textContent = "Hai colpito una mina!";
    }

    const playAgainButton = document.createElement("button");
    playAgainButton.textContent = "Gioca Ancora";
    playAgainButton.className = "game-over-button";
    playAgainButton.addEventListener("click", () => {
      document.body.removeChild(gameOverOverlay);
      initGame();
    });

    gameOverOverlay.appendChild(gameOverMessage);
    gameOverOverlay.appendChild(gameOverSubtitle);
    gameOverOverlay.appendChild(playAgainButton);
    document.body.appendChild(gameOverOverlay);
  }
});
