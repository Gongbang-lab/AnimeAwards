// --- 상태 변수 ---
let nominees = [];
let selectedCoupleIndex = null;
let currentPopupCharacters = [];
let selectedPopupChars = [];

// --- DOM 요소 ---
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const suggestionList = document.getElementById('suggestionList'); // 연관검색어 리스트
const mainArea = document.getElementById('mainArea');
const nomineeList = document.getElementById('nomineeList');

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

    // 팝업 닫기
    if (closeCharModal) {
        closeCharModal.onclick = () => {
            charModal.classList.add('hidden');
            resetPopupSelection();
        };
    }
    closeCharModal.onclick = () => {
        charModal.classList.add('hidden');
        resetPopupSelection();
    };
    const closeInfoModal = document.getElementById('closeInfoModal');
    const infoBtn = document.getElementById("info-btn");
    const infoModal = document.getElementById('infoModal');

    if (closeInfoModal) closeInfoModal.onclick = () => infoModal.classList.add('hidden');
    if (infoBtn) infoBtn.onclick = () => infoModal.classList.remove('hidden');
    // 기능 버튼
    addCoupleBtn.onclick = registerCouple;
    goMainBtn.onclick = () => { window.location.href = '../index.html'; };
    confirmAwardBtn.onclick = showAwardModal;
    finalConfirmBtn.onclick = saveAndGoMain;
};

// --- 1. 검색 및 연관 검색어 로직 ---

// 모든 애니메이션 제목을 가져오는 헬퍼 함수
function getAllAnimeList() {
    let allAnime = [];
    if (typeof AnimeByQuarter !== 'undefined') {
        for (const quarter in AnimeByQuarter) {
            if (Array.isArray(AnimeByQuarter[quarter])) {
                allAnime = allAnime.concat(AnimeByQuarter[quarter]);
            }
        }
    }
    return allAnime;
}

// 검색어 입력 시 호출
function handleSearchInput() {
    const query = searchInput.value.trim().toLowerCase();
    suggestionList.innerHTML = '';

    if (query.length === 0) {
        closeSuggestions();
        return;
    }

    // AnimeList에서 제목 포함 여부 확인
    const matches = AnimeList.filter(anime => 
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
                // 클릭 시 해당 애니메이션의 id로 바로 팝업 오픈
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

    const anime = AnimeList.find(a => a.title.toLowerCase().includes(query));

    if (anime) {
        openCharacterPopup(anime.id, anime.title);
    } else {
        alert("검색 결과가 없습니다.");
    }
}

// --- 2. 캐릭터 팝업 로직 ---

function openCharacterPopup(animeId, animeTitle) {
    // 1. CharacterData 배열에서 AnimeList의 id와 일치하는 객체를 찾습니다.
    // id가 숫자이므로 일치 연산자(===)가 정확히 작동합니다.
    const animeEntry = CharacterData.find(entry => entry.id === animeId);

    if (!animeEntry || !animeEntry.characters || animeEntry.characters.length === 0) {
        console.warn(`캐릭터 데이터를 찾을 수 없음: ID ${animeId}`);
        alert("해당 애니메이션의 캐릭터 정보가 등록되지 않았습니다.");
        return;
    }

    const targetCharacters = animeEntry.characters;

    // 2. 모달 인터페이스 업데이트
    modalAnimeTitle.textContent = animeTitle;
    currentPopupCharacters = targetCharacters;
    resetPopupSelection();
    
    // 3. 캐릭터 카드 렌더링
    renderCharacterCards(targetCharacters);
    
    // 4. 모달 표시
    charModal.classList.remove('hidden');
}

function renderCharacterCards(characters) {
    characterGrid.innerHTML = '';
    
    characters.forEach((char) => {
        if (!char) return;

        const card = document.createElement('div');
        card.className = 'char-card'; // CSS에서 세로 스택 & width:100% 처리됨
        
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
    const isSelected = selectedPopupChars.some(c => c.name === charObj.name);

    if (isSelected) {
        selectedPopupChars = selectedPopupChars.filter(c => c.name !== charObj.name);
        cardElement.classList.remove('selected');
    } else {
        if (selectedPopupChars.length < 2) {
            selectedPopupChars.push(charObj);
            cardElement.classList.add('selected');
        } else {
            alert("2명까지만 선택 가능합니다.");
        }
    }
    updateAddButtonState();
}

function updateAddButtonState() {
    const count = selectedPopupChars.length;
    addCoupleBtn.innerText = count === 2 ? "후보 등록 완료" : `후보 등록 (${count}/2)`;
    addCoupleBtn.disabled = (count !== 2);
}

function resetPopupSelection() {
    selectedPopupChars = [];
    updateAddButtonState();
}

function registerCouple() {
    if (selectedPopupChars.length !== 2) return;

    const newCouple = {
        id: Date.now(),
        char1: selectedPopupChars[0],
        char2: selectedPopupChars[1],
        animeTitle: modalAnimeTitle.textContent
    };

    nominees.push(newCouple);
    charModal.classList.add('hidden');

    const mainArea = document.getElementById('mainArea');
    mainArea.classList.add('has-candidates');
    renderNominees();
    
    mainArea.classList.add('has-candidates');
    searchInput.value = '';
}

function renderNominees() {
    nomineeList.innerHTML = '';
    const confirmBtn = document.getElementById('confirmAwardBtn');
    
    nominees.forEach((couple, index) => {
        const card = document.createElement('div');
        card.className = `couple-card ${index === selectedCoupleIndex ? 'selected' : ''}`;
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
            selectedCoupleIndex = (selectedCoupleIndex === index) ? null : index;
            confirmBtn.disabled = (selectedCoupleIndex === null);
            renderNominees();
        };
        nomineeList.appendChild(card);
    });
}
// --- 3. 수상 및 폭죽 로직 ---

function showAwardModal() {
    if (selectedCoupleIndex === null) return;
    const winner = nominees[selectedCoupleIndex];
    
    document.getElementById("awardAnimeTitle").textContent = winner.animeTitle;
    document.getElementById("awardImg1").src = winner.char1.img;
    document.getElementById("awardName1").textContent = winner.char1.name;
    document.getElementById("awardImg2").src = winner.char2.img;
    document.getElementById("awardName2").textContent = winner.char2.name;

    document.getElementById('awardModal').classList.remove('hidden');
    
    // 모달 내용 채우기
    awardAnimeTitle.textContent = winner.animeTitle;
    awardImg1.src = `../${winner.char1.img}`;
    awardName1.textContent = winner.char1.name;
    awardImg2.src = `../${winner.char2.img}`;
    awardName2.textContent = winner.char2.name;

    // 모달 띄우기
    awardModal.classList.remove('hidden');

    // 폭죽 시작
    fireConfetti();
}

async function saveAndGoMain() {
    if (selectedCoupleIndex === null) {
        alert("수상할 커플을 선택해주세요!");
        return;
    }

    const confirmBtn = document.getElementById('finalConfirmBtn');
    confirmBtn.innerText = "이미지 처리 중...";
    confirmBtn.disabled = true;

    try {
        const winner = nominees[selectedCoupleIndex];
        
        // [핵심] 기존 로컬스토리지 데이터 불러오기 (없으면 빈 객체)
        const existingDataRaw = localStorage.getItem("anime_awards_result");
        let finalData = existingDataRaw ? JSON.parse(existingDataRaw) : {};

        // 이미지 병합 (260x378)
        const combinedImageBase64 = await createCombinedImage(winner.char1.img, winner.char2.img);

        // [구조 수정] 메인 페이지 로직과 일치하도록 키값 설정
        // 기존 데이터를 덮어쓰지 않고 bestcouple 필드만 업데이트
        finalData["베스트 커플상"] = {
            name1: winner.char1.name,
            name2: winner.char2.name,
            animeTitle: winner.animeTitle,
            img: combinedImageBase64
        };

        // 전체 데이터 저장
        localStorage.setItem("anime_awards_result", JSON.stringify(finalData));

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

        // 목표 크기 설정
        const targetWidth = 260;
        const targetHeight = 378;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // 반쪽 너비
        const halfWidth = targetWidth / 2;

        // 이미지 객체 생성
        const img1 = new Image();
        const img2 = new Image();

        // CORS 문제 방지 (외부 이미지일 경우)
        img1.crossOrigin = "Anonymous";
        img2.crossOrigin = "Anonymous";

        let loadedCount = 0;

        const checkLoad = () => {
            loadedCount++;
            if (loadedCount === 2) {
                // 두 이미지가 모두 로드되면 그리기 시작
                try {
                    // 배경을 검은색으로 채우기 (투명 방지)
                    ctx.fillStyle = "#000";
                    ctx.fillRect(0, 0, targetWidth, targetHeight);

                    // 왼쪽 이미지 그리기 (0 ~ 130px 영역)
                    drawImageCenterCover(ctx, img1, 0, 0, halfWidth, targetHeight);

                    // 오른쪽 이미지 그리기 (130 ~ 260px 영역)
                    drawImageCenterCover(ctx, img2, halfWidth, 0, halfWidth, targetHeight);

                    // (옵션) 가운데 구분선 그리기 - 세련된 느낌을 위해
                    ctx.beginPath();
                    ctx.moveTo(halfWidth, 0);
                    ctx.lineTo(halfWidth, targetHeight);
                    ctx.strokeStyle = "#d4af37"; // 골드 컬러
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Base64 변환 (JPEG 포맷, 퀄리티 0.9)
                    const dataURL = canvas.toDataURL("image/jpeg", 0.9);
                    resolve(dataURL);
                } catch (e) {
                    reject(e);
                }
            }
        };

        img1.onload = checkLoad;
        img2.onload = checkLoad;
        img1.onerror = () => reject(new Error("Image 1 load failed"));
        img2.onerror = () => reject(new Error("Image 2 load failed"));

        img1.src = src1;
        img2.src = src2;
    });
}

function drawImageCenterCover(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;

    let sx, sy, sWidth, sHeight;

    if (imgRatio > targetRatio) {
        // 이미지가 더 넓음 -> 높이를 맞추고 너비를 자름
        sHeight = img.height;
        sWidth = img.height * targetRatio;
        sy = 0;
        sx = (img.width - sWidth) / 2; // 중앙 크롭
    } else {
        // 이미지가 더 높음(길쭉함) -> 너비를 맞추고 높이를 자름
        sWidth = img.width;
        sHeight = img.width / targetRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2; // 중앙 크롭
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

// --- 폭죽 효과 (Canvas) ---
function fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        // 왼쪽에서 발사
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            zIndex: 9999,
            colors: ['#d4af37', '#ffffff']
        });
        // 오른쪽에서 발사
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