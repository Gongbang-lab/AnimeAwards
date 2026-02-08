/**
 * 애니 밈 노미네이트 및 수상 로직
 */
const memeState = {
    selectedMeme: null,
    awardName: "올해의 애니 밈 상"
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. 그리드 렌더링
    renderMemeGrid();

    // 2. 팝업 외부 클릭 시 닫기
    const popup = document.getElementById("winner-popup");
    if (popup) {
        popup.addEventListener("click", (e) => {
            if (e.target === popup) closePopup();
        });
    }
});

/**
 * [메인] 밈 그리드 렌더링
 */
function renderMemeGrid() {
    const grid = document.getElementById("meme-grid");
    if (!grid || typeof AnimeMemeData === 'undefined') return;

    grid.innerHTML = Object.values(AnimeMemeData).map(meme => `
        <div class="meme-card" id="card-${meme.id}" onclick="selectMeme('${meme.id}')">
            <button class="zoom-btn" onclick="openMemeZoom('${meme.id}', event)" title="확대 보기">🔍</button>
            
            <div class="media-box">
                ${meme.type === 'video' 
                    ? `<video src="${meme.src}" muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>` 
                    : `<img src="${meme.src}" alt="${meme.name}">`}
            </div>
            <div class="meme-info">
                <div class="name">${meme.name}</div>
            </div>
        </div>
    `).join('');
}

/**
 * 카드 선택 로직
 */
function selectMeme(id) {
    memeState.selectedMeme = AnimeMemeData[id];
    
    document.querySelectorAll('.meme-card').forEach(c => c.classList.remove('selected'));
    const selectedAcross = document.getElementById(`card-${id}`);
    if (selectedAcross) selectedAcross.classList.add('selected');
    
    const awardBtn = document.getElementById('btn-award');
    if (awardBtn) awardBtn.disabled = false;
}

/**
 * [팝업] 밈 확대 보기
 */
function openMemeZoom(id, e) {
    if (e) e.stopPropagation();
    const meme = AnimeMemeData[id];
    const popup = document.getElementById("winner-popup");
    if (!meme || !popup) return;

    popup.className = "winner-popup";
    popup.innerHTML = `
        <div class="popup-container">
            <button class="close-btn" onclick="closePopup()">✕</button>
            
            <div class="media-section">
                ${meme.type === 'video' 
                    ? `<video src="${meme.src}" controls autoplay loop></video>` 
                    : `<img src="${meme.src}" alt="${meme.name}">`}
            </div>
            
            <div class="info-section">
                <div class="origin-text">${meme.origin}</div>
                <h2 class="title-text">${meme.name}</h2>
                ${meme.description ? `<p class="desc-text">${meme.description}</p>` : ''}
            </div>
        </div>
    `;
    popup.style.display = "flex";
}

/**
 * 수상 결정 및 결과 저장
 */
function saveMemeWinner() {
    const winner = memeState.selectedMeme;
    if (!winner) return;

    // LocalStorage 저장
    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results[memeState.awardName] = {
        name: winner.name,
        thumbnail: winner.src,
        type: winner.type,
        origin: winner.origin,
        date: new Date().toLocaleDateString()
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));

    showWinnerCelebration(winner);
}

/**
 * [팝업] 수상 축하 연출
 */
function showWinnerCelebration(winner) {
    const popup = document.getElementById("winner-popup");
    if (!popup) return;

    popup.className = "winner-popup victory-mode";
    popup.innerHTML = `
        <div class="popup-container">
            <div class="media-section">
                ${winner.type === 'video' 
                    ? `<video src="${winner.src}" autoplay loop muted></video>` 
                    : `<img src="${winner.src}" alt="${winner.name}">`}
            </div>
            
            <div class="info-section">
                <div class="award-label">${memeState.awardName}</div>
                <h1 class="title-text">${winner.name}</h1>
                <div class="celebration-text">🎉 2026 어워드 수상을 진심으로 축하합니다! 🎉</div>
                <button class="action-btn" onclick="location.href='../main/main.html'">메인으로 돌아가기</button>
            </div>
        </div>
    `;
    popup.style.display = "flex";
    
    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 10001 });
    }
}

/**
 * 팝업 닫기
 */
function closePopup() {
    const popup = document.getElementById("winner-popup");
    if (!popup) return;

    // 비디오 완전 정리
    const videos = popup.querySelectorAll('video');
    videos.forEach(v => {
        v.pause();
        v.src = "";
        v.load();
    });

    popup.innerHTML = "";
    popup.style.display = "none";
    popup.className = "winner-popup";
}
