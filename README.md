# Wordle Solver Bot

A Wordle solver simulation bot with visual analysis.  
This project includes a Node.js solver, server, and Python visualizations.

## Project Structure

```

.
├── index.js          # Wordle server
├── bot.js            # Solver bot that interacts with Server
├── words.txt         # Word list used for guesses
├── plot.py           # Python script for visualizing 
├── data.csv          # Simulation results (generated)
├── package.json      # Node.js project metadata
├── package-lock.json # Node.js lock file


````

- **index.js** → Express server that provides `/new` and `/check` endpoints.  
- **bot.js** → Solver that interacts with the server, simulates games, and logs results.  
- **plot.py** → Reads `data.csv` and generates plots (histogram, rolling average, hardest words).  
- **words.txt** → List of valid 5-letter words used by both server and solver.  
- **data.csv** → Stores simulation results in the format: `game,opener,finalWord,attempts`.  

## Setup

### 1. Install Node.js dependencies

```bash
npm install
````

### 2. Run the server

```bash
node index.js
```

Server runs at: `http://localhost:3000`

### 3. Run the solver

```bash
node bot.js
```

* Simulates games, chooses guesses intelligently, and saves results to `data.csv`.

### 4. Run visualizations (optional)

```bash
python3 plot.py
```

* Requires `pandas` and `matplotlib` installed in your Python environment.
* Generates plots like:

  * Attempts histogram
  * Rolling average of attempts
  * Opener boxplots
  * Hardest words


## Notes

* `bot.js` uses a **frequency-based hybrid algorithm** to efficiently narrow down guesses.
* Repeated letters are handled correctly to avoid filtering out valid words.
* CSV output can be used for detailed analysis or further visualization.

## Wordle Solver Algorithm

The bot uses a **hybrid frequency-based approach** to efficiently solve Wordle puzzles. 
### **Step 1: Choose an opener**

* Start with a predefined set of **strong opening words** (e.g., `"crane"`, `"slate"`, `"trace"`, `"audio"`).
* These words are chosen to maximize coverage of common letters.
* Randomly pick one as the first guess.

### **Step 2: Submit guess to the server**

* Send the guess to the `/check` endpoint.
* The server returns **feedback**:

  * `0` → Letter not in word
  * `1` → Letter in word, wrong position
  * `2` → Letter correct and in correct position

### **Step 3: Filter candidate words**

* Maintain a **list of all possible words** from `words.txt`.
* After each guess, filter this list to only words that match the **feedback pattern** from the last guess.

**Matching rules:**

1. **2**: Candidate must have the letter in the exact position.
2. **1**: Candidate must contain the letter but **not in the same position**.
3. **0**: Candidate must **not contain that letter**, unless it was already used for a 2 or 1 elsewhere in the word (handles repeated letters).

This ensures that only **valid candidates** remain after each guess.

### **Step 4: Score candidate words**

* Count **letter frequencies** in remaining candidate words (each letter only counted once per word).
* For each candidate word, calculate a **score** = sum of frequencies of its letters.
* The word with the **highest score** is chosen as the next guess.

**Why:**
* Choosing high-frequency letters increases information gain and narrows down possible words faster.

### **Step 5: Make next guess**

* Pick the **highest scoring candidate** from Step 4.
* Submit it to the server and get feedback.
* Repeat Step 3 → Step 5 until the word is solved.

### **Step 6: Handle edge cases**

1. **Repeated letters**: Feedback comparison accounts for letters appearing more than once.
2. **Invalid guesses**: If the guess is not in the word list, it is ignored and another candidate is chosen.
3. **No possible words left**: If filtering eliminates all candidates (rare), log a failure and start a new game.

### **Step 7: Record results**

* For each game, store in `data.csv`:

  ```csv
  game_number, opener, final_word, attempts
  ```
* This allows statistical analysis and visualization of solver performance.


### **Algorithm Summary (Pseudo-code)**

```text
initialize word list from words.txt
choose a strong opening word as first guess
while word not solved:
    send guess to server
    get feedback array (0=gray, 1=yellow, 2=green)
    filter word list to only words matching feedback
    if no candidates left:
        log failure
        break
    score remaining words based on letter frequency
    choose highest scoring word as next guess
record game results (opener, final word, attempts)
```

---

