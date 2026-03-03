// 상수 및 데이터
const QUARTER_MAP = { "1분기": "1분기", "2분기": "2분기", "3분기": "3분기", "4분기": "4분기" };
const DAY_MAP = { 
    Mondays: "월요일", Tuesdays: "화요일", Wednesdays: "수요일", 
    Thursdays: "목요일", Fridays: "금요일", Saturdays: "토요일", Sundays: "일요일",
    Anomaly: "변칙 편성", Web: "웹" // 추가된 키
};
const state = {
    selectedList: {},
    AwardName: "",
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
    // AnimeList 데이터 존재 여부 확인
    if (typeof AnimeList === 'undefined') {
        alert("AnimeList 데이터를 로드할 수 없습니다.");
        return;
    }
    const params = new URLSearchParams(window.location.search);
    state.AwardName = params.get("awardName");
    
    // 데이터를 분기별 > 요일별로 변환
    const groupedData = groupData(AnimeList);
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

// --- [ Step 1: 아코디언 렌더링 (기존 로직 유지) ] ---
function renderAccordion(data) {
    els.accordion.innerHTML = '';
    const sortedQuarters = Object.keys(data).sort();
    
    // 요일 및 특수편성 출력 순서
    const daysInOrder = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays", "Anomaly", "Web"];

    sortedQuarters.forEach(qKey => {
        const qDiv = document.createElement('div');
        qDiv.className = 'acc-level-1'; // 1단계 (분기)
        
        const qHeader = createAccHeader(qKey, 'level-1-header');
        const qContent = document.createElement('div');
        qContent.className = 'acc-content level-1-content';

        daysInOrder.forEach(dayKey => {
            if (data[qKey][dayKey]) {
                const dDiv = document.createElement('div');
                dDiv.className = 'acc-level-2'; // 2단계 (요일/특수)
                
                const dHeader = createAccHeader(DAY_MAP[dayKey] || dayKey, 'level-2-header');
                const dContent = document.createElement('div');
                dContent.className = 'acc-content level-2-content'; // 3단계 (그리드)

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
            // 3단계 그리드가 열릴 때는 자식 높이에 맞춰 제한 해제
            if (content.classList.contains('level-2-content')) {
                content.style.maxHeight = 'none'; 
            } else {
                content.style.maxHeight = content.scrollHeight + 100 + "px"; 
            }
        }
        
        // 하위 요일 아코디언을 열 때, 상위 분기 아코디언이 잘리지 않도록 높이 제한 해제
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

    // animeEPData에서 해당 ID의 에피소드 목록 가져오기
    const epList = (typeof animeEPData !== 'undefined' && animeEPData[String(anime.id)]) 
        ? animeEPData[String(anime.id)] 
        : [];

    const options = epList.length > 0
        ? epList.map((ep, i) => `<option value="${i}">${ep["episode no"]}</option>`).join('')
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
        state.selectedList[key] = {
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

// updatePreview 수정 - subtitle을 "episode no - episode title"로
function updatePreview() {
    const pBox = document.getElementById("preview-list");
    const nextBtn = document.getElementById("next-btn");
    if (!pBox) return;
    pBox.innerHTML = "";

    const list = Object.values(state.selectedList);
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
            delete state.selectedList[item.uniqueKey];
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
                // 검색된 아이템의 요일(Level 2)과 분기(Level 1)를 모두 엽니다.
                let level2 = item.closest('.level-2-content');
                if (level2) { level2.classList.add('open'); level2.style.maxHeight = 'none'; }
                
                let level1 = item.closest('.level-1-content');
                if (level1) { level1.classList.add('open'); level1.style.maxHeight = 'none'; }
            }
        });
    });
}

// --- [ Step 이동 (originalNominate 스타일) ] ---
function proceedToStep2() {
    if (Object.keys(state.selectedList).length < 2) { alert("최소 2개 이상의 에피소드를 선택해주세요!"); return; }

    els.step1.classList.add('hidden');
    els.step2.classList.remove('hidden');

    document.getElementById('step-title-display').textContent = "베스트 에피소드 상 부문";
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('final-btn').classList.remove('hidden');

    const navBtn = document.getElementById('nav-btn');
    navBtn.textContent = "이전 단계"; navBtn.onclick = backToStep1;
    
    // Step 2 프리뷰 숨김
    const previewBox = document.querySelector('.status-indicator');
    if (previewBox) previewBox.style.display = 'none';

    renderStep2Cards();
}

function backToStep1() {
    els.step2.classList.add('hidden');
    els.step1.classList.remove('hidden');

    document.getElementById('step-title-display').textContent = "베스트 에피소드 후보 선정";
    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('final-btn').classList.add('hidden');

    const navBtn = document.getElementById('nav-btn');
    navBtn.textContent = "메인으로"; navBtn.onclick = () => { location.href = '../index.html'; };

    // Step 1 프리뷰 노출
    const previewBox = document.querySelector('.status-indicator');
    if (previewBox) previewBox.style.display = 'block';

    state.winnerKey = null;
}

// renderStep2Cards 수정 - card-ep-label을 "episode no - episode title"로
function renderStep2Cards() {
    els.cardsContainer.innerHTML = '';
    const list = Object.values(state.selectedList);

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

        card.addEventListener('click', () => {
            document.querySelectorAll('.anime-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.winnerKey = item.uniqueKey;
            document.getElementById('final-btn').disabled = false;
        });

        els.cardsContainer.appendChild(card);
    });
}
// --- [ 모달 표시 및 데이터 저장 (originalNominate 스타일) ] ---
// confirmFinalWinner 수정 - 모달 info-row 변경
function confirmFinalWinner() {
    if (!state.winnerKey) {
        alert("최종 수상 에피소드를 선택해주세요!");
        return;
    }

    const winner = state.selectedList[state.winnerKey];

    document.getElementById('modal-img').src = `../${winner.thumbnail}`;
    document.getElementById('modal-title').textContent = winner.title;

    // 변경된 필드
    document.getElementById('modal-episode-no').textContent = winner.episodeNo || "-";
    document.getElementById('modal-episode-title').textContent = winner.episodeTitle || "-";
    document.getElementById('modal-storyboard').textContent = winner.storyboard || "-";
    document.getElementById('modal-episode-director').textContent = winner.episodeDirector || "-";

    document.getElementById('winner-modal').classList.remove('hidden');
    fireConfetti();
    saveData(winner);
}
function saveData(winner) {
    const KEY = 'anime_awards_result';
    let data = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (Array.isArray(data)) data = {}; 
    data[state.AwardName] = { title: winner.title, thumbnail: winner.thumbnail, episode: winner.episode, date: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(data));
}

function groupBy(arr, key) { return arr.reduce((acc, obj) => { (acc[obj[key]] = acc[obj[key]] || []).push(obj); return acc; }, {}); }

function fireConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;

    // 전용 캔버스를 사용하는 폭죽 인스턴스 생성
    const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
    });

    const duration = 3000;
    const animationEnd = Date.now() + duration;

    (function frame() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return;

        // 왼쪽 아래에서 쏘아 올림
        myConfetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#d4af37', '#ffffff', '#aa8a2e']
        });

        // 오른쪽 아래에서 쏘아 올림
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