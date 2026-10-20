// Authoring years are independent of the public awards manifest.
(() => {
  const url = new URL(location.href);
  const requested = Number(url.searchParams.get('year') || localStorage.getItem('collector_selected_year') || 2026);
  const year = Number.isInteger(requested) && requested >= 2000 && requested <= 2200 ? requested : 2026;
  const data = {};
  const definitions = {
    animeData: ['AnimeCatalog', []], animeCharacterData: ['CharacterData', []], animeCVData: ['CharacterVoiceData', []],
    animeSongsData: ['AnimeSongs', []], animeOSTData: ['animeOSTData', []], animeEPData: ['animeEPData', {}],
    animeMemeData: ['AnimeMemeData', []], animeDirectorData: ['animeDirectorData', []],
    animeStudioData: ['AnimeStudioData', []], animeAdaptorData: ['AnimeAdaptorData', []],
    animescriptwriterData: ['scriptwriterData', []], animeRookieCVData: ['RookieCVData', {}]
  };
  const warnings = [];
  const publishedYears = new Set(typeof AvailableYears !== 'undefined' ? AvailableYears.map(Number) : [2026]);
  let phase = 'loading', loadFeedback = null;

  function confirmNewFile(suffix, prefix, empty, error) {
    // Loading errors do not prove that a file is absent. New authoring years
    // require explicit, per-file consent, and malformed files can never be reset here.
    if (publishedYears.has(year) || error.collectorFailure !== 'load-error' || !loadFeedback) throw error;
    phase = 'waiting-for-new-file';
    loadFeedback.textContent = `${year}${suffix}.js를 읽지 못했습니다. 기존 파일이 있다면 새로고침하거나 파일을 확인해주세요. 아직 만들지 않은 새 파일인 경우에만 아래 버튼으로 작성을 시작하세요.`;
    loadFeedback.setAttribute('role', 'alert');
    const create = document.createElement('button');
    create.type = 'button'; create.textContent = `${year}${suffix}.js 새로 작성`;
    loadFeedback.after(create);
    return new Promise(resolve => {
      create.onclick = () => {
        if (!confirm(`${year}${suffix}.js를 빈 목록에서 새로 작성합니다. 기존 파일을 수정하려는 경우에는 취소하고 로딩 문제를 해결해주세요. 새 파일 작성을 시작할까요?`)) return;
        const value = Array.isArray(empty) ? [] : {};
        data[prefix] = value;
        window[`${prefix}_${year}`] = value;
        warnings.push(`${year}${suffix}.js: 새 파일 작성으로 시작했습니다. 저장할 때 기존 파일을 덮어쓰지 않도록 확인해주세요.`);
        create.remove(); phase = 'loading';
        loadFeedback.setAttribute('role', 'status'); loadFeedback.textContent = '데이터 준비 중…';
        resolve(value);
      };
    });
  }
  window.CollectorYear = {
    year, data,
    get ready() { return phase === 'ready'; },
    key: name => `${name}_${year}`,
    change(next) {
      next = Number(next);
      if (next === year) return;
      if (!Number.isInteger(next) || next < 2000 || next > 2200) return alert('2000~2200 사이의 연도를 입력해주세요.');
      if (!confirm(`${next}년으로 전환합니다. 복사·저장하지 않은 편집 내용이나 진행 중인 수집은 사라질 수 있습니다. 전환할까요?`)) return;
      localStorage.setItem('collector_selected_year', String(next));
      const target = new URL(location.href); target.searchParams.set('year', String(next)); location.href = target.href;
    },
    async loadData(suffix) {
      if (Object.hasOwn(data, definitions[suffix][0])) return data[definitions[suffix][0]];
      const [prefix, empty] = definitions[suffix];
      const path = new URL(`../data/${year}/${year}${suffix}.js`, document.baseURI).href;
      try {
        await loadScript(path);
        const value = window[`${prefix}_${year}`];
        const valid = prefix === 'CharacterData'
          ? value && typeof value === 'object'
          : Array.isArray(empty) ? Array.isArray(value) : value && typeof value === 'object' && !Array.isArray(value);
        if (!valid) {
          const error = new Error(`${year}${suffix}.js의 ${prefix}_${year} 변수 선언 또는 데이터 형식이 올바르지 않습니다.`);
          error.collectorFailure = 'invalid-data'; throw error;
        }
        data[prefix] = value;
      } catch (error) {
        return confirmNewFile(suffix, prefix, empty, error);
      }
      return data[prefix];
    }
  };
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script'); let problem;
      const capture = e => {
        if (e.filename === src) {
          problem = e.error || new Error(e.message);
          problem.collectorFailure = 'invalid-data';
        }
      };
      window.addEventListener('error', capture);
      script.onload = () => { window.removeEventListener('error', capture); problem ? reject(problem) : resolve(); };
      script.onerror = () => {
        window.removeEventListener('error', capture);
        const error = new Error(`${new URL(src).pathname} 파일을 읽지 못했습니다.`);
        error.collectorFailure = 'load-error'; reject(error);
      };
      script.src = src; document.head.append(script);
    });
  }
  async function start() {
    const style = document.createElement('style');
    style.textContent = `
      body.collector-with-year-sidebar {
        margin-left: 240px;
        margin-right: 0;
        width: auto;
      }
      #collector-year-bar {
        position: fixed; inset: 0 auto 0 0; z-index: 50;
        box-sizing: border-box; width: 220px; height: 100dvh;
        overflow-y: auto; padding: 72px 18px 28px; margin: 0;
        border: 0; border-right: 1px solid #4a2a32; border-radius: 0;
        background: #1f0f13; color: #e6dcd3;
        font: 14px/1.6 'Malgun Gothic', sans-serif; text-align: left;
        color-scheme: dark; overflow-wrap: anywhere;
      }
      #collector-year-bar label {
        display: block; margin: 0 0 12px; color: #ebdcaa;
        font-size: 16px; font-weight: 700;
      }
      #collector-year-bar input, #collector-year-bar button {
        display: block; box-sizing: border-box; width: 100%; min-width: 0;
        margin: 0 0 12px; padding: 10px 12px; border-radius: 8px;
        font: inherit; line-height: 1.5;
      }
      #collector-year-bar input { background: #12070a; color: #e6dcd3; border: 1px solid #4a2a32; }
      #collector-year-bar button { background: #c9a55a; color: #12070a; border: 1px solid #c9a55a; cursor: pointer; font-weight: 700; }
      #collector-year-bar button:hover { background: #ebdcaa; }
      #collector-year-bar :focus-visible { outline: 2px solid #ebdcaa; outline-offset: 3px; }
      #collector-year-bar p { margin: 18px 0 0; color: #bba0a6; font-size: 12px; }
      #collector-year-bar [role="status"], #collector-year-bar [role="alert"] { padding-top: 16px; border-top: 1px solid #4a2a32; }
      body.collector-with-year-sidebar.collector-sidebar-collapsed { margin-left: 60px !important; }
      #collector-year-bar[hidden] { display: none !important; }
      #collector-sidebar-toggle {
        position: fixed; top: 12px; left: 12px; z-index: 51;
        display: grid; place-items: center; box-sizing: border-box;
        width: 40px; height: 40px; min-width: 0; margin: 0; padding: 0;
        border: 1px solid #c9a55a; border-radius: 8px;
        background: #1f0f13; color: #ebdcaa;
        font: 24px/1 sans-serif; cursor: pointer;
      }
      #collector-sidebar-toggle:hover { background: #33261a; }
      #collector-sidebar-toggle:focus-visible { outline: 2px solid #ebdcaa; outline-offset: 3px; }
      @media (max-width: 700px) {
        body.collector-with-year-sidebar { margin-left: 144px; }
        #collector-year-bar { width: 132px; padding: 72px 10px 20px; }
        #collector-year-bar input, #collector-year-bar button { padding: 9px 6px; }
      }
    `;
    document.head.append(style);
    document.body.classList.add('collector-with-year-sidebar');
    const bar = document.createElement('aside'); bar.id = 'collector-year-bar';
    bar.setAttribute('aria-label', '수집기 작업 연도 설정');
    const toggle = document.createElement('button');
    toggle.id = 'collector-sidebar-toggle'; toggle.type = 'button';
    toggle.setAttribute('aria-controls', bar.id);
    function setSidebarOpen(open) {
      if (!open && bar.contains(document.activeElement)) toggle.focus();
      bar.hidden = !open;
      document.body.classList.toggle('collector-sidebar-collapsed', !open);
      toggle.textContent = open ? '«' : '»';
      toggle.title = open ? '사이드바 닫기' : '사이드바 열기';
      toggle.setAttribute('aria-label', toggle.title);
      toggle.setAttribute('aria-expanded', String(open));
    }
    toggle.addEventListener('click', () => setSidebarOpen(bar.hidden));
    setSidebarOpen(true);
    const label = document.createElement('label'); label.textContent = '작업 연도 '; label.htmlFor = 'collector-year-input';
    const input = document.createElement('input'); input.id = 'collector-year-input'; input.type = 'number'; input.min = 2000; input.max = 2200; input.value = year;
    input.setAttribute('list', 'collector-years');
    const options = document.createElement('datalist'); options.id = 'collector-years';
    for (let y = 2026; y <= Math.max(new Date().getFullYear() + 3, year); y++) {
      const option = document.createElement('option'); option.value = y; options.append(option);
    }
    const button = document.createElement('button'); button.type = 'button'; button.textContent = '연도 적용';
    button.onclick = () => CollectorYear.change(input.value);
    const note = document.createElement('p'); note.textContent = `작업 대상: data/${year}/ · 시상식 공개 연도에는 영향을 주지 않습니다.`;
    const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = '데이터 준비 중…';
    loadFeedback = status;
    bar.append(label, input, options, button, note, status); document.body.prepend(toggle, bar);
    const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = '다시 불러오기';
    retry.onclick = () => location.reload(); bar.append(retry);
    // Keep inputs, copy/download buttons and result text inaccessible until all
    // required sources and page scripts have initialized successfully.
    const locked = [...document.body.children].filter(node => node !== bar && node !== toggle && !['SCRIPT', 'STYLE'].includes(node.tagName))
      .map(node => ({ node, inert: node.inert }));
    locked.forEach(({ node }) => { node.inert = true; });
    // Update static descriptions, not source code or entered records.
    document.title = document.title.replace(/2026/g, year);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.filter(n => !n.parentElement.closest('script,style,textarea,#collector-year-bar')).forEach(n => { n.textContent = n.textContent.replace(/2026/g, year); });
    ['in-year', 'year', 'fYear', 'yearInput', 'export-year'].forEach(id => {
      const field = document.getElementById(id); if (field) { field.value = year; field.defaultValue = year; field.readOnly = true; }
    });
    try {
      for (const entry of document.querySelectorAll('script[data-collector-data], script[data-collector-src], script[data-collector-code]')) {
        if (entry.dataset.collectorData) await CollectorYear.loadData(entry.dataset.collectorData);
        else if (entry.dataset.collectorSrc) await loadScript(new URL(entry.dataset.collectorSrc, document.baseURI).href);
        else {
          let error;
          const capture = event => { error = event.error || new Error(event.message); };
          window.addEventListener('error', capture);
          const script = document.createElement('script'); script.textContent = entry.textContent; document.body.append(script);
          window.removeEventListener('error', capture);
          if (error) throw error;
        }
      }
      status.textContent = warnings.length ? warnings.join('\n') : `${year}년 데이터 준비 완료`;
      status.style.whiteSpace = 'pre-line';
      phase = 'ready';
      locked.forEach(({ node, inert }) => { node.inert = inert; });
    } catch (error) {
      phase = 'failed';
      status.textContent = `데이터 보호를 위해 편집·복사·다운로드를 중단했습니다. ${error.message} 파일을 확인한 뒤 다시 불러오세요.`;
      status.setAttribute('role', 'alert'); console.error(error);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
