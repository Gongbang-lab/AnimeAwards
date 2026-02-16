let currentStep = 1;
let selectedItems = []; 
let step1Selected = []; 

// 초기 렌더링
document.addEventListener('DOMContentLoaded', () => {
    renderCards(scriptwriterData);
});

function renderCards(dataList) {
    const grid = document.getElementById('card-grid');
    grid.innerHTML = '';
    dataList.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'card';
        // 이전에 선택했던 카드는 표시 유지 (Step 2에서 다시 돌아올 때 대비)
        if(selectedItems.find(i => i.id === anime.id)) card.classList.add('selected');
        
        card.innerHTML = `
            <img src="${anime.thumbnail}" alt="${anime.title}">
            <div class="card-info">
                <div class="card-title">${anime.title}</div>
                <div class="card-writer">각본: ${anime.scriptwriter.join(', ')}</div>
            </div>
        `;
        card.onclick = () => toggleSelect(anime, card);
        grid.appendChild(card);
    });
}

function toggleSelect(anime, cardElement) {
    if (currentStep === 2) {
        selectedItems = [anime];
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        cardElement.classList.add('selected');
    } else {
        const index = selectedItems.findIndex(item => item.id === anime.id);
        if (index > -1) {
            selectedItems.splice(index, 1);
            cardElement.classList.remove('selected');
        } else {
            selectedItems.push(anime);
            cardElement.classList.add('selected');
        }
        updatePreview();
    }
}

function updatePreview() {
    const previewList = document.getElementById('preview-list');
    if (!previewList) return;
    previewList.innerHTML = selectedItems.map(item => `<div class="preview-item">• ${item.title}</div>`).join('');
}

// Step 2로 이동
function proceedToStep2() {
    if (selectedItems.length < 2) {
        alert("최소 2개 이상의 작품을 선택해주세요!");
        return;
    }
    step1Selected = [...selectedItems];
    selectedItems = []; 
    currentStep = 2;

    document.getElementById('step-title').textContent = "최종 수상작 결정";
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('final-btn').classList.remove('hidden');
    
    // Preview 박스 숨기기 (삭제 대신 display none 처리하여 복구 가능하게 함)
    document.querySelector('.preview-container').style.display = 'none';

    // 메인으로 버튼 -> 뒤로가기 버튼으로 변경
    const navBtn = document.getElementById('nav-btn');
    navBtn.textContent = "뒤로가기";
    navBtn.onclick = backToStep1;

    renderCards(step1Selected);
}

// Step 1로 복구
function backToStep1() {
    currentStep = 1;
    selectedItems = [...step1Selected]; // 이전 선택 복구

    document.getElementById('step-title').textContent = "각본상 후보 선정 (Step 1)";
    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('final-btn').classList.add('hidden');
    
    // Preview 박스 다시 보이기
    document.querySelector('.preview-container').style.display = 'block';

    // 뒤로가기 -> 메인으로 버튼으로 복구
    const navBtn = document.getElementById('nav-btn');
    navBtn.textContent = "메인으로";
    navBtn.onclick = () => { location.href = 'index.html'; };

    renderCards(scriptwriterData);
    updatePreview();
}

// 최종 결정 및 폭죽 효과
function confirmFinalWinner() {
    if (selectedItems.length !== 1) {
        alert("최종 수상작을 하나 선택해주세요!");
        return;
    }

    const winner = selectedItems[0];
    let result = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    result["각본상"] = {
        title: winner.title,
        thumbnail: winner.thumbnail,
        scriptwriter: winner.scriptwriter // 데이터의 필드명(scriptwriter)에 맞춰 저장
    };
    localStorage.setItem("anime_awards_result", JSON.stringify(result));

    document.getElementById('modal-img').src = winner.thumbnail;
    document.getElementById('modal-title').textContent = winner.title;
    document.getElementById('modal-studio').textContent = winner.studio;
    document.getElementById('modal-writer').textContent = winner.scriptwriter.join(', ');

    document.getElementById('winner-modal').classList.remove('hidden');

    // 폭죽 애니메이션 실행
    fireworks();
}

function fireworks() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#d4af37', '#ffffff']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#d4af37', '#ffffff']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function goToMain() {
    location.href = '../main/main.html';
}