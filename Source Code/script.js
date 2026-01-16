/**
 * Project: Math Sprint Game
 * File: script.js
 * Date: February 17, 2022
 * Description: Core game logic, timer handling, score calculation, and DOM manipulation.
 * 
 * Created by: Amey Thakur (https://github.com/Amey-Thakur) & Mega Satish (https://github.com/msatmod)
 * Repository: https://github.com/Amey-Thakur/MATH-SPRINT-GAME
 * License: MIT
 */

// =========================================
//   CONSOLE EASTER EGG 🏃‍♂️
// =========================================
console.log(
    "%c🏃🏻‍♂️ Math Sprint Game",
    "font-size: 24px; font-weight: bold; color: #8b5cf6; text-shadow: 2px 2px 0 #1e1b4b;"
);
console.log(
    "%c➕➖✖️➗ Race against time with math equations!",
    "font-size: 14px; color: #64748b;"
);
console.log(
    "%c🎮 Developed by Amey Thakur & Mega Satish",
    "font-size: 12px; color: #22c55e;"
);
console.log(
    "%c🔗 https://github.com/Amey-Thakur/MATH-SPRINT-GAME",
    "font-size: 12px; color: #2563eb;"
);
console.log(
    "%c⚠️ This game is protected. Please respect the authors' work!",
    "font-size: 12px; color: #f59e0b; font-weight: bold;"
);

// =========================================
//   SECURITY MEASURES 🔒
// =========================================
(function initSecurity() {
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('dragstart', function (e) { e.preventDefault(); });
    document.addEventListener('selectstart', function (e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') e.preventDefault();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) || (e.ctrlKey && e.key === 'u')) e.preventDefault();
    });
})();
// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
// Game Logic: State Variables
// These variables track the application state including scoring, timer, 
// and the mathematical equations generated for the current session.
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Equation Generation Variables
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Timer Variables
// Precision tracking using 0.1s intervals.
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';

// Scroll
let valueY = 0;

// Refresh Splash Page Best Scores
function bestScoresToDOM() {
    bestScores.forEach((bestScore, index) => {
        const bestScoreEl = bestScore;
        bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
    });
}

// Check Local Storage for Best Scores, set bestScoreArray
/**
 * Local Storage Management
 * Retrieves 'bestScores' from the browser's local storage to maintain persistence across sessions.
 * If no data exists, initializes a default array with zeroed scores.
 */
function getSavedBestScores() {
    if (localStorage.getItem('bestScores')) {
        bestScoreArray = JSON.parse(localStorage.bestScores);
    } else {
        bestScoreArray = [
            { questions: 10, bestScore: finalTimeDisplay },
            { questions: 25, bestScore: finalTimeDisplay },
            { questions: 50, bestScore: finalTimeDisplay },
            { questions: 99, bestScore: finalTimeDisplay },
        ];
        localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
    }
    bestScoresToDOM();
}

// Update Best Score Array
function updateBestScore() {
    bestScoreArray.forEach((score, index) => {
        // Select correct Best Score to update
        if (questionAmount == score.questions) {
            // Return  Best Score as number with one decimal
            // const savedBestScore = (parseInt(bestScoreArray[index].bestScore)).toFixed(1);
            const savedBestScore = Number(bestScoreArray[index].bestScore);
            // Update if the new final score is less or replacing zero
            if (savedBestScore === 0 || savedBestScore > finalTime) {
                bestScoreArray[index].bestScore = finalTimeDisplay;
            }
        }
    });
    // Update Splash Page
    bestScoresToDOM();
    // Save to Local Storage
    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
}

// Reset Game
function playAgain() {
    gamePage.addEventListener('click', startTimer);
    scorePage.hidden = true;
    splashPage.hidden = false;
    equationsArray = [];
    playerGuessArray = [];
    valueY = 0;
    playAgainBtn.hidden = true;
}

// Show Score Page
function showScorePage() {
    // Show Play Again button after 1 second
    setTimeout(() => {
        playAgainBtn.hidden = false;
    }, 1000);
    gamePage.hidden = true;
    scorePage.hidden = false;
}

// Format & Display Time in DOM
function scoresToDOM() {
    finalTimeDisplay = finalTime.toFixed(1);
    baseTime = timePlayed.toFixed(1);
    penaltyTime = penaltyTime.toFixed(1);
    baseTimeEl.textContent = `Base Time: ${baseTime}s`;
    penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
    finalTimeEl.textContent = `${finalTimeDisplay}s`;
    updateBestScore();
    // Scroll to the Top, go to Score Page
    itemContainer.scrollTo({ top: 0, behavior: 'instant' });
    showScorePage();
}

// Stop Timer, Process Results, go to Score Page
function checkTime() {
    if (playerGuessArray.length == questionAmount) {
        clearInterval(timer);
        // Check for wrong guesses, add penalty time
        equationsArray.forEach((equation, index) => {
            if (equation.evaluated === playerGuessArray[index]) {
                // Correct Guess, No penalty

            } else {
                // Incorrect Guess, dd Penalty
                penaltyTime += 0.5;
            }
        });
        finalTime = timePlayed + penaltyTime;
        scoresToDOM();
    }
}

// Add a tenth of a second to timePlayed
function addTime() {
    timePlayed += 0.1;
    checkTime();
}

// Start timer when game page is clicked
function startTimer() {
    // Reset times
    timePlayed = 0;
    penaltyTime = 0;
    finalTime = 0;
    timer = setInterval(addTime, 100);
    gamePage.removeEventListener('click', startTimer);
}

// Scroll, Store user selection in playerGuessArray
function select(guessedTrue) {
    // Scroll 80 pixels
    valueY += 80;
    itemContainer.scroll(0, valueY);
    // Add player guess to array
    return guessedTrue ? playerGuessArray.push('true') : playerGuessArray.push('false');
}

// Display Game Page
function showGamePage() {
    gamePage.hidden = false;
    countdownPage.hidden = true;
}

// Get Random Number up to amax number
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
/**
 * Equation Generation Algorithm
 * randomly selects a subset of equations to be mathematically correct,
 * and forces the remainder to be incorrect by slightly altering the result.
 * This ensures unpredictable gameplay.
 */
function createEquations() {
    // Randomly choose how many correct equations there should be
    const correctEquations = getRandomInt(questionAmount);
    // Set amount of wrong equations
    const wrongEquations = questionAmount - correctEquations;
    // Loop through, multiply random numbers up to 9, push to array
    for (let i = 0; i < correctEquations; i++) {
        firstNumber = getRandomInt(9);
        secondNumber = getRandomInt(9);
        const equationValue = firstNumber * secondNumber;
        const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
        equationObject = { value: equation, evaluated: 'true' };
        equationsArray.push(equationObject);
    }
    // Loop through, mess with the equation results, push to array
    for (let i = 0; i < wrongEquations; i++) {
        firstNumber = getRandomInt(9);
        secondNumber = getRandomInt(9);
        const equationValue = firstNumber * secondNumber;
        wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
        wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
        wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
        const formatChoice = getRandomInt(3);
        const equation = wrongFormat[formatChoice];
        equationObject = { value: equation, evaluated: 'false' };
        equationsArray.push(equationObject);
    }
    shuffle(equationsArray);
}

// Add Equations to DOM
function equationsToDOM() {
    equationsArray.forEach((equation) => {
        // Item
        const item = document.createElement('div');
        item.classList.add('item');
        // Equation Text
        const equationText = document.createElement('h1');
        equationText.textContent = equation.value;
        // Append
        item.appendChild(equationText);
        itemContainer.appendChild(item);
    });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
    // Reset DOM, Set Blank Space Above
    itemContainer.textContent = '';
    // Spacer
    const topSpacer = document.createElement('div');
    topSpacer.classList.add('height-240');
    // Selected Item
    const selectedItem = document.createElement('div');
    selectedItem.classList.add('selected-item');
    // Append
    itemContainer.append(topSpacer, selectedItem);

    // Create Equations, Build Elements in DOM
    createEquations();
    equationsToDOM();

    // Set Blank Space Below
    const bottomSpacer = document.createElement('div');
    bottomSpacer.classList.add('height-500');
    itemContainer.appendChild(bottomSpacer);
}

// Displays 3, 2, 1 GO!
function countdownStart() {
    let count = 5;
    countdown.textContent = count;
    const timeCountDown = setInterval(() => {
        count--;
        if (count === 0) {
            countdown.textContent = 'GO!';
        } else if (count === -1) {
            showGamePage();
            clearInterval(timeCountDown);
        } else {
            countdown.textContent = count;
        }
    }, 1000);
}

// Navigate from Splash page to Countdown Page
function showCountdown() {
    countdownPage.hidden = false;
    splashPage.hidden = true;
    populateGamePage();
    countdownStart();
}

// Get the value from Selected radio button
function getRadioValue() {
    let radioValue;
    radioInputs.forEach((radioInput) => {
        if (radioInput.checked) {
            radioValue = radioInput.value;
        }
    });
    return radioValue;
}

// Form that decides amount of questions
function selectQuestionAmount(e) {
    e.preventDefault();
    questionAmount = getRadioValue();
    if (questionAmount) {
        showCountdown();
    }
}

// Switch selected input styling
startForm.addEventListener('change', () => {
    radioContainers.forEach((radioEl) => {
        // Remove Selected Label Styling
        radioEl.classList.remove('selected-label');
        // Check if the input within this container is checked
        // Note: The input is expected to be the second child (index 1) based on HTML structure
        if (radioEl.children[1].checked) {
            radioEl.classList.add('selected-label');
        }
    });
});

// Event Listeners
startForm.addEventListener('submit', selectQuestionAmount);
gamePage.addEventListener('click', startTimer);

// =========================================
//   MATH OPS FOOTER ANIMATION
// =========================================
const footer = document.querySelector('.footer');
const leftLink = document.querySelector('.link-left');
const rightLink = document.querySelector('.link-right');
const operator = document.querySelector('.math-operator');

let particleInterval;

function createParticle(type, startEl, endEl) {
    const particle = document.createElement('span');
    particle.classList.add('math-particle');
    if (type === 'plus') {
        particle.textContent = '+';
        particle.classList.add('particle-plus');
    } else {
        particle.textContent = '−';
        particle.classList.add('particle-minus');
    }

    // Get Positions
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();

    // Start Position (Center of start element)
    const startX = startRect.left + startRect.width / 2 - footerRect.left;
    const startY = startRect.top + startRect.height / 2 - footerRect.top;

    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;

    footer.appendChild(particle);

    // Animate to End Element
    // Randomize end position slightly for impact scatter
    const endX = endRect.left + endRect.width / 2 - footerRect.left + (Math.random() * 20 - 10);
    const endY = endRect.top + endRect.height / 2 - footerRect.top + (Math.random() * 20 - 10);

    // Trigger Reflow for transition
    void particle.offsetWidth;

    particle.style.transform = `translate(${endX - startX}px, ${endY - startY}px) rotate(${Math.random() * 360}deg)`;
    particle.style.opacity = '0'; // Fade out at end

    // Cleanup
    setTimeout(() => {
        particle.remove();
    }, 800);
}

if (footer && leftLink && rightLink && operator) {
    // -------------------------------------
    // HOVER AMEY (ADDITION -> MEGA GROWS)
    // -------------------------------------
    leftLink.addEventListener('mouseenter', () => {
        operator.textContent = '+';
        operator.classList.add('operator-plus');
        rightLink.classList.add('scale-up');

        // Rapid fire particles
        particleInterval = setInterval(() => {
            createParticle('plus', leftLink, rightLink);
        }, 100);
    });

    leftLink.addEventListener('mouseleave', () => {
        operator.textContent = '&';
        operator.classList.remove('operator-plus');
        rightLink.classList.remove('scale-up');
        clearInterval(particleInterval);
    });

    // -------------------------------------
    // HOVER MEGA (SUBTRACTION -> AMEY SHRINKS)
    // -------------------------------------
    rightLink.addEventListener('mouseenter', () => {
        operator.textContent = '−';
        operator.classList.add('operator-minus');
        leftLink.classList.add('scale-down');

        // Rapid fire particles
        particleInterval = setInterval(() => {
            createParticle('minus', rightLink, leftLink);
        }, 100);
    });

    rightLink.addEventListener('mouseleave', () => {
        operator.textContent = '&';
        operator.classList.remove('operator-minus');
        leftLink.classList.remove('scale-down');
        clearInterval(particleInterval);
    });
}

// On Load
getSavedBestScores();