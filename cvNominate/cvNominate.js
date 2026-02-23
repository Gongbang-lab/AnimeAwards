/**
 * 상태 관리
 */
const cvState = {
    step: 1,
    theme: new URLSearchParams(location.search).get("theme") || "character_male",
    currentAward: new URLSearchParams(location.search).get("awardName") || "올해의 성우상",
    selectedCVs: [], 
    finalWinner: null
};

document.addEventListener("DOMContentLoaded", () => {
    // 검색 이벤트 바인딩
    document.getElementById("search-input").addEventListener("input", (e) => {
        renderCVStep1(e.target.value);
    });

    // 버튼 이벤트 바인딩
    document.getElementById("btn-next").onclick = goStep2;
    document.getElementById("btn-back").onclick = handleBack;
    document.getElementById("final-confirm-btn").onclick = () => location.href = "../main/main.html";

    renderCVStep1();
});

/**
 * Step 1: 성우 리스트 렌더링 (아코디언 스타일 적용)
 */
function renderCVStep1(searchTerm = "") {
    const mainContent = document.getElementById("main-content");
    const stepTitle = document.getElementById("step-title");
    
    if (cvState.step === 1) {
        mainContent.innerHTML = ""; // 초기화
        
        const genderKey = cvState.theme.includes("female") ? "female" : "male";
        if (genderKey === "female") {
            stepTitle.textContent = "올해의 여자 성우상 부문";
        } else {
            stepTitle.textContent = "올해의 남자 성우상 부문";
        }
        // 1. 데이터 필터링
        let filteredList = Object.values(CharacterVoiceData)
            .filter(cv => String(cv.gender).toLowerCase() === genderKey);

        if (searchTerm.trim() !== "") {
            filteredList = filteredList.filter(cv => 
                cv.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
            );
        }

        // 2. 그룹화 (작품 수 기준)
        const groups = {};
        filteredList.forEach(cv => {
            const count = cv.characters ? cv.characters.length : 0;
            const groupKey = `${count}개 작품 참여`;
            if (!groups[groupKey]) groups[groupKey] = { count: count, list: [] };
            groups[groupKey].list.push(cv);
        });

        const sortedGroupKeys = Object.keys(groups).sort((a, b) => groups[b].count - groups[a].count);

        // 3. 렌더링 (CSS 클래스 .quarter-section 활용)
        sortedGroupKeys.forEach(groupKey => {
            const groupData = groups[groupKey];
            groupData.list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));

            // 섹션 컨테이너
            const section = document.createElement("div");
            section.className = "quarter-section";

            // 헤더 버튼
            const btn = document.createElement("button");
            btn.className = "quarter-btn";
            btn.innerHTML = `<span>${groupKey}</span> <span>▼</span>`;
            
            // 콘텐츠 그리드
            const content = document.createElement("div");
            content.className = "day-content";
            content.style.display = "none"; // 기본 숨김

            // 검색 중이면 자동 펼침
            if (searchTerm) {
                content.style.display = "grid";
                btn.classList.add("active");
            }

            // 토글 이벤트
            btn.onclick = () => {
                const isOpen = content.style.display === "grid";
                content.style.display = isOpen ? "none" : "grid";
                btn.classList.toggle("active", !isOpen);
            };

            // 카드 생성
            groupData.list.forEach(cv => {
                content.appendChild(createCVCard(cv, "step1"));
            });

            section.appendChild(btn);
            section.appendChild(content);
            mainContent.appendChild(section);
        });
    }
}

/**
 * 카드 생성 함수 (CSS .card 클래스 사용)
 */
function createCVCard(cv, step) {
    const card = document.createElement("div");
    card.className = "card";
    
    // 1. 배지 생성 (클릭 시 상세 정보 팝업)
    const badge = document.createElement("div");
    badge.className = "card-badge";
    badge.textContent = `${cv.characters.length}작품`;
    
    badge.onclick = (e) => {
        e.stopPropagation(); // 카드 전체 클릭 이벤트(선택) 방지
        openDetailModal(cv);
    };
    
    // 2. 카드 상태 설정 (이미 선택된 경우)
    const isSelected = cvState.selectedCVs.some(v => v.name === cv.name);
    if (step === "step1" && isSelected) card.classList.add("selected");

    // 3. 카드 내부 레이아웃
    card.innerHTML = `
        <img src="${cv.cvimg}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300'">
        <div class="card-info">
            <div class="card-title">${cv.name}</div>
        </div>
    `;
    
    card.prepend(badge); // 배지를 카드 맨 위에 배치

    // 4. 카드 본체 클릭 이벤트
    card.onclick = () => {
        if (step === "step1") {
            // Step 1: 다중 선택 및 프리뷰 업데이트
            toggleCVSelection(cv, card);
        } else {
            // Step 2: 단일 선택 (최종 투표)
            document.querySelectorAll("#step2-grid .card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            cvState.finalWinner = cv;
            document.getElementById("btn-next").disabled = false;
        }
    };

    return card;
}

/**
 * 선택 및 프리뷰 로직
 */
function toggleCVSelection(cv, cardElement) {
    const index = cvState.selectedCVs.findIndex(v => v.name === cv.name);
    
    if (index > -1) {
        // 이미 선택된 경우 제거
        cvState.selectedCVs.splice(index, 1);
        cardElement.classList.remove("selected");
    } else {
        // 새로 선택하는 경우 추가
        cvState.selectedCVs.push(cv);
        cardElement.classList.add("selected");
    }
    
    // 오른쪽 사이드바 프리뷰 박스 새로고침
    updatePreview();
}

function updatePreview() {
    const list = document.getElementById("preview-list");
    const nextBtn = document.getElementById("btn-next");

    if (!list) return;
    
    list.innerHTML = ""; // 초기화

    cvState.selectedCVs.forEach(cv => {
        // 애니송 페이지와 동일한 preview-item 구조
        const div = document.createElement("div");
        div.className = "preview-item";
        div.innerHTML = `
            ${cv.name}
            <br><small style="color:#888;">${cv.characters.length}개 작품 참여</small>
        `;
        
        // 클릭 시 삭제 실행
        div.onclick = () => {
            removeCV(cv.name);
        };
        
        list.appendChild(div);
    });

    if (nextBtn) {
        nextBtn.disabled = cvState.selectedCVs.length === 0;
    }
}

function removeCV(name) {
    // 1. 데이터에서 삭제
    const index = cvState.selectedCVs.findIndex(v => v.name === name);
    if (index > -1) {
        cvState.selectedCVs.splice(index, 1);
    }

    // 2. 메인 화면 카드 UI 체크 해제
    const cards = document.querySelectorAll(".card");
    cards.forEach(c => {
        const title = c.querySelector(".card-title");
        if (title && title.textContent === name) {
            c.classList.remove("selected");
        }
    });

    // 3. 프리뷰 재갱신
    updatePreview();
}

/**
 * Step 이동 로직
 */
function goStep2() {
    if (cvState.step === 1) {
        cvState.step = 2;
        document.getElementById("step-title").textContent = "최종 수상자를 투표해주세요";
        
        // 사이드바 버튼 변경
        document.getElementById("btn-back").textContent = "이전으로";
        const nextBtn = document.getElementById("btn-next");
        nextBtn.textContent = "수상 결정";
        nextBtn.disabled = true;

        // 메인 콘텐츠 교체 (그리드 뷰)
        const mainContent = document.getElementById("main-content");
        mainContent.innerHTML = `<div id="step2-grid"></div>`;
        const grid = document.getElementById("step2-grid");

        cvState.selectedCVs.forEach(cv => {
            grid.appendChild(createCVCard(cv, "step2"));
        });
    } else {
        // 최종 투표 완료
        openWinnerModal();
    }
}

function handleBack() {
    if (cvState.step === 2) {
        cvState.step = 1;
        document.getElementById("btn-back").textContent = "메인으로";
        document.getElementById("btn-next").textContent = "다음 단계";
        document.getElementById("btn-next").disabled = false;
        renderCVStep1(); // Step 1 다시 렌더링 (선택 상태 유지됨)
        // 선택된 카드들 다시 표시
        setTimeout(() => {
             cvState.selectedCVs.forEach(cv => {
                 // 화면에 있는 카드 찾아서 selected 클래스 추가하는 로직 필요하나
                 // renderCVStep1 내부에서 이미 처리함
             });
        }, 50);
    } else {
        location.href = "../main/main.html";
    }
}

/**
 * 모달 관련 함수
 */
function openDetailModal(cv) {
    const modal = document.getElementById("cv-detail-modal");
    const nameEl = document.getElementById("detail-name");
    const imgEl = document.getElementById("detail-img");
    const worksContainer = document.getElementById("detail-works");

    nameEl.textContent = `${cv.name} 참여 작품`;
    imgEl.src = cv.cvimg;
    
    // 캐릭터 이미지와 애니 제목을 함께 보여주는 리스트 형식으로 생성
    worksContainer.innerHTML = cv.characters.map(char => `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; background: #222; padding: 10px; border-radius: 8px;">
            <img src="${char.img}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 1px solid var(--gold);">
            <div>
                <div style="color: var(--gold); font-weight: bold; font-size: 0.9rem;">${char.animeTitle}</div>
                <div style="color: #fff; font-size: 1rem;">${char.charName} 역</div>
            </div>
        </div>
    `).join('');
    
    modal.classList.remove("hidden");
}

function openWinnerModal() {
    const winner = cvState.finalWinner;
    if (!winner) return;

    // 1. 이미지 설정
    document.getElementById("winner-img").src = winner.cvimg;

    // 2. 우측 콘텐츠 생성 (이름 + 모든 작품 리스트)
    const infoContent = document.getElementById("winner-info-content");
    
    // 작품 리스트 HTML 생성
    const worksListHTML = winner.characters.map(char => `
        <div class="info-row">
            <span class="info-label">${char.animeTitle}</span>
            <span class="info-value">${char.charName} 역</span>
        </div>
    `).join('');

    // 전체 구조 주입
    infoContent.innerHTML = `
        <div class="info-row" style="border-bottom: 2px solid var(--gold); margin-bottom: 15px; padding-bottom: 15px;">
            <span class="info-label" style="font-size: 1.4rem;">수상자</span>
            <span class="info-value" style="font-size: 1.4rem; color: #fff; font-weight: bold;">${winner.name}</span>
        </div>
        <div class="winner-works-scroll" style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
            ${worksListHTML}
        </div>
    `;

    // 3. 모달 표시 및 폭죽
    document.getElementById("winner-modal").classList.remove("hidden");
    fireConfetti();

    // 4. 로컬스토리지 저장 (결과창 연동용)
    saveResult(winner);
}

function saveResult(winner) {
    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results[cvState.currentAward] = {
        name: winner.name,
        thumbnail: winner.cvimg,
        works: winner.characters.map(c => c.charName).join(', ')
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