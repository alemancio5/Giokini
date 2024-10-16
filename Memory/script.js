// Game variables
const categories = ['People', 'Pets', 'Pozzilandia', 'El Moras'];
let selectedCategory = categories[0];
const cardsArray = [];
for (let i = 1; i <= 9; i++) {
    cardsArray.push(i, i);
}
let shuffledCards = cardsArray.sort(() => 0.5 - Math.random());
const attemptsTot = 20;
let movesLeft = attemptsTot;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matches = 0;
const grid = document.getElementById('grid');



// Create cards function
function createCards() {
    shuffledCards.forEach(value => {
        const card = document.createElement('div');
        card.classList.add('card', 'hidden');
        card.dataset.value = value;

        const img = document.createElement('img');
        img.src = `resources/${selectedCategory}/${value}.jpg`;
        img.classList.add('card-img');
        card.appendChild(img);

        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

// Call createCards to initialize the grid
createCards();

function flipCard() {
    if (lockBoard || this === firstCard) return;

    this.classList.remove('hidden');
    this.querySelector('img').style.visibility = 'visible';

    if (!firstCard) {
        firstCard = this;
    } else {
        secondCard = this;
        lockBoard = true;
        checkForMatch();
    }
}

// Check for match
function checkForMatch() {
    if (firstCard.dataset.value === secondCard.dataset.value) {
        disableCards();
        matches += 2;
        if (matches === 18) {
            document.getElementById('feedback').textContent = `You win! Attempts left: ${movesLeft}`;
            document.getElementById('restart-button').style.display = 'block';
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => card.removeEventListener('click', flipCard));
        }
    } else {
        unflipCards();
    }

    movesLeft--;
    document.getElementById('feedback').textContent = `Attempts left: ${movesLeft}`;

    if (movesLeft === 0 && matches < 18) {
        document.getElementById('feedback').textContent = `You lost! Attempts left: ${movesLeft}`;
        document.getElementById('restart-button').style.display = 'block';
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.removeEventListener('click', flipCard));
    }
}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    setTimeout(() => {
        firstCard.classList.add('hidden');
        firstCard.querySelector('img').style.visibility = 'hidden';
        secondCard.classList.add('hidden');
        secondCard.querySelector('img').style.visibility = 'hidden';
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

function resetGame() {
    grid.innerHTML = '';
    shuffledCards = cardsArray.sort(() => 0.5 - Math.random());
    createCards();
    movesLeft = attemptsTot;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matches = 0;
    document.getElementById('restart-button').style.display = 'none';
    document.getElementById('feedback').textContent = `Attempts left: ${movesLeft}`;
}

// Event listeners
document.getElementById('restart-button').addEventListener('click', resetGame);
document.getElementById('category-select').addEventListener('change', function() {
    selectedCategory = this.value;
    resetGame();
});
