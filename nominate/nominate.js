// URL에서 awardId 가져오기
const params = new URLSearchParams(window.location.search);
const awardId = Number(params.get("awardId"));

// 상 데이터에서 찾기 (awardData.js가 먼저 로드되어야 함)
const award = Awards.find(a => a.id === awardId);

// h1 요소 가져오기
const awardTitleEl = document.getElementById("award-title");

// 화면 & 탭 제목 설정
awardTitleEl.textContent = `${award.name} 노미네이트`;
document.title = `${award.name} | Anime Awards`;

//영역
const bottomArea = document.getElementById("bottom-area");
const nomineeArea = document.getElementById("nominee-area");
const winnerArea = document.getElementById("winner-area");

const DAY_KEYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Ano','Web'];
const selectedSet = new Set();

const DAY_LABELS = {
  Mon: '월요일',
  Tue: '화요일',
  Wed: '수요일',
  Thu: '목요일',
  Fri: '금요일',
  Sat: '토요일',
  Sun: '일요일',
  Ano: '변칙편성',
  Web: '웹편성'
};
//기본 테마 랜더링
function renderDefaultTheme() {
  const bottomArea = document.getElementById("bottom-area");
  bottomArea.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "올해의 애니메이션 리스트";
  bottomArea.appendChild(title);

  Object.entries(AnimeByQuarter).forEach(([quarter, animeList]) => {

    // ─── 분기 섹션 ─────────────────────
    const quarterSection = document.createElement("div");
    quarterSection.className = "quarter-section";

    const quarterBtn = document.createElement("button");
    quarterBtn.className = "quarter-btn";
    quarterBtn.textContent = quarter;

    const quarterContent = document.createElement("div");
    quarterContent.className = "quarter-content";
    quarterContent.style.display = "none";

    quarterBtn.onclick = () => {
      const open = quarterContent.style.display === "block";
      quarterContent.style.display = open ? "none" : "block";
      quarterBtn.classList.toggle("active", !open);
    };

    // ─── 요일 섹션 ─────────────────────
    DAY_KEYS.forEach(dayKey => {
      const dayAnimes = animeList.filter(a => a.day === dayKey);
      if (dayAnimes.length === 0) return;

      const daySection = document.createElement("div");
      daySection.className = "day-section";

      const dayBtn = document.createElement("button");
      dayBtn.className = "day-btn";
      dayBtn.textContent = DAY_LABELS[dayKey];

      const dayList = document.createElement("ul");
      dayList.className = "anime-list";
      dayList.style.display = "none";

      dayBtn.onclick = () => {
      const open = dayList.style.display === "block";
      dayList.style.display = open ? "none" : "block";
      dayBtn.classList.toggle("active", !open);
      };


      // ─── 애니메이션 텍스트 ────────────
      dayAnimes.forEach(anime => {
        const li = document.createElement("li");
        li.className = "anime-item";
        li.textContent = anime.title;

        li.onclick = () => toggleSelectAnime(anime, li);


        dayList.appendChild(li);
      });

      daySection.appendChild(dayBtn);
      daySection.appendChild(dayList);
      quarterContent.appendChild(daySection);
    });

    quarterSection.appendChild(quarterBtn);
    quarterSection.appendChild(quarterContent);
    bottomArea.appendChild(quarterSection);
  });
}
function addNominee(anime) {
  // 중복 방지
  if ([...nomineeArea.children].some(c => c.dataset.id == anime.id)) return;

  selectedSet.add(anime.id);

  const card = document.createElement("div");
  card.className = "nominee-card";
  card.dataset.id = anime.id;

  card.innerHTML = `
    <div class="thumb">
      <img src="${anime.thumbnail || 'images/no-image.png'}" alt="${anime.title}">
    </div>
    <div class="title">${anime.title}</div>
  `;

  // 카드 클릭 → 수상 후보 선택
  card.addEventListener("click", () => {
    selectWinner(anime);
  });

  nomineeArea.appendChild(card);

   // ✅ localStorage 저장
  saveNominees();
}
function saveNominees() {
  localStorage.setItem(
    `nominees_${awardId}`,
    JSON.stringify([...selectedSet])
  );
}
function toggleSelectAnime(anime, element) {
  if (selectedSet.has(anime.id)) {
    // 선택 해제
    selectedSet.delete(anime.id);
    element.classList.remove("selected");

    // 중위 카드 제거
    const nomineeArea = document.getElementById("nominee-area");
    const card = nomineeArea.querySelector(`[data-id="${anime.id}"]`);
    if (card) card.remove();

  } else {
    // 선택
    selectedSet.add(anime.id);
    element.classList.add("selected");

    addNominee(anime);

    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}
function selectWinner(anime) {
  // 상위 영역 카드 표시
  winnerArea.innerHTML = "";

  const card = document.createElement("div");
  card.className = "winner-card";

  card.innerHTML = `
    <div class="thumb">
      <img src="${anime.thumbnail}" />
    </div>
    <div class="title">${anime.title}</div>
  `;

  winnerArea.appendChild(card);

  // ✅ localStorage 저장
  const key = `winner_${awardId}`;
  localStorage.setItem(
    key,
    JSON.stringify({
      animeId: anime.id,
      title: anime.title,
      thumbnail: anime.thumbnail
    })
  );
}
document.getElementById("back-btn").onclick = () => {
  location.href = "../main.html"; // main.html 경로에 맞게 조정
};
function restoreState() {
  if (award.theme !== "default") return;
  // 1️⃣ 노미네이트 복원
  const nomineeData = localStorage.getItem(`nominees_${awardId}`);
  if (nomineeData) {
    const ids = JSON.parse(nomineeData);

    ids.forEach(id => {
      const anime = findAnimeById(id);
      if (anime) addNominee(anime);
    });
  }

  // 2️⃣ 수상자 복원
  const winnerData = localStorage.getItem(`winner_${awardId}`);
  if (winnerData) {
    const anime = JSON.parse(winnerData);
    selectWinner(anime);
  }
}
function findAnimeById(id) {
  for (const list of Object.values(AnimeByQuarter)) {
    const found = list.find(a => a.id === id);
    if (found) return found;
  }
  return null;
}
//병합 유틸 함수
function findAnimeInfo(animeId) {
  for (const list of Object.values(AnimeByQuarter)) {
    const found = list.find(anime => anime.id === animeId);
    if (found) return found;
  }
  return null;
}
function mergeMusicSource(source, type) {
  const result = [];

  Object.entries(source).forEach(([quarter, songs]) => {
    songs.forEach(song => {
      const anime = findAnimeInfo(song.animeId);

      result.push({
        ...song,
        type,
        quarter,
        animeTitle: anime?.title || "Unknown",
        day: anime?.day || "Unknown"
      });
    });
  });

  return result;
}
function getMusicByTheme(theme) {
  switch (theme) {
    case "opening":
      return mergeMusicSource(AnimeOpeningSongs, "OP");
    case "ending":
      return mergeMusicSource(AnimeEndingSongs, "ED");
    case "ost":
      return mergeMusicSource(AnimeOSTSongs, "OST");
    default:
      return [];
  }
}

//음악 그룹화 유틸
function groupMusicByQuarterAndDay(musicList) {
  const result = {};

  musicList.forEach(item => {
    if (!result[item.quarter]) result[item.quarter] = {};
    if (!result[item.quarter][item.day]) result[item.quarter][item.day] = [];

    result[item.quarter][item.day].push(item);
  });

  return result;
}
function renderMusicTheme(theme) {
  const bottomArea = document.getElementById("bottom-area");
  bottomArea.innerHTML = "";

  let musicList = [];

  if (theme === "opening") {
    musicList = mergeMusicSource(AnimeOpeningSongs, "OP");
  } else if (theme === "ending") {
    musicList = mergeMusicSource(AnimeEndingSongs, "ED");
  } else if (theme === "ost") {
    musicList = mergeMusicSource(AnimeOSTSongs, "OST");
  }

  const grouped = groupMusicByQuarterAndDay(musicList);

  Object.entries(grouped).forEach(([quarter, days]) => {

    const quarterSection = document.createElement("div");
    quarterSection.className = "quarter-section";

    const quarterBtn = document.createElement("button");
    quarterBtn.className = "quarter-btn";
    quarterBtn.textContent = quarter;

    const quarterContent = document.createElement("div");
    quarterContent.className = "quarter-content";
    quarterContent.style.display = "none";

    quarterBtn.onclick = () => {
      const open = quarterContent.style.display === "block";
      quarterContent.style.display = open ? "none" : "block";
    };

    DAY_KEYS.forEach(dayKey => {
      const songs = days[dayKey];
      if (!songs) return;

      const daySection = document.createElement("div");
      daySection.className = "day-section";

      const dayBtn = document.createElement("button");
      dayBtn.className = "day-btn";
      dayBtn.textContent = DAY_LABELS[dayKey];

      const songList = document.createElement("ul");
      songList.className = "music-list";
      songList.style.display = "none";

      dayBtn.onclick = () => {
        const open = songList.style.display === "block";
        songList.style.display = open ? "none" : "block";
      };

      songs.forEach(song => {
        const li = document.createElement("li");
        li.className = "music-item";

        li.innerHTML = `
          <span class="type ${song.type}">${song.type}</span>
          <div class="music-text">
            <div class="anime-title">${song.animeTitle}</div>
            <div class="song-title">${song.title} – ${song.singer}</div>
          </div>
          <button class="youtube-btn">▶</button>
        `;

        li.onclick = () => addMusicNominee(song);

        li.querySelector(".youtube-btn").onclick = (e) => {
          e.stopPropagation();
          window.open(song.youtube, "_blank");
        };

        songList.appendChild(li);
      });

      daySection.append(dayBtn, songList);
      quarterContent.appendChild(daySection);
    });

    quarterSection.append(quarterBtn, quarterContent);
    bottomArea.appendChild(quarterSection);
  });
}
function addMusicNominee(song) {
  const nomineeArea = document.getElementById("nominee-area");

  if ([...nomineeArea.children].some(c => c.dataset.id == song.id)) return;

  const card = document.createElement("div");
  card.className = "nominee-card music";
  card.dataset.id = song.id;

  const thumb = getYoutubeThumb(song.youtube);

  card.innerHTML = `
    <div class="thumb">
      <img 
        src="${thumb.max}" 
        onerror="this.onerror=null; this.src='${thumb.hq}'"
      />
      <div class="overlay">
        <button class="youtube-btn">▶</button>
      </div>
    </div>
    <div class="info">
      <div class="anime-title">${song.animeTitle}</div>
      <div class="song-title">${song.title}</div>
      <div class="singer">${song.singer}</div>
    </div>
  `;


  /* 🔥 카드 클릭 → 상위로 */
  card.onclick = () => selectMusicWinner(song);

  /* 🔥 유튜브 버튼 클릭 */
  card.querySelector(".youtube-btn").onclick = (e) => {
    e.stopPropagation(); // 상위 클릭 방지
    window.open(song.youtube, "_blank");
  };

  nomineeArea.appendChild(card);
}
function getYoutubeThumb(url) {
  const id = getYoutubeId(url);
  if (!id) return null;

  return {
    max: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    hq:  `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  };
}
function selectMusicWinner(song) {
  winnerArea.innerHTML = "";

  const card = document.createElement("div");
  card.className = "winner-card music";

const thumb = getYoutubeThumb(song.youtube);

card.innerHTML = `
  <div class="thumb">
    <img 
      src="${thumb.max}" 
      onerror="this.onerror=null; this.src='${thumb.hq}'"
    />
    <div class="overlay">
      <button class="youtube-btn">▶</button>
    </div>
  </div>
  <div class="info">
    <div class="anime-title">${song.animeTitle}</div>
    <div class="song-title">${song.title}</div>
    <div class="singer">${song.singer}</div>
  </div>
`;


  winnerArea.appendChild(card);

  localStorage.setItem(
    `winner_${awardId}`,
    JSON.stringify(song)
  );
}
function getYoutubeId(url) {
  if (!url) return null;

  // youtu.be/VIDEO_ID
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1].split("?")[0];
  }

  // youtube.com/watch?v=VIDEO_ID
  if (url.includes("watch?v=")) {
    return url.split("v=")[1].split("&")[0];
  }

  return null;
}

//애니메이션 캐릭터
function getAnimeById(id) {
  for (const list of Object.values(AnimeByQuarter)) {
    const found = list.find(a => a.id === id);
    if (found) return found;
  }
  return null;
}
//캐릭터 병함 유틸
function findAnimeInfo(animeId) {
  for (const list of Object.values(AnimeByQuarter)) {
    const found = list.find(a => a.id === animeId);
    if (found) return found;
  }
  return null;
}
function mergeCharacters(genderFilter = null) {
  return AnimeCharacters
    .filter(c => !genderFilter || c.gender === genderFilter)
    .map(c => {
      const anime = findAnimeInfo(c.animeId);

      return {
        ...c,
        animeTitle: anime?.title || "Unknown",
        quarter: anime?.quarter,
        day: anime?.day
      };
    });
}
//그룹화 유틸
function groupCharactersByQuarterAndDay(list) {
  const result = {};

  list.forEach(item => {
    if (!result[item.quarter]) result[item.quarter] = {};
    if (!result[item.quarter][item.day]) result[item.quarter][item.day] = [];

    result[item.quarter][item.day].push(item);
  });

  return result;
}
//캐릭터 아코디언 랜더링
function renderCharacterTheme() {
  const bottomArea = document.getElementById("bottom-area");
  bottomArea.innerHTML = "";

  const merged = mergeCharactersWithAnime();

  Object.entries(merged).forEach(([quarter, animeMap]) => {

    /* 분기 */
    const quarterSection = document.createElement("div");
    quarterSection.className = "quarter-section";

    const quarterBtn = document.createElement("button");
    quarterBtn.className = "quarter-btn";
    quarterBtn.textContent = quarter;

    const quarterContent = document.createElement("div");
    quarterContent.className = "quarter-content";
    quarterContent.style.display = "none";

    quarterBtn.onclick = () => {
      const open = quarterContent.style.display === "block";
      quarterContent.style.display = open ? "none" : "block";
      quarterBtn.classList.toggle("active", !open);
    };

    /* 애니메이션 */
    Object.values(animeMap).forEach(anime => {
      const animeSection = document.createElement("div");
      animeSection.className = "day-section";

      const animeBtn = document.createElement("button");
      animeBtn.className = "day-btn";
      animeBtn.textContent = anime.animeTitle;

      const charWrap = document.createElement("div");
      charWrap.className = "character-row";
      charWrap.style.display = "none";

      animeBtn.onclick = () => {
        const open = charWrap.style.display === "block";
        charWrap.style.display = open ? "none" : "flex";
        animeBtn.classList.toggle("active", !open);
      };

      /* 캐릭터 한 줄 */
      anime.characters.forEach(character => {
        const charBtn = document.createElement("div");
        charBtn.className = "character-chip";
        charBtn.textContent = character.name;

        charBtn.onclick = () =>
          toggleSelectCharacter(character, charBtn);

        charWrap.appendChild(charBtn);
      });

      animeSection.append(animeBtn, charWrap);
      quarterContent.appendChild(animeSection);
    });

    quarterSection.append(quarterBtn, quarterContent);
    bottomArea.appendChild(quarterSection);
  });
}
//캐릭터+애니메이션 병합유틸
function mergeCharactersWithAnime() {
  const result = {};

  Object.entries(AnimeCharacters).forEach(([quarter, chars]) => {
    result[quarter] = {};

    chars.forEach(char => {
      const anime = findAnimeById(char.animeId);
      if (!anime) return;

      if (!result[quarter][anime.id]) {
        result[quarter][anime.id] = {
          animeId: anime.id,
          animeTitle: anime.title,
          day: anime.day,
          characters: []
        };
      }

      result[quarter][anime.id].characters.push(char);
    });
  });

  return result;
}
//공통 아코디언 생성기
function createAccordionSection(title) {
  const section = document.createElement("div");
  section.className = "accordion-section";

  const btn = document.createElement("button");
  btn.className = "accordion-btn";
  btn.textContent = title;

  const content = document.createElement("div");
  content.className = "accordion-content";
  content.style.display = "none";

  btn.onclick = () => {
    const open = content.style.display === "block";
    content.style.display = open ? "none" : "block";
    btn.classList.toggle("active", !open);
  };

  section.append(btn, content);
  return { section, content };
}
function toggleSelectCharacter(char, element) {
  if (selectedSet.has(char.id)) {
    selectedSet.delete(char.id);
    element.classList.remove("selected");
    removeCharacterNominee(character.id);
  } else {
    selectedSet.add(char.id);
    element.classList.add("selected");
    addCharacterNominee(char);
  }
}
//중위 캐릭터 카드 생성
function addCharacterNominee(character) {
  const nomineeArea = document.getElementById("nominee-area");

  // 중복 방지
  if (nomineeArea.querySelector(`[data-id="${character.id}"]`)) return;

  const card = document.createElement("div");
  card.className = "nominee-card";
  card.dataset.id = character.id;

  card.innerHTML = `
    <div class="thumb">
      <img src="${character.thumbnail || 'images/no-image.png'}" />
    </div>
    <div class="title">${character.name}</div>
  `;

  // 🔥 중위 클릭 → 수상자 선정
  card.onclick = () => selectCharacterWinner(character);

  nomineeArea.appendChild(card);
}
function removeCharacterNominee(characterId) {
  const nomineeArea = document.getElementById("nominee-area");
  const card = nomineeArea.querySelector(`[data-id="${characterId}"]`);
  if (card) card.remove();
}
function selectCharacterWinner(character) {
  const winnerArea = document.getElementById("winner-area");
  winnerArea.innerHTML = "";

  const card = document.createElement("div");
  card.className = "winner-card";

  card.innerHTML = `
    <div class="thumb">
      <img src="${character.thumbnail}" />
    </div>
    <div class="title">${character.name}</div>
  `;

  winnerArea.appendChild(card);

  // ✅ localStorage 저장
  localStorage.setItem(
    `winner_${awardId}`,
    JSON.stringify({
      characterId: character.id,
      name: character.name,
      animeId: character.animeId,
      thumbnail: character.thumbnail
    })
  );
}

//캐릭터 병합 후 커플 데이터 생성 유틸
function getCharacterById(id) {
  for (const list of Object.values(AnimeCharacters)) {
    const found = list.find(c => c.id === id);
    if (found) return found;
  }
  return null;
}
function mergeCouples() {
  const result = {};

  Object.entries(AnimeCouples).forEach(([quarter, couples]) => {
    result[quarter] = [];

    couples.forEach(couple => {
      const c1 = getCharacterById(couple.characterIds[0]);
      const c2 = getCharacterById(couple.characterIds[1]);
      if (!c1 || !c2) return;

      const anime = findAnimeById(couple.animeId);

      result[quarter].push({
        id: couple.id,
        animeId: couple.animeId,
        animeTitle: anime?.title ?? "Unknown",
        characters: [c1, c2],
        isCustom: couple.isCustom
      });
    });
  });

  return result;
}
//커플 하위 어코디언 랜더링
function renderBestCoupleTheme() {
  const bottomArea = document.getElementById("bottom-area");
  bottomArea.innerHTML = "";

  const merged = mergeCouples();

  Object.entries(merged).forEach(([quarter, couples]) => {

    const quarterSection = document.createElement("div");
    quarterSection.className = "quarter-section";

    const quarterBtn = document.createElement("button");
    quarterBtn.className = "quarter-btn";
    quarterBtn.textContent = quarter;

    const quarterContent = document.createElement("div");
    quarterContent.className = "quarter-content";
    quarterContent.style.display = "none";

    quarterBtn.onclick = () => {
      const open = quarterContent.style.display === "block";
      quarterContent.style.display = open ? "none" : "block";
      quarterBtn.classList.toggle("active", !open);
    };

    /* 애니메이션별 그룹 */
    const animeGroup = {};

    couples.forEach(c => {
      if (!animeGroup[c.animeId]) {
        animeGroup[c.animeId] = {
          animeTitle: c.animeTitle,
          couples: []
        };
      }
      animeGroup[c.animeId].couples.push(c);
    });

    Object.values(animeGroup).forEach(group => {
      const animeSection = document.createElement("div");
      animeSection.className = "day-section";

      const animeBtn = document.createElement("button");
      animeBtn.className = "day-btn";
      animeBtn.textContent = group.animeTitle;

      const coupleWrap = document.createElement("div");
      coupleWrap.style.display = "none";
      coupleWrap.className = "couple-list";

      animeBtn.onclick = () => {
        const open = coupleWrap.style.display === "block";
        coupleWrap.style.display = open ? "none" : "block";
        animeBtn.classList.toggle("active", !open);
      };

      group.couples.forEach(couple => {
        const coupleCard = document.createElement("div");
        coupleCard.className = "couple-card";

        coupleCard.innerHTML = `
          <span>${couple.characters[0].name}</span>
          <span class="heart">❤️</span>
          <span>${couple.characters[1].name}</span>
        `;

        coupleCard.onclick = () =>
          toggleSelectCouple(couple, coupleCard);

        coupleWrap.appendChild(coupleCard);
      });

      /* + 버튼 */
      const addBtn = document.createElement("button");
      addBtn.className = "add-couple-btn";
      addBtn.textContent = "+ 커플 추가";
      addBtn.onclick = () =>
        openCouplePopup(group);

      coupleWrap.appendChild(addBtn);

      animeSection.append(animeBtn, coupleWrap);
      quarterContent.appendChild(animeSection);
    });

    quarterSection.append(quarterBtn, quarterContent);
    bottomArea.appendChild(quarterSection);
  });
}
let tempCouple = [];
//커플 생성 조건 로직
function selectCoupleCharacter(character) {
  // 1️⃣ 첫 선택
  if (tempCouple.length === 0) {
    tempCouple.push(character);
    return;
  }

  // 2️⃣ 같은 캐릭터 방지
  if (tempCouple[0].id === character.id) {
    alert("같은 캐릭터는 선택할 수 없습니다.");
    return;
  }

  // 3️⃣ 같은 애니메이션 제한
  if (tempCouple[0].animeId !== character.animeId) {
    alert("같은 애니메이션의 캐릭터만 선택할 수 있습니다.");
    return;
  }

  tempCouple.push(character);
  createCustomCouple();
}
//커스텀 커플 저장
function createCustomCouple() {
  const couple = {
    id: Date.now(),
    animeId: tempCouple[0].animeId,
    characterIds: [tempCouple[0].id, tempCouple[1].id],
    isCustom: true
  };

  const data = JSON.parse(
    localStorage.getItem("custom_couples") || "[]"
  );

  data.push(couple);
  localStorage.setItem("custom_couples", JSON.stringify(data));

  tempCouple = [];
  renderBestCoupleTheme();
}
document.getElementById("add-custom-couple-btn").onclick =
  openCustomCouplePopup;
//커스텀 커플 생성 즉시 중위로 올리기
function createCustomCouple() {
  const couple = {
    id: Date.now(),
    animeId: tempCouple[0].animeId,
    characterIds: [tempCouple[0].id, tempCouple[1].id],
    isCustom: true,
    autoNominated: true
  };

  saveCustomCouple(couple);

  /* 🔥 바로 중위로 */
  addNominateCouple(couple);

  tempCouple = [];
  closePopup();
}
//커스텀 커플 삭제 버튼
function renderNominateCoupleCard(couple) {
  const card = document.createElement("div");
  card.className = "nominate-couple-card";

  card.innerHTML = `
    <div class="remove-btn">×</div>
    ${renderCoupleThumbnail(couple)}
  `;

  card.querySelector(".remove-btn").onclick = e => {
    e.stopPropagation();
    removeCustomCouple(couple.id);
    card.remove();
  };

  return card;
}
//중위 couple 카드 전용 썸네일
function renderCoupleThumbnail(couple) {
  const [c1, c2] = couple.characters;

  return `
    <div class="couple-thumb">
      <img src="${c1.thumb}">
      <span class="heart">❤️</span>
      <img src="${c2.thumb}">
    </div>
  `;
}





const theme = award.theme;

switch (theme) {
  case "default":
    renderDefaultTheme();
    break;

  case "opening":
  case "ending":
  case "ost":
    renderMusicTheme(theme);
    break;
  case "character_male":
    renderCharacterTheme("male");
    break;
  case "character_female":
    renderCharacterTheme("female");
    break;
  case "best_couple":
    renderBestCoupleTheme(theme);
    break;

  default:
    renderDefaultTheme();
}

function routeByTheme(theme) {
  if (theme === "default") return renderDefaultTheme();
  if (["opening","ending","ost"].includes(theme))
    return renderMusicTheme(theme);
}

restoreState();
