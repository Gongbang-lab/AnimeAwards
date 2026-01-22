/**
 * 캐릭터 노미네이트 상태 관리
 */
const charState = {
  step: 1,
  theme: null,        // character_male | character_female
  currentAward: { name: "" },
  selectedItems: [],  // 선택된 캐릭터 객체들
  finalWinner: null   // 최종 수상 캐릭터
};

/**
 * 1. 초기 실행 및 데이터 로드
 */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  charState.theme = params.get("theme")
  charState.currentAward.name = params.get("awardName") || "올해의 캐릭터상";

  renderStep1();
  bindButtons();
});

/**
 * 2. Step 1: 3단 아코디언 렌더링 (분기 -> 요일 -> 애니메이션)
 */
function renderStep1() {
  const left = document.getElementById("left-area");
  if (!left) return;

  left.innerHTML = `<h2 class="step-title">${charState.currentAward.name} 후보 선택</h2>`;

  const data = CharacterData[charState.theme];
  
  // 데이터 그룹화: 분기 -> 요일 -> 애니메이션
  const grouped = groupByHierarchy(data);

  Object.entries(grouped).forEach(([quarter, days]) => {
    const qSection = createAccordion(quarter, "quarter-btn");
    const qContent = qSection.querySelector(".accordion-content");

    Object.entries(days).forEach(([day, animes]) => {
      const dSection = createAccordion(DAY_LABELS[day] || day, "day-btn");
      const dContent = dSection.querySelector(".accordion-content");

      Object.entries(animes).forEach(([animeTitle, characters]) => {
        const aSection = createAnimeAccordion(animeTitle, characters);
        dContent.appendChild(aSection);
      });

      qContent.appendChild(dSection);
    });

    left.appendChild(qSection);
  });
}

/**
 * 3단 아코디언 생성을 위한 유틸리티
 */
function createAccordion(title, btnClass) {
  const container = document.createElement("div");
  container.className = "accordion-wrapper";

  const btn = document.createElement("button");
  btn.className = btnClass;
  btn.textContent = title;

  const content = document.createElement("div");
  content.className = "accordion-content";
  content.style.display = "none";

  btn.onclick = () => {
    const isOpen = content.style.display === "block";
    content.style.display = isOpen ? "none" : "block";
    btn.classList.toggle("active", !isOpen);
  };

  container.append(btn, content);
  return container;
}

/**
 * 최하위 애니메이션 아코디언 (캐릭터 리스트 포함)
 */
function createAnimeAccordion(title, characters) {
  const container = document.createElement("div");
  container.className = "anime-accordion";

  const head = document.createElement("div");
  head.className = "anime-head";
  head.textContent = title;

  const list = document.createElement("div");
  list.className = "char-pick-grid";

  characters.forEach(char => {
    const item = document.createElement("div");
    item.className = "char-pick-item";
    if (charState.selectedItems.some(s => s.id === char.id)) item.classList.add("selected");

    item.innerHTML = `
      <img src="${char.thumbnail}" alt="${char.name}">
      <span>${char.name}</span>
    `;

    item.onclick = () => {
      const exists = charState.selectedItems.some(s => s.id === char.id);
      if (exists) {
        charState.selectedItems = charState.selectedItems.filter(s => s.id !== char.id);
        item.classList.remove("selected");
      } else {
        charState.selectedItems.push(char);
        item.classList.add("selected");
      }
      updatePreview();
    };
    list.appendChild(item);
  });

  container.append(head, list);
  return container;
}

/**
 * 3. Step 1 Preview 업데이트
 */
function updatePreview() {
  const previewList = document.getElementById("preview-list");
  const nextBtn = document.getElementById("step1-next-btn");
  if (!previewList) return;

  previewList.innerHTML = "";
  charState.selectedItems.forEach(char => {
    const div = document.createElement("div");
    div.className = "preview-chip"; // 둥근 칩 형태
    div.innerHTML = `<span>${char.name}</span>`;
    div.onclick = () => {
      charState.selectedItems = charState.selectedItems.filter(s => s.id !== char.id);
      renderStep1(); // 좌측 상태 동기화
      updatePreview();
    };
    previewList.appendChild(div);
  });

  nextBtn.disabled = charState.selectedItems.length === 0;
}

/**
 * 4. Step 2: 세로형 카드 UI 렌더링
 */
function goStep2() {
  charState.step = 2;
  toggleUI();

  const left = document.getElementById("left-area");
  left.innerHTML = `<h2 class="step-title">최종 투표</h2><div class="char-grid"></div>`;
  const grid = left.querySelector(".char-grid");

  charState.selectedItems.forEach(char => {
    const card = document.createElement("div");
    card.className = "char-card-vertical";
    card.innerHTML = `
      <div class="card-thumb"><img src="${char.thumbnail}"></div>
      <div class="card-body">
        <div class="anime-label">${char.animeTitle}</div>
        <div class="char-name">${char.name}</div>
        <div class="char-cv">CV. ${char.cv}</div>
      </div>
    `;

    card.onclick = () => {
      document.querySelectorAll(".char-card-vertical").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      charState.finalWinner = char;
      document.getElementById("step2-award-btn").disabled = false;
    };
    grid.appendChild(card);
  });
}

/**
 * 5. 기타 유틸리티 함수들
 */
function groupByHierarchy(data) {
  const grouped = {};
  data.forEach(item => {
    if (!grouped[item.quarter]) grouped[item.quarter] = {};
    if (!grouped[item.quarter][item.day]) grouped[item.quarter][item.day] = {};
    if (!grouped[item.quarter][item.day][item.animeTitle]) {
      grouped[item.quarter][item.day][item.animeTitle] = [];
    }
    grouped[item.quarter][item.day][item.animeTitle].push(item);
  });
  return grouped;
}

function toggleUI() {
  const s1 = document.getElementById("step1-buttons");
  const s2 = document.getElementById("step2-buttons");
  const pre = document.getElementById("step1-preview");

  if (charState.step === 1) {
    s1.style.display = "flex"; s2.style.display = "none";
    if (pre) pre.style.display = "flex";
  } else {
    s1.style.display = "none"; s2.style.display = "flex";
    if (pre) pre.style.display = "none";
  }
}

function bindButtons() {
  document.getElementById("step1-next-btn").onclick = goStep2;
  document.getElementById("step2-back-btn").onclick = () => {
    charState.step = 1;
    toggleUI();
    renderStep1();
  };
  document.getElementById("step2-award-btn").onclick = openAwardPopup;
  document.getElementById("step1-back-btn").onclick = () => location.href = "../main/main.html";
}

function openAwardPopup() {
  const winner = charState.finalWinner;
  const popup = document.getElementById("winner-popup");
  document.getElementById("winner-thumb").src = winner.thumbnail;
  document.getElementById("winner-title").textContent = `🏆 ${winner.name} (${winner.animeTitle})`;
  popup.style.display = "flex";
  
  // 로컬스토리지 저장
  const res = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
  res[charState.currentAward.name] = { title: winner.name, thumbnail: winner.thumbnail };
  localStorage.setItem("anime_awards_result", JSON.stringify(res));
}