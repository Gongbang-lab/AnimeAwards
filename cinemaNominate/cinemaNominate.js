const cinemaState = {
    selectedMovie: null,
    awardName: "올해의 시네마 상"
};

const movies = (typeof cinemaData !== 'undefined') ? cinemaData : [];

// ✅ DB 데이터 캐시
let cachedVoteData = null;

document.addEventListener("DOMContentLoaded", () => {
    renderCards(movies);

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = "영화 제목 또는 제작사 검색";
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = movies.filter(m => {
                const matchTitle = m.title.toLowerCase().includes(query);
                // studio가 배열이므로 some을 사용하여 검색
                const matchStudio = m.studio && m.studio.some(studioName => studioName.toLowerCase().includes(query));
                return matchTitle || matchStudio;
            });
            renderCards(filtered, query);
        });
    }

    waitForFirebaseAndListen();
});

function renderCards(data, searchTerm = "") {
    const grid = document.getElementById("cardGrid");
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = '<p style="color:var(--gold); padding:40px; grid-column: 1/-1; text-align:center;">검색된 영화가 없습니다.</p>';
        return;
    }

    grid.innerHTML = data.map(movie => {
        const isSelected = cinemaState.selectedMovie && cinemaState.selectedMovie.id === movie.id;

        let displayTitle = movie.title;
        if (searchTerm) {
            const regex = new RegExp(searchTerm, "gi");
            displayTitle = movie.title.replace(regex, (match) => `<span style="color:var(--gold);">${match}</span>`);
        }

        // studio 배열을 문자열로 쉼표로 연결
        const displayStudio = movie.studio ? movie.studio.join(', ') : '제작사 불명';

        return `
            <div class="card ${isSelected ? 'selected' : ''}"
                 id="card-${movie.id}"
                 data-category="${cinemaState.awardName}"
                 data-anime-id="${movie.id}"
                 onclick="selectMovie(${movie.id})">
                <div class="card-selection-rate" style="display:none;">0/0</div>
                <div class="media-box">
                    <img src="../${movie.thumbnail}" alt="${movie.title}" onerror="this.src='https://dummyimage.com/200x300/333/d4af37&text=No+Image'">
                </div>
                <div class="card-info">
                    <div class="card-title">${displayTitle}</div>
                    <div class="card-studio">${displayStudio}</div>
                </div>
            </div>
        `;
    }).join('');

    // ✅ 렌더링 완료 후 캐시 데이터로 즉시 뱃지 적용
    applyVoteBadges();
}

function selectMovie(id) {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    cinemaState.selectedMovie = movie;

    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    const currentCard = document.getElementById(`card-${movie.id}`);
    if (currentCard) currentCard.classList.add('selected');

    const awardBtn = document.getElementById('btn-award');
    if (awardBtn) awardBtn.disabled = false;
}

function saveCinemaWinner() {
    const winner = cinemaState.selectedMovie;
    if (!winner) return;

    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results[cinemaState.awardName] = {
        id: winner.id,
        title: winner.title,
        thumbnail: winner.thumbnail,
        studio: winner.studio
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));

    // ✅ Firebase DB 전송
    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(cinemaState.awardName);
    }

    showWinnerCelebration(winner);
}

function showWinnerCelebration(winner) {
    const popup = document.getElementById("winner-popup");
    if (!popup) return;

    // 새로운 staff 데이터 구조에 맞춰 변수 할당
    const displayStudio = winner.studio ? winner.studio.join(', ') : '-';
    const displayDirector = (winner.staff && winner.staff.director) ? winner.staff.director.join(', ') : '-';
    const displayWriter = (winner.staff && winner.staff.scriptwriter) ? winner.staff.scriptwriter.join(', ') : '-';
    const displayCharDesign = (winner.staff && winner.staff.character_design) ? winner.staff.character_design.join(', ') : '-';

    popup.innerHTML = `
        <div class="modal-content celebration-modal">
            <h2 class="modal-header">FINAL WINNER</h2>
            <hr class="modal-divider">
            <div class="winner-poster">
                <img src="../${winner.thumbnail}" alt="${winner.title}">
            </div>
            <h1 class="winner-title">${winner.title}</h1>
            <div class="winner-details">
                <div class="detail-item">
                    <span class="detail-label">Studio</span>
                    <span class="detail-value">${displayStudio}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Director</span>
                    <span class="detail-value">${displayDirector}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Scriptwriter</span>
                    <span class="detail-value">${displayWriter}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Character Design</span>
                    <span class="detail-value">${displayCharDesign}</span>
                </div>
            </div>
            <button class="gold-btn full-width" onclick="location.href='../index.html'">결과 저장 및 메인으로</button>
        </div>
    `;
    popup.classList.remove('hidden');
    fireConfetti();
}

function fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, zIndex: 9999, colors: ['#d4af37', '#ffffff'] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, zIndex: 9999, colors: ['#d4af37', '#ffffff'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

// ──────────────────────────────────────────────────────────
// Firebase 실시간 득표율 뱃지
// ──────────────────────────────────────────────────────────
function applyVoteBadges() {
    if (!cachedVoteData) return;

    const total = cachedVoteData._participants || 0;

    document.querySelectorAll('.card').forEach(card => {
        const animeId = card.getAttribute('data-anime-id'); // 이제 고유 id(예: 60610)를 가져옵니다.
        const rateBadge = card.querySelector('.card-selection-rate');
        if (!rateBadge || !animeId) return;

        const count = cachedVoteData[animeId] || 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        rateBadge.innerText = `${percent}%`;
        rateBadge.style.display = "block";
    });
}

function listenToVoteRates() {
    if (!window.fbOnValue || !window.fbDB) return;

    const categoryRef = window.fbRef(window.fbDB, `votes/categories/${cinemaState.awardName}`);

    window.fbOnValue(categoryRef, (snapshot) => {
        cachedVoteData = snapshot.val() || {};
        applyVoteBadges();
    });
}

function waitForFirebaseAndListen() {
    if (window.fbOnValue && window.fbDB) {
        listenToVoteRates();
    } else {
        setTimeout(waitForFirebaseAndListen, 300);
    }
}