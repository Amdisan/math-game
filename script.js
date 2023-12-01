// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");
// Score Page
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector("#play-again-btn");

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

// Scroll
let valueY = 0;

//refresh splash page best scores
function bestScoresToDOM() {
  bestScores.forEach(
    (score, idx) => (score.textContent = `${bestScoreArray[idx].bestScore}s`)
  );
}

//check local storage for best scores, set bestScoreArray
function getSavedBestScores() {
  if (localStorage.getItem("bestScores")) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ];
    localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
}

//update bestscoreArray

function updateBestScore() {
  bestScoreArray.forEach((score, idx) => {
    //select correct best score to update
    if (questionAmount === score.questions) {
      //return best score as number with one decimal
      const savedBestScore = Number(bestScoreArray[idx].bestScore);
      //update the new final score or replacing zero
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[idx].bestScore = finalTimeDisplay;
      }
    }
  });
  //update splash page
  bestScoresToDOM();
  //update localstorage
  localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
}

//reset the game
//playAgain attached in html with onclick
function playAgain() {
  gamePage.addEventListener("click", startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
}

//show score page
function showScorePage() {
  //play again btn delay
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
}

//format  and display time to DOM
function scoresToDOM() {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);

  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;

  updateBestScore();

  //scroll to the top of itemContainer
  itemContainer.scrollTo({
    top: 0,
    behavior: "instant",
  });
  showScorePage();
}

//stop timer, process results, go to score page
function checkTime() {
  if (playerGuessArray.length === questionAmount) {
    clearInterval(timer);
    //check for wrong quesses, add penalty time
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated !== playerGuessArray[index]) {
        //incorect guess -> add penalty time
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
    scoresToDOM();
  }
}

//add a tenth of a second to timePlayed
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

//start timer when game page is clicked
function startTimer() {
  //reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener("click", startTimer);
}

//scroll, store user selection in playerGuessArray
// select attached to onlick in the html
function select(guessedTrue) {
  //scroll 80px
  valueY += 80;
  itemContainer.scroll(0, valueY);
  //add player guess to array
  guessedTrue ? playerGuessArray.push("true") : playerGuessArray.push("false");
}

//display game page
function showGamePage() {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

//get random number
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const number = getRandomInt(questionAmount);
  const correctEquations = number > 0 ? number : 1;
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
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
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }
  equationsArray.sort(() => Math.random() - 0.5);
}

//add  equations to DOM
function equationsToDOM() {
  equationsArray.forEach((equation) => {
    //item
    const item = document.createElement("div");
    item.classList.add("item");
    //equation text
    const equationText = document.createElement("h2");
    equationText.textContent = equation.value;
    //append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM

  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

//countdown
function countdownStart() {
  countdown.textContent = "";
  let count = 3;
  countdown.textContent = count;
  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdown.textContent = count;
    } else if (count === 0) {
      countdown.textContent = "GO!";
    } else {
      clearInterval(interval);
      showGamePage();
    }
  }, 1000);
}

//navigate from splash page to countdown page
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
  populateGamePage();
}

//get the value from selected radio button
function getRadioValue() {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
  });
  return Number(radioValue);
}

//form that decides amount of questions
function selectQuestionAmount(e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  if (questionAmount) {
    showCountdown();
  }
}

//event listeners
startForm.addEventListener("click", () => {
  radioContainers.forEach((radioEl) => {
    //remove selected label styling
    radioEl.classList.remove("selected-label");
    //add it back if radio input is checked
    //questions - name of the input
    if (radioEl.children.questions.checked) {
      radioEl.classList.add("selected-label");
    }
  });
});

startForm.addEventListener("submit", selectQuestionAmount);
gamePage.addEventListener("click", startTimer);

//on load
getSavedBestScores();
