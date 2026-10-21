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
  document.getElementById('charList').replaceChildren();
  document.getElementById('jsonPreview').value = '';
  document.getElementById('copyBtn').disabled = true;
  document.getElementById('zipBtn').disabled = true;
}

// The catalog and CharacterData use MAL anime IDs; characterId is an AniList ID.
async function fetchByMalId() {
  const malId = Number(document.getElementById('idInput').value);
  if (!Number.isSafeInteger(malId) || malId <= 0 || malId > 2147483647) {
    setStatus('유효한 MAL ID를 입력해주세요.', true);
    return;
  }
  searchController?.abort();
  const controller = new AbortController();
  searchController = controller;
  const version = ++searchVersion;
  resetEditor();
  selectedMalId = String(malId);
  characterCatalog?.render();
  const catalogEntry = animeByMalId.get(String(malId));
  const savedWork = savedByMalId.get(String(malId));
  const savedCharacters = savedWork?.characters || new Map();
  document.getElementById('currentTitle').textContent = catalogEntry?.title || `MAL ID ${malId}`;
  const quarters = getCatalogQuarters(catalogEntry?.quarter);
  const quarterInput = document.getElementById('quarterSelect');
  if (quarters.length && !quarters.includes(quarterInput.value.replace('Q', '') + '분기')) {
    quarterInput.value = 'Q' + quarters[0][0];
  }

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
      const response = await fetch(API_URL, {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables: { idMal: malId, page } })
      });
      if (version !== searchVersion) return;
      if (!response.ok) throw new Error(response.status === 429
        ? 'API 요청이 많습니다. 잠시 후 다시 검색해주세요.' : `API 응답 오류 (${response.status})`);
      const json = await response.json();
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

    const items = [];
    const seen = new Set();
    let restoredCount = 0;
    let excludedCount = 0;
    let keptCount = 0;
    for (const edge of allEdges) {
      const node = edge?.node;
      if (!node?.id || seen.has(String(node.id))) continue;
      const saved = savedCharacters.get(String(node.id));
      if (edge.role === 'BACKGROUND' && !saved) continue;
      const voice = edge.voiceActors?.find(actor => actor?.id && actor.name?.full);
      const savedVoiceId = Number(saved?.cvId);
      const cvId = Number.isSafeInteger(savedVoiceId) && savedVoiceId > 0 ? savedVoiceId : voice?.id;
      if (!cvId || (!voice && !saved?.cv)) { excludedCount++; continue; }
      seen.add(String(node.id));
      if (saved) restoredCount++;
      items.push({
        characterId: node.id, animeId: malId, cvId,
        engName: node.name?.full || String(node.id),
        korName: typeof saved?.name === 'string' ? saved.name : node.name?.native || node.name?.full || '',
        gender: normalizeGender(saved?.gender ?? node.gender),
        cv: typeof saved?.cv === 'string' ? saved.cv : voice?.name.full || '',
        savedImg: saved?.img || '',
        imgUrl: saved?.img ? localImageUrl(saved.img) : node.image?.large || '',
        source: saved ? '기존 정보 반영' : '신규 캐릭터'
      });
    }
    // Do not silently discard saved roles absent from the latest API response.
    for (const [key, saved] of savedCharacters) {
      if (seen.has(key)) continue;
      const characterId = Number(saved.characterId);
      if (!Number.isSafeInteger(characterId) || characterId <= 0) continue;
      keptCount++;
      items.push({
        characterId, animeId: malId, cvId: saved.cvId ?? null,
        engName: String(saved.name || characterId), korName: saved.name || '',
        gender: normalizeGender(saved.gender), cv: saved.cv || '',
        savedImg: saved.img || '', imgUrl: localImageUrl(saved.img),
        source: '기존 정보 유지 · API 조회 없음'
      });
    }
    animeData = { ...mediaMeta, outputTitle: savedWork?.title || mediaMeta.title?.romaji || catalogEntry?.title || '' };
    characterItems = items;
    document.getElementById('yearInput').value = CollectorYear.year;
    document.getElementById('currentTitle').textContent = catalogEntry?.title || animeData.outputTitle;
    renderChars();
    updateJSON();
    document.getElementById('copyBtn').disabled = false;
    document.getElementById('zipBtn').disabled = characterItems.length === 0;
    setStatus(`✅ ${items.length}명 로드 · 기존 ${restoredCount}명 반영 · 신규 ${items.length - restoredCount - keptCount}명`
      + (keptCount ? ` · API 미조회 기존 ${keptCount}명 유지` : '')
      + (excludedCount ? ` · 성우 정보 없음 ${excludedCount}명 제외` : ''));
  } catch (error) {
    if (version !== searchVersion || error.name === 'AbortError') return;
    console.error(error);
    resetEditor();
    setStatus(`❌ ${error.message}`, true);
  }
}

function renderChars() {
  document.getElementById('charList').innerHTML = characterItems.map((character, index) => `
    <div class="char-card">
      ${character.imgUrl ? `<img src="${escapeHtml(character.imgUrl)}" alt="${escapeHtml(character.engName)}" loading="lazy">` : ''}
      <div class="edit-fields">
        <span class="char-source">ID ${character.characterId} · ${escapeHtml(character.source)}</span>
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
  document.getElementById('jsonPreview').value = output ? JSON.stringify(output, null, 2) : '';
}

async function downloadImagesZip() {
  if (!animeData) return;
  const output = createOutput();
  const items = [...characterItems];
  const version = searchVersion;
  const button = document.getElementById('zipBtn');
  button.disabled = true;
  setStatus('🚀 이미지 압축 중...');
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
    if (version !== searchVersion) return;
    if (failures === items.length) throw new Error('다운로드할 이미지가 없습니다. 이미지 경로를 확인해주세요.');
    const content = await zip.generateAsync({ type: 'blob' });
    if (version !== searchVersion) return;
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
    if (version === searchVersion) button.disabled = false;
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
    const count = savedByMalId.get(String(anime.id))?.characters.size || 0;
    return {
      key: anime.id, title: anime.title || `작품 ID ${anime.id}`, quarters: anime.quarter,
      meta: `MAL ID ${anime.id}`,
      lines: [count ? `캐릭터 ${count}명 등록 · 기존 정보 불러오기` : '캐릭터 미등록 · 신규 추출'],
      selected: selectedMalId === String(anime.id)
    };
  }).sort((a, b) => a.title.localeCompare(b.title, 'ko', { numeric: true })),
  onSelect: (id, quarter) => {
    document.getElementById('idInput').value = id;
    if (/^[1-4]분기$/.test(quarter)) document.getElementById('quarterSelect').value = 'Q' + quarter[0];
    fetchByMalId();
  }
});
