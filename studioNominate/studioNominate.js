// 전역 변수 설정
let selectedStudios = []; // Step 1에서 선택된 스튜디오 이름 배열
let finalWinner = null;   // Step 2에서 선택된 최종 객체
let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
    // 1. 초기 그리드 렌더링
    if (typeof AnimeStudioData !== 'undefined') {
        renderGrid(AnimeStudioData);
    } else {
        console.error("데이터를 찾을 수 없습니다. animeStudioData.js 파일을 확인하세요.");
    }

    // 2. 버튼 이벤트 리스너 설정
    setupEventListeners();
});

// 이벤트 리스너 통합 관리
function setupEventListeners() {
    const nextBtn = document.getElementById('nextBtn');
    const navBtn = document.getElementById('navBtn');

    // 다음 단계 / 수상 확정 버튼
    nextBtn.addEventListener('click', () => {
        if (currentStep === 1) {
            if (selectedStudios.length === 0) {
                alert("최소 한 개의 후보를 선택해주세요!");
                return;
            }
            toStep2();
        } else {
            if (!finalWinner) {
                alert("수상할 스튜디오를 선택해주세요!");
                return;
            }
            showWinner(finalWinner);
        }
    });

    // 메인으로 / 뒤로가기 버튼
    navBtn.addEventListener('click', () => {
        if (currentStep === 2) {
            toStep1();
        } else {
            location.href = '../main/main.html';
        }
    });
}

// 그리드 렌더링 함수
function renderGrid(data) {
    const grid = document.getElementById('studioGrid');
    grid.innerHTML = '';
    
    data.forEach(item => {
        const isSelected = (currentStep === 1) 
            ? selectedStudios.includes(item.studio) 
            : (finalWinner && finalWinner.studio === item.studio);

        const card = document.createElement('div');
        card.className = `studio-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
            <span class="info-icon">ⓘ</span>
            <img src="../${item.studio_img}" onerror="this.src='https://via.placeholder.com/150'">
            <div class="name"><strong>${item.studio}</strong></div>
        `;
        
        // 정보 아이콘 클릭
        card.querySelector('.info-icon').onclick = (e) => {
            e.stopPropagation();
            openInfo(item);
        };

        // 카드 클릭 선택
        card.onclick = () => handleSelect(item);
        
        grid.appendChild(card);
    });
}

// 선택 처리 함수
function handleSelect(item) {
    if (currentStep === 1) {
        // Step 1: 다중 선택 및 토글
        if (selectedStudios.includes(item.studio)) {
            selectedStudios = selectedStudios.filter(s => s !== item.studio);
        } else {
            selectedStudios.push(item.studio);
        }
        updatePreview(); // 프리뷰 업데이트
        renderGrid(AnimeStudioData); // 화면 갱신
    } else {
        // Step 2: 단일 선택
        finalWinner = item;
        const nextBtn = document.getElementById('nextBtn');
        nextBtn.disabled = false;
        nextBtn.classList.add('btn-award');
        
        // Step 2 그리드 갱신 (선택된 것들 중 강조)
        const filteredData = AnimeStudioData.filter(d => selectedStudios.includes(d.studio));
        renderGrid(filteredData);
    }
}

// 프리뷰 박스 업데이트 (에러 발생 지점 수정)
function updatePreview() {
    const list = document.getElementById('previewList');
    if (!list) return;

    list.innerHTML = '';
    selectedStudios.forEach(studioName => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerText = studioName;
        // 프리뷰에서 클릭 시 삭제 기능
        div.onclick = (e) => {
            e.stopPropagation();
            selectedStudios = selectedStudios.filter(name => name !== studioName);
            updatePreview();
            renderGrid(AnimeStudioData);
        };
        list.appendChild(div);
    });
}

// 단계 전환: Step 2로
function toStep2() {
    currentStep = 2;
    finalWinner = null; // Step 2 진입 시 선택 초기화
    
    document.getElementById('previewContainer').classList.add('hidden');
    document.getElementById('navBtn').innerText = "뒤로가기";
    
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.innerText = "🏆 수상 확정";
    nextBtn.disabled = true;

    const filteredData = AnimeStudioData.filter(d => selectedStudios.includes(d.studio));
    renderGrid(filteredData);
}

// 단계 전환: Step 1로
function toStep1() {
    currentStep = 1;
    document.getElementById('previewContainer').classList.remove('hidden');
    document.getElementById('navBtn').innerText = "메인으로";
    
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.innerText = "다음 단계로";
    nextBtn.classList.remove('btn-award');
    nextBtn.disabled = false;
    
    renderGrid(AnimeStudioData);
}

// 정보 팝업
function openInfo(studio) {
    showModal(studio, false);
}

// 수상 확정 및 팝업
function showWinner(studio) {
    showModal(studio, true);
    // 폭죽 효과
    confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#ffffff', '#000000']
    });
}

// 모달 표시 공통 함수
function showModal(studio, isWinner) {
    const modal = document.getElementById('modal');
    document.getElementById('modalStudioImg').src = `../${studio.studio_img}`;
    document.getElementById('modalStudioName').innerText = studio.studio + (isWinner ? " (WINNER)" : "");
    
    const animeGrid = document.getElementById('modalAnimeGrid');
    animeGrid.innerHTML = studio.works.map(w => `
        <div class="anime-item">
            <img src="${w.thumbnail}" alt="${w.title}">
            <p>${w.title}</p>
        </div>
    `).join('');

    const finalArea = document.getElementById('finalActionArea');
    const closeBtn = modal.querySelector('.close-modal');

    if (isWinner) {
        finalArea.classList.remove('hidden');
        closeBtn.classList.add('hidden');
    } else {
        finalArea.classList.add('hidden');
        closeBtn.classList.remove('hidden');
    }

    modal.classList.remove('hidden');
    closeBtn.onclick = () => modal.classList.add('hidden');
}