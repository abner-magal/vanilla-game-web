// @ts-check

/**
 * Wrapper for localStorage with error handling.
 */
class GameStorage {
    /**
     * Get a value from storage.
     * @param {string} key 
     * @param {any} [defaultValue=null] - Default value if key doesn't exist or error occurs
     * @returns {any} Parsed value or defaultValue
     */
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`GameStorage.get failed for key "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Set a value in storage.
     * @param {string} key 
     * @param {any} value 
     * @returns {boolean} True if successful, false if failed
     */
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`GameStorage.set failed for key "${key}":`, error);

            // Show user-friendly message for quota exceeded
            if (error.name === 'QuotaExceededError') {
                console.warn('⚠️ LocalStorage quota exceeded. High scores may not save.');
            }
            return false;
        }
    }

    /**
     * Get high score for a game.
     * @param {string} gameId 
     * @returns {number}
     */
    static getHighScore(gameId) {
        return this.get(`${gameId}_highscore`) || 0;
    }

    /**
     * Set high score if new score is higher.
     * @param {string} gameId 
     * @param {number} score 
     * @returns {boolean} True if new high score was set
     */
    static setHighScore(gameId, score) {
        try {
            const current = this.getHighScore(gameId);
            if (score > current) {
                this.set(`${gameId}_highscore`, score);
                return true; // New high score
            }
            return false;
        } catch (e) {
            console.error('Error setting high score', e);
            return false;
        }
    }
}
