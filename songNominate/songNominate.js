const songNominateState = {
    theme: null,            // "opening" | "ending"
    step: 1,
    selectedItems: [],
    finalWinner: null,
    awardName: null   // ✅ currentAward → awardName (다른 파일들과 통일)
};
const dayMap = {
    "mondays": "월요일", "tuesdays": "화요일", "wednesdays": "수요일", "thursdays": "목요일",
    "fridays": "금요일", "saturdays": "토요일", "sundays": "일요일", "anomaly": "변칙 편성", "web": "웹", "cinema": "극장판"
};

// 유틸: 유튜브 썸네일 추출
function ytThumb(url) {
    if (!url) return "../image/no-image.svg";
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
    else if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "../image/no-image.svg";
}

function getMergedSongData(themeType) {
    const { year, quarter, quarters } = SeasonFilter.getSelectedSeason();
    const type = themeType === 'opening' ? 'op' : 'ed';
    const works = buildSongBundles(AnimeSongs, AnimeList, year, quarter, type);
    const result = {};
    for (const work of works) {
        for (const track of work.tracks) {
            const visibleQuarters = track.quarter.filter(q => !quarter || quarter === '모든 분기' || quarters.includes(q));
            for (const q of visibleQuarters.length ? visibleQuarters : ['분기 확인 필요']) {
                (result[q] ||= []).push({
                    uniqueId: JSON.stringify([work.id, type, track.title, track.artist, track.youtube]),
                    id: work.id, animeTitle: work.animeTitle, title: track.title,
                    artist: track.artist, youtube: track.youtube, thumbnail: ytThumb(track.youtube),
                    day: work.day, displayQuarter: q
                });
            }
        }
    }
    return result;
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(location.search);
    const theme = params.get("theme");
    const awardName = params.get("awardName");

    songNominateState.theme = theme;
    songNominateState.awardName = awardName;
    document.getElementById("step-title-display").textContent = `${SeasonFilter.toDisplayAwardName(songNominateState.awardName)}` + " 부문";

    renderSongStep1();

    document.getElementById("song-search").addEventListener("input", (e) => {
        renderFilteredList(e.target.value.toLowerCase());
    });

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
        renderSongStep1();
    };

    document.getElementById("step2-award-btn").onclick = () => {
        if (!songNominateState.finalWinner) return;
        saveSongAwardResult();
        openSongAwardPopup();
    };

    document.getElementById("close-modal-btn").onclick = () => {
        document.getElementById("winner-popup").classList.remove("active");
    };

    window.NominateCommon.waitForFirebaseAndListen(
        () => songNominateState.awardName
    );
});

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
    const selectedQuarter = SeasonFilter.getSelectedSeason().quarter;
    const showQuarterAccordion = SeasonFilter.showQuarterAccordion();

    Object.entries(mergedData).sort(([a], [b]) => {
        const order = ['1분기', '2분기', '3분기', '4분기'];
        const rank = q => order.includes(q) ? order.indexOf(q) : order.length;
        return rank(a) - rank(b) || a.localeCompare(b, 'ko');
    }).forEach(([quarter, songs]) => {
        const filteredSongs = songs.filter(song => 
            (song.animeTitle?.toLowerCase() || "").includes(query) || 
            (song.title?.toLowerCase() || "").includes(query) ||
            (song.artist?.toLowerCase() || "").includes(query)
        );

        if (filteredSongs.length > 0) {
            let quarterSection = null;
            let quarterContent = listContainer;
            if (showQuarterAccordion) {
                quarterSection = document.createElement("div");
                quarterSection.className = "quarter-section";
                const quarterBtn = document.createElement("button");
                quarterBtn.className = `quarter-btn ${isSearching ? "active" : ""}`;
                quarterBtn.innerHTML = `<span>${quarter}</span><i class="fas fa-chevron-down"></i>`;
                quarterContent = document.createElement("div");
                quarterContent.className = `quarter-content ${isSearching ? "active" : ""}`;
                quarterBtn.onclick = () => {
                    quarterBtn.classList.toggle("active");
                    quarterContent.classList.toggle("active");
                };
                quarterSection.append(quarterBtn, quarterContent);
            }

            const groupedByDay = {};
            filteredSongs.forEach(song => {
                if (!groupedByDay[song.day]) groupedByDay[song.day] = [];
                groupedByDay[song.day].push(song);
            });

            Object.entries(groupedByDay).sort(([a], [b]) => {
            const english = ['mondays', 'tuesdays', 'wednesdays', 'thursdays', 'fridays', 'saturdays', 'sundays', 'anomaly', 'web', 'cinema'];
            const korean = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '변칙편성', '웹', '극장판'];
            const rank = value => {
                const key = String(value).toLowerCase().replace(/\s/g, '');
                const index = Math.max(english.indexOf(key), korean.indexOf(key));
                return index < 0 ? 10 : index;
            };
            return rank(a) - rank(b) || a.localeCompare(b, 'ko');
        }).forEach(([day, daySongs]) => {
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

            if (showQuarterAccordion) listContainer.appendChild(quarterSection);
        }
    });
    window.NominateCommon.applyVoteBadges();
}

function createSongCard(song) {
    const item = document.createElement("div");
    item.className = "song-card";
    item.dataset.selectionId = song.uniqueId;

    item.setAttribute('data-category', songNominateState.awardName);
    item.setAttribute('data-anime-id', song.title);

    if (songNominateState.selectedItems.some(s => s.uniqueId === song.uniqueId)) {
        item.classList.add("selected");
    }

    const rateBadge = document.createElement("div");
    rateBadge.className = "card-selection-rate";
    rateBadge.style.display = "none";
    rateBadge.textContent = "0/0";

    const thumb = document.createElement("div");
    thumb.className = "card-thumb";

    const img = document.createElement("img");
    img.src = song.thumbnail;
    img.alt = "thumbnail";

    const playOverlay = document.createElement("a");
    playOverlay.className = "play-overlay";
    playOverlay.href = song.youtube;
    playOverlay.target = "_blank";
    playOverlay.onclick = (e) => e.stopPropagation();
    playOverlay.innerHTML = `<span class="play-icon">▶</span>`;

    thumb.appendChild(img);
    thumb.appendChild(playOverlay);

    const cardInfo = document.createElement("div");
    cardInfo.className = "card-info";

    const animeTitle = document.createElement("div");
    animeTitle.className = "anime-title";
    animeTitle.textContent = song.animeTitle;

    const songTitle = document.createElement("div");
    songTitle.className = "song-title";
    songTitle.textContent = song.title;

    const songSinger = document.createElement("div");
    songSinger.className = "song-singer";
    songSinger.textContent = song.artist || "";

    cardInfo.appendChild(animeTitle);
    cardInfo.appendChild(songTitle);
    cardInfo.appendChild(songSinger);

    item.appendChild(rateBadge);
    item.appendChild(thumb);
    item.appendChild(cardInfo);

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

function updatePreview() {
    if (songNominateState.step === 1) NominateCommon.syncCandidateSelection(songNominateState.selectedItems, "uniqueId");
    const preview = document.getElementById("preview-list");
    const nextBtn = document.getElementById("step1-next-btn");
    preview.innerHTML = "";

    songNominateState.selectedItems.forEach(song => {
        const div = document.createElement("div");
        div.className = "preview-item";
        div.innerHTML = `${song.title} <br><small style="color:#888;">${song.animeTitle}</small>`;
        
        div.onclick = () => {
            songNominateState.selectedItems = songNominateState.selectedItems.filter(s => s.uniqueId !== song.uniqueId);
            renderFilteredList(document.getElementById("song-search").value.toLowerCase());
            updatePreview();
        };
        preview.appendChild(div);
    });

    if(nextBtn) nextBtn.disabled = songNominateState.selectedItems.length === 0;
}

function renderSongStep2() {
    const container = document.getElementById("left-area");
    container.innerHTML = `<h2 style="color:var(--gold); margin-bottom:20px; font-size: 1.5rem;">최종 수상작을 선택하세요</h2>`;

    const grid = document.createElement("div");
    grid.id = "step2-grid"; 

    songNominateState.selectedItems.forEach(song => {
        const card = document.createElement("div");
        card.className = "step2-song-card";

        const displayQuarter = song.displayQuarter ? song.displayQuarter.replace("Q", "") : "";

        card.innerHTML = `
            <div class="card-badge">${displayQuarter}</div>
            <div class="card-thumb">
                <img src="${song.thumbnail}" alt="thumbnail" onerror="this.src='../image/no-image.svg'">
                <a class="play-overlay" href="${song.youtube}" target="_blank" onclick="event.stopPropagation();">
                    <span class="play-icon">▶</span>
                </a>
            </div>
            <div class="step2-card-info">
                <div class="card-title">${song.title}</div>
                <div class="card-studio">${song.artist ? song.artist + ' · ' : ''}${song.animeTitle}</div>
            </div>
        `;

        card.onclick = () => {
            document.querySelectorAll(".step2-song-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            songNominateState.finalWinner = song;
            document.getElementById("step2-award-btn").disabled = false;
        };
        grid.appendChild(card);
    });
    container.appendChild(grid);
}

function toggleSongStepUI() {
    const isStep1 = songNominateState.step === 1;
    document.getElementById("step1-buttons").classList.toggle("hidden", !isStep1);
    document.getElementById("step2-buttons").classList.toggle("hidden", isStep1);
    document.getElementById("step1-preview").classList.toggle("hidden", !isStep1);
    document.querySelector('.search-container').style.display = isStep1 ? 'block' : 'none';
}

function saveSongAwardResult() {
    const award = songNominateState.awardName;
    const winner = songNominateState.finalWinner;
    if (!award || !winner) return;

    ResultStorage.saveOne(award, {
        theme: songNominateState.theme,
        animeTitle: winner.animeTitle,
        title: winner.title,
        singer: winner.artist,
        thumbnail: winner.thumbnail,
        youtube: winner.youtube
    });
    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(award);
    }
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
    window.NominateCommon.fireConfetti();

    document.getElementById("go-main-btn").onclick = () => {
        location.href = "../index.html";
    };
}
