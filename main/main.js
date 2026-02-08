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
    thumb.src = winner?.thumbnail || award.thumb;

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
      switch (award.theme) {
      case "opening":
      case "ending":
      case "ost":
        location.href = `../songNominate/songNominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        break;
      case "character_male":
      case "character_female":
        location.href = `../charNominate/charNominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        break;
      case "voice_male":
      case "voice_female":
        location.href = `../cvNominate/cvNominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        break;
      case "rookie_voice":
        location.href = `../rookieNominate/rookieNominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        break;
      case "meme":
        location.href = `../memeNominate/memeNominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        break;
      case "original":
        location.href = `../originalNominate/originalNominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        break;
      case "director":
        location.href = `../directorNominate/directorNominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        break;
      case "dramatization":
        location.href = `../adaptorNominate/adaptorNominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        break;
      case "best_episode":
        location.href = `../episodeNominate/episodeNominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        break;
      case "cinema":
        location.href = `../cinemaNominate/cinemaNominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        break;
      case "studio":
        location.href = `../studioNominate/studioNominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        break;
      case "villian":
        location.href = `../charNominate/charNominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
        break;
      default:
        location.href = `../nominate/nominate.html?awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
      }
    };
    awardGrid.appendChild(card);
  })}

function deleteAward(id){
  Awards = Awards.filter((award) => award.id !== id);
  renderAwards();
}
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