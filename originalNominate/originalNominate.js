let currentStep = 1;
let selectedItems = []; 
let step1Selected = []; 

const originalState = {
    step: 1,
    awardName: ""
};

document.addEventListener('DOMContentLoaded', () => {
    if(typeof scriptwriterData !== 'undefined') {
        renderCards(scriptwriterData);
    }
});

document.getElementById('search-input').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    const params = new URLSearchParams(window.location.search);
    originalState.awardName = params.get("awardName");
    
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
    // ==========================================
    // Step 2 (최종 선택) 렌더링 로직
    // ==========================================
    if (currentStep === 2) {
        let grid = document.getElementById('step2-grid');
        
        // Step 2 전용 컨테이너가 없으면 생성 (타이틀 포함)
        if (!grid) {
            const contentArea = document.querySelector('.content-area');
            contentArea.innerHTML = `
                <h2 style="color:var(--gold); margin-bottom:20px; font-size: 1.5rem; text-align: left;">최종 수상작을 선택하세요</h2>
                <div id="step2-grid"></div>
            `;
            grid = document.getElementById('step2-grid');
        }
        grid.innerHTML = '';

        if (dataList.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #666;"><p style="font-size: 1.2rem;">검색 결과가 없습니다.</p></div>`;
            return;
        }

        dataList.forEach(anime => {
            const card = document.createElement('div');
            card.className = 'step2-original-card'; // Step 2 전용 클래스
            if (selectedItems.find(i => i.id === anime.id)) card.classList.add('selected');

            card.innerHTML = `
                <div class="card-badge">${anime.studio || '제작사'}</div>
                <div class="card-thumb">
                    <img src="../${anime.thumbnail}" alt="${anime.title}" onerror="this.src='https://via.placeholder.com/200x300'">
                </div>
                <div class="step2-card-info">
                    <div class="card-title">${anime.title}</div>
                    <div class="card-studio">${anime.scriptwriter.join(', ')}</div>
                </div>
            `;
            
            // 단일 선택 처리
            card.onclick = () => {
                selectedItems = [anime];
                document.querySelectorAll('.step2-original-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            };
            grid.appendChild(card);
        });
        return; // Step 2 렌더링 끝
    }

    // ==========================================
    // Step 1 (후보 선정) 렌더링 로직 (기존 유지)
    // ==========================================
    let grid = document.getElementById('card-grid');
    
    // Step 2에서 '이전 단계'로 돌아왔을 때 card-grid 컨테이너 복구
    if (!grid) {
        const contentArea = document.querySelector('.content-area');
        contentArea.innerHTML = `<div id="card-grid" class="card-grid"></div>`;
        grid = document.getElementById('card-grid');
    }

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
            <img src="../${anime.thumbnail}" alt="${anime.title}">
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

    document.getElementById('step-title-display').textContent = "베스트 각본상 부문";
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
    navBtn.onclick = () => { location.href = '../index.html'; };

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
    fireConfetti();
    const results = JSON.parse(localStorage.getItem("anime_awards_result")) || {};
    results["베스트 각본상"] = { title: winner.title, thumbnail: winner.thumbnail };
    localStorage.setItem("anime_awards_result", JSON.stringify(results));
}

function fireConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;

    // 전용 캔버스를 사용하는 폭죽 인스턴스 생성
    const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
    });

    const duration = 3000;
    const animationEnd = Date.now() + duration;

    (function frame() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return;

        // 왼쪽 아래에서 쏘아 올림
        myConfetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#d4af37', '#ffffff', '#aa8a2e']
        });

        // 오른쪽 아래에서 쏘아 올림
        myConfetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#d4af37', '#ffffff', '#aa8a2e']
        });

        requestAnimationFrame(frame);
    }());
}

function goToMain() { location.href = '../index.html'; }