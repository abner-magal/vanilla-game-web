// Imports removed for local compatibility

const SoundFX = {
  ctx: null,
  volume: 0.5,
  muted: false,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  playTone(freq, type, duration, vol = 0.1) {
    if (this.muted || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Master volume * effect volume
    const finalVol = this.volume * vol;

    gainNode.gain.setValueAtTime(finalVol, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  flip() {
    this.playTone(600, 'sine', 0.1, 0.1);
  },

  match() {
    setTimeout(() => this.playTone(523.25, 'sine', 0.2, 0.2), 0);
    setTimeout(() => this.playTone(659.25, 'sine', 0.4, 0.2), 100);
  },

  mismatch() {
    this.playTone(150, 'sawtooth', 0.3, 0.1);
  },

  win() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 'square', 0.3, 0.15), i * 150);
    });
  },

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  },

  getVolume() {
    return this.volume;
  }
};

class MemoryMatchGame extends GameEngine {
  constructor() {
    super({ containerId: 'game-container' });
    // Constructor should be empty or minimal because GameEngine calls init()
  }

  init() {
    // Initialize Game State
    this.cards = [];
    this.hasFlippedCard = false;
    this.lockBoard = false;
    this.firstCard = null;
    this.secondCard = null;
    this.moves = 0;
    this.matches = 0;
    this.totalPairs = 8;
    this.startTime = 0;
    this.elapsedSeconds = 0;
    this.timeLimitBase = 120;
    this.timeLimitSeconds = this.timeLimitBase;
    this.timerInterval = null;
    this.isPaused = false;
    this.currentLevel = 'medium';
    this.activeLevel = this.currentLevel;

    // UI Elements (Direct access instead of Components to match custom styling)
    this.scoreElement = document.getElementById('score');
    this.timerElement = document.getElementById('timer');
    this.highScoreDisplay = document.getElementById('high-score');

    // Audio Manager
    SoundFX.init();
    if (window.VolumeControl) {
      this.volumeControl = new window.VolumeControl('volume-control', {
        audio: {
          getVolume: () => SoundFX.getVolume(),
          setVolume: (value) => {
            SoundFX.setVolume(value);
            SoundFX.init();
          },
          play: () => SoundFX.playTone(440, 'sine', 0.1, 0.1),
        },
        onFeedback: () => SoundFX.playTone(440, 'sine', 0.1, 0.1),
      });
    }

    // Overlays
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.finalScoreDisplay = document.getElementById('final-score');

    // Buttons
    this.btnStart = document.getElementById('btn-start');
    this.btnRestart = document.getElementById('btn-restart');
    this.btnPause = document.getElementById('btn-pause');

    // Difficulty Selector
    if (window.DifficultySelector) {
      this.difficultySelector = new window.DifficultySelector('difficulty-control', {
        gameId: 'memory-match',
        defaultLevel: this.currentLevel,
        onChange: (level) => this.onDifficultyChange(level),
      });
      this.currentLevel = this.difficultySelector?.getLevel?.() || this.currentLevel;
    }

    // Event Listeners
    if (this.btnStart) this.btnStart.addEventListener('click', () => this.startGame());
    if (this.btnRestart) this.btnRestart.addEventListener('click', () => this.restartGame());
    if (this.btnPause) this.btnPause.addEventListener('click', () => this.togglePause());

    this.updateHighScoreDisplay();

    // Show start screen on init
    if (this.startScreen) this.startScreen.classList.add('active');
    if (this.gameOverScreen) this.gameOverScreen.classList.remove('active');
  }

  startGame() {
    if (this.state.isPlaying) return;

    if (this.startScreen) this.startScreen.classList.remove('active');
    if (this.gameOverScreen) this.gameOverScreen.classList.remove('active');

    this.activeLevel = this.currentLevel;
    this.resetGameData();
    this.createBoard();

    super.start();
    this.startTimer();
    SoundFX.playTone(600, 'sine', 0.3, 0.2); // Start sound
  }

  restartGame() {
    this.stopTimer();
    this.startGame();
  }

  resetGameData() {
    this.moves = 0;
    this.matches = 0;
    this.hasFlippedCard = false;
    this.lockBoard = false;
    this.firstCard = null;
    this.secondCard = null;
    this.isPaused = false;
    this.elapsedSeconds = 0;

    const params = window.DifficultyManager?.getParams(this.activeLevel) || { timeMultiplier: 1 };
    this.timeLimitSeconds = Math.round(this.timeLimitBase * params.timeMultiplier);

    this.updateUI();

    if (this.btnPause) this.btnPause.innerHTML = '<span class="material-symbols-outlined">pause</span>';
  }

  updateUI() {
    if (this.scoreElement) this.scoreElement.textContent = this.moves;
    if (this.timerElement) this.timerElement.textContent = this.formatTime(0);
  }

  createBoard() {
    const board = document.getElementById('game-board');
    if (!board) return;

    board.innerHTML = '';
    this.cards = [];

    const emojis = ['🍕', '🚀', '🐱', '🌵', '🎸', '🍦', '💎', '🎈'];
    const deck = [...emojis, ...emojis];
    deck.sort(() => 0.5 - Math.random());

    deck.forEach((emoji, index) => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.dataset.emoji = emoji;
      // Staggered animation delay
      card.style.animationDelay = `${index * 0.05}s`;

      card.innerHTML = `
                <div class="front-face">${emoji}</div>
                <div class="back-face">?</div>
            `;

      const clickHandler = () => this.flipCard(card);
      card._clickHandler = clickHandler;
      card.addEventListener('click', clickHandler);
      board.appendChild(card);
      this.cards.push(card);
    });
  }

  flipCard(card) {
    if (this.lockBoard || this.isPaused) return;
    if (card === this.firstCard) return;
    if (card.classList.contains('flip')) return;

    SoundFX.init(); // Ensure context is running
    card.classList.add('flip');
    SoundFX.flip();

    if (!this.hasFlippedCard) {
      this.hasFlippedCard = true;
      this.firstCard = card;
      return;
    }

    this.secondCard = card;
    this.checkForMatch();
  }

  checkForMatch() {
    this.moves++;
    if (this.scoreElement) this.scoreElement.textContent = this.moves;

    let isMatch =
      this.firstCard.dataset.emoji === this.secondCard.dataset.emoji;

    isMatch ? this.disableCards() : this.unflipCards();
  }

  disableCards() {
    if (this.firstCard && this.firstCard._clickHandler) {
      this.firstCard.removeEventListener('click', this.firstCard._clickHandler);
    }
    if (this.secondCard && this.secondCard._clickHandler) {
      this.secondCard.removeEventListener('click', this.secondCard._clickHandler);
    }

    this.firstCard.classList.add('matched');
    this.secondCard.classList.add('matched');
    SoundFX.match();

    this.matches++;
    this.resetBoard();

    if (this.matches === this.totalPairs) {
      setTimeout(() => this.endGame(), 500);
    }
  }

  unflipCards() {
    this.lockBoard = true;
    setTimeout(() => SoundFX.mismatch(), 400);

    setTimeout(() => {
      this.firstCard.classList.remove('flip');
      this.secondCard.classList.remove('flip');
      this.resetBoard();
    }, 1000);
  }

  resetBoard() {
    [this.hasFlippedCard, this.lockBoard] = [false, false];
    [this.firstCard, this.secondCard] = [null, null];
  }

  startTimer() {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const remaining = Math.max(0, this.timeLimitSeconds - this.elapsedSeconds);
        if (this.timerElement) this.timerElement.textContent = this.formatTime(this.elapsedSeconds);

        if (this.elapsedSeconds >= this.timeLimitSeconds) {
          this.handleTimeout();
        }
      } else {
        // Adjust start time to account for pause duration
        this.startTime += 1000;
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  togglePause() {
    if (!this.state.isPlaying) return;

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      if (this.btnPause) {
        this.btnPause.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
        this.btnPause.classList.add('bg-brand-500', 'text-white');
        this.btnPause.classList.remove('bg-slate-700/50', 'text-brand-400');
      }
    } else {
      if (this.btnPause) {
        this.btnPause.innerHTML = '<span class="material-symbols-outlined">pause</span>';
        this.btnPause.classList.remove('bg-brand-500', 'text-white');
        this.btnPause.classList.add('bg-slate-700/50', 'text-brand-400');
      }
    }
  }

  endGame() {
    super.stop();
    this.stopTimer();
    SoundFX.win();

    const finalTime = this.elapsedSeconds;
    if (this.finalScoreDisplay) this.finalScoreDisplay.textContent = this.formatTime(finalTime);
    if (this.gameOverScreen) this.gameOverScreen.classList.add('active');

    // Higher-is-better normalization to reuse DifficultyManager.
    const normalizedScore = Math.max(0, 100000 - finalTime);
    window.DifficultyManager?.saveHighScore('memory-match', this.activeLevel, normalizedScore);
    this.saveBestTime(finalTime);
    this.updateHighScoreDisplay();
  }

  updateHighScoreDisplay() {
    if (this.highScoreDisplay) {
      const bestSeconds = this.getBestTime();
      this.highScoreDisplay.textContent = Number.isFinite(bestSeconds)
        ? this.formatTime(bestSeconds)
        : '-';
    }
  }

  saveBestTime(seconds) {
    const key = this.getBestTimeKey();
    const current = this.getBestTime();
    if (!Number.isFinite(current) || seconds < current) {
      GameStorage.set(key, seconds);
    }
  }

  getBestTime() {
    const stored = GameStorage.get(this.getBestTimeKey());
    const value = typeof stored === 'number' ? stored : Number(stored);
    return Number.isFinite(value) ? value : null;
  }

  getBestTimeKey() {
    return `memory-match_best_time_${this.currentLevel}`;
  }

  onDifficultyChange(level) {
    if (this.state.isPlaying) return; // apply after current run
    this.currentLevel = level || 'medium';
    this.updateHighScoreDisplay();
    // Reset timer UI for the newly selected level
    if (this.timerElement) this.timerElement.textContent = this.formatTime(0);
  }

  handleTimeout() {
    this.stopTimer();
    super.stop();
    if (this.gameOverScreen) this.gameOverScreen.classList.add('active');
    if (this.finalScoreDisplay) this.finalScoreDisplay.textContent = this.formatTime(this.elapsedSeconds);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new MemoryMatchGame();
});