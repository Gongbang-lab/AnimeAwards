// ──────────────────────────────────────────────────────────
// 1. 초기 설정 및 데이터 가공
// ──────────────────────────────────────────────────────────
const nominateState = {
    step: 1,
    selectedItems: [],
    selectedWinner: null,
    awardName: "",
    theme: ""
};

// URL 파라미터 처리
const params = new URLSearchParams(location.search);
nominateState.awardName = params.get("awardName");
nominateState.theme = params.get("theme") || "";
const modalAwardName = document.getElementById('modal-award-name');
if(modalAwardName) modalAwardName.textContent = nominateState.awardName;
const stepTitle = document.getElementById("step-title");
stepTitle.textContent = `${SeasonFilter.toDisplayAwardName(nominateState.awardName)} 부문`;



// 요일 매핑 (데이터의 day는 영어 그대로 유지됨)
const DAY_LABELS = {
    "Mondays": "월요일", "Tuesdays": "화요일", "Wednesdays": "수요일", "Thursdays": "목요일",
    "Fridays": "금요일", "Saturdays": "토요일", "Sundays": "일요일",
    "Anomaly": "변칙 편성", "Web": "웹", "Unknown": "기타", "Cinema": "극장판"
};
const DAY_KEYS = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays", "Anomaly", "Web", "Cinema", "Unknown"];

// 분기 정렬 순서 (데이터의 quarter가 이미 "1분기" 한글임)
const QUARTER_ORDER = ["1분기", "2분기", "3분기", "4분기", "변칙 편성", "기타"];

// ✅ 수정: AnimeList_2026 하드코딩 → resolveYear.js가 만든 별칭 AnimeList 사용
const SeasonFilteredList = SeasonFilter.filterAnimeList(AnimeList);

const AnimeByQuarter = SeasonFilteredList.reduce((acc, anime) => {
    const q = anime.quarter || "기타";
    if (!acc[q]) acc[q] = [];
    acc[q].push(anime);
    return acc;
}, {});

// ──────────────────────────────────────────────────────────
// 2. Step 1 렌더링 (아코디언 + 그리드)
// ──────────────────────────────────────────────────────────
// 분기별 요일 선택과 펼침 상태를 검색/후보 수정 후에도 유지한다.
const daySelections = new Map();
const expandedQuarters = new Set();

function renderStep1(filterText = "") {
    const leftArea = document.getElementById("left-area");
    if (!leftArea) return;
    leftArea.replaceChildren();
    const query = filterText.trim().toLowerCase();
    const showQuarterAccordion = SeasonFilter.showQuarterAccordion();
    let resultCount = 0;

    QUARTER_ORDER.forEach((qKey, quarterIndex) => {
        const targetList = (AnimeByQuarter[qKey] || []).filter(a => a.title.toLowerCase().includes(query));
        if (!targetList.length) return;
        resultCount += targetList.length;
        const section = document.createElement("section");
        section.className = "quarter-section";
        const content = document.createElement("div");
        content.className = "quarter-content";
        content.id = `quarter-panel-${quarterIndex}`;
        if (showQuarterAccordion) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "quarter-btn";
            button.innerHTML = `<span>${qKey} <small>${targetList.length}작품</small></span><span class="quarter-arrow" aria-hidden="true">⌄</span>`;
            button.setAttribute("aria-controls", content.id);
            const setExpanded = expanded => {
                content.hidden = !expanded;
                content.classList.toggle("active", expanded);
                button.classList.toggle("active", expanded);
                button.setAttribute("aria-expanded", String(expanded));
            };
            setExpanded(Boolean(query) || expandedQuarters.has(qKey));
            button.onclick = () => {
                const expanded = content.hidden;
                if (expanded) expandedQuarters.add(qKey);
                else expandedQuarters.delete(qKey);
                setExpanded(expanded);
            };
            section.appendChild(button);
        } else content.classList.add("active");

        const buttons = document.createElement("div");
        buttons.className = "day-filters";
        buttons.setAttribute("role", "group");
        buttons.setAttribute("aria-label", `${qKey} 요일 선택`);
        const grid = document.createElement("div");
        grid.className = "day-content";
        grid.id = `day-grid-${quarterIndex}`;
        const days = DAY_KEYS.filter(day => targetList.some(a => a.day === day));
        // 검색 결과가 있는 요일 중 첫 요일부터 표시한다.
        let activeDay = query ? days[0] : daySelections.get(qKey);
        if (!days.includes(activeDay)) activeDay = days[0];
        const renderDay = day => {
            buttons.querySelectorAll("button").forEach(button => {
                const active = button.dataset.day === day;
                button.classList.toggle("active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            grid.replaceChildren(...targetList.filter(a => a.day === day).map(createCard));
            window.NominateCommon.applyVoteBadges();
        };
        days.forEach(day => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "day-filter-btn";
            button.dataset.day = day;
            button.setAttribute("aria-controls", grid.id);
            const count = targetList.filter(a => a.day === day).length;
            button.textContent = `${DAY_LABELS[day]} ${count}`;
            button.onclick = () => {
                daySelections.set(qKey, day);
                renderDay(day);
            };
            buttons.appendChild(button);
        });
        content.append(buttons, grid);
        section.appendChild(content);
        leftArea.appendChild(section);
        renderDay(activeDay);
    });
    if (!resultCount) {
        const empty = document.createElement("p");
        empty.className = "candidate-empty";
        empty.textContent = "검색 결과가 없습니다.";
        leftArea.appendChild(empty);
    }
}

// 카드 생성 함수
function createCard(anime) {
    const card = document.createElement("div");
    card.dataset.selectionId = String(anime.id);
    
    const isSelected = nominateState.step === 1 
        ? nominateState.selectedItems.some(a => a.id === anime.id)
        : (nominateState.selectedWinner && nominateState.selectedWinner.id === anime.id);

    card.className = `card ${isSelected ? 'selected' : ''}`;

    card.setAttribute('data-category', nominateState.awardName);
    card.setAttribute('data-anime-id', anime.title);

    const imgPath = `../${anime.thumbnail}`;
    const badgeMarkup = isPVNomination()
        ? '<button type="button" class="card-badge pv-card-badge">PV 보기</button>'
        : `<div class="card-badge">${anime.quarter}</div>`;

    card.innerHTML = `
        <div class="card-selection-rate" style="display:none;">0/0</div>
        ${badgeMarkup}
        <img src="${imgPath}" onerror="this.onerror=null;this.src='../image/no-image.svg'" loading="lazy">
        <div class="card-info">
            <div class="card-title">${anime.title}</div>
        </div>
    `;

    const detail = document.createElement("div");
    if (isOSTNomination()) {
        detail.className = "composer-title";
        detail.textContent = getComposerNames(anime).join(", ");
    } else {
        detail.className = "card-studio";
        detail.textContent = Array.isArray(anime.studio)
            ? anime.studio.join(", ")
            : (anime.studio || "");
    }
    card.querySelector(".card-info").appendChild(detail);

    if (isPVNomination()) {
        card.querySelector(".pv-card-badge").addEventListener("click", event => {
            event.stopPropagation();
            openPVModal(anime);
        });
    }

    card.onclick = () => handleCardClick(anime, card);
    return card;
}

function getYouTubeVideoId(rawUrl) {
    try {
        const url = new URL(rawUrl);
        if (!['https:', 'http:'].includes(url.protocol)) return "";
        const host = url.hostname.replace(/^www\./, "").toLowerCase();
        if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || "";
        if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "music.youtube.com") return "";
        if (url.pathname === "/watch") return url.searchParams.get("v") || "";
        const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/);
        return match?.[1] || "";
    } catch {
        return "";
    }
}

let pvReturnFocus = null;
let pvPreviousOverflow = "";

function closePVModal() {
    const modal = document.getElementById("pv-modal");
    if (modal.classList.contains("hidden")) return;
    document.getElementById("pv-player").removeAttribute("src");
    modal.classList.add("hidden");
    document.body.style.overflow = pvPreviousOverflow;
    if (pvReturnFocus?.isConnected) pvReturnFocus.focus();
}

function openPVModal(anime) {
    const modal = document.getElementById("pv-modal");
    const buttons = document.getElementById("pv-track-buttons");
    const player = document.getElementById("pv-player");
    const empty = document.getElementById("pv-player-empty");
    const link = document.getElementById("pv-external-link");
    const tracks = (Array.isArray(anime.pv) ? anime.pv : [])
        .map((pv, index) => ({ title: String(pv?.title || "").trim() || `PV ${index + 1}`, url: String(pv?.url || "").trim() }))
        .filter(item => {
            try { return ['https:', 'http:'].includes(new URL(item.url).protocol); }
            catch { return false; }
        });
    if (modal.classList.contains("hidden")) {
        pvReturnFocus = document.activeElement;
        pvPreviousOverflow = document.body.style.overflow;
    }
    document.getElementById("pv-modal-title").textContent = `${anime.title} PV`;
    buttons.replaceChildren();
    player.removeAttribute("src");
    player.hidden = true;
    empty.hidden = false;
    empty.textContent = "등록된 PV가 없습니다.";
    link.hidden = true;
    let selectedIndex = -1;
    const selectTrack = index => {
        if (selectedIndex === index) return;
        selectedIndex = index;
        const track = tracks[index];
        buttons.querySelectorAll("button").forEach((button, i) => {
            button.classList.toggle("active", i === index);
            button.setAttribute("aria-pressed", String(i === index));
        });
        const videoId = getYouTubeVideoId(track.url);
        const playable = /^[A-Za-z0-9_-]{11}$/.test(videoId);
        player.removeAttribute("src");
        player.hidden = !playable;
        player.title = `${anime.title} — ${track.title}`;
        empty.hidden = playable;
        if (playable) {
            player.src = `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`;
        } else {
            empty.textContent = "이 링크는 모달에서 재생할 수 없습니다. 원본 링크에서 확인해주세요.";
        }
        link.href = track.url;
        link.textContent = playable ? "유튜브에서 보기" : "원본 링크에서 보기";
        link.hidden = false;
    };
    tracks.forEach((track, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "pv-track-button";
        button.textContent = track.title;
        button.setAttribute("aria-controls", "pv-player");
        button.onclick = () => selectTrack(index);
        buttons.appendChild(button);
    });
    if (tracks.length) selectTrack(0);
    document.body.style.overflow = "hidden";
    modal.classList.remove("hidden");
    modal.querySelector(".pv-modal-content").scrollTop = 0;
    document.getElementById("pv-modal-close").focus();
}

function isPVNomination() {
    return nominateState.theme === "pv_mode";
}

// 카드 클릭 핸들러
function handleCardClick(anime, cardElement) {
    if (nominateState.step === 1) {
        const idx = nominateState.selectedItems.findIndex(a => a.id === anime.id);
        if (idx > -1) {
            nominateState.selectedItems.splice(idx, 1);
            cardElement.classList.remove('selected');
        } else {
            nominateState.selectedItems.push(anime);
            cardElement.classList.add('selected');
        }
        updatePreview();
    } else {
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        cardElement.classList.add('selected');
        nominateState.selectedWinner = anime;
        
        const awardBtn = document.getElementById("step2-award-btn");
        if(awardBtn) awardBtn.disabled = false;
    }
}

// ──────────────────────────────────────────────────────────
// 3. UI 업데이트 및 프리뷰
// ──────────────────────────────────────────────────────────
function updatePreview() {
    if (nominateState.step === 1) NominateCommon.syncCandidateSelection(nominateState.selectedItems);
    const previewBox = document.getElementById("preview-box");
    const nextBtn = document.getElementById("step1-next-btn");
    
    if(!previewBox) return;
    previewBox.innerHTML = "";
    
    if (nominateState.selectedItems.length === 0) {
        previewBox.innerHTML = `<div class="ui-empty">후보를 선택해주세요</div>`;
        if(nextBtn) nextBtn.disabled = true;
        return;
    }

    nominateState.selectedItems.forEach(anime => {
        const div = document.createElement("div");
        const removeButton = NominateCommon.setupPreviewItem(div, anime.title);

        removeButton.onclick = () => {
            if (nominateState.step === 1) {
                nominateState.selectedItems = nominateState.selectedItems.filter(a => a.id !== anime.id);
                updatePreview();
                
                const searchVal = document.getElementById('search-input')?.value || "";
                renderStep1(searchVal);
            }
        };
        previewBox.appendChild(div);
    });

    if(nextBtn) nextBtn.disabled = nominateState.selectedItems.length === 0;
}

// ──────────────────────────────────────────────────────────
// 4. Step 전환 및 검색
// ──────────────────────────────────────────────────────────
function goStep2() {
    nominateState.step = 2;
    
    toggleElement("nav-home-btn", false);
    toggleElement("step1-next-btn", false);
    toggleElement("step2-back-btn", true);
    toggleElement("step2-award-btn", true);
    
    // ✅ 삭제: 존재 여부 불확실한 "search-container-wrapper" 대상 죽은 코드 제거
    //         (바로 아래 querySelector('.search-container')로 실제 처리됨)
    const searchArea = document.querySelector('.search-container');
    const previewArea = document.getElementById("preview-box");
    
    if(searchArea) searchArea.classList.add("hidden");
    if(previewArea) previewArea.classList.add("hidden");

    const leftArea = document.getElementById("left-area");
    leftArea.innerHTML = "";
    
    const h2 = NominateCommon.createStepHeading();
    leftArea.appendChild(h2);

    const gridDiv = document.createElement("div");
    gridDiv.id = "step2-grid";
    
    nominateState.selectedItems.forEach(anime => {
        gridDiv.appendChild(createCard(anime));
    });
    leftArea.appendChild(gridDiv);
    window.NominateCommon.applyVoteBadges();
}

function goStep1() {
    nominateState.step = 1;
    nominateState.selectedWinner = null;

    toggleElement("nav-home-btn", true);
    toggleElement("step1-next-btn", true);
    toggleElement("step2-back-btn", false);
    toggleElement("step2-award-btn", false);
    
    const searchArea = document.querySelector('.search-container');
    const previewArea = document.getElementById("preview-box");
    
    if(searchArea) searchArea.classList.remove("hidden");
    if(previewArea) previewArea.classList.remove("hidden");

    const awardBtn = document.getElementById("step2-award-btn");
    if(awardBtn) awardBtn.disabled = true;

    const searchInput = document.getElementById('search-input');
    if(searchInput) searchInput.value = ""; 
    renderStep1();
}

function toggleElement(id, show) {
    const el = document.getElementById(id);
    if(el) {
        if(show) el.classList.remove("hidden");
        else el.classList.add("hidden");
    }
}

// 검색 기능
const searchInput = document.getElementById('search-input');
const autocompleteList = document.getElementById('autocomplete-list');

if(searchInput) {
    searchInput.oninput = function() {
        const val = this.value;
        renderStep1(val);
        
        if(autocompleteList) {
            autocompleteList.innerHTML = '';
            if (!val) return;
            
            // ✅ 수정: AnimeList_2026 → AnimeList
            AnimeList.filter(a => a.title.toLowerCase().includes(val.toLowerCase())).slice(0, 5).forEach(match => {
                const div = document.createElement("div");
                div.textContent = match.title;
                div.onclick = () => {
                    searchInput.value = match.title;
                    autocompleteList.innerHTML = '';
                    renderStep1(match.title);
                };
                autocompleteList.appendChild(div);
            });
        }
    };
}

// ──────────────────────────────────────────────────────────
// 5. 수상 결정 및 저장
// ──────────────────────────────────────────────────────────
function openAwardPopup() {
    const winner = nominateState.selectedWinner;
    if (!winner) return;

    const modalImg = document.getElementById("modal-img");
    if(modalImg) modalImg.src = `../${winner.thumbnail}`;
    
    const modalTitle = document.getElementById("modal-title");
    if(modalTitle) modalTitle.textContent = winner.title;
    
    setText("modal-quarter", winner.quarter);
    
    const directorRow = document.getElementById("modal-director-row");
    const studioRow = document.getElementById("modal-studio-row");
    const awardRow = document.getElementById("modal-award-row");
    const studioLabel = document.getElementById("modal-studio-label");

    if (isOSTNomination()) {
        if (directorRow) directorRow.classList.add("hidden");
        if (awardRow) awardRow.classList.add("hidden");
        if (studioLabel) studioLabel.textContent = "Composer:";
        setText("modal-studio", getComposerNames(winner).join(", ") || "정보 없음");
    } else {
        if (directorRow) directorRow.classList.remove("hidden");
        if (studioRow) studioRow.classList.remove("hidden");
        if (awardRow) awardRow.classList.remove("hidden");
        if (studioLabel) studioLabel.textContent = "Studio:";
        const directorText = (winner.staff && winner.staff.director)
            ? winner.staff.director.join(", ")
            : "정보 없음";
        setText("modal-director", directorText);
        setText("modal-studio", Array.isArray(winner.studio)
            ? winner.studio.join(", ")
            : (winner.studio || "-"));
    }
    
    const modal = document.getElementById("winner-modal");
    if(modal) modal.classList.remove("hidden");
    
    window.NominateCommon.fireConfetti();
    saveAwardResult(winner);
}

function setText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}

function isOSTNomination() {
    return nominateState.theme === "ost" || nominateState.awardName === "올해의 OST";
}

function getComposerNames(anime) {
    // 구형 OST 직접 링크에서도 제거된 anime.staff.composer 대신 곡 데이터를 사용한다.
    return [...new Set((window.AnimeSongs || [])
        .filter(record => String(record.id) === String(anime.id) && String(record.year) === String(anime.year))
        .flatMap(record => record.songs || [])
        .filter(song => String(song.type).toLowerCase() === 'ost')
        .flatMap(song => Array.isArray(song.composer) ? song.composer : [song.composer])
        .filter(Boolean))];
}

function saveAwardResult(winner) {
    const currentResults = ResultStorage.getResults();
    const awardName = nominateState.awardName; 

    const top3Ranks = ["대상", "최우수상", "우수상"];
    const isTop3 = top3Ranks.includes(awardName);
    const finalThumb = winner.thumbnail;

    if (isTop3) {
        const top3Key = Array.isArray(currentResults.TOP3_Awards)
            ? "TOP3_Awards" : "올해의 애니메이션";
        let top3List = currentResults[top3Key];

        if (Array.isArray(top3List)) {
            const targetIndex = top3List.findIndex(item => item.rank === awardName);
            if (targetIndex !== -1) {
                top3List[targetIndex].title = winner.title;
                top3List[targetIndex].thumbnail = finalThumb;
            } else {
                top3List.push({ rank: awardName, title: winner.title, thumbnail: finalThumb });
            }
        } else {
            currentResults[top3Key] = [{ rank: awardName, title: winner.title, thumbnail: finalThumb }];
        }
        // 이전 저장 형식이 함께 남아 있어도 같은 등급의 표시가 엇갈리지 않도록 갱신한다.
        for (const key of ["TOP3_Awards", "올해의 애니메이션"]) {
            if (!Array.isArray(currentResults[key])) continue;
            currentResults[key] = currentResults[key].map(item => item.rank === awardName
                ? { ...item, title: winner.title, thumbnail: finalThumb } : item);
        }
        delete currentResults[awardName];
    } else if (isOSTNomination()) {
        currentResults[awardName] = {
            title: winner.title,
            thumbnail: finalThumb,
            composer: getComposerNames(winner)
        };
    } else {
        currentResults[awardName] = { title: winner.title, thumbnail: finalThumb };
    }

    ResultStorage.saveResults(currentResults);
    console.log("Saved:", awardName, winner.title);

    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(nominateState.awardName);
    }
}

// ──────────────────────────────────────────────────────────
// 6. 이벤트 바인딩 및 초기화
// ──────────────────────────────────────────────────────────
const btnNext = document.getElementById("step1-next-btn");
if(btnNext) btnNext.onclick = goStep2;

const btnBack = document.getElementById("step2-back-btn");
if(btnBack) btnBack.onclick = goStep1;

const btnAward = document.getElementById("step2-award-btn");
if(btnAward) btnAward.onclick = openAwardPopup;

const btnHome = document.getElementById("nav-home-btn");
if(btnHome) btnHome.onclick = () => location.href = AwardPage.homeUrl();

const btnGoMain = document.getElementById("go-main-btn");
if(btnGoMain) btnGoMain.onclick = () => location.href = AwardPage.homeUrl();

const pvModal = document.getElementById("pv-modal");
const pvModalClose = document.getElementById("pv-modal-close");
if (pvModalClose) pvModalClose.onclick = closePVModal;
if (pvModal) pvModal.addEventListener("click", event => {
    if (event.target === pvModal) closePVModal();
});

document.addEventListener("keydown", event => {
    if (!pvModal || pvModal.classList.contains("hidden")) return;
    if (event.key === "Escape") closePVModal();
    if (event.key === "Tab") {
        const focusable = [...pvModal.querySelectorAll('button, a[href], iframe')].filter(el => !el.hidden && !el.disabled);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
});

// ──────────────────────────────────────────────────────────
// ✅ 수정: renderStep1() 중복 호출 제거 (기존엔 이 지점과 파일 상단 "초기 실행" 두 군데서 호출됨)
window.NominateCommon.waitForFirebaseAndListen(
    () => nominateState.awardName
);
renderStep1();
