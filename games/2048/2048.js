document.addEventListener("DOMContentLoaded", () => {
  const gridSize = 4;
  let score = 0;
  let bestScore = localStorage.getItem("2048-best-score") || 0;
  let grid = Array(gridSize)
    .fill()
    .map(() => Array(gridSize).fill(0));

  // Aggiorna il record all'avvio
  document.getElementById("best-score").textContent = bestScore;

  // Imposta il tema in base al tema del corpo della pagina
  function updateGameTheme() {
    const isDarkTheme = document.body.classList.contains("light-theme")
      ? false
      : true;
    const gameContainer = document.querySelector(".game-container");
    const gridContainer = document.querySelector(".grid-container");

    if (isDarkTheme) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("colorful-theme", "light-theme");
    } else {
      document.body.classList.remove("dark-theme", "colorful-theme");
    }
  }

  // Aggiorna il tema all'avvio
  updateGameTheme();

  // Ascolta per cambiamenti al tema generale del sito
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      setTimeout(updateGameTheme, 50);
    });
  }

  function updateScore() {
    document.getElementById("current-score").textContent = score;

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("2048-best-score", bestScore);
      document.getElementById("best-score").textContent = bestScore;
    }
  }

  function createGrid() {
    const gridContainer = document.getElementById("grid");
    gridContainer.innerHTML = "";
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");
        if (grid[r][c] !== 0) {
          cell.textContent = grid[r][c];
          cell.classList.add(`cell-${grid[r][c]}`);
        }
        gridContainer.appendChild(cell);
      }
    }
    updateScore();
  }

  function spawnTile() {
    let emptyCells = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;

      // Animazione di spawn
      setTimeout(() => {
        const index = r * gridSize + c;
        const cell = document.querySelectorAll(".grid-cell")[index];
        cell.classList.add("spawn");
        setTimeout(() => cell.classList.remove("spawn"), 250);
      }, 50);

      return true;
    }
    return false;
  }

  function moveLeft() {
    let moved = false;
    let mergedCells = [];

    for (let r = 0; r < gridSize; r++) {
      let row = [...grid[r]];
      let newRow = [0, 0, 0, 0];
      let position = 0;

      // Sposta tutti gli elementi non-zero a sinistra
      for (let c = 0; c < gridSize; c++) {
        if (row[c] !== 0) {
          newRow[position] = row[c];
          position++;
        }
      }

      // Unisci le celle identiche adiacenti
      for (let c = 0; c < gridSize - 1; c++) {
        if (newRow[c] !== 0 && newRow[c] === newRow[c + 1]) {
          newRow[c] *= 2;
          score += newRow[c];
          newRow[c + 1] = 0;
          mergedCells.push({ r, c });
        }
      }

      // Sposta di nuovo tutti gli elementi non-zero a sinistra dopo l'unione
      row = [...newRow];
      newRow = [0, 0, 0, 0];
      position = 0;
      for (let c = 0; c < gridSize; c++) {
        if (row[c] !== 0) {
          newRow[position] = row[c];
          position++;
        }
      }

      // Verifica se la riga è cambiata
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] !== newRow[c]) {
          moved = true;
        }
      }

      grid[r] = newRow;
    }

    // Applica l'animazione di fusione
    setTimeout(() => {
      mergedCells.forEach(({ r, c }) => {
        const index = r * gridSize + c;
        const cell = document.querySelectorAll(".grid-cell")[index];
        cell.classList.add("merge");
        setTimeout(() => cell.classList.remove("merge"), 250);
      });
    }, 50);

    return moved;
  }

  function rotateGrid(times) {
    for (let i = 0; i < times; i++) {
      const newGrid = Array(gridSize)
        .fill()
        .map(() => Array(gridSize).fill(0));
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          newGrid[c][gridSize - 1 - r] = grid[r][c];
        }
      }
      grid = newGrid;
    }
  }

  function handleMove(direction) {
    // Memorizza la griglia prima della mossa
    const oldGrid = JSON.stringify(grid);

    // 0: sinistra, 1: su, 2: destra, 3: giù
    switch (direction) {
      case 0: // Sinistra
        moveLeft();
        break;
      case 1: // Su
        rotateGrid(3);
        moveLeft();
        rotateGrid(1);
        break;
      case 2: // Destra
        rotateGrid(2);
        moveLeft();
        rotateGrid(2);
        break;
      case 3: // Giù
        rotateGrid(1);
        moveLeft();
        rotateGrid(3);
        break;
    }

    // Verifica se la griglia è cambiata
    if (oldGrid !== JSON.stringify(grid)) {
      spawnTile();
      createGrid();

      // Verifica se ha raggiunto 2048
      if (hasReached2048()) {
        setTimeout(() => {
          showWinScreen();
        }, 300);
      }
      // Verifica se il gioco è finito
      else if (isGameOver()) {
        setTimeout(() => {
          showGameOver();
        }, 300);
      }
    }
  }

  function hasReached2048() {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === 2048) return true;
      }
    }
    return false;
  }

  function isGameOver() {
    // Verifica se la griglia è piena
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === 0) return false;
      }
    }

    // Verifica se ci sono celle adiacenti con lo stesso valore
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const current = grid[r][c];

        // Controlla a destra
        if (c < gridSize - 1 && grid[r][c + 1] === current) return false;

        // Controlla in basso
        if (r < gridSize - 1 && grid[r + 1][c] === current) return false;
      }
    }

    return true; // Nessuna mossa possibile
  }

  function showWinScreen() {
    const winOverlay = document.createElement("div");
    winOverlay.id = "game-over-overlay";

    const winMessage = document.createElement("h2");
    winMessage.textContent = "Hai vinto!";
    winMessage.style.color = "#ffc107";

    const continueButton = document.createElement("button");
    continueButton.textContent = "Continua a giocare";
    continueButton.addEventListener("click", () => {
      document.body.removeChild(winOverlay);
    });

    const newGameButton = document.createElement("button");
    newGameButton.textContent = "Nuova Partita";
    newGameButton.addEventListener("click", () => {
      document.body.removeChild(winOverlay);
      resetGame();
    });

    winOverlay.appendChild(winMessage);
    winOverlay.appendChild(continueButton);
    winOverlay.appendChild(newGameButton);

    document.body.appendChild(winOverlay);
  }

  function showGameOver() {
    const gameOverOverlay = document.createElement("div");
    gameOverOverlay.id = "game-over-overlay";

    const gameOverMessage = document.createElement("h2");
    gameOverMessage.textContent = "Game Over!";

    const finalScore = document.createElement("p");
    finalScore.textContent = `Punteggio finale: ${score}`;
    finalScore.style.color = "white";
    finalScore.style.fontSize = "1.5rem";
    finalScore.style.marginBottom = "2rem";

    const restartButton = document.createElement("button");
    restartButton.textContent = "Gioca Ancora";
    restartButton.addEventListener("click", () => {
      document.body.removeChild(gameOverOverlay);
      resetGame();
    });

    gameOverOverlay.appendChild(gameOverMessage);
    gameOverOverlay.appendChild(finalScore);
    gameOverOverlay.appendChild(restartButton);

    document.body.appendChild(gameOverOverlay);
  }

  function resetGame() {
    // Reimposta la griglia e il punteggio
    grid = Array(gridSize)
      .fill()
      .map(() => Array(gridSize).fill(0));
    score = 0;

    // Inizializza nuovamente il gioco
    spawnTile();
    spawnTile();
    createGrid();
  }

  // Gestione della tastiera
  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase(); // Normalizza in minuscolo

    switch (key) {
      case "arrowleft":
      case "a":
        handleMove(0); // Sinistra
        break;
      case "arrowup":
      case "w":
        handleMove(1); // Su
        break;
      case "arrowright":
      case "d":
        handleMove(2); // Destra
        break;
      case "arrowdown":
      case "s":
        handleMove(3); // Giù
        break;
    }
  });

  // Pulsante di reset
  document.getElementById("reset-button").addEventListener("click", resetGame);

  // Inizializza il gioco
  spawnTile();
  spawnTile();
  createGrid();
});
