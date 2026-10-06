const mainContainer = document.getElementById("main-container");
const top3Area = document.getElementById("top3-area");

// ──────────────────────────────────────────────
// 시즌 선택 (연도 카드 → 분기 카드)
// ──────────────────────────────────────────────
const YEARS = [...AvailableYears].sort((a, b) => a - b);
const QUARTERS = [
    { key: "1분기", label: "1분기", sub: "1 - 3월" },
    { key: "2분기", label: "2분기", sub: "4 - 6월" },
    { key: "3분기", label: "3분기", sub: "7 - 9월" },
    { key: "4분기", label: "4분기", sub: "10 - 12월" },
    { key: "모든 분기", label: "모든 분기", sub: "전체 연간" }
];

function getSelectedSeason() {
    return SeasonFilter.getSelectedSeason();
}

function setSelectedSeason(year, quarter) {
    if (year) localStorage.setItem("selected_year", year);
    if (quarter != null) localStorage.setItem("selected_quarter", SeasonFilter.normalizeSelection(quarter));
}

function clearSelectedSeason() {
    localStorage.removeItem("selected_year");
    localStorage.removeItem("selected_quarter");
}

function updateMainTitle() {
    const { year, quarter } = getSelectedSeason();
    const titleEl = document.getElementById("main-title");
    if (!titleEl || !year || !quarter) return;

    titleEl.textContent = (quarter === "모든 분기")
        ? `${year}년 애니메이션 연말 결산`
        : `${year}년 ${getSelectedSeason().label} 시상식`;
}

function renderYearCards() {
    const grid = document.getElementById("year-card-grid");
    if (!grid) return;

    const { year: selectedYear } = getSelectedSeason();

    grid.innerHTML = "";
    YEARS.forEach(year => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = `season-card ${String(year) === selectedYear ? "selected" : ""}`;
        card.innerHTML = `<span class="season-card-main">${year}</span><span class="season-card-sub">년</span>`;

        card.onclick = () => {
            setSelectedSeason(year, null);
            localStorage.removeItem("selected_quarter"); // 연도 바꾸면 분기 재선택 필요
            renderYearCards();
            renderQuarterCards();
        };

        grid.appendChild(card);
    });
}

function renderQuarterCards() {
    const grid = document.getElementById("quarter-card-grid");
    if (!grid) return;

    const { year, quarter: selectedQuarter } = getSelectedSeason();
    const controls = document.getElementById("season-selection-controls");
    controls.hidden = !year;
    const start = document.getElementById("season-start-btn");
    start.disabled = !selectedQuarter;
    start.onclick = enterMainContent;
    document.getElementById("season-selection-summary").textContent = selectedQuarter
        ? `선택: ${getSelectedSeason().label}` : "분기를 한 개 이상 선택해주세요.";

    if (!year) {
        grid.classList.add("hidden");
        grid.innerHTML = "";
        return;
    }

    grid.classList.remove("hidden");
    grid.innerHTML = "";

    QUARTERS.forEach(q => {
        const card = document.createElement("button");
        card.type = "button";
        const selected = selectedQuarter === "모든 분기"
            ? q.key === selectedQuarter : SeasonFilter.getQuarters(selectedQuarter).includes(q.key);
        card.className = `season-card quarter-card ${selected ? "selected" : ""}`;
        card.setAttribute("aria-pressed", String(selected));
        card.innerHTML = `<span class="season-card-main">${q.label}</span><span class="season-card-sub">${q.sub}</span>`;

        card.onclick = () => {
            let next = [];
            if (q.key === "모든 분기") next = [q.key];
            else {
                next = selectedQuarter === "모든 분기" ? [] : SeasonFilter.getQuarters(selectedQuarter);
                next = next.includes(q.key) ? next.filter(value => value !== q.key) : [...next, q.key];
            }
            setSelectedSeason(year, next);
            renderQuarterCards();
        };

        grid.appendChild(card);
    });
}

function enterMainContent() {
    const { year, quarter } = getSelectedSeason();
    if (!year || !quarter) return;

    // 1. 본문 먼저 그려놓기 (오버레이 뒤에서 준비)
    updateMainTitle();
    renderAwards();

    const overlay = document.getElementById("season-select-screen");
    const content = document.getElementById("content-area");

    // 2. 본문을 보이게 전환 시작
    content.classList.add("visible");

    // 3. 오버레이 페이드아웃
    overlay.classList.add("fade-out");

    // 4. 트랜지션 끝나면 완전히 DOM에서 숨김 (클릭 방지 + 렌더 비용 절약)
    overlay.addEventListener("transitionend", () => {
        overlay.classList.add("hidden");
    }, { once: true });

    const savedScrollY = sessionStorage.getItem("mainScrollY");
    if (savedScrollY !== null) {
        requestAnimationFrame(() => {
            window.scrollTo(0, parseInt(savedScrollY, 10));
        });
        sessionStorage.removeItem("mainScrollY"); // 한 번 쓰고 제거 (시즌 변경 등 다른 진입 경로에서 재사용 안 되도록)
    }
}

function openSeasonSelectScreen() {
    const overlay = document.getElementById("season-select-screen");
    const content = document.getElementById("content-area");

    overlay.classList.remove("hidden", "fade-out");
    content.classList.remove("visible");

    const grid = document.getElementById("quarter-card-grid");
    if (grid) { grid.classList.add("hidden"); grid.innerHTML = ""; }

    renderYearCards();
    renderQuarterCards();
}
function initSeasonGate() {
    const { year, quarter } = getSelectedSeason();

    if (year && quarter) {
        enterMainContent();
    } else {
        openSeasonSelectScreen();
    }

    const changeBtn = document.getElementById("change-season-btn");
    if (changeBtn) changeBtn.onclick = openSeasonSelectScreen;
}

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

// 기존 브라우저 저장 목록에서도 설레발 상은 PV 전용 테마로 연결한다.
const icarusAward = Awards.find(award => award.name === '올해의 설레발 상');
if (icarusAward) icarusAward.theme = 'pv_mode';

// 기존 카드 편집 목록의 원화상도 새 배경상으로 갱신한다.
let migratedBackgroundAward = false;
Awards.forEach(award => {
    if (award.theme !== 'key_animation') return;
    award.theme = 'background';
    if (award.name === '베스트 원화(작화)상') award.name = '베스트 배경상';
    migratedBackgroundAward = true;
});
if (savedAwards && migratedBackgroundAward) {
    localStorage.setItem('custom_awards_list', JSON.stringify(Awards));
}

document.getElementById("save-img-btn").onclick = async function () {
    const target = document.body;
    const btnGroup = document.querySelectorAll(".top-icon-btn, .floating-btn");
    const top3Cards = document.querySelectorAll(".award-card.rank-1, .award-card.rank-2, .award-card.rank-3");
    const mainTitle = document.querySelector('header h1');
    const aosElements = document.querySelectorAll('.aos-init');

    // ── 캡처 준비 ──────────────────────────────
    window.scrollTo(0, 0);
    btnGroup.forEach(btn => btn.style.opacity = "0");
    if (mainTitle) {
        mainTitle.style.webkitTextFillColor = "#e0e0e0";
        mainTitle.style.color = "#e0e0e0";
        mainTitle.style.backgroundImage = "none";
    }
    top3Cards.forEach(card => {
        card.style.animation = "none";
        card.style.opacity = "1";
        card.style.visibility = "visible";
        if (card.classList.contains('rank-1')) card.style.transform = "translateY(-80px)";
        else if (card.classList.contains('rank-2')) card.style.transform = "translateY(-20px)";
        else if (card.classList.contains('rank-3')) card.style.transform = "translateY(40px)";
    });
    aosElements.forEach(el => {
        el.classList.add('aos-animate');
        el.style.transition = 'none';
        el.style.opacity = '1';
        el.style.transform = 'none';
    });

    await new Promise(r => setTimeout(r, 600));

    // ── 설정 ───────────────────────────────────
    const ZOOM = 1.5;       // 확대 배율 (이것만 조절)
    const PAGE_W = document.body.scrollWidth;
    const PAGE_H = document.body.scrollHeight;

    // 조각당 높이: 픽셀 제한(268MB) 초과 안 하도록 자동 계산
    // canvas 1px = RGBA 4byte → 268,435,456 bytes / 4 = 67,108,864px
    const MAX_PX = 67_108_864;
    const CANVAS_W = Math.ceil(PAGE_W * ZOOM);
    const SLICE_PAGE_H = Math.floor(MAX_PX / CANVAS_W / ZOOM); // 원본 기준 조각 높이

    const sliceCount = Math.ceil(PAGE_H / SLICE_PAGE_H);
    console.log(`페이지: ${PAGE_W}x${PAGE_H} / ZOOM: ${ZOOM} / 조각 수: ${sliceCount}`);

    // ── 조각별 캡처 ────────────────────────────
    const slices = [];

    for (let i = 0; i < sliceCount; i++) {
        const startY  = i * SLICE_PAGE_H;
        const sliceH  = Math.min(SLICE_PAGE_H, PAGE_H - startY);

        const canvas = await html2canvas(target, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#050505",
            scale: ZOOM,            // scale = ZOOM 으로 단순화
            scrollY: 0,
            x: 0,
            y: startY,
            width: document.getElementById("main-container").offsetWidth + 48,
            height: sliceH,
            windowWidth: document.getElementById("main-container").offsetWidth + 48,
            windowHeight: PAGE_H,
            imageTimeout: 0,
            logging: false,
            onclone: (clonedDoc) => {
                clonedDoc.querySelectorAll(".top-icon-btn, .floating-btn")
                    .forEach(el => el.remove());
            }
        });

        slices.push(canvas);
        console.log(`조각 ${i + 1}/${sliceCount}: ${canvas.width}x${canvas.height}`);
    }

    // ── 조각 합치기 ────────────────────────────
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width  = slices[0].width;
    finalCanvas.height = slices.reduce((sum, c) => sum + c.height, 0);

    const ctx = finalCanvas.getContext("2d");
    let offsetY = 0;
    for (const slice of slices) {
        ctx.drawImage(slice, 0, offsetY);
        offsetY += slice.height;
    }

    // ── 저장 ───────────────────────────────────
    const link = document.createElement("a");
    link.download = `나의_애니메이션_어워즈_${new Date().toLocaleDateString()}.webp`;
    link.href = finalCanvas.toDataURL("image/webp", 0.92);
    link.click();

    // ── 복구 ───────────────────────────────────
    btnGroup.forEach(btn => btn.style.opacity = "1");
    if (mainTitle) {
        mainTitle.style.webkitTextFillColor = "";
        mainTitle.style.color = "";
        mainTitle.style.backgroundImage = "";
    }
    top3Cards.forEach(card => {
        card.style.animation = "";
        card.style.opacity = "";
        card.style.transform = "";
    });
    aosElements.forEach(el => {
        el.style.transition = '';
        el.style.opacity = '';
        el.style.transform = '';
    });
};

// 1. 카테고리 정의 및 비율 설정
const categories = [
    { title: "시상식 오프닝", themes: ['meme'], ratio: 'ratio-16-9' },
    { title: "음악 부문", themes: ['opening', 'ending', 'ost'], ratio: 'ratio-16-9' },
    { title: "성우 부문", themes: ['rookie_voice', 'voice_male', 'voice_female'], ratio: 'ratio-11-16' },
    { title: "캐릭터 부문", themes: ['character_male', 'character_female', 'best_couple','all_gender'], ratio: 'ratio-11-16' },
    { title: "스태프 부문", themes: ['scriptwriter', 'original', 'dramatization', 'director'], ratio: 'ratio-poster' },
    { title: "아트 부문", themes: ['in_between', 'background'], ratio: 'ratio-poster' },
    { title: "애니메이션 시리즈", themes: ['default','pv_mode', 'best_episode'], ratio: 'ratio-poster' },
    { title: "올해의 시리즈", themes: ['cinema', 'studio', 'series', 'top3'], ratio: 'ratio-poster' }
];

function renderAwards() {
    if (!mainContainer || !top3Area) return;

    mainContainer.innerHTML = "";
    top3Area.innerHTML = "";

    const results = ResultStorage.getResults();

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
            let finalRatio = ['studio', 'ost'].includes(award.theme) ? 'ratio-1-1' : cat.ratio;
            const card = createAwardCard(award, results, finalRatio);

            if (award.theme === 'studio') card.classList.add('studio-card');
            if (award.theme === 'ost') card.classList.add('ost-award-card');

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
    const trophy = getAwardTrophy(award);
    const isTrophyPath = path => /(?:^|\/)trophy(?:[- %][^/]*)?\.png$/i.test(String(path));
    let displayThumb = !award.thumb || isTrophyPath(award.thumb) ? trophy : award.thumb;

    if (winner) {
        if (winner.thumbnail) {
            displayThumb = winner.thumbnail;
        } else {
            const foundPath = Object.values(winner).find(v => 
                typeof v === 'string' && (v.includes('image/') || v.startsWith('http') || v.startsWith('data:image') || v.endsWith('.webp') || v.endsWith('.mp4'))
            );
            if (foundPath) displayThumb = foundPath;
        }

        if (winner.bestcouple) {
            displayTitle = `${winner.bestcouple.name1} ♥ ${winner.bestcouple.name2}`;
        } else if (winner.name1 && winner.name2) {
            displayTitle = `${winner.name1} ♥ ${winner.name2}`;
        } else if (winner.episodeNo && winner.episodeTitle) {
            displayTitle = `${winner.episodeNo} - ${winner.episodeTitle}`;
        } else {
            displayTitle = winner.title || winner.name || winner.animeTitle || "수상작";
        }
        
        card.classList.add("has-winner");
    }

    // 이전에 저장한 커스텀 상의 기본 트로피 경로도 새 디자인으로 표시한다.
    if (isTrophyPath(displayThumb)) displayThumb = trophy;
    const wrapper = document.createElement('div');
    wrapper.className = 'thumb-wrapper';
    const isVideo = String(displayThumb).endsWith('.mp4');
    const media = document.createElement(isVideo ? 'video' : 'img');
    media.className = 'award-thumb';
    if (displayThumb === trophy && !winner?.personalMemeId) media.classList.add('award-trophy');
    if (isVideo) { media.autoplay = true; media.muted = true; media.loop = true; media.playsInline = true; }
    else { media.alt = displayTitle; media.onerror = () => { media.onerror = null; media.src = trophy; media.classList.add('fallback-img', 'award-trophy'); }; }
    media.src = winner?.personalMemeId ? './image/no-image.svg' : displayThumb;
    wrapper.appendChild(media);
    const name = document.createElement('div');
    name.className = 'award-name';
    name.textContent = SeasonFilter.toDisplayAwardName(award.name);
    const title = document.createElement('div');
    title.className = 'award-winner';
    title.title = title.textContent = displayTitle;
    card.append(wrapper, name, title);
    if (winner?.personalMemeId) {
        PersonalMemeStorage.get(winner.personalMemeId).then(record => {
            if (!record || !card.isConnected) return;
            const url = URL.createObjectURL(record.file);
            const personalMedia = document.createElement(record.type === 'video' ? 'video' : 'img');
            personalMedia.className = 'award-thumb';
            if (record.type === 'video') {
                personalMedia.autoplay = true; personalMedia.muted = true;
                personalMedia.loop = true; personalMedia.playsInline = true;
            } else { personalMedia.alt = record.name; }
            personalMedia.src = url;
            wrapper.replaceChildren(personalMedia);
            title.title = title.textContent = record.name;
            // 화면에서 카드가 제거되면 해당 파일 URL도 해제한다.
            const observer = new MutationObserver(() => {
                if (!card.isConnected) {
                    if (record.type === 'video') { personalMedia.pause(); personalMedia.removeAttribute('src'); personalMedia.load(); }
                    URL.revokeObjectURL(url); observer.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }).catch(error => { console.warn('개인 밈 미디어를 불러오지 못했습니다.', error); });
    }

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

        sessionStorage.setItem("mainScrollY", window.scrollY);

        const query = `awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        let path = "nominate/nominate.html";
        const theme = award.theme;

        if (theme === "top3" || theme === 'series') path = "top3Nominate/top3Nominate.html";
        else if (['opening', 'ending'].includes(theme)) path = "songNominate/songNominate.html";
        else if (theme === 'ost') path = "OSTNominate/OSTNominate.html";
        else if (theme === 'pv_mode') path = "nominate/nominate.html";
        else if (theme === 'rookie_voice') path = "rookieNominate/rookieNominate.html";
        else if (theme === 'meme') path = "memeNominate/memeNominate.html";
        else if (theme === 'scriptwriter' || theme === 'original') path = "scriptwriterNominate/scriptwriterNominate.html";
        else if (theme === 'director') path = "directorNominate/directorNominate.html";
        else if (theme === 'dramatization') path = "adaptorNominate/adaptorNominate.html";
        else if (theme === 'best_episode') path = "episodeNominate/episodeNominate.html";
        else if (theme === 'cinema') path = "cinemaNominate/cinemaNominate.html";
        else if (theme === 'studio') path = "studioNominate/studioNominate.html";
        else if (theme === 'character_male') path = "charNominate/charNominate.html";
        else if (theme === 'character_female') path = "charNominate/charNominate.html";
        else if (theme === 'all_gender') path = "charNominate/charNominate.html";
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
        ResultStorage.clearResults();   // ← 수정
        renderAwards();
    }
};

// 🟢 [버튼 2] 전체 상태 (카드 포함) 맨 처음으로 초기화
document.getElementById("reset-all-btn").onclick = () => {
    if (confirm("⚠️ 경고 ⚠️\n수상 결과는 물론, 사용자가 직접 추가하거나 삭제한 카드 내역까지 모두 맨 처음 상태로 되돌리시겠습니까?")) {
        ResultStorage.clearResults();   // ← 수정
        localStorage.removeItem("custom_awards_list");
        location.reload();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initAOS();
    initSeasonGate();
    
    const infoModal = document.getElementById("info-modal");
    const infoBtn = document.getElementById("info-btn");
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
            const theme = document.querySelector('input[name="new-award-theme"]:checked').value;

            if (!title.trim()) {
                alert("상 제목을 입력해주세요!");
                return;
            }

            Awards.push({ name: title, theme: theme, thumb: getAwardTrophy({ name: title, theme }) });
            
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
});
