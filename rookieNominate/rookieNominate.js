const rookiestate = {
    selectedCV: null,
    currentAward: null,
    theme: null
};

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(location.search);
    const theme = params.get("theme"); // "opening" or "ending"
    const awardName = params.get("awardName");
    
    rookiestate.theme = theme;
    rookiestate.currentAward = { name : awardName };

    renderRookieGrid();

    const btnHome = document.getElementById("btn-home");
    const btnAward = document.getElementById("btn-award");

    if (btnHome) btnHome.onclick = () => location.href = "../main/main.html";
    
    // 수상 결정 버튼 클릭 이벤트 연결
    if (btnAward) {
        btnAward.onclick = () => {
            if (rookiestate.selectedCV) {
                saveWinnerToLocal(rookiestate.selectedCV);
                openAwardPopup(rookiestate.selectedCV);
            }
        };
    }

});

function renderRookieGrid() {
    const grid = document.getElementById("rookie-grid");
    if (!grid || typeof RookieCVData === 'undefined') return;

    console.log(rookiestate.currentAward);
    grid.innerHTML = "";
    // 가나다/ABC 순 정렬
    const list = Object.values(RookieCVData).sort((a, b) => a.name.localeCompare(b.name));

    list.forEach(cv => {
        const card = document.createElement("div");
        card.className = "char-vote-card";
        
        const displayImg = cv.cvimg || (cv.characters && cv.characters[0] ? cv.characters[0].charimg : '');

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${displayImg}" alt="${cv.name}" onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
            </div>
            <div class="card-info">
                <div class="info-name">${cv.name}</div>
                <button class="info-icon-btn" title="필모그래피">i</button>
            </div>
        `;

        // 카드 선택 이벤트
        card.onclick = () => {
            document.querySelectorAll(".char-vote-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            rookiestate.selectedCV = cv;
            document.getElementById("btn-award").disabled = false;
        };

        // i 버튼 클릭 시 팝업만 오픈 (이벤트 전파 방지)
        card.querySelector(".info-icon-btn").onclick = (e) => {
            e.stopPropagation();
            openFilmoPopup(cv);
        };

        grid.appendChild(card);
    });
}

function openAwardPopup(cv) {
    const popup = document.getElementById("winner-popup");
    if (!popup) return;

    // 꽃가루 효과 (confetti.js가 로드되어 있어야 함)
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ffd700', '#ffffff']
        });
    }

    // 내부 HTML 구조 생성 (필모그래피 정보 포함)
    const content = renderFilmoHTML(cv, "🏆 올해의 신인상 수상");
    popup.innerHTML = content;
    
    // 수상 팝업일 경우 특별 클래스 추가 (선택사항)
    popup.querySelector('.filmo-split-layout').classList.add('award-mode');
    
    popup.style.display = "flex";
}

function openFilmoPopup(cv) {
    const popup = document.getElementById("winner-popup");
    popup.innerHTML = renderFilmoHTML(cv, "성우 필모그래피");
    popup.style.display = "flex";
}

/**
 * 공통 레이아웃 생성 함수
 */
function renderFilmoHTML(cv, titleLabel) {
    const groups = {};
    (cv.characters || []).forEach(char => {
        const y = char.year || "기타";
        if (!groups[y]) groups[y] = [];
        groups[y].push(char);
    });

    const sortedYears = Object.keys(groups).sort((a, b) => b - a);
    const mainImg = cv.cvimg || (cv.characters[0] ? cv.characters[0].charimg : "");

    // '🏆'가 포함된 타이틀일 경우 수상 모드로 판단
    const isAward = titleLabel.includes("수상");

    return `
        <div class="filmo-split-layout ${isAward ? 'award-mode' : ''}">
            <button class="close-filmo" onclick="closePopup()">✕</button>
            <div class="filmo-left">
                <div class="award-title-label">${titleLabel}</div>
                <img src="${mainImg}" class="cv-main-img" onerror="this.src='https://via.placeholder.com/240x320'">
                <h2 class="cv-name-ko" style="font-size: 2rem; margin: 10px 0;">${cv.name}</h2>
                <div class="cv-debut">DEBUT: <span style="color:gold">${cv.debutYear || '2026'}</span></div>
                
                ${isAward ? `
                    <button class="confirm-home-btn" onclick="location.href='../main/main.html'">
                        확인 및 메인으로
                    </button>
                ` : ''}
            </div>
            <div class="filmo-right">
                <div class="filmo-scroll-container">
                    ${sortedYears.map(year => `
                        <div class="year-group">
                            <div class="year-label">${year}</div>
                            <div class="char-grid-view">
                                ${groups[year].map(c => `
                                    <div class="char-unit">
                                        <div class="char-img-wrap"><img src="${c.charimg}"></div>
                                        <div class="char-info-text">
                                            <div class="c-anime-title">${c.animeTitle}</div>
                                            <div class="c-name">${c.charName}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}
function closePopup() {
    document.getElementById("winner-popup").style.display = "none";
}

function saveWinnerToLocal(cv) {
    // 1. 기존 데이터를 가져오되, 없으면 빈 객체({})를 기본값으로 설정 (중요!)
    let results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};

    // 2. results가 배열이라면 객체로 강제 변환 (데이터 무결성 방어)
    if (Array.isArray(results)) results = {};

    // 3. 현재 어워드 이름을 문자열로 가져오기
    const awardKey = rookiestate.currentAward ? rookiestate.currentAward.name : null;

    if (!awardKey) {
        console.error("수상 부문(awardName)을 찾을 수 없습니다.");
        return;
    }

    // 4. 새로운 수상자 데이터 객체 생성 및 할당
    results[awardKey] = {
        name: cv.name,
        thumbnail: cv.cvimg || (cv.characters && cv.characters[0] ? cv.characters[0].charimg : ''),
        debutYear: cv.debutYear || '2026'
    };

    // 5. 로컬스토리지에 다시 저장
    localStorage.setItem("anime_awards_result", JSON.stringify(results));
}