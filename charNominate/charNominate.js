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

// ✅ 다른 nominate 페이지들과 통일: 득표율 캐시 변수
let cachedVoteData = null;

// 매핑 데이터
const QUARTER_MAP = { "Q1": "1분기", "Q2": "2분기", "Q3": "3분기", "Q4": "4분기" };
const DAY_LABELS = {
  "Mondays": "월요일", "Tuesdays": "화요일", "Wednesdays": "수요일",
  "Thursdays": "목요일", "Fridays": "금요일", "Saturdays": "토요일",
  "Sundays": "일요일", "Anomaly": "변칙편성", "Web": "웹"
};

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);

    charState.theme = params.get("theme") || "character_male";
    charState.awardName = params.get("awardName") || "올해의 주연상";

    const genderKey = charState.theme.includes("female") ? "female"
                : charState.theme.includes("male")   ? "male"
                : "all";
    if (genderKey === "female") {
        document.getElementById("step-title").textContent = `${SeasonFilter.toDisplayAwardName("올해의 여우 주연상")} 부문`;
    } else if (genderKey === "male") {
        document.getElementById("step-title").textContent = `${SeasonFilter.toDisplayAwardName("올해의 남우 주연상")} 부문`;
    } else {
        document.getElementById("step-title").textContent = `${SeasonFilter.toDisplayAwardName("올해의 모든 캐릭터 상")} 부문`;
    }

    const modalAwardEl = document.getElementById("modal-award-name");
    if (modalAwardEl) {
        modalAwardEl.textContent = charState.awardName;
    }

    const searchInput = document.getElementById("search-input");
    searchInput.disabled = false;
    searchInput.placeholder = "캐릭터/애니 제목 검색";
    searchInput.addEventListener("input", (e) => {
        renderStep1(e.target.value);
    });

    renderStep1();
    bindEvents();
    waitForFirebaseAndListen();   // ✅ 다른 파일들과 통일: DOMContentLoaded 안에서 호출
});

/**
 * 1. Step 1 렌더링 (분기 -> 요일 -> 애니메이션 -> 캐릭터 카드)
 */
function renderStep1(searchTerm = "") {
    const left = document.getElementById("left-area");
    left.innerHTML = ""; 

    const genderKey = charState.theme === "character_female" ? "female"
                : charState.theme === "character_male"   ? "male"
                : "all";
    let flatData = getNormalizedCharData(genderKey);

    if (searchTerm.trim() !== "") {
        const lowerTerm = searchTerm.toLowerCase().trim();
        flatData = flatData.filter(char => 
            char.name.toLowerCase().includes(lowerTerm) || 
            char.animeTitle.toLowerCase().includes(lowerTerm)
        );
    }

    if (flatData.length === 0) {
        left.innerHTML = `<div style="color:#888; text-align:center; padding:40px;">검색 결과가 없습니다.</div>`;
        return;
    }

    const hierarchy = groupByHierarchy(flatData);
    const isSearching = searchTerm.trim() !== "";

    Object.entries(hierarchy).forEach(([qName, days]) => {
        const qSection = document.createElement("div");
        qSection.className = "quarter-section";

        const qBtn = document.createElement("button");
        qBtn.className = "quarter-btn";
        
        const qContent = document.createElement("div");
        qContent.className = "quarter-content";
        
        if (isSearching) {
            qContent.style.display = "block";
            qBtn.classList.add("active");
            qBtn.innerHTML = `<span>${QUARTER_MAP[qName] || qName}</span> <span>▲</span>`;
        } else {
            qContent.style.display = "none";
            qBtn.innerHTML = `<span>${QUARTER_MAP[qName] || qName}</span> <span>▼</span>`;
        }

        qBtn.onclick = () => {
            const isOpen = qContent.style.display === "block";
            qContent.style.display = isOpen ? "none" : "block";
            qBtn.classList.toggle("active", !isOpen);
            qBtn.querySelector("span:last-child").textContent = isOpen ? "▼" : "▲";
        };

        Object.entries(days).forEach(([dName, animes]) => {
            const dBtn = document.createElement("button");
            dBtn.className = "day-btn";

            const dContent = document.createElement("div");
            dContent.className = "day-content-wrapper"; 

            if (isSearching) {
                dContent.style.display = "block";
                dBtn.classList.add("active");
                dBtn.innerHTML = `<span>${DAY_LABELS[dName] || dName}</span> <span>▲</span>`;
            } else {
                dContent.style.display = "none";
                dBtn.innerHTML = `<span>${DAY_LABELS[dName] || dName}</span> <span>▼</span>`;
            }

            dBtn.onclick = () => {
                const isOpen = dContent.style.display === "block";
                dContent.style.display = isOpen ? "none" : "block";
                dBtn.classList.toggle("active", !isOpen);
                dBtn.querySelector("span:last-child").textContent = isOpen ? "▼" : "▲";
            };

            Object.entries(animes).forEach(([aTitle, charList]) => {
                const aBtn = document.createElement("button");
                aBtn.className = "anime-btn";

                const aContent = document.createElement("div");
                aContent.className = "anime-content";

                if (isSearching) {
                    aContent.classList.add("active");
                    aBtn.classList.add("active");
                    aBtn.innerHTML = `<span>${aTitle}</span> <span>▲</span>`;
                } else {
                    aBtn.innerHTML = `<span>${aTitle}</span> <span>▼</span>`;
                }

                aBtn.onclick = () => {
                    aContent.classList.toggle("active");
                    aBtn.classList.toggle("active");
                    aBtn.querySelector("span:last-child").textContent = aContent.classList.contains("active") ? "▲" : "▼";
                };

                charList.forEach(char => {
                    const card = document.createElement("div");
                    card.className = "card";
                    card.dataset.charId = char.id;
                    
                    if (charState.selectedItems.some(s => s.id === char.id)) {
                        card.classList.add("selected");
                    }

                    let displayName = char.name;
                    if (isSearching) {
                        const regex = new RegExp(searchTerm.trim(), "gi");
                        displayName = char.name.replace(regex, (match) => `<span style="color:var(--gold);">${match}</span>`);
                    }

                    card.setAttribute('data-category', charState.awardName);
                    card.setAttribute('data-anime-id', char.name);

                    card.innerHTML = `
                        <div class="card-selection-rate" style="display:none;">0/0</div>
                        <div class="card-badge">CV. ${char.cv}</div>
                        <img src="../${char.thumbnail}" alt="${char.name}" onerror="this.src='https://via.placeholder.com/200x280?text=No+Img'">
                        <div class="card-info">
                        <div class="card-title">${displayName}</div>
                        <div class="card-studio">${char.animeTitle}</div>
                    </div>
                `;

                    card.onclick = (e) => {
                        e.stopPropagation(); 
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

    applyVoteBadges();   // ✅ 추가: 재렌더링(검색 등) 후에도 캐시된 득표율 즉시 반영
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
    const item = document.createElement("div");
    item.className = "preview-item";
    item.innerHTML = `
        ${char.name}
        <br><small style="color:#888; font-size:0.75rem;">${char.animeTitle}</small>
    `;
    
    item.onclick = () => {
      charState.selectedItems = charState.selectedItems.filter(s => s.id !== char.id);
      
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

    left.innerHTML = `
        <h2 style="color:var(--gold); margin-bottom:20px; font-size: 1.5rem; text-align: left;">최종 수상작을 선택하세요</h2>
        <div id="step2-grid"></div>
    `;

    const grid = document.getElementById("step2-grid");

    charState.selectedItems.forEach(char => {
        const card = document.createElement("div");
        card.className = "step2-char-card";

        card.setAttribute('data-category', charState.awardName);   // ✅ 추가: Step2 카드도 뱃지 매칭 가능하도록
        card.setAttribute('data-anime-id', char.name);

        card.innerHTML = `
            <div class="card-selection-rate" style="display:none;">0/0</div>
            <div class="card-badge">CV. ${char.cv}</div>
            <div class="card-thumb">
                <img src="../${char.thumbnail}" alt="${char.name}" onerror="this.src='https://via.placeholder.com/200x280?text=No+Img'">
            </div>
            <div class="step2-card-info">
                <div class="card-title">${char.name}</div>
                <div class="card-studio">${char.animeTitle}</div>
            </div>
        `;
        
        card.onclick = () => selectFinalWinner(char, card);
        grid.appendChild(card);
    });

    applyVoteBadges();   // ✅ 추가: Step2 진입 시에도 뱃지 반영
}

function selectFinalWinner(char, cardElement) {
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

  ResultStorage.saveOne(charState.awardName, { 
    name: winner.name, 
    anime: winner.animeTitle, 
    thumbnail: winner.thumbnail,
    cv: winner.cv
  });

  document.getElementById("modal-img").src = `../${winner.thumbnail}`;
  document.getElementById("modal-title").textContent = winner.name;
  document.getElementById("modal-anime").textContent = winner.animeTitle;
  document.getElementById("modal-cv").textContent = winner.cv;
  
  document.getElementById("winner-modal").classList.remove("hidden");
  
  fireConfetti();
  if (window.submitSingleAwardToDB) {
      window.submitSingleAwardToDB(charState.awardName);
  }
}

function fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            zIndex: 9999,
            colors: ['#d4af37', '#ffffff']
        });
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
  
  const goMain = () => location.href = "../index.html";
  document.getElementById("step1-back-btn").onclick = goMain;
  document.getElementById("go-main-btn").onclick = goMain;
}

/**
 * 5. 데이터 처리
 */
function getNormalizedCharData(genderKey) {
  const result = [];
  // ✅ 수정: CharacterData_2026 하드코딩 → resolveYear.js가 만든 별칭 CharacterData 사용
  if (typeof CharacterData === 'undefined' || typeof AnimeList === 'undefined') return result;

  const charMap = {};
  CharacterData.forEach(item => charMap[String(item.id)] = item.characters || []);

  const seasonAnimeList = SeasonFilter.filterAnimeList(AnimeList);

  seasonAnimeList.forEach(anime => {
    const animeId = String(anime.id);
    const characters = charMap[animeId];
    if (characters && Array.isArray(characters)) {
      const filtered = characters.filter(c => {
        if (genderKey === "all") return true;
            return String(c.gender).trim().toLowerCase() === String(genderKey).trim().toLowerCase();
      });
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

// ──────────────────────────────────────────────────────────
// Firebase 실시간 득표율 뱃지 (다른 nominate 페이지들과 통일된 캐시 패턴)
// ──────────────────────────────────────────────────────────
function applyVoteBadges() {
    if (!cachedVoteData) return;

    const total = cachedVoteData._participants || 0;

    document.querySelectorAll('.card').forEach(card => {
        const animeId = card.getAttribute('data-anime-id');
        const rateBadge = card.querySelector('.card-selection-rate');
        if (!rateBadge || !animeId) return;

        const count = cachedVoteData[animeId] || 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        rateBadge.innerText = `${percent}%`;
        rateBadge.style.display = "block";
    });
}

function listenToVoteRates() {
    if (!window.fbOnValue || !window.fbDB) return;

    const categoryRef = window.fbRef(window.fbDB, window.getVotesCategoryPath(charState.awardName));

    window.fbOnValue(categoryRef, (snapshot) => {
        cachedVoteData = snapshot.val() || {};
        applyVoteBadges();
    });
}

function waitForFirebaseAndListen() {
    if (window.fbOnValue && window.fbDB) {
        listenToVoteRates();
    } else {
        setTimeout(waitForFirebaseAndListen, 300);
    }
}