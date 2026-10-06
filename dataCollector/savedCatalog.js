// Data is rendered as text, including user-edited titles.
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
    grid.className = 'saved-catalog-grid';
    host.append(label, count, grid);
    function render() {
        const items = records();
        const query = search.value.trim().toLocaleLowerCase();
        const visible = items.filter(item => [item.title, item.meta, ...item.lines].join(' ').toLocaleLowerCase().includes(query));
        count.textContent = `전체 ${items.length}개 · 표시 ${visible.length}개`;
        grid.replaceChildren();
        for (const item of visible) {
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
            grid.append(card);
        }
        if (!visible.length) grid.textContent = items.length ? '검색 결과가 없습니다.' : '저장된 데이터가 없습니다.';
    }
    search.addEventListener('input', render);
    render();
    return { render };
};
