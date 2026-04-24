const ostNominateState = {
    step: 1,
    selectedItems: [],
    finalWinner: null,
    currentAward: null
};

let cachedVoteData = null;

const dayMap = {
    "mondays": "월요일", "tuesdays": "화요일", "wednesdays": "수요일", "thursdays": "목요일",
    "fridays": "금요일", "saturdays": "토요일", "sundays": "일요일", "anomaly": "변칙 편성", "web": "웹"
};

// AnimeList에서 day 정보를 가져오는 Map 생성
function buildAnimeInfoMap() {
    const map = {};
    if (typeof AnimeList !== 'undefined' && Array.isArray(AnimeList)) {
        AnimeList.forEach(anime => { map[String(anime.id)] = anime; });
    }
    return map;
}

// 변경된 animeOSTData 구조 반영
function getMergedOSTData() {
    if (typeof animeOSTData === 'undefined' || !Array.isArray(animeOSTData)) return {};

    const animeInfoMap = buildAnimeInfoMap();
    const result = {};

    animeOSTData.forEach((ost, index) => {
        const baseInfo = animeInfoMap[String(ost.id)];
        const quarterKey = ost.quarter || "기타";
        const day = baseInfo ? baseInfo.day : "기타";
        
        // album 객체가 없을 경우를 대비한 안전한 접근
        const albumData = ost.album || {};

        if (!result[quarterKey]) result[quarterKey] = [];

        result[quarterKey].push({
            uniqueId: `${ost.id}-ost-${index}`,
            id: ost.id,
            animeTitle: albumData.title || "제목 없음",
            thumbnail: albumData.coverImage || "../images/default.png",
            composers: albumData.composer || [],
            day: day,
            displayQuarter: quarterKey
        });
    });

    return result;
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(location.search);
    const awardName = params.get("awardName");

    ostNominateState.currentAward = awardName;
    document.getElementById("step-title-display").textContent = `${ostNominateState.currentAward}` + " 부문";

    renderOSTStep1();

    document.getElementById("ost-search").addEventListener("input", (e) => {
        renderFilteredList(e.target.value.toLowerCase());
    });

    document.getElementById("step1-next-btn").onclick = () => {
        if (ostNominateState.selectedItems.length === 0) return;
        ostNominateState.step = 2;
        toggleOSTStepUI();
        renderOSTStep2();
    };

    document.getElementById("step2-back-btn").onclick = () => {
        ostNominateState.step = 1;
        ostNominateState.finalWinner = null;
        toggleOSTStepUI();
        renderOSTStep1();
    };

    document.getElementById("step2-award-btn").onclick = () => {
        if (!ostNominateState.finalWinner) return;
        saveOSTAwardResult();
        openOSTAwardPopup();
    };

    document.getElementById("close-modal-btn").onclick = () => {
        document.getElementById("winner-popup").classList.remove("active");
    };
    waitForFirebaseAndListen();
});

function renderOSTStep1() {
    document.getElementById("left-area").innerHTML = `<div id="nominate-list-container"></div>`;
    renderFilteredList(document.getElementById("ost-search").value.toLowerCase());
}

function renderFilteredList(query) {
    const listContainer = document.getElementById("nominate-list-container");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    const mergedData = getMergedOSTData();
    const isSearching = query.length > 0;

    Object.entries(mergedData).forEach(([quarter, osts]) => {
        const filtered = osts.filter(ost =>
            ost.animeTitle.toLowerCase().includes(query)
        );

        if (filtered.length === 0) return;

        const quarterSection = document.createElement("div");
        quarterSection.className = "quarter-section";

        const quarterBtn = document.createElement("button");
        quarterBtn.className = `quarter-btn ${isSearching ? "active" : ""}`;
        quarterBtn.innerHTML = `<span>${quarter}</span><i class="fas fa-chevron-down"></i>`;

        const quarterContent = document.createElement("div");
        quarterContent.className = `quarter-content ${isSearching ? "active" : ""}`;

        quarterBtn.onclick = () => {
            quarterBtn.classList.toggle("active");
            quarterContent.classList.toggle("active");
        };

        const groupedByDay = {};
        filtered.forEach(ost => {
            if (!groupedByDay[ost.day]) groupedByDay[ost.day] = [];
            groupedByDay[ost.day].push(ost);
        });

        Object.entries(groupedByDay).forEach(([day, daySongs]) => {
            const dayBtn = document.createElement("button");
            dayBtn.className = `day-btn ${isSearching ? "active" : ""}`;
            dayBtn.innerHTML = `<span>${dayMap[day.toLowerCase()] || day}</span><i class="fas fa-plus"></i>`;

            const dayList = document.createElement("div");
            dayList.className = `day-content ${isSearching ? "active" : ""}`;

            dayBtn.onclick = () => {
                dayBtn.classList.toggle("active");
                dayList.classList.toggle("active");
            };

            daySongs.forEach(ost => {
                dayList.appendChild(createOSTCard(ost));
            });

            quarterContent.append(dayBtn, dayList);
        });

        quarterSection.append(quarterBtn, quarterContent);
        listContainer.appendChild(quarterSection);
    });
    applyVoteBadges();
}

function createOSTCard(ost) {
    const item = document.createElement("div");
    item.className = "ost-card";

    item.setAttribute('data-category', ostNominateState.currentAward);
    item.setAttribute('data-anime-id', ost.animeTitle);

    if (ostNominateState.selectedItems.some(s => s.uniqueId === ost.uniqueId)) {
        item.classList.add("selected");
    }

    // ✅ DOM 직접 생성 (innerHTML 덮어쓰기 방지)
    const rateBadge = document.createElement("div");
    rateBadge.className = "card-selection-rate";
    rateBadge.style.display = "none";
    rateBadge.textContent = "0/0";

    const thumb = document.createElement("div");
    thumb.className = "card-thumb";
    const img = document.createElement("img");
    img.src = `../${ost.thumbnail}`;
    img.alt = "thumbnail";
    img.onerror = () => { img.src = '../images/default.png'; };
    thumb.appendChild(img);

    const cardInfo = document.createElement("div");
    cardInfo.className = "card-info";

    const animeTitle = document.createElement("div");
    animeTitle.className = "anime-title";
    animeTitle.textContent = ost.animeTitle;
    cardInfo.appendChild(animeTitle);

    if (ost.composers.length > 0) {
        const composerEl = document.createElement("div");
        composerEl.className = "composer-title";
        composerEl.textContent = ost.composers.join(', ');
        cardInfo.appendChild(composerEl);
    }

    item.appendChild(rateBadge);
    item.appendChild(thumb);
    item.appendChild(cardInfo);

    item.onclick = () => {
        const idx = ostNominateState.selectedItems.findIndex(s => s.uniqueId === ost.uniqueId);
        if (idx > -1) {
            ostNominateState.selectedItems.splice(idx, 1);
            item.classList.remove("selected");
        } else {
            ostNominateState.selectedItems.push(ost);
            item.classList.add("selected");
        }
        updatePreview();
    };
    return item;
}

function updatePreview() {
    const preview = document.getElementById("preview-list");
    const nextBtn = document.getElementById("step1-next-btn");
    preview.innerHTML = "";

    ostNominateState.selectedItems.forEach(ost => {
        const div = document.createElement("div");
        div.className = "preview-item";
        div.innerHTML = `${ost.animeTitle}`;

        div.onclick = () => {
            ostNominateState.selectedItems = ostNominateState.selectedItems.filter(s => s.uniqueId !== ost.uniqueId);
            renderFilteredList(document.getElementById("ost-search").value.toLowerCase());
            updatePreview();
        };
        preview.appendChild(div);
    });

    if (nextBtn) nextBtn.disabled = ostNominateState.selectedItems.length === 0;
}

function renderOSTStep2() {
    const container = document.getElementById("left-area");
    container.innerHTML = `<h2 style="color:var(--gold); margin-bottom:20px; font-size: 1.5rem;">최종 수상작을 선택하세요</h2>`;

    const grid = document.createElement("div");
    grid.id = "step2-grid";

    ostNominateState.selectedItems.forEach(ost => {
        const card = document.createElement("div");
        card.className = "step2-ost-card";

        const displayQuarter = ost.displayQuarter ? ost.displayQuarter.replace("Q", "") : "";
        const composerText = ost.composers.length > 0 ? ost.composers.join(', ') : '';

        card.innerHTML = `
            <div class="card-badge">${displayQuarter}</div>
            <div class="card-thumb">
                <img src="../${ost.thumbnail}" alt="thumbnail" onerror="this.src='../images/default.png'">
            </div>
            <div class="step2-card-info">
                <div class="card-title">${ost.animeTitle}</div>
                ${composerText ? `<div class="composer-title">${composerText}</div>` : ''}
            </div>
        `;

        card.onclick = () => {
            document.querySelectorAll(".step2-ost-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            ostNominateState.finalWinner = ost;
            document.getElementById("step2-award-btn").disabled = false;
        };
        grid.appendChild(card);
    });
    container.appendChild(grid);
}

function toggleOSTStepUI() {
    const isStep1 = ostNominateState.step === 1;
    document.getElementById("step1-buttons").classList.toggle("hidden", !isStep1);
    document.getElementById("step2-buttons").classList.toggle("hidden", isStep1);
    document.getElementById("step1-preview").classList.toggle("hidden", !isStep1);
    document.querySelector('.search-container').style.display = isStep1 ? 'block' : 'none';
}

function saveOSTAwardResult() {
    const award = ostNominateState.currentAward;
    const winner = ostNominateState.finalWinner;
    if (!award || !winner) return;

    const stored = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    stored[award] = {
        animeTitle: winner.animeTitle,
        thumbnail: winner.thumbnail,
        composers: winner.composers,
        quarter: winner.displayQuarter
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(stored));
    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(award);
    }
}

function openOSTAwardPopup() {
    const popup = document.getElementById("winner-popup");
    const winner = ostNominateState.finalWinner;

    document.getElementById("winner-thumb").src = `../${winner.thumbnail}`;
    document.getElementById("winner-anime").textContent = winner.animeTitle;
    document.getElementById("winner-composers").textContent = winner.composers.length > 0 ? winner.composers.join(', ') : '-';
    document.getElementById("winner-quarter").textContent = winner.displayQuarter;

    popup.classList.add("active");
    fireConfetti();

    document.getElementById("go-main-btn").onclick = () => {
        location.href = "../index.html";
    };
}

function fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, zIndex: 9999, colors: ['#d4af37', '#ffffff'] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, zIndex: 9999, colors: ['#d4af37', '#ffffff'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

// ──────────────────────────────────────────────────────────
// Firebase 실시간 득표율 뱃지
// ──────────────────────────────────────────────────────────
function applyVoteBadges() {
    if (!cachedVoteData) return;

    const total = cachedVoteData._participants || 0;

    // ✅ ost-card 클래스 타겟팅
    document.querySelectorAll('.ost-card').forEach(card => {
        const animeId = card.getAttribute('data-anime-id');
        const rateBadge = card.querySelector('.card-selection-rate');
        if (!rateBadge || !animeId) return;

        const count = cachedVoteData[animeId] || 0;
        rateBadge.innerText = `${count}/${total}`;
        rateBadge.style.display = "block";
    });
}

function listenToVoteRates() {
    if (!window.fbOnValue || !window.fbDB) return;

    const categoryRef = window.fbRef(window.fbDB, `votes/categories/${ostNominateState.currentAward}`);

    window.fbOnValue(categoryRef, (snapshot) => {
        cachedVoteData = snapshot.val() || {};
        applyVoteBadges();
    });
}

function waitForFirebaseAndListen() {
    if (window.fbOnValue && window.fbDB) {
        listenToVoteRates();
    } else {
        setTimeout(waitForFirebaseAndListen, 300);
    }
}