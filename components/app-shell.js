import './iptv-sidebar.js';
import './channel-grid.js';
import './loading-overlay.js';

export class AppShell extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (this.innerHTML) return;
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="ambient ambient--one"></div>
      <div class="ambient ambient--two"></div>

      <header class="app-header">
        <div class="logo-mark">
          <span class="logo-mark__accent">IP</span>
          <div>
            <strong>IPTV</strong>
          </div>
        </div>
        <div class="line-switcher" aria-label="线路切换">
          <div class="line-switcher__label">线路</div>
          <select id="line-select" class="line-switcher__select"></select>
        </div>
      </header>

      <div class="container">
        <iptv-sidebar></iptv-sidebar>
        <main class="main-content">
          <channel-grid></channel-grid>
        </main>
      </div>



      <loading-overlay id="loading-overlay"></loading-overlay>
    `;
  }
}

customElements.define('app-shell', AppShell);
