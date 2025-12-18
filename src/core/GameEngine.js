// @ts-check
// Imports removed for local compatibility
// GameLoop, InputManager, AudioManager are expected to be loaded globally

/**
 * Base class for all games.
 * Handles the game loop, input, audio, and state management.
 */
class GameEngine {
  /**
   * @param {Object} config - Game configuration
   * @param {string} [config.containerId='game-container'] - ID of the DOM element to render into
   * @param {Object} [config.initialState={}] - Initial game state
   */
  constructor(config) {
    this.container = document.getElementById(
      config.containerId || 'game-container'
    );
    if (!this.container) {
      throw new Error(
        `GameEngine: Container element '${
          config.containerId || 'game-container'
        }' not found. Game cannot initialize.`
      );
    }

    this.input = new InputManager();
    this.audio = new AudioManager();
    this.loop = new GameLoop(this.update.bind(this), this.render.bind(this));

    this.state = {
      score: 0,
      highScore: 0,
      isPlaying: false,
      isPaused: false,
      ...config.initialState,
    };

    // Handler para pausar quando aba fica inativa (economia de CPU)
    this.handleVisibility = this.handleVisibility.bind(this);
    document.addEventListener('visibilitychange', this.handleVisibility);

    try {
      this.init();
    } catch (error) {
      console.error('Error during game initialization:', error);
      this.showError('Falha ao inicializar o jogo. Recarregue a página.');
    }
  }

  /**
   * Initialize the game. Override in subclass.
   */
  init() {
    // Override in subclass
  }

  /**
   * Start the game loop.
   */
  start() {
    try {
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.loop.start();
      this.onStart();
    } catch (error) {
      console.error('Error starting game:', error);
      this.stop();
      this.showError('Erro ao iniciar o jogo.');
    }
  }

  /**
   * Stop the game loop.
   */
  stop() {
    this.state.isPlaying = false;
    this.loop.stop();
    this.onStop();
  }

  /**
   * Pause the game.
   */
  pause() {
    this.state.isPaused = true;
    this.loop.stop();
  }

  /**
   * Resume the game.
   */
  resume() {
    if (this.state.isPlaying) {
      this.state.isPaused = false;
      this.loop.start();
    }
  }

  /**
   * Handle visibility change - pause when tab is inactive.
   */
  handleVisibility() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }

  /**
   * Update game logic. Override in subclass.
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    // Override in subclass
  }

  /**
   * Render game state. Override in subclass.
   */
  render() {
    // Override in subclass
  }

  /**
   * Cleanup resources.
   */
  teardown() {
    this.stop();
    if (this.input) {
      this.input.destroy();
    }
    // Remover listener de visibilidade
    document.removeEventListener('visibilitychange', this.handleVisibility);
    // Audio cleanup if needed
  }

  /**
   * Display user-friendly error message in the game container.
   * @param {string} message - Error message to display
   */
  showError(message) {
    if (this.container) {
      this.container.innerHTML = `
                <div style="color: #ff4444; padding: 20px; text-align: center; font-family: sans-serif;">
                    <h2>⚠️ Erro</h2>
                    <p>${message}</p>
                </div>
            `;
    }
  }

  onStart() {}
  onStop() {}
}
