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
