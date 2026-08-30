// 상수 및 데이터
const DAY_MAP = { 
    Mondays: "월요일", Tuesdays: "화요일", Wednesdays: "수요일", 
    Thursdays: "목요일", Fridays: "금요일", Saturdays: "토요일", Sundays: "일요일",
    Anomaly: "변칙 편성", Web: "웹"
};

// ✅ 다른 파일들과 통일: state → episodeState, AwardName → awardName
const episodeState = {
    selectedList: {},
    awardName: "",
    winnerKey: null
};

const els = {
    step1: document.getElementById('step1-section'),
    step2: document.getElementById('step2-section'),
    accordion: document.getElementById('accordion-container'),
    previewList: document.getElementById('preview-list'),
    cardsContainer: document.getElementById('cards-container')
};

function init() {
    if (typeof AnimeList === 'undefined') {
        alert("AnimeList 데이터를 로드할 수 없습니다.");
        return;
    }
    const params = new URLSearchParams(window.location.search);
    episodeState.awardName = params.get("awardName");
    
    const stepTitleEl = document.getElementById("step-title-display");
    if (stepTitleEl) stepTitleEl.textContent = `${SeasonFilter.toDisplayAwardName("베스트 에피소드")} 부문`;

    const seasonFilteredList = SeasonFilter.filterAnimeList(AnimeList);
    const groupedData = groupData(seasonFilteredList);
    renderAccordion(groupedData);
    setupSearch();
}

function groupData(list) {
    const grouped = {};
    list.forEach(item => {
        const q = item.quarter;
        const d = item.day;
        if (!grouped[q]) grouped[q] = {};
        if (!grouped[q][d]) grouped[q][d] = [];
        grouped[q][d].push(item);
    });
    return grouped;
}

// --- [ Step 1: 아코디언 렌더링 ] ---
function renderAccordion(data) {
    els.accordion.innerHTML = '';
    const sortedQuarters = Object.keys(data).sort();
    
    const daysInOrder = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays", "Anomaly", "Web"];

    sortedQuarters.forEach(qKey => {
        const qDiv = document.createElement('div');
        qDiv.className = 'acc-level-1';
        
        const qHeader = createAccHeader(qKey, 'level-1-header');
        const qContent = document.createElement('div');
        qContent.className = 'acc-content level-1-content';

        daysInOrder.forEach(dayKey => {
            if (data[qKey][dayKey]) {
                const dDiv = document.createElement('div');
                dDiv.className = 'acc-level-2';
                
                const dHeader = createAccHeader(DAY_MAP[dayKey] || dayKey, 'level-2-header');
                const dContent = document.createElement('div');
                dContent.className = 'acc-content level-2-content';

                data[qKey][dayKey].forEach(anime => {
                    dContent.appendChild(createAnimeItem(anime));
                });

                dDiv.append(dHeader, dContent);
                qContent.appendChild(dDiv);
            }
        });

        qDiv.append(qHeader, qContent);
        els.accordion.appendChild(qDiv);
    });
}

function createAccHeader(text, headerClass) {
    const header = document.createElement('div');
    header.className = `acc-header ${headerClass}`;
    header.innerHTML = `<span>${text}</span><i class="fas fa-chevron-down"></i>`;
    
    header.addEventListener('click', function(e) {
        e.stopPropagation();
        const content = this.nextElementSibling;
        const isOpen = content.classList.contains('open');

        if (isOpen) {
            content.classList.remove('open');
            content.style.maxHeight = null;
        } else {
            content.classList.add('open');
            if (content.classList.contains('level-2-content')) {
                content.style.maxHeight = 'none'; 
            } else {
                content.style.maxHeight = content.scrollHeight + 100 + "px"; 
            }
        }
        
        let parentContent = this.closest('.level-1-content');
        if (parentContent && !isOpen) {
            parentContent.style.maxHeight = 'none';
        }
    });
    return header;
}

function createAnimeItem(anime) {
    const div = document.createElement('div');
    div.className = 'anime-item';
    div.dataset.title = anime.title.toLowerCase();

    // ✅ 수정: animeEPData_2026 하드코딩 → resolveYear.js가 만든 별칭 animeEPData 사용
    const epList = (typeof animeEPData !== 'undefined' && animeEPData[String(anime.id)]) 
        ? animeEPData[String(anime.id)] 
        : [];

    const options = epList.length > 0
        ? epList.map((ep, i) => `<option value="${i}">${ep["episode no"]} : ${ep["episode title"]}</option>`).join('')
        : `<option value="" disabled>에피소드 없음</option>`;

    div.innerHTML = `
        <img src="../${anime.thumbnail}" class="anime-thumb-small">
        <div class="anime-info">
            <span class="anime-title">${anime.title}</span>
        </div>
        <select class="episode-select">
            <option value="" disabled selected>에피소드 선택</option>
            ${options}
        </select>
    `;

    const select = div.querySelector('.episode-select');
    select.addEventListener('change', (e) => {
        const idx = e.target.value;
        if (idx === '') return;
        const epObj = epList[idx];
        const key = `${anime.id}_${idx}`;
        episodeState.selectedList[key] = {
            id: anime.id,
            uniqueKey: key,
            title: anime.title,
            thumbnail: anime.thumbnail,
            quarter: anime.quarter,
            studio: anime.studio,
            episodeNo: epObj["episode no"],
            episodeTitle: epObj["episode title"],
            storyboard: (epObj.storyboard?.staff || []).join(', '),
            episodeDirector: (epObj["episode director"]?.staff || []).join(', ')
        };
        updatePreview();
        e.target.selectedIndex = 0;
    });

    return div;
}

function updatePreview() {
    const pBox = document.getElementById("preview-list");
    const nextBtn = document.getElementById("next-btn");
    if (!pBox) return;
    pBox.innerHTML = "";

    const list = Object.values(episodeState.selectedList);
    if (list.length === 0) {
        pBox.innerHTML = `<div style="color:#666; text-align:center; padding-top:20px; font-size:0.85rem;">후보를 선택해주세요</div>`;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    list.forEach(item => {
        const div = document.createElement("div");
        div.className = "preview-item";
        div.innerHTML = `
            <div class="preview-title">${item.title}</div>
            <div class="preview-subtitle">${item.episodeNo} - ${item.episodeTitle}</div>
        `;
        div.onclick = () => {
            delete episodeState.selectedList[item.uniqueKey];
            updatePreview();
        };
        pBox.appendChild(div);
    });

    if (nextBtn) nextBtn.disabled = list.length === 0;
}

// --- [ 검색 기능 연동 ] ---
function setupSearch() {
    document.getElementById('search-input').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        const isSearching = keyword.length > 0;

        document.querySelectorAll('.anime-item').forEach(item => {
            const match = item.dataset.title.includes(keyword);
            item.style.display = match ? 'flex' : 'none';
            
            if(match && isSearching) {
                let level2 = item.closest('.level-2-content');
                if (level2) { level2.classList.add('open'); level2.style.maxHeight = 'none'; }
                
                let level1 = item.closest('.level-1-content');
                if (level1) { level1.classList.add('open'); level1.style.maxHeight = 'none'; }
            }
        });
    });
}

// --- [ Step 이동 ] ---
function proceedToStep2() {
    if (Object.keys(episodeState.selectedList).length < 2) { 
        alert("최소 2개 이상의 에피소드를 선택해주세요!"); 
        return; 
    }

    els.step1.classList.add('hidden');
    els.step2.classList.remove('hidden');

    const searchArea = document.querySelector('.search-container');
    if (searchArea) searchArea.classList.add('hidden');

    document.getElementById('step-title-display').textContent = `${SeasonFilter.toDisplayAwardName("베스트 에피소드")} 상 부문`;
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('final-btn').classList.remove('hidden');

    const navBtn = document.getElementById('nav-btn');
    navBtn.textContent = "이전 단계"; 
    navBtn.onclick = backToStep1;
    
    const previewBox = document.querySelector('.status-indicator');
    if (previewBox) previewBox.classList.add('hidden');

    renderStep2Cards();
}

function backToStep1() {
    els.step2.classList.add('hidden');
    els.step1.classList.remove('hidden');

    const searchArea = document.querySelector('.search-container');
    if (searchArea) searchArea.classList.remove('hidden');

    document.getElementById('step-title-display').textContent = `${SeasonFilter.toDisplayAwardName("베스트 에피소드")} 후보 선정`;
    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('final-btn').classList.add('hidden');

    const navBtn = document.getElementById('nav-btn');
    navBtn.textContent = "메인으로"; 
    navBtn.onclick = () => { location.href = '../index.html'; };

    const previewBox = document.querySelector('.status-indicator');
    if (previewBox) previewBox.classList.remove('hidden');

    episodeState.winnerKey = null;
}

function renderStep2Cards() {
    els.cardsContainer.innerHTML = '';
    const list = Object.values(episodeState.selectedList);

    const existingTitle = els.step2.querySelector('.step2-title');
    if (existingTitle) existingTitle.remove();

    const titleH2 = document.createElement("h2");
    titleH2.className = "step2-title";
    titleH2.style.cssText = "color:var(--gold); margin-bottom:20px; font-size: 1.5rem; width: 100%; text-align: left;";
    titleH2.textContent = "최종 수상 에피소드를 선택하세요";
    els.step2.insertBefore(titleH2, els.cardsContainer);

    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        const thumbPath = `../${item.thumbnail}`;

        card.innerHTML = `
            <div class="card-badge">${item.episodeNo}</div>
            <div class="card-thumb-wrapper">
                <img src="${thumbPath}" class="card-thumb">
            </div>
            <div class="card-info-area">
                <div class="card-title">${item.title}</div>
                <div class="card-ep-label">${item.episodeNo} - ${item.episodeTitle}</div>
            </div>
        `;

        const badge = card.querySelector('.card-badge');
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            showEpisodePreview(item);
        });

        card.addEventListener('click', () => {
            document.querySelectorAll('.anime-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            episodeState.winnerKey = item.uniqueKey;
            document.getElementById('final-btn').disabled = false;
        });

        els.cardsContainer.appendChild(card);
    });
}

function showEpisodePreview(item) {
    document.getElementById('ep-preview-img').src = `../${item.thumbnail}`;
    document.getElementById('ep-preview-title').textContent = item.title;
    document.getElementById('ep-preview-no').textContent = item.episodeNo || "-";
    document.getElementById('ep-preview-ep-title').textContent = item.episodeTitle || "-";
    document.getElementById('ep-preview-storyboard').textContent = item.storyboard || "-";
    document.getElementById('ep-preview-director').textContent = item.episodeDirector || "-";
    document.getElementById('ep-preview-modal').classList.remove('hidden');
}

function closeEpisodePreview() {
    document.getElementById('ep-preview-modal').classList.add('hidden');
}

// --- [ 모달 표시 및 데이터 저장 ] ---
function confirmFinalWinner() {
    if (!episodeState.winnerKey) {
        alert("최종 수상 에피소드를 선택해주세요!");
        return;
    }

    const winner = episodeState.selectedList[episodeState.winnerKey];

    document.getElementById('modal-img').src = `../${winner.thumbnail}`;
    document.getElementById('modal-title').textContent = winner.title;

    document.getElementById('modal-episode-no').textContent = winner.episodeNo || "-";
    document.getElementById('modal-episode-title').textContent = winner.episodeTitle || "-";
    document.getElementById('modal-storyboard').textContent = winner.storyboard || "-";
    document.getElementById('modal-episode-director').textContent = winner.episodeDirector || "-";

    document.getElementById('winner-modal').classList.remove('hidden');
    fireConfetti();
    saveData(winner);
}

// ✅ 수정: 예전 방식(anime_awards_result 직접 읽고 쓰기) 잔재 제거, ResultStorage로 일원화
//         득표율 뱃지 표시 기능은 추가하지 않되, 투표 집계 제출(submitSingleAwardToDB)만 다른 부문과 통일
function saveData(winner) {
    ResultStorage.saveOne(episodeState.awardName, { 
        title: winner.title, 
        thumbnail: winner.thumbnail, 
        episodeNo: winner.episodeNo,      
        episodeTitle: winner.episodeTitle, 
        date: new Date().toISOString() 
    });

    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(episodeState.awardName);
    }
}

function fireConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
    });

    const duration = 3000;
    const animationEnd = Date.now() + duration;

    (function frame() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return;

        myConfetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#d4af37', '#ffffff', '#aa8a2e']
        });

        myConfetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#d4af37', '#ffffff', '#aa8a2e']
        });

        requestAnimationFrame(frame);
    }());
}

function goToMain() { location.href = '../index.html'; }

// 앱 초기화
init();