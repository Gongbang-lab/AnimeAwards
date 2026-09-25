const scriptwriterState = {
    step: 1,
    selectedItems: [],
    step1Selected: [],
    awardName: "베스트 각본상"
};

let cachedVoteData = null;

function getScriptwriterData() {
    if (typeof scriptwriterData !== "undefined") return scriptwriterData;
    if (typeof scriptwriterData_2026 !== "undefined") return scriptwriterData_2026;
    return [];
}

function getSeasonFilteredScriptwriterData() {
    const data = getScriptwriterData();
    return typeof SeasonFilter !== "undefined"
        ? SeasonFilter.filterAnimeList(data)
        : data;
}

function getDisplayAwardName() {
    return typeof SeasonFilter !== "undefined"
        ? SeasonFilter.toDisplayAwardName(scriptwriterState.awardName)
        : scriptwriterState.awardName;
}

function getWriterNames(item) {
    return Array.isArray(item?.scriptwriter) ? item.scriptwriter : [];
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const urlAwardName = params.get("awardName");
    if (urlAwardName) scriptwriterState.awardName = urlAwardName;

    const titleEl = document.getElementById("step-title-display");
    if (titleEl) titleEl.textContent = `${getDisplayAwardName()} 부문`;

    document.getElementById("search-input")?.addEventListener("input", (event) => {
        renderCards(event.target.value);
    });

    document.getElementById("next-btn")?.addEventListener("click", proceedToStep2);
    document.getElementById("final-btn")?.addEventListener("click", confirmFinalWinner);
    document.getElementById("nav-btn")?.addEventListener("click", handleNavButton);
    document.getElementById("go-main-btn")?.addEventListener("click", goToMain);

    renderCards();
    updatePreview();
    NominateCommon.waitForFirebaseAndListen(() => scriptwriterState.awardName);
});

function renderCards(searchTerm = "") {
    const grid = document.getElementById("card-grid");
    if (!grid) return;

    const term = searchTerm.toLowerCase().trim();
    const source = scriptwriterState.step === 1
        ? getSeasonFilteredScriptwriterData()
        : scriptwriterState.step1Selected;

    const dataList = term
        ? source.filter(anime => {
            const titleMatch = String(anime.title || "").toLowerCase().includes(term);
            const writerMatch = getWriterNames(anime).some(writer =>
                String(writer).toLowerCase().includes(term)
            );
            return titleMatch || writerMatch;
        })
        : source;

    grid.innerHTML = "";

    if (dataList.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:50px;color:#666;">
                <p style="font-size:1.2rem;">검색 결과가 없습니다.</p>
            </div>`;
        return;
    }

    dataList.forEach(anime => grid.appendChild(createCard(anime)));
    NominateCommon.applyVoteBadges();
}

function createCard(anime) {
    const card = document.createElement("div");
    const selected = scriptwriterState.selectedItems.some(item => item.id === anime.id);

    card.className = scriptwriterState.step === 2
        ? "step2-original-card"
        : "card";

    if (selected) card.classList.add("selected");

    card.setAttribute("data-category", scriptwriterState.awardName);
    card.setAttribute("data-anime-id", anime.title);

    if (scriptwriterState.step === 2) {
        card.innerHTML = `
            <div class="card-selection-rate" style="display:none;">0%</div>
            <div class="card-badge">${anime.quarter || "-"}</div>
            <div class="card-thumb">
                <img src="../${anime.thumbnail}" alt="${anime.title}" onerror="this.src='../image/placeholder.webp'">
            </div>
            <div class="step2-card-info">
                <div class="card-title">${anime.title}</div>
                <div class="card-studio">${getWriterNames(anime).join(", ")}</div>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="card-selection-rate" style="display:none;">0%</div>
            <div class="card-badge">${anime.quarter || "-"}</div>
            <img src="../${anime.thumbnail}" alt="${anime.title}" loading="lazy" onerror="this.src='../image/placeholder.webp'">
            <div class="card-info">
                <div class="card-title">${anime.title}</div>
                <div class="card-writer">각본: ${getWriterNames(anime).join(", ") || "정보 없음"}</div>
            </div>
        `;
    }

    card.addEventListener("click", () => toggleSelect(anime, card));
    return card;
}

function toggleSelect(anime, card) {
    if (scriptwriterState.step === 2) {
        scriptwriterState.selectedItems = [anime];
        document.querySelectorAll(".step2-original-card").forEach(el => el.classList.remove("selected"));
        card.classList.add("selected");
        updatePreview();
        return;
    }

    const index = scriptwriterState.selectedItems.findIndex(item => item.id === anime.id);
    if (index >= 0) {
        scriptwriterState.selectedItems.splice(index, 1);
        card.classList.remove("selected");
    } else {
        scriptwriterState.selectedItems.push(anime);
        card.classList.add("selected");
    }

    updatePreview();
}

function updatePreview() {
    const previewList = document.getElementById("preview-list");
    if (!previewList) return;

    if (scriptwriterState.selectedItems.length === 0) {
        previewList.innerHTML = `<span style="font-size:0.85rem;color:#555;"></span>`;
        return;
    }

    previewList.innerHTML = "";
    scriptwriterState.selectedItems.forEach(item => {
        const div = document.createElement("div");
        div.className = "preview-item";
        div.innerHTML = `${item.title}<br><small style="color:#888;font-size:0.75rem;">${getWriterNames(item).join(", ")}</small>`;

        div.addEventListener("click", () => {
            if (scriptwriterState.step !== 1) return;
            const index = scriptwriterState.selectedItems.findIndex(i => i.id === item.id);
            if (index >= 0) scriptwriterState.selectedItems.splice(index, 1);
            renderCards(document.getElementById("search-input")?.value || "");
            updatePreview();
        });

        previewList.appendChild(div);
    });
}

function proceedToStep2() {
    if (scriptwriterState.selectedItems.length < 2) {
        alert("최소 2개 이상의 작품을 선택해주세요!");
        return;
    }

    scriptwriterState.step1Selected = [...scriptwriterState.selectedItems];
    scriptwriterState.selectedItems = [];
    scriptwriterState.step = 2;

    document.getElementById("step-title-display").textContent = `${getDisplayAwardName()} 부문`;
    document.getElementById("next-btn")?.classList.add("hidden");
    document.getElementById("final-btn")?.classList.remove("hidden");
    document.querySelector(".status-indicator")?.classList.add("hidden");

    const navBtn = document.getElementById("nav-btn");
    if (navBtn) navBtn.textContent = "이전 단계";

    renderCards();
    updatePreview();
}

function backToStep1() {
    scriptwriterState.step = 1;
    scriptwriterState.selectedItems = [...scriptwriterState.step1Selected];

    document.getElementById("next-btn")?.classList.remove("hidden");
    document.getElementById("final-btn")?.classList.add("hidden");
    document.querySelector(".status-indicator")?.classList.remove("hidden");

    const navBtn = document.getElementById("nav-btn");
    if (navBtn) navBtn.textContent = "메인으로";

    renderCards();
    updatePreview();
}

function handleNavButton() {
    if (scriptwriterState.step === 2) backToStep1();
    else goToMain();
}

function confirmFinalWinner() {
    if (scriptwriterState.selectedItems.length !== 1) {
        alert("최종 수상작을 하나 선택해주세요!");
        return;
    }

    const winner = scriptwriterState.selectedItems[0];
    const writerName = getWriterNames(winner).join(", ") || "정보 없음";

    document.getElementById("modal-quarter").textContent = winner.quarter || "-";
    document.getElementById("modal-img").src = `../${winner.thumbnail}`;
    document.getElementById("modal-title").textContent = winner.title || "-";
    document.getElementById("modal-studio").textContent = Array.isArray(winner.studio)
        ? winner.studio.join(", ")
        : (winner.studio || "-");
    document.getElementById("modal-writer").textContent = writerName;
    document.getElementById("modal-award-name").textContent = getDisplayAwardName();
    document.getElementById("winner-modal").classList.remove("hidden");

    const savedWinner = {
        id: winner.id,
        title: winner.title,
        thumbnail: winner.thumbnail,
        year: winner.year,
        quarter: winner.quarter,
        scriptwriter: winner.scriptwriter,
        studio: winner.studio
    };

    try {
        ResultStorage.saveOne(scriptwriterState.awardName, savedWinner);
        console.log("[scriptwriterNominate] 수상 결과 저장 완료:",
            ResultStorage.getSeasonKey(), scriptwriterState.awardName, savedWinner);
    } catch (error) {
        console.error("[scriptwriterNominate] 수상 결과 저장 실패:", error);
    }

    NominateCommon.fireConfetti();

    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(scriptwriterState.awardName);
    } else {
        console.error("submitSingleAwardToDB 없음 - firebase_service.js 로드 확인 필요");
    }
}

function goToMain() {
    location.href = "../index.html";
}
