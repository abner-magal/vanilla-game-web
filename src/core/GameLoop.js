// @ts-check

/**
 * Manages the game loop using requestAnimationFrame with fixed time steps.
 * Ensures consistent game logic updates regardless of frame rate.
 */
class GameLoop {
    /**
     * @param {function(number): void} update - Update callback function (receives deltaTime in seconds)
     * @param {function(): void} [render] - Optional render callback function
     */
    constructor(update, render) {
        this.lastTime = 0;
        this.accumulatedTime = 0;
        this.deltaTime = 1 / 60; // Fixed time step (60 FPS)
        this.update = update;
        this.render = render;
        this.rafId = null;
        this.isRunning = false;

        this.loop = this.loop.bind(this);
    }

    /**
     * Main game loop callback.
     * @param {number} timestamp - High-resolution timestamp from requestAnimationFrame
     * @private
     */
    loop(timestamp) {
        if (!this.isRunning) return;

        if (!this.lastTime) this.lastTime = timestamp;

        let frameTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Prevent spiral of death (cap at 250ms)
        if (frameTime > 0.25) frameTime = 0.25;

        this.accumulatedTime += frameTime;

        // Fixed time step updates
        while (this.accumulatedTime >= this.deltaTime) {
            this.update(this.deltaTime);
            this.accumulatedTime -= this.deltaTime;
        }

        if (this.render) this.render();

        this.rafId = requestAnimationFrame(this.loop);
    }

    /**
     * Start the game loop.
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = 0;
            this.rafId = requestAnimationFrame(this.loop);
        }
    }

    /**
     * Stop the game loop.
     */
    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
}
