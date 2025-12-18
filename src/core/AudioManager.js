// @ts-check

/**
 * Manages game audio playback.
 */
class AudioManager {
  constructor() {
    this.sounds = {};
    this.muted = false;
  }

  /**
   * Load an audio file.
   * @param {string} name - Sound identifier
   * @param {string} path - Path to audio file
   */
  load(name, path) {
    const audio = new Audio(path);
    this.sounds[name] = audio;
  }

  /**
   * Play a loaded sound.
   * @param {string} name - Sound identifier
   */
  play(name) {
    if (this.muted || !this.sounds[name]) {
      if (!this.sounds[name]) {
        console.warn(`AudioManager: Sound "${name}" not found.`);
      }
      return;
    }

    // Clone node to allow overlapping sounds
    const sound = this.sounds[name].cloneNode();
    sound.volume = this.sounds[name].volume || 1; // cloneNode() doesn't copy volume
    sound.play().catch((error) => {
      // Silently ignore autoplay policy errors (user hasn't interacted yet)
      if (error.name !== 'NotAllowedError') {
        console.error(`AudioManager: Failed to play "${name}":`, error);
      }
    });
  }

  /**
   * Toggle mute on/off.
   * @returns {boolean} New muted state
   */
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}
