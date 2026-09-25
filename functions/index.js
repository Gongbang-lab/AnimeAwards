const crypto = require("node:crypto");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const voteOptions = require("./vote-options.json");

initializeApp({
  databaseURL: "https://animeaward-2c0b9-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const database = getDatabase();

function firebaseKey(value) {
  const text = String(value ?? "");
  if (/[.#$/\[\]\u0000-\u001f\u007f]/.test(text)) {
    return `b64_${Buffer.from(text, "utf8").toString("base64url")}`;
  }
  return text;
}

function getCandidateId(item) {
  if (!item || typeof item !== "object") return "";
  const value = item.title || item.name || (item.name1 && item.name2 ? `${item.name1}_${item.name2}` : "");
  return typeof value === "string" ? value : "";
}

exports.submitVote = onCall({ region: "asia-southeast1", maxInstances: 20 }, async request => {
  const uid = request.auth && request.auth.uid;
  if (!uid) throw new HttpsError("unauthenticated", "익명 사용자 인증이 필요합니다.");

  const { seasonKey, awardName, candidateIds } = request.data || {};
  if (typeof seasonKey !== "string" || typeof awardName !== "string" || !Array.isArray(candidateIds)) {
    throw new HttpsError("invalid-argument", "투표 정보 형식이 올바르지 않습니다.");
  }

  const allowedSeason = voteOptions.seasons[seasonKey];
  const allowedCandidates = allowedSeason && allowedSeason.awards[awardName];
  if (!Array.isArray(allowedCandidates)) {
    throw new HttpsError("invalid-argument", "선택한 시즌 또는 시상 부문이 유효하지 않습니다.");
  }

  if (candidateIds.length < 1 || candidateIds.length > 3 || candidateIds.some(id => typeof id !== "string" || !id.trim())) {
    throw new HttpsError("invalid-argument", "후보 수 또는 후보 ID가 올바르지 않습니다.");
  }

  const candidateKeys = candidateIds.map(firebaseKey);
  if (new Set(candidateKeys).size !== candidateKeys.length || candidateKeys.some(id =>
    ["_participants", "_voters", "__proto__", "constructor", "prototype"].includes(id) || !allowedCandidates.includes(id)
  )) {
    throw new HttpsError("invalid-argument", "해당 시즌·부문에 등록된 후보가 아닙니다.");
  }

  const voterKey = crypto.createHash("sha256")
    .update(`${seasonKey}\n${awardName}\n${uid}`)
    .digest("hex");
  const categoryRef = database.ref(`votes/categories/${seasonKey}/${firebaseKey(awardName)}`);
  let alreadyVoted = false;

  const result = await categoryRef.transaction(current => {
    const category = current && typeof current === "object" && !Array.isArray(current) ? current : {};
    const voters = category._voters && typeof category._voters === "object" && !Array.isArray(category._voters)
      ? category._voters
      : {};

    if (voters[voterKey]) {
      alreadyVoted = true;
      return;
    }

    for (const id of candidateKeys) {
      const count = category[id];
      category[id] = Number.isSafeInteger(count) && count >= 0 ? count + 1 : 1;
    }
    const participants = category._participants;
    category._participants = Number.isSafeInteger(participants) && participants >= 0 ? participants + 1 : 1;
    voters[voterKey] = true;
    category._voters = voters;
    return category;
  });

  return { accepted: result.committed, alreadyVoted: alreadyVoted || !result.committed };
});
