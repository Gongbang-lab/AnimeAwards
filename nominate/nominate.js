//상태 관리
const nominateState = {
  step: 1,
  theme: null,
  selectedItems: [],
  selectedWinner: null
};
// 요일 데이터 매칭
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
// 데이터의 요일 키
const DAY_KEYS = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"];

// Q1 -> 1분기 변환 함수
const QUARTER_MAP = {
  "Q1": "1분기",
  "Q2": "2분기",
  "Q3": "3분기",
  "Q4": "4분기"
};
//html 버튼 바인딩
function bindStaticButtons() {
  document.getElementById("step1-back-btn").onclick = () => {
    location.href = "../main/main.html";
  };

  document.getElementById("step1-next-btn").onclick = () => {
    if (nominateState.selectedItems) goStep2();
  };

  document.getElementById("step2-back-btn").onclick = () => {
    nominateState.step = 1;

    toggleStepUI();
    renderStep1();

    // Step1 preview 다시 보이게
    const preview = document.getElementById("step1-preview");
    if (preview) preview.style.display = "block";
  };
}
//진입 함수
function renderStep1() {
  const left = document.getElementById("left-area");
  if (!left) {
    console.error("❌ left-area 없음");
    return;
  }
  left.innerHTML = "";
  // 1. songNominate와 동일하게 소제목 추가
  const title = document.createElement("h2");
  title.className = "step-title"; // 공통 클래스 사용
  title.textContent = "작품 리스트"; // 또는 nominateState.currentAward.name
  title.style.marginBottom = "20px";
  left.appendChild(title);
  renderAnimeList(left);

  updateStep1Preview(); // 🔥 preview는 HTML에 이미 존재
}
//step 1 anime list
function renderAnimeList(parent) {
  // 분기 키(Q1, Q2...) 순서대로 정렬하여 출력
  Object.keys(AnimeByQuarter).sort().forEach((quarterKey) => {
    const animeList = AnimeByQuarter[quarterKey];
    const quarterSection = document.createElement("div");
    quarterSection.className = "quarter-section";

    const quarterBtn = document.createElement("button");
    quarterBtn.className = "quarter-btn";
    
    // 🔥 QUARTER_MAP을 사용하여 Q1 -> 1분기 변환, 없으면 원문 출력
    quarterBtn.textContent = QUARTER_MAP[quarterKey] || quarterKey;

    const quarterContent = document.createElement("div");
    quarterContent.className = "quarter-content";
    quarterContent.style.display = "none";

    quarterBtn.onclick = () => {
      const isVisible = quarterContent.style.display === "block";
      quarterContent.style.display = isVisible ? "none" : "block";
      quarterBtn.classList.toggle("active", !isVisible);
    };

    // 요일별 분류 출력
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
//step 1 preview
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
      nominateState.selectedItems =
        nominateState.selectedItems.filter(a => a.title !== anime.title);

      // 좌측 선택 상태도 해제
      document
        .querySelectorAll(".anime-item")
        .forEach(li => {
          if (li.textContent === anime.title) {
            li.classList.remove("selected");
          }
        });

      updateStep1Preview();
    };
    preview.appendChild(div);
  });

  nextBtn.disabled = false;
}
//preview 선택 해재 UX
function renderPreview() {
  previewList.innerHTML = '';

  selectedAnime.forEach((anime, index) => {
    const li = document.createElement('li');
    li.textContent = anime.title;

    li.onclick = () => {
      selectedAnime.splice(index, 1); // 선택 해제
      renderPreview();
      renderStep1(); // 왼쪽 리스트 갱신
    };

    previewList.appendChild(li);
  });
}
//Step 2 진입 함수
function goStep2() {
  nominateState.step = 2;
  nominateState.selectedWinner = null;

  toggleStepUI();

  const preview = document.getElementById("step1-preview");
  if (preview) preview.style.display = "none";

  const left = document.getElementById("left-area");
  left.innerHTML = "";

  renderStep2Cards(left);
}
//step 2 카드
function renderStep2Cards(parent) {
  const title = document.createElement("h2");
  title.className = "step-title";
  title.textContent = "최종 후보 선택";
  parent.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "step2-grid";

  nominateState.selectedItems.forEach(anime => {
    const card = document.createElement("div");
    card.className = "step2-card";

    // 🔥 데이터에 있는 thumbnail 경로를 그대로 사용하되, 
    // 현재 HTML 위치에 따라 상위 폴더(..)를 붙여야 할 수 있습니다.
    // 만약 nominate.html이 'nominate' 폴더 안에 있다면 "../"를 추가하세요.
    const imgPath = `../${anime.thumbnail}`;

    card.innerHTML = `
      <div class="card-thumb">
        <img src="${imgPath}" 
             onerror="this.onerror=null; this.src='https://placehold.co/400x600/2f3542/ffffff?text=No+WebP+Image'" 
             alt="${anime.title}" />
        <div class="card-day-badge">${DAY_LABELS[anime.day] || '기타'}</div>
      </div>
      <div class="card-info">
        <div class="card-title">${anime.title}</div>
        <div class="card-studio">${anime.studio || ''}</div>
      </div>
    `;

    card.onclick = () => {
      document.querySelectorAll(".step2-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      
      nominateState.selectedWinner = {
        ...anime,
        thumbnail: imgPath // 팝업에서 쓸 경로 저장
      };

      document.getElementById("step2-award-btn").disabled = false;
    };

    grid.appendChild(card);
  });

  parent.appendChild(grid);
}
//step ui 전환
function toggleStepUI() {
  const step1Buttons = document.getElementById("step1-buttons");
  const step2Buttons = document.getElementById("step2-buttons");

  if (nominateState.step === 1) {
    step1Buttons.style.display = "flex";
    step2Buttons.style.display = "none";
  } else {
    step1Buttons.style.display = "none";
    step2Buttons.style.display = "flex";
  }
}
//수상 팝업
function openAwardPopup() {
  const popup = document.getElementById("winner-popup");
  const thumb = document.getElementById("winner-thumb");
  const title = document.getElementById("winner-title");
  const goMainBtn = document.getElementById("go-main-btn");

  if (!popup || !thumb || !title || !goMainBtn) {
    console.error("❌ 팝업 DOM 요소 누락", {
      popup, thumb, title, goMainBtn
    });
    return;
  }

  thumb.src =
    nominateState.selectedWinner.thumbnail || "images/no-image.png";

  title.textContent =
    nominateState.selectedWinner.title;

  popup.style.display = "flex"; // ← classList.add 말고 이게 안전

  goMainBtn.onclick = () => {
    location.href = "../main/main.html";
  };
}
//localstorage에 저장
function saveAwardResult(winner) {
  const currentResults = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
  
  // URL 파라미터에서 가져온 상 이름을 키로 사용
  const awardName = nominateState.currentAward.name; 
  
  currentResults[awardName] = {
    title: winner.title,
    thumbnail: winner.thumbnail
  };

  localStorage.setItem("anime_awards_result", JSON.stringify(currentResults));
}

// 1. 수상 버튼 클릭 이벤트 연결 (bindStaticButtons 함수 내부 등에 위치)
const awardBtn = document.getElementById("step2-award-btn");
if (awardBtn) {
  awardBtn.onclick = () => {
    showWinnerPopup();
    
  };
}

// 2. 팝업 표시 함수
function showWinnerPopup() {
  // 1. 데이터 확인 (선택된 승자가 있는지)
  const winner = nominateState.selectedWinner; 
  if (!winner) {
    alert("수상작을 선택해주세요!");
    return;
  }
  // 2. 요소 가져오기 (초기화 위치 확인)
  const popupElement = document.getElementById("winner-popup");
  const thumbElement = document.getElementById("winner-thumb");
  const titleElement = document.getElementById("winner-title");

  // 3. 요소가 존재하는지 확인 후 데이터 삽입
  if (popupElement && thumbElement && titleElement) {
    // 이미 Step 2에서 변환된 imgPath를 사용하므로 그대로 대입
    thumbElement.src = winner.thumbnail;
    
    // 팝업 이미지 로딩 실패 대비
    thumbElement.onerror = function() {
      this.src = 'https://placehold.co/400x600/2f3542/ffffff?text=Image+Not+Found';
    };

    titleElement.textContent = winner.title;
    popupElement.style.display = "flex"; 
    popupElement.classList.add("active");

    fireConfetti();
  }

  // 5. 결과 저장 함수 호출
  saveAwardResult(winner);
}

// 3. 메인으로 가기 버튼 이벤트
document.getElementById("go-main-btn").onclick = () => {
  location.href = "../main/main.html";
};

// 4. 로컬스토리지 저장 함수 예시
function saveWinnerData(winner) {
  const currentResults = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
  
  // 현재 상 이름(예: '올해의 애니메이션')을 키로 저장
  const awardName = nominateState.currentAward.name; 
  currentResults[awardName] = {
    title: winner.title,
    thumbnail: winner.thumbnail
  };

  localStorage.setItem("anime_awards_result", JSON.stringify(currentResults));
}
//초기 실행
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const theme = params.get("theme");
  nominateState.theme = theme
  nominateState.currentAward = { name: params.get("awardName") };

  renderStep1();
  bindStaticButtons();
});

// 🎉 화려한 폭죽 연출 함수
function fireConfetti() {
  const duration = 3 * 1000; // 3초 동안 발사
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 }; // 팝업보다 위에 보이게 zIndex 조절

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // 왼쪽에서 쏘기
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      origin: { x: 0.2, y: 0.7 } 
    }));
    // 오른쪽에서 쏘기
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      origin: { x: 0.8, y: 0.7 } 
    }));
  }, 250);
}