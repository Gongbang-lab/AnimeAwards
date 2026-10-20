'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { DATASETS, validateProject, markdown } = require('./dataValidator');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'animeawards-validator-'));
  const originalRoot = path.resolve(root);
  t.after(() => {
    // Only remove the exact temporary directory created by this test.
    assert.equal(path.dirname(originalRoot), path.resolve(os.tmpdir()));
    assert.ok(path.basename(originalRoot).startsWith('animeawards-validator-'));
    assert.equal(fs.lstatSync(originalRoot).isSymbolicLink(), false);
    fs.rmSync(originalRoot, { recursive: true, force: true });
  });
  const write = (file, value) => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, value);
  };
  const set = (suffix, value, year = 2026) => {
    const [, prefix] = DATASETS.find(d => d[0] === suffix);
    write(`data/${year}/${year}${suffix}.js`, `const ${prefix}_${year} = ${JSON.stringify(value)};`);
  };
  write('data/manifest.js', 'const AvailableYears = [2026];');
  write('image/poster.webp', 'fixture image');
  for (const [suffix, , shape] of DATASETS) set(suffix, shape === 'array' ? [] : {});
  const anime = (overrides = {}) => ({
    id: 1, year: 2026, quarter: ['1분기'], title: '작품',
    thumbnail: 'image/poster.webp', day: 'Mondays', pv: [], ...overrides
  });
  set('animeData', [anime()]);
  return { root, write, set, anime, check: options => validateProject({ root, ...options }) };
}

const has = (r, code, level = 'error') => r.issues.some(i => i.code === code && i.level === level);

test('current twelve dataset schemas pass without modifying data', t => {
  const f = fixture(t);
  const source = path.join(f.root, 'data/2026/2026animeData.js');
  const before = fs.readFileSync(source);
  const r = f.check();
  assert.deepEqual(r.counts, { error: 0, warning: 0, info: 0 });
  assert.equal(r.stats.datasets, 12);
  assert.deepEqual(fs.readFileSync(source), before);
  assert.equal(fs.existsSync(path.join(f.root, 'reports')), false);
});

test('missing files, wrong variable names, syntax and array shape are blocking', t => {
  const f = fixture(t);
  f.write('data/2026/2026animeCVData.js', 'const WrongName_2026 = [];');
  f.write('data/2026/2026animeSongsData.js', 'const AnimeSongs_2026 = [;');
  f.set('animeDirectorData', {});
  fs.unlinkSync(path.join(f.root, 'data/2026/2026animeEPData.js'));
  const r = f.check();
  for (const code of ['DATA_VARIABLE', 'DATA_JS_ERROR', 'DATA_SHAPE', 'DATA_FILE_MISSING']) assert.ok(has(r, code), code);
  assert.equal(r.ok, false);
});

test('same character in different anime is valid; duplicate pair and missing voice are errors', t => {
  const f = fixture(t);
  f.set('animeData', [f.anime(), f.anime({ id: 2, title: '2기' })]);
  f.set('animeCVData', [{ id: 7, name: '성우' }]);
  const character = { characterId: 42, name: '배역', cvId: 7 };
  f.set('animeCharacterData', [{ id: 1, characters: [character] }, { id: 2, characters: [character] }]);
  assert.equal(f.check().ok, true);
  f.set('animeCharacterData', [{ id: 1, characters: [character, { ...character, cvId: 8 }] }]);
  const r = f.check();
  assert.ok(has(r, 'CHARACTER_PAIR_DUPLICATE'));
  assert.ok(has(r, 'CHARACTER_CV_ORPHAN'));
});

test('disjoint quarters may reuse anime IDs; overlapping quarters may not', t => {
  const f = fixture(t);
  f.set('animeData', [f.anime(), f.anime({ quarter: '2분기,3분기' })]);
  assert.equal(f.check().ok, true);
  f.set('animeData', [f.anime(), f.anime({ quarter: ['1분기', '2분기'] })]);
  assert.ok(has(f.check(), 'ANIME_DUPLICATE'));
});

test('separate song records and empty placeholders pass; text in URL field fails', t => {
  const f = fixture(t);
  f.set('animeSongsData', [
    { id: 1, quarter: '1분기', songs: [{ type: 'op', title: 'OP1', youtube: 'https://youtu.be/test' }] },
    { id: 1, quarter: '2분기', songs: [{ type: 'ed', title: '', youtube: '' }] }
  ]);
  assert.equal(f.check().ok, true);
  f.set('animeSongsData', [{ id: 1, quarter: '1분기', songs: [{ type: 'op', title: '곡', youtube: '가수 이름' }] }]);
  assert.ok(has(f.check(), 'URL_INVALID'));
});

test('missing portraits warn, reasoned exceptions inform, mandatory missing assets fail', t => {
  const f = fixture(t);
  f.write('dataCollector/validation-policy.json', JSON.stringify({
    optionalPortraitFields: ['cvimg', 'director_img'],
    missingAssets: [{ path: 'image/allowed.webp', reason: '운영자가 허용한 보조 이미지' }]
  }));
  f.set('animeCVData', [{ id: 7, name: '성우', cvimg: 'image/absent.webp' }]);
  f.set('animeOSTData', [{ id: 1, albums: [{ image: 'image/allowed.webp', discs: [] }] }]);
  const r = f.check();
  assert.equal(r.ok, true);
  assert.ok(has(r, 'PORTRAIT_MISSING', 'warning'));
  assert.ok(has(r, 'ASSET_EXCEPTION', 'info'));
  f.set('animeData', [f.anime({ thumbnail: 'image/missing.webp' })]);
  assert.ok(has(f.check(), 'ASSET_MISSING'));
});

test('filename case differences fail even on a case insensitive filesystem', t => {
  const f = fixture(t);
  f.set('animeData', [f.anime({ thumbnail: 'image/Poster.webp' })]);
  assert.ok(has(f.check(), 'ASSET_CASE'));
});

test('HTML deferred scripts, collector scripts, inline JS and CSS assets are checked', t => {
  const f = fixture(t);
  f.write('page.html', '<script data-year-src="data/{year}/{year}animeData.js"></script>\n' +
    '<script data-app-src="missing.js"></script>\n<script data-collector-src="also-missing.js"></script>\n' +
    '<script>const broken = ;</script>');
  f.write('theme.css', 'body { background: url(image/lost.webp); }');
  const r = f.check();
  assert.ok(has(r, 'INLINE_JS_SYNTAX'));
  assert.equal(r.issues.filter(i => i.code === 'ASSET_MISSING').length, 3);
  assert.equal(r.issues.some(i => i.message.includes('{year}')), false);
});

test('ES modules parse correctly; syntax in unpublished year files still fails', t => {
  const f = fixture(t);
  f.write('module.js', 'import x from "https://example.com/x.js"; export { x };');
  f.write('module.html', '<script type="module">import x from "https://example.com/x.js";</script>');
  assert.equal(f.check().ok, true);
  f.write('data/2027/2027example.js', 'var invalid = [;');
  assert.ok(has(f.check(), 'JS_SYNTAX'));
});

test('collector data markers reject typos; malformed policy cannot hide missing files', t => {
  const f = fixture(t);
  f.write('collector.html', '<script type="text/plain" data-collector-data="animeTypoData"></script>');
  f.write('dataCollector/validation-policy.json', '{"missingAssets":[{}]}');
  const r = f.check();
  assert.ok(has(r, 'COLLECTOR_DATASET'));
  assert.ok(has(r, 'POLICY_INVALID'));
});

test('episodes support untitled placeholders and distinct sections sharing an act', t => {
  const f = fixture(t);
  f.set('animeEPData', { 1: [
    { 'episode no': '1막', 'episode title': '전반' },
    { 'episode no': '1막', 'episode title': '후반' },
    { 'episode no': '2막', 'episode title': '' }
  ] });
  const r = f.check();
  assert.equal(r.ok, true);
  assert.ok(has(r, 'EP_NUMBER_REUSED', 'warning'));
  assert.ok(has(r, 'EP_TITLE_EMPTY', 'warning'));
  f.set('animeEPData', { 1: [
    { 'episode no': '1', 'episode title': '같음' }, { 'episode no': '1', 'episode title': '같음' }
  ] });
  assert.ok(has(f.check(), 'EP_DUPLICATE'));
});

test('orphan OST/EP references and reused OST track slots fail', t => {
  const f = fixture(t);
  f.set('animeEPData', { 999: [] });
  f.set('animeOSTData', [{ id: 999, albums: [{ discs: [{ disc: 1, tracks: [
    { track_no: 1, title: 'A' }, { track_no: 1, title: 'B' }
  ] }] }] }]);
  const r = f.check();
  for (const code of ['EP_ORPHAN', 'WORK_ORPHAN', 'OST_TRACK_DUPLICATE']) assert.ok(has(r, code), code);
});

test('explicit new year checks require its own files; relationship-only mode stays focused', t => {
  const f = fixture(t);
  const r = f.check({ years: [2027] });
  assert.ok(has(r, 'DATA_FILE_MISSING'));
  assert.ok(has(r, 'YEAR_NOT_PUBLISHED', 'warning'));
  f.set('animeSongsData', {});
  assert.equal(f.check({ relationshipsOnly: true }).ok, true);
  assert.equal(f.check({ relationshipsOnly: true }).stats.datasets, 3);
});

test('report escapes table separators and CLI rejects incomplete year options', t => {
  const f = fixture(t);
  const r = f.check();
  r.issues.push({ level: 'warning', code: 'TEST', file: 'a|b', context: 'line\nb', message: '<문자>' });
  assert.ok(markdown(r).includes('a b'));
  assert.ok(markdown(r).includes('&lt;문자&gt;'));
  const cli = spawnSync(process.execPath, [path.join(__dirname, 'dataValidator.js'), '--year'], { encoding: 'utf8' });
  assert.equal(cli.status, 2);
});
