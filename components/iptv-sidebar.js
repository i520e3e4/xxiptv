export class IptvSidebar extends HTMLElement {
  #categories = [];
  #activeIndex = 0;
  #listEl;
  #searchInput;

  constructor() {
    super();
    this.classList.add('sidebar');
  }

  connectedCallback() {
    if (!this.innerHTML) {
      this.innerHTML = `
        <div class="sidebar__header">
          <h2>频道分类</h2>
          <p>选择你想看的频道类型</p>
        </div>
        <label class="sidebar__search">
          <input type="search" placeholder="搜索频道 / 关键词" aria-label="搜索频道">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 15l5 5m-2-8a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </label>
        <ul class="category-list"></ul>
        <div class="sidebar__footer">

        </div>
      `;
    }

    this.#listEl = this.querySelector('.category-list');
    this.#searchInput = this.querySelector('input[type="search"]');

    this.#searchInput?.addEventListener('input', () => {
      this.dispatchEvent(
        new CustomEvent('querychange', {
          detail: this.#searchInput.value,
          bubbles: true
        })
      );
    });

    this.render();
  }

  set categories(list) {
    this.#categories = Array.isArray(list) ? list : [];
    this.render();
  }

  set activeIndex(idx) {
    this.#activeIndex = idx ?? 0;
    this.render();
  }

  render() {
    if (!this.#listEl) return;
    this.#listEl.innerHTML = '';

    if (!this.#categories.length) {
      const empty = document.createElement('li');
      empty.className = 'category-list__empty';
      empty.textContent = '暂无频道，请加载播放列表';
      this.#listEl.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    this.#categories.forEach((group, idx) => {
      const item = document.createElement('li');
      item.dataset.index = idx.toString();
      const text = document.createElement('div');
      text.className = 'category-list__text';
      text.innerHTML = `<strong>${group.name}</strong><span>共 ${group.count} 个频道</span>`;

      const count = document.createElement('span');
      count.className = 'category-list__count';
      count.textContent = `${group.count}`;

      item.append(text, count);
      item.classList.toggle('active', idx === this.#activeIndex);
      item.addEventListener('click', () => this.#handleSelect(idx));

      fragment.appendChild(item);
    });

    this.#listEl.appendChild(fragment);
  }

  #handleSelect(idx) {
    this.#activeIndex = idx;
    this.render();
    this.dispatchEvent(
      new CustomEvent('categoryselect', {
        detail: { index: idx },
        bubbles: true
      })
    );
  }
}

customElements.define('iptv-sidebar', IptvSidebar);
