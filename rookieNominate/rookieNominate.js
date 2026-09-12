const rookiestate = {
    selectedCV: null,
    awardName: null
};

let cachedVoteData = null;

// top30 / 31~50 후보군 상태 관리
let allRookieData = [];          // 전체 정렬된 리스트 (참고용)
let rookiePoolCandidates = [];   // 31~50위 중 아직 메인 페이지에 추가되지 않은 후보군
let poolSelectedNames = new Set(); // 후보군 모달에서 체크된 이름

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(location.search);
    rookiestate.awardName = params.get("awardName") || "올해의 신인 성우상";

    renderRookieGrid();
    initSearch();
    showCriteriaModal();

    document.getElementById("btn-home").onclick = () => location.href = "../index.html";
    document.getElementById("btn-award").onclick = () => handleAwardDecision();

    document.getElementById("btn-candidate-pool").onclick = () => openCandidatePoolModal();
    document.getElementById("btn-candidate-pool-add").onclick = () => handleCandidatePoolAdd();
    document.getElementById("btn-candidate-pool-close").onclick = () => closeCandidatePoolModal();

    waitForFirebaseAndListen();
});


function showCriteriaModal() {
    document.getElementById("criteria-modal").classList.remove("hidden");
}

function closeCriteriaModal() {
    document.getElementById("criteria-modal").classList.add("hidden");
}

/**
 * 그리드 렌더링
 * - score(또는 rank) 기준 상위 30명만 카드로 렌더링
 * - 31~50위는 rookiePoolCandidates에 보관만 해두고, "후보군" 모달에서 선택적으로 추가
 */
function renderRookieGrid() {
    const grid = document.getElementById("rookie-grid");
    if (!grid || typeof RookieCVData_2026 === 'undefined') return;

    grid.innerHTML = "";

    // rank 기준 오름차순 정렬(1위가 가장 먼저) - rank 없으면 score 내림차순으로 대체
    allRookieData = Object.values(RookieCVData_2026).sort((a, b) => {
        if (a.rank != null && b.rank != null) return a.rank - b.rank;
        return (b.score || 0) - (a.score || 0);
    });

    const top30 = allRookieData.slice(0, 30);
    rookiePoolCandidates = allRookieData.slice(30, 70);

    // 카드는 이름순 정렬 유지 (기존 UX와 동일)
    const cardList = [...top30].sort((a, b) => a.name.localeCompare(b.name));
    cardList.forEach(cv => grid.appendChild(createRookieCard(cv)));

    applyVoteBadges();
}

/**
 * 성우 카드 DOM 생성 (초기 렌더링과 "후보군 추가하기"에서 공용으로 사용)
 */
function createRookieCard(cv) {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute('data-category', rookiestate.awardName);
    card.setAttribute('data-anime-id', cv.name);

    const displayImg = `../${cv.cvimg}`;
    const worksCount = cv.characters ? cv.characters.length : 0;

    // ✅ innerHTML 대신 DOM 직접 생성으로 변경 (innerHTML 덮어쓰기 문제 방지)
    const rateBadge = document.createElement("div");
    rateBadge.className = "card-selection-rate";
    rateBadge.style.display = "none";
    rateBadge.textContent = "0/0";

    const cardBadge = document.createElement("div");
    cardBadge.className = "card-badge";
    cardBadge.textContent = `작품수 ${worksCount}`;
    cardBadge.onclick = (e) => {
        e.stopPropagation();
        showWorksModal(cv);
    };

    const img = document.createElement("img");
    img.src = displayImg;
    img.alt = cv.name;
    img.loading = "lazy";
    img.onerror = () => { img.src = 'https://via.placeholder.com/200x280'; };

    const cardInfo = document.createElement("div");
    cardInfo.className = "card-info";
    cardInfo.innerHTML = `
        <div class="card-title">${cv.name}</div>
        <div class="card-studio">데뷔: ${cv.debutYear || '2026'}</div>
    `;

    card.appendChild(rateBadge);
    card.appendChild(cardBadge);
    card.appendChild(img);
    card.appendChild(cardInfo);

    card.onclick = (e) => {
        if (e.target.classList.contains('card-badge')) return;
        selectCandidate(cv, card);
    };

    return card;
}

/**
 * "후보군" 모달 오픈
 */
function openCandidatePoolModal() {
    renderCandidatePoolTable();
    document.getElementById("candidate-pool-modal").classList.remove("hidden");
}

/**
 * 후보군 테이블(체크박스 / 이름 / 총점 / 자세히보기) 렌더링
 */
function renderCandidatePoolTable() {
    const tbody = document.getElementById("candidate-pool-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (rookiePoolCandidates.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="candidate-pool-empty">후보군이 비어 있습니다.</td></tr>`;
        return;
    }

    rookiePoolCandidates.forEach(cv => {
        const tr = document.createElement("tr");
        tr.setAttribute('data-anime-id', cv.name);
        if (poolSelectedNames.has(cv.name)) tr.classList.add('row-selected');

        // 체크박스
        const tdCheck = document.createElement("td");
        tdCheck.className = "col-check";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = poolSelectedNames.has(cv.name);
        checkbox.onchange = () => {
            if (checkbox.checked) {
                poolSelectedNames.add(cv.name);
                tr.classList.add('row-selected');
            } else {
                poolSelectedNames.delete(cv.name);
                tr.classList.remove('row-selected');
            }
        };
        tdCheck.appendChild(checkbox);

        // 이름
        const tdName = document.createElement("td");
        tdName.textContent = cv.name;

        // 총 점수
        const tdScore = document.createElement("td");
        tdScore.className = "col-score";
        tdScore.textContent = cv.score ?? '-';

        // 자세히 보기 (card-badge와 동일 기능)
        const tdDetail = document.createElement("td");
        tdDetail.className = "col-detail";
        const detailBtn = document.createElement("button");
        detailBtn.className = "btn-detail-small";
        detailBtn.textContent = "자세히 보기";
        detailBtn.onclick = (e) => {
            e.stopPropagation();
            showWorksModal(cv);
        };
        tdDetail.appendChild(detailBtn);

        tr.appendChild(tdCheck);
        tr.appendChild(tdName);
        tr.appendChild(tdScore);
        tr.appendChild(tdDetail);

        tbody.appendChild(tr);
    });
}

/**
 * 체크된 후보군을 메인 페이지 카드로 추가
 */
function handleCandidatePoolAdd() {
    if (poolSelectedNames.size === 0) return;

    const grid = document.getElementById("rookie-grid");
    const toAdd = rookiePoolCandidates.filter(cv => poolSelectedNames.has(cv.name));

    toAdd.forEach(cv => {
        grid.appendChild(createRookieCard(cv));
    });

    // 추가된 후보는 후보군 목록에서 제거
    rookiePoolCandidates = rookiePoolCandidates.filter(cv => !poolSelectedNames.has(cv.name));
    poolSelectedNames.clear();

    renderCandidatePoolTable();
    applyVoteBadges();
}

/**
 * 후보군 모달 닫기 - 체크/선택 상태를 모두 초기화하고 메인 페이지로 복귀
 */
function closeCandidatePoolModal() {
    poolSelectedNames.clear();
    document.querySelectorAll("#candidate-pool-table-body tr").forEach(tr => {
        tr.classList.remove('row-selected');
        const cb = tr.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = false;
    });
    document.getElementById("candidate-pool-modal").classList.add("hidden");
}

function showWorksModal(cv) {
    const modal = document.getElementById("works-modal");
    const gridBody = document.getElementById("works-grid-body");
    const leftArea = document.getElementById("works-cv-info");

    // 왼쪽 성우 프로필 + 점수/스탯 정보
    const cvImg = `../${cv.cvimg}`;
    const sb = cv.scoreBreakdown || {};
    const st = cv.stats || {};

    leftArea.innerHTML = `
        <img src="${cvImg}" alt="${cv.name}">
        <h2 style="color:var(--gold); margin: 15px 0 5px 0;">${cv.name}</h2>
        <p style="color:#888; margin-bottom: 15px;">데뷔: ${cv.debutYear}년</p>

        <div class="cv-score-breakdown">
            <h3 class="cv-info-subtitle">점수 breakdown</h3>
            <div class="score-row"><span>경력 (career)</span><span>${sb.career ?? '-'}</span></div>
            <div class="score-row"><span>전체 작품수 (totalWorks)</span><span>${sb.totalWorks ?? '-'}</span></div>
            <div class="score-row"><span>당해 활동 작품수 (currentYearWorks)</span><span>${sb.currentYearWorks ?? '-'}</span></div>
            <div class="score-row"><span>메인 역할 (mainRole)</span><span>${sb.mainRole ?? '-'}</span></div>
            <div class="score-row"><span>최근 성장세 (recentGrowth)</span><span>${sb.recentGrowth ?? '-'}</span></div>
        </div>

        <div class="cv-stats">
            <h3 class="cv-info-subtitle">활동 통계</h3>
            <div class="stat-row"><span>전체 작품수</span><span>${st.totalWorks ?? '-'}</span></div>
            <div class="stat-row"><span>당해 작품수</span><span>${st.currentYearWorks ?? '-'}</span></div>
            <div class="stat-row"><span>메인 작품수</span><span>${st.mainWorks ?? '-'}</span></div>
            <div class="stat-row"><span>서브 작품수</span><span>${st.supportingWorks ?? '-'}</span></div>
            <div class="stat-row"><span>활동 연차</span><span>${st.yearsActive ?? '-'}</span></div>
        </div>
    `;

    // 오른쪽 작품 그리드
    if (!cv.characters || cv.characters.length === 0) {
        gridBody.innerHTML = "<p style='color:#666; padding: 20px;'>참여 작품 정보가 없습니다.</p>";
    } else {
        gridBody.innerHTML = cv.characters.map(char => `
            <div class="work-card">
                <div style="background:#000; width:100%;">
                    <img src="../${char.charimg}" alt="${char.charName}" 
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
    const displayImg = `../${cv.cvimg}`;

    const workRows = cv.characters && cv.characters.length > 0
        ? cv.characters.map(char => `
            <div class="work-row">
                <span class="work-title">${char.animeTitle}</span>
                <span class="work-role">${char.charName} 역</span>
            </div>`).join('')
        : `<div class="work-row"><span class="work-title" style="color:#666;">참여 작품 정보가 없습니다.</span></div>`;

    modalBody.innerHTML = `
        <div class="winner-layout">
            <div class="winner-left">
                <img src="${displayImg}" alt="${cv.name}">
            </div>
            <div class="winner-right">
                <div class="winner-name-row" style="border-bottom: 2px solid var(--gold); margin-bottom: 15px; padding-bottom: 15px;">
                    <span class="winner-name-label">수상자</span>
                    <span class="winner-name-value">${cv.name}</span>
                </div>
                <div class="work-list">${workRows}</div>
            <div class="modal-footer">
                <button class="gold-btn" onclick="location.href='../index.html'">확인 및 메인으로</button>
            </div>
            </div>
        </div>
        
    `;

    modal.classList.remove("hidden");
}

function saveWinnerToLocal(cv) {
    ResultStorage.saveOne(rookiestate.awardName, {
        name: cv.name,
        thumbnail: cv.cvimg,
        debutYear: cv.debutYear || '2026'
    });
    
    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(rookiestate.awardName);
    }
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

    const categoryRef = window.fbRef(window.fbDB, window.getVotesCategoryPath(rookiestate.awardName));

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