/**
 * 1. 상태 관리 객체
 */
const cvState = {
    step: 1,
    theme: new URLSearchParams(location.search).get("theme") || "character_male",
    currentAward: new URLSearchParams(location.search).get("awardName") || "올해의 성우상",
    selectedCVs: [], // 선택된 성우 객체 리스트
    finalWinner: null
};

/**
 * 2. 초기 로드
 */
document.addEventListener("DOMContentLoaded", () => {
    renderCVStep1();
    bindButtons();
});

/**
 * 3. Step 1: 초성 아코디언 및 성우 리스트 렌더링
 */
function renderCVStep1() {
    const leftArea = document.getElementById("left-area");
    if (!leftArea) return;

    const genderKey = cvState.theme.includes("female") ? "female" : "male";
    
    // 성별 필터링 및 가나다순 정렬
    const filteredCVs = Object.values(CharacterVoiceData)
        .filter(cv => String(cv.gender).toLowerCase() === genderKey)
        .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

    // 초성별 그룹화
    const groups = {};
    filteredCVs.forEach(cv => {
        const cho = getChosung(cv.name);
        if (!groups[cho]) groups[cho] = [];
        groups[cho].push(cv);
    });

    leftArea.innerHTML = `<h2 class="step-title">${cvState.currentAward} 후보 선택</h2>`;

    const choList = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    choList.forEach(cho => {
        if (!groups[cho]) return;

        // 아코디언 생성
        const accordion = createAccordion(cho, "cho-btn");
        const content = accordion.querySelector(".accordion-content");
        
        const cvGrid = document.createElement("div");
        cvGrid.className = "cv-card-grid";

        groups[cho].forEach(cv => {
            cvGrid.appendChild(createCVCard(cv));
        });

        content.appendChild(cvGrid);
        leftArea.appendChild(accordion);
    });
}

/**
 * 4. 성우 카드 생성 (Step 1 & 2 공통)
 */
function createCVCard(cv) {
    const card = document.createElement("div");
    card.className = "cv-card";
    if (cvState.selectedCVs.some(v => v.name === cv.name)) {
        card.classList.add("selected");
    }

    card.innerHTML = `
        <img src="${cv.vc_img || 'https://via.placeholder.com/150?text=No+Image'}" class="cv-card-img" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
        <div class="cv-card-name">${cv.name}</div>
        <div class="cv-card-btns">
            <button class="icon-btn info" title="정보 보기">
                <img src="https://img.icons8.com/material-rounded/24/ffffff/info.png"/>
            </button>
            <button class="icon-btn check" title="후보 추가">
                <img src="https://img.icons8.com/material-rounded/24/ffffff/checkmark.png"/>
            </button>
        </div>
    `;

    // 정보 버튼 클릭
    card.querySelector(".info").onclick = (e) => {
        e.stopPropagation();
        openCVDetailPopup(cv.name);
    };

    // 체크 버튼 클릭 (선택 토글)
    card.querySelector(".check").onclick = (e) => {
        e.stopPropagation();
        toggleCVSelection(cv, card);
    };

    return card;
}

/**
 * 5. 성우 선택 토글 로직
 */
function toggleCVSelection(cv, cardElement) {
    const index = cvState.selectedCVs.findIndex(v => v.name === cv.name);
    if (index > -1) {
        cvState.selectedCVs.splice(index, 1);
        cardElement.classList.remove("selected");
    } else {
        cvState.selectedCVs.push(cv);
        cardElement.classList.add("selected");
    }
    updateCVPreview();
}

/**
 * 6. 프리뷰 업데이트 (텍스트 기반)
 */
function updateCVPreview() {
    const previewList = document.getElementById("preview-list");
    const nextBtn = document.getElementById("step1-next-btn");
    if (!previewList) return;

    previewList.innerHTML = cvState.selectedCVs.map(cv => `
        <div class="preview-item cv-text-only" onclick="removeCVFromPreview('${cv.name}')">
            ${cv.name}
        </div>
    `).join('');

    if (nextBtn) nextBtn.disabled = cvState.selectedCVs.length === 0;
}

function removeCVFromPreview(name) {
    cvState.selectedCVs = cvState.selectedCVs.filter(v => v.name !== name);
    renderCVStep1(); // 왼쪽 카드 상태 동기화
    updateCVPreview();
}

/**
 * 7. 상세 정보 팝업 (좌: 배역 / 우: 성우)
 */
function openCVDetailPopup(cvName) {
    const cv = CharacterVoiceData[cvName];
    const popup = document.getElementById("cv-detail-popup");
    if (!cv || !popup) return;

    popup.innerHTML = `
        <div class="popup-content cv-detail-layout">
            <div class="popup-left characters-side">
                <h3>담당 배역</h3>
                <div class="mini-char-list">
                    ${cv.characters.map(c => `
                        <div class="mini-char-item">
                            <img src="${c.img}" onerror="this.src='https://via.placeholder.com/50'">
                            <div class="mini-info">
                                <p class="m-anime">${c.animeTitle}</p>
                                <p class="m-char">${c.charName}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="popup-right cv-side">
                <img src="${cv.vc_img || 'https://via.placeholder.com/180'}" class="cv-big-img">
                <h2>${cv.name}</h2>
                <button onclick="closeCVPopup()" class="btn-close-simple">닫기</button>
            </div>
        </div>
    `;
    popup.style.display = "flex";
}

function closeCVPopup() {
    document.getElementById("cv-detail-popup").style.display = "none";
}

/**
 * 8. Step 전환 및 최종 투표
 */
function goStep2() {
    cvState.step = 2;
    document.getElementById("step1-buttons").style.display = "none";
    document.getElementById("step1-preview").style.display = "none";
    document.getElementById("step2-buttons").style.display = "flex";

    const leftArea = document.getElementById("left-area");
    leftArea.innerHTML = `<h2 class="step-title">최종 성우 투표</h2>`;
    
    const grid = document.createElement("div");
    grid.className = "cv-card-grid";

    cvState.selectedCVs.forEach(cv => {
        const card = createCVCard(cv);
        card.onclick = () => {
            document.querySelectorAll(".cv-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            cvState.finalWinner = cv;
            document.getElementById("step2-award-btn").disabled = false;
        };
        grid.appendChild(card);
    });
    leftArea.appendChild(grid);
}

/**
 * 9. 최종 수상 팝업 연출
 */
function openWinnerPopup() {
    const winner = cvState.finalWinner;
    const popup = document.getElementById("winner-popup");
    if (!winner || !popup) return;

    // 데이터 저장
    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results[cvState.currentAward] = {
        name: winner.name,
        thumbnail: winner.vc_img,
        works: winner.characters.map(c => c.charName).join(', ')
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));

    popup.innerHTML = `
        <div class="popup-content award-layout">
            <div class="award-left">
                <img src="${winner.vc_img}" class="winner-img">
            </div>
            <div class="award-right">
                <div class="congrats-label">BEST VOICE ACTOR</div>
                <h1 class="winner-name">${winner.name}</h1>
                <div class="winner-works-text">
                    주요 출연작: ${winner.characters.map(c => c.charName).slice(0, 10).join(', ')}...
                </div>
                <button id="final-home-btn" class="btn-primary">확인 및 메인으로</button>
            </div>
        </div>
    `;
    popup.style.display = "flex";
    fireConfetti();

    document.getElementById("final-home-btn").onclick = () => {
        location.href = "../main/main.html";
    };
}

/**
 * 유틸리티: 초성 추출
 */
function getChosung(str) {
    const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    const code = str.charCodeAt(0) - 44032;
    if (code < 0 || code > 11171) return str[0];
    return cho[Math.floor(code / 588)];
}

/**
 * 유틸리티: 아코디언 생성
 */
function createAccordion(title, btnClass) {
    const container = document.createElement("div");
    container.className = "accordion-wrapper";
    const btn = document.createElement("button");
    btn.className = btnClass;
    btn.textContent = title;
    const content = document.createElement("div");
    content.className = "accordion-content";
    btn.onclick = () => {
        const isOpen = content.style.display === "block";
        content.style.display = isOpen ? "none" : "block";
        btn.classList.toggle("active", !isOpen);
    };
    container.append(btn, content);
    return container;
}

/**
 * 버튼 이벤트 바인딩
 */
function bindButtons() {
    document.getElementById("step1-next-btn").onclick = goStep2;
    document.getElementById("step2-back-btn").onclick = () => location.reload();
    document.getElementById("step2-award-btn").onclick = openWinnerPopup;
    document.getElementById("step1-back-btn").onclick = () => location.href = "../main/main.html";
}

/**
 * 폭죽 함수 (기존 로직 유지)
 */
function fireConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 20000 };
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.5 } });
        confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.5 } });
    }, 250);
}