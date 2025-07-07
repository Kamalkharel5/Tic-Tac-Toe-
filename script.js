let board, winnerText;
let cells;
let currentPlayer;
let gameOver;
let gameMode = 'pvp'; // default mode is player vs player

function startGame(mode) {
    gameMode = mode;
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    board = document.getElementById('board');
    winnerText = document.getElementById('winner');
    resetBoard();
}

function createBoard() {
    board.innerHTML = '';
    cells.forEach((cell, index) => {
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('cell');
        if (cell) {
            cellDiv.classList.add(cell.toLowerCase());
            cellDiv.textContent = cell;
        }
        cellDiv.addEventListener('click', () => makeMove(index));
        board.appendChild(cellDiv);
    });
}

function makeMove(index) {
    if (cells[index] || gameOver) return;

    cells[index] = currentPlayer;
    updateGame();

    if (!gameOver && gameMode !== 'pvp' && currentPlayer === "O") {
        setTimeout(aiMove, 500); // AI waits 0.5s before moving
    }
}

function updateGame() {
    if (checkWinner()) {
        winnerText.textContent = `${currentPlayer} wins!`;
        gameOver = true;
    } else if (cells.every(cell => cell)) {
        winnerText.textContent = "It's a draw!";
        gameOver = true;
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
    }
    createBoard();
}

function checkWinner() {
    const winningCombos = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    return winningCombos.some(combo =>
        combo.every(i => cells[i] === currentPlayer)
    );
}

function resetBoard() {
    cells = Array(9).fill(null);
    currentPlayer = "X";
    gameOver = false;
    winnerText.textContent = '';
    createBoard();
}

// Medium AI: tries to win, then block, else random
function aiMove() {
    if (gameMode === 'easy') {
        randomAIMove();
    } else if (gameMode === 'medium') {
        if (!tryWinningMove("O")) {
            if (!tryWinningMove("X")) {
                randomAIMove();
            }
        }
    } else if (gameMode === 'hard') {
        const bestMove = minimax(cells, "O").index;
        cells[bestMove] = "O";
        updateGame();
    }
}


// Tries to complete a winning move for 'symbol' (either "O" or "X")
// If successful, fills the winning spot for the AI and returns true
function tryWinningMove(symbol) {
    const winningCombos = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        const values = [cells[a], cells[b], cells[c]];

        // If two cells are the same symbol, and one is empty
        if (values.filter(v => v === symbol).length === 2 &&
            values.includes(null)) {
            const emptyIndex = combo[values.indexOf(null)];
            cells[emptyIndex] = "O"; // AI plays as O
            updateGame();
            return true;
        }
    }
    return false;
}

// Simple random move used by easy AI and fallback
function randomAIMove() {
    const emptyIndices = cells.map((v, i) => v === null ? i : null).filter(v => v !== null);
    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    cells[randomIndex] = "O";
    updateGame();
}


function backToModeSelect() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('mode-selection').style.display = 'flex';
}

function minimax(newBoard, player) {
    const emptyIndices = newBoard
        .map((val, index) => val === null ? index : null)
        .filter(v => v !== null);

    // Base cases
    if (checkStaticWinner(newBoard, "X")) return { score: -10 };
    if (checkStaticWinner(newBoard, "O")) return { score: 10 };
    if (emptyIndices.length === 0) return { score: 0 };

    const moves = [];

    for (let i = 0; i < emptyIndices.length; i++) {
        const move = {};
        move.index = emptyIndices[i];
        newBoard[emptyIndices[i]] = player;

        if (player === "O") {
            move.score = minimax(newBoard, "X").score;
        } else {
            move.score = minimax(newBoard, "O").score;
        }

        newBoard[emptyIndices[i]] = null;
        moves.push(move);
    }

    // Pick the best move
    let bestMove;
    if (player === "O") {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

// Checks winner for a given board (used in minimax only)
function checkStaticWinner(boardState, player) {
    const combos = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    return combos.some(combo =>
        combo.every(i => boardState[i] === player)
    );
}



