// ✅ 다른 파일들과 통일: 상태를 originalState 객체 하나로 통합 (currentStep, selectedItems, step1Selected 낱개 변수 제거)
const originalState = {
    step: 1,
    selectedItems: [],
    step1Selected: [],
    awardName: ""
};

let cachedVoteData = null;

// ✅ 추가: SeasonFilter 적용된 시나리오 작가 데이터
const SeasonFilteredScriptwriterData = (typeof scriptwriterData_2026 !== 'undefined')
    ? SeasonFilter.filterAnimeList(scriptwriterData_2026)
    : [];

document.addEventListener('DOMContentLoaded', () => {
    renderCards(SeasonFilteredScriptwriterData);

    const params = new URLSearchParams(window.location.search);
    originalState.awardName = params.get("awardName");
    waitForFirebaseAndListen();
});

document.getElementById('search-input').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    // ✅ 수정: Step1이면 시즌 필터링된 전체 데이터, Step2면 선택된 후보
    const targetData = (originalState.step === 1) ? SeasonFilteredScriptwriterData : originalState.step1Selected;

    const filteredData = targetData.filter(anime => {
        const titleMatch = anime.title.toLowerCase().includes(searchTerm);
        const writerMatch = anime.scriptwriter.some(writer => 
            writer.toLowerCase().includes(searchTerm)
        );
        return titleMatch || writerMatch;
    });

    renderCards(filteredData);
});

function renderCards(dataList) {
    // ==========================================
    // Step 2 (최종 선택) 렌더링 로직
    // ==========================================
    if (originalState.step === 2) {
        let grid = document.getElementById('step2-grid');
        
        if (!grid) {
            const contentArea = document.querySelector('.content-area');
            contentArea.innerHTML = `
                <h2 style="color:var(--gold); margin-bottom:20px; font-size: 1.5rem; text-align: left;">최종 수상작을 선택하세요</h2>
                <div id="step2-grid"></div>
            `;
            grid = document.getElementById('step2-grid');
        }
        grid.innerHTML = '';

        if (dataList.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #666;"><p style="font-size: 1.2rem;">검색 결과가 없습니다.</p></div>`;
            return;
        }

        dataList.forEach(anime => {
            const card = document.createElement('div');
            card.className = 'step2-original-card';
            if (originalState.selectedItems.find(i => i.id === anime.id)) card.classList.add('selected');

            card.innerHTML = `
                <div class="card-badge">${anime.quarter}</div>
                <div class="card-thumb">
                    <img src="../${anime.thumbnail}" alt="${anime.title}" onerror="this.src='https://via.placeholder.com/200x300'">
                </div>
                <div class="step2-card-info">
                    <div class="card-title">${anime.title}</div>
                    <div class="card-studio">${anime.scriptwriter.join(', ')}</div>
                </div>
            `;
            
            card.onclick = () => {
                originalState.selectedItems = [anime];
                document.querySelectorAll('.step2-original-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            };
            grid.appendChild(card);
        });
        return;
    }

    // ==========================================
    // Step 1 (후보 선정) 렌더링 로직
    // ==========================================
    let grid = document.getElementById('card-grid');
    
    if (!grid) {
        const contentArea = document.querySelector('.content-area');
        contentArea.innerHTML = `<div id="card-grid" class="card-grid"></div>`;
        grid = document.getElementById('card-grid');
    }

    grid.innerHTML = '';

    if (dataList.length === 0) {
        grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #666;">
        <p style="font-size: 1.2rem;">검색 결과가 없습니다.</p>
        </div>
        `;
        return;
    }

    dataList.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'card';
        if(originalState.selectedItems.find(i => i.id === anime.id)) card.classList.add('selected');

        card.setAttribute('data-category', originalState.awardName);
        card.setAttribute('data-anime-id', anime.title);

        card.innerHTML = `
            <div class="card-selection-rate" style="display:none;">0/0</div>
            <div class="card-badge">${anime.quarter}</div>
            <img src="../${anime.thumbnail}" alt="${anime.title}">
            <div class="card-info">
                <div class="card-title">${anime.title}</div>
                <div class="card-writer">각본: ${anime.scriptwriter.join(', ')}</div>
            </div>
        `;
        card.onclick = () => toggleSelect(anime, card);
        grid.appendChild(card);
    });
    applyVoteBadges();
}

function toggleSelect(anime, cardElement) {
    if (originalState.step === 2) {
        originalState.selectedItems = [anime];
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        cardElement.classList.add('selected');
    } else {
        const index = originalState.selectedItems.findIndex(item => item.id === anime.id);
        if (index > -1) {
            originalState.selectedItems.splice(index, 1);
            cardElement.classList.remove('selected');
        } else {
            originalState.selectedItems.push(anime);
            cardElement.classList.add('selected');
        }
    }
    updatePreview();
}

function updatePreview() {
    const previewList = document.getElementById('preview-list');
    if (!previewList) return;
    
    if (originalState.selectedItems.length === 0) {
        previewList.innerHTML = `<span style="font-size: 0.85rem; color:#555;"></span>`;
        return;
    }

    previewList.innerHTML = '';
    originalState.selectedItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
            ${item.title}
            <br><small style="color:#888; font-size:0.75rem;">${item.scriptwriter.join(', ')}</small>
        `;
        
        div.onclick = () => {
            if (originalState.step === 1) {
                const index = originalState.selectedItems.findIndex(i => i.id === item.id);
                if (index > -1) {
                    originalState.selectedItems.splice(index, 1);
                    renderCards(SeasonFilteredScriptwriterData);   // ✅ 수정
                    updatePreview();
                }
            }
        };
        previewList.appendChild(div);
    });
}

function proceedToStep2() {
    if (originalState.selectedItems.length < 2) {
        alert("최소 2개 이상의 작품을 선택해주세요!");
        return;
    }
    originalState.step1Selected = [...originalState.selectedItems];
    originalState.selectedItems = []; 
    originalState.step = 2;

    document.getElementById('step-title-display').textContent = "베스트 각본상 부문";
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('final-btn').classList.remove('hidden');

    const previewBox = document.querySelector('.status-indicator');
    if (previewBox) previewBox.classList.add('hidden');   // ✅ 수정: style.display 대신 classList로 통일

    const navBtn = document.getElementById('nav-btn');
    navBtn.textContent = "이전 단계";
    navBtn.onclick = backToStep1;

    renderCards(originalState.step1Selected);
    updatePreview();
}

function backToStep1() {
    originalState.step = 1;
    originalState.selectedItems = [...originalState.step1Selected];

    document.getElementById('step-title-display').textContent = "각본상 후보 선정";
    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('final-btn').classList.add('hidden');

    const previewBox = document.querySelector('.status-indicator');
    if (previewBox) previewBox.classList.remove('hidden');   // ✅ 수정: style.display 대신 classList로 통일

    const navBtn = document.getElementById('nav-btn');
    navBtn.textContent = "메인으로";
    navBtn.onclick = () => { location.href = '../index.html'; };

    renderCards(SeasonFilteredScriptwriterData);   // ✅ 수정
    updatePreview();
}

function confirmFinalWinner() {
    if (originalState.selectedItems.length !== 1) {
        alert("최종 수상작을 하나 선택해주세요!");
        return;
    }

    const winner = originalState.selectedItems[0];
    const writerName = winner.scriptwriter ? winner.scriptwriter.join(', ') : "정보 없음";

    document.getElementById('modal-quarter').textContent = winner.quarter;
    document.getElementById('modal-img').src = `../${winner.thumbnail}`;
    document.getElementById('modal-title').textContent = winner.title;
    document.getElementById('modal-studio').textContent = winner.studio;
    document.getElementById('modal-writer').textContent = writerName;

    document.getElementById('winner-modal').classList.remove('hidden');
    fireConfetti();
    ResultStorage.saveOne(originalState.awardName, { 
        title: winner.title, 
        thumbnail: winner.thumbnail 
    });

    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(originalState.awardName);
    }
}

function fireConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
    });

    const duration = 3000;
    const animationEnd = Date.now() + duration;

    (function frame() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return;

        myConfetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#d4af37', '#ffffff', '#aa8a2e']
        });

        myConfetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#d4af37', '#ffffff', '#aa8a2e']
        });

        requestAnimationFrame(frame);
    }());
}

function goToMain() { location.href = '../index.html'; }

// ──────────────────────────────────────────────────────────
// Firebase 실시간 득표율 뱃지
// ──────────────────────────────────────────────────────────
function applyVoteBadges() {
    if (!cachedVoteData) return;

    const total = cachedVoteData._participants || 0;

    document.querySelectorAll('.card').forEach(card => {
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

    const categoryRef = window.fbRef(window.fbDB, window.getVotesCategoryPath(originalState.awardName));

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