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

// 요일 매핑
const DAY_LABELS = {
  "Mondays": "월요일",
  "Tuesdays": "화요일",
  "Wednesdays": "수요일",
  "Thursdays": "목요일",
  "Fridays": "금요일",
  "Saturdays": "토요일",
  "Sundays": "일요일",
  "Anomaly": "변칙편성",
  "Web": "웹"
};

// 분기 매핑
const QUARTER_MAP = {
  "Q1": "1분기",
  "Q2": "2분기",
  "Q3": "3분기",
  "Q4": "4분기"
};

/**
 * 1. 초기 실행 및 데이터 로드
 */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  charState.theme = params.get("theme");
  charState.currentAward.name = params.get("awardName") || "올해의 캐릭터상";

  renderStep1();
  bindButtons();
});

function renderStep1() {
  const left = document.getElementById("left-area");
  if (!left) return;

  const genderKey = charState.theme.includes("female") ? "female" : "male";
  const flatData = getNormalizedCharData(genderKey);

  // 계층 구조 생성: 분기(Q1) -> 요일(Mondays) -> 제목(고문 아르바이트...)
  const hierarchy = {};
  flatData.forEach(item => {
    if (!hierarchy[item.quarter]) hierarchy[item.quarter] = {};
    if (!hierarchy[item.quarter][item.day]) hierarchy[item.quarter][item.day] = {};
    if (!hierarchy[item.quarter][item.day][item.animeTitle]) {
      hierarchy[item.quarter][item.day][item.animeTitle] = [];
    }
    hierarchy[item.quarter][item.day][item.animeTitle].push(item);
  });

  left.innerHTML = `<h2 class="step-title">${charState.currentAward.name} 후보 선택</h2>`;

  // 1단: 분기 아코디언
  Object.entries(hierarchy).forEach(([qName, days]) => {
    const displayQuarter = QUARTER_MAP[qName] || qName;
    const qSection = createAccordion(displayQuarter, "quarter-btn");
    const qContent = qSection.querySelector(".accordion-content");

    // 2단: 요일 아코디언
    Object.entries(days).forEach(([dName, animes]) => {
      const displayDay = DAY_LABELS[dName] || dName;
      const dSection = createAccordion(displayDay, "day-btn");
      const dContent = dSection.querySelector(".accordion-content");

      // 3단: 애니메이션 제목 아코디언
      Object.entries(animes).forEach(([aTitle, charList]) => {
        const aSection = createAccordion(aTitle, "anime-btn");
        const aContent = aSection.querySelector(".accordion-content");

        // 4단: 캐릭터 그리드
        const charGrid = document.createElement("div");
        charGrid.className = "char-button-grid";
        
        charList.forEach(char => {
          const charBtn = createCharacterButton(char);
          charGrid.appendChild(charBtn);
        });

        aContent.appendChild(charGrid);
        dContent.appendChild(aSection);
      });
      qContent.appendChild(dSection);
    });
    left.appendChild(qSection);
  });
}

function createCharacterButton(char) {
  const charBtn = document.createElement("button");
  charBtn.className = "char-button";
  
  if (charState.selectedItems.some(s => s.id === char.id)) {
    charBtn.classList.add("selected");
  }

  charBtn.innerHTML = `
    <img src="${char.thumbnail}" alt="${char.name}" 
         onerror="this.src='https://via.placeholder.com/80?text=No+Image'">
    <span class="char-name">${char.name}</span>
  `;

  charBtn.onclick = () => {
    const exists = charState.selectedItems.some(s => s.id === char.id);
    if (exists) {
      charState.selectedItems = charState.selectedItems.filter(s => s.id !== char.id);
      charBtn.classList.remove("selected");
    } else {
      charState.selectedItems.push(char);
      charBtn.classList.add("selected");
    }
    updatePreview();
  };

  return charBtn;
}

function getNormalizedCharData(genderKey) {
  const result = [];
  const charMap = {};

  // 1. CharacterData 매핑 (ID 기반 지도 생성)
  if (typeof CharacterData !== 'undefined') {
    Object.values(CharacterData).forEach(animeList => {
      if (Array.isArray(animeList)) {
        animeList.forEach(item => {
          if (item.id) charMap[String(item.id)] = item.characters || [];
        });
      }
    });
  }

  // 2. AnimeByQuarter(제공해주신 구조) 순회
  Object.entries(AnimeByQuarter).forEach(([quarterKey, animeList]) => {
    // animeList는 [ {id: 61886, day: "Mondays", ...}, ... ] 형태임
    if (!Array.isArray(animeList)) return;

    animeList.forEach(anime => {
      const animeId = String(anime.id);
      const characters = charMap[animeId];

      if (characters && Array.isArray(characters)) {
        // 성별 필터링
        const filtered = characters.filter(c => 
          String(c.gender).trim().toLowerCase() === String(genderKey).trim().toLowerCase()
        );

        filtered.forEach((char, idx) => {
          result.push({
            id: `${animeId}_${char.name}_${idx}`,
            name: char.name,
            gender: char.gender,
            cv: char.vc || "정보 없음",
            thumbnail: char.img,
            animeId: animeId,
            animeTitle: anime.title, // animeData.js의 한국어 제목 사용
            quarter: quarterKey,      // 예: "Q1"
            day: anime.day || "Unknown" // 객체 내부의 day 속성 사용 (Mondays 등)
          });
        });
      }
    });
  });

  console.log(`✅ 드디어 매칭 성공! ${genderKey} 캐릭터 총 ${result.length}명 추출`);
  return result;
}


/**
 * 4. 평면 데이터를 계층형으로 그룹화
 */
function groupByHierarchy(data) {
  const grouped = {};
  
  data.forEach(item => {
    // 분기 그룹 생성
    if (!grouped[item.quarter]) {
      grouped[item.quarter] = {};
    }
    
    // 요일 그룹 생성
    if (!grouped[item.quarter][item.day]) {
      grouped[item.quarter][item.day] = {};
    }
    
    // 애니메이션 그룹 생성 및 캐릭터 추가
    if (!grouped[item.quarter][item.day][item.animeTitle]) {
      grouped[item.quarter][item.day][item.animeTitle] = [];
    }
    
    grouped[item.quarter][item.day][item.animeTitle].push(item);
  });
  
  return grouped;
}

/**
 * 5. 아코디언 생성 유틸리티 (분기/요일용)
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
 * 6. 애니메이션 섹션 생성 (캐릭터 버튼들 포함)
 */
function createAnimeSection(animeTitle, characters) {
  const container = document.createElement("div");
  container.className = "anime-section";

  // 애니메이션 제목 헤더
  const header = document.createElement("div");
  header.className = "anime-header";
  header.textContent = animeTitle;

  // 캐릭터 버튼들을 담을 컨테이너
  const charGrid = document.createElement("div");
  charGrid.className = "char-button-grid";

  // 각 캐릭터를 버튼으로 생성
  characters.forEach(char => {
    const charBtn = document.createElement("button");
    charBtn.className = "char-button";
    
    // 이미 선택된 캐릭터인지 확인
    if (charState.selectedItems.some(s => s.id === char.id)) {
      charBtn.classList.add("selected");
    }

    charBtn.innerHTML = `
      <img src="${char.thumbnail}" alt="${char.name}" 
           onerror="this.src='https://via.placeholder.com/80?text=No+Image'">
      <span class="char-name">${char.name}</span>
    `;

    // 클릭 이벤트: 선택/해제 토글
    charBtn.onclick = () => {
      const exists = charState.selectedItems.some(s => s.id === char.id);
      
      if (exists) {
        // 선택 해제
        charState.selectedItems = charState.selectedItems.filter(s => s.id !== char.id);
        charBtn.classList.remove("selected");
      } else {
        // 선택 추가
        charState.selectedItems.push(char);
        charBtn.classList.add("selected");
      }
      
      updatePreview();
    };

    charGrid.appendChild(charBtn);
  });

  container.append(header, charGrid);
  return container;
}

/**
 * 7. Step 1 Preview 업데이트
 */
/**
 * 7. Step 1 Preview 업데이트 (디자인 개편 버전)
 * 애니메이션별로 그룹화하여 가로 나열 구조로 렌더링합니다.
 */
function updatePreview() {
  const previewList = document.getElementById("preview-list");
  const nextBtn = document.getElementById("step1-next-btn");
  if (!previewList) return;

  previewList.innerHTML = "";

  // 1. 선택된 캐릭터들을 애니메이션 제목별로 그룹화
  const grouped = {};
  charState.selectedItems.forEach(char => {
    if (!grouped[char.animeTitle]) {
      grouped[char.animeTitle] = [];
    }
    grouped[char.animeTitle].push(char);
  });

  // 2. 그룹화된 데이터를 바탕으로 HTML 생성
  Object.entries(grouped).forEach(([animeTitle, characters]) => {
    // 애니메이션 그룹 컨테이너
    const groupDiv = document.createElement("div");
    groupDiv.className = "preview-group";

    // 애니메이션 제목 레이블
    const titleLabel = document.createElement("div");
    titleLabel.className = "preview-group-title";
    titleLabel.textContent = animeTitle;
    groupDiv.appendChild(titleLabel);

    // 캐릭터 가로 나열 컨테이너
    const charWrapper = document.createElement("div");
    charWrapper.className = "preview-char-wrapper";

    characters.forEach(char => {
      const charItem = document.createElement("div");
      charItem.className = "preview-item";
      charItem.textContent = char.name;

      // 클릭 시 삭제 로직 (기존 오류 해결)
      charItem.onclick = () => {
        removeCandidate(char.id);
      };

      charWrapper.appendChild(charItem);
    });

    groupDiv.appendChild(charWrapper);
    previewList.appendChild(groupDiv);
  });

  // 3. 다음 단계 버튼 활성화 제어
  if (nextBtn) {
    nextBtn.disabled = charState.selectedItems.length === 0;
  }
}

/**
 * 7-1. 후보 삭제 함수
 */
function removeCandidate(charId) {
  // 상태 업데이트
  charState.selectedItems = charState.selectedItems.filter(s => s.id !== charId);
  
  // UI 동기화 (왼쪽 리스트의 체크 상태 해제를 위해 renderStep1 호출)
  renderStep1(); 
  updatePreview();
}
/**
 * 8. Step 2: 최종 투표 카드 렌더링
 */
function goStep2() {
  charState.step = 2;
  toggleUI();

  const left = document.getElementById("left-area");
  left.innerHTML = `
    <h2 class="step-title">최종 투표</h2>
    <p style="text-align: center; color: #888; margin-bottom: 20px;">
      수상할 캐릭터를 선택하세요
    </p>
    <div class="char-card-grid"></div>
  `;
  
  const grid = left.querySelector(".char-card-grid");

  charState.selectedItems.forEach(char => {
    const card = document.createElement("div");
    card.className = "char-card-vertical";
    
    card.innerHTML = `
      <div class="card-thumb">
        <img src="${char.thumbnail}" alt="${char.name}"
             onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
      </div>
      <div class="card-body">
        <div class="anime-label">${char.animeTitle}</div>
        <div class="char-name">${char.name}</div>
        <div class="char-cv">CV. ${char.cv}</div>
      </div>
    `;

    card.onclick = () => {
      // 모든 카드의 선택 상태 해제
      document.querySelectorAll(".char-card-vertical").forEach(c => 
        c.classList.remove("selected")
      );
      
      // 현재 카드 선택
      card.classList.add("selected");
      charState.finalWinner = char;
      
      // 수상 버튼 활성화
      document.getElementById("step2-award-btn").disabled = false;
    };
    
    grid.appendChild(card);
  });
}

/**
 * 9. UI 토글 (Step 1 <-> Step 2)
 */
function toggleUI() {
  const s1Buttons = document.getElementById("step1-buttons");
  const s2Buttons = document.getElementById("step2-buttons");
  const preview = document.getElementById("step1-preview");

  if (charState.step === 1) {
    s1Buttons.style.display = "flex"; 
    s2Buttons.style.display = "none";
    if (preview) preview.style.display = "flex";
  } else {
    s1Buttons.style.display = "none"; 
    s2Buttons.style.display = "flex";
    if (preview) preview.style.display = "none";
  }
}

/**
 * 10. 버튼 이벤트 바인딩
 */
function bindButtons() {
  // Step 1: 다음 단계 버튼
  document.getElementById("step1-next-btn").onclick = goStep2;
  
  // Step 2: 뒤로가기 버튼
  document.getElementById("step2-back-btn").onclick = () => {
    charState.step = 1;
    toggleUI();
    renderStep1();
    updatePreview();
  };
  
  // Step 2: 수상 버튼
  document.getElementById("step2-award-btn").onclick = openAwardPopup;
  
  // Step 1: 메인으로 버튼
  document.getElementById("step1-back-btn").onclick = () => {
    location.href = "../main/main.html";
  };
  
  // 팝업: 확인 및 메인으로 버튼
  document.getElementById("go-main-btn").onclick = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      location.href = "../main/main.html";
    }, 1500);
  };
}

/**
 * 11. 수상 팝업 열기
 */
function openAwardPopup() {
  const winner = charState.finalWinner;
  const popup = document.getElementById("winner-popup");
  
  // 팝업 내용 업데이트
  document.getElementById("winner-thumb").src = winner.thumbnail;
  document.getElementById("winner-title").textContent = 
    `${winner.name} (${winner.animeTitle})`;
  
  // 팝업 표시
  popup.style.display = "flex";
  
  // Confetti 효과
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 }
  });
  
  // 로컬스토리지에 결과 저장
  const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
  results[charState.currentAward.name] = { 
    title: `${winner.name} (${winner.animeTitle})`, 
    thumbnail: winner.thumbnail 
  };
  localStorage.setItem("anime_awards_result", JSON.stringify(results));
}
