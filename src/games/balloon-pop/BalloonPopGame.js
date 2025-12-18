// Note: CSS Grid uses 1-based indexing for grid-column-start and grid-row-start

// --- Audio System ---
class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.muted = false;
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.3;
    }

  setVolume(value) {
    const clamped = Math.max(0, Math.min(1, value));
    this.masterGain.gain.value = clamped;
  }

  getVolume() {
    return this.masterGain.gain.value;
  }

    resumeContext() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playPop() {
        if (this.muted) return;
        this.resumeContext();
        
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // High pitch sine sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.15);
    }

    playGameOver() {
        if (this.muted) return;
        this.resumeContext();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Sawtooth descent
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.8);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.8);
    }
}

class BalloonPopGame extends GameEngine {
  constructor() {
    super({ containerId: 'game-container' });

    // Game State
    this.balloons = [];
    this.score = 0;
    this.lives = 5;
    this.spawnRate = 1000; // ms (will be adjusted by difficulty)
    this.lastSpawn = 0;
    this.speedMultiplier = 1;
    this.isPaused = false;
    this.baseSpawnRate = 1000;
    this.baseSpeedMultiplier = 1;
    this.difficultyParams = { speedMultiplier: 1, timeMultiplier: 1 };
    this.currentLevel = 'medium';
    this.activeLevel = this.currentLevel;
    
    // No DOM selection here to avoid init errors
  }

  init() {
    // Initialize Audio
    this.audio = new SoundManager();

    // DOM Elements
    this.board = document.getElementById('game-board');
    this.scoreDisplay = document.getElementById('score');
    this.highScoreDisplay = document.getElementById('high-score');
    this.livesDisplay = document.getElementById('lives');
    this.finalScoreDisplay = document.getElementById('final-score');

    this.screens = {
        start: document.getElementById('start-screen'),
        gameOver: document.getElementById('game-over-screen')
    };

    this.btnStart = document.getElementById('btn-start');
    this.btnRestart = document.getElementById('btn-restart');
    
    // New Controls
    this.btnPause = document.getElementById('btn-pause');

    // Safety Check - Validate game board exists and has dimensions
    if (!this.board || !this.btnStart) {
        console.error('BalloonPopGame: Missing DOM elements');
        return;
    }

    // Ensure board has valid dimensions for balloon spawning
    // If board has no explicit dimensions, set fallback values
    if (this.board.clientWidth === 0 || this.board.clientHeight === 0) {
        console.warn('BalloonPopGame: Board has no dimensions, using fallback');
        this.board.style.width = '100%';
        this.board.style.minHeight = '500px';
    }

    if (window.DifficultySelector && window.DifficultyManager) {
      this.difficultySelector = new window.DifficultySelector('difficulty-control', {
        gameId: 'balloon-pop',
        defaultLevel: this.currentLevel,
        onChange: (level) => this.onDifficultyChange(level),
      });
      this.currentLevel = this.difficultySelector?.getLevel?.() || this.currentLevel;
      this.applyDifficulty(this.currentLevel);
    }

    // Bindings
    this.btnStart.addEventListener('click', () => this.startGame());
    this.btnRestart.addEventListener('click', () => this.startGame());
    
    if (this.btnPause) this.btnPause.addEventListener('click', () => this.togglePause());

      if (window.VolumeControl) {
        this.volumeControl = new window.VolumeControl('volume-control', {
          audio: {
            getVolume: () => this.audio?.getVolume?.() ?? 0.3,
            setVolume: (v) => this.audio?.setVolume?.(v),
            play: () => this.audio?.playPop?.(),
          },
          onFeedback: () => this.audio?.playPop?.(),
        });
      }

    // Set Initial UI
    this.screens.start.style.display = 'flex';
    this.screens.gameOver.classList.add('hidden');

    this.updateHighScoreDisplay();
  }

  startGame() {
    if (this.state.isPlaying) return;

    this.activeLevel = this.currentLevel;
    this.difficultyParams = window.DifficultyManager?.getParams(this.activeLevel) || { speedMultiplier: 1, timeMultiplier: 1 };

    this.audio.resumeContext();

    // Reset State
    this.score = 0;
    this.lives = 5;
    this.spawnRate = this.baseSpawnRate * (this.difficultyParams.timeMultiplier / this.difficultyParams.speedMultiplier);
    this.speedMultiplier = this.baseSpeedMultiplier * this.difficultyParams.speedMultiplier;
    this.lastSpawn = performance.now();

    // Cleanup
    this.balloons.forEach((b) => b.element.remove());
    this.balloons = [];
    
    // Clear particles/text
    this.board.querySelectorAll('.particle, .floating-text').forEach(el => el.remove());

    // Update UI
    this.updateScore(0);
    this.updateLives();
    this.screens.start.style.display = 'none';
    this.screens.gameOver.classList.add('hidden');

    // Spawn initial balloons immediately (Requirements 3.1, 3.2)
    // This ensures balloons are visible within 1 second of game start
    this.spawnInitialBalloons(5);

    super.start();
  }

  /**
   * Spawns initial balloons at game start
   * Ensures at least MIN_BALLOONS are visible immediately
   * @param {number} count - Number of balloons to spawn
   */
  spawnInitialBalloons(count = 5) {
    const boardHeight = this.board.clientHeight;
    
    for (let i = 0; i < count; i++) {
      // Spawn balloons at different heights for visual variety
      // Distribute them across the lower 80% of the board
      const yOffset = Math.random() * (boardHeight * 0.8);
      this.spawnBalloonAt(boardHeight - yOffset);
    }
  }

  /**
   * Spawns a balloon at a specific Y position
   * @param {number} startY - Starting Y position for the balloon
   */
  spawnBalloonAt(startY) {
    const balloon = document.createElement('div');
    balloon.classList.add('balloon');

    // Color Generation (Vibrant HSL)
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 75%, 60%)`;
    
    balloon.style.color = color;
    
    // Position
    const width = 50; // from CSS
    const boardWidth = this.board.clientWidth;
    const x = Math.random() * (boardWidth - width);
    const y = Math.min(startY, this.board.clientHeight);

    balloon.style.left = `${x}px`;
    balloon.style.top = `${y}px`;

    // Interactivity
    balloon.addEventListener('pointerdown', (e) => this.popBalloon(e, balloon, color));

    this.board.appendChild(balloon);

    this.balloons.push({
      element: balloon,
      y: y,
      speed: Math.random() * 2 + 1.5,
    });
  }

  togglePause() {
      if (!this.state.isPlaying) return;
      this.isPaused = !this.isPaused;
      
      const icon = this.btnPause.querySelector('span');
      if (this.isPaused) {
          super.pause();
          if (icon) icon.textContent = 'play_arrow';
      } else {
          super.resume();
          if (icon) icon.textContent = 'pause';
      }
  }

  update(deltaTime) {
    if (!this.state.isPlaying || this.isPaused) return;

    const now = performance.now();

    // Spawn Logic
    if (now - this.lastSpawn > this.spawnRate) {
      this.spawnBalloon();
      this.lastSpawn = now;
      
      // Increase difficulty
      // Decrease spawn time, cap at 300ms
      this.spawnRate = Math.max(300 * this.difficultyParams.timeMultiplier, this.spawnRate * 0.98);
      // Increase speed multiplier scaled by difficulty
      this.speedMultiplier += 0.005 * this.difficultyParams.speedMultiplier; 
    }

    // Update Balloons
    // Note: deltaTime is seconds
    const frameSpeed = 60 * deltaTime; // Normalize to ~1.0 at 60fps

    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      
      // Move Up
      b.y -= b.speed * this.speedMultiplier * frameSpeed;
      b.element.style.top = `${b.y}px`;

      // Boundary Check (Escaped)
      if (b.y < -80) {
        b.element.remove();
        this.balloons.splice(i, 1);
        this.loseLife();
      }
    }
  }

  spawnBalloon() {
    const balloon = document.createElement('div');
    balloon.classList.add('balloon');

    // Color Generation (Vibrant HSL)
    // Project Brand Colors: Teal (170), Pink (330), Purple (270)
    // We'll pick random hue but bias towards neon
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 75%, 60%)`;
    
    balloon.style.color = color; // Used by CSS currentColor for shadow/bg
    // We set background via CSS class which uses radial-gradient and currentColor
    
    // Position
    const width = 50; // from CSS
    const x = Math.random() * (this.board.clientWidth - width);
    const y = this.board.clientHeight; // Start just below/at bottom

    balloon.style.left = `${x}px`;
    balloon.style.top = `${y}px`;

    // Interactivity
    // Use 'pointerdown' to handle both click and touch immediately
    balloon.addEventListener('pointerdown', (e) => this.popBalloon(e, balloon, color));

    this.board.appendChild(balloon);

    this.balloons.push({
      element: balloon,
      y: y,
      speed: Math.random() * 2 + 1.5, // Base speed
    });
  }

  popBalloon(e, element, color) {
    if (!this.state.isPlaying) return;
    e.preventDefault();
    e.stopPropagation();

    // Remove from array
    const idx = this.balloons.findIndex((b) => b.element === element);
    if (idx > -1) {
      this.balloons.splice(idx, 1);
    }

    // Play Sound
    this.audio.playPop();

    // Get Coordinates for effects
    const rect = element.getBoundingClientRect();
    const boardRect = this.board.getBoundingClientRect();
    const x = rect.left - boardRect.left + rect.width / 2;
    const y = rect.top - boardRect.top + rect.height / 2;

    // Effects
    this.spawnParticles(x, y, color);
    this.showFloatingText(x, y, '+10');

    // Remove Element
    element.remove();

    // Score
    this.score += 10;
    this.updateScore(this.score);
  }

  spawnParticles(x, y, color) {
      for(let i=0; i<8; i++) {
          const p = document.createElement('div');
          p.classList.add('particle');
          p.style.backgroundColor = color;
          p.style.left = `${x}px`;
          p.style.top = `${y}px`;
          
          this.board.appendChild(p);

          // Animate
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * 40 + 10;
          const tx = Math.cos(angle) * dist;
          const ty = Math.sin(angle) * dist;

          // Use WAAPI for performance or simple transition
          p.animate([
              { transform: 'translate(0, 0) scale(1)', opacity: 1 },
              { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
          ], {
              duration: 500,
              easing: 'ease-out'
          }).onfinish = () => p.remove();
      }
  }

  showFloatingText(x, y, text) {
      const el = document.createElement('div');
      el.classList.add('floating-text');
      el.textContent = text;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      
      this.board.appendChild(el);
      
      // Removed by CSS animation 'floatUpFade' automatically? 
      // CSS animation doesn't remove from DOM. Need JS cleanup.
      setTimeout(() => el.remove(), 600);
  }

  loseLife() {
    this.lives--;
    this.updateLives();
    if (this.lives <= 0) {
      this.endGame();
    }
  }

  updateScore(val) {
      this.scoreDisplay.textContent = val;
      const best = this.getHighScore();
      if (val > best) {
        this.saveHighScore(val);
        this.updateHighScoreDisplay();
      }
  }

  updateLives() {
      this.livesDisplay.textContent = '❤️'.repeat(this.lives);
  }

  endGame() {
    super.stop();
    this.audio.playGameOver();
    this.saveHighScore(this.score);
    
    this.finalScoreDisplay.textContent = this.score;
    this.screens.gameOver.classList.remove('hidden');
  }

  applyDifficulty(level) {
    if (this.state.isPlaying) return;
    this.currentLevel = this.normalizeLevel(level);
    this.difficultyParams = window.DifficultyManager?.getParams(this.currentLevel) || { speedMultiplier: 1, timeMultiplier: 1 };
    this.spawnRate = this.baseSpawnRate * (this.difficultyParams.timeMultiplier / this.difficultyParams.speedMultiplier);
    this.speedMultiplier = this.baseSpeedMultiplier * this.difficultyParams.speedMultiplier;
    this.updateHighScoreDisplay();
  }

  onDifficultyChange(level) {
    if (this.state.isPlaying) return;
    this.applyDifficulty(level);
  }

  getHighScore(level = this.currentLevel) {
    return window.DifficultyManager?.getHighScore?.('balloon-pop', level) || 0;
  }

  saveHighScore(score, level = this.activeLevel) {
    window.DifficultyManager?.saveHighScore?.('balloon-pop', level, score);
  }

  updateHighScoreDisplay() {
    if (!this.highScoreDisplay) return;
    this.highScoreDisplay.textContent = this.getHighScore();
  }

  normalizeLevel(raw) {
    const value = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
    return ['easy', 'medium', 'hard'].includes(value) ? value : 'medium';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new BalloonPopGame();
});