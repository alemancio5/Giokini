const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const coinsElement = document.getElementById("coins");
const shopElement = document.getElementById("shop");
const cleanButton = document.getElementById("clean");
const allyButton = document.getElementById("ally");
const restartButton = document.getElementById("restart");

let survivalTime = 0;
let gameOver = false;
let coinsActual = 0;
let balloon = { x: canvas.width / 2, y: canvas.height / 2, radius: 30 };
let projectiles = [];
let projectileSpeed = 5;
let projectileRadius = 5;
let projectileColorStandard = "rgb(165, 74, 255)";
let projectileColor = projectileColorStandard;
let squares = [];
let squareSpeed = 0.7;
let squareLastSpawnTime = 0;
let allies = [];
let yellowTriangles = [];
let yellowTriangleNextSpawn = Date.now() + Math.random() * 30000 + 10000;
let yellowActive = false;
let yellowTimer = 0;
let redTriangles = [];
let redTriangleNextSpawn = Date.now() + Math.random() * 45000 + 20000;
let redActive = false;
let redTimer = 0;
let powerUpTimer = 20;

// Event listeners
canvas.addEventListener('mousedown', shoot);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    shoot({ clientX: touch.clientX, clientY: touch.clientY });
});
restartButton.addEventListener('click', restartGame);
restartButton.style.display = 'none';
cleanButton.addEventListener('click', () => {
    if (coinsActual >= 50) {
        coinsActual -= 50;
        squares = [];
    }
});
allyButton.addEventListener('click', () => {
    if (coinsActual >= 15) {
        coinsActual -= 15;
        spawnBarrier();
    }
});
    
function shoot(event) {
    const rect = canvas.getBoundingClientRect();
    const angle = Math.atan2(event.clientY - balloon.y - rect.top, event.clientX - balloon.x - rect.left);
    projectiles.push({
        x: balloon.x,
        y: balloon.y,
        angle: angle,
        speed: projectileSpeed,
        size: projectileRadius,
    });
}

function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBalloon();
    drawProjectiles();
    spawnSquares();
    drawSquares();
    drawBarrier();
    spawnTriangles();
    drawTriangles();
    detectCollisions();
    updateYellowTimer(1 / 60);
    updateRedTimer(1 / 60);

    survivalTime += 1 / 60;
    scoreElement.textContent = Math.floor(survivalTime);
    coinsElement.textContent = Math.floor(coinsActual);

    requestAnimationFrame(gameLoop);
}

function drawBalloon() {
    if (gameOver) return;

    ctx.fillStyle = "rgb(165, 74, 255)";
    ctx.beginPath();
    ctx.arc(balloon.x, balloon.y, balloon.radius, 0, Math.PI * 2);
    ctx.fill();

    // Add 2px black border
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();
}

function drawProjectiles() {
    projectiles.forEach((proj, index) => {
        proj.x += Math.cos(proj.angle) * proj.speed;
        proj.y += Math.sin(proj.angle) * proj.speed;

        ctx.fillStyle = projectileColor;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
        ctx.fill();

        // Remove projectiles that are off-screen
        if (proj.x < 0 || proj.x > canvas.width || proj.y < 0 || proj.y > canvas.height) {
            projectiles.splice(index, 1);
        }

        // Add 2px black border
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();
    });
}

function spawnSquares() {
    const now = Date.now();
    if (now - squareLastSpawnTime > 1000) {
        squareLastSpawnTime = now;
        const position = getRandomSpawnPosition();
        squares.push({ x: position.x, y: position.y, size: 20 });
    }
}

function getRandomSpawnPosition() {
    const side = Math.floor(Math.random() * 4);
    const margin = 10;

    switch (side) {
        case 0: return { x: Math.random() * canvas.width, y: margin }; // Top
        case 1: return { x: Math.random() * canvas.width, y: canvas.height - margin }; // Bottom
        case 2: return { x: margin, y: Math.random() * canvas.height }; // Left
        case 3: return { x: canvas.width - margin, y: Math.random() * canvas.height }; // Right
    }
}

function getRandomSpawnPositionAwayFromBalloon(minDistance, margin = 10) {
    let position;
    let distance;

    do {
        position = {
            x: Math.random() * (canvas.width - 2 * margin) + margin,
            y: Math.random() * (canvas.height - 2 * margin) + margin
        };
        distance = Math.hypot(position.x - balloon.x, position.y - balloon.y);
    } while (distance < minDistance || (position.x > canvas.width / 2 - balloon.radius && position.x < canvas.width / 2 + balloon.radius && position.y > canvas.height / 2 - balloon.radius && position.y < canvas.height / 2 + balloon.radius));

    return position;
}

function drawSquares() {
    squares.forEach((square, index) => {
        // Move towards the center
        const angle = Math.atan2(balloon.y - square.y, balloon.x - square.x);
        square.x += Math.cos(angle) * squareSpeed;
        square.y += Math.sin(angle) * squareSpeed;

        // Draw the square
        ctx.fillStyle = "black";
        ctx.fillRect(square.x - square.size / 2, square.y - square.size / 2, square.size, square.size);

        // Collision detection with the balloon
        const dist = Math.hypot(balloon.x - square.x, balloon.y - square.y);
        if (dist < balloon.radius + 5) {
            gameOver = true;
            restartButton.style.display = 'block';
            shopElement.style.display = 'none';
        }
    });
}

function spawnBarrier() {
    const position = getRandomSpawnPositionAwayFromBalloon(50);
    const whiteSquare = { x: position.x, y: position.y, size: 20, color: "white" };
    allies.push(whiteSquare);
}

function drawBarrier() {
    allies.forEach((square, index) => {
        ctx.fillStyle = "white"
        ctx.fillRect(square.x - square.size / 2, square.y - square.size / 2, square.size, square.size);
    });
}

function spawnTriangles() {
    const now = Date.now();

    // Spawn a yellow triangle after the random interval
    if (now > yellowTriangleNextSpawn) {
        const position = getRandomSpawnPositionAwayFromBalloon();
        yellowTriangles.push({ x: position.x, y: position.y, size: 15 });
        yellowTriangleNextSpawn = now + Math.random() * 30000 + 10000; // Prossimo spawn giallo in un intervallo random tra 10 e 40 secondi
    }

    // Spawn a red triangle after the random interval
    if (now > redTriangleNextSpawn) {
        const position = getRandomSpawnPositionAwayFromBalloon();
        redTriangles.push({ x: position.x, y: position.y, size: 15 });
        redTriangleNextSpawn = now + Math.random() * 45000 + 20000; // Prossimo spawn rosso in un intervallo random tra 20 e 65 secondi
    }
}

function drawTriangles() {
    yellowTriangles.forEach((triangle) => {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.moveTo(triangle.x, triangle.y - triangle.size);
        ctx.lineTo(triangle.x - triangle.size, triangle.y + triangle.size);
        ctx.lineTo(triangle.x + triangle.size, triangle.y + triangle.size);
        ctx.closePath();
        ctx.fill();

        // Add 2px black border
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();
    });

    redTriangles.forEach((triangle) => {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.moveTo(triangle.x, triangle.y - triangle.size);
        ctx.lineTo(triangle.x - triangle.size, triangle.y + triangle.size);
        ctx.lineTo(triangle.x + triangle.size, triangle.y + triangle.size);
        ctx.closePath();
        ctx.fill();

        // Add 2px black border
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();
    });
}

function detectCollisions() {
    projectiles.forEach((proj, pIndex) => {
        squares.forEach((square, sIndex) => {
            const dist = Math.hypot(proj.x - square.x, proj.y - square.y);
            if (dist < proj.size + square.size / 2) {
                // Remove both projectile and square on collision
                projectiles.splice(pIndex, 1);
                squares.splice(sIndex, 1);
                coinsActual += 1;
            }
        });

        yellowTriangles.forEach((triangle, tIndex) => {
            // Calculate the vertices of the triangle
            const vertices = [
                { x: triangle.x, y: triangle.y - triangle.size },
                { x: triangle.x - triangle.size, y: triangle.y + triangle.size },
                { x: triangle.x + triangle.size, y: triangle.y + triangle.size }
            ];

            // Check if the projectile is inside the triangle using the barycentric technique
            const isInsideTriangle = (px, py, v0, v1, v2) => {
                const dX = px - v2.x;
                const dY = py - v2.y;
                const dX21 = v2.x - v1.x;
                const dY12 = v1.y - v2.y;
                const D = dY12 * (v0.x - v2.x) + dX21 * (v0.y - v2.y);
                const s = dY12 * dX + dX21 * dY;
                const t = (v2.y - v0.y) * dX + (v0.x - v2.x) * dY;
                return D < 0 ? s <= 0 && t <= 0 && s + t >= D : s >= 0 && t >= 0 && s + t <= D;
            };

            if (isInsideTriangle(proj.x, proj.y, vertices[0], vertices[1], vertices[2])) {
                projectiles.splice(pIndex, 1);
                yellowTriangles.splice(tIndex, 1);
                
                // Active the power up
                yellowActive = true;
                projectileSpeed = 10;
                projectileColor = "yellow";
                yellowTimer = powerUpTimer;
            }
        });

        redTriangles.forEach((triangle, tIndex) => {
            // Calculate the vertices of the triangle
            const vertices = [
                { x: triangle.x, y: triangle.y - triangle.size },
                { x: triangle.x - triangle.size, y: triangle.y + triangle.size },
                { x: triangle.x + triangle.size, y: triangle.y + triangle.size }
            ];

            // Check if the projectile is inside the triangle using the barycentric technique
            const isInsideTriangle = (px, py, v0, v1, v2) => {
                const dX = px - v2.x;
                const dY = py - v2.y;
                const dX21 = v2.x - v1.x;
                const dY12 = v1.y - v2.y;
                const D = dY12 * (v0.x - v2.x) + dX21 * (v0.y - v2.y);
                const s = dY12 * dX + dX21 * dY;
                const t = (v2.y - v0.y) * dX + (v0.x - v2.x) * dY;
                return D < 0 ? s <= 0 && t <= 0 && s + t >= D : s >= 0 && t >= 0 && s + t <= D;
            };

            if (isInsideTriangle(proj.x, proj.y, vertices[0], vertices[1], vertices[2])) {
                projectiles.splice(pIndex, 1);
                redTriangles.splice(tIndex, 1);

                // Active the power up
                redActive = true;
                projectileRadius = 8;
                projectileColor = "red";
                redTimer = powerUpTimer;
            }
        });
    });

    allies.forEach((ally, bIndex) => {
        squares.forEach((square, sIndex) => {
            const dist = Math.hypot(ally.x - square.x, ally.y - square.y);
            if (dist < ally.size / 2 + square.size / 2) {
            // Remove the square on collision
            squares.splice(sIndex, 1);
            allies.splice(bIndex, 1);
            }
        });
    });
}

function updateYellowTimer(deltaTime) {
    if (yellowTimer > 0) {
        yellowTimer -= deltaTime;
    } else {
        yellowTimer = 0;
        yellowActive = false;
        projectileSpeed = 5;

        // Update the projectile color
        if (redActive) {
            projectileColor = "red";
        } else {
            projectileColor = projectileColorStandard;
        }
    }
}

function updateRedTimer(deltaTime) {
    if (redTimer > 0) {
        redTimer -= deltaTime;
    } else {
        redTimer = 0;
        redActive = false;
        projectileRadius = 5;

        // Update the projectile color
        if (yellowActive) {
            projectileColor = "yellow";
        } else {
            projectileColor = projectileColorStandard;
        }
    }
}

function restartGame() {
    survivalTime = 0;
    gameOver = false;
    coinsActual = 0;
    balloon = { x: canvas.width / 2, y: canvas.height / 2, radius: 30 };
    projectiles = [];
    projectileSpeed = 5;
    projectileRadius = 5;
    projectileColor = projectileColorStandard;
    squares = [];
    squareSpeed = 0.7;
    squareLastSpawnTime = 0;
    allies = [];
    yellowTriangles = [];
    yellowTriangleNextSpawn = Date.now() + Math.random() * 30000 + 10000;
    yellowActive = false;
    yellowTimer = 0;
    redTriangles = [];
    redTriangleNextSpawn = Date.now() + Math.random() * 45000 + 20000;
    redActive = false;
    redTimer = 0;

    restartButton.style.display = 'none';
    shopElement.style.display = 'block';
    gameLoop();
}

// Start the game
gameLoop();
