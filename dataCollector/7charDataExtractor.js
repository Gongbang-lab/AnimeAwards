'use strict';

const API_URL = 'https://graphql.anilist.co';
const animeCatalog = CollectorYear.data.AnimeCatalog;
const savedCharacterData = CollectorYear.data.CharacterData;
if (!Array.isArray(animeCatalog)) throw new Error('기본 애니메이션 데이터는 배열이어야 합니다.');
const savedWorks = Array.isArray(savedCharacterData) ? savedCharacterData
  : savedCharacterData && typeof savedCharacterData === 'object' ? Object.values(savedCharacterData) : null;
if (!savedWorks) throw new Error('저장된 캐릭터 데이터 형식을 확인해주세요.');

const animeByMalId = new Map();
for (const anime of animeCatalog) {
  const key = String(anime.id);
  const previous = animeByMalId.get(key);
  animeByMalId.set(key, {
    ...anime, title: previous?.title || anime.title,
    quarter: getCatalogQuarters([...(previous?.quarter || []), ...getCatalogQuarters(anime.quarter)])
  });
}
const savedByMalId = new Map();
for (const work of savedWorks) {
  if (!work || !Array.isArray(work.characters)) throw new Error('저장된 작품의 characters 배열을 확인해주세요.');
  const key = String(work.id);
  const previous = savedByMalId.get(key);
  const characters = new Map(previous?.characters || []);
  for (const character of work.characters) {
    if (character?.characterId != null) characters.set(String(character.characterId), character);
  }
  savedByMalId.set(key, { title: previous?.title || work.title, characters });
}

let animeData = null;
let characterItems = [];
let characterCatalog = null;
let selectedMalId = null;
let searchController = null;
let searchVersion = 0;
let deletedCharacterIds = new Set();
let removedCharacters = [];
let nextApiRequestAt = 0;
let editorRevision = 0;
const workDrafts = new Map();

function sanitize(value) {
  return String(value ?? '').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function normalizeGender(value) {
  const gender = String(value ?? '').toLowerCase();
  return ['male', 'female'].includes(gender) ? gender : 'unknown';
}

function setStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.color = isError ? '#ef4444' : '#2563eb';
}

function localImageUrl(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return new URL(`../${value}`, document.baseURI).href;
}

function resetEditor() {
  animeData = null;
  characterItems = [];
  deletedCharacterIds = new Set();
  removedCharacters = [];
  document.getElementById('charList').replaceChildren();
  document.getElementById('jsonPreview').value = '';
  document.getElementById('copyBtn').disabled = true;
  document.getElementById('zipBtn').disabled = true;
  document.getElementById('undoDeleteBtn').disabled = true;
}

function savedCharacterItem(saved, malId, source, previous) {
  return {
    characterId: Number(saved.characterId), animeId: malId, cvId: saved.cvId ?? null,
    engName: previous?.engName || String(saved.name || saved.characterId), korName: saved.name || '',
    gender: normalizeGender(saved.gender), cv: saved.cv || '', savedImg: saved.img || '',
    imgUrl: previous?.imgUrl || localImageUrl(saved.img), source
  };
}

function saveCurrentDraft() {
  if (!animeData) return;
  workDrafts.set(String(animeData.idMal), {
    animeData: { ...animeData }, characters: characterItems.map(item => ({ ...item })),
    deletedIds: [...deletedCharacterIds],
    removed: removedCharacters.map(entry => ({ index: entry.index, character: { ...entry.character } }))
  });
}

function showEditor() {
  renderChars();
  updateJSON();
  document.getElementById('copyBtn').disabled = !animeData;
  document.getElementById('zipBtn').disabled = !characterItems.some(item => item.imgUrl);
  document.getElementById('undoDeleteBtn').disabled = removedCharacters.length === 0;
  characterCatalog?.render();
}

function setRefreshBusy(busy) {
  const button = document.getElementById('refreshBtn');
  button.disabled = busy || !selectedMalId;
  button.textContent = busy ? '조회 중…' : '최신 조회';
}

function waitForApi(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('검색 취소', 'AbortError'));
    const abort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      reject(new DOMException('검색 취소', 'AbortError'));
    };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, milliseconds);
    signal.addEventListener('abort', abort, { once: true });
  });
}

function networkHelp(timedOut) {
  if (navigator.onLine === false) return '인터넷 연결이 끊겨 AniList에 연결하지 못했습니다.';
  const message = timedOut ? 'AniList 응답 시간이 초과되었습니다.' : 'AniList에 연결하지 못했습니다. 인터넷 연결과 API 접근 상태를 확인해주세요.';
  return location.protocol === 'file:'
    ? `${message} 파일을 직접 열었다면 Live Server로 실행한 뒤 다시 조회해주세요.`
    : `${message} 브라우저 확장 기능의 차단 여부도 확인한 뒤 최신 조회를 다시 눌러주세요.`;
}

async function requestAniList(query, variables, signal) {
  // AniList documents a temporary 30 requests/minute limit. Space page requests.
  // https://docs.anilist.co/guide/rate-limiting
  for (let attempt = 0; attempt < 2; attempt++) {
    const wait = Math.max(0, nextApiRequestAt - Date.now());
    if (wait > 2500) setStatus(`AniList 요청 제한을 기다립니다… (약 ${Math.ceil(wait / 1000)}초)`);
    await waitForApi(wait, signal);
    nextApiRequestAt = Date.now() + 2100;
    const request = new AbortController();
    const abort = () => request.abort();
    signal.addEventListener('abort', abort, { once: true });
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; request.abort(); }, 20000);
    try {
      const response = await fetch(API_URL, {
        method: 'POST', signal: request.signal, credentials: 'omit',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables })
      });
      if (signal.aborted) throw new DOMException('검색 취소', 'AbortError');
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('Retry-After'));
        const seconds = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.ceil(retryAfter) : 60;
        nextApiRequestAt = Date.now() + seconds * 1000;
        throw new Error(`AniList 요청 한도에 도달했습니다. 약 ${seconds}초 후 최신 조회를 눌러주세요.`);
      }
      if (response.status >= 500 && attempt === 0) {
        setStatus('AniList 응답 오류로 한 번 더 조회합니다…');
        continue;
      }
      if (!response.ok) throw new Error(`AniList 응답 오류 (${response.status}). 잠시 후 최신 조회를 다시 눌러주세요.`);
      return await response.json();
    } catch (error) {
      if (signal.aborted) throw new DOMException('검색 취소', 'AbortError');
      const connectionFailure = timedOut || error instanceof TypeError;
      if (connectionFailure && attempt === 0) {
        setStatus('AniList 연결이 원활하지 않아 한 번 더 조회합니다…');
        continue;
      }
      if (connectionFailure) throw new Error(networkHelp(timedOut));
      throw error;
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
    }
  }
}

// The catalog and CharacterData use MAL anime IDs; characterId is an AniList ID.
async function fetchByMalId({ refresh = false } = {}) {
  const malId = Number(document.getElementById('idInput').value);
  if (!Number.isSafeInteger(malId) || malId <= 0 || malId > 2147483647) {
    setStatus('유효한 MAL ID를 입력해주세요.', true);
    return;
  }
  saveCurrentDraft();
  searchController?.abort();
  const controller = new AbortController();
  searchController = controller;
  const version = ++searchVersion;
  resetEditor();
  selectedMalId = String(malId);
  characterCatalog?.render();
  const catalogEntry = animeByMalId.get(String(malId));
  const savedWork = savedByMalId.get(String(malId));
  const draft = workDrafts.get(String(malId));
  document.getElementById('currentTitle').textContent = catalogEntry?.title || `MAL ID ${malId}`;
  const quarters = getCatalogQuarters(catalogEntry?.quarter);
  const quarterInput = document.getElementById('quarterSelect');
  if (quarters.length && !quarters.includes(quarterInput.value.replace('Q', '') + '분기')) {
    quarterInput.value = 'Q' + quarters[0][0];
  }
  if (draft) {
    animeData = { ...draft.animeData };
    characterItems = draft.characters.map(item => ({ ...item }));
    deletedCharacterIds = new Set(draft.deletedIds);
    removedCharacters = draft.removed.map(entry => ({ index: entry.index, character: { ...entry.character } }));
  } else if (savedWork) {
    const title = savedWork.title || catalogEntry?.title || `MAL ID ${malId}`;
    animeData = { idMal: malId, title: { romaji: title }, outputTitle: title };
    characterItems = [...savedWork.characters.values()]
      .filter(character => Number.isSafeInteger(Number(character.characterId)) && Number(character.characterId) > 0)
      .map(character => savedCharacterItem(character, malId, '저장된 캐릭터'));
  }
  document.getElementById('yearInput').value = CollectorYear.year;
  if (animeData) {
    showEditor();
    if (!refresh) {
      setRefreshBusy(false);
      setStatus(`${draft ? '편집 중인' : '저장된'} 캐릭터 ${characterItems.length}명을 불러왔습니다. 새 캐릭터를 찾으려면 최신 조회를 눌러주세요.`);
      return;
    }
  }
  setRefreshBusy(true);

  const query = `
    query($idMal: Int, $page: Int) {
      Media(idMal: $idMal, type: ANIME) {
        id idMal
        title { romaji }
        startDate { year }
        characters(sort: [ROLE, RELEVANCE], page: $page, perPage: 25) {
          pageInfo { hasNextPage currentPage }
          edges {
            role
            node { id name { full native } gender image { large } }
            voiceActors(language: JAPANESE) { id name { full } }
          }
        }
      }
    }
  `;

  try {
    let page = 1;
    let hasNextPage = true;
    const allEdges = [];
    let mediaMeta;
    while (hasNextPage) {
      setStatus(`⏳ 데이터 조회 중... (페이지 ${page})`);
      const json = await requestAniList(query, { idMal: malId, page }, controller.signal);
      if (version !== searchVersion) return;
      if (json.errors?.length) throw new Error(json.errors.map(error => error.message).join(' / '));
      const media = json.data?.Media;
      if (!media || Number(media.idMal) !== malId) throw new Error('애니메이션을 찾을 수 없습니다. MAL ID를 확인해주세요.');
      if (!Array.isArray(media.characters?.edges)) throw new Error('캐릭터 목록을 읽지 못했습니다. 다시 검색해주세요.');
      mediaMeta = { id: media.id, idMal: media.idMal, title: media.title, year: media.startDate?.year };
      allEdges.push(...media.characters.edges);
      hasNextPage = !!media.characters.pageInfo?.hasNextPage;
      if (hasNextPage && page >= 20) throw new Error('조회 페이지 한도를 초과했습니다. 일부 데이터만 저장하지 않도록 검색을 중단했습니다.');
      page++;
    }

    // Capture edits/deletions made while the request was running before merging.
    const previousItems = new Map(characterItems.map(item => [String(item.characterId), item]));
    const savedCharacters = animeData
      ? new Map(characterItems.map(item => [String(item.characterId), {
        characterId: item.characterId, name: item.korName, gender: item.gender,
        cvId: item.cvId, cv: item.cv, img: item.savedImg
      }]))
      : savedWork?.characters || new Map();
    const items = [];
    const seen = new Set();
    let restoredCount = 0;
    let excludedCount = 0;
    let keptCount = 0;
    for (const edge of allEdges) {
      const node = edge?.node;
      if (!node?.id || seen.has(String(node.id)) || deletedCharacterIds.has(String(node.id))) continue;
      const saved = savedCharacters.get(String(node.id));
      const previous = previousItems.get(String(node.id));
      if (edge.role === 'BACKGROUND' && !saved) continue;
      const voice = edge.voiceActors?.find(actor => actor?.id && actor.name?.full);
      const savedVoiceId = Number(saved?.cvId);
      const cvId = Number.isSafeInteger(savedVoiceId) && savedVoiceId > 0 ? savedVoiceId : voice?.id;
      if (!cvId || (!voice && !saved?.cv)) { excludedCount++; continue; }
      seen.add(String(node.id));
      if (saved) restoredCount++;
      items.push({
        characterId: node.id, animeId: malId, cvId,
        engName: previous?.engName || node.name?.full || String(node.id),
        korName: typeof saved?.name === 'string' ? saved.name : node.name?.native || node.name?.full || '',
        gender: normalizeGender(saved?.gender ?? node.gender),
        cv: typeof saved?.cv === 'string' ? saved.cv : voice?.name.full || '',
        savedImg: saved?.img || '',
        imgUrl: previous?.imgUrl || (saved?.img ? localImageUrl(saved.img) : node.image?.large || ''),
        source: saved ? '기존 정보 반영' : '신규 캐릭터'
      });
    }
    // Do not silently discard saved roles absent from the latest API response.
    for (const [key, saved] of savedCharacters) {
      if (seen.has(key) || deletedCharacterIds.has(key)) continue;
      const characterId = Number(saved.characterId);
      if (!Number.isSafeInteger(characterId) || characterId <= 0) continue;
      keptCount++;
      items.push(savedCharacterItem(saved, malId, '기존 정보 유지 · API 조회 없음', previousItems.get(key)));
    }
    animeData = { ...mediaMeta, outputTitle: savedWork?.title || mediaMeta.title?.romaji || catalogEntry?.title || '' };
    characterItems = items;
    document.getElementById('yearInput').value = CollectorYear.year;
    document.getElementById('currentTitle').textContent = catalogEntry?.title || animeData.outputTitle;
    showEditor();
    setStatus(`✅ ${items.length}명 로드 · 기존 ${restoredCount}명 반영 · 신규 ${items.length - restoredCount - keptCount}명`
      + (keptCount ? ` · API 미조회 기존 ${keptCount}명 유지` : '')
      + (excludedCount ? ` · 성우 정보 없음 ${excludedCount}명 제외` : ''));
  } catch (error) {
    if (version !== searchVersion || error.name === 'AbortError') return;
    if (!animeData) resetEditor();
    setStatus(`⚠ ${error.message}${animeData ? '\n현재 불러온 캐릭터는 계속 수정·삭제·복사할 수 있습니다.' : '\n연결 상태를 확인한 뒤 최신 조회를 눌러 다시 시도해주세요.'}`, true);
  } finally {
    if (version === searchVersion) setRefreshBusy(false);
  }
}

function renderChars() {
  if (!characterItems.length) {
    document.getElementById('charList').textContent = '현재 캐릭터가 없습니다. 삭제 취소 또는 최신 조회를 사용할 수 있습니다.';
    return;
  }
  document.getElementById('charList').innerHTML = characterItems.map((character, index) => `
    <div class="char-card">
      ${character.imgUrl ? `<img src="${escapeHtml(character.imgUrl)}" alt="${escapeHtml(character.engName)}" loading="lazy">` : ''}
      <div class="edit-fields">
        <div class="char-heading">
          <span class="char-source">ID ${character.characterId} · ${escapeHtml(character.source)}</span>
          <button class="delete-character" type="button" onclick="deleteCharacter(${index})" aria-label="${escapeHtml(character.korName || character.engName)} 삭제">삭제</button>
        </div>
        <input type="text" value="${escapeHtml(character.korName)}" oninput="updateChar(${index}, 'korName', this.value)" placeholder="한글 이름" aria-label="캐릭터 이름">
        <input type="text" value="${escapeHtml(character.cv)}" oninput="updateChar(${index}, 'cv', this.value)" placeholder="성우 이름" aria-label="성우 이름">
        <select onchange="updateChar(${index}, 'gender', this.value)" aria-label="캐릭터 성별">
          <option value="male" ${character.gender === 'male' ? 'selected' : ''}>남성</option>
          <option value="female" ${character.gender === 'female' ? 'selected' : ''}>여성</option>
          <option value="unknown" ${character.gender === 'unknown' ? 'selected' : ''}>알 수 없음</option>
        </select>
      </div>
    </div>`).join('');
}

function deleteCharacter(index) {
  if (!animeData || !characterItems[index]) return;
  const [character] = characterItems.splice(index, 1);
  deletedCharacterIds.add(String(character.characterId));
  removedCharacters.push({ index, character });
  showEditor();
  setStatus(`${character.korName || character.engName} 삭제 · 현재 ${characterItems.length}명. JSON과 이미지 다운로드 대상에서 제외했습니다.`);
}

function undoDeleteCharacter() {
  if (!animeData || !removedCharacters.length) return;
  const { index, character } = removedCharacters.pop();
  const key = String(character.characterId);
  deletedCharacterIds.delete(key);
  if (!characterItems.some(item => String(item.characterId) === key)) {
    characterItems.splice(Math.min(index, characterItems.length), 0, character);
  }
  showEditor();
  setStatus(`${character.korName || character.engName} 삭제를 취소했습니다. 현재 ${characterItems.length}명입니다.`);
}

function updateChar(index, key, value) {
  if (!characterItems[index] || !['korName', 'cv', 'gender'].includes(key)) return;
  characterItems[index][key] = value;
  updateJSON();
}

function createOutput() {
  if (!animeData) return null;
  const year = CollectorYear.year;
  const quarter = document.getElementById('quarterSelect').value;
  const animeFolder = sanitize(animeData.title?.romaji || animeData.outputTitle);
  return {
    id: animeData.idMal, title: animeData.outputTitle, year,
    characters: characterItems.map(character => ({
      characterId: character.characterId, name: character.korName, gender: character.gender,
      cvId: character.cvId, cv: character.cv,
      img: character.savedImg || `image/charimg/${year}/${quarter}/${animeFolder}/${sanitize(character.engName)}.jpg`
    }))
  };
}

function updateJSON() {
  const output = createOutput();
  const value = output ? JSON.stringify(output, null, 2) : '';
  const preview = document.getElementById('jsonPreview');
  if (preview.value !== value) editorRevision++;
  preview.value = value;
  saveCurrentDraft();
}

async function downloadImagesZip() {
  if (!animeData) return;
  const output = createOutput();
  const items = [...characterItems];
  const version = searchVersion;
  const revision = editorRevision;
  const button = document.getElementById('zipBtn');
  button.disabled = true;
  setStatus('🚀 이미지 압축 중...');
  const currentExport = () => {
    if (version !== searchVersion) return false;
    if (revision === editorRevision) return true;
    setStatus('편집 내용이 바뀌어 이미지 다운로드를 중단했습니다. 수정 완료 후 다시 눌러주세요.');
    return false;
  };
  try {
    const zip = new JSZip();
    let failures = 0;
    await Promise.all(items.map(async (character, index) => {
      if (version !== searchVersion) return;
      // Saved webp paths use their existing local file; new images use the API URL.
      if (!character.imgUrl) { failures++; return; }
      try {
        const response = await fetch(character.imgUrl);
        if (!response.ok) throw new Error(`이미지 응답 오류 (${response.status})`);
        const blob = await response.blob();
        zip.file(output.characters[index].img, blob);
      } catch (error) { failures++; console.error(error); }
    }));
    if (!currentExport()) return;
    if (failures === items.length) throw new Error('다운로드할 이미지가 없습니다. 이미지 경로를 확인해주세요.');
    const content = await zip.generateAsync({ type: 'blob' });
    if (!currentExport()) return;
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitize(animeData.title?.romaji || output.title)}_images.zip`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(`✅ 이미지 ${items.length - failures}개 다운로드${failures ? ` · ${failures}개 실패 (이미지 경로 확인 필요)` : ''}`);
  } catch (error) {
    if (version === searchVersion) setStatus(`❌ ${error.message}`, true);
  } finally {
    if (version === searchVersion) button.disabled = !characterItems.some(item => item.imgUrl);
  }
}

async function copyJSON() {
  if (!animeData) return;
  updateJSON();
  const preview = document.getElementById('jsonPreview');
  try {
    await navigator.clipboard.writeText(preview.value);
    setStatus('✅ 현재 작품의 캐릭터 JSON을 복사했습니다.');
  } catch {
    preview.focus();
    preview.select();
    setStatus('결과를 선택했습니다. Ctrl+C로 복사해주세요.');
  }
}

const collectorSidebar = document.getElementById('collector-year-bar');
collectorSidebar.setAttribute('aria-label', '작업 연도 및 애니메이션 목록');
collectorSidebar.append(document.getElementById('character-library'));
characterCatalog = createSavedCatalog({
  host: document.getElementById('character-catalog'), searchLabel: '전체 작품 검색',
  records: () => [...animeByMalId.values()].map(anime => {
    const draft = workDrafts.get(String(anime.id));
    const count = draft ? draft.characters.length : savedByMalId.get(String(anime.id))?.characters.size || 0;
    return {
      key: anime.id, title: anime.title || `작품 ID ${anime.id}`, quarters: anime.quarter,
      meta: `MAL ID ${anime.id}`,
      lines: [draft ? `편집 중 ${count}명 · 편집 내용 불러오기`
        : savedByMalId.has(String(anime.id)) ? `캐릭터 ${count}명 등록 · 기존 정보 불러오기` : '캐릭터 미등록 · 신규 추출'],
      selected: selectedMalId === String(anime.id)
    };
  }).sort((a, b) => a.title.localeCompare(b.title, 'ko', { numeric: true })),
  onSelect: (id, quarter) => {
    document.getElementById('idInput').value = id;
    if (/^[1-4]분기$/.test(quarter)) document.getElementById('quarterSelect').value = 'Q' + quarter[0];
    fetchByMalId();
  }
});
