// 상태 관리
const nominateState = {
  step: 1,
  theme: null,
  currentAward: { name: "TOP 3 Selection" }, // 기본값
  selectedItems: [], // Step 1에서 고른 후보군
  selectedTop3: []   // Step 2에서 고른 [우수상, 최우수상, 대상]
};

// 상 순서 정의
const RANK_NAMES = ["우수상", "최우수상", "대상"];

// 데이터 매핑용 상수
const DAY_LABELS = {
  "Mondays": "월요일", "Tuesdays": "화요일", "Wednesdays": "수요일",
  "Thursdays": "목요일", "Fridays": "금요일", "Saturdays": "토요일",
  "Sundays": "일요일", "Anomaly": "변칙/기타", "Web": "웹"
};
const DAY_KEYS = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"];
const QUARTER_MAP = { "Q1": "1분기", "Q2": "2분기", "Q3": "3분기", "Q4": "4분기" };

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const awardName = params.get("awardName");
  if (awardName) nominateState.currentAward.name = awardName;
  document.getElementById("award-title").textContent = nominateState.currentAward.name;

  renderStep1();
  bindStaticButtons();
});

// 버튼 이벤트 바인딩
function bindStaticButtons() {
  // Step 1
  document.getElementById("step1-back-btn").onclick = () => location.href = "../main/main.html";
  document.getElementById("step1-next-btn").onclick = () => {
    if (nominateState.selectedItems.length >= 3) {
      goStep2();
    } else {
      alert("최소 3개 이상의 작품을 후보로 선택해주세요.");
    }
  };

  // Step 2
  document.getElementById("step2-back-btn").onclick = () => {
    nominateState.step = 1;
    toggleStepUI();
    renderStep1();
  };
  
  // 수상 버튼 (Top 3 결정 완료)
  document.getElementById("step2-award-btn").onclick = showWinnerPopup;

  // 팝업 닫기/저장
  document.getElementById("go-main-btn").onclick = () => {
    saveAwardResult();
    location.href = "../main/main.html";
  };
}

// ---------------------------------------------------------
// STEP 1: 후보군 추리기 (기존 로직 유지)
// ---------------------------------------------------------
function renderStep1() {
  const left = document.getElementById("left-area");
  left.innerHTML = "";
  
  const title = document.createElement("h2");
  title.className = "step-title";
  title.textContent = "1단계: 후보 리스트 선택";
  left.appendChild(title);

  renderAnimeList(left);
  updateStep1Preview();
}

function renderAnimeList(parent) {
  Object.keys(AnimeByQuarter).sort().forEach((quarterKey) => {
    const animeList = AnimeByQuarter[quarterKey];
    const quarterSection = document.createElement("div");
    quarterSection.className = "quarter-section";

    const quarterBtn = document.createElement("button");
    quarterBtn.className = "quarter-btn";
    quarterBtn.textContent = QUARTER_MAP[quarterKey] || quarterKey;

    const quarterContent = document.createElement("div");
    quarterContent.className = "quarter-content";
    quarterContent.style.display = "none";

    quarterBtn.onclick = () => {
      const isVisible = quarterContent.style.display === "block";
      quarterContent.style.display = isVisible ? "none" : "block";
      quarterBtn.classList.toggle("active", !isVisible);
    };

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
        const isVisible = dayList.style.display === "block";
        dayList.style.display = isVisible ? "none" : "block";
        dayBtn.classList.toggle("active", !isVisible);
      };

      dayAnimes.forEach(anime => {
        const li = document.createElement("li");
        li.className = "anime-item";
        li.textContent = anime.title;
        
        if (nominateState.selectedItems.some(a => a.id === anime.id)) {
          li.classList.add("selected");
        }

        li.onclick = () => {
          const exists = nominateState.selectedItems.some(a => a.id === anime.id);
          if (exists) {
            nominateState.selectedItems = nominateState.selectedItems.filter(a => a.id !== anime.id);
            li.classList.remove("selected");
          } else {
            nominateState.selectedItems.push(anime);
            li.classList.add("selected");
          }
          updateStep1Preview();
        };
        dayList.appendChild(li);
      });

      daySection.appendChild(dayBtn);
      daySection.appendChild(dayList);
      quarterContent.appendChild(daySection);
    });

    quarterSection.appendChild(quarterBtn);
    quarterSection.appendChild(quarterContent);
    parent.appendChild(quarterSection);
  });
}

function updateStep1Preview() {
  const preview = document.getElementById("preview-list");
  const nextBtn = document.getElementById("step1-next-btn");
  preview.innerHTML = "";

  if (nominateState.selectedItems.length === 0) {
    nextBtn.disabled = true;
    return;
  }

  nominateState.selectedItems.forEach(anime => {
    const div = document.createElement("div");
    div.className = "preview-item";
    div.textContent = anime.title;
    div.onclick = () => {
      // 미리보기에서 클릭 시 삭제
      nominateState.selectedItems = nominateState.selectedItems.filter(a => a.title !== anime.title);
      renderStep1(); // 왼쪽 리스트 동기화
    };
    preview.appendChild(div);
  });
  
  // 3개 이상 선택해야 넘어갈 수 있게 설정
  nextBtn.disabled = nominateState.selectedItems.length < 3;
}

// ---------------------------------------------------------
// STEP 2: TOP 3 선정 (카드 UI 변경됨)
// ---------------------------------------------------------
function goStep2() {
  nominateState.step = 2;
  nominateState.selectedTop3 = []; // 초기화

  toggleStepUI();
  updateStep2Status();

  const left = document.getElementById("left-area");
  left.innerHTML = "";
  renderStep2Cards(left);
}

function renderStep2Cards(parent) {
  const title = document.createElement("h2");
  title.className = "step-title";
  title.textContent = "2단계: 수상작 선정 (우수상 → 최우수상 → 대상 순)";
  parent.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "step2-grid";

  nominateState.selectedItems.forEach(anime => {
    // 요청하신 카드 디자인 구조 생성
    const card = document.createElement("div");
    card.className = "card"; // 요청된 클래스명 사용

    // 이미지 경로 처리
    const imgPath = `../${anime.thumbnail}`;

    card.innerHTML = `
      <div class="card-thumb-wrapper">
        <img src="${imgPath}" 
             onerror="this.onerror=null; this.src='https://placehold.co/400x600/2f3542/ffffff?text=No+Image'" 
             alt="${anime.title}" />
        <div class="rank-overlay"></div> </div>
      <div class="card-info">
        <div class="card-title">${anime.title}</div>
        <div class="card-adaptor">${anime.studio || '제작사 정보 없음'}</div>
      </div>
    `;

    // 클릭 이벤트
    card.onclick = () => handleCardClick(card, anime);

    grid.appendChild(card);
  });

  parent.appendChild(grid);
}

function handleCardClick(cardElement, animeData) {
  const top3 = nominateState.selectedTop3;
  const index = top3.findIndex(item => item.id === animeData.id);

  if (index !== -1) {
    // 이미 선택된 카드 클릭 -> 선택 해제
    top3.splice(index, 1);
  } else {
    // 선택되지 않은 카드 클릭 -> 추가 (최대 3개)
    if (top3.length < 3) {
      top3.push(animeData);
    } else {
      alert("이미 3개의 작품을 모두 선정했습니다.\n변경하려면 기존 선택을 해제하세요.");
      return;
    }
  }

  // UI 갱신 (모든 카드의 상태 업데이트)
  updateCardsUI();
  updateStep2Status();
}

function updateCardsUI() {
  const cards = document.querySelectorAll(".card");
  const top3 = nominateState.selectedTop3;

  // 카드 DOM과 데이터 매칭 (제목이나 이미지 src 등을 이용해 매칭)
  cards.forEach(card => {
    const title = card.querySelector(".card-title").textContent;
    const selectedIndex = top3.findIndex(item => item.title === title);
    const overlay = card.querySelector(".rank-overlay");

    if (selectedIndex !== -1) {
      card.classList.add("selected");
      // 순서에 따른 텍스트 표시 (0: 우수상, 1: 최우수상, 2: 대상)
      overlay.textContent = RANK_NAMES[selectedIndex];
      overlay.style.opacity = "1";
    } else {
      card.classList.remove("selected");
      overlay.textContent = "";
      overlay.style.opacity = "0";
    }
  });

  // 버튼 활성화 체크
  const awardBtn = document.getElementById("step2-award-btn");
  awardBtn.disabled = top3.length !== 3;
}

function updateStep2Status() {
  const top3 = nominateState.selectedTop3;
  
  for (let i = 0; i < 3; i++) {
    const li = document.getElementById(`rank-${i+1}`);
    const textSpan = li.querySelector(".text");
    
    if (top3[i]) {
      li.classList.remove("empty");
      li.classList.add("filled");
      textSpan.textContent = top3[i].title;
    } else {
      li.classList.remove("filled");
      li.classList.add("empty");
      textSpan.textContent = "선택 대기...";
    }
  }
}

// ---------------------------------------------------------
// UI 유틸리티
// ---------------------------------------------------------
function toggleStepUI() {
  const step1Btns = document.getElementById("step1-buttons");
  const step2Btns = document.getElementById("step2-buttons");
  const step1Preview = document.getElementById("step1-preview");
  const step2Status = document.getElementById("step2-status");

  if (nominateState.step === 1) {
    step1Btns.style.display = "flex";
    step2Btns.style.display = "none";
    step1Preview.style.display = "flex";
    step2Status.style.display = "none";
  } else {
    step1Btns.style.display = "none";
    step2Btns.style.display = "flex";
    step1Preview.style.display = "none";
    step2Status.style.display = "block";
  }
}

// ---------------------------------------------------------
// 결과 팝업 및 저장
// ---------------------------------------------------------
function showWinnerPopup() {
  if (nominateState.selectedTop3.length !== 3) return;

  const container = document.getElementById("winners-container");
  container.innerHTML = "";

  // 우수상, 최우수상, 대상 순으로 카드 생성
  nominateState.selectedTop3.forEach((anime, index) => {
    const rankName = RANK_NAMES[index];
    const item = document.createElement("div");
    item.className = "winner-item";
    
    // 대상인 경우 강조 클래스
    if (index === 2) item.classList.add("grand-prize");

    item.innerHTML = `
      <div class="winner-badge">${rankName}</div>
      <img src="../${anime.thumbnail}" onerror="this.src='https://placehold.co/200x300?text=No+Img'" />
      <div class="winner-title">${anime.title}</div>
    `;
    container.appendChild(item);
  });

  const popup = document.getElementById("winner-popup");
  popup.style.display = "flex";
  setTimeout(() => popup.classList.add("active"), 10);
  
  fireConfetti();
}

function saveAwardResult() {
  const currentResults = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
  const awardName = nominateState.currentAward.name;
  
  // 3개의 데이터를 배열로 저장
  // 구조: { 0: {title, thumb}, 1: {title, thumb}, 2: {title, thumb} } 혹은 배열
  const resultData = nominateState.selectedTop3.map((anime, idx) => ({
    rank: RANK_NAMES[idx],
    title: anime.title,
    thumbnail: `../${anime.thumbnail}`
  }));

  currentResults[awardName] = resultData;
  localStorage.setItem("anime_awards_result", JSON.stringify(currentResults));
}

// 폭죽 효과
function fireConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;
  const colors = ['#ffd700', '#ffffff', '#ff0000'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}