// Plays the selected season's saved winners without changing the results.
(() => {
    const ranks = ['우수상', '최우수상', '대상'];
    const fallback = './image/no-image.svg';
    let dialog, stage, slides = [], position = 0, timer, playing = true;
    let renderVersion = 0, mediaUrl = null, previousOverflow = '', opener;

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function image(source, className, alt) {
        const img = element('img', className);
        img.alt = alt;
        img.onerror = () => { img.onerror = null; img.src = fallback; };
        img.src = source || fallback;
        return img;
    }

    function seasonTitle() {
        const season = SeasonFilter.getSelectedSeason();
        return `${season.year}년 ${season.quarter === '모든 분기' ? '연간' : season.label} Anime Awards`;
    }

    function winnerSlide(award, winner) {
        const couple = winner.bestcouple || winner;
        let title = couple.name1 && couple.name2 ? `${couple.name1} ♥ ${couple.name2}`
            : winner.title || winner.name || winner.animeTitle || '수상작';
        const details = [];
        if (winner.episodeNo != null) {
            const number = String(winner.episodeNo).trim();
            const label = /^\d+(?:\.\d+)?$/.test(number) ? `${number}화` : number;
            details.push(`${label}${winner.episodeTitle ? ' · ' + winner.episodeTitle : ''}`);
        } else if (winner.animeTitle && winner.animeTitle !== title) details.push(winner.animeTitle);
        const trophy = getAwardTrophy(award);
        let source = winner.thumbnail || winner.img || winner.image || winner.cvimg || '';
        if (['voice_male', 'voice_female'].includes(award.theme)) {
            source = (window.CharacterVoiceData || []).find(voice => voice.name === winner.name)?.cvimg || source;
        }
        // Keep large meme videos unloaded: the ending uses their static posters.
        if (isAwardVideo(source)) source = source.replace(/(\.(?:mp4|webm|mov|m4v|ogv))(?=[?#]|$)/i, '$1.poster.jpg');
        return {type: 'winner', award: award.name, title, detail: details.join(' · '), source: source || trophy,
            trophy, personalId: winner.personalMemeId, rank: ranks.includes(award.name) ? award.name : ''};
    }

    function savedSlides() {
        const results = ResultStorage.getResults();
        const ordinary = Awards.filter(award => !ranks.includes(award.name) && !['top3', 'series'].includes(award.theme))
            .filter(award => results[award.name] && typeof results[award.name] === 'object' && !Array.isArray(results[award.name]))
            .map(award => winnerSlide(award, results[award.name]));
        for (const rank of ranks) {
            const winner = getTop3Winner(results, rank);
            if (winner) ordinary.push(winnerSlide(Awards.find(award => award.name === rank) || {name: rank, theme: 'default'}, winner));
        }
        return ordinary;
    }

    function releaseMedia() {
        if (mediaUrl) { URL.revokeObjectURL(mediaUrl); mediaUrl = null; }
    }

    function schedule() {
        clearTimeout(timer);
        if (dialog.open && playing && !document.hidden && position < slides.length - 1) {
            timer = setTimeout(() => show(position + 1), slides[position].rank ? 6500 : 4800);
        }
    }

    function show(nextPosition) {
        clearTimeout(timer);
        releaseMedia();
        position = Math.max(0, Math.min(nextPosition, slides.length - 1));
        const slide = slides[position], version = ++renderVersion;
        const content = element('div', 'ending-preview-slide');
        stage.replaceChildren(content);
        dialog.style.setProperty('--ending-tone', slide.rank === '우수상' ? '#cf9d79' : slide.rank === '최우수상' ? '#c4ccd7' : 'var(--gold)');

        if (slide.type === 'intro') {
            content.classList.add('ending-preview-intro');
            content.append(image(getAwardTrophy({theme: 'top3'}), '', ''),
                element('p', 'ending-preview-kicker', 'A YEAR OF STORIES · YOUR CHOICE'),
                element('h2', '', seasonTitle()), element('div', 'ending-preview-rule'),
                element('p', '', `${slide.count}개 부문, 당신이 고른 순간들을 돌아봅니다.`));
        } else if (slide.type === 'winner') {
            content.append(element('p', 'ending-preview-kicker', slide.rank ? 'THE HIGHLIGHT OF YOUR AWARDS' : 'WINNER'),
                element('h2', '', SeasonFilter.toDisplayAwardName(slide.award)));
            const layout = element('div', 'ending-preview-winner-layout');
            layout.dataset.rank = slide.rank;
            const art = element('div', 'ending-preview-art');
            const poster = image(slide.source, 'ending-preview-image', slide.title);
            art.append(poster);
            const copy = element('div', 'ending-preview-copy');
            copy.append(image(slide.trophy, 'ending-preview-trophy', ''), element('h3', '', slide.title));
            if (slide.detail) copy.append(element('p', 'ending-preview-detail', slide.detail));
            layout.append(art, copy); content.append(layout);
            if (slide.personalId && window.PersonalMemeStorage) {
                PersonalMemeStorage.get(slide.personalId).then(record => {
                    if (!record || version !== renderVersion || !dialog.open) return;
                    // Personal videos have no guaranteed poster; retain the trophy.
                    if (record.type === 'video') { poster.src = slide.trophy; return; }
                    mediaUrl = URL.createObjectURL(record.file);
                    poster.src = mediaUrl;
                }).catch(() => { /* An unavailable personal file retains the fallback. */ });
            }
        } else {
            content.classList.add('ending-preview-finish');
            const grand = slides.find(item => item.rank === '대상');
            content.append(element('p', 'ending-preview-kicker', 'UNTIL THE NEXT STORY'),
                element('h2', '', '시상식이 완료되었습니다. 감사합니다.'),
                image(grand?.source || getAwardTrophy({theme: 'top3'}), '', grand?.title || '트로피'),
                element('p', '', grand ? `대상 · ${grand.title}` : seasonTitle()));
            const actions = element('div', 'ending-preview-finish-actions');
            const back = element('button', '', '전체 결과 보기'); back.type = 'button'; back.onclick = () => dialog.close();
            const replay = element('button', '', '다시 보기'); replay.type = 'button'; replay.onclick = () => { playing = true; show(0); };
            actions.append(back, replay); content.append(actions);
        }
        dialog.querySelector('[data-ending-position]').textContent = `${position + 1} / ${slides.length}`;
        dialog.querySelector('[data-ending-progress]').style.width = `${(position + 1) / slides.length * 100}%`;
        dialog.querySelector('[data-ending-prev]').disabled = position === 0;
        dialog.querySelector('[data-ending-next]').disabled = position === slides.length - 1;
        const pause = dialog.querySelector('[data-ending-pause]');
        pause.disabled = position === slides.length - 1;
        pause.textContent = playing ? '일시정지' : '자동 재생';
        pause.setAttribute('aria-pressed', String(!playing));
        dialog.scrollTop = 0;
        schedule();
    }

    function buildDialog() {
        dialog = element('dialog', 'ending-preview-dialog');
        dialog.setAttribute('aria-label', '시상식 엔딩');
        dialog.innerHTML = `<div class="ending-preview-shell">
            <div class="ending-preview-top"><div><span class="ending-preview-brand">ANIME AWARDS · ENDING</span><span class="ending-preview-mode"></span></div><button type="button" class="ending-preview-close">닫기 ×</button></div>
            <div class="ending-preview-stage" aria-live="off"></div>
            <div class="ending-preview-controls"><div class="ending-preview-progress"><div class="ending-preview-progress-fill" data-ending-progress></div></div>
            <div class="ending-preview-control-row"><div class="ending-preview-nav"><button type="button" data-ending-prev>이전</button><button type="button" data-ending-pause aria-pressed="false">일시정지</button><button type="button" data-ending-next>다음</button></div>
            <span class="ending-preview-position" data-ending-position role="status"></span><button type="button" data-ending-skip>엔딩으로 건너뛰기</button></div></div></div>`;
        document.body.append(dialog);
        stage = dialog.querySelector('.ending-preview-stage');
        dialog.querySelector('.ending-preview-close').onclick = () => dialog.close();
        dialog.querySelector('[data-ending-prev]').onclick = () => show(position - 1);
        dialog.querySelector('[data-ending-next]').onclick = () => show(position + 1);
        dialog.querySelector('[data-ending-skip]').onclick = () => show(slides.length - 1);
        dialog.querySelector('[data-ending-pause]').onclick = () => {
            playing = !playing;
            const button = dialog.querySelector('[data-ending-pause]');
            button.textContent = playing ? '일시정지' : '자동 재생';
            button.setAttribute('aria-pressed', String(!playing));
            schedule();
        };
        dialog.addEventListener('keydown', event => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault(); show(position + (event.key === 'ArrowRight' ? 1 : -1));
            }
        });
        dialog.addEventListener('close', () => {
            clearTimeout(timer); ++renderVersion; releaseMedia();
            stage.replaceChildren(); slides = [];
            document.body.style.overflow = previousOverflow;
            opener?.focus();
        });
        document.addEventListener('visibilitychange', schedule);
    }

    function open(button) {
        const entries = savedSlides();
        if (!entries.length) {
            alert('먼저 한 개 이상의 부문에서 수상작을 선택해주세요.');
            return;
        }
        if (!dialog) buildDialog();
        if (dialog.open) return;
        opener = button; playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
        slides = [{type: 'intro', count: entries.length}, ...entries, {type: 'finish'}];
        dialog.querySelector('.ending-preview-mode').textContent = '당신이 선택한 수상작들을 돌아봅니다.';
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        show(0);
        dialog.querySelector('.ending-preview-close').focus();
    }

    AwardPage.onReady(() => {
        document.getElementById('ending-open-btn').addEventListener('click', event => open(event.currentTarget));
    });
})();
