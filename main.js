var AwardsList = [
    '대상','최우수상','우수상','밈','오프닝', '엔딩', 'OST', 
    '신인 성우상', '남자 성우상', '여자 성우상',
    '남우 주연상(캐릭터)', '여우 주연상(캐릭터)', '베스트 커플상',
    '각본상', '각색상', '감독상', '동화상', '작화상', 
    '올해의 똥','다크호스 상', '베스트 에피소드상', '올해의 시네마상', '올해의 스튜디오 상'];


const container = document.getElementById("button-container");

container.innerHTML = AwardsList.map(anime =>
  `<button class="anime-btn">${anime}</button>`
).join("");

// 추가,삭제 버튼 만들기
// css 버튼 위치 수정
// 버튼 클릭 이벤트 만들기