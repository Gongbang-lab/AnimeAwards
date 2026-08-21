// --- 상태 관리 (다른 페이지의 charState/cinemaState/nominateState와 통일) ---
const coupleState = {
    nominees: [],
    selectedIndex: null,
    currentPopupCharacters: [],
    selectedPopupChars: []
};

const SeasonFilteredAnimeList = SeasonFilter.filterAnimeList(AnimeList);

// --- DOM 요소 ---
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const suggestionList = document.getElementById('suggestionList'); // 연관검색어 리스트
const mainArea = document.getElementById('mainArea');
const nomineeList = document.getElementById('nomineeList');
const params = new URLSearchParams(window.location.search);
const awardName = params.get("awardName");

const charModal = document.getElementById('charModal');
const closeCharModal = document.getElementById('closeCharModal');
const characterGrid = document.getElementById('characterGrid');
const modalAnimeTitle = document.getElementById('modalAnimeTitle');
const addCoupleBtn = document.getElementById('addCoupleBtn');

// 수상 관련 DOM
const awardModal = document.getElementById('awardModal');
const awardAnimeTitle = document.getElementById('awardAnimeTitle');
const awardImg1 = document.getElementById('awardImg1');
const awardName1 = document.getElementById('awardName1');
const awardImg2 = document.getElementById('awardImg2');
const awardName2 = document.getElementById('awardName2');
const finalConfirmBtn = document.getElementById('finalConfirmBtn');
const confettiCanvas = document.getElementById('confettiCanvas');

const infoModal = document.getElementById('infoModal');
const infoBtn = document.getElementById("info-btn");
const closeInfoModal = document.getElementById('closeInfoModal');
const goMainBtn = document.getElementById('goMainBtn');
const confirmAwardBtn = document.getElementById('confirmAwardBtn');

// --- 초기화 ---
window.onload = function() {
    // 검색 관련
    searchBtn.addEventListener('click', () => performSearch(searchInput.value));
    searchInput.addEventListener('input', handleSearchInput); // 입력 시 연관검색어
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            closeSuggestions();
            performSearch(searchInput.value);
        }
    });

    // 외부 클릭 시 연관검색어 닫기
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box') && !e.target.closest('.suggestions-box')) {
            closeSuggestions();
        }
    });

    // ✅ 중복 제거: closeCharModal.onclick 한 번만 정의
    if (closeCharModal) {
        closeCharModal.onclick = () => {
            charModal.classList.add('hidden');
            resetPopupSelection();
        };
    }

    // ✅ 중복 제거: infoModal 관련 요소는 최상단에서 이미 선언됨, 재선언 삭제
    if (closeInfoModal) closeInfoModal.onclick = () => infoModal.classList.add('hidden');
    if (infoBtn) infoBtn.onclick = () => infoModal.classList.remove('hidden');

    // 기능 버튼
    addCoupleBtn.onclick = registerCouple;
    goMainBtn.onclick = () => { window.location.href = '../index.html'; };
    confirmAwardBtn.onclick = showAwardModal;
    finalConfirmBtn.onclick = saveAndGoMain;
};

// --- 1. 검색 및 연관 검색어 로직 ---
// ✅ 삭제: 존재하지 않는 AnimeByQuarter를 참조하고 어디서도 호출되지 않던 getAllAnimeList() 제거

// 검색어 입력 시 호출
function handleSearchInput() {
    const query = searchInput.value.trim().toLowerCase();
    suggestionList.innerHTML = '';

    if (query.length === 0) {
        closeSuggestions();
        return;
    }

    const matches = SeasonFilteredAnimeList.filter(anime =>
        anime.title.toLowerCase().includes(query)
    );

    if (matches.length > 0) {
        suggestionList.classList.remove('hidden');
        matches.forEach(anime => {
            const li = document.createElement('li');
            li.textContent = anime.title;
            li.onclick = () => {
                searchInput.value = anime.title;
                closeSuggestions();
                openCharacterPopup(anime.id, anime.title);
            };
            suggestionList.appendChild(li);
        });
    } else {
        closeSuggestions();
    }
}

function closeSuggestions() {
    suggestionList.classList.add('hidden');
    suggestionList.innerHTML = '';
}

function performSearch(queryText) {
    const query = queryText.trim().toLowerCase();
    if (!query) return;

    const anime = SeasonFilteredAnimeList.find(a => a.title.toLowerCase().includes(query));

    if (anime) {
        openCharacterPopup(anime.id, anime.title);
    } else {
        alert("검색 결과가 없습니다.");
    }
}

// --- 2. 캐릭터 팝업 로직 ---

function openCharacterPopup(animeId, animeTitle) {
    // ✅ 수정: CharacterData_2026 하드코딩 → resolveYear.js가 만든 별칭 CharacterData 사용
    const animeEntry = CharacterData.find(entry => entry.id === animeId);

    if (!animeEntry || !animeEntry.characters || animeEntry.characters.length === 0) {
        console.warn(`캐릭터 데이터를 찾을 수 없음: ID ${animeId}`);
        alert("해당 애니메이션의 캐릭터 정보가 등록되지 않았습니다.");
        return;
    }

    const targetCharacters = animeEntry.characters;

    modalAnimeTitle.textContent = animeTitle;
    coupleState.currentPopupCharacters = targetCharacters;
    resetPopupSelection();

    renderCharacterCards(targetCharacters);

    charModal.classList.remove('hidden');
}

function renderCharacterCards(characters) {
    characterGrid.innerHTML = '';

    characters.forEach((char) => {
        if (!char) return;

        const card = document.createElement('div');
        card.className = 'char-card';

        const img = document.createElement('img');
        img.src = `../${char.img}`;
        img.alt = char.name;

        const name = document.createElement('div');
        name.className = 'char-name';
        name.innerText = char.name;
        name.title = char.name;

        card.appendChild(img);
        card.appendChild(name);

        card.addEventListener('click', () => toggleCharSelection(card, char));
        characterGrid.appendChild(card);
    });
}

function toggleCharSelection(cardElement, charObj) {
    const isSelected = coupleState.selectedPopupChars.some(c => c.name === charObj.name);

    if (isSelected) {
        coupleState.selectedPopupChars = coupleState.selectedPopupChars.filter(c => c.name !== charObj.name);
        cardElement.classList.remove('selected');
    } else {
        if (coupleState.selectedPopupChars.length < 2) {
            coupleState.selectedPopupChars.push(charObj);
            cardElement.classList.add('selected');
        } else {
            alert("2명까지만 선택 가능합니다.");
        }
    }
    updateAddButtonState();
}

function updateAddButtonState() {
    const count = coupleState.selectedPopupChars.length;
    addCoupleBtn.innerText = count === 2 ? "후보 등록 완료" : `후보 등록 (${count}/2)`;
    addCoupleBtn.disabled = (count !== 2);
}

function resetPopupSelection() {
    coupleState.selectedPopupChars = [];
    updateAddButtonState();
}

function registerCouple() {
    if (coupleState.selectedPopupChars.length !== 2) return;

    const newCouple = {
        id: Date.now(),
        char1: coupleState.selectedPopupChars[0],
        char2: coupleState.selectedPopupChars[1],
        animeTitle: modalAnimeTitle.textContent
    };

    coupleState.nominees.push(newCouple);
    charModal.classList.add('hidden');

    mainArea.classList.add('has-candidates');
    renderNominees();

    searchInput.value = '';
}

function renderNominees() {
    nomineeList.innerHTML = '';
    const confirmBtn = document.getElementById('confirmAwardBtn');

    coupleState.nominees.forEach((couple, index) => {
        const card = document.createElement('div');
        card.className = `couple-card ${index === coupleState.selectedIndex ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="couple-imgs">
                <div class="couple-img-wrap"><img src="../${couple.char1.img}"></div>
                <div class="couple-img-wrap"><img src="../${couple.char2.img}"></div>
            </div>
            <div class="couple-info">
                <div class="couple-names">${couple.char1.name} ♥ ${couple.char2.name}</div>
                <div class="anime-title">${couple.animeTitle}</div>
            </div>
        `;
        card.onclick = () => {
            coupleState.selectedIndex = (coupleState.selectedIndex === index) ? null : index;
            confirmBtn.disabled = (coupleState.selectedIndex === null);
            renderNominees();
        };
        nomineeList.appendChild(card);
    });
}

// --- 3. 수상 및 폭죽 로직 ---

function showAwardModal() {
    if (coupleState.selectedIndex === null) return;
    const winner = coupleState.nominees[coupleState.selectedIndex];

    awardAnimeTitle.textContent = winner.animeTitle;
    awardImg1.src = `../${winner.char1.img}`;
    awardName1.textContent = winner.char1.name;
    awardImg2.src = `../${winner.char2.img}`;
    awardName2.textContent = winner.char2.name;

    awardModal.classList.remove('hidden');

    fireConfetti();
}

async function saveAndGoMain() {
    if (coupleState.selectedIndex === null) {
        alert("수상할 커플을 선택해주세요!");
        return;
    }

    const confirmBtn = document.getElementById('finalConfirmBtn');
    confirmBtn.innerText = "이미지 처리 중...";
    confirmBtn.disabled = true;

    try {
        const winner = coupleState.nominees[coupleState.selectedIndex];
        const path1 = winner.char1.img.startsWith('../') ? winner.char1.img : `../${winner.char1.img}`;
        const path2 = winner.char2.img.startsWith('../') ? winner.char2.img : `../${winner.char2.img}`;

        const combinedImageBase64 = await createCombinedImage(path1, path2);

        // ✅ 삭제: 예전 방식(anime_awards_result 직접 읽고쓰기) 완전히 제거, ResultStorage로 일원화
        ResultStorage.saveOne(awardName, {
            name1: winner.char1.name,
            name2: winner.char2.name,
            animeTitle: winner.animeTitle,
            img: combinedImageBase64
        });

        window.location.href = '../index.html';

    } catch (error) {
        console.error("저장 실패:", error);
        alert("데이터 저장 중 오류가 발생했습니다.");
        confirmBtn.innerText = "확인 및 메인으로";
        confirmBtn.disabled = false;
    }
}

function createCombinedImage(src1, src2) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const targetWidth = 260;
        const targetHeight = 378;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const halfWidth = targetWidth / 2;

        const img1 = new Image();
        const img2 = new Image();

        img1.crossOrigin = "Anonymous";
        img2.crossOrigin = "Anonymous";

        let loadedCount = 0;

        const checkLoad = () => {
            loadedCount++;
            if (loadedCount === 2) {
                try {
                    ctx.fillStyle = "#000";
                    ctx.fillRect(0, 0, targetWidth, targetHeight);

                    drawImageCenterCover(ctx, img1, 0, 0, halfWidth, targetHeight);
                    drawImageCenterCover(ctx, img2, halfWidth, 0, halfWidth, targetHeight);

                    ctx.beginPath();
                    ctx.moveTo(halfWidth, 0);
                    ctx.lineTo(halfWidth, targetHeight);
                    ctx.strokeStyle = "#d4af37";
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    const dataURL = canvas.toDataURL("image/jpeg", 0.9);
                    resolve(dataURL);
                } catch (e) {
                    reject(e);
                }
            }
        };

        img1.onload = checkLoad;
        img2.onload = checkLoad;
        img1.onerror = () => reject(new Error(`Image 1 로드 실패: ${src1}`));
        img2.onerror = () => reject(new Error(`Image 2 로드 실패: ${src2}`));

        img1.src = src1;
        img2.src = src2;
    });
}

function drawImageCenterCover(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;

    let sx, sy, sWidth, sHeight;

    if (imgRatio > targetRatio) {
        sHeight = img.height;
        sWidth = img.height * targetRatio;
        sy = 0;
        sx = (img.width - sWidth) / 2;
    } else {
        sWidth = img.width;
        sHeight = img.width / targetRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

// --- 폭죽 효과 (Canvas) ---
function fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            zIndex: 9999,
            colors: ['#d4af37', '#ffffff']
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            zIndex: 9999,
            colors: ['#d4af37', '#ffffff']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}