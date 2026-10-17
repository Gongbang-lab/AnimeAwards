function isAwardVideo(source) {
    try {
        return /\.(mp4|webm|mov|m4v|ogv)$/i.test(new URL(String(source || ''), document.baseURI).pathname);
    } catch {
        return false;
    }
}

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
    if (window.AwardPage) {
        if (year) AwardPage.season.year = String(year);
        AwardPage.season.quarter = quarter == null ? '' : SeasonFilter.normalizeSelection(quarter);
    }
    if (year) localStorage.setItem("selected_year", year);
    if (quarter != null) localStorage.setItem("selected_quarter", SeasonFilter.normalizeSelection(quarter));
}

function clearSelectedSeason() {
    if (window.AwardPage) { AwardPage.season.year = null; AwardPage.season.quarter = ''; }
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
    if (String(year) !== AwardPage.loadedYear) {
        location.href = AwardPage.homeUrl();
        return;
    }
    history.replaceState(null, '', AwardPage.homeUrl());

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
    const saveButton = this;
    if (saveButton.disabled) return;
    saveButton.disabled = true;
    let downloadUrl;
    try {
        await document.fonts.ready;
        await Promise.all([...document.querySelectorAll('.award-card img')].map(image =>
            Promise.race([
                image.decode().catch(() => {}),
                new Promise(resolve => setTimeout(resolve, 10000))
            ])
        ));

        // 카드 치수를 변경하지 않고 현재 화면 너비로 페이지 전체를 캡처한다.
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const pageWidth = Math.max(document.documentElement.clientWidth, document.body.scrollWidth);
        const pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        // 조각을 합쳐도 최종 canvas 한도는 같으므로 전체 출력 크기를 기준으로 배율을 제한한다.
        const scale = Math.min(1.5, 16000 / pageWidth, 16000 / pageHeight,
            Math.sqrt(32000000 / (pageWidth * pageHeight)));
        const canvas = await html2canvas(document.body, {
            useCORS: true,
            allowTaint: false,
            backgroundColor: getComputedStyle(document.body).backgroundColor,
            scale,
            scrollX: 0, scrollY: 0,
            x: 0, y: 0, width: pageWidth, height: pageHeight,
            windowWidth: viewportWidth, windowHeight: viewportHeight,
            imageTimeout: 15000,
            logging: false,
            onclone: clonedDoc => {
                clonedDoc.querySelectorAll('.top-icon-btn, .floating-btn').forEach(el => el.style.visibility = 'hidden');
                clonedDoc.querySelectorAll('.aos-init, .award-card').forEach(el => {
                    el.style.setProperty('animation', 'none', 'important');
                    el.style.setProperty('transition', 'none', 'important');
                    el.style.setProperty('transform', 'none', 'important');
                    el.style.setProperty('opacity', '1', 'important');
                    el.style.setProperty('visibility', 'visible', 'important');
                });
                const title = clonedDoc.querySelector('header h1');
                if (title) {
                    title.style.webkitTextFillColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#ebdcaa';
                    title.style.backgroundImage = 'none';
                }

            }
        });
        const blob = await new Promise((resolve, reject) => canvas.toBlob(
            value => value ? resolve(value) : reject(new Error('이미지 생성에 실패했습니다.')), 'image/webp', .92));
        downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `나의_애니메이션_어워즈_${new Date().toLocaleDateString()}.${blob.type === 'image/webp' ? 'webp' : 'png'}`;
        link.href = downloadUrl;
        link.click();
    } catch (error) {
        console.error('시상식 이미지 저장 실패:', error);
        alert(`이미지를 저장하지 못했습니다: ${error.message}`);
    } finally {
        saveButton.disabled = false;
        if (downloadUrl) setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);
    }
};

// 1. 카테고리 정의 및 비율 설정
const categories = [
    { title: "시상식 오프닝", themes: ['meme'], ratio: 'ratio-16-9' },
    { title: "음악 부문", themes: ['opening', 'ending', 'ost'], ratio: 'ratio-16-9' },
    { title: "성우 부문", themes: ['rookie_voice', 'voice_male', 'voice_female'], ratio: 'ratio-11-16' },
    { title: "캐릭터 부문", themes: ['character_male', 'character_female', 'best_couple','all_gender'], ratio: 'ratio-11-16' },
    { title: "스태프 부문", themes: ['scriptwriter', 'original', 'dramatization', 'director'], ratio: 'ratio-poster' },
    { title: "아트 부문", themes: ['direction', 'background'], ratio: 'ratio-poster' },
    { title: "애니메이션 시리즈", themes: ['default','pv_mode', 'best_episode'], ratio: 'ratio-poster' },
    { title: "올해의 시리즈", themes: ['cinema', 'studio', 'series', 'top3'], ratio: 'ratio-poster' }
];

function getTop3Winner(results, rank) {
    // 개별 상 수정은 전체 TOP3 결과보다 우선한다.
    const direct = results[rank];
    if (direct && !Array.isArray(direct) && typeof direct === 'object') return direct;
    for (const key of ['TOP3_Awards', '올해의 시리즈', '올해의 애니메이션']) {
        const winner = Array.isArray(results[key])
            ? results[key].find(item => item && String(item.rank).trim() === rank) : null;
        if (winner) return winner;
    }
    return Object.values(results).flatMap(value => Array.isArray(value) ? value : [])
        .find(item => item && String(item.rank).trim() === rank);
}

function renderAwards() {
    if (!mainContainer || !top3Area) return;

    mainContainer.innerHTML = "";
    top3Area.innerHTML = "";

    const results = ResultStorage.getResults();

    // --- 1. 수상 완료된 TOP 3 데이터 추출 ---
    const top3Names = ['대상', '최우수상', '우수상'];
    // 상 목록을 편집했어도 이미 저장된 수상 결과는 포디움에 표시한다.
    const wonTop3 = top3Names.filter(rank => getTop3Winner(results, rank)).map((rank, index) => ({
        ...(Awards.find(award => award.name === rank) || { id: `top3-${index}`, theme: 'default' }),
        name: rank
    }));

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
            if ((a.theme === 'series' || a.theme === 'top3' || a.name === '올해의 시리즈') && wonTop3.length === 3) return false;
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

    let winner = ['대상', '최우수상', '우수상'].includes(award.name)
        ? getTop3Winner(results, award.name) : results[award.name];

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

    // 이전에 저장한 성우 수상 결과도 현재 데이터의 이미지 경로를 사용한다.
    if (winner && ['voice_male', 'voice_female'].includes(award.theme)) {
        const currentVoice = (window.CharacterVoiceData || []).find(voice => voice.name === winner.name);
        if (currentVoice?.cvimg) displayThumb = currentVoice.cvimg;
    }

    // 이전에 저장한 커스텀 상의 기본 트로피 경로도 새 디자인으로 표시한다.
    if (isTrophyPath(displayThumb)) displayThumb = trophy;
    const wrapper = document.createElement('div');
    wrapper.className = 'thumb-wrapper';
    const isVideo = isAwardVideo(displayThumb);
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

        const season = getSelectedSeason();
        const query = new URLSearchParams({ awardName: award.name, theme: award.theme, year: season.year, quarter: season.quarter });
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

AwardPage.onReady(() => {
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
