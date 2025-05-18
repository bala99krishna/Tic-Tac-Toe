const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const timeDisplay = document.getElementById("time");
const gameContainer = document.getElementById("gameContainer");
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = false;
let playerXName = "Player X";
let playerOName = "Player O";
let score = { X: 0, O: 0 };
let timer;
let timeLeft = 10;
let isAI = false;

const winningCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function startGame() {
  playerXName = document.getElementById("playerX").value || "Player X";
  playerOName = document.getElementById("playerO").value || "Player O";
  isAI = playerOName.toLowerCase() === "ai";

  gameContainer.classList.remove("hidden");
  document.getElementById("setup").classList.add("hidden");

  resetBoard();
  updateScores();
}

function updateScores() {
  document.getElementById("scoreX").textContent = `${playerXName} (${score.X})`;
  document.getElementById("scoreO").textContent = `${playerOName} (${score.O})`;
}

function resetBoard() {
  board = ["", "", "", "", "", "", "", "", ""];
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("disabled");
  });
  gameActive = true;
  currentPlayer = "X";
  statusText.textContent = `${playerXName}'s Turn (X)`;
  startTimer();
  if (isAI && currentPlayer === "O") aiMove();
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || board[index] || (isAI && currentPlayer === "O")) return;

  makeMove(index, currentPlayer);
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add("disabled");

  if (checkWin(player)) {
    statusText.textContent = `${player === "X" ? playerXName : playerOName} Wins!`;
    score[player]++;
    updateScores();
    gameActive = false;
    stopTimer();
    return;
  }

  if (board.every(cell => cell)) {
    statusText.textContent = "It's a Draw!";
    gameActive = false;
    stopTimer();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `${currentPlayer === "X" ? playerXName : playerOName}'s Turn (${currentPlayer})`;

  resetTimer();
  if (isAI && currentPlayer === "O") aiMove();
}

function checkWin(player) {
  return winningCombos.some(combo => 
    combo.every(index => board[index] === player)
  );
}

function resetTimer() {
  stopTimer();
  startTimer();
}

function startTimer() {
  timeLeft = 10;
  timeDisplay.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      statusText.textContent = `${currentPlayer === "X" ? playerXName : playerOName} ran out of time!`;
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      if (isAI && currentPlayer === "O") aiMove();
      resetTimer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function aiMove() {
  const best = minimax(board, "O");
  makeMove(best.index, "O");
}

function minimax(newBoard, player) {
  const availSpots = newBoard.map((val, i) => val === "" ? i : null).filter(v => v !== null);

  if (checkWin("X")) return { score: -10 };
  if (checkWin("O")) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    const result = minimax(newBoard, player === "O" ? "X" : "O");
    move.score = result.score;

    newBoard[availSpots[i]] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    moves.forEach((m, i) => {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = i;
      }
    });
  } else {
    let bestScore = Infinity;
    moves.forEach((m, i) => {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = i;
      }
    });
  }

  return moves[bestMove];
}

cells.forEach(cell => cell.addEventListener("click", handleClick));
