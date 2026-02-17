class HandCricket {
    constructor() {
        this.gameState = {
            playerScore: 0,
            computerScore: 0,
            playerWickets: 0,
            computerWickets: 0,
            playerBalls: 0,
            computerBalls: 0,
            currentInnings: 1,
            playerBatting: true,
            target: 0,
            gameOver: false,
            maxOvers: 2,
            maxWickets: 1
        };
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.bindEvents();
        this.showTossSection(false);
        this.showGameBoard(false);
    }
    
    bindEvents() {
        document.getElementById('tossBtn').addEventListener('click', () => this.showOversSection());
        document.querySelectorAll('.overs-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectOvers(parseInt(e.target.dataset.overs)));
        });
        document.querySelectorAll('.toss-choice').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleToss(e.target.dataset.choice));
        });
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleChoice(e.target.dataset.choice));
        });
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.playTurn(parseInt(e.target.dataset.value)));
        });
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
    }
    
    showOversSection() {
        document.getElementById('oversSection').style.display = 'block';
        document.getElementById('tossBtn').style.display = 'none';
    }
    
    selectOvers(overs) {
        this.gameState.maxOvers = overs;
        document.getElementById('oversSection').style.display = 'none';
        this.showTossSection(true);
    }
    
    startToss() {
        this.showTossSection(true);
        document.getElementById('tossBtn').style.display = 'none';
    }
    
    handleToss(playerChoice) {
        const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
        const playerWon = playerChoice === coinResult;
        
        const resultDiv = document.getElementById('tossResult');
        resultDiv.innerHTML = `
            <p>Coin landed on: <strong>${coinResult.toUpperCase()}</strong></p>
            <p>${playerWon ? 'You won the toss!' : 'Computer won the toss!'}</p>
        `;
        
        this.gameState.tossWinner = playerWon ? 'player' : 'computer';
        
        setTimeout(() => {
            this.showTossSection(false);
            if (playerWon) {
                this.showChoiceSection(true);
            } else {
                const computerChoice = Math.random() < 0.5 ? 'bat' : 'ball';
                this.gameState.playerBatting = computerChoice === 'ball';
                this.showGameBoard(true);
                this.updateDisplay();
            }
        }, 2000);
    }
    
    playTurn(playerChoice) {
        if (this.gameState.gameOver) return;
        
        const computerChoice = Math.floor(Math.random() * 7);
        
        this.updateChoiceDisplay(playerChoice, computerChoice);
        
        if (this.gameState.playerBatting) {
            this.handleBattingTurn(playerChoice, computerChoice);
        } else {
            this.handleBowlingTurn(playerChoice, computerChoice);
        }
        
        this.updateDisplay();
        this.checkInningsEnd();
    }
    
    handleBattingTurn(playerChoice, computerChoice) {
        this.gameState.playerBalls++;
        
        if (playerChoice === computerChoice) {
            this.gameState.playerWickets++;
            this.addToLog(`OUT! You chose ${playerChoice}, Computer chose ${computerChoice}`);
        } else {
            this.gameState.playerScore += playerChoice;
            this.addToLog(`${playerChoice} runs! You: ${playerChoice}, Computer: ${computerChoice}`);
        }
    }
    
    handleBowlingTurn(playerChoice, computerChoice) {
        this.gameState.computerBalls++;
        
        if (playerChoice === computerChoice) {
            this.gameState.computerWickets++;
            this.addToLog(`WICKET! You chose ${playerChoice}, Computer chose ${computerChoice}`);
        } else {
            this.gameState.computerScore += computerChoice;
            this.addToLog(`Computer scored ${computerChoice} runs! You: ${playerChoice}, Computer: ${computerChoice}`);
        }
    }
    
    checkInningsEnd() {
        const currentBalls = this.gameState.playerBatting ? this.gameState.playerBalls : this.gameState.computerBalls;
        const currentWickets = this.gameState.playerBatting ? this.gameState.playerWickets : this.gameState.computerWickets;
        const maxBalls = this.gameState.maxOvers * 6;
        
        const inningsEnd = currentBalls >= maxBalls || currentWickets >= this.gameState.maxWickets;
        
        if (this.gameState.currentInnings === 2 && !this.gameState.playerBatting) {
            if (this.gameState.computerScore > this.gameState.target) {
                this.endGame();
                return;
            }
        }
        
        if (this.gameState.currentInnings === 2 && this.gameState.playerBatting) {
            if (this.gameState.playerScore > this.gameState.target) {
                this.endGame();
                return;
            }
        }
        
        if (inningsEnd) {
            if (this.gameState.currentInnings === 1) {
                this.startSecondInnings();
            } else {
                this.endGame();
            }
        }
    }
    
    startSecondInnings() {
        this.gameState.currentInnings = 2;
        this.gameState.playerBatting = !this.gameState.playerBatting;
        
        if (this.gameState.playerBatting) {
            this.gameState.target = this.gameState.computerScore + 1;
        } else {
            this.gameState.target = this.gameState.playerScore + 1;
        }
        
        this.addToLog(`--- Second Innings Started ---`);
        this.addToLog(`Target: ${this.gameState.target} runs`);
        this.updateDisplay();
    }
    
    endGame() {
        this.gameState.gameOver = true;
        
        let winner, resultText;
        
        if (this.gameState.currentInnings === 1) {
            if (this.gameState.playerScore > this.gameState.computerScore) {
                winner = 'player';
                resultText = `🎉 You Won!<br>Your Score: ${this.gameState.playerScore}<br>Computer Score: ${this.gameState.computerScore}`;
            } else if (this.gameState.computerScore > this.gameState.playerScore) {
                winner = 'computer';
                resultText = `😔 Computer Won!<br>Computer Score: ${this.gameState.computerScore}<br>Your Score: ${this.gameState.playerScore}`;
            } else {
                winner = 'tie';
                resultText = `🤝 It's a Tie!<br>Both scored: ${this.gameState.playerScore}`;
            }
        } else {
            if (this.gameState.playerBatting) {
                if (this.gameState.playerScore >= this.gameState.target) {
                    winner = 'player';
                    const ballsLeft = (this.gameState.maxOvers * 6) - this.gameState.playerBalls;
                    const wicketsLeft = this.gameState.maxWickets - this.gameState.playerWickets;
                    resultText = `🎉 You Won!<br>Won by ${wicketsLeft} wickets and ${ballsLeft} balls remaining`;
                } else {
                    winner = 'computer';
                    const deficit = this.gameState.target - this.gameState.playerScore - 1;
                    resultText = `😔 Computer Won!<br>You fell short by ${deficit} runs`;
                }
            } else {
                if (this.gameState.computerScore >= this.gameState.target) {
                    winner = 'computer';
                    const ballsLeft = (this.gameState.maxOvers * 6) - this.gameState.computerBalls;
                    const wicketsLeft = this.gameState.maxWickets - this.gameState.computerWickets;
                    resultText = `😔 Computer Won!<br>Won by ${wicketsLeft} wickets and ${ballsLeft} balls remaining`;
                } else {
                    winner = 'player';
                    const deficit = this.gameState.target - this.gameState.computerScore - 1;
                    resultText = `🎉 You Won!<br>Computer fell short by ${deficit} runs`;
                }
            }
        }
        
        this.showResult(resultText);
    }
    
    updateChoiceDisplay(playerChoice, computerChoice) {
        const userChoiceEl = document.getElementById('userChoice');
        const compChoiceEl = document.getElementById('compChoice');
        
        userChoiceEl.textContent = playerChoice;
        compChoiceEl.textContent = computerChoice;
        
        userChoiceEl.classList.add('animate');
        compChoiceEl.classList.add('animate');
        
        setTimeout(() => {
            userChoiceEl.classList.remove('animate');
            compChoiceEl.classList.remove('animate');
        }, 500);
    }
    
    updateDisplay() {
        document.getElementById('playerScore').textContent = this.gameState.playerScore;
        document.getElementById('computerScore').textContent = this.gameState.computerScore;
        document.getElementById('playerWickets').textContent = this.gameState.playerWickets;
        document.getElementById('computerWickets').textContent = this.gameState.computerWickets;
        
        const playerOvers = Math.floor(this.gameState.playerBalls / 6) + '.' + (this.gameState.playerBalls % 6);
        const computerOvers = Math.floor(this.gameState.computerBalls / 6) + '.' + (this.gameState.computerBalls % 6);
        
        document.getElementById('playerOvers').textContent = playerOvers;
        document.getElementById('computerOvers').textContent = computerOvers;
        document.getElementById('maxOvers').textContent = this.gameState.maxOvers;
        document.getElementById('maxOversComp').textContent = this.gameState.maxOvers;
        
        const inningsText = this.gameState.currentInnings === 1 ? 'First Innings' : 'Second Innings';
        const battingText = this.gameState.playerBatting ? 'You are batting' : 'You are bowling';
        document.getElementById('currentInnings').textContent = `${inningsText} - ${battingText}`;
        
        if (this.gameState.target > 0) {
            document.getElementById('target').style.display = 'block';
            document.getElementById('targetScore').textContent = this.gameState.target;
        }
    }
    
    addToLog(message) {
        const logContent = document.getElementById('logContent');
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = message;
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
    }
    
    showTossSection(show) {
        document.getElementById('tossSection').style.display = show ? 'block' : 'none';
    }
    
    showChoiceSection(show) {
        document.getElementById('choiceSection').style.display = show ? 'block' : 'none';
    }
    
    handleChoice(choice) {
        this.gameState.playerBatting = choice === 'bat';
        this.showChoiceSection(false);
        this.showGameBoard(true);
        this.updateDisplay();
    }
    
    showGameBoard(show) {
        document.getElementById('gameBoard').style.display = show ? 'block' : 'none';
    }
    
    showResult(resultText) {
        document.getElementById('resultTitle').innerHTML = resultText.split('<br>')[0];
        document.getElementById('resultDetails').innerHTML = resultText.split('<br>').slice(1).join('<br>');
        document.getElementById('gameResult').style.display = 'flex';
    }
    
    resetGame() {
        this.gameState = {
            playerScore: 0,
            computerScore: 0,
            playerWickets: 0,
            computerWickets: 0,
            playerBalls: 0,
            computerBalls: 0,
            currentInnings: 1,
            playerBatting: true,
            target: 0,
            gameOver: false,
            maxOvers: 2,
            maxWickets: 1
        };
        
        document.getElementById('gameResult').style.display = 'none';
        document.getElementById('tossBtn').style.display = 'inline-block';
        document.getElementById('target').style.display = 'none';
        document.getElementById('logContent').innerHTML = '';
        document.getElementById('userChoice').textContent = '?';
        document.getElementById('compChoice').textContent = '?';
        document.getElementById('tossResult').innerHTML = '';
        
        document.getElementById('oversSection').style.display = 'none';
        this.showTossSection(false);
        this.showChoiceSection(false);
        this.showGameBoard(false);
        this.updateDisplay();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HandCricket();
});