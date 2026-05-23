const canvas = document.getElementById("pong");
const context = canvas.getContext("2d");

// Configurazione del gioco
const config = {
  paddleWidth: 10,
  paddleHeight: 100,
  ballSize: 10,
  paddle1Color: "blue",
  paddle2Color: "red",
  ballColor: "#fff",
  bgColor: "#000",
  paddleSpeed: 5,
  initialBallSpeedX: 5,
  initialBallSpeedY: 3,
  fps: 60,
};

// Stato del gioco
const game = {
  ball: {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speedX: config.initialBallSpeedX,
    speedY: config.initialBallSpeedY,
  },
  paddle1: {
    x: 0,
    y: canvas.height / 2 - config.paddleHeight / 2,
    width: config.paddleWidth,
    height: config.paddleHeight,
    speed: 0,
    color: config.paddle1Color,
  },
  paddle2: {
    x: canvas.width - config.paddleWidth,
    y: canvas.height / 2 - config.paddleHeight / 2,
    width: config.paddleWidth,
    height: config.paddleHeight,
    speed: 0,
    color: config.paddle2Color,
  },
  score1: 0,
  score2: 0,
};

// Disegna linea centrale
function drawCenterLine() {
  context.strokeStyle = "#fff";
  context.setLineDash([5, 15]);
  context.beginPath();
  context.moveTo(canvas.width / 2, 0);
  context.lineTo(canvas.width / 2, canvas.height);
  context.stroke();
  context.setLineDash([]);
}

function draw() {
  // Background
  context.fillStyle = config.bgColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawCenterLine();

  // Ball
  context.fillStyle = config.ballColor;
  context.fillRect(game.ball.x, game.ball.y, config.ballSize, config.ballSize);

  // Paddle 1
  context.fillStyle = game.paddle1.color;
  context.fillRect(
    game.paddle1.x,
    game.paddle1.y,
    game.paddle1.width,
    game.paddle1.height
  );

  // Paddle 2
  context.fillStyle = game.paddle2.color;
  context.fillRect(
    game.paddle2.x,
    game.paddle2.y,
    game.paddle2.width,
    game.paddle2.height
  );

  updateGame();
}

function updateGame() {
  // Posizione palla
  game.ball.x += game.ball.speedX;
  game.ball.y += game.ball.speedY;

  // Collisione con bordi superiore/inferiore
  if (game.ball.y <= 0 || game.ball.y + config.ballSize >= canvas.height) {
    game.ball.speedY = -game.ball.speedY;
  }

  // Collisione con Paddle 1
  if (
    game.ball.x <= game.paddle1.x + config.paddleWidth &&
    game.ball.y + config.ballSize >= game.paddle1.y &&
    game.ball.y <= game.paddle1.y + config.paddleHeight
  ) {
    game.ball.speedX = -game.ball.speedX;
  }

  // Collisione con Paddle 2
  if (
    game.ball.x + config.ballSize >= game.paddle2.x &&
    game.ball.y + config.ballSize >= game.paddle2.y &&
    game.ball.y <= game.paddle2.y + config.paddleHeight
  ) {
    game.ball.speedX = -game.ball.speedX;
  }

  // Reset palla e punteggio
  if (game.ball.x <= 0) {
    game.score2++;
    resetBall();
  } else if (game.ball.x + config.ballSize >= canvas.width) {
    game.score1++;
    resetBall();
  }

  // Aggiorna punteggio
  document.getElementById("score1").textContent = game.score1;
  document.getElementById("score2").textContent = game.score2;

  // Aggiorna posizione paddle
  game.paddle1.y += game.paddle1.speed;
  game.paddle2.y += game.paddle2.speed;

  // Limita movimento paddle
  if (game.paddle1.y < 0) game.paddle1.y = 0;
  if (game.paddle1.y + config.paddleHeight > canvas.height)
    game.paddle1.y = canvas.height - config.paddleHeight;
  if (game.paddle2.y < 0) game.paddle2.y = 0;
  if (game.paddle2.y + config.paddleHeight > canvas.height)
    game.paddle2.y = canvas.height - config.paddleHeight;
}

// Reset palla
function resetBall() {
  game.ball.x = canvas.width / 2;
  game.ball.y = canvas.height / 2;
  game.ball.speedX = -game.ball.speedX;
  game.ball.speedY =
    Math.random() > 0.5 ? config.initialBallSpeedY : -config.initialBallSpeedY;
}

// Controlli da tastiera
document.addEventListener("keydown", (event) => {
  if (event.key === "w" || event.key === "W")
    game.paddle1.speed = -config.paddleSpeed;
  if (event.key === "s" || event.key === "S")
    game.paddle1.speed = config.paddleSpeed;
  if (event.key === "ArrowUp") game.paddle2.speed = -config.paddleSpeed;
  if (event.key === "ArrowDown") game.paddle2.speed = config.paddleSpeed;
});

document.addEventListener("keyup", (event) => {
  if (
    event.key === "w" ||
    event.key === "s" ||
    event.key === "W" ||
    event.key === "S"
  )
    game.paddle1.speed = 0;
  if (event.key === "ArrowUp" || event.key === "ArrowDown")
    game.paddle2.speed = 0;
});

// Reset punteggio
document.getElementById("reset").addEventListener("click", () => {
  game.score1 = 0;
  game.score2 = 0;
  resetBall();
});

// Game loop
setInterval(draw, 1000 / config.fps);
