(() => {
    class GameCard {
        constructor(game) {
            this.game = game;
        }

        render() {
            const card = document.createElement('article');
            card.className = 'game-card';
            card.innerHTML = `
                <div class="game-thumbnail">${this.game.icon}</div>
                <div class="game-info">
                    <h3 class="game-title">${this.game.title}</h3>
                    <p class="game-desc">${this.game.description}</p>
                    <a href="${this.game.path}" class="btn play-btn">Play Now</a>
                </div>
            `;
            return card;
        }
    }

    window.GameCard = GameCard;
})();
