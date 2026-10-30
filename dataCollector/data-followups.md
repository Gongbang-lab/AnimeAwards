# 추후 확인할 데이터 연결 목록

확인일: 2026-10-30

사용자 요청에 따라 아래 항목은 이번 수정에서 제외하고 원본을 보존했습니다. 서로 다른 작품이나 시즌을 잘못 합치지 않도록 ID를 임의로 변경하거나 데이터를 삭제하지 않았습니다.

현재 검사 사유는 **기본 작품 목록 `data/2026/2026animeData.js`에 해당 ID가 없다는 것**입니다. 이미지가 없다는 판정과는 다릅니다. 아래 OST 4건은 현재 앨범 이미지 파일이 존재합니다.

| ID | 데이터에서 확인한 작품 단서 | 해당 파일 | 나중에 확인할 내용 |
|---|---|---|---|
| 63047 | 개진전 사무라이 트루퍼 · 3분기 | `2026animescriptwriterData.js`, `2026animeSongsData.js`, `2026animeEPData.js` | 기본 목록의 같은 제목은 ID 61830 사용. 분리된 시즌인지 확인 후 연결·중복 회차·중복 곡을 함께 정리 |
| 49469 | 에피소드 제13화~제24화가 저장됨 | `2026animeEPData.js` | 작품명 필드가 없으므로 원래 작품과 기본 목록의 연결 ID 확인 |
| 62568 | OST 유튜브 검색어: Dr. STONE: SCIENCE FUTURE Part 3 | `2026animeOSTData.js` | 기본 목록의 닥터 스톤 SCIENCE FUTURE는 ID 57592 사용. 파트 구분 확인 |
| 38716 | OST 유튜브 검색어: Kidou Senshi Gundam: Senkou no Hathaway - Circe no Majo | `2026animeOSTData.js` | 해당 극장판을 기본 목록에 등록할지 확인 |
| 59985 | OST 유튜브 검색어: Boku no Kokoro no Yabai Yatsu Movie | `2026animeOSTData.js` | 해당 극장판을 기본 목록에 등록할지 확인 |
| 59971 | OST 유튜브 검색어: Tensei Shitara Slime Datta Ken: Soukai no Namida-hen | `2026animeOSTData.js` | TV 4기와 극장판을 구분해 기본 목록 연결 확인 |

OST 작품 단서는 기존 트랙의 검색 URL에서 읽은 값이며 외부 서비스에서 새로 검증한 작품명은 아닙니다.

6개 ID가 8개 데이터 연결 오류로 집계됩니다. 검사기 예외를 추가해 숨기지는 않았으므로, 해결 전까지 자동 검사는 이 항목들을 계속 보고하고 실패 상태로 종료합니다. 전체 최신 결과는 프로젝트 루트의 `reports/data-validation.md`에서 확인할 수 있습니다.
