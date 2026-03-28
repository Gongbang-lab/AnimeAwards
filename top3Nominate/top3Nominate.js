const state = {
    step: 1,
    selectedCandidates: [], 
    finalTop3: [],         
    allAnime: (typeof AnimeList !== 'undefined') ? AnimeList : [] 
};

const DAY_LABELS = { "Mondays":"월요일", "Tuesdays":"화요일", "Wednesdays":"수요일", "Thursdays":"목요일", "Fridays":"금요일", "Saturdays":"토요일", "Sundays":"일요일", "Anomaly":"변칙 편성", "Web":"웹" };
const RANK_NAMES = ["우수상", "최우수상", "대상"];

document.addEventListener("DOMContentLoaded", () => {
    if(state.allAnime.length === 0) {
        console.error("AnimeList 데이터를 불러오지 못했습니다. 경로를 확인해주세요.");
    }

    // 초기 렌더링 (검색어 없음)
    renderStep1(); 
    
    // 검색창 이벤트 바인딩 (실시간 필터링)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.placeholder = "애니 제목 검색";
        searchInput.addEventListener('input', (e) => {
            renderStep1(e.target.value);
        });
    }
    
    // 버튼 이벤트 바인딩
    document.getElementById('next-btn').addEventListener('click', () => {
        if (state.step === 1) goStep2();
        else showResult();
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (state.step === 2) {
            state.step = 1;
            state.finalTop3 = [];
            
            const searchArea = document.querySelector('.search-container');
            const statusIndicator = document.querySelector('.status-indicator');
            const previewBox = document.getElementById('preview-box');
            
            if (searchArea) searchArea.classList.remove('hidden');
            if (statusIndicator) statusIndicator.classList.remove('hidden');
            if (previewBox) previewBox.classList.remove('hidden');
            
            renderStep1(); // 복귀 시 다시 렌더링
        } else {
            location.href = "../index.html";
        }
    });

    document.getElementById('save-main-btn').addEventListener('click', () => {
        location.href = "../index.html";
    });
});

function renderStep1(searchTerm = "") {
    state.step = 1;
    document.getElementById('step-title').textContent = "올해의 시리즈 부문";
    const nextBtn = document.getElementById('next-btn');
    nextBtn.textContent = "다음 단계";
    document.getElementById('rank-status').classList.add('hidden');
    
    const display = document.getElementById('main-display');
    display.innerHTML = ""; 

    const isSearching = searchTerm.trim() !== "";
    const lowerTerm = searchTerm.toLowerCase().trim();

    // 1. 데이터 필터링 (제목 또는 제작사)
    let filteredData = state.allAnime;
    if (isSearching) {
        filteredData = state.allAnime.filter(item => 
            item.title.toLowerCase().includes(lowerTerm) || 
            (item.studio && item.studio.toLowerCase().includes(lowerTerm))
        );
    }

    if (filteredData.length === 0) {
        display.innerHTML = `<div style="color:#888; text-align:center; padding:40px;">검색 결과가 없습니다.</div>`;
        return;
    }

    // 2. 데이터 그룹화
    const grouped = {};
    filteredData.forEach(item => {
        const q = item.quarter || "기타 분기";
        if (!grouped[q]) grouped[q] = {};
        if (!grouped[q][item.day]) grouped[q][item.day] = [];
        grouped[q][item.day].push(item);
    });

    // 3. 렌더링
    Object.keys(grouped).sort().forEach(q => {
        const section = document.createElement('div');
        section.className = 'quarter-section';
        
        const qBtn = document.createElement('button');
        qBtn.className = 'quarter-btn';
        
        const qWrapper = document.createElement('div');
        
        // 검색 중이면 자동 펼침
        if (isSearching) {
            qWrapper.className = ''; 
            qBtn.className = 'quarter-btn active';
            qBtn.innerHTML = `<span>${q}</span> <span>▲</span>`;
        } else {
            qWrapper.className = 'hidden'; 
            qBtn.innerHTML = `<span>${q}</span> <span>▼</span>`;
        }

        qBtn.onclick = () => {
            qBtn.classList.toggle('active');
            qWrapper.classList.toggle('hidden');
            qBtn.querySelector('span:last-child').textContent = qWrapper.classList.contains('hidden') ? '▼' : '▲';
        };

        Object.keys(grouped[q]).forEach(day => {
            const dBtn = document.createElement('button');
            dBtn.className = 'day-btn';
            
            const dContent = document.createElement('div');
            
            if (isSearching) {
                dContent.className = 'day-content';
                dBtn.className = 'day-btn active';
                dBtn.innerHTML = `<span>${DAY_LABELS[day] || day}</span> <span>-</span>`;
            } else {
                dContent.className = 'day-content hidden';
                dBtn.innerHTML = `<span>${DAY_LABELS[day] || day}</span> <span>+</span>`;
            }

            grouped[q][day].forEach(anime => {
                const card = createCard(anime, false, searchTerm);
                dContent.appendChild(card);
            });

            dBtn.onclick = () => {
                dBtn.classList.toggle('active');
                dContent.classList.toggle('hidden');
                dBtn.querySelector('span:last-child').textContent = dContent.classList.contains('hidden') ? '+' : '-';
            };

            qWrapper.appendChild(dBtn);
            qWrapper.appendChild(dContent);
        });

        section.appendChild(qBtn);
        section.appendChild(qWrapper);
        display.appendChild(section);
    });
    
    updatePreview();
}

// ==========================================
// STEP 1: 아코디언 리스트 생성 (CSS 100% 매칭)
// ==========================================
function initStep1() {
    state.step = 1;
    document.getElementById('step-title').textContent = "올해의 시리즈 부문";
    document.getElementById('next-btn').textContent = "다음 단계";
    document.getElementById('rank-status').classList.add('hidden');
    
    const display = document.getElementById('main-display');
    display.innerHTML = ""; 

    // 데이터 그룹화
    const grouped = {};
    state.allAnime.forEach(item => {
        const q = item.quarter || "기타 분기";
        if (!grouped[q]) grouped[q] = {};
        if (!grouped[q][item.day]) grouped[q][item.day] = [];
        grouped[q][item.day].push(item);
    });

    // 오름차순 정렬을 위해 .reverse()를 제거하고 정렬만 수행
    // 예: 2024년 1분기 -> 2024년 2분기 순으로 정렬됩니다.
    Object.keys(grouped).sort().forEach(q => {
        const section = document.createElement('div');
        section.className = 'quarter-section';
        
        const qBtn = document.createElement('button');
        qBtn.className = 'quarter-btn';
        qBtn.innerHTML = `<span>${q}</span> <span>▼</span>`;
        
        const qWrapper = document.createElement('div');
        qWrapper.className = 'hidden'; 

        qBtn.onclick = () => {
            qBtn.classList.toggle('active');
            qWrapper.classList.toggle('hidden');
            qBtn.querySelector('span:last-child').textContent = qWrapper.classList.contains('hidden') ? '▼' : '▲';
        };

        // 요일 버튼 및 카드 그리드
        Object.keys(grouped[q]).forEach(day => {
            const dBtn = document.createElement('button');
            dBtn.className = 'day-btn';
            dBtn.innerHTML = `<span>${DAY_LABELS[day] || day}</span> <span>+</span>`;
            
            const dContent = document.createElement('div');
            dContent.className = 'day-content hidden'; 

            grouped[q][day].forEach(anime => {
                const card = createCard(anime, false);
                dContent.appendChild(card);
            });

            dBtn.onclick = () => {
                dBtn.classList.toggle('active');
                dContent.classList.toggle('hidden');
                dBtn.querySelector('span:last-child').textContent = dContent.classList.contains('hidden') ? '+' : '-';
            };

            qWrapper.appendChild(dBtn);
            qWrapper.appendChild(dContent);
        });

        section.appendChild(qBtn);
        section.appendChild(qWrapper);
        display.appendChild(section);
    });
    
    updatePreview();
}

// 공통 카드 생성 함수 (CSS 구조 완벽 일치)
function createCard(anime, isStep2, searchTerm = "") {
    const isSelected = state.selectedCandidates.some(c => c.id === anime.id);
    const div = document.createElement('div');
    div.className = `card ${!isStep2 && isSelected ? 'selected' : ''}`;
    
    let displayTitle = anime.title;
    if (searchTerm && !isStep2) {
        const regex = new RegExp(searchTerm.trim(), "gi");
        displayTitle = anime.title.replace(regex, (match) => `<span style="color:var(--gold);">${match}</span>`);
    }

    div.innerHTML = `
        <div class="card-badge">${anime.quarter}</div>
        <div class="rank-overlay"></div> 
        <img src="../${anime.thumbnail}" onerror="this.src='https://placehold.co/180x240?text=No+Image'" alt="${anime.title}">
        <div class="card-info">
            <div class="card-title">${displayTitle}</div>
            <div class="card-studio">${anime.studio || '정보 없음'}</div>
        </div>
    `;

    div.onclick = () => {
        if (!isStep2) {
            const idx = state.selectedCandidates.findIndex(c => c.id === anime.id);
            if (idx > -1) {
                state.selectedCandidates.splice(idx, 1);
                div.classList.remove('selected');
            } else {
                state.selectedCandidates.push(anime);
                div.classList.add('selected');
            }
            updatePreview();
        } else {
            const topIdx = state.finalTop3.findIndex(c => c.id === anime.id);
            if (topIdx > -1) {
                state.finalTop3.splice(topIdx, 1);
            } else if (state.finalTop3.length < 3) {
                state.finalTop3.push(anime);
            }
            updateStep2UI();
        }
    };
    return div;
}
// 사이드바 미리보기 업데이트
function updatePreview() {
    const pBox = document.getElementById("preview-box");
    const nextBtn = document.getElementById("next-btn");
    
    if (!pBox) return;
    pBox.innerHTML = "";

    if (state.selectedCandidates.length === 0) {
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    if (nextBtn) nextBtn.disabled = state.selectedCandidates.length < 3;

    state.selectedCandidates.forEach(anime => {
        const item = document.createElement("div");
        item.className = "preview-item";
        item.innerHTML = `
            ${anime.title}
            <small>${anime.studio || ''}</small>
        `;
        
        item.onclick = () => {
            state.selectedCandidates = state.selectedCandidates.filter(a => a.id !== anime.id);
            // 현재 입력된 검색어를 유지하며 리스트 갱신
            const currentSearch = document.getElementById('search-input').value;
            renderStep1(currentSearch); 
        };
        pBox.appendChild(item);
    });
}

// ==========================================
// STEP 2: 순위 결정 (우수 -> 최우수 -> 대상)
// ==========================================
function goStep2() {
    state.step = 2;
    state.finalTop3 = [];
    document.getElementById('step-title').textContent = "최종 후보 순위 결정";
    document.getElementById('next-btn').textContent = "수상 결정";
    document.getElementById('next-btn').disabled = true;
    document.getElementById('rank-status').classList.remove('hidden');

    // [추가] Step 2 진입 시 검색창, 상태 표시줄, 프리뷰 박스 숨김
    const searchArea = document.querySelector('.search-container');
    const statusIndicator = document.querySelector('.status-indicator');
    const previewBox = document.getElementById('preview-box');
    
    if (searchArea) searchArea.classList.add('hidden');
    if (statusIndicator) statusIndicator.classList.add('hidden');
    if (previewBox) previewBox.classList.add('hidden');

    const display = document.getElementById('main-display');
    // CSS에 정의된 #step2-grid 사용
    display.innerHTML = `<div id="step2-grid"></div>`;
    const grid = document.getElementById('step2-grid');

    state.selectedCandidates.forEach(anime => {
        const card = createCard(anime, true);
        grid.appendChild(card);
    });
    updateStep2UI();
}

function updateStep2UI() {
    const cards = document.querySelectorAll('#step2-grid .card');
    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent;
        const rankIdx = state.finalTop3.findIndex(c => c.title === title);
        const overlay = card.querySelector('.rank-overlay');
        const badge = card.querySelector('.card-badge');
        
        card.classList.remove('selected');
        card.removeAttribute('data-rank');
        overlay.textContent = ""; 

        if (rankIdx > -1) {
            const rankName = RANK_NAMES[rankIdx];
            card.classList.add('selected');
            card.setAttribute('data-rank', rankName);
            
            // 중앙 오버레이에 순위 텍스트 삽입
            overlay.textContent = rankName;
            
            // 뱃지는 깔끔하게 숨기거나 기본 분기 유지
            badge.style.opacity = "0"; 
        } else {
            badge.style.opacity = "1";
        }
    });
    
    document.getElementById('next-btn').disabled = state.finalTop3.length < 3;
}

// ==========================================
// 모달 및 기타 편의 기능
// ==========================================
function showResult() {
    const modal = document.getElementById('result-modal');
    const body = document.getElementById('modal-body');
    
    // 데이터 저장 실행
    saveToLocalStorage();

    // finalTop3 구조: [0: 우수, 1: 최우수, 2: 대상]
    const [bronze, silver, gold] = state.finalTop3;

    body.innerHTML = `
        <div class="winner-layout">
            <div class="winner-card">
                <span class="winner-rank-label">우수상</span>
                <img src="../${bronze.thumbnail}" onerror="this.src='https://placehold.co/180x240?text=No+Image'">
                <div class="winner-card-title">${bronze.title}</div>
            </div>

            <div class="winner-card grand-prize">
                <span class="winner-rank-label">🏆 대상 🏆</span>
                <img src="../${gold.thumbnail}" onerror="this.src='https://placehold.co/180x240?text=No+Image'">
                <div class="winner-card-title">${gold.title}</div>
            </div>

            <div class="winner-card">
                <span class="winner-rank-label">최우수상</span>
                <img src="../${silver.thumbnail}" onerror="this.src='https://placehold.co/180x240?text=No+Image'">
                <div class="winner-card-title">${silver.title}</div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    fireConfetti();
}

function saveToLocalStorage() {
    try {
        // 기존 결과 불러오기 (없으면 빈 객체)
        const currentResults = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
        
        // 현재 어워드 이름 (예: "2024 애니메이션 어워드" 등, 필요시 state에 추가 가능)
        // 여기서는 기본값으로 "TOP3_Awards"를 사용합니다.
        const awardName = "TOP3_Awards"; 
        
        // 제공해주신 구조에 맞춰 데이터 매핑 (우수, 최우수, 대상 순서)
        const resultData = state.finalTop3.map((anime, idx) => ({
            rank: RANK_NAMES[idx],
            title: anime.title,
            thumbnail: anime.thumbnail
        }));

        currentResults[awardName] = resultData;
        
        // 데이터 저장
        localStorage.setItem("anime_awards_result", JSON.stringify(currentResults));
        console.log("결과가 성공적으로 저장되었습니다:", currentResults);
        
    } catch (error) {
        console.error("localStorage 저장 중 오류 발생:", error);
    }
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