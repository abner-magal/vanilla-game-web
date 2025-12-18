// Imports removed for local compatibility

/* 
   CONSTANTS & CONFIG
   Adapted for Delta Time (60 FPS baseline)
*/
const COLORS = {
    row1: '#FF5252',
    row2: '#FF4081',
    row3: '#E040FB',
    row4: '#7C4DFF',
    row5: '#536DFE',
    paddleStart: '#536DFE',
    paddleEnd: '#E040FB',
    ball: '#ffffff',
    text: '#ffffff'
};

const CONFIG = {
    paddleWidth: 120,
    paddleHeight: 20,
    ballRadius: 8,
    ballSpeed: 7, // Base speed (pixels per frame at 60fps)
    brickRows: 5,
    brickCols: 8,
    brickGap: 10,
    brickHeight: 25,
    lives: 3
};

/* 
   Local Sound Manager for Breakout (Synth-based)
*/
class BreakoutSoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
        this.enabled = true;
    }

    getVolume() {
        return this.masterGain.gain.value;
    }

    setVolume(volume) {
        const clamped = Math.max(0, Math.min(1, volume));
        this.masterGain.gain.value = clamped;
    }

    changeVolume(delta) {
        const newVal = this.getVolume() + delta;
        this.setVolume(newVal);
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, type, duration, ramp = false) {
        if (!this.enabled) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (ramp) {
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playPaddleHit() {
        this.resume();
        this.playTone(600, 'sine', 0.1);
    }

    playBrickHit() {
        this.resume();
        this.playTone(400 + Math.random() * 200, 'square', 0.1);
    }

    playWallHit() {
        this.resume();
        this.playTone(300, 'triangle', 0.05);
    }

    playLoss() {
        this.resume();
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    playWin() {
        this.resume();
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'sine', 0.2), i * 100);
        });
    }
}

/*
    HELPER CLASSES
*/

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.gravity = 0.1;
    }

    update(timeScale) {
        this.x += this.speedX * timeScale;
        this.y += this.speedY * timeScale;
        this.speedY += this.gravity * timeScale;
        this.alpha -= this.decay * timeScale;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.size, this.size);
        ctx.fill();
        ctx.restore();
    }
}

class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.velocity = -2;
        this.alpha = 1;
        this.decay = 0.02;
    }

    update(timeScale) {
        this.y += this.velocity * timeScale; 
        this.velocity += 0.05 * timeScale; // Gravity/Slow down
        this.alpha -= this.decay * timeScale;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 20px "Rajdhani", Arial'; // Use game font
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

class Ball {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.radius = CONFIG.ballRadius;
        this.active = false;
        this.position = { x: 0, y: 0 };
        this.dx = 0;
        this.dy = 0;
        this.reset();
    }

    reset(paddle) {
        this.speed = CONFIG.ballSpeed;
        this.dx = 0;
        this.dy = -this.speed;
        
        // Random angle launch
        const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
        this.dx = this.speed * Math.sin(angle);
        this.dy = -this.speed * Math.cos(angle);
        
        this.position = { x: this.gameWidth / 2, y: this.gameHeight - 40 };
        this.active = false; 
        
        if (paddle) {
            this.position.x = paddle.x + paddle.width/2;
            this.position.y = paddle.y - this.radius - 2;
        }
    }

    launch(paddle) {
        this.active = true;
        this.position.x = paddle.x + paddle.width/2;
        this.position.y = paddle.y - this.radius - 2;
    }

    update(paddle, gameWidth, gameHeight, timeScale, onDeath) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        if (!this.active) {
            if (paddle) {
                this.position.x = paddle.x + paddle.width / 2;
                this.position.y = paddle.y - this.radius - 5;
            }
            return;
        }

        this.position.x += this.dx * timeScale;
        this.position.y += this.dy * timeScale;

        // Walls
        if (this.position.x + this.radius > this.gameWidth) {
            this.position.x = this.gameWidth - this.radius;
            this.dx = -this.dx;
            return 'wall';
        }
        if (this.position.x - this.radius < 0) {
            this.position.x = this.radius;
            this.dx = -this.dx;
            return 'wall';
        }
        if (this.position.y - this.radius < 0) {
            this.position.y = this.radius;
            this.dy = -this.dy;
            return 'wall';
        }
        
        // Bottom (Death)
        if (this.position.y + this.radius > this.gameHeight) {
            if (onDeath) onDeath();
        }
        
        return null;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.ball;
        
        // Glow
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 15;
        
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
    }
}

class Paddle {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = CONFIG.paddleWidth;
        this.height = CONFIG.paddleHeight;
        this.x = gameWidth / 2 - this.width / 2;
        this.y = gameHeight - this.height - 20;
    }

    updateDimensions(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.y = gameHeight - this.height - 20;
    }

    draw(ctx) {
        // Rounded Pill
        const radius = this.height / 2;
        
        // Gradient
        const grad = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
        grad.addColorStop(0, COLORS.paddleStart);
        grad.addColorStop(1, COLORS.paddleEnd);

        ctx.fillStyle = grad;
        
        // Glow
        ctx.shadowColor = COLORS.paddleEnd;
        ctx.shadowBlur = 20;

        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(this.x, this.y, this.width, this.height, radius);
        } else {
            ctx.rect(this.x, this.y, this.width, this.height); // Fallback
        }
        ctx.fill();
        
        ctx.shadowBlur = 0; 
    }

    reset() {
        this.x = this.gameWidth / 2 - this.width / 2;
    }
}

class Brick {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.active = true;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(this.x, this.y, this.width, this.height, 4);
        } else {
            ctx.rect(this.x, this.y, this.width, this.height);
        }
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

class BreakoutGame extends GameEngine {
  constructor() {
    super({ containerId: 'game-container' });
        this.baseBallSpeed = CONFIG.ballSpeed;
        this.basePaddleWidth = CONFIG.paddleWidth;
        this.currentLevel = 'medium';
        this.activeLevel = this.currentLevel;
        this.difficultyLevel = this.currentLevel;
        this.difficultyParams = { speedMultiplier: 1, timeMultiplier: 1 };
        this.currentBallSpeed = this.baseBallSpeed;
        this.currentPaddleWidth = this.basePaddleWidth;
        this.currentLives = CONFIG.lives;
    // Initialization moved to init() to avoid race conditions with GameEngine calling init()
  }

  init() {
    // Initialize properties safely
    this.bricks = [];
    this.particles = [];
    this.floatingTexts = [];
    this.lives = CONFIG.lives;
    this.score = 0;

    // DOM Elements
    this.livesDisplay = document.getElementById('lives-val');
    if (!this.livesDisplay) this.livesDisplay = document.getElementById('lives'); 
    this.scoreDisplay = document.getElementById('score-val');
    this.highScoreDisplay = document.getElementById('high-score-val');
        this.updateHighScoreDisplay();

        if (window.DifficultySelector) {
            this.difficultySelector = new window.DifficultySelector('difficulty-control', {
                gameId: 'breakout',
                defaultLevel: this.currentLevel,
                onChange: (level) => this.onDifficultyChange(level),
            });
            this.currentLevel = this.difficultySelector?.getLevel?.() ?? this.currentLevel;
            this.applyDifficulty(this.currentLevel);
        }

    // Canvas Setup
    this.canvas = document.getElementById('gameCanvas');
    if (!this.canvas) {
        console.error("Canvas not found!");
        return;
    }
    this.ctx = this.canvas.getContext('2d');

    // Audio
    this.audio = new BreakoutSoundManager();

    // Entities (dependent on canvas size)
    this.handleResize();
    
    this.paddle = new Paddle(this.canvas.width, this.canvas.height);
    this.ball = new Ball(this.canvas.width, this.canvas.height);

    this.handleResize = this.handleResize.bind(this);

    // Input Handling
    // Mouse
    this.canvas.addEventListener('mousemove', (e) => this.handleInput(e));
    // Touch
    this.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        this.handleInput(e.touches[0]);
    }, { passive: false });
    
    // Launch on click
    const launchHandler = (e) => {
        if (this.state.isPlaying && this.ball && !this.ball.active) {
            this.audio.resume();
            this.ball.launch(this.paddle);
        }
    };
    this.canvas.addEventListener('mousedown', launchHandler);
    this.canvas.addEventListener('touchstart', launchHandler, { passive: false });

    window.addEventListener('resize', this.handleResize);

    // UI Bindings
    const startBtn = document.getElementById('btn-start');
    if (startBtn) startBtn.addEventListener('click', () => {
        this.audio.resume();
        this.startGame();
    });

    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) restartBtn.addEventListener('click', () => this.startGame());

    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => this.togglePause());
        this.pauseBtnIcon = pauseBtn.querySelector('span');
    }

    if (window.VolumeControl) {
        this.volumeControl = new window.VolumeControl('volume-control', {
            audio: {
                getVolume: () => this.audio?.getVolume?.() ?? 0.3,
                setVolume: (value) => {
                    this.audio?.setVolume?.(value);
                    this.audio?.resume?.();
                },
                play: () => this.audio?.playPaddleHit?.(),
            },
            onFeedback: () => this.audio?.playPaddleHit?.(),
        });
    }

    // Initial resize again to ensure entities are correct
    this.handleResize();

    // Ensure start screen is visible on initialization
    this.showScreen('start-screen');
  }

  handleInput(e) {
      if (!this.state.isPlaying || this.state.isPaused) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      let clientX = e.clientX;
      let relativeX = (clientX - rect.left) * scaleX;
      
      if (this.paddle) {
          this.paddle.x = relativeX - this.paddle.width / 2;
          // Clamp
          if (this.paddle.x < 0) this.paddle.x = 0;
          if (this.paddle.x + this.paddle.width > this.canvas.width) {
              this.paddle.x = this.canvas.width - this.paddle.width;
          }
      }
  }

  handleResize() {
      const container = document.getElementById('game-board');
      if (container && this.canvas) {
          this.canvas.width = container.clientWidth;
          this.canvas.height = container.clientHeight;
          
          if (this.paddle) this.paddle.updateDimensions(this.canvas.width, this.canvas.height);
          if (this.ball) {
             this.ball.gameWidth = this.canvas.width;
             this.ball.gameHeight = this.canvas.height;
             if (!this.ball.active && this.paddle) this.ball.reset(this.paddle);
          }
          
          // Check if bricks exist before checking length
          if (!this.state.isPlaying && this.bricks && this.bricks.length === 0) {
               // Re-init bricks if resizing before start? Maybe not needed.
          }
      }
  }

  createBricks() {
      this.bricks = [];
      const rows = CONFIG.brickRows;
      const cols = CONFIG.brickCols;
      const padding = CONFIG.brickGap;
      // Recalculate proper widths
      const brickWidth = (this.canvas.width - (padding * (cols + 1))) / cols;
      const brickHeight = CONFIG.brickHeight;
      const offsetTop = 80;
      const offsetLeft = padding;

      const rowColors = [COLORS.row1, COLORS.row2, COLORS.row3, COLORS.row4, COLORS.row5];

      for(let r=0; r<rows; r++) {
          for(let c=0; c<cols; c++) {
              let x = (c * (brickWidth + padding)) + offsetLeft;
              let y = (r * (brickHeight + padding)) + offsetTop;
              this.bricks.push(new Brick(x, y, brickWidth, brickHeight, rowColors[r]));
          }
      }
  }

  startGame() {
    if (this.state.isPlaying) return;

        this.activeLevel = this.currentLevel;
        this.difficultyLevel = this.activeLevel;
        this.applyDifficulty(this.activeLevel);

        this.lives = this.currentLives;
    this.score = 0;
    this.updateHUD();
    
    if (this.pauseBtnIcon) this.pauseBtnIcon.textContent = 'pause';
    
    this.handleResize(); // Ensure dimensions are fresh
    this.createBricks();
    this.paddle.reset();
    this.ball.reset(this.paddle);
    this.applyPaddleWidth();
    this.applyBallSpeed();
    
    this.particles = [];
    this.floatingTexts = [];

    this.hideScreens();
    super.start();
  }

  updateHUD() {
      if (this.scoreDisplay) this.scoreDisplay.textContent = this.score;
      if (this.livesDisplay) this.livesDisplay.textContent = this.lives;
      this.maybeUpdateHighScore();
  }

  hideScreens() {
      const screens = document.querySelectorAll('.overlay-screen');
      screens.forEach(s => {
          s.classList.remove('active');
          s.classList.add('hidden');
      });
  }

  showScreen(id) {
      const screens = document.querySelectorAll('.overlay-screen');
      screens.forEach(s => {
          s.classList.remove('active');
          s.classList.add('hidden');
      });
      const screen = document.getElementById(id);
      if (screen) {
          screen.classList.remove('hidden');
          screen.classList.add('active');
      }
  }

  loseLife() {
      this.lives--;
      this.updateHUD();
      this.audio.playLoss();
      this.createExplosion(this.ball.position.x, this.ball.position.y, '#fff');
      
      if (this.lives <= 0) {
          this.endGame(false);
      } else {
          this.ball.reset(this.paddle);
          this.applyBallSpeed();
      }
  }

  endGame(win) {
      super.stop();
      if (win) {
          this.audio.playWin();
          this.showScreen('game-over-screen'); // Re-use game over screen but change text
          const title = document.querySelector('#game-over-screen h2');
          if(title) {
              title.textContent = "VICTORY!";
              title.classList.remove('text-accent-pink');
              title.classList.add('text-accent-purple');
          }
      } else {
          this.showScreen('game-over-screen');
          const title = document.querySelector('#game-over-screen h2');
          if(title) {
              title.textContent = "GAME OVER";
              title.classList.add('text-accent-pink');
              title.classList.remove('text-accent-purple');
          }
      }
      
      const finalScore = document.getElementById('final-score');
      if (finalScore) finalScore.textContent = this.score;

      this.maybeUpdateHighScore();
  }

  togglePause() {
      if (!this.state.isPlaying) return;
      
      if (this.state.isPaused) {
          super.resume();
          if (this.pauseBtnIcon) this.pauseBtnIcon.textContent = 'pause';
      } else {
          super.pause();
          if (this.pauseBtnIcon) this.pauseBtnIcon.textContent = 'play_arrow';
      }
  }

  createExplosion(x, y, color) {
      for (let i = 0; i < 15; i++) {
          this.particles.push(new Particle(x, y, color));
      }
  }

  spawnFloatingText(x, y, text, color) {
      this.floatingTexts.push(new FloatingText(x, y, text, color));
  }

  checkCollisions(timeScale) {
      // Ball & Paddle
      // Simple AABB
      if (this.ball.position.x + this.ball.radius > this.paddle.x &&
          this.ball.position.x - this.ball.radius < this.paddle.x + this.paddle.width &&
          this.ball.position.y + this.ball.radius > this.paddle.y &&
          this.ball.position.y - this.ball.radius < this.paddle.y + this.paddle.height) {
          
          this.audio.playPaddleHit();

          // Always bounce up
          this.ball.dy = -Math.abs(this.ball.dy);
          
          // "English" Spin Effect
          let hitPoint = this.ball.position.x - (this.paddle.x + this.paddle.width / 2);
          hitPoint = hitPoint / (this.paddle.width / 2); // -1 to 1
          
          // Adjust DX based on hit point
          this.ball.dx = hitPoint * ((this.currentBallSpeed || CONFIG.ballSpeed) * 0.8);
      }

      // Ball & Bricks
      let activeBricks = 0;
      // Reverse iteration to safe splice if needed, though we use active flag
      for (const brick of this.bricks) {
          if (!brick.active) continue;
          activeBricks++;

          if (this.ball.position.x + this.ball.radius > brick.x &&
              this.ball.position.x - this.ball.radius < brick.x + brick.width &&
              this.ball.position.y + this.ball.radius > brick.y &&
              this.ball.position.y - this.ball.radius < brick.y + brick.height) {
              
              brick.active = false;
              this.ball.dy = -this.ball.dy;
              this.score += 10;
              this.updateHUD();
              this.audio.playBrickHit();
              
              this.createExplosion(brick.x + brick.width/2, brick.y + brick.height/2, brick.color);
              this.spawnFloatingText(brick.x + brick.width/2, brick.y, "+10", brick.color);
              
              break; 
          }
      }

      if (activeBricks === 0 && this.state.isPlaying && this.bricks.length > 0) {
          this.endGame(true);
      }
  }

  update(deltaTime) {
      if (!this.state.isPlaying || this.state.isPaused) return;

      // deltaTime is in seconds (e.g. 0.016). 
      // Reference used framerate-dependent logic.
      // Scale factor: dt * 60.
      const timeScale = deltaTime * 60;

      const wallHit = this.ball.update(this.paddle, this.canvas.width, this.canvas.height, timeScale, () => this.loseLife());
      
      if (wallHit) this.audio.playWallHit();

      this.checkCollisions(timeScale);

      // Update particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.update(timeScale);
          if (p.alpha <= 0) this.particles.splice(i, 1);
      }

      // Update floating text
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
          const t = this.floatingTexts[i];
          t.update(timeScale);
          if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
      }
  }

  render() {
      if (!this.ctx) return;

      // Only render if game is playing or paused (not before start)
      if (!this.state.isPlaying) return;

      // Clear
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw Bricks
      this.bricks.forEach(brick => brick.draw(this.ctx));

      // Draw Paddle
      if (this.paddle) this.paddle.draw(this.ctx);

      // Draw Ball
      if (this.ball) this.ball.draw(this.ctx);

      // Draw Particles
      this.particles.forEach(p => p.draw(this.ctx));

      // Draw Texts
      this.floatingTexts.forEach(t => t.draw(this.ctx));
  }

  applyDifficulty(level = 'medium') {
      if (this.state.isPlaying) return;

      const normalized = this.normalizeLevel(level);
      this.currentLevel = normalized;
      this.difficultyLevel = normalized;
      const params = window.DifficultyManager?.getParams?.(normalized) ?? { speedMultiplier: 1, timeMultiplier: 1 };
      this.difficultyParams = params;
      this.currentLives = Math.max(1, Math.round(CONFIG.lives * params.timeMultiplier));
      this.currentBallSpeed = this.baseBallSpeed * params.speedMultiplier;
      this.currentPaddleWidth = this.basePaddleWidth / params.speedMultiplier;
      this.applyPaddleWidth();
      this.applyBallSpeed();
      this.updateHighScoreDisplay();
  }

  applyPaddleWidth() {
      if (!this.paddle) return;
      this.paddle.width = this.currentPaddleWidth;
      this.paddle.reset();
  }

  applyBallSpeed() {
      if (!this.ball) return;
      const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
      this.ball.speed = this.currentBallSpeed;
      this.ball.dx = this.currentBallSpeed * Math.sin(angle);
      this.ball.dy = -this.currentBallSpeed * Math.cos(angle);
  }

  getHighScore() {
      if (window.DifficultyManager?.getHighScore) {
          return window.DifficultyManager.getHighScore('breakout', this.currentLevel);
      }
      return typeof GameStorage !== 'undefined' ? GameStorage.getHighScore('breakout') : 0;
  }

  saveHighScore(score) {
      if (window.DifficultyManager?.saveHighScore) {
          window.DifficultyManager.saveHighScore('breakout', this.activeLevel, score);
          return;
      }
      if (typeof GameStorage !== 'undefined') {
          GameStorage.setHighScore('breakout', score);
      }
  }

  maybeUpdateHighScore() {
      if (this.score > this.getHighScore()) {
          this.saveHighScore(this.score);
          this.updateHighScoreDisplay();
      }
  }

  updateHighScoreDisplay() {
      if (this.highScoreDisplay) {
          this.highScoreDisplay.textContent = this.getHighScore();
      }
  }

  onDifficultyChange(level) {
      if (this.state.isPlaying) return;
      this.applyDifficulty(level);
  }

  normalizeLevel(level) {
      const value = typeof level === 'string' ? level.trim().toLowerCase() : '';
      return ['easy', 'medium', 'hard'].includes(value) ? value : 'medium';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new BreakoutGame();
});