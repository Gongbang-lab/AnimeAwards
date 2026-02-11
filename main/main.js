const mainContainer = document.getElementById("main-container");
const top3Area = document.getElementById("top3-area");
const resetBtn = document.getElementById("reset-btn");

// 1. 카테고리 정의 및 비율 설정
const categories = [
    { title: "시상식 오프닝", themes: ['meme'], ratio: 'ratio-16-9' },
    { title: "음악 부문", themes: ['opening', 'ending', 'ost'], ratio: 'ratio-16-9' },
    { title: "성우 부문", themes: ['rookie_voice', 'voice_male', 'voice_female'], ratio: 'ratio-11-16' },
    { title: "캐릭터 부문", themes: ['character_male', 'character_female', 'best_couple'], ratio: 'ratio-11-16' },
    { title: "스태프 부문", themes: ['original', 'dramatization', 'director'], ratio: 'ratio-poster' }, // 동화, 원화 제외
    { title: "아트 부문", themes: ['in_between', 'key_animation'], ratio: 'ratio-poster' }, // 새롭게 추가
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
    for (const val of Object.values(results)) {
        if (Array.isArray(val)) {
            winner = val.find(item => String(item.rank).trim() === String(award.name).trim());
            if (winner) break;
        }
    }

    let displayTitle = "준비중";
    let displayThumb = award.thumb || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    if (winner) {
        Object.keys(winner).forEach(key => {
            const value = winner[key];
            if (typeof value === 'string') {
                if (value.includes('../image/')) displayThumb = value;
                else if (key !== 'rank' && value.length > 1) displayTitle = value;
            }
        });
        card.classList.add("has-winner");
    }

    card.innerHTML = `
        <div class="thumb-wrapper">
            <img src="${displayThumb}" class="award-thumb" onerror="this.src='${award.thumb}'">
        </div>
        <div class="award-name">${award.name}</div>
        <div class="award-winner">${displayTitle}</div>
    `;

    // 클릭 시 이동 (상세 페이지 분기 로직)
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

document.addEventListener("DOMContentLoaded", renderAwards);