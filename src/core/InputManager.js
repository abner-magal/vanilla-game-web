// @ts-check

/**
 * Manages keyboard input using Singleton Pattern.
 * Prevents memory leaks from multiple instances creating duplicate event listeners.
 */
class InputManager {
  constructor() {
    // Singleton Pattern: return existing instance if it exists
    if (InputManager.instance) {
      return InputManager.instance;
    }

    // Store instance reference
    InputManager.instance = this;

    this.keys = {};
    this.listeners = [];

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  /**
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    this.keys[e.code] = true;
    this.emit('keydown', e.code);
  }

  /**
   * @param {KeyboardEvent} e
   */
  handleKeyUp(e) {
    this.keys[e.code] = false;
    this.emit('keyup', e.code);
  }

  /**
   * Check if a key is currently down.
   * @param {string} code - Key code (e.g., 'ArrowUp')
   * @returns {boolean}
   */
  isDown(code) {
    return !!this.keys[code];
  }

  /**
   * Subscribe to an event.
   * @param {string} event - Event name ('keydown' or 'keyup')
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    this.listeners.push({ event, callback });
  }

  /**
   * Emit an event to listeners.
   * Wraps callbacks in try/catch to prevent one failing listener from blocking others.
   * @param {string} event
   * @param {any} data
   */
  emit(event, data) {
    this.listeners.forEach((l) => {
      if (l.event === event) {
        try {
          l.callback(data);
        } catch (error) {
          console.error(
            `InputManager: Error in listener for "${event}":`,
            error
          );
        }
      }
    });
  }

  /**
   * Remove event listeners and cleanup.
   * Resets singleton instance to allow re-initialization.
   */
  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.listeners = [];
    this.keys = {};

    // Reset singleton instance
    InputManager.instance = null;
  }
}
