let personalMemes = [];
let personalRecords = [];
let editingPersonalId = null;
const personalMediaLoads = new Map();
const personalCardObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
        const box = entry.target;
        if (entry.isIntersecting) loadPersonalMedia(box, box._personalMeme);
        else releasePersonalMedia(box);
    }
});

function releasePersonalMedia(box) {
    const pending = personalMediaLoads.get(box);
    if (!pending) return;
    personalMediaLoads.delete(box);
    box.querySelectorAll('video').forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
    box.replaceChildren();
    if (pending.url) URL.revokeObjectURL(pending.url);
}

function resetPersonalCardMedia() {
    personalCardObserver.disconnect();
    for (const box of personalMediaLoads.keys()) {
        if (box.closest('#meme-grid')) releasePersonalMedia(box);
    }
}

function observePersonalCard(box, meme) {
    box._personalMeme = meme;
    personalCardObserver.observe(box);
}

async function loadPersonalMedia(box, meme, mode = 'card') {
    if (personalMediaLoads.has(box)) return;
    const pending = { url: null };
    personalMediaLoads.set(box, pending);
    box.textContent = '불러오는 중…';
    try {
        const record = await PersonalMemeStorage.get(meme.id);
        if (personalMediaLoads.get(box) !== pending || !box.isConnected) return;
        if (!record) throw new Error('저장된 파일이 없습니다.');
        pending.url = URL.createObjectURL(record.file);
        const media = document.createElement(record.type === 'video' ? 'video' : 'img');
        if (record.type === 'video') {
            media.controls = mode !== 'winner';
            media.preload = 'none';
            media.playsInline = true;
            media.loop = true;
            media.muted = mode === 'winner';
            media.autoplay = mode === 'winner';
            media.onclick = event => event.stopPropagation();
        } else { media.alt = record.name; }
        if (mode === 'zoom') media.className = 'zoom-media';
        media.src = pending.url;
        box.replaceChildren(media);
    } catch (error) {
        if (personalMediaLoads.get(box) === pending && box.isConnected) box.textContent = `미디어를 불러오지 못했습니다: ${error.message}`;
    }
}
const escapeMemeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const memeMediaUrl = src => src.startsWith('blob:') ? src : `../${src}`;
const findMeme = id => [...(typeof AnimeMemeData === 'undefined' ? [] : AnimeMemeData), ...personalMemes].find(m => String(m.id) === String(id));

async function loadPersonalMemes() {
    const status = document.getElementById('personal-storage-error');
    try {
        personalRecords = await PersonalMemeStorage.all();
        const { year, quarter } = SeasonFilter.getSelectedSeason();
        personalMemes = personalRecords.filter(m => String(m.year) === String(year) && (quarter === '모든 분기' || m.quarter === quarter))
            .map(m => ({ ...m, isPersonal: true }));
        status.hidden = true;
        renderMemeGrid();
        if (memeState.selectedMeme) {
            const selected = findMeme(memeState.selectedMeme.id);
            if (selected) selectMeme(selected.id);
            else { memeState.selectedMeme = null; memeState.selectedSrc = null; document.getElementById('btn-award').disabled = true; }
        }
    } catch (error) {
        status.hidden = false;
        status.textContent = `개인 밈을 불러올 수 없습니다: ${error.message}`;
    }
}

function openPersonalEditor(id = null) {
    const { year, quarter } = SeasonFilter.getSelectedSeason();
    if (!year || !quarter) { alert('메인 화면에서 연도와 분기를 먼저 선택해주세요.'); return; }
    const record = personalRecords.find(m => m.id === id);
    editingPersonalId = record?.id || null;
    document.getElementById('personal-meme-form').reset();
    document.getElementById('personal-editor-title').textContent = record ? '밈 수정' : '밈 추가';
    document.getElementById('personal-name').value = record?.name || '';
    document.getElementById('personal-origin').value = record?.origin || '';
    document.getElementById('personal-quarter').value = /^[1-4]분기$/.test(record?.quarter || quarter) ? (record?.quarter || quarter) : '';
    document.getElementById('personal-file').required = !record;
    document.getElementById('personal-editor-error').textContent = '';
    document.getElementById('personal-editor').showModal();
}

async function deletePersonalMeme(id) {
    if (!confirm('이 개인 밈을 삭제할까요? 해당 밈의 저장된 수상 결과도 삭제됩니다.')) return;
    try {
        await PersonalMemeStorage.remove(id);
        // 이 기기의 모든 시즌에서 삭제된 미디어를 참조하는 결과를 정리한다.
        for (const key of Object.keys(localStorage).filter(k => k.startsWith('anime_awards_result_'))) {
            let results;
            try { results = JSON.parse(localStorage.getItem(key)); } catch { continue; }
            if (!results || typeof results !== 'object') continue;
            let changed = false;
            for (const award of Object.keys(results)) {
                if (results[award]?.personalMemeId === id) { delete results[award]; changed = true; }
            }
            if (changed) localStorage.setItem(key, JSON.stringify(results));
        }
        await loadPersonalMemes();
    } catch (error) { alert(`삭제 실패: ${error.message}`); }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-personal-meme').onclick = () => openPersonalEditor();
    document.getElementById('personal-editor-cancel').onclick = () => document.getElementById('personal-editor').close();
    document.getElementById('personal-meme-form').onsubmit = async event => {
        event.preventDefault();
        const button = document.getElementById('personal-editor-save');
        button.disabled = true;
        try {
            const season = SeasonFilter.getSelectedSeason();
            await PersonalMemeStorage.save({
                id: editingPersonalId || `personal-${crypto.randomUUID()}`,
                year: season.year, quarter: document.getElementById('personal-quarter').value,
                name: document.getElementById('personal-name').value.trim(),
                origin: document.getElementById('personal-origin').value.trim(),
                file: document.getElementById('personal-file').files[0]
            });
            document.getElementById('personal-editor').close();
            await loadPersonalMemes();
        } catch (error) {
            document.getElementById('personal-editor-error').textContent = error.name === 'QuotaExceededError' ? '브라우저 저장 공간이 부족합니다. 공간을 확보한 후 다시 시도해주세요.' : error.message;
        } finally { button.disabled = false; }
    };
    loadPersonalMemes();
});
// 뒤로 가기 캐시에서는 미디어 URL을 유지한다. 문서 종료 시 브라우저가 자동 해제한다.
window.addEventListener('pageshow', event => { if (event.persisted) loadPersonalMemes(); });
