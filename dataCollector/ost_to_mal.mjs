// 2026animeOSTData.js 의 id(AniList) → MAL id 로 변경
// 사용:
//   node ost_to_mal.mjs ../data/2026/2026animeOSTData.js --catalog ../data/2026/2026animeData.js
// 옵션:
//   --catalog <file>   animeData.js (id = MAL id). 변환 후 id 가 여기에 있는지 교차 검증
//   --in-place         원본을 덮어씀 (원본은 .bak 으로 백업). 기본은 <파일명>.mal.js 로 따로 저장
//   --update-image     image/ost/<기존id>.webp 경로도 새 id 로 변경 (기본: 이미지 경로는 그대로 둠)
// 필요: Node 18 이상
import fs from 'node:fs';
import vm from 'node:vm';

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const file = args.find(a => !a.startsWith('--') && a !== opt('--catalog'));
if (!file) { console.error('사용법: node ost_to_mal.mjs <2026animeOSTData.js> [--catalog <animeData.js>] [--in-place] [--update-image]'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

// `var NAME = [ ... ];` 형태의 JS 파일에서 배열을 꺼냄
function loadArray(src) {
  const m = src.match(/(?:var|let|const)\s+(\w+)\s*=\s*\[/);
  if (!m) throw new Error('배열 변수를 찾지 못했습니다.');
  const ctx = vm.createContext({});
  vm.runInContext(src.replace(/\bconst\b|\blet\b/g, 'var'), ctx);
  return { name: m[1], data: ctx[m[1]] };
}

async function fetchMalIds(ids) {
  const map = new Map();
  for (let i = 0; i < ids.length; i += 50) {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'query($ids:[Int]){Page(perPage:50){media(id_in:$ids,type:ANIME){id idMal}}}',
        variables: { ids: ids.slice(i, i + 50) },
      }),
    });
    if (res.status === 429) { console.log('rate limit — 60초 대기'); await sleep(60000); i -= 50; continue; }
    const j = await res.json();
    if (j.errors) throw new Error(JSON.stringify(j.errors));
    j.data.Page.media.forEach(m => map.set(m.id, m.idMal));
    console.log(`AniList 조회 ${Math.min(i + 50, ids.length)}/${ids.length}`);
    await sleep(800);
  }
  return map;
}

const src = fs.readFileSync(file, 'utf-8');
const { name, data } = loadArray(src);
console.log(`[${name}] 항목 ${Array.isArray(data) ? data.length : '배열 아님'}개`);
const badEntries = Array.isArray(data) ? data.filter(o => !o || !Number.isFinite(Number(o.id))) : [];
if (!Array.isArray(data) || !data.length || badEntries.length) {
  console.error(`\n! id 를 숫자로 읽을 수 없는 항목이 있습니다 (${badEntries.length}개). 첫 항목 미리보기:`);
  console.error((JSON.stringify(data?.[0], null, 1) || '(없음)').slice(0, 600));
  console.error('→ 첫 항목의 키:', data?.[0] ? Object.keys(data[0]) : '(없음)');
  process.exit(1);
}
const oldIds = [...new Set(data.map(o => Number(o.id)))];
const cat = opt('--catalog');
const catIds = cat ? new Set(loadArray(fs.readFileSync(cat, 'utf-8')).data.map(o => Number(o.id))) : null;
if (catIds) console.log(`현재 id 중 animeData 에 이미 있는 것: ${oldIds.filter(id => catIds.has(id)).length}/${oldIds.length} (높으면 이미 MAL id 일 수 있음)`);
const malMap = await fetchMalIds(oldIds);

// 변환표: AniList id → MAL id (MAL id 가 없는 건 그대로 둠)
const conv = new Map(), noMal = [];
for (const id of oldIds) {
  const mal = malMap.get(id);
  if (mal) conv.set(id, mal); else noMal.push(id);
}

// 같은 MAL id 로 합쳐지는 항목 경고
const seen = new Map(), dup = [];
for (const [a, m] of conv) { if (seen.has(m)) dup.push({ mal_id: m, anilist_ids: [seen.get(m), a] }); else seen.set(m, a); }

// 텍스트 치환: 한 번의 패스로 처리(연쇄 치환 방지), 들여쓰기/주석/변수명은 그대로 유지
let out = src.replace(/("id"\s*:\s*)(\d+)/g, (m, p, n) => conv.has(+n) ? p + conv.get(+n) : m);
if (flag('--update-image')) {
  out = out.replace(/(image\/ost\/)(\d+)((?:-\d+)?\.webp)/g, (m, p, n, s) => conv.has(+n) ? p + conv.get(+n) + s : m);
}

// 교차 검증
let notInCatalog = [];
if (cat) {
  notInCatalog = [...conv.values()].filter(m => !catIds.has(m));
}

let target;
if (flag('--in-place')) { fs.copyFileSync(file, file + '.bak'); target = file; }
else target = file.replace(/\.js$/, '') + '.mal.js';
fs.writeFileSync(target, out);

console.log(`\n[${name}] ${oldIds.length}개 작품 중 ${conv.size}개 변환 → ${target}`);
if (flag('--in-place')) console.log(`원본 백업: ${file}.bak`);
if (noMal.length) console.log(`! AniList에 MAL id 없음(그대로 둠) ${noMal.length}건:`, noMal.join(', '));
if (dup.length) console.log('! 서로 다른 AniList id 가 같은 MAL id 로 변환됨:', JSON.stringify(dup));
if (cat) console.log(notInCatalog.length ? `! animeData 에 없는 MAL id ${notInCatalog.length}건: ${notInCatalog.join(', ')}` : '교차 검증 OK: 변환된 모든 id 가 animeData 에 있습니다.');
if (!flag('--update-image')) console.log('참고: image 경로는 그대로 둡니다 (이미지 파일명도 MAL id 로 바꾸려면 --update-image).');
