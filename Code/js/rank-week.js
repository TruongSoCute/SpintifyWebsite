document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById("weekly-chart-music-list");
    const audio = document.getElementById("audio-player");
    const cover = document.querySelector(".player-cover");
    const title = document.querySelector(".player-song-title");
    const artist = document.querySelector(".player-song-artist");
    const controls = document.querySelector(".player-controls");
    const btnPlay = document.getElementById("play-btn");
    const iconPlay = document.getElementById("play-icon");
    const dur = document.getElementById("duration");
    const cur = document.getElementById("current-time");
    const progressBar = document.getElementById("progress-bar");
    const progress = document.getElementById("progress");
    const volSlider = document.getElementById("volume-slider");
    const volBtn = document.querySelector(".volume-btn");
    let lastVolume = 1;

    fetch("../../datas/json/musics.json")
        .then(r => r.json())
        .then(arr => {
            let musicsLocal = localStorage.getItem('musics');
            if (musicsLocal) {
                arr = JSON.parse(musicsLocal);
            }
            arr.sort((a, b) => (b.weeklyPlays || 0) - (a.weeklyPlays || 0));
            list.innerHTML = `
                <div class="rank-table-header">
                    <div class="rank-col rank-col-num">#</div>
                    <div class="rank-col rank-col-cover"></div>
                    <div class="rank-col rank-col-title">Bài hát</div>
                    <div class="rank-col rank-col-artist">Nghệ sĩ</div>
                    <div class="rank-col rank-col-plays">Lượt nghe</div>
                </div>
            `;
            let currentIdx = -1;
            function playSong(idx) {
                const s = arr[idx];
                if (!s) return;
                audio.src = s.url;
                audio.play();
                if (cover) cover.src = s.cover;
                if (title) title.textContent = s.title;
                if (artist) artist.textContent = s.artist;
                if (controls) {
                    controls.classList.add("player-visible");
                    controls.classList.remove("player-hidden");
                }
                if (cur) cur.textContent = "0:00";
                if (iconPlay) iconPlay.textContent = "pause_circle";
                currentIdx = idx;
            }
            arr.forEach((s, i) => {
                const row = document.createElement("div");
                row.className = "rank-table-row";
                if (i === 0) row.classList.add("rank-1");
                if (i === 1) row.classList.add("rank-2");
                if (i === 2) row.classList.add("rank-3");
                row.innerHTML = `
                    <div class="rank-col rank-col-num">
                        <span class="rank-num">${i + 1}</span>
                    </div>
                    <div class="rank-col rank-col-cover">
                        <img src="${s.cover}" alt="cover" class="rank-cover-img">
                    </div>
                    <div class="rank-col rank-col-title">
                        <span class="rank-title">${s.title}</span>
                    </div>
                    <div class="rank-col rank-col-artist">
                        <span class="rank-artist">${s.artist}</span>
                    </div>
                    <div class="rank-col rank-col-plays">
                        <span class="rank-plays">${(s.weeklyPlays || 0).toLocaleString()}</span>
                    </div>
                `;
                row.style.cursor = "pointer";
                row.onclick = () => {
                    playSong(i);
                };
                list.appendChild(row);
            });

            const btnNext = document.getElementById("next-btn");
            const btnPrev = document.getElementById("prev-btn");
            if (btnNext) {
                btnNext.onclick = function () {
                    if (currentIdx < 0) return;
                    let nextIdx = (currentIdx + 1) % arr.length;
                    playSong(nextIdx);
                };
            }
            if (btnPrev) {
                btnPrev.onclick = function () {
                    if (currentIdx < 0) return;
                    let prevIdx = (currentIdx - 1 + arr.length) % arr.length;
                    playSong(prevIdx);
                };
            }

            if (volSlider && audio) {
                volSlider.addEventListener("input", function () {
                    audio.volume = this.value / 100;
                    if (audio.volume === 0 && volBtn) {
                        volBtn.querySelector(".material-symbols-outlined").textContent = "volume_off";
                    } else if (volBtn) {
                        volBtn.querySelector(".material-symbols-outlined").textContent = "volume_up";
                    }
                });
                audio.volume = volSlider.value / 100;
            }

            if (volBtn && audio && volSlider) {
                volBtn.addEventListener("click", function () {
                    if (audio.volume > 0) {
                        lastVolume = audio.volume;
                        audio.volume = 0;
                        volSlider.value = 0;
                        volBtn.querySelector(".material-symbols-outlined").textContent = "volume_off";
                    } else {
                        audio.volume = lastVolume || 1;
                        volSlider.value = audio.volume * 100;
                        volBtn.querySelector(".material-symbols-outlined").textContent = "volume_up";
                    }
                });
            }

            if (audio && iconPlay) {
                audio.addEventListener("play", () => { iconPlay.textContent = "pause_circle"; });
                audio.addEventListener("pause", () => { iconPlay.textContent = "play_circle"; });
            }
            if (audio && dur) {
                audio.addEventListener("loadedmetadata", () => {
                    const d = audio.duration;
                    dur.textContent = !isNaN(d) ? `${Math.floor(d/60)}:${Math.floor(d%60).toString().padStart(2,"0")}` : "--:--";
                });
            }
            if (audio && cur) {
                audio.addEventListener("timeupdate", () => {
                    const t = audio.currentTime;
                    cur.textContent = `${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,"0")}`;
                    if (progress && audio.duration) {
                        progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
                    }
                });
            }
            if (progressBar && audio) {
                progressBar.addEventListener("click", function (e) {
                    const rect = progressBar.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percent = x / rect.width;
                    if (!isNaN(audio.duration)) {
                        audio.currentTime = percent * audio.duration;
                    }
                });
            }

            if (btnPlay && audio) {
                btnPlay.onclick = () => {
                    audio.paused ? audio.play() : audio.pause();
                };
            }
        })
        .catch(() => {
            list.innerHTML = "<div class='loading-indicator'>Không thể tải dữ liệu BXH tuần.</div>";
        });
});