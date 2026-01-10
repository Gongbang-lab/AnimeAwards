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

//기본 테마 랜더링
function renderDefault() {
  bottomArea.innerHTML = "";

  Object.entries(animeByQuarter).forEach(([quarter, list]) => {
    const section = document.createElement("div");

    const button = document.createElement("button");
    button.textContent = quarter.toUpperCase();

    const ul = document.createElement("ul");
    ul.style.display = "none";

    list.forEach(title => {
      const li = document.createElement("li");
      li.textContent = title;

      li.addEventListener("click", () => {
        addNominee(title);
      });

      ul.appendChild(li);
    });

    button.onclick = () => {
      ul.style.display = ul.style.display === "none" ? "block" : "none";
    };

    section.appendChild(button);
    section.appendChild(ul);
    bottomArea.appendChild(section);
  });
}


function addNominee(title) {
  // 중복 방지
  if ([...nomineeArea.children].some(card => card.dataset.title === title)) {
    return;
  }

  const card = document.createElement("div");
  card.className = "nominee-card";
  card.dataset.title = title;
  card.textContent = title;

  card.onclick = () => {
    selectWinner(title);
  };

  nomineeArea.appendChild(card);
}


function selectWinner(title) {
  winnerArea.innerHTML = `<h2>${title}</h2>`;
}

renderAnimeQuarter();
