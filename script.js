const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const gridEl = document.getElementById('ttt-grid');
const statusEl = document.getElementById('ttt-status');
const resetBtn = document.getElementById('ttt-reset');
const focusBtn = document.getElementById('ttt-focus');
const ctaBtn = document.getElementById('ttt-cta');

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let board = Array(9).fill(null);
let currentPlayer = 'X';
let isGameOver = false;

function updateStatus(message) {
  if (statusEl) {
    statusEl.textContent = message;
  }
}

function checkWinner() {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

function handleMove(index, cell) {
  if (isGameOver || board[index]) {
    return;
  }

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add('filled');

  const result = checkWinner();
  if (result) {
    isGameOver = true;
    result.line.forEach((i) => {
      const winCell = gridEl.querySelector(`[data-index="${i}"]`);
      if (winCell) {
        winCell.classList.add('win');
      }
    });
    updateStatus(`Player ${result.winner} wins!`);
    return;
  }

  if (board.every(Boolean)) {
    isGameOver = true;
    updateStatus("It's a draw. Try again?");
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus(`Player ${currentPlayer}, your move.`);
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  isGameOver = false;
  updateStatus('Player X, your move.');

  if (!gridEl) {
    return;
  }

  gridEl.querySelectorAll('.ttt-cell').forEach((cell) => {
    cell.textContent = '';
    cell.classList.remove('filled', 'win');
  });
}

if (gridEl) {
  gridEl.addEventListener('click', (event) => {
    const cell = event.target.closest('.ttt-cell');
    if (!cell) {
      return;
    }
    const index = Number(cell.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    handleMove(index, cell);
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', resetGame);
}

function focusBoard() {
  const firstCell = gridEl ? gridEl.querySelector('.ttt-cell') : null;
  if (gridEl) {
    gridEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  if (firstCell) {
    firstCell.focus({ preventScroll: true });
  }
}

if (focusBtn) {
  focusBtn.addEventListener('click', focusBoard);
}

if (ctaBtn) {
  ctaBtn.addEventListener('click', focusBoard);
}

const snakeBoard = document.getElementById('snake-board');
const snakeStatus = document.getElementById('snake-status');
const snakePauseBtn = document.getElementById('snake-pause');
const snakeResetBtn = document.getElementById('snake-reset');
const snakeControls = document.getElementById('snake-controls');
const snakeFocusBtn = document.getElementById('snake-focus');

const SNAKE_GRID_SIZE = 20;
const SNAKE_TICK_MS = 140;
const SNAKE_DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

let snakeState = null;
let snakeCells = [];
let snakeTimer = null;

function isOppositeDirection(a, b) {
  return a && b && a.x + b.x === 0 && a.y + b.y === 0;
}

function getInitialSnakeState(size, rng) {
  const startX = Math.floor(size / 2);
  const startY = Math.floor(size / 2);
  const snake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY }
  ];
  const direction = { x: 1, y: 0 };
  const food = placeSnakeFood(snake, size, rng);

  return {
    size,
    snake,
    direction,
    nextDirection: direction,
    food,
    score: 0,
    isPaused: false,
    isGameOver: false,
    isWon: false
  };
}

function placeSnakeFood(snake, size, rng) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const available = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        available.push({ x, y });
      }
    }
  }
  if (available.length === 0) {
    return null;
  }
  const choiceIndex = Math.floor(rng() * available.length);
  return available[choiceIndex];
}

function stepSnakeState(state, rng) {
  if (state.isPaused || state.isGameOver) {
    return state;
  }

  const direction = state.nextDirection;
  const head = state.snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };

  const outOfBounds =
    newHead.x < 0 ||
    newHead.x >= state.size ||
    newHead.y < 0 ||
    newHead.y >= state.size;
  const hitSelf = state.snake.some(
    (segment) => segment.x === newHead.x && segment.y === newHead.y
  );

  if (outOfBounds || hitSelf) {
    return { ...state, isGameOver: true };
  }

  const ateFood =
    state.food && newHead.x === state.food.x && newHead.y === state.food.y;
  const newSnake = [newHead, ...state.snake];
  if (!ateFood) {
    newSnake.pop();
  }

  let newFood = state.food;
  let newScore = state.score;
  let isWon = state.isWon;

  if (ateFood) {
    newScore += 1;
    newFood = placeSnakeFood(newSnake, state.size, rng);
    if (!newFood) {
      isWon = true;
    }
  }

  return {
    ...state,
    snake: newSnake,
    direction,
    nextDirection: direction,
    food: newFood,
    score: newScore,
    isGameOver: isWon,
    isWon
  };
}

function setSnakeDirection(state, nextDirection) {
  if (!nextDirection || isOppositeDirection(state.direction, nextDirection)) {
    return state;
  }
  return { ...state, nextDirection };
}

function updateSnakeStatus(state) {
  if (!snakeStatus) {
    return;
  }
  if (state.isGameOver) {
    if (state.isWon) {
      snakeStatus.textContent = `You win! Score ${state.score}.`;
    } else {
      snakeStatus.textContent = `Game over. Score ${state.score}.`;
    }
    return;
  }
  if (state.isPaused) {
    snakeStatus.textContent = `Paused • Score ${state.score}`;
    return;
  }
  snakeStatus.textContent = `Score ${state.score} • Running`;
}

function renderSnake(state) {
  if (!snakeBoard || snakeCells.length === 0) {
    return;
  }

  snakeCells.forEach((cell) => {
    cell.classList.remove('snake', 'head', 'food');
  });

  state.snake.forEach((segment, index) => {
    const cellIndex = segment.y * state.size + segment.x;
    const cell = snakeCells[cellIndex];
    if (cell) {
      cell.classList.add('snake');
      if (index === 0) {
        cell.classList.add('head');
      }
    }
  });

  if (state.food) {
    const foodIndex = state.food.y * state.size + state.food.x;
    const foodCell = snakeCells[foodIndex];
    if (foodCell) {
      foodCell.classList.add('food');
    }
  }

  updateSnakeStatus(state);
  if (snakePauseBtn) {
    snakePauseBtn.textContent = state.isPaused ? 'Resume' : 'Pause';
  }
}

function startSnakeLoop() {
  if (snakeTimer) {
    clearInterval(snakeTimer);
  }
  snakeTimer = setInterval(() => {
    snakeState = stepSnakeState(snakeState, Math.random);
    renderSnake(snakeState);
  }, SNAKE_TICK_MS);
}

function resetSnake() {
  snakeState = getInitialSnakeState(SNAKE_GRID_SIZE, Math.random);
  renderSnake(snakeState);
}

function toggleSnakePause() {
  if (!snakeState || snakeState.isGameOver) {
    return;
  }
  snakeState = { ...snakeState, isPaused: !snakeState.isPaused };
  renderSnake(snakeState);
}

function handleSnakeDirection(directionKey) {
  if (!snakeState || snakeState.isGameOver) {
    return;
  }
  const nextDirection = SNAKE_DIRECTIONS[directionKey];
  if (!nextDirection) {
    return;
  }
  snakeState = setSnakeDirection(snakeState, nextDirection);
}

function focusSnakeBoard() {
  if (snakeBoard) {
    snakeBoard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    snakeBoard.focus({ preventScroll: true });
  }
}

function initSnakeGame() {
  if (!snakeBoard) {
    return;
  }

  snakeBoard.style.setProperty('--snake-size', String(SNAKE_GRID_SIZE));
  snakeBoard.setAttribute('tabindex', '0');
  snakeBoard.setAttribute('aria-live', 'polite');
  snakeBoard.innerHTML = '';
  snakeCells = [];

  const cellCount = SNAKE_GRID_SIZE * SNAKE_GRID_SIZE;
  for (let i = 0; i < cellCount; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'snake-cell';
    cell.setAttribute('role', 'gridcell');
    snakeBoard.appendChild(cell);
    snakeCells.push(cell);
  }

  snakeState = getInitialSnakeState(SNAKE_GRID_SIZE, Math.random);
  renderSnake(snakeState);
  startSnakeLoop();
}

if (snakePauseBtn) {
  snakePauseBtn.addEventListener('click', toggleSnakePause);
}

if (snakeResetBtn) {
  snakeResetBtn.addEventListener('click', resetSnake);
}

if (snakeControls) {
  snakeControls.addEventListener('click', (event) => {
    const button = event.target.closest('.snake-control');
    if (!button) {
      return;
    }
    const direction = button.dataset.direction;
    handleSnakeDirection(direction);
  });
}

if (snakeFocusBtn) {
  snakeFocusBtn.addEventListener('click', focusSnakeBoard);
}

document.addEventListener('keydown', (event) => {
  if (!snakeBoard) {
    return;
  }
  const key = event.key.toLowerCase();
  if (
    key === 'arrowup' ||
    key === 'arrowdown' ||
    key === 'arrowleft' ||
    key === 'arrowright' ||
    key === 'w' ||
    key === 'a' ||
    key === 's' ||
    key === 'd' ||
    key === ' ' ||
    key === 'r'
  ) {
    event.preventDefault();
  }

  if (key === 'arrowup' || key === 'w') {
    handleSnakeDirection('up');
  } else if (key === 'arrowdown' || key === 's') {
    handleSnakeDirection('down');
  } else if (key === 'arrowleft' || key === 'a') {
    handleSnakeDirection('left');
  } else if (key === 'arrowright' || key === 'd') {
    handleSnakeDirection('right');
  } else if (key === ' ') {
    toggleSnakePause();
  } else if (key === 'r') {
    resetSnake();
  }
});

initSnakeGame();
