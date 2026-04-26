const memeState = {
    selectedMeme: null,
    selectedSrc: null,   // 현재 선택된 src 추적
    awardName: "올해의 밈"
};
let cachedVoteData = null;

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    memeState.theme = params.get("theme");
    memeState.awardName = params.get("awardName");

    const stepTitle = document.getElementById("step-title");
    if (stepTitle) stepTitle.textContent = `${memeState.awardName} 부문`;

    renderMemeGrid();

    const popup = document.getElementById("winner-popup");
    if (popup) {
        popup.addEventListener("click", (e) => {
            if (e.target === popup) closePopup();
        });
    }

    waitForFirebaseAndListen();
});

// src 목록 배열로 정규화
function getSrcs(meme) {
    const srcs = [];
    if (meme.src1) srcs.push({ url: meme.src1, label: "원본" });
    if (meme.src2) srcs.push({ url: meme.src2, label: meme.src2_title || "ver.2" });
    if (meme.src3) srcs.push({ url: meme.src3, label: meme.src3_title || "ver.3" });
    if (meme.src4) srcs.push({ url: meme.src4, label: meme.src4_title || "ver.4" });
    // 구버전 src 폴백
    if (srcs.length === 0 && meme.src) srcs.push({ url: meme.src, label: "원본" });
    return srcs;
}

function renderMemeGrid() {
    const grid = document.getElementById("meme-grid");
    if (!grid || typeof AnimeMemeData === 'undefined') return;

    // quarter별 그룹핑
    const groups = {};
    AnimeMemeData.forEach(meme => {
        const key = meme.quarter || '기타';
        if (!groups[key]) groups[key] = [];
        groups[key].push(meme);
    });

    grid.innerHTML = "";

    Object.entries(groups).forEach(([quarter, memes], idx) => {
        const section = document.createElement("div");
        section.className = "quarter-section";

        const btn = document.createElement("button");
        btn.className = "quarter-btn";
        btn.innerHTML = `
            <span>${quarter}</span>
            <span>▼</span>
        `;

        const qContent = document.createElement("div");
        qContent.className = "quarter-content";
        qContent.style.display = "none";

        const memeGrid = document.createElement("div");
        memeGrid.className = "meme-vote-grid";
        memes.forEach(meme => memeGrid.appendChild(createMemeCard(meme)));
        qContent.appendChild(memeGrid);

        btn.onclick = () => {
            const isVisible = qContent.style.display === "block";
            qContent.style.display = isVisible ? "none" : "block";
            btn.classList.toggle("active", !isVisible);
        };

        section.appendChild(btn);
        section.appendChild(qContent);
        grid.appendChild(section);
    });
    applyVoteBadges();
}

function createMemeCard(meme) {
    const srcs = getSrcs(meme);
    const firstSrc = srcs[0];
    const isVideo = meme.type === 'video' || firstSrc.url.endsWith('.mp4');

    const card = document.createElement("div");
    card.className = "card meme-card";
    card.id = `card-${meme.id}`;

    // ✅ Firebase 연동용 data 속성
    card.setAttribute('data-category', memeState.awardName);
    card.setAttribute('data-anime-id', meme.name);

    // ✅ 득표율 뱃지 (좌측 상단)
    const rateBadge = document.createElement("div");
    rateBadge.className = "card-selection-rate";
    rateBadge.style.display = "none";
    rateBadge.textContent = "0%";

    // 돋보기 버튼
    const zoomBtn = document.createElement("button");
    zoomBtn.className = "zoom-btn";
    zoomBtn.title = "확대 보기";
    zoomBtn.textContent = "+";
    zoomBtn.onclick = (e) => openMemeZoom(meme.id, e);

    // 미디어 박스
    const mediaBox = document.createElement("div");
    mediaBox.className = "media-box";
    mediaBox.id = `media-${meme.id}`;

    if (isVideo) {
        const video = document.createElement("video");
        video.src = `../${firstSrc.url}`;
        video.muted = true;
        video.loop = true;
        video.onmouseover = () => video.play();
        video.onmouseout = () => video.pause();
        mediaBox.appendChild(video);
    } else {
        const img = document.createElement("img");
        img.src = `../${firstSrc.url}`;
        img.alt = meme.name;
        mediaBox.appendChild(img);
    }

    // 카드 정보
    const cardInfo = document.createElement("div");
    cardInfo.className = "card-info";
    cardInfo.innerHTML = `
        <div class="card-title">${meme.name}</div>
        <div class="card-studio">${meme.origin || '출처 불명'}</div>
    `;

    card.appendChild(rateBadge);
    card.appendChild(zoomBtn);
    card.appendChild(mediaBox);
    card.appendChild(cardInfo);

    card.onclick = () => selectMeme(meme.id);
    return card;
}

function renderMemeCard(meme) {
    const srcs = getSrcs(meme);
    const firstSrc = srcs[0];

    const mediaHtml = (meme.type === 'video' || firstSrc.url.endsWith('.mp4'))
        ? `<video src="../${firstSrc.url}" muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>`
        : `<img src="../${firstSrc.url}" alt="${meme.name}">`;

    return `
        <div class="card meme-card" id="card-${meme.id}" onclick="selectMeme('${meme.id}')">
            <button class="zoom-btn" onclick="openMemeZoom('${meme.id}', event)" title="확대 보기">+</button>
            <div class="media-box" id="media-${meme.id}">
                ${mediaHtml}
            </div>
            <div class="card-info">
                <div class="card-title">${meme.name}</div>
                <div class="card-studio">${meme.origin || '출처 불명'}</div>
            </div>
        </div>
    `;
}

function switchSrc(memeId, srcUrl, tabBtn, e) {
    e.stopPropagation(); // 카드 선택 이벤트 방지

    // 탭 활성화
    const card = document.getElementById(`card-${memeId}`);
    card.querySelectorAll('.src-tab').forEach(t => t.classList.remove('active'));
    tabBtn.classList.add('active');

    // 미디어 교체
    const mediaBox = document.getElementById(`media-${memeId}`);
    const meme = AnimeMemeData.find(m => m.id === memeId);
    const isVideo = meme.type === 'video' || srcUrl.endsWith('.mp4');

    mediaBox.innerHTML = isVideo
        ? `<video src="../${srcUrl}" muted loop autoplay onmouseover="this.play()" onmouseout="this.pause()"></video>`
        : `<img src="../${srcUrl}" alt="${meme.name}">`;

    // 선택된 상태라면 선택 src도 업데이트
    if (memeState.selectedMeme?.id === memeId) {
        memeState.selectedSrc = srcUrl;
    }
}

function toggleAccordion(btn) {
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('open'));
    document.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
    if (!isOpen) {
        btn.classList.add('open');
        btn.nextElementSibling.classList.add('open');
    }
}

function selectMeme(id) {
    const prevSelectedId = memeState.selectedMeme?.id;
    const meme = AnimeMemeData.find(m => m.id === id);
    memeState.selectedMeme = meme;

    // 현재 카드에서 활성 탭의 src를 selectedSrc로 저장
    const card = document.getElementById(`card-${id}`);
    const activeTab = card?.querySelector('.src-tab.active');
    const srcs = getSrcs(meme);
    memeState.selectedSrc = activeTab
        ? srcs.find(s => s.label === activeTab.textContent.trim())?.url || srcs[0].url
        : srcs[0].url;

    if (prevSelectedId) {
        const prevVideo = document.querySelector(`#card-${prevSelectedId} video`);
        if (prevVideo) prevVideo.pause();
    }

    document.querySelectorAll('.meme-card').forEach(c => c.classList.remove('selected'));
    card?.classList.add('selected');

    const awardBtn = document.getElementById('btn-award');
    if (awardBtn) awardBtn.disabled = false;
}

function openMemeZoom(id, e) {
    if (e) e.stopPropagation();
    const meme = AnimeMemeData.find(m => m.id === id);
    const popup = document.getElementById("winner-popup");
    if (!meme || !popup) return;

    const srcs = getSrcs(meme);

    // 첫 번째 src로 미디어 렌더링
    function renderZoomMedia(src) {
        const isVideo = meme.type === 'video' || src.url.endsWith('.mp4');
        return isVideo
            ? `<video src="../${src.url}" controls autoplay loop style="max-height:500px; width:100%;"></video>`
            : `<img src="../${src.url}" style="max-height:500px; max-width:100%;">`;
    }

    const tabsHtml = srcs.length > 1 ? `
        <div class="popup-tabs">
            ${srcs.map((s, i) => `
                <button class="popup-tab ${i === 0 ? 'active' : ''}"
                    onclick="switchPopupSrc('${meme.id}', ${i})">
                    ${s.label}
                </button>
            `).join('')}
        </div>
    ` : '';

    popup.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <button class="zoom-close-btn" onclick="closePopup()">✕</button>
            <h2 class="modal-header">${meme.name}</h2>
            <hr class="modal-divider">
            ${tabsHtml}
            <div id="popup-media" style="text-align:center; padding:10px; border-radius:10px;">
                ${renderZoomMedia(srcs[0])}
            </div>
            <p style="color:#aaa; text-align:center; margin-top:20px;">출처: ${meme.origin}</p>
        </div>
    `;
    popup.classList.remove('hidden');

    // meme 데이터를 팝업에 임시 저장 (탭 전환용)
    popup._meme = meme;
    popup._srcs = srcs;
}
function switchPopupSrc(memeId, srcIndex) {
    const popup = document.getElementById("winner-popup");
    const srcs = popup._srcs;
    const meme = popup._meme;
    if (!srcs || !meme) return;

    // 탭 활성화
    popup.querySelectorAll('.popup-tab').forEach((t, i) => {
        t.classList.toggle('active', i === srcIndex);
    });

    // 미디어 교체
    const src = srcs[srcIndex];
    const isVideo = meme.type === 'video' || src.url.endsWith('.mp4');
    const mediaBox = document.getElementById('popup-media');

    // 기존 비디오 정리
    mediaBox.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });

    mediaBox.innerHTML = isVideo
        ? `<video src="../${src.url}" controls autoplay loop style="max-height:500px; width:100%;"></video>`
        : `<img src="../${src.url}" style="max-height:500px; max-width:100%;">`;
}

function saveMemeWinner() {
    const winner = memeState.selectedMeme;
    if (!winner) return;

    const srcs = getSrcs(winner);
    const savedSrc = memeState.selectedSrc || srcs[0].url;

    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results[memeState.awardName] = {
        title: winner.name,
        thumbnail: savedSrc,
        type: winner.type,
        origin: winner.origin
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));
    
    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(memeState.awardName);
    }

    showWinnerCelebration(winner, savedSrc);
}

function showWinnerCelebration(winner, src) {
    const popup = document.getElementById("winner-popup");
    if (!popup) return;
    const isVideo = winner.type === 'video' || src?.endsWith('.mp4');

    popup.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <h2 class="modal-header">FINAL WINNER</h2>
            <hr class="modal-divider">
            <div class="media-box" style="margin: 0 auto 20px auto; max-width: 500px; border-radius: 10px; overflow: hidden; background: transparent;">
                ${isVideo
                    ? `<video src="../${src}" autoplay loop muted style="width:100%; border-radius:10px;"></video>`
                    : `<img src="../${src}" style="width:100%; border-radius:10px;">`}
            </div>
            <h1 style="color: #fff; margin: 0 0 10px 0;">${winner.name}</h1>
            <p style="color: #888; margin: 0;">${winner.origin}</p>
            <div style="margin-top: 30px;">
                <button class="gold-btn" onclick="location.href='../index.html'">결과 저장 및 메인으로</button>
            </div>
        </div>
    `;
    popup.classList.remove('hidden');
    fireConfetti();
}

function closePopup() {
    const popup = document.getElementById("winner-popup");
    if (!popup) return;
    popup.querySelectorAll('video').forEach(v => {
        v.pause(); v.removeAttribute('src'); v.load();
    });
    popup.innerHTML = "";
    popup.classList.add('hidden');
}

function fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, zIndex: 9999, colors: ['#d4af37', '#ffffff'] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, zIndex: 9999, colors: ['#d4af37', '#ffffff'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

// ──────────────────────────────────────────────────────────
// Firebase 실시간 득표율 뱃지
// ──────────────────────────────────────────────────────────
function applyVoteBadges() {
    if (!cachedVoteData) return;

    const total = cachedVoteData._participants || 0;

    document.querySelectorAll('.meme-card').forEach(card => {
        const animeId = card.getAttribute('data-anime-id');
        const rateBadge = card.querySelector('.card-selection-rate');
        if (!rateBadge || !animeId) return;

        const count = cachedVoteData[animeId] || 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        rateBadge.innerText = `${percent}%`;
        rateBadge.style.display = "block";
    });
}

function listenToVoteRates() {
    if (!window.fbOnValue || !window.fbDB) return;

    const categoryRef = window.fbRef(window.fbDB, `votes/categories/${memeState.awardName}`);

    window.fbOnValue(categoryRef, (snapshot) => {
        cachedVoteData = snapshot.val() || {};
        applyVoteBadges();
    });
}

function waitForFirebaseAndListen() {
    if (window.fbOnValue && window.fbDB) {
        listenToVoteRates();
    } else {
        setTimeout(waitForFirebaseAndListen, 300);
    }
}