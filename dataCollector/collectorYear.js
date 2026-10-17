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
  window.CollectorYear = {
    year, data,
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
        if (!value || typeof value !== 'object') throw new Error('변수 선언 또는 데이터 구조 확인 필요');
        data[prefix] = value;
      } catch (error) {
        data[prefix] = Array.isArray(empty) ? [] : {};
        warnings.push(`${year}${suffix}.js: 불러오지 못해 빈 목록으로 시작합니다. 새 연도라면 정상이며, 기존 파일이 있다면 경로·변수 선언을 확인하세요.`);
      }
      return data[prefix];
    }
  };
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script'); let problem;
      const capture = e => { if (e.filename === src) problem = e.error || new Error(e.message); };
      window.addEventListener('error', capture);
      script.onload = () => { window.removeEventListener('error', capture); problem ? reject(problem) : resolve(); };
      script.onerror = () => { window.removeEventListener('error', capture); reject(new Error('파일 로딩 실패')); };
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
        overflow-y: auto; padding: 28px 18px; margin: 0;
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
      @media (max-width: 700px) {
        body.collector-with-year-sidebar { margin-left: 144px; }
        #collector-year-bar { width: 132px; padding: 20px 10px; }
        #collector-year-bar input, #collector-year-bar button { padding: 9px 6px; }
      }
    `;
    document.head.append(style);
    document.body.classList.add('collector-with-year-sidebar');
    const bar = document.createElement('aside'); bar.id = 'collector-year-bar';
    bar.setAttribute('aria-label', '수집기 작업 연도 설정');
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
    bar.append(label, input, options, button, note, status); document.body.prepend(bar);
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
    } catch (error) { status.textContent = `수집기 초기화 실패: ${error.message}`; status.setAttribute('role', 'alert'); console.error(error); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
