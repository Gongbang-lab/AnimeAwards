const memeState = {
    selectedMeme: null,
    awardName: "올해의 밈"
};

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    memeState.theme = params.get("theme");
    memeState.awardName = params.get("awardName");

    memeState.awardName = memeState.awardName;
    const stepTitle = document.getElementById("step-title");
    if(stepTitle) stepTitle.textContent = `${memeState.awardName} 부문`;

    renderMemeGrid();

    const popup = document.getElementById("winner-popup");
    if (popup) {
        popup.addEventListener("click", (e) => {
            if (e.target === popup) closePopup();
        });
    }
});

function renderMemeGrid() {
    const grid = document.getElementById("meme-grid");
    if (!grid || typeof AnimeMemeData === 'undefined') return;

    grid.innerHTML = Object.values(AnimeMemeData).map(meme => `
        <div class="card meme-card" id="card-${meme.id}" onclick="selectMeme('${meme.id}')">
            <button class="zoom-btn" onclick="openMemeZoom('${meme.id}', event)" title="확대 보기">+</button>
            <div class="media-box">
                ${meme.type === 'video' 
                    ? `<video src="${meme.src}" muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>` 
                    : `<img src="${meme.src}" alt="${meme.name}">`}
            </div>
            <div class="card-info">
                <div class="card-title">${meme.name}</div>
                <div class="card-studio">${meme.origin || '출처 불명'}</div>
            </div>
        </div>
    `).join('');
}

function selectMeme(id) {
    const prevSelectedId = memeState.selectedMeme?.id;
    memeState.selectedMeme = AnimeMemeData[id];
    
    if (prevSelectedId) {
        const prevVideo = document.querySelector(`#card-${prevSelectedId} video`);
        if (prevVideo) prevVideo.pause();
    }

    document.querySelectorAll('.meme-card').forEach(c => c.classList.remove('selected'));
    const currentCard = document.getElementById(`card-${id}`);
    if (currentCard) {
        currentCard.classList.add('selected');
    }

    const awardBtn = document.getElementById('btn-award');
    if (awardBtn) awardBtn.disabled = false;
}

function updatePreviewBox() {
    const box = document.getElementById('preview-box');
    const meme = memeState.selectedMeme;
    
    if (!meme) return;

    box.innerHTML = `
        <div style="text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center;">
            <div class="media-box" style="border-radius: 8px; margin-bottom: 15px;">
                ${meme.type === 'video' 
                    ? `<video src="${meme.src}" autoplay loop muted style="width:100%; border-radius:8px;"></video>` 
                    : `<img src="${meme.src}" style="width:100%; border-radius:8px;">`}
            </div>
            <h3 style="color: var(--gold); margin: 0 0 10px 0;">${meme.name}</h3>
            <p style="color: #aaa; font-size: 0.9rem; margin: 0;">${meme.origin}</p>
        </div>
    `;
}

function openMemeZoom(id, e) {
    if (e) e.stopPropagation();
    const meme = AnimeMemeData[id];
    const popup = document.getElementById("winner-popup");
    if (!meme || !popup) return;

    popup.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <button class="zoom-close-btn" onclick="closePopup()">✕</button>
            <h2 class="modal-header">${meme.name}</h2>
            <hr class="modal-divider">
            <div style="text-align:center; padding:10px; border-radius:10px;">
                ${meme.type === 'video' 
                    ? `<video src="${meme.src}" controls autoplay loop style="max-height:500px; width:100%;"></video>` 
                    : `<img src="${meme.src}" style="max-height:500px; max-width:100%;">`}
            </div>
            <p style="color:#aaa; text-align:center; margin-top:20px;">출처: ${meme.origin}</p>
        </div>
    `;
    popup.classList.remove('hidden');
}

function saveMemeWinner() {
    const winner = memeState.selectedMeme;
    if (!winner) return;

    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results[memeState.awardName] = {
        title: winner.name,
        thumbnail: winner.src,
        type: winner.type,
        origin: winner.origin
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));

    showWinnerCelebration(winner);
}

function showWinnerCelebration(winner) {
    const popup = document.getElementById("winner-popup");
    if (!popup) return;

    popup.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <h2 class="modal-header">🏆 ${memeState.awardName} 수상 🏆</h2>
            <hr class="modal-divider">
            
            <div class="media-box" style="margin: 0 auto 20px auto; max-width: 500px; border-radius: 10px; overflow: hidden; background: transparent;">
                ${winner.type === 'video' 
                    ? `<video src="${winner.src}" autoplay loop muted style="width:100%; border-radius:10px;"></video>` 
                    : `<img src="${winner.src}" style="width:100%; border-radius:10px;">`}
            </div>
            
            <h1 style="color: #fff; margin: 0 0 10px 0;">${winner.name}</h1>
            <p style="color: #888; margin: 0;">${winner.origin}</p>
            
            <div style="margin-top: 30px;">
                <button class="gold-btn" onclick="location.href='../main/main.html'">결과 저장 및 메인으로</button>
            </div>
        </div>
    `;
    popup.classList.remove('hidden');
    
    fireConfetti();
}

function closePopup() {
    const popup = document.getElementById("winner-popup");
    if (!popup) return;

    const videos = popup.querySelectorAll('video');
    videos.forEach(v => {
        v.pause();
        v.removeAttribute('src');
        v.load();
    });

    popup.innerHTML = "";
    popup.classList.add('hidden');
}

function fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        // 왼쪽에서 발사
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            zIndex: 9999,
            colors: ['#d4af37', '#ffffff']
        });
        // 오른쪽에서 발사
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 }, 
            zIndex: 9999,
            colors: ['#d4af37', '#ffffff']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}