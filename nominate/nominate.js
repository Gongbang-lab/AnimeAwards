// ──────────────────────────────────────────────────────────
// 1. 초기 설정 및 데이터 가공
// ──────────────────────────────────────────────────────────
const nominateState = {
    step: 1,
    selectedItems: [],
    selectedWinner: null,
    awardName: ""
};

let cachedVoteData = null;

// URL 파라미터 처리
const params = new URLSearchParams(location.search);
nominateState.awardName = params.get("awardName");
const modalAwardName = document.getElementById('modal-award-name');
if(modalAwardName) modalAwardName.textContent = nominateState.awardName;
const stepTitle = document.getElementById("step-title");
stepTitle.textContent = `${nominateState.awardName} 부문`;

// 요일 매핑 (데이터의 day는 영어 그대로 유지됨)
const DAY_LABELS = {
    "Mondays": "월요일", "Tuesdays": "화요일", "Wednesdays": "수요일", "Thursdays": "목요일",
    "Fridays": "금요일", "Saturdays": "토요일", "Sundays": "일요일",
    "Anomaly": "변칙 편성", "Web": "웹", "Unknown": "기타"
};
const DAY_KEYS = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays", "Anomaly", "Web", "Unknown"];

// 분기 정렬 순서 (데이터의 quarter가 이미 "1분기" 한글임)
const QUARTER_ORDER = ["1분기", "2분기", "3분기", "4분기", "변칙 편성", "기타"];

// ✅ 수정: AnimeList_2026 하드코딩 → resolveYear.js가 만든 별칭 AnimeList 사용
const SeasonFilteredList = SeasonFilter.filterAnimeList(AnimeList);

const AnimeByQuarter = SeasonFilteredList.reduce((acc, anime) => {
    const q = anime.quarter || "기타";
    if (!acc[q]) acc[q] = [];
    acc[q].push(anime);
    return acc;
}, {});

// ──────────────────────────────────────────────────────────
// 2. Step 1 렌더링 (아코디언 + 그리드)
// ──────────────────────────────────────────────────────────
function renderStep1(filterText = "") {
    const leftArea = document.getElementById("left-area");
    if (!leftArea) return;
    leftArea.innerHTML = "";
    
    const isSearching = filterText.length > 0;

    QUARTER_ORDER.forEach(qKey => {
        const animeList = AnimeByQuarter[qKey];
        if (!animeList) return;

        const filteredList = animeList.filter(a => a.title.toLowerCase().includes(filterText.toLowerCase()));
        if (filteredList.length === 0 && isSearching) return;
        
        const targetList = isSearching ? filteredList : animeList;

        const qSection = document.createElement("div");
        qSection.className = "quarter-section";

        const qBtn = document.createElement("button");
        qBtn.className = `quarter-btn ${isSearching ? 'active' : ''}`;
        qBtn.innerHTML = `<span>${qKey}</span> <span>▼</span>`;

        const qContent = document.createElement("div");
        qContent.className = "quarter-content";
        qContent.style.display = isSearching ? "block" : "none";

        qBtn.onclick = () => {
            const isVisible = qContent.style.display === "block";
            qContent.style.display = isVisible ? "none" : "block";
            qBtn.classList.toggle("active", !isVisible);
        };

        DAY_KEYS.forEach(dKey => {
            const dayAnimes = targetList.filter(a => a.day === dKey);
            if (dayAnimes.length === 0) return;

            const dayDiv = document.createElement("div");
            
            const dBtn = document.createElement("button");
            dBtn.className = `day-btn ${isSearching ? 'active' : ''}`;
            dBtn.innerHTML = `${DAY_LABELS[dKey]} <span>▼</span>`;

            const dContent = document.createElement("div");
            dContent.className = "day-content";
            dContent.style.display = isSearching ? "grid" : "none";

            dBtn.onclick = () => {
                const isGrid = dContent.style.display === "grid";
                dContent.style.display = isGrid ? "none" : "grid";
                dBtn.classList.toggle("active", !isGrid);
            };

            dayAnimes.forEach(anime => {
                dContent.appendChild(createCard(anime));
            });

            dayDiv.appendChild(dBtn);
            dayDiv.appendChild(dContent);
            qContent.appendChild(dayDiv);
        });

        qSection.appendChild(qBtn);
        qSection.appendChild(qContent);
        leftArea.appendChild(qSection);
    });
    applyVoteBadges();
}

// 카드 생성 함수
function createCard(anime) {
    const card = document.createElement("div");
    
    const isSelected = nominateState.step === 1 
        ? nominateState.selectedItems.some(a => a.id === anime.id)
        : (nominateState.selectedWinner && nominateState.selectedWinner.id === anime.id);

    card.className = `card ${isSelected ? 'selected' : ''}`;

    card.setAttribute('data-category', nominateState.awardName);
    card.setAttribute('data-anime-id', anime.title);

    const imgPath = `../${anime.thumbnail}`;

    card.innerHTML = `
        <div class="card-selection-rate" style="display:none;">0/0</div>
        <div class="card-badge">${anime.quarter}</div>
        <img src="${imgPath}" onerror="this.src='https://placehold.co/400x600/2f3542/ffffff?text=No+Image'" loading="lazy">
        <div class="card-info">
            <div class="card-title">${anime.title}</div>
            <div class="card-studio">${anime.studio || ''}</div>
        </div>
    `;

    card.onclick = () => handleCardClick(anime, card);
    return card;
}

// 카드 클릭 핸들러
function handleCardClick(anime, cardElement) {
    if (nominateState.step === 1) {
        const idx = nominateState.selectedItems.findIndex(a => a.id === anime.id);
        if (idx > -1) {
            nominateState.selectedItems.splice(idx, 1);
            cardElement.classList.remove('selected');
        } else {
            nominateState.selectedItems.push(anime);
            cardElement.classList.add('selected');
        }
        updatePreview();
    } else {
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        cardElement.classList.add('selected');
        nominateState.selectedWinner = anime;
        
        const awardBtn = document.getElementById("step2-award-btn");
        if(awardBtn) awardBtn.disabled = false;
    }
}

// ──────────────────────────────────────────────────────────
// 3. UI 업데이트 및 프리뷰
// ──────────────────────────────────────────────────────────
function updatePreview() {
    const previewBox = document.getElementById("preview-box");
    const nextBtn = document.getElementById("step1-next-btn");
    
    if(!previewBox) return;
    previewBox.innerHTML = "";
    
    if (nominateState.selectedItems.length === 0) {
        previewBox.innerHTML = `<div style="color:#666; text-align:center; padding-top:20px; font-size:0.85rem;">후보를 선택해주세요</div>`;
        if(nextBtn) nextBtn.disabled = true;
        return;
    }

    nominateState.selectedItems.forEach(anime => {
        const div = document.createElement("div");
        div.className = "preview-item";
        
        div.innerHTML = `
            <div class="preview-title">${anime.title}</div>
            <div class="preview-subtitle">${anime.quarter}</div>
        `;
        
        div.onclick = () => {
            if (nominateState.step === 1) {
                nominateState.selectedItems = nominateState.selectedItems.filter(a => a.id !== anime.id);
                updatePreview();
                
                const searchVal = document.getElementById('search-input')?.value || "";
                renderStep1(searchVal);
            }
        };
        previewBox.appendChild(div);
    });

    if(nextBtn) nextBtn.disabled = nominateState.selectedItems.length === 0;
}

// ──────────────────────────────────────────────────────────
// 4. Step 전환 및 검색
// ──────────────────────────────────────────────────────────
function goStep2() {
    nominateState.step = 2;
    
    toggleElement("nav-home-btn", false);
    toggleElement("step1-next-btn", false);
    toggleElement("step2-back-btn", true);
    toggleElement("step2-award-btn", true);
    
    // ✅ 삭제: 존재 여부 불확실한 "search-container-wrapper" 대상 죽은 코드 제거
    //         (바로 아래 querySelector('.search-container')로 실제 처리됨)
    const searchArea = document.querySelector('.search-container');
    const previewArea = document.getElementById("preview-box");
    
    if(searchArea) searchArea.classList.add("hidden");
    if(previewArea) previewArea.classList.add("hidden");

    const leftArea = document.getElementById("left-area");
    leftArea.innerHTML = "";
    
    const h2 = document.createElement("h2");
    h2.style.cssText = "color:var(--gold); margin-bottom:20px; font-size: 1.5rem; text-align: left;";
    h2.textContent = "최종 후보를 선택하세요";
    leftArea.appendChild(h2);

    const gridDiv = document.createElement("div");
    gridDiv.id = "step2-grid";
    
    nominateState.selectedItems.forEach(anime => {
        gridDiv.appendChild(createCard(anime));
    });
    leftArea.appendChild(gridDiv);
    applyVoteBadges();
}

function goStep1() {
    nominateState.step = 1;
    nominateState.selectedWinner = null;

    toggleElement("nav-home-btn", true);
    toggleElement("step1-next-btn", true);
    toggleElement("step2-back-btn", false);
    toggleElement("step2-award-btn", false);
    
    const searchArea = document.querySelector('.search-container');
    const previewArea = document.getElementById("preview-box");
    
    if(searchArea) searchArea.classList.remove("hidden");
    if(previewArea) previewArea.classList.remove("hidden");

    const awardBtn = document.getElementById("step2-award-btn");
    if(awardBtn) awardBtn.disabled = true;

    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.value = ""; 
    renderStep1();
}

function toggleElement(id, show) {
    const el = document.getElementById(id);
    if(el) {
        if(show) el.classList.remove("hidden");
        else el.classList.add("hidden");
    }
}

// 검색 기능
const searchInput = document.getElementById('search-input');
const autocompleteList = document.getElementById('autocomplete-list');

if(searchInput) {
    searchInput.oninput = function() {
        const val = this.value;
        renderStep1(val);
        
        if(autocompleteList) {
            autocompleteList.innerHTML = '';
            if (!val) return;
            
            // ✅ 수정: AnimeList_2026 → AnimeList
            AnimeList.filter(a => a.title.toLowerCase().includes(val.toLowerCase())).slice(0, 5).forEach(match => {
                const div = document.createElement("div");
                div.textContent = match.title;
                div.onclick = () => {
                    searchInput.value = match.title;
                    autocompleteList.innerHTML = '';
                    renderStep1(match.title);
                };
                autocompleteList.appendChild(div);
            });
        }
    };
}

// ──────────────────────────────────────────────────────────
// 5. 수상 결정 및 저장
// ──────────────────────────────────────────────────────────
function openAwardPopup() {
    const winner = nominateState.selectedWinner;
    if (!winner) return;

    const modalImg = document.getElementById("modal-img");
    if(modalImg) modalImg.src = `../${winner.thumbnail}`;
    
    const modalTitle = document.getElementById("modal-title");
    if(modalTitle) modalTitle.textContent = winner.title;
    
    setText("modal-quarter", winner.quarter);
    
    const directorText = (winner.staff && winner.staff.director) 
        ? winner.staff.director.join(", ") 
        : "정보 없음";
    setText("modal-director", directorText);

    setText("modal-studio", winner.studio || "-");
    
    const modal = document.getElementById("winner-modal");
    if(modal) modal.classList.remove("hidden");
    
    fireConfetti();
    saveAwardResult(winner);
}

function setText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}

function saveAwardResult(winner) {
    const currentResults = ResultStorage.getResults();
    const awardName = nominateState.awardName; 

    const top3Ranks = ["대상", "최우수상", "우수상"];
    const isTop3 = top3Ranks.includes(awardName);
    const finalThumb = winner.thumbnail;

    if (isTop3) {
        const top3Key = "올해의 애니메이션";
        let top3List = currentResults[top3Key];

        if (Array.isArray(top3List)) {
            const targetIndex = top3List.findIndex(item => item.rank === awardName);
            if (targetIndex !== -1) {
                top3List[targetIndex].title = winner.title;
                top3List[targetIndex].thumbnail = finalThumb;
            } else {
                top3List.push({ rank: awardName, title: winner.title, thumbnail: finalThumb });
            }
        } else {
            currentResults[top3Key] = [{ rank: awardName, title: winner.title, thumbnail: finalThumb }];
        }
    } else {
        currentResults[awardName] = { title: winner.title, thumbnail: finalThumb };
    }

    ResultStorage.saveResults(currentResults);
    console.log("Saved:", awardName, winner.title);

    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(nominateState.awardName);
    }
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
// 6. 이벤트 바인딩 및 초기화
// ──────────────────────────────────────────────────────────
const btnNext = document.getElementById("step1-next-btn");
if(btnNext) btnNext.onclick = goStep2;

const btnBack = document.getElementById("step2-back-btn");
if(btnBack) btnBack.onclick = goStep1;

const btnAward = document.getElementById("step2-award-btn");
if(btnAward) btnAward.onclick = openAwardPopup;

const btnHome = document.getElementById("nav-home-btn");
if(btnHome) btnHome.onclick = () => location.href = "../index.html";

const btnGoMain = document.getElementById("go-main-btn");
if(btnGoMain) btnGoMain.onclick = () => location.href = "../index.html";

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

    const categoryRef = window.fbRef(window.fbDB, window.getVotesCategoryPath(nominateState.awardName));

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

// ✅ 수정: renderStep1() 중복 호출 제거 (기존엔 이 지점과 파일 상단 "초기 실행" 두 군데서 호출됨)
waitForFirebaseAndListen();
renderStep1();