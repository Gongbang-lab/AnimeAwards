/**
 * 캐릭터 노미네이트 상태 관리
 */
const charState = {
  step: 1,
  theme: null,        // character_male | character_female
  selectedItems: [],  // 선택된 캐릭터 목록 (Step 1)
  finalWinner: null,  // 최종 수상자 (Step 2)
  awardName: ""
};

// 매핑 데이터
const QUARTER_MAP = { "Q1": "1분기", "Q2": "2분기", "Q3": "3분기", "Q4": "4분기" };
const DAY_LABELS = {
  "Mondays": "월요일", "Tuesdays": "화요일", "Wednesdays": "수요일",
  "Thursdays": "목요일", "Fridays": "금요일", "Saturdays": "토요일",
  "Sundays": "일요일", "Anomaly": "변칙편성", "Web": "웹"
};

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  charState.theme = params.get("theme")
  charState.awardName = params.get("awardName")
  
  document.getElementById("modal-award-name").textContent = charState.awardName;

  // 데이터 준비
  const genderKey = charState.theme.includes("female") ? "female" : "male";
  const flatData = getNormalizedCharData(genderKey); // 전체 캐릭터 데이터
  if (genderKey === "female") {
    document.getElementById("step-title").textContent = "올해의 여우 주연상 부문";
  } else {
    document.getElementById("step-title").textContent = "올해의 남우 주연상 부문";
  }

  const modalAwardEl = document.getElementById("modal-award-name");
  if (modalAwardEl) {
    modalAwardEl.textContent = charState.awardName;
  }
  
  // 검색 기능 초기화 (전체 데이터를 넘겨줌)
  initSearch(flatData);

  renderStep1(flatData); // renderStep1 함수에 데이터를 인자로 전달하도록 구조를 살짝 변경하면 좋습니다.
  bindEvents();
});

/**
 * 1. Step 1 렌더링 (분기 -> 요일 -> 애니메이션 -> 캐릭터 카드)
 */
function renderStep1() {
  const left = document.getElementById("left-area");
  left.innerHTML = ""; 

  const genderKey = charState.theme.includes("female") ? "female" : "male";
  const flatData = getNormalizedCharData(genderKey);
  const hierarchy = groupByHierarchy(flatData);

  Object.entries(hierarchy).forEach(([qName, days]) => {
    // 1단계: 분기(Quarter)
    const qSection = document.createElement("div");
    qSection.className = "quarter-section";

    const qBtn = document.createElement("button");
    qBtn.className = "quarter-btn";
    qBtn.innerHTML = `<span>${QUARTER_MAP[qName] || qName}</span> <span>▼</span>`;
    
    const qContent = document.createElement("div");
    qContent.className = "quarter-content";
    qContent.style.display = "none";

    qBtn.onclick = () => {
        const isOpen = qContent.style.display === "block";
        qContent.style.display = isOpen ? "none" : "block";
        qBtn.classList.toggle("active", !isOpen);
        qBtn.querySelector("span:last-child").textContent = isOpen ? "▼" : "▲";
    };

    // 2단계: 요일(Day)
    Object.entries(days).forEach(([dName, animes]) => {
      const dBtn = document.createElement("button");
      dBtn.className = "day-btn";
      dBtn.innerHTML = `<span>${DAY_LABELS[dName] || dName}</span> <span>▼</span>`;

      const dContent = document.createElement("div");
      dContent.className = "day-content-wrapper"; // 요일 안의 애니메이션들을 감싸는 통
      dContent.style.display = "none";
      
      dBtn.onclick = () => {
        const isOpen = dContent.style.display === "block";
        dContent.style.display = isOpen ? "none" : "block";
        dBtn.classList.toggle("active", !isOpen);
        dBtn.querySelector("span:last-child").textContent = isOpen ? "▼" : "▲";
      };

      // 3단계: 애니메이션 제목(Anime Title) - 새로 추가된 아코디언
      Object.entries(animes).forEach(([aTitle, charList]) => {
        const aBtn = document.createElement("button");
        aBtn.className = "anime-btn";
        aBtn.innerHTML = `<span>${aTitle}</span> <span>▼</span>`;

        const aContent = document.createElement("div");
        aContent.className = "anime-content"; // 실제 카드 그리드

        aBtn.onclick = () => {
          aContent.classList.toggle("active");
          aBtn.classList.toggle("active");
          aBtn.querySelector("span:last-child").textContent = aContent.classList.contains("active") ? "▲" : "▼";
        };

        // 4단계: 캐릭터 카드
        charList.forEach(char => {
          const card = document.createElement("div");
          card.className = "card";
          card.dataset.charId = char.id;
          
          if (charState.selectedItems.some(s => s.id === char.id)) {
            card.classList.add("selected");
          }

          card.innerHTML = `
            <div class="card-badge">CV. ${char.cv}</div>
            <img src="${char.thumbnail}" alt="${char.name}" onerror="this.src='https://via.placeholder.com/200x280?text=No+Img'">
            <div class="card-info">
                <div class="card-title">${char.name}</div>
                <div class="card-studio">${char.animeTitle}</div>
            </div>
          `;

          card.onclick = (e) => {
            e.stopPropagation(); // 아코디언 버블링 방지
            toggleCandidate(char, card);
          };
          aContent.appendChild(card);
        });

        dContent.appendChild(aBtn);
        dContent.appendChild(aContent);
      });

      qContent.appendChild(dBtn);
      qContent.appendChild(dContent);
    });

    qSection.appendChild(qBtn);
    qSection.appendChild(qContent);
    left.appendChild(qSection);
  });
}

/**
 * 2. 후보 선택/해제 및 프리뷰
 */
function toggleCandidate(char, cardElement) {
  const idx = charState.selectedItems.findIndex(s => s.id === char.id);
  
  if (idx >= 0) {
    charState.selectedItems.splice(idx, 1);
    cardElement.classList.remove("selected");
  } else {
    charState.selectedItems.push(char);
    cardElement.classList.add("selected");
  }
  updatePreview();
}

function updatePreview() {
  const box = document.getElementById("preview-box");
  const nextBtn = document.getElementById("step1-next-btn");
  
  if (!box) return;
  box.innerHTML = "";

  if (charState.selectedItems.length === 0) {
    box.innerHTML = `<div style="color:#666; text-align:center; margin-top:20px;">선택된 후보가 없습니다.</div>`;
    nextBtn.disabled = true;
    return;
  }

  nextBtn.disabled = false;
  charState.selectedItems.forEach(char => {
    const item = document.createElement("div"); // span에서 div로 변경하여 block 처리
    item.className = "preview-item";
    item.innerHTML = `
        ${char.name}
        <br><small style="color:#888; font-size:0.75rem;">${char.animeTitle}</small>
    `;
    
    item.onclick = () => {
      // 삭제 로직
      charState.selectedItems = charState.selectedItems.filter(s => s.id !== char.id);
      
      // 메인 화면 카드 UI 체크 해제
      const targetCard = document.querySelector(`.card[data-char-id="${char.id}"]`);
      if (targetCard) targetCard.classList.remove("selected");
      
      updatePreview();
    };
    box.appendChild(item);
  });
}

/**
 * 3. Step 2 (최종 선택)
 */
function goStep2() {
    charState.step = 2;
    toggleUI(2);

    const previewBox = document.getElementById("preview-box");
    if (previewBox) previewBox.classList.add("hidden");

    const left = document.getElementById("left-area");

    // Step 2 컨테이너 생성 (타이틀 추가)
    left.innerHTML = `
        <h2 style="color:var(--gold); margin-bottom:20px; font-size: 1.5rem; text-align: left;">최종 수상작을 선택하세요</h2>
        <div id="step2-grid"></div>
    `;

    const grid = document.getElementById("step2-grid");

    charState.selectedItems.forEach(char => {
        const card = document.createElement("div");
        card.className = "step2-char-card"; // 전용 디자인 클래스 적용

        card.innerHTML = `
            <div class="card-badge">CV. ${char.cv}</div>
            <div class="card-thumb">
                <img src="${char.thumbnail}" alt="${char.name}" onerror="this.src='https://via.placeholder.com/200x280?text=No+Img'">
            </div>
            <div class="step2-card-info">
                <div class="card-title">${char.name}</div>
                <div class="card-studio">${char.animeTitle}</div>
            </div>
        `;
        
        card.onclick = () => selectFinalWinner(char, card);
        grid.appendChild(card);
    });
}

function selectFinalWinner(char, cardElement) {
    // 기존 .card 대신 .step2-char-card를 타겟팅
    document.querySelectorAll("#step2-grid .step2-char-card").forEach(c => c.classList.remove("selected"));
    cardElement.classList.add("selected");
    charState.finalWinner = char;
    document.getElementById("step2-award-btn").disabled = false;
}

function toggleUI(step) {
  const isStep1 = step === 1;
  const previewBox = document.getElementById("preview-box");
  
  if (isStep1) {
    previewBox.classList.remove("hidden");
  } else {
    previewBox.classList.add("hidden");
  }

  const toggle = (id, show) => {
      const el = document.getElementById(id);
      if(show) el.classList.remove("hidden");
      else el.classList.add("hidden");
  };
  
  toggle("step1-back-btn", isStep1);
  toggle("step1-next-btn", isStep1);
  toggle("step2-back-btn", !isStep1);
  toggle("step2-award-btn", !isStep1);
}

/**
 * 4. 모달 및 이벤트
 */
function openAwardPopup() {
  const winner = charState.finalWinner;
  if (!winner) return;

  // LocalStorage 저장
  const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
  results[charState.awardName] = { 
    name: winner.name, 
    anime: winner.animeTitle, 
    thumbnail: winner.thumbnail,
    cv: winner.cv
  };
  localStorage.setItem("anime_awards_result", JSON.stringify(results));

  // 모달 내용 업데이트
  document.getElementById("modal-img").src = winner.thumbnail;
  document.getElementById("modal-title").textContent = winner.name;
  document.getElementById("modal-anime").textContent = winner.animeTitle;
  document.getElementById("modal-cv").textContent = winner.cv;
  
  document.getElementById("winner-modal").classList.remove("hidden");
  
  fireConfetti();
}

function fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        // 왼쪽에서 발사
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            zIndex: 9999,
            colors: ['#d4af37', '#ffffff']
        });
        // 오른쪽에서 발사
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 }, 
            zIndex: 9999,
            colors: ['#d4af37', '#ffffff']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function bindEvents() {
  document.getElementById("step1-next-btn").onclick = goStep2;
  document.getElementById("step2-back-btn").onclick = () => {
    charState.step = 1;
    toggleUI(1);
    renderStep1();
    updatePreview();
  };
  document.getElementById("step2-award-btn").onclick = openAwardPopup;
  
  const goMain = () => location.href = "../main/main.html";
  document.getElementById("step1-back-btn").onclick = goMain;
  document.getElementById("go-main-btn").onclick = goMain;
}

/**
 * 5. 데이터 처리 (기존 로직 유지)
 */
function getNormalizedCharData(genderKey) {
  const result = [];
  if (typeof CharacterData === 'undefined' || typeof AnimeList === 'undefined') return result;

  const charMap = {};
  CharacterData.forEach(item => charMap[String(item.id)] = item.characters || []);

  AnimeList.forEach(anime => {
    const animeId = String(anime.id);
    const characters = charMap[animeId];
    if (characters && Array.isArray(characters)) {
      const filtered = characters.filter(c => 
        String(c.gender).trim().toLowerCase() === String(genderKey).trim().toLowerCase()
      );
      filtered.forEach((char, idx) => {
        result.push({
          id: `${animeId}_${char.name}_${idx}`,
          name: char.name,
          gender: char.gender,
          cv: char.cv || "정보 없음",
          thumbnail: char.img,
          animeId: animeId,
          animeTitle: anime.title,
          quarter: anime.quarter,
          day: anime.day || "Web"
        });
      });
    }
  });
  return result;
}

function groupByHierarchy(data) {
  const grouped = {};
  const reverseQuarterMap = { "1분기": "Q1", "2분기": "Q2", "3분기": "Q3", "4분기": "Q4" };

  data.forEach(item => {
    const qKey = reverseQuarterMap[item.quarter] || item.quarter;
    if (!grouped[qKey]) grouped[qKey] = {};
    if (!grouped[qKey][item.day]) grouped[qKey][item.day] = {};
    if (!grouped[qKey][item.day][item.animeTitle]) grouped[qKey][item.day][item.animeTitle] = [];
    grouped[qKey][item.day][item.animeTitle].push(item);
  });
  return grouped;
}

/**
 * 검색 및 자동완성 로직
 */
function initSearch(allData) {
  const searchInput = document.getElementById("search-input");
  const autoCompleteBox = document.querySelector(".autocomplete-items");

  // 검색창 활성화
  searchInput.disabled = false;
  searchInput.placeholder = "캐릭터 또는 애니 제목 검색";

  searchInput.oninput = function() {
    const val = this.value.trim().toLowerCase();
    autoCompleteBox.innerHTML = "";

    if (!val) return;

    // 이름 또는 애니메이션 제목에 검색어가 포함된 데이터 필터링 (최대 10개)
    const matches = allData.filter(item => 
      item.name.toLowerCase().includes(val) || 
      item.animeTitle.toLowerCase().includes(val)
    ).slice(0, 10);

    matches.forEach(match => {
      const div = document.createElement("div");
      // 검색어 강조 표시 (이름 위주)
      const displayName = match.name.replace(new RegExp(val, "gi"), (m) => `<strong>${m}</strong>`);
      
      div.innerHTML = `
        <div>${displayName}</div>
        <span class="search-subtext">${match.animeTitle} | CV. ${match.cv}</span>
      `;

      div.onclick = () => {
        handleSearchSelect(match);
        autoCompleteBox.innerHTML = "";
        searchInput.value = "";
      };
      autoCompleteBox.appendChild(div);
    });
  };

  // 외부 클릭 시 검색결과 닫기
  document.addEventListener("click", (e) => {
    if (e.target !== searchInput) autoCompleteBox.innerHTML = "";
  });
}

/**
 * 검색 결과에서 항목을 클릭했을 때 처리
 * 선택된 캐릭터의 아코디언을 자동으로 열고 스크롤합니다.
 */
function handleSearchSelect(char) {
  // 1. 해당 캐릭터 카드 엘리먼트 찾기
  const targetCard = document.querySelector(`.card[data-char-id="${char.id}"]`);
  
  if (!targetCard) {
    alert("현재 목록에서 해당 캐릭터를 찾을 수 없습니다.");
    return;
  }

  // 2. 부모 아코디언들을 역순으로 모두 열기
  // (1) 애니메이션 아코디언 열기
  const animeContent = targetCard.closest('.anime-content');
  const animeBtn = animeContent?.previousElementSibling;
  if (animeContent && !animeContent.classList.contains('active')) {
    animeBtn.click(); 
  }

  // (2) 요일 아코디언 열기
  const dayContent = targetCard.closest('.day-content-wrapper');
  const dayBtn = dayContent?.previousElementSibling;
  if (dayContent && dayContent.style.display !== 'block') {
    dayBtn.click();
  }

  // (3) 분기 아코디언 열기
  const quarterContent = targetCard.closest('.quarter-content');
  const quarterBtn = quarterContent?.previousElementSibling;
  if (quarterContent && quarterContent.style.display !== 'block') {
    quarterBtn.click();
  }

  // 3. 카드 선택 및 스크롤 이동
  const isAlreadySelected = charState.selectedItems.some(s => s.id === char.id);
  if (!isAlreadySelected) {
    toggleCandidate(char, targetCard); // 선택 처리 및 프리뷰 갱신
  }

  // 부드럽게 스크롤 이동
  setTimeout(() => {
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 시각적 효과: 반짝이는 애니메이션 잠시 추가
    targetCard.style.outline = "3px solid var(--gold)";
    setTimeout(() => { targetCard.style.outline = "none"; }, 2000);
  }, 300); // 아코디언이 펼쳐지는 시간을 고려하여 지연 실행
}