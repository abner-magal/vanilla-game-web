/**
 * Storage Utility
 * Wrapper for localStorage to handle high scores and game settings.
 */
class GameStorage {
    static get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('Error reading from storage', e);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to storage', e);
            return false;
        }
    }

    static getHighScore(gameId) {
        return this.get(`arcade_${gameId}_highscore`, 0);
    }

    static setHighScore(gameId, score) {
        const currentHigh = this.getHighScore(gameId);
        if (score > currentHigh) {
            this.set(`arcade_${gameId}_highscore`, score);
            return true; // New high score!
        }
        return false;
    }
}
