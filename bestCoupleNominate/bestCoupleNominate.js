// 상태 변수
let nominees = [];
let selectedCoupleIndex = null;
let currentPopupCharacters = [];
let selectedPopupChars = [];

// DOM 요소
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const mainArea = document.getElementById('mainArea');
const nomineeList = document.getElementById('nomineeList');

const charModal = document.getElementById('charModal');
const closeCharModal = document.getElementById('closeCharModal');
const characterGrid = document.getElementById('characterGrid');
const modalAnimeTitle = document.getElementById('modalAnimeTitle');
const addCoupleBtn = document.getElementById('addCoupleBtn');

const infoModal = document.getElementById('infoModal');
const infoBtn = document.getElementById('infoBtn');
const closeInfoModal = document.getElementById('closeInfoModal');

const goMainBtn = document.getElementById('goMainBtn');
const confirmAwardBtn = document.getElementById('confirmAwardBtn');

// --- 초기화 ---
window.onload = function() {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    closeCharModal.onclick = () => {
        charModal.classList.add('hidden');
        resetPopupSelection();
    };
    closeInfoModal.onclick = () => infoModal.classList.add('hidden');
    infoBtn.onclick = () => infoModal.classList.remove('hidden');

    addCoupleBtn.onclick = registerCouple;
    goMainBtn.onclick = () => { window.location.href = '../main/main.html'; };
    confirmAwardBtn.onclick = awardCeremony;
};

// --- 로직 구현 ---

function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        alert("애니메이션 제목을 입력해주세요.");
        return;
    }

    let foundAnimeId = null;
    let foundAnimeTitle = "";

    // 데이터 유효성 검사
    if (typeof AnimeByQuarter === 'undefined' || typeof CharacterData === 'undefined') {
        alert("데이터 파일을 불러오지 못했습니다. 경로를 확인해주세요.");
        return;
    }

    // 제목으로 애니메이션 ID 찾기
    for (const quarter in AnimeByQuarter) {
        if (!Array.isArray(AnimeByQuarter[quarter])) continue; // 안전 장치

        const anime = AnimeByQuarter[quarter].find(a => a.title.includes(query));
        if (anime) {
            foundAnimeId = anime.id;
            foundAnimeTitle = anime.title;
            break; // 찾았으면 반복 중단
        }
    }

    if (!foundAnimeId) {
        alert("검색 결과가 없습니다.");
        return;
    }

    // 팝업 열기 (ID 전달)
    openCharacterPopup(foundAnimeId, foundAnimeTitle);
}

// [수정됨] 오류가 발생했던 함수
function openCharacterPopup(animeId, animeTitle) {
    let targetCharacters = [];

    // CharacterData에서 ID로 캐릭터 찾기
    for (const quarter in CharacterData) {
        // CharacterData[quarter]가 배열인지 확인
        if (!Array.isArray(CharacterData[quarter])) continue;

        // ★★★ 수정된 부분 ★★★
        // 배열 내부 요소가 null/undefined일 경우를 대비해 (entry && entry.id)로 검사
        const charEntry = CharacterData[quarter].find(entry => entry && entry.id === animeId);
        
        if (charEntry) {
            targetCharacters = charEntry.characters;
            break;
        }
    }

    if (!targetCharacters || targetCharacters.length === 0) {
        alert("해당 애니메이션의 캐릭터 정보가 없습니다.");
        return;
    }

    modalAnimeTitle.textContent = `${animeTitle}`;
    currentPopupCharacters = targetCharacters;
    resetPopupSelection();
    renderCharacterCards(targetCharacters);
    
    charModal.classList.remove('hidden');
}

function renderCharacterCards(characters) {
    characterGrid.innerHTML = '';
    
    characters.forEach((char, index) => {
        // 데이터가 비정상적인 경우 스킵
        if (!char) return;

        const card = document.createElement('div');
        card.className = 'char-card';
        
        // 이미지 태그
        const img = document.createElement('img');
        // 이미지가 없을 경우를 대비한 대체 이미지 처리 (선택 사항)
        img.src = char.img ? char.img : '../image/no-image.png'; 
        img.alt = char.name;

        // 이름 태그
        const name = document.createElement('div');
        name.className = 'char-name';
        name.innerText = char.name;

        card.appendChild(img);
        card.appendChild(name);

        card.addEventListener('click', () => toggleCharSelection(card, char));
        characterGrid.appendChild(card);
    });
}

function toggleCharSelection(cardElement, charObj) {
    const isSelected = selectedPopupChars.some(c => c.name === charObj.name);

    if (isSelected) {
        // 선택 해제
        selectedPopupChars = selectedPopupChars.filter(c => c.name !== charObj.name);
        cardElement.classList.remove('selected');
    } else {
        // 선택 추가 (2명 제한)
        if (selectedPopupChars.length < 2) {
            selectedPopupChars.push(charObj);
            cardElement.classList.add('selected');
        } else {
            alert("최대 2명까지만 선택 가능합니다.");
        }
    }
    updateAddButtonState();
}

function updateAddButtonState() {
    const count = selectedPopupChars.length;
    addCoupleBtn.innerText = count === 2 ? `후보 등록 완료` : `후보 등록 (${count}/2)`;
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
    
    // 검색창 이동 UI 효과
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
                    <img src="${couple.char1.img}" alt="${couple.char1.name}">
                    <span>${couple.char1.name}</span>
                </div>
                <div style="align-self:center; font-weight:bold; color:var(--primary-color);">♥</div>
                <div class="couple-img-wrap">
                    <img src="${couple.char2.img}" alt="${couple.char2.name}">
                    <span>${couple.char2.name}</span>
                </div>
            </div>
            <div style="margin-top:15px; font-size:0.9rem; color:var(--text-sub); text-align:center;">
                ${couple.animeTitle}
            </div>
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

function awardCeremony() {
    if (selectedCoupleIndex === null) {
        alert("수상할 커플을 선택해주세요!");
        return;
    }

    const winner = nominees[selectedCoupleIndex];
    localStorage.setItem("anime_awards_result", JSON.stringify(winner));

    alert(`[${winner.char1.name} & ${winner.char2.name}] 커플이 수상자로 결정되었습니다!`);
}