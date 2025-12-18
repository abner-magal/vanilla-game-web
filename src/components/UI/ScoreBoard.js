// @ts-check

/**
 * Displays a score label and value.
 */
class ScoreBoard {
  /**
   * @param {string} containerId - ID of the container element
   * @param {number} [initialScore=0] - Initial score
   * @param {string} [label='Score'] - Label text
   */
  constructor(containerId, initialScore = 0, label = 'Score') {
    this.container = document.getElementById(containerId);
    this.score = initialScore;
    this.label = label;
    this.element = null;

    if (this.container) {
      this.render();
    } else {
      console.warn(`ScoreBoard container '${containerId}' not found.`);
    }
  }

  /**
   * Update the displayed score.
   * @param {number} newScore
   */
  update(newScore) {
    this.score = newScore;
    if (this.element) {
      this.element.textContent = `${this.label}: ${this.score}`;
    }
  }

  /**
   * Render the scoreboard element.
   */
  render() {
    if (!this.container) return;

    // Limpar elemento anterior se existir (evita duplicação)
    const existing = this.container.querySelector('.score-board');
    if (existing) existing.remove();

    this.element = document.createElement('div');
    this.element.className = 'score-board';
    this.element.textContent = `${this.label}: ${this.score}`;
    this.container.appendChild(this.element);
  }
}
