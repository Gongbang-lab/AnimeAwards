// 모든 애니메이션 리스트 (분기 정보 포함)
const AnimeList = [
  {
    "id": 61886,
    "quarter": "1분기",
    "title": "고문 아르바이트의 일상",
    "thumbnail": "image/animeimg/Q1/고문_아르바이트의_일상.webp",
    "day": "Mondays",
    "episodes": 12,
    "studio": "디오미디어",
    "staff": {
      "director": ["오이자키 후미토시"],
      "character_design": ["시부야 사카에"],
      "adaptor": ["아마미야 히토미"]
    }
  },
  {
    "id": 61942,
    "quarter": "1분기",
    "title": "비질랜티 -나의 히어로 아카데미아 ILLEGALS- 제2기",
    "thumbnail": "image/animeimg/Q1/비질랜티 -나의 히어로 아카데미아 ILLEGALS- 제2기.webp",
    "day": "Mondays",
    "episodes": 13,
    "studio": "본즈 필름",
    "staff": {
      "director": ["스즈키 켄이치"],
      "character_design": ["요시다 타카히코"],
      "adaptor": ["쿠로다 요스케"]
    }
  },
  {
    "id": 61782,
    "quarter": "1분기",
    "title": "깨끗하게 해주시겠어요?",
    "thumbnail": "image/animeimg/Q1/깨끗하게 해주시겠어요.webp",
    "day": "Mondays",
    "episodes": 0,
    "studio": "오쿠루토 노보루",
    "staff": {
      "director": ["오오니시 켄타"],
      "character_design": ["토자와 아즈마", "야마우치 다이스케(서브)", "미야자키 사토미(서브)"],
      "adaptor": ["마치다 토코"]
    }
  },
  {
    "id": 55772,
    "quarter": "1분기",
    "title": "골든 카무이 최종장",
    "thumbnail": "image/animeimg/Q1/골든 카무이 최종장.webp",
    "day": "Mondays",
    "episodes": 13,
    "studio": "브레인즈 베이스",
    "staff": {
      "director": ["스가하라 시즈타카"],
      "character_design": ["야마카와 타쿠미"],
      "adaptor": ["타카기 노보루"]
    }
  },
  {
    "id": 58524,
    "quarter": "1분기",
    "title": "공주님 \"고문\"의 시간입니다 2기",
    "thumbnail": "image/animeimg/Q1/공주님 고문의 시간입니다 2기.webp",
    "day": "Mondays",
    "episodes": 0,
    "studio": "PINE JAM",
    "staff": {
      "director": ["카나모리 요코"],
      "character_design": ["코노 토시야", "타키야마 마사아키(서브)", "나츠키 히로시(서브)"],
      "adaptor": ["오오치 케이이치로"]
    }
  },
  {
    "id": 61359,
    "quarter": "1분기",
    "title": "소꿉친구와는 러브 코미디를 할 수 없어",
    "thumbnail": "image/animeimg/Q1/소꿉친구와는 러브 코미디를 할 수 없어.webp",
    "day": "Tuesdays",
    "episodes": 12,
    "studio": "데즈카 프로덕션",
    "staff": {
      "director": ["쿠와바라 사토시"],
      "character_design": ["이와사키 레이나"],
      "adaptor": ["히로타 미츠타카"]
    }
  },
  {
    "id": 61983,
    "quarter": "1분기",
    "title": "용사 파티에 귀여운 애가 있어서, 고백해봤다.",
    "thumbnail": "image/animeimg/Q1/용사 파티에 귀여운 애가 있어서, 고백해봤다..webp",
    "day": "Tuesdays",
    "episodes": 13,
    "studio": "겟코",
    "staff": {
      "director": ["미네 토모노리", "야마모토 야스타카(총)"],
      "character_design": ["오오사와 미나", "사토 코노미(서브)", "이와사키 카나(서브)"],
      "adaptor": ["스가와라 유키에"]
    }
  },
  {
    "id": 60226,
    "quarter": "1분기",
    "title": "이세계 사정은 사축 하기 나름",
    "thumbnail": "image/animeimg/Q1/이세계 사정은 사축 하기 나름.webp",
    "day": "Tuesdays",
    "episodes": 12,
    "studio": "스튜디오 딘",
    "staff": {
      "director": ["이시히라 신지"],
      "character_design": ["후지이 마키", "쿠보 미츠키(서브)", "마츠이 세이카(서브)"],
      "adaptor": ["나카무라 요시코"]
    }
  },
  {
    "id": 61211,
    "quarter": "1분기",
    "title": "한밤중 하트튠",
    "thumbnail": "image/animeimg/Q1/한밤중 하트튠.webp",
    "day": "Tuesdays",
    "episodes": 12,
    "studio": "겟코",
    "staff": {
      "director": ["타카하시 마사유키"],
      "character_design": ["시타야 토모유키", "소메야 유리카(서브)", "키쿠치 아키히로(서브)", "미키오(서브)", "호무라 미노리(서브)"],
      "adaptor": ["스가와라 유키에"]
    }
  },
  {
    "id": 61830,
    "quarter": "1분기",
    "title": "개진전 사무라이 트루퍼",
    "thumbnail": "image/animeimg/Q1/개진전 사무라이 트루퍼.webp",
    "day": "Tuesdays",
    "episodes": 12,
    "studio": "선라이즈",
    "staff": {
      "director": ["후지타 요이치"],
      "character_design": ["코토부키 츠카사", "무로타 유헤이"],
      "scriptwriter": ["무토 쇼고"]
    }
  },
  {
    "id": 58886,
    "quarter": "1분기",
    "title": "다윈 사변",
    "thumbnail": "image/animeimg/Q1/다윈 사변.webp",
    "day": "Wednesdays",
    "episodes": 0,
    "studio": "벨녹스 필름스",
    "staff": {
      "director": ["츠다 나오카츠"],
      "character_design": ["토모오카 신페이"],
      "adaptor": ["이노즈메 신이치"]
    }
  },
  {
    "id": 61637,
    "quarter": "1분기",
    "title": "29세 독신 중견 모험가의 일상",
    "thumbnail": "image/animeimg/Q1/독신 중견 모험가의 일상.webp",
    "day": "Wednesdays",
    "episodes": 12,
    "studio": "HORNETS",
    "staff": {
      "director": ["후쿠시마 토시노리"],
      "character_design": ["나가모리 요시히로", "타나카 미노루(서브)"],
      "adaptor": ["후쿠시마 토시노리"]
    }
  },
  {
    "id": 60255,
    "quarter": "1분기",
    "title": "아르네의 사건부",
    "thumbnail": "image/animeimg/Q1/아르네의 사건부.webp",
    "day": "Wednesdays",
    "episodes": 12,
    "studio": "SILVER LINK.",
    "staff": {
      "director": ["이노우에 케이스케"],
      "character_design": ["사토 아키코", "미요시 유리(서브)"],
      "adaptor": ["이노우에 케이스케", "무라사키"]
    }
  },
  {
    "id": 61884,
    "quarter": "1분기",
    "title": "마왕의 딸은 너무 친절해!!",
    "thumbnail": "image/animeimg/Q1/마왕의 딸은 너무 친절해.webp",
    "day": "Wednesdays",
    "episodes": 12,
    "studio": "EMT 스퀘어드",
    "staff": {
      "director": ["오오타 마사히코"],
      "character_design": ["나카노 유키", "우에다 에리(서브)"],
      "adaptor": ["아오시마 타카시"]
    }
  },
  {
    "id": 60058,
    "quarter": "1분기",
    "title": "【최애의 아이】 3기",
    "thumbnail": "image/animeimg/Q1/【최애의 아이】 3기.webp",
    "day": "Wednesdays",
    "episodes": 11,
    "studio": "동화공방",
    "staff": {
      "director": ["히라마키 다이스케"],
      "character_design": ["히라야마 칸나", "와타나베 사토미(서브)", "요코야마 호노카(서브)", "사와이 슌(서브)"],
      "adaptor": ["타나카 진"]
    }
  },
  {
    "id": 59711,
    "quarter": "1분기",
    "title": "사망 유희로 밥을 먹는다.",
    "thumbnail": "image/animeimg/Q1/사망 유희로 밥을 먹는다..webp",
    "day": "Wednesdays",
    "episodes": 11,
    "studio": "스튜디오 딘",
    "staff": {
      "director": ["우에노 소타"],
      "character_design": ["오사다 에리", "오오츠카 케이카(서브)", "코마츠 쇼타(서브)"],
      "adaptor": ["이케다 린타로"]
    }
  },
  {
    "id": 60692,
    "quarter": "1분기",
    "title": "귀족 전생 ~축복받은 태생으로 최강의 힘을 손에 넣다~",
    "thumbnail": "image/animeimg/Q1/귀족 전생.webp",
    "day": "Thursdays",
    "episodes": 0,
    "studio": "CompTown",
    "staff": {
      "director": ["후쿠다 미치오"],
      "character_design": ["카와시마 나오", "니시하타 아유미", "혼다 에미(서브)", "나카조노 히토시(서브)", "야스다 코헤이(서브)"],
      "adaptor": ["사토 토시아키"]
    }
  },
  {
    "id": 60071,
    "quarter": "1분기",
    "title": "온화한 귀족의 휴가의 권장",
    "thumbnail": "image/animeimg/Q1/온화한 귀족의 휴가의 권장.webp",
    "day": "Thursdays",
    "episodes": 0,
    "studio": "SynergySP",
    "staff": {
      "director": ["노다 켄타"],
      "character_design": ["후지와라 아키토"],
      "adaptor": ["스즈키 요스케"]
    }
  },
  {
    "id": 56752,
    "quarter": "1분기",
    "title": "시광대리인 -Link Click- 영도편",
    "thumbnail": "image/animeimg/Q1/시광대리인 -Link Click- 영도편.webp",
    "day": "Thursdays",
    "episodes": 6,
    "studio": "Studio LAN",
    "staff": {
      "director": ["리하오링"],
      "character_design": ["INPLICK"],
      "scriptwriter": ["리하오링"]
    }
  },
  {
    "id": 56009,
    "quarter": "1분기",
    "title": "용사형에 처함",
    "thumbnail": "image/animeimg/Q1/용사형에 처함.webp",
    "day": "Thursdays",
    "episodes": 12,
    "studio": "스튜디오 KAI",
    "staff": {
      "director": ["타카시마 히로유키"],
      "character_design": ["노다 타케루"],
      "adaptor": ["이하라 켄타"]
    }
  },
  {
    "id": 58505,
    "quarter": "1분기",
    "title": "마도정병의 슬레이브 2기",
    "thumbnail": "image/animeimg/Q1/마도정병의 슬레이브 2기.webp",
    "day": "Thursdays",
    "episodes": 12,
    "studio": "팟쇼네",
    "staff": {
      "director": ["타무라 마사후미"],
      "character_design": ["나카노 케이야"],
      "adaptor": ["나카니시 야스히로"]
    }
  },
  {
    "id": 60395,
    "quarter": "1분기",
    "title": "투명남과 인간녀 ~곧 부부가 될 두 사람~",
    "thumbnail": "image/animeimg/Q1/투명남과 인간녀 ~곧 부부가 될 두 사람~.webp",
    "day": "Thursdays",
    "episodes": 12,
    "studio": "Project No.9",
    "staff": {
      "director": ["세타 미츠호"],
      "character_design": ["우나바라 카이리", "맥파이 아카네(서브)"],
      "adaptor": ["세타 미츠호"]
    }
  },
  {
    "id": 60151,
    "quarter": "1분기",
    "title": "에리스의 성배",
    "thumbnail": "image/animeimg/Q1/에리스의 성배.webp",
    "day": "Thursdays",
    "episodes": 0,
    "studio": "아시 프로덕션",
    "staff": {
      "director": ["모리타와 준페이"],
      "character_design": ["카와구치 치에", "유카와 준(서브)"],
      "adaptor": ["야마시타 켄이치"]
    }
  },
  {
    "id": 57658,
    "quarter": "1분기",
    "title": "주술회전 3기",
    "thumbnail": "image/animeimg/Q1/주술회전 3기.webp",
    "day": "Fridays",
    "episodes": 12,
    "studio": "MAPPA",
    "staff": {
      "director": ["고쇼조노 쇼타"],
      "character_design": ["야지마 요스케", "니와 히로미", "오쿠다 텟페이(주령)", "미타니 타카후미(주령)"],
      "adaptor": ["세코 히로시"]
    }
  },
  {
    "id": 61587,
    "quarter": "1분기",
    "title": "\"너 따위가 마왕을 이길 수 있다고 생각하지 마\"라며 용사 파티에서 추방되었으니 왕도에서 멋대로 살고 싶다",
    "thumbnail": "image/animeimg/Q1/용사 파티에서 추방되었으니.webp",
    "day": "Fridays",
    "episodes": 12,
    "studio": "A.C.G.T.",
    "staff": {
      "director": ["카마나카 노부하루"],
      "character_design": ["마츠모토 미키", "마츠모토 후미오", "후쿠요 타카아키", "후루사와 타카후미"],
      "adaptor": ["쿠니사와 마리코"]
    }
  },
  {
    "id": 61325,
    "quarter": "1분기",
    "title": "어차피, 사랑하고 만다. 2기",
    "thumbnail": "image/animeimg/Q1/어차피, 사랑하고 만다. 2기.webp",
    "day": "Fridays",
    "episodes": 12,
    "studio": "타이푼 그래픽스",
    "staff": {
      "director": ["야마모토 준이치"],
      "character_design": ["시이바 이오", "히라타 카츠조(서브)", "오쿠야마 스즈나(서브)"],
      "adaptor": ["무라이 유우"]
    }
  },
  {
    "id": 60509,
    "quarter": "1분기",
    "title": "샹피뇽의 마녀",
    "thumbnail": "image/animeimg/Q1/샹피뇽의 마녀.webp",
    "day": "Fridays",
    "episodes": 0,
    "studio": "타이푼 그래픽스",
    "staff": {
      "director": ["쿠보 요스케"],
      "character_design": ["마츠모토 미키"],
      "adaptor": ["카키하라 유코"]
    }
  },
  {
    "id": 59978,
    "quarter": "1분기",
    "title": "장송의 프리렌 2기",
    "thumbnail": "image/animeimg/Q1/장송의 프리렌 2기.webp",
    "day": "Fridays",
    "episodes": 10,
    "studio": "매드하우스",
    "staff": {
      "director": ["키타가와 토모야"],
      "character_design": ["타카세 마루", "코지마 케이스케", "후지나카 유리"],
      "adaptor": ["스즈키 토모히로"]
    }
  },
  {
    "id": 62804,
    "quarter": "1분기",
    "title": "하이스쿨! 기면조",
    "thumbnail": "image/animeimg/Q1/하이스쿨!_기면조.webp",
    "day": "Fridays",
    "episodes": 12,
    "studio": "주식회사 세븐",
    "staff": {
      "director": ["세키 카즈아키"],
      "character_design": ["아베 유카"],
      "adaptor": ["무라코시 시게루"]
    }
  },
  {
    "id": 59853,
    "quarter": "1분기",
    "title": "DARK MOON: 달의 제단",
    "thumbnail": "image/animeimg/Q1/DARK MOON.webp",
    "day": "Saturdays",
    "episodes": 12,
    "studio": "TROYCA",
    "staff": {
      "director": ["시가 쇼코"],
      "character_design": ["이노마타 마사미"],
      "adaptor": ["마치다 토코"]
    }
  },
  {
    "id": 60460,
    "quarter": "1분기",
    "title": "헬 모드 ~파고들기 좋아하는 게이머는 폐급 설정 이세계에서 무쌍한다~",
    "thumbnail": "image/animeimg/Q1/헬 모드.webp",
    "day": "Saturdays",
    "episodes": 12,
    "studio": "요코하마 애니메이션 랩",
    "staff": {
      "director": ["타마가와 마코토"],
      "character_design": ["츠시마 케이", "시키베 미요코(서브)", "이츠보 유나(서브)"],
      "adaptor": ["타니무라 다이시로"]
    }
  },
  {
    "id": 59229,
    "quarter": "1분기",
    "title": "불꽃 소방대 3장",
    "thumbnail": "image/animeimg/Q1/불꽃 소방대 3장.webp",
    "day": "Saturdays",
    "episodes": 13,
    "studio": "David Production",
    "staff": {
      "director": ["미나미카와 타츠마"],
      "character_design": ["모리오카 히데유키", "야마모토 미카(서브)"],
      "adaptor": ["츠구타 세이"]
    }
  },
  {
    "id": 61207,
    "quarter": "1분기",
    "title": "전생했더니 드래곤의 알이었다 ~최강이 아니면 목표로 하지 않아~",
    "thumbnail": "image/animeimg/Q1/전생했더니 드래곤의 알이었다.webp",
    "day": "Saturdays",
    "episodes": 0,
    "studio": "Felix Film",
    "staff": {
      "director": ["타카무라 유타"],
      "character_design": ["오노다 마사토", "야마자키 카오리"],
      "adaptor": ["우라하타 타츠히코"]
    }
  },
  {
    "id": 61549,
    "quarter": "1분기",
    "title": "무사태평 영주의 즐거운 영지 방어 ~생산계 마법으로 이름 없는 마을을 최강의 성채 도시로~",
    "thumbnail": "image/animeimg/Q1/무사태평 영주의 즐거운 영지 방어.webp",
    "day": "Saturdays",
    "episodes": 0,
    "studio": "NAZ",
    "staff": {
      "director": ["타타미타니 테츠야", "쿠리야마 타카유키"],
      "character_design": ["나카무라 신고"],
      "adaptor": ["쿠리야마 타카유키"]
    }
  },
  {
    "id": 54863,
    "quarter": "1분기",
    "title": "트라이건 스타게이즈",
    "thumbnail": "image/animeimg/Q1/트라이건 스타게이즈.webp",
    "day": "Saturdays",
    "episodes": 12,
    "studio": "오렌지",
    "staff": {
      "director": ["사토 마사코"],
      "character_design": ["오시야마 키요타카", "야나세 타카유키(메카)", "카타가이 후미히로(메카)"],
      "adaptor": ["후데야스 카즈유키"]
    }
  },
  {
    "id": 55830,
    "quarter": "1분기",
    "title": "Fate/strange Fake",
    "thumbnail": "image/animeimg/Q1/Fate strange Fake.webp",
    "day": "Saturdays",
    "episodes": 13,
    "studio": "A-1 Pictures",
    "staff": {
      "director": ["에노키도 슌", "사카즈메 타카히토"],
      "character_design": ["야마다 유케이", "타키야마 마사아키", "아이네 코우", "하마 유리에", "오카자키 오카"],
      "adaptor": ["오오히가시 다이스케"]
    }
  },
  {
    "id": 61196,
    "quarter": "1분기",
    "title": "데드 어카운트",
    "thumbnail": "image/animeimg/Q1/데드 어카운트.webp",
    "day": "Saturdays",
    "episodes": 12,
    "studio": "SynergySP",
    "staff": {
      "director": ["사이토 케이야"],
      "character_design": ["후쿠이 마키", "후나미치 아이코"],
      "adaptor": ["히로타 미츠타카"]
    }
  },
  {
    "id": 62432,
    "quarter": "1분기",
    "title": "인외 교실의 인간 혐오 교사",
    "thumbnail": "image/animeimg/Q1/인외 교실의 인간 혐오 교사.webp",
    "day": "Sundays",
    "episodes": 13,
    "studio": "아스리드",
    "staff": {
      "director": ["이와나가 아키라"],
      "character_design": ["오카다 마이코", "히라야마 히데츠구(서브)", "와타나베 카나코(서브)", "코지마 치카(서브)"],
      "adaptor": ["타카야마 카츠히코"]
    }
  },
  {
    "id": 61217,
    "quarter": "1분기",
    "title": "쓰레기 용사",
    "thumbnail": "image/animeimg/Q1/쓰레기 용사.webp",
    "day": "Sundays",
    "episodes": 24,
    "studio": "OLM",
    "staff": {
      "director": ["우시로 신지"],
      "character_design": ["무라카미 리카"],
      "adaptor": ["카토 요이치"]
    }
  },
  {
    "id": 59047,
    "quarter": "1분기",
    "title": "타몬 군 지금 어느 쪽!?",
    "thumbnail": "image/animeimg/Q1/타몬 군 지금 어느 쪽.webp",
    "day": "Sundays",
    "episodes": 13,
    "studio": "J.C.Staff",
    "staff": {
      "director": ["나가오카 치카"],
      "character_design": ["이토 요코"],
      "adaptor": ["나가이 치아키"]
    }
  },
  {
    "id": 61335,
    "quarter": "1분기",
    "title": "메달리스트 2기",
    "thumbnail": "image/animeimg/Q1/메달리스트 2기.webp",
    "day": "Sundays",
    "episodes": 9,
    "studio": "ENGI",
    "staff": {
      "director": ["야마모토 야스타카"],
      "character_design": ["카메야마 치나츠"],
      "adaptor": ["하나다 줏키"]
    }
  },
  {
    "id": 61663,
    "quarter": "1분기",
    "title": "아름다운 초저녁달",
    "thumbnail": "image/animeimg/Q1/아름다운 초저녁달.webp",
    "day": "Sundays",
    "episodes": 0,
    "studio": "이스트 피쉬 스튜디오",
    "staff": {
      "director": ["마루야마 유스케"],
      "character_design": ["후쿠다 히로키", "히구치 안리(서브)"],
      "adaptor": ["히사오 아유무"]
    }
  },
  {
    "id": 60371,
    "quarter": "1분기",
    "title": "정반대의 너와 나",
    "thumbnail": "image/animeimg/Q1/정반대의 너와 나.webp",
    "day": "Sundays",
    "episodes": 12,
    "studio": "라판트랙",
    "staff": {
      "director": ["나가토모 타카요시"],
      "character_design": ["미야코 마코", "코조노 나호(서브)"],
      "adaptor": ["우츠미 테루코"]
    }
  },
  {
    "id": 60223,
    "quarter": "1분기",
    "title": "카야는 무섭지 않아",
    "thumbnail": "image/animeimg/Q1/카야는 무섭지 않아.webp",
    "day": "Sundays",
    "episodes": 12,
    "studio": "이스트 피쉬 스튜디오",
    "staff": {
      "director": ["히로시 이케하타"],
      "character_design": ["야마다 타로", "모리구치 히로유키", "우치노 아키오(요괴)"],
      "adaptor": ["무라코시 시게루"]
    }
  },
  {
    "id": 58861,
    "quarter": "1분기",
    "title": "아름다운 그대에게",
    "thumbnail": "image/animeimg/Q1/아름다운 그대에게.webp",
    "day": "Sundays",
    "episodes": 12,
    "studio": "Signal.MD",
    "staff": {
      "director": ["타케무라 나츠키"],
      "character_design": ["스 시이"],
      "adaptor": ["요시오카 타카오"]
    }
  },
  {
    "id": 60810,
    "quarter": "1분기",
    "title": "마술사 쿠논은 보인다",
    "thumbnail": "image/animeimg/Q1/마술사 쿠논은 보인다.webp",
    "day": "Sundays",
    "episodes": 0,
    "studio": "플래티넘 비전",
    "staff": {
      "director": ["오오바 히데아키"],
      "character_design": ["사토 요코", "코바야시 토시미츠"],
      "adaptor": ["에나츠 유키"]
    }
  },
  {
    "id": 61128,
    "quarter": "1분기",
    "title": "용사 파티에서 쫓겨난 다재무능",
    "thumbnail": "image/animeimg/Q1/용사 파티에서 쫓겨난 다재무능.webp",
    "day": "Sundays",
    "episodes": 0,
    "studio": "animation studio42",
    "staff": {
      "director": ["칸베 히로유키"],
      "character_design": ["나카무라 나오토"],
      "adaptor": ["스즈키 마사시"]
    }
  },
  {
    "id": 62000,
    "quarter": "1분기",
    "title": "악역 영애는 이웃나라 왕태자의 사랑을 듬뿍 받는다",
    "thumbnail": "image/animeimg/Q1/악역 영애는 이웃나라 왕태자의 사랑을 듬뿍 받는다.webp",
    "day": "Sundays",
    "episodes": 12,
    "studio": "스튜디오 딘",
    "staff": {
      "director": ["하마나 타카유키"],
      "character_design": ["마지로", "카메타니 쿄코(서브)"],
      "adaptor": ["나리타 요시미"]
    }
  },
  {
    "id": 58788,
    "quarter": "1분기",
    "title": "위국일기",
    "thumbnail": "image/animeimg/Q1/위국일기.webp",
    "day": "Sundays",
    "episodes": 13,
    "studio": "슈카",
    "staff": {
      "director": ["오오시로 미유키"],
      "character_design": ["하야마 켄지", "카와무라 토시에"],
      "adaptor": ["키야스 코헤이"]
    }
  },
  {
    "id": 61084,
    "quarter": "1분기",
    "title": "화식조 우슈보로토비구미",
    "thumbnail": "image/animeimg/Q1/화식조 우슈보로토비구미.webp",
    "day": "Sundays",
    "episodes": 0,
    "studio": "SynergySP",
    "staff": {
      "director": ["카메가키 하지메(총)", "야스미 히로시"],
      "character_design": ["BILBA", "SIBATO(서브)", "츠요마루(서브)", "사카네 켄지(서브)", "코사카 타쿠미(서브)", "타니바야시 사야(서브)", "나카노 유리카(서브)"],
      "adaptor": ["모리 류스케"]
    }
  },
  {
    "id": 60602,
    "quarter": "1분기",
    "title": "MF고스트 3rd Season",
    "thumbnail": "image/animeimg/Q1/MF고스트 3rd Season.webp",
    "day": "Sundays",
    "episodes": 0,
    "studio": "Felix Film",
    "staff": {
      "director": ["나카 토모히토"],
      "character_design": ["온다 나오유키"],
      "adaptor": ["야마시타 켄이치"]
    }
  },
  {
    "id": 55825,
    "quarter": "1분기",
    "title": "지옥락 2기",
    "thumbnail": "image/animeimg/Q1/지옥락 2기.webp",
    "day": "Sundays",
    "episodes": 12,
    "studio": "MAPPA",
    "staff": {
      "director": ["마키타 카오리"],
      "character_design": ["히사키 코지", "니이즈마 다이스케(크리처)"],
      "adaptor": ["킨다이치 아키라"]
    }
  },
  {
    "id": 62543,
    "quarter": "1분기",
    "title": "내가 연인이 될 수 있을 리 없잖아, 무리무리! (※무리가 아니었다?!) ~넥스트 샤인!~",
    "thumbnail": "image/animeimg/Q1/내가 연인이 될 수 있을 리 없잖아, 무리무리!.webp",
    "day": "Anomaly",
    "episodes": 5,
    "studio": "studio MOTHER",
    "staff": {
      "director": ["우치누마 나츠미"],
      "character_design": ["kojikoji"],
      "adaptor": ["아라카와 나루히사"]
    }
  },
  {
    "id": 63096,
    "quarter": "1분기",
    "title": "아리스가와 렌은 사실 여자라구!!",
    "thumbnail": "image/animeimg/Q1/아리스가와 렌은 사실 여자라구.webp",
    "day": "Anomaly",
    "episodes": 8,
    "studio": "스튜디오 레오",
    "staff": {
      "director": ["사사키 스미토"],
      "character_design": ["나스 레나"],
      "adaptor": ["이루카대장"]
    }
  },
  {
    "id": 62897,
    "quarter": "1분기",
    "title": "이치고 아이카 ~잡하고 생기발랄한 동생과 못말리는 오빠~",
    "thumbnail": "image/animeimg/Q1/이치고 아이카.webp",
    "day": "Anomaly",
    "episodes": 0,
    "studio": "Studio Hokiboshi",
    "staff": {
      "director": ["콘노 히유타"],
      "character_design": ["와타나베 요시히로"],
      "adaptor": ["쿠로사키 에요"]
    }
  },
  {
    "id": 62987,
    "quarter": "1분기",
    "title": "북두의 권: 권왕군 자코들의 만가",
    "thumbnail": "image/animeimg/Q1/북두의 권.webp",
    "day": "Anomaly",
    "episodes": 0,
    "studio": "Doraku",
    "staff": {
      "director": [],
      "character_design": ["Hara, Tetsuo"],
      "adaptor": []
    }
  },
  {
    "id": 61969,
    "quarter": "1분기",
    "title": "최애 의붓형을 사랑하기 위해, 오래 살겠습니다!",
    "thumbnail": "image/animeimg/Q1/최애 의붓형을 사랑하기 위해, 오래 살겠습니다.webp",
    "day": "Anomaly",
    "episodes": 0,
    "studio": "Imagica Infos",
    "staff": {
      "director": ["모리시타 유스케"],
      "character_design": ["츠지모토 아키"],
      "adaptor": ["테즈카 이즈미"]
    }
  },
  {
    "id": 61694,
    "quarter": "1분기",
    "title": "안드로이드는 경험인 수에 들어가나요??",
    "thumbnail": "image/animeimg/Q1/안드로이드는 경험인 수에 들어가나요.webp",
    "day": "Anomaly",
    "episodes": 8,
    "studio": "주식회사 웨이브",
    "staff": {
      "director": ["네코B"],
      "character_design": ["츠키우미 미츠루"],
      "adaptor": ["네코B"]
    }
  },
  {
    "id": 62864,
    "quarter": "1분기",
    "title": "너는 아직 군마를 모른다",
    "thumbnail": "image/animeimg/Q1/너는 아직 군마를 모른다.webp",
    "day": "Anomaly",
    "episodes": 0,
    "studio": "Imagica Infos",
    "staff": {
      "director": ["타타미타니 테츠야"],
      "character_design": [],
      "adaptor": ["타타미타니 테츠야"]
    }
  },
  {
    "id": 19383,
    "quarter": "1분기",
    "title": "야미시바이 16기",
    "thumbnail": "image/animeimg/Q1/야미시바이.webp",
    "day": "Anomaly",
    "episodes": 13,
    "studio": "ILCA",
    "staff": {
      "director": [],
      "character_design": [],
      "scriptwriter": ["구마모토 히로무"]
    }
  },
  {
    "id": 60294,
    "quarter": "1분기",
    "title": "천수의 사쿠나히메 코코로와 농사 일지",
    "thumbnail": "image/animeimg/Q1/천수의 사쿠나히메 코코로와 농사 일지.webp",
    "day": "Anomaly",
    "episodes": 2,
    "studio": "P.A. Works",
    "staff": {
      "director": ["요시하라 마사유키"],
      "character_design": ["무라야마 료타"],
      "adaptor": []
    }
  },
  {
    "id": 56906,
    "quarter": "1분기",
    "title": "이세계에서 치트 스킬을 얻은 나는 현실 세계에서도 무쌍한다 ~레벨업이 인생을 바꿨다~ TVSP",
    "thumbnail": "image/animeimg/Q1/레벨업이 인생을 바꿨다.webp",
    "day": "Anomaly",
    "episodes": 1,
    "studio": "밀팡세",
    "staff": {
      "director": ["이타가키 신"],
      "character_design": ["키무라 히로미"],
      "adaptor": []
    }
  },
  {
    "id": 63019,
    "quarter": "1분기",
    "title": "프리즘 윤무곡",
    "thumbnail": "image/animeimg/Q1/프리즘 윤무곡.webp",
    "day": "Web",
    "episodes": 20,
    "studio": "Wit Studio",
    "staff": {
      "director": ["나카자와 카즈토", "타카하시 테츠야", "후지이 사키"],
      "character_design": ["타카하시 야스코", "미노와 아이코(서브)"],
      "scriptwriter": ["카미오 요코", "후지이 사키"]
    }
  },
  {
    "id": 62896,
    "quarter": "1분기",
    "title": "초(超) 가구야 공주!",
    "thumbnail": "image/animeimg/Q1/초(超) 가구야 공주.webp",
    "day": "Web",
    "episodes": 1,
    "studio": "콜로리도",
    "staff": {
      "director": ["야마시타 신고"],
      "character_design": ["헤치마", "나가에 아키히로"],
      "scriptwriter": ["나츠오 사에리", "야마시타 신고"]
    }
  },
  {
    "id": 61119,
    "quarter": "1분기",
    "title": "듀얼마스터즈 LOST ~망각의 태양~",
    "thumbnail": "image/animeimg/Q1/듀얼마스터즈 LOST ~망각의 태양~.webp",
    "day": "Web",
    "episodes": 4,
    "studio": "J.C.Staff",
    "staff": {
      "director": ["후쿠시마 토시노리"],
      "character_design": ["카네바야시 요우"],
      "adaptor": ["카토 요이치"]
    }
  },
  {
    "id": 58573,
    "quarter": "1분기",
    "title": "바키도: 무적의 검사 편",
    "thumbnail": "image/animeimg/Q1/바키도.webp",
    "day": "Web",
    "episodes": 13,
    "studio": "TMS Entertainment",
    "staff": {
      "director": ["히라노 토시키"],
      "character_design": ["신고 이시카와"],
      "adaptor": ["타츠히코 우라하타"]
    }
  },
  {
    "id": 61469,
    "quarter": "1분기",
    "title": "스틸 볼 런: 죠죠의 기묘한 모험",
    "thumbnail": "image/animeimg/Q1/스틸 볼 런.webp",
    "day": "Web",
    "episodes": 0,
    "studio": "David Production",
    "staff": {
      "director": ["타카하시 히데야", "키무라 야스히로"],
      "character_design": ["츠마가리 다이스케", "키노시타 유이(서브)", "Grand Guerrilla(서브)", "무라오 미노루(서브)", "치이(서브)"],
      "adaptor": ["코바야시 야스코"]
    }
  },
  {
    "id": 49469,
    "quarter": "1분기",
    "title": "비스타즈 파이널 시즌",
    "thumbnail": "image/animeimg/Q1/비스타즈 파이널 시즌.webp",
    "day": "Web",
    "episodes": 12,
    "studio": "오렌지",
    "staff": {
      "director": ["마츠미 신이치"],
      "character_design": ["오오츠 나오", "노리타 타쿠모"],
      "adaptor": ["히구치 나나미"]
    }
  },
  // Q2 데이터 예시
  { "id": 201, "quarter": "2분기", "title": "", "thumbnail": "" },
  // Q3 데이터 예시
  { "id": 301, "quarter": "3분기", "title": "", "thumbnail": "" },
  // Q4 데이터 예시
  { "id": 401, "quarter": "4분기", "title": "", "thumbnail": "" }
];