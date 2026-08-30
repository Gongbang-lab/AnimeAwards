/**
 * 상태 관리
 */
const cvState = {
    step: 1,
    theme: new URLSearchParams(location.search).get("theme") || "character_male",
    awardName: new URLSearchParams(location.search).get("awardName") || "올해의 성우상",  // ✅ currentAward → awardName (다른 파일들과 통일)
    selectedCVs: [], 
    finalWinner: null
};

let cachedVoteData = null;

/**
 * ✅ 추가: 성별 + 시즌(분기) 기준으로 필터링된 성우 목록을 반환
 * - 각 성우의 characters(참여작)를 선택된 분기에 해당하는 것만 남기고
 * - 남은 참여작이 하나도 없는 성우는 후보 목록에서 제외
 */
function getSeasonFilteredCVList(genderKey) {
    if (typeof CharacterVoiceData === 'undefined') return [];

    return Object.values(CharacterVoiceData)
        .filter(cv => cv.name !== "Unknown")
        .filter(cv => String(cv.gender).toLowerCase() === genderKey)
        .map(cv => ({
            ...cv,
            characters: (cv.characters || []).filter(role => SeasonFilter.isInSeason(role))
        }))
        .filter(cv => cv.characters.length > 0);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("search-input").addEventListener("input", (e) => {
        renderCVStep1(e.target.value);
    });

    document.getElementById("btn-next").onclick = goStep2;
    document.getElementById("btn-back").onclick = handleBack;
    document.getElementById("final-confirm-btn").onclick = () => location.href = "../index.html";

    renderCVStep1();
    waitForFirebaseAndListen();
});

/**
 * Step 1: 성우 리스트 렌더링 (아코디언 스타일 적용)
 */
function renderCVStep1(searchTerm = "") {
    const mainContent = document.getElementById("main-content");
    const stepTitle = document.getElementById("step-title");
    
    if (cvState.step === 1) {
        mainContent.innerHTML = "";
        
        const genderKey = cvState.theme.includes("female") ? "female" : "male";
        if (genderKey === "female") {
            stepTitle.textContent = `${SeasonFilter.toDisplayAwardName("올해의 여자 성우상")} 부문`;
        } else {
            stepTitle.textContent = `${SeasonFilter.toDisplayAwardName("올해의 남자 성우상")} 부문`;
        }

        // ✅ 수정: SeasonFilter 적용된 목록 사용
        let filteredList = getSeasonFilteredCVList(genderKey);

        if (searchTerm.trim() !== "") {
            filteredList = filteredList.filter(cv => 
                cv.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
            );
        }

        // 2. 그룹화 (이번 시즌 참여작 수 기준)
        const groups = {};
        filteredList.forEach(cv => {
            const count = cv.characters ? cv.characters.length : 0;
            const groupKey = `${count}개 작품 참여`;
            if (!groups[groupKey]) groups[groupKey] = { count: count, list: [] };
            groups[groupKey].list.push(cv);
        });

        const sortedGroupKeys = Object.keys(groups).sort((a, b) => groups[b].count - groups[a].count);

        sortedGroupKeys.forEach(groupKey => {
            const groupData = groups[groupKey];
            groupData.list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

            const section = document.createElement("div");
            section.className = "quarter-section";

            const btn = document.createElement("button");
            btn.className = "quarter-btn";
            btn.innerHTML = `<span>${groupKey}</span> <span>▼</span>`;
            
            const content = document.createElement("div");
            content.className = "day-content";
            content.style.display = "none";

            if (searchTerm) {
                content.style.display = "grid";
                btn.classList.add("active");
            }

            btn.onclick = () => {
                const isOpen = content.style.display === "grid";
                content.style.display = isOpen ? "none" : "grid";
                btn.classList.toggle("active", !isOpen);
            };

            groupData.list.forEach(cv => {
                content.appendChild(createCVCard(cv, "step1"));
            });

            section.appendChild(btn);
            section.appendChild(content);
            mainContent.appendChild(section);
        });
    }
    applyVoteBadges();
}

/**
 * 카드 생성 함수
 */
function createCVCard(cv, step) {
    const card = document.createElement("div");
    card.className = "card";

    card.setAttribute('data-category', cvState.awardName);
    card.setAttribute('data-anime-id', cv.name);

    const rateBadge = document.createElement("div");
    rateBadge.className = "card-selection-rate";
    rateBadge.style.display = "none";
    rateBadge.textContent = "0/0";
    card.appendChild(rateBadge);

    const badge = document.createElement("div");
    badge.className = "card-badge";
    badge.textContent = `${cv.characters.length}작품`;
    badge.onclick = (e) => {
        e.stopPropagation();
        openDetailModal(cv);
    };

    const isSelected = cvState.selectedCVs.some(v => v.name === cv.name);
    if (step === "step1" && isSelected) card.classList.add("selected");

    card.innerHTML += `
        <img src="../${cv.cvimg}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300'">
        <div class="card-info">
            <div class="card-title">${cv.name}</div>
        </div>
    `;

    card.prepend(badge);
    card.prepend(rateBadge);

    card.onclick = () => {
        if (step === "step1") {
            toggleCVSelection(cv, card);
        } else {
            document.querySelectorAll("#step2-grid .card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            cvState.finalWinner = cv;
            document.getElementById("btn-next").disabled = false;
        }
    };

    return card;
}

/**
 * 선택 및 프리뷰 로직
 */
function toggleCVSelection(cv, cardElement) {
    const index = cvState.selectedCVs.findIndex(v => v.name === cv.name);
    
    if (index > -1) {
        cvState.selectedCVs.splice(index, 1);
        cardElement.classList.remove("selected");
    } else {
        cvState.selectedCVs.push(cv);
        cardElement.classList.add("selected");
    }
    
    updatePreview();
}

function updatePreview() {
    const list = document.getElementById("preview-list");
    const nextBtn = document.getElementById("btn-next");

    if (!list) return;
    
    list.innerHTML = "";

    cvState.selectedCVs.forEach(cv => {
        const div = document.createElement("div");
        div.className = "preview-item";
        div.innerHTML = `
            ${cv.name}
            <br><small style="color:#888;">${cv.characters.length}개 작품 참여</small>
        `;
        
        div.onclick = () => {
            removeCV(cv.name);
        };
        
        list.appendChild(div);
    });

    if (nextBtn) {
        nextBtn.disabled = cvState.selectedCVs.length === 0;
    }
}

function removeCV(name) {
    const index = cvState.selectedCVs.findIndex(v => v.name === name);
    if (index > -1) {
        cvState.selectedCVs.splice(index, 1);
    }

    const cards = document.querySelectorAll(".card");
    cards.forEach(c => {
        const title = c.querySelector(".card-title");
        if (title && title.textContent === name) {
            c.classList.remove("selected");
        }
    });

    updatePreview();
}

/**
 * Step 이동 로직
 */
function goStep2() {
    if (cvState.step === 1) {
        cvState.step = 2;
        
        const searchCont = document.querySelector('.search-container');
        const previewBox = document.getElementById('step1-preview');

        if (searchCont) searchCont.classList.add('hidden');
        if (previewBox) previewBox.classList.add('hidden');

        const stepTitle = document.getElementById("step-title");
        const genderKey = cvState.theme.includes("female") ? "female" : "male";
        stepTitle.textContent = genderKey === "female"
            ? `${SeasonFilter.toDisplayAwardName("올해의 여자 성우상")} 부문`
            : `${SeasonFilter.toDisplayAwardName("올해의 남자 성우상")} 부문`;
            
        document.getElementById("btn-back").textContent = "이전 단계";
        const nextBtn = document.getElementById("btn-next");
        nextBtn.textContent = "수상 결정";
        nextBtn.disabled = true;

        const mainContent = document.getElementById("main-content");
        mainContent.innerHTML = `
            <h2 style="color:var(--gold); margin-bottom:20px; font-size: 1.5rem; text-align: left;">최종 수상자를 선택하세요</h2>
            <div id="step2-grid"></div>
        `;
        
        const grid = document.getElementById("step2-grid");

        // ✅ 수정: 인라인 중복 대신 createStep2Card() 재사용
        cvState.selectedCVs.forEach(cv => {
            grid.appendChild(createStep2Card(cv));
        });

        applyVoteBadges();   // ✅ 추가: Step2 진입 시에도 뱃지 반영
    } else {
        openWinnerModal();
    }
}

function createStep2Card(cv) {
    const card = document.createElement("div");
    card.className = "step2-cv-card";

    // ✅ 추가: 뱃지 매칭용 속성 (기존엔 없어서 Step2에서 뱃지가 안 떴음)
    card.setAttribute('data-category', cvState.awardName);
    card.setAttribute('data-anime-id', cv.name);

    const repWork = cv.characters && cv.characters.length > 0 ? cv.characters[0].animeTitle : "";
    const subText = repWork ? `${repWork} 등` : "정보 없음";

    card.innerHTML = `
        <div class="card-selection-rate" style="display:none;">0/0</div>
        <div class="card-badge">${cv.characters.length}작품</div>
        <div class="card-thumb">
            <img src="../${cv.cvimg}" onerror="this.src='https://via.placeholder.com/200x300'">
        </div>
        <div class="step2-card-info">
            <div class="card-title">${cv.name}</div>
            <div class="card-studio">${subText}</div>
        </div>
    `;

    card.onclick = () => {
        document.querySelectorAll(".step2-cv-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        cvState.finalWinner = cv;
        document.getElementById("btn-next").disabled = false;
    };
    return card;
}

function handleBack() {
    if (cvState.step === 2) {
        cvState.step = 1;
        
        const searchCont = document.querySelector('.search-container');
        const previewBox = document.getElementById('step1-preview');

        if (searchCont) searchCont.classList.remove('hidden');
        if (previewBox) previewBox.classList.remove('hidden');

        document.getElementById("btn-back").textContent = "메인으로";
        const nextBtn = document.getElementById("btn-next");
        nextBtn.textContent = "다음 단계";
        
        nextBtn.disabled = cvState.selectedCVs.length === 0;
        
        renderCVStep1();
    } else {
        location.href = "../index.html";
    }
}

/**
 * 모달 관련 함수
 */
function openDetailModal(cv) {
    const modal = document.getElementById("cv-detail-modal");
    const nameEl = document.getElementById("detail-name");
    const imgEl = document.getElementById("detail-img");
    const worksContainer = document.getElementById("detail-works");

    nameEl.textContent = `${cv.name} 참여 작품`;
    imgEl.src = `../${cv.cvimg}`;
    
    worksContainer.innerHTML = cv.characters.map(char => `
        <div class="work-card">
            <div class="work-card-thumb">
                <img src="../${char.img}" onerror="this.src='https://via.placeholder.com/150'">
            </div>
            <div class="work-card-info">
                <div class="work-card-title">${char.animeTitle}</div>
                <div class="work-card-char">${char.charName} 역</div>
            </div>
        </div>
    `).join('');
    
    modal.classList.remove("hidden");
}

function openWinnerModal() {
    const winner = cvState.finalWinner;
    if (!winner) return;

    document.getElementById("winner-img").src = `../${winner.cvimg}`;

    const infoContent = document.getElementById("winner-info-content");
    
    const worksListHTML = winner.characters.map(char => `
        <div class="info-row">
            <span class="info-label">${char.animeTitle}</span>
            <span class="info-value">${char.charName} 역</span>
        </div>
    `).join('');

    infoContent.innerHTML = `
        <div class="info-row" style="border-bottom: 2px solid var(--gold); margin-bottom: 15px; padding-bottom: 15px;">
            <span class="info-label" style="font-size: 1.4rem;">수상자</span>
            <span class="info-value" style="font-size: 1.4rem; color: #fff; font-weight: bold;">${winner.name}</span>
        </div>
        <div class="winner-works-scroll" style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
            ${worksListHTML}
        </div>
    `;

    document.getElementById("winner-modal").classList.remove("hidden");
    fireConfetti();

    saveResult(winner);
}

// ✅ 삭제: 예전 방식(anime_awards_result 직접 조작)으로 이 함수를 덮어쓰던 중복 정의 제거
//         ResultStorage.saveOne()을 쓰는 버전 하나만 유지
function saveResult(winner) {
    ResultStorage.saveOne(cvState.awardName, {
        name: winner.name,
        thumbnail: winner.cvimg,
        works: winner.characters.map(c => c.charName).join(', ')
    });

    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(cvState.awardName);
    }
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

function fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            zIndex: 9999,
            colors: ['#d4af37', '#ffffff']
        });
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

    const categoryRef = window.fbRef(window.fbDB, window.getVotesCategoryPath(cvState.awardName));

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