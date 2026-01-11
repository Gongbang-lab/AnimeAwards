const awardGrid = document.getElementById("award-grid");
const resetBtn = document.getElementById("reset-btn");

function renderAwards() {
  awardGrid.innerHTML = "";

  Awards.forEach((award) => {
    const card = createAwardCard(award);
    awardGrid.appendChild(card);
  });
}

function createAwardCard(award) {
  const card = document.createElement("div");
  card.className = "award-card";

  const winnerData = localStorage.getItem(`winner_${award.id}`);
  const winner = winnerData ? JSON.parse(winnerData) : null;

  if (winner) {
    card.classList.add("has-winner");

    const awardTitle = document.createElement("div");
    awardTitle.className = "award-title";
    awardTitle.textContent = award.name;

    const thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";

    const img = document.createElement("img");
    img.src = winner.thumbnail;

    thumbnail.appendChild(img);

    const animeTitle = document.createElement("div");
    animeTitle.className = "winner-title";
    animeTitle.textContent = winner.title;

    card.append(awardTitle, thumbnail, animeTitle);

  } else {
    const thumbnail = document.createElement("div");
    thumbnail.className = "thumbnail";

    const img = document.createElement("img");
    img.src = award.thumb || "default.png";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "×";

    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteAward(award.id);
    };

    thumbnail.append(img, deleteBtn);

    const titleDiv = document.createElement("div");
    titleDiv.className = "award-title";
    titleDiv.textContent = award.name;

    card.append(thumbnail, titleDiv);
  }

  card.onclick = () => {
    location.href = `nominate/nominate.html?awardId=${award.id}`;
  };

  return card;
}


function deleteAward(id){
  Awards = Awards.filter((award) => award.id !== id);
  renderAwards();
}

Awards.forEach((award) => {
  const card = document.createElement("div");
  card.className = "award-card";
  card.textContent = award.name;

  card.addEventListener("click", () => {
    console.log("상 카드 클릭됨", award.id);
    location.href = `nominate/nominate.html?awardId=${award.id}`;
  });

  awardGrid.appendChild(card);
});

document
  .getElementById("add-award-btn")
  .addEventListener("click", () =>{
    const input = document.getElementById("award-input");
    const name = input.value.trim();

    if(!name){
      alert("상 이름을 입력하세요.");
      return;
    }

    Awards.push({
      id: Date.now(), // 고유 ID
      name: name,
      thumb : ''
    });

    input.value = "";
    renderAwards(); // 화면 갱신
  });

function resetAllAwards() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("nominees_") || key.startsWith("winner_")) {
      localStorage.removeItem(key);
    }
  });
  renderAwards();
}

function isAwardCompleted(awardId) {
  return localStorage.getItem(`winner_${awardId}`) !== null;
}

resetBtn.onclick = () => {
  if (!confirm("모든 수상 결과를 초기화할까요?")) return;

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("nominees_") || key.startsWith("winner_")) {
      localStorage.removeItem(key);
    }
  });

  renderAwards();
};


renderAwards();



// 버튼 형식이 아닌 Thmbnail Card UI
// 더보기 버튼 = Accordion UI
