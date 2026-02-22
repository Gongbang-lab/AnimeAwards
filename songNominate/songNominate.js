const songNominateState = {
    theme: null,            // "opening" | "ending"
    step: 1,
    selectedItems: [],
    finalWinner: null,
    currentAward: null
};

const dayMap = {
    "mondays": "월요일", "tuesdays": "화요일", "wednesdays": "수요일", "thursdays": "목요일",
    "fridays": "금요일", "saturdays": "토요일", "sundays": "일요일", "anomaly": "변칙 편성", "web": "웹"
};

// 유틸: 유튜브 썸네일 추출
function ytThumb(url) {
    if (!url) return "../images/default.png";
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
    else if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "../images/default.png";
}

function getMergedSongData(themeType) {
    const targetType = themeType === "opening" ? "op" : "ed";
    const result = {};

    // 1. AnimeList가 배열이므로, ID를 키로 하여 요일(day) 정보를 빠르게 찾을 수 있는 Map 생성
    const animeInfoMap = {};
    if (typeof AnimeList !== 'undefined' && Array.isArray(AnimeList)) {
        AnimeList.forEach(anime => {
            animeInfoMap[anime.id] = anime;
        });
    } else {
        console.error("AnimeList 데이터를 찾을 수 없습니다.");
        return {};
    }

    // 2. AnimeSongs 구조 분석 (예: "1Q": [...], "2Q": [...] 등)
    if (typeof AnimeSongs === 'undefined') return {};

    Object.entries(AnimeSongs).forEach(([quarterKey, animeGroups]) => {
        const filteredSongs = [];

        animeGroups.forEach(group => {
            // AnimeList에서 해당 애니메이션의 상세 정보(특히 요일)를 가져옴
            const baseInfo = animeInfoMap[group.id];
            
            group.songs.forEach((song, index) => {
                if (song.type === targetType) {
                    filteredSongs.push({
                        // 고유 ID: 애니ID + 타입 + 인덱스
                        uniqueId: `${group.id}-${song.type}-${index}`,
                        id: group.id, 
                        animeTitle: group.animeTitle,
                        title: song.title,
                        artist: song.artist,
                        youtube: song.youtube,
                        thumbnail: ytThumb(song.youtube),
                        // AnimeList에 정보가 있으면 해당 요일 사용, 없으면 "기타"
                        day: baseInfo ? baseInfo.day : "기타",
                        // 표시용 분기 정보 (AnimeList의 "1분기" 등을 활용하거나 quarterKey 활용)
                        displayQuarter: baseInfo ? baseInfo.quarter : quarterKey
                    });
                }
            });
        });

        if (filteredSongs.length > 0) {
            const displayKey = quarterKey;
            result[displayKey] = filteredSongs;
        }
    });

    return result;
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(location.search);
    const theme = params.get("theme");
    const awardName = params.get("awardName");

    songNominateState.theme = theme;
    songNominateState.currentAward = awardName;
    document.getElementById("step-title-display").textContent = `${songNominateState.currentAward}` + " 부문";

    renderSongStep1();

    // 검색 이벤트 연결
    document.getElementById("song-search").addEventListener("input", (e) => {
        renderFilteredList(e.target.value.toLowerCase());
    });

    // 버튼 이벤트 바인딩
    document.getElementById("step1-next-btn").onclick = () => {
        if(songNominateState.selectedItems.length === 0) return;
        songNominateState.step = 2;
        toggleSongStepUI();
        renderSongStep2();
    };

    document.getElementById("step2-back-btn").onclick = () => {
        songNominateState.step = 1;
        songNominateState.finalWinner = null;
        toggleSongStepUI();
        renderSongStep1(); // 다시 렌더링
    };

    document.getElementById("step2-award-btn").onclick = () => {
        if (!songNominateState.finalWinner) return;
        saveSongAwardResult();
        openSongAwardPopup();
    };

    document.getElementById("close-modal-btn").onclick = () => {
        document.getElementById("winner-popup").classList.remove("active");
    };
});

// Step 1 렌더링
function renderSongStep1() {
    document.getElementById("left-area").innerHTML = `<div id="nominate-list-container"></div>`;
    renderFilteredList(document.getElementById("song-search").value.toLowerCase());
}

function renderFilteredList(query) {
    const listContainer = document.getElementById("nominate-list-container");
    if (!listContainer) return;

    listContainer.innerHTML = ""; 
    const mergedData = getMergedSongData(songNominateState.theme);
    const isSearching = query.length > 0;

    Object.entries(mergedData).forEach(([quarter, songs]) => {
        const filteredSongs = songs.filter(song => 
            song.animeTitle.toLowerCase().includes(query) || 
            song.title.toLowerCase().includes(query) ||
            (song.artist && song.artist.toLowerCase().includes(query))
        );

        if (filteredSongs.length > 0) {
            const quarterSection = document.createElement("div");
            quarterSection.className = "quarter-section";

            // 분기 버튼
            const quarterBtn = document.createElement("button");
            quarterBtn.className = `quarter-btn ${isSearching ? "active" : ""}`;
            quarterBtn.innerHTML = `<span>${quarter.replace("Q", "")}분기</span><i class="fas fa-chevron-down"></i>`;

            const quarterContent = document.createElement("div");
            quarterContent.className = `quarter-content ${isSearching ? "active" : ""}`;

            quarterBtn.onclick = () => {
                quarterBtn.classList.toggle("active");
                quarterContent.classList.toggle("active");
            };

            const groupedByDay = {};
            filteredSongs.forEach(song => {
                if (!groupedByDay[song.day]) groupedByDay[song.day] = [];
                groupedByDay[song.day].push(song);
            });

            // 요일 버튼 및 카드 그리드
            Object.entries(groupedByDay).forEach(([day, daySongs]) => {
                const dayBtn = document.createElement("button");
                dayBtn.className = `day-btn ${isSearching ? "active" : ""}`;
                dayBtn.innerHTML = `<span>${dayMap[day.toLowerCase()] || day}</span><i class="fas fa-plus"></i>`;

                const dayList = document.createElement("div");
                dayList.className = `day-content ${isSearching ? "active" : ""}`;

                dayBtn.onclick = () => {
                    dayBtn.classList.toggle("active");
                    dayList.classList.toggle("active");
                };

                daySongs.forEach(song => {
                    dayList.appendChild(createSongCard(song));
                });

                quarterContent.append(dayBtn, dayList);
            });

            quarterSection.append(quarterBtn, quarterContent);
            listContainer.appendChild(quarterSection);
        }
    });
}

// 카드 생성 공통 함수
function createSongCard(song) {
    const item = document.createElement("div");
    item.className = "song-card";
    
    if (songNominateState.selectedItems.some(s => s.uniqueId === song.uniqueId)) {
        item.classList.add("selected");
    }

    item.innerHTML = `
        <div class="card-thumb">
            <img src="${song.thumbnail}" alt="thumbnail">
            <a class="play-overlay" href="${song.youtube}" target="_blank" onclick="event.stopPropagation();">
                <span class="play-icon">▶</span>
            </a>
        </div>
        <div class="card-info">
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
    return item;
}

// Preview 업데이트
function updatePreview() {
    const preview = document.getElementById("preview-list");
    const nextBtn = document.getElementById("step1-next-btn");
    preview.innerHTML = "";

    songNominateState.selectedItems.forEach(song => {
        const div = document.createElement("div");
        div.className = "preview-item";
        div.innerHTML = `${song.title} <br><small style="color:#888;">${song.animeTitle}</small>`;
        
        div.onclick = () => {
            songNominateState.selectedItems = songNominateState.selectedItems.filter(s => s.uniqueId !== song.uniqueId);
            renderFilteredList(document.getElementById("song-search").value.toLowerCase()); // UI 갱신
            updatePreview();
        };
        preview.appendChild(div);
    });

    if(nextBtn) nextBtn.disabled = songNominateState.selectedItems.length === 0;
}

// Step 2 (최종 선택) 렌더링
function renderSongStep2() {
    const container = document.getElementById("left-area");
    container.innerHTML = `<h2 class="step-title">최종 후보 결정</h2>`;
    
    const grid = document.createElement("div");
    grid.className = "step2-grid";

    songNominateState.selectedItems.forEach(song => {
        const card = createSongCard(song);
        // Step 2에서는 다중선택이 아닌 단일 선택 모드로 변경
        card.className = "song-card"; // selected 초기화
        card.onclick = () => {
            document.querySelectorAll(".song-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            songNominateState.finalWinner = song;
            document.getElementById("step2-award-btn").disabled = false;
        };
        grid.appendChild(card);
    });
    container.appendChild(grid);
}

// UI 토글 (Step 1 <-> Step 2)
function toggleSongStepUI() {
    const isStep1 = songNominateState.step === 1;
    document.getElementById("step1-buttons").classList.toggle("hidden", !isStep1);
    document.getElementById("step2-buttons").classList.toggle("hidden", isStep1);
    document.getElementById("step1-preview").classList.toggle("hidden", !isStep1);
    document.querySelector('.search-container').style.display = isStep1 ? 'block' : 'none';
}

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

function openSongAwardPopup() {
    const popup = document.getElementById("winner-popup");
    const winner = songNominateState.finalWinner;

    document.getElementById("winner-thumb").src = winner.thumbnail;
    document.getElementById("popup-youtube-link").href = winner.youtube;
    
    document.getElementById("winner-anime").textContent = winner.animeTitle;
    document.getElementById("winner-title").textContent = winner.title;
    document.getElementById("winner-artist").textContent = winner.artist || "정보 없음";

    popup.classList.add("active");
    fireConfetti();

    document.getElementById("go-main-btn").onclick = () => {
        location.href = "../main/main.html";
    };
}

// 🎉 폭죽 연출
function fireConfetti() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 };

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    
    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: 0.2, y: 0.7 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: 0.8, y: 0.7 } }));
  }, 250);
}