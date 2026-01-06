//'대상','최우수상','우수상','밈','오프닝', '엔딩', 'OST', 
//'신인 성우상', '남자 성우상', '여자 성우상',
//'남우 주연상(캐릭터)', '여우 주연상(캐릭터)', '베스트 커플상',
//'각본상', '각색상', '감독상', '동화상', '작화상', 
//'올해의 똥','다크호스 상', '베스트 에피소드상', '올해의 시네마상', '올해의 스튜디오 상'
let Awards = [
  { id: 1, name: '대상'},
  { id: 2, name: '최우수상'},
  { id: 3, name: '우수상'},
  { id: 4, name: '밈'},
  { id: 5, name: '오프닝'},
  { id: 6, name: '엔딩'},
  { id: 7, name: 'OST'},
  { id: 8, name: '신인 성우상'},
  { id: 9, name: '남자 성우상'},
  { id: 10, name: '남우 주연상'},
  { id: 11, name: '여우 주연상'},
  { id: 12, name: '베스트 커플상'},
  { id: 13, name: '각본상'},
  { id: 14, name: '각색상'},
  { id: 15, name: '동화상'},
  { id: 16, name: '작화상'},
  { id: 17, name: '올해의 똥'},
  { id: 18, name: '다크호스'},
  { id: 19, name: '베스트 에피소드'},
  { id: 20, name: '올해의 시네마'},
  { id: 21, name: '올해의 스튜디오'},
];

function renderAwards(){
  const container = document.getElementById("award-board");
  container. innerHTML = "";

  Awards.forEach((award) => {
    const btn = document.createElement("button");
    btn.className = "award-btn";
    btn.innerText = award.name;

    //삭제 버튼
    const deleteBtn = document.createElement("span");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerText = "X";

    //삭제 클릭 이벤트
    deleteBtn.addEventListener("click", (e) =>{
      e.stopPropagation(); // 버튼 클릭 이벤트 전파 방지: X 누를 때 상 버튼 클릭이벤트가 실행되는걸 막음
      deleteAward(award.id);
    });

    btn.appendChild(deleteBtn);
    container.appendChild(btn);
  })
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
      name: name
    });

    input.value = "";
    renderAwards(); // 화면 갱신
  })

renderAwards();

//1. 사용자가 추가된 상도 버튼 형식으로 만들 수 있다.
//2. 버튼 위에 마우스가 호버링 상태에서 상 삭제 버튼이 나타난다.(아직 구현은 x)
//3. 기본 제공 상도 상 삭제 버튼을 누르면 삭제가 된다. 
//버튼의 크기를 크게 하고 그곳에 애니메이션과 사진을 집어 넣을 수 있는가