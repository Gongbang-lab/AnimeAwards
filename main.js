const mainContainer = document.getElementById("main-container");
const top3Area = document.getElementById("top3-area");

// 삭제 모드 상태 관리
let isDeleteMode = false;

// 🟢 [핵심 추가] 카드 리스트 로드 로직
// 브라우저에 저장된 사용자의 카드 편집 내역(추가/삭제)이 있다면 불러와서 전역 변수 Awards를 덮어씌움
const savedAwards = localStorage.getItem("custom_awards_list");
if (savedAwards) {
    const parsedAwards = JSON.parse(savedAwards);
    Awards.length = 0;             // 원본 배열 데이터 싹 비우기
    Awards.push(...parsedAwards);  // 로컬스토리지에 저장된(추가/삭제된) 데이터로 채워넣기
}

document.getElementById("save-img-btn").onclick = function() {
    const target = document.body;
    const btnGroup = document.querySelectorAll(".top-icon-btn");
    
    window.scrollTo(0, 0);

    // 캡처 전 처리: 상단 버튼 숨기기 & AOS 애니메이션 강제 완료
    btnGroup.forEach(btn => btn.style.opacity = "0");
    const aosElements = document.querySelectorAll('.aos-init');
    aosElements.forEach(el => el.classList.add('aos-animate'));

    html2canvas(target, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#121212",
        scale: 2,
        scrollY: -window.scrollY,
        windowHeight: target.scrollHeight
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = `나의_애니메이션_어워즈_${new Date().toLocaleDateString()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        // 다시 원래대로 복구
        btnGroup.forEach(btn => btn.style.opacity = "1");
    });
};

// 1. 카테고리 정의 및 비율 설정
const categories = [
    { title: "시상식 오프닝", themes: ['meme'], ratio: 'ratio-16-9' },
    { title: "음악 부문", themes: ['opening', 'ending', 'ost'], ratio: 'ratio-16-9' },
    { title: "성우 부문", themes: ['rookie_voice', 'voice_male', 'voice_female'], ratio: 'ratio-11-16' },
    { title: "캐릭터 부문", themes: ['character_male', 'character_female', 'best_couple'], ratio: 'ratio-11-16' },
    { title: "스태프 부문", themes: ['original', 'dramatization', 'director'], ratio: 'ratio-poster' },
    { title: "아트 부문", themes: ['in_between', 'key_animation'], ratio: 'ratio-poster' },
    { title: "애니메이션 시리즈", themes: ['default', 'best_episode'], ratio: 'ratio-poster' },
    { title: "올해의 시리즈", themes: ['cinema', 'studio', 'series', 'top3'], ratio: 'ratio-poster' }
];

function renderAwards() {
    if (!mainContainer || !top3Area) return;

    mainContainer.innerHTML = "";
    top3Area.innerHTML = "";

    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};

    // --- 1. 수상 완료된 TOP 3 데이터 추출 ---
    const top3Names = ['대상', '최우수상', '우수상'];
    const wonTop3 = Awards.filter(a => {
        const hasResult = Object.values(results).some(val => 
            Array.isArray(val) && val.find(item => String(item.rank).trim() === String(a.name).trim())
        );
        return top3Names.includes(a.name) && hasResult;
    });

    if (wonTop3.length > 0) {
        const podiumOrder = { '최우수상': 1, '대상': 2, '우수상': 3 };
        wonTop3.sort((a, b) => podiumOrder[a.name] - podiumOrder[b.name]);
        
        wonTop3.forEach(award => {
            const card = createAwardCard(award, results, 'ratio-poster');
            if (award.name === '대상') card.classList.add('rank-1');
            else if (award.name === '최우수상') card.classList.add('rank-2');
            else if (award.name === '우수상') card.classList.add('rank-3');
            top3Area.appendChild(card);
        });
        top3Area.style.display = "flex";
    } else {
        top3Area.style.display = "none";
    }

    // --- 2. 카테고리별 렌더링 ---
    categories.forEach(cat => {
        const filteredAwards = Awards.filter(a => {
            if (!cat.themes.includes(a.theme)) return false;
            if (top3Names.includes(a.name)) return false;
            if ((a.theme === 'series' || a.name === '올해의 시리즈') && wonTop3.length > 0) return false;
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
        
        filteredAwards.forEach((award, index) => {
            let finalRatio = (award.theme === 'studio') ? 'ratio-1-1' : cat.ratio;
            const card = createAwardCard(award, results, finalRatio);

            if (award.theme === 'studio') card.classList.add('studio-card');

            const delay = (index % 4) * 100; 
            card.setAttribute("data-aos", "fade-up");
            card.setAttribute("data-aos-delay", delay);

            grid.appendChild(card);
        });

        mainContainer.appendChild(section);
    });

    setTimeout(() => { AOS.refresh(); }, 200);
}

function initAOS() {
    AOS.init({
        duration: 800, 
        easing: 'ease-in-out',
        once: false,
        offset: 100
    });
}

// 공통 카드 생성 함수
function createAwardCard(award, results, ratioClass) {
    const card = document.createElement("div");
    card.className = `award-card ${ratioClass}`;

    let winner = results[award.name];

    if (!winner) {
        for (const val of Object.values(results)) {
            if (Array.isArray(val)) {
                winner = val.find(item => item.rank && String(item.rank).trim() === String(award.name).trim());
                if (winner) break;
            }
        }
    }

    let displayTitle = "준비중";
    let displayThumb = award.thumb || `./image/trophy.png`;

    if (winner) {
        if (winner.thumbnail) {
            displayThumb = winner.thumbnail;
        } else {
            const foundPath = Object.values(winner).find(v => 
                typeof v === 'string' && (v.includes('image/') || v.startsWith('http') || v.startsWith('data:image') || v.endsWith('.webp') || v.endsWith('.mp4'))
            );
            if (foundPath) displayThumb = foundPath;
        }

        if (winner.bestcouple) displayTitle = `${winner.bestcouple.name1} ♥ ${winner.bestcouple.name2}`;
        else displayTitle = winner.title || winner.name || winner.animeTitle || "수상작";
        
        card.classList.add("has-winner");
    }

    const isVideo = String(displayThumb).endsWith('.mp4');
    const mediaTag = isVideo 
        ? `<video src="${displayThumb}" class="award-thumb" autoplay muted loop playsinline></video>`
        : `<img src="${displayThumb}" class="award-thumb" onerror="this.src='./image/trophy.png'">`;

    card.innerHTML = `
        <div class="thumb-wrapper">
            ${mediaTag}
        </div>
        <div class="award-name">${award.name}</div>
        <div class="award-winner" title="${displayTitle}">${displayTitle}</div>
    `;

    // 클릭 이벤트
    card.onclick = () => {
        if (isDeleteMode) {
            if (confirm(`'${award.name}' 카드를 삭제하시겠습니까?`)) {
                const index = Awards.findIndex(a => a.name === award.name && a.theme === award.theme);
                if (index > -1) {
                    Awards.splice(index, 1);
                    // 🟢 [핵심 추가] 삭제된 상태를 브라우저에 저장
                    localStorage.setItem("custom_awards_list", JSON.stringify(Awards));
                    renderAwards();
                }
            }
            return;
        }

        const query = `awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        let path = "nominate/nominate.html";
        const theme = award.theme;

        if (theme === "top3" || theme === 'series') path = "top3Nominate/top3Nominate.html";
        else if (['opening', 'ending'].includes(theme)) path = "songNominate/songNominate.html";
        else if (theme === 'ost') path = "OSTNominate/OSTNominate.html"
        else if (theme === 'rookie_voice') path = "rookieNominate/rookieNominate.html";
        else if (theme === 'meme') path = "memeNominate/memeNominate.html";
        else if (theme === 'original') path = "originalNominate/originalNominate.html";
        else if (theme === 'director') path = "directorNominate/directorNominate.html";
        else if (theme === 'dramatization') path = "adaptorNominate/adaptorNominate.html";
        else if (theme === 'best_episode') path = "episodeNominate/episodeNominate.html";
        else if (theme === 'cinema') path = "cinemaNominate/cinemaNominate.html";
        else if (theme === 'studio') path = "studioNominate/studioNominate.html";
        else if (theme === 'character_male') path = "charNominate/charNominate.html";
        else if (theme === 'character_female') path = "charNominate/charNominate.html";
        else if (theme === 'voice_male') path = "cvNominate/cvNominate.html";
        else if (theme === 'voice_female') path = "cvNominate/cvNominate.html";
        else if (theme === 'best_couple') path = "bestCoupleNominate/bestCoupleNominate.html";
        else if (theme === 'default') path = "nominate/nominate.html";  
        location.href = `${path}?${query}`;
    };

    return card;
}

// 🟢 [버튼 1] 수상 결과만 초기화
document.getElementById("reset-result-btn").onclick = () => {
    if (confirm("수상 결과를 초기화하시겠습니까?\n(직접 추가/삭제한 카드 목록은 그대로 유지됩니다)")) {
        localStorage.removeItem("anime_awards_result");
        renderAwards();
    }
};

// 🟢 [버튼 2] 전체 상태 (카드 포함) 맨 처음으로 초기화
document.getElementById("reset-all-btn").onclick = () => {
    if (confirm("⚠️ 경고 ⚠️\n수상 결과는 물론, 사용자가 직접 추가하거나 삭제한 카드 내역까지 모두 맨 처음 상태로 되돌리시겠습니까?")) {
        localStorage.removeItem("anime_awards_result");
        localStorage.removeItem("custom_awards_list"); // 커스텀 카드 목록 삭제
        location.reload(); // 새로고침 하여 awardData.js 원본 데이터로 재시작
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initAOS();

    const infoBtn = document.getElementById("info-btn");
    const infoModal = document.getElementById("info-modal");
    const closeInfoModal = document.querySelector("#info-modal .close-modal");

    if(infoBtn) infoBtn.onclick = () => { infoModal.style.display = "flex"; };
    if(closeInfoModal) closeInfoModal.onclick = () => { infoModal.style.display = "none"; };

    const addBtn = document.getElementById("add-btn");
    const rmBtn = document.getElementById("rm-btn");
    const addModal = document.getElementById("add-modal");
    const closeAddModal = document.querySelector("#add-modal .close-modal");
    const submitNewAwardBtn = document.getElementById("submit-new-award");

    if(addBtn) addBtn.onclick = () => { addModal.style.display = "flex"; };
    if(closeAddModal) closeAddModal.onclick = () => { addModal.style.display = "none"; };

    window.onclick = (event) => {
        if (event.target === infoModal) infoModal.style.display = "none";
        if (event.target === addModal) addModal.style.display = "none";
    };

    // 상 추가 로직
    if(submitNewAwardBtn) {
        submitNewAwardBtn.onclick = () => {
            const title = document.getElementById("new-award-title").value;
            const theme = document.getElementById("new-award-theme").value;

            if (!title.trim()) {
                alert("상 제목을 입력해주세요!");
                return;
            }

            Awards.push({ name: title, theme: theme, thumb: './image/trophy.png' });
            
            // 🟢 [핵심 추가] 추가된 상태를 브라우저에 저장
            localStorage.setItem("custom_awards_list", JSON.stringify(Awards));

            addModal.style.display = "none";
            document.getElementById("new-award-title").value = "";
            renderAwards();
        };
    }

    // 카드 삭제 모드 토글
    if(rmBtn) {
        rmBtn.onclick = () => {
            isDeleteMode = !isDeleteMode;
            if (isDeleteMode) {
                rmBtn.classList.add("active");
                document.body.classList.add("delete-mode");
            } else {
                rmBtn.classList.remove("active");
                document.body.classList.remove("delete-mode");
            }
        };
    }

    renderAwards();
});