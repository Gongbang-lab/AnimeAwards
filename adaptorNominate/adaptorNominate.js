// 1. 초기 상태 설정
const nominateState = {
    step: 1,
    selectedItems: [],
    selectedWinner: null,
    awardName: "베스트 각색상"
};

// [중요] 데이터 맵핑 수정 (Q1 -> 1분기 등)
const QUARTER_MAP = {
    "Q1": "1분기",
    "Q2": "2분기",
    "Q3": "3분기",
    "Q4": "4분기",
    "Anomaly": "변칙 편성",
    "Web": "웹"
};

const DAY_LABELS = {
    "Mondays": "월요일", "Tuesdays": "화요일", "Wednesdays": "수요일", "Thursdays": "목요일",
    "Fridays": "금요일", "Saturdays": "토요일", "Sundays": "일요일",
    "Anomaly": "변칙 편성", "Web": "웹"
};

const DAY_KEYS = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays", "Anomaly", "Web"];

// [수정] 데이터 변수명을 AnimeAdaptorData로 일치시킴
const sourceData = (typeof AnimeAdaptorData !== 'undefined') ? AnimeAdaptorData : [];

// [수정] 분기별 그룹화 로직 (Q1, Q2 기준)
const AnimeByQuarter = sourceData.reduce((acc, anime) => {
    const q = anime.quarter || "Q1"; 
    if (!acc[q]) acc[q] = [];
    acc[q].push(anime);
    return acc;
}, {});

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    nominateState.theme = params.get("theme");
    nominateState.awardName = params.get("awardName");
    
    const modalAwardNameEl = document.getElementById("modal-award-name");
    if (modalAwardNameEl) modalAwardNameEl.textContent = nominateState.awardName;
    
    const stepTitleEl = document.getElementById("step-title");
    if (stepTitleEl) stepTitleEl.textContent = `${nominateState.awardName} 부문`;

    // 검색 입력 이벤트
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.oninput = function() {
            const val = this.value;
            renderStep1(val);
            updateAutocomplete(val);
        };
    }

    // 버튼 클릭 이벤트
    document.getElementById("step1-next-btn").onclick = goStep2;
    document.getElementById("step2-back-btn").onclick = goStep1;
    document.getElementById("step2-award-btn").onclick = openAwardPopup;
    document.getElementById("nav-home-btn").onclick = () => location.href = "../main/main.html";
    document.getElementById("go-main-btn").onclick = () => location.href = "../main/main.html";

    renderStep1();
});

// ──────────────────────────────────────────────────────────
// 2. Step 1: 렌더링 (아코디언 생성)
// ──────────────────────────────────────────────────────────
function renderStep1(filterText = "") {
    const leftArea = document.getElementById("left-area");
    if (!leftArea) return;
    leftArea.innerHTML = "";
    
    const isSearching = filterText.length > 0;

    // 데이터에 존재하는 분기들만 루프 (Q1, Q2...)
    Object.keys(AnimeByQuarter).sort().forEach(qKey => {
        const animeList = AnimeByQuarter[qKey];
        
        const filteredList = animeList.filter(a => a.title.toLowerCase().includes(filterText.toLowerCase()));
        if (filteredList.length === 0 && isSearching) return;
        
        const targetList = isSearching ? filteredList : animeList;

        const qSection = document.createElement("div");
        qSection.className = "quarter-section";

        const qBtn = document.createElement("button");
        qBtn.className = `quarter-btn ${isSearching ? 'active' : ''}`;
        // QUARTER_MAP을 이용해 Q1을 '1분기'로 표시
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
            // 중요: CSS 그리드 유지를 위해 display: grid 사용
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
}

function createCard(anime) {
    const card = document.createElement("div");
    const isSelected = nominateState.step === 1 
        ? nominateState.selectedItems.some(a => a.id === anime.id)
        : (nominateState.selectedWinner && nominateState.selectedWinner.id === anime.id);

    card.className = `card ${isSelected ? 'selected' : ''}`;

    // [수정] 데이터의 thumbnail 경로를 그대로 사용
    card.innerHTML = `
        <div class="card-badge">${QUARTER_MAP[anime.quarter] || anime.quarter}</div>
        <img src="${anime.thumbnail}" onerror="this.src='https://placehold.co/400x600/2f3542/ffffff?text=No+Image'">
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
        // 성우 페이지와 일관된 레이아웃 (제목 + 제작사)
        item.innerHTML = `
            ${anime.title}
            <br><small style="color:#888; font-size:0.75rem;">${anime.studio || ''}</small>
        `;
        
        item.onclick = () => {
            // 선택 해제 로직
            nominateState.selectedItems = nominateState.selectedItems.filter(a => a.id !== anime.id);
            
            // 메인 화면의 카드 클래스 제거 (ID 기반 매칭)
            renderStep1(document.getElementById('search-input').value);
            updatePreview();
        };
        pBox.appendChild(item);
    });
}

function goStep2() {
    nominateState.step = 2;
    document.getElementById("step-title").textContent = "베스트 각색상 부문";
    toggleElement("nav-home-btn", false);
    toggleElement("step1-next-btn", false);
    toggleElement("step2-back-btn", true);
    toggleElement("step2-award-btn", true);
    const leftArea = document.getElementById("left-area");
    leftArea.innerHTML = `<h2 style="color:var(--gold); margin-bottom:20px;">최종 수상작을 선택하세요</h2><div id="step2-grid"></div>`;
    const gridDiv = document.getElementById("step2-grid");
    nominateState.selectedItems.forEach(anime => gridDiv.appendChild(createCard(anime)));
}

function goStep1() {
    nominateState.step = 1;
    nominateState.selectedWinner = null;
    document.getElementById("step-title").textContent = "";
    toggleElement("nav-home-btn", true);
    toggleElement("step1-next-btn", true);
    toggleElement("step2-back-btn", false);
    toggleElement("step2-award-btn", false);
    renderStep1();
}

function toggleElement(id, show) {
    const el = document.getElementById(id);
    if(el) el.classList.toggle("hidden", !show);
}

const searchInput = document.getElementById('search-input');
const autocompleteList = document.getElementById('autocomplete-list');
if(searchInput) {
    searchInput.oninput = function() {
        const val = this.value;
        renderStep1(val);
        autocompleteList.innerHTML = '';
        if (!val) return;
        sourceData.filter(a => a.title.toLowerCase().includes(val.toLowerCase())).slice(0, 5).forEach(match => {
            const div = document.createElement("div");
            div.textContent = match.title;
            div.onclick = () => { searchInput.value = match.title; autocompleteList.innerHTML = ''; renderStep1(match.title); };
            autocompleteList.appendChild(div);
        });
    };
}

function openAwardPopup() {
    const winner = nominateState.selectedWinner;
    if (!winner) return;
    document.getElementById("modal-img").src = winner.thumbnail;
    document.getElementById("modal-title").textContent = winner.title;
    document.getElementById("modal-quarter").textContent = QUARTER_MAP[winner.quarter] || winner.quarter;
    document.getElementById("modal-studio").textContent = winner.studio || "-";
    document.getElementById("modal-adaptor").textContent = winner.adaptor ? winner.adaptor.join(", ") : "-";
    document.getElementById("winner-modal").classList.remove("hidden");
    fireConfetti();
    
    const results = JSON.parse(localStorage.getItem("anime_awards_result"));
    results[nominateState.awardName] = { title: winner.title, thumbnail: winner.thumbnail };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));
}

// 기존 fireConfetti 함수를 아래 내용으로 교체하세요.
function fireConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;

    // 전용 캔버스를 사용하는 폭죽 인스턴스 생성
    const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
    });

    const duration = 3000;
    const animationEnd = Date.now() + duration;

    (function frame() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return;

        // 왼쪽 아래에서 쏘아 올림
        myConfetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#d4af37', '#ffffff', '#aa8a2e']
        });

        // 오른쪽 아래에서 쏘아 올림
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

renderStep1();