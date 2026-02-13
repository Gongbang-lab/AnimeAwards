// 상태 관리
const songNominateState = {
    theme: null,            // "opening" | "ending"
    step: 1,
    selectedItems: [],
    finalWinner: null,
    currentAward: null
};
const dayMap = {
    "mondays": "월요일",
    "tuesdays": "화요일",
    "wednesdays": "수요일",
    "thursdays": "목요일",
    "fridays": "금요일",
    "saturdays": "토요일",
    "sundays": "일요일",
    "anomaly": "변칙 편성",
    "web" : "웹"
};

let searchQuery = "";

// 유틸: 유튜브 썸네일 추출
function ytThumb(url) {
    if (!url) return "../images/default.png";
    let videoId = "";
    if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("v=")) {
        videoId = url.split("v=")[1].split("&")[0];
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "../images/default.png";
}

/**
 * 데이터 변환 및 병합
 * 신규 AnimeSongs 구조를 순회하며 theme(op/ed)에 맞는 곡만 필터링하여 평면 리스트로 만듭니다.
 */
function getMergedSongData(themeType) {
    const targetType = themeType === "opening" ? "op" : "ed";
    const result = {};

    // 1. AnimeByQuarter에서 애니메이션 기본 정보(요일 등)를 가져오기 위한 맵 생성
    const animeInfoMap = {};
    Object.values(AnimeByQuarter).flat().forEach(a => {
        animeInfoMap[a.id] = a;
    });

    // 2. AnimeSongs 구조 분석 (Quarter -> Anime -> Songs)
    Object.entries(AnimeSongs).forEach(([quarter, animeList]) => {
        const filteredSongs = [];

        animeList.forEach(animeGroup => {
            const baseInfo = animeInfoMap[animeGroup.id];
            
            // songs 배열에서 op 또는 ed만 필터링
            animeGroup.songs.forEach((song, index) => {
                if (song.type === targetType) {
                    filteredSongs.push({
                        // 고유 ID 생성을 위해 애니ID + 타입 + 인덱스 조합
                        uniqueId: `${animeGroup.id}-${song.type}-${index}`,
                        id: animeGroup.id, 
                        animeTitle: animeGroup.animeTitle,
                        title: song.title,
                        artist: song.artist, // 데이터의 artist 사용
                        youtube: song.youtube,
                        thumbnail: ytThumb(song.youtube),
                        day: baseInfo ? baseInfo.day : "기타"
                    });
                }
            });
        });

        if (filteredSongs.length > 0) {
            result[quarter] = filteredSongs;
        }
    });

    return result;
}

// Step 1 렌더링\
function renderSongStep1(theme) {
    songNominateState.theme = theme;
    const container = document.getElementById("left-area");
    
    // 구조 재설정: 제목 + 검색창 + 리스트 컨테이너
    container.innerHTML = `
        <h2 class="step-title">${theme === "opening" ? "오프닝" : "엔딩"} 후보 선택</h2>
        <div class="search-container">
            <input type="text" id="song-search" placeholder="애니 제목 또는 곡명 검색..." autocomplete="off" />
            <span class="search-icon">🔍</span>
        </div>
        <div id="nominate-list-container"></div>
    `;

    const searchInput = document.getElementById("song-search");
    
    // 검색 이벤트 연결
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        renderFilteredList(query); 
    });

    // 초기 리스트 호출 (검색어 없음)
    renderFilteredList("");
}

function renderFilteredList(query) {
    const listContainer = document.getElementById("nominate-list-container");
    if (!listContainer) return;

    listContainer.innerHTML = ""; 
    const mergedData = getMergedSongData(songNominateState.theme);

    Object.entries(mergedData).forEach(([quarter, songs]) => {
        const filteredSongs = songs.filter(song => 
            song.animeTitle.toLowerCase().includes(query) || 
            song.title.toLowerCase().includes(query) ||
            (song.artist && song.artist.toLowerCase().includes(query))
        );

        if (filteredSongs.length > 0) {
            const isSearching = query.length > 0;
            const quarterSection = document.createElement("div");
            quarterSection.className = "quarter-section";

            const quarterBtn = document.createElement("button");
            quarterBtn.className = `quarter-btn ${isSearching ? "active" : ""}`;
            quarterBtn.innerHTML = `<span>${quarter.replace("Q", "")}분기</span><span class="arrow">▼</span>`;

            const quarterContent = document.createElement("div");
            quarterContent.className = "quarter-content";
            quarterContent.style.display = isSearching ? "block" : "none";

            quarterBtn.onclick = () => {
                const isOpen = quarterContent.style.display === "block";
                quarterContent.style.display = isOpen ? "none" : "block";
                quarterBtn.classList.toggle("active", !isOpen);
            };

            const groupedByDay = {};
            filteredSongs.forEach(song => {
                if (!groupedByDay[song.day]) groupedByDay[song.day] = [];
                groupedByDay[song.day].push(song);
            });

            Object.entries(groupedByDay).forEach(([day, daySongs]) => {
                const dayBtn = document.createElement("button");
                dayBtn.className = `day-btn ${isSearching ? "active" : ""}`;
                dayBtn.textContent = dayMap[day.toLowerCase()] || day;

                // ⚠️ 해결: 여기서 dayList를 먼저 생성합니다.
                const dayList = document.createElement("div");
                dayList.className = "song-list"; 
                
                // 그리드 적용을 위해 display 설정
                if (isSearching) {
                    dayList.style.display = "grid";
                } else {
                    dayList.style.display = "none";
                }

                dayBtn.onclick = () => {
                    const isOpen = dayList.style.display === "grid";
                    dayList.style.display = isOpen ? "none" : "grid";
                    dayBtn.classList.toggle("active", !isOpen);
                };

                daySongs.forEach(song => {
                    const item = document.createElement("div");
                    item.className = "song-item";
                    if (songNominateState.selectedItems.some(s => s.uniqueId === song.uniqueId)) {
                        item.classList.add("selected");
                    }

                    item.innerHTML = `
                        <div class="song-thumb">
                            <img src="${song.thumbnail}" alt="thumbnail">
                            <a class="youtube-link" href="${song.youtube}" target="_blank" onclick="event.stopPropagation();">
                                <span class="play-icon">▶</span>
                            </a>
                        </div>
                        <div class="song-info">
                            <div class="anime-title">${song.animeTitle}</div>
                            <div class="song-title">${song.title}</div>
                            <div class="song-singer">${song.artist || ""}</div>
                        </div>
                    `;

                    item.onclick = () => {
                        const idx = songNominateState.selectedItems.findIndex(s => s.uniqueId === song.uniqueId);
                        if (idx > -1) {
                            songNominateState.selectedItems.splice(idx, 1);
                            item.classList.remove("selected");
                        } else {
                            songNominateState.selectedItems.push(song);
                            item.classList.add("selected");
                        }
                        updatePreview();
                    };
                    dayList.appendChild(item);
                });

                quarterContent.append(dayBtn, dayList);
            });

            quarterSection.append(quarterBtn, quarterContent);
            listContainer.appendChild(quarterSection);
        }
    });
}

// Preview 업데이트
function updatePreview() {
    const preview = document.getElementById("preview-list");
    const nextBtn = document.getElementById("step1-next-btn");
    preview.innerHTML = "";

    songNominateState.selectedItems.forEach(song => {
        const div = document.createElement("div");
        div.className = "preview-item";
        div.textContent = `${song.animeTitle.substring(0,10)}.. - ${song.title}`;

        div.onclick = () => {
            songNominateState.selectedItems = songNominateState.selectedItems.filter(s => s.uniqueId !== song.uniqueId);
            renderSongStep1(songNominateState.theme); // 메인 리스트 갱신
            updatePreview();
        };
        preview.appendChild(div);
    });

    if(nextBtn) nextBtn.disabled = songNominateState.selectedItems.length === 0;
}

// Step 2 렌더링 (최종 선택)
function renderSongStep2(container) {
    container.innerHTML = `<h2 class="step2-title">최종 후보 결정</h2>`;
    const grid = document.createElement("div");
    grid.className = "step2-grid";

    songNominateState.selectedItems.forEach(song => {
        const card = document.createElement("div");
        card.className = "song-card";
        card.innerHTML = `
            <div class="card-thumb">
                <img src="${song.thumbnail}">
                <a href="${song.youtube}" target="_blank" class="play-overlay" onclick="event.stopPropagation();">
                    <span class="play-icon">▶</span>
                </a>
            </div>
            <div class="card-info">
                <div class="anime-title">${song.animeTitle}</div>
                <div class="song-title">${song.title}</div>
                <div class="song-singer">${song.artist}</div>
            </div>
        `;

        card.onclick = () => {
            document.querySelectorAll(".song-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            songNominateState.finalWinner = song;
            const awardBtn = document.getElementById("step2-award-btn");
            if(awardBtn) awardBtn.disabled = false;
        };
        grid.appendChild(card);
    });
    container.appendChild(grid);
}

// 결과 저장
function saveSongAwardResult() {
    const award = songNominateState.currentAward;
    const winner = songNominateState.finalWinner;
    if (!award || !winner) return;

    const stored = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    stored[award.name] = {
        theme: songNominateState.theme,
        animeTitle: winner.animeTitle,
        title: winner.title,
        singer: winner.artist,
        thumbnail: winner.thumbnail,
        youtube: winner.youtube
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(stored));
}

// UI 전환 로직
function toggleSongStepUI() {
    const s1 = document.getElementById("step1-buttons");
    const s2 = document.getElementById("step2-buttons");
    const pre = document.getElementById("step1-preview");

    if (songNominateState.step === 1) {
        if(s1) s1.style.display = "flex";
        if(s2) s2.style.display = "none";
        if(pre) pre.style.display = "flex";
    } else {
        if(s1) s1.style.display = "none";
        if(s2) s2.style.display = "flex";
        if(pre) pre.style.display = "none";
    }
}

// 초기화 및 이벤트 바인딩
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(location.search);
    const theme = params.get("theme"); // "opening" or "ending"
    const awardName = params.get("awardName");

    songNominateState.theme = theme;
    songNominateState.currentAward = { name: awardName };

    renderSongStep1(theme);
    
    // 버튼 바인딩
    document.getElementById("step1-back-btn").onclick = () => history.back();
    
    document.getElementById("step1-next-btn").onclick = () => {
        songNominateState.step = 2;
        toggleSongStepUI();
        renderSongStep2(document.getElementById("left-area"));
    };

    document.getElementById("step2-back-btn").onclick = () => {
        songNominateState.step = 1;
        toggleSongStepUI();
        renderSongStep1(songNominateState.theme);
    };

    document.getElementById("step2-award-btn").onclick = () => {
        if (!songNominateState.finalWinner) return;
        saveSongAwardResult();
        openSongAwardPopup();
    };
});

function openSongAwardPopup() {
    const popup = document.getElementById("winner-popup");
    const thumb = document.getElementById("winner-thumb");
    const title = document.getElementById("winner-title");
    const winner = songNominateState.finalWinner;

    if (!winner) return;

    // 1. 데이터 셋팅 (이미지 및 제목)
    thumb.src = winner.thumbnail;
    title.innerHTML = `
        <div style="font-size: 0.7em; opacity: 0.8; margin-bottom: 5px;">${winner.animeTitle}</div>
        <div>${winner.title}</div>
    `;

    // 2. 유튜브 재생 버튼 생성 또는 업데이트
    // 썸네일 클릭 시 이동하거나 버튼을 띄우기 위해 부모 노드에 접근합니다.
    let playLink = document.getElementById("popup-youtube-link");
    
    if (!playLink) {
        // 버튼이 없으면 새로 생성하여 이미지 뒤에 삽입
        playLink = document.createElement("a");
        playLink.id = "popup-youtube-link";
        playLink.className = "popup-play-overlay";
        playLink.target = "_blank";
        playLink.innerHTML = `<span class="popup-play-icon">▶</span>`;
        // thumb(img) 요소 다음에 버튼을 배치
        thumb.parentNode.insertBefore(playLink, thumb.nextSibling);
    }
    
    // 유튜브 URL 업데이트
    playLink.href = winner.youtube;

    // 3. 팝업 활성화 및 폭죽
    popup.classList.add("active");
    fireConfetti();

    document.getElementById("go-main-btn").onclick = () => {
        location.href = "../main/main.html";
    };
}

// 🎉 화려한 폭죽 연출 함수
function fireConfetti() {
  const duration = 3 * 1000; // 3초 동안 발사
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 }; // 팝업보다 위에 보이게 zIndex 조절

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // 왼쪽에서 쏘기
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      origin: { x: 0.2, y: 0.7 } 
    }));
    // 오른쪽에서 쏘기
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      origin: { x: 0.8, y: 0.7 } 
    }));
  }, 250);
}