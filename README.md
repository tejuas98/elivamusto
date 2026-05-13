# Turiqs

Turiqs is a sleek, single-page "media diary" built directly into the browser. It allows users to track the music they listen to, the movies they watch, and the anime they follow, all inside a visually striking, retro manga/pop-art accordion gallery.

## 🎨 Aesthetic & Design
The core philosophy of Turiqs is a high-contrast, "Pop-Art" / Retro Manga aesthetic.
- **Color Palette:** A paper-white/cream background with heavy, absolute black (#000) borders and offset box-shadows.
- **Typography:** Uses *Dela Gothic One* for aggressive, chunky headers and *DM Mono/Syne* for clean data presentation.
- **Layout:** The gallery operates entirely on pure CSS `flexbox`. The items sit as narrow vertical slices (spines) and dynamically expand horizontally into full 16:9 posters using fluid CSS `hover` transitions (`flex-grow`).
- **Visual Contrast:** The user interface remains strictly monochrome, but the media posters inject highly saturated, vibrant colors (`filter: contrast(110%) saturate(120%)`) into the center of the screen, mimicking the color pages of a manga volume.

## ⚙️ Tech Stack
Turiqs is intentionally built to be zero-dependency, serverless, and brutally lightweight.
- **Frontend:** Pure HTML5, Vanilla JavaScript (ES6), and Vanilla CSS3.
- **Persistence:** Local browser storage (`localStorage`). No external databases or backend logic required. Data stays on the user's machine.
- **APIs:** Client-side integration with three public, zero-authentication APIs.

## 🔄 Workflow & Architecture

The application is split into three core categories: `MUSIC`, `MOVIES`, and `ANIME`. The logic switches dynamically depending on which tab the user has selected.

### 1. Music (YouTube oEmbed API)
- **Input:** The user pastes a direct YouTube URL.
- **Flow:** The app extracts the video ID and calls the `noembed` or `youtube.com/oembed` public endpoint. 
- **Data Captured:** Video Title, Channel Name, and official thumbnail.
- **Playback Link:** The user can click the "Play" button on the card to open the YouTube video in a new tab.

### 2. Movies (Apple iTunes Search API)
- **Input:** The user types a raw text query (e.g., "Interstellar").
- **Flow:** The app hits the `https://itunes.apple.com/search?entity=movie` endpoint.
- **Data Captured:** It grabs the highest matching result, parses the director name, and dynamically upscales the `artworkUrl100` string to fetch the ultra-high-resolution 1000x1000 official movie poster.

### 3. Anime (Jikan / MyAnimeList API)
- **Input:** The user types a raw text query (e.g., "Naruto").
- **Flow:** The app queries `https://api.jikan.moe/v4/anime`.
- **Data Captured:** It extracts the official English title, the animation studio, and the highest resolution JPG promotional artwork.

### Data Storage & Rendering
When an item is successfully fetched, it is stored as a JSON object inside `localStorage` under a category-specific key (`music_diary_v1`, `movies_diary_v1`, `anime_diary_v1`). 
The `renderAll()` function loops through the selected category's array, dynamically injects the DOM elements for the gallery slices, handles broken image fallbacks (`onerror`), and manages the search/filter state in real-time.

## 🚀 Running Locally
Because Turiqs relies entirely on client-side JS and public APIs with no build steps, you simply need to open `ok.html` in any modern web browser to run the application.
