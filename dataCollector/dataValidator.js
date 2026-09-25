#!/usr/bin/env node
/**
 * AnimeAwards Data Validator
 *
 * Usage:
 *   node dataCollector/dataValidator.js 2026
 *
 * Read-only diagnostic tool. It does not modify source data.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const YEAR = Number(process.argv[2] || 2026);
const DATA_DIR = path.join(ROOT, 'data', String(YEAR));

const issues = { error: [], warning: [], info: [] };

function issue(level, code, message, meta = {}) {
  issues[level].push({ code, message, ...meta });
}

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function nonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== '';
}

function normalize(v) {
  return String(v ?? '').normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

function readDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    issue('error', 'DATA_DIR_MISSING', `데이터 폴더가 없습니다: ${path.relative(ROOT, DATA_DIR)}`);
    return {};
  }

  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.js'))
    .sort();

  const ctx = {};

  for (const file of files) {
    const source = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
    try {
      vm.runInNewContext(source, ctx, { filename: file });
    } catch (err) {
      issue('error', 'JS_LOAD_ERROR', `${file} 로딩 실패: ${err.message}`, { file });
    }
  }

  return ctx;
}

function duplicateGroups(array, keyFn) {
  const map = new Map();
  for (const item of array) {
    const key = keyFn(item);
    if (!key) continue;
    const arr = map.get(key) || [];
    arr.push(item);
    map.set(key, arr);
  }
  return [...map.entries()].filter(([, arr]) => arr.length > 1);
}

function checkManifest(ctx) {
  const manifestPath = path.join(ROOT, 'data', 'manifest.js');
  if (!fs.existsSync(manifestPath)) {
    issue('error', 'MANIFEST_MISSING', 'data/manifest.js가 없습니다.');
    return;
  }
  const source = fs.readFileSync(manifestPath, 'utf8');
  const match = source.match(/AvailableYears\s*=\s*\[([^\]]*)\]/);
  if (!match) {
    issue('error', 'MANIFEST_INVALID', 'AvailableYears 선언을 찾을 수 없습니다.');
    return;
  }
  const years = [...match[1].matchAll(/\d{4}/g)].map(m => Number(m[0]));
  if (!years.length) {
    issue('error', 'MANIFEST_INVALID', 'AvailableYears에 연도가 없습니다.');
    return;
  }
  if (!years.includes(YEAR)) {
    issue('warning', 'YEAR_NOT_IN_MANIFEST', `${YEAR}년이 AvailableYears에 없습니다.`, { year: YEAR, years });
  }
}

function checkDatasetPresence(ctx) {
  const expected = [
    `AnimeList_${YEAR}`,
    `CharacterData_${YEAR}`,
    `CharacterVoiceData_${YEAR}`,
    `cinemaData_${YEAR}`,
    `AnimeSongs_${YEAR}`,
    `AnimeStudioData_${YEAR}`,
    `animeDirectorData_${YEAR}`,
    `AnimeAdaptorData_${YEAR}`,
    `RookieCVData_${YEAR}`,
    `animeEPData_${YEAR}`,
    `AnimeMemeData_${YEAR}`,
    `scriptwriterData_${YEAR}`,
  ];

  for (const key of expected) {
    if (ctx[key] === undefined) {
      issue('warning', 'DATASET_MISSING', `예상 데이터셋이 없습니다: ${key}`, { key });
    }
  }
}

function checkAnimeList(ctx) {
  const data = ctx[`AnimeList_${YEAR}`];
  if (!Array.isArray(data)) return new Map();

  const map = new Map();
  let duplicateSameQuarter = 0;

  for (const [index, item] of data.entries()) {
    if (!isObject(item)) {
      issue('error', 'ANIME_ITEM_INVALID', `AnimeList[${index}]가 객체가 아닙니다.`, { index });
      continue;
    }

    for (const field of ['id', 'year', 'title']) {
      if (item[field] === undefined || item[field] === null || item[field] === '') {
        issue('error', 'ANIME_FIELD_MISSING', `AnimeList[${index}].${field}가 없습니다.`, { index, field });
      }
    }

    if (item.year !== YEAR) {
      issue('error', 'ANIME_YEAR_MISMATCH', `AnimeList[${index}] year=${item.year} (파일 기준 ${YEAR})`, { index, value: item.year });
    }

    if (!nonEmptyString(item.quarter)) {
      issue('warning', 'ANIME_QUARTER_MISSING', `AnimeList[${index}] quarter가 없습니다.`, { index, id: item.id });
    }

    const id = String(item.id);
    const arr = map.get(id) || [];
    arr.push(item);
    map.set(id, arr);
  }

  for (const [id, arr] of map.entries()) {
    const byQuarter = new Map();
    for (const item of arr) {
      const key = normalize(item.quarter) || '(없음)';
      const list = byQuarter.get(key) || [];
      list.push(item);
      byQuarter.set(key, list);
    }
    for (const [quarter, records] of byQuarter.entries()) {
      if (records.length > 1) {
        duplicateSameQuarter += 1;
        issue('error', 'ANIME_DUPLICATE_SAME_QUARTER', `AnimeList ID ${id}가 ${quarter}에 ${records.length}건 존재합니다.`, {
          id, quarter, records: records.map(x => ({ title: x.title, thumbnail: x.thumbnail }))
        });
      }
    }
  }

  const repeatedIdsAcrossQuarters = [...map.entries()].filter(([, arr]) => new Set(arr.map(x => normalize(x.quarter))).size > 1);
  issue('info', 'ANIME_SEASONAL_REUSE', `AnimeList ${data.length}건 중 ID가 여러 분기에 재사용되는 작품 ${repeatedIdsAcrossQuarters.length}개를 확인했습니다. 분기별 재사용은 허용합니다.`);
  issue('info', 'ANIME_COUNT', `AnimeList ${data.length}건 검사 완료. 같은 분기 중복 ${duplicateSameQuarter}그룹.`);

  return map;
}

function checkCharacterData(ctx, animeMap, cinemaMap) {
  const data = ctx[`CharacterData_${YEAR}`];
  if (!Array.isArray(data)) return;

  const duplicateIds = duplicateGroups(data, x => String(x.id));
  for (const [id, records] of duplicateIds) {
    issue('error', 'CHARACTER_DATA_DUPLICATE_ID', `CharacterData ID ${id}가 ${records.length}건 존재합니다. 분기/버전 구분자가 없어 자동 병합 기준이 없습니다.`, {
      id,
      records: records.map(x => ({ title: x.title, quarter: x.quarter, characterCount: Array.isArray(x.characters) ? x.characters.length : null }))
    });
  }

  const allReferenceIds = new Set([...animeMap.keys(), ...cinemaMap.keys()]);
  for (const [index, anime] of data.entries()) {
    if (!isObject(anime)) {
      issue('error', 'CHARACTER_ANIME_INVALID', `CharacterData[${index}]가 객체가 아닙니다.`, { index });
      continue;
    }
    if (!allReferenceIds.has(String(anime.id))) {
      issue('error', 'CHARACTER_ANIME_ORPHAN', `CharacterData ID ${anime.id}가 AnimeList/Cinema 어디에도 없습니다.`, { index, animeId: anime.id, title: anime.title });
    }
    if (!nonEmptyString(anime.title)) {
      issue('warning', 'CHARACTER_TITLE_MISSING', `CharacterData[${index}].title이 없습니다.`, { index, animeId: anime.id });
    }
    if (!Array.isArray(anime.characters)) {
      issue('error', 'CHARACTERS_NOT_ARRAY', `CharacterData[${index}].characters가 배열이 아닙니다.`, { index, animeId: anime.id });
      continue;
    }

    const seen = new Map();
    for (const [charIndex, character] of anime.characters.entries()) {
      if (!isObject(character)) {
        issue('error', 'CHARACTER_ITEM_INVALID', `CharacterData[${index}].characters[${charIndex}]가 객체가 아닙니다.`, { index, charIndex, animeId: anime.id });
        continue;
      }
      if (!nonEmptyString(character.name)) issue('warning', 'CHARACTER_NAME_MISSING', `캐릭터 이름이 없습니다.`, { animeId: anime.id, charIndex });
      if (!nonEmptyString(character.cv)) issue('warning', 'CHARACTER_CV_MISSING', `캐릭터 ${character.name || '(이름 없음)'}의 CV가 없습니다.`, { animeId: anime.id, charIndex });
      const key = normalize(character.name);
      if (key) {
        if (seen.has(key)) {
          issue('warning', 'CHARACTER_DUPLICATE_NAME', `같은 작품에서 동일 캐릭터명이 반복됩니다: ${character.name}`, { animeId: anime.id, title: anime.title, firstIndex: seen.get(key), secondIndex: charIndex });
        } else {
          seen.set(key, charIndex);
        }
      }
    }
  }
}

function checkCVData(ctx, animeMap, cinemaMap, characterData) {
  const data = ctx[`CharacterVoiceData_${YEAR}`];
  if (!isObject(data)) return;

  const allAnimeRecords = [...animeMap.values()].flat();
  const allCinemaRecords = [...cinemaMap.values()].filter(Boolean);
  const allTitles = new Set([
    ...allAnimeRecords.map(x => normalize(x.title)).filter(Boolean),
    ...allCinemaRecords.map(x => normalize(x.title)).filter(Boolean),
    ...characterData.map(x => normalize(x.title)).filter(Boolean),
  ]);

  let links = 0;
  let missingTime = 0;
  let unmatchedCurrentTitles = 0;
  let badCharacterRefs = 0;

  for (const [cvKey, person] of Object.entries(data)) {
    if (!isObject(person)) {
      issue('error', 'CV_PERSON_INVALID', `CV '${cvKey}' 데이터가 객체가 아닙니다.`, { cv: cvKey });
      continue;
    }
    if (!nonEmptyString(person.name)) issue('warning', 'CV_NAME_MISSING', `CV key=${cvKey}의 name이 없습니다.`, { cv: cvKey });
    if (!Array.isArray(person.characters)) {
      issue('error', 'CV_CHARACTERS_NOT_ARRAY', `CV '${cvKey}'의 characters가 배열이 아닙니다.`, { cv: cvKey });
      continue;
    }

    for (const [index, character] of person.characters.entries()) {
      links += 1;
      if (!nonEmptyString(character.charName)) issue('warning', 'CV_CHAR_NAME_MISSING', `CV '${cvKey}' characters[${index}] charName이 없습니다.`);
      if (!nonEmptyString(character.animeTitle)) issue('warning', 'CV_ANIME_TITLE_MISSING', `CV '${cvKey}' characters[${index}] animeTitle이 없습니다.`);

      const hasYear = character.year !== undefined && character.year !== '';
      const hasQuarter = nonEmptyString(character.quarter);
      if (!hasYear || !hasQuarter) {
        missingTime += 1;
      } else {
        if (Number(character.year) !== YEAR) issue('warning', 'CV_YEAR_MISMATCH', `CV '${cvKey}'의 ${character.animeTitle} year=${character.year}`, { cv: cvKey, index });
        if (!['1분기', '2분기', '3분기', '4분기'].includes(character.quarter)) issue('warning', 'CV_QUARTER_INVALID', `CV '${cvKey}'의 ${character.animeTitle} quarter=${character.quarter}`, { cv: cvKey, index });
        if (!allTitles.has(normalize(character.animeTitle))) {
          unmatchedCurrentTitles += 1;
          if (unmatchedCurrentTitles <= 20) issue('warning', 'CV_CURRENT_TITLE_UNMATCHED', `CV 작품명이 현재 Anime/Cinema/Character 데이터 제목과 일치하지 않습니다: ${character.animeTitle}`, { cv: cvKey, index, animeTitle: character.animeTitle });
        }
      }
    }
  }

  // CharacterData -> CharacterVoiceData reverse reference check.
  const cvNames = new Set(Object.keys(data).map(normalize));
  for (const anime of characterData) {
    for (const character of anime.characters || []) {
      if (!nonEmptyString(character.cv)) continue;
      if (!cvNames.has(normalize(character.cv))) {
        badCharacterRefs += 1;
        issue('error', 'CHARACTER_CV_ORPHAN', `CharacterData의 CV '${character.cv}'가 CharacterVoiceData에 없습니다.`, {
          animeId: anime.id,
          animeTitle: anime.title,
          character: character.name,
          cv: character.cv,
        });
      }
    }
  }

  issue('info', 'CV_SUMMARY', `성우 ${Object.keys(data).length}명 / 캐릭터 연결 ${links}건. 연도·분기 누락 연결 ${missingTime}건.`);
  issue('info', 'CV_TITLE_SCOPE', `연도·분기가 채워진 CV 연결 중 현재 제목과 일치하지 않는 건수: ${unmatchedCurrentTitles}.`);
  if (badCharacterRefs === 0) issue('info', 'CV_REVERSE_LINK_OK', 'CharacterData → CharacterVoiceData 성우명 연결은 모두 확인되었습니다.');
  issue('info', 'CV_MARKET_SCOPE_UNVERIFIED', '현재 데이터 구조에는 국가/언어/활동 시장 메타데이터가 없어 일본 성우 여부를 자동 확정할 수 없습니다.');
}

function checkSongs(ctx, animeMap, cinemaMap) {
  const data = ctx[`AnimeSongs_${YEAR}`];
  if (!Array.isArray(data)) return;
  const allIds = new Set([...animeMap.keys(), ...cinemaMap.keys()]);

  for (const [index, item] of data.entries()) {
    if (!isObject(item)) { issue('error', 'SONG_ITEM_INVALID', `AnimeSongs[${index}]가 객체가 아닙니다.`, { index }); continue; }
    if (item.year !== YEAR) issue('error', 'SONG_YEAR_MISMATCH', `AnimeSongs[${index}] year=${item.year}`, { index });
    if (!allIds.has(String(item.id))) issue('warning', 'SONG_ANIME_ORPHAN', `AnimeSongs[${index}] ID ${item.id}가 Anime/Cinema에 없습니다.`, { index, id: item.id });
    if (!nonEmptyString(item.animeTitle)) issue('warning', 'SONG_ANIME_TITLE_MISSING', `AnimeSongs[${index}] animeTitle이 없습니다. (ID ${item.id})`, { index, id: item.id });
    if (!Array.isArray(item.songs)) { issue('error', 'SONGS_NOT_ARRAY', `AnimeSongs[${index}].songs가 배열이 아닙니다.`, { index, id: item.id }); continue; }
    const seen = new Set();
    for (const [songIndex, song] of item.songs.entries()) {
      if (!isObject(song)) { issue('error', 'SONG_ENTRY_INVALID', `AnimeSongs[${index}].songs[${songIndex}]가 객체가 아닙니다.`, { index, songIndex }); continue; }
      if (!nonEmptyString(song.type)) issue('warning', 'SONG_TYPE_MISSING', `곡 type 누락: ${item.id}`, { index, songIndex });
      if (!nonEmptyString(song.title)) issue('warning', 'SONG_TITLE_MISSING', `곡 title 누락: ${item.id}`, { index, songIndex });
      const key = `${normalize(song.type)}|${normalize(song.title)}|${normalize(song.artist)}`;
      if (seen.has(key)) issue('warning', 'DUPLICATE_SONG', `동일 곡이 작품 ${item.id} 안에서 반복됩니다: ${song.title}`, { id: item.id });
      seen.add(key);
    }
  }
}

function checkEpisodes(ctx, animeMap) {
  const data = ctx[`animeEPData_${YEAR}`];
  if (!isObject(data)) return;
  for (const [animeId, episodes] of Object.entries(data)) {
    if (!animeMap.has(animeId)) issue('warning', 'EP_ANIME_ORPHAN', `animeEPData ID ${animeId}가 AnimeList에 없습니다.`, { animeId });
    if (!Array.isArray(episodes)) { issue('error', 'EP_DATA_INVALID', `animeEPData[${animeId}]가 배열이 아닙니다.`, { animeId }); continue; }
    const seen = new Set();
    for (const [index, ep] of episodes.entries()) {
      if (!isObject(ep)) { issue('error', 'EP_ENTRY_INVALID', `animeEPData[${animeId}][${index}]가 객체가 아닙니다.`, { animeId, index }); continue; }
      const key = normalize(ep['episode no']);
      if (!key) issue('warning', 'EP_NO_MISSING', `작품 ${animeId}의 ${index}번째 에피소드 번호가 없습니다.`, { animeId, index });
      if (key && seen.has(key)) issue('warning', 'EP_DUPLICATE_NO', `작품 ${animeId}에서 episode no '${ep['episode no']}'가 반복됩니다.`, { animeId });
      seen.add(key);
    }
  }
}

function checkRookie(ctx) {
  const data = ctx[`RookieCVData_${YEAR}`];
  if (!isObject(data)) return;
  const ranks = new Map();
  let scoreMismatch = 0;
  for (const [key, person] of Object.entries(data)) {
    if (!isObject(person)) { issue('error', 'ROOKIE_INVALID', `RookieCVData '${key}'가 객체가 아닙니다.`, { key }); continue; }
    if (!nonEmptyString(person.name)) issue('warning', 'ROOKIE_NAME_MISSING', `Rookie '${key}' name 누락`, { key });
    if (person.rank !== undefined) ranks.set(String(person.rank), (ranks.get(String(person.rank)) || 0) + 1);
    if (isObject(person.scoreBreakdown) && typeof person.score === 'number') {
      const sum = Object.values(person.scoreBreakdown).reduce((acc, v) => acc + (Number(v) || 0), 0);
      if (sum !== person.score) {
        scoreMismatch += 1;
        issue('error', 'ROOKIE_SCORE_MISMATCH', `Rookie '${key}' score=${person.score}, breakdown 합계=${sum}`, { key });
      }
    }
  }
  for (const [rank, count] of ranks.entries()) if (count > 1) issue('error', 'ROOKIE_DUPLICATE_RANK', `Rookie rank ${rank}가 ${count}명에게 중복됩니다.`, { rank, count });
  issue('info', 'ROOKIE_SUMMARY', `루키 성우 ${Object.keys(data).length}명 검사. 점수 불일치 ${scoreMismatch}건.`);
}

function checkResolveYear(ctx) {
  const file = path.join(ROOT, 'data', 'resolveYear.js');
  if (!fs.existsSync(file)) return;
  const source = fs.readFileSync(file, 'utf8');
  const pairRegex = /\[\s*["'`]([^"'`]+)["'`]\s*,\s*["'`]([^"'`]+)["'`]\s*\]/g;
  let match;
  while ((match = pairRegex.exec(source))) {
    const [, alias, prefix] = match;
    const key = `${prefix}_${YEAR}`;
    if (ctx[key] === undefined) {
      issue('error', 'RESOLVEYEAR_MAPPING_BROKEN', `resolveYear.js: alias '${alias}'가 찾는 '${key}' 변수가 없습니다.`, { alias, prefix, expected: key });
    }
  }
}

function checkHtmlLocalScripts() {
  const htmlFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
    }
  }
  walk(ROOT);

  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
  for (const html of htmlFiles) {
    const source = fs.readFileSync(html, 'utf8');
    let match;
    while ((match = scriptRegex.exec(source))) {
      const src = match[1];
      if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) continue;
      const clean = src.split('#')[0].split('?')[0];
      const resolved = path.resolve(path.dirname(html), clean);
      if (!fs.existsSync(resolved)) {
        issue('error', 'HTML_LOCAL_SCRIPT_MISSING', `${path.relative(ROOT, html)}가 존재하지 않는 스크립트를 참조합니다: ${src}`, { html: path.relative(ROOT, html), src });
      }
    }
  }
}

function collectCounts(ctx) {
  const result = {};
  for (const [key, value] of Object.entries(ctx)) {
    if (Array.isArray(value)) result[key] = value.length;
    else if (isObject(value)) result[key] = Object.keys(value).length;
  }
  return result;
}

function print(ctx) {
  console.log(`\nAnimeAwards Data Validator — ${YEAR}`);
  console.log('----------------------------------------');

  console.log('\nDATASET');
  for (const [key, count] of Object.entries(collectCounts(ctx || {}))) {
    console.log(`- ${key}: ${count}`);
  }

  for (const level of ['error', 'warning', 'info']) {
    const list = issues[level];
    if (!list.length) continue;
    console.log(`\n${level.toUpperCase()} (${list.length})`);
    const max = level === 'info' ? 30 : 100;
    for (const item of list.slice(0, max)) console.log(`- [${item.code}] ${item.message}`);
    if (list.length > max) console.log(`... ${list.length - max}건 생략`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    year: YEAR,
    counts: collectCounts(ctx || {}),
    issues,
  };
  const reportPath = path.join(DATA_DIR, `validator-report-${YEAR}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\nSUMMARY');
  console.log(`Errors: ${issues.error.length}`);
  console.log(`Warnings: ${issues.warning.length}`);
  console.log(`Info: ${issues.info.length}`);
  console.log(`Report: ${path.relative(ROOT, reportPath)}`);
}

function main() {
  const ctx = readDataFiles();
  checkManifest(ctx);
  checkDatasetPresence(ctx);
  const animeMap = checkAnimeList(ctx);
  const cinemaData = Array.isArray(ctx[`cinemaData_${YEAR}`]) ? ctx[`cinemaData_${YEAR}`] : [];
  const cinemaMap = new Map(cinemaData.map(x => [String(x.id), x]));
  const characterData = Array.isArray(ctx[`CharacterData_${YEAR}`]) ? ctx[`CharacterData_${YEAR}`] : [];

  checkCharacterData(ctx, animeMap, cinemaMap);
  checkCVData(ctx, animeMap, cinemaMap, characterData);
  checkSongs(ctx, animeMap, cinemaMap);
  checkEpisodes(ctx, animeMap);
  checkRookie(ctx);
  checkResolveYear(ctx);
  checkHtmlLocalScripts();

  print(ctx);
  process.exitCode = issues.error.length > 0 ? 1 : 0;
}

main();
