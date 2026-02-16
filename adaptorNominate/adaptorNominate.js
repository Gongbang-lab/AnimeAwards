let currentStep = 1;
let selectedAnimes = []; // step1에서 선택된 객체들
let finalist = null;    // step2에서 최종 선택된 객체

const grid = document.getElementById('anime-grid');
const previewBox = document.getElementById('preview-box');
const nextBtn = document.getElementById('next-btn');
const decideBtn = document.getElementById('decide-btn');
const navHome = document.getElementById('nav-home');
const stepTitle = document.getElementById('step-title');
const searchInput = document.getElementById('search-input');
const autocompleteList = document.getElementById('autocomplete-list');

const AnimeByQuarter = AnimeAdaptorData.reduce((acc, anime) => {
    const q = anime.quarter || "Unknown"; // 데이터에 quarter 속성이 있어야 합니다.
    if (!acc[q]) acc[q] = [];
    acc[q].push(anime);
    return acc;
}, {});

const QUARTER_MAP = {
    "Q1": "1분기", "Q2": "2분기", "Q3": "3분기", "Q4": "4분기", "Anomaly": "변칙 편성", "Web": "웹"
};
const DAY_KEYS = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays", "Anomaly", "Web"];

const DAY_LABELS = {
    "Mondays": "월요일", 
    "Tuesdays": "화요일", 
    "Wednesdays": "수요일", 
    "Thursdays": "목요일", 
    "Fridays": "금요일", 
    "Saturdays": "토요일", 
    "Sundays": "일요일", 
    "Anomaly": "변칙 편성", 
    "Web": "웹"
};

searchInput.oninput = function() {
    const val = this.value.toLowerCase();
    closeAllLists();
    if (!val) return false;

    // 대소문자 구분 없이 제목 검색 (연관 검색어 추출)
    const matches = AnimeAdaptorData.filter(anime => 
        anime.title.toLowerCase().includes(val)
    );

    matches.forEach(match => {
        const b = document.createElement("div");
        // 일치하는 부분을 강조(bold) 처리
        const idx = match.title.toLowerCase().indexOf(val);
        b.innerHTML = match.title.substr(0, idx);
        b.innerHTML += "<strong>" + match.title.substr(idx, val.length) + "</strong>";
        b.innerHTML += match.title.substr(idx + val.length);
        
        b.onclick = () => {
            searchInput.value = match.title;
            closeAllLists();
            renderStep1(match.title); // 선택한 제목으로 그리드 필터링
        };
        autocompleteList.appendChild(b);
    });
}

function closeAllLists() {
    autocompleteList.innerHTML = '';
}

// 초기 렌더링 (Step 1)
function renderStep1(filterText = "") {
    const parent = document.getElementById("anime-grid");
    parent.innerHTML = ""; // 기존 그리드 초기화

    // 분기 키(Q1, Q2...) 순서대로 정렬하여 출력
    Object.keys(AnimeByQuarter).sort().forEach((quarterKey) => {
        const animeList = AnimeByQuarter[quarterKey];
        
        // 검색어(filterText)가 있다면 해당 분기에 검색 결과가 있는지 먼저 필터링
        const filteredAnimesInQuarter = animeList.filter(anime => 
            anime.title.toLowerCase().includes(filterText.toLowerCase())
        );

        // 검색 중인데 해당 분기에 결과가 없으면 이 분기는 통째로 패스
        if (filterText && filteredAnimesInQuarter.length === 0) return;

        const quarterSection = document.createElement("div");
        quarterSection.className = "quarter-section";

        // 1. 분기 버튼
        const quarterBtn = document.createElement("button");
        quarterBtn.className = "quarter-btn";
        quarterBtn.textContent = QUARTER_MAP[quarterKey] || quarterKey;

        const quarterContent = document.createElement("div");
        quarterContent.className = "quarter-content";
        
        // 검색 중이면 자동으로 펼쳐두고, 아니면 닫아둠
        const isSearchActive = filterText.length > 0;
        quarterContent.style.display = isSearchActive ? "block" : "none";
        if (isSearchActive) quarterBtn.classList.add("active");

        quarterBtn.onclick = () => {
            const isVisible = quarterContent.style.display === "block";
            quarterContent.style.display = isVisible ? "none" : "block";
            quarterBtn.classList.toggle("active", !isVisible);
        };

        // 2. 요일별 분류
        DAY_KEYS.forEach(dayKey => {
            const dayAnimes = (isSearchActive ? filteredAnimesInQuarter : animeList)
                                .filter(a => a.day === dayKey);
            
            if (dayAnimes.length === 0) return;

            const daySection = document.createElement("div");
            daySection.className = "day-section";

            const dayBtn = document.createElement("button");
            dayBtn.className = "day-btn";
            dayBtn.textContent = DAY_LABELS[dayKey];

            const dayContent = document.createElement("div");
            dayContent.className = "day-content grid-view"; // 그리드 스타일 적용
            dayContent.style.display = isSearchActive ? "block" : "none";
            if (isSearchActive) dayBtn.classList.add("active");

            dayBtn.onclick = () => {
                // block이 아닌 grid로 체크하고 변경해야 함
                const isVisible = dayContent.style.display === "grid";
    
                if (isVisible) {
                    dayContent.style.display = "none";
                    dayBtn.classList.remove("active");
                } else {
                    dayContent.style.display = "grid"; // 여기서 grid를 명시!
                    dayBtn.classList.add("active");
                }
            };

            // 3. 카드 생성 (기존 카드 UI 사용)
            dayAnimes.forEach(anime => {
                const card = createCard(anime);
                const originalClick = card.onclick;
                card.onclick = () => {
                    if (originalClick) originalClick();
                    if (typeof updatePreview === 'function') updatePreview();
                };

                dayContent.appendChild(card);
            });

            daySection.appendChild(dayBtn);
            daySection.appendChild(dayContent);
            quarterContent.appendChild(daySection);
        });

        quarterSection.appendChild(quarterBtn);
        quarterSection.appendChild(quarterContent);
        parent.appendChild(quarterSection);
    });
}

function createCard(anime) {
    const div = document.createElement('div');
    
    // Step 1이면 selectedAnimes 확인, Step 2이면 finalist 확인
    let isSelected = false;
    if (currentStep === 1) {
        isSelected = selectedAnimes.some(a => a.id === anime.id);
    } else {
        isSelected = finalist && finalist.id === anime.id;
    }

    div.className = `card ${isSelected ? 'selected' : ''}`;
    div.innerHTML = `
        <img src="${anime.thumbnail}" alt="${anime.title}">
        <div class="card-info">
            <div class="card-title">${anime.title}</div>
            <div class="card-adaptor">각색: ${anime.adaptor.join(', ')}</div>
        </div>
    `;
    div.onclick = () => toggleSelection(anime, div);
    return div;
}

function toggleSelection(anime, element) {
    if (currentStep === 1) {
        const index = selectedAnimes.findIndex(a => a.id === anime.id);
        if (index > -1) {
            selectedAnimes.splice(index, 1);
            element.classList.remove('selected');
        } else {
            selectedAnimes.push(anime);
            element.classList.add('selected');
        }
        updatePreview();
    } else {
        // Step 2: 단일 선택
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        element.classList.add('selected');
        finalist = anime;
    }
}

function updatePreview() {
    previewBox.innerHTML = '';
    selectedAnimes.forEach(anime => {
        const span = document.createElement('span');
        span.className = 'preview-item';
        span.textContent = anime.title;
        span.onclick = () => {
            selectedAnimes = selectedAnimes.filter(a => a.id !== anime.id);
            updatePreview();
            renderStep1();
        };
        previewBox.appendChild(span);
    });
    document.getElementById('count').textContent = selectedAnimes.length;
}

// Step 1 -> Step 2 전환
nextBtn.onclick = () => {
    if (selectedAnimes.length === 0) return alert('최소 한 개 이상의 작품을 선택해주세요!');
    
    currentStep = 2;
    stepTitle.textContent = "최종 각색상 선정 (Step 2)";
    
    // 검색창 및 프리뷰 숨김
    document.querySelector('.search-container').classList.add('hidden');
    document.getElementById('preview-section').classList.add('hidden');
    
    nextBtn.classList.add('hidden');
    decideBtn.classList.remove('hidden');
    navHome.textContent = "뒤로가기";
    navHome.onclick = goBackToStep1;

    renderStep2();
};

function renderStep2() {
    const parent = document.getElementById("anime-grid");
    if (!parent) return;

    parent.innerHTML = ""; // 기존 내용 비우기
    
    // 1. 부모 컨테이너를 그리드 레이아웃으로 설정
    parent.className = "grid-view"; 
    parent.style.display = "grid"; 

    // 2. Step 1에서 선택된 리스트(selectedAnimes)를 순회하며 카드 생성
    selectedAnimes.forEach(anime => {
        // 이미 만들어둔 createCard 함수 재사용
        // (이 함수 내부에서 currentStep을 체크하여 finalist 선택 로직으로 작동함)
        const card = createCard(anime); 
        parent.appendChild(card);
    });

    // 3. 상단 타이틀 변경 (필요 시)
    const stepTitle = document.getElementById("step-title");
    if (stepTitle) stepTitle.textContent = "최종 수상작 결정";
}

function goBackToStep1() {
    currentStep = 1;
    stepTitle.textContent = "각색상 후보 선정 (Step 1)";
    
    document.querySelector('.search-container').classList.remove('hidden');
    document.getElementById('preview-section').classList.remove('hidden');
    
    nextBtn.classList.remove('hidden');
    decideBtn.classList.add('hidden');
    navHome.textContent = "메인으로";
    navHome.onclick = () => location.href='../main/main.html';
    
    renderStep1(searchInput.value); // 검색어가 있었다면 유지하며 렌더링
}

// 최종 결정 및 팝업
decideBtn.onclick = () => {
    if (!finalist) return alert('최종 수상작을 선택해주세요!');

    // 1. 데이터 저장
    const result = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    result["각색상"] = { 
        title: finalist.title, 
        thumbnail: finalist.thumbnail, 
        adaptor: finalist.adaptor 
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(result));

    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalAdaptor = document.getElementById('modal-adaptor');

    if(modalImg) modalImg.src = finalist.thumbnail;
    if(modalTitle) modalTitle.textContent = finalist.title;
    if(modalAdaptor) modalAdaptor.textContent = `각색: ${finalist.adaptor.join(', ')}`;
    
    // 3. 모달 표시 및 폭죽
    document.getElementById('winner-modal').classList.remove('hidden');
    fireworks();
};

function fireworks() {
    const duration = 3 * 1000; // 3초 동안 지속
    const end = Date.now() + duration;

    (function frame() {
        // 왼쪽 하단에서 쏘아 올림
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 }, // y값을 조절해 위치 최적화 가능
            colors: ['#d4af37', '#ffffff'],
            zIndex: 9999
        });
        // 오른쪽 하단에서 쏘아 올림
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#d4af37', '#ffffff'],
            zIndex: 9999
        });

        // 3초가 지날 때까지 프레임 반복 호출
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// 시작
renderStep1();