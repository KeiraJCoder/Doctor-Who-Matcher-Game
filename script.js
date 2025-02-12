// 📌 Step 1: List all available Doctor Who images in the folder
const availableDoctors = [
    "CB.jpg", "CE.avif", "DT.jpg", "DT2.jpg",
    "JP.jpg", "jw.avif", "ms.webp", "ng.webp",
    "PC.jpg", "PD.jpg", "PM.webp", "PT.jpg",
    "SM.jpg", "TB.jpg", "WH.jpg"
];

// 📌 Step 2: Function to get 8 random unique Doctors
function getRandomDoctors() {
    let shuffled = availableDoctors.sort(() => Math.random() - 0.5); // Shuffle array
    let selected = shuffled.slice(0, 8); // Take the first 8 unique Doctors
    return selected.flatMap(doctor => [doctor, doctor]); // Create pairs
}

// 📌 Step 3: Get the game board element
var gameBoard = document.getElementById("game-board");

// 📌 Step 4: Variables to track the game state
var firstCard = null;
var secondCard = null;
var lockBoard = false; // Prevents multiple clicks when checking for matches

// 📌 NEW FEATURE: Variables for tracking moves and timer
var moves = 0;
var timer;
var seconds = 0;
var hasGameStarted = false; // Track if the game has started

// 📌 Step 5: Function to shuffle an array
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// 📌 Step 6: Function to create the game board with randomized Doctors
function startGame() {
    gameBoard.innerHTML = ""; // Clears the game board
    var symbols = shuffle(getRandomDoctors()); // Get and shuffle 8 random Doctors

    // 🔄 Loop through the shuffled symbols and create card elements
    for (var i = 0; i < symbols.length; i++) {
        var card = document.createElement("div");
        card.classList.add("card");

        // 📌 NEW FEATURE: Adding front and back for flip effect
        var front = document.createElement("div");
        front.classList.add("card-front");
        front.innerHTML = `<img src="images/back.jpg" alt="Card Back" class="card-img">`; // Back of the card

        var back = document.createElement("div");
        back.classList.add("card-back");
        back.innerHTML = `<img src="images/${symbols[i]}" alt="Doctor" class="card-img">`; // Doctor image

        card.appendChild(front);
        card.appendChild(back);
        card.dataset.symbol = symbols[i];
        card.addEventListener("click", flipCard);
        gameBoard.appendChild(card);
    }

    // 📌 Reset game state
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    hasGameStarted = false;

    // 📌 Reset move counter
    moves = 0;
    document.getElementById("move-counter").textContent = moves;

    // 📌 Reset timer but only display 0, don't start it yet
    clearInterval(timer);
    seconds = 0;
    document.getElementById("timer").textContent = seconds;

    // 📌 Hide win message
    document.getElementById("win-message").style.display = "none";

    // 📌 Display stored high scores at game start
    displayHighScores();
}

// 📌 Step 7: Function to flip a card
function flipCard(event) {
    if (lockBoard) return; // Prevent flipping more than two cards at once

    var clickedCard = event.currentTarget;
    if (clickedCard.classList.contains("flipped")) return; // Ignore already flipped cards

    // 📌 NEW FEATURE: Start the timer only when the first card is clicked
    if (!hasGameStarted) {
        hasGameStarted = true;
        timer = setInterval(updateTimer, 1000);
    }

    clickedCard.classList.add("flipped"); // Add "flipped" class

    // 📌 NEW FEATURE: Track moves
    moves++;
    document.getElementById("move-counter").textContent = moves; // Update move counter

    if (firstCard === null) {
        firstCard = clickedCard; // Store first selected card
    } else {
        secondCard = clickedCard; // Store second selected card
        checkForMatch();
    }
}

// 📌 Step 8: Function to check if two cards match
function checkForMatch() {
    lockBoard = true; // Prevent further clicks while checking

    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
        // ✅ Match found
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        // 📌 NEW FEATURE: Check if all cards are matched (Game Over)
        if (document.querySelectorAll(".matched").length === 16) {
            clearInterval(timer); // Stop the timer
            document.getElementById("final-time").textContent = seconds;
            document.getElementById("win-message").style.display = "block";

            // 📌 Save high score
            saveHighScore(seconds, moves);
        }

        resetTurn();
    } else {
        // ❌ No match, flip them back after 1 second
        setTimeout(hideCards, 1000);
    }
}

// 📌 Step 9: Function to hide non-matching cards
function hideCards() {
    firstCard.classList.remove("flipped"); // Remove flipped class
    secondCard.classList.remove("flipped");
    resetTurn();
}

// 📌 Step 10: Function to reset selected cards
function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

// 📌 NEW FEATURE: Function to update the timer every second
function updateTimer() {
    seconds++;
    document.getElementById("timer").textContent = seconds;
}

// 📌 NEW FEATURE: Function to save high scores in localStorage
function saveHighScore(time, moves) {
    let highScores = JSON.parse(localStorage.getItem("highScores")) || []; // Get existing high scores

    // 📌 Add new score to the array
    highScores.push({ time: time, moves: moves });

    // 📌 Sort scores by fastest time first, then by fewest moves if tied
    highScores.sort((a, b) => a.time - b.time || a.moves - b.moves);

    // 📌 Keep only the top 5 scores
    highScores = highScores.slice(0, 5);

    // 📌 Save back to localStorage
    localStorage.setItem("highScores", JSON.stringify(highScores));

    // 📌 Update the displayed high scores immediately
    displayHighScores();
}

// 📌 NEW FEATURE: Function to display high scores properly
function displayHighScores() {
    let highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    let highScoreList = document.getElementById("high-scores");

    // 📌 Prevent layout shifts by using a document fragment
    let fragment = document.createDocumentFragment();
    
    let title = document.createElement("h3");
    title.textContent = "🏆 High Scores";
    fragment.appendChild(title);

    if (highScores.length === 0) {
        let noScores = document.createElement("p");
        noScores.textContent = "No scores yet. Be the first!";
        fragment.appendChild(noScores);
    } else {
        highScores.forEach((score, index) => {
            let scoreItem = document.createElement("p");
            scoreItem.textContent = `#${index + 1}: ⏳ ${score.time}s | 🎯 ${score.moves} moves`;
            fragment.appendChild(scoreItem);
        });
    }

    // 📌 Replace high scores content without modifying the container (avoids jumping)
    highScoreList.innerHTML = "";
    highScoreList.appendChild(fragment);
}

// 📌 Step 11: Start the game when the page loads
startGame();
