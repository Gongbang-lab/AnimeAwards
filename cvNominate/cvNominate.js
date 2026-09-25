/**
 * AnimeAwards - CV Nomination
 * 2-4 schema rebuild
 *
 * CVData:
 * {
 *   id,
 *   name,
 *   cvimg,
 *   gender
 * }
 *
 * 담당 캐릭터/작품은 CharacterData.characters[].cvId를 역조회해서
 * 실행 시점(runtime)에 복원한다.
 *
 * 저장하지 않는 중복 데이터:
 * - characterIds
 * - animeTitle
 * - character image
 * - year / quarter
 */

const cvState = {
    step: 1,
    theme: new URLSearchParams(location.search).get("theme") || "character_male",
    awardName: new URLSearchParams(location.search).get("awardName") || "올해의 성우상",
    selectedCVs: [],
    finalWinner: null
};

const DATA = {
    anime: [],
    cv: [],
    charactersByCvId: new Map(),
    animeMap: new Map()
};

/* ---------------------------------------------------------
 * Generic helpers
 * --------------------------------------------------------- */

function normalizeId(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeGender(value) {
    const gender = String(value ?? "").trim().toLowerCase();
    if (gender === "male" || gender === "female") return gender;
    return "";
}

function normalizeName(value) {
    return String(value ?? "").trim();
}

function getGlobalArray(name) {
    try {
        if (typeof window !== "undefined" && Array.isArray(window[name])) {
            return window[name];
        }
    } catch (_) {}

    try {
        if (typeof globalThis !== "undefined" && Array.isArray(globalThis[name])) {
            return globalThis[name];
        }
    } catch (_) {}

    try {
        const value = eval(name);
        return Array.isArray(value) ? value : [];
    } catch (_) {
        return [];
    }
}

function valuesAsArray(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return Object.values(value);
    return [];
}

/* ---------------------------------------------------------
 * Source data
 * --------------------------------------------------------- */

function loadAnimeData() {
    return valuesAsArray(getGlobalArray("AnimeList_2026"));
}

function loadCharacterData() {
    return valuesAsArray(getGlobalArray("CharacterData_2026"));
}

function loadCVData() {
    return valuesAsArray(getGlobalArray("CharacterVoiceData_2026"));
}

/* ---------------------------------------------------------
 * Build indexes
 * --------------------------------------------------------- */

function rebuildIndexes() {
    DATA.anime = loadAnimeData();
    DATA.cv = loadCVData();
    DATA.charactersByCvId = new Map();
    DATA.animeMap = new Map();

    DATA.anime.forEach(anime => {
        const animeId = normalizeId(anime?.id);

        if (animeId !== null) {
            DATA.animeMap.set(animeId, anime);
        }
    });

    const characterEntries = loadCharacterData();

    characterEntries.forEach((animeEntry, entryIndex) => {
        const animeId = normalizeId(animeEntry?.id);

        if (animeId === null) return;

        const characters = Array.isArray(animeEntry?.characters)
            ? animeEntry.characters
            : [];

        characters.forEach((character, characterIndex) => {
            const characterId = normalizeId(character?.characterId);
            const cvId = normalizeId(character?.cvId);

            if (characterId === null || cvId === null) return;

            const role = {
                animeId,
                characterId,
                charName: normalizeName(character?.name) || "이름 없음",
                img: normalizeName(character?.img),
                cvName: normalizeName(character?.cv),
                entryIndex,
                characterIndex
            };

            if (!DATA.charactersByCvId.has(cvId)) {
                DATA.charactersByCvId.set(cvId, []);
            }

            DATA.charactersByCvId.get(cvId).push(role);
        });
    });

    console.info("[cvNominate] INDEX READY", {
        animeCount: DATA.anime.length,
        cvCount: DATA.cv.length,
        characterEntryCount: characterEntries.length,
        characterCount: [...DATA.charactersByCvId.values()]
            .reduce((sum, list) => sum + list.length, 0),
        cvIdIndexCount: DATA.charactersByCvId.size
    });
}

/* ---------------------------------------------------------
 * Runtime CV -> Character -> Anime relation
 * --------------------------------------------------------- */

function resolveCVCharacters(cv) {
    const cvId = normalizeId(cv?.id);

    if (cvId === null) return [];

    const roles = DATA.charactersByCvId.get(cvId) || [];
    const seen = new Set();
    const resolved = [];

    roles.forEach(role => {
        const anime = DATA.animeMap.get(role.animeId);

        if (!anime) return;

        // 같은 작품 + 같은 Character ID가 중복 저장된 경우만 제거.
        // 같은 characterId가 서로 다른 animeId에서 반복되는 것은 정상으로 유지한다.
        const pairKey = `${role.animeId}:${role.characterId}`;

        if (seen.has(pairKey)) return;

        seen.add(pairKey);

        resolved.push({
            characterId: role.characterId,
            animeId: role.animeId,
            charName: role.charName,
            img: role.img,
            cvName: role.cvName,
            animeTitle: normalizeName(anime?.title) || "작품명 없음",
            year: anime?.year,
            quarter: anime?.quarter
        });
    });

    resolved.sort((a, b) => {
        const aTitle = a.animeTitle;
        const bTitle = b.animeTitle;

        return aTitle.localeCompare(bTitle, "ko");
    });

    return resolved;
}

function isInSelectedSeason(anime) {
    if (!anime) return false;

    if (
        typeof SeasonFilter !== "undefined" &&
        SeasonFilter &&
        typeof SeasonFilter.isInSeason === "function"
    ) {
        try {
            return !!SeasonFilter.isInSeason(anime);
        } catch (error) {
            console.warn(
                "[cvNominate] SeasonFilter.isInSeason 오류",
                error,
                anime
            );
        }
    }

    // SeasonFilter를 사용할 수 없는 경우의 안전한 fallback.
    const selected = getSelectedSeason();

    if (!selected) return false;

    return (
        Number(anime.year) === Number(selected.year) &&
        String(anime.quarter ?? "") === String(selected.quarter ?? "")
    );
}

function getSelectedSeason() {
    if (
        typeof SeasonFilter !== "undefined" &&
        SeasonFilter &&
        SeasonFilter.selectedSeason
    ) {
        return SeasonFilter.selectedSeason;
    }

    if (
        typeof window !== "undefined" &&
        window.SeasonFilter &&
        window.SeasonFilter.selectedSeason
    ) {
        return window.SeasonFilter.selectedSeason;
    }

    return null;
}

/* ---------------------------------------------------------
 * Candidate list
 * --------------------------------------------------------- */

function getSeasonFilteredCVList(genderKey) {
    const list = [];

    DATA.cv.forEach(rawCV => {
        const cvId = normalizeId(rawCV?.id);
        const name = normalizeName(rawCV?.name);
        const gender = normalizeGender(rawCV?.gender);

        if (cvId === null) return;
        if (!name || name === "Unknown") return;
        if (gender !== genderKey) return;

        const allRoles = resolveCVCharacters(rawCV);

        const seasonRoles = allRoles.filter(role => {
            const anime = DATA.animeMap.get(role.animeId);

            return isInSelectedSeason(anime);
        });

        if (seasonRoles.length === 0) return;

        list.push({
            id: cvId,
            name,
            cvimg: normalizeName(rawCV?.cvimg),
            gender,
            characters: seasonRoles
        });
    });

    list.sort((a, b) =>
        a.name.localeCompare(b.name, "ko")
    );

    return list;
}

function getGenderKey() {
    return cvState.theme.includes("female")
        ? "female"
        : "male";
}

function getDisplayAwardName() {
    const genderKey = getGenderKey();

    const fallback = genderKey === "female"
        ? "올해의 여자 성우상"
        : "올해의 남자 성우상";

    if (
        typeof SeasonFilter !== "undefined" &&
        SeasonFilter &&
        typeof SeasonFilter.toDisplayAwardName === "function"
    ) {
        try {
            return SeasonFilter.toDisplayAwardName(fallback);
        } catch (_) {}
    }

    return fallback;
}

/* ---------------------------------------------------------
 * Diagnostics
 * --------------------------------------------------------- */

function printDiagnostics(genderKey, candidateList) {
    const selectedSeason = getSelectedSeason();

    const totalResolvedRoles = DATA.cv.reduce(
        (sum, cv) => sum + resolveCVCharacters(cv).length,
        0
    );

    const seasonMatchedRoles = candidateList.reduce(
        (sum, cv) => sum + cv.characters.length,
        0
    );

    const matchingCVIds = candidateList.map(cv => cv.id);

    console.groupCollapsed("[cvNominate] DATA DIAGNOSTIC");

    console.log({
        animeCount: DATA.anime.length,
        animeMapCount: DATA.animeMap.size,
        cvCount: DATA.cv.length,
        characterCVIndexCount: DATA.charactersByCvId.size,
        totalResolvedRoles,
        seasonMatchedRoles,
        genderKey,
        targetGenderCVCount: DATA.cv.filter(
            cv => normalizeGender(cv?.gender) === genderKey
        ).length,
        candidateCount: candidateList.length,
        selectedSeason,
        matchingCVIds,
        cvDataSchemaSample: DATA.cv[0]
            ? {
                id: DATA.cv[0].id,
                name: DATA.cv[0].name,
                gender: DATA.cv[0].gender,
                hasCharacterIds: Array.isArray(DATA.cv[0].characterIds),
                hasCharacterObjects: Array.isArray(DATA.cv[0].characters)
            }
            : null
    });

    console.groupEnd();

    if (candidateList.length === 0) {
        console.warn(
            "[cvNominate] 현재 시즌의 후보가 없습니다.",
            {
                selectedSeason,
                genderKey,
                animeCount: DATA.anime.length,
                cvCount: DATA.cv.length,
                characterCVIndexCount: DATA.charactersByCvId.size
            }
        );
    }
}

/* ---------------------------------------------------------
 * DOM initialization
 * --------------------------------------------------------- */

function safeGet(id) {
    return document.getElementById(id);
}

document.addEventListener("DOMContentLoaded", () => {
    rebuildIndexes();

    const searchInput = safeGet("search-input");
    const nextButton = safeGet("btn-next");
    const backButton = safeGet("btn-back");
    const finalButton = safeGet("final-confirm-btn");

    if (searchInput) {
        searchInput.addEventListener("input", event => {
            renderCVStep1(event.target.value);
        });
    }

    if (nextButton) {
        nextButton.onclick = goStep2;
    }

    if (backButton) {
        backButton.onclick = handleBack;
    }

    if (finalButton) {
        finalButton.onclick = () => {
            location.href = "../index.html";
        };
    }

    renderCVStep1();
    window.NominateCommon.waitForFirebaseAndListen(
        () => cvState.awardName
    );
});

/* ---------------------------------------------------------
 * Step 1
 * --------------------------------------------------------- */

function renderCVStep1(searchTerm = "") {
    const mainContent = safeGet("main-content");
    const stepTitle = safeGet("step-title");

    if (!mainContent) return;

    if (cvState.step !== 1) {
        window.NominateCommon.applyVoteBadges();
        return;
    }

    mainContent.innerHTML = "";

    if (stepTitle) {
        stepTitle.textContent = `${getDisplayAwardName()} 부문`;
    }

    const genderKey = getGenderKey();

    let filteredList = getSeasonFilteredCVList(genderKey);

    const term = normalizeName(searchTerm)
        .toLocaleLowerCase("ko-KR");

    if (term) {
        filteredList = filteredList.filter(cv =>
            cv.name
                .toLocaleLowerCase("ko-KR")
                .includes(term) ||

            cv.characters.some(role =>
                role.charName
                    .toLocaleLowerCase("ko-KR")
                    .includes(term) ||

                role.animeTitle
                    .toLocaleLowerCase("ko-KR")
                    .includes(term)
            )
        );
    }

    printDiagnostics(genderKey, filteredList);

    if (filteredList.length === 0) {
        mainContent.innerHTML = `
            <div style="
                padding: 40px 20px;
                color: #999;
                text-align: center;
                line-height: 1.7;
            ">
                현재 시즌의 성우 후보가 없습니다.<br>
                <small>
                    선택 시즌: ${escapeHTML(getSeasonLabel())}<br>
                    F12 → Console의 [cvNominate] DATA DIAGNOSTIC을 확인하세요.
                </small>
            </div>
        `;

        updatePreview();
        window.NominateCommon.applyVoteBadges();

        return;
    }

    const groups = new Map();

    filteredList.forEach(cv => {
        const count = cv.characters.length;

        if (!groups.has(count)) {
            groups.set(count, []);
        }

        groups.get(count).push(cv);
    });

    const sortedCounts = [...groups.keys()]
        .sort((a, b) => b - a);

    sortedCounts.forEach(count => {
        const groupList = groups.get(count) || [];

        const section = document.createElement("div");
        section.className = "quarter-section";

        const btn = document.createElement("button");
        btn.className = "quarter-btn";

        btn.innerHTML = `
            <span>${count}개 작품 참여</span>
            <span>▼</span>
        `;

        const content = document.createElement("div");
        content.className = "day-content";
        content.style.display = term
            ? "grid"
            : "none";

        if (term) {
            btn.classList.add("active");
        }

        btn.onclick = () => {
            const opened = content.style.display === "grid";

            content.style.display = opened
                ? "none"
                : "grid";

            btn.classList.toggle(
                "active",
                !opened
            );
        };

        groupList.forEach(cv => {
            content.appendChild(
                createCVCard(cv, "step1")
            );
        });

        section.appendChild(btn);
        section.appendChild(content);

        mainContent.appendChild(section);
    });

    updatePreview();
    window.NominateCommon.applyVoteBadges();
}

function getSeasonLabel() {
    const season = getSelectedSeason();

    if (!season) {
        return "알 수 없음";
    }

    return `${season.year} / ${season.quarter}`;
}

/* ---------------------------------------------------------
 * Cards
 * --------------------------------------------------------- */

function createCVCard(cv, step) {
    const card = document.createElement("div");

    card.className = "card";

    card.dataset.category = cvState.awardName;

    // 기존 Firebase vote key 호환
    card.dataset.animeId = cv.name;

    card.dataset.candidateId = String(cv.id);

    const rateBadge = document.createElement("div");

    rateBadge.className = "card-selection-rate";
    rateBadge.style.display = "none";
    rateBadge.textContent = "0%";

    const workBadge = document.createElement("div");

    workBadge.className = "card-badge";
    workBadge.textContent = `${cv.characters.length}작품`;

    workBadge.addEventListener("click", event => {
        event.stopPropagation();
        openDetailModal(cv);
    });

    const image = document.createElement("img");

    image.loading = "lazy";
    image.src = `../${cv.cvimg}`;
    image.alt = cv.name;

    image.onerror = () => {
        image.src =
            "https://via.placeholder.com/200x300";
    };

    const info = document.createElement("div");

    info.className = "card-info";

    const title = document.createElement("div");

    title.className = "card-title";
    title.textContent = cv.name;

    info.appendChild(title);

    card.appendChild(rateBadge);
    card.appendChild(workBadge);
    card.appendChild(image);
    card.appendChild(info);

    const isSelected = cvState.selectedCVs.some(
        selected =>
            normalizeId(selected?.id) ===
            normalizeId(cv.id)
    );

    if (step === "step1" && isSelected) {
        card.classList.add("selected");
    }

    card.addEventListener("click", () => {
        if (step === "step1") {
            toggleCVSelection(
                cv,
                card
            );
        }
    });

    return card;
}

function toggleCVSelection(cv, cardElement) {
    const index = cvState.selectedCVs.findIndex(
        selected =>
            normalizeId(selected?.id) ===
            normalizeId(cv.id)
    );

    if (index >= 0) {
        cvState.selectedCVs.splice(
            index,
            1
        );

        cardElement.classList.remove(
            "selected"
        );
    } else {
        cvState.selectedCVs.push(cv);

        cardElement.classList.add(
            "selected"
        );
    }

    updatePreview();
}

function updatePreview() {
    const list = safeGet("preview-list");
    const nextButton = safeGet("btn-next");

    if (list) {
        list.innerHTML = "";

        cvState.selectedCVs.forEach(cv => {
            const item = document.createElement("div");

            item.className = "preview-item";

            item.innerHTML = `
                ${escapeHTML(cv.name)}
                <br>
                <small style="color:#888;">
                    ${cv.characters.length}개 작품 참여
                </small>
            `;

            item.onclick = () =>
                removeCV(cv);

            list.appendChild(item);
        });
    }

    if (nextButton) {
        nextButton.disabled =
            cvState.selectedCVs.length === 0;
    }
}

function removeCV(target) {
    const targetId = normalizeId(target?.id);

    const index = cvState.selectedCVs.findIndex(
        cv =>
            normalizeId(cv?.id) === targetId
    );

    if (index < 0) return;

    const removed =
        cvState.selectedCVs[index];

    cvState.selectedCVs.splice(
        index,
        1
    );

    document
        .querySelectorAll(".card")
        .forEach(card => {
            if (
                card.dataset.candidateId ===
                String(removed.id)
            ) {
                card.classList.remove(
                    "selected"
                );
            }
        });

    updatePreview();
}

/* ---------------------------------------------------------
 * Step 2
 * --------------------------------------------------------- */

function goStep2() {
    if (cvState.step === 1) {
        if (cvState.selectedCVs.length === 0) {
            return;
        }

        cvState.step = 2;

        const searchContainer =
            document.querySelector(
                ".search-container"
            );

        const previewBox =
            safeGet("step1-preview");

        if (searchContainer) {
            searchContainer.classList.add(
                "hidden"
            );
        }

        if (previewBox) {
            previewBox.classList.add(
                "hidden"
            );
        }

        const stepTitle =
            safeGet("step-title");

        if (stepTitle) {
            stepTitle.textContent =
                `${getDisplayAwardName()} 부문`;
        }

        const backButton =
            safeGet("btn-back");

        const nextButton =
            safeGet("btn-next");

        if (backButton) {
            backButton.textContent =
                "이전 단계";
        }

        if (nextButton) {
            nextButton.textContent =
                "수상 결정";

            nextButton.disabled = true;
        }

        const mainContent =
            safeGet("main-content");

        if (!mainContent) return;

        mainContent.innerHTML = `
            <h2 style="
                color:var(--gold);
                margin-bottom:20px;
                font-size:1.5rem;
                text-align:left;
            ">
                최종 수상자를 선택하세요
            </h2>

            <div id="step2-grid"></div>
        `;

        const grid =
            safeGet("step2-grid");

        cvState.selectedCVs.forEach(cv => {
            grid.appendChild(
                createStep2Card(cv)
            );
        });

        window.NominateCommon.applyVoteBadges();
    } else {
        openWinnerModal();
    }
}

function createStep2Card(cv) {
    const card =
        document.createElement("div");

    card.className =
        "step2-cv-card";

    card.dataset.category =
        cvState.awardName;

    // 기존 Firebase vote key 호환
    card.dataset.animeId = cv.name;

    card.dataset.candidateId =
        String(cv.id);

    const rateBadge =
        document.createElement("div");

    rateBadge.className =
        "card-selection-rate";

    rateBadge.style.display =
        "none";

    rateBadge.textContent =
        "0%";

    const badge =
        document.createElement("div");

    badge.className =
        "card-badge";

    badge.textContent =
        `${cv.characters.length}작품`;

    const thumb =
        document.createElement("div");

    thumb.className =
        "card-thumb";

    const image =
        document.createElement("img");

    image.src =
        `../${cv.cvimg}`;

    image.alt =
        cv.name;

    image.loading =
        "lazy";

    image.onerror = () => {
        image.src =
            "https://via.placeholder.com/200x300";
    };

    thumb.appendChild(image);

    const info =
        document.createElement("div");

    info.className =
        "step2-card-info";

    const title =
        document.createElement("div");

    title.className =
        "card-title";

    title.textContent =
        cv.name;

    const representativeWork =
        cv.characters[0]?.animeTitle ||
        "";

    const subText =
        representativeWork
            ? `${representativeWork} 등`
            : "정보 없음";

    const work =
        document.createElement("div");

    work.className =
        "card-studio";

    work.textContent =
        subText;

    info.appendChild(title);
    info.appendChild(work);

    card.appendChild(rateBadge);
    card.appendChild(badge);
    card.appendChild(thumb);
    card.appendChild(info);

    card.addEventListener("click", () => {
        document
            .querySelectorAll(
                "#step2-grid .step2-cv-card"
            )
            .forEach(item =>
                item.classList.remove(
                    "selected"
                )
            );

        card.classList.add(
            "selected"
        );

        cvState.finalWinner =
            cv;

        const nextButton =
            safeGet("btn-next");

        if (nextButton) {
            nextButton.disabled = false;
        }
    });

    return card;
}

/* ---------------------------------------------------------
 * Back
 * --------------------------------------------------------- */

function handleBack() {
    if (cvState.step === 2) {
        cvState.step = 1;

        const searchContainer =
            document.querySelector(
                ".search-container"
            );

        const previewBox =
            safeGet("step1-preview");

        if (searchContainer) {
            searchContainer.classList.remove(
                "hidden"
            );
        }

        if (previewBox) {
            previewBox.classList.remove(
                "hidden"
            );
        }

        const backButton =
            safeGet("btn-back");

        const nextButton =
            safeGet("btn-next");

        if (backButton) {
            backButton.textContent =
                "메인으로";
        }

        if (nextButton) {
            nextButton.textContent =
                "다음 단계";
        }

        renderCVStep1();
    } else {
        location.href =
            "../index.html";
    }
}

/* ---------------------------------------------------------
 * Detail / Winner modal
 * --------------------------------------------------------- */

function openDetailModal(cv) {
    const modal =
        safeGet("cv-detail-modal");

    const nameEl =
        safeGet("detail-name");

    const imgEl =
        safeGet("detail-img");

    const worksContainer =
        safeGet("detail-works");

    if (
        !modal ||
        !nameEl ||
        !imgEl ||
        !worksContainer
    ) {
        return;
    }

    nameEl.textContent =
        `${cv.name} 참여 작품`;

    imgEl.src =
        `../${cv.cvimg}`;

    imgEl.alt =
        cv.name;

    worksContainer.innerHTML =
        "";

    cv.characters.forEach(char => {
        const workCard =
            document.createElement("div");

        workCard.className =
            "work-card";

        const thumb =
            document.createElement("div");

        thumb.className =
            "work-card-thumb";

        const image =
            document.createElement("img");

        image.src = char.img
            ? `../${char.img}`
            : "https://via.placeholder.com/150";

        image.alt =
            char.charName;

        image.onerror = () => {
            image.src =
                "https://via.placeholder.com/150";
        };

        thumb.appendChild(image);

        const info =
            document.createElement("div");

        info.className =
            "work-card-info";

        const animeTitle =
            document.createElement("div");

        animeTitle.className =
            "work-card-title";

        animeTitle.textContent =
            char.animeTitle;

        const charName =
            document.createElement("div");

        charName.className =
            "work-card-char";

        charName.textContent =
            `${char.charName} 역`;

        info.appendChild(animeTitle);
        info.appendChild(charName);

        workCard.appendChild(thumb);
        workCard.appendChild(info);

        worksContainer.appendChild(
            workCard
        );
    });

    modal.classList.remove(
        "hidden"
    );
}

function openWinnerModal() {
    const winner =
        cvState.finalWinner;

    if (!winner) return;

    const winnerImg =
        safeGet("winner-img");

    const infoContent =
        safeGet(
            "winner-info-content"
        );

    const modal =
        safeGet("winner-modal");

    if (
        !winnerImg ||
        !infoContent ||
        !modal
    ) {
        return;
    }

    winnerImg.src =
        `../${winner.cvimg}`;

    winnerImg.alt =
        winner.name;

    const rows =
        winner.characters.map(char => `
            <div class="info-row">
                <span class="info-label">
                    ${escapeHTML(char.animeTitle)}
                </span>

                <span class="info-value">
                    ${escapeHTML(char.charName)} 역
                </span>
            </div>
        `).join("");

    infoContent.innerHTML = `
        <div class="info-row" style="
            border-bottom:2px solid var(--gold);
            margin-bottom:15px;
            padding-bottom:15px;
        ">
            <span class="info-label" style="
                font-size:1.4rem;
            ">
                수상자
            </span>

            <span class="info-value" style="
                font-size:1.4rem;
                color:#fff;
                font-weight:bold;
            ">
                ${escapeHTML(winner.name)}
            </span>
        </div>

        <div class="winner-works-scroll" style="
            max-height:300px;
            overflow-y:auto;
            padding-right:10px;
        ">
            ${rows}
        </div>
    `;

    modal.classList.remove(
        "hidden"
    );

    window.NominateCommon.fireConfetti();

    saveResult(winner);
}

function saveResult(winner) {
    if (
        typeof ResultStorage !==
            "undefined" &&
        ResultStorage &&
        typeof ResultStorage.saveOne ===
            "function"
    ) {
        ResultStorage.saveOne(
            cvState.awardName,
            {
                name: winner.name,
                thumbnail: winner.cvimg,
                works: winner.characters
                    .map(c => c.charName)
                    .join(", ")
            }
        );
    }

    if (
        typeof window !==
            "undefined" &&
        window.submitSingleAwardToDB
    ) {
        window.submitSingleAwardToDB(
            cvState.awardName
        );
    }
}

function closeModal(id) {
    const modal = safeGet(id);

    if (modal) {
        modal.classList.add(
            "hidden"
        );
    }
}

/* ---------------------------------------------------------
 * Safety helpers
 * --------------------------------------------------------- */

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}
