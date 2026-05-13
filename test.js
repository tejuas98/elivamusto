
const STORAGE_KEY = 'music_diary_v1';

function getYTId(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/shorts/')[1].split('?')[0];
      return u.searchParams.get('v');
    }
  } catch(e) {}
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function thumb(id) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function cleanTitle(title) {
  let cleaned = title;
  // Remove text in parentheses or brackets (e.g. (Official Video), [4K])
  cleaned = cleaned.replace(/[\(\[].*?[\)\]]/g, '');
  
  // Split by common separators to try to isolate the song name
  if (cleaned.includes('-')) {
    cleaned = cleaned.split('-').pop(); 
  } else if (cleaned.includes('|')) {
    cleaned = cleaned.split('|')[0];
  }
  
  // Remove "ft.", "feat.", "M/V" etc.
  cleaned = cleaned.split(/ft\.|feat\.|m\/v/i)[0];
  
  return cleaned.trim() || title;
}

function thumbFallback(img, id) {
  img.onerror = null;
  img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

async function fetchMeta(url) {
  const endpoints = [
    `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        if (data.title) return data;
      }
    } catch(e) {}
  }
  throw new Error('Could not fetch video info');
}

function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

  const STORAGE_KEYS = {
    music: 'music_diary_v1',
    movies: 'movies_diary_v1',
    anime: 'anime_diary_v1'
  };
  let activeCategory = 'music';

  function getVinylColor(id) {
    const str = id.toString();
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    
    const colors = ['#e8a030', '#e84040', '#3080e8', '#30e8a0', '#e830d0', '#f0ede6'];
    return colors[Math.abs(hash) % colors.length];
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS[activeCategory])) || []; }
    catch(e) { return []; }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEYS[activeCategory], JSON.stringify(items));
  }

  function renderAll(searchQuery = '') {
    const items = load();
    const gallery = document.getElementById('gallery');
    const badge = document.getElementById('countBadge');
    
    const actionText = activeCategory === 'music' ? 'listened' : 'watched';
    const typeLabel = activeCategory === 'anime' ? 'anime' : (activeCategory === 'movies' ? 'movies' : 'tracks');
    badge.textContent = `${items.length} ${typeLabel} ${actionText}`;
    gallery.innerHTML = '';

    const q = searchQuery.toLowerCase().trim();
    
    if (activeCategory === 'movies' || activeCategory === 'anime') {
      gallery.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🚧</div>
          <p>under construction.<br>this section is coming soon.</p>
        </div>`;
      return;
    }

    const filteredItems = items.filter(t => 
      !q || t.title.toLowerCase().includes(q) || t.channel.toLowerCase().includes(q)
    );

    if (filteredItems.length === 0) {
      gallery.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">♫</div>
          <p>${items.length === 0 ? `no ${typeLabel} yet.<br>add below to start your diary.` : 'no match found.'}</p>
        </div>`;
      return;
    }

    filteredItems.slice().reverse().forEach((t, i) => {
      const card = document.createElement('div');
      card.className = 'poster-slice';
      card.style.animationDelay = `${i * 0.04}s`;

      const thumbUrl = t.thumbnail || (t.videoId ? thumb(t.videoId) : '');
      const fallbackUrl = t.videoId ? `https://img.youtube.com/vi/${t.videoId}/hqdefault.jpg` : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDAiLz48L3N2Zz4=';

      card.innerHTML = `
        <img class="poster-img" id="img-${t.id}-${t.addedAt}" src="${thumbUrl}" alt="${t.title}" onerror="this.onerror=null; this.src='${fallbackUrl}'"/>
        
        <div class="vertical-title">${escHtml(cleanTitle(t.title))}</div>
      
      <div class="poster-info">
        <div class="info-left">
          <div class="poster-title">${escHtml(t.title)}</div>
          <div class="poster-meta">
            <span>${escHtml(t.channel)}</span>
            <span class="date">• ${fmtDate(t.addedAt)}</span>
          </div>
        </div>
      </div>

        <a class="poster-link" href="${t.url || '#'}" target="_blank" rel="noopener" title="Open Link">
        <div class="play-button">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </a>
      
      <button class="delete-btn" data-id="${t.id}" title="Remove">✕</button>
    `;

    const img = card.querySelector('img');
    if(img.complete) img.classList.add('loaded');
    else img.onload = () => img.classList.add('loaded');

      card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const items2 = load().filter(x => x.id !== t.id);
        save(items2);
        renderAll(document.getElementById('searchInput').value);
      });

    gallery.appendChild(card);
  });
}

function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3500);
}

async function fetchMeta(url) {
  const endpoints = [
    `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        if (data.title) return data;
      }
    } catch(e) {}
  }
  throw new Error('Could not fetch video info');
}

  async function addTrack() {
    const input = document.getElementById('urlInput');
    const query = input.value.trim();
    if (!query) return;

    const btn = document.getElementById('addBtn');
    const bar = document.getElementById('loadingBar');
    
    btn.disabled = true;
    bar.style.display = 'block';
    showError('');

    try {
      let newItem;

      if (activeCategory === 'music') {
        let videoId = '';
        try {
          const urlObj = new URL(query);
          if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
          } else if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.slice(1);
          }
        } catch(e) {}
        if (!videoId) throw new Error('Invalid YouTube URL');

        const data = await fetchMeta(query);
        newItem = {
          id: videoId,
          videoId: videoId,
          title: data.title,
          channel: data.author_name,
          url: query,
          thumbnail: data.thumbnail_url,
          addedAt: Date.now()
        };
      } else {
        throw new Error('This section is under construction.');
      }

      const items = load();
      if (items.some(x => x.id === newItem.id)) {
        throw new Error('Already added to your diary');
      }

      items.push(newItem);
      save(items);
      
      input.value = '';
      renderAll(document.getElementById('searchInput').value);
    } catch (e) {
      showError(e.message);
    } finally {
      btn.disabled = false;
      bar.style.display = 'none';
    }
  }

  document.getElementById('addBtn').addEventListener('click', addTrack);

  document.getElementById('urlInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTrack();
  });

  document.getElementById('urlInput').addEventListener('paste', () => {
    setTimeout(addTrack, 150);
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeCategory = e.currentTarget.dataset.category;
      
      const input = document.getElementById('urlInput');
      const addBtn = document.getElementById('addBtn');
      if (activeCategory === 'music') {
        input.placeholder = 'youtube link...';
        input.disabled = false;
        addBtn.disabled = false;
      } else {
        input.placeholder = 'under construction...';
        input.disabled = true;
        addBtn.disabled = true;
      }
      
      renderAll(document.getElementById('searchInput').value);
    });
  });

document.getElementById('searchInput').addEventListener('input', (e) => {
  renderAll(e.target.value);
});

// Parallax Engine
document.addEventListener('mousemove', (e) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  document.querySelectorAll('.layer-bg').forEach(el => {
    el.style.transform = `translate(${dx * -10}px, ${dy * -10}px) ${el.id === 'cloud2' ? 'scaleX(-1)' : ''}`;
  });
  document.querySelectorAll('.layer-mid').forEach(el => {
    el.style.transform = `translate(${dx * -30}px, ${dy * -30}px)`;
  });
  document.querySelectorAll('.layer-fg').forEach(el => {
    el.style.transform = `translate(${dx * -60}px, ${dy * -60}px) rotate(-5deg)`;
  });
});

document.getElementById('gallery').addEventListener('wheel', (e) => {
  if (e.deltaY !== 0 && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('gallery').scrollBy({
      left: e.deltaY * 2,
      behavior: 'auto'
    });
  }
});

renderAll();
