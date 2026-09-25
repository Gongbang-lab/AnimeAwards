# AnimeAwards

애니메이션 작품, 캐릭터, 성우, 제작진 등 여러 부문의 후보를 둘러보고 시상 시즌별 투표에 참여하는 웹 프로젝트입니다.

- 서비스: [AnimeAwards](https://gongbang-lab.github.io/AnimeAwards/)
- 저장소: [Gongbang-lab/AnimeAwards](https://github.com/Gongbang-lab/AnimeAwards)

## 주요 기능

- 연도와 분기를 선택해 시상 시즌별 후보를 확인합니다.
- 작품, 캐릭터, 베스트 커플, 성우, 감독, 각색가, 각본가, 스튜디오, 에피소드, 애니송, OST, 극장판, 루키, 밈 등 부문별 Nominate 페이지를 제공합니다.
- 후보를 고르고 저장한 결과는 브라우저 `localStorage`에 시즌별로 보관합니다.
- Firebase Realtime Database에서 부문별 투표 집계를 읽고, 후보 카드에 득표율과 선택 수를 번갈아 표시합니다.
- 제출은 Firebase 익명 인증과 Cloud Function을 사용합니다. 사용자가 로그인 양식을 거치지 않아도 익명 UID를 발급받아 투표하며, 같은 시즌·부문에서 같은 UID의 중복 제출은 서버 트랜잭션으로 막습니다.
- 서버는 신뢰된 후보 목록을 기준으로 시즌, 부문, 후보 ID를 확인한 뒤 집계합니다.

## 기술 구성

- 정적 프론트엔드: HTML, CSS, Vanilla JavaScript
- 데이터: `data/` 아래 연도별 JavaScript 데이터
- 결과 임시 저장: 브라우저 `localStorage` (`resultStorage.js`)
- 투표 집계: Firebase Realtime Database
- 익명 사용자 인증 및 투표 제출: Firebase Authentication, Cloud Functions for Firebase
- 후보 카탈로그 생성: `functions/scripts/build-vote-options.js`

## 저장소 구성

```text
.
├── index.html                  # 메인 화면
├── main.js / main.css          # 메인 화면 동작과 스타일
├── data/                       # 데이터, 시상 부문 설정, 연도별 후보 데이터
├── image/                      # 이미지 및 미디어
├── *Nominate/                  # 부문별 후보 선택 및 투표 화면
├── nominateCommon.js           # 공통 투표 표시 및 Nominate 기능
├── resultStorage.js            # 브라우저의 시즌별 선택 결과 저장
├── seasonFilter.js             # 시즌 필터
├── firebase_service.js         # Firebase 초기화, 익명 인증, 투표 제출 요청
├── database.rules.json         # Realtime Database 접근 규칙
└── functions/                  # 투표 검증 Cloud Function과 신뢰 후보 카탈로그 생성기
```

## 로컬에서 실행

`file://`로 직접 열기보다 로컬 HTTP 서버를 실행하세요. Firebase 모듈과 인증 흐름은 HTTP 서버에서 확인하는 것이 좋습니다.

```bash
git clone https://github.com/Gongbang-lab/AnimeAwards.git
cd AnimeAwards
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 엽니다. Python이 없다면 다른 정적 파일 서버를 사용할 수 있습니다.

## Firebase 설정 및 배포

투표 제출 기능을 운영하려면 아래 Firebase 설정이 갖춰져야 합니다.

1. `.firebaserc`의 프로젝트 ID와 `firebase_service.js`의 Firebase 설정이 사용할 Firebase 프로젝트를 가리키는지 확인합니다.
2. Firebase Console에서 **Authentication의 익명 로그인 공급자**를 활성화합니다.
3. Cloud Functions 배포를 위해 Firebase 프로젝트의 요금제가 요구 조건을 충족하는지 확인합니다. Cloud Functions 배포에는 Blaze 요금제가 필요합니다.
4. Node.js 22와 Firebase CLI를 준비하고 Firebase 계정으로 로그인합니다.
5. 프로젝트 루트에서 다음 명령을 실행합니다.

```bash
firebase deploy --only functions,database
```

배포 과정에서 `firebase.json`의 predeploy 작업이 `functions/vote-options.json` 후보 카탈로그를 현재 `data/manifest.js`, `data/awardData.js`, 연도별 데이터에 맞춰 다시 생성합니다. 함수와 Database Rules는 함께 배포해야 합니다.

- Rules는 투표 데이터 읽기를 허용하고 클라이언트 직접 쓰기를 거부합니다.
- 집계 변경은 Admin SDK 권한으로 Cloud Function에서만 수행합니다.
- 익명 UID 기반 중복 방지는 함수와 새 Rules 배포 이후 제출부터 적용됩니다. 기존 집계에는 과거 사용자 식별 정보가 없어 이전 투표를 소급해 중복 제거할 수 없습니다.
- 익명 투표는 로그인 절차를 없애지만, 브라우저 데이터 삭제나 다른 기기 사용으로 새 익명 UID를 만들 수 있습니다. 따라서 한 사람이 여러 기기/브라우저를 쓰는 것까지 완전히 차단하지는 않습니다.
- 클라이언트만 배포하면 투표 제출 함수가 없거나 Rules 설정이 맞지 않아 제출이 실패할 수 있습니다.

## 데이터 및 투표 동작 참고

- 시즌 키는 `연도_분기` 형식입니다. 예: `2026_1분기`, `2026_모든 분기`.
- 사용자가 선택한 결과는 브라우저에 저장되고, 최종 제출 때 해당 결과를 Cloud Function으로 전달합니다.
- 집계 경로는 `votes/categories/{seasonKey}/{awardName}`입니다. 후보별 표와 참여 수가 저장되며, `_voters`에는 중복 제출 확인용 해시 영수증이 기록됩니다.
- 후보 카탈로그에 포함되지 않은 시즌, 부문 또는 후보 ID는 Cloud Function이 거부합니다. 새로운 연도나 부문을 추가할 때는 데이터와 시상 설정을 업데이트한 뒤 후보 카탈로그를 다시 생성하고 배포하세요.
- 브라우저에 포함된 Firebase 설정은 클라이언트 식별용입니다. 데이터 보호는 Authentication, Cloud Function 검증, Realtime Database Rules에 의존합니다.

## 라이선스

[MIT License](./LICENSE)
