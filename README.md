# 🏆 AnimeAwards

애니메이션 시상식 후보 추천 및 투표 사이트입니다.  
다양한 부문에서 해당 연도 최고의 애니메이션 작품, 캐릭터, 성우 등을 추천하고 투표할 수 있습니다.

🔗 **배포 사이트**: [https://gongbang-lab.github.io/AnimeAwards/](https://gongbang-lab.github.io/AnimeAwards/)

---

## 📺 주요 기능

- **작품 부문**: 올해의 TOP 3 애니메이션, 극장판 추천
- **캐릭터 부문**: 최고의 캐릭터, 베스트 커플 추천
- **스태프 부문**: 감독, 스튜디오, 각색가 추천
- **성우 부문**: 올해의 성우 추천
- **에피소드 부문**: 올해의 명장면 에피소드 추천
- **음악 부문**: 올해의 애니송 추천
- **신인 부문**: 올해의 루키 추천
- **기타 부문**: 올해의 밈, 오리지널 작품 추천

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| 마크업 | HTML5 |
| 스타일 | CSS3 |
| 스크립트 | JavaScript (Vanilla JS) |

---

## 📁 폴더 구조

```
AnimeAwards/
├── index.html              # 메인 페이지
├── main.css                # 전역 스타일
├── main.js                 # 전역 스크립트
├── data/                   # 데이터 파일
├── dataCollector/          # 데이터 수집 스크립트
├── image/                  # 이미지 리소스
├── nominate/               # 추천 공통 모듈
├── top3Nominate/           # TOP 3 작품 부문
├── charNominate/           # 캐릭터 부문
├── bestCoupleNominate/     # 베스트 커플 부문
├── cvNominate/             # 성우 부문
├── directorNominate/       # 감독 부문
├── studioNominate/         # 스튜디오 부문
├── adaptorNominate/        # 각색가 부문
├── episodeNominate/        # 에피소드 부문
├── songNominate/           # 애니송 부문
├── rookieNominate/         # 신인 부문
├── originalNominate/       # 오리지널 작품 부문
├── memeNominate/           # 밈 부문
└── cinemaNominate/         # 극장판 부문
```

---

## 🚀 시작하기

별도의 설치 없이 `index.html`을 브라우저에서 열어 바로 실행할 수 있습니다.

```bash
# 저장소 클론
git clone https://github.com/Gongbang-lab/AnimeAwards.git

# 폴더 진입 후 index.html을 브라우저로 열기
cd AnimeAwards
open index.html  # macOS
start index.html # Windows
```

---

## 📄 라이선스

이 프로젝트는 [MIT License](./LICENSE) 하에 배포됩니다.