class SimonSaysGame extends GameEngine {
  constructor() {
    super({ containerId: 'game-container' });
  }

  init() {
    // -- DOM Elements --
    this.buttons = {
      green: document.querySelector('.simon-btn.green'),
      red: document.querySelector('.simon-btn.red'),
      yellow: document.querySelector('.simon-btn.yellow'),
      blue: document.querySelector('.simon-btn.blue'),
    };

    this.displayLevel = document.getElementById('display-level');
    this.btnStart = document.getElementById('btn-start');
    this.btnStrict = document.getElementById('btn-strict');
    this.strictLed = document.getElementById('strict-led');
    this.message = document.getElementById('device-message');
    this.btnPause = document.getElementById('btn-pause');
    this.highScoreDisplay = document.getElementById('high-score');
    this.currentLevel = 'medium';
    this.activeLevel = this.currentLevel;

    // -- Game State --
    this.sequence = [];
    this.playerSequence = [];
    this.level = 0;
    this.strictMode = false;
    this.isComputerTurn = false;
    this.volume = 0.6;
    this.audioCtx = null;
    this.sequenceTimeout = null;
    this.colors = ['green', 'red', 'yellow', 'blue'];

    // -- Audio Frequencies (Matches Reference) --
    this.frequencies = {
      green: 164.8, // E3 approx
      red: 440,     // A4
      yellow: 277.2, // C#4
      blue: 329.6,  // E4
      error: 110    // A2
    };

    // -- Bindings --
    this.handleInputStart = this.handleInputStart.bind(this);
    this.handleInputEnd = this.handleInputEnd.bind(this);

    // Difficulty Selector
    if (window.DifficultySelector) {
      this.difficultySelector = new window.DifficultySelector('difficulty-control', {
        gameId: 'simon-says',
        defaultLevel: this.currentLevel,
        onChange: (level) => this.onDifficultyChange(level),
      });
      this.currentLevel = this.difficultySelector?.getLevel?.() || this.currentLevel;
      this.activeLevel = this.currentLevel;
    }

    // Initialize High Score
    this.updateHighScoreDisplay();

    if (window.VolumeControl) {
      this.volumeControl = new window.VolumeControl('volume-control', {
        audio: {
          getVolume: () => this.volume,
          setVolume: (value) => {
            this.volume = Math.max(0, Math.min(1, value));
            this.getAudioContext();
          },
          play: () => this.playTone('green', 0.1),
        },
        onFeedback: () => this.playTone('green', 0.1),
      });
    }

    // Event Listeners
    if (this.btnStart) this.btnStart.addEventListener('click', () => this.startGame());
    if (this.btnStrict) this.btnStrict.addEventListener('click', () => this.toggleStrict());
    if (this.btnPause) this.btnPause.addEventListener('click', () => this.togglePause());

    // Button Interactions
    Object.keys(this.buttons).forEach((color) => {
      const btn = this.buttons[color];
      if (btn) {
        // Mouse
        btn.addEventListener('mousedown', (e) => this.handleInputStart(color, e));
        window.addEventListener('mouseup', () => this.handleInputEnd(color)); // Window ensures release is caught
        
        // Touch
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent ghost clicks
            this.handleInputStart(color, e);
        });
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleInputEnd(color);
        });
      }
    });
  }

  startGame() {
    if (this.state.isPlaying) return;

    this.activeLevel = this.currentLevel;

    // Init Audio Context on user gesture
    this.getAudioContext();

    this.sequence = [];
    this.playerSequence = [];
    this.level = 0;
    super.start();
    
    this.updateDisplay('--');
    this.showMessage('READY');
    
    // Visual start effect
    this.flashAll(300);

    setTimeout(() => {
      this.nextRound();
    }, 1000);
  }

  nextRound() {
    this.level++;
    this.updateDisplay(this.level);
    this.playerSequence = [];
    this.isComputerTurn = true;
    this.showMessage('LISTEN');

    // Add random color
    const randomColor = this.colors[Math.floor(Math.random() * 4)];
    this.sequence.push(randomColor);

    // Determine speed based on level
    // Level 1-4: 1000ms, 5-8: 800ms, 9-12: 600ms, 13+: 400ms
    let speed = 1000;
    if (this.level >= 13) speed = 400;
    else if (this.level >= 9) speed = 600;
    else if (this.level >= 5) speed = 800;

    const params = window.DifficultyManager?.getParams(this.activeLevel) || { speedMultiplier: 1 };
    speed = Math.max(250, Math.round(speed / params.speedMultiplier));

    setTimeout(() => this.playSequence(speed), 800);
  }

  playSequence(speed) {
    let i = 0;
    const step = () => {
        if (!this.state.isPlaying) return;

        if (i >= this.sequence.length) {
            this.isComputerTurn = false;
            this.showMessage('YOUR TURN');
            return;
        }

        const color = this.sequence[i];
        this.activateButton(color, speed * 0.8); // Light on for 80% of step
        i++;
        
        this.sequenceTimeout = setTimeout(step, speed);
    };

    step();
  }

  handleInputStart(color, event) {
    if (!this.state.isPlaying || this.isComputerTurn) return;
    
    const btn = this.buttons[color];
    if (btn) {
        btn.classList.add('active');
        this.startTone(color);
    }
  }

  handleInputEnd(color) {
    // Stop tone regardless of state logic (cleanup)
    const btn = this.buttons[color];
    if (btn && btn.classList.contains('active')) {
        btn.classList.remove('active');
        this.stopTone();
        
        // Game Logic
        if (this.state.isPlaying && !this.isComputerTurn) {
            this.playerSequence.push(color);
            this.checkInput(this.playerSequence.length - 1);
        }
    }
  }

  checkInput(index) {
    if (this.playerSequence[index] !== this.sequence[index]) {
      this.gameOver();
      return;
    }

    if (this.playerSequence.length === this.sequence.length) {
      this.isComputerTurn = true;
      // Score update
      const currentScore = this.level;
      window.DifficultyManager?.saveHighScore('simon-says', this.activeLevel, currentScore);
      this.updateHighScoreDisplay();
      
      setTimeout(() => this.nextRound(), 1000);
    }
  }

  gameOver() {
    this.showMessage('GAME OVER');
    this.playTone('error', 1);
    this.updateDisplay('!!');
    this.flashAll(500, 3); // Flash 3 times
    
    super.stop();

    if (!this.strictMode) {
      // "Forgiveness" mode - wait and let them try start again easily
      setTimeout(() => {
          this.showMessage('PRESS START');
      }, 2000);
    }
  }

  endGame() {
    super.stop();
    window.DifficultyManager?.saveHighScore('simon-says', this.activeLevel, this.level || 0);
  }

  // --- Utilities ---

  activateButton(color, duration) {
    const btn = this.buttons[color];
    if (btn) {
        btn.classList.add('active');
        this.playTone(color, duration / 1000);
        setTimeout(() => btn.classList.remove('active'), duration);
    }
  }

  flashAll(duration, count = 1) {
    let c = 0;
    const interval = setInterval(() => {
        Object.values(this.buttons).forEach(b => b && b.classList.add('active'));
        setTimeout(() => Object.values(this.buttons).forEach(b => b && b.classList.remove('active')), duration / 2);
        
        c++;
        if (c >= count) clearInterval(interval);
    }, duration);
  }

  toggleStrict() {
    if (this.state.isPlaying) return;
    this.strictMode = !this.strictMode;
    if (this.strictLed) this.strictLed.classList.toggle('on', this.strictMode);
  }

  togglePause() {
    if (!this.state.isPlaying) return;
    
    if (this.state.isPaused) {
        this.resume();
        if (this.btnPause) {
            this.btnPause.innerHTML = '<span class="material-symbols-outlined">pause</span>';
            this.btnPause.classList.remove('bg-brand-500', 'text-white');
            this.btnPause.classList.add('bg-slate-700/50', 'text-brand-400');
        }
    } else {
        this.pause();
        if (this.btnPause) {
            this.btnPause.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
            this.btnPause.classList.add('bg-brand-500', 'text-white');
            this.btnPause.classList.remove('bg-slate-700/50', 'text-brand-400');
        }
    }
  }

  onDifficultyChange(level) {
    if (this.state.isPlaying) return;
    this.currentLevel = level || 'medium';
    this.updateHighScoreDisplay();
  }

  updateHighScoreDisplay() {
    if (!this.highScoreDisplay) return;
    const best = window.DifficultyManager?.getHighScore('simon-says', this.currentLevel) || 0;
    this.highScoreDisplay.textContent = best;
  }

  updateDisplay(text) {
    if (this.displayLevel) this.displayLevel.textContent = text.toString().padStart(2, '0');
  }

  showMessage(text) {
    if (this.message) {
        this.message.textContent = text;
        this.message.classList.add('visible');
        clearTimeout(this.msgTimeout);
        this.msgTimeout = setTimeout(() => {
        this.message.classList.remove('visible');
        }, 2000);
    }
  }

  // --- Audio System ---

  getAudioContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playTone(color, duration = 0.5) {
    if (this.volume <= 0) return;
    const ctx = this.getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = color === 'error' ? 'sawtooth' : 'sine';
    osc.frequency.value = this.frequencies[color];

    gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  startTone(color) {
    if (this.volume <= 0) return;
    if (this.currentOsc) this.stopTone();

    const ctx = this.getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = this.frequencies[color];
    gain.gain.value = this.volume * 0.3;

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    this.currentOsc = osc;
    this.currentGain = gain;
  }

  stopTone() {
    if (this.currentOsc) {
      const ctx = this.getAudioContext();
      this.currentGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      this.currentOsc.stop(ctx.currentTime + 0.1);
      this.currentOsc = null;
      this.currentGain = null;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new SimonSaysGame();
});
