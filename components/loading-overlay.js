export class LoadingOverlay extends HTMLElement {
  #messageEl;

  constructor() {
    super();
    this.classList.add('loading-screen', 'loading-screen--hidden');
    this.setAttribute('aria-live', 'polite');
    this.setAttribute('aria-busy', 'false');
  }

  connectedCallback() {
    if (!this.innerHTML) {
      this.innerHTML = `
        <div class="loading-spinner">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>加载频道列表...</p>
      `;
    }
    this.#messageEl = this.querySelector('p');
  }

  show(message = '加载频道列表...') {
    this.#messageEl && (this.#messageEl.textContent = message);
    this.setAttribute('aria-busy', 'true');
    this.classList.remove('loading-screen--hidden');
  }

  hide() {
    this.setAttribute('aria-busy', 'false');
    this.classList.add('loading-screen--hidden');
  }
}

customElements.define('loading-overlay', LoadingOverlay);
