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
    closeCharModal.onclick = () => {
        charModal.classList.add('hidden');
        resetPopupSelection();
    };
    closeInfoModal.onclick = () => infoModal.classList.add('hidden');
    infoBtn.onclick = () => infoModal.classList.remove('hidden');

    // 기능 버튼
    addCoupleBtn.onclick = registerCouple;
    goMainBtn.onclick = () => { window.location.href = '../main/main.html'; };
    confirmAwardBtn.onclick = showAwardModal; // 수상 팝업 띄우기
    finalConfirmBtn.onclick = saveAndGoMain;  // 최종 확인 및 이동
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
    const query = searchInput.value.trim().toLowerCase(); // 소문자로 변환
    suggestionList.innerHTML = '';

    if (query.length === 0) {
        closeSuggestions();
        return;
    }

    const allAnime = getAllAnimeList();
    // 대소문자 구분 없이 필터링
    const matches = allAnime.filter(anime => 
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
                performSearch(anime.title); // 선택 시 바로 검색 실행
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
    const query = queryText.trim().toLowerCase(); // 대소문자 무시
    if (!query) return;

    let foundAnimeId = null;
    let foundAnimeTitle = "";

    const allAnime = getAllAnimeList();
    // 정확도 높이기 위해 검색어 포함 여부 확인
    const anime = allAnime.find(a => a.title.toLowerCase().includes(query));

    if (anime) {
        foundAnimeId = anime.id;
        foundAnimeTitle = anime.title;
        openCharacterPopup(foundAnimeId, foundAnimeTitle);
    } else {
        alert("검색 결과가 없습니다.");
    }
}

// --- 2. 캐릭터 팝업 로직 ---

function openCharacterPopup(animeId, animeTitle) {
    let targetCharacters = [];

    // CharacterData 탐색
    if (typeof CharacterData !== 'undefined') {
        for (const quarter in CharacterData) {
            if (!Array.isArray(CharacterData[quarter])) continue;
            const charEntry = CharacterData[quarter].find(entry => entry && entry.id === animeId);
            if (charEntry) {
                targetCharacters = charEntry.characters;
                break;
            }
        }
    }

    if (!targetCharacters || targetCharacters.length === 0) {
        alert("캐릭터 데이터가 없습니다.");
        return;
    }

    modalAnimeTitle.textContent = animeTitle;
    currentPopupCharacters = targetCharacters;
    resetPopupSelection();
    renderCharacterCards(targetCharacters);
    charModal.classList.remove('hidden');
}

function renderCharacterCards(characters) {
    characterGrid.innerHTML = '';
    
    characters.forEach((char) => {
        if (!char) return;

        const card = document.createElement('div');
        card.className = 'char-card'; // CSS에서 세로 스택 & width:100% 처리됨
        
        const img = document.createElement('img');
        img.src = char.img ? char.img : '../image/no-image.png';
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
    renderNominees();
    
    mainArea.classList.add('has-candidates');
    searchInput.value = '';
}

function renderNominees() {
    nomineeList.innerHTML = '';
    nominees.forEach((couple, index) => {
        const card = document.createElement('div');
        card.className = 'couple-card';
        if (index === selectedCoupleIndex) card.classList.add('selected');

        card.innerHTML = `
            <div class="couple-imgs">
                <div class="couple-img-wrap">
                    <img src="${couple.char1.img}">
                    <span>${couple.char1.name}</span>
                </div>
                <div style="font-weight:bold; color:var(--primary-color);">♥</div>
                <div class="couple-img-wrap">
                    <img src="${couple.char2.img}">
                    <span>${couple.char2.name}</span>
                </div>
            </div>
            <div class="couple-info">
                <div class="couple-names">${couple.char1.name} ♥ ${couple.char2.name}</div>
            </div>
            <div style="margin-top:10px; text-align:center; font-size:0.9rem; color:#888;">${couple.animeTitle}</div>
        `;

        card.addEventListener('click', () => {
            if (selectedCoupleIndex === index) {
                selectedCoupleIndex = null;
                card.classList.remove('selected');
            } else {
                const prev = document.querySelector('.couple-card.selected');
                if (prev) prev.classList.remove('selected');
                selectedCoupleIndex = index;
                card.classList.add('selected');
            }
        });
        nomineeList.appendChild(card);
    });
}

// --- 3. 수상 및 폭죽 로직 ---

function showAwardModal() {
    if (selectedCoupleIndex === null) {
        alert("수상할 커플을 선택해주세요!");
        return;
    }

    const winner = nominees[selectedCoupleIndex];
    
    // 모달 내용 채우기
    awardAnimeTitle.textContent = winner.animeTitle;
    awardImg1.src = winner.char1.img;
    awardName1.textContent = winner.char1.name;
    awardImg2.src = winner.char2.img;
    awardName2.textContent = winner.char2.name;

    // 모달 띄우기
    awardModal.classList.remove('hidden');

    // 폭죽 시작
    startConfetti();
}

async function saveAndGoMain() {
    if (selectedCoupleIndex === null) {
        alert("저장할 데이터가 없습니다.");
        return;
    }

    // 로딩 표시 (이미지 처리 시간이 조금 걸릴 수 있음)
    const confirmBtn = document.getElementById('finalConfirmBtn');
    const originalText = confirmBtn.innerText;
    confirmBtn.innerText = "이미지 처리 중...";
    confirmBtn.disabled = true;

    try {
        const winner = nominees[selectedCoupleIndex];
        const imgPath1 = winner.char1.img;
        const imgPath2 = winner.char2.img;

        const existingDataRaw = localStorage.getItem("anime_awards_result");
        let finalData = existingDataRaw ? JSON.parse(existingDataRaw) : {};

        // 1. 두 이미지를 합쳐서 Base64 문자열로 변환 (260x378 크기)
        const combinedImageBase64 = await createCombinedImage(imgPath1, imgPath2);

        // 2. 저장할 데이터 구조 생성
        finalData.bestcouple = {
            "베스트 커플상": {
                name1: winner.char1.name,
                name2: winner.char2.name,
                animeTitle: winner.animeTitle, // 필요시 사용
                img: combinedImageBase64 // 합쳐진 이미지 데이터
            }
        };

        // 3. 로컬 스토리지 저장
        // 주의: Base64 이미지는 용량이 큽니다. 너무 많이 저장하면 용량 제한에 걸릴 수 있습니다.
        localStorage.setItem("anime_awards_result", JSON.stringify(finalData));

        // 4. 메인으로 이동
        window.location.href = '../main/main.html';

    } catch (error) {
        console.error("이미지 병합 실패:", error);
        alert("이미지 처리 중 오류가 발생했습니다.");
        confirmBtn.innerText = originalText;
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
function startConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    const pieces = [];
    const colors = ['#d4af37', '#ffd700', '#ffffff', '#b5952f']; // Gold Theme Colors

    for (let i = 0; i < 200; i++) {
        pieces.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 360
        });
    }

    function draw() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        pieces.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle * Math.PI / 180);
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();

            p.y += p.speed;
            p.angle += 2;

            if (p.y > confettiCanvas.height) {
                p.y = -10;
                p.x = Math.random() * confettiCanvas.width;
            }
        });
        requestAnimationFrame(draw);
    }
    draw();
}