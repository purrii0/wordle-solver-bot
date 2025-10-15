const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const data = fs.readFileSync("words.txt", "utf-8").split("\n");
const dataSet = new Set(data);

let word = data[Math.floor(Math.random() * data.length)];
let attempts = 0;

console.log(word)

function newGame(){
  console.log(word);
  word = data[Math.floor(Math.random() * data.length)];
  attempts = 0;
}

app.get("/new", (req, res) => {
  try {
    newGame();
    res.status(200).json({
      success: true,
      message: "New word generated.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }  
});

app.post("/check", (req, res) => {
  try{
    const guessed = req.body.guessed?.trim().toLowerCase();
    if (!guessed || guessed.length !== 5) {
      return res.status(400).json({
        success: false,
        message: "Guess must be a 5-letter word.",
      });
    }

    if (!dataSet.has(guessed)) {
      return res.status(404).json({
        success: false,
        message: "Invalid word.",
      });
    }

    attempts++;

    const result = Array(5).fill(0);
    const freq = {};
    for (const ch of word) freq[ch] = (freq[ch] || 0) + 1;


    for(let i = 0; i < 5; i++) {
      if(guessed[i] === word[i]) {
        result[i] = 2;
        freq[guessed[i]]--;1
      } 
    }

    for(let i = 0; i < 5; i++) {
      if(result[i] === 0 && freq[guessed[i]] > 0) {
        result[i] = 1;
        freq[guessed[i]]--;
      } 
    }

    const isCorrect = guessed === word;

    return res.status(200).json({
      "success": true,
      "result": result,
      "attempts": attempts,
      correct: isCorrect
    })

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      "error": "Internal Server Error"
    })
  }
});

app.listen(3000, () => {
  console.log("Listening to port:3000");
})
