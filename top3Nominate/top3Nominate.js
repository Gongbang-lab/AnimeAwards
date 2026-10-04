const top3State = {
    step: 1,
    selectedCandidates: [], 
    finalTop3: [],
    awardName: "TOP3_Awards",   // ✅ 추가: 다른 파일들과 통일 (함수 내부 하드코딩 제거)
    // ✅ 수정: AnimeList_2026 → AnimeList(별칭), 불필요한 이중 방어 코드 단순화
    allAnime: (typeof AnimeList !== 'undefined') ? SeasonFilter.filterAnimeList(AnimeList) : []
};

const DAY_LABELS = { "Mondays":"월요일", "Tuesdays":"화요일", "Wednesdays":"수요일", "Thursdays":"목요일", "Fridays":"금요일", "Saturdays":"토요일", "Sundays":"일요일", "Anomaly":"변칙 편성", "Web":"웹", "Cinema":"극장판" };
const RANK_NAMES = ["우수상", "최우수상", "대상"];
const DAY_ORDER = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays", "Anomaly", "Web", "Cinema"];

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
    document.getElementById('step-title').textContent = `${SeasonFilter.toDisplayAwardName("올해의 시리즈")} 부문`;
    const nextBtn = document.getElementById('next-btn');
    nextBtn.textContent = "다음 단계";
    document.getElementById('rank-status').classList.add('hidden');
    
    const display = document.getElementById('main-display');
    display.innerHTML = ""; 

    const isSearching = searchTerm.trim() !== "";
    const lowerTerm = searchTerm.toLowerCase().trim();
    const selectedQuarter = SeasonFilter.getSelectedSeason().quarter;
    const showQuarterAccordion = !selectedQuarter || selectedQuarter === "모든 분기";

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
        let section = null;
        let qWrapper = display;
        if (showQuarterAccordion) {
            section = document.createElement('div');
            section.className = 'quarter-section';
            const qBtn = document.createElement('button');
            qBtn.className = 'quarter-btn';
            qWrapper = document.createElement('div');
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
            section.append(qBtn, qWrapper);
        }

        const orderedDays = Object.keys(grouped[q]).sort((a, b) => {
            const indexA = DAY_ORDER.indexOf(a);
            const indexB = DAY_ORDER.indexOf(b);
            return (indexA < 0 ? DAY_ORDER.length : indexA)
                - (indexB < 0 ? DAY_ORDER.length : indexB);
        });
        orderedDays.forEach(day => {
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

        if (showQuarterAccordion) display.appendChild(section);
    });
    
    updatePreview();
}

// 공통 카드 생성 함수
function createCard(anime, isStep2, searchTerm = "") {
    const isSelected = top3State.selectedCandidates.some(c => c.id === anime.id);
    const div = document.createElement('div');
    if (!isStep2) div.dataset.selectionId = String(anime.id);
    div.className = `card ${!isStep2 && isSelected ? 'selected' : ''}`;
    
    let displayTitle = anime.title;
    if (searchTerm && !isStep2) {
        const literalTerm = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(literalTerm, "gi");
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
    if (top3State.step === 1) NominateCommon.syncCandidateSelection(top3State.selectedCandidates);
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
let stageCelebrationTimer = null;

function showResult() {
    if (top3State.finalTop3.length !== 3) return;
    const modal = document.getElementById('result-modal');
    const body = document.getElementById('modal-body');
    saveToLocalStorage();
    NominateCommon.installImageFallback();
    clearTimeout(stageCelebrationTimer);
    const [bronze, silver, gold] = top3State.finalTop3;
    const layout = document.createElement('div');
    layout.className = 'podium-layout';
    const winners = [
        { anime: silver, rank: '최우수상', style: 'silver', delay: '0.8s' },
        { anime: gold, rank: '대상', style: 'gold', delay: '1.6s' },
        { anime: bronze, rank: '우수상', style: 'bronze', delay: '0s' }
    ];
    winners.forEach(({ anime, rank, style, delay }) => {
        const display = document.createElement('article');
        display.className = 'podium-winner podium-' + style;
        display.style.setProperty('--reveal-delay', delay);
        const light = document.createElement('div');
        light.className = 'stage-spotlight';
        light.setAttribute('aria-hidden', 'true');
        const label = document.createElement('h3');
        label.className = 'podium-rank';
        label.textContent = rank;
        const poster = document.createElement('div');
        poster.className = 'podium-poster';
        const image = document.createElement('img');
        image.src = NominateCommon.imageSource(anime.thumbnail);
        image.alt = anime.title;
        poster.appendChild(image);
        const stand = document.createElement('div');
        stand.className = 'podium-stand';
        const title = document.createElement('p');
        title.className = 'podium-title';
        title.textContent = anime.title;
        stand.appendChild(title);
        display.append(light, label, poster, stand);
        layout.appendChild(display);
    });
    body.replaceChildren(layout);
    const season = SeasonFilter.getSelectedSeason();
    document.getElementById('result-title').textContent =
        season.quarter && season.quarter !== '모든 분기'
            ? `${season.quarter} TOP 3` : '올해의 TOP 3';
    document.getElementById('stage-season').textContent =
        [season.year ? season.year + '년' : '', season.quarter].filter(Boolean).join(' · ');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.getElementById('save-main-btn').focus({ preventScroll: true });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        stageCelebrationTimer = setTimeout(() => {
            if (!modal.classList.contains('hidden')) NominateCommon.fireConfetti();
        }, 2100);
    }
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
        // 전체 TOP3를 다시 결정하면 이전 개별 저장 결과가 앞서 표시되지 않게 정리한다.
        if (top3State.awardName === "TOP3_Awards") {
            delete currentResults["올해의 애니메이션"];
            RANK_NAMES.forEach(rank => { delete currentResults[rank]; });
        }
        
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
