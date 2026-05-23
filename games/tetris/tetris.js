document.addEventListener("DOMContentLoaded", function () {
  const BASE_SPEED = 500; // Velocità di base in millisecondi

  // Definizione delle forme dei tetromini
  const TETROMINOS = {
    I: {
      shape: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      color: "tetromino-i",
    },
    J: {
      shape: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      color: "tetromino-j",
    },
    L: {
      shape: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      color: "tetromino-l",
    },
    O: {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: "tetromino-o",
    },
    S: {
      shape: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      color: "tetromino-s",
    },
    T: {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      color: "tetromino-t",
    },
    Z: {
      shape: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      color: "tetromino-z",
    },
  };

  // Stato del gioco
  let gameState = {
    grid: createEmptyGrid(20, 10),
    currentPiece: null,
    nextPiece: null,
    position: { x: 0, y: 0 },
    score: 0,
    level: 1,
    speed: BASE_SPEED,
    gameOver: false,
    isPaused: false,
    intervalId: null,
    linesCleared: 0,
  };

  // Elementi DOM
  const gameboardElement = document.getElementById("gameboard");
  const newGameButton = document.getElementById("new-game-btn");
  const scoreElement = document.getElementById("score");
  const levelElement = document.getElementById("level");

  // Inizializzazione
  initGame();

  // Event Listeners
  newGameButton.addEventListener("click", initGame);
  document.addEventListener("keydown", handleKeyPress);

  // Inizializza una nuova partita
  function initGame() {
    // Rimuovi overlay precedenti
    const existingOverlays = document.querySelectorAll(".game-overlay");
    existingOverlays.forEach((overlay) => document.body.removeChild(overlay));

    // Reset dello stato
    clearInterval(gameState.intervalId);
    gameState.grid = createEmptyGrid(20, 10);
    gameState.score = 0;
    gameState.level = 1;
    gameState.linesCleared = 0;
    gameState.gameOver = false;
    gameState.isPaused = false;
    gameState.speed = BASE_SPEED;

    // Aggiorna UI
    scoreElement.textContent = "0";
    levelElement.textContent = "1";

    // Genera primo pezzo e prossimo pezzo
    gameState.currentPiece = generateRandomPiece();
    gameState.nextPiece = generateRandomPiece();
    resetPosition();

    // Avvia il gioco
    startGame();

    // Renderizza la griglia iniziale
    renderGrid();
  }

  // Avvia il loop di gioco
  function startGame() {
    clearInterval(gameState.intervalId); // Assicuriamoci che non ci siano altri interval attivi
    gameState.intervalId = setInterval(() => {
      if (!gameState.isPaused && !gameState.gameOver) {
        moveDown();
      }
    }, gameState.speed);
  }

  // Crea una griglia vuota
  function createEmptyGrid(rows, cols) {
    const grid = [];
    for (let y = 0; y < rows; y++) {
      grid[y] = [];
      for (let x = 0; x < cols; x++) {
        grid[y][x] = null;
      }
    }
    return grid;
  }

  // Genera un pezzo casuale
  function generateRandomPiece() {
    const pieces = "IJLOSTZ";
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    return TETROMINOS[randomPiece];
  }

  // Reset posizione del pezzo
  function resetPosition() {
    // Posiziona il pezzo in alto al centro
    const piece = gameState.currentPiece;
    gameState.position = {
      x: Math.floor((10 - piece.shape[0].length) / 2),
      y: 0,
    };
  }

  // Rendering della griglia
  function renderGrid() {
    // Cancella la griglia
    gameboardElement.innerHTML = "";

    // Crea prima una copia della griglia
    const gridCopy = JSON.parse(JSON.stringify(gameState.grid));

    // Aggiungi il pezzo corrente alla copia della griglia
    if (gameState.currentPiece) {
      const { shape, color } = gameState.currentPiece;
      const { x, y } = gameState.position;

      // Aggiungi anche la "ghost piece" che mostra dove atterrerà il pezzo
      const ghostY = calculateDropPosition();

      // Prima renderizza la ghost piece
      shape.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          if (cell) {
            const ghostYPos = ghostY + rowIndex;
            const xPos = x + cellIndex;

            if (ghostYPos >= 0 && ghostYPos < 20 && xPos >= 0 && xPos < 10) {
              if (!gridCopy[ghostYPos][xPos]) {
                gridCopy[ghostYPos][xPos] = { color: color, ghost: true };
              }
            }
          }
        });
      });

      // Poi renderizza il pezzo corrente (sovrascrivendo la ghost piece se necessario)
      shape.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          if (cell) {
            const yPos = y + rowIndex;
            const xPos = x + cellIndex;

            if (yPos >= 0 && yPos < 20 && xPos >= 0 && xPos < 10) {
              gridCopy[yPos][xPos] = { color: color };
            }
          }
        });
      });
    }

    // Renderizza la griglia completa con i pezzi fissi + il pezzo corrente
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        const cellElement = document.createElement("div");
        cellElement.className = "cell";

        if (gridCopy[y][x]) {
          cellElement.classList.add(gridCopy[y][x].color);
          if (gridCopy[y][x].ghost) {
            cellElement.classList.add("ghost");
          }
        }

        gameboardElement.appendChild(cellElement);
      }
    }
  }

  // Gestione comandi da tastiera
  function handleKeyPress(event) {
    if (gameState.gameOver) return;

    if (event.key === "p" || event.key === "P") {
      togglePause();
      return;
    }

    if (gameState.isPaused) return;

    switch (event.key) {
      case "ArrowLeft":
      case "a":
      case "A":
        moveHorizontal(-1);
        break;
      case "ArrowRight":
      case "d":
      case "D":
        moveHorizontal(1);
        break;
      case "ArrowDown":
      case "s":
      case "S":
        moveDown();
        break;
      case "ArrowUp":
      case "w":
      case "W":
        rotatePiece(1);
        break;
      case " ": // Spazio
        hardDrop();
        break;
    }
  }

  // Pausa/riprendi gioco
  function togglePause() {
    gameState.isPaused = !gameState.isPaused;

    if (gameState.isPaused) {
      showPauseScreen();
    } else {
      // Rimuovi schermata di pausa
      const pauseOverlay = document.querySelector(".game-overlay.pause");
      if (pauseOverlay) {
        document.body.removeChild(pauseOverlay);
      }
    }
  }

  // Sposta il pezzo orizzontalmente
  function moveHorizontal(direction) {
    gameState.position.x += direction;

    if (isCollision()) {
      // Se c'è collisione, annulla il movimento
      gameState.position.x -= direction;
      return false;
    }

    renderGrid();
    return true;
  }

  // Sposta il pezzo verso il basso
  function moveDown() {
    gameState.position.y++;

    if (isCollision()) {
      // Se c'è collisione, annulla il movimento e fissa il pezzo
      gameState.position.y--;
      lockPiece();
      return false;
    }

    renderGrid();
    return true;
  }

  // Ruota il pezzo
  function rotatePiece() {
    // Salva la matrice originale
    const originalShape = gameState.currentPiece.shape;

    // Crea una nuova matrice ruotata
    const numRows = originalShape.length;
    const numCols = originalShape[0].length;

    // Crea una matrice vuota
    let rotatedShape = [];
    for (let i = 0; i < numCols; i++) {
      rotatedShape[i] = Array(numRows).fill(0);
    }

    // Riempi la matrice ruotata
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        rotatedShape[x][numRows - 1 - y] = originalShape[y][x];
      }
    }

    // Salva temporaneamente la matrice ruotata
    const originalMatrix = gameState.currentPiece.shape;
    gameState.currentPiece.shape = rotatedShape;

    // Controllo collisioni e pareti
    if (isCollision()) {
      // Prova a fare wall kick (spostare leggermente il pezzo)
      const originalX = gameState.position.x;

      // Prova a spostare a sinistra
      gameState.position.x -= 1;
      if (!isCollision()) {
        renderGrid();
        return true;
      }

      // Prova a spostare a destra
      gameState.position.x = originalX + 1;
      if (!isCollision()) {
        renderGrid();
        return true;
      }

      // Se tutti i tentativi falliscono, ripristina rotazione e posizione
      gameState.position.x = originalX;
      gameState.currentPiece.shape = originalMatrix;
      return false;
    }

    renderGrid();
    return true;
  }

  // Hard drop - caduta immediata
  function hardDrop() {
    const dropY = calculateDropPosition();
    gameState.position.y = dropY;
    lockPiece();
  }

  // Calcola posizione di caduta per hard drop e ghost piece
  function calculateDropPosition() {
    let testY = gameState.position.y;

    while (!isCollisionAt(gameState.position.x, testY + 1)) {
      testY++;
    }

    return testY;
  }

  // Blocca il pezzo nella griglia
  function lockPiece() {
    const { shape, color } = gameState.currentPiece;
    const { x, y } = gameState.position;

    // Aggiungi il pezzo alla griglia
    shape.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (cell) {
          const yPos = y + rowIndex;
          const xPos = x + cellIndex;

          if (yPos >= 0 && yPos < 20 && xPos >= 0 && xPos < 10) {
            gameState.grid[yPos][xPos] = { color: color };
          }
        }
      });
    });

    // Controlla se ci sono righe completate
    const completedRows = checkCompletedRows();
    if (completedRows > 0) {
      // Aggiorna il punteggio
      updateScore(completedRows);
    }

    // Passa al prossimo pezzo
    gameState.currentPiece = gameState.nextPiece;
    gameState.nextPiece = generateRandomPiece();
    resetPosition();

    // Controlla game over
    if (isCollision()) {
      gameOver();
    }

    renderGrid();
  }

  // Controlla se c'è collisione
  function isCollision() {
    return isCollisionAt(gameState.position.x, gameState.position.y);
  }

  // Controlla se c'è collisione ad una posizione specifica
  function isCollisionAt(testX, testY) {
    const { shape } = gameState.currentPiece;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const worldX = testX + x;
          const worldY = testY + y;

          // Controlla bordi
          if (worldX < 0 || worldX >= 10 || worldY >= 20) {
            return true;
          }

          // Controlla se c'è già un pezzo
          if (worldY >= 0 && gameState.grid[worldY][worldX]) {
            return true;
          }
        }
      }
    }

    return false;
  }

  // Controlla righe completate
  function checkCompletedRows() {
    let completedRows = 0;

    for (let y = 19; y >= 0; y--) {
      let rowComplete = true;

      for (let x = 0; x < 10; x++) {
        if (!gameState.grid[y][x]) {
          rowComplete = false;
          break;
        }
      }

      if (rowComplete) {
        // Rimuovi la riga
        for (let yy = y; yy > 0; yy--) {
          for (let x = 0; x < 10; x++) {
            gameState.grid[yy][x] = gameState.grid[yy - 1][x];
          }
        }

        // Riempi la prima riga con celle vuote
        for (let x = 0; x < 10; x++) {
          gameState.grid[0][x] = null;
        }

        completedRows++;
        y++; // Controlla di nuovo la stessa riga
      }
    }

    return completedRows;
  }

  // Aggiorna il punteggio e il livello
  function updateScore(completedRows) {
    // Sistema di punteggio stile Tetris classico
    const points = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4 righe
    gameState.score += points[completedRows] * gameState.level;

    // Aggiorna linee rimosse
    gameState.linesCleared += completedRows;

    // Aggiorna il livello ogni 10 righe
    const newLevel = Math.floor(gameState.linesCleared / 10) + 1;
    if (newLevel > gameState.level) {
      gameState.level = newLevel;
      // Aggiorna la velocità in base al livello (decresce fino a un minimo di 100ms)
      gameState.speed = Math.max(BASE_SPEED - (newLevel - 1) * 50, 100);

      // Aggiorna l'intervallo
      clearInterval(gameState.intervalId);
      startGame();
    }

    // Aggiorna UI
    scoreElement.textContent = gameState.score;
    levelElement.textContent = gameState.level;
  }

  // Game Over
  function gameOver() {
    gameState.gameOver = true;
    clearInterval(gameState.intervalId);
    showGameOverScreen();
  }

  // Mostra schermata Game Over
  function showGameOverScreen() {
    const overlay = document.createElement("div");
    overlay.className = "game-overlay";

    const message = document.createElement("h2");
    message.className = "overlay-message";
    message.textContent = "Game Over!";

    const subtitle = document.createElement("div");
    subtitle.className = "overlay-subtitle";
    subtitle.textContent = `Punteggio finale: ${gameState.score}`;

    const playAgainButton = document.createElement("button");
    playAgainButton.textContent = "Gioca Ancora";
    playAgainButton.className = "overlay-button";
    playAgainButton.addEventListener("click", () => {
      document.body.removeChild(overlay);
      initGame();
    });

    overlay.appendChild(message);
    overlay.appendChild(subtitle);
    overlay.appendChild(playAgainButton);
    document.body.appendChild(overlay);
  }

  // Mostra schermata di pausa
  function showPauseScreen() {
    const overlay = document.createElement("div");
    overlay.className = "game-overlay pause";

    const message = document.createElement("h2");
    message.className = "overlay-message";
    message.textContent = "Pausa";

    const subtitle = document.createElement("div");
    subtitle.className = "overlay-subtitle";
    subtitle.textContent = "Premi 'P' per continuare";

    const resumeButton = document.createElement("button");
    resumeButton.textContent = "Continua";
    resumeButton.className = "overlay-button";
    resumeButton.addEventListener("click", () => {
      togglePause();
    });

    overlay.appendChild(message);
    overlay.appendChild(subtitle);
    overlay.appendChild(resumeButton);
    document.body.appendChild(overlay);
  }
});
