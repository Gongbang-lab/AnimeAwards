// 1. 초기 상태 설정
const nominateState = {
    step: 1,
    selectedItems: [],
    selectedWinner: null,
    awardName: "베스트 각색상"
};

const QUARTER_MAP = {
    "Q1": "1분기", "Q2": "2분기", "Q3": "3분기", "Q4": "4분기",
    "Anomaly": "변칙 편성", "Web": "웹"
};

const DAY_LABELS = {
    "Mondays": "월요일", "Tuesdays": "화요일", "Wednesdays": "수요일", "Thursdays": "목요일",
    "Fridays": "금요일", "Saturdays": "토요일", "Sundays": "일요일",
    "Anomaly": "변칙 편성", "Web": "웹"
};

const DAY_KEYS = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays", "Anomaly", "Web"];

const sourceData = (typeof AnimeAdaptorData !== 'undefined') ? AnimeAdaptorData : [];

const AnimeByQuarter = sourceData.reduce((acc, anime) => {
    const q = anime.quarter || "Q1";
    if (!acc[q]) acc[q] = [];
    acc[q].push(anime);
    return acc;
}, {});

// ✅ DB 데이터 캐시 (카드 렌더링 후 즉시 뱃지 적용용)
let cachedVoteData = null;

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    nominateState.theme = params.get("theme");
    nominateState.awardName = params.get("awardName");

    const modalAwardNameEl = document.getElementById("modal-award-name");
    if (modalAwardNameEl) modalAwardNameEl.textContent = nominateState.awardName;

    const stepTitleEl = document.getElementById("step-title");
    if (stepTitleEl) stepTitleEl.textContent = `${nominateState.awardName} 부문`;

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.oninput = function() {
            const val = this.value;
            renderStep1(val);
            updateAutocomplete(val);
        };
    }

    document.getElementById("step1-next-btn").onclick = goStep2;
    document.getElementById("step2-back-btn").onclick = goStep1;
    document.getElementById("step2-award-btn").onclick = openAwardPopup;
    document.getElementById("nav-home-btn").onclick = () => location.href = "../index.html";
    document.getElementById("go-main-btn").onclick = () => location.href = "../index.html";

    renderStep1();
    waitForFirebaseAndListen();
});

// ──────────────────────────────────────────────────────────
// 2. Step 1: 렌더링
// ──────────────────────────────────────────────────────────
function renderStep1(filterText = "") {
    const leftArea = document.getElementById("left-area");
    if (!leftArea) return;
    leftArea.innerHTML = "";

    const isSearching = filterText.length > 0;

    Object.keys(AnimeByQuarter).sort().forEach(qKey => {
        const animeList = AnimeByQuarter[qKey];
        const filteredList = animeList.filter(a => a.title.toLowerCase().includes(filterText.toLowerCase()));
        if (filteredList.length === 0 && isSearching) return;

        const targetList = isSearching ? filteredList : animeList;

        const qSection = document.createElement("div");
        qSection.className = "quarter-section";

        const qBtn = document.createElement("button");
        qBtn.className = `quarter-btn ${isSearching ? 'active' : ''}`;
        qBtn.innerHTML = `<span>${QUARTER_MAP[qKey] || qKey}</span> <span>▼</span>`;

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

    // ✅ 렌더링 완료 후 캐시 데이터로 즉시 뱃지 적용
    applyVoteBadges();
}

function createCard(anime) {
    const card = document.createElement("div");
    const isSelected = nominateState.step === 1
        ? nominateState.selectedItems.some(a => a.id === anime.id)
        : (nominateState.selectedWinner && nominateState.selectedWinner.id === anime.id);

    card.className = `card ${isSelected ? 'selected' : ''}`;

    // ✅ sanitizeKey 없이 원본값 그대로 사용
    card.setAttribute('data-category', nominateState.awardName);
    card.setAttribute('data-anime-id', anime.title);

    card.innerHTML = `
        <div class="card-selection-rate" style="display:none;">0/0</div>
        <div class="card-badge">${QUARTER_MAP[anime.quarter] || anime.quarter}</div>
        <img src="../${anime.thumbnail}" onerror="this.src='https://placehold.co/400x600/2f3542/ffffff?text=No+Image'">
        <div class="card-info">
            <div class="card-title">${anime.title}</div>
            <div class="card-studio">${anime.studio || ''}</div>
        </div>
    `;

    card.onclick = () => handleCardClick(anime, card);
    return card;
}

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
        document.getElementById("step2-award-btn").disabled = false;
    }
}

function updatePreview() {
    const pBox = document.getElementById("preview-box");
    const nextBtn = document.getElementById("step1-next-btn");

    if (!pBox) return;
    pBox.innerHTML = "";

    if (nominateState.selectedItems.length === 0) {
        pBox.innerHTML = `<div style="color:#666; text-align:center; margin-top:20px;">선택된 후보가 없습니다.</div>`;
        nextBtn.disabled = true;
        return;
    }

    nextBtn.disabled = false;
    nominateState.selectedItems.forEach(anime => {
        const item = document.createElement("div");
        item.className = "preview-item";
        item.innerHTML = `
            ${anime.title}
            <br><small style="color:#888; font-size:0.75rem;">${anime.studio || ''}</small>
        `;
        item.onclick = () => {
            nominateState.selectedItems = nominateState.selectedItems.filter(a => a.id !== anime.id);
            renderStep1(document.getElementById('search-input').value);
            updatePreview();
        };
        pBox.appendChild(item);
    });
}

function goStep2() {
    nominateState.step = 2;

    document.getElementById("step-title").textContent = `${nominateState.awardName} 부문`;

    toggleElement("nav-home-btn", false);
    toggleElement("step1-next-btn", false);
    toggleElement("step2-back-btn", true);
    toggleElement("step2-award-btn", true);

    const searchArea = document.querySelector('.search-container');
    const previewArea = document.getElementById("preview-box");
    if (searchArea) searchArea.classList.add("hidden");
    if (previewArea) previewArea.classList.add("hidden");

    const leftArea = document.getElementById("left-area");
    leftArea.innerHTML = `
        <h2 style="color:var(--gold); margin-bottom:20px; font-size: 1.5rem; text-align: left;">최종 수상작을 선택하세요</h2>
        <div id="step2-grid"></div>
    `;

    const gridDiv = document.getElementById("step2-grid");
    nominateState.selectedItems.forEach(anime => {
        gridDiv.appendChild(createCard(anime));
    });

    // ✅ Step2 카드에도 즉시 뱃지 적용
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
    if (searchArea) searchArea.classList.remove("hidden");
    if (previewArea) previewArea.classList.remove("hidden");

    const awardBtn = document.getElementById("step2-award-btn");
    if (awardBtn) awardBtn.disabled = true;

    renderStep1();
}

function toggleElement(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", !show);
}

const searchInput = document.getElementById('search-input');
const autocompleteList = document.getElementById('autocomplete-list');
if (searchInput) {
    searchInput.oninput = function() {
        const val = this.value;
        renderStep1(val);
        autocompleteList.innerHTML = '';
        if (!val) return;
        sourceData.filter(a => a.title.toLowerCase().includes(val.toLowerCase())).slice(0, 5).forEach(match => {
            const div = document.createElement("div");
            div.textContent = match.title;
            div.onclick = () => {
                searchInput.value = match.title;
                autocompleteList.innerHTML = '';
                renderStep1(match.title);
            };
            autocompleteList.appendChild(div);
        });
    };
}

function openAwardPopup() {
    const winner = nominateState.selectedWinner;
    if (!winner) return;

    document.getElementById("modal-img").src = `../${winner.thumbnail}`;
    document.getElementById("modal-title").textContent = winner.title;
    document.getElementById("modal-quarter").textContent = QUARTER_MAP[winner.quarter] || winner.quarter;
    document.getElementById("modal-studio").textContent = winner.studio || "-";
    document.getElementById("modal-adaptor").textContent = winner.adaptor ? winner.adaptor.join(", ") : "-";
    document.getElementById("winner-modal").classList.remove("hidden");
    fireConfetti();

    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results[nominateState.awardName] = { title: winner.title, thumbnail: winner.thumbnail };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));

    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(nominateState.awardName);
    } else {
        console.error("submitSingleAwardToDB 없음 - firebase_service.js 로드 확인 필요");
    }
}

function fireConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
    const animationEnd = Date.now() + 3000;

    (function frame() {
        if (Date.now() >= animationEnd) return;
        myConfetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors: ['#d4af37', '#ffffff', '#aa8a2e'] });
        myConfetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors: ['#d4af37', '#ffffff', '#aa8a2e'] });
        requestAnimationFrame(frame);
    }());
}

// ──────────────────────────────────────────────────────────
// Firebase 실시간 득표율 뱃지
// ──────────────────────────────────────────────────────────

// ✅ 현재 화면 카드에 캐시 데이터로 뱃지 적용
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

// ✅ Firebase 리스너 — 부문별 경로만 구독, 데이터 캐싱
function listenToVoteRates() {
    if (!window.fbOnValue || !window.fbDB) return;

    const categoryRef = window.fbRef(window.fbDB, `votes/categories/${nominateState.awardName}`);

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

waitForFirebaseAndListen();
renderStep1();