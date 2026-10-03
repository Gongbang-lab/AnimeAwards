// data/resolveYear.js

const CURRENT_YEAR =
    localStorage.getItem("selected_year") ||
    (typeof AvailableYears !== 'undefined' ? AvailableYears[AvailableYears.length - 1] : 2026);

// TVA와 Cinema는 단일 카탈로그에서 day 값으로 나눕니다.
const catalogKey = `AnimeCatalog_${CURRENT_YEAR}`;
if (Array.isArray(window[catalogKey])) {
    window.AnimeCatalog = window[catalogKey];
    window.AnimeList = window.AnimeCatalog;
    window.TVAnimeList = window.AnimeCatalog.filter(item => item?.day !== "Cinema");
    window.cinemaData = window.AnimeCatalog.filter(item => item?.day === "Cinema");
}

// [별칭 이름, 데이터 파일 안의 변수 접두사]
const YEAR_DATA_KEYS = [
    ["CharacterData",    "CharacterData"],
    ["CharacterVoiceData",           "CharacterVoiceData"],
    ["AnimeSongs",        "AnimeSongs"],
    ["AnimeStudioData",       "AnimeStudioData"],
    ["animeDirectorData",     "animeDirectorData"],
    ["AnimeAdaptorData",      "AnimeAdaptorData"],
    ["RookieCVData",     "RookieCVData"],
    ["animeEPData",           "animeEPData"],
    ["animePVData",           "animePVData"],
    ["AnimeMemeData",         "AnimeMemeData"],
    ["scriptwriterData", "scriptwriterData"],
    ["animeOSTData", "animeOSTData"]
];

YEAR_DATA_KEYS.forEach(([alias, prefix]) => {
    const sourceKey = `${prefix}_${CURRENT_YEAR}`;
    if (typeof window[sourceKey] !== "undefined") {
        window[alias] = window[sourceKey];
    }
});

if (!Array.isArray(window.AnimeCatalog)) {
    console.warn(`[resolveYear] ${catalogKey} 카탈로그가 없어 작품 목록을 설정하지 못했습니다.`);
}

console.log(`[resolveYear] ${CURRENT_YEAR}년 데이터로 별칭 설정 완료`);
