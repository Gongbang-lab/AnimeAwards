//'대상','최우수상','우수상','밈','오프닝', '엔딩', 'OST', 
//'신인 성우상', '남자 성우상', '여자 성우상',
//'남우 주연상(캐릭터)', '여우 주연상(캐릭터)', '베스트 커플상',
//'각본상', '각색상', '감독상', '동화상', '작화상', 
//'올해의 똥','다크호스 상', '베스트 에피소드상', '올해의 시네마상', '올해의 스튜디오 상'
let Awards = [
  { id: 1, name: '대상', thumb: ''},
  { id: 2, name: '최우수상', thumb: ''},
  { id: 3, name: '우수상', thumb: ''},
  { id: 4, name: '밈', thumb: ''},
  { id: 5, name: '오프닝', thumb: ''},
  { id: 6, name: '엔딩', thumb: ''},
  { id: 7, name: 'OST', thumb: ''},
  { id: 8, name: '신인 성우상', thumb: ''},
  { id: 9, name: '남자 성우상', thumb: ''},
  { id: 10, name: '남우 주연상', thumb: ''},
  { id: 11, name: '여우 주연상', thumb: ''},
  { id: 12, name: '베스트 커플상', thumb: ''},
  { id: 13, name: '각본상', thumb: ''},
  { id: 14, name: '각색상', thumb: ''},
  { id: 15, name: '동화상', thumb: ''},
  { id: 16, name: '작화상', thumb: ''},
  { id: 17, name: '올해의 똥', thumb: ''},
  { id: 18, name: '다크호스', thumb: ''},
  { id: 19, name: '베스트 에피소드', thumb: ''},
  { id: 20, name: '올해의 시네마', thumb: ''},
  { id: 21, name: '올해의 스튜디오', thumb: ''},
];
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
    alert(`${award.name} 노미네이트 페이지로 이동`);
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

//버튼 형식이 아닌 Thmbnail Card UI