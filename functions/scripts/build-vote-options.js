const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..", "..");
const context = vm.createContext({ console });

function loadFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return false;
  vm.runInContext(fs.readFileSync(absolutePath, "utf8"), context, {
    filename: absolutePath,
    timeout: 30000
  });
  return true;
}

function readVariable(name) {
  try {
    return vm.runInContext(name, context, { timeout: 1000 });
  } catch {
    return undefined;
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function firebaseKey(value) {
  const text = String(value ?? "");
  if (/[.#$/\[\]\u0000-\u001f\u007f]/.test(text)) {
    return `b64_${Buffer.from(text, "utf8").toString("base64url")}`;
  }
  return text;
}

function inSeason(item, year, quarter) {
  if (!item) return false;
  if (item.year != null && String(item.year) !== String(year)) return false;
  if (quarter !== "모든 분기" && item.quarter != null && item.quarter !== quarter) return false;
  return true;
}

const sourceFiles = {
  anime: (year) => [`data/${year}/${year}animeData.js`, `AnimeList_${year}`],
  characters: (year) => [`data/${year}/${year}animeCharacterData.js`, `CharacterData_${year}`],
  voices: (year) => [`data/${year}/${year}animeCVData.js`, `CharacterVoiceData_${year}`],
  songs: (year) => [`data/${year}/${year}animeSongsData.js`, `AnimeSongs_${year}`],
  studios: (year) => [`data/${year}/${year}animeStudioData.js`, `AnimeStudioData_${year}`],
  directors: (year) => [`data/${year}/${year}animeDirectorData.js`, `animeDirectorData_${year}`],
  adaptors: (year) => [`data/${year}/${year}animeAdaptorData.js`, `AnimeAdaptorData_${year}`],
  rookies: (year) => [`data/${year}/${year}animeRookieCVData.js`, `RookieCVData_${year}`],
  memes: (year) => [`data/${year}/${year}animeMemeData.js`, `AnimeMemeData_${year}`],
  cinema: (year) => [`data/${year}/${year}animeCinemaData.js`, `cinemaData_${year}`],
  scriptwriters: (year) => [`data/${year}/${year}animescriptwriterData.js`, `scriptwriterData_${year}`]
};

function uniqueKeys(values) {
  const rawValues = [...new Set(values.filter(value => typeof value === "string" && value.length > 0))];
  const normalized = rawValues.map(firebaseKey);
  if (normalized.some(value => ["_participants", "_voters", "__proto__", "constructor", "prototype"].includes(value))) {
    throw new Error("A candidate ID uses a reserved Firebase counter key.");
  }
  if (new Set(normalized).size !== normalized.length) {
    throw new Error("Two candidate IDs map to the same Firebase key.");
  }
  return normalized.sort();
}

function candidatesFor(theme, data, year, quarter) {
  const anime = asArray(data.anime).filter(item => inSeason(item, year, quarter));
  const animeIds = new Set(anime.map(item => String(item.id)));
  const characterGroups = asArray(data.characters).filter(item => animeIds.has(String(item.id)));
  const characters = characterGroups.flatMap(group => asArray(group.characters));

  switch (theme) {
    case "meme":
      return asArray(data.memes).filter(item => inSeason(item, year, quarter)).map(item => item.name);
    case "opening":
    case "ending": {
      const expectedTypes = theme === "opening" ? ["op", "opening"] : ["ed", "ending"];
      return asArray(data.songs)
        .filter(item => inSeason(item, year, quarter))
        .flatMap(item => asArray(item.songs))
        .filter(song => expectedTypes.includes(String(song.type || "").toLowerCase()))
        .map(song => song.title);
    }
    case "rookie_voice":
      return Object.values(data.rookies || {}).map(item => item && item.name);
    case "voice_male":
    case "voice_female": {
      const cvIds = new Set(characters.map(character => String(character.cvId)).filter(Boolean));
      const cvNames = new Set(characters.map(character => character.cv).filter(Boolean));
      const gender = theme === "voice_female" ? "female" : "male";
      return asArray(data.voices)
        .filter(voice => (cvIds.has(String(voice.id)) || cvNames.has(voice.name)) && voice.gender === gender)
        .map(voice => voice.name);
    }
    case "character_male":
    case "character_female":
      return characters.filter(character => character.gender === (theme === "character_female" ? "female" : "male"))
        .map(character => character.name);
    case "all_gender":
      return characters.map(character => character.name);
    case "best_couple": {
      const pairs = [];
      for (const group of characterGroups) {
        const names = [...new Set(asArray(group.characters).map(character => character && character.name)
          .filter(name => typeof name === "string" && name.length > 0))];
        for (let i = 0; i < names.length; i++) {
          for (let j = i + 1; j < names.length; j++) {
            pairs.push(`${names[i]}_${names[j]}`, `${names[j]}_${names[i]}`);
          }
        }
      }
      return pairs;
    }
    case "scriptwriter":
      return asArray(data.scriptwriters).filter(item => inSeason(item, year, quarter)).map(item => item.title);
    case "dramatization":
      return asArray(data.adaptors).filter(item => inSeason(item, year, quarter)).map(item => item.title);
    case "director":
      return asArray(data.directors)
        .filter(item => asArray(item.works).some(work => inSeason(work, year, quarter)))
        .map(item => item.director);
    case "studio":
      return asArray(data.studios)
        .filter(item => asArray(item.works).some(work => inSeason(work, year, quarter)))
        .map(item => item.studio);
    case "cinema":
      return asArray(data.cinema).filter(item => inSeason(item, year, quarter)).map(item => item.title);
    default:
      // Generic anime, episode, OST and series voting all use the anime title as their stored vote ID.
      return anime.map(item => item.title);
  }
}

loadFile("data/manifest.js");
loadFile("data/awardData.js");
const years = readVariable("AvailableYears");
const awards = readVariable("Awards");
if (!Array.isArray(years) || !Array.isArray(awards)) {
  throw new Error("Could not load AvailableYears or Awards from project data.");
}

const catalog = { version: 1, seasons: {} };
const quarters = ["1분기", "2분기", "3분기", "4분기", "모든 분기"];

for (const year of years) {
  const data = {};
  for (const [key, getSource] of Object.entries(sourceFiles)) {
    const [file, variable] = getSource(year);
    if (loadFile(file)) data[key] = readVariable(variable);
  }

  for (const quarter of quarters) {
    const seasonKey = `${year}_${quarter}`;
    const seasonAwards = {};
    for (const award of awards) {
      const ids = uniqueKeys(candidatesFor(award.theme, data, year, quarter));
      if (ids.length) seasonAwards[award.name] = ids;
    }
    const top3Ids = uniqueKeys(candidatesFor("top3", data, year, quarter));
    if (top3Ids.length) seasonAwards.TOP3_Awards = top3Ids;
    catalog.seasons[seasonKey] = { awards: seasonAwards };
  }
}

const output = path.join(__dirname, "..", "vote-options.json");
fs.writeFileSync(output, `${JSON.stringify(catalog)}\n`, "utf8");
console.log(`Built trusted vote catalog: ${Object.keys(catalog.seasons).length} seasons, ${output}`);
