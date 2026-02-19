document.addEventListener('DOMContentLoaded', () => {
    // 1. 데이터 할당 (cinemaData 변수 우선 참조)
    const movies = (typeof cinemaData !== 'undefined') ? cinemaData : [];
    
    console.log("로드된 시네마 데이터:", movies);

    let selectedMovie = null;

    const cardGrid = document.getElementById('cardGrid');
    const searchInput = document.getElementById('searchInput');
    const autocompleteList = document.getElementById('autocompleteList');

    // 2. 카드 렌더링 함수
    function renderCards(data) {
        if (!cardGrid) return;
        cardGrid.innerHTML = ''; 

        if (data.length === 0) {
            cardGrid.innerHTML = '<p style="color:var(--gold); padding:20px; grid-column: 1/-1; text-align:center;">표시할 영화 데이터가 없습니다.</p>';
            return;
        }

        data.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'card';
            if (selectedMovie && selectedMovie.title === movie.title) card.classList.add('selected');

            card.innerHTML = `
                <div class="info-btn" title="정보 보기">+</div>
                <img src="${movie.thumbnail}" alt="${movie.title}" onerror="this.src='https://dummyimage.com/200x300/333/d4af37&text=No+Image'">
                <div class="card-info">
                    <div class="card-title">${movie.title}</div>
                    <div class="card-studio">${movie.studio}</div>
                </div>
            `;

            // + 버튼 (상세 정보 팝업)
            card.querySelector('.info-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                window.openInfoPopup(movie);
            });

            // 카드 선택
            card.addEventListener('click', () => {
                selectedMovie = movie;
                document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });

            cardGrid.appendChild(card);
        });
    }

    renderCards(movies);

    // 3. 검색 및 자동완성 로직
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

    // 4. 모달 관련 함수 (Global)
    window.openInfoPopup = function(movie) {
        document.getElementById('infoThumb').src = movie.thumbnail;
        document.getElementById('infoTitle').innerText = movie.title;
        document.getElementById('infoStudio').innerText = movie.studio;
        document.getElementById('infoDirector').innerText = movie.director;
        document.getElementById('infoWriter').innerText = movie.writer;
        document.getElementById('infoModal').classList.add('active');
    };

    window.openAwardPopup = function() {
        if (!selectedMovie) return alert("수상할 작품을 선택해주세요.");
        document.getElementById('awardThumb').src = selectedMovie.thumbnail;
        document.getElementById('awardTitle').innerText = selectedMovie.title;
        document.getElementById('awardStudio').innerText = selectedMovie.studio;
        document.getElementById('awardDirector').innerText = selectedMovie.director;
        document.getElementById('awardWriter').innerText = selectedMovie.writer;
        document.getElementById('awardModal').classList.add('active');
    };

    window.confirmAward = function() {
        if (!selectedMovie) return;
        const result = JSON.parse(localStorage.getItem("anime_awards_result") || "{}");
        result["올해의 시네마"] = { 
            title: selectedMovie.title, 
            thumbnail: selectedMovie.thumbnail 
        };
        localStorage.setItem("anime_awards_result", JSON.stringify(result));
        window.location.href = '../main/main.html';
    };
});

function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function goToMain() { window.location.href = '../main/main.html'; }