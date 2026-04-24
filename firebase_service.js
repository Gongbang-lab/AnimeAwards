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

// 3. 개별 페이지에서 호출할 공통 전송 함수
window.submitSingleAwardToDB = async function(awardName) {
  if (localStorage.getItem(`submitted_${awardName}`)) return;

  const savedData = JSON.parse(localStorage.getItem('anime_awards_result'));
  if (!savedData || !savedData[awardName]) return;

  const winnerData = savedData[awardName];

  if (Array.isArray(winnerData)) {
    await Promise.all(winnerData.map(item => {
      // ✅ sanitizeKey 제거 — 원본 title 그대로 저장
      const id = window.getWinnerIdentifier(item);
      const ref = window.fbRef(window.fbDB, `votes/categories/${awardName}/${id}`);
      return window.fbTransaction(ref, (current) => (current || 0) + 1);
    }));
  } else {
    // ✅ sanitizeKey 제거 — 원본 title 그대로 저장
    const id = window.getWinnerIdentifier(winnerData);
    const ref = window.fbRef(window.fbDB, `votes/categories/${awardName}/${id}`);
    await window.fbTransaction(ref, (current) => (current || 0) + 1);
  }

  const participantsRef = window.fbRef(window.fbDB, `votes/categories/${awardName}/_participants`);
  await window.fbTransaction(participantsRef, (current) => (current || 0) + 1);

  localStorage.setItem(`submitted_${awardName}`, 'true');
};