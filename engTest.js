const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const fileName = process.argv[2] || "words.txt";

let words;
try {
  words = fs.readFileSync(fileName, "utf-8")
    .split("\n")
    .map(line => line.split(","))
    .filter(pair => pair.length === 2);
} catch (error) {
  console.error(`Error reading file: ${fileName}`);
  process.exit(1);
}

let score = 480;
let totalQuestions = 20;
let currentQuestion = 0;
let showFirstLetter = false;
let usedWords = new Set();
let currentWord = null;
let incorrectWords = [];

console.log("Welcome to the Typing Test!");
rl.question("Do you want to show the first letter? (y/n): ", (input) => {
  showFirstLetter = input.trim().toLowerCase() === "y";
  askQuestion();
});

function askQuestion(attempts = 0) {
  if (currentQuestion >= totalQuestions) {
    if (showFirstLetter) score--;
    console.log(`Test finished! Your score: ${score}`);
    if (incorrectWords.length > 0) {
      console.log("Incorrect words:");
      incorrectWords.forEach(([eng, jp]) => {
        console.log(`${jp} -> ${eng}`);
      });
    }
    rl.close();
    return;
  }

  if (attempts === 0) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * words.length);
      currentWord = words[randomIndex];
    } while (usedWords.has(currentWord[0]));
    usedWords.add(currentWord[0]);
  }

  let [english, japanese] = currentWord;
  let promptText = `Question ${currentQuestion + 1}/${totalQuestions}: Translate to English: ${japanese}`;
  if (showFirstLetter) {
    promptText += ` (starts with '${english.charAt(0)}')`;
  }

  console.log(promptText);
  rl.question("> ", (answer) => {
    if (answer.trim() === "?") {
      console.log(`Incorrect. The correct word was: ${english}`);
      incorrectWords.push([english, japanese]);
      currentQuestion++;
      askQuestion();
    } else if (answer.trim().toLowerCase() === english.toLowerCase()) {
      console.log("Correct!");
      score++;
      currentQuestion++;
      askQuestion();
    } else {
      if (attempts === 0) {
        console.log("Incorrect. Try again.");
        askQuestion(1);
      } else {
        console.log(`Incorrect again. The correct word was: ${english}`);
        incorrectWords.push([english, japanese]);
        currentQuestion++;
        askQuestion();
      }
    }
  });
}