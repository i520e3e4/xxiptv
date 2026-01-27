const PLACEHOLDER_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host{display:block}
    .channel-card{
      position:relative;
      display:flex;
      align-items:center;
      gap:14px;
      padding:14px 14px 12px 14px;
      border-radius:16px;
      background:rgba(255,255,255,0.03);
      border:1px solid rgba(255,255,255,0.07);
      box-shadow:0 12px 30px rgba(0,0,0,0.45);
      position:relative;
      transition:transform .18s ease, border-color .18s ease, box-shadow .18s ease, background .18s ease;
      cursor:pointer;
    }
    .channel-card:hover{
      transform:translateY(-4px);
      border-color:rgba(74,226,255,0.4);
      box-shadow:0 16px 38px rgba(0,0,0,0.5);
      background:rgba(74,226,255,0.06);
    }
    .channel-card__logo{
      width:64px;
      height:64px;
      border-radius:12px;
      border:1px solid rgba(255,255,255,0.1);
      display:grid;
      place-items:center;
      background:linear-gradient(145deg, rgba(255,255,255,0.04), rgba(6,17,33,0.85));
      box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);
    }
    .channel-card__logo img{
      max-width:54px;
      max-height:54px;
      object-fit:contain;
      filter:drop-shadow(0 4px 12px rgba(0,0,0,0.35));
    }
    .channel-card__body{
      display:flex;
      flex-direction:column;
      gap:6px;
      flex:1;
      min-width:0;
    }
    .channel-card__name{
      font-size:1.02rem;
      font-weight:680;
      color:var(--card);
      letter-spacing:0.1px;
      margin:0 0 2px 0;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    .channel-card__desc{
      color:var(--muted);
      font-size:0.85rem;
      line-height:1.35;
      margin:0;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    .channel-card__footer{
      display:flex;
      align-items:center;
      gap:10px;
      margin-top:2px;
      color:var(--muted);
      font-size:0.78rem;
    }
    .channel-card__action{
      margin-left:auto;
      display:inline-flex;
      align-items:center;
      gap:6px;
      font-size:0.84rem;
      padding:6px 10px;
      border-radius:12px;
      border:1px solid rgba(74,226,255,0.4);
      background:rgba(74,226,255,0.08);
      color:var(--accent);
      transition:all .18s ease;
    }
    .channel-card:hover .channel-card__action{
      background:rgba(74,226,255,0.15);
      box-shadow:0 8px 20px rgba(74,226,255,0.2);
    }
    .channel-card__action svg{
      width:16px;
      height:16px;
      fill:none;
      stroke:currentColor;
      stroke-width:2;
    }
  </style>
  <article class="channel-card">
    <div class="channel-card__logo">
      <img data-logo alt="">
    </div>
    <div class="channel-card__body">
      <p class="channel-card__name" data-name></p>
      <p class="channel-card__desc" data-desc></p>
      <div class="channel-card__footer">
        <div class="channel-card__action">
          <span>立即观看</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 4l15 8-15 8z" />
          </svg>
        </div>
      </div>
    </div>
  </article>
`;

export class ChannelCard extends HTMLElement {
  #channel = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.addEventListener('click', this.#handleClick);
    if (this.#channel) this.#render();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#handleClick);
  }

  set channel(value) {
    this.#channel = value;
    if (this.isConnected) this.#render();
  }

  get channel() {
    return this.#channel;
  }

  #handleClick = () => {
    if (!this.#channel) return;
    this.dispatchEvent(
      new CustomEvent('channelselect', {
        detail: this.#channel,
        bubbles: true,
        composed: true
      })
    );
  };

  #render() {
    if (!this.shadowRoot || !this.#channel) return;
    const attributes = this.#channel.playInfo?.attributes ?? {};

    const logoEl = this.shadowRoot.querySelector('[data-logo]');
    logoEl.src = this.#channel.logo || PLACEHOLDER_PIXEL;
    logoEl.alt = this.#channel.name;
    logoEl.loading = 'lazy';

    this.shadowRoot.querySelector('[data-name]').textContent = this.#channel.name;
    const desc = attributes['svg-name'] || this.#channel.groupName || '';
    const descEl = this.shadowRoot.querySelector('[data-desc]');
    descEl.textContent = desc;
    descEl.style.display = desc ? 'block' : 'none';
  }
}

customElements.define('channel-card', ChannelCard);
