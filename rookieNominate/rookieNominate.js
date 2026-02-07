/**
 * 신인 성우 노미네이트 로직
 */
const state = {
    selectedCV: null,
    awardName: "올해의 신인 성우상"
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. 그리드 렌더링
    renderRookieGrid();

    // 2. 버튼 이벤트 바인딩
    const btnHome = document.getElementById("btn-home");
    const btnAward = document.getElementById("btn-award");

    if (btnHome) btnHome.onclick = () => location.href = "../main/main.html";
    if (btnAward) btnAward.onclick = openAwardPopup;
});

/**
 * [메인 화면] 성우 그리드 렌더링
 */
function renderRookieGrid() {
    const grid = document.getElementById("rookie-grid");
    if (!grid || typeof RookieCVData === 'undefined') return;

    grid.innerHTML = "";
    // 데이터 추출 및 이름순 정렬
    const list = Object.values(RookieCVData).sort((a, b) => a.name.localeCompare(b.name));

    list.forEach(cv => {
        const card = document.createElement("div");
        card.className = "char-vote-card";

        // 메인 이미지 설정
        const displayImg = cv.cvimg || (cv.characters && cv.characters[0] ? cv.characters[0].charimg : '');

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${displayImg}" alt="${cv.name}" onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
            </div>
            <div class="card-info">
                <div class="info-name">${cv.name}</div>
                <div class="info-anime">2026 Nominee</div>
                <button class="info-icon-btn" title="필모그래피">i</button>
            </div>
        `;

        // 카드 클릭 (선택)
        card.onclick = () => {
            document.querySelectorAll(".char-vote-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            state.selectedCV = cv;
            
            const awardBtn = document.getElementById("btn-award");
            if (awardBtn) awardBtn.disabled = false;
        };

        // 정보 아이콘 클릭 (필모그래피 팝업)
        const infoBtn = card.querySelector(".info-icon-btn");
        infoBtn.onclick = (e) => {
            e.stopPropagation(); // 카드 선택 이벤트가 발생하지 않도록 차단
            openFilmoPopup(cv);
        };

        grid.appendChild(card);
    });
}

/**
 * [팝업 1] 필모그래피 (좌우 분할 구조)
 */
function openFilmoPopup(cv) {
    const popup = document.getElementById("winner-popup");
    if (!popup) {
        console.error("winner-popup 요소를 찾을 수 없습니다.");
        return;
    }

    // [예외 처리] characters 데이터가 없는 경우 방어 로직
    if (!cv.characters || !Array.isArray(cv.characters) || cv.characters.length === 0) {
        alert("등록된 필모그래피 정보가 없습니다.");
        return;
    }

    // 1. 데이터 가공: 연도별 그룹화
    const groups = {};
    cv.characters.forEach(char => {
        const year = char.year || "기타"; // 연도 데이터가 없을 경우 대비
        if (!groups[year]) groups[year] = [];
        groups[year].push(char);
    });

    // 2. 연도 내림차순 정렬 (숫자로 변환하여 비교)
    const sortedYears = Object.keys(groups).sort((a, b) => b - a);
    
    // 3. 데뷔년도 계산 (가장 낮은 연도)
    const yearsArray = cv.characters.map(c => parseInt(c.year)).filter(y => !isNaN(y));
    const debutYear = yearsArray.length > 0 ? Math.min(...yearsArray) : "미정";

    // 4. 메인 이미지 설정
    const mainImg = cv.cvimg || cv.characters[0].charimg || "";

    // 5. HTML 생성 (CSS 클래스명: filmo-split-layout)
    popup.innerHTML = `
        <div class="popup-content filmo-split-layout">
            <button class="close-filmo" onclick="closePopup()">✕</button>
            
            <div class="filmo-left">
                <img src="${mainImg}" class="cv-main-img" onerror="this.src='https://via.placeholder.com/220?text=No+Image'">
                <h2 class="cv-name-ko">${cv.name}</h2>
                <div class="cv-debut">DEBUT: <span>${debutYear}</span></div>
            </div>

            <div class="filmo-right">
                <div class="filmo-scroll-container">
                    ${sortedYears.map(year => `
                        <div class="year-group">
                            <div class="year-label">${year}</div>
                            <div class="char-grid-view">
                                ${groups[year].map(c => `
                                    <div class="char-unit">
                                        <div class="char-img-wrap">
                                            <img src="${c.charimg}" alt="${c.charName}" onerror="this.src='https://via.placeholder.com/130?text=No+Img'">
                                        </div>
                                        <div class="char-info-text">
                                            <span class="c-name">${c.charName}</span>
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

    popup.style.display = "flex";
}

// 팝업 닫기 함수 별도 분리 (안정성)
function closePopup() {
    const popup = document.getElementById("winner-popup");
    if (popup) popup.style.display = "none";
}

/**
 * [팝업 2] 최종 수상 (대형 팝업)
 */
function openAwardPopup() {
    const winner = state.selectedCV;
    const popup = document.getElementById("winner-popup");
    if (!winner || !popup) return;

    const displayImg = winner.cvimg || (winner.characters[0] ? winner.characters[0].charimg : '');

    // 로컬스토리지 저장
    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results[state.awardName] = {
        name: winner.name,
        anime: "Rookie of the Year",
        thumbnail: displayImg,
        cv: winner.name
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));

    popup.innerHTML = `
        <div class="popup-content split-layout">
            <div class="popup-left">
                <img src="${displayImg}" alt="${winner.name}" onerror="this.src='https://via.placeholder.com/500x700?text=Winner'">
            </div>
            <div class="popup-right">
                <div class="award-label">🏆 BEST ROOKIE OF 2026</div>
                <h1 id="winner-name">${winner.name}</h1>
                <p id="winner-anime">올해의 신인 성우상 수상을 축하합니다.</p>
                <button id="go-main-btn" class="btn-primary">확인 및 메인으로</button>
            </div>
        </div>
    `;

    popup.style.display = "flex";
    
    // 폭죽 효과
    if (typeof confetti === 'function') {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, zIndex: 10001 });
    }

    document.getElementById("go-main-btn").onclick = () => {
        location.href = "../main/main.html";
    };
}