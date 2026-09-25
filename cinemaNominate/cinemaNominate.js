const cinemaState = {
    selectedMovie: null,
    awardName: "올해의 시네마 상"
};

const movies = (typeof cinemaData_2026 !== 'undefined')
    ? SeasonFilter.filterAnimeList(cinemaData_2026)
    : [];

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const urlAwardName = params.get("awardName");
    if (urlAwardName) cinemaState.awardName = urlAwardName;

    const stepTitleEl = document.getElementById("step-title");
    if (stepTitleEl) {
        stepTitleEl.textContent = `${SeasonFilter.toDisplayAwardName(cinemaState.awardName)} 부문`;
    }

    renderCards(movies);
    initSearch();
    NominateCommon.waitForFirebaseAndListen(() => cinemaState.awardName);
});

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.placeholder = "영화 제목 또는 제작사 검색";
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = movies.filter(movie => {
            const title = String(movie.title || '').toLowerCase();
            const studios = Array.isArray(movie.studio) ? movie.studio : [];
            return title.includes(query) || studios.some(studio => String(studio).toLowerCase().includes(query));
        });
        renderCards(filtered, query);
    });
}

function renderCards(data, searchTerm = "") {
    const grid = document.getElementById("cardGrid");
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = '<p style="color:var(--gold); padding:40px; grid-column:1/-1; text-align:center;">검색된 영화가 없습니다.</p>';
        return;
    }

    grid.innerHTML = data.map(movie => {
        const isSelected = cinemaState.selectedMovie && cinemaState.selectedMovie.id === movie.id;
        const displayTitle = highlightSearchTerm(movie.title, searchTerm);
        const displayStudio = Array.isArray(movie.studio) && movie.studio.length
            ? movie.studio.join(', ')
            : '제작사 불명';

        return `
            <div class="card ${isSelected ? 'selected' : ''}"
                 id="card-${movie.id}"
                 data-category="${escapeHtml(cinemaState.awardName)}"
                 data-anime-id="${escapeHtml(movie.title)}"
                 onclick="selectMovie(${Number(movie.id)})">
                <div class="card-selection-rate" style="display:none;">0%</div>
                <div class="media-box">
                    <img src="../${movie.thumbnail}" alt="${escapeHtml(movie.title)}" onerror="this.src='https://dummyimage.com/200x300/333/d4af37&text=No+Image'">
                </div>
                <div class="card-info">
                    <div class="card-title">${displayTitle}</div>
                    <div class="card-studio">${escapeHtml(displayStudio)}</div>
                </div>
            </div>
        `;
    }).join('');

    NominateCommon.applyVoteBadges();
}

function highlightSearchTerm(text, searchTerm) {
    const safeText = escapeHtml(text || '');
    if (!searchTerm) return safeText;
    const escapedTerm = escapeRegExp(searchTerm);
    return safeText.replace(new RegExp(escapedTerm, 'gi'), match => `<span style="color:var(--gold);">${match}</span>`);
}

function selectMovie(id) {
    const movie = movies.find(item => item.id === id);
    if (!movie) return;

    cinemaState.selectedMovie = movie;
    document.querySelectorAll('.card').forEach(card => card.classList.remove('selected'));

    const currentCard = document.getElementById(`card-${movie.id}`);
    if (currentCard) currentCard.classList.add('selected');

    const awardBtn = document.getElementById('btn-award');
    if (awardBtn) awardBtn.disabled = false;
}

function saveCinemaWinner() {
    const winner = cinemaState.selectedMovie;
    if (!winner) return;

    const savedWinner = {
        id: winner.id,
        title: winner.title,
        thumbnail: winner.thumbnail,
        year: winner.year,
        quarter: winner.quarter,
        studio: winner.studio,
        staff: winner.staff
    };

    try {
        ResultStorage.saveOne(cinemaState.awardName, savedWinner);
        console.log('[cinemaNominate] 수상 결과 저장 완료:', ResultStorage.getSeasonKey(), cinemaState.awardName, savedWinner);
    } catch (error) {
        console.error('[cinemaNominate] 수상 결과 저장 실패:', error);
        return;
    }

    if (window.submitSingleAwardToDB) {
        window.submitSingleAwardToDB(cinemaState.awardName);
    }

    showWinnerCelebration(winner);
}

function showWinnerCelebration(winner) {
    const popup = document.getElementById("winner-popup");
    if (!popup) return;

    const displayStudio = Array.isArray(winner.studio) && winner.studio.length ? winner.studio.join(', ') : '-';
    const displayDirector = winner.staff && Array.isArray(winner.staff.director) ? winner.staff.director.join(', ') : '-';
    const displayWriter = winner.staff && Array.isArray(winner.staff.scriptwriter) ? winner.staff.scriptwriter.join(', ') : '-';
    const displayCharDesign = winner.staff && Array.isArray(winner.staff.character_design) ? winner.staff.character_design.join(', ') : '-';

    popup.innerHTML = `
        <div class="modal-content celebration-modal">
            <h2 class="modal-header">FINAL WINNER</h2>
            <hr class="modal-divider">
            <div class="winner-poster">
                <img src="../${winner.thumbnail}" alt="${escapeHtml(winner.title)}">
            </div>
            <h1 class="winner-title">${escapeHtml(winner.title)}</h1>
            <div class="winner-details">
                <div class="detail-item"><span class="detail-label">Studio</span><span class="detail-value">${escapeHtml(displayStudio)}</span></div>
                <div class="detail-item"><span class="detail-label">Director</span><span class="detail-value">${escapeHtml(displayDirector)}</span></div>
                <div class="detail-item"><span class="detail-label">Scriptwriter</span><span class="detail-value">${escapeHtml(displayWriter)}</span></div>
                <div class="detail-item"><span class="detail-label">Character Design</span><span class="detail-value">${escapeHtml(displayCharDesign)}</span></div>
            </div>
            <button class="gold-btn full-width" onclick="location.href='../index.html'">결과 저장 및 메인으로</button>
        </div>
    `;
    popup.classList.remove('hidden');
    NominateCommon.fireConfetti();
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
