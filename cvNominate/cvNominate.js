/**
 * AnimeAwards - CV Nomination v2.8
 *
 * Canonical data:
 * CharacterVoiceData_2026:
 * { id: Staff ID, name, cvimg, gender, characterIds: number[] }
 *
 * CharacterData_2026:
 * [{ id: Anime MAL ID, title, year, characters: [{ characterId, name, gender, cvId, cv, img }] }]
 *
 * Important:
 * This version does not rely only on JavaScript global variable visibility.
 * If a loaded data variable cannot be read, it fetches the original JS file
 * and parses the JSON assignment directly. This avoids false "characterCount: 0"
 * caused by scope / script-loading differences.
 */
(() => {
  "use strict";

  const DATA_FILES = {
    anime: "../data/2026/2026animeData.js",
    character: "../data/2026/2026animeCharacterData.js",
    cv: "../data/2026/2026animeCVData.js"
  };

  const DATA_VARS = {
    anime: "AnimeList_2026",
    character: "CharacterData_2026",
    cv: "CharacterVoiceData_2026"
  };

  const cvState = {
    step: 1,
    theme: new URLSearchParams(location.search).get("theme") || "character_male",
    awardName: new URLSearchParams(location.search).get("awardName") || "올해의 성우상",
    selectedCVs: [],
    finalWinner: null
  };

  let cachedVoteData = null;
  let runtimeData = null;

  const $ = id => document.getElementById(id);
  const arr = value => Array.isArray(value) ? value : [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readGlobal(name) {
    try {
      return Function(`return typeof ${name} !== "undefined" ? ${name} : undefined;`)();
    } catch (_) {
      return undefined;
    }
  }

  function normalizeCollection(value) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "object") return [];
    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.items)) return value.items;
    if (Array.isArray(value.records)) return value.records;
    return Object.values(value).filter(v => v && typeof v === "object");
  }

  function isValidAnimeList(list) {
    return list.length > 0 && list.some(v => Number.isFinite(Number(v?.id)));
  }

  function isValidCharacterData(list) {
    return list.length > 0 && list.some(v => arr(v?.characters).some(c => Number.isFinite(Number(c?.characterId))));
  }

  function isValidCVData(list) {
    return list.length > 0 && list.some(v => Array.isArray(v?.characterIds));
  }

  async function fetchAssignedData(url, variableName) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`${url} HTTP ${response.status}`);
    }
    const text = await response.text();

    // The generated data files are plain JS assignments such as:
    // var CharacterData_2026 = [ ... ];
    const pattern = new RegExp(`(?:var|let|const)\\s+${variableName}\\s*=\\s*([\\s\\S]*?)\\s*;?\\s*$`);
    const match = text.match(pattern);
    if (!match) {
      throw new Error(`${variableName} 할당문을 찾을 수 없습니다.`);
    }

    let rhs = match[1].trim();
    if (rhs.endsWith(";")) rhs = rhs.slice(0, -1).trim();

    try {
      return JSON.parse(rhs);
    } catch (error) {
      throw new Error(`${variableName} JSON 파싱 실패: ${error.message}`);
    }
  }

  async function loadData() {
    const diagnostics = {
      source: {},
      animeCount: 0,
      characterEntryCount: 0,
      rawCharacterCount: 0,
      characterCount: 0,
      cvCount: 0,
      invalidCharacterEntries: 0,
      invalidCharacterIds: 0
    };

    let animeList = normalizeCollection(readGlobal(DATA_VARS.anime));
    if (isValidAnimeList(animeList)) {
      diagnostics.source.anime = "global";
    } else {
      animeList = normalizeCollection(await fetchAssignedData(DATA_FILES.anime, DATA_VARS.anime));
      diagnostics.source.anime = "fetch-fallback";
    }

    let characterData = normalizeCollection(readGlobal(DATA_VARS.character));
    if (isValidCharacterData(characterData)) {
      diagnostics.source.character = "global";
    } else {
      characterData = normalizeCollection(await fetchAssignedData(DATA_FILES.character, DATA_VARS.character));
      diagnostics.source.character = "fetch-fallback";
    }

    let cvRecords = normalizeCollection(readGlobal(DATA_VARS.cv));
    if (isValidCVData(cvRecords)) {
      diagnostics.source.cv = "global";
    } else {
      cvRecords = normalizeCollection(await fetchAssignedData(DATA_FILES.cv, DATA_VARS.cv));
      diagnostics.source.cv = "fetch-fallback";
    }

    const animeMap = new Map();
    for (const anime of animeList) {
      const animeId = Number(anime?.id ?? anime?.animeId);
      if (Number.isFinite(animeId) && animeId > 0) animeMap.set(animeId, anime);
    }

    const characterMap = new Map();
    for (const entry of characterData) {
      if (!entry || typeof entry !== "object") {
        diagnostics.invalidCharacterEntries++;
        continue;
      }
      const animeId = Number(entry.id ?? entry.animeId ?? entry.malId);
      if (!Number.isFinite(animeId) || animeId <= 0) {
        diagnostics.invalidCharacterEntries++;
        continue;
      }

      const characters = arr(entry.characters);
      diagnostics.rawCharacterCount += characters.length;

      for (const character of characters) {
        const characterId = Number(character?.characterId);
        if (!Number.isFinite(characterId) || characterId <= 0) {
          diagnostics.invalidCharacterIds++;
          continue;
        }
        characterMap.set(characterId, { ...character, characterId, animeId });
      }
    }

    diagnostics.animeCount = animeList.length;
    diagnostics.characterEntryCount = characterData.length;
    diagnostics.characterCount = characterMap.size;
    diagnostics.cvCount = cvRecords.length;

    if (!diagnostics.characterCount) {
      throw new Error(
        "현재 2026animeCharacterData.js에서 characterId를 가진 캐릭터를 찾지 못했습니다. " +
        "새 7charDataExtractor 결과로 2026animeCharacterData.js를 교체했는지 확인하세요."
      );
    }

    if (!diagnostics.cvCount) {
      throw new Error("2026animeCVData.js에서 CV 데이터를 찾지 못했습니다.");
    }

    runtimeData = { animeList, characterData, cvRecords, animeMap, characterMap, diagnostics };
    console.info("[cvNominate] DATA READY", diagnostics);
    return runtimeData;
  }

  function getSelectedSeason() {
    if (typeof SeasonFilter !== "undefined" && typeof SeasonFilter.getSelectedSeason === "function") {
      return SeasonFilter.getSelectedSeason();
    }
    return {
      year: localStorage.getItem("selected_year"),
      quarter: localStorage.getItem("selected_quarter")
    };
  }

  function inSeason(anime) {
    if (typeof SeasonFilter !== "undefined" && typeof SeasonFilter.isInSeason === "function") {
      return SeasonFilter.isInSeason(anime);
    }
    const { year, quarter } = getSelectedSeason();
    if (!year || !quarter) return true;
    if (String(anime?.year) !== String(year)) return false;
    if (quarter !== "모든 분기" && String(anime?.quarter || "") !== String(quarter)) return false;
    return true;
  }

  function displayAwardName(name) {
    if (typeof SeasonFilter !== "undefined" && typeof SeasonFilter.toDisplayAwardName === "function") {
      return SeasonFilter.toDisplayAwardName(name);
    }
    return name;
  }

  function makeRoles(cv) {
    if (!runtimeData) return [];
    const seen = new Set();
    const roles = [];

    for (const rawId of arr(cv?.characterIds)) {
      const characterId = Number(rawId);
      if (!Number.isFinite(characterId) || characterId <= 0 || seen.has(characterId)) continue;
      seen.add(characterId);

      const character = runtimeData.characterMap.get(characterId);
      if (!character) continue;

      const anime = runtimeData.animeMap.get(Number(character.animeId));
      if (!anime) continue;

      if (!inSeason(anime)) continue;

      roles.push({
        characterId,
        animeId: Number(character.animeId),
        charName: character.name || "이름 없음",
        img: character.img || "",
        animeTitle: anime.title || "작품명 없음"
      });
    }
    return roles;
  }

  function getCandidates() {
    if (!runtimeData) return [];
    const genderKey = cvState.theme.toLowerCase().includes("female") ? "female" : "male";

    return runtimeData.cvRecords
      .filter(cv => cv && typeof cv === "object")
      .filter(cv => String(cv.name || "").trim() !== "")
      .filter(cv => String(cv.gender || "").toLowerCase() === genderKey)
      .map(cv => ({
        ...cv,
        id: Number(cv.id),
        characters: makeRoles(cv)
      }))
      .filter(cv => cv.characters.length > 0);
  }

  function setStepTitle() {
    const el = $("step-title");
    if (!el) return;
    const female = cvState.theme.toLowerCase().includes("female");
    const base = female ? "올해의 여자 성우상" : "올해의 남자 성우상";
    el.textContent = `${displayAwardName(base)} 부문`;
  }

  function renderStep1(searchTerm = "") {
    if (cvState.step !== 1) return;
    const main = $("main-content");
    if (!main) return;
    main.innerHTML = "";
    setStepTitle();

    const all = getCandidates();
    const term = String(searchTerm || "").trim().toLowerCase();
    const filtered = term
      ? all.filter(cv => String(cv.name).toLowerCase().includes(term) || cv.characters.some(r => String(r.charName).toLowerCase().includes(term)))
      : all;

    const groups = {};
    for (const cv of filtered) {
      const count = cv.characters.length;
      const key = `${count}개 작품 참여`;
      if (!groups[key]) groups[key] = { count, list: [] };
      groups[key].list.push(cv);
    }

    Object.keys(groups)
      .sort((a, b) => groups[b].count - groups[a].count)
      .forEach(key => {
        const section = document.createElement("div");
        section.className = "quarter-section";

        const button = document.createElement("button");
        button.className = "quarter-btn";
        button.innerHTML = `<span>${escapeHtml(key)}</span> <span>▼</span>`;

        const content = document.createElement("div");
        content.className = "day-content";
        content.style.display = term ? "grid" : "none";

        if (term) button.classList.add("active");
        button.addEventListener("click", () => {
          const open = content.style.display === "grid";
          content.style.display = open ? "none" : "grid";
          button.classList.toggle("active", !open);
        });

        groups[key].list
          .sort((a, b) => String(a.name).localeCompare(String(b.name), "ko"))
          .forEach(cv => content.appendChild(createCVCard(cv)));

        section.append(button, content);
        main.appendChild(section);
      });

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "padding:30px;color:#aaa;text-align:center;white-space:pre-line;";
      const season = getSelectedSeason();
      empty.textContent = `현재 시즌의 성우 후보가 없습니다.\n선택 시즌: ${season?.year || "?"} / ${season?.quarter || "?"}\n\nF12 → Console의 [cvNominate] DATA READY를 확인하세요.`;
      main.appendChild(empty);
    }
    applyVoteBadges();
  }

  function createCVCard(cv) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.category = cvState.awardName;
    card.dataset.animeId = cv.name;
    card.dataset.candidateId = String(cv.id);

    const rate = document.createElement("div");
    rate.className = "card-selection-rate";
    rate.style.display = "none";
    rate.textContent = "0%";

    const badge = document.createElement("div");
    badge.className = "card-badge";
    badge.textContent = `${cv.characters.length}작품`;
    badge.addEventListener("click", e => { e.stopPropagation(); openDetailModal(cv); });

    const img = document.createElement("img");
    img.src = `../${cv.cvimg || ""}`;
    img.loading = "lazy";
    img.onerror = () => { img.src = "https://via.placeholder.com/200x300"; };

    const info = document.createElement("div");
    info.className = "card-info";
    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = cv.name;
    info.appendChild(title);

    card.append(rate, img, info);
    card.prepend(badge);
    if (cvState.selectedCVs.some(v => sameCV(v, cv))) card.classList.add("selected");
    card.addEventListener("click", () => toggleCVSelection(cv, card));
    return card;
  }

  function sameCV(a, b) {
    const ai = Number(a?.id), bi = Number(b?.id);
    if (Number.isFinite(ai) && Number.isFinite(bi)) return ai === bi;
    return String(a?.name || "") === String(b?.name || "");
  }

  function toggleCVSelection(cv, card) {
    const index = cvState.selectedCVs.findIndex(v => sameCV(v, cv));
    if (index >= 0) {
      cvState.selectedCVs.splice(index, 1);
      card.classList.remove("selected");
    } else {
      cvState.selectedCVs.push(cv);
      card.classList.add("selected");
    }
    updatePreview();
  }

  function updatePreview() {
    const list = $("preview-list");
    const next = $("btn-next");
    if (!list) return;
    list.innerHTML = "";
    cvState.selectedCVs.forEach(cv => {
      const item = document.createElement("div");
      item.className = "preview-item";
      item.innerHTML = `${escapeHtml(cv.name)}<br><small style="color:#888;">${cv.characters.length}개 작품 참여</small>`;
      item.addEventListener("click", () => removeCV(cv));
      list.appendChild(item);
    });
    if (next) next.disabled = cvState.selectedCVs.length === 0;
  }

  function removeCV(cv) {
    const index = cvState.selectedCVs.findIndex(v => sameCV(v, cv));
    if (index < 0) return;
    const removed = cvState.selectedCVs.splice(index, 1)[0];
    document.querySelectorAll(".card, .step2-cv-card").forEach(card => {
      if (card.dataset.candidateId === String(removed.id)) card.classList.remove("selected");
    });
    updatePreview();
  }

  function goStep2() {
    if (cvState.step === 1) {
      if (cvState.selectedCVs.length === 0) return;
      cvState.step = 2;
      $("btn-back").textContent = "이전 단계";
      $("btn-next").textContent = "수상 결정";
      $("btn-next").disabled = true;
      document.querySelector(".search-container")?.classList.add("hidden");
      $("step1-preview")?.classList.add("hidden");
      setStepTitle();
      const main = $("main-content");
      main.innerHTML = `<h2 style="color:var(--gold);margin-bottom:20px;font-size:1.5rem;text-align:left;">최종 수상자를 선택하세요</h2><div id="step2-grid"></div>`;
      const grid = $("step2-grid");
      cvState.selectedCVs.forEach(cv => grid.appendChild(createStep2Card(cv)));
      applyVoteBadges();
      return;
    }
    openWinnerModal();
  }

  function createStep2Card(cv) {
    const card = document.createElement("div");
    card.className = "step2-cv-card";
    card.dataset.category = cvState.awardName;
    card.dataset.animeId = cv.name;
    card.dataset.candidateId = String(cv.id);

    const rate = document.createElement("div");
    rate.className = "card-selection-rate";
    rate.style.display = "none";
    rate.textContent = "0%";

    const badge = document.createElement("div");
    badge.className = "card-badge";
    badge.textContent = `${cv.characters.length}작품`;

    const thumb = document.createElement("div");
    thumb.className = "card-thumb";
    const img = document.createElement("img");
    img.src = `../${cv.cvimg || ""}`;
    img.onerror = () => { img.src = "https://via.placeholder.com/200x300"; };
    thumb.appendChild(img);

    const info = document.createElement("div");
    info.className = "step2-card-info";
    const name = document.createElement("div");
    name.className = "card-title";
    name.textContent = cv.name;
    const sub = document.createElement("div");
    sub.className = "card-studio";
    sub.textContent = `${cv.characters[0]?.animeTitle || "정보 없음"} 등`;
    info.append(name, sub);

    card.append(rate, badge, thumb, info);
    card.addEventListener("click", () => {
      document.querySelectorAll("#step2-grid .step2-cv-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      cvState.finalWinner = cv;
      $("btn-next").disabled = false;
    });
    return card;
  }

  function handleBack() {
    if (cvState.step === 2) {
      cvState.step = 1;
      document.querySelector(".search-container")?.classList.remove("hidden");
      $("step1-preview")?.classList.remove("hidden");
      $("btn-back").textContent = "메인으로";
      $("btn-next").textContent = "다음 단계";
      $("btn-next").disabled = cvState.selectedCVs.length === 0;
      renderStep1($("search-input")?.value || "");
      return;
    }
    location.href = "../index.html";
  }

  function openDetailModal(cv) {
    const modal = $("cv-detail-modal"), name = $("detail-name"), img = $("detail-img"), works = $("detail-works");
    if (!modal || !name || !img || !works) return;
    name.textContent = `${cv.name} 참여 작품`;
    img.src = `../${cv.cvimg || ""}`;
    img.onerror = () => { img.src = "https://via.placeholder.com/200x300"; };
    works.innerHTML = cv.characters.map(role => `
      <div class="work-card">
        <div class="work-card-thumb"><img src="../${escapeHtml(role.img)}" alt="" onerror="this.src='https://via.placeholder.com/150'"></div>
        <div class="work-card-info">
          <div class="work-card-title">${escapeHtml(role.animeTitle)}</div>
          <div class="work-card-char">${escapeHtml(role.charName)} 역</div>
        </div>
      </div>`).join("");
    modal.classList.remove("hidden");
  }

  function openWinnerModal() {
    const winner = cvState.finalWinner;
    if (!winner) return;
    const modal = $("winner-modal"), img = $("winner-img"), info = $("winner-info-content");
    if (!modal || !img || !info) return;
    img.src = `../${winner.cvimg || ""}`;
    const rows = winner.characters.map(role => `
      <div class="info-row"><span class="info-label">${escapeHtml(role.animeTitle)}</span><span class="info-value">${escapeHtml(role.charName)} 역</span></div>`).join("");
    info.innerHTML = `<div class="info-row" style="border-bottom:2px solid var(--gold);margin-bottom:15px;padding-bottom:15px;"><span class="info-label" style="font-size:1.4rem;">수상자</span><span class="info-value" style="font-size:1.4rem;color:#fff;font-weight:bold;">${escapeHtml(winner.name)}</span></div><div class="winner-works-scroll" style="max-height:300px;overflow-y:auto;padding-right:10px;">${rows}</div>`;
    modal.classList.remove("hidden");
    if (typeof confetti === "function") fireConfetti();
    saveResult(winner);
  }

  function saveResult(winner) {
    if (typeof ResultStorage !== "undefined" && typeof ResultStorage.saveOne === "function") {
      ResultStorage.saveOne(cvState.awardName, { name: winner.name, thumbnail: winner.cvimg, works: winner.characters.map(c => c.charName).join(", ") });
    }
    if (window.submitSingleAwardToDB) window.submitSingleAwardToDB(cvState.awardName);
  }

  function fireConfetti() {
    const end = Date.now() + 3000;
    (function frame() {
      if (typeof confetti !== "function") return;
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, zIndex: 9999, colors: ["#d4af37", "#ffffff"] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, zIndex: 9999, colors: ["#d4af37", "#ffffff"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  function closeModal(id) { $(id)?.classList.add("hidden"); }
  window.closeModal = closeModal;

  function applyVoteBadges() {
    if (!cachedVoteData) return;
    const total = Number(cachedVoteData._participants || 0);
    document.querySelectorAll(".card, .step2-cv-card").forEach(card => {
      const key = card.dataset.animeId;
      const badge = card.querySelector(".card-selection-rate");
      if (!key || !badge) return;
      const count = Number(cachedVoteData[key] || 0);
      badge.textContent = `${total > 0 ? Math.round((count / total) * 100) : 0}%`;
      badge.style.display = "block";
    });
  }

  function listenToVoteRates() {
    if (!window.fbOnValue || !window.fbDB || !window.fbRef || !window.getVotesCategoryPath) return;
    const ref = window.fbRef(window.fbDB, window.getVotesCategoryPath(cvState.awardName));
    window.fbOnValue(ref, snapshot => { cachedVoteData = snapshot.val() || {}; applyVoteBadges(); });
  }

  function waitForFirebaseAndListen() {
    if (window.fbOnValue && window.fbDB && window.fbRef && window.getVotesCategoryPath) return listenToVoteRates();
    setTimeout(waitForFirebaseAndListen, 300);
  }

  async function init() {
    try {
      const diag = $("data-diagnostic");
      if (diag) diag.textContent = "데이터 확인 중...";
      await loadData();
      if (diag) diag.textContent = "데이터 로드 완료";
      renderStep1();
      updatePreview();
      waitForFirebaseAndListen();
    } catch (error) {
      console.error("[cvNominate] DATA LOAD ERROR", error);
      const main = $("main-content");
      if (main) {
        main.innerHTML = `<div style="padding:30px;color:#ff8b8b;text-align:center;white-space:pre-line;">${escapeHtml(error.message)}\n\nF12 → Console의 [cvNominate] 로그를 확인하세요.</div>`;
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("search-input")?.addEventListener("input", e => renderStep1(e.target.value));
    $("btn-next")?.addEventListener("click", goStep2);
    $("btn-back")?.addEventListener("click", handleBack);
    $("final-confirm-btn")?.addEventListener("click", () => { location.href = "../index.html"; });
    init();
  });
})();
