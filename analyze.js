const fs = require('fs');
const csv = require('csv-parser');
const readline = require('node:readline');
const chalk = require('chalk').default;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let validAnswers = [];
let validGuesses = [];
let possibleAnswers = [];
let answerFrequencies = {};

function countLetterFrequenciesByPosition(words) {
  const frequencies = Array.from({ length: 5 }, () => ({}));
  
  for (const word of words) {
    for (let i = 0; i < 5; i++) {
      const letter = word[i];
      frequencies[i][letter] = (frequencies[i][letter] || 0) + 1;
    }
  }
  return frequencies;
}

function scoreGuess(guess, frequencies) {
    let score = 0;
    const letterCounts = {};
    const seenLetters = new Set();

    for (let i = 0; i < 5; i++) {
        const letter = guess[i];
        score += frequencies[i][letter] || 0;
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        
        if (!seenLetters.has(letter)) {
            score += 15;
            seenLetters.add(letter);
        }
    }

    for (const letter in letterCounts) {
        if (letterCounts[letter] > 1) {
            const penalty = frequencies.some(pos => pos[letter] > 0) ? 40 : 20;
            score -= (letterCounts[letter] - 1) * penalty;
        }
    }

    return score;
}

function matchesFeedback(word, guess, feedback) {
    // Improved logic for repeated letters and strict yellow/black handling
    // Step 1: Mark greens
    const wordChars = word.split('');
    const guessChars = guess.split('');
    const feedbackArr = Array(5).fill('b');
    const wordUsed = Array(5).fill(false);
    const guessUsed = Array(5).fill(false);

    // First pass: Greens
    for (let i = 0; i < 5; i++) {
        if (guessChars[i] === wordChars[i]) {
            feedbackArr[i] = 'g';
            wordUsed[i] = true;
            guessUsed[i] = true;
        }
    }

    // Second pass: Yellows
    for (let i = 0; i < 5; i++) {
        if (!guessUsed[i]) {
            for (let j = 0; j < 5; j++) {
                if (!wordUsed[j] && guessChars[i] === wordChars[j]) {
                    feedbackArr[i] = 'y';
                    wordUsed[j] = true;
                    guessUsed[i] = true;
                    break;
                }
            }
        }
    }

    // Now compare feedbackArr to the provided feedback
    for (let i = 0; i < 5; i++) {
        if (feedbackArr[i] !== feedback[i]) return false;
    }
    return true;
}

function getTopGuesses(count = 10) {
  const candidateGuesses = [...new Set([...possibleAnswers, ...validGuesses])];
  const scoredGuesses = candidateGuesses.map(guess => ({
    guess,
    score: scoreGuess(guess, answerFrequencies) + (possibleAnswers.includes(guess) ? 50 : 0)
  }));

  return scoredGuesses
    .sort((a, b) => b.score - a.score || a.guess.localeCompare(b.guess))
    .slice(0, count);
}

function displayTopGuesses(guesses) {
  console.log('\n' + chalk.bold.underline('TOP SUGGESTIONS') + '\n');

  guesses.forEach((g, i) => {
    const rank = `${i + 1}.`.padEnd(4);
    const score = `Score: ${g.score.toFixed(1)}`.padEnd(12);
    console.log(`${rank} ${chalk.bold(g.guess.toUpperCase())}  ${score}`);
  });

  const possibleCount = possibleAnswers.length;
  console.log(`\n${chalk.cyan.bold('POSSIBLE ANSWERS REMAINING:')} ${chalk.bold(possibleCount)}`);

  if (possibleCount === 0) {
    console.log(chalk.red('\nNo possible solutions match your feedback. Check your inputs.'));
  }
}

function handleFeedback(guess, feedback) {
  possibleAnswers = possibleAnswers.filter(word => 
    matchesFeedback(word, guess, feedback)
  );

  if (possibleAnswers.length === 0) {
    console.log("No possible answers match your feedback. Check your inputs.");
  }

  answerFrequencies = countLetterFrequenciesByPosition(possibleAnswers);
  return true;
}

fs.createReadStream('wordle.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (row.validWordleGuess) validGuesses.push(row.validWordleGuess.toLowerCase());
    if (row.validWordleAnswer && row.validWordleAnswer.trim() !== '') {
      validAnswers.push(row.validWordleAnswer.toLowerCase());
    }
  })
  .on('end', () => {
    validGuesses = [...new Set(validGuesses)];
    validAnswers = [...new Set(validAnswers)];
    possibleAnswers = [...validAnswers];
    
    answerFrequencies = countLetterFrequenciesByPosition(possibleAnswers);
    
    console.log('\nRecommended first guesses:');
    const topInitialGuesses = getTopGuesses(15);
    displayTopGuesses(topInitialGuesses);

    startGameLoop();
  });

function startGameLoop() {
  function askGuess() {
    rl.question('\nEnter your guess (or type "exit" to quit): ', (input) => {
      const guess = input.toLowerCase();
      
      if (guess === 'exit') {
        rl.close();
        return;
      }
      
      if (!guess) {
        console.log('Invalid guess.');
        return askGuess();
      }

      askFeedback(guess);
    });
  }

  function askFeedback(guess) {
    rl.question('Enter result (g/y/b for green/yellow/black): ', (feedback) => {
      feedback = feedback.toLowerCase().trim();
      
      if (feedback === 'exit') {
        rl.close();
        return;
      }
      
      if (!/^[gyb]{5}$/.test(feedback)) {
        console.log('Invalid feedback. Use exactly 5 characters (g, y, b).');
        return askFeedback(guess);
      }

      if (feedback === 'ggggg') {
        console.log(`\nSolved! Final answer: ${guess}`);
        rl.close();
        return;
      }

      handleFeedback(guess, feedback);
      const topGuesses = getTopGuesses();
      displayTopGuesses(topGuesses);
      askGuess();
    });
  }

  askGuess();
}