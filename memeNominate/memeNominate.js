function renderMemeThumbnail(box, meme, source) {
    const img = document.createElement('img');
    img.alt = meme.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = memeMediaUrl(isMemeVideo(source) ? `${source}.poster.jpg` : source);
    img.onerror = () => { img.onerror = null; img.src = '../image/no-image.svg'; };
    box.replaceChildren(img);
}

function isMemeVideo(source) {
    try {
        return /\.(mp4|webm|mov|m4v|ogv)$/i.test(new URL(String(source || ''), document.baseURI).pathname);
    } catch {
        return false;
    }
}

const memeState = {
    step: 1,
    candidateIds: new Set(),
    sources: new Map(),
    selectedMeme: null,
    selectedSrc: null,
    awardName: "올해의 밈"
};
AwardPage.onReady(() => {
    const params = new URLSearchParams(window.location.search);
    memeState.theme = params.get("theme");
    memeState.awardName = params.get("awardName") || "올해의 밈";

    const stepTitle = document.getElementById("step-title");
    if (stepTitle) stepTitle.textContent = `${SeasonFilter.toDisplayAwardName(memeState.awardName)} 부문`;

    renderMemeGrid();

    const popup = document.getElementById("winner-popup");
    if (popup) {
        popup.addEventListener("click", (e) => {
            if (e.target === popup) closePopup();
        });
    }

});

// src 목록 배열로 정규화
function getSrcs(meme) {
    const srcs = [];
    const fileName = source => {
        let path = String(source).split(/[?#]/)[0].replace(/\\/g, '/');
        path = path.slice(path.lastIndexOf('/') + 1);
        try { return decodeURIComponent(path); } catch { return path; }
    };
    for (const key of Object.keys(meme).filter(key => /^src[1-9]\d*$/.test(key)).sort((a, b) => Number(a.slice(3)) - Number(b.slice(3)))) {
        if (!meme[key]) continue;
        srcs.push({ url: meme[key], label: String(meme[`${key}_title`] || '').trim() || fileName(meme[key]) });
    }
    if (srcs.length === 0 && meme.src) srcs.push({ url: meme.src, label: fileName(meme.src) });
    return srcs;
}

function renderMemeGrid() {
    const grid = document.getElementById('meme-grid');
    if (!grid) return;
    updateMemeStepUI();
    if (memeState.step === 2) {
        resetPersonalCardMedia();
        grid.replaceChildren();
        const cards = document.createElement('div');
        cards.className = 'meme-vote-grid';
        for (const id of memeState.candidateIds) {
            const meme = findMeme(id);
            if (meme) cards.appendChild(createMemeCard(meme));
        }
        grid.appendChild(cards);
        return;
    }
    const opened = new Set([...grid.querySelectorAll('[data-group][aria-expanded="true"]')].map(button => button.dataset.group));
    const official = SeasonFilter.filterAnimeList(typeof AnimeMemeData === 'undefined' ? [] : AnimeMemeData);
    const groups = new Map();
    for (const meme of [...official, ...personalMemes]) {
        const quarter = /^[1-4]분기$/.test(meme.quarter) ? meme.quarter : '분기 미지정';
        if (!groups.has(quarter)) groups.set(quarter, []);
        groups.get(quarter).push(meme);
    }
    resetPersonalCardMedia();
    grid.replaceChildren();
    const selectedQuarter = SeasonFilter.getSelectedSeason().quarter;
    const showQuarter = SeasonFilter.showQuarterAccordion();
    function accordion(parent, label, key, level) {
        const section = document.createElement('div');
        section.className = `${level}-section`;
        const button = document.createElement('button');
        button.className = `${level}-btn`;
        button.dataset.group = key;
        const text = document.createElement('span');
        text.textContent = label;
        const arrow = document.createElement('span');
        arrow.textContent = '▼';
        button.append(text, arrow);
        const content = document.createElement('div');
        content.className = `${level}-content`;
        function toggle(open) {
            button.setAttribute('aria-expanded', String(open));
            button.classList.toggle('active', open);
            content.hidden = !open;
        }
        toggle(opened.has(key));
        button.onclick = () => toggle(button.getAttribute('aria-expanded') !== 'true');
        section.append(button, content);
        parent.appendChild(section);
        return content;
    }
    for (const [quarter, memes] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
        const parent = showQuarter ? accordion(grid, quarter, quarter, 'quarter') : grid;
        const cards = document.createElement('div');
        cards.className = 'meme-vote-grid';
        memes.forEach(meme => cards.appendChild(createMemeCard(meme)));
        parent.appendChild(cards);
    }
}

function createMemeCard(meme) {
    const srcs = getSrcs(meme);
    const firstSrc = srcs.find(src => src.url === memeState.sources.get(String(meme.id))) || srcs[0] || { url: '' };
    const isVideo = isMemeVideo(firstSrc.url);

    const card = document.createElement("div");
    card.className = "card meme-card";
    card.id = `card-${meme.id}`;
    card.classList.toggle("selected", memeState.step === 1 ? memeState.candidateIds.has(String(meme.id)) : String(memeState.selectedMeme?.id) === String(meme.id));

    const zoomBtn = document.createElement("button");
    zoomBtn.className = "zoom-btn";
    zoomBtn.title = "확대 보기";
    zoomBtn.setAttribute("aria-label", "이미지 크게 보기");
    zoomBtn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="10.8" cy="10.8" r="6.8"></circle>
            <path d="m16 16 4.5 4.5M10.8 7.8v6M7.8 10.8h6"></path>
        </svg>
    `;
    zoomBtn.onclick = (e) => openMemeZoom(meme.id, e);

    const mediaBox = document.createElement("div");
    mediaBox.className = "media-box";
    mediaBox.id = `media-${meme.id}`;

    if (meme.isPersonal) {
        observePersonalCard(mediaBox, meme);
    } else {
        renderMemeThumbnail(mediaBox, meme, firstSrc.url);
    }

    const cardInfo = document.createElement("div");
    cardInfo.className = "card-info";
    cardInfo.innerHTML = `
        <div class="card-title">${escapeMemeText(meme.name)}</div>
        <div class="card-studio">${escapeMemeText(meme.origin || '출처 불명')}</div>
    `;

    if (meme.isPersonal) {
        const actions = document.createElement('div');
        actions.className = 'personal-card-actions';
        for (const [label, action] of [['수정', () => openPersonalEditor(meme.id)], ['삭제', () => deletePersonalMeme(meme.id)]]) {
            const button = document.createElement('button');
            button.textContent = label;
            button.onclick = event => { event.stopPropagation(); action(); };
            actions.appendChild(button);
        }
        cardInfo.appendChild(actions);
    }
    card.appendChild(zoomBtn);
    card.appendChild(mediaBox);
    card.appendChild(cardInfo);

    card.onclick = () => selectMeme(meme.id);
    return card;
}

// ✅ 삭제: 코드 어디서도 호출되지 않던 죽은 함수 renderMemeCard() 제거
//         (createMemeCard()가 실제 카드 렌더링을 담당하며 기능이 완전히 중복됨)

function switchSrc(memeId, srcUrl, tabBtn, e) {
    e.stopPropagation();

    const card = document.getElementById(`card-${memeId}`);
    card.querySelectorAll('.src-tab').forEach(t => t.classList.remove('active'));
    tabBtn.classList.add('active');

    const mediaBox = document.getElementById(`media-${memeId}`);
    const meme = findMeme(memeId);   // ✅ 수정
    const isVideo = isMemeVideo(srcUrl);

    renderMemeThumbnail(mediaBox, meme, srcUrl);

    if (memeState.selectedMeme?.id === memeId) {
        memeState.selectedSrc = srcUrl;
    }
}

function toggleAccordion(btn) {
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('open'));
    document.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
    if (!isOpen) {
        btn.classList.add('open');
        btn.nextElementSibling.classList.add('open');
    }
}

function updateMemeStepUI() {
    const first = memeState.step === 1;
    document.getElementById('btn-next').classList.toggle('hidden', !first);
    document.getElementById('btn-next').disabled = !memeState.candidateIds.size;
    document.getElementById('btn-back').classList.toggle('hidden', first);
    document.getElementById('btn-award').classList.toggle('hidden', first);
    document.getElementById('btn-award').disabled = !memeState.selectedMeme;
    document.getElementById('btn-home').classList.toggle('hidden', !first);
    document.getElementById('add-personal-meme').classList.toggle('hidden', !first);
    const preview = document.getElementById('preview-box');
    preview.classList.toggle('hidden', !first);
    preview.replaceChildren();
    document.getElementById('meme-step-heading').textContent = first ? '후보를 선택해주세요' : '최종 수상작을 선택해주세요';
    if (!memeState.candidateIds.size) preview.textContent = '후보를 선택해주세요';
    for (const id of memeState.candidateIds) {
        const meme = findMeme(id);
        if (!meme) continue;
        const row = document.createElement('div');
        const remove = NominateCommon.setupPreviewItem(row, meme.name);
        remove.onclick = () => {
            memeState.candidateIds.delete(id);
            renderMemeGrid();
        };
        preview.appendChild(row);
    }
}

function goMemeStep2() {
    if (!memeState.candidateIds.size) return;
    closePopup();
    memeState.step = 2;
    memeState.selectedMeme = null;
    memeState.selectedSrc = null;
    renderMemeGrid();
}

function goMemeStep1() {
    closePopup();
    memeState.step = 1;
    memeState.selectedMeme = null;
    memeState.selectedSrc = null;
    renderMemeGrid();
}

function selectMeme(id) {
    const meme = findMeme(id);
    if (!meme) return;
    const key = String(id);
    if (memeState.step === 1) {
        if (memeState.candidateIds.has(key)) memeState.candidateIds.delete(key);
        else memeState.candidateIds.add(key);
    } else {
        if (!memeState.candidateIds.has(key)) return;
        memeState.selectedMeme = meme;
        memeState.selectedSrc = meme.isPersonal ? null : memeState.sources.get(key) || getSrcs(meme)[0]?.url || '';
    }
    document.querySelectorAll('.meme-card').forEach(card => {
        const cardId = card.id.slice(5);
        card.classList.toggle('selected', memeState.step === 1 ? memeState.candidateIds.has(cardId) : cardId === key);
    });
    updateMemeStepUI();
}

function openMemeZoom(id, e) {
    if (e) e.stopPropagation();
    const meme = findMeme(id);   // ✅ 수정
    const popup = document.getElementById("winner-popup");
    if (!meme || !popup) return;

    closePopup();
    const srcs = getSrcs(meme);
    const initialIndex = Math.max(0, srcs.findIndex(src => src.url === memeState.sources.get(String(id))));

    function renderZoomMedia(src) {
        const isVideo = isMemeVideo(src.url);
        return isVideo
            ? `<video class="zoom-media" src="${escapeMemeText(memeMediaUrl(src.url))}" controls autoplay loop playsinline></video>`
            : `<img class="zoom-media" src="${escapeMemeText(memeMediaUrl(src.url))}" alt="${escapeMemeText(meme.name)}">`;
    }

    const tabsHtml = srcs.length > 1 ? `
        <div class="popup-tabs">
            ${srcs.map((s, i) => `
                <button class="popup-tab ${i === initialIndex ? 'active' : ''}"
                    onclick="switchPopupSrc('${meme.id}', ${i})">
                    ${escapeMemeText(s.label)}
                </button>
            `).join('')}
        </div>
    ` : '';

    popup.innerHTML = `
        <div class="modal-content meme-zoom-modal-content">
            <button class="zoom-close-btn" onclick="closePopup()">✕</button>
            <h2 class="modal-header">${escapeMemeText(meme.name)}</h2>
            <hr class="modal-divider">
            ${tabsHtml}
            <div id="popup-media" style="text-align:center; padding:10px; border-radius:10px;">
                ${meme.isPersonal ? '' : (srcs[initialIndex] ? renderZoomMedia(srcs[initialIndex]) : '등록된 미디어가 없습니다.')}
            </div>
            <p style="color:#aaa; text-align:center; margin-top:20px;">출처: ${escapeMemeText(meme.origin)}</p>
        </div>
    `;
    popup.classList.remove('hidden');

    if (meme.isPersonal) loadPersonalMedia(document.getElementById('popup-media'), meme, 'zoom');
    popup._meme = meme;
    popup._srcs = srcs;
}

function switchPopupSrc(memeId, srcIndex) {
    const popup = document.getElementById("winner-popup");
    const srcs = popup._srcs;
    const meme = popup._meme;
    if (!srcs || !meme) return;

    popup.querySelectorAll('.popup-tab').forEach((t, i) => {
        t.classList.toggle('active', i === srcIndex);
    });

    const src = srcs[srcIndex];
    if (!src) return;
    memeState.sources.set(String(meme.id), src.url);
    if (String(memeState.selectedMeme?.id) === String(meme.id)) memeState.selectedSrc = src.url;
    const cardMedia = document.getElementById(`media-${meme.id}`);
    if (cardMedia) renderMemeThumbnail(cardMedia, meme, src.url);
    const isVideo = isMemeVideo(src.url);
    const mediaBox = document.getElementById('popup-media');

    mediaBox.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });

    mediaBox.innerHTML = isVideo
        ? `<video class="zoom-media" src="${escapeMemeText(memeMediaUrl(src.url))}" controls autoplay loop playsinline></video>`
        : `<img class="zoom-media" src="${escapeMemeText(memeMediaUrl(src.url))}" alt="${escapeMemeText(meme.name)}">`;
}

function saveMemeWinner() {
    const winner = memeState.selectedMeme;
    if (memeState.step !== 2 || !winner || !memeState.candidateIds.has(String(winner.id))) return;

    const srcs = getSrcs(winner);
    const savedSrc = winner.isPersonal ? '' : memeState.selectedSrc || srcs[0]?.url || '';

    ResultStorage.saveOne(memeState.awardName, {
        title: winner.name,
        thumbnail: winner.isPersonal ? '' : savedSrc,
        ...(winner.isPersonal ? { isPersonal: true, personalMemeId: winner.id } : {}),
        origin: winner.origin
    });
    

    showWinnerCelebration(winner, savedSrc);
}

function showWinnerCelebration(winner, src) {
    const popup = document.getElementById("winner-popup");
    if (!popup) return;
    closePopup();
    const isVideo = isMemeVideo(src);

    popup.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <h2 class="modal-header">FINAL WINNER</h2>
            <hr class="modal-divider">
            <div class="media-box" style="margin: 0 auto 20px auto; max-width: 500px; border-radius: 10px; overflow: hidden; background: transparent;">
                ${winner.isPersonal ? '' : isVideo
                    ? `<video src="${escapeMemeText(memeMediaUrl(src))}" autoplay loop muted style="width:100%; border-radius:10px;"></video>`
                    : `<img src="${escapeMemeText(memeMediaUrl(src))}" style="width:100%; border-radius:10px;">`}
            </div>
            <h1 style="color: #fff; margin: 0 0 10px 0;">${escapeMemeText(winner.name)}</h1>
            <p style="color: #888; margin: 0;">${escapeMemeText(winner.origin)}</p>
            <div style="margin-top: 30px;">
                <button class="gold-btn" onclick="location.href=AwardPage.homeUrl()">결과 저장 및 메인으로</button>
            </div>
        </div>
    `;
    popup.classList.remove('hidden');
    if (winner.isPersonal) loadPersonalMedia(popup.querySelector('.media-box'), winner, 'winner');
    window.NominateCommon.fireConfetti();
}

function closePopup() {
    const popup = document.getElementById("winner-popup");
    if (!popup) return;
    for (const box of personalMediaLoads.keys()) {
        if (popup.contains(box)) releasePersonalMedia(box);
    }
    popup.querySelectorAll('video').forEach(v => {
        v.pause(); v.removeAttribute('src'); v.load();
    });
    popup.innerHTML = "";
    popup.classList.add('hidden');
    popup.classList.remove('single-award-modal');
}
