// Imports removed for local compatibility

// Helper function to format time as MM:SS (independent of Timer instance)
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

class DragDropGame extends GameEngine {
  constructor() {
    super({ containerId: 'game-container' });

    this.gameId = 'drag-drop';
    this.difficultyLevel = 'medium';
    this.difficultySelector = null;
    this.currentParams = { penaltySeconds: 0 };
    this.difficultyParams = {
      easy: { penaltySeconds: 0 },
      medium: { penaltySeconds: 3 },
      hard: { penaltySeconds: 6 },
    };

    // UI References
    this.timerElement = document.getElementById('timer');
    // Mock Timer object to maintain API compatibility with update()
    this.timerDisplay = {
        update: (seconds) => {
            if (this.timerElement) this.timerElement.textContent = formatTime(seconds);
        }
    };

    this.startBtn = new Button('controls', 'START GAME', () =>
      this.startGame()
    );
    this.highScoreDisplay = document.getElementById('high-score');

    if (this.highScoreDisplay) {
      this.highScoreDisplay.textContent = '-';
    }

    this.pieces = [];
    this.startTime = 0;
    this.timerInterval = null;
    this.timerStart = 0;
    this.elapsedBase = 0;
    this.penaltyTime = 0;
    this.draggedItem = null;

    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
  }

  init() {
    // Defensive defaults: GameEngine may call init() before subclass constructor completes
    const localDefaults = {
      easy: { penaltySeconds: 0 },
      medium: { penaltySeconds: 3 },
      hard: { penaltySeconds: 6 },
    };

    if (!this.difficultyParams) {
      this.difficultyParams = localDefaults;
    }

    if (!this.difficultyLevel) this.difficultyLevel = 'medium';

    // Ensure UI references exist if constructor hasn't set them yet
    if (!this.timerElement) this.timerElement = document.getElementById('timer');
    if (!this.highScoreDisplay) this.highScoreDisplay = document.getElementById('high-score');
    if (this.highScoreDisplay && (!this.highScoreDisplay.textContent || this.highScoreDisplay.textContent === '')) {
      this.highScoreDisplay.textContent = '-';
    }
    // Audio System
    this.soundEnabled = true;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.audioCtx.destination);
    
    this.isPaused = false;

    this.pieces = [];

    // Difficulty selector
    if (window.DifficultySelector) {
      this.difficultySelector = new window.DifficultySelector('difficulty-control', {
        gameId: this.gameId,
        defaultLevel: this.difficultyLevel,
        onChange: (level) => this.setDifficulty(level),
      });
      this.difficultyLevel = this.difficultySelector.getLevel();
    }
    this.applyDifficulty(this.difficultyLevel);
    this.updateHighScoreDisplay();

    if (this.btnSound) {
      this.btnSound.addEventListener('click', () => this.toggleSound());
    }

    this.sourceContainer = document.getElementById('pieces-container');
    this.targetContainer = document.getElementById('puzzle-board');

    // Setup drop zones
    if (this.targetContainer) {
      this.targetContainer.addEventListener('dragover', this.handleDragOver);
      this.targetContainer.addEventListener('drop', this.handleDrop);
      this.targetContainer.addEventListener('dragenter', this.handleDragEnter);
      this.targetContainer.addEventListener('dragleave', this.handleDragLeave);
    }

    // Controls
    this.btnPause = document.getElementById('btn-pause');
    if (this.btnPause) this.btnPause.addEventListener('click', () => this.togglePause());

    // Shared Volume Control
    if (window.VolumeControl) {
      this.volumeControl = new window.VolumeControl('volume-control', {
        audio: {
          getVolume: () => this.getVolume(),
          setVolume: (v) => this.setVolume(v),
          play: () => this._playTone('pickup'),
        },
        onFeedback: () => this._playTone('pickup'),
      });
    }
    
    // Unlock audio on first interaction
    const unlockAudio = () => {
        this._ensureAudio();
        document.body.removeEventListener('click', unlockAudio);
    };
    document.body.addEventListener('click', unlockAudio, { once: true });

    // Create puzzle on init so pieces are visible before game starts
    this.createPuzzle();
  }

  startGame() {
    if (this.state.isPlaying) return;

    this.resetTimer();
    this.timerDisplay.update(0);
    this.resetPuzzle();

    this.startBtn.setDisabled(true);
    this.startBtn.setText('Playing...');

    super.start();

    this.startTimer();
  }

  createPuzzle() {
    this.sourceContainer.innerHTML = '';
    this.targetContainer.innerHTML = '';
    this.pieces = [];

    // Create 9 slots in target
    for (let i = 1; i <= 9; i++) {
      const slot = document.createElement('div');
      slot.classList.add('slot');
      slot.dataset.number = i;
      slot.textContent = i;
      this.targetContainer.appendChild(slot);
    }

    // Create 9 pieces
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    numbers.sort(() => 0.5 - Math.random());

    numbers.forEach((num) => {
      const piece = document.createElement('div');
      piece.classList.add('piece');
      piece.draggable = true;
      piece.textContent = num;
      piece.dataset.number = num;

      piece.addEventListener('dragstart', this.handleDragStart);

      this.sourceContainer.appendChild(piece);
      this.pieces.push(piece);
    });
  }

  resetPuzzle() {
    // Reset pieces to source container and remove correct state
    const slots = this.targetContainer.querySelectorAll('.slot');
    slots.forEach((slot) => {
      while (slot.children.length > 0) {
        const piece = slot.children[0];
        piece.classList.remove('correct');
        piece.draggable = true;
        this.sourceContainer.appendChild(piece);
      }
      slot.classList.remove('drag-over', 'wrong');
    });

    // Shuffle pieces
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    numbers.sort(() => 0.5 - Math.random());

    const pieces = this.sourceContainer.querySelectorAll('.piece');
    const piecesArray = Array.from(pieces);
    
    // Reorder pieces based on shuffle
    piecesArray.forEach((piece, index) => {
      piece.style.order = index;
    });
  }

  handleDragStart(e) {
    if (!this.state.isPlaying || this.isPaused) {
      e.preventDefault();
      return;
    }
    this.draggedItem = e.target;
    e.dataTransfer.setData('text/plain', e.target.dataset.number);
    e.dataTransfer.effectAllowed = 'move';
    
    this._playTone('pickup');
    
    setTimeout(() => e.target.classList.add('dragging'), 0);
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  handleDragEnter(e) {
    e.preventDefault();
    if (e.target.classList.contains('slot')) {
      e.target.classList.add('drag-over');
    }
  }

  handleDragLeave(e) {
    if (e.target.classList.contains('slot')) {
      e.target.classList.remove('drag-over');
    }
  }

  handleDrop(e) {
    e.preventDefault();
    const slot = e.target;

    if (this.draggedItem) {
      this.draggedItem.classList.remove('dragging');
    }

    if (slot.classList.contains('slot')) {
      slot.classList.remove('drag-over');

      // Check if slot is empty
      if (slot.children.length === 0) {
        const number = e.dataTransfer.getData('text/plain');

        // Check if correct number (optional difficulty: allow any drop)
        // Let's enforce correct drop for this version
        if (slot.dataset.number === number) {
          slot.appendChild(this.draggedItem);
          this.draggedItem.draggable = false;
          this.draggedItem.classList.add('correct');
          
          this._playTone('drop');

          this.checkWin();
        } else {
          // Wrong slot feedback
          slot.classList.add('wrong');
          this._playTone('error');
          this.applyPenalty();
          setTimeout(() => slot.classList.remove('wrong'), 500);
        }
      } else {
        // Slot occupied - Error sound
        this._playTone('error');
      }
    }
    this.draggedItem = null;
  }

  updateVolumeUI(vol) {
      // Deprecated: handled by shared VolumeControl
  }

  // --- Audio System ---
    changeVolume(delta) {
      this.setVolume(this.getVolume() + delta);
    }

    setVolume(value) {
      const clamped = Math.max(0, Math.min(1, value));
      this._ensureAudio();
      this.masterGain.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
      this.soundEnabled = clamped > 0;
    }

    getVolume() {
      return Math.max(0, Math.min(1, this.masterGain.gain.value ?? 0));
    }

  togglePause() {
      if (!this.state.isPlaying) return;
      this.isPaused = !this.isPaused;
      
      const icon = this.btnPause.querySelector('span');
      
      if (this.isPaused) {
        super.pause();
        this.pauseTimer();
          if (icon) icon.textContent = 'play_arrow';
          this.startBtn.setText('Paused');
      } else {
          super.resume();
          if (icon) icon.textContent = 'pause';
          this.startBtn.setText('Playing...');
        this.resumeTimer();
      }
  }

  // Adjusted Logic for Pause
  _ensureAudio() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  _playTone(type) {
    if (!this.soundEnabled) return;
    this._ensureAudio();

    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.masterGain); // Connect to Master instead of Destination

    const now = ctx.currentTime;

    if (type === 'pickup') {
      // High pitched blip
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'drop') {
      // Satisfying click/thud
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
      gainNode.gain.setValueAtTime(0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'error') {
      // Low buzz - Louder
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.2);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'win') {
      // Success arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
      notes.forEach((freq, i) => {
         const o = ctx.createOscillator();
         const g = ctx.createGain();
         o.connect(g);
         g.connect(ctx.destination);
         o.type = 'sine';
         o.frequency.value = freq;
         g.gain.setValueAtTime(0.1, now + i * 0.1);
         g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
         o.start(now + i * 0.1);
         o.stop(now + i * 0.1 + 0.3);
      });
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const icon = this.btnSound.querySelector('span.material-symbols-outlined');
    
    if (this.soundEnabled) {
      this.btnSound.classList.remove('muted');
      icon.textContent = 'volume_up';
      this._playTone('pickup');
    } else {
      this.btnSound.classList.add('muted');
      icon.textContent = 'volume_off';
    }
  }

  checkWin() {
    const slots = this.targetContainer.querySelectorAll('.slot');
    const allCorrect = Array.from(slots).every((slot) => {
      return (
        slot.children.length > 0 &&
        slot.children[0].dataset.number === slot.dataset.number
      );
    });

    if (allCorrect) {
      this.endGame();
    }
  }

  endGame() {
    super.stop();
    this._playTone('win');
    const time = this.stopTimer();
    this.startBtn.setDisabled(false);
    this.startBtn.setText('Play Again');

    const bestTime = this.getBestTime(this.difficultyLevel);
    const isNewBest = !bestTime || time < bestTime;

    if (isNewBest) {
      this.saveBestTime(this.difficultyLevel, time);
      this.updateHighScoreDisplay();
      alert(`New Record! Completed in ${formatTime(time)}`);
    } else {
      alert(`Completed in ${formatTime(time)}`);
    }
  }

  // --- Difficulty & Timing -------------------------------------------------

  setDifficulty(level) {
    const normalized = typeof level === 'string' ? level.trim().toLowerCase() : 'medium';
    this.difficultyLevel = ['easy', 'medium', 'hard'].includes(normalized)
      ? normalized
      : 'medium';
    this.applyDifficulty(this.difficultyLevel);
    this.updateHighScoreDisplay();
  }

  applyDifficulty(level) {
    // Normalize the incoming level
    const normalized = typeof level === 'string' ? level.trim().toLowerCase() : 'medium';

    // Prefer the global DifficultyManager when available and valid
    let params = null;
    if (typeof window !== 'undefined' && window.DifficultyManager && typeof window.DifficultyManager.getParams === 'function') {
      try {
        params = window.DifficultyManager.getParams(normalized);
      } catch (err) {
        // If DifficultyManager misbehaves, fall back to local definitions
        console.warn('DragDropGame: DifficultyManager.getParams failed, falling back to local params.', err);
        params = null;
      }
    }

    // Local fallback definitions in case instance table is missing
    const localDefaults = {
      easy: { penaltySeconds: 0 },
      medium: { penaltySeconds: 3 },
      hard: { penaltySeconds: 6 },
    };

    // If params are not provided by DifficultyManager, use local table or instance table as fallback
    if (!params) {
      params = (this.difficultyParams && this.difficultyParams[normalized]) || localDefaults[normalized] || localDefaults.medium;
    }

    // Ensure a safe object shape (at least penaltySeconds)
    this.currentParams = {
      penaltySeconds: (params && params.penaltySeconds) || 0,
      // allow other fields to pass through for future use
      ...params,
    };

    // Reset penalty timer state when difficulty changes
    this.penaltyTime = 0;

    // Update HUD (high score/time) only if elements exist
    try {
      this.updateHighScoreDisplay();
    } catch (e) {
      // Be resilient: don't throw during init if DOM not ready
      console.warn('DragDropGame: updateHighScoreDisplay errored during applyDifficulty', e);
    }
  }

  resetTimer() {
    clearInterval(this.timerInterval);
    this.timerStart = 0;
    this.elapsedBase = 0;
    this.penaltyTime = 0;
  }

  startTimer() {
    this.timerStart = Date.now();
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.updateTimerDisplay(), 250);
  }

  pauseTimer() {
    if (!this.timerStart) return;
    this.elapsedBase += (Date.now() - this.timerStart) / 1000;
    clearInterval(this.timerInterval);
    this.timerStart = 0;
  }

  resumeTimer() {
    if (this.timerStart) return;
    this.timerStart = Date.now();
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.updateTimerDisplay(), 250);
  }

  stopTimer() {
    if (this.timerStart) {
      this.elapsedBase += (Date.now() - this.timerStart) / 1000;
    }
    clearInterval(this.timerInterval);
    this.timerStart = 0;
    return Math.floor(this.elapsedBase + this.penaltyTime);
  }

  updateTimerDisplay() {
    if (!this.timerStart) return 0;
    const total = Math.floor(this.elapsedBase + (Date.now() - this.timerStart) / 1000 + this.penaltyTime);
    this.timerDisplay.update(total);
    return total;
  }

  applyPenalty() {
    const penalty = this.currentParams.penaltySeconds || 0;
    if (penalty <= 0) return;
    this.penaltyTime += penalty;
    this.updateTimerDisplay();
  }

  getBestTime(level) {
    const stored = DifficultyManager.getHighScore(this.gameId, level);
    return stored ? Math.abs(stored) : null;
  }

  saveBestTime(level, timeSeconds) {
    const score = -Math.abs(timeSeconds);
    DifficultyManager.saveHighScore(this.gameId, level, score);
  }

  updateHighScoreDisplay() {
    const bestTime = this.getBestTime(this.difficultyLevel);
    this.highScoreDisplay.textContent = bestTime ? formatTime(bestTime) : '-';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new DragDropGame();
});
