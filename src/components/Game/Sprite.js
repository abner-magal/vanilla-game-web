(() => {
    class Sprite {
        constructor(src, width, height) {
            this.image = new Image();
            this.image.src = src;
            this.width = width;
            this.height = height;
            this.loaded = false;
            
            this.image.onload = () => {
                this.loaded = true;
            };
        }

        draw(ctx, x, y) {
            if (this.loaded) {
                ctx.drawImage(this.image, x, y, this.width, this.height);
            }
        }
    }

    window.Sprite = Sprite;
})();
