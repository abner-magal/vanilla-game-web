// Imports removed for local compatibility

class WhackAMoleGame extends GameEngine {
  constructor() {
    super({ containerId: 'game-container' });
  }

  init() {
    // Game State
    this.lastHole = null;
    this.timeUp = false;
    this.score = 0;
    this.baseGameTime = 30;
    this.gameTime = this.baseGameTime;
    this.level = 1;
    this.isPaused = false;
    this.peepTimeout = null;
    this.countdownInterval = null;
    this.timeLeft = this.gameTime;
    this.difficultyLevel = 'medium';
    this.difficultyParams = { speedMultiplier: 1, timeMultiplier: 1 };

    // Audio State
    this.volume = 0.5; // 0-1
    this.audioCtx = null;
    
    // UI Elements
    this.scoreBoard = document.getElementById('score-board');
    this.timerDisplay = document.getElementById('timer');
    this.levelDisplay = document.getElementById('level-display');
    this.highScoreDisplay = document.getElementById('high-score');
    this.startBtn = document.getElementById('btn-start');
    this.pauseBtn = document.getElementById('btn-pause');
    this.startOverlay = document.getElementById('start-overlay');
    this.gameBoard = document.getElementById('game-board');
    
    // Cursor Elements
    this.cursorContainer = document.getElementById('cursor-container');
    this.hammerVisual = document.getElementById('hammer-visual');
    this.hammerActive = false;

    // Load High Score
    if (this.highScoreDisplay) {
      this.highScoreDisplay.textContent = 0;
    }

    this.createBoard();
    this.setupAudio();
    this.setupEventListeners();

    if (window.VolumeControl) {
      this.volumeControl = new window.VolumeControl('volume-control', {
        audio: {
          getVolume: () => this.getVolume(),
          setVolume: (v) => this.setVolume(v),
          play: () => this.playPeep(),
        },
        onFeedback: () => this.playPeep(),
      });
    }

    if (window.DifficultySelector && window.DifficultyManager) {
      this.difficultySelector = new window.DifficultySelector('difficulty-control', {
        gameId: 'whack-a-mole',
        defaultLevel: 'medium',
        onChange: (level) => this.applyDifficulty(level),
      });
      this.applyDifficulty(this.difficultySelector.getLevel());
    } else {
      this.applyDifficulty('medium');
    }
  }

  /**
   * Audio System (Synthesizer)
   */
  setupAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.connect(this.audioCtx.destination);
      this.setVolume(this.volume);
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  setVolume(volume) {
    if (!this.masterGain || !this.audioCtx) return;
    const clamped = Math.max(0, Math.min(1, volume));
    this.volume = clamped;
    this.masterGain.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
  }

  getVolume() {
    if (!this.masterGain) return 0;
    return this.masterGain.gain.value;
  }

  playTone(freq, type, duration) {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    // Envelope
    gain.gain.setValueAtTime(this.masterGain.gain.value * 0.2, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playPeep() {
    // Higher pitch "pop"
    this.playTone(600, 'sine', 0.1);
  }

  playBonk() {
    // Retro "hit" sound
    this.playTone(150, 'square', 0.15);
    setTimeout(() => this.playTone(100, 'square', 0.1), 50);
  }

  playGameOver() {
    this.playTone(300, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(200, 'sawtooth', 0.4), 250);
  }

  /**
   * Game Board Setup
   */
  createBoard() {
    this.gameBoard.innerHTML = '';
    this.holes = [];
    this.moles = [];

    for (let i = 0; i < 9; i++) {
      const hole = document.createElement('div');
      hole.classList.add('mole-hole');

      const mole = document.createElement('div');
      mole.classList.add('mole');
      // Use mousedown for faster reaction than click
      mole.addEventListener('mousedown', (e) => this.bonk(e));
      // Touch support
      mole.addEventListener('touchstart', (e) => {
          e.preventDefault(); // prevent mouse emulation
          this.bonk(e);
      });

      hole.appendChild(mole);
      this.gameBoard.appendChild(hole);

      this.holes.push(hole);
      this.moles.push(mole);
    }
  }

  /**
   * Controls & Logic
   */
  setupEventListeners() {
    const moveHammer = (e) => {
      if (!this.hammerActive || this.isPaused || this.timeUp) return;
      const x = e.clientX;
      const y = e.clientY;
      this.cursorContainer.style.transform = `translate3d(${x - 20}px, ${y - 40}px, 0)`;
    };

    const hammerDown = () => {
      if (!this.hammerActive || this.isPaused) return;
      this.hammerVisual.classList.add('hitting');
      setTimeout(() => this.hammerVisual.classList.remove('hitting'), 140);
    };

    const hammerUp = () => {
      this.hammerVisual.classList.remove('hitting');
    };

    // Start
    this.startBtn.addEventListener('click', () => this.startGame());
    
    // Pause
    this.pauseBtn.addEventListener('click', () => this.togglePause());

    // Hammer Cursor Logic
    this.gameBoard.addEventListener('mouseenter', () => {
      this.hammerActive = true;
      this.showHammer();
    });

    this.gameBoard.addEventListener('mouseleave', () => {
      this.hammerActive = false;
      this.hideHammer();
    });

    document.addEventListener('mousemove', moveHammer);
    document.addEventListener('mousedown', hammerDown);
    document.addEventListener('mouseup', hammerUp);
  }

  togglePause() {
    if (this.timeUp && !this.state.isPlaying) return;
    
    this.isPaused = !this.isPaused;
    document.body.classList.toggle('game-paused', this.isPaused);
    
    const icon = this.pauseBtn.querySelector('span');
    
    if (this.isPaused) {
        icon.textContent = 'play_arrow';
        if (this.peepTimeout) clearTimeout(this.peepTimeout);
        if (this.countdownInterval) clearInterval(this.countdownInterval);
    } else {
        icon.textContent = 'pause';
        this.peep(); // Resume peeping
        this.startTimer(); // Resume timer
    }
  }

  /**
   * Core Game Loop
   */
  randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === this.lastHole) {
      return this.randomHole(holes);
    }
    this.lastHole = hole;
    return hole;
  }

  getDifficulty() {
      // Speed increases with level
      // Level 1: 1000-2000ms
      // Level 5: 400-800ms
      const baseMin = 1000 - (this.level * 150);
      const baseMax = 2000 - (this.level * 250);
      const factor = this.difficultyParams.timeMultiplier / this.difficultyParams.speedMultiplier;
      return {
        min: Math.max(200, Math.round(baseMin * factor)),
        max: Math.max(500, Math.round(baseMax * factor))
      };
  }

  peep() {
    if (this.timeUp || this.isPaused) return;

    const { min, max } = this.getDifficulty();
    const time = this.randomTime(min, max);
    const hole = this.randomHole(this.holes);
    
    hole.classList.add('up');
    this.playPeep();

    this.peepTimeout = setTimeout(() => {
      hole.classList.remove('up');
      // Remove bonk class if it was hit
      const mole = hole.querySelector('.mole');
      if (mole) mole.classList.remove('bonk');
      
      if (!this.timeUp && !this.isPaused) this.peep();
    }, time);
  }

  startGame() {
    if (this.state.isPlaying) return;

    // Reset State
    this.resetScore();
    this.timeUp = false;
    this.level = 1;
    this.levelDisplay.textContent = this.level;
    this.timeLeft = this.gameTime;
    this.isPaused = false;
    this.state.isPlaying = true; // GameEngine state
    
    // UI Reset
    this.startOverlay.classList.add('hidden');
    this.timerDisplay.textContent = this.timeLeft;
    this.pauseBtn.disabled = false;
    document.body.classList.remove('game-paused');

    // Start Loop
    this.peep();
    this.startTimer();
    
    // Resume Audio Context if needed
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
    }
  }

  startTimer() {
      if (this.countdownInterval) clearInterval(this.countdownInterval);
      
      this.countdownInterval = setInterval(() => {
          this.timeLeft--;
          this.timerDisplay.textContent = this.timeLeft < 10 ? `0${this.timeLeft}` : this.timeLeft;
          
          if (this.timeLeft <= 0) {
              clearInterval(this.countdownInterval);
              this.timeUp = true;
              this.endGame();
          }
      }, 1000);
  }

  bonk(e) {
    if (!e.isTrusted || this.isPaused) return; 
    
    const mole = e.target;
    const hole = mole.parentNode;

    // Verify mole is visible before scoring
    if (!hole.classList.contains('up')) return;

    // Success Hit - increment score
    this.incrementScore(10);
    hole.classList.remove('up'); // Hide immediately
    
    // Visual Feedback
    mole.classList.add('bonk');
    this.playBonk();
    
    // Level Up Logic (Every 100 points)
    const newLevel = Math.floor(this.score / 100) + 1;
    if (newLevel > this.level && newLevel <= 10) {
        this.level = newLevel;
        this.levelDisplay.textContent = this.level;
        // Flash level display
        this.levelDisplay.style.color = '#fff';
        setTimeout(() => this.levelDisplay.style.color = '', 300);
    }
  }

  /**
   * Score Management
   */
  incrementScore(points) {
    this.score += points;
    this.updateScoreDisplay();
  }

  resetScore() {
    this.score = 0;
    this.updateScoreDisplay();
  }

  updateScoreDisplay() {
    if (this.scoreBoard) {
      this.scoreBoard.textContent = this.score;
    }
  }

  endGame() {
    this.state.isPlaying = false;
    this.playGameOver();
    this.startOverlay.classList.remove('hidden');
    this.startBtn.textContent = 'PLAY AGAIN';

    this.saveHighScore();
  }

  showHammer() {
    if (this.cursorContainer) {
      this.cursorContainer.classList.remove('hidden');
      this.cursorContainer.classList.add('is-visible');
    }
    if (this.gameBoard) {
      this.gameBoard.classList.add('hammer-mode');
    }
  }

  hideHammer() {
    if (this.cursorContainer) {
      this.cursorContainer.classList.remove('is-visible');
    }
    if (this.gameBoard) {
      this.gameBoard.classList.remove('hammer-mode');
    }
  }

  applyDifficulty(level) {
    this.difficultyLevel = this.normalizeLevel(level);
    this.difficultyParams = window.DifficultyManager
      ? window.DifficultyManager.getParams(this.difficultyLevel)
      : { speedMultiplier: 1, timeMultiplier: 1 };

    this.gameTime = Math.round(this.baseGameTime * this.difficultyParams.timeMultiplier);
    this.timeLeft = this.gameTime;
    if (this.timerDisplay) {
      this.timerDisplay.textContent = this.timeLeft;
    }

    this.updateHighScoreDisplay();
  }

  saveHighScore() {
    if (window.DifficultyManager) {
      const updated = window.DifficultyManager.saveHighScore('whack-a-mole', this.difficultyLevel, this.score);
      if (updated && this.highScoreDisplay) this.highScoreDisplay.textContent = this.score;
      return;
    }
    if (typeof GameStorage !== 'undefined' && GameStorage.setHighScore('whack-a-mole', this.score) && this.highScoreDisplay) {
      this.highScoreDisplay.textContent = this.score;
    }
  }

  updateHighScoreDisplay() {
    if (!this.highScoreDisplay) return;
    if (window.DifficultyManager) {
      const high = window.DifficultyManager.getHighScore('whack-a-mole', this.difficultyLevel);
      this.highScoreDisplay.textContent = high;
      return;
    }
    if (typeof GameStorage !== 'undefined') {
      this.highScoreDisplay.textContent = GameStorage.getHighScore('whack-a-mole', 0);
    }
  }

  normalizeLevel(level) {
    const value = typeof level === 'string' ? level.trim().toLowerCase() : '';
    return ['easy', 'medium', 'hard'].includes(value) ? value : 'medium';
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  new WhackAMoleGame();
});
