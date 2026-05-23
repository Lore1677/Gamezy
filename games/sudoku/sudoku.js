document.addEventListener("DOMContentLoaded", function () {
  // Configurazione dei livelli di difficoltà
  // I numeri rappresentano quante celle rivelare inizialmente
  const config = {
    easy: { cellsToReveal: 40 },    // 40 cifre rivelate su 81
    medium: { cellsToReveal: 30 },  // 30 cifre rivelate su 81
    hard: { cellsToReveal: 25 }     // 25 cifre rivelate su 81
  };

  // Stato del gioco
  let gameState = {
    board: Array(9).fill().map(() => Array(9).fill(0)),     // Tabellone corrente
    solution: Array(9).fill().map(() => Array(9).fill(0)),  // Soluzione completa
    fixedCells: Array(9).fill().map(() => Array(9).fill(false)), // Celle fisse (non modificabili)
    notes: Array(9).fill().map(() => Array(9).fill().map(() => Array(9).fill(false))), // Note per ogni cella
    selectedCell: null,              // Cella selezionata
    notesMode: false,                // Modalità note
    errorCount: 0,                   // Conteggio errori
    gameOver: false,                 // Stato fine gioco
    timer: 0,                        // Contatore tempo
    timerInterval: null,             // Intervallo per il timer
    difficulty: "easy",              // Difficoltà corrente
    gameStarted: false               // Flag per indicare se il gioco è iniziato
  };

  // Elementi DOM
  const boardElement = document.getElementById("sudoku-board");
  const difficultySelector = document.getElementById("difficulty");
  const newGameButton = document.getElementById("new-game-btn");
  const timerElement = document.getElementById("timer");
  const errorsCountElement = document.getElementById("errors-count");
  const notesToggleButton = document.getElementById("notes-toggle");
  const hintButton = document.getElementById("hint-btn");
  const numberButtons = document.querySelectorAll(".number-btn");

  // Inizializzazione
  difficultySelector.value = "easy";
  initGame();

  // Event Listeners
  difficultySelector.addEventListener("change", function () {
    gameState.difficulty = this.value;
    initGame();
  });

  newGameButton.addEventListener("click", initGame);
  
  notesToggleButton.addEventListener("click", function() {
    gameState.notesMode = !gameState.notesMode;
    this.classList.toggle("active", gameState.notesMode);
    // Aggiunto per assicurarsi che lo stile venga applicato
    if (gameState.notesMode) {
      this.classList.add("active");
    } else {
      this.classList.remove("active");
    }
  });
  
  hintButton.addEventListener("click", provideHint);
  
  // Event listener per i pulsanti numerici
  document.querySelectorAll('.number-btn').forEach(button => {
    if (button.dataset.number !== undefined) {
      button.addEventListener('click', function() {
        if (gameState.selectedCell && !gameState.gameOver) {
          const number = parseInt(this.dataset.number);
          enterNumber(number);
        }
      });
    }
  });

  // Aggiungi event listener per cancellare (se è presente un pulsante di cancellazione)
  const eraseButton = document.getElementById("erase-btn");
  if (eraseButton) {
    eraseButton.addEventListener('click', function() {
      if (gameState.selectedCell && !gameState.gameOver) {
        enterNumber(0); // 0 indica cancellazione
      }
    });
  }

  // Inizializza una nuova partita
  function initGame() {
    // Reset dello stato
    clearInterval(gameState.timerInterval);
    gameState.board = Array(9).fill().map(() => Array(9).fill(0));
    gameState.solution = Array(9).fill().map(() => Array(9).fill(0));
    gameState.fixedCells = Array(9).fill().map(() => Array(9).fill(false));
    gameState.notes = Array(9).fill().map(() => Array(9).fill().map(() => Array(9).fill(false)));
    gameState.selectedCell = null;
    gameState.notesMode = false;
    gameState.errorCount = 0;
    gameState.gameOver = false;
    gameState.timer = 0;
    gameState.gameStarted = false;
    
    // Aggiorna UI elementi
    timerElement.textContent = "0";
    errorsCountElement.textContent = "0";
    notesToggleButton.classList.remove("active");
    
    // Genera un nuovo puzzle di Sudoku
    generateSudoku();
    renderBoard();
  }

  // Genera una soluzione valida di Sudoku
  function generateSudoku() {
    // Genera una soluzione completa di Sudoku
    generateSolution();
    
    // Copia la soluzione nella tabella di gioco
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        gameState.board[row][col] = gameState.solution[row][col];
        gameState.fixedCells[row][col] = true;
      }
    }
    
    // Rimuovi numeri in base alla difficoltà
    const cellsToKeep = config[gameState.difficulty].cellsToReveal;
    const totalCells = 81;
    const cellsToRemove = totalCells - cellsToKeep;
    
    // Rimuovi casualmente le celle
    let removedCount = 0;
    while (removedCount < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (gameState.board[row][col] !== 0) {
        gameState.board[row][col] = 0;
        gameState.fixedCells[row][col] = false;
        removedCount++;
      }
    }
  }

  // Genera la soluzione del Sudoku usando l'algoritmo di backtracking
  function generateSolution() {
    // Inizializza la griglia della soluzione con zeri
    gameState.solution = Array(9).fill().map(() => Array(9).fill(0));
    
    // Riempi la griglia
    solveSudoku(gameState.solution);
  }

  // Risolve il Sudoku utilizzando l'algoritmo di backtracking
  function solveSudoku(board) {
    const emptyCell = findEmptyCell(board);
    
    // Se non ci sono celle vuote, il puzzle è risolto
    if (!emptyCell) {
      return true;
    }
    
    const [row, col] = emptyCell;
    
    // Usa un array di numeri mescolati per evitare schemi ripetitivi
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    // Prova ogni numero
    for (const num of numbers) {
      if (isValidPlacement(board, row, col, num)) {
        board[row][col] = num;
        
        // Chiamata ricorsiva
        if (solveSudoku(board)) {
          return true;
        }
        
        // Se arriviamo qui, questa soluzione non porta a una risposta valida
        board[row][col] = 0;
      }
    }
    
    // Backtrack se nessun numero funziona
    return false;
  }

  // Trova una cella vuota nella griglia
  function findEmptyCell(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          return [row, col];
        }
      }
    }
    return null;
  }

  // Verifica se un numero può essere posizionato in una determinata posizione
  function isValidPlacement(board, row, col, num) {
    // Controlla la riga
    for (let c = 0; c < 9; c++) {
      if (board[row][c] === num) {
        return false;
      }
    }
    
    // Controlla la colonna
    for (let r = 0; r < 9; r++) {
      if (board[r][col] === num) {
        return false;
      }
    }
    
    // Controlla il blocco 3x3
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[startRow + r][startCol + c] === num) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Funzione per mescolare un array
  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Renderizza la board del Sudoku
  function renderBoard() {
    // Svuota la board attuale
    boardElement.innerHTML = '';
    
    // Crea le celle del Sudoku
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = document.createElement('div');
        cell.className = 'sudoku-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        // Aggiungi il valore se presente
        if (gameState.board[row][col] !== 0) {
          cell.textContent = gameState.board[row][col];
          if (gameState.fixedCells[row][col]) {
            cell.classList.add('fixed');
          }
        } else {
          // Aggiungi le note se presenti
          const notesForCell = gameState.notes[row][col];
          if (notesForCell.some(note => note)) {
            const notesGrid = document.createElement('div');
            notesGrid.className = 'notes-grid';
            
            for (let num = 1; num <= 9; num++) {
              const note = document.createElement('div');
              note.className = 'note';
              if (notesForCell[num - 1]) {
                note.textContent = num;
              }
              notesGrid.appendChild(note);
            }
            
            cell.appendChild(notesGrid);
          }
        }
        
        // Event listener per selezionare una cella
        cell.addEventListener('click', function() {
          if (!gameState.gameStarted && !gameState.gameOver) {
            startGame();
          }
          
          if (!gameState.gameOver) {
            selectCell(row, col);
          }
        });
        
        boardElement.appendChild(cell);
      }
    }
    
    // Aggiusta dimensioni della board per adattarsi alla spaziatura dei quadranti
    // Questo assicura che la griglia mantenga la giusta proporzione nonostante le spaziature
    const cellWidth = document.querySelector('.sudoku-cell').offsetWidth;
    const cellHeight = document.querySelector('.sudoku-cell').offsetHeight;
    
    // Aggiustamento del layout in base al CSS
    boardElement.style.gridGap = `${getComputedStyle(document.documentElement).getPropertyValue('--grid-spacing')}`;
  }

  // Seleziona una cella
  function selectCell(row, col) {
    // Rimuovi la classe selected da tutte le celle
    document.querySelectorAll('.sudoku-cell').forEach(cell => {
      cell.classList.remove('selected');
    });
    
    // Se la cella non è fissa, selezionala
    if (!gameState.fixedCells[row][col]) {
      const cellElement = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
      cellElement.classList.add('selected');
      gameState.selectedCell = { row, col };
    } else {
      gameState.selectedCell = null;
    }
  }

  // Inserisce un numero nella cella selezionata
  function enterNumber(number) {
    if (!gameState.selectedCell) return;
    
    const { row, col } = gameState.selectedCell;
    const cell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
    
    if (gameState.notesMode && number !== 0) {
      // Modalità note
      gameState.notes[row][col][number - 1] = !gameState.notes[row][col][number - 1];
      renderBoard();
      selectCell(row, col);
    } else {
      // Modalità numero normale
      if (number === 0) {
        // Cancella la cella
        gameState.board[row][col] = 0;
        cell.textContent = '';
        // Cancella anche le note
        gameState.notes[row][col] = Array(9).fill(false);
        renderBoard();
        selectCell(row, col);
      } else {
        // Controlla se il numero è corretto
        if (gameState.solution[row][col] === number) {
          gameState.board[row][col] = number;
          cell.textContent = number;
          cell.classList.remove('error');
          
          // Rimuovi la griglia delle note se presente
          const notesGrid = cell.querySelector('.notes-grid');
          if (notesGrid) {
            cell.removeChild(notesGrid);
          }
          
          // Verifica vittoria
          checkWin();
        } else {
          // Numero errato, aumenta il contatore errori
          gameState.errorCount++;
          errorsCountElement.textContent = gameState.errorCount;
          cell.classList.add('error');
          
          // Timeout per rimuovere l'evidenziazione dell'errore
          setTimeout(() => {
            cell.classList.remove('error');
          }, 1000);
          
          // Controlla se il gioco è finito (troppe errori)
          if (gameState.errorCount >= 3) {
            gameOver(false);
          }
        }
      }
    }
  }

  // Fornisce un suggerimento
  function provideHint() {
    if (gameState.gameOver || !gameState.selectedCell) return;
    
    const { row, col } = gameState.selectedCell;
    
    // Se la cella è già compilata, non fare nulla
    if (gameState.board[row][col] !== 0) return;
    
    // Aggiungi la risposta corretta
    gameState.board[row][col] = gameState.solution[row][col];
    gameState.fixedCells[row][col] = true;
    
    // Mostra la cella con l'evidenziazione suggerimento
    const cell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
    cell.textContent = gameState.solution[row][col];
    cell.classList.add('hint');
    
    setTimeout(() => {
      cell.classList.remove('hint');
    }, 1500);
    
    // Pulisci la selezione dopo il suggerimento
    gameState.selectedCell = null;
    
    // Verifica vittoria
    checkWin();
  }

  // Verifica se il giocatore ha vinto
  function checkWin() {
    // Controlla se tutte le celle sono riempite correttamente
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (gameState.board[row][col] !== gameState.solution[row][col]) {
          return; // Non ha ancora vinto
        }
      }
    }
    
    // Se arriviamo qui, il giocatore ha vinto!
    gameOver(true);
  }

  // Gestione fine gioco
  function gameOver(isWin) {
    gameState.gameOver = true;
    clearInterval(gameState.timerInterval);
    
    // Crea overlay di fine gioco
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    
    const message = document.createElement('div');
    message.className = 'game-over-message';
    message.textContent = isWin ? 'Hai Vinto!' : 'Game Over';
    
    const subtitle = document.createElement('div');
    subtitle.className = 'game-over-subtitle';
    subtitle.textContent = isWin ? 
      `Tempo: ${gameState.timer} secondi - Errori: ${gameState.errorCount}/3` : 
      'Troppi errori! Riprova.';
    
    const newGameBtn = document.createElement('button');
    newGameBtn.className = 'game-over-button';
    newGameBtn.textContent = 'Nuova Partita';
    newGameBtn.addEventListener('click', function() {
      document.body.removeChild(overlay);
      initGame();
    });
    
    overlay.appendChild(message);
    overlay.appendChild(subtitle);
    overlay.appendChild(newGameBtn);
    
    document.body.appendChild(overlay);

    // Controlla se l'utente è loggato per salvare il punteggio
    if (isWin && typeof isUserLoggedIn === 'function' && isUserLoggedIn()) {
      saveScore(gameState.timer, gameState.errorCount, gameState.difficulty);
    }
  }

  // Avvia il timer di gioco
  function startGame() {
    if (!gameState.gameStarted) {
      gameState.gameStarted = true;
      gameState.timerInterval = setInterval(function() {
        gameState.timer++;
        timerElement.textContent = gameState.timer;
      }, 1000);
    }
  }

  // Salva il punteggio dell'utente
  function saveScore(time, errors, difficulty) {
    if (typeof saveUserScore === 'function') {
      const score = calculateScore(time, errors, difficulty);
      saveUserScore('sudoku', score, {
        time: time,
        errors: errors,
        difficulty: difficulty
      });
    }
  }

  // Calcola il punteggio in base a tempo, errori e difficoltà
  function calculateScore(time, errors, difficulty) {
    // Base score dipende dalla difficoltà
    let baseScore = 0;
    switch (difficulty) {
      case 'easy': baseScore = 1000; break;
      case 'medium': baseScore = 2000; break;
      case 'hard': baseScore = 3000; break;
    }
    
    // Sottrai punti per il tempo (più veloce = più punti)
    // Sottrai punti per gli errori
    const timeDeduction = Math.min(baseScore * 0.7, time * 2);
    const errorDeduction = errors * (baseScore * 0.1);
    
    // Calcola il punteggio finale
    const finalScore = Math.max(0, Math.floor(baseScore - timeDeduction - errorDeduction));
    
    return finalScore;
  }
});