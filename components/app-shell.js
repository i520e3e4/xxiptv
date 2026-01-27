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

      <div class="donate-modal" aria-hidden="true">
        <div class="donate-modal__panel" role="dialog" aria-label="打赏">
          <div class="donate-modal__header">
            <div>
              <div class="donate-modal__eyebrow">Support</div>
              <h3>打赏支持</h3>
            </div>
            <button class="donate-modal__close" type="button" aria-label="关闭">&times;</button>
          </div>
          <div class="donate-modal__grid">
            <div class="donate-qr">
              <img src="assets/alipay-qr.png" alt="支付宝二维码">
              <span>支付宝</span>
            </div>
            <div class="donate-qr">
              <img src="assets/wechat-qr.png" alt="微信二维码">
              <span>微信</span>
            </div>
          </div>
        </div>
      </div>

      <loading-overlay id="loading-overlay"></loading-overlay>
    `;
  }
}

customElements.define('app-shell', AppShell);
