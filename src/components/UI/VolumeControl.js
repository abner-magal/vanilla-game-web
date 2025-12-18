// @ts-check

const DEFAULT_BARS = 10;
const STEP = 0.1;

class VolumeControl {
  /**
   * @param {string} containerId - ID do container alvo
   * @param {Object} [options]
   * @param {AudioManager|{setVolume?: (v:number)=>void, getVolume?: ()=>number, play?: (id:string)=>void}} [options.audio] - instância de áudio compatível
   * @param {number} [options.initialVolume=1]
   * @param {number} [options.step=STEP]
   * @param {(v:number)=>void} [options.onChange] - callback opcional para aplicar volume
   * @param {(v:number)=>void} [options.onFeedback] - callback opcional para tocar feedback
   */
  constructor(containerId, { audio, initialVolume = 1, step = STEP, onChange, onFeedback } = {}) {
    this.container = document.getElementById(containerId);
    this.audioManager = audio;
    this.onChange = onChange;
    this.onFeedback = onFeedback;
    this.step = step;

    this.bars = [];
    this.volume = this.resolveVolume(initialVolume);

    if (!this.container) {
      console.warn(`VolumeControl container '${containerId}' not found.`);
      return;
    }

    this.render();
    this.updateBars(this.volume);
  }

  /**
   * Renderiza a estrutura do controle de volume.
   */
  render() {
    if (!this.container) return;

    // Limpa conteúdo anterior
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'volume-control';

    const btnDecrease = document.createElement('button');
    btnDecrease.className = 'vol-btn';
    btnDecrease.dataset.action = 'decrease';
    btnDecrease.innerHTML = '<span class="material-symbols-outlined">remove</span>';

    const barsWrapper = document.createElement('div');
    barsWrapper.className = 'vol-bars';

    this.bars = Array.from({ length: DEFAULT_BARS }).map((_, index) => {
      const bar = document.createElement('div');
      bar.className = 'vol-bar';
      bar.dataset.index = String(index);
      barsWrapper.appendChild(bar);
      return bar;
    });

    const btnIncrease = document.createElement('button');
    btnIncrease.className = 'vol-btn';
    btnIncrease.dataset.action = 'increase';
    btnIncrease.innerHTML = '<span class="material-symbols-outlined">add</span>';

    wrapper.appendChild(btnDecrease);
    wrapper.appendChild(barsWrapper);
    wrapper.appendChild(btnIncrease);

    this.container.appendChild(wrapper);

    wrapper.addEventListener('click', (event) => {
      const target = event.target;
      const btn = target.closest('[data-action]');
      if (!btn || !(btn instanceof HTMLElement)) return;

      const action = btn.dataset.action;
      if (action === 'decrease') {
        this.setVolume(this.volume - STEP);
      } else if (action === 'increase') {
        this.setVolume(this.volume + STEP);
      }
    });
  }

  /**
   * Atualiza as barras visualmente de acordo com o volume (0..1).
   * @param {number} volume
   */
  updateBars(volume) {
    const clamped = Math.max(0, Math.min(1, volume));
    const activeCount = Math.round(clamped * this.bars.length);

    this.bars.forEach((bar, index) => {
      if (index < activeCount) {
        bar.classList.add('active');
      } else {
        bar.classList.remove('active');
      }
    });
  }

  /**
   * Define o volume e aplica feedback visual/sonoro.
   * @param {number} volume
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateBars(this.volume);
    this.applyVolume(this.volume);
    this.playFeedbackSound();
  }

  /**
   * Reproduz som de feedback ao ajustar volume (se disponível).
   */
  playFeedbackSound() {
    if (typeof this.onFeedback === 'function') {
      this.onFeedback(this.volume);
      return;
    }

    if (this.audioManager && typeof this.audioManager.play === 'function') {
      this.audioManager.play('ui-volume');
    }
  }

  /**
   * Obtém volume inicial de diferentes fontes.
   * @param {number} fallback
   */
  resolveVolume(fallback) {
    if (this.audioManager) {
      if (typeof this.audioManager.getVolume === 'function') return this.audioManager.getVolume();
      if (this.audioManager.masterGain?.gain?.value != null) return this.audioManager.masterGain.gain.value;
      if (typeof this.audioManager.volume === 'number') return this.audioManager.volume;
    }
    return fallback;
  }

  /**
   * Aplica volume no destino adequado.
   * @param {number} value
   */
  applyVolume(value) {
    if (typeof this.onChange === 'function') {
      this.onChange(value);
      return;
    }

    if (!this.audioManager) return;

    if (typeof this.audioManager.setVolume === 'function') {
      this.audioManager.setVolume(value);
      return;
    }

    if (this.audioManager.masterGain?.gain) {
      this.audioManager.masterGain.gain.value = value;
      return;
    }

    if (typeof this.audioManager.volume === 'number') {
      this.audioManager.volume = value;
    }
  }
}

if (typeof window !== 'undefined') {
  window.VolumeControl = VolumeControl;
}