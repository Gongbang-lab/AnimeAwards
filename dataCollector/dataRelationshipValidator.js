/**
 * AnimeAwards - Data Relationship Validator v2
 *
 * Current schema:
 *
 * AnimeData:
 *   AnimeList_2026[] -> { id, year, quarter, title, ... }
 *
 * CharacterData:
 *   CharacterData_2026[] -> {
 *      id: animeId,
 *      characters: [{
 *          characterId,
 *          name,
 *          gender,
 *          cvId,
 *          cv,
 *          img
 *      }]
 *   }
 *
 * CVData:
 *   CharacterVoiceData_2026[] -> {
 *      id,
 *      name,
 *      cvimg,
 *      gender
 *   }
 *
 * Important:
 * - characterId is NOT globally unique.
 * - (animeId + characterId) is the relationship-level unique pair.
 * - CVData does NOT contain characterIds.
 * - CharacterData.cvId -> CVData.id is the authoritative Character/CV link.
 * - Cinema titles are valid works too, so cinemaData_2026 is included when
 *   checking CharacterData.id -> work existence.
 *
 * This script NEVER modifies data.
 *
 * Usage:
 *   node dataCollector/dataRelationshipValidator.js 2026
 */

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const YEAR = String(process.argv[2] || "2026");

const DATA_DIR = path.resolve(__dirname, "..", "data", YEAR);

const FILES = {
    anime: path.join(DATA_DIR, `${YEAR}animeData.js`),
    character: path.join(DATA_DIR, `${YEAR}animeCharacterData.js`),
    cv: path.join(DATA_DIR, `${YEAR}animeCVData.js`),
    cinema: path.join(DATA_DIR, `${YEAR}animeCinemaData.js`)
};

const counts = {
    errors: 0,
    warnings: 0,
    info: 0
};

const issues = [];

function issue(level, code, message, context = null) {
    counts[level.toLowerCase()] += 1;
    issues.push({ level, code, message, context });
}

function error(code, message, context) {
    issue("ERROR", code, message, context);
}

function warning(code, message, context) {
    issue("WARNING", code, message, context);
}

function info(code, message, context) {
    issue("INFO", code, message, context);
}

function loadScript(filePath) {
    if (!fs.existsSync(filePath)) {
        error(
            "MISSING_DATA_FILE",
            `데이터 파일을 찾을 수 없습니다: ${path.basename(filePath)}`,
            { filePath }
        );
        return {};
    }

    const source = fs.readFileSync(filePath, "utf8");

    const context = {
        console: {
            log() {},
            warn() {},
            error() {}
        }
    };

    vm.createContext(context);

    try {
        vm.runInContext(source, context, {
            filename: path.basename(filePath)
        });
    } catch (err) {
        error(
            "DATA_SCRIPT_ERROR",
            `${path.basename(filePath)} 실행 중 오류가 발생했습니다: ${err.message}`,
            { filePath }
        );
        return {};
    }

    return context;
}

function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return Object.values(value);
    return [];
}

function id(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
}

function nonEmpty(value) {
    return String(value ?? "").trim();
}

const animeContext = loadScript(FILES.anime);
const characterContext = loadScript(FILES.character);
const cvContext = loadScript(FILES.cv);
const cinemaContext = loadScript(FILES.cinema);

const animeList = asArray(animeContext[`AnimeList_${YEAR}`]);
const characterData = asArray(characterContext[`CharacterData_${YEAR}`]);
const cvData = asArray(cvContext[`CharacterVoiceData_${YEAR}`]);
const cinemaData = asArray(cinemaContext[`cinemaData_${YEAR}`]);

const animeIds = new Set();
const cinemaIds = new Set();
const workIds = new Set();

animeList.forEach((anime, index) => {
    const animeId = id(anime?.id);

    if (animeId === null) {
        error(
            "ANIME_INVALID_ID",
            `AnimeList의 ${index}번째 항목에 유효한 id가 없습니다.`,
            { index }
        );
        return;
    }

    if (animeIds.has(animeId)) {
        error(
            "ANIME_DUPLICATE_ID",
            `Anime ID ${animeId}가 AnimeList에서 중복됩니다.`,
            { animeId, index }
        );
    }

    animeIds.add(animeId);
    workIds.add(animeId);
});

cinemaData.forEach((cinema, index) => {
    const cinemaId = id(cinema?.id);

    if (cinemaId === null) {
        warning(
            "CINEMA_INVALID_ID",
            `CinemaData의 ${index}번째 항목에 유효한 id가 없습니다.`,
            { index }
        );
        return;
    }

    if (cinemaIds.has(cinemaId)) {
        warning(
            "CINEMA_DUPLICATE_ID",
            `Cinema ID ${cinemaId}가 CinemaData에서 중복됩니다.`,
            { cinemaId, index }
        );
    }

    cinemaIds.add(cinemaId);
    workIds.add(cinemaId);

    if (animeIds.has(cinemaId)) {
        warning(
            "WORK_ID_IN_ANIME_AND_CINEMA",
            `작품 ID ${cinemaId}가 AnimeData와 CinemaData 양쪽에 존재합니다.`,
            { cinemaId }
        );
    }
});

const cvById = new Map();
const cvNameToIds = new Map();

cvData.forEach((cv, index) => {
    const cvId = id(cv?.id);
    const name = nonEmpty(cv?.name);
    const gender = nonEmpty(cv?.gender).toLowerCase();

    if (cvId === null) {
        error(
            "CV_INVALID_ID",
            `CVData의 ${index}번째 항목에 유효한 id가 없습니다.`,
            { index }
        );
        return;
    }

    if (cvById.has(cvId)) {
        error(
            "CV_DUPLICATE_ID",
            `CV ID ${cvId}가 CVData에서 중복됩니다.`,
            { cvId, indexes: [cvById.get(cvId).index, index] }
        );
    } else {
        cvById.set(cvId, { cv, index });
    }

    if (!name) {
        error(
            "CV_EMPTY_NAME",
            `CV ID ${cvId}에 name이 없습니다.`,
            { cvId, index }
        );
    }

    if (!["male", "female", "unknown"].includes(gender)) {
        warning(
            "CV_UNKNOWN_GENDER_VALUE",
            `CV ${cvId}의 gender 값이 예상 범위가 아닙니다: "${cv?.gender}"`,
            { cvId, gender: cv?.gender }
        );
    }

    if (!cvNameToIds.has(name)) {
        cvNameToIds.set(name, new Set());
    }

    cvNameToIds.get(name).add(cvId);

    if (Array.isArray(cv?.characterIds) || Array.isArray(cv?.characters)) {
        warning(
            "CV_STALE_CHARACTER_DATA",
            `CV ${cvId}에 구형 characters/characterIds 필드가 남아 있습니다. 현재 스키마에서는 제거 대상입니다.`,
            { cvId, index }
        );
    }
});

for (const [name, ids] of cvNameToIds.entries()) {
    if (ids.size > 1) {
        warning(
            "CV_NAME_SHARED_BY_MULTIPLE_IDS",
            `동일한 성우 이름 "${name}"이 여러 CV ID에 연결되어 있습니다.`,
            { name, ids: [...ids] }
        );
    }
}

const characterPairMap = new Map();
const characterIdMap = new Map();
let rawCharacterCount = 0;

characterData.forEach((entry, entryIndex) => {
    const animeId = id(entry?.id);
    const title = nonEmpty(entry?.title);

    if (animeId === null) {
        error(
            "CHARACTER_ENTRY_INVALID_ANIME_ID",
            `CharacterData ${entryIndex}번째 entry의 작품 id가 유효하지 않습니다.`,
            { entryIndex }
        );
        return;
    }

    if (!workIds.has(animeId)) {
        error(
            "CHARACTER_ORPHAN_WORK",
            `CharacterData가 존재하지 않는 작품 ${animeId}를 참조합니다.`,
            {
                animeId,
                entryIndex,
                isCinemaId: cinemaIds.has(animeId),
                title
            }
        );
    }

    const characters = Array.isArray(entry?.characters)
        ? entry.characters
        : [];

    characters.forEach((character, characterIndex) => {
        rawCharacterCount += 1;

        const characterId = id(character?.characterId);
        const cvId = id(character?.cvId);
        const characterName = nonEmpty(character?.name);
        const cvName = nonEmpty(character?.cv);

        if (characterId === null) {
            error(
                "CHARACTER_INVALID_ID",
                `Anime ${animeId}의 ${characterIndex}번째 캐릭터에 characterId가 없습니다.`,
                { animeId, entryIndex, characterIndex }
            );
            return;
        }

        const pairKey = `${animeId}:${characterId}`;

        if (characterPairMap.has(pairKey)) {
            error(
                "CHARACTER_DUPLICATE_WORK_PAIR",
                `작품별 캐릭터 식별자 ${pairKey}가 중복됩니다.`,
                {
                    pairKey,
                    first: characterPairMap.get(pairKey),
                    duplicate: { entryIndex, characterIndex }
                }
            );
        } else {
            characterPairMap.set(pairKey, {
                entryIndex,
                characterIndex,
                animeId,
                characterId
            });
        }

        if (!characterIdMap.has(characterId)) {
            characterIdMap.set(characterId, []);
        }

        characterIdMap.get(characterId).push({
            animeId,
            entryIndex,
            characterIndex,
            cvId,
            cvName
        });

        // 같은 characterId가 다른 animeId에서 반복되는 것은 정상이다.
        // 정보 확인을 위해 warning만 남기고 오류로 취급하지 않는다.
        if (
            characterIdMap.get(characterId).length > 1 &&
            characterIdMap.get(characterId).length === 2
        ) {
            warning(
                "CHARACTER_ID_REUSED_ACROSS_WORKS",
                `Character ID ${characterId}가 여러 작품에서 사용됩니다. 이는 허용되며 (animeId + characterId)로 구분합니다.`,
                { characterId }
            );
        }

        if (!characterName) {
            warning(
                "CHARACTER_EMPTY_NAME",
                `Anime ${animeId}의 Character ${characterId}에 name이 없습니다.`,
                { animeId, characterId, entryIndex, characterIndex }
            );
        }

        if (cvId === null) {
            // 7charDataExtractor는 일본어 CV가 없는 캐릭터를 제외하도록 설계됨.
            error(
                "CHARACTER_MISSING_CV_ID",
                `Anime ${animeId} / Character ${characterId}에 cvId가 없습니다.`,
                { animeId, characterId, entryIndex, characterIndex }
            );
            return;
        }

        const cvRecord = cvById.get(cvId);

        if (!cvRecord) {
            error(
                "CHARACTER_MISSING_CV",
                `Anime ${animeId} / Character ${characterId}가 존재하지 않는 CV ${cvId}를 참조합니다.`,
                {
                    animeId,
                    characterId,
                    cvId,
                    entryIndex,
                    characterIndex
                }
            );
        } else {
            const canonicalCVName = nonEmpty(cvRecord.cv?.name);

            if (
                cvName &&
                canonicalCVName &&
                cvName !== canonicalCVName
            ) {
                warning(
                    "CHARACTER_CV_NAME_MISMATCH",
                    `Character ${characterId}의 cv 이름 "${cvName}"과 CV ${cvId}의 name "${canonicalCVName}"이 다릅니다.`,
                    {
                        animeId,
                        characterId,
                        cvId,
                        characterCVName: cvName,
                        cvDataName: canonicalCVName
                    }
                );
            }
        }
    });
});

// Summary diagnostics
const duplicateCharacterIds = [...characterIdMap.entries()]
    .filter(([, locations]) => locations.length > 1);

if (duplicateCharacterIds.length === 0) {
    info(
        "CHARACTER_ID_GLOBAL_DUPLICATE_COUNT",
        "서로 다른 작품 간 동일 characterId 재사용 사례가 없습니다.",
        {}
    );
} else {
    info(
        "CHARACTER_ID_GLOBAL_DUPLICATE_COUNT",
        `서로 다른 작품에서 재사용된 characterId가 ${duplicateCharacterIds.length}종 있습니다. 이는 정상으로 간주합니다.`,
        {
            count: duplicateCharacterIds.length
        }
    );
}

const cvIdsReferencedByCharacters = new Set();

for (const locations of characterIdMap.values()) {
    for (const location of locations) {
        if (location.cvId !== null) {
            cvIdsReferencedByCharacters.add(location.cvId);
        }
    }
}

const orphanCVs = [];
for (const [cvId, record] of cvById.entries()) {
    if (!cvIdsReferencedByCharacters.has(cvId)) {
        orphanCVs.push({
            cvId,
            name: record.cv?.name,
            index: record.index
        });
    }
}

if (orphanCVs.length > 0) {
    warning(
        "CV_WITHOUT_CHARACTER",
        `CharacterData에서 현재 사용되지 않는 CV가 ${orphanCVs.length}명 있습니다.`,
        { count: orphanCVs.length, sample: orphanCVs.slice(0, 20) }
    );
}

console.log("\n==============================");
console.log(`AnimeAwards Data Relationship Validator v2 (${YEAR})`);
console.log("==============================");

console.log(`Anime:      ${animeList.length}`);
console.log(`Cinema:     ${cinemaData.length}`);
console.log(`Works:      ${workIds.size}`);
console.log(`Characters: ${rawCharacterCount}`);
console.log(`CV:         ${cvData.length}`);
console.log("");

if (issues.length === 0) {
    console.log("RESULT: PASS ✅");
} else {
    issues.forEach((item, index) => {
        const contextText = item.context
            ? `\n     ${JSON.stringify(item.context)}`
            : "";

        console.log(
            `[${index + 1}] ${item.code}: ${item.message}${contextText}`
        );
    });

    console.log("");
    console.log(
        `RESULT: errors=${counts.errors}, warnings=${counts.warnings}, info=${counts.info}`
    );

    if (counts.errors === 0) {
        console.log("STATUS: PASS ✅ (warnings/info 제외)");
    } else {
        console.log("STATUS: FAIL ❌");
        process.exitCode = 1;
    }
}

console.log("\n검사 기준:");
console.log("- characterId 단독 중복은 오류가 아닙니다.");
console.log("- (animeId + characterId) 중복만 오류입니다.");
console.log("- Character.cvId -> CV.id가 실제 관계 기준입니다.");
console.log("- CVData의 characterIds/characters가 남아 있으면 경고합니다.");
console.log("- CharacterData의 작품 ID는 Anime 또는 Cinema에 존재해야 합니다.");
