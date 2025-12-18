(() => {
    class Modal {
        constructor(title, message, onClose) {
            this.title = title;
            this.message = message;
            this.onClose = onClose;
            this.element = null;
        }

        show() {
            this.element = document.createElement('div');
            this.element.className = 'modal-overlay';
            this.element.innerHTML = `
                <div class="modal">
                    <h2>${this.title}</h2>
                    <p>${this.message}</p>
                    <button class="btn close-btn">Close</button>
                </div>
            `;
            
            this.element.querySelector('.close-btn').addEventListener('click', () => {
                this.hide();
                if (this.onClose) this.onClose();
            });

            document.body.appendChild(this.element);
        }

        hide() {
            if (this.element) {
                this.element.remove();
                this.element = null;
            }
        }
    }

    window.Modal = Modal;
})();
