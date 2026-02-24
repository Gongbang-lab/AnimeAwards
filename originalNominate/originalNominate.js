let currentStep = 1;
let selectedItems = []; 
let step1Selected = []; 

document.addEventListener('DOMContentLoaded', () => {
    if(typeof scriptwriterData !== 'undefined') {
        renderCards(scriptwriterData);
    }
});

document.getElementById('search-input').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    // 현재 단계에 따라 필터링 대상 데이터 결정
    // Step 1이면 전체 데이터(scriptwriterData), Step 2이면 선택된 후보(step1Selected)
    const targetData = (currentStep === 1) ? scriptwriterData : step1Selected;

    const filteredData = targetData.filter(anime => {
        const titleMatch = anime.title.toLowerCase().includes(searchTerm);
        const writerMatch = anime.scriptwriter.some(writer => 
            writer.toLowerCase().includes(searchTerm)
        );
        return titleMatch || writerMatch;
    });

    // 필터링된 결과로 카드 다시 그리기
    renderCards(filteredData);
});

function renderCards(dataList) {
    const grid = document.getElementById('card-grid');
    grid.innerHTML = '';

    if (dataList.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #666;">
                <p style="font-size: 1.2rem;">검색 결과가 없습니다.</p>
            </div>
        `;
        return;
    }

    dataList.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'card';
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
    }
    updatePreview();
}

// [기존 updatePreview 함수를 아래 내용으로 교체]
function updatePreview() {
    const previewList = document.getElementById('preview-list');
    if (!previewList) return;
    
    if (selectedItems.length === 0) {
        previewList.innerHTML = `<span style="font-size: 0.85rem; color:#555;"></span>`;
        return;
    }

    previewList.innerHTML = '';
    selectedItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        // 성우/각색상 페이지와 일관된 구조 (제목 + 각본가)
        div.innerHTML = `
            ${item.title}
            <br><small style="color:#888; font-size:0.75rem;">${item.scriptwriter.join(', ')}</small>
        `;
        
        // 클릭 시 삭제 기능 추가 (Step 1에서만 작동)
        div.onclick = () => {
            if (currentStep === 1) {
                const index = selectedItems.findIndex(i => i.id === item.id);
                if (index > -1) {
                    selectedItems.splice(index, 1);
                    // 메인 그리드의 카드 선택 해제 상태 반영을 위해 재렌더링
                    renderCards(scriptwriterData); 
                    updatePreview();
                }
            }
        };
        previewList.appendChild(div);
    });
}

function proceedToStep2() {
    if (selectedItems.length < 2) {
        alert("최소 2개 이상의 작품을 선택해주세요!");
        return;
    }
    step1Selected = [...selectedItems];
    selectedItems = []; 
    currentStep = 2;

    document.getElementById('step-title-display').textContent = "최종 수상작 결정 (Step 2)";
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('final-btn').classList.remove('hidden');

    const previewBox = document.querySelector('.status-indicator');
    if (previewBox) previewBox.style.display = 'none';

    const navBtn = document.getElementById('nav-btn');
    navBtn.textContent = "이전 단계";
    navBtn.onclick = backToStep1;

    renderCards(step1Selected);
    updatePreview();
}

function backToStep1() {
    currentStep = 1;
    selectedItems = [...step1Selected];

    document.getElementById('step-title-display').textContent = "각본상 후보 선정";
    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('final-btn').classList.add('hidden');

    const previewBox = document.querySelector('.status-indicator');
    if (previewBox) previewBox.style.display = 'block'

    const navBtn = document.getElementById('nav-btn');
    navBtn.textContent = "메인으로";
    navBtn.onclick = () => { location.href = '../main/main.html'; };

    renderCards(scriptwriterData);
    updatePreview();
}

function confirmFinalWinner() {
    if (selectedItems.length !== 1) {
        alert("최종 수상작을 하나 선택해주세요!");
        return;
    }

    const winner = selectedItems[0];
    const writerName = winner.scriptwriter ? winner.scriptwriter.join(', ') : "정보 없음";
    const studioDisplay = document.getElementById('modal-studio');
    studioDisplay.textContent = winner.studio;
    
    // 모달 데이터 주입
    document.getElementById('modal-img').src = winner.thumbnail;
    document.getElementById('modal-title').textContent = winner.title;
    document.getElementById('modal-studio').textContent = winner.studio;

    const writerDisplay = document.getElementById('modal-writer');
    writerDisplay.textContent = writerName;

    if (writerName.length > 15) {
        writerDisplay.style.fontSize = '1.8rem'; // 이름이 매우 길 때
    } else if (writerName.length > 8) {
        writerDisplay.style.fontSize = '2.2rem'; // 이름이 조금 길 때
    } else {
        writerDisplay.style.fontSize = '3rem';   // 기본 크기
    }

    document.getElementById('winner-modal').classList.remove('hidden');
    fireworks();
    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results["각본상"] = { title: winner.title, thumbnail: winner.thumbnail };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));
}

function fireworks() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#d4af37', '#ffffff'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#d4af37', '#ffffff'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

function goToMain() { location.href = '../main/main.html'; }