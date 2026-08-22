// data/resolveYear.js

const CURRENT_YEAR =
    localStorage.getItem("selected_year") ||
    (typeof AvailableYears !== 'undefined' ? AvailableYears[AvailableYears.length - 1] : 2026);

// [별칭 이름, 데이터 파일 안의 변수 접두사]
// ⚠️ 실제 각 파일의 변수명과 다르면 오른쪽 값만 맞춰서 고쳐주세요.
const YEAR_DATA_KEYS = [
    ["AnimeList",        "AnimeList"],
    ["CharacterData",    "CharacterData"],
    ["CharacterVoiceData",           "CharacterVoiceData"],
    ["cinemaData",       "cinemaData"],
    ["OSTData",          "OSTData"],
    ["AnimeSongs",        "AnimeSongs"],
    ["AnimeStudioData",       "AnimeStudioData"],
    ["DirectorData",     "DirectorData"],
    ["AdaptorData",      "AdaptorData"],
    ["RookieCVData",     "RookieCVData"],
    ["EPData",           "EPData"],
    ["AnimeMemeData",         "AnimeMemeData"],
    ["scriptwriterData", "scriptwriterData"],
    ["TOP3_Awards",      "TOP3_Awards"],
];

YEAR_DATA_KEYS.forEach(([alias, prefix]) => {
    const sourceKey = `${prefix}_${CURRENT_YEAR}`;
    if (typeof window[sourceKey] !== "undefined") {
        window[alias] = window[sourceKey];
    }
});

console.log(`[resolveYear] ${CURRENT_YEAR}년 데이터로 별칭 설정 완료`);