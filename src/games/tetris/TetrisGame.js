// Imports removed for local compatibility

class SoundManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);
  }

  resume() {
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  changeVolume(delta) {
    const newVal = Math.max(0, Math.min(1, this.masterGain.gain.value + delta));
    this.masterGain.gain.value = newVal;
    // Feedback beep
    if (delta !== 0) this.playTone(400, 'sine', 0.05);
  }

  playTone(freq, type, duration, startTime = 0) {
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
    gain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  playMove() { this.playTone(300, 'triangle', 0.05); }
  playRotate() { this.playTone(400, 'sine', 0.05); }
  playDrop() { this.playTone(150, 'square', 0.1); }
  
  playClear() {
    this.resume();
    const now = this.ctx.currentTime;
    [400, 500, 600, 800].forEach((f, i) => this.playTone(f, 'sine', 0.1, i * 0.05));
  }

  playGameOver() {
    this.resume();
    this.playTone(300, 'sawtooth', 0.5);
    this.playTone(200, 'sawtooth', 0.5, 0.2);
    this.playTone(100, 'sawtooth', 1.0, 0.4);
  }
}

class TetrisGame extends GameEngine {
  constructor() {
    super({ containerId: 'game-container' });

    this.board = document.getElementById('game-board');
    this.nextPieceBoard = document.getElementById('next-piece-board');
    this.scoreBoard = new ScoreBoard('hud', 0);
    this.linesDisplay = document.getElementById('lines');
    this.levelDisplay = document.getElementById('level');
    this.startBtn = document.getElementById('btn-start');
    this.resumeBtn = document.getElementById('btn-resume');
    this.startOverlay = document.getElementById('start-overlay');
    this.pauseOverlay = document.getElementById('pause-overlay');
    this.highScoreDisplay = document.getElementById('high-score');
    this.difficultyLevel = 'medium';
    this.difficultyParams = { speedMultiplier: 1, timeMultiplier: 1 };
    this.safeSetText(this.highScoreDisplay, 0);

    this.rows = 20;
    this.cols = 10;
    this.grid = [];
    this.cellElements = [];
    this.activePiece = null;
    this.nextPiece = null;

    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.baseDropInterval = 1000;
    this.dropInterval = this.baseDropInterval;
    this.lastDropTime = 0;
    this.isPaused = false;
    this.volumeControl = null;

    this.pieces = [
      { shape: [[1, 1, 1, 1]], color: 'cyan' }, // I
      { shape: [[1, 1], [1, 1]], color: 'yellow' }, // O
      { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' }, // T
      { shape: [[1, 0, 0], [1, 1, 1]], color: 'orange' }, // L
      { shape: [[0, 0, 1], [1, 1, 1]], color: 'blue' }, // J
      { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' }, // S
      { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' }, // Z
    ];

    this.handleInput = this.handleInput.bind(this);
  }

  init() {
    this.audio = new SoundManager();
    this.input.on('keydown', (key) => this.handleInput(key));

    // UI Controls
    const btnPause = document.getElementById('btn-pause');

    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.startGame());
      this.startBtn.onclick = () => this.startGame();
    }
    if (this.resumeBtn) this.resumeBtn.addEventListener('click', () => this.togglePause());

    if (btnPause) {
        btnPause.addEventListener('click', () => this.togglePause());
        this.btnPauseIcon = btnPause.querySelector('span');
    }

    // Shared Volume Control
    if (window.VolumeControl) {
      this.volumeControl = new window.VolumeControl('volume-control', {
        audio: {
          getVolume: () => this.audio?.masterGain?.gain?.value ?? 0.3,
          setVolume: (v) => {
            if (this.audio?.masterGain?.gain) this.audio.masterGain.gain.value = v;
          },
          play: () => this.audio?.playTone?.(400, 'sine', 0.05),
        },
        onFeedback: () => this.audio?.playTone?.(400, 'sine', 0.05),
      });
    }

    if (window.DifficultySelector && window.DifficultyManager) {
      this.difficultySelector = new window.DifficultySelector('difficulty-control', {
        gameId: 'tetris',
        defaultLevel: 'medium',
        onChange: (level) => this.applyDifficulty(level),
      });
      this.applyDifficulty(this.difficultySelector.getLevel());
    } else {
      this.applyDifficulty('medium');
    }

    this.lastDropTime = performance.now();
  }

  togglePause() {
      if (!this.state.isPlaying) return;
      this.isPaused = !this.isPaused;
      
      if (this.isPaused) {
          if (this.btnPauseIcon) this.btnPauseIcon.textContent = 'play_arrow';
        this.showPauseOverlay();
        super.pause();
      } else {
          if (this.btnPauseIcon) this.btnPauseIcon.textContent = 'pause';
        this.hidePauseOverlay();
            this.lastDropTime = performance.now();
          super.resume();
      }
  }

  createGrid() {
    if (!this.board) return;
    this.board.innerHTML = '';
    this.grid = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(null));
    this.cellElements = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = r;
        cell.dataset.col = c;
        this.board.appendChild(cell);
        this.cellElements.push(cell);
      }
    }
  }

  startGame() {
    if (this.state.isPlaying) return;

    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.dropInterval = this.computeDropInterval();
    this.isPaused = false;
    if (this.btnPauseIcon) this.btnPauseIcon.textContent = 'pause';

    this.lastDropTime = performance.now();
    
    this.scoreBoard.update(0);
    this.updateStats();
    this.createGrid();

    this.nextPiece = this.randomPiece();
    this.spawnPiece();

    if (this.startBtn) {
      this.startBtn.disabled = true;
      this.startBtn.textContent = 'PLAYING...';
    }

    this.hideStartOverlay();
    this.hidePauseOverlay();
    
    this.audio.resume();

    super.start();
  }

  randomPiece() {
    const idx = Math.floor(Math.random() * this.pieces.length);
    const p = this.pieces[idx];
    return {
      shape: p.shape,
      color: p.color,
      x: Math.floor(this.cols / 2) - Math.ceil(p.shape[0].length / 2),
      y: 0,
    };
  }

  spawnPiece() {
    this.activePiece = this.nextPiece;
    this.nextPiece = this.randomPiece();
    this.drawNextPiece();

    if (this.checkCollision(0, 0, this.activePiece.shape)) {
      this.endGame();
    } else {
      this.draw();
    }
  }

  drawNextPiece() {
    if (!this.nextPieceBoard || !this.nextPiece) return;
    this.nextPieceBoard.innerHTML = '';
    const shape = this.nextPiece.shape;
    this.nextPieceBoard.style.gridTemplateColumns = `repeat(${shape[0].length}, 20px)`;
    this.nextPieceBoard.style.gridTemplateRows = `repeat(${shape.length}, 20px)`;

    shape.forEach((row) => {
      row.forEach((cell) => {
        const el = document.createElement('div');
        if (cell) {
          el.classList.add('cell', 'active');
          el.style.backgroundColor = this.nextPiece.color;
        }
        this.nextPieceBoard.appendChild(el);
      });
    });
  }

  handleInput(key) {
    if (!this.state.isPlaying || this.isPaused) return;

    switch (key) {
      case 'ArrowLeft':
        if (!this.checkCollision(-1, 0, this.activePiece.shape)) {
          this.activePiece.x--;
          this.audio.playMove();
          this.draw();
        }
        break;
      case 'ArrowRight':
        if (!this.checkCollision(1, 0, this.activePiece.shape)) {
          this.activePiece.x++;
          this.audio.playMove();
          this.draw();
        }
        break;
      case 'ArrowDown':
        this.drop();
        break;
      case 'ArrowUp':
        const rotated = this.rotate(this.activePiece.shape);
        if (!this.checkCollision(0, 0, rotated)) {
          this.activePiece.shape = rotated;
          this.audio.playRotate();
          this.draw();
        }
        break;
    }
  }

  rotate(matrix) {
    return matrix[0].map((val, index) =>
      matrix.map((row) => row[index]).reverse()
    );
  }

  checkCollision(dx, dy, shape) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = this.activePiece.x + c + dx;
          const newY = this.activePiece.y + r + dy;

          if (newX < 0 || newX >= this.cols || newY >= this.rows) return true;
          if (newY >= 0 && this.grid[newY][newX]) return true;
        }
      }
    }
    return false;
  }

  update(deltaTime) {
    if (!this.state.isPlaying || this.isPaused) return;

    const now = performance.now();
    if (now - this.lastDropTime > this.dropInterval) {
      this.drop();
      this.lastDropTime = now;
    }
  }

  drop() {
    if (!this.checkCollision(0, 1, this.activePiece.shape)) {
      this.activePiece.y++;
      this.draw();
    } else {
      this.audio.playDrop();
      this.lockPiece();
      this.clearLines();
      this.spawnPiece();
    }
  }

  lockPiece() {
    this.activePiece.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          const y = this.activePiece.y + r;
          const x = this.activePiece.x + c;
          if (y >= 0) {
            this.grid[y][x] = this.activePiece.color;
          }
        }
      });
    });
  }

  clearLines() {
    let linesCleared = 0;

    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.grid[r].every((cell) => cell !== null)) {
        this.grid.splice(r, 1);
        this.grid.unshift(Array(this.cols).fill(null));
        linesCleared++;
        r++; // Check same row again
      }
    }

    if (linesCleared > 0) {
      this.audio.playClear();
      this.lines += linesCleared;
      this.score += linesCleared * 100 * this.level;
      this.level = Math.floor(this.lines / 10) + 1;
      this.dropInterval = this.computeDropInterval();

      this.scoreBoard.update(this.score);
      this.updateStats();
    }
  }

  updateStats() {
    if (this.linesDisplay) this.linesDisplay.textContent = this.lines;
    if (this.levelDisplay) this.levelDisplay.textContent = this.level;
  }

  draw() {
    // Use cached cell elements
    this.cellElements.forEach((cell, index) => {
      const r = Math.floor(index / this.cols);
      const col = index % this.cols;

      if (this.grid[r][col]) {
        cell.className = 'cell locked';
        cell.style.backgroundColor = this.grid[r][col];
      } else {
        cell.className = 'cell';
        cell.style.backgroundColor = '';
      }
    });

    // Draw Active Piece
    if (this.activePiece) {
      this.activePiece.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell) {
            const y = this.activePiece.y + r;
            const x = this.activePiece.x + c;
            if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
              const index = y * this.cols + x;
              const el = this.cellElements[index];
              el.classList.add('active');
              el.style.backgroundColor = this.activePiece.color;
            }
          }
        });
      });
    }
  }

  applyDifficulty(level) {
    this.difficultyLevel = this.normalizeLevel(level);
    this.difficultyParams = window.DifficultyManager
      ? window.DifficultyManager.getParams(this.difficultyLevel)
      : { speedMultiplier: 1, timeMultiplier: 1 };

    this.dropInterval = this.computeDropInterval();
    this.updateHighScoreDisplay();
    this.lastDropTime = performance.now();
  }

  computeDropInterval() {
    const base = Math.max(100, this.baseDropInterval - (this.level - 1) * 100);
    const interval = (base * this.difficultyParams.timeMultiplier) / this.difficultyParams.speedMultiplier;
    return Math.max(60, interval);
  }

  saveHighScore() {
    if (window.DifficultyManager) {
      const updated = window.DifficultyManager.saveHighScore('tetris', this.difficultyLevel, this.score);
      if (updated) this.safeSetText(this.highScoreDisplay, this.score);
      return;
    }
    if (typeof GameStorage !== 'undefined' && GameStorage.setHighScore('tetris', this.score)) {
      this.safeSetText(this.highScoreDisplay, this.score);
    }
  }

  updateHighScoreDisplay() {
    if (window.DifficultyManager) {
      const high = window.DifficultyManager.getHighScore('tetris', this.difficultyLevel);
      this.safeSetText(this.highScoreDisplay, high);
      return;
    }
    if (typeof GameStorage !== 'undefined') {
      this.safeSetText(this.highScoreDisplay, GameStorage.getHighScore('tetris'));
    }
  }

  normalizeLevel(level) {
    const value = typeof level === 'string' ? level.trim().toLowerCase() : '';
    return ['easy', 'medium', 'hard'].includes(value) ? value : 'medium';
  }

  safeSetText(node, value) {
    if (node) {
      node.textContent = value;
    }
  }

  endGame() {
    super.stop();
    this.audio.playGameOver();
    this.isPaused = false;
    this.showStartOverlay();
    this.hidePauseOverlay();
    if (this.btnPauseIcon) this.btnPauseIcon.textContent = 'pause';

    this.saveHighScore();
  }

  showStartOverlay() {
    this.startOverlay?.classList.remove('hidden');
    if (this.startBtn) {
      this.startBtn.disabled = false;
      this.startBtn.textContent = 'START GAME';
    }
  }

  hideStartOverlay() {
    this.startOverlay?.classList.add('hidden');
  }

  showPauseOverlay() {
    this.pauseOverlay?.classList.remove('hidden');
  }

  hidePauseOverlay() {
    this.pauseOverlay?.classList.add('hidden');
  }
}

// Bootstrap even if the script loads after DOMContentLoaded
const bootstrapTetris = () => {
  window.__tetrisInstance = new TetrisGame();

  const bindControls = () => {
    const game = window.__tetrisInstance;
    const startButton = document.getElementById('btn-start');
    const resumeButton = document.getElementById('btn-resume');

    if (startButton) {
      startButton.addEventListener('click', () => game?.startGame());
    }

    if (resumeButton) {
      resumeButton.addEventListener('click', () => game?.togglePause());
    }
  };

  bindControls();
};
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrapTetris);
} else {
  bootstrapTetris();
}