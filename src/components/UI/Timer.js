class Timer {
    constructor(containerId, initialTime = 0) {
        this.container = document.getElementById(containerId);
        this.time = initialTime;
        this.element = null;

        this.render();
    }

    update(time) {
        this.time = time;
        if (this.element) {
            this.element.textContent = `Time: ${this.formatTime(this.time)}`;
        }
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    render() {
        if (!this.container) return;
        this.element = document.createElement('div');
        this.element.className = 'timer';
        this.element.textContent = `Time: ${this.formatTime(this.time)}`;
        this.container.appendChild(this.element);
    }
}
