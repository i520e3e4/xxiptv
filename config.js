export const DEFAULT_PLAYLIST_HINT = 'https://sub.ottiptv.cc/huyayqk.m3u';
export const DEFAULT_PLAYER_BASE = 'https://tesla-kit.com/player#/?url={url}&isLive=true';

// 503：服务维护/排队
export const ENABLE_503_PAGE = false;
export const PAGE_503_PATH = '503.html';

// 501：功能即将上线
export const ENABLE_501_PAGE = false;
export const PAGE_501_PATH = '501.html';

// AppleCMS 配置
export const USE_APPLE_CMS = true;
// 示例API，实际请替换为您自己的苹果CMS采集接口 (JSON格式)
export const APPLE_CMS_API_URL = 'https://api.tiankongapi.com/api.php/provide/vod/from/tkm3u8/at/json/';

// 您的 Cloudflare Worker 代理地址，例如 'https://vod-proxy.xxx.workers.dev/?url='
// 注意：如果在 worker 代码中逻辑是 /?url=...，这里的配置要保留 ?url= 结尾
// 智能判断：如果是本地开发，使用线上代理；如果是线上部署，使用相对路径
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const CORS_PROXY_URL = isLocal ? 'https://xxiptv.686423.xyz/proxy?url=' : '/proxy?url=';

export const LINE_OPTIONS = [
  { name: 'AppleCMS Source', url: APPLE_CMS_API_URL, type: 'apple_cms' }, // Special handling for this URL
  { name: 'huyayqk', url: 'https://sub.ottiptv.cc/huyayqk.m3u', type: 'm3u' },
  { name: 'Test: Big Buck Bunny', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', type: 'm3u' },
  { name: 'Test: CCTV-1 (May fail CORS)', url: 'https://tv.cctv.com/live/cctv1', type: 'm3u' },
  // { name: 'douyuyqk', url: 'https://sub.ottiptv.cc/douyuyqk.m3u' },
  // { name: 'yylunbo', url: 'https://sub.ottiptv.cc/yylunbo.m3u' },
  { name: 'bililive', url: 'https://sub.ottiptv.cc/bililive.m3u' }
];
