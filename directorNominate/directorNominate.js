let currentStep = 1;
let selectedDirectors = []; // 선택된 감독 객체들
let finalWinner = null;

const gridContainer = document.getElementById('director-grid');
const previewBox = document.getElementById('preview-box');

// 1. 초기 렌더링
function init() {
    renderGrid(animeDirectorData);
}
function renderGrid(data) {
    gridContainer.innerHTML = '';
    data.forEach((item, index) => {
        const card = document.createElement('div');
        
        // Step 1일 때는 selectedDirectors에 포함되어 있으면 selected 클래스 부여
        // Step 2일 때는 진입 시점에 아무도 선택되지 않은 상태로 시작 (finalWinner 기준)
        let isSelected = false;
        if (currentStep === 1) {
            isSelected = selectedDirectors.some(d => d.director === item.director);
        } else {
            isSelected = finalWinner && finalWinner.director === item.director;
        }

        card.className = `card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="info-icon" onclick="openInfo(event, ${index})">i</div>
            <div class="dir-thumb" style="background-image: url('${item.director_img || 'placeholder.webp'}')"></div>
            <div class="dir-name">${item.director}</div>
        `;
        card.onclick = () => toggleSelect(item);
        gridContainer.appendChild(card);
    });
}

// 2. 선택 로직
function toggleSelect(directorObj) {
    const index = selectedDirectors.findIndex(d => d.director === directorObj.director);
    
    if (currentStep === 1) {
        if (index > -1) {
            selectedDirectors.splice(index, 1);
        } else {
            selectedDirectors.push(directorObj);
        }
        updatePreview();
        renderGrid(animeDirectorData);
    } else {
        // Step 2: 후보 중 한 명만 최종 선택
        finalWinner = directorObj;
        
        // UI에서 선택된 카드 강조 (전체 초기화 후 해당 카드만 추가)
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const name = card.querySelector('.dir-name').textContent;
            if (name === directorObj.director) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }
}

// 3. 프리뷰 업데이트
function updatePreview() {
    previewBox.innerHTML = '';
    selectedDirectors.forEach(d => {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.textContent = d.director;
        item.onclick = (e) => {
            e.stopPropagation();
            toggleSelect(d);
        };
        previewBox.appendChild(item);
    });
}

// 4. 단계 이동 (Step 1 -> Step 2)
function goToStep2() {
    if (selectedDirectors.length === 0) return alert("후보를 선택해주세요!");
    
    currentStep = 2;
    finalWinner = null; // 최종 선택 초기화

    document.getElementById('step-title').textContent = "Step 2: 최종 수상자 결정";
    document.getElementById('nav-btn').textContent = "뒤로가기";
    document.getElementById('preview-section').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('final-btn').classList.remove('hidden');
    
    renderGrid(selectedDirectors); // 선택된 후보들만 그리드에 표시
}

// 5. 네비게이션 처리 (메인으로 / 뒤로가기)
function handleNav() {
    if (currentStep === 2) {
        currentStep = 1;
        document.getElementById('step-title').textContent = "Step 1: 후보 선택";
        document.getElementById('nav-btn').textContent = "메인으로";
        document.getElementById('preview-section').classList.remove('hidden');
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('final-btn').classList.add('hidden');
        renderGrid(animeDirectorData);
    } else {
        location.href = '../main/main.html';
    }
}

// 6. 정보 팝업
function openInfo(event, index) {
    event.stopPropagation();
    const data = (currentStep === 1) ? animeDirectorData[index] : selectedDirectors[index];
    
    document.getElementById('modal-name').textContent = data.director;
    document.getElementById('modal-img').style.backgroundImage = `url('${data.director_img}')`;
    
    const worksGrid = document.getElementById('modal-works-grid');
    worksGrid.innerHTML = data.works.map(w => `
        <div class="work-item">
            <img src="${w.thumbnail}" style="width:100%; border-radius:4px;">
            <p>${w.title}</p>
        </div>
    `).join('');
    
    document.getElementById('info-modal').classList.remove('hidden');
}

// 7. 최종 결정 및 폭죽
function confirmWinner() {
    if (!finalWinner) return alert("최종 수상자를 선택해주세요!");
    
    document.getElementById('winner-name').textContent = finalWinner.director;
    document.getElementById('winner-img').style.backgroundImage = `url('${finalWinner.director_img}')`;
    
    const winnerWorks = document.getElementById('winner-works-grid');
    winnerWorks.innerHTML = finalWinner.works.map(w => `
        <div class="work-item">
            <img src="${w.thumbnail}">
            <p>${w.title}</p>
        </div>
    `).join('');

    document.getElementById('winner-modal').classList.remove('hidden');
    
    // 폭죽 효과 (라이브러리 사용 시)
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#ffffff', '#000000']
    });
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

window.onload = init;