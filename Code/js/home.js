let songs = [];
let currSong = null;
let audio = null;
let isPlaying = false;
let isLoaded = false;
let pendingPlay = null;

const el = {
    playBtns: null,
    progressBar: document.querySelector('.progress-bar'),
    progress: document.querySelector('.progress'),
    playBtn: document.querySelector('.player-btn[title="Play/Pause"]'),
    playIcon: null,
    timeElapsed: document.querySelector('.player-time:first-of-type'),
    timeRemaining: document.querySelector('.player-time:last-of-type'),
    songTitle: document.querySelector('.player-song-title'),
    songArtist: document.querySelector('.player-song-artist'),
    cover: document.querySelector('.player-cover'),
    trendList: document.getElementById('trending-playlist'),
    suggestList: document.getElementById('suggested-playlist'),
    volSlider: document.querySelector('.volume-slider'),
    volBtn: document.querySelector('.volume-btn'),
    search: document.getElementById('search-input')
};

const icons = {
    play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"/></svg>',
    pause: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z"/></svg>'
};

function loadMusicData() {
    return fetch('../../datas/json/musics.json')
        .then(res => {
            if (!res.ok) throw new Error(res.status);
            return res.json();
        })
        .then(data => {
            songs = Array.isArray(data) ? data : [];
            isLoaded = true;
            renderMusicLists();
            return data;
        })
        .catch(error => {
            console.error(error);
            isLoaded = false;
            showLoadingError();
            return [];
        });
}

function showLoadingError() {
    const errMsg = `
        <div class="error-message">
            <p>Không thể tải danh sách nhạc. Vui lòng thử lại sau.</p>
            <button class="retry-button">Thử lại</button>
        </div>
    `;
    if (el.trendList) {
        el.trendList.innerHTML = errMsg;
    }
    if (el.suggestList) {
        el.suggestList.innerHTML = errMsg;
    }
    document.querySelectorAll('.retry-button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (el.trendList) {
                el.trendList.innerHTML = '<div class="loading-indicator">Đang tải danh sách nhạc...</div>';
            }
            if (el.suggestList) {
                el.suggestList.innerHTML = '<div class="loading-indicator">Đang tải danh sách nhạc...</div>';
            }
            loadMusicData();
        });
    });
}

function renderMusicLists() {
    if (!isLoaded || !songs.length) return;
    const trending = songs.filter(m => m.trending === true).slice(0, 6);
    const suggested = songs.filter(m => m.trending !== true).slice(0, 6);
    if (el.trendList) {
        el.trendList.innerHTML = '';
        renderMusicItems(trending, el.trendList);
    }
    if (el.suggestList) {
        el.suggestList.innerHTML = '';
        renderMusicItems(suggested, el.suggestList);
    }
    el.playBtns = Array.from(document.getElementsByClassName('play-music-button'));
    attachPlayButtonListeners();
}

function renderMusicItems(musicList, container) {
    if (!container) return;
    if (!musicList.length) {
        container.innerHTML = '<div class="empty-message">Không có bài hát nào.</div>';
        return;
    }
    musicList.forEach(music => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.innerHTML = `
            <div class="song-image-wrapper">
                <img src="${music.cover}" alt="${music.title}" class="song-display">
                <img src="../../datas/images/assets/Vinyl-record.png" alt="vinyl record" class="sub-image-display">
                <button class="play-music-button" id="${music.id}">
                    ${icons.play}
                </button>
            </div>
            <div class="playlist-info">
                <p class="subtitle">${music.title}</p>
                <p class="paragraph half-trans">${music.artist}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

function attachPlayButtonListeners() {
    if (!el.playBtns) return;
    el.playBtns.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.addEventListener('click', async function (e) {
            e.stopPropagation();
            const songId = Number(this.id);
            if (currSong && currSong.id === songId) {
                await togglePlayPause();
            } else {
                await playSong(songId);
            }
        });
    });
    el.playBtns = Array.from(document.getElementsByClassName('play-music-button'));
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function updateProgress() {
    if (!audio) return;
    const currentTime = audio.currentTime;
    const duration = audio.duration || 0;
    const percent = (currentTime / duration) * 100;
    if (el.progress) {
        el.progress.style.width = `${percent}%`;
        const handle = document.querySelector('.progress-handle');
        if (handle) handle.style.left = `${percent}%`;
    }
    if (el.timeElapsed) el.timeElapsed.textContent = formatTime(currentTime);
}

function handleSongEnd() {
    isPlaying = false;
    updatePlayPauseButtons();
}

function updatePlayerInfo(song) {
    if (!song) return;
    if (el.songTitle) el.songTitle.textContent = song.title || '';
    if (el.songArtist) el.songArtist.textContent = song.artist || '';
    if (el.cover && song.cover) el.cover.src = song.cover;
    if (el.progress) el.progress.style.width = '0%';
    if (el.timeElapsed) el.timeElapsed.textContent = '0:00';
    if (el.timeRemaining) el.timeRemaining.textContent = '0:00';
}

function updatePlayPauseButtons() {
    if (el.playIcon) el.playIcon.textContent = isPlaying ? 'pause_circle' : 'play_circle';
    if (el.playBtns) {
        el.playBtns.forEach(btn => {
            const btnId = Number(btn.id);
            if (currSong && btnId === currSong.id) {
                btn.innerHTML = isPlaying ? icons.pause : icons.play;
            } else {
                btn.innerHTML = icons.play;
            }
        });
    }
}

function togglePlayerVisibility(show) {
    const playerControls = document.querySelector('.player-controls');
    if (!playerControls) return;
    if (show) {
        playerControls.classList.add('player-visible');
        playerControls.classList.remove('player-hidden');
    } else {
        playerControls.classList.add('player-hidden');
        playerControls.classList.remove('player-visible');
    }
}

function updateVolumeIcon(vol) {
    if (!el.volBtn) return;
    const volIcon = el.volBtn.querySelector('.material-symbols-outlined');
    if (!volIcon) return;
    if (vol === 0) {
        volIcon.textContent = 'volume_off';
    } else if (vol < 0.5) {
        volIcon.textContent = 'volume_down';
    } else {
        volIcon.textContent = 'volume_up';
    }
}

function setVolume(vol) {
    if (!audio) return;
    const volume = Math.max(0, Math.min(1, vol));
    audio.volume = volume;
    localStorage.setItem('spinify-volume', volume);
    updateVolumeIcon(volume);
    if (el.volSlider && el.volSlider.value !== Math.round(volume * 100)) {
        el.volSlider.value = Math.round(volume * 100);
    }
}

function toggleMute() {
    if (!audio) return;
    if (audio.volume > 0) {
        localStorage.setItem('spinify-previous-volume', audio.volume);
        setVolume(0);
    } else {

        const previousVolume = parseFloat(localStorage.getItem('spinify-previous-volume') || 0.7);
        setVolume(previousVolume);
    }
}

function setupAudio(url) {
    return new Promise((resolve, reject) => {
        if (audio) {
            audio.pause();
            audio.src = '';
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleSongEnd);
            audio.removeEventListener('canplay', updateDuration);
            audio.removeEventListener('error', handleAudioError);
        }
        audio = new Audio();
        const savedVolume = parseFloat(localStorage.getItem('spinify-volume') || 0.7);
        audio.volume = savedVolume;
        updateVolumeIcon(savedVolume);
        if (el.volSlider) {
            el.volSlider.value = Math.round(savedVolume * 100);

            const volumeTooltip = document.querySelector('.volume-tooltip');
            if (volumeTooltip) {
                volumeTooltip.textContent = `${Math.round(savedVolume * 100)}%`;
            }
        }
        function updateDuration() {
            if (el.timeRemaining && audio.duration) {
                el.timeRemaining.textContent = formatTime(audio.duration);
            }
        }
        function handleAudioError(e) {
            console.error(e);
            isPlaying = false;
            updatePlayPauseButtons();
            reject(e);
        }
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleSongEnd);
        audio.addEventListener('canplay', updateDuration);
        audio.addEventListener('error', handleAudioError);
        audio.src = url;
        audio.preload = 'auto';
        audio.addEventListener('canplaythrough', () => {
            resolve(audio);
        }, {
            once: true
        });
        setTimeout(() => {
            if (audio.readyState < 3) {
                resolve(audio);
            }
        }, 3000);
    });
}

async function playSong(songId) {
    if (!isLoaded || !songs.length) {
        try {
            await loadMusicData();
            if (isLoaded) playSong(songId);
        } catch (error) {
            console.error(error);
        }
        return;
    }
    const song = songs.find(m => m.id === Number(songId));
    if (!song) {
        console.error(songId);
        return;
    }
    if (currSong && currSong.id === song.id && isPlaying) {
        await togglePlayPause();
        return;
    }
    if (pendingPlay) {
        pendingPlay.cancelled = true;
    }
    const currReq = {
        cancelled: false
    };
    pendingPlay = currReq;

    try {
        currSong = song;
        updatePlayerInfo(song);
        togglePlayerVisibility(true);
        await setupAudio(song.url);
        if (currReq.cancelled) {
            return;
        }
        try {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                await playPromise;
                isPlaying = true;
                updatePlayPauseButtons();
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                //chịu
            } else {
                console.error(error);
                isPlaying = false;
                updatePlayPauseButtons();
            }
        }
    } catch (error) {
        console.error(error);
        isPlaying = false;
        updatePlayPauseButtons();
    } finally {
        if (pendingPlay === currReq) {
            pendingPlay = null;
        }
    }
}

async function togglePlayPause() {
    if (!audio || !audio.src) {
        if (currSong) playSong(currSong.id);
        return;
    }
    try {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            updatePlayPauseButtons();
        } else {
            if (pendingPlay) {
                pendingPlay.cancelled = true;
                pendingPlay = null;
            }
            try {
                await audio.play();
                isPlaying = true;
                updatePlayPauseButtons();
            } catch (error) {
                console.error(error);
                isPlaying = false;
                updatePlayPauseButtons();
            }
        }
    } catch (error) {
        console.error(error);
        isPlaying = false;
        updatePlayPauseButtons();
    }
}

function setupEventListeners() {
    el.playBtns = Array.from(document.getElementsByClassName('play-music-button'));
    el.playIcon = el.playBtn?.querySelector('.material-symbols-outlined');
    attachPlayButtonListeners();
    if (el.progressBar) {
        if (!document.querySelector('.progress-handle')) {
            const handle = document.createElement('div');
            handle.className = 'progress-handle';
            el.progressBar.appendChild(handle);
            const style = document.createElement('style');
            style.textContent = `
                .progress-bar {
                    position: relative;
                }
                .progress-handle {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background-color: #ffffff;
                    border-radius: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10;
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                    left: 0%;
                    transition: left 0.1s ease-out;
                }
                .progress-bar:hover .progress-handle {
                    width: 16px;
                    height: 16px;
                }
            `;
            document.head.appendChild(style);
        }
        
        el.progressBar.addEventListener('click', function (e) {
            if (!audio || !audio.duration) return;
            const rect = this.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percent = (clickX / this.clientWidth) * 100;
            if (el.progress) el.progress.style.width = `${percent}%`;
            const handle = document.querySelector('.progress-handle');
            if (handle) {
                handle.style.left = `${percent}%`;
            }
            const newTime = (percent / 100) * audio.duration;
            audio.currentTime = newTime;
            if (el.timeElapsed) {
                el.timeElapsed.textContent = formatTime(newTime);
            }
        });
        const handle = document.querySelector('.progress-handle');
        if (handle) {
            let isDragging = false;
            
            handle.addEventListener('mousedown', (e) => {
                isDragging = true;
                e.stopPropagation();
                document.addEventListener('mousemove', handleDrag);
                document.addEventListener('mouseup', stopDrag);
            });
            
            function handleDrag(e) {
                if (!isDragging || !audio || !audio.duration) return;
                const rect = el.progressBar.getBoundingClientRect();
                const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const percent = (clickX / rect.width) * 100;
                
                if (el.progress) el.progress.style.width = `${percent}%`;
                handle.style.left = `${percent}%`;
                
                const newTime = (percent / 100) * audio.duration;
                audio.currentTime = newTime;
                if (el.timeElapsed) {
                    el.timeElapsed.textContent = formatTime(newTime);
                }
            }
            function stopDrag() {
                isDragging = false;
                document.removeEventListener('mousemove', handleDrag);
                document.removeEventListener('mouseup', stopDrag);
            }
        }
    }
    if (el.playBtn) {
        el.playBtn.addEventListener('click', togglePlayPause);
    }
    const prevButton = document.querySelector('.player-btn[title="Previous"]');
    const nextButton = document.querySelector('.player-btn[title="Next"]');
    if (prevButton) {
        prevButton.addEventListener('click', playPreviousSong);
    }
    if (nextButton) {
        nextButton.addEventListener('click', playNextSong);
    }
    const bannerPlayButton = document.querySelector('.play-music-banner');
    if (bannerPlayButton) {
        bannerPlayButton.addEventListener('click', function () {
            const featuredSong = songs.find(m => m.featured === true) || songs[0];
            if (featuredSong) {
                bannerPlayButton.innerHTML = isPlaying ? icons.play : icons.pause;
                playSong(featuredSong.id);
            }
        });
    }
    if (el.volSlider) {
        el.volSlider.addEventListener('input', function () {
            setVolume(this.value / 100);
            const thumbPos = (this.value / 100) * this.clientHeight;
            const tooltip = document.querySelector('.volume-tooltip');
            if (tooltip) {
                tooltip.style.bottom = `${thumbPos}px`;
                tooltip.textContent = `${this.value}%`;
            }
        });
    }
    if (el.volBtn) {
        el.volBtn.addEventListener('click', toggleMute);
    }
}

async function playPreviousSong() {
    if (!isLoaded || !songs.length || !currSong) return;
    const currIdx = songs.findIndex(song => song.id === currSong.id);
    const newIdx = currIdx > 0 ? currIdx - 1 : songs.length - 1;
    await playSong(songs[newIdx].id);
}

async function playNextSong() {
    if (!isLoaded || !songs.length || !currSong) return;
    const currIdx = songs.findIndex(song => song.id === currSong.id);
    const newIdx = currIdx < songs.length - 1 ? currIdx + 1 : 0;
    await playSong(songs[newIdx].id);
}

document.addEventListener('DOMContentLoaded', function () {
    togglePlayerVisibility(false);
    const savedVol = parseFloat(localStorage.getItem('spinify-volume') || 0.7);
    if (el.volSlider) {
        el.volSlider.value = Math.round(savedVol * 100);
    }
    updateVolumeIcon(savedVol);
    loadMusicData().then(() => {
        setupEventListeners();
    });
});