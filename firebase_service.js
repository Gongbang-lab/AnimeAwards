// firebase_service.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

// [주의] 본인의 파이어베이스 설정값으로 변경하세요
const firebaseConfig = {
  apiKey: "AIzaSyDOlykUCpXEaIxXTeAyNFn0543kTpz5h1U",
  authDomain: "animeaward-2c0b9.firebaseapp.com",
  projectId: "animeaward-2c0b9",
  storageBucket: "animeaward-2c0b9.firebasestorage.app",
  messagingSenderId: "163140332642",
  appId: "1:163140332642:web:9943146886109fbf71353b",
  measurementId: "G-YCVLEXHVBE",
  databaseURL: "https://animeaward-2c0b9-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// 1. Firebase 초기화 및 전역 변수 등록
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const functions = getFunctions(app);
const submitVoteCallable = httpsCallable(functions, "submitVote");

window.fbDB = db;
window.fbRef = ref;
window.fbTransaction = runTransaction;
window.fbOnValue = onValue;

// 사용자 화면에 로그인 절차를 노출하지 않고 익명 UID를 확보한다.
const anonymousUserReady = new Promise((resolve, reject) => {
  let unsubscribe = () => {};
  unsubscribe = onAuthStateChanged(auth, user => {
    unsubscribe();
    if (user) {
      resolve(user);
      return;
    }
    signInAnonymously(auth).then(result => resolve(result.user), reject);
  }, error => {
    unsubscribe();
    reject(error);
  });
});
anonymousUserReady.catch(err => console.error("익명 인증 실패:", err));

// 2. 데이터 식별 및 정제 유틸 함수
window.sanitizeKey = function(key) {
  const value = String(key ?? "");
  if (!/[.#$/\[\]\u0000-\u001f\u007f]/.test(value)) return value;
  return `b64_${new TextEncoder().encode(value).reduce((binary, byte) => binary + String.fromCharCode(byte), "")}`;
};

// 데이터에 Firebase에서 금지하는 문자가 있을 때만 충돌 가능성이 낮은 안전 키로 변환한다.
window.getVoteCandidateKey = function(value) {
  const text = String(value ?? "");
  if (!/[.#$/\[\]\u0000-\u001f\u007f]/.test(text)) return text;
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return `b64_${btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")}`;
};

window.getWinnerIdentifier = function(awardData) {
  return awardData.title || awardData.name || (awardData.name1 && awardData.name2 ? `${awardData.name1}_${awardData.name2}` : "unknown");
};

// ✅ [신규] 시즌(연도+분기) 키 생성 — 모든 Firebase 경로에서 이걸 통해서만 시즌을 조합
window.getSeasonPathKey = function() {
  const year = localStorage.getItem("selected_year") || "unknown";
  const quarter = localStorage.getItem("selected_quarter") || "unknown";
  return `${year}_${quarter}`;
};

// ✅ [신규] 특정 상(awardName)의 투표 카테고리 경로를 만드는 공통 함수
// 각 nominate.js의 listenToVoteRates()에서 이 함수로 경로를 통일해서 씀
window.getVotesCategoryPath = function(awardName) {
  return `votes/categories/${window.getSeasonPathKey()}/${window.getVoteCandidateKey(awardName)}`;
};

// 3. 결과 저장소에서 선택한 후보를 읽고 서버 함수에 익명 UID와 함께 제출한다.
window.submitSingleAwardToDB = async function(awardName) {
  try {
    if (typeof awardName !== "string" || !awardName.trim()) return { ok: false, reason: "invalid-award" };
    const seasonKey = window.getSeasonPathKey();
    const savedData = window.ResultStorage ? window.ResultStorage.getResults() : null;
    if (!savedData) return { ok: false, reason: "missing-results" };

    let winnerData = savedData[awardName];
    // 일반 Nominate 페이지가 저장하는 TOP3 rank 결과도 기존 저장 형식 그대로 읽는다.
    if (!winnerData && ["대상", "최우수상", "우수상"].includes(awardName)) {
      winnerData = (savedData["올해의 애니메이션"] || []).find(item => item.rank === awardName);
    }
    if (!winnerData) return { ok: false, reason: "missing-winner" };

    const winners = Array.isArray(winnerData) ? winnerData : [winnerData];
    const candidateIds = winners.map(window.getWinnerIdentifier);
    if (candidateIds.some(id => typeof id !== "string" || !id.trim())) {
      return { ok: false, reason: "invalid-candidate" };
    }

    await anonymousUserReady;
    const response = await submitVoteCallable({ seasonKey, awardName, candidateIds });
    if (response.data?.alreadyVoted) {
      console.info(`[Firebase] 이 익명 계정은 ${awardName}에 이미 제출했습니다.`);
      return { ok: true, alreadyVoted: true };
    }
    return { ok: true, alreadyVoted: false };
  } catch (error) {
    console.error("Firebase 투표 제출 실패:", error);
    return { ok: false, error };
  }
};
