# XXIPTV Reverse Engineered Project

This project contains the reverse-engineered source code and resources from `https://xxiptv.com/`.

## Project Structure

- `index.html`: Entry point.
- `main.js`: Core application logic (module).
- `style.css`: Global styles.
- `config.js`: Configuration including API endpoints and playlist URLs.
- `m3u-parser.js`: Logic to parse M3U playlists.
- `components/`: Web Components (`app-shell`, `channel-card`, `iptv-sidebar`, etc.).
- `assets/`: Static assets.
- `api/`: Sample API responses (e.g., `playlist.m3u`).

## Technical Analysis

### Tech Stack
- **Frontend**: Vanilla JavaScript + Native Web Components (Custom Elements, Shadow DOM).
- **Styling**: CSS Variables, Flexbox/Grid.
- **State Management**: Simple reactive state in `main.js`.
- **Data Source**: Fetches M3U playlists from external sources (configured in `config.js`).

### Core Logic
1.  **Bootstrapping**: `index.html` loads `main.js`.
2.  **Initialization**: `main.js` -> `bootstrap()` waits for `app-shell` to be defined.
3.  **Data Fetching**: Fetches the default M3U playlist (e.g., from `https://sub.ottiptv.cc/...`).
4.  **Parsing**: Uses `m3u-parser.js` to parse the playlist into groups and channels.
5.  **Rendering**: Renders the sidebar (groups) and channel grid (channels).
6.  **Playback**: Clicking a channel opens a player URL (`https://tesla-kit.com/player...`) in a new tab.

## Running Locally

1.  Start a local HTTP server in this directory.
    - Python: `python -m http.server 8000`
    - Node: `npx http-server`
2.  Open `http://localhost:8000` in your browser.
3.  You may need to bypass CORS if the M3U source (`ottiptv.cc`) restricts localhost. If so, use a CORS proxy or disable browser security for testing.
