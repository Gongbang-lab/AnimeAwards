let currentStep = 1;
let selectedAnimes = []; // step1에서 선택된 객체들
let finalist = null;    // step2에서 최종 선택된 객체

const grid = document.getElementById('anime-grid');
const previewBox = document.getElementById('preview-box');
const nextBtn = document.getElementById('next-btn');
const decideBtn = document.getElementById('decide-btn');
const navHome = document.getElementById('nav-home');
const stepTitle = document.getElementById('step-title');

// 초기 렌더링 (Step 1)
function renderStep1() {
    grid.innerHTML = '';
    AnimeAdaptorData.forEach(anime => {
        const card = createCard(anime);
        grid.appendChild(card);
    });
}

function createCard(anime) {
    const div = document.createElement('div');
    div.className = `card ${selectedAnimes.some(a => a.id === anime.id) ? 'selected' : ''}`;
    div.innerHTML = `
        <img src="${anime.thumbnail}" alt="${anime.title}">
        <div class="card-info">
            <div class="card-title">${anime.title}</div>
            <div class="card-adaptor">각색: ${anime.adaptor.join(', ')}</div>
        </div>
    `;
    div.onclick = () => toggleSelection(anime, div);
    return div;
}

function toggleSelection(anime, element) {
    if (currentStep === 1) {
        const index = selectedAnimes.findIndex(a => a.id === anime.id);
        if (index > -1) {
            selectedAnimes.splice(index, 1);
            element.classList.remove('selected');
        } else {
            selectedAnimes.push(anime);
            element.classList.add('selected');
        }
        updatePreview();
    } else {
        // Step 2: 단일 선택
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        element.classList.add('selected');
        finalist = anime;
    }
}

function updatePreview() {
    previewBox.innerHTML = '';
    selectedAnimes.forEach(anime => {
        const span = document.createElement('span');
        span.className = 'preview-item';
        span.textContent = anime.title;
        span.onclick = () => {
            selectedAnimes = selectedAnimes.filter(a => a.id !== anime.id);
            updatePreview();
            renderStep1();
        };
        previewBox.appendChild(span);
    });
    document.getElementById('count').textContent = selectedAnimes.length;
}

// Step 1 -> Step 2 전환
nextBtn.onclick = () => {
    if (selectedAnimes.length === 0) return alert('최소 한 개 이상의 작품을 선택해주세요!');
    
    currentStep = 2;
    stepTitle.textContent = "최종 각색상 선정 (Step 2)";
    document.getElementById('preview-section').classList.add('hidden');
    nextBtn.classList.add('hidden');
    decideBtn.classList.remove('hidden');
    navHome.textContent = "뒤로가기";
    navHome.onclick = goBackToStep1;

    // 선택된 데이터로만 그리드 재구성
    grid.innerHTML = '';
    selectedAnimes.forEach(anime => {
        grid.appendChild(createCard(anime));
    });
};

function goBackToStep1() {
    currentStep = 1;
    stepTitle.textContent = "각색상 후보 선정 (Step 1)";
    document.getElementById('preview-section').classList.remove('hidden');
    nextBtn.classList.remove('hidden');
    decideBtn.classList.add('hidden');
    navHome.textContent = "메인으로";
    navHome.onclick = () => location.href='../main/main.html';
    renderStep1();
}

// 최종 결정 및 팝업
decideBtn.onclick = () => {
    if (!finalist) return alert('최종 수상작을 선택해주세요!');

    const modal = document.getElementById('winner-modal');
    const info = document.getElementById('winner-info');
    
    info.innerHTML = `
        <div class="winner-stack">
            <img src="${finalist.thumbnail}" alt="">
            <h3>${finalist.title}</h3>
            <p>${finalist.studio}</p>
            <p><strong>각색: ${finalist.adaptor.join(', ')}</strong></p>
        </div>
    `;

    modal.classList.remove('hidden');
    launchConfetti();
};

function launchConfetti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#ffffff', '#aa8a2e']
    });
}

// 시작
renderStep1();