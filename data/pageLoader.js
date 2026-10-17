// Loads only the selected year's data, then starts the existing page scripts.
(() => {
    const root = new URL('../', document.currentScript.src);
    const isMain = document.body.hasAttribute('data-main-page');
    const params = new URLSearchParams(location.search);
    const years = AvailableYears.map(String);
    const requestedYear = params.get('year') || localStorage.getItem('selected_year');
    const validYear = years.includes(requestedYear) ? requestedYear : null;
    const loadedYear = validYear || years[0];
    const normalize = value => {
        const values = String(value || '').split(',').map(value => value.trim());
        if (values.includes('모든 분기')) return '모든 분기';
        const selected = ['1분기', '2분기', '3분기', '4분기'].filter(q => values.includes(q.trim()));
        return selected.length === 4 ? '모든 분기' : selected.join(',');
    };
    const season = {
        year: validYear,
        quarter: validYear ? normalize(params.has('year') ? params.get('quarter') : localStorage.getItem('selected_quarter')) : ''
    };
    const callbacks = [];
    let ready = false;
    window.AwardPage = {
        loadedYear, season,
        onReady(callback) { if (ready) callback(); else callbacks.push(callback); },
        homeUrl() {
            const url = new URL('index.html', root);
            if (season.year && season.quarter) {
                url.searchParams.set('year', season.year);
                url.searchParams.set('quarter', season.quarter);
            }
            return url.href;
        }
    };
    if (!isMain && (!season.year || !season.quarter)) {
        location.replace(new URL('index.html', root).href);
        return;
    }
    if (season.year) {
        localStorage.setItem('selected_year', season.year);
        if (season.quarter) localStorage.setItem('selected_quarter', season.quarter);
    }
    function notice(message, error = false) {
        let node = document.getElementById('year-data-notice');
        if (!node) {
            node = document.createElement('div'); node.id = 'year-data-notice';
            Object.assign(node.style, { padding: '16px', margin: '16px auto', width: 'min(94%, 1000px)',
                border: '1px solid var(--gold, #c9a55a)', borderRadius: '10px', color: 'var(--text-body, #e6dcd3)',
                background: 'var(--surface, #1f0f13)', position: 'relative', zIndex: '2' });
            const target = isMain && !error ? document.getElementById('content-area') : document.body;
            target.prepend(node);
        }
        node.setAttribute('role', error ? 'alert' : 'status'); node.textContent = message;
    }
    function load(src, module = false) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            let runtimeError;
            const capture = event => {
                if (event.filename === src) runtimeError = event.error || new Error(event.message);
            };
            window.addEventListener('error', capture);
            const finish = () => window.removeEventListener('error', capture);
            if (module) script.type = 'module';
            script.src = src; script.onload = () => { finish(); runtimeError ? reject(runtimeError) : resolve(); };
            script.onerror = () => { finish(); reject(new Error(`파일을 불러오지 못했습니다: ${new URL(src).pathname}`)); };
            document.head.append(script);
        });
    }
    async function start() {
        try {
            const scripts = [...document.querySelectorAll('script[data-year-src], script[data-app-src]')];
            const modules = [];
            for (const entry of scripts) {
                let src = entry.dataset.yearSrc || entry.dataset.appSrc;
                if (entry.dataset.yearSrc) src = src.replace(/\{year\}/g, loadedYear);
                const url = new URL(src, document.baseURI).href;
                if (entry.dataset.module === 'true') modules.push(url);
                else await load(url);
            }
            document.title = document.title.replace(/2026/g, loadedYear);
            document.querySelectorAll('.brand, [data-season-year]').forEach(node => {
                node.textContent = node.textContent.replace(/2026/g, loadedYear);
            });
            ready = true;
            callbacks.forEach(callback => callback());
            document.querySelectorAll('a[href]').forEach(anchor => {
                const url = new URL(anchor.href, document.baseURI);
                if (url.href.split('?')[0] === new URL('index.html', root).href) anchor.href = AwardPage.homeUrl();
            });
            const dataEntries = scripts.filter(s => s.dataset.yearSrc);
            if (dataEntries.length && window.YearDataEmpty) {
                notice(`${loadedYear}년 데이터는 아직 등록되지 않았습니다. 데이터를 추가하면 이 페이지에 후보가 표시됩니다.`);
            }
            // Voting is optional: network failure must not prevent local nominations.
            modules.forEach(url => load(url, true).catch(error => console.error(error)));
        } catch (error) {
            console.error(error);
            notice(`${error.message} 새로고침하거나 메인에서 연도를 다시 선택해주세요.`, true);
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
