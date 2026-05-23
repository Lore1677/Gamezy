document.addEventListener("DOMContentLoaded", () => {
  // Elementi DOM
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const restartButton = document.getElementById("restart-button");
  const gameOverlay = document.getElementById("game-result-overlay");
  const currentScoreValue = document.getElementById("current-score-value");
  const highScoreValue = document.getElementById("high-score-value");
  const finalScore = document.getElementById("final-score");
  const birdSprite = document.getElementById("bird-sprite");

  // Costanti di gioco
  const GRAVITY = 0.45;
  const FLAP_STRENGTH = -6;
  const PIPE_SPEED = 4;
  const PIPE_SPAWN_RATE = 60;
  const PIPE_GAP = 200;
  const GROUND_HEIGHT = 100;
  const BIRD_HITBOX_RADIUS = 20;

  // Stato di gioco
  let gameStarted = false;
  let gameOver = false;
  let gamePaused = false;
  let score = 0;
  let highScore = 0;
  let frameCount = 0;

  // Carica highscore dal localStorage
  if (localStorage.getItem("flappyHighScore")) {
    highScore = parseInt(localStorage.getItem("flappyHighScore"));
    highScoreValue.textContent = highScore;
  }

  const bird = {
    x: canvas.width / 3,
    y: canvas.height / 2,
    width: 60,
    height: 60,
    velocity: 0,
    rotation: 0,

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Rotazione basata sulla velocità
      this.rotation = Math.min(
        Math.PI / 6,
        Math.max(-Math.PI / 6, this.velocity * 0.1)
      );
      ctx.rotate(this.rotation);

      // Disegniamo l'immagine dell'uccellino
      ctx.drawImage(
        birdSprite,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );

      ctx.restore();
    },

    update() {
      if (gameStarted && !gameOver && !gamePaused) {
        this.velocity += GRAVITY;
        this.y += this.velocity;

        // Controlla collisione con il suolo
        if (this.y + BIRD_HITBOX_RADIUS > canvas.height - GROUND_HEIGHT) {
          this.y = canvas.height - GROUND_HEIGHT - BIRD_HITBOX_RADIUS;
          endGame();
        }

        // Controlla collisione con il tetto
        if (this.y - BIRD_HITBOX_RADIUS < 0) {
          this.y = BIRD_HITBOX_RADIUS;
          this.velocity = 0;
        }
      }
    },

    flap() {
      if (!gameOver && !gamePaused) {
        this.velocity = FLAP_STRENGTH;
      }
    },

    reset() {
      this.y = canvas.height / 2;
      this.velocity = 0;
      this.rotation = 0;
    },
  };

  // Array delle tubature
  let pipes = [];

  // Classe Pipe (Tubo)
  class Pipe {
    constructor() {
      this.x = canvas.width;
      this.width = 65;
      this.passed = false;

      // Posiziona casualmente l'apertura
      const minHeight = 60;
      const maxHeight = canvas.height - GROUND_HEIGHT - PIPE_GAP - minHeight;
      this.topHeight =
        Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
      this.bottomY = this.topHeight + PIPE_GAP;
    }

    draw() {
      const pipeColor = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--pipe-color");

      // Tubo superiore
      ctx.fillStyle = pipeColor;
      ctx.fillRect(this.x, 0, this.width, this.topHeight);

      // Bordino del tubo superiore
      ctx.fillStyle = "#388E3C";
      ctx.fillRect(this.x - 3, this.topHeight - 15, this.width + 6, 15);

      // Tubo inferiore
      ctx.fillStyle = pipeColor;
      ctx.fillRect(
        this.x,
        this.bottomY,
        this.width,
        canvas.height - this.bottomY - GROUND_HEIGHT
      );

      // Bordino del tubo inferiore
      ctx.fillStyle = "#388E3C";
      ctx.fillRect(this.x - 3, this.bottomY, this.width + 6, 15);
    }

    update() {
      if (!gamePaused) {
        this.x -= PIPE_SPEED;

        // Controlla se l'uccellino ha superato il tubo
        if (!this.passed && this.x + this.width < bird.x) {
          this.passed = true;
          score++;
          currentScoreValue.textContent = score;
        }

        // Controlla collisione con l'uccellino
        if (this.checkBirdCollision()) {
          endGame();
        }
      }
    }

    checkBirdCollision() {
      // Calcolo della distanza minima tra cerchio e rettangolo

      // Controllo collisione con tubo superiore
      if (
        this.checkCircleRectCollision(
          bird.x,
          bird.y,
          BIRD_HITBOX_RADIUS,
          this.x,
          0,
          this.width,
          this.topHeight
        )
      ) {
        return true;
      }

      // Controllo collisione con tubo inferiore
      if (
        this.checkCircleRectCollision(
          bird.x,
          bird.y,
          BIRD_HITBOX_RADIUS,
          this.x,
          this.bottomY,
          this.width,
          canvas.height - this.bottomY - GROUND_HEIGHT
        )
      ) {
        return true;
      }

      return false;
    }

    checkCircleRectCollision(
      circleX,
      circleY,
      radius,
      rectX,
      rectY,
      rectWidth,
      rectHeight
    ) {
      // Trova il punto più vicino del rettangolo al centro del cerchio
      const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
      const closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));

      // Calcola la distanza tra il centro del cerchio e il punto più vicino
      const distanceX = circleX - closestX;
      const distanceY = circleY - closestY;

      // Se la distanza è minore del raggio, c'è collisione
      return distanceX * distanceX + distanceY * distanceY < radius * radius;
    }
  }

  // Funzione principale di disegno
  function draw() {
    // Pulisci il canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Disegna lo sfondo
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
      "--canvas-bg"
    );
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Disegna i tubi
    pipes.forEach((pipe) => pipe.draw());

    // Disegna il terreno
    drawGround();

    // Disegna l'uccellino
    bird.draw();

    // Disegna il punteggio sul canvas
    ctx.fillStyle = "#FFF";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    if (!gameStarted) {
      ctx.fillText(
        "Premi o clicca spazio",
        canvas.width / 2,
        canvas.height / 2 - 60
      );
      ctx.fillText("per iniziare ▶️", canvas.width / 2, canvas.height / 2 - 20);
    } else if (gamePaused) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#FFF";
      ctx.fillText("PAUSA ⏸️", canvas.width / 2, canvas.height / 2);
      ctx.font = "24px Arial";
      ctx.fillText(
        "Premi 'P' per continuare",
        canvas.width / 2,
        canvas.height / 2 + 40
      );
    }
  }

  // Funzione di aggiornamento
  function update() {
    if (gameStarted && !gameOver && !gamePaused) {
      frameCount++;

      // Aggiorna l'uccellino
      bird.update();

      // Aggiorna i tubi
      pipes.forEach((pipe, index) => {
        pipe.update();

        // Rimuovi i tubi che escono dallo schermo
        if (pipe.x + pipe.width < 0) {
          pipes.splice(index, 1);
        }
      });

      // Aggiungi nuovi tubi
      if (frameCount % PIPE_SPAWN_RATE === 0) {
        pipes.push(new Pipe());
      }
    }
  }

  // Disegna il terreno
  function drawGround() {
    const groundColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--ground-color");

    ctx.fillStyle = groundColor;
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);

    // Disegna l'erba
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, 7);
  }

  // Funzione per gestire la pausa
  function togglePause() {
    if (!gameStarted || gameOver) return;

    gamePaused = !gamePaused;

    if (gamePaused) {
      showPauseScreen();
    } else {
      hidePauseScreen();
    }
  }

  // Funzione game over
  function endGame() {
    gameOver = true;

    // Aggiorna highscore se necessario
    if (score > highScore) {
      highScore = score;
      highScoreValue.textContent = highScore;
      localStorage.setItem("flappyHighScore", highScore);
    }

    // Mostra l'overlay di game over
    finalScore.textContent = score;
    gameOverlay.style.display = "flex";
  }

  // Funzione reset
  function resetGame() {
    gameStarted = false;
    gameOver = false;
    gamePaused = false;
    score = 0;
    frameCount = 0;
    pipes = [];
    bird.reset();

    currentScoreValue.textContent = "0";
    gameOverlay.style.display = "none";
  }

  // Loop principale di gioco
  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  // Inizia il loop di gioco
  gameLoop();

  // Event listener per tutti i tasti
  document.addEventListener("keydown", (e) => {
    // Gestione tasto spazio per il salto
    if (e.code === "Space") {
      if (!gameStarted) {
        gameStarted = true;
      }
      if (!gamePaused && !gameOver) {
        bird.flap();
      }
    }

    // Gestione tasto P per la pausa (come in Tetris)
    if (e.key === "p" || e.key === "P") {
      togglePause();
    }
  });

  // Event listener per il click sul canvas (solo per il flap)
  canvas.addEventListener("click", () => {
    if (!gameStarted) {
      gameStarted = true;
    }
    if (!gamePaused && !gameOver) {
      bird.flap();
    }
  });

  // Event listener per il pulsante di restart
  restartButton.addEventListener("click", resetGame);
});
