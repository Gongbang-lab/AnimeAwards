const studioState = {
    selectedStudio: null,
    awardName: "올해의 스튜디오상"
};

document.addEventListener("DOMContentLoaded", () => {
    // 초기화 및 렌더링
    renderStudioAccordionGroups();
    initSearch();

    // 버튼 이벤트
    document.getElementById("btn-home").onclick = () => location.href = "../main/main.html";
    document.getElementById("btn-award").onclick = handleAwardDecision;
});

/** 메인 그리드 렌더링 */
function renderStudioGrid() {
    const grid = document.getElementById("studio-grid");
    if (!grid || typeof AnimeStudioData === 'undefined') return;

    grid.innerHTML = "";
    // 데이터가 배열인지 객체인지 확인 후 처리 (배열이라고 가정)
    const list = Array.isArray(AnimeStudioData) ? AnimeStudioData : Object.values(AnimeStudioData);
    
    // 이름순 정렬
    list.sort((a, b) => a.studio.localeCompare(b.studio));

    list.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        
        // 데이터 필드 매핑
        const studioName = item.studio;
        const studioImg = item.studio_img ? `../${item.studio_img}` : 'https://via.placeholder.com/300x169';
        const worksCount = item.works ? item.works.length : 0;

        card.innerHTML = `
            <div class="card-badge">작품수 ${worksCount}</div>
            <img src="${studioImg}" alt="${studioName}" loading="lazy">
            <div class="card-info">
                <div class="card-title">${studioName}</div>
            </div>
        `;

        // 카드 클릭 (선택)
        card.onclick = (e) => {
            if (e.target.classList.contains('card-badge')) return;
            selectCandidate(item, card);
        };

        // 배지 클릭 (작품 팝업)
        const badge = card.querySelector('.card-badge');
        badge.onclick = (e) => {
            e.stopPropagation();
            showWorksModal(item);
        };

        grid.appendChild(card);
    });
}

/** 후보 선택 */
function selectCandidate(item, cardElement) {
    document.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
    cardElement.classList.add("selected");
    studioState.selectedStudio = item;

    const display = document.getElementById("selected-name-display");
    display.innerText = `선택됨: ${item.studio}`;
    document.getElementById("btn-award").disabled = false;
}

/** 작품 목록 모달 (좌우 분할) */
function showWorksModal(item) {
    const modal = document.getElementById("works-modal");
    const leftArea = document.getElementById("works-studio-info");
    const gridBody = document.getElementById("works-grid-body");
    
    const studioImg = item.studio_img ? `../${item.studio_img}` : 'https://via.placeholder.com/300x169';

    // 1. 왼쪽: 스튜디오 로고 및 정보
    leftArea.innerHTML = `
        <img src="${studioImg}" alt="${item.studio}" style="width:100%; max-width:250px; border:2px solid var(--gold); border-radius:10px;">
        <h2 style="color:var(--gold); margin: 20px 0 10px 0;">${item.studio}</h2>
        <p style="color:#888;">총 ${item.works ? item.works.length : 0}개 작품</p>
    `;

    // 2. 오른쪽: 작품 그리드 (works 배열 사용)
    if (!item.works || item.works.length === 0) {
        gridBody.innerHTML = "<p style='color:#666; padding:20px;'>등록된 작품이 없습니다.</p>";
    } else {
        gridBody.innerHTML = item.works.map(work => `
            <div class="work-card">
                <div style="background:#000; width:100%;">
                    <img src="${work.thumbnail}" alt="${work.title}" 
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/150x200?text=No+Image'">
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

/** 수상 결정 및 결과 저장 */
function handleAwardDecision() {
    if (!studioState.selectedStudio) return;
    saveWinnerToLocal(studioState.selectedStudio);
    
    if (typeof confetti === 'function') {
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#d4af37', '#ffffff'] });
    }
    openAwardModal(studioState.selectedStudio);
}

function openAwardModal(item) {
    const modal = document.getElementById("winner-modal");
    const leftArea = document.getElementById("winner-studio-info");
    const rightGrid = document.getElementById("winner-anime-grid");
    if (!modal || !leftArea || !rightGrid) return;

    const studioImg = item.studio_img ? `../${item.studio_img}` : 'https://via.placeholder.com/200';
    const worksCount = item.works ? item.works.length : 0;

    leftArea.innerHTML = `
        <img src="${studioImg}" alt="${item.studio}">
        <h2>${item.studio}</h2>
        <div style="color: var(--gold); font-size: 1.1rem; margin-top: 10px;">
            총 ${worksCount}개 작품
        </div>
    `;

    // 2. 오른쪽: 이번 연도 제작 작품 그리드
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
        thumbnail: item.studio_img ? `../${item.studio_img}` : '',
        year: '2026'
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));
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

/** 아코디언 그룹 렌더링 */
function renderStudioAccordionGroups() {
    const container = document.getElementById("accordion-group-container");
    if (!container) return;

    container.innerHTML = "";

    // 작품 수별 그룹화
    const groups = new Map();
    AnimeStudioData.forEach(item => {
        const count = item.works ? item.works.length : 0;
        if (!groups.has(count)) groups.set(count, []);
        groups.get(count).push(item);
    });

    // 정렬 (작품 많은 순)
    const sortedCounts = Array.from(groups.keys()).sort((a, b) => b - a);

    sortedCounts.forEach(count => {
        const studios = groups.get(count);
        const groupDiv = document.createElement("div");
        groupDiv.className = "group-item";
        
        groupDiv.innerHTML = `
            <div class="group-header" role="button" aria-expanded="false">
                <span>작품 수 ${count}개 스튜디오 <small style="color:#888; margin-left:10px;">(${studios.length})</small></span>
                <span class="arrow">▼</span>
            </div>
            <div class="group-content">
                <div class="accordion-inner-grid">
                    ${studios.map(studio => createStudioCardHTML(studio)).join('')}
                </div>
            </div>
        `;

        // 클릭 이벤트: 애니메이션 버벅임을 방지하기 위해 단순 클래스 토글 사용
        const header = groupDiv.querySelector('.group-header');
        header.onclick = () => {
            const isActive = groupDiv.classList.contains('active');
            
            // 다른 그룹을 닫고 싶다면 아래 한 줄 추가 (선택사항)
            // document.querySelectorAll('.group-item').forEach(el => el.classList.remove('active'));

            groupDiv.classList.toggle('active', !isActive);
            header.setAttribute('aria-expanded', !isActive);
        };

        container.appendChild(groupDiv);
    });
}

/** 스튜디오 카드 HTML 생성 (rookieNominate와 동일한 구조) */
function createStudioCardHTML(item) {
    const studioImg = item.studio_img ? `../${item.studio_img}` : 'https://via.placeholder.com/200x120';
    const isSelected = studioState.selectedStudio && studioState.selectedStudio.studio === item.studio;

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

/** 카드 선택 로직 */
function selectStudioCard(event, studioName) {
    const item = AnimeStudioData.find(s => s.studio === studioName);
    if (!item) return;

    // UI 선택 효과 처리
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    // 상태 업데이트
    studioState.selectedStudio = item;
    document.getElementById("selected-name-display").innerText = `선택됨: ${item.studio}`;
    document.getElementById("btn-award").disabled = false;
}

/** 모달용 데이터 찾기 헬퍼 */
function showWorksModalByName(studioName) {
    const item = AnimeStudioData.find(s => s.studio === studioName);
    if (item) showWorksModal(item);
}