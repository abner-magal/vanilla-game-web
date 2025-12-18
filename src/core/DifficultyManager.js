// @ts-check

const DM_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

const DM_PARAMS = {
  [DM_LEVELS.EASY]: { speedMultiplier: 0.7, timeMultiplier: 1.3 },
  [DM_LEVELS.MEDIUM]: { speedMultiplier: 1, timeMultiplier: 1 },
  [DM_LEVELS.HARD]: { speedMultiplier: 1.5, timeMultiplier: 0.7 },
};

class DifficultyManager {
  static LEVELS = DM_LEVELS;
  static PARAMS = DM_PARAMS;
  static _memoryScores = Object.create(null);
  static _localAvailable = DifficultyManager._checkLocalStorage();

  /**
   * Get parameters for a difficulty level with safe fallbacks.
   * @param {string} level
   * @returns {{ speedMultiplier: number, timeMultiplier: number }}
   */
  static getParams(level) {
    const normalized = this._normalizeLevel(level);
    const params = this.PARAMS[normalized] || this.PARAMS[DM_LEVELS.MEDIUM];
    const fallback = this.PARAMS[DM_LEVELS.MEDIUM];

    return {
      speedMultiplier: this._ensurePositive(params.speedMultiplier, fallback.speedMultiplier),
      timeMultiplier: this._ensurePositive(params.timeMultiplier, fallback.timeMultiplier),
    };
  }

  /**
   * Persist a high score per game and difficulty.
   * @param {string} gameId
   * @param {string} level
   * @param {number} score
   * @returns {boolean} true if a new high score was saved
   */
  static saveHighScore(gameId, level, score) {
    if (!this._isValidId(gameId) || !this._isValidScore(score)) {
      return false;
    }

    const normalized = this._normalizeLevel(level);
    const key = this._buildKey(gameId, normalized);
    const current = this.getHighScore(gameId, normalized);

    if (score > current) {
      return this._setInStorage(key, score);
    }

    return false;
  }

  /**
   * Retrieve a high score per game and difficulty.
   * @param {string} gameId
   * @param {string} level
   * @returns {number}
   */
  static getHighScore(gameId, level) {
    if (!this._isValidId(gameId)) {
      return 0;
    }

    const normalized = this._normalizeLevel(level);
    const key = this._buildKey(gameId, normalized);
    const stored = this._getFromStorage(key, 0);

    return this._isValidScore(stored) ? stored : 0;
  }

  // --- Internal helpers --------------------------------------------------

  /**
   * @param {any} value
   * @param {number} fallback
   * @returns {number}
   */
  static _ensurePositive(value, fallback) {
    return typeof value === 'number' && Number.isFinite(value) && value > 0
      ? value
      : fallback;
  }

  /**
   * @param {string} level
   * @returns {string}
   */
  static _normalizeLevel(level) {
    const normalized = typeof level === 'string' ? level.trim().toLowerCase() : '';
    return Object.values(DM_LEVELS).includes(normalized) ? normalized : DM_LEVELS.MEDIUM;
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  static _isValidId(id) {
    return typeof id === 'string' && id.trim().length > 0;
  }

  /**
   * @param {any} score
   * @returns {boolean}
   */
  static _isValidScore(score) {
    return typeof score === 'number' && Number.isFinite(score) && score >= 0;
  }

  /**
   * @returns {boolean}
   */
  static _canUsePersistentStorage() {
    return this._localAvailable && typeof GameStorage !== 'undefined';
  }

  /**
   * @returns {boolean}
   */
  static _checkLocalStorage() {
    try {
      const testKey = '__dm_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('DifficultyManager: localStorage unavailable, using in-memory fallback.', error);
      return false;
    }
  }

  /**
   * @param {string} gameId
   * @param {string} level
   * @returns {string}
   */
  static _buildKey(gameId, level) {
    return `${gameId}_${level}_highscore`;
  }

  /**
   * @param {string} key
   * @param {number} defaultValue
   * @returns {number}
   */
  static _getFromStorage(key, defaultValue = 0) {
    if (this._canUsePersistentStorage()) {
      const value = GameStorage.get(key, defaultValue);

      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }

      if (typeof value === 'string' && value.trim().length && !Number.isNaN(Number(value))) {
        return Number(value);
      }
    }

    if (Object.prototype.hasOwnProperty.call(this._memoryScores, key)) {
      return this._memoryScores[key];
    }

    return defaultValue;
  }

  /**
   * @param {string} key
   * @param {number} value
   * @returns {boolean}
   */
  static _setInStorage(key, value) {
    let success = false;

    if (this._canUsePersistentStorage()) {
      success = GameStorage.set(key, value);

      if (!success) {
        // Retry path: if storage became unavailable, fall back silently.
        this._localAvailable = this._checkLocalStorage();
      }
    }

    if (!success) {
      this._memoryScores[key] = value;
      success = true;
    }

    return success;
  }
}

if (typeof window !== 'undefined') {
  window.DifficultyManager = DifficultyManager;
}
