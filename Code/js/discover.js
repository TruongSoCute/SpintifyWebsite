let ms = [];
let idx = -1;

function getLibrary() {
    try {
        return JSON.parse(localStorage.getItem('library') || '[]');
    } catch {
        return [];
    }
}
function setLibrary(arr) {
    localStorage.setItem('library', JSON.stringify(arr));
}
function inLibrary(id) {
    return getLibrary().includes(id);
}

document.addEventListener('DOMContentLoaded', () => {
    const isLibraryPage = window.location.pathname.includes('library.html');

    fetch('../../datas/json/musics.json')
        .then(r => r.json())
        .then(m => {
            ms = m;
            if (isLibraryPage) {
                let lib = getLibrary();
                show('top-music-list', m.filter(x => lib.includes(x.id)));
                document.getElementById('album-music-list')?.parentElement?.remove();
                document.getElementById('artist-music-list')?.parentElement?.remove();
                document.querySelectorAll('.show-all-btn').forEach(btn => btn.style.display = 'none');
            } else {
                show('top-music-list', m.filter(x => x.trending).slice(0, 5));
                show('album-music-list', m.filter(x => x.featured || x.id <= 8).slice(0, 5));
                let art = {};
                m.forEach(x => { if (!art[x.artist]) art[x.artist] = x; });
                show('artist-music-list', Object.values(art).slice(0, 5));
            }
        })
        .catch(() => {
            ['top-music-list', 'album-music-list', 'artist-music-list'].forEach(i => {
                document.getElementById(i).innerHTML = '<div style="color:#fff;">Không thể tải danh sách nhạc.</div>';
            });
        });

    function show(id, arr) {
        let l = document.getElementById(id);
        if (!l) return;
        l.innerHTML = '';
        arr.forEach(m => {
            let c = document.createElement('div');
            c.className = 'music-card';
            c.innerHTML = `
                <img src="${m.cover}" alt="${m.title}">
                <div class="music-title">${m.title}</div>
                <div class="music-artist">${m.artist}</div>
                <button class="library-btn" style="margin-top:8px; background:none; border:none; cursor:pointer; position:absolute; right:8px; bottom:8px;">
                    <span class="material-symbols-outlined" style="font-size:28px; color:${inLibrary(m.id) ? '#e74c3c' : '#b3b3b3'};">
                        ${inLibrary(m.id) ? 'favorite' : 'favorite_border'}
                    </span>
                </button>
            `;
            c.style.position = 'relative';
            c.onclick = e => {
                if (e.target.closest('.library-btn')) return;
                play(m);
            };
            c.querySelector('.library-btn').onclick = ev => {
                ev.stopPropagation();
                let lib = getLibrary();
                let icon = ev.currentTarget.querySelector('.material-symbols-outlined');
                if (inLibrary(m.id)) {
                    setLibrary(lib.filter(x => x !== m.id));
                    icon.textContent = 'favorite_border';
                    icon.style.color = '#b3b3b3';
                    if (window.location.pathname.includes('library.html')) c.remove();
                } else {
                    lib.push(m.id);
                    setLibrary(lib);
                    icon.textContent = 'favorite';
                    icon.style.color = '#e74c3c';
                }
            };
            l.appendChild(c);
        });
    }

    document.querySelectorAll('.show-all-btn').forEach(b => {
        b.onclick = () => {
            fetch('../../datas/json/musics.json')
                .then(r => r.json())
                .then(m => {
                    let f = [];
                    if (b.dataset.section === 'top') f = m.filter(x => x.trending);
                    else if (b.dataset.section === 'album') f = m.filter(x => x.featured || x.id <= 8);
                    else if (b.dataset.section === 'artist') {
                        let art = {};
                        m.forEach(x => { if (!art[x.artist]) art[x.artist] = x; });
                        f = Object.values(art);
                    }
                    show(b.dataset.section + '-music-list', f);
                    b.style.display = 'none';
                });
        };
    });

    let audio = document.getElementById('audio-player');
    let cover = document.querySelector('.player-cover');
    let title = document.querySelector('.player-song-title');
    let artist = document.querySelector('.player-song-artist');
    let playBtn = document.getElementById('play-btn');
    let playIcon = document.getElementById('play-icon');
    let prevBtn = document.getElementById('prev-btn');
    let nextBtn = document.getElementById('next-btn');
    let bar = document.getElementById('progress-bar');
    let prog = document.getElementById('progress');
    let cur = document.getElementById('current-time');
    let dur = document.getElementById('duration');
    let vol = document.getElementById('volume-slider');

    function play(m) {
        audio.src = m.url;
        audio.play();
        cover.src = m.cover;
        title.textContent = m.title;
        artist.textContent = m.artist;
        cover.classList.add('vinyl-spin');
        playIcon.textContent = 'pause_circle';
        idx = ms.findIndex(x => x.id === m.id);
    }

    playBtn.onclick = () => {
        if (!audio.src) return;
        if (audio.paused) {
            audio.play();
            playIcon.textContent = 'pause_circle';
            cover.classList.add('vinyl-spin');
        } else {
            audio.pause();
            playIcon.textContent = 'play_circle';
            cover.classList.remove('vinyl-spin');
        }
    };

    audio.addEventListener('play', () => {
        playIcon.textContent = 'pause_circle';
        cover.classList.add('vinyl-spin');
    });
    audio.addEventListener('pause', () => {
        playIcon.textContent = 'play_circle';
        cover.classList.remove('vinyl-spin');
    });

    nextBtn.onclick = () => {
        if (idx === -1 || ms.length === 0) return;
        let n = (idx + 1) % ms.length;
        play(ms[n]);
    };
    prevBtn.onclick = () => {
        if (idx === -1 || ms.length === 0) return;
        let p = (idx - 1 + ms.length) % ms.length;
        play(ms[p]);
    };

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        let per = (audio.currentTime / audio.duration) * 100;
        prog.style.width = per + '%';
        cur.textContent = t(audio.currentTime);
        dur.textContent = t(audio.duration);
    });
    bar.onclick = e => {
        if (!audio.duration) return;
        let r = bar.getBoundingClientRect();
        let per = (e.clientX - r.left) / r.width;
        audio.currentTime = per * audio.duration;
    };

    vol.oninput = () => {
        audio.volume = vol.value / 100;
        if (audio.volume === 0 && volumeBtn) {
            volumeBtn.querySelector(".material-symbols-outlined").textContent = "volume_off";
        } else if (volumeBtn) {
            volumeBtn.querySelector(".material-symbols-outlined").textContent = "volume_up";
        }
    };

    const volumeBtn = document.querySelector(".volume-btn");
    let lastVolume = 1;
    if (volumeBtn && audio && vol) {
        volumeBtn.addEventListener("click", function () {
            if (audio.volume > 0) {
                lastVolume = audio.volume;
                audio.volume = 0;
                vol.value = 0;
                volumeBtn.querySelector(".material-symbols-outlined").textContent = "volume_off";
            } else {
                audio.volume = lastVolume || 1;
                vol.value = audio.volume * 100;
                volumeBtn.querySelector(".material-symbols-outlined").textContent = "volume_up";
            }
        });
    }

    function t(s) {
        s = Math.floor(s);
        return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    function setActive() {
        let items = document.querySelectorAll('.sidebar-item');
        items.forEach(i => i.classList.remove('active'));
        let p = window.location.pathname;
        let h = window.location.hash;
        if (p.includes('library.html')) {
            document.querySelector('[data-sidebar="library"]')?.classList.add('active');
        } else if (p.includes('discover.html')) {
            if (h === '#top-week') {
                document.querySelector('[data-sidebar="top-week"]')?.classList.add('active');
            } else if (h === '#top-100') {
                document.querySelector('[data-sidebar="top-100"]')?.classList.add('active');
            } else {
                document.querySelector('[data-sidebar="discover"]')?.classList.add('active');
            }
        } else if (p.includes('playlist.html')) {
            document.querySelector('[data-sidebar="playlist"]')?.classList.add('active');
        }
    }
    setActive();
    window.addEventListener('hashchange', setActive);
});
