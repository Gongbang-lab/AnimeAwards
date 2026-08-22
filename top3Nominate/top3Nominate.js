const top3State = {
    step: 1,
    selectedCandidates: [], 
    finalTop3: [],
    awardName: "TOP3_Awards",   // ✅ 추가: 다른 파일들과 통일 (함수 내부 하드코딩 제거)
    // ✅ 수정: AnimeList_2026 → AnimeList(별칭), 불필요한 이중 방어 코드 단순화
    allAnime: (typeof AnimeList !== 'undefined') ? SeasonFilter.filterAnimeList(AnimeList) : []
};

const DAY_LABELS = { "Mondays":"월요일", "Tuesdays":"화요일", "Wednesdays":"수요일", "Thursdays":"목요일", "Fridays":"금요일", "Saturdays":"토요일", "Sundays":"일요일", "Anomaly":"변칙 편성", "Web":"웹" };
const RANK_NAMES = ["우수상", "최우수상", "대상"];

document.addEventListener("DOMContentLoaded", () => {
    if(top3State.allAnime.length === 0) {
        console.error("AnimeList 데이터를 불러오지 못했습니다. 경로를 확인해주세요.");
    }

    renderStep1(); 
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.placeholder = "애니 제목 검색";
        searchInput.addEventListener('input', (e) => {
            renderStep1(e.target.value);
        });
    }
    
    document.getElementById('next-btn').addEventListener('click', () => {
        if (top3State.step === 1) goStep2();
        else showResult();
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (top3State.step === 2) {
            top3State.step = 1;
            top3State.finalTop3 = [];
            
            const searchArea = document.querySelector('.search-container');
            const statusIndicator = document.querySelector('.status-indicator');
            const previewBox = document.getElementById('preview-box');
            
            if (searchArea) searchArea.classList.remove('hidden');
            if (statusIndicator) statusIndicator.classList.remove('hidden');
            if (previewBox) previewBox.classList.remove('hidden');
            
            renderStep1();
        } else {
            location.href = "../index.html";
        }
    });

    document.getElementById('save-main-btn').addEventListener('click', () => {
        location.href = "../index.html";
    });
});

function renderStep1(searchTerm = "") {
    top3State.step = 1;
    document.getElementById('step-title').textContent = "올해의 시리즈 부문";
    const nextBtn = document.getElementById('next-btn');
    nextBtn.textContent = "다음 단계";
    document.getElementById('rank-status').classList.add('hidden');
    
    const display = document.getElementById('main-display');
    display.innerHTML = ""; 

    const isSearching = searchTerm.trim() !== "";
    const lowerTerm = searchTerm.toLowerCase().trim();

    let filteredData = top3State.allAnime;
    if (isSearching) {
        filteredData = top3State.allAnime.filter(item => {
            const matchTitle = item.title.toLowerCase().includes(lowerTerm);
            const matchStudio = Array.isArray(item.studio) && 
                item.studio.some(s => s.toLowerCase().includes(lowerTerm));
            return matchTitle || matchStudio;
        });
    }

    if (filteredData.length === 0) {
        display.innerHTML = `<div style="color:#888; text-align:center; padding:40px;">검색 결과가 없습니다.</div>`;
        return;
    }

    const grouped = {};
    filteredData.forEach(item => {
        const q = item.quarter || "기타 분기";
        if (!grouped[q]) grouped[q] = {};
        if (!grouped[q][item.day]) grouped[q][item.day] = [];
        grouped[q][item.day].push(item);
    });

    Object.keys(grouped).sort().forEach(q => {
        const section = document.createElement('div');
        section.className = 'quarter-section';
        
        const qBtn = document.createElement('button');
        qBtn.className = 'quarter-btn';
        
        const qWrapper = document.createElement('div');
        
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

// 공통 카드 생성 함수
function createCard(anime, isStep2, searchTerm = "") {
    const isSelected = top3State.selectedCandidates.some(c => c.id === anime.id);
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
            <div class="card-studio">${Array.isArray(anime.studio) ? anime.studio.join(', ') : (anime.studio || '정보 없음')}</div>
        </div>
    `;

    div.onclick = () => {
        if (!isStep2) {
            const idx = top3State.selectedCandidates.findIndex(c => c.id === anime.id);
            if (idx > -1) {
                top3State.selectedCandidates.splice(idx, 1);
                div.classList.remove('selected');
            } else {
                top3State.selectedCandidates.push(anime);
                div.classList.add('selected');
            }
            updatePreview();
        } else {
            const topIdx = top3State.finalTop3.findIndex(c => c.id === anime.id);
            if (topIdx > -1) {
                top3State.finalTop3.splice(topIdx, 1);
            } else if (top3State.finalTop3.length < 3) {
                top3State.finalTop3.push(anime);
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

    if (top3State.selectedCandidates.length === 0) {
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    if (nextBtn) nextBtn.disabled = top3State.selectedCandidates.length < 3;

    top3State.selectedCandidates.forEach(anime => {
        const item = document.createElement("div");
        item.className = "preview-item";
        // ✅ 수정: studio 배열 처리
        const studioText = Array.isArray(anime.studio) ? anime.studio.join(', ') : (anime.studio || '');
        item.innerHTML = `
            ${anime.title}
            <small>${studioText}</small>
        `;
        
        item.onclick = () => {
            top3State.selectedCandidates = top3State.selectedCandidates.filter(a => a.id !== anime.id);
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
    top3State.step = 2;
    top3State.finalTop3 = [];
    document.getElementById('step-title').textContent = "최종 후보 순위 결정";
    document.getElementById('next-btn').textContent = "수상 결정";
    document.getElementById('next-btn').disabled = true;
    document.getElementById('rank-status').classList.remove('hidden');

    const searchArea = document.querySelector('.search-container');
    const statusIndicator = document.querySelector('.status-indicator');
    const previewBox = document.getElementById('preview-box');
    
    if (searchArea) searchArea.classList.add('hidden');
    if (statusIndicator) statusIndicator.classList.add('hidden');
    if (previewBox) previewBox.classList.add('hidden');

    const display = document.getElementById('main-display');
    display.innerHTML = `<div id="step2-grid"></div>`;
    const grid = document.getElementById('step2-grid');

    top3State.selectedCandidates.forEach(anime => {
        const card = createCard(anime, true);
        grid.appendChild(card);
    });
    updateStep2UI();
}

function updateStep2UI() {
    const cards = document.querySelectorAll('#step2-grid .card');
    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent;
        const rankIdx = top3State.finalTop3.findIndex(c => c.title === title);
        const overlay = card.querySelector('.rank-overlay');
        const badge = card.querySelector('.card-badge');
        
        card.classList.remove('selected');
        card.removeAttribute('data-rank');
        overlay.textContent = ""; 

        if (rankIdx > -1) {
            const rankName = RANK_NAMES[rankIdx];
            card.classList.add('selected');
            card.setAttribute('data-rank', rankName);
            
            overlay.textContent = rankName;
            badge.style.opacity = "0"; 
        } else {
            badge.style.opacity = "1";
        }
    });
    
    document.getElementById('next-btn').disabled = top3State.finalTop3.length < 3;
}

// ==========================================
// 모달 및 기타 편의 기능
// ==========================================
function showResult() {
    const modal = document.getElementById('result-modal');
    const body = document.getElementById('modal-body');
    
    saveToLocalStorage();

    const [bronze, silver, gold] = top3State.finalTop3;

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
        const currentResults = ResultStorage.getResults();
        
        const resultData = top3State.finalTop3.map((anime, idx) => ({
            rank: RANK_NAMES[idx],
            title: anime.title,
            thumbnail: anime.thumbnail
        }));

        currentResults[top3State.awardName] = resultData;
        
        ResultStorage.saveResults(currentResults);
        console.log("결과가 성공적으로 저장되었습니다:", currentResults);

        // ✅ 추가: 다른 파일들과 통일 (Firebase 투표 집계 제출)
        if (window.submitSingleAwardToDB) {
            window.submitSingleAwardToDB(top3State.awardName);
        }
        
    } catch (error) {
        console.error("localStorage 저장 중 오류 발생:", error);
    }
}

function fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            zIndex: 9999,
            colors: ['#d4af37', '#ffffff']
        });
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