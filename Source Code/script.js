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
const shareBtn = document.querySelector('.share-btn');

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
    // Show Play Again and Share buttons after 1 second
    setTimeout(() => {
        playAgainBtn.hidden = false;
        if (shareBtn) shareBtn.hidden = false;
    }, 1000);
    gamePage.hidden = true;
    scorePage.hidden = false;
}

// Generate Image & Share (Download)
function shareScore() {
    console.log("Share button clicked!");
    try {
        const shareCard = document.getElementById('share-card');
        const shareTime = document.getElementById('share-time-value');
        const shareBase = document.getElementById('share-base');
        const sharePenalty = document.getElementById('share-penalty');

        if (!shareCard || !shareTime) {
            console.error("Share elements missing!");
            return;
        }

        // Populate Data
        shareTime.textContent = `${finalTime.toFixed(1)}s`;
        shareBase.textContent = `${timePlayed.toFixed(1)}s`;
        sharePenalty.textContent = `+${penaltyTime.toFixed(1)}s`;
        console.log("Data populated. Starting html2canvas...");

        // Check availability
        if (typeof html2canvas === 'undefined') {
            alert("Error: html2canvas library not loaded. Check internet connection.");
            return;
        }

        // Generate Canvas
        html2canvas(shareCard, {
            scale: 2, // High resolution
            backgroundColor: null, // Transparent background if needed
            logging: true // Enable logs for html2canvas
        }).then(canvas => {
            console.log("Canvas generated!");
            const link = document.createElement('a');
            link.download = `MathSprint-Score-${finalTime.toFixed(1)}s.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error("html2canvas error:", err);
            alert("Error generating image: " + err.message);
        });
    } catch (error) {
        console.error("Share Logic Error:", error);
        alert("Something went wrong! " + error.message);
    }
}

// Format & Display Time in DOM
function scoresToDOM() {
    finalTimeDisplay = finalTime.toFixed(1);

    // Set Base Time and Penalty
    baseTimeEl.textContent = `${timePlayed.toFixed(1)}s`;
    penaltyTimeEl.textContent = `+${penaltyTime.toFixed(1)}s`;
    finalTimeEl.textContent = `${finalTimeDisplay}s`;

    // Find Best Score for current Question Amount
    let bestScoreIndex = 0;
    switch (questionAmount) {
        case '10': bestScoreIndex = 0; break;
        case '25': bestScoreIndex = 1; break;
        case '50': bestScoreIndex = 2; break;
        case '99': bestScoreIndex = 3; break;
    }

    // Best Time (Robust Display)
    const bestTimeEl = document.querySelector('.best-time');
    if (bestTimeEl) {
        // Check if a score exists at this index
        const hasBestScore = bestScoreArray[bestScoreIndex] && bestScoreArray[bestScoreIndex].bestScore;

        if (hasBestScore) {
            bestTimeEl.textContent = `${bestScoreArray[bestScoreIndex].bestScore}s`;
        } else {
            bestTimeEl.textContent = '0.0s';
        }
    } else {
        console.error('Best Time Element not found in DOM');
    }

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

// Timer Display
const timerDisplay = document.querySelector('.timer-display');

// Add a tenth of a second to timePlayed
function addTime() {
    timePlayed += 0.1;
    checkTime();
    timerDisplay.textContent = `Time: ${timePlayed.toFixed(1)}s`;
}

// Start timer when game page is clicked
function startTimer() {
    // Reset times
    timePlayed = 0;
    penaltyTime = 0;
    finalTime = 0;
    timerDisplay.textContent = 'Time: 0.0s';
    timer = setInterval(addTime, 100);
    gamePage.removeEventListener('click', startTimer);
}

// Scroll, Store user selection in playerGuessArray
// Scroll, Store user selection in playerGuessArray
let currentEquationIndex = 0; // Track active equation

function select(guessedTrue) {
    // Scroll 80 pixels
    valueY += 80;
    itemContainer.scroll({ top: valueY, behavior: 'smooth' });

    // Toggle Text Highlight
    const itemElements = document.querySelectorAll('.item');
    if (itemElements[currentEquationIndex]) {
        itemElements[currentEquationIndex].classList.remove('selected-item');
    }
    currentEquationIndex++;
    if (itemElements[currentEquationIndex]) {
        itemElements[currentEquationIndex].classList.add('selected-item');
    }

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
    // Loop through, generate correct equations
    currentEquationIndex = 0; // Reset for new game
    for (let i = 0; i < correctEquations; i++) {
        firstNumber = getRandomInt(9);
        secondNumber = getRandomInt(9);

        const operatorType = getRandomInt(4); // 0: +, 1: -, 2: x, 3: /
        let equationValue;
        let equation;

        switch (operatorType) {
            case 0: // Addition
                equationValue = firstNumber + secondNumber;
                equation = `${firstNumber} + ${secondNumber} = ${equationValue}`;
                break;
            case 1: // Subtraction
                if (firstNumber < secondNumber) { [firstNumber, secondNumber] = [secondNumber, firstNumber]; } // Ensure positive
                equationValue = firstNumber - secondNumber;
                equation = `${firstNumber} - ${secondNumber} = ${equationValue}`;
                break;
            case 2: // Multiplication
                equationValue = firstNumber * secondNumber;
                equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
                break;
            case 3: // Division
                if (secondNumber === 0) secondNumber = 1; // No div by zero
                equationValue = firstNumber; // Start with answer
                firstNumber = equationValue * secondNumber; // Calculate correct dividend
                equation = `${firstNumber} / ${secondNumber} = ${equationValue}`;
                // Wait, logic check: 
                // If I want X / Y = Z. 
                // I generate Y (secondNumber) and Z (equationValue). 
                // Then X (firstNumber) = Y * Z.
                // So equation is "X / Y = Z".
                break;
        }

        equationObject = { value: equation, evaluated: 'true' };
        equationsArray.push(equationObject);
    }

    // Loop through, generate wrong equations
    for (let i = 0; i < wrongEquations; i++) {
        firstNumber = getRandomInt(9);
        secondNumber = getRandomInt(9);

        const operatorType = getRandomInt(4);
        let equationValue;
        let equation;

        switch (operatorType) {
            case 0: // Addition
                equationValue = firstNumber + secondNumber;
                equation = `${firstNumber} + ${secondNumber}`; // Base
                break;
            case 1: // Subtraction
                if (firstNumber < secondNumber) { [firstNumber, secondNumber] = [secondNumber, firstNumber]; }
                equationValue = firstNumber - secondNumber;
                equation = `${firstNumber} - ${secondNumber}`;
                break;
            case 2: // Multiplication
                equationValue = firstNumber * secondNumber;
                equation = `${firstNumber} x ${secondNumber}`;
                break;
            case 3: // Division
                if (secondNumber === 0) secondNumber = 1;
                let actualResult = firstNumber;
                firstNumber = actualResult * secondNumber;
                equationValue = actualResult;
                equation = `${firstNumber} / ${secondNumber}`;
                break;
        }

        // Randomly offset the result
        const offset = Math.random() > 0.5 ? 1 : -1;
        // Ensure strictly non-negative result if you want, but strictly wrong is key. 
        // Simple shift is enough.

        wrongFormat[0] = `${equation} = ${equationValue - 1}`;
        wrongFormat[1] = `${equation} = ${equationValue + 1}`;
        wrongFormat[2] = `${equation} = ${equationValue + 2}`;

        const formatChoice = getRandomInt(3);
        const finalEquation = wrongFormat[formatChoice];
        equationObject = { value: finalEquation, evaluated: 'false' };
        equationsArray.push(equationObject);
    }
    shuffle(equationsArray);
}

// Add Equations to DOM
function equationsToDOM() {
    equationsArray.forEach((equation, index) => {
        // Item
        const item = document.createElement('div');
        item.classList.add('item');

        // Highlight first item
        if (index === 0) {
            item.classList.add('selected-item');
        }

        // Equation Grid Container
        const grid = document.createElement('div');
        grid.classList.add('equation-grid');

        // Split equation string by spaces to get parts: [Num1, Op, Num2, =, Result]
        // Note: Equation values are constructed as "A op B = C" or "A op B" (for wrong variants sometimes? check logic)
        // My wrong logic was: `equation = ${firstNumber} x ${secondNumber}` (without = result possibly?)
        // Let's check logic:
        // Correct: `${a} op ${b} = ${c}` -> 5 parts
        // Wrong: `${equation} = ${c}` where equation is `${a} op ${b}` -> `${a} op ${b} = ${c}` -> 5 parts
        // So safe to assume 5 parts usually.

        const parts = equation.value.split(' ');

        parts.forEach(part => {
            const span = document.createElement('h1');
            span.textContent = part;
            grid.appendChild(span);
        });

        // Append
        item.appendChild(grid);
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
    // Append
    itemContainer.append(topSpacer);

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
//   GEOMETRIC CONSTELLATION FOOTER
// =========================================
const canvas = document.getElementById('footer-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const leftLink = document.querySelector('.link-left');
const rightLink = document.querySelector('.link-right');

let animationMode = 'default'; // 'default', 'grid' (Amey), 'spiral' (Mega)
let particles = [];
const particleCount = 60;
const connectionDistance = 100;

if (canvas && ctx) {
    // Resize Canvas
    function resizeCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.size = Math.random() * 2 + 1;
            this.color = '#333';
            this.targetX = null;
            this.targetY = null;
        }

        update() {
            // Mode Logic
            if (animationMode === 'grid') {
                // Move towards target in Grid
                if (this.targetX !== null && this.targetY !== null) {
                    const dx = this.targetX - this.x;
                    const dy = this.targetY - this.y;
                    this.x += dx * 0.1;
                    this.y += dy * 0.1;
                }
                this.color = 'dodgerblue';
            } else if (animationMode === 'spiral') {
                // Move towards Spiral paths
                if (this.targetX !== null && this.targetY !== null) {
                    const dx = this.targetX - this.x;
                    const dy = this.targetY - this.y;
                    this.x += dx * 0.1; // Smooth ease
                    this.y += dy * 0.1;
                }
                this.color = 'magenta';
            } else {
                // Default Brownian Motion
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off walls
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                this.color = '#555';
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Initialize Particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Calculate Targets for Shapes
    function setGridTargets() {
        const cols = 10;
        const rows = Math.ceil(particleCount / cols);
        const paddingX = canvas.width / cols;
        const paddingY = canvas.height / rows;

        particles.forEach((p, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            p.targetX = col * paddingX + paddingX / 2;
            p.targetY = row * paddingY + paddingY / 2;
        });
    }

    function setSpiralTargets() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const spacing = 4; // Tightness

        particles.forEach((p, i) => {
            const angle = i * 0.5;
            const radius = spacing * angle;
            p.targetX = centerX + radius * Math.cos(angle);
            p.targetY = centerY + radius * Math.sin(angle);
        });
    }

    // Interaction Listeners
    if (leftLink) {
        leftLink.addEventListener('mouseenter', () => {
            animationMode = 'grid';
            setGridTargets();
        });
        leftLink.addEventListener('mouseleave', () => {
            animationMode = 'default';
            // Give random velocities back
            particles.forEach(p => {
                p.vx = (Math.random() - 0.5) * 1.5;
                p.vy = (Math.random() - 0.5) * 1.5;
            });
        });
    }

    if (rightLink) {
        rightLink.addEventListener('mouseenter', () => {
            animationMode = 'spiral';
            setSpiralTargets();
        });
        rightLink.addEventListener('mouseleave', () => {
            animationMode = 'default';
            particles.forEach(p => {
                p.vx = (Math.random() - 0.5) * 1.5;
                p.vy = (Math.random() - 0.5) * 1.5;
            });
        });
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, index) => {
            p.update();
            p.draw();

            // Connect lines
            for (let j = index + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = p.color;
                    ctx.globalAlpha = 1 - dist / connectionDistance; // Fade out by distance
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// On Load
getSavedBestScores();