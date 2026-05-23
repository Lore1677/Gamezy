// Variabili per il punteggio
let score = 0;
let highScore = localStorage.getItem("bananaHighScore") || 0;
const achievementLevels = [10, 25, 50, 100, 200, 500];
let unlockedRewards = (localStorage.getItem("unlockedRewards") || "")
  .split(",")
  .map(Number)
  .filter(Boolean);

// Effetti sonori
let achievementSound = null;
let clickSound = null;

// Elementi DOM
let elements = {};

// Aggiorna il punteggio massimo
function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("bananaHighScore", highScore);
    elements.highScoreDisplay.textContent = highScore;
  }
}

// Posiziona la banana in una posizione casuale
function positionBanana() {
  const gameAreaRect = elements.gameArea.getBoundingClientRect();
  const bananaRect = elements.banana.getBoundingClientRect();

  const maxX = gameAreaRect.width - bananaRect.width;
  const maxY = gameAreaRect.height - bananaRect.height;

  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  elements.banana.style.left = `${x}px`;
  elements.banana.style.top = `${y}px`;
}

// Controlla se è stato raggiunto un traguardo
function checkAchievements() {
  for (const level of achievementLevels) {
    if (score >= level && !unlockedRewards.includes(level)) {
      unlockAchievement(level);
    }
  }
}

// Sblocca un traguardo
function unlockAchievement(level) {
  unlockedRewards.push(level);
  localStorage.setItem("unlockedRewards", unlockedRewards.join(","));

  // Mostra popup di traguardo
  elements.achievementDescription.textContent = `Hai raggiunto ${level} click!`;
  elements.achievementPopup.classList.add("show");

  // Suono di traguardo
  playAchievementSound();

  // Rimuove il popup dopo 2 secondi
  setTimeout(() => {
    elements.achievementPopup.classList.remove("show");
  }, 2000);

  // Segna il traguardo come sbloccato
  document.querySelector(`.reward-${level}`).classList.add("unlocked");
}

// Suono per il traguardo
function playAchievementSound() {
  if (achievementSound) {
    achievementSound.currentTime = 0;
    achievementSound
      .play()
      .catch((error) => console.log("Errore nel suono:", error));
  }
}

// Suono per il click
function playClickSound() {
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound
      .play()
      .catch((error) => console.log("Errore nel suono di click:", error));
  }
}

// Quando si clicca sulla banana
function handleBananaClick() {
  score++;
  elements.scoreDisplay.textContent = score;

  updateHighScore();
  checkAchievements();

  playClickSound();
  positionBanana();
}

// Resetta il gioco
function resetGame() {
  score = 0;
  elements.scoreDisplay.textContent = score;
  unlockedRewards = [];
  localStorage.setItem("unlockedRewards", "");

  // Resetta i traguardi
  achievementLevels.forEach((level) => {
    document.querySelector(`.reward-${level}`).classList.remove("unlocked");
  });

  positionBanana();
}

// Carica gli effetti sonori
function loadSounds() {
  achievementSound = new Audio("../../sounds/achievement.mp3");
  achievementSound.volume = 0.7;
  achievementSound.load();

  clickSound = new Audio("../../sounds/collect.mp3");
  clickSound.volume = 0.2;
  clickSound.load();
}

// Inizializza il gioco
window.addEventListener("load", () => {
  // Riferimenti agli elementi HTML
  elements = {
    banana: document.getElementById("banana"),
    scoreDisplay: document.getElementById("score"),
    resetButton: document.getElementById("reset-button"),
    gameArea: document.querySelector(".game-area"),
    highScoreDisplay: document.getElementById("high-score"),
    achievementPopup: document.querySelector(".achievement-popup"),
    achievementDescription: document.getElementById("achievement-description"),
  };

  // Mostra il punteggio massimo
  elements.highScoreDisplay.textContent = highScore;

  // Carica i suoni
  loadSounds();

  // Eventi
  elements.banana.addEventListener("click", handleBananaClick);
  elements.resetButton.addEventListener("click", resetGame);

  // Mostra i traguardi già sbloccati
  achievementLevels.forEach((level) => {
    if (unlockedRewards.includes(level)) {
      document.querySelector(`.reward-${level}`).classList.add("unlocked");
    }
  });

  // Posiziona la banana iniziale
  positionBanana();
});

// Riposiziona la banana se la finestra cambia dimensione
window.addEventListener("resize", positionBanana);
