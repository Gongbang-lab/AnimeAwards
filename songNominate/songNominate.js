//상태 관리
const songNominateState = {
  theme: null,            // opening | ending | ost
  step: 1,
  selectedItems: [],
  finalWinner: null
};
//유틸
function ytThumb(url) {
  return url.replace("watch?v=", "embed/") + "/maxresdefault.jpg";
}
//데이터 선택
function getSongSourceByTheme(theme) {

  if (theme === "opening") return AnimeOpeningSongs;
  if (theme === "ending") return AnimeEndingSongs;
  if (theme === "ost") return AnimeOSTSongs;
  return null;
}
 //animeId → animeData 병합
function mergeSongs(songData) {
  const result = {};

  Object.entries(songData).forEach(([quarter, songs]) => {
    result[quarter] = songs.map(song => {
      const anime = AnimeData.find(a => a.id === song.animeId);
      return {
        ...song,
        animeTitle: anime?.title || "Unknown",
        day: anime?.day || "기타",
        thumbnail: ytThumb(song.youtube),
      };
    });
  });

  return result;
}
//Step1 렌더
function renderSongStep1(theme) {
  songNominateState.theme = theme;

  const container = document.getElementById("left-area");
  container.innerHTML = "";

  const songSource = getSongSourceByTheme(theme);
  const mergedData = mergeSongs(songSource);

  Object.entries(mergedData).forEach(([quarter, songs]) => {
    const quarterSection = document.createElement("div");
    quarterSection.className = "quarter-section";

    /* 분기 버튼 */
    const quarterBtn = document.createElement("button");
    quarterBtn.className = "quarter-btn";
    quarterBtn.textContent = quarter;

    const quarterContent = document.createElement("div");
    quarterContent.className = "quarter-content";
    quarterContent.style.display = "none";

    quarterBtn.onclick = () => {
      const open = quarterContent.style.display === "block";
      quarterContent.style.display = open ? "none" : "block";
      quarterBtn.classList.toggle("active", !open);
    };

    /* 요일 그룹 */
    const groupedByDay = {};
    songs.forEach(song => {
      if (!groupedByDay[song.day]) groupedByDay[song.day] = [];
      groupedByDay[song.day].push(song);
    });

    Object.entries(groupedByDay).forEach(([day, daySongs]) => {
      const daySection = document.createElement("div");
      daySection.className = "day-section";

      const dayBtn = document.createElement("button");
      dayBtn.className = "day-btn";
      dayBtn.textContent = day;

      const dayList = document.createElement("div");
      dayList.className = "song-list";
      dayList.style.display = "none";

      dayBtn.onclick = () => {
        const open = dayList.style.display === "block";
        dayList.style.display = open ? "none" : "block";
        dayBtn.classList.toggle("active", !open);
      };

      /* 곡 카드 */
      daySongs.forEach(song => {
        const item = document.createElement("div");
        item.className = "song-item";

        item.innerHTML = `
          <div class="song-thumb">
            <img src="${song.thumbnail}">
          </div>
          <div class="song-info">
            <div class="anime-title">${song.animeTitle}</div>
            <div class="song-title">${song.title}</div>
            <div class="song-singer">${song.singer}</div>
          </div>
          <a class="youtube-link" href="${song.youtube}" target="_blank">
            ▶
          </a>
        `;

        item.onclick = (e) => {
          if (e.target.closest(".youtube-link")) return;

          const exists = songNominateState.selectedItems.some(
            s => s.id === song.id
          );

          if (exists) {
            songNominateState.selectedItems =
              songNominateState.selectedItems.filter(s => s.id !== song.id);
            item.classList.remove("selected");
          } else {
            songNominateState.selectedItems.push(song);
            item.classList.add("selected");
          }

          updatePreview();
        };

        dayList.appendChild(item);
      });

      daySection.append(dayBtn, dayList);
      quarterContent.appendChild(daySection);
    });

    quarterSection.append(quarterBtn, quarterContent);
    container.appendChild(quarterSection);
  });
}
//Preview
function updatePreview() {
  const preview = document.getElementById("preview-list");
  const nextBtn = document.getElementById("step1-next-btn");

  preview.innerHTML = "";

  songNominateState.selectedItems.forEach(song => {
    const div = document.createElement("div");
    div.className = "preview-item";
    div.textContent = `${song.animeTitle} - ${song.title}`;

    div.onclick = () => {
      songNominateState.selectedItems =
        songNominateState.selectedItems.filter(s => s.id !== song.id);

      document
        .querySelectorAll(".song-item")
        .forEach(el => {
          if (el.innerText.includes(song.title)) {
            el.classList.remove("selected");
          }
        });

      updatePreview();
    };

    preview.appendChild(div);
  });

  nextBtn.disabled = songNominateState.selectedItems.length === 0;
}
//버튼 바인딩
function bindButtons() {
  document.getElementById("step1-back-btn").onclick = () => {
    location.href = "../main.html";
  };
}
//초기 실행
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const theme = params.get("theme");

  renderSongStep1(theme);
  bindButtons();
});
//step 2 진입함수
function goSongStep2() {
  songNominateState.step = 2;
  songNominateState.finalWinner = null;

  toggleSongStepUI();

  const left = document.getElementById("left-area");
  left.innerHTML = "";

  renderSongStep2(left);
}
//step 2 카드 랜더
function renderSongStep2(container) {
  const title = document.createElement("h2");
  title.className = "step2-title";
  title.textContent = "최종 후보";

  const grid = document.createElement("div");
  grid.className = "step2-grid";

  songNominateState.selectedItems.forEach(song => {
    const card = document.createElement("div");
    card.className = "song-card";

    card.innerHTML = `
      <div class="card-thumb">
        <img src="${song.thumbnail}">
      </div>
      <div class="card-info">
        <div class="anime-title">${song.animeTitle}</div>
        <div class="song-title">${song.title}</div>
        <div class="song-singer">${song.singer}</div>
      </div>
    `;

    card.onclick = () => {
      document
        .querySelectorAll(".song-card")
        .forEach(c => c.classList.remove("selected"));

      card.classList.add("selected");
      songNominateState.finalWinner = song;

      document.getElementById("step2-award-btn").disabled = false;
    };

    grid.appendChild(card);
  });

  container.append(title, grid);
}
//step ui 전환
function toggleSongStepUI() {
  const step1Buttons = document.getElementById("step1-buttons");
  const step2Buttons = document.getElementById("step2-buttons");
  const preview = document.getElementById("step1-preview");

  if (songNominateState.step === 1) {
    step1Buttons.style.display = "flex";
    step2Buttons.style.display = "none";
    if (preview) preview.style.display = "block";
  } else {
    step1Buttons.style.display = "none";
    step2Buttons.style.display = "flex";
    if (preview) preview.style.display = "none";
  }
}
//수상 결과 저장
function saveSongAwardResult() {
  const award = songNominateState.currentAward;
  const winner = songNominateState.finalWinner;

  if (!award || !winner) return;

  const stored =
    JSON.parse(localStorage.getItem("anime_awards_result")) || {};

  stored[award.name] = {
    theme: award.theme,
    animeTitle: winner.animeTitle,
    title: winner.title,
    singer: winner.singer,
    thumbnail: winner.thumbnail,
    youtube: winner.youtube
  };

  localStorage.setItem(
    "anime_awards_result",
    JSON.stringify(stored)
  );
}
//팝업 오픈
function openSongAwardPopup() {
  const popup = document.getElementById("winner-popup");
  const thumb = document.getElementById("winner-thumb");
  const title = document.getElementById("winner-title");

  thumb.src = songNominateState.finalWinner.thumbnail;
  title.textContent =
    `${songNominateState.finalWinner.animeTitle} - ${songNominateState.finalWinner.title}`;

  popup.style.display = "flex";

  document.getElementById("go-main-btn").onclick = () => {
    location.href = "../main.html";
  };
}
function bindSongButtons() {
  document.getElementById("step1-next-btn").onclick = () => {
    if (songNominateState.selectedItems.length === 0) return;
    goSongStep2();
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
}
