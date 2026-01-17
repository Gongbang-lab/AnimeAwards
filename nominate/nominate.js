//상태 관리
const nominateState = {
  step: 1,
  selectedItems: [],
  finalWinner: null
};
//html 버튼 바인딩
function bindStaticButtons() {
  document.getElementById("step1-back-btn").onclick = () => {
    location.href = "index.html";
  };

  document.getElementById("step1-next-btn").onclick = () => {
    if (nominateState.selectedItem) goStep2();
  };

  document.getElementById("step2-back-btn").onclick = () => {
    nominateState.step = 1;
    renderStep1();
  };

  document.getElementById("step2-award-btn").onclick = () => {
    if (nominateState.finalWinner) openAwardPopup();
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
  renderAnimeList(left);

  updateStep1Preview(); // 🔥 preview는 HTML에 이미 존재
}
//step 1 anime list
function renderAnimeList(parent) {
  Object.entries(AnimeByQuarter).forEach(([quarter, animeList]) => {
    const quarterSection = document.createElement("div");
    quarterSection.className = "quarter-section";

    /* 분기 버튼 */
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

    /* 요일별 */
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

      /* 애니 목록 */
      dayAnimes.forEach(anime => {
        const li = document.createElement("li");
        li.className = "anime-item";
        li.textContent = anime.title;

        if (nominateState.selectedItem?.title === anime.title) {
          li.classList.add("selected");
        }

          li.onclick = () => {
          // 이미 선택된 애니면 해제 (UX 보너스)
            const exists = nominateState.selectedItems.some(
              a => a.title === anime.title
            );

          if (exists) {
            nominateState.selectedItems =
            nominateState.selectedItems.filter(a => a.title !== anime.title);
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
    preview.textContent = "선택된 작품이 없습니다.";
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
  nominateState.finalWinner = null;

  toggleStepUI();

  const left = document.getElementById("left-area");
  left.innerHTML = "";

  renderStep2Card(left);
}
//step 2 카드
function renderStep2Card(parent) {
  const title = document.createElement("h2");
  title.textContent = "노미네이트 작품";

  const card = document.createElement("div");
  card.className = "step2-card";

  card.innerHTML = `
    <div class="thumb">
      <img src="${nominateState.selectedItem.thumbnail || 'images/no-image.png'}">
    </div>
    <div class="info">
      <div class="title">${nominateState.selectedItem.title}</div>
    </div>
  `;

  card.onclick = () => {
    const selected = card.classList.toggle("selected");
    nominateState.finalWinner = selected ? nominateState.selectedItem : null;
    document.getElementById("step2-award-btn").disabled = !selected;
  };

  parent.appendChild(title);
  parent.appendChild(card);
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
  document.getElementById("winner-thumb").src =
    nominateState.finalWinner.thumbnail || "images/no-image.png";

  document.getElementById("winner-title").textContent =
    nominateState.finalWinner.title;

  document.getElementById("winner-popup").style.display = "flex";

  document.getElementById("go-main-btn").onclick = () => {
    location.href = "index.html";
  };
}
//초기 실행
document.addEventListener("DOMContentLoaded", () => {
  bindStaticButtons();
  renderStep1();
});