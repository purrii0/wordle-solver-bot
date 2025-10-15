const fs = require("fs");

const data = fs.readFileSync("words.txt", "utf-8").split("\n");
const openers = ["crane", "slate", "trace", "audio"];

async function sendReq(word) {
  try {
    const res = await fetch("http://localhost:3000/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guessed: word }),
    });
    return res.json();
  } catch (err) {
    console.error("Error calling /check:", err);
    return null;
  }
}

function matchFeedback(candidate, guess, feedback) {
  const candArr = candidate.split("");
  const guessArr = guess.split("");
  const fbArr = [...feedback];

  for (let i = 0; i < 5; i++) {
    if (fbArr[i] === 2) {
      if (candArr[i] !== guessArr[i]) return false;
      candArr[i] = null;
      guessArr[i] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (fbArr[i] === 1) {
      if (!candArr.includes(guessArr[i])) return false;
      candArr[candArr.indexOf(guessArr[i])] = null;
      guessArr[i] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (fbArr[i] === 0 && guessArr[i] !== null) {
      if (candArr.includes(guessArr[i])) return false;
    }
  }

  return true;
}

function chooseNextGuess(possibleWords) {
  const freq = {};

  for (const w of possibleWords) {
    const seen = new Set();
    for (const ch of w) {
      if (!seen.has(ch)) {
        freq[ch] = (freq[ch] || 0) + 1;
        seen.add(ch);
      }
    }
  }

  let bestWord = null;
  let bestScore = -1;
  for (const w of possibleWords) {
    const seen = new Set();
    let score = 0;
    for (const ch of w) {
      if (!seen.has(ch)) {
        score += freq[ch] || 0;
        seen.add(ch);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestWord = w;
    }
  }
  return bestWord;
}

async function playGame(gameIndex) {
  const opener = openers[Math.floor(Math.random() * openers.length)];
  let currentGuess = opener;
  let attempts = 0;
  let guessedSet = new Set();
  let possibleWords = [...data];

  while (true) {
    attempts++;
    guessedSet.add(currentGuess);

    if (!data.includes(currentGuess)) {
      console.log(`Game ${gameIndex} | Guess ${attempts}: ${currentGuess} -> INVALID`);
      possibleWords = possibleWords.filter((w) => w !== currentGuess);
      if (possibleWords.length === 0) {
        fs.appendFileSync("data.csv", `${gameIndex},${opener},FAILED,${attempts}\n`);
        break;
      }
      currentGuess = chooseNextGuess(possibleWords);
      continue;
    }

    const res = await sendReq(currentGuess);

    if (!res || !res.result) {
      console.log(`Game ${gameIndex} | Guess ${attempts}: ${currentGuess} -> NO RESULT`);
      fs.appendFileSync("data.csv", `${gameIndex},${opener},FAILED,${attempts}\n`);
      break;
    }

    console.log(`Game ${gameIndex} | Guess ${attempts}: ${currentGuess} -> ${res.result.join("")}`);

    if (res.result.every((v) => v === 2)) {
      console.log(`Solved in ${attempts} attempts!`);
      fs.appendFileSync("data.csv", `${gameIndex},${opener},${currentGuess},${attempts}\n`);
      break;
    }

    possibleWords = possibleWords
      .filter((w) => matchFeedback(w, currentGuess, res.result))
      .filter((w) => !guessedSet.has(w));

    if (possibleWords.length === 0) {
      console.log(`No possible words left in game ${gameIndex}.`);
      fs.appendFileSync("data.csv", `${gameIndex},${opener},FAILED,${attempts}\n`);
      break;
    }

    currentGuess = chooseNextGuess(possibleWords);
  }
}

async function startSimulations(n = 10000) {
  fs.writeFileSync("data.csv", "game,opener,finalWord,attempts\n"); 

  for (let i = 0; i < n; i++) {
    console.log(`\n=== Starting Game #${i + 1} ===`);
    await fetch("http://localhost:3000/new");
    await playGame(i + 1);
  }

  console.log(`\n Finished ${n} simulations!`);
}

startSimulations();
