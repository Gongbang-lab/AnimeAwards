const awardGrid = document.getElementById("award-grid");
const resetBtn = document.getElementById("reset-btn");

function renderAwards() {
  awardGrid.innerHTML = "";
  const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};

  Awards.forEach((award) => {
    const card = document.createElement("div");
    card.className = "award-card";

    let winner = null;
    // 1. 데이터 매칭 (기존 로직 유지)
    for (const val of Object.values(results)) {
        if (Array.isArray(val)) {
            winner = val.find(item => String(item.rank).trim() === String(award.name).trim());
            if (winner) break;
        }
    }

    // --- 데이터 추출 보강 (이 부분이 핵심) ---
    let displayTitle = "제목 없음";
    let displayThumb = award.thumb || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    if (winner) {
        // 객체 내부의 모든 키를 순회하며 데이터를 강제로 꺼냄
        Object.keys(winner).forEach(key => {
            const value = winner[key];
            if (typeof value === 'string') {
                if (value.includes('../image/')) {
                    displayThumb = value; // 이미지 경로 찾기
                } else if (key !== 'rank' && value.length > 1) {
                    displayTitle = value; // 제목 찾기
                }
            }
        });
        card.classList.add("has-winner");
    }

    // --- UI 생성 ---
    const thumb = document.createElement("img");
    thumb.className = "award-thumb";
    thumb.src = displayThumb;
    
    // 물음표(?)가 포함된 파일명을 위한 디코딩 처리
    thumb.onerror = () => { 
        console.log("이미지 로드 실패, 경로 재확인:", displayThumb);
        thumb.src = award.thumb; 
    };

    const awardName = document.createElement("div");
    awardName.className = "award-name";
    awardName.textContent = award.name;

    const winnerTitle = document.createElement("div");
    winnerTitle.className = "award-winner";
    winnerTitle.textContent = displayTitle;

    card.append(thumb, awardName, winnerTitle);


    // 4. 클릭 시 이동 경로 (기존 코드 유지)
    card.onclick = () => {
      const query = `awardName=${encodeURIComponent(award.name)}&theme=${encodeURIComponent(award.theme)}`;
      
      switch (award.theme) {
        case "top3":
          location.href = `../top3Nominate/top3Nominate.html?${query}`;
          break;
        case "opening": case "ending": case "ost":
          location.href = `../songNominate/songNominate.html?${query}`;
          break;
        case "character_male": case "character_female":
          location.href = `../charNominate/charNominate.html?${query}`;
          break;
        case "voice_male": case "voice_female":
          location.href = `../cvNominate/cvNominate.html?${query}`;
          break;
        case "rookie_voice":
          location.href = `../rookieNominate/rookieNominate.html?${query}`;
          break;
        case "meme":
          location.href = `../memeNominate/memeNominate.html?${query}`;
          break;
        case "original":
          location.href = `../originalNominate/originalNominate.html?${query}`;
          break;
        case "director":
          location.href = `../directorNominate/directorNominate.html?${query}`;
          break;
        case "dramatization":
          location.href = `../adaptorNominate/adaptorNominate.html?${query}`;
          break;
        case "best_episode":
          location.href = `../episodeNominate/episodeNominate.html?${query}`;
          break;
        case "cinema":
          location.href = `../cinemaNominate/cinemaNominate.html?${query}`;
          break;
        case "studio":
          location.href = `../studioNominate/studioNominate.html?${query}`;
          break;
        default:
          location.href = `../nominate/nominate.html?${query}`;
      }
    };

    awardGrid.appendChild(card);
  });
}

// 초기화 로직
resetBtn.onclick = () => {
  if (confirm("모든 수상 결과를 초기화하시겠습니까?")) {
    localStorage.removeItem("anime_awards_result");
    renderAwards();
  }
};

document.addEventListener("DOMContentLoaded", renderAwards);