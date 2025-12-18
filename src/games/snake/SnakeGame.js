// Note: CSS Grid uses 1-based indexing for grid-column-start and grid-row-start

// --- Audio System (Ported from Reference) ---
class SoundManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.muted = false;
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.3; // Default volume
  }

  changeVolume(delta) {
    this.setVolume(this.getVolume() + delta);
  }

  setVolume(value) {
    const clamped = Math.max(0, Math.min(1, value));
    this.resumeContext();
    this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    this.muted = clamped === 0;
  }

  getVolume() {
    return Math.max(0, Math.min(1, this.masterGain.gain.value ?? 0));
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    } else {
      this.masterGain.gain.setValueAtTime(this.getVolume() || 0.3, this.ctx.currentTime);
      this.resumeContext();
    }
    return this.muted;
  }

  resumeContext() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, startTime = 0) {
    if (this.muted) return;
    this.resumeContext();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + startTime + duration
    );

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  playEat() {
    if (this.muted) return;
    // High pitch rising "coin" sound
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(1200, t + 0.1);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  playDie() {
    if (this.muted) return;
    // Low descending "crash"
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  playClick() {
    this.playTone(600, 'triangle', 0.05);
  }
}

class SnakeGame extends GameEngine {
  constructor() {
    super({ containerId: 'game-container' });

    // Properties that don't depend on DOM can stay here
    this.gridSize = 20;
    this.snake = [];
    this.food = null;
    this.direction = { x: 0, y: 0 };
    this.nextDirection = { x: 0, y: 0 };
    this.score = 0;
    this.baseSpeed = 6;
    this.speed = this.baseSpeed;
    this.speedGain = 0.2;
    this.lastMoveTime = 0;

    this.difficultyLevel = 'medium';
    this.difficultyParams = { speedMultiplier: 1, timeMultiplier: 1 };

    this.isPaused = false;
    this.gameStarted = false; // Flag to wait for first player input

    // DOM Pool
    this.segmentElements = [];
    this.foodElement = null;
    this.volumeControl = null; // Shared VolumeControl instance
  }

  /**
   * Called by GameEngine constructor.
   * Initialize DOM and Listeners here.
   */
  init() {
    // Initialize Audio System
    this.audio = new SoundManager();

    // Initialize DOM Elements
    this.board = document.getElementById('game-board');
    this.scoreDisplay = document.getElementById('score');
    this.highScoreDisplay = document.getElementById('high-score');
    this.finalScoreDisplay = document.getElementById('final-score');

    // Overlays
    this.screens = {
      start: document.getElementById('start-screen'),
      gameOver: document.getElementById('game-over-screen'),
      pause: document.getElementById('pause-screen'),
    };

    // Buttons
    this.btnStart = document.getElementById('btn-start');
    this.btnRestart = document.getElementById('btn-restart');
    this.btnResume = document.getElementById('btn-resume');
    this.btnPause = document.getElementById('btn-pause');

    // Safety Check
    if (!this.board || !this.btnStart) {
      console.error('SnakeGame: Missing DOM elements');
      return;
    }

    // Set High Score
    if (typeof GameStorage !== 'undefined') {
      const savedHigh = GameStorage.getHighScore('snake', 0);
      this.highScoreDisplay.textContent = savedHigh;
    }

    // Volume Control (shared component)
    if (window.VolumeControl) {
      this.volumeControl = new window.VolumeControl('volume-control', {
        audio: {
          getVolume: () => this.audio?.getVolume?.() ?? 0.3,
          setVolume: (v) => this.audio?.setVolume?.(v),
          play: () => this.audio?.playClick?.(),
        },
        onFeedback: () => this.audio?.playClick?.(),
      });
    }

    // Difficulty Selector
    if (window.DifficultySelector && window.DifficultyManager) {
      this.difficultySelector = new window.DifficultySelector('difficulty-control', {
        gameId: 'snake',
        defaultLevel: 'medium',
        onChange: (level) => this.applyDifficulty(level),
      });
      this.applyDifficulty(this.difficultySelector.getLevel());
    } else {
      this.applyDifficulty('medium');
    }

    // Keyboard Input
    this.input.on('keydown', (key) => this.handleInput(key));

    // Touch Input (Swipe)
    let touchStartX = 0;
    let touchStartY = 0;
    this.board.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      },
      { passive: true }
    );

    this.board.addEventListener(
      'touchend',
      (e) => {
        if (!this.state.isPlaying || this.isPaused) return;
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > 30)
            this.handleSwipe(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
        } else {
          if (Math.abs(dy) > 30)
            this.handleSwipe(dy > 0 ? 'ArrowDown' : 'ArrowUp');
        }
      },
      { passive: true }
    );

    // UI Bindings
    this.btnStart.addEventListener('click', () => {
      this.audio.playClick();
      this.startGame();
    });
    this.btnRestart.addEventListener('click', () => {
      this.audio.playClick();
      this.startGame();
    });
    this.btnResume.addEventListener('click', () => {
      this.audio.playClick();
      this.togglePause();
    });
    this.btnPause.addEventListener('click', () => {
      this.audio.playClick();
      this.togglePause();
    });

    // Initial State
    this.showScreen('start');
  }

  showScreen(screen) {
    Object.entries(this.screens).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle('active', key === screen);
    });
  }

  startGame() {
    if (this.state.isPlaying) return;

    this.audio.resumeContext(); // Ensure audio context is active

    // Calculate safe center position (at least 2 cells from borders)
    // Grid is 1-based, so valid positions are 1 to gridSize
    // Safe zone: 3 to gridSize-2 (ensures 2 cells margin from borders)
    const centerX = Math.floor(this.gridSize / 2);
    const centerY = Math.floor(this.gridSize / 2);

    // Initialize snake with 3 horizontal segments at center
    // Head at center, body segments to the left
    this.snake = [
      { x: centerX, y: centerY },       // Head
      { x: centerX - 1, y: centerY },   // Body segment 1
      { x: centerX - 2, y: centerY }    // Body segment 2 (tail)
    ];

    this.food = this.randomPosition();
    this.direction = { x: 0, y: 0 }; // No movement until player input
    this.nextDirection = { x: 0, y: 0 };
    this.gameStarted = false; // Wait for first player input
    this.score = 0;
    this.speed = this.baseSpeed * this.difficultyParams.speedMultiplier;
    this.isPaused = false;

    // Clean Board
    this.segmentElements.forEach((el) => el.remove());
    this.segmentElements = [];
    if (this.foodElement) {
      this.foodElement.remove();
      this.foodElement = null;
    }
    // Clean Particles
    const particles = this.board.querySelectorAll('.particle');
    particles.forEach((el) => el.remove());

    this.scoreDisplay.textContent = '0';

    // UI State
    this.showScreen(null); // Hide all screens

    super.start();
    this.draw();
  }

  togglePause() {
    if (!this.state.isPlaying) return;
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.showScreen('pause');
      this.btnPause.querySelector('span').textContent = 'play_arrow';
    } else {
      this.showScreen(null);
      this.btnPause.querySelector('span').textContent = 'pause';
    }
  }

  handleInput(key) {
    // Handle Pause on Esc
    if (key === 'Escape') {
      this.togglePause();
      return;
    }
    this.handleSwipe(key);
  }

  handleSwipe(key) {
    if (!this.state.isPlaying || this.isPaused) return;

    let newDirection = null;

    switch (key) {
      case 'ArrowUp':
        if (this.direction.y !== 1) newDirection = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
        if (this.direction.y !== -1) newDirection = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
        if (this.direction.x !== 1) newDirection = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
        if (this.direction.x !== -1) newDirection = { x: 1, y: 0 };
        break;
    }

    if (newDirection) {
      this.nextDirection = newDirection;

      // Start the game on first valid input
      if (!this.gameStarted) {
        this.gameStarted = true;
        this.direction = newDirection; // Set initial direction immediately
      }
    }
  }

  randomPosition() {
    let newPos;
    while (true) {
      newPos = {
        x: Math.floor(Math.random() * this.gridSize) + 1,
        y: Math.floor(Math.random() * this.gridSize) + 1,
      };
      const onSnake = this.snake.some(
        (segment) => segment.x === newPos.x && segment.y === newPos.y
      );
      if (!onSnake) break;
    }
    return newPos;
  }

  update(deltaTime) {
    if (!this.state.isPlaying || this.isPaused) return;

    // Don't move until player has provided first input
    if (!this.gameStarted) return;

    const now = performance.now();
    const moveInterval = 1000 / this.speed;

    // Update CSS transition speed to match game speed
    // We set it slightly faster than the move interval to ensure completion before next move
    const transitionSpeed = (moveInterval * 0.8) / 1000;
    document.documentElement.style.setProperty(
      '--transition-speed',
      `${transitionSpeed}s`
    );

    if (now - this.lastMoveTime > moveInterval) {
      this.lastMoveTime = now;
      this.move();
    }
  }

  move() {
    // Don't move if game hasn't started (waiting for first input)
    if (!this.gameStarted) return;

    // Prevent 180 reverse in a single frame if multiple inputs
    if (
      this.direction.x + this.nextDirection.x !== 0 ||
      this.direction.y + this.nextDirection.y !== 0
    ) {
      this.direction = this.nextDirection;
    }

    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;

    // Wall Collision - only check after game has started
    if (
      head.x < 1 ||
      head.x > this.gridSize ||
      head.y < 1 ||
      head.y > this.gridSize
    ) {
      this.endGame();
      return;
    }

    // Self Collision - only check after game has started
    if (
      this.snake.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      this.endGame();
      return;
    }

    this.snake.unshift(head);

    // Food Collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 100;
      this.scoreDisplay.textContent = this.score;
      this.audio.playEat();
      this.spawnParticles(head.x, head.y);

      // Juice: Scale head up momentarily
      const headEl = this.segmentElements[0];
      if (headEl) {
        headEl.style.transform = 'scale(1.3)';
        setTimeout(() => (headEl.style.transform = 'scale(1)'), 150);
      }

      this.food = this.randomPosition();
      this.speed = Math.min(15, this.speed + this.speedGain * this.difficultyParams.speedMultiplier); // Cap speed
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  spawnParticles(gridX, gridY) {
    // Approximate pixel position based on grid (20px per cell)
    // CSS Grid is 1-based, so calc accordingly
    // We need to get the actual size from the board element in case of responsive scaling
    const boardRect = this.board.getBoundingClientRect();
    const cellSize = boardRect.width / this.gridSize;

    const centerX = (gridX - 1) * cellSize + cellSize / 2;
    const centerY = (gridY - 1) * cellSize + cellSize / 2;

    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');

      // Random velocity
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (cellSize * 2) + cellSize / 2;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      p.style.left = `${centerX}px`;
      p.style.top = `${centerY}px`;
      p.style.width = `${cellSize / 4}px`;
      p.style.height = `${cellSize / 4}px`;

      this.board.appendChild(p);

      // Trigger animation next frame
      requestAnimationFrame(() => {
        p.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
        p.style.opacity = '0';
      });

      // Cleanup
      setTimeout(() => p.remove(), 500);
    }
  }

  draw() {
    // Expand pool if snake grew
    while (this.segmentElements.length < this.snake.length) {
      const el = document.createElement('div');
      el.classList.add('snake-body');
      this.board.appendChild(el);
      this.segmentElements.push(el);
    }

    // Hide extra elements if snake shrunk
    for (let i = this.snake.length; i < this.segmentElements.length; i++) {
      this.segmentElements[i].style.display = 'none';
    }

    // Update segment positions
    this.snake.forEach((segment, index) => {
      const el = this.segmentElements[index];
      el.style.display = 'block';
      el.style.gridRowStart = segment.y;
      el.style.gridColumnStart = segment.x;

      if (index === 0) {
        el.className = 'snake-body snake-head';
        // Rotate head based on direction
        let deg = 0;
        if (this.direction.x === 1) deg = 0;
        else if (this.direction.y === 1) deg = 90;
        else if (this.direction.x === -1) deg = 180;
        else if (this.direction.y === -1) deg = 270;

        // Preserve scale if it was set by eating
        const currentTransform = el.style.transform;
        if (currentTransform.includes('scale')) {
          el.style.transform = `rotate(${deg}deg) scale(1.3)`;
        } else {
          el.style.transform = `rotate(${deg}deg)`;
        }
      } else {
        el.className = 'snake-body';
        el.style.transform = 'scale(0.92)'; // Reset to default body scale
      }
    });

    // Food element (create once)
    if (!this.foodElement) {
      this.foodElement = document.createElement('div');
      this.foodElement.classList.add('food');
      this.board.appendChild(this.foodElement);
    }
    this.foodElement.style.gridRowStart = this.food.y;
    this.foodElement.style.gridColumnStart = this.food.x;
  }

  endGame() {
    super.stop();
    this.audio.playDie();

    this.saveHighScore();

    this.finalScoreDisplay.textContent = this.score;
    this.showScreen('gameOver');
  }

  applyDifficulty(level) {
    const normalized = this.normalizeLevel(level);

    const params = typeof window.DifficultyManager !== 'undefined'
      ? window.DifficultyManager.getParams(normalized)
      : { speedMultiplier: 1, timeMultiplier: 1 };

    this.difficultyLevel = normalized || 'medium';
    this.difficultyParams = params;
    this.speed = this.baseSpeed * params.speedMultiplier;

    this.updateHighScoreDisplay();
  }

  normalizeLevel(level) {
    const value = typeof level === 'string' ? level.trim().toLowerCase() : '';
    const allowed = ['easy', 'medium', 'hard'];
    return allowed.includes(value) ? value : 'medium';
  }

  saveHighScore() {
    if (typeof window.DifficultyManager !== 'undefined') {
      const updated = window.DifficultyManager.saveHighScore('snake', this.difficultyLevel, this.score);
      if (updated) {
        this.highScoreDisplay.textContent = this.score;
      }
      return;
    }

    if (typeof GameStorage !== 'undefined' && GameStorage.setHighScore('snake', this.score)) {
      this.highScoreDisplay.textContent = this.score;
    }
  }

  updateHighScoreDisplay() {
    if (typeof window.DifficultyManager !== 'undefined') {
      const high = window.DifficultyManager.getHighScore('snake', this.difficultyLevel);
      this.highScoreDisplay.textContent = high;
      return;
    }

    if (typeof GameStorage !== 'undefined') {
      const savedHigh = GameStorage.getHighScore('snake', 0);
      this.highScoreDisplay.textContent = savedHigh;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new SnakeGame();
});
