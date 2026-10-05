(() => {
  const state = { step: 1, selectedItems: [], selectedWinner: null, awardName: "", theme: "ost" };
  const params = new URLSearchParams(location.search);
  state.awardName = params.get("awardName") || "올해의 OST";
  state.theme = params.get("theme") || "ost";

  const dayLabels = {
    Mondays: "월요일", Tuesdays: "화요일", Wednesdays: "수요일", Thursdays: "목요일",
    Fridays: "금요일", Saturdays: "토요일", Sundays: "일요일", Anomaly: "변칙 편성",
    Web: "웹", Unknown: "기타", Cinema: "극장판"
  };
  const dayKeys = Object.keys(dayLabels);
  const quarterOrder = ["1분기", "2분기", "3분기", "4분기", "변칙 편성", "기타"];

  const asArray = value => Array.isArray(value) ? value : [];
  // 수집 파일의 중첩 배열도 원본을 변경하지 않고 읽는다.
  const ostById = new Map();
  asArray(window.animeOSTData).flat(Infinity).filter(record => record?.id != null).forEach(record => {
    const id = String(record.id);
    const previous = ostById.get(id) || { albums: [], composers: [] };
    previous.albums.push(...asArray(record.albums));
    previous.composers.push(...(Array.isArray(record.composer) ? record.composer : [record.composer]).filter(Boolean));
    ostById.set(id, previous);
  });
  const seasonWorks = SeasonFilter.filterAnimeList(Array.isArray(window.AnimeList) ? window.AnimeList : []);
  const eligibleWorks = seasonWorks.map(anime => {
    const record = ostById.get(String(anime.id));
    const albums = asArray(record?.albums).filter(album => asArray(album?.discs)
      .some(disc => asArray(disc?.tracks).some(track => String(track?.title || '').trim())));
    if (!albums.length) return null;
    return { ...anime, albums, thumbnail: albums[0].image || anime.thumbnail, composers: [...new Set(record.composers)] };
  }).filter(Boolean);

  function imagePath(value) {
    return /^https?:\/\//i.test(value || '') ? value : `../${value || 'image/trophy/trophy.png'}`;
  }

  const worksByQuarter = eligibleWorks.reduce((groups, anime) => {
    const quarter = anime.quarter || "기타";
    (groups[quarter] ||= []).push(anime);
    return groups;
  }, {});

  const stepTitle = document.getElementById("step-title");
  stepTitle.textContent = `${SeasonFilter.toDisplayAwardName(state.awardName)} 부문`;

  function createTrackCard(track) {
    const item = document.createElement("tr");
    item.className = "ost-track-card";
    const number = document.createElement('td');
    number.className = 'ost-track-number';
    number.textContent = track.track_no ?? '-';
    item.appendChild(number);
    const title = document.createElement("td");
    title.className = "ost-track-title";
    title.textContent = track.title;
    item.appendChild(title);
    for (const [field, label] of [['itunes_url', '아이튠즈로 이동'], ['youtube_url', '유튜브로 이동']]) {
      const cell = document.createElement('td');
      cell.className = 'ost-track-links';
      cell.textContent = '—';
      item.appendChild(cell);
      let url;
      try { url = new URL(track[field]); } catch { continue; }
      if (!['https:', 'http:'].includes(url.protocol)) continue;
      const link = document.createElement('a');
      link.href = track[field];
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = label;
      cell.replaceChildren(link);
    }
    return item;
  }

  function openListenModal(anime) {
    const modal = document.getElementById("ost-listen-modal");
    const image = document.getElementById("ost-modal-image");
    document.getElementById("ost-modal-title").textContent = anime.title;
    document.getElementById("ost-modal-composer").textContent = anime.composers.join(", ") || "정보 없음";
    const grid = document.getElementById("ost-track-grid");
    const select = document.getElementById('ost-album-select');
    select.replaceChildren(...anime.albums.map((album, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `앨범 ${index + 1} · ${album.release_date || '발매일 미상'}`;
      return option;
    }));
    document.getElementById('ost-album-picker').hidden = anime.albums.length < 2;
    function renderAlbum(index) {
      const album = anime.albums[index];
      image.onerror = () => { image.onerror = null; image.src = '../image/trophy/trophy.png'; };
      image.src = imagePath(album.image || anime.thumbnail);
      image.alt = `${anime.title} OST 앨범`;
      document.getElementById('ost-modal-release-date').textContent = album.release_date || '정보 없음';
      grid.replaceChildren();
      const table = document.createElement('table');
      table.className = 'ost-track-table';
      const head = table.createTHead().insertRow();
      for (const label of ['번호', '트랙 제목', '아이튠즈', '유튜브']) {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = label;
        head.appendChild(th);
      }
      asArray(album.discs).forEach((disc, discIndex) => {
        const body = table.createTBody();
        const heading = document.createElement('th');
        heading.colSpan = 4;
        heading.scope = 'rowgroup';
        heading.className = 'ost-disc-heading';
        heading.textContent = `DISC ${disc.disc ?? discIndex + 1}`;
        body.insertRow().appendChild(heading);
        asArray(disc.tracks).filter(track => String(track?.title || '').trim()).forEach(track => body.appendChild(createTrackCard(track)));
      });
      grid.appendChild(table);
      grid.scrollTop = 0;
      grid.scrollLeft = 0;
    }
    select.onchange = () => renderAlbum(Number(select.value));
    renderAlbum(0);
    modal.classList.remove("hidden");
  }

  function createCard(anime) {
    const card = document.createElement("article");
    const selected = state.step === 1
      ? state.selectedItems.some(item => String(item.id) === String(anime.id))
      : String(state.selectedWinner?.id) === String(anime.id);
    card.className = `card ost-nominee-card${selected ? " selected" : ""}`;
    card.dataset.selectionId = String(anime.id);
    card.dataset.category = state.awardName;
    card.dataset.animeId = anime.title;
    const rate = document.createElement("div");
    rate.className = "card-selection-rate";
    rate.style.display = "none";
    rate.textContent = "0/0";
    const image = document.createElement("img");
    image.src = imagePath(anime.thumbnail);
    image.alt = anime.title;
    image.loading = "lazy";
    image.onerror = () => { image.src = "../image/trophy/trophy.png"; image.onerror = null; };
    const badge = document.createElement("button");
    badge.type = "button";
    badge.className = "card-badge ost-listen-badge";
    badge.textContent = "듣기";
    badge.setAttribute("aria-label", `${anime.title} OST 듣기`);
    badge.addEventListener("click", event => { event.stopPropagation(); openListenModal(anime); });
    const info = document.createElement("div");
    info.className = "card-info";
    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = anime.title;
    const composer = document.createElement("div");
    composer.className = "composer-title";
    composer.textContent = anime.composers.join(", ") || "작곡가 정보 없음";
    info.append(title, composer);
    card.append(rate, image, badge, info);
    card.addEventListener("click", () => selectCard(anime, card));
    return card;
  }

  function renderStep1(searchText = "") {
    const left = document.getElementById("left-area");
    left.replaceChildren();
    const searching = Boolean(searchText.trim());
    const selectedQuarter = SeasonFilter.getSelectedSeason().quarter;
    const showQuarterAccordion = !selectedQuarter || selectedQuarter === "모든 분기";
    for (const quarter of quarterOrder) {
      const group = worksByQuarter[quarter];
      if (!group?.length) continue;
      const matches = group.filter(anime => anime.title.toLowerCase().includes(searchText.toLowerCase()));
      if (searching && !matches.length) continue;
      let content = left;
      if (showQuarterAccordion) {
        const section = document.createElement("section");
        section.className = "quarter-section";
        const button = document.createElement("button");
        button.className = `quarter-btn${searching ? " active" : ""}`;
        button.innerHTML = `<span>${quarter}</span><span>▼</span>`;
        content = document.createElement("div");
        content.className = "quarter-content";
        content.style.display = searching ? "block" : "none";
        button.onclick = () => {
          const open = content.style.display !== "block";
          content.style.display = open ? "block" : "none";
          button.classList.toggle("active", open);
        };
        section.append(button, content);
        left.appendChild(section);
      }
      const visibleWorks = searching ? matches : group;
      for (const day of dayKeys) {
        const dayWorks = visibleWorks.filter(anime => anime.day === day);
        if (!dayWorks.length) continue;
        const wrapper = document.createElement("section");
        const button = document.createElement("button");
        button.className = `day-btn${searching ? " active" : ""}`;
        button.innerHTML = `${dayLabels[day]} <span>▼</span>`;
        const grid = document.createElement("div");
        grid.className = "day-content";
        grid.style.display = searching ? "grid" : "none";
        button.onclick = () => {
          const open = grid.style.display !== "grid";
          grid.style.display = open ? "grid" : "none";
          button.classList.toggle("active", open);
        };
        dayWorks.forEach(anime => grid.appendChild(createCard(anime)));
        wrapper.append(button, grid);
        content.appendChild(wrapper);
      }
    }
    if (!eligibleWorks.length) {
      const empty = document.createElement("p");
      empty.className = "ost-empty-state";
      empty.textContent = "현재 선택한 시즌에 등록된 OST 트랙이 없습니다.";
      left.appendChild(empty);
    }
    window.NominateCommon.applyVoteBadges();
  }

  function selectCard(anime, card) {
    if (state.step === 1) {
      const index = state.selectedItems.findIndex(item => String(item.id) === String(anime.id));
      if (index >= 0) state.selectedItems.splice(index, 1);
      else state.selectedItems.push(anime);
      card.classList.toggle("selected", index < 0);
      updatePreview();
      return;
    }
    document.querySelectorAll(".ost-nominee-card").forEach(item => item.classList.remove("selected"));
    card.classList.add("selected");
    state.selectedWinner = anime;
    document.getElementById("step2-award-btn").disabled = false;
  }

  function updatePreview() {
    if (state.step === 1) NominateCommon.syncCandidateSelection(state.selectedItems);
    const preview = document.getElementById("preview-box");
    preview.replaceChildren();
    if (!state.selectedItems.length) {
      const empty = document.createElement("div");
      empty.className = "ost-preview-empty";
      empty.textContent = "후보를 선택해주세요";
      preview.appendChild(empty);
    }
    state.selectedItems.forEach(anime => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "preview-item";
      const title = document.createElement("span");
      title.className = "preview-title";
      title.textContent = anime.title;
      const subtitle = document.createElement("span");
      subtitle.className = "preview-subtitle";
      subtitle.textContent = anime.quarter || "";
      item.append(title, subtitle);
      item.onclick = () => {
        state.selectedItems = state.selectedItems.filter(candidate => String(candidate.id) !== String(anime.id));
        updatePreview();
        renderStep1(document.getElementById("search-input").value);
      };
      preview.appendChild(item);
    });
    document.getElementById("step1-next-btn").disabled = !state.selectedItems.length;
  }

  function setVisible(id, visible) {
    document.getElementById(id).classList.toggle("hidden", !visible);
  }

  function goStep2() {
    state.step = 2;
    ["nav-home-btn", "step1-next-btn"].forEach(id => setVisible(id, false));
    ["step2-back-btn", "step2-award-btn"].forEach(id => setVisible(id, true));
    document.querySelector(".search-container").classList.add("hidden");
    document.getElementById("preview-box").classList.add("hidden");
    const left = document.getElementById("left-area");
    left.replaceChildren();
    const heading = document.createElement("h2");
    heading.className = "ost-step-heading";
    heading.textContent = "최종 후보를 선택하세요";
    const grid = document.createElement("div");
    grid.id = "step2-grid";
    state.selectedItems.forEach(anime => grid.appendChild(createCard(anime)));
    left.append(heading, grid);
    window.NominateCommon.applyVoteBadges();
  }

  function goStep1() {
    state.step = 1;
    state.selectedWinner = null;
    ["nav-home-btn", "step1-next-btn"].forEach(id => setVisible(id, true));
    ["step2-back-btn", "step2-award-btn"].forEach(id => setVisible(id, false));
    document.querySelector(".search-container").classList.remove("hidden");
    document.getElementById("preview-box").classList.remove("hidden");
    document.getElementById("step2-award-btn").disabled = true;
    document.getElementById("search-input").value = "";
    renderStep1();
  }

  function saveWinner() {
    const winner = state.selectedWinner;
    if (!winner) return;
    ResultStorage.saveOne(state.awardName, {
      title: winner.title,
      thumbnail: winner.thumbnail,
      composer: winner.composers
    });
    document.getElementById("modal-img").src = imagePath(winner.thumbnail);
    document.getElementById("modal-title").textContent = winner.title;
    document.getElementById("modal-quarter").textContent = winner.quarter || "-";
    document.getElementById("modal-composer").textContent = winner.composers.join(", ") || "정보 없음";
    document.getElementById("modal-award-name").textContent = state.awardName;
    document.getElementById("winner-modal").classList.remove("hidden");
    window.NominateCommon.fireConfetti();
    if (window.submitSingleAwardToDB) window.submitSingleAwardToDB(state.awardName);
  }

  document.getElementById("search-input").addEventListener("input", event => {
    const query = event.target.value;
    renderStep1(query);
    const suggestions = document.getElementById("autocomplete-list");
    suggestions.replaceChildren();
    if (!query) return;
    eligibleWorks.filter(anime => anime.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5).forEach(anime => {
      const option = document.createElement("div");
      option.textContent = anime.title;
      option.onclick = () => {
        event.target.value = anime.title;
        suggestions.replaceChildren();
        renderStep1(anime.title);
      };
      suggestions.appendChild(option);
    });
  });
  document.getElementById("step1-next-btn").onclick = goStep2;
  document.getElementById("step2-back-btn").onclick = goStep1;
  document.getElementById("step2-award-btn").onclick = saveWinner;
  document.getElementById("nav-home-btn").onclick = () => { location.href = "../index.html"; };
  document.getElementById("go-main-btn").onclick = () => { location.href = "../index.html"; };
  document.getElementById("ost-modal-close").onclick = () => document.getElementById("ost-listen-modal").classList.add("hidden");
  document.getElementById("ost-listen-modal").addEventListener("click", event => {
    if (event.target.id === "ost-listen-modal") event.currentTarget.classList.add("hidden");
  });
  window.NominateCommon.waitForFirebaseAndListen(() => state.awardName);
  updatePreview();
  renderStep1();
})();
