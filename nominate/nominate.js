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

renderDefaultTheme();
restoreState();
