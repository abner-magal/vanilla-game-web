class Button {
  constructor(containerId, text, onClick, className = 'btn') {
    this.container = document.getElementById(containerId);
    this.text = text;
    this.boundOnClick = onClick; // Save reference for cleanup
    this.className = className;
    this.element = null;

    this.render();
  }

  setText(text) {
    if (this.element) this.element.textContent = text;
  }

  setDisabled(disabled) {
    if (this.element) this.element.disabled = disabled;
  }

  render() {
    if (!this.container) return;
    this.element = document.createElement('button');
    this.element.className = this.className;
    this.element.textContent = this.text;
    this.element.addEventListener('click', this.boundOnClick);
    this.container.appendChild(this.element);
  }

  /**
   * Cleanup event listeners and remove element from DOM.
   * Call this when the button is no longer needed to prevent memory leaks.
   */
  destroy() {
    if (this.element) {
      this.element.removeEventListener('click', this.boundOnClick);
      this.element.remove();
      this.element = null;
    }
  }
}
