const awardGrid = document.getElementById("award-grid");

function createAwardCard(award) {
  const card = document.createElement("div");
  card.className = "award-card";

  const thumbnail = document.createElement("div");
  thumbnail.className = "thumbnail";

  const img = document.createElement("img");
  img.src = award.thumb;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "×";

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteAward(award.id);
  });

  thumbnail.appendChild(img);
  thumbnail.appendChild(deleteBtn);

  const titleDiv = document.createElement("div");
  titleDiv.className = "award-title";
  titleDiv.textContent = award.name;

  card.appendChild(thumbnail);
  card.appendChild(titleDiv);

  card.addEventListener("click", () => {
    console.log("카드 클릭됨", award.name);
    location.href = `nominate/nominate.html?awardId=${award.id}`;
  });

  return card;
}

function renderAwards() {
  awardGrid.innerHTML = "";

  Awards.forEach((award) => {
    awardGrid.appendChild(createAwardCard(award));
  });
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
  })

renderAwards();

// 버튼 형식이 아닌 Thmbnail Card UI
// 더보기 버튼 = Accordion UI

//1. 이미지 넣는 방식
//2. 노미네이트 페이지 구조 설계