/**
 * 상태 관리
 */
const dirState = {
    step: 1,
    selectedDirectors: [],
    finalWinner: null,
    awardName: ""
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
    document.getElementById("final-confirm-btn").onclick = () => location.href = "../index.html";

    const params = new URLSearchParams(window.location.search);
    dirState.awardName = params.get("awardName");
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

    const isSearching = searchTerm.length > 0;

    if (filteredData.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#666;">데이터가 없습니다.</div>`;
        return;
    }

    // ==========================================
    // Step 2: 최종 수상자 선택 렌더링
    // ==========================================
    if (dirState.step === 2) {
        // Step 2 전용 타이틀 추가
        const titleH2 = document.createElement("h2");
        titleH2.style.cssText = "color:var(--gold); margin-bottom:20px; font-size: 1.5rem; text-align: left;";
        titleH2.textContent = "최종 수상자를 선택하세요";
        container.appendChild(titleH2);

        const finalGrid = document.createElement("div");
        finalGrid.id = "step2-grid"; 
        filteredData.forEach(director => {
            finalGrid.appendChild(createDirectorCard(director, "step2"));
        });
        container.appendChild(finalGrid);
        return;
    }

    // ==========================================
    // Step 1: 작품 수별 아코디언 표시 (기존 로직 유지)
    // ==========================================
    const groups = {};
    filteredData.forEach(d => {
        const count = d.works ? d.works.length : 0;
        if (!groups[count]) groups[count] = [];
        groups[count].push(d);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => b - a);

    sortedKeys.forEach(count => {
        const qSection = document.createElement("div");
        qSection.className = "quarter-section";

        const qBtn = document.createElement("button");
        qBtn.className = `quarter-btn ${isSearching ? 'active' : ''}`;
        qBtn.innerHTML = `<span>${count}개 작품 참여 감독 (${groups[count].length}명)</span> <span>▼</span>`;

        const dContent = document.createElement("div");
        dContent.className = "day-content";
        dContent.style.display = isSearching ? "grid" : "none";

        qBtn.onclick = () => {
            const isGrid = dContent.style.display === "grid";
            dContent.style.display = isGrid ? "none" : "grid";
            qBtn.classList.toggle("active", !isGrid);
        };

        groups[count].forEach(director => {
            dContent.appendChild(createDirectorCard(director, "step1"));
        });

        qSection.appendChild(qBtn);
        qSection.appendChild(dContent);
        container.appendChild(qSection);
    });
}

/**
 * 카드 생성 함수 (배지 클릭, 선택 로직 포함)
 */
function createDirectorCard(data, step) {
    const card = document.createElement("div");

    const worksCount = data.works ? data.works.length : 0;
    const worksTitles = data.works ? data.works.map(w => w.title).join(', ') : '대표작 없음';

    // ==========================================
    // Step 2: 최종 선택용 카드
    // ==========================================
    if (step === "step2") {
        card.className = "step2-director-card";
        if (dirState.finalWinner && dirState.finalWinner.director === data.director) {
            card.classList.add("selected");
        }

        card.innerHTML = `
            <div class="card-badge">${worksCount}작품</div>
            <div class="card-thumb">
                <img src="../${data.director_img}" alt="${data.director}" onerror="this.src='../image/placeholder.webp'">
            </div>
            <div class="step2-card-info">
                <div class="card-title">${data.director}</div>
            </div>
        `;

        // 배지 클릭 시 상세 정보 모달 열기
        const badge = card.querySelector('.card-badge');
        badge.onclick = (e) => {
            e.stopPropagation();
            openDetailModal(data);
        };

        // 카드 클릭 시 단일 선택 로직
        card.onclick = () => {
            document.querySelectorAll(".step2-director-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            dirState.finalWinner = data;
            document.getElementById("btn-next").disabled = false;
        };

        return card;
    }

    // ==========================================
    // Step 1: 후보 선정용 카드 (기존 디자인)
    // ==========================================
    card.className = "card";

    const badge = document.createElement("div");
    badge.className = "card-badge";
    badge.textContent = `${worksCount}작품`;

    badge.onclick = (e) => {
        e.stopPropagation(); 
        openDetailModal(data);
    };

    const isSelected = dirState.selectedDirectors.some(sel => sel.director === data.director);
    if (isSelected) card.classList.add("selected");

    card.innerHTML = `
        <img src="../${data.director_img}" loading="lazy" onerror="this.src='../image/placeholder.webp'">
        <div class="card-info">
            <div class="card-title">${data.director}</div>
        </div>
    `;
    card.prepend(badge);

    card.onclick = () => {
        toggleSelect(data, card);
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
    const previewList = document.getElementById('preview-list');
    if (!previewList) return;
    
    // 선택된 항목이 없을 때
    if (dirState.selectedDirectors.length === 0) {
        previewList.innerHTML = `<span style="font-size: 0.85rem; color:#555;">후보를 선택해주세요</span>`;
        if (document.getElementById("btn-next")) document.getElementById("btn-next").disabled = true;
        return;
    }

    previewList.innerHTML = '';
    dirState.selectedDirectors.forEach(item => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        
        // 성우 페이지와 동일하게 이름과 참여 작품 수를 표시 (클릭 시 삭제)
        div.innerHTML = `
            ${item.director}
            <br><small style="color:#888; font-size:0.75rem;">${item.works ? item.works.length : 0}개의 작품</small>
        `;
        
        div.onclick = () => {
            if (dirState.step === 1) {
                removeDirector(item.director);
            }
        };
        previewList.appendChild(div);
    });

    if (document.getElementById("btn-next")) {
        document.getElementById("btn-next").disabled = dirState.selectedDirectors.length === 0;
    }
}
/**
 * 프리뷰에서 제거
 */
function removeDirector(name) {
    // Step 2(최종 투표 단계)에서는 사이드바에서 삭제 불가하도록 설정
    if (dirState.step === 2) return;

    const index = dirState.selectedDirectors.findIndex(d => d.director === name);
    if (index > -1) {
        dirState.selectedDirectors.splice(index, 1);
        
        // 메인 그리드의 카드 'selected' 클래스 제거
        const cards = document.querySelectorAll(".card");
        cards.forEach(c => {
            const titleElement = c.querySelector(".card-title");
            if (titleElement && titleElement.textContent === name) {
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
        document.getElementById("step-title").textContent = "올해의 감독상 부문";
        document.getElementById("btn-back").textContent = "이전 단계";
        
        const nextBtn = document.getElementById("btn-next");
        nextBtn.textContent = "수상 결정";
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
        location.href = "../index.html";
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
    results[dirState.awardName] = {
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