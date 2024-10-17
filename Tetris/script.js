const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const restartButton = document.getElementById("restart-button");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
let score = 0;
let gameOver = false;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// Tetromino shapes
const TETROMINOS = [
    // I
    [[1, 1, 1, 1]],
    // O
    [[1, 1],
     [1, 1]],
    // T
    [[0, 1, 0],
     [1, 1, 1]],
    // S
    [[0, 1, 1],
     [1, 1, 0]],
    // Z
    [[1, 1, 0],
     [0, 1, 1]],
    // J
    [[1, 0, 0],
     [1, 1, 1]],
    // L
    [[0, 0, 1],
     [1, 1, 1]],
];

// Game state
let board = createBoard(ROWS, COLS);
let tetromino = createTetromino();
let posX = 3;
let posY = 0;

// Game loop
function gameLoop() {
    if (!gameOver) {
        moveDown();
        draw();
        setTimeout(gameLoop, 500);
    }
}

function createBoard(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function createTetromino() {
    const randomIndex = Math.floor(Math.random() * TETROMINOS.length);
    return TETROMINOS[randomIndex];
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawTetromino();
}

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                ctx.fillStyle = 'lightred';
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function drawTetromino() {
    tetromino.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                ctx.fillStyle = 'red'; // Light brown color
                ctx.fillRect((posX + x) * BLOCK_SIZE, (posY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect((posX + x) * BLOCK_SIZE, (posY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function moveDown() {
    if (!collision(0, 1)) {
        posY++;
    } else {
        mergeTetromino();
        tetromino = createTetromino();
        posX = 3;
        posY = 0;
        if (collision(0, 0)) {
            endGame();
        }
    }
}

function mergeTetromino() {
    tetromino.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                board[posY + y][posX + x] = 1;
            }
        });
    });
    clearLines();
}

function collision(offsetX, offsetY) {
    return tetromino.some((row, y) => {
        return row.some((cell, x) => {
            if (cell) {
                const newX = posX + x + offsetX;
                const newY = posY + y + offsetY;
                return (
                    newX < 0 ||
                    newX >= COLS ||
                    newY >= ROWS ||
                    board[newY] && board[newY][newX]
                );
            }
            return false;
        });
    });
}

function clearLines() {
    board = board.filter(row => row.some(cell => !cell));
    const clearedLines = ROWS - board.length;
    score += clearedLines;
    scoreElement.textContent = score;
    while (board.length < ROWS) {
        board.unshift(Array(COLS).fill(0));
    }
}

function endGame() {
    gameOver = true;
    restartButton.style.display = "block";
}

restartButton.addEventListener("click", () => {
    board = createBoard(ROWS, COLS);
    tetromino = createTetromino();
    posX = 3;
    posY = 0;
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    restartButton.style.display = "none";
    gameLoop();
});

// Aggiungiamo l'evento keydown per i controlli
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    if (!gameOver) {
        switch (event.key) {
            case 'ArrowLeft':
                if (!collision(-1, 0)) {
                    posX--;
                    draw();
                }
                break;
            case 'ArrowRight':
                if (!collision(1, 0)) {
                    posX++;
                    draw();
                }
                break;
            case 'ArrowDown':
                if (!collision(0, 1)) {
                    posY++;
                    draw();
                }
                break;
            case 'ArrowUp':
                rotateTetromino();
                draw();
                break;
        }
    }
}

// Funzione per ruotare il tetromino
function rotateTetromino() {
    const prevTetromino = tetromino.map(row => [...row]);
    
    // Trasponi e poi inverti le righe per ruotare in senso orario
    tetromino = tetromino[0].map((_, index) =>
        tetromino.map(row => row[index]).reverse()
    );
    
    // Se c'è una collisione dopo la rotazione, torna alla forma precedente
    if (collision(0, 0)) {
        tetromino = prevTetromino;
    }
}

// Inizio del gioco
gameLoop();
