'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const labels = { op: 'OP', ed: 'ED', ost: 'OST', ep: '에피소드', pv: 'PV' };
  let anime = [], songMap = new Map(), ostMap = new Map(), episodes = {};
  const list = value => Array.isArray(value) ? value.flat(Infinity).filter(Boolean) : [];
  const quarters = value => [...new Set(String(value ?? '').match(/[1-4](?=분기)/g) || [])].map(q => `${q}분기`);
  const text = value => String(value ?? '').trim();
  function el(tag, value, className) {
    const node = document.createElement(tag);
    if (value != null) node.textContent = value;
    if (className) node.className = className;
    return node;
  }
  function index(rows) {
    const map = new Map();
    for (const row of list(rows)) {
      const key = String(row.id);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }
    return map;
  }
  function link(parent, label, url) {
    try {
      const parsed = new URL(url);
      if (!['https:', 'http:'].includes(parsed.protocol)) return;
      const a = el('a', label);
      a.href = parsed.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; parent.append(a);
    } catch { /* 비어 있거나 유효하지 않은 링크는 표시하지 않는다. */ }
  }
  function dataFor(a, quarter) {
    const songs = (songMap.get(String(a.id)) || []).flatMap(record => list(record.songs).filter(song => {
      const qs = quarters(song.quarter).length ? quarters(song.quarter) : quarters(record.quarter);
      return (!qs.length || qs.includes(quarter)) && (text(song.title) || text(song.youtube));
    }));
    return {
      op: songs.filter(s => ['op', 'opening'].includes(text(s.type).toLowerCase())),
      ed: songs.filter(s => ['ed', 'ending'].includes(text(s.type).toLowerCase())),
      ost: (ostMap.get(String(a.id)) || []).filter(o => list(o.albums).length),
      ep: list(episodes[String(a.id)]).filter(e => text(e['episode no']) || text(e['episode title'])),
      pv: list(a.pv).filter(p => text(p.title) || text(p.url))
    };
  }
  function render() {
    $('summary').textContent = `전체 ${anime.length}개 작품 · 여러 분기 작품은 해당 분기마다 표시됩니다.`;
    $('cards').replaceChildren();
    for (const quarter of ['1분기', '2분기', '3분기', '4분기', '분기 미지정']) {
    const rows = anime.filter(a => quarter === '분기 미지정' ? !quarters(a.quarter).length : quarters(a.quarter).includes(quarter))
      .map(a => ({ a, data: dataFor(a, quarter) }));
    if (quarter === '분기 미지정' && !rows.length) continue;
    const group = el('section');
    group.append(el('h2', `${quarter} · ${rows.length}개 작품`));
    const grid = el('div', null, 'cards');
    grid.style.marginTop = '16px';
    group.append(grid); $('cards').append(group);
    for (const { a, data } of rows) {
      const card = el('button', null, 'anime-card'); card.type = 'button';
      card.append(el('span', `ID ${a.id}`, 'card-id'), el('strong', a.title));
      const statuses = el('span', null, 'statuses');
      for (const [key, label] of Object.entries(labels)) {
        const exists = data[key].length > 0;
        const badge = el('span', label, `status${exists ? '' : ' missing'}`);
        badge.append(el('b', exists ? 'O' : 'X')); statuses.append(badge);
      }
      card.append(statuses); card.addEventListener('click', () => openDetail(a, data, quarter));
      grid.append(card);
    }
    if (!rows.length) grid.append(el('p', '등록된 작품이 없습니다.', 'empty'));
    }
  }
  function section(title, rows) {
    const node = el('section'); node.append(el('h3', title));
    if (!rows.length) node.append(el('p', '등록된 데이터가 없습니다.', 'empty'));
    $('detail-body').append(node); return node;
  }
  function table(headers, rows) {
    const wrapper = el('div', null, 'scroll-table'), table = el('table'), head = el('thead'), tr = el('tr');
    headers.forEach(h => tr.append(el('th', h))); head.append(tr); table.append(head);
    const body = el('tbody');
    rows.forEach(values => { const row = el('tr'); values.forEach(value => {
      const td = el('td'); if (value instanceof Node) td.append(value); else td.textContent = value;
      row.append(td);
    }); body.append(row); });
    table.append(body); wrapper.append(table); return wrapper;
  }
  function openDetail(a, data, quarter) {
    $('detail-title').textContent = a.title;
    $('detail-meta').textContent = `ID ${a.id} · ${quarters(a.quarter).join(', ')} · OP/ED는 선택한 ${quarter} 기준`;
    $('detail-body').replaceChildren();
    for (const key of ['op', 'ed']) {
      const node = section(`${labels[key]} (${data[key].length}곡)`, data[key]);
      data[key].forEach(song => {
        const item = el('div', null, 'item'); item.append(el('div', text(song.title) || '제목 미입력', 'item-title'));
        item.append(el('p', text(song.artist) || '아티스트 미입력', 'muted')); link(item, '유튜브로 이동', song.youtube); node.append(item);
      });
    }
    const ost = section('OST', data.ost);
    data.ost.forEach(record => {
      ost.append(el('p', `작곡가: ${text(record.composer) || '미입력'}`));
      list(record.albums).forEach((album, i) => {
        const details = el('details'); details.open = true;
        details.append(el('summary', `앨범 ${i + 1} · 발매일 ${text(album.release_date) || '미입력'}`));
        list(album.discs).forEach(disc => {
          details.append(el('p', `Disc ${disc.disc ?? 1}`, 'muted'));
          details.append(table(['트랙', '제목', '듣기'], list(disc.tracks).map(track => {
            const links = el('span'); link(links, '아이튠즈', track.itunes_url); link(links, '유튜브', track.youtube_url);
            return [track.track_no ?? '', text(track.title) || '제목 미입력', links];
          })));
        });
        ost.append(details);
      });
    });
    const ep = section(`에피소드 (${data.ep.length}개)`, data.ep);
    if (data.ep.length) ep.append(table(['화수', '제목', '콘티', '연출'], data.ep.map(e => [
      text(e['episode no']), text(e['episode title']), list(e.storyboard?.staff).join(', '), list(e['episode director']?.staff).join(', ')
    ])));
    const pv = section(`PV (${data.pv.length}개)`, data.pv);
    data.pv.forEach((p, i) => {
      const item = el('div', null, 'item'); item.append(el('p', text(p.title) || `PV ${i + 1}`, 'item-title'));
      link(item, 'PV 보기', p.url); pv.append(item);
    });
    $('detail').showModal(); $('detail').scrollTop = 0;
  }
  $('close').addEventListener('click', () => $('detail').close());
  $('detail').addEventListener('click', e => {
    const r = $('detail').getBoundingClientRect();
    if (e.target === $('detail') && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) $('detail').close();
  });
  function load(file) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = `../data/2026/${file}?v=${Date.now()}`;
      script.onload = resolve; script.onerror = () => reject(new Error(`${file} 파일을 불러오지 못했습니다.`)); document.head.append(script);
    });
  }
  async function start() {
    try {
      await Promise.all(['2026animeData.js', '2026animeSongsData.js', '2026animeOSTData.js', '2026animeEPData.js'].map(load));
      const sources = [
        ['2026animeData.js', 'AnimeCatalog_2026', Array.isArray],
        ['2026animeSongsData.js', 'AnimeSongs_2026', Array.isArray],
        ['2026animeOSTData.js', 'animeOSTData_2026', Array.isArray],
        ['2026animeEPData.js', 'animeEPData_2026', value => value && typeof value === 'object' && !Array.isArray(value)]
      ];
      const invalid = sources.filter(([, name, valid]) => !valid(window[name]));
      if (invalid.length) throw new Error(invalid.map(([file, name]) => `${file}: ${name} 변수 선언 및 데이터 형식을 확인해주세요.`).join('\n'));
      // 같은 작품 ID는 분기를 합치고 원본 파일은 변경하지 않는다.
      const merged = new Map();
      for (const a of list(window.AnimeCatalog_2026)) {
        const key = String(a.id), old = merged.get(key);
        if (old) { old.quarter = [...new Set([...quarters(old.quarter), ...quarters(a.quarter)])]; old.pv.push(...list(a.pv)); }
        else merged.set(key, { ...a, pv: [...list(a.pv)] });
      }
      anime = [...merged.values()].sort((a,b) => text(a.title).localeCompare(text(b.title), 'ko'));
      songMap = index(window.AnimeSongs_2026); ostMap = index(window.animeOSTData_2026); episodes = window.animeEPData_2026;
      render();
    } catch (error) { $('summary').textContent = '데이터를 표시할 수 없습니다.'; $('error').hidden = false; $('error').textContent = error.message; }
  }
  start();
})();
