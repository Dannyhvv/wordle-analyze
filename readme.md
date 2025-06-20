# Wordle Analyze

A command-line tool to help you solve Wordle puzzles efficiently by suggesting optimal guesses and narrowing down possible answers based on your feedback.

## Features
- Recommends the best starting guesses for Wordle.
- After each guess and feedback, shows:
  - Top guesses (for information and solution)
  - Top possible answers (most likely solutions)
  - Remaining possible answers (if 20 or fewer)
- Interactive prompt for entering guesses and feedback.

## Requirements
- Node.js (v16 or higher recommended)
- npm (Node package manager)

## Setup
1. Clone or download this repository.
2. Ensure you have a `wordle.csv` file in the project directory. This file should contain columns `validWordleGuess` and `validWordleAnswer`.
3. Install dependencies:
   ```sh
   npm install chalk csv-parser
   ```

## Usage
1. Open a terminal in the project directory.
2. Run the script:
   ```sh
   node analyze.js
   ```
3. Follow the prompts:
   - Enter your guess (5-letter word).
   - Enter the result using `g` (green), `y` (yellow), and `b` (black/gray) for each letter. For example, `gybgb`.
   - Type `exit` at any prompt to quit.

## Example
```
Recommended first guesses:
1. slate: 123.4
2. crate: 120.1
...

Enter your guess (or type "exit" to quit): crate
Enter result (g/y/b for green/yellow/black): byybb

Top guesses:
1. ...

Top possible answers:
1. ...

Possible answers remaining: 8
Possible words: ...
```

## Notes
- The tool recalculates the best guesses and possible answers after each round of feedback.
- If no possible answers remain, you can continue playing and try different guesses. The tool will not stop the game.
- The feedback logic now matches Wordle's handling of repeated letters and yellow/green feedback, so results are more accurate for tricky cases (e.g., repeated letters in guess or answer).
- Note: Occasionally, the official Wordle may use a word as the answer that is only in the guess list (not the answer list). In these rare cases, this tool may not suggest or recognize the correct answer.

## License
MIT
