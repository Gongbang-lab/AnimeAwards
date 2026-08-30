const studioState = {
    nominees: [],
    finalWinner: null,
    step: 1,   // ✅ currentStep → step (다른 파일들과 통일)
    awardName: ""
};

let cachedVoteData = null;

// ✅ 추가: 시즌(분기) 기준으로 필터링된 스튜디오 목록
// - 각 스튜디오의 works를 선택된 분기에 해당하는 것만 남기고
// - 남은 작품이 하나도 없는 스튜디오는 후보 목록에서 제외
const SeasonFilteredStudioData = (typeof AnimeStudioData !== 'undefined')
    ? AnimeStudioData
        .map(s => ({ ...s, works: (s.works || []).filter(w => SeasonFilter.isInSeason(w)) }))
        .filter(s => s.works.length > 0)
    : [];

document.addEventListener("DOMContentLoaded", () => {
    renderStudioAccordionGroups();
    initSearch();

    const params = new URLSearchParams(window.location.search);

    studioState.awardName = params.get("awardName");
    
    const modalAwardNameEl = document.getElementById("modal-award-name");
    if (modalAwardNameEl) modalAwardNameEl.textContent = `${SeasonFilter.toDisplayAwardName(studioState.awardName)}` + " 부문";

    const stepTitleEl = document.getElementById("step-title");
    if (stepTitleEl) stepTitleEl.innerText = `${SeasonFilter.toDisplayAwardName("올해의 스튜디오 상")} 부문`;

    document.getElementById("nav-home-btn").onclick = () => location.href = "../index.html";
    document.getElementById("step1-next-btn").onclick = goToStep2;
    document.getElementById("step2-back-btn").onclick = goToStep1;
    document.getElementById("step2-award-btn").onclick = handleAwardDecision;
    
    updatePreview();

    waitForFirebaseAndListen();
});

/** 후보 선택 (Step 1과 2 로직 분리) */
function selectStudioCard(event, studioName) {
    // ✅ 수정: AnimeStudioData_2026 → SeasonFilteredStudioData (시즌 필터링 + 별칭 통일)
    const item = SeasonFilteredStudioData.find(s => s.studio === studioName);
    if (!item) return;

    if (studioState.step === 1) {
        const index = studioState.nominees.findIndex(n => n.studio === studioName);
        if (index > -1) {
            studioState.nominees.splice(index, 1);
            event.currentTarget.classList.remove('selected');
        } else {
            studioState.nominees.push(item);
            event.currentTarget.classList.add('selected');
        }
        updatePreview();
    } else {
        document.querySelectorAll('#final-nominees-grid .card').forEach(c => c.classList.remove('selected'));
        event.currentTarget.classList.add('selected');
        studioState.finalWinner = item;
        
        document.getElementById("step2-award-btn").disabled = false;
    }
}

/** 사이드바 Preview Box 업데이트 */
function updatePreview() {
    const pBox = document.getElementById("preview-box");
    const nextBtn = document.getElementById("step1-next-btn");
    
    if (!pBox) return;
    pBox.innerHTML = "";

    if (studioState.nominees.length === 0) {
        pBox.innerHTML = `<div style="color:#666; text-align:center; margin-top:20px;"></div>`;
        nextBtn.disabled = true;
        return;
    }

    nextBtn.disabled = false;
    studioState.nominees.forEach(item => {
        const previewEl = document.createElement("div");
        previewEl.className = "preview-item";
        
        const worksCount = item.works ? item.works.length : 0;
        previewEl.innerHTML = `
            ${item.studio}
            <br><small style="color:#888; font-size:0.75rem;">작품수 ${worksCount}개</small>
        `;
        
        previewEl.onclick = () => {
            studioState.nominees = studioState.nominees.filter(s => s.studio !== item.studio);
            
            renderStudioAccordionGroups();
            updatePreview();
        };
        pBox.appendChild(previewEl);
    });
}

/** Step 2 (최종 선택) 으로 이동 */
function goToStep2() {
    if (studioState.nominees.length === 0) return;
    
    studioState.step = 2;
    studioState.finalWinner = null; 

    document.getElementById("step1-container").classList.add("hidden");
    document.getElementById("step2-container").classList.remove("hidden");
    
    document.getElementById("preview-box").classList.add("hidden");
    document.getElementById("step1-buttons").classList.add("hidden");
    document.getElementById("step2-buttons").classList.remove("hidden");

    const searchArea = document.querySelector('.search-container');
    if (searchArea) searchArea.classList.add("hidden");

    document.getElementById("step-title").innerText = `${SeasonFilter.toDisplayAwardName("올해의 스튜디오 상")} 부문`;
    
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.disabled = true;

    renderFinalNominees();
}

/** Step 1 (후보 선정) 으로 돌아가기 */
function goToStep1() {
    studioState.step = 1;
    studioState.finalWinner = null;

    document.getElementById("step2-container").classList.add("hidden");
    document.getElementById("step1-container").classList.remove("hidden");
    
    document.getElementById("preview-box").classList.remove("hidden");
    document.getElementById("step2-buttons").classList.add("hidden");
    document.getElementById("step1-buttons").classList.remove("hidden");

    const searchArea = document.querySelector('.search-container');
    if (searchArea) searchArea.classList.remove("hidden");

    document.getElementById("step-title").innerText = `${SeasonFilter.toDisplayAwardName("올해의 스튜디오 상")} 부문`;
    
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.disabled = false;
        searchInput.value = "";
    }

    renderStudioAccordionGroups();
    updatePreview();
}

/** Step 2의 선택된 후보 그리드 렌더링 */
function renderFinalNominees() {
    const grid = document.getElementById("final-nominees-grid");
    grid.innerHTML = studioState.nominees.map(item => createStudioCardHTML(item)).join('');

    applyVoteBadges();
}

/** 아코디언 그룹 렌더링 (Step 1) */
function renderStudioAccordionGroups() {
    const container = document.getElementById("accordion-group-container");
    if (!container) return;
    container.innerHTML = "";

    const groups = new Map();
    // ✅ 수정: AnimeStudioData → SeasonFilteredStudioData
    SeasonFilteredStudioData.forEach(item => {
        const count = item.works ? item.works.length : 0;
        if (!groups.has(count)) groups.set(count, []);
        groups.get(count).push(item);
    });

    const sortedCounts = Array.from(groups.keys()).sort((a, b) => b - a);

    sortedCounts.forEach(count => {
        const studios = groups.get(count);
        const groupDiv = document.createElement("div");
        groupDiv.className = "acc-level-1";
        
        groupDiv.innerHTML = `
            <div class="acc-header level-1-header">
                <span>작품 수 ${count}개 스튜디오 <small style="color:#888; font-size:0.9rem; margin-left:10px;">(${studios.length})</small></span>
                <span class="arrow">▼</span>
            </div>
            <div class="acc-content level-1-content">
                <div class="accordion-inner-grid">
                    ${studios.map(studio => createStudioCardHTML(studio)).join('')}
                </div>
            </div>
        `;

        const header = groupDiv.querySelector('.acc-header');
        const content = groupDiv.querySelector('.acc-content');
        
        header.onclick = () => {
            const isOpen = content.classList.contains('open');
            if (isOpen) {
                content.classList.remove('open');
                header.classList.remove('active');
            } else {
                content.classList.add('open');
                header.classList.add('active');
            }
        };
        container.appendChild(groupDiv);
    });

    applyVoteBadges();
}

/** 스튜디오 카드 HTML 공통 생성 함수 */
function createStudioCardHTML(item) {
    const studioImg = `../${item.studio_img}`;
    let isSelected = false;

    if (studioState.step === 1) {
        isSelected = studioState.nominees.some(n => n.studio === item.studio);
    } else {
        isSelected = studioState.finalWinner && studioState.finalWinner.studio === item.studio;
    }

    return `
        <div class="card ${isSelected ? 'selected' : ''}"
             data-category="${studioState.awardName}"
             data-anime-id="${item.studio}"
             onclick="selectStudioCard(event, '${item.studio.replace(/'/g, "\\'")}')">
            <div class="card-selection-rate" style="display:none;">0/0</div>
            <div class="card-badge" onclick="event.stopPropagation(); showWorksModalByName('${item.studio.replace(/'/g, "\\'")}')">작품보기</div>
            <img src="${studioImg}" alt="${item.studio}">
            <div class="card-info">
                <div class="card-title">${item.studio}</div>
            </div>
        </div>
    `;
}

// === 모달 및 수상 관련 로직 ===
function showWorksModalByName(studioName) {
    // ✅ 수정: AnimeStudioData → SeasonFilteredStudioData (모달도 이번 시즌 작품만 표시)
    const item = SeasonFilteredStudioData.find(s => s.studio === studioName);
    if (item) showWorksModal(item);
}

function showWorksModal(item) {
    const modal = document.getElementById("works-modal");
    const leftArea = document.getElementById("works-studio-info");
    const gridBody = document.getElementById("works-grid-body");
    
    const studioImg =  `../${item.studio_img}`;

    leftArea.innerHTML = `
        <img src="${studioImg}" alt="${item.studio}" style="width:100%; max-width:250px; border:2px solid var(--gold); border-radius:10px;">
        <h2 style="color:var(--gold); margin: 20px 0 10px 0;">${item.studio}</h2>
        <p style="color:#888;">총 ${item.works ? item.works.length : 0}개 작품</p>
    `;

    if (!item.works || item.works.length === 0) {
        gridBody.innerHTML = "<p style='color:#666; padding:20px;'>등록된 작품이 없습니다.</p>";
    } else {
        gridBody.innerHTML = item.works.map(work => `
            <div class="work-card">
                <div style="background:#000; width:100%;">
                    <img src="../${work.thumbnail}" alt="${work.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/150x200?text=No+Image'">
                </div>
                <div class="work-card-info">
                    <div class="work-card-title">${work.title}</div>
                </div>
            </div>
        `).join('');
    }
    modal.classList.remove("hidden");
}

function closeWorksModal() {
    document.getElementById("works-modal").classList.add("hidden");
}

function handleAwardDecision() {
    if (!studioState.finalWinner) return;
    saveWinnerToLocal(studioState.finalWinner);
    
    openAwardModal(studioState.finalWinner);
}

function openAwardModal(item) {
    const modal = document.getElementById("winner-modal");
    const modalBody = document.getElementById("modal-body");
    const studioImg = `../${item.studio_img}`;

    const workRows = item.works && item.works.length > 0
        ? item.works.map(work => `
            <div class="work-row">
                <span class="work-title">${work.title}</span>
            </div>`).join('')
        : `<div class="work-row"><span class="work-title" style="color:#666;">제작 정보가 없습니다.</span></div>`;

    modalBody.innerHTML = `
        <div class="winner-layout">
            <div class="winner-left">
                <img src="${studioImg}" alt="${item.studio}">
            </div>
            <div class="winner-right">
                <div class="winner-name-row">
                    <span class="winner-name-label">수상 스튜디오</span>
                    <span class="winner-name-value">${item.studio}</span>
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

function saveWinnerToLocal(item) {
    ResultStorage.saveOne(studioState.awardName, {
        name: item.studio,
        thumbnail: item.studio_img,
        year: '2026'
    });
    fireConfetti();

    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(studioState.awardName);
    }
}

/** 검색 기능 초기화 (스튜디오 이름 + 애니메이션 제목) */
function initSearch() {
    const input = document.getElementById("search-input");
    if (!input) return;

    input.addEventListener("input", (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        
        document.querySelectorAll(".card").forEach(card => {
            const studioName = card.querySelector(".card-title").textContent;
            
            // ✅ 수정: AnimeStudioData → SeasonFilteredStudioData
            const studioData = SeasonFilteredStudioData.find(s => s.studio === studioName);
            
            if (!studioData) return;

            const matchStudio = studioData.studio.toLowerCase().includes(keyword);
            
            const matchWorks = studioData.works && studioData.works.some(work => 
                work.title.toLowerCase().includes(keyword)
            );

            if (matchStudio || matchWorks) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });

        if (keyword !== "") {
            document.querySelectorAll(".acc-content").forEach(content => {
                content.classList.add("open");
            });
            document.querySelectorAll(".acc-header").forEach(header => {
                header.classList.add("active");
            });
        }
    });
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

    const categoryRef = window.fbRef(window.fbDB, window.getVotesCategoryPath(studioState.awardName));

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