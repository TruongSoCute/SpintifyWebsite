let musics = [];
let uploads = [];
let users = [
    { id: 1, name: "Ngo Quang Truong", email: "truongngo@spintify.com", role: "Quản trị" },
    { id: 2, name: "Pham Van Dien", email: "dienpham@spintify.com", role: "Quản trị" }
];
let delId = null;

const $ = id => document.getElementById(id);
const musicList = $('musicList');
const userList = $('userList');
const uploadList = $('uploadList');
const modal = $('musicModal');
const closeModal = $('closeModal');
const addMusicBtn = $('addMusicBtn');
const musicForm = $('musicForm');
const modalTitle = $('modalTitle');
const btnMusic = $('btnMusic');
const btnUser = $('btnUser');
const btnUpload = $('btnUpload');
const btnConfig = $('btnConfig');
const adTitle = $('adTitle');
const adDesc = $('adDesc');
const adBtns = $('adBtns');
const uploadBtn = $('uploadBtn');
const uploadModal = $('uploadModal');
const closeUpload = $('closeUpload');
const uploadForm = $('uploadForm');
const delModal = $('delModal');
const closeDel = $('closeDel');
const confirmDelBtn = $('confirmDelBtn');
const configPanel = $('configPanel');
const configForm = $('configForm');
const isPremium = $('isPremium');
const musicQuality = $('musicQuality');
const defaultRole = $('defaultRole');

const show = (el) => el.style.display = 'flex';
const hide = (el) => el.style.display = 'none';

btnMusic.onclick = () => {
    adTitle.textContent = "Quản lý nhạc";
    adDesc.textContent = "Chỉnh sửa, đăng tải, thêm, xoá nhạc cho hệ thống Spinify.";
    musicList.style.display = "";
    userList.style.display = "none";
    uploadList.style.display = "none";
    addMusicBtn.style.display = "";
    uploadBtn.style.display = "none";
    setActive(btnMusic);
};
btnUser.onclick = () => {
    adTitle.textContent = "Quản lý thành viên";
    adDesc.textContent = "Xem danh sách thành viên hệ thống.";
    musicList.style.display = "none";
    userList.style.display = "";
    uploadList.style.display = "none";
    addMusicBtn.style.display = "none";
    uploadBtn.style.display = "none";
    setActive(btnUser);
    renderUserList();
};
btnUpload.onclick = () => {
    adTitle.textContent = "Quản lý upload";
    adDesc.textContent = "Danh sách các file nhạc đã upload.";
    musicList.style.display = "none";
    userList.style.display = "none";
    uploadList.style.display = "";
    addMusicBtn.style.display = "none";
    uploadBtn.style.display = "";
    setActive(btnUpload);
    renderUploadList();
};

btnConfig.onclick = () => {
    adTitle.textContent = "Cấu hình hệ thống";
    adDesc.textContent = "Cấu hình các tuỳ chọn hệ thống như Premium, Free, chất lượng nhạc.";
    musicList.style.display = "none";
    userList.style.display = "none";
    uploadList.style.display = "none";
    addMusicBtn.style.display = "none";
    uploadBtn.style.display = "none";
    setActive(btnConfig);
}

function setActive(btn) {
    [btnMusic, btnUser, btnUpload, btnConfig].forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

function saveMusicsToLocal() {
    localStorage.setItem('musics', JSON.stringify(musics));
}

function renderTable(list, columns, rowFn) {
    let html = `<table><tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr>`;
    html += list.map(rowFn).join('');
    html += `</table>`;
    return html;
}

function renderMusicList() {
    musicList.className = "adtable";
    musicList.innerHTML = renderTable(
        musics,
        ["ID", "Tiêu đề", "Nghệ sĩ", "Năm phát hành", "Thao tác"],
        m => `<tr>
            <td>${m.id}</td>
            <td>${m.title}</td>
            <td>${m.artist}</td>
            <td>${m.releaseDate}</td>
            <td>
                <button onclick="editMusic(${m.id})">Sửa</button>
                <button onclick="showDel(${m.id})">Xoá</button>
            </td>
        </tr>`
    );
}

function renderUserList() {
    userList.className = "adtable";
    userList.innerHTML = renderTable(
        users,
        ["ID", "Tên", "Email", "Vai trò"],
        u => `<tr>
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
        </tr>`
    );
}

function renderUploadList() {
    uploadList.className = "adtable";
    uploadList.innerHTML = renderTable(
        uploads,
        ["ID", "Người upload", "Đường dẫn", "Thời gian"],
        u => `<tr>
            <td>${u.id}</td>
            <td>${u.uploadBy}</td>
            <td>${u.path || ''}</td>
            <td>${u.uploadAt}</td>
        </tr>`
    );
}

function openModal(edit = false, music = null) {
    show(modal);
    modalTitle.textContent = edit ? 'Sửa Nhạc' : 'Thêm Nhạc';
    if (edit && music) {
        Object.keys(musicForm).forEach(k => {
            if (music[k] !== undefined && musicForm[k]) musicForm[k].value = music[k];
        });
    } else {
        musicForm.reset();
        musicForm.musicId.value = '';
    }
}
closeModal.onclick = () => hide(modal);
addMusicBtn.onclick = () => openModal(false);

window.editMusic = function(id) {
    const music = musics.find(m => m.id === id);
    openModal(true, music);
}

window.showDel = function(id) {
    delId = id;
    show(delModal);
};
closeDel.onclick = () => hide(delModal);
confirmDelBtn.onclick = function() {
    musics = musics.filter(m => m.id !== delId);
    saveMusicsToLocal();
    renderMusicList();
    hide(delModal);
};

uploadBtn.onclick = () => show(uploadModal);
closeUpload.onclick = () => hide(uploadModal);
uploadForm.onsubmit = function(e) {
    e.preventDefault();
    const file = $('fileMp3').files[0];
    const uploadBy = $('uploadBy').value;
    if (file && uploadBy) {
        uploads.push({
            id: uploads.length,
            uploadBy,
            uploadAt: new Date().toISOString(),
            path: file.name
        });
        renderUploadList();
        hide(uploadModal);
        uploadForm.reset();
    }
};

musicForm.onsubmit = function(e) {
    e.preventDefault();
    const id = musics.length > 0 ? musics[musics.length - 1].id + 1 : 1;
    const music = {
        id,
        title: musicForm.title.value,
        artist: musicForm.artist.value,
        releaseDate: musicForm.releaseDate.value ? new Date(musicForm.releaseDate.value).getFullYear() : '',
        url: musicForm.url.value,
        cover: musicForm.cover.value,
        trending: false,
        weeklyPlays: 0,
        monthlyPlays: 0,
        totalPlays: 0,
        likes: 0
    };

    if (musicForm.musicId.value) {
        const idx = musics.findIndex(m => m.id === id);
        musics[idx] = music;
    } else {
        musics.push(music);
    }
    saveMusicsToLocal();
    hide(modal);
    renderMusicList();
}

const localMusics = localStorage.getItem('musics');
const localUploads = localStorage.getItem('uploads');
if (localMusics) {
    musics = JSON.parse(localMusics);
    renderMusicList();
} else {
    fetch('../../datas/json/musics.json')
        .then(res => res.json())
        .then(data => {
            musics = data;
            renderMusicList();
        });
}
if (localUploads) {
    uploads = JSON.parse(localUploads);
    renderUploadList();
} else {
    fetch('../../datas/json/uploads.json')
        .then(res => res.json())
        .then(data => {
            uploads = data;
            renderUploadList();
        });
}