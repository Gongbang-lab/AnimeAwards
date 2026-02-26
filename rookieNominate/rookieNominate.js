const rookiestate = {
    selectedCV: null,
    awardName: null
};

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(location.search);
    rookiestate.awardName = params.get("awardName") || "올해의 신인 성우상";

    renderRookieGrid();
    initSearch();

    document.getElementById("btn-home").onclick = () => location.href = "../index.html";
    document.getElementById("btn-award").onclick = () => handleAwardDecision();
});

/**
 * 그리드 렌더링 및 선택 이벤트 통합
 */
function renderRookieGrid() {
    const grid = document.getElementById("rookie-grid");
    if (!grid || typeof RookieCVData === 'undefined') return;

    grid.innerHTML = "";
    const list = Object.values(RookieCVData).sort((a, b) => a.name.localeCompare(b.name));

    list.forEach(cv => {
        const card = document.createElement("div");
        card.className = "card";
        
        const displayImg = cv.cvimg || (cv.characters?.[0]?.charimg) || '';
        const worksCount = cv.characters ? cv.characters.length : 0;

        // card-badge를 항상 나타난 상태로 유지하며 "작품수"로 텍스트 변경
        card.innerHTML = `
            <div class="card-badge">작품수 ${worksCount}</div>
            <img src="${displayImg}" alt="${cv.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x280'">
            <div class="card-info">
                <div class="card-title">${cv.name}</div>
                <div class="card-studio">데뷔: ${cv.debutYear || '2026'}</div>
            </div>
        `;

        // 카드 클릭 시 성우 선택
        card.onclick = (e) => {
            if (e.target.classList.contains('card-badge')) return;
            selectCandidate(cv, card);
        };

        // 배지 클릭 시 작품 목록 팝업 호출
        const badge = card.querySelector('.card-badge');
        badge.onclick = (e) => {
            e.stopPropagation();
            showWorksModal(cv);
        };

        grid.appendChild(card);
    });
}

function showWorksModal(cv) {
    const modal = document.getElementById("works-modal");
    const gridBody = document.getElementById("works-grid-body");
    const leftArea = document.getElementById("works-cv-info");

    // 왼쪽 성우 프로필
    const cvImg = cv.cvimg || (cv.characters?.[0]?.charimg);
    leftArea.innerHTML = `
        <img src="${cvImg}" alt="${cv.name}">
        <h2 style="color:var(--gold); margin: 15px 0 5px 0;">${cv.name}</h2>
        <p style="color:#888; margin-bottom: 20px;">데뷔: ${cv.debutYear}년</p>
    `;

    // 오른쪽 작품 그리드
    if (!cv.characters || cv.characters.length === 0) {
        gridBody.innerHTML = "<p style='color:#666; padding: 20px;'>참여 작품 정보가 없습니다.</p>";
    } else {
        // map으로 생성할 때 각 이미지에 에러 핸들링과 기본 높이 유도
        gridBody.innerHTML = cv.characters.map(char => `
            <div class="work-card">
                <div style="background:#000; width:100%;">
                    <img src="${char.charimg}" alt="${char.charName}" 
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/150x200?text=No+Image'">
                </div>
                <div class="work-card-info">
                    <div class="work-card-title" style="color:#fff; font-weight:bold; font-size:0.9rem; margin-bottom:4px;">${char.animeTitle}</div>
                    <div class="work-card-sub" style="color:var(--gold); font-size:0.8rem;">${char.charName} 역</div>
                    <div class="work-card-year" style="color:#666; font-size:0.7rem; margin-top:2px;">${char.year}년</div>
                </div>
            </div>
        `).join('');
    }

    modal.classList.remove("hidden");
}

function closeWorksModal() {
    document.getElementById("works-modal").classList.add("hidden");
}
/**
 * 후보 선택 로직 (통합본)
 */
function selectCandidate(cv, cardElement) {
    // 1. 모든 카드 선택 해제 및 현재 카드 강조
    document.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
    cardElement.classList.add("selected");

    // 2. 상태 저장
    rookiestate.selectedCV = cv;

    // 4. 수상 결정 버튼 활성화
    document.getElementById("btn-award").disabled = false;
}

/**
 * 수상 결정 처리
 */
function handleAwardDecision() {
    const cv = rookiestate.selectedCV;
    if (!cv) return;

    saveWinnerToLocal(cv);
    fireConfetti();
    openAwardModal(cv);
}

/**
 * 모달 오픈 및 내용 주입
 */
function openAwardModal(cv) {
    const modal = document.getElementById("winner-modal");
    const modalBody = document.getElementById("modal-body");
    const displayImg = cv.cvimg || (cv.characters?.[0]?.charimg);

    modalBody.innerHTML = `
        <div class="winner-layout">
            <div class="winner-left">
                <img src="${displayImg}" alt="${cv.name}">
            </div>
            <div class="winner-right">
                <h2 id="modal-title">${cv.name}</h2>
                <div class="info-row">
                    <span class="info-label">수상 부문</span>
                    <span class="info-value">${rookiestate.awardName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">데뷔 연도</span>
                    <span class="info-value">${cv.debutYear || '2026'}</span>
                </div>
                <button class="gold-btn" style="margin-top:auto; width:100%;" onclick="location.href='../index.html'">
                    확인 및 메인으로
                </button>
            </div>
        </div>
    `;
    modal.classList.remove("hidden");
}

function saveWinnerToLocal(cv) {
    let results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results[rookiestate.awardName] = {
        name: cv.name,
        thumbnail: cv.cvimg || cv.characters?.[0]?.charimg,
        debutYear: cv.debutYear || '2026'
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));
}

function initSearch() {
    const input = document.getElementById("search-input");
    input.addEventListener("input", (e) => {
        const keyword = e.target.value.toLowerCase();
        const cards = document.querySelectorAll(".card");
        
        cards.forEach(card => {
            const name = card.querySelector(".card-title").textContent.toLowerCase();
            card.style.display = name.includes(keyword) ? "block" : "none";
        });
    });
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