// Space Invaders - Refactored for Neon UI & Audio

/**
 * Audio Controller using Web Audio API
 * Generates retro synth sounds without external assets
 */
class AudioController {
    constructor() {
        this.ctx = null;
        this.volume = 0.5;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.updateVolume();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(value) {
        const clamped = Math.max(0, Math.min(1, value));
        this.volume = clamped;
        this.init();
        this.updateVolume();
    }

    getVolume() {
        return this.volume;
    }

    updateVolume() {
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.ctx || this.volume === 0) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playShoot() {
        this.playTone(800, 'square', 0.15, 0.05);
    }

    playAlienStep(stepIndex) {
        const freqs = [180, 170, 160, 150];
        const freq = freqs[stepIndex % 4];
        this.playTone(freq, 'square', 0.05, 0.05);
    }

    playExplosion() {
        this.playTone(100, 'sawtooth', 0.2, 0.1);
    }

    playLevelUp() {
        if (!this.ctx || this.volume === 0) return;
        const now = this.ctx.currentTime;
        const gain = this.ctx.createGain();
        gain.connect(this.masterGain);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);

        [440, 554, 659, 880].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(gain);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.15);
        });
    }
}

class SpaceInvadersGame extends GameEngine {
    constructor() {
        super({ containerId: 'game-container' });

        this.player = null;
        this.aliens = [];
        this.bullets = [];
        this.alienBullets = [];
        this.particles = []; // Array for DOM particles

        // Bullet pools
        this.bulletPool = [];
        this.alienBulletPool = [];
        this.maxPlayerBullets = 10;
        this.maxAlienBullets = 20;

        this.playerX = 300;
        this.playerY = 450; // Fixed vertical position (adjusted for border)
        this.playerSpeed = 5;
        this.alienDirection = 1;
        this.alienStepDown = false;
        this.lastAlienMove = 0;
        this.alienMoveInterval = 1000;
        this.alienStepCount = 0;

        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.boardRect = { width: 600, height: 500 };
        this.isPaused = false;

        this.currentLevel = 'medium';
        this.activeLevel = this.currentLevel;
        this.basePlayerSpeed = this.playerSpeed;

        this.audio = new AudioController();
        this.volumeControl = null;
    }

    init() {
        this.board = document.getElementById('game-board');
        this.livesDisplay = document.getElementById('lives');
        this.scoreDisplay = document.getElementById('score-display');
        this.highScoreDisplay = document.getElementById('high-score');

        // Difficulty Selector
        if (window.DifficultySelector) {
            this.difficultySelector = new window.DifficultySelector('difficulty-control', {
                gameId: 'space-invaders',
                defaultLevel: this.currentLevel,
                onChange: (level) => this.onDifficultyChange(level),
            });
            this.currentLevel = this.difficultySelector?.getLevel?.() || this.currentLevel;
            this.activeLevel = this.currentLevel;
        }

        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreEl = document.getElementById('final-score');

        // High Score
        this.updateHighScoreDisplay();

        // Buttons
        document.getElementById('btn-start').addEventListener('click', (e) => { e.target.blur(); this.startGame(); });
        document.getElementById('btn-restart').addEventListener('click', (e) => { e.target.blur(); this.startGame(); });
        document.getElementById('btn-resume').addEventListener('click', (e) => { e.target.blur(); this.togglePause(); });
        document.getElementById('btn-pause').addEventListener('click', (e) => { e.currentTarget.blur(); this.togglePause(); });

        if (window.VolumeControl) {
            this.volumeControl = new window.VolumeControl('volume-control', {
                audio: {
                    getVolume: () => this.audio?.getVolume?.() ?? 0.5,
                    setVolume: (v) => this.audio?.setVolume?.(v),
                    play: () => this.audio?.playTone?.(440, 'square', 0.08, 0.08),
                },
                onFeedback: () => this.audio?.playTone?.(440, 'square', 0.08, 0.08),
            });
        }

        // Input
        this.input.on('keydown', (key) => {
            if (this.state.isPlaying && !this.isPaused) {
                if (key === 'Space') this.shoot();
            }
            if (key === 'Escape' || key === 'KeyP') {
                if (this.state.isPlaying || this.isPaused) this.togglePause();
            }
        });

        // Resize
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }

    handleResize() {
        if (this.board) {
            this.boardRect = this.board.getBoundingClientRect();
            // Assuming fixed board size in CSS, but good for dynamic positioning if needed
        }
    }

    startGame() {
        if (this.state.isPlaying && !this.isPaused && !this.gameOverScreen.classList.contains('active')) return;

        this.activeLevel = this.currentLevel;
        const params = window.DifficultyManager?.getParams(this.activeLevel) || { speedMultiplier: 1, timeMultiplier: 1 };
        this.playerSpeed = this.basePlayerSpeed * params.speedMultiplier;

        this.audio.init();
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.isPaused = false;
        this.scoreDisplay.textContent = 0;
        this.updateLives();

        this.createPlayer();
        this.createAliens();

        // Reset pools
        this.bullets = [];
        this.alienBullets = [];
        this.initBulletPools();

        // Clear particles
        this.particles.forEach(p => p.el.remove());
        this.particles = [];

        // UI
        this.startScreen.classList.remove('active');
        this.gameOverScreen.classList.remove('active');
        this.pauseScreen.classList.remove('active');

        super.start();
    }

    togglePause() {
        if (!this.state.isPlaying && !this.isPaused) return;
        this.isPaused = !this.isPaused;

        const btn = document.getElementById('btn-pause');
        const icon = btn ? btn.querySelector('span') : null;

        if (this.isPaused) {
            this.pauseScreen.classList.add('active');
            if (icon) icon.textContent = 'play_arrow';
            super.stop(); // Stop loop
        } else {
            this.pauseScreen.classList.remove('active');
            if (icon) icon.textContent = 'pause';
            super.start(); // Resume loop
        }
    }

    initBulletPools() {
        // Clean up existing pools
        this.bulletPool.forEach(b => b.el.remove());
        this.alienBulletPool.forEach(b => b.el.remove());
        this.bulletPool = [];
        this.alienBulletPool = [];

        // Player Bullets
        for (let i = 0; i < this.maxPlayerBullets; i++) {
            const el = document.createElement('div');
            el.className = 'bullet';
            el.style.display = 'none';
            this.board.appendChild(el);
            this.bulletPool.push({ el, active: false, x: 0, y: 0 });
        }

        // Alien Bullets
        for (let i = 0; i < this.maxAlienBullets; i++) {
            const el = document.createElement('div');
            el.className = 'alien-bullet';
            el.style.display = 'none';
            this.board.appendChild(el);
            this.alienBulletPool.push({ el, active: false, x: 0, y: 0 });
        }
    }

    createPlayer() {
        if (this.player) this.player.remove();
        this.player = document.createElement('div');
        this.player.className = 'player';
        this.playerX = 300 - 20;
        this.player.style.left = `${this.playerX}px`;
        this.player.style.top = `${this.playerY}px`;
        this.board.appendChild(this.player);
    }

    createAliens() {
        this.aliens.forEach(a => a.el.remove());
        this.aliens = [];

        const rows = 4;
        const cols = 8;
        const startX = 50;
        const startY = 50;
        const gap = 50;

        // Increase difficulty with level
        const params = window.DifficultyManager?.getParams(this.activeLevel) || { speedMultiplier: 1 };
        const baseInterval = Math.max(100, 1000 - (this.level * 100));
        this.alienMoveInterval = Math.max(80, Math.round(baseInterval / params.speedMultiplier));

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const el = document.createElement('div');
                el.className = 'alien';
                el.textContent = '👾';
                if (r >= 2) el.classList.add('type-2'); // Different color for bottom rows

                const x = startX + c * gap;
                const y = startY + r * gap;

                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                this.board.appendChild(el);
                this.aliens.push({ el, x, y, active: true });
            }
        }

        this.audio.playLevelUp();
    }

    shoot() {
        const bullet = this.bulletPool.find(b => !b.active);
        if (!bullet) return;

        bullet.active = true;
        bullet.x = this.playerX + 20 - 2;
        bullet.y = this.playerY; // Use player Y

        bullet.el.style.display = 'block';
        bullet.el.style.left = `${bullet.x}px`;
        bullet.el.style.top = `${bullet.y}px`;

        this.bullets.push(bullet);
        this.audio.playShoot();
    }

    alienShoot() {
        const params = window.DifficultyManager?.getParams(this.activeLevel) || { speedMultiplier: 1 };
        const baseChance = 0.02 + this.level * 0.005;
        if (Math.random() > Math.min(0.9, baseChance * params.speedMultiplier)) return;

        const activeAliens = this.aliens.filter(a => a.active);
        if (activeAliens.length === 0) return;

        const bullet = this.alienBulletPool.find(b => !b.active);
        if (!bullet) return;

        const shooter = activeAliens[Math.floor(Math.random() * activeAliens.length)];

        bullet.active = true;
        bullet.x = shooter.x + 15;
        bullet.y = shooter.y + 30;

        bullet.el.style.display = 'block';
        bullet.el.style.left = `${bullet.x}px`;
        bullet.el.style.top = `${bullet.y}px`;

        this.alienBullets.push(bullet);
    }

    update(deltaTime) {
        if (!this.state.isPlaying || this.isPaused) return;

        // Player Movement
        const moveSpeed = this.playerSpeed * deltaTime * 60;
        if (this.input.isDown('ArrowLeft')) {
            this.playerX = Math.max(0, this.playerX - moveSpeed);
        }
        if (this.input.isDown('ArrowRight')) {
            this.playerX = Math.min(560, this.playerX + moveSpeed); // 600 - 40
        }
        this.player.style.left = `${this.playerX}px`;

        // Alien Movement
        const now = performance.now();
        if (now - this.lastAlienMove > this.alienMoveInterval) {
            this.moveAliens();
            this.lastAlienMove = now;
        }

        // Updates
        this.updateBullets();
        this.updateAlienBullets();
        this.updateParticles(deltaTime);
        this.alienShoot();

        // Level Complete
        if (this.aliens.every(a => !a.active)) {
            this.level++;
            this.createAliens();
        }
    }

    moveAliens() {
        let hitEdge = false;
        this.aliens.forEach(alien => {
            if (!alien.active) return;
            if (this.alienStepDown) {
                alien.y += 20;
            } else {
                alien.x += 10 * this.alienDirection;
                if (alien.x <= 10 || alien.x >= 560) hitEdge = true;
            }
            alien.el.style.left = `${alien.x}px`;
            alien.el.style.top = `${alien.y}px`;

            if (alien.y >= 450) this.gameOver();
        });

        if (this.alienStepDown) {
            this.alienStepDown = false;
        } else if (hitEdge) {
            this.alienDirection *= -1;
            this.alienStepDown = true;
            this.alienMoveInterval = Math.max(200, this.alienMoveInterval * 0.9);
        }

        this.alienStepCount++;
        this.audio.playAlienStep(this.alienStepCount);
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.y -= 8;
            b.el.style.top = `${b.y}px`;

            // Collision with Aliens
            let hit = false;
            for (let a of this.aliens) {
                if (a.active && b.x >= a.x && b.x <= a.x + 30 && b.y >= a.y && b.y <= a.y + 30) {
                    a.active = false;
                    a.el.remove();
                    hit = true;
                    this.score += 10;
                    this.scoreDisplay.textContent = this.score;
                    this.createExplosion(a.x + 15, a.y + 15, 'var(--si-accent)');
                    this.audio.playExplosion();
                    break;
                }
            }

            if (hit || b.y < 0) {
                b.active = false;
                b.el.style.display = 'none';
                this.bullets.splice(i, 1);
            }
        }
    }

    updateAlienBullets() {
        for (let i = this.alienBullets.length - 1; i >= 0; i--) {
            const b = this.alienBullets[i];
            b.y += 5;
            b.el.style.top = `${b.y}px`;

            // Collision with Player
            if (b.x >= this.playerX && b.x <= this.playerX + 40 && b.y >= this.playerY && b.y <= this.playerY + 20) {
                b.active = false;
                b.el.style.display = 'none';
                this.alienBullets.splice(i, 1);
                this.loseLife();
                this.createExplosion(this.playerX + 20, this.playerY + 10, 'var(--si-primary)');
                this.audio.playExplosion();
                return;
            }

            if (b.y > 500) {
                b.active = false;
                b.el.style.display = 'none';
                this.alienBullets.splice(i, 1);
            }
        }
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 8; i++) {
            const el = document.createElement('div');
            el.className = 'particle';
            el.style.backgroundColor = color;
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            el.style.width = `${Math.random() * 4 + 2}px`;
            el.style.height = el.style.width;

            // Physics
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;

            this.board.appendChild(el);
            this.particles.push({
                el,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0
            });
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt * 2;

            if (p.life <= 0) {
                p.el.remove();
                this.particles.splice(i, 1);
                continue;
            }

            const currentLeft = parseFloat(p.el.style.left);
            const currentTop = parseFloat(p.el.style.top);

            p.el.style.left = `${currentLeft + p.vx}px`;
            p.el.style.top = `${currentTop + p.vy}px`;
            p.el.style.opacity = p.life;
            p.el.style.transform = `scale(${p.life})`;
        }
    }

    loseLife() {
        this.lives--;
        this.updateLives();

        this.player.style.opacity = 0;
        setTimeout(() => this.player.style.opacity = 1, 100);
        setTimeout(() => this.player.style.opacity = 0, 200);
        setTimeout(() => this.player.style.opacity = 1, 300);

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    updateLives() {
        this.livesDisplay.textContent = '❤️'.repeat(this.lives);
    }

    gameOver() {
        super.stop();
        this.finalScoreEl.textContent = this.score;
        this.gameOverScreen.classList.add('active');
        window.DifficultyManager?.saveHighScore('space-invaders', this.activeLevel, this.score);
        this.updateHighScoreDisplay();
    }

    onDifficultyChange(level) {
        if (this.state.isPlaying) return;
        this.currentLevel = level || 'medium';
        this.updateHighScoreDisplay();
    }

    updateHighScoreDisplay() {
        if (!this.highScoreDisplay) return;
        const best = window.DifficultyManager?.getHighScore('space-invaders', this.currentLevel) || 0;
        this.highScoreDisplay.textContent = best;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new SpaceInvadersGame();
});