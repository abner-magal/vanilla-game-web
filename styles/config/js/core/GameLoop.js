/**
 * Core Game Loop Class
 * Handles the requestAnimationFrame loop and delta time calculation.
 */
class GameLoop {
    constructor(updateFn, drawFn) {
        this.updateFn = updateFn;
        this.drawFn = drawFn;
        this.lastTime = 0;
        this.isRunning = false;
        this.animationFrameId = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = (timestamp - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = timestamp;

        if (this.updateFn) this.updateFn(deltaTime);
        if (this.drawFn) this.drawFn();

        this.animationFrameId = requestAnimationFrame((timestamp) => this.loop(timestamp));
    }
}
