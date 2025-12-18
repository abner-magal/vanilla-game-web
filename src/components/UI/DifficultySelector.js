// @ts-check

/** @typedef {'easy' | 'medium' | 'hard'} DifficultyLevel */
/**
 * @typedef {object} StorageService
 * @property {(key: string, fallback?: string) => string} get
 * @property {(key: string, value: string) => void} set
 */
/** @typedef {Window & typeof globalThis & { GameStorage?: StorageService, DifficultySelector?: typeof DifficultySelector }} BNWindow */

const LEVELS = /** @type {DifficultyLevel[]} */ (['easy', 'medium', 'hard']);
const MEMORY = Object.create(null);
const BN_WIN = /** @type {BNWindow} */ (
  typeof window !== 'undefined' ? window : /** @type {any} */ ({})
);

class DifficultySelector {
  /**
   * @param {string} containerId
   * @param {{ gameId?: string, defaultLevel?: string, onChange?: (level: string)=>void }} [options]
   */
  constructor(containerId, { gameId = 'default', defaultLevel = 'medium', onChange } = {}) {
    this.container = document.getElementById(containerId);
    this.gameId = gameId;
    this.onChange = onChange;
    /** @type {DifficultyLevel} */
    this.level = this._loadLevel(defaultLevel);
    /** @type {HTMLButtonElement[]} */
    this.buttons = [];

    if (!this.container) {
      console.warn(`DifficultySelector: container '${containerId}' not found`);
      return;
    }

    this.render();
    this.applyActiveState(this.level);
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'difficulty-selector';
    wrapper.setAttribute('role', 'group');
    wrapper.setAttribute('aria-label', 'Selecionar dificuldade');

    const label = document.createElement('span');
    label.className = 'difficulty-selector__label';
    label.textContent = 'Dificuldade';
    wrapper.appendChild(label);

    LEVELS.forEach((level) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'difficulty-chip';
      btn.dataset.level = level;
      btn.textContent = level.toUpperCase();
      btn.addEventListener('click', () => this.setLevel(level));
      this.buttons.push(btn);
      wrapper.appendChild(btn);
    });

    this.container.appendChild(wrapper);
  }

  /**
   * @param {string} level
   */
  setLevel(level) {
    const normalized = this._normalize(level);
    this.level = normalized;
    this.applyActiveState(normalized);
    this._persistLevel(normalized);

    if (typeof this.onChange === 'function') {
      this.onChange(normalized);
    }

    this.dispatchChange(normalized);
  }

  /**
   * @returns {string}
   */
  getLevel() {
    return this.level;
  }

  /**
   * @param {DifficultyLevel} level
   */
  applyActiveState(level) {
    this.buttons.forEach((btn) => {
      const isActive = btn.dataset.level === level;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  /**
   * @param {DifficultyLevel} level
   */
  dispatchChange(level) {
    const event = new CustomEvent('difficultychange', {
      detail: { level, gameId: this.gameId },
      bubbles: true,
    });
    this.container?.dispatchEvent(event);
  }

  /**
   * @param {string} raw
   * @returns {string}
   */
  /**
   * @param {string} raw
   * @returns {DifficultyLevel}
   */
  _normalize(raw) {
    const value = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
    return LEVELS.includes(/** @type {DifficultyLevel} */ (value)) ? /** @type {DifficultyLevel} */ (value) : 'medium';
  }

  /**
   * @param {string} fallback
   * @returns {string}
   */
  /**
   * @param {string} fallback
   * @returns {DifficultyLevel}
   */
  _loadLevel(fallback) {
    const key = this._buildKey();
    const stored = this._getStored(key);
    return this._normalize(stored || fallback);
  }

  /** @param {DifficultyLevel} level */
  _persistLevel(level) {
    const key = this._buildKey();
    this._setStored(key, level);
  }

  _buildKey() {
    return `${this.gameId}_difficulty`;
  }

  /** @param {string} key */
  _getStored(key) {
    try {
      if (BN_WIN.GameStorage) {
        return BN_WIN.GameStorage.get(key, '');
      }
      const ls = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : '';
      return ls || MEMORY[key] || '';
    } catch (_) {
      return MEMORY[key] || '';
    }
  }

  /**
   * @param {string} key
   * @param {string} value
   */
  _setStored(key, value) {
    try {
      if (BN_WIN.GameStorage) {
        BN_WIN.GameStorage.set(key, value);
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
      MEMORY[key] = value;
    } catch (_) {
      MEMORY[key] = value;
    }
  }
}

if (typeof window !== 'undefined') {
  BN_WIN.DifficultySelector = DifficultySelector;
}
