import './channel-card.js';

export class ChannelGrid extends HTMLElement {
    #groupName = '';
    #query = '';

    constructor() {
        super();
        if (!this.classList.contains('panel')) this.classList.add('panel');
        if (!this.classList.contains('channels')) this.classList.add('channels');
    }

    renderChannels(channels, { groupName = '', query = '' } = {}) {
        this.#groupName = groupName;
        this.#query = query;
        this.innerHTML = '';

        if (!channels?.length) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            const target = groupName || '该分组';
            empty.textContent = query
                ? `在 ${target} 中没有匹配的频道`
                : '暂无频道，请加载播放列表';
            this.appendChild(empty);
            return;
        }

        const fragment = document.createDocumentFragment();
        channels.forEach(channel => {
            const card = document.createElement('channel-card');
            card.channel = channel;
            fragment.appendChild(card);
        });
        this.appendChild(fragment);
    }
}

customElements.define('channel-grid', ChannelGrid);
