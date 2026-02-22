// 상수 및 데이터
const QUARTER_MAP = { "1분기": "1분기", "2분기": "2분기", "3분기": "3분기", "4분기": "4분기" };
const DAY_MAP = { Mondays: "월요일", Tuesdays: "화요일", Wednesdays: "수요일", Thursdays: "목요일", Fridays: "금요일", Saturdays: "토요일", Sundays: "일요일" };

const state = {
    selectedList: {}, 
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

    // 분기별 정렬 (1분기, 2분기...)
    const sortedQuarters = Object.keys(data).sort();

    sortedQuarters.forEach(qKey => {
        const qDiv = document.createElement('div');
        qDiv.className = 'acc-level-1';
        const qHeader = createAccHeader(qKey);
        const qContent = document.createElement('div');
        qContent.className = 'acc-content';

        // 요일별 정렬 (Mondays, Tuesdays...)
        const daysInOrder = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"];
        
        daysInOrder.forEach(dayKey => {
            if (data[qKey][dayKey]) {
                const dDiv = document.createElement('div');
                dDiv.className = 'acc-level-2';
                const dHeader = createAccHeader(DAY_MAP[dayKey] || dayKey);
                const dContent = document.createElement('div');
                dContent.className = 'acc-content';

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

function createAccHeader(text) {
    const header = document.createElement('div');
    header.className = 'acc-header';
    header.innerHTML = `<span>${text}</span><i class="fas fa-chevron-down"></i>`;
    
    header.addEventListener('click', function() {
        const content = this.nextElementSibling;
        const isOpen = content.classList.contains('open');

        if (isOpen) {
            content.classList.remove('open');
            content.style.maxHeight = null;
        } else {
            content.classList.add('open');
            // 그리드 뷰의 경우 scrollHeight를 더 정확히 가져오기 위해 일시적 처리
            content.style.maxHeight = content.scrollHeight + 40 + "px"; // 패딩값 여유 추가
        }
        
        // 상위 분기 아코디언 높이 재조정
        let parentContent = this.closest('.acc-level-1')?.querySelector('.acc-content');
        if (parentContent && parentContent !== content) {
            parentContent.style.maxHeight = 'none';
        }
    });
    return header;
}

function createAnimeItem(anime) {
    const div = document.createElement('div');
    div.className = 'anime-item';
    div.dataset.title = anime.title.toLowerCase();

    div.innerHTML = `
        <img src="../${anime.thumbnail}" class="anime-thumb-small">
        <div class="anime-info">
            <span class="anime-title">${anime.title}</span>
        </div>
        <select class="episode-select">
            <option value="" disabled selected>에피소드 선택</option>
            ${Array.from({length: anime.episodes}, (_, i) => 
                `<option value="${i+1}">${i+1}화</option>`).join('')}
        </select>
    `;

    // 이벤트 리스너는 직접 할당
    const select = div.querySelector('.episode-select');
    select.addEventListener('change', (e) => {
        const ep = e.target.value;
        if(!ep) return;
        const key = `${anime.id}_${ep}`;
        state.selectedList[key] = {
            id: anime.id,
            uniqueKey: key,
            title: anime.title,
            thumbnail: `../${anime.thumbnail}`,
            episode: ep
        };
        updatePreview();
        e.target.selectedIndex = 0; 
    });

    return div;
}

/**
 * 프리뷰 리스트 업데이트 (성우 노미네이트 페이지와 100% 동일한 구조)
 */
function updatePreview() {
    // 성우 페이지는 id가 preview-box인 경우와 preview-list인 경우가 혼용되나, 
    // 제공된 HTML의 id인 preview-list를 기준으로 성우 페이지 스타일을 주입합니다.
    const pBox = document.getElementById("preview-list");
    const nextBtn = document.getElementById("next-btn");
    
    if(!pBox) return;
    pBox.innerHTML = ""; // 기존 내용 비우기
    
    const list = Object.values(state.selectedList);

    // 선택된 항목이 없을 때 (성우 페이지 규격 문구)
    if (list.length === 0) {
        pBox.innerHTML = `<div style="color:#666; text-align:center; padding-top:20px; font-size:0.85rem;">후보를 선택해주세요</div>`;
        if(nextBtn) nextBtn.disabled = true;
        return;
    }

    // 성우 페이지 방식: div.preview-item 생성 후 내부 구조 삽입
    list.forEach(item => {
        const div = document.createElement("div");
        div.className = "preview-item";
        
        // 성우 페이지 구조: 상단 제목(애니제목), 하단 소제목(에피소드 정보)
        div.innerHTML = `
            <div class="preview-title">${item.title}</div>
            <div class="preview-subtitle">${item.episode}화</div>
        `;
        
        // 클릭 시 삭제 로직 (성우 페이지와 동일)
        div.onclick = () => {
            delete state.selectedList[item.uniqueKey];
            updatePreview();
        };
        pBox.appendChild(div);
    });

    // 버튼 활성화 상태 업데이트
    if(nextBtn) nextBtn.disabled = list.length === 0;
}
// --- [ 검색 기능 연동 ] ---
function setupSearch() {
    document.getElementById('search-input').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.anime-item').forEach(item => {
            const match = item.dataset.title.includes(keyword);
            item.style.display = match ? 'flex' : 'none';
            if(match) {
                let p = item.closest('.acc-content');
                while(p) { p.classList.add('open'); p.style.maxHeight = 'none'; p = p.parentElement.closest('.acc-content'); }
            }
        });
    });
}

// --- [ Step 이동 (originalNominate 스타일) ] ---
function proceedToStep2() {
    if (Object.keys(state.selectedList).length < 2) { alert("최소 2개 이상의 에피소드를 선택해주세요!"); return; }

    els.step1.classList.add('hidden');
    els.step2.classList.remove('hidden');

    document.getElementById('step-title-display').textContent = "최종 수상작 결정 (Step 2)";
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
    navBtn.textContent = "메인으로"; navBtn.onclick = () => { location.href = '../main/main.html'; };

    // Step 1 프리뷰 노출
    const previewBox = document.querySelector('.status-indicator');
    if (previewBox) previewBox.style.display = 'block';

    state.winnerKey = null;
}

function renderStep2Cards() {
    els.cardsContainer.innerHTML = '';
    const list = Object.values(state.selectedList);

    list.forEach(item => {
        const card = document.createElement('div'); card.className = 'anime-card';
        card.innerHTML = `<img src="../${item.thumbnail}" class="card-thumb"><div class="card-title">${item.title}</div><div class="card-ep">EP.${item.episode}</div>`;
        card.addEventListener('click', () => {
            document.querySelectorAll('.anime-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.winnerKey = item.uniqueKey;
        });
        els.cardsContainer.appendChild(card);
    });
}

// --- [ 모달 표시 및 데이터 저장 (originalNominate 스타일) ] ---
function confirmFinalWinner() {
    if(!state.winnerKey) { alert("최종 수상 에피소드를 선택해주세요!"); return; }
    
    const winner = state.selectedList[state.winnerKey];
    
    document.getElementById('modal-img').src = `../${winner.thumbnail}`;
    document.getElementById('modal-title').textContent = winner.title;
    
    const episodeDisplay = document.getElementById('modal-episode');
    episodeDisplay.textContent = `EPISODE ${winner.episode}`;

    document.getElementById('winner-modal').classList.remove('hidden');
    fireworks();
    saveData(winner); // 로컬 스토리지 저장
}

function saveData(winner) {
    const KEY = 'anime_awards_result';
    let data = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (Array.isArray(data)) data = {}; 
    data["베스트 에피소드 상"] = { title: winner.title, thumbnail: winner.thumbnail, episode: winner.episode, date: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(data));
}

function groupBy(arr, key) { return arr.reduce((acc, obj) => { (acc[obj[key]] = acc[obj[key]] || []).push(obj); return acc; }, {}); }

function fireworks() {
    const duration = 3 * 1000; const end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#d4af37', '#ffffff'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#d4af37', '#ffffff'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

function goToMain() { location.href = '../main/main.html'; }

// 앱 초기화
init();