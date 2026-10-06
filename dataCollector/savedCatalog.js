// Data is rendered as text, including user-edited titles.
window.getCatalogQuarters = function (value) {
    const quarters = (Array.isArray(value) ? value : [value])
        .flatMap(q => String(q ?? '').split(/[,，]/))
        .map(q => q.trim().replace(/^Q([1-4])$/i, '$1분기'))
        .filter(q => /^[1-4]분기$/.test(q));
    return [...new Set(quarters)].sort();
};

window.createSavedCatalog = function ({ host, records, onSelect }) {
    const label = document.createElement('label');
    label.textContent = '저장된 작품 검색';
    const search = document.createElement('input');
    search.type = 'search';
    search.className = 'saved-catalog-search';
    search.placeholder = '애니메이션 제목, ID 또는 저장된 제목 검색';
    label.append(search);
    const count = document.createElement('p');
    count.className = 'catalog-count';
    count.setAttribute('aria-live', 'polite');
    const grid = document.createElement('div');
    grid.className = 'saved-catalog-groups';
    const openGroups = new Map();
    host.append(label, count, grid);
    function render() {
        const items = records();
        const query = search.value.trim().toLocaleLowerCase();
        const visible = items.filter(item => [item.title, item.meta, ...item.lines].join(' ').toLocaleLowerCase().includes(query));
        count.textContent = `전체 ${items.length}개 · 표시 ${visible.length}개`;
        const scrollTop = grid.scrollTop;
        grid.replaceChildren();
        const groups = new Map();
        for (const item of visible) {
            const quarters = getCatalogQuarters(item.quarters);
            for (const quarter of quarters.length ? quarters : ['분기 미지정']) {
                if (!groups.has(quarter)) groups.set(quarter, []);
                groups.get(quarter).push(item);
            }
        }
        for (const [quarter, entries] of [...groups].sort(([a], [b]) => a.localeCompare(b, 'ko'))) {
            const section = document.createElement('details');
            section.className = 'catalog-quarter';
            section.open = query ? true : (openGroups.get(quarter) ?? entries.some(item => item.selected));
            section.addEventListener('toggle', () => {
                if (section.isConnected && !search.value.trim()) openGroups.set(quarter, section.open);
            });
            const heading = document.createElement('summary');
            heading.textContent = `${quarter} · ${entries.length}개`;
            const cards = document.createElement('div');
            cards.className = 'saved-catalog-grid';
            for (const item of entries) {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'catalog-item';
            card.setAttribute('aria-pressed', String(!!item.selected));
            for (const [className, text] of [['catalog-title', item.title], ['catalog-meta', item.meta], ...item.lines.map(line => ['catalog-line', line])]) {
                const span = document.createElement('span');
                span.className = className;
                span.textContent = text;
                card.append(span);
            }
            card.addEventListener('click', () => onSelect(item.key));
            cards.append(card);
            }
            section.append(heading, cards);
            grid.append(section);
        }
        if (!visible.length) grid.textContent = items.length ? '검색 결과가 없습니다.' : '저장된 데이터가 없습니다.';
        grid.scrollTop = scrollTop;
    }
    search.addEventListener('input', render);
    render();
    return { render };
};
