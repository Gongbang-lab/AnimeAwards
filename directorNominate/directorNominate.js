/**
 * 상태 관리
 */
const dirState = {
    step: 1,
    selectedDirectors: [],
    finalWinner: null
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. 초기 렌더링
    renderDirectorGrid();

    // 2. 검색 이벤트 바인딩
    document.getElementById("search-input").addEventListener("input", (e) => {
        renderDirectorGrid(e.target.value);
    });

    // 3. 버튼 이벤트 바인딩
    document.getElementById("btn-next").onclick = goStep2;
    document.getElementById("btn-back").onclick = handleBack;
    document.getElementById("final-confirm-btn").onclick = () => location.href = "../main/main.html";
});
/**
 * 감독 그리드 렌더링 (Step 1: 아코디언 / Step 2: 일반 그리드)
 */
function renderDirectorGrid(searchTerm = "") {
    const container = document.getElementById("dir-accordion-container");
    if (!container) return;
    container.innerHTML = "";

    // 1. 데이터 필터링
    let filteredData = (dirState.step === 1) 
        ? animeDirectorData.filter(d => d.director.toLowerCase().includes(searchTerm.toLowerCase().trim()))
        : dirState.selectedDirectors;

    if (filteredData.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#666;">데이터가 없습니다.</div>`;
        return;
    }

    // --- Step 2: 아코디언 없이 일반 그리드로 표시 ---
    if (dirState.step === 2) {
        const finalGrid = document.createElement("div");
        finalGrid.className = "final-grid-view";
        filteredData.forEach(director => {
            finalGrid.appendChild(createDirectorCard(director, "step2"));
        });
        container.appendChild(finalGrid);
        return; // Step 2 로직 종료
    }

    // --- Step 1: 작품 수별 아코디언 표시 ---
    const groups = {};
    filteredData.forEach(d => {
        const count = d.works ? d.works.length : 0;
        if (!groups[count]) groups[count] = [];
        groups[count].push(d);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => b - a);

    sortedKeys.forEach(count => {
        const groupWrapper = document.createElement("div");
        groupWrapper.className = "accordion-group";

        const header = document.createElement("div");
        header.className = "accordion-header"; 
        header.innerHTML = `
            <span class="header-title">${count}개 작품 참여 감독 (${groups[count].length}명)</span>
            <span class="header-icon">▼</span>
        `;

        const content = document.createElement("div");
        content.className = "accordion-content";
        
        const grid = document.createElement("div");
        grid.className = "director-grid-view";

        groups[count].forEach(director => {
            grid.appendChild(createDirectorCard(director, "step1"));
        });

        content.appendChild(grid);
        
        // 클릭 시 즉각적인 토글 (애니메이션 없음)
        header.onclick = () => {
            const isOpening = content.style.display !== "block";
            content.style.display = isOpening ? "block" : "none";
            header.classList.toggle("active", isOpening);
        };

        groupWrapper.appendChild(header);
        groupWrapper.appendChild(content);
        container.appendChild(groupWrapper);
    });
}

/**
 * 카드 생성 함수 (배지 클릭, 선택 로직 포함)
 */
function createDirectorCard(data, step) {
    const card = document.createElement("div");
    card.className = "card";

    // 1. 배지 생성 (작품 수) - 클릭 시 팝업
    const badge = document.createElement("div");
    badge.className = "card-badge";
    badge.textContent = `${data.works ? data.works.length : 0}작품`;
    
    badge.onclick = (e) => {
        e.stopPropagation(); // 카드 선택 방지
        openDetailModal(data);
    };

    // 2. 선택 상태 반영 (Step 1)
    if (step === "step1") {
        const isSelected = dirState.selectedDirectors.some(sel => sel.director === data.director);
        if (isSelected) card.classList.add("selected");
    }

    // 3. 카드 내부 HTML
    card.innerHTML = `
        <img src="${data.director_img}" loading="lazy" onerror="this.src='../image/placeholder.webp'">
        <div class="card-info">
            <div class="card-title">${data.director}</div>
        </div>
    `;
    card.prepend(badge);

    // 4. 클릭 이벤트 (선택 / 투표)
    card.onclick = () => {
        if (step === "step1") {
            toggleSelect(data, card);
        } else {
            // Step 2: 단일 선택
            document.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            dirState.finalWinner = data;
            document.getElementById("btn-next").disabled = false;
        }
    };

    return card;
}

/**
 * 선택 토글 및 프리뷰 연동
 */
function toggleSelect(data, cardElement) {
    const index = dirState.selectedDirectors.findIndex(d => d.director === data.director);
    
    if (index > -1) {
        // 제거
        dirState.selectedDirectors.splice(index, 1);
        cardElement.classList.remove("selected");
    } else {
        // 추가
        dirState.selectedDirectors.push(data);
        cardElement.classList.add("selected");
    }
    updatePreview();
}

/**
 * 프리뷰 박스 업데이트
 */
function updatePreview() {
    const list = document.getElementById("preview-list");
    const count = document.getElementById("selected-count");
    const nextBtn = document.getElementById("btn-next");

    if (count) count.textContent = dirState.selectedDirectors.length;

    if (list) {
        list.innerHTML = dirState.selectedDirectors.map(d => `
            <div class="preview-item" onclick="removeDirector('${d.director}')">
                ${d.director} ✕
            </div>
        `).join('');
    }

    if (nextBtn) {
        nextBtn.disabled = dirState.selectedDirectors.length === 0;
    }
}

/**
 * 프리뷰에서 제거
 */
function removeDirector(name) {
    const index = dirState.selectedDirectors.findIndex(d => d.director === name);
    if (index > -1) {
        dirState.selectedDirectors.splice(index, 1);
        
        // 카드 UI 업데이트
        const cards = document.querySelectorAll(".card");
        cards.forEach(c => {
            if (c.querySelector(".card-title").textContent === name) {
                c.classList.remove("selected");
            }
        });
        updatePreview();
    }
}

/**
 * 단계 이동
 */
function goStep2() {
    if (dirState.step === 1) {
        dirState.step = 2;
        document.getElementById("step-title").textContent = "최종 수상자를 투표해주세요";
        document.getElementById("btn-back").textContent = "이전으로";
        
        const nextBtn = document.getElementById("btn-next");
        nextBtn.textContent = "투표 완료";
        nextBtn.disabled = true;

        renderDirectorGrid(); // 선택된 후보만 다시 렌더링
    } else {
        openWinnerModal();
    }
}

function handleBack() {
    if (dirState.step === 2) {
        dirState.step = 1;
        document.getElementById("step-title").textContent = "올해의 감독상 후보 선발";
        document.getElementById("btn-back").textContent = "메인으로";
        
        const nextBtn = document.getElementById("btn-next");
        nextBtn.textContent = "다음 단계";
        nextBtn.disabled = false;

        renderDirectorGrid();
    } else {
        location.href = "../main/main.html";
    }
}

/**
 * 상세 정보 모달 (배지 클릭 시)
 */
function openDetailModal(data) {
    document.getElementById("detail-img").src = data.director_img;
    document.getElementById("detail-name").textContent = data.director;
    
    const worksContainer = document.getElementById("detail-works");
    worksContainer.innerHTML = data.works.map(w => `
        <div class="info-row">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${w.thumbnail}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;">
                <span class="info-label" style="text-align:left;">${w.title}</span>
            </div>
        </div>
    `).join('');
    
    document.getElementById("detail-modal").classList.remove("hidden");
}

/**
 * 최종 수상 모달
 */
function openWinnerModal() {
    const winner = dirState.finalWinner;
    if (!winner) return;

    document.getElementById("winner-img").src = winner.director_img;
    
    // 우측 콘텐츠 생성
    const infoContent = document.getElementById("winner-info-content");
    const worksListHTML = winner.works.map(w => `
        <div class="info-row">
            <span class="info-label">${w.title}</span>
        </div>
    `).join('');

    infoContent.innerHTML = `
        <div class="info-row" style="border-bottom: 2px solid var(--gold); margin-bottom: 15px; padding-bottom: 15px;">
            <span class="info-label" style="font-size: 1.4rem;">수상자</span>
            <span class="info-value" style="font-size: 1.4rem; color: #fff; font-weight: bold;">${winner.director}</span>
        </div>
        <div class="winner-works-scroll">
            <div style="color:#aaa; font-size:0.9rem; margin-bottom:10px;">주요 연출작</div>
            ${worksListHTML}
        </div>
    `;

    document.getElementById("winner-modal").classList.remove("hidden");
    fireConfetti();
    
    // 로컬스토리지 저장 (감독상)
    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results["감독상"] = {
        name: winner.director,
        thumbnail: winner.director_img,
        works: winner.works.map(w => w.title).join(', ')
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

function fireConfetti() {
    var duration = 3 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        var particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: 0.1, y: 0.6 } });
        confetti({ ...defaults, particleCount, origin: { x: 0.9, y: 0.6 } });
    }, 250);
}