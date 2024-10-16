// Game variables
const canvas = document.getElementById("angle");
const ctx = canvas.getContext("2d");
const input = document.getElementById("input");
const attempts = document.getElementById("attempts");
const submit = document.getElementById("submit");
const restart = document.getElementById("restart");
let targetAngle;
let attemptsLeft = 4;



// Function to generate a random angle and draw it
function initGame() {
    attemptsLeft = 5;
    attempts.textContent = `Attempts left: ${attemptsLeft}`;
    
    input.style.display = "block";
    submit.style.display = "block";
    restart.style.display = "none";
    input.value = "";
    
    targetAngle = Math.floor(Math.random() * 361);
    drawAngle(targetAngle);
}

// Draw the angle on the canvas
function drawAngle(targetAngle) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set line width to 2
    ctx.lineWidth = 2;

    // Draw the base line (0 degrees)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();

    // Draw the angle line
    const angleRad = targetAngle * (Math.PI / 180);
    const endX = centerX + radius * Math.cos(angleRad);
    const endY = centerY - radius * Math.sin(angleRad);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw the arc to show the angle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 70, 0, -angleRad, true);
    ctx.strokeStyle = 'green';
    ctx.stroke();
    ctx.strokeStyle = 'black';

    // Reset line width to default
    ctx.lineWidth = 1;
}

// Function to handle user's guess
function handleGuess() {
    const guessedAngle = parseInt(input.value);

    // Check if the input is a valid number
    if (isNaN(guessedAngle) || guessedAngle < 0 || guessedAngle > 360) {
        attempts.textContent = `Invalid angle! Attempts left: ${attemptsLeft}`;
        return;
    }

    // Check if the guessed angle is correct or handle messages if not
    attemptsLeft--;
    if (guessedAngle === targetAngle) {
        attempts.textContent = `You win! It was ${targetAngle}°`;
        endGame();
    } else if (attemptsLeft === 0) {
        attempts.textContent = `You lost! It was ${targetAngle}°`;
        endGame();
    } else if (guessedAngle - targetAngle === 1 || targetAngle - guessedAngle === 1) {
        attempts.textContent = `Near! Attempts left: ${attemptsLeft}`;
    } else if (guessedAngle < targetAngle) {
        attempts.textContent = `Too low! Attempts left: ${attemptsLeft}`;
    } else {
        attempts.textContent = `Too high! Attempts left: ${attemptsLeft}`;
    }
}

// Function to end the game
function endGame() {
    restart.style.display = "block";
    input.style.display = "none";
    submit.style.display = "none";
}

// Event listeners
submit.addEventListener("click", handleGuess);
input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        handleGuess();
    }
});
restart.addEventListener("click", initGame);

// Start the game initially
initGame();
