(function () {
    function present() {
        const modal = ['winner-modal', 'winner-popup', 'awardModal']
            .map(id => document.getElementById(id))
            .find(el => el && !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none'
                && (!el.classList.contains('modal-overlay') || el.classList.contains('active')));
        if (!modal) return false;
        const content = modal.querySelector('.modal-content');
        if (!content) return false;
        NominateCommon.installImageFallback();
        modal.classList.add('single-award-modal');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'single-award-heading');

        let header = content.querySelector('.single-award-header');
        if (!header) {
            header = document.createElement('header');
            header.className = 'single-award-header';
            const eyebrow = document.createElement('p');
            eyebrow.className = 'single-award-eyebrow';
            eyebrow.textContent = 'ANIME AWARDS · WINNER';
            const heading = document.createElement('h2');
            heading.id = 'single-award-heading';
            header.append(eyebrow, heading);
            content.prepend(header);
        }
        const rawName = new URLSearchParams(location.search).get('awardName') || '수상 결과';
        const heading = content.querySelector('#single-award-heading');
        heading.textContent = SeasonFilter.toDisplayAwardName(rawName);

        const mediaSelector = '.winner-left, .winner-poster, .media-box, .modal-thumb-wrap, .award-couple-display';
        const candidates = [...content.querySelectorAll(mediaSelector)];
        const media = candidates.find(el => !el.closest('.single-award-podium')) || candidates[0];
        if (!media) return false;
        let podium = content.querySelector('.single-award-podium');
        if (podium && !podium.contains(media)) { podium.remove(); podium = null; }
        if (!podium) {
            podium = document.createElement('div');
            podium.className = 'single-award-podium';
            const light = document.createElement('div');
            light.className = 'single-award-light';
            light.setAttribute('aria-hidden', 'true');
            const stand = document.createElement('div');
            stand.className = 'single-award-stand';
            const name = document.createElement('div');
            name.className = 'single-award-name';
            stand.appendChild(name);
            podium.append(light, media, stand);
            header.after(podium);
        }
        const title = content.querySelector('#modal-title, #winner-title, .winner-title, .winner-name-value, #winner-info-content .info-value')
            || [...content.querySelectorAll('h1')][0];
        const coupleNames = [...content.querySelectorAll('.award-char span')].map(el => el.textContent.trim());
        const winnerName = document.createElement('span');
        winnerName.className = 'single-award-winner-name';
        winnerName.textContent = coupleNames.length
            ? coupleNames.join(' ♥ ') : title?.textContent.trim() || media.querySelector('img')?.alt || '수상작';
        const episodeNumber = content.querySelector('#modal-episode-no')?.textContent.trim();
        if (episodeNumber && episodeNumber !== '-') {
            winnerName.textContent += ` · ${/^\d+(?:\.\d+)?$/.test(episodeNumber) ? episodeNumber + '화' : episodeNumber}`;
        }
        podium.querySelector('.single-award-name').replaceChildren(heading, winnerName);
        if (title) title.classList.add('single-award-source-title');
        if (coupleNames.length) podium.classList.add('single-award-couple');
        content.querySelectorAll('img').forEach(img => {
            img.onerror = null;
            if (!img.getAttribute('src') || (img.complete && !img.naturalWidth)) {
                img.src = NominateCommon.imageSource(null);
            }
        });
        modal.scrollTop = 0;
        return true;
    }
    window.WinnerStage = { present };
})();
