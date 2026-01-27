export function parseM3U(rawText) {
    if (!rawText) {
        return { channels: [], groups: [] };
    }

    const lines = rawText.replace(/\r\n?/g, '\n').split('\n');
    const channels = [];
    const categoriesMap = new Map();
    const channelsMap = new Map();
    let currentInfo = null;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#EXTM3U')) continue;

        if (line.startsWith('#EXTINF')) {
            const attributes = parseAttributes(line);
            const nameIndex = line.lastIndexOf(',');
            const name = nameIndex !== -1 ? line.substring(nameIndex + 1).trim() : '未命名频道';
            const groupName = attributes['group-title'] || '其他频道';
            const logo = attributes['tvg-logo'] || '';
            const categoryId = groupName;
            const channelId = attributes['svg-id'] || name;

            if (shouldSkipChannel(name, groupName, attributes)) {
                currentInfo = null;
                continue;
            }

            currentInfo = {
                id: channelId,
                name,
                cover: logo,
                groupName,
                categoryId,
                attributes,
                rawLine: line
            };

            if (!categoriesMap.has(categoryId)) {
                categoriesMap.set(categoryId, { id: categoryId, name: groupName });
                channelsMap.set(categoryId, []);
            }
        } else if (!line.startsWith('#') && currentInfo) {
            const url = line;
            const list = channelsMap.get(currentInfo.categoryId) || [];
            const exists = list.some(ch => ch.name === currentInfo?.name);

            if (!exists) {
                const channel = {
                    id: currentInfo.id,
                    name: currentInfo.name,
                    parentId: currentInfo.categoryId,
                    groupName: currentInfo.groupName,
                    logo: currentInfo.cover,
                    parser: 'MIGU_VIDEO',
                    parserId: extractMiguIdFromUrl(url),
                    playInfo: {
                        url,
                        attributes: currentInfo.attributes,
                        raw: currentInfo.rawLine
                    }
                };

                list.push(channel);
                channels.push(channel);
                channelsMap.set(currentInfo.categoryId, list);
            }

            currentInfo = null;
        }
    }

    const groups = Array.from(categoriesMap.values()).map(category => ({
        id: category.id,
        name: category.name,
        count: channelsMap.get(category.id)?.length ?? 0
    }));

    return { channels, groups };
}

function parseAttributes(line) {
    const attributes = {};
    const regex = /([\w-]+)="([^"]*)"/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        attributes[match[1]] = match[2];
    }
    return attributes;
}

function extractMiguIdFromUrl(url) {
    if (!url) return '';
    const normalized = url.replace(/\\/g, '/').replace(/\/+$/, '');
    const parts = normalized.split('/');
    return parts[parts.length - 1] || '';
}

function shouldSkipChannel(name, groupName, attributes) {
    const normalizedGroup = (groupName || '').trim();
    if (normalizedGroup === '列表更新时间') return true;

    const tvgName = (attributes['tvg-name'] || name || '').trim();
    const looksLikeTimestamp = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(tvgName);
    const groupHintsUpdate = normalizedGroup.includes('更新时间');

    return groupHintsUpdate && looksLikeTimestamp;
}
