const awardGrid = document.getElementById("award-grid");
const resetBtn = document.getElementById("reset-btn");

function renderAwards() {
  awardGrid.innerHTML = "";
  
  const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};

  Awards.forEach((award) => {
    const card = document.createElement("div");
    card.className = "award-card";
    //winnerData

    const winner = results[award.name] || null;

    // 썸네일
    const thumb = document.createElement("img");
    thumb.className = "award-thumb";
    thumb.src = winner?.thumbnail || award.thumb || "images/default.png";

    // 상 이름
    const awardName = document.createElement("div");
    awardName.className = "award-name";
    awardName.textContent = award.name;

    card.append(thumb, awardName);

    // 🏆 수상된 경우만 작품명 추가
    if (winner) {
      const winnerTitle = document.createElement("div");
      winnerTitle.className = "award-winner";
      winnerTitle.textContent = winner.title;
      card.appendChild(winnerTitle);

      card.classList.add("has-winner");
    }

    card.onclick = () => {
      location.href =
        `nominate/nominate.html?awardName=${encodeURIComponent(award.name)}`;
    };

    awardGrid.appendChild(card);
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
document.getElementById("add-award-btn").addEventListener("click", () =>{
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
document.addEventListener("DOMContentLoaded", () => {
  renderAwards();
});
function resetAllAwards() {
  localStorage.removeItem("anime_awards_result");
  renderAwards();
}
function isAwardCompleted(awardId) {
  return localStorage.getItem(`winner_${awardId}`) !== null;
}
resetBtn.onclick = () => {
  if (!confirm("모든 수상 결과를 초기화할까요?")) return;

  localStorage.removeItem("anime_awards_result");
  renderAwards();
};
renderAwards();

// 버튼 형식이 아닌 Thmbnail Card UI
// 더보기 버튼 = Accordion UI