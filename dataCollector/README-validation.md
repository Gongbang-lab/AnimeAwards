# 배포 전 데이터 검사

프로젝트 루트의 `validate-data.cmd`를 **더블클릭**하면 검사합니다. Node.js 22 이상이 필요하며, 검사기를 위한 추가 패키지 설치는 필요 없습니다. 원본 데이터는 수정하지 않습니다.

## 터미널에서 실행

AnimeAwards 폴더에서 실행합니다. PowerShell, Git Bash 모두 아래 명령을 사용할 수 있습니다.

```sh
node dataCollector/dataValidator.js
```

또는:

```sh
npm run validate
```

PowerShell에서 `npm.ps1` 실행 정책 오류가 나오면 첫 번째 `node` 명령이나 `npm.cmd run validate`를 사용하세요.

기본 검사는 `data/manifest.js`의 `AvailableYears`에 등록된 **모든 공개 연도**를 대상으로 합니다. 현재는 2026년입니다. 새 연도를 공개 목록에 추가하면 그 연도의 12종 데이터도 자동 검사합니다. 모든 JS 파일은 공개 연도 여부와 관계없이 문법을 검사합니다.

공개 전 연도를 지정해서 검사할 수도 있습니다. 해당 연도 파일이 없으면 누락 오류가 나며 이전 연도 데이터로 대체하지 않습니다.

```sh
node dataCollector/dataValidator.js --year 2027
node dataCollector/dataValidator.js --year 2026,2027
```

작품 → 캐릭터 → 성우 연결만 빠르게 확인:

```sh
node dataCollector/dataRelationshipValidator.js 2026
```

## 결과 확인

검사할 때마다 다음 결과 파일을 새로 만듭니다.

- `reports/data-validation.md`: 사람이 읽는 전체 결과. 파일과 항목 위치가 표시됩니다.
- `reports/data-validation.json`: 도구에서 처리할 수 있는 전체 결과.
- 관계만 검사한 결과는 `reports/data-relationships.md`, `.json`에 저장됩니다.

`[9].songs[3].youtube`는 **10번째 작품의 4번째 곡**의 youtube 필드입니다. 배열 위치는 0부터 시작합니다. `ID 123.albums[0]`은 작품 ID 123의 첫 번째 앨범입니다.

| 구분 | 의미 | 검사 통과 여부 |
|---|---|---|
| 오류 / error | 문법·자료형·필수 연결·필수 파일·URL 형식 등의 문제 | 하나라도 있으면 실패 |
| 경고 / warning | 사진 미등록, 에피소드 제목 미등록 등 확인할 항목 | 경고만 있으면 통과 |
| 참고 / info | 사유가 등록된 파일 누락 예외 등 | 통과 |

종료 코드는 통과 `0`, 검사 오류 `1`, 잘못된 명령 옵션 `2`입니다. 결과 폴더는 Git에 올리지 않습니다.

## 검사 범위

- 연도별 데이터 12종의 파일·변수명·배열/객체 구조, 연도 값.
- 기본 작품 ID, 분기, 중복 작품·분기, 포스터.
- `(작품 ID, 캐릭터 ID)` 중복과 `cvId → 성우 id` 연결. 다른 작품에서 같은 캐릭터가 등장하는 것은 허용합니다.
- 곡·OST·각색·각본·에피소드의 작품 연결, OST 앨범·트랙 중복, 밈 ID 중복, 루키 점수 합계.
- 분기별로 별도 저장된 같은 작품의 OP/ED 항목과 빈 OP/ED 입력란은 허용합니다. 곡 분기가 불명확하면 경고합니다.
- 동일 회차에 서로 다른 제목을 둔 막/단편 구조와 빈 에피소드 제목은 경고합니다. 같은 회차·제목이 완전히 중복되면 오류입니다.
- 데이터의 로컬 이미지·밈 파일 존재 여부와 파일명 대소문자. Windows에서 열려도 GitHub Pages에서 깨질 수 있는 대소문자 차이를 확인합니다.
- JS 및 HTML 안의 인라인 JS 문법, 일반/연도별/수집기 지연 로딩 스크립트 경로, CSS 이미지 경로, 코드에 직접 적힌 주요 이미지 경로.
- 영상·PV·음원 링크의 http(s) URL 형식.

인터넷에 접속하지 않으므로 외부 이미지의 404 여부, 유튜브 재생 가능 여부, 저작권·번역 정확성은 확인하지 않습니다. 실행 중 조합되는 경로와 실제 화면·투표 동작은 브라우저에서 별도로 확인해야 합니다.

## 의도한 누락 처리

`dataCollector/validation-policy.json`에서 운영 방침을 관리합니다.

- `cvimg`, `director_img`의 비어 있지 않은 로컬 경로에 파일이 없는 경우 경고로 처리합니다. 사진 경로가 비어 있는 경우는 허용합니다.
- 이미 사용자가 허용한 OST 보조 이미지 `54863-2.webp`, `63011-2.webp`는 정확한 경로와 사유를 등록했습니다.
- 추가 예외가 꼭 필요하면 `missingAssets`에 정확한 `path`와 `reason`을 추가합니다. 폴더 전체를 무시하는 와일드카드는 지원하지 않습니다.
- 문법 오류·작품 연결 오류·URL 오류를 예외 파일로 숨길 수는 없습니다.

## GitHub에서 자동 실행

`.github/workflows/data-validation.yml`을 커밋해서 GitHub에 올리면:

1. `main`으로 push하거나 `main`을 대상으로 Pull Request를 만들거나 갱신할 때 자동 실행됩니다.
2. 검사기 자체 테스트 후 프로젝트 데이터를 검사합니다.
3. GitHub 저장소의 **Actions → Data validation → 해당 실행**에서 통과/실패와 요약을 확인합니다.
4. 실행 하단 **Artifacts → data-validation-report**에서 전체 결과를 내려받을 수 있습니다. 보고서는 14일 보관합니다.
5. 직접 실행하려면 **Actions → Data validation → Run workflow**를 누릅니다.

워크플로 파일을 로컬에 추가한 상태만으로 GitHub 검사가 시작되지는 않습니다. GitHub에 push해야 하며, 저장소에서 Actions 사용이 허용되어 있어야 합니다. 검사에 쓰기 권한이나 Firebase 인증 정보는 필요 없습니다.

**이 워크플로는 검사만 수행합니다. 현재 GitHub Pages의 배포 방식은 변경하지 않습니다.** Pages가 브랜치 기반 자동 배포라면 검사 실패만으로 배포가 중단되지 않습니다. 오류가 있으면 먼저 로컬에서 수정 후 push하세요. PR 병합을 막으려면 저장소의 브랜치 규칙에서 `Validate project data`를 필수 검사로 지정할 수 있습니다. 배포 자체를 막으려면 추후 Pages 배포 워크플로를 검사 작업에 의존하도록 연결해야 합니다.

## 검사기 자체 확인

```sh
node --test dataCollector/dataValidator.test.js
```

임시 데이터로 정상·오류·누락·대소문자·중복 관계·분기·HTML 로딩·명령 옵션을 확인하며, 프로젝트의 실제 데이터는 변경하지 않습니다.
