const cinemaState = {
    selectedMovie: null,
    awardName: "올해의 시네마 상"
};

const movies = (typeof cinemaData !== 'undefined') ? cinemaData : [];

document.addEventListener("DOMContentLoaded", () => {
    renderCards(movies);

    const searchInput = document.getElementById('searchInput');
    const autocompleteList = document.getElementById('autocompleteList');

    // 검색 로직
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = movies.filter(m => m.title.toLowerCase().includes(query));
            renderCards(filtered);

            autocompleteList.innerHTML = '';
            if (query && filtered.length > 0) {
                autocompleteList.style.display = 'block';
                filtered.slice(0, 5).forEach(m => {
                    const item = document.createElement('div');
                    item.innerText = m.title;
                    item.onclick = () => {
                        searchInput.value = m.title;
                        renderCards([m]);
                        autocompleteList.style.display = 'none';
                    };
                    autocompleteList.appendChild(item);
                });
            } else {
                autocompleteList.style.display = 'none';
            }
        });
    }
});

function renderCards(data) {
    const grid = document.getElementById("cardGrid");
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = '<p style="color:var(--gold); padding:20px; grid-column: 1/-1; text-align:center;">검색된 영화가 없습니다.</p>';
        return;
    }

    grid.innerHTML = data.map(movie => {
        const isSelected = cinemaState.selectedMovie && cinemaState.selectedMovie.title === movie.title;
        // 요청사항: zoom-btn 삭제
        return `
            <div class="card ${isSelected ? 'selected' : ''}" id="card-${movie.title.replace(/\s/g, '')}" onclick="selectMovie('${movie.title}')">
                <div class="media-box">
                    <img src="${movie.thumbnail}" alt="${movie.title}" onerror="this.src='https://dummyimage.com/200x300/333/d4af37&text=No+Image'">
                </div>
                <div class="card-info">
                    <div class="card-title">${movie.title}</div>
                    <div class="card-studio">${movie.studio}</div>
                </div>
            </div>
        `;
    }).join('');
}

function selectMovie(title) {
    const movie = movies.find(m => m.title === title);
    if (!movie) return;

    cinemaState.selectedMovie = movie;
    
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    const currentId = `card-${movie.title.replace(/\s/g, '')}`;
    const currentCard = document.getElementById(currentId);
    if (currentCard) currentCard.classList.add('selected');

    updatePreviewBox();

    const awardBtn = document.getElementById('btn-award');
    if (awardBtn) awardBtn.disabled = false;
}

function updatePreviewBox() {
    const box = document.getElementById('preview-box');
    const movie = cinemaState.selectedMovie;
    if (!movie) return;

    box.innerHTML = `
        <div class="preview-content animate-fade">
            <img src="${movie.thumbnail}" class="preview-img">
            <h3 class="preview-title">${movie.title}</h3>
            <div class="preview-details">
                <div class="detail-row"><span>Studio</span><strong>${movie.studio}</strong></div>
                <div class="detail-row"><span>Director</span><strong>${movie.director}</strong></div>
                <div class="detail-row"><span>Writer</span><strong>${movie.writer}</strong></div>
            </div>
        </div>
    `;
}

function saveCinemaWinner() {
    const winner = cinemaState.selectedMovie;
    if (!winner) return;

    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results[cinemaState.awardName] = {
        title: winner.title,
        thumbnail: winner.thumbnail,
        studio: winner.studio
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));

    showWinnerCelebration(winner);
}

function showWinnerCelebration(winner) {
    const popup = document.getElementById("winner-popup");
    if (!popup) return;

    popup.innerHTML = `
        <div class="modal-content celebration-modal">
            <h2 class="modal-header">🏆 ${cinemaState.awardName} 수상 🏆</h2>
            <hr class="modal-divider">
            <div class="winner-poster">
                <img src="${winner.thumbnail}">
            </div>
            <h1 class="winner-title">${winner.title}</h1>
            <p class="winner-info">${winner.studio} · 감독: ${winner.director}</p>
            <button class="gold-btn full-width" onclick="location.href='../main/main.html'">결과 저장 및 메인으로</button>
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