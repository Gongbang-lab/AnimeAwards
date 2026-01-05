//기본 제공 상(고정)
var DefaultAwards = [
    '대상','최우수상','우수상','밈','오프닝', '엔딩', 'OST', 
    '신인 성우상', '남자 성우상', '여자 성우상',
    '남우 주연상(캐릭터)', '여우 주연상(캐릭터)', '베스트 커플상',
    '각본상', '각색상', '감독상', '동화상', '작화상', 
    '올해의 똥','다크호스 상', '베스트 에피소드상', '올해의 시네마상', '올해의 스튜디오 상'];
// 사용자가 추가한 상
let awards = [];

function renderDefaultAwards(){
  const container = document.getElementById("default-award-buttons");
  container. innerHTML = "";

  DefaultAwards.forEach((award) => {
    const btn = document.createElement("button");
    btn.className = "anime-btn";
    btn.innerText = award;

    // 클릭 시 입력창에 자동 입력
    btn.addEventListener("click", () =>{
      document.getElementById("award-input").value = award;
    })

    container.appendChild(btn);
  })
}

function renderAwards(){
  const board = document.getElementById("award-board");
  board.innerHTML = "";
  
  awards.forEach((award, index) => {
    const div = document.createElement("div");
    div.className = "award";
    div.innerText = award;

    board.appendChild(div);
  })
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

    awards.push(name); //데이터에만 추가
    input.value = "";

    renderAwards(); // 화면 갱신
  })

renderDefaultAwards();
renderAwards();

