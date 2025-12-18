(() => {
    class Canvas {
        constructor(containerId, width, height) {
            this.container = document.getElementById(containerId);
            this.canvas = document.createElement('canvas');
            this.canvas.width = width;
            this.canvas.height = height;
            this.ctx = this.canvas.getContext('2d');
            
            if (this.container) {
                this.container.appendChild(this.canvas);
            }
        }

        clear() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        resize(width, height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }

        rect(x, y, w, h, color) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, w, h);
        }

        circle(x, y, r, color) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.closePath();
        }
    }

    window.Canvas = Canvas;
})();
