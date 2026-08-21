// firebase_service.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

window.fbDB = db;
window.fbRef = ref;
window.fbTransaction = runTransaction;
window.fbOnValue = onValue;

// 익명 로그인 실행 (투표 권한 부여)
signInAnonymously(auth).catch(err => console.error("인증 실패:", err));

// 2. 데이터 식별 및 정제 유틸 함수
window.sanitizeKey = function(key) {
  return key.replace(/[.#$[\]]/g, "_");
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
  return `votes/categories/${window.getSeasonPathKey()}/${awardName}`;
};

// 3. 개별 페이지에서 호출할 공통 전송 함수
window.submitSingleAwardToDB = async function(awardName) {
  const seasonKey = window.getSeasonPathKey();
  const submittedFlagKey = `submitted_${seasonKey}_${awardName}`;   // ← 시즌별로 분리

  if (localStorage.getItem(submittedFlagKey)) return;

  // ✅ 시즌별로 분리 저장된 결과를 ResultStorage에서 읽음
  const savedData = window.ResultStorage ? window.ResultStorage.getResults() : null;
  if (!savedData || !savedData[awardName]) return;

  const winnerData = savedData[awardName];
  const basePath = window.getVotesCategoryPath(awardName);   // ← 시즌 포함 경로

  if (Array.isArray(winnerData)) {
    await Promise.all(winnerData.map(item => {
      const id = window.getWinnerIdentifier(item);
      const ref = window.fbRef(window.fbDB, `${basePath}/${id}`);
      return window.fbTransaction(ref, (current) => (current || 0) + 1);
    }));
  } else {
    const id = window.getWinnerIdentifier(winnerData);
    const ref = window.fbRef(window.fbDB, `${basePath}/${id}`);
    await window.fbTransaction(ref, (current) => (current || 0) + 1);
  }

  const participantsRef = window.fbRef(window.fbDB, `${basePath}/_participants`);
  await window.fbTransaction(participantsRef, (current) => (current || 0) + 1);

  localStorage.setItem(submittedFlagKey, 'true');
};