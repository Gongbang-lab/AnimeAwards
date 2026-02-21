const mainContainer = document.getElementById("main-container");
const top3Area = document.getElementById("top3-area");
const resetBtn = document.getElementById("reset-btn");
document.getElementById("save-img-btn").onclick = function() {
    const target = document.body;
    const btn = this;
    
    window.scrollTo(0, 0);

    // 캡처 전 처리: 버튼 숨기기 & AOS 애니메이션 강제 완료
    btn.style.opacity = "0";
    const aosElements = document.querySelectorAll('.aos-init');
    aosElements.forEach(el => el.classList.add('aos-animate')); // 모든 애니메이션 완료 상태로 고정

    html2canvas(target, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#121212",
        scale: 2,
        // 스크롤이 내려가 있어도 전체를 캡처하기 위한 옵션
        scrollY: -window.scrollY,
        windowHeight: target.scrollHeight
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = `나의_애니메이션_어워즈_${new Date().toLocaleDateString()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        // 다시 원래대로 복구
        btn.style.opacity = "1";
    });
};

// 1. 카테고리 정의 및 비율 설정
const categories = [
    { title: "시상식 오프닝", themes: ['meme'], ratio: 'ratio-16-9' },
    { title: "음악 부문", themes: ['opening', 'ending', 'ost'], ratio: 'ratio-16-9' },
    { title: "성우 부문", themes: ['rookie_voice', 'voice_male', 'voice_female'], ratio: 'ratio-11-16' },
    { title: "캐릭터 부문", themes: ['character_male', 'character_female', 'best_couple'], ratio: 'ratio-11-16' },
    { title: "스태프 부문", themes: ['original', 'dramatization', 'director'], ratio: 'ratio-poster' }, // 동화, 원화 제외
    { title: "아트 부문", themes: ['in_between', 'key_animation','directing'], ratio: 'ratio-poster' }, // 새롭게 추가
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
        if (!cat.themes.includes(a.theme)) return false;
        if (top3Names.includes(a.name)) return false;
        if ((a.theme === 'series' || a.name === '올해의 시리즈') && wonTop3.length > 0) {
            return false;
        }
        return true;
    });

    if (filteredAwards.length === 0) return;

    const section = document.createElement("section");
    section.className = "award-section";
    
    if (cat.title === "시상식 오프닝" || cat.title === "음악 부문") {
        section.classList.add("special-layout"); 
    }

    section.setAttribute("data-aos", "fade-up");

    section.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">${cat.title}</h2>
            <div class="section-divider"></div>
        </div>
        <div class="award-grid-inner"></div>
    `;

    const grid = section.querySelector(".award-grid-inner");
    
    // filteredAwards를 돌면서 실제 카드 생성 및 AOS 시차 부여
filteredAwards.forEach((award, index) => {
    let finalRatio = (award.theme === 'studio') ? 'ratio-1-1' : cat.ratio;
    
    const card = createAwardCard(award, results, finalRatio);

    if (award.theme === 'studio') {
        card.classList.add('studio-card');
    }

    const delay = (index % 4) * 100; 
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", delay);

    grid.appendChild(card);
});

    mainContainer.appendChild(section);
});

// 모든 카드가 생성된 후 AOS 새로고침
setTimeout(() => {
    AOS.refresh();
}, 200);
}

function initAOS() {
    AOS.init({
        duration: 800, // 애니메이션 지속 시간 (ms)
        easing: 'ease-in-out', // 부드러운 속도 곡선
        once: false, // 스크롤 올릴 때 다시 애니메이션 실행 여부
        offset: 100 // 요소가 화면에 얼마나 보였을 때 시작할지 (px)
    });
}

// 공통 카드 생성 함수
function createAwardCard(award, results, ratioClass) {
    const card = document.createElement("div");
    card.className = `award-card ${ratioClass}`;

    // 1. 정확한 키 매칭 (results['오프닝'])
    let winner = results[award.name];

    // 2. 만약 직접 매칭이 안 되면 배열(TOP3 등)에서 찾기
    if (!winner) {
        for (const val of Object.values(results)) {
            if (Array.isArray(val)) {
                winner = val.find(item => 
                    item.rank && String(item.rank).trim() === String(award.name).trim()
                );
                if (winner) break;
            }
        }
    }

    let displayTitle = "준비중";
    let displayThumb = award.thumb || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    if (winner) {
        // [수정된 썸네일 추출 로직]
        // winner.thumbnail이 있으면 최우선으로 사용 (유튜브 주소든 로컬 경로든 상관없음)
        if (winner.thumbnail) {
            displayThumb = winner.thumbnail;
        } 
        // 키 이름이 다를 경우를 대비한 자동 탐색 (http로 시작하거나 로컬 경로인 문자열 찾기)
        else {
            const foundPath = Object.values(winner).find(v => 
                typeof v === 'string' && 
                (v.includes('../image/') || 
                v.startsWith('http') || 
                v.startsWith('data:image') ||
                v.endsWith('.webp') || 
                v.endsWith('.mp4'))
            );
            if (foundPath) displayThumb = foundPath;
        }

        // 제목 설정 (오프닝의 경우 노래 제목인 winner.title 사용)
        if (winner.bestcouple) {
        displayTitle = `${winner.bestcouple.name1} ♥ ${winner.bestcouple.name2}`;
        } else {
        displayTitle = winner.title || winner.name || winner.animeTitle || "수상작";
        }
        card.classList.add("has-winner");
    }

    // 3. 렌더링 (이미지 또는 비디오)
    const isVideo = String(displayThumb).endsWith('.mp4');
    const mediaTag = isVideo 
        ? `<video src="${displayThumb}" class="award-thumb" autoplay muted loop playsinline></video>`
        : `<img src="${displayThumb}" class="award-thumb" onerror="this.src='${award.thumb}'">`;

    card.innerHTML = `
        <div class="thumb-wrapper">
            ${mediaTag}
        </div>
        <div class="award-name">${award.name}</div>
        <div class="award-winner" title="${displayTitle}">${displayTitle}</div>
    `;

    // 4. 클릭 이벤트 (기존 유지)
    card.onclick = () => {
        const query = `awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        let path = "../nominate/nominate.html";
        const theme = award.theme;

        if (theme === "top3" || theme === 'series') path = "../top3Nominate/top3Nominate.html";
        else if (['opening', 'ending', 'ost'].includes(theme)) path = "../songNominate/songNominate.html";
        else if (theme === 'rookie_voice') path = "../rookieNominate/rookieNominate.html";
        else if (theme === 'meme') path = "../memeNominate/memeNominate.html";
        else if (theme === 'original') path = "../originalNominate/originalNominate.html";
        else if (theme === 'director') path = "../directorNominate/directorNominate.html";
        else if (theme === 'dramatization') path = "../adaptorNominate/adaptorNominate.html";
        else if (theme === 'best_episode') path = "../episodeNominate/episodeNominate.html";
        else if (theme === 'cinema') path = "../cinemaNominate/cinemaNominate.html";
        else if (theme === 'studio') path = "../studioNominate/studioNominate.html";
        else if (theme === 'character_male') path = "../charNominate/charNominate.html";
        else if (theme === 'character_female') path = "../charNominate/charNominate.html";
        else if (theme === 'voice_male') path = "../cvNominate/cvNominate.html";
        else if (theme === 'voice_female') path = "../cvNominate/cvNominate.html";
        else if (theme === 'best_couple') path = "../bestCoupleNominate/bestCoupleNominate.html";

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
    initAOS();

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