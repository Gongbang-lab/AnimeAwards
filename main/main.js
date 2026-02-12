const mainContainer = document.getElementById("main-container");
const top3Area = document.getElementById("top3-area");
const resetBtn = document.getElementById("reset-btn");
document.getElementById("save-img-btn").onclick = function() {
    // 1. 캡처할 대상 요소 선택 (전체 컨테이너 혹은 특정 영역)
    const target = document.getElementById("main-container"); 
    
    // 버튼 등을 캡처에서 제외하고 싶다면 클래스로 조절하거나 미리 숨깁니다.
    // 예: save-img-btn.style.display = 'none';

    html2canvas(target, {
        useCORS: true, // 외부 서버(데이터)의 이미지 허용
        allowTaint: true,
        backgroundColor: "#121212", // 캡처 시 배경색 지정 (CSS와 맞출 것)
        scale: 2 // 해상도를 2배로 높여서 선명하게 저장
    }).then(canvas => {
        // 2. 캔버스를 이미지 데이터로 변환
        const link = document.createElement("a");
        link.download = `나의_애니메이션_어워즈_${new Date().toLocaleDateString()}.png`;
        link.href = canvas.toDataURL("image/png");
        
        // 3. 가상 링크 클릭으로 다운로드 실행
        link.click();
        
        // 버튼 다시 보이기 (숨겼을 경우)
        // save-img-btn.style.display = 'block';
    });
};

// 1. 카테고리 정의 및 비율 설정
const categories = [
    { title: "시상식 오프닝", themes: ['meme'], ratio: 'ratio-16-9' },
    { title: "음악 부문", themes: ['opening', 'ending', 'ost'], ratio: 'ratio-16-9' },
    { title: "성우 부문", themes: ['rookie_voice', 'voice_male', 'voice_female'], ratio: 'ratio-11-16' },
    { title: "캐릭터 부문", themes: ['character_male', 'character_female', 'best_couple'], ratio: 'ratio-11-16' },
    { title: "스태프 부문", themes: ['original', 'dramatization', 'director'], ratio: 'ratio-poster' }, // 동화, 원화 제외
    { title: "아트 부문", themes: ['directing','in_between', 'key_animation'], ratio: 'ratio-poster' }, // 새롭게 추가
    { title: "애니메이션 시리즈", themes: ['default', 'best_episode'], ratio: 'ratio-poster' },
    { title: "올해의 시리즈", themes: ['cinema', 'studio', 'series', 'top3'], ratio: 'ratio-poster' }
];

function renderAwards() {
    if (!mainContainer || !top3Area) return;

    mainContainer.innerHTML = "";
    top3Area.innerHTML = "";

    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};

    // --- 1. 수상 완료된 TOP 3 데이터 추출 (상단 노출용) ---
    const top3Names = ['대상', '최우수상', '우수상'];
    const wonTop3 = Awards.filter(a => {
        const hasResult = Object.values(results).some(val => 
            Array.isArray(val) && val.find(item => String(item.rank).trim() === String(a.name).trim())
        );
        return top3Names.includes(a.name) && hasResult;
    });

    // 수상이 완료되었다면 상단에 가로로 배치
    if (wonTop3.length > 0) {
    // 시상대 순서: 최우수상(2등) - 대상(1등) - 우수상(3등)
    const podiumOrder = { '최우수상': 1, '대상': 2, '우수상': 3 };
    wonTop3.sort((a, b) => podiumOrder[a.name] - podiumOrder[b.name]);
    
    wonTop3.forEach(award => {
        const card = createAwardCard(award, results, 'ratio-poster');
        // CSS에서 개별 제어를 하기 위해 클래스 추가
        if (award.name === '대상') card.classList.add('rank-1');
        else if (award.name === '최우수상') card.classList.add('rank-2');
        else if (award.name === '우수상') card.classList.add('rank-3');
        
        top3Area.appendChild(card);
    });
      top3Area.style.display = "flex";
    } else {
        top3Area.style.display = "none";
    }

    // --- 2. 카테고리별 렌더링 (하단 목록) ---
    categories.forEach(cat => {
        const filteredAwards = Awards.filter(a => {
            // 해당 카테고리 테마에 포함되는지 확인
            if (!cat.themes.includes(a.theme)) return false;

            // 핵심 수정 포인트:
            // 1. 개별 상인 '대상', '최우수상', '우수상'은 하단 목록에 절대 직접 노출하지 않음
            if (top3Names.includes(a.name)) return false;

            // 2. "올해의 애니메이션" 진입 카드의 경우 (theme: 'series' 또는 'top3'로 설정된 경우)
            // 수상이 완료된 데이터(wonTop3)가 하나라도 있다면 목록에서 삭제(false 반환)
            if ((a.theme === 'series' || a.name === '올해의 애니메이션') && wonTop3.length > 0) {
                return false;
            }

            return true;
        });

        if (filteredAwards.length === 0) return;

        const section = document.createElement("section");
        section.className = "award-section";
        section.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">${cat.title}</h2>
                <div class="section-divider"></div>
            </div>
            <div class="award-grid-inner"></div>
        `;

        const grid = section.querySelector(".award-grid-inner");
        filteredAwards.forEach(award => {
    // 기본은 카테고리 설정 비율을 따르되, studio는 무조건 16:9
          let finalRatio = (award.theme === 'studio') ? 'ratio-16-9' : cat.ratio;
    
    // 카드 생성 함수 호출
          const card = createAwardCard(award, results, finalRatio);
    
    // 디자인 보정: 스튜디오 카드에만 특별한 식별자 부여 (필요 시 CSS에서 활용)
          if (award.theme === 'studio') {
            card.classList.add('studio-card');
          }
    
    grid.appendChild(card);
});

        mainContainer.appendChild(section);
    });
}

// 공통 카드 생성 함수
function createAwardCard(award, results, ratioClass) {
    const card = document.createElement("div");
    card.className = `award-card ${ratioClass}`;

    let winner = null;

    // [핵심 수정: 매칭 우선순위] 
    // 1. 먼저 TOP3 배열 내부에서 이 카드의 이름(대상/최우수/우수)이 있는지 "가장 먼저" 확인
    for (const val of Object.values(results)) {
        if (Array.isArray(val)) {
            // 배열 속 객체들 중 rank가 내 카드 이름과 일치하는 것을 탐색
            const found = val.find(item => String(item.rank).trim() === String(award.name).trim());
            if (found) {
                winner = found;
                break;
            }
        }
    }

    // 2. 배열에서 못 찾았고, results[award.name]이 단일 객체일 때만 직접 매칭
    if (!winner && results[award.name] && !Array.isArray(results[award.name])) {
        winner = results[award.name];
    }

    // 기본값 설정
    let displayTitle = "준비중";
    let displayThumb = award.thumb || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    if (winner) {
        // [끝판왕 로직 적용: 어떤 키 이름으로 저장되어 있든 강제 추출]
        Object.keys(winner).forEach(key => {
            const value = winner[key];
            if (typeof value === 'string' && value.length > 0) {
                // 이미지/비디오 경로 추출
                if (value.includes('../image/') || value.endsWith('.webp') || value.endsWith('.mp4')) {
                    displayThumb = value;
                } 
                // 제목 추출 (rank 제외, title이나 name 등 문자열 추출)
                else if (key !== 'rank' && value.length > 1 && displayTitle === "준비중") {
                    displayTitle = value;
                }
            }
        });
        card.classList.add("has-winner");
    }

    // 3. 비디오 태그 대응 렌더링
    const isVideo = displayThumb.endsWith('.mp4') || (winner && winner.type === 'video');
    const mediaTag = isVideo 
        ? `<video src="${displayThumb}" class="award-thumb" autoplay muted loop playsinline></video>`
        : `<img src="${displayThumb}" class="award-thumb" onerror="this.src='${award.thumb}'">`;

    card.innerHTML = `
        <div class="thumb-wrapper">
            ${mediaTag}
        </div>
        <div class="award-name">${award.name}</div>
        <div class="award-winner">${displayTitle}</div>
    `;

    // 클릭 시 이동 (기존 로직 유지)
    card.onclick = () => {
        const query = `awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        let path = "../nominate/nominate.html";
        
        const theme = award.theme;
        if (theme === "top3") path = "../top3Nominate/top3Nominate.html";
        else if (['opening', 'ending', 'ost'].includes(theme)) path = "../songNominate/songNominate.html";
        else if (['character_male', 'character_female'].includes(theme)) path = "../charNominate/charNominate.html";
        else if (['voice_male', 'voice_female'].includes(theme)) path = "../cvNominate/cvNominate.html";
        else if (theme === 'rookie_voice') path = "../rookieNominate/rookieNominate.html";
        else if (theme === 'meme') path = "../memeNominate/memeNominate.html";
        else if (theme === 'original') path = "../originalNominate/originalNominate.html";
        else if (theme === 'director') path = "../directorNominate/directorNominate.html";
        else if (theme === 'dramatization') path = "../adaptorNominate/adaptorNominate.html";
        else if (theme === 'best_episode') path = "../episodeNominate/episodeNominate.html";
        else if (theme === 'cinema') path = "../cinemaNominate/cinemaNominate.html";
        else if (theme === 'studio') path = "../studioNominate/studioNominate.html";
        else if (theme === 'series') path = "../top3Nominate/top3Nominate.html";

        location.href = `${path}?${query}`;
    };

    return card;
}

resetBtn.onclick = () => {
    if (confirm("모든 수상 결과를 초기화하시겠습니까?")) {
        localStorage.removeItem("anime_awards_result");
        renderAwards();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const infoBtn = document.getElementById("info-btn");
    const infoModal = document.getElementById("info-modal");
    const closeModal = document.querySelector(".close-modal");

    // 모달 열기
    infoBtn.onclick = () => {
        infoModal.style.display = "flex";
    };

    // 모달 닫기 (X 버튼)
    closeModal.onclick = () => {
        infoModal.style.display = "none";
    };

    // 모달 닫기 (배경 클릭 시)
    window.onclick = (event) => {
        if (event.target === infoModal) {
            infoModal.style.display = "none";
        }
    };

    renderAwards();
});