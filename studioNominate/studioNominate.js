const studioState = {
    nominees: [],       // Step 1에서 선택된 후보들 (다중)
    finalWinner: null,  // Step 2에서 선택된 최종 1인
    currentStep: 1,
    awardName: ""
};

document.addEventListener("DOMContentLoaded", () => {
    renderStudioAccordionGroups();
    initSearch();

    const params = new URLSearchParams(window.location.search);

    studioState.awardName = params.get("awardName");
    
    const modalAwardNameEl = document.getElementById("modal-award-name");
    if (modalAwardNameEl) modalAwardNameEl.textContent = studioState.awardName;

    // 변경된 버튼 ID로 이벤트 연결
    document.getElementById("nav-home-btn").onclick = () => location.href = "../index.html";
    document.getElementById("step1-next-btn").onclick = goToStep2;
    document.getElementById("step2-back-btn").onclick = goToStep1;
    document.getElementById("step2-award-btn").onclick = handleAwardDecision;
    
    updatePreview(); // 초기 로드 시 미리보기 영역 초기화
});

/** 후보 선택 (Step 1과 2 로직 분리) */
function selectStudioCard(event, studioName) {
    const item = AnimeStudioData.find(s => s.studio === studioName);
    if (!item) return;

    if (studioState.currentStep === 1) {
        // Step 1: 다중 선택 (토글) - 최대 제한 없음
        const index = studioState.nominees.findIndex(n => n.studio === studioName);
        if (index > -1) {
            studioState.nominees.splice(index, 1);
            event.currentTarget.classList.remove('selected');
        } else {
            studioState.nominees.push(item);
            event.currentTarget.classList.add('selected');
        }
        updatePreview(); // 함수명 변경 적용
    } else {
        // Step 2: 단일 선택 (최종 우승)
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

    // 후보가 없을 때
    if (studioState.nominees.length === 0) {
        pBox.innerHTML = `<div style="color:#666; text-align:center; margin-top:20px;"></div>`;
        nextBtn.disabled = true;
        return;
    }

    // 후보가 있을 때
    nextBtn.disabled = false;
    studioState.nominees.forEach(item => {
        const previewEl = document.createElement("div");
        previewEl.className = "preview-item";
        
        // 스튜디오 데이터에 맞게 제목 및 작품 수 렌더링
        const worksCount = item.works ? item.works.length : 0;
        previewEl.innerHTML = `
            ${item.studio}
            <br><small style="color:#888; font-size:0.75rem;">작품수 ${worksCount}개</small>
        `;
        
        previewEl.onclick = () => {
            // 선택 해제 로직
            studioState.nominees = studioState.nominees.filter(s => s.studio !== item.studio);
            
            // 메인 화면 렌더링 갱신 (선택된 카드 클래스 재계산)
            renderStudioAccordionGroups();
            updatePreview();
        };
        pBox.appendChild(previewEl);
    });
}

/** Step 2 (최종 선택) 으로 이동 */
function goToStep2() {
    if (studioState.nominees.length === 0) return;
    
    studioState.currentStep = 2;
    studioState.finalWinner = null; 

    // 화면 전환
    document.getElementById("step1-container").classList.add("hidden");
    document.getElementById("step2-container").classList.remove("hidden");
    
    // 사이드바 요소 전환
    document.getElementById("preview-box").classList.add("hidden");
    document.getElementById("step1-buttons").classList.add("hidden");
    document.getElementById("step2-buttons").classList.remove("hidden");

    document.getElementById("step-title").innerText = "올해의 스튜디오 상 부문";
    document.getElementById("search-input").disabled = true;

    renderFinalNominees();
}

/** Step 1 (후보 선정) 으로 돌아가기 */
function goToStep1() {
    studioState.currentStep = 1;
    studioState.finalWinner = null;

    // 화면 전환
    document.getElementById("step2-container").classList.add("hidden");
    document.getElementById("step1-container").classList.remove("hidden");
    
    // 사이드바 요소 전환
    document.getElementById("preview-box").classList.remove("hidden");
    document.getElementById("step2-buttons").classList.add("hidden");
    document.getElementById("step1-buttons").classList.remove("hidden");

    document.getElementById("step-title").innerText = "올해의 스튜디오 상 부문"
    document.getElementById("search-input").disabled = false;

    renderStudioAccordionGroups();
    updatePreview();
}

/** Step 2의 선택된 후보 그리드 렌더링 */
function renderFinalNominees() {
    const grid = document.getElementById("final-nominees-grid");
    // Step 1에서 선택한 후보들을 기반으로 카드를 생성
    grid.innerHTML = studioState.nominees.map(item => createStudioCardHTML(item)).join('');
}

/** 아코디언 그룹 렌더링 (Step 1) */
function renderStudioAccordionGroups() {
    const container = document.getElementById("accordion-group-container");
    if (!container) return;
    container.innerHTML = "";

    const groups = new Map();
    AnimeStudioData.forEach(item => {
        const count = item.works ? item.works.length : 0;
        if (!groups.has(count)) groups.set(count, []);
        groups.get(count).push(item);
    });

    const sortedCounts = Array.from(groups.keys()).sort((a, b) => b - a);

    sortedCounts.forEach(count => {
        const studios = groups.get(count);
        const groupDiv = document.createElement("div");
        groupDiv.className = "acc-level-1"; // 통일된 클래스 적용
        
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
        
        // 클릭 시 즉각적인 열림/닫힘 (애니메이션 X)
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
}

/** 스튜디오 카드 HTML 공통 생성 함수 */
function createStudioCardHTML(item) {
    const studioImg =`../${item.studio_img}`;
    let isSelected = false;

    // 현재 스텝에 따라 선택된 상태 표시 다르게 처리
    if (studioState.currentStep === 1) {
        isSelected = studioState.nominees.some(n => n.studio === item.studio);
    } else {
        isSelected = studioState.finalWinner && studioState.finalWinner.studio === item.studio;
    }

    return `
        <div class="card ${isSelected ? 'selected' : ''}" onclick="selectStudioCard(event, '${item.studio}')">
            <div class="card-badge" onclick="event.stopPropagation(); showWorksModalByName('${item.studio}')">작품보기</div>
            <img src="${studioImg}" alt="${item.studio}">
            <div class="card-info">
                <div class="card-title">${item.studio}</div>
            </div>
        </div>
    `;
}

// === 모달 및 수상 관련 로직 (기존과 동일) ===
function showWorksModalByName(studioName) {
    const item = AnimeStudioData.find(s => s.studio === studioName);
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
    if (!studioState.finalWinner) return; // Step 2에서 고른 최종 우승자
    saveWinnerToLocal(studioState.finalWinner);
    
    openAwardModal(studioState.finalWinner);
}

function openAwardModal(item) {
    const modal = document.getElementById("winner-modal");
    const leftArea = document.getElementById("winner-studio-info");
    const rightGrid = document.getElementById("winner-anime-grid");
    
    const studioImg =`../${item.studio_img}`;
    const worksCount = item.works ? item.works.length : 0;

    leftArea.innerHTML = `
        <img src="${studioImg}" alt="${item.studio}">
        <h2>${item.studio}</h2>
        <div style="color: var(--gold); font-size: 1.1rem; margin-top: 10px;">
            총 ${worksCount}개 작품
        </div>
    `;

    if (!item.works || item.works.length === 0) {
        rightGrid.innerHTML = "<p style='color:#666; text-align:center; padding: 20px;'>제작 정보가 없습니다.</p>";
    } else {
        let tableHTML = `
            <table class="works-table">
                <thead>
                    <tr>
                        <th class="col-num">No.</th>
                        <th>작품 제목</th>
                    </tr>
                </thead>
                <tbody>
                    ${item.works.map((work, index) => `
                        <tr>
                            <td class="col-num">${index + 1}</td>
                            <td>${work.title}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        rightGrid.innerHTML = tableHTML;
    }
    modal.classList.remove("hidden");
}

function saveWinnerToLocal(item) {
    let results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results[studioState.awardName] = {
        name: item.studio,
        thumbnail: `../${item.studio_img}`,
        year: '2026'
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));
    fireConfetti();
}

function initSearch() {
    const input = document.getElementById("search-input");
    input.addEventListener("input", (e) => {
        const keyword = e.target.value.toLowerCase();
        document.querySelectorAll(".card").forEach(card => {
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