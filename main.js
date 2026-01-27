import './components/app-shell.js';
import './components/channel-card.js';
import './components/iptv-sidebar.js';
import './components/channel-grid.js';
import './components/loading-overlay.js';
import { parseM3U } from './m3u-parser.js';
import {
    DEFAULT_PLAYLIST_HINT,
    LINE_OPTIONS,
    ENABLE_503_PAGE,
    PAGE_503_PATH,
    ENABLE_501_PAGE,
    PAGE_501_PATH,
    APPLE_CMS_API_URL
} from './config.js';
import { MacCMSClient, mapCategoryToGroup, mapVideoToChannel } from './mac-cms-client.js';

const LINE_STORAGE_KEY = 'iptv-active-line';

const state = {
    activeGroup: 0,
    channels: [],
    groups: [],
    query: '',
    lines: [],
    activeLineName: '',
    isVodMode: false, // New flag for AppleCMS mode
    vodClient: null,
    vodPage: 1
};

function shouldRedirect(currentPath, targetPage) {
    const normalizedTarget = targetPage.replace(/^\//, '');
    return !(
        currentPath === `/${normalizedTarget}` ||
        currentPath.endsWith(`/${normalizedTarget}`)
    );
}

function redirectIfUnavailable() {
    const currentPath = window.location.pathname;
    if (ENABLE_503_PAGE) {
        const queueUrl = new URL(PAGE_503_PATH, window.location.href);
        if (shouldRedirect(currentPath, PAGE_503_PATH)) {
            window.location.replace(queueUrl.toString());
        }
        return true;
    }

    if (ENABLE_501_PAGE) {
        const comingUrl = new URL(PAGE_501_PATH, window.location.href);
        if (shouldRedirect(currentPath, PAGE_501_PATH)) {
            window.location.replace(comingUrl.toString());
        }
        return true;
    }

    return false;
}

// Existing channel filter (Client-side search)
function filterChannels(channels, query) {
    if (!query) return channels;
    const needle = query.trim().toLowerCase();

    // If in VOD mode, we trust the API to return results (handled elsewhere), or client filter the current page
    // For simplicity, we just filter current page data
    if (!needle) return channels;

    return channels.filter(channel => {
        const attributes = channel.playInfo?.attributes ?? {};
        const haystack = [
            channel.name,
            channel.groupName,
            channel.playInfo?.url ?? '',
            attributes['svg-id'] ?? '',
            attributes['svg-name'] ?? ''
        ]
            .join(' ')
            .toLowerCase();

        return haystack.includes(needle);
    });
}

function selectCategory(idx, sidebar, grid) {
    state.activeGroup = idx;
    sidebar.activeIndex = idx;

    if (state.isVodMode) {
        loadVodVideos(state.groups[idx].id, 1, grid);
    } else {
        renderChannels(grid);
    }
}

// New function to load VOD videos
async function loadVodVideos(categoryId, page, grid) {
    if (!state.vodClient) return;

    grid.innerHTML = '<div class="loading">正在加载资源...</div>'; // Simple loading state

    let result;
    // If it's a search, categoryId might be ignored or handled differently
    // But strict category selection takes precedence
    result = await state.vodClient.fetchVideos(categoryId, page);

    const vodList = result.list || [];
    const channels = vodList.map(mapVideoToChannel);

    state.channels = channels;
    state.vodPage = page;

    // Render without filtering (filtering done by API usually, or we filter client side)
    // Here we just render what we got
    grid.renderChannels(channels, {
        groupName: state.groups[state.activeGroup]?.name ?? '',
        query: state.query
    });
}

function renderChannels(grid) {
    const group = state.groups[state.activeGroup];
    const currentGroupChannels = group
        ? state.channels.filter(channel => channel.parentId === group.id)
        : [];
    const filtered = filterChannels(currentGroupChannels, state.query);

    grid.renderChannels(filtered, {
        groupName: group?.name ?? '',
        query: state.query
    });
}

function isLinuxDesktop() {
    const ua = (navigator.userAgent || '').toLowerCase();
    const isAndroid = ua.includes('android');
    return ua.includes('linux') && !isAndroid;
}

function buildPlayerPageUrl(streamUrl) {
    if (!streamUrl) return '';
    const targetPage = '/player.html';
    const params = new URLSearchParams({ url: streamUrl, isLive: 'true' });
    return `${targetPage}?${params.toString()}`;
}

function applyPlaylist(text, sidebar, grid) {
    const { channels, groups } = parseM3U(text);
    const filteredGroups = groups.filter(group => !/4k/i.test(group?.name || ''));
    state.channels = channels;
    state.groups = filteredGroups;
    state.activeGroup = 0;
    sidebar.categories = filteredGroups;
    sidebar.activeIndex = 0;
    renderChannels(grid);
}

function renderLineOptions(selectEl) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    state.lines.forEach((line, idx) => {
        const option = document.createElement('option');
        option.value = line.name;
        option.textContent = line.name || `线路${idx + 1}`;
        selectEl.appendChild(option);
    });
    selectEl.value = state.activeLineName || state.lines[0]?.name || '';
}

function loadSavedLineName(lines) {
    try {
        const savedName = localStorage.getItem(LINE_STORAGE_KEY);
        if (!savedName) return lines[0]?.name || '';
        const hasMatch = lines.some(line => line.name === savedName);
        return hasMatch ? savedName : (lines[0]?.name || '');
    } catch (error) {
        console.warn('读取线路缓存失败，将使用默认线路', error);
        return lines[0]?.name || '';
    }
}

function saveActiveLineName(name) {
    try {
        if (name) localStorage.setItem(LINE_STORAGE_KEY, name);
    } catch (error) {
        console.warn('保存线路缓存失败', error);
    }
}

function getActiveLine(lines, activeName) {
    return lines.find(line => line.name === activeName) || lines[0];
}

async function loadPlaylist(line, loadingEl, sidebar, grid) {
    const activeLine = line || getActiveLine(state.lines, state.activeLineName);
    const target = activeLine?.url || DEFAULT_PLAYLIST_HINT;
    const lineName = activeLine?.name || "默认线路";

    loadingEl.show(`正在加载频道：${lineName}...`);

    try {
        // Check if we are switching to AppleCMS mode
        // 1. Check explicit type
        // 2. Check URL pattern (fallback)
        const isVod = activeLine?.type === 'apple_cms' || target.includes('/provide/vod');

        if (isVod) {
            state.isVodMode = true;
            state.vodClient = new MacCMSClient(target);
            const categories = await state.vodClient.fetchCategories();

            const groups = categories.map(mapCategoryToGroup);
            state.groups = groups;
            state.activeGroup = 0;
            sidebar.categories = groups;

            // Load first category
            if (groups.length > 0) {
                await loadVodVideos(groups[0].id, 1, grid);
            } else {
                // If API fails or is empty
                grid.renderChannels([], { groupName: '无分类' });
            }
            return;
        }

        // Normal M3U Mode
        state.isVodMode = false;
        state.vodClient = null;

        const response = await fetch(target, { cache: "no-store" });
        if (!response.ok) throw new Error(`请求失败: ${response.status}`);
        const text = await response.text();
        applyPlaylist(text, sidebar, grid);
    } catch (error) {
        console.warn("加载远程播放列表失败", error);
        // applyPlaylist('', sidebar, grid); // Don't clear if it was just a network blip? or clear?
        // for safety clear
        applyPlaylist('', sidebar, grid);
    } finally {
        loadingEl.hide();
    }
}

async function bootstrap() {
    await customElements.whenDefined('app-shell');
    const shell = document.querySelector('app-shell');
    if (!shell) return;
    const sidebar = shell.shadowRoot.querySelector('iptv-sidebar');
    const grid = shell.shadowRoot.querySelector('channel-grid');
    const loadingEl = shell.shadowRoot.querySelector('loading-overlay');
    const lineSelect = shell?.querySelector('#line-select');

    // Load external VOD sources (jin18.json)
    try {
        const res = await fetch('api/jin18.json');
        if (res.ok) {
            const config = await res.json();
            const vodSites = config.api_site || {};
            const externalLines = Object.values(vodSites).map(site => ({
                name: site.name,
                url: site.api,
                type: 'apple_cms'
            }));

            // Merge into LINE_OPTIONS
            LINE_OPTIONS.push(...externalLines);
        }
    } catch (e) {
        console.warn('Failed to load external VOD sources', e);
    }

    // Restore state
    state.lines = [...LINE_OPTIONS];
    state.activeLineName = loadSavedLineName(state.lines);

    // Setup sidebar lines BEFORE setting active index
    if (sidebar) {
        sidebar.lines = state.lines;
    }

    const donateTrigger = shell?.querySelector('.donate-trigger');
    const donateModal = shell?.querySelector('.donate-modal');
    const donateClose = shell?.querySelector('.donate-modal__close');

    if (!sidebar || !grid || !loadingEl) return;

    const setDonateOpen = open => {
        if (!donateModal) return;
        donateModal.classList.toggle('is-open', open);
        donateModal.setAttribute('aria-hidden', open ? 'false' : 'true');
        document.body.classList.toggle('donate-open', open);
    };

    donateTrigger?.addEventListener('click', () => setDonateOpen(true));
    donateClose?.addEventListener('click', () => setDonateOpen(false));
    donateModal?.addEventListener('click', event => {
        if (event.target === donateModal) setDonateOpen(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') setDonateOpen(false);
    });


    renderLineOptions(lineSelect);

    lineSelect?.addEventListener('change', event => {
        const selectedName = (event.target.value || '').trim();
        const hasMatch = state.lines.some(line => line.name === selectedName);
        state.activeLineName = hasMatch ? selectedName : (state.lines[0]?.name || '');
        saveActiveLineName(state.activeLineName);
        renderLineOptions(lineSelect);
        const activeLine = getActiveLine(state.lines, state.activeLineName);
        loadPlaylist(activeLine, loadingEl, sidebar, grid);
    });

    sidebar.addEventListener('querychange', async event => {
        state.query = (event.detail || '').trim();

        if (state.isVodMode && state.vodClient && state.query) {
            // Perform server-side search for VOD
            // Note: MacCMS search is usually global, not per category
            const result = await state.vodClient.searchVideos(state.query, 1);
            const channels = (result.list || []).map(mapVideoToChannel);
            state.channels = channels;
            grid.renderChannels(channels, { query: state.query });
        } else {
            renderChannels(grid);
        }
    });

    sidebar.addEventListener('categoryselect', event => {
        const idx = event.detail?.index ?? 0;
        selectCategory(idx, sidebar, grid);
    });

    grid.addEventListener('channelselect', event => {
        const channel = event.detail;
        if (channel?.playInfo?.url) {
            const targetUrl = buildPlayerPageUrl(channel.playInfo.url);
            window.open(targetUrl, '_blank');
        }
    });

    const initialLine = getActiveLine(state.lines, state.activeLineName);
    saveActiveLineName(state.activeLineName);
    loadPlaylist(initialLine, loadingEl, sidebar, grid);
}

if (!redirectIfUnavailable()) {
    bootstrap();
}
