export class MacCMSClient {
    constructor(baseUrl, proxyUrl = '') {
        this.baseUrl = baseUrl;
        this.proxyUrl = proxyUrl;
    }

    _getProxiedUrl(targetUrl) {
        if (!this.proxyUrl) return targetUrl;
        // Assume proxyUrl ends with ?url= or similar query param, otherwise append logic needed
        // The worker guide says https://.../?url=
        // Let's ensure we construct it correctly
        if (this.proxyUrl.includes('?')) {
            return `${this.proxyUrl}${encodeURIComponent(targetUrl)}`;
        }
        return `${this.proxyUrl}?url=${encodeURIComponent(targetUrl)}`;
    }

    async fetchCategories() {
        try {
            // ?ac=list maps to the category list in standard MacCMS APIs
            const target = `${this.baseUrl}?ac=list`;
            const finalUrl = this._getProxiedUrl(target);
            const response = await fetch(finalUrl);
            const data = await response.json();
            return data.class || []; // Standard MacCMS returns { class: [...], list: [...], ... }
        } catch (error) {
            console.error('AppleCMS Categories Error:', error);
            return [];
        }
    }

    async fetchVideos(categoryId, page = 1) {
        try {
            // ?ac=videolist&t={id}&pg={page} maps to video list
            const target = `${this.baseUrl}?ac=videolist&t=${categoryId}&pg=${page}`;
            const finalUrl = this._getProxiedUrl(target);
            const response = await fetch(finalUrl);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('AppleCMS Videos Error:', error);
            return { list: [], total: 0, pagecount: 0 };
        }
    }

    async searchVideos(keyword, page = 1) {
        try {
            // ?ac=videolist&wd={keyword}&pg={page}
            const target = `${this.baseUrl}?ac=videolist&wd=${encodeURIComponent(keyword)}&pg=${page}`;
            const finalUrl = this._getProxiedUrl(target);
            const response = await fetch(finalUrl);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('AppleCMS Search Error:', error);
            return { list: [], total: 0, pagecount: 0 };
        }
    }
}

/**
 * Maps AppleCMS Category to internal Group format
 */
export function mapCategoryToGroup(cmsCategory) {
    return {
        id: cmsCategory.type_id,
        name: cmsCategory.type_name,
        count: 0 // Dynamic counts are hard in MacCMS pagination
    };
}

/**
 * Maps AppleCMS Video to internal Channel format
 */
export function mapVideoToChannel(cmsVideo) {
    // AppleCMS returns vod_play_url usually as "Label$Url#Label$Url..."
    // specific logic depends on the site's separator. Standard is often $$$ or #
    const firstEp = (cmsVideo.vod_play_url || '').split('#')[0].split('$');
    const playUrl = firstEp.length > 1 ? firstEp[1] : firstEp[0];

    return {
        id: cmsVideo.vod_id,
        name: cmsVideo.vod_name,
        parentId: cmsVideo.type_id,
        groupName: cmsVideo.type_name,
        logo: cmsVideo.vod_pic,
        parser: 'MAC_CMS',
        playInfo: {
            url: playUrl, // Default to first available source
            description: cmsVideo.vod_blurb || cmsVideo.vod_remarks,
            fullData: cmsVideo // Store full data for detail view if needed
        }
    };
}
