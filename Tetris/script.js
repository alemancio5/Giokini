const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
canvas.focus();
const scoreElement = document.getElementById("score");
const restartButton = document.getElementById("restart");
const down = document.getElementById("down");
const left = document.getElementById("left");
const right = document.getElementById("right");
const rotate = document.getElementById("rotate");
const controls = document.getElementById("controls");

const COLS = 10;
const ROWS = 15;
const BLOCK_SIZE = 30;
let score = 0;
let gameOver = false;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

const TETROMINOS = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
];

let board = createBoard(ROWS, COLS);
let tetromino = createTetromino();
let posX = 3;
let posY = 0;

document.addEventListener('keydown', handleKeyPress);

function gameLoop() {
    if (!gameOver) {
        moveDown();
        draw();
        setTimeout(gameLoop, 1300);
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
                drawRoundedRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 'lightred');
            }
        });
    });
}

function drawTetromino() {
    tetromino.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                drawRoundedRect((posX + x) * BLOCK_SIZE, (posY + y) * BLOCK_SIZE, 'red');
            }
        });
    });
}

function drawRoundedRect(x, y, color) {
    const padding = 2;
    const size = BLOCK_SIZE - 2 * padding;

    ctx.fillStyle = color;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x + padding + 8, y + padding);
    ctx.lineTo(x + padding + size - 8, y + padding);
    ctx.quadraticCurveTo(x + padding + size, y + padding, x + padding + size, y + padding + 8);
    ctx.lineTo(x + padding + size, y + padding + size - 8);
    ctx.quadraticCurveTo(x + padding + size, y + padding + size, x + padding + size - 8, y + padding + size);
    ctx.lineTo(x + padding + 8, y + padding + size);
    ctx.quadraticCurveTo(x + padding, y + padding + size, x + padding, y + padding + size - 8);
    ctx.lineTo(x + padding, y + padding + 8);
    ctx.quadraticCurveTo(x + padding, y + padding, x + padding + 8, y + padding);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
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
    controls.style.display = "none";
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
    controls.style.display = "block";
    gameLoop();
});

function handleMouseClick(event) {
    const canvasRect = canvas.getBoundingClientRect();
    const clickX = event.clientX - canvasRect.left;
    const canvasThird = canvas.width / 3;
    
    if (clickX < canvasThird) {
        if (!collision(-1, 0)) {
            posX--;
            draw();
        }
    } else if (clickX > canvasThird * 2) {
        if (!collision(1, 0)) {
            posX++;
            draw();
        }
    } else {
        rotateTetromino();
        draw();
    }
}

document.getElementById('right').addEventListener('click', () => {
    if (!collision(1, 0)) {
        posX++;
        draw();
    }
});

document.getElementById('left').addEventListener('click', () => {
    if (!collision(-1, 0)) {
        posX--;
        draw();
    }
});

document.getElementById('rotate').addEventListener('click', () => {
    rotateTetromino();
    draw();
});

document.getElementById('down').addEventListener('click', () => {
    if (!collision(0, 1)) {
        posY++;
        draw();
    }
});

function handleKeyPress(event) {
    if (!gameOver) {
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
            case 'D':
                if (!collision(-1, 0)) {
                    posX--;
                    draw();
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (!collision(1, 0)) {
                    posX++;
                    draw();
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (!collision(0, 1)) {
                    posY++;
                    draw();
                }
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                rotateTetromino();
                draw();
                break;
        }
    }
}

function rotateTetromino() {
    const prevTetromino = tetromino.map(row => [...row]);
    tetromino = tetromino[0].map((_, index) =>
        tetromino.map(row => row[index]).reverse()
    );
    if (collision(0, 0)) {
        tetromino = prevTetromino;
    }
}

gameLoop();