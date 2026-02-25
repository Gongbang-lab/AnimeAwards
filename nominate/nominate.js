// ──────────────────────────────────────────────────────────
// 1. 초기 설정 및 데이터 가공
// ──────────────────────────────────────────────────────────
const nominateState = {
    step: 1,
    selectedItems: [],
    selectedWinner: null,
    awardName: ""
};

// URL 파라미터 처리
const params = new URLSearchParams(location.search);
nominateState.awardName = params.get("awardName");
const modalAwardName = document.getElementById('modal-award-name');
if(modalAwardName) modalAwardName.textContent = nominateState.awardName;

// 요일 매핑 (데이터의 day는 영어 그대로 유지됨)
const DAY_LABELS = {
    "Mondays": "월요일", "Tuesdays": "화요일", "Wednesdays": "수요일", "Thursdays": "목요일",
    "Fridays": "금요일", "Saturdays": "토요일", "Sundays": "일요일",
    "Anomaly": "변칙 편성", "Web": "웹", "Unknown": "기타"
};
const DAY_KEYS = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays", "Anomaly", "Web", "Unknown"];

// 분기 정렬 순서 (데이터의 quarter가 이미 "1분기" 한글임)
const QUARTER_ORDER = ["1분기", "2분기", "3분기", "4분기", "변칙 편성", "기타"];

// [중요] 평탄화된 AnimeList를 분기별로 그룹화 (Grouping)
const AnimeByQuarter = AnimeList.reduce((acc, anime) => {
    // quarter 값이 없으면 '기타'로 분류
    const q = anime.quarter || "기타";
    if (!acc[q]) acc[q] = [];
    acc[q].push(anime);
    return acc;
}, {});

// ──────────────────────────────────────────────────────────
// 2. Step 1 렌더링 (아코디언 + 그리드)
// ──────────────────────────────────────────────────────────
function renderStep1(filterText = "") {
    const leftArea = document.getElementById("left-area");
    if (!leftArea) return;
    leftArea.innerHTML = "";
    
    const isSearching = filterText.length > 0;

    // 정의된 분기 순서대로 출력 (데이터에 없는 분기는 건너뜀)
    QUARTER_ORDER.forEach(qKey => {
        const animeList = AnimeByQuarter[qKey];
        if (!animeList) return; // 해당 분기 데이터 없으면 패스

        // 검색 필터 적용
        const filteredList = animeList.filter(a => a.title.toLowerCase().includes(filterText.toLowerCase()));
        if (filteredList.length === 0 && isSearching) return;
        
        const targetList = isSearching ? filteredList : animeList;

        // 분기 섹션 생성
        const qSection = document.createElement("div");
        qSection.className = "quarter-section";

        // 분기 버튼
        const qBtn = document.createElement("button");
        qBtn.className = `quarter-btn ${isSearching ? 'active' : ''}`;
        qBtn.innerHTML = `<span>${qKey}</span> <span>▼</span>`;

        // 분기 내용 컨테이너
        const qContent = document.createElement("div");
        qContent.className = "quarter-content";
        qContent.style.display = isSearching ? "block" : "none";

        qBtn.onclick = () => {
            const isVisible = qContent.style.display === "block";
            qContent.style.display = isVisible ? "none" : "block";
            qBtn.classList.toggle("active", !isVisible);
        };

        // 요일별 루프
        DAY_KEYS.forEach(dKey => {
            const dayAnimes = targetList.filter(a => a.day === dKey);
            if (dayAnimes.length === 0) return;

            const dayDiv = document.createElement("div");
            
            const dBtn = document.createElement("button");
            dBtn.className = `day-btn ${isSearching ? 'active' : ''}`;
            dBtn.innerHTML = `${DAY_LABELS[dKey]} <span>▼</span>`;

            const dContent = document.createElement("div");
            dContent.className = "day-content";
            dContent.style.display = isSearching ? "grid" : "none";

            dBtn.onclick = () => {
                const isGrid = dContent.style.display === "grid";
                dContent.style.display = isGrid ? "none" : "grid";
                dBtn.classList.toggle("active", !isGrid);
            };

            dayAnimes.forEach(anime => {
                dContent.appendChild(createCard(anime));
            });

            dayDiv.appendChild(dBtn);
            dayDiv.appendChild(dContent);
            qContent.appendChild(dayDiv);
        });

        qSection.appendChild(qBtn);
        qSection.appendChild(qContent);
        leftArea.appendChild(qSection);
    });
}

// 카드 생성 함수
function createCard(anime) {
    const card = document.createElement("div");
    
    const isSelected = nominateState.step === 1 
        ? nominateState.selectedItems.some(a => a.id === anime.id)
        : (nominateState.selectedWinner && nominateState.selectedWinner.id === anime.id);

    card.className = `card ${isSelected ? 'selected' : ''}`;
    
    // 데이터 경로: image/animeimg/... -> HTML 위치 기준 ../ 추가
    const imgPath = `../${anime.thumbnail}`;

    // 배지는 데이터의 quarter("1분기")를 그대로 사용
    card.innerHTML = `
        <div class="card-badge">${anime.quarter}</div>
        <img src="${imgPath}" onerror="this.src='https://placehold.co/400x600/2f3542/ffffff?text=No+Image'" loading="lazy">
        <div class="card-info">
            <div class="card-title">${anime.title}</div>
            <div class="card-studio">${anime.studio || ''}</div>
        </div>
    `;

    card.onclick = () => handleCardClick(anime, card);
    return card;
}

// 카드 클릭 핸들러
function handleCardClick(anime, cardElement) {
    if (nominateState.step === 1) {
        const idx = nominateState.selectedItems.findIndex(a => a.id === anime.id);
        if (idx > -1) {
            nominateState.selectedItems.splice(idx, 1);
            cardElement.classList.remove('selected');
        } else {
            nominateState.selectedItems.push(anime);
            cardElement.classList.add('selected');
        }
        updatePreview();
    } else {
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        cardElement.classList.add('selected');
        nominateState.selectedWinner = anime;
        
        const awardBtn = document.getElementById("step2-award-btn");
        if(awardBtn) awardBtn.disabled = false;
    }
}

// ──────────────────────────────────────────────────────────
// 3. UI 업데이트 및 프리뷰
// ──────────────────────────────────────────────────────────
function updatePreview() {
    const previewBox = document.getElementById("preview-box");
    const nextBtn = document.getElementById("step1-next-btn");
    
    if(!previewBox) return;
    previewBox.innerHTML = ""; // 기존 내용 비우기
    
    // 선택된 항목이 없을 때 가이드 문구 (성우 페이지 스타일)
    if (nominateState.selectedItems.length === 0) {
        previewBox.innerHTML = `<div style="color:#666; text-align:center; padding-top:20px; font-size:0.85rem;">후보를 선택해주세요</div>`;
        if(nextBtn) nextBtn.disabled = true;
        return;
    }

    // 성우 페이지 방식: div 생성 후 appendChild
    nominateState.selectedItems.forEach(anime => {
        const div = document.createElement("div");
        div.className = "preview-item";
        
        // 성우 페이지와 동일하게 제목을 배치 (감독/성우 대신 애니메이션 제목만)
        div.innerHTML = `
            <div class="preview-title">${anime.title}</div>
            <div class="preview-subtitle">${anime.quarter}</div>
        `;
        
        div.onclick = () => {
            // Step 1에서만 삭제 가능
            if (nominateState.step === 1) {
                nominateState.selectedItems = nominateState.selectedItems.filter(a => a.id !== anime.id);
                updatePreview();
                
                // 메인 그리드 카드 상태 동기화
                const searchVal = document.getElementById('search-input')?.value || "";
                renderStep1(searchVal);
            }
        };
        previewBox.appendChild(div);
    });

    if(nextBtn) nextBtn.disabled = nominateState.selectedItems.length === 0;
}

// ──────────────────────────────────────────────────────────
// 4. Step 전환 및 검색
// ──────────────────────────────────────────────────────────
function goStep2() {
    nominateState.step = 2;
    const stepTitle = document.getElementById("step-title");
    if(stepTitle) stepTitle.textContent = "";
    
    // 버튼 교체
    toggleElement("nav-home-btn", false);
    toggleElement("step1-next-btn", false);
    toggleElement("step2-back-btn", true);
    toggleElement("step2-award-btn", true);
    
    const leftArea = document.getElementById("left-area");
    leftArea.innerHTML = "";
    
    const h2 = document.createElement("h2");
    h2.style.color = "var(--gold)";
    h2.textContent = "최종 후보를 선택하세요";
    leftArea.appendChild(h2);

    const gridDiv = document.createElement("div");
    gridDiv.id = "step2-grid";
    
    nominateState.selectedItems.forEach(anime => {
        gridDiv.appendChild(createCard(anime));
    });
    leftArea.appendChild(gridDiv);
}

function goStep1() {
    nominateState.step = 1;
    nominateState.selectedWinner = null;

    const stepTitle = document.getElementById("step-title");
    if(nominateState.awardName === "베스트 연출상"){
        stepTitle.textContent = "올해의 연출상 부문";
    }else if(nominateState.awardName === "베스트 동화상"){
        stepTitle.textContent = "올해의 동화상 부문";
    }else if(nominateState.awardName === "베스트 원화(작화)상"){
        stepTitle.textContent = "올해의 원화(작화)상 부문";
    }else if(nominateState.awardName === "올해의 이카루스 상"){
        stepTitle.textContent = "올해의 이카루스 상 부문";
    }else if(nominateState.awardName === "올해의 다크호스 상"){
        stepTitle.textContent = "올해의 다크호스 상 부문";
    }
    else {
        stepTitle.textContent = "";
    }

    toggleElement("nav-home-btn", true);
    toggleElement("step1-next-btn", true);
    toggleElement("step2-back-btn", false);
    toggleElement("step2-award-btn", false);
    
    const awardBtn = document.getElementById("step2-award-btn");
    if(awardBtn) awardBtn.disabled = true;

    renderStep1();
}

function toggleElement(id, show) {
    const el = document.getElementById(id);
    if(el) {
        if(show) el.classList.remove("hidden");
        else el.classList.add("hidden");
    }
}

// 검색 기능
const searchInput = document.getElementById('search-input');
const autocompleteList = document.getElementById('autocomplete-list');

if(searchInput) {
    searchInput.oninput = function() {
        const val = this.value;
        renderStep1(val);
        
        if(autocompleteList) {
            autocompleteList.innerHTML = '';
            if (!val) return;
            
            AnimeList.filter(a => a.title.toLowerCase().includes(val.toLowerCase())).slice(0, 5).forEach(match => {
                const div = document.createElement("div");
                div.textContent = match.title;
                div.onclick = () => {
                    searchInput.value = match.title;
                    autocompleteList.innerHTML = '';
                    renderStep1(match.title);
                };
                autocompleteList.appendChild(div);
            });
        }
    };
}

// ──────────────────────────────────────────────────────────
// 5. 수상 결정 및 저장
// ──────────────────────────────────────────────────────────
function openAwardPopup() {
    const winner = nominateState.selectedWinner;
    if (!winner) return;

    // 이미지 및 기본 정보
    const modalImg = document.getElementById("modal-img");
    if(modalImg) modalImg.src = `../${winner.thumbnail}`;
    
    const modalTitle = document.getElementById("modal-title");
    if(modalTitle) modalTitle.textContent = winner.title;
    
    // [중요] 변경된 데이터 구조 매핑 (staff 객체 접근)
    // 1. 분기: 데이터에 "1분기"라고 되어 있으므로 그대로 사용
    setText("modal-quarter", winner.quarter);
    
    // 2. 감독: staff.director 배열을 문자열로 결합 (데이터가 없을 경우 방어 코드 작성)
    const directorText = (winner.staff && winner.staff.director) 
        ? winner.staff.director.join(", ") 
        : "정보 없음";
    setText("modal-director", directorText);

    // 3. 제작사
    setText("modal-studio", winner.studio || "-");
    
    const modal = document.getElementById("winner-modal");
    if(modal) modal.classList.remove("hidden");
    
    fireConfetti();
    saveAwardResult(winner);
}

function setText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}

function saveAwardResult(winner) {
    const currentResults = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    const awardName = nominateState.awardName; 

    const top3Ranks = ["대상", "최우수상", "우수상"];
    const isTop3 = top3Ranks.includes(awardName);
    const finalThumb = `../${winner.thumbnail}`;

    if (isTop3) {
        const top3Key = "올해의 애니메이션";
        let top3List = currentResults[top3Key];

        if (Array.isArray(top3List)) {
            const targetIndex = top3List.findIndex(item => item.rank === awardName);
            if (targetIndex !== -1) {
                top3List[targetIndex].title = winner.title;
                top3List[targetIndex].thumbnail = finalThumb;
            } else {
                top3List.push({ rank: awardName, title: winner.title, thumbnail: finalThumb });
            }
        } else {
            currentResults[top3Key] = [{ rank: awardName, title: winner.title, thumbnail: finalThumb }];
        }
    } else {
        currentResults[awardName] = { title: winner.title, thumbnail: finalThumb };
    }

    localStorage.setItem("anime_awards_result", JSON.stringify(currentResults));
    console.log("Saved:", awardName, winner.title);
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
// 6. 이벤트 바인딩 및 초기화
// ──────────────────────────────────────────────────────────
const btnNext = document.getElementById("step1-next-btn");
if(btnNext) btnNext.onclick = goStep2;

const btnBack = document.getElementById("step2-back-btn");
if(btnBack) btnBack.onclick = goStep1;

const btnAward = document.getElementById("step2-award-btn");
if(btnAward) btnAward.onclick = openAwardPopup;

const btnHome = document.getElementById("nav-home-btn");
if(btnHome) btnHome.onclick = () => location.href = "../main/main.html";

const btnGoMain = document.getElementById("go-main-btn");
if(btnGoMain) btnGoMain.onclick = () => location.href = "../main/main.html";

// 초기 실행
renderStep1();