// [주의] ../data/animeData.js 가 HTML에서 먼저 로드되어 있어야 합니다.

// 상수 및 상태
const QUARTER_MAP = { Q1: "1분기", Q2: "2분기", Q3: "3분기", Q4: "4분기" };
const DAY_MAP = {
    Mondays: "월요일", Tuesdays: "화요일", Wednesdays: "수요일",
    Thursdays: "목요일", Fridays: "금요일", Saturdays: "토요일", Sundays: "일요일"
};

const state = {
    selectedList: {}, // Key: "id_episode", Value: Object
    winnerKey: null
};

// DOM 요소
const els = {
    step1: document.getElementById('step1-section'),
    step2: document.getElementById('step2-section'),
    searchContainer: document.getElementById('search-container'),
    accordion: document.getElementById('accordion-container'),
    previewList: document.getElementById('preview-list'),
    cardsContainer: document.getElementById('cards-container'),
    // Buttons
    btns: {
        main: document.getElementById('btn-main'),
        next: document.getElementById('btn-next'),
        prev: document.getElementById('btn-prev'),
        award: document.getElementById('btn-award'),
        confirmMain: document.getElementById('btn-confirm-main')
    },
    // Popup
    popup: document.getElementById('award-popup'),
    closePopup: document.querySelector('.close-modal')
};

function init() {
    if (typeof AnimeByQuarter === 'undefined') {
        alert("데이터 파일을 찾을 수 없습니다.");
        return;
    }
    renderAccordion();
    setupEventListeners();
}

// --- STEP 1: 아코디언 렌더링 ---
function renderAccordion() {
    els.accordion.innerHTML = '';

    for (const [qKey, animeList] of Object.entries(AnimeByQuarter)) {
        // 1단: 분기
        const qDiv = document.createElement('div');
        qDiv.className = 'acc-level-1';
        const qHeader = createAccHeader(QUARTER_MAP[qKey] || qKey);
        const qContent = document.createElement('div');
        qContent.className = 'acc-content';

        const dayGroups = groupBy(animeList, 'day');

        for (const [dayKey, dayAnimeList] of Object.entries(dayGroups)) {
            // 2단: 요일
            const dDiv = document.createElement('div');
            dDiv.className = 'acc-level-2';
            const dHeader = createAccHeader(DAY_MAP[dayKey] || dayKey);
            const dContent = document.createElement('div');
            dContent.className = 'acc-content';

            // 3단: 애니메이션 리스트
            dayAnimeList.forEach(anime => {
                dContent.appendChild(createAnimeItem(anime));
            });

            dDiv.appendChild(dHeader);
            dDiv.appendChild(dContent);
            qContent.appendChild(dDiv);
        }

        qDiv.appendChild(qHeader);
        qDiv.appendChild(qContent);
        els.accordion.appendChild(qDiv);
    }
}

function createAccHeader(text) {
    const header = document.createElement('div');
    header.className = 'acc-header';
    header.innerHTML = `<span>${text}</span><i class="fas fa-chevron-down"></i>`;
    
    header.addEventListener('click', function() {
        const content = this.nextElementSibling;
        const isOpen = content.classList.contains('open');

        // Toggle
        if (isOpen) {
            content.classList.remove('open');
            content.style.maxHeight = null;
        } else {
            content.classList.add('open');
            // 자식 요소들까지 포함한 실제 높이 계산
            content.style.maxHeight = content.scrollHeight + "px";
        }

        // [버그 수정] 부모 아코디언의 높이도 재계산하여 잘림 방지
        let parentContent = this.closest('.acc-content');
        while (parentContent) {
             // 부모는 이미 open 상태이므로 높이를 늘려준다 (auto에 가깝게)
            parentContent.style.maxHeight = 'none'; 
            parentContent = parentContent.parentElement.closest('.acc-content');
        }
    });
    return header;
}

function createAnimeItem(anime) {
    const div = document.createElement('div');
    div.className = 'anime-item';
    div.dataset.title = anime.title.toLowerCase(); // 검색용

    // 썸네일
    const img = document.createElement('img');
    img.src = `../${anime.thumbnail}`;
    img.className = 'anime-thumb-small';
    
    // 정보
    const info = document.createElement('div');
    info.className = 'anime-info';
    info.innerHTML = `<span class="anime-title">${anime.title}</span>`;

    // 에피소드 선택
    const select = document.createElement('select');
    select.className = 'episode-select';
    select.innerHTML = `<option value="">선택</option>`;
    for(let i=1; i<=anime.episodes; i++) {
        select.innerHTML += `<option value="${i}">${i}화</option>`;
    }

    select.addEventListener('change', (e) => {
        const ep = e.target.value;
        if(!ep) return;

        // 고유 키 생성 (같은 애니메이션 다른 에피소드 허용)
        const key = `${anime.id}_${ep}`;
        state.selectedList[key] = {
            id: anime.id,
            uniqueKey: key,
            title: anime.title,
            thumbnail: `../${anime.thumbnail}`,
            episode: ep
        };
        
        updatePreview();
        e.target.value = ""; // 선택 후 초기화 (다중 선택 가능하게)
    });

    div.append(img, info, select);
    return div;
}

function updatePreview() {
    els.previewList.innerHTML = '';
    const list = Object.values(state.selectedList);

    if (list.length === 0) {
        els.previewList.innerHTML = '<p class="empty-msg">선택된 에피소드가 없습니다.</p>';
        return;
    }

    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.title = "클릭하여 삭제";
        div.innerHTML = `<span>${item.title}</span><span class="preview-ep">${item.episode}화</span>`;
        
        // 클릭 시 삭제
        div.addEventListener('click', () => {
            delete state.selectedList[item.uniqueKey];
            updatePreview();
        });
        
        els.previewList.appendChild(div);
    });
}

// --- STEP 2: 카드 렌더링 ---
function renderStep2() {
    els.cardsContainer.innerHTML = '';
    const list = Object.values(state.selectedList);

    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
            <img src="../${item.thumbnail}" class="card-thumb">
            <div class="card-title">${item.title}</div>
            <div class="card-ep">${item.episode}화</div>
        `;
        
        card.addEventListener('click', () => {
            // 선택 효과
            document.querySelectorAll('.anime-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.winnerKey = item.uniqueKey;
        });

        els.cardsContainer.appendChild(card);
    });
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // 1. 검색
    document.getElementById('anime-search').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        document.querySelectorAll('.anime-item').forEach(item => {
            const match = item.dataset.title.includes(keyword);
            item.style.display = match ? 'flex' : 'none';
            
            // 검색 시 부모 아코디언 강제 오픈
            if(match) {
                let p = item.closest('.acc-content');
                while(p) {
                    p.classList.add('open');
                    p.style.maxHeight = 'none';
                    p = p.parentElement.closest('.acc-content');
                }
            }
        });
    });

    // 2. 화면 전환 (Step 1 -> Step 2)
    els.btns.next.addEventListener('click', () => {
        if (Object.keys(state.selectedList).length === 0) {
            alert("후보작을 하나 이상 선택해주세요.");
            return;
        }

        // [중요] 클래스 조작으로 화면 전환
        els.step1.classList.remove('active');
        els.step2.classList.add('active');
        
        // 검색창 숨김
        els.searchContainer.classList.add('hidden');

        // 버튼 교체
        els.btns.main.classList.add('hidden');
        els.btns.next.classList.add('hidden');
        els.btns.prev.classList.remove('hidden');
        els.btns.award.classList.remove('hidden');

        renderStep2();
    });

    // 3. 화면 전환 (Step 2 -> Step 1)
    els.btns.prev.addEventListener('click', () => {
        els.step2.classList.remove('active');
        els.step1.classList.add('active');
        
        els.searchContainer.classList.remove('hidden');

        els.btns.prev.classList.add('hidden');
        els.btns.award.classList.add('hidden');
        els.btns.main.classList.remove('hidden');
        els.btns.next.classList.remove('hidden');

        state.winnerKey = null; // 수상 선택 초기화
    });

    // 4. 수상 결정
    els.btns.award.addEventListener('click', () => {
        if(!state.winnerKey) {
            alert("수상작을 카드를 클릭하여 선택해주세요!");
            return;
        }
        showAwardPopup();
    });

    // 5. 팝업 닫기 / 메인 이동
    els.closePopup.addEventListener('click', () => els.popup.classList.add('hidden'));
    
    els.btns.confirmMain.addEventListener('click', () => {
        window.location.href = '../main/main.html';
    });
    
    els.btns.main.addEventListener('click', () => {
        window.location.href = '../main/main.html';
    });
}

function showAwardPopup() {
    const winner = state.selectedList[state.winnerKey];
    
    document.getElementById('winner-img').src = `../${winner.thumbnail}`;
    document.getElementById('winner-title').textContent = winner.title;
    document.getElementById('winner-episode').textContent = `${winner.episode}화`;
    
    els.popup.classList.remove('hidden');
    
    // 폭죽 효과
    fireConfetti();
    
    // 저장
    saveData(winner);
}

function saveData(winner) {
    const KEY = 'anime_awards_result';
    
    // 1. 기존 데이터를 가져오되, 없거나 배열이면 빈 객체({})로 시작
    let data = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (Array.isArray(data)) data = {}; 

    // 2. "베스트 에피소드상"이라는 키에 직접 위너 정보를 할당
    data["베스트 에피소드상"] = {
        title: winner.title,
        thumbnail: winner.thumbnail,
        episode: winner.episode,
        date: new Date().toISOString()
    };

    // 3. 로컬 스토리지 저장
    localStorage.setItem(KEY, JSON.stringify(data));
    
    console.log("데이터 저장 완료:", data);
}

function fireConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    const colors = ['#FFD700', '#FFF', '#F00', '#0F0'];
    
    for(let i=0; i<100; i++) {
        const p = document.createElement('div');
        p.style.cssText = `
            position:absolute; width:8px; height:8px; 
            background:${colors[Math.floor(Math.random()*colors.length)]};
            left:${Math.random()*100}vw; top:-10px;
            transform:rotate(${Math.random()*360}deg);
            transition: top ${2+Math.random()}s ease-in, opacity 2s;
        `;
        container.appendChild(p);
        
        setTimeout(() => {
            p.style.top = '110vh';
            p.style.opacity = '0';
        }, 100);
    }
}

function groupBy(arr, key) {
    return arr.reduce((acc, obj) => {
        (acc[obj[key]] = acc[obj[key]] || []).push(obj);
        return acc;
    }, {});
}

init();