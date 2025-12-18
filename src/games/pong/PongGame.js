// @ts-check
// Imports removed for local compatibility

/**
 * SoundManager - Web Audio API Synth
 */
class SoundManager {
    constructor() {
        /** @type {AudioContext|null} */
        this.ctx = null;
        this.masterGain = null;
        this.volume = 0.5; // Initial Volume 50%
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(val) {
        // Clamp 0.0 to 1.0
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
        return this.volume;
    }

    getVolume() {
        return this.masterGain?.gain?.value ?? this.volume;
    }

    /**
     * @param {number} freq 
     * @param {OscillatorType} type 
     * @param {number} duration 
     */
    playTone(freq, type, duration) {
        if (!this.ctx || this.volume <= 0) return;

        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        // Envelope for click-free sound
        noteGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playHit(isPlayer) {
        const freq = isPlayer ? 600 : 400;
        this.playTone(freq, 'square', 0.1);
    }

    playWall() {
        this.playTone(150, 'square', 0.05);
    }

    playScore(isWin) {
        if (!this.ctx || this.volume <= 0) return;
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        
        osc.type = 'sine';
        noteGain.gain.setValueAtTime(0.1, now);
        noteGain.gain.linearRampToValueAtTime(0, now + 0.4);

        if (isWin) {
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
        } else {
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        }

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);
        osc.start();
        osc.stop(now + 0.4);
    }
}

/**
 * PongGame - Canvas Version extending GameEngine
 */
class PongGame extends GameEngine {
    constructor() {
        super({ containerId: 'game-container' });
    }

    init() {
        this.sound = new SoundManager();
        
        // Configuration
        this.baseSettings = { cpuSpeed: 0.10, ballSpeed: 450, increment: 1.05 };
        this.currentLevel = 'medium';
        this.activeLevel = this.currentLevel;
        this.difficultyLevel = this.currentLevel;
        this.difficultyParams = { speedMultiplier: 1, timeMultiplier: 1 };
        this.settings = { ...this.baseSettings };

        this.config = {
            paddleWidth: 12,
            paddleHeight: 80,
            ballSize: 10,
            maxSpeed: 1000,
            colors: {
                player: '#14b8a6', // brand-500
                cpu: '#ffffff',
                ball: '#ffffff',
                net: '#334155', // slate-700
                glowPlayer: '#2dd4bf', // brand-400
                glowCpu: '#ffffff'
            }
        };

        // Entities
        this.player = { x: 0, y: 0 };
        this.cpu = { x: 0, y: 0 };
        this.ball = { x: 0, y: 0, dx: 0, dy: 0, speed: 0 };

        // Input State (Mouse)
        this.mouseY = null;

        // Bindings
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Elements
        this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('gameBoard'));
        this.ctx = this.canvas.getContext('2d');
        
        this.ui = {
            scorePlayer: document.getElementById('scorePlayer'),
            scoreCpu: document.getElementById('scoreCpu'),
            highScore: document.getElementById('highScore'),
            btnRestart: document.getElementById('btnRestart'),
            btnPause: document.getElementById('btn-pause'),
            overlayPause: document.getElementById('pause-overlay'),
            volumeControl: document.getElementById('volume-control'),
        };

        this.cpuScore = 0;
        this.bestScore = 0;

        // Setup
        this.setupListeners();
        this.handleResize();
        this.resetPositions();
        this.render(); // Initial static draw

        if (window.DifficultySelector && window.DifficultyManager) {
            this.difficultySelector = new window.DifficultySelector('difficulty-control', {
                gameId: 'pong',
                defaultLevel: this.currentLevel,
                onChange: (level) => this.onDifficultyChange(level),
            });
            this.currentLevel = this.difficultySelector.getLevel();
            this.applyDifficulty(this.currentLevel);
        } else {
            this.applyDifficulty('medium');
        }
    }

    setupListeners() {
        // Resize
        window.addEventListener('resize', this.handleResize);
        
        // Mouse Input
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMouseMove(e.touches[0]);
        }, { passive: false });

        // UI Controls
        this.ui.btnRestart.addEventListener('click', () => {
            this.sound.init(); // Ensure audio ctx
            this.startGame();
        });

        this.ui.btnPause.addEventListener('click', () => {
            if (this.state.isPlaying) {
                if (this.state.isPaused) this.resumeGame();
                else this.pauseGame();
            }
        });

        // Key controls (Pause)
        this.input.on('keydown', (key) => {
            if (key === 'KeyP') {
                if (this.state.isPlaying) {
                    if (this.state.isPaused) this.resumeGame();
                    else this.pauseGame();
                }
            }
        });

        if (window.VolumeControl && this.ui.volumeControl) {
            this.volumeControl = new window.VolumeControl('volume-control', {
                audio: {
                    getVolume: () => this.sound.getVolume(),
                    setVolume: (value) => {
                        this.sound.init();
                        this.sound.setVolume(value);
                    },
                    play: () => this.sound.playHit(true),
                },
                onFeedback: () => this.sound.playHit(true),
            });
        }
    }

    /**
     * @param {MouseEvent|Touch} e 
     */
    handleMouseMove(e) {
        if (this.state.isPaused) return;
        const rect = this.canvas.getBoundingClientRect();
        const scaleY = this.canvas.height / rect.height;
        // @ts-ignore
        const clientY = e.clientY; 
        const relativeY = (clientY - rect.top) * scaleY;
        
        this.mouseY = Math.max(
            this.config.paddleHeight/2, 
            Math.min(this.canvas.height - this.config.paddleHeight/2, relativeY)
        );
    }

    handleResize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Fix scale to match CSS aspect ratio if needed, or adapt
        // For now we just maximize width and keep aspect
        this.canvas.width = 600;
        this.canvas.height = 400; 
        
        // If we wanted responsive canvas resolution we'd set width/height here based on rect
        // But keeping internal resolution 600x400 is easier for game logic consistency
        // CSS handles visual scaling
        
        this.render();
    }

    startGame() {
        this.activeLevel = this.currentLevel;
        this.difficultyLevel = this.activeLevel;
        this.applyDifficulty(this.activeLevel);

        this.state.score = 0; // Player score
        this.cpuScore = 0; // CPU score
        
        this.updateScoreDOM();
        this.resetPositions();
        
        this.ui.btnRestart.textContent = 'Restart Match';
        this.ui.btnRestart.classList.add('bg-brand-600');
        this.ui.overlayPause.classList.add('overlay-hidden');
        this.ui.btnPause.innerHTML = '<span class="material-symbols-outlined">pause</span>';
        
        super.start();
    }

    pauseGame() {
        this.pause(); // GameEngine pause
        this.ui.overlayPause.classList.remove('overlay-hidden');
        this.ui.btnPause.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
    }

    resumeGame() {
        this.resume(); // GameEngine resume
        this.ui.overlayPause.classList.add('overlay-hidden');
        this.ui.btnPause.innerHTML = '<span class="material-symbols-outlined">pause</span>';
    }

    updateScoreDOM() {
        this.ui.scorePlayer.textContent = this.state.score.toString();
        this.ui.scoreCpu.textContent = this.cpuScore.toString(); // CPU Score
        if (this.ui.highScore) this.ui.highScore.textContent = this.bestScore.toString();
    }

    resetPositions(resetBall = true) {
        const padding = 20;
        const settings = this.settings;

        this.player.x = padding;
        this.player.y = this.canvas.height / 2 - this.config.paddleHeight / 2;

        this.cpu.x = this.canvas.width - this.config.paddleWidth - padding;
        this.cpu.y = this.canvas.height / 2 - this.config.paddleHeight / 2;

        if (resetBall) {
            this.ball.x = this.canvas.width / 2;
            this.ball.y = this.canvas.height / 2;
            this.ball.speed = settings.ballSpeed;
            
            const dirX = Math.random() > 0.5 ? 1 : -1;
            const dirY = (Math.random() * 2 - 1) * 0.5;
            const len = Math.sqrt(dirX*dirX + dirY*dirY);
            
            this.ball.dx = dirX / len;
            this.ball.dy = dirY / len;
        }
    }

    update(dt) {
        if (!this.state.isPlaying || this.state.isPaused) return;

        const settings = this.settings;

        // --- Player Movement ---
        const paddleSpeed = 600 * dt;
        
        // Keyboard
        if (this.input.isDown('ArrowUp') || this.input.isDown('KeyW')) {
            this.player.y -= paddleSpeed;
            this.mouseY = null;
        } else if (this.input.isDown('ArrowDown') || this.input.isDown('KeyS')) {
            this.player.y += paddleSpeed;
            this.mouseY = null;
        } 
        // Mouse
        else if (this.mouseY !== null) {
            const targetY = this.mouseY - this.config.paddleHeight / 2;
            // Smooth follow
            this.player.y += (targetY - this.player.y) * 0.2;
        }
        
        // Clamp Player
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.config.paddleHeight, this.player.y));

        // --- CPU AI ---
        let targetCpuY = this.ball.y - this.config.paddleHeight / 2;
        this.cpu.y += (targetCpuY - this.cpu.y) * settings.cpuSpeed;
        // Clamp CPU
        this.cpu.y = Math.max(0, Math.min(this.canvas.height - this.config.paddleHeight, this.cpu.y));

        // --- Ball Physics ---
        this.ball.x += this.ball.dx * this.ball.speed * dt;
        this.ball.y += this.ball.dy * this.ball.speed * dt;

        // Wall Collisions (Top/Bottom)
        if (this.ball.y - this.config.ballSize/2 < 0 || this.ball.y + this.config.ballSize/2 > this.canvas.height) {
            this.ball.dy *= -1;
            this.ball.y = Math.max(this.config.ballSize/2, Math.min(this.canvas.height - this.config.ballSize/2, this.ball.y));
            this.sound.playWall();
        }

        // Paddle Collisions
        if (this.checkCollision(this.player)) {
            if (this.ball.dx < 0) {
                this.handlePaddleHit(this.player, 1, settings.increment);
                this.sound.playHit(true);
            }
        } else if (this.checkCollision(this.cpu)) {
            if (this.ball.dx > 0) {
                this.handlePaddleHit(this.cpu, -1, settings.increment);
                this.sound.playHit(false);
            }
        }

        // Scoring
        if (this.ball.x < -20) {
            // CPU Scores
            this.cpuScore++;
            this.sound.playScore(false);
            this.updateScoreDOM();
            this.resetPositions(true);
        } else if (this.ball.x > this.canvas.width + 20) {
            // Player Scores
            this.state.score++;
            this.sound.playScore(true);
            this.updateScoreDOM();
            this.resetPositions(true);
            this.saveHighScoreIfNeeded();
        }
    }

    applyDifficulty(level) {
        if (this.state.isPlaying) return;

        const normalized = this.normalizeLevel(level);
        this.currentLevel = normalized;
        this.difficultyLevel = normalized;
        this.difficultyParams = window.DifficultyManager
            ? window.DifficultyManager.getParams(normalized)
            : { speedMultiplier: 1, timeMultiplier: 1 };

        this.settings = this.computeSettings();
        this.updateHighScoreDisplay();
    }

    computeSettings() {
        const { speedMultiplier } = this.difficultyParams;
        const cpuSpeed = this.baseSettings.cpuSpeed * speedMultiplier;
        const ballSpeed = this.baseSettings.ballSpeed * speedMultiplier;
        const increment = Math.max(1.01, this.baseSettings.increment + (speedMultiplier - 1) * 0.05);
        return { cpuSpeed, ballSpeed, increment };
    }

    saveHighScoreIfNeeded() {
        if (this.state.score <= this.bestScore) return;

        if (window.DifficultyManager) {
            const updated = window.DifficultyManager.saveHighScore('pong', this.activeLevel, this.state.score);
            if (updated) {
                this.bestScore = this.state.score;
                this.updateHighScoreDisplay();
            }
            return;
        }

        if (typeof GameStorage !== 'undefined' && GameStorage.setHighScore('pong', this.state.score)) {
            this.bestScore = this.state.score;
            this.updateHighScoreDisplay();
        }
    }

    updateHighScoreDisplay() {
        if (!this.ui.highScore) return;
        if (window.DifficultyManager) {
            this.bestScore = window.DifficultyManager.getHighScore('pong', this.currentLevel);
            this.ui.highScore.textContent = this.bestScore.toString();
            return;
        }
        if (typeof GameStorage !== 'undefined') {
            this.bestScore = GameStorage.getHighScore('pong', 0);
            this.ui.highScore.textContent = this.bestScore.toString();
        }
    }

    normalizeLevel(level) {
        const value = typeof level === 'string' ? level.trim().toLowerCase() : '';
        return ['easy', 'medium', 'hard'].includes(value) ? value : 'medium';
    }

    checkCollision(paddle) {
        return (
            this.ball.x < paddle.x + this.config.paddleWidth &&
            this.ball.x + this.config.ballSize > paddle.x &&
            this.ball.y < paddle.y + this.config.paddleHeight &&
            this.ball.y + this.config.ballSize > paddle.y
        );
    }

    handlePaddleHit(paddle, direction, increment) {
        this.ball.dx = Math.abs(this.ball.dx) * direction;
        this.ball.speed = Math.min(this.ball.speed * increment, this.config.maxSpeed);
        
        const paddleCenter = paddle.y + this.config.paddleHeight / 2;
        const hitPoint = this.ball.y - paddleCenter;
        // Normalized hit offset (-1 to 1)
        const normalizedHit = hitPoint / (this.config.paddleHeight / 2);
        
        // Add English/Spin effect to dy
        this.ball.dy = normalizedHit * 0.8;
    }

    onDifficultyChange(level) {
        if (this.state.isPlaying) return;
        this.applyDifficulty(level);
    }

    render() {
        // Clear
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Net
        this.ctx.beginPath();
        this.ctx.setLineDash([10, 15]);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.config.colors.net;
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Player
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.config.colors.glowPlayer;
        this.ctx.fillStyle = this.config.colors.player;
        this.ctx.fillRect(this.player.x, this.player.y, this.config.paddleWidth, this.config.paddleHeight);

        // CPU
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.config.colors.glowCpu;
        this.ctx.fillStyle = this.config.colors.cpu;
        this.ctx.fillRect(this.cpu.x, this.cpu.y, this.config.paddleWidth, this.config.paddleHeight);

        // Ball
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ffffff';
        this.ctx.fillStyle = this.config.colors.ball;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.config.ballSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    teardown() {
        super.teardown();
        window.removeEventListener('resize', this.handleResize);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new PongGame();
});