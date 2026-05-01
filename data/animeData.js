// 모든 애니메이션 리스트 (분기 정보 포함)
const AnimeList = [
  {
    "id": 61886,
    "quarter": "1분기",
    "title": "고문 아르바이트의 일상",
    "thumbnail": "image/animeimg/Q1/고문_아르바이트의_일상.webp",
    "day": "Mondays",
    "episodes": 12,
    "studio": [
      "디오미디어"
    ],
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
    "studio": [
      "본즈 필름"
    ],
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
    "studio": [
      "오쿠루토 노보루"
    ],
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
    "studio": [
      "브레인즈 베이스"
    ],
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
    "studio": [
      "PINE JAM"
    ],
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
    "studio": [
      "데즈카 프로덕션"
    ],
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
    "studio": [
      "겟코"
    ],
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
    "studio": [
      "스튜디오 딘"
    ],
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
    "studio": [
      "겟코"
    ],
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
    "studio": [
      "선라이즈"
    ],
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
    "studio": [
      "벨녹스 필름스"
    ],
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
    "studio": [
      "HORNETS"
    ],
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
    "studio": [
      "SILVER LINK."
    ],
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
    "studio": [
      "EMT 스퀘어드"
    ],
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
    "studio": [
      "동화공방"
    ],
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
    "studio": [
      "스튜디오 딘"
    ],
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
    "studio": [
      "CompTown"
    ],
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
    "studio": [
      "SynergySP"
    ],
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
    "studio": [
      "Studio LAN"
    ],
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
    "studio": [
      "스튜디오 KAI"
    ],
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
    "studio": [
      "팟쇼네"
    ],
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
    "studio": [
      "Project No.9"
    ],
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
    "studio": [
      "아시 프로덕션"
    ],
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
    "studio": [
      "MAPPA"
    ],
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
    "studio": [
      "A.C.G.T."
    ],
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
    "studio": [
      "타이푼 그래픽스"
    ],
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
    "studio": [
      "타이푼 그래픽스"
    ],
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
    "studio": [
      "매드하우스"
    ],
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
    "studio": [
      "주식회사 세븐"
    ],
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
    "studio": [
      "TROYCA"
    ],
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
    "studio": [
      "요코하마 애니메이션 랩"
    ],
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
    "studio": [
      "David Production"
    ],
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
    "studio": [
      "Felix Film"
    ],
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
    "studio": [
      "NAZ"
    ],
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
    "studio": [
      "오렌지"
    ],
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
    "studio": [
      "A-1 Pictures"
    ],
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
    "studio": [
      "SynergySP"
    ],
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
    "studio": [
      "아스리드"
    ],
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
    "studio": [
      "OLM"
    ],
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
    "studio": [
      "J.C.Staff"
    ],
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
    "studio": [
      "ENGI"
    ],
    "staff": {
      "director": ["야마모토 야스타카"],
      "character_design": ["카메야마 치나츠"],
      "adaptor": ["하나다 줏키"]
    }
  },
  {
  "id": 63042,
  "title": "명탐정 프리큐어",
  "quarter": "1분기",
  "thumbnail": "image/animeimg/Q1/명탐정 프리큐어.webp",
  "day": "Sundays",
  "episodes": 0,
  "studio": [
    "토에이 애니메이션"
  ],
  "staff": {
    "director": [
      "카와사키 코지"
    ],
    "scriptwriter": [
      "무라야마 이사오"
    ],
    "character_design": [
      "야노 아카네"
    ]
  }
},
  {
    "id": 61663,
    "quarter": "1분기",
    "title": "아름다운 초저녁달",
    "thumbnail": "image/animeimg/Q1/아름다운 초저녁달.webp",
    "day": "Sundays",
    "episodes": 0,
    "studio": [
      "이스트 피쉬 스튜디오"
    ],
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
    "studio": [
      "라판트랙"
    ],
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
    "studio": [
      "이스트 피쉬 스튜디오"
    ],
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
    "studio": [
      "SIGNAL.MD"
    ],
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
    "studio": [
      "플래티넘 비전"
    ],
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
    "studio": [
      "animation studio42"
    ],
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
    "studio": [
      "스튜디오 딘"
    ],
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
    "studio": [
      "슈카"
    ],
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
    "studio": [
      "SynergySP"
    ],
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
    "studio": [
      "Felix Film"
    ],
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
    "studio": [
      "MAPPA"
    ],
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
    "studio": [
      "studio MOTHER"
    ],
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
    "studio": [
      "스튜디오 레오"
    ],
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
    "studio": [
      "Studio Hokiboshi"
    ],
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
    "studio": [
      "Doraku"
    ],
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
    "studio": [
      "Imagica Infos"
    ],
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
    "studio": [
      "주식회사 웨이브"
    ],
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
    "studio": [
      "Imagica Infos"
    ],
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
    "studio": [
      "ILCA"
    ],
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
    "studio": [
      "P.A. Works"
    ],
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
    "studio": [
      "밀팡세"
    ],
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
    "studio": [
      "Wit Studio"
    ],
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
    "studio": [
      "콜로리도"
    ],
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
    "studio": [
      "J.C.Staff"
    ],
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
    "studio": [
      "TMS Entertainment"
    ],
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
    "studio": [
      "David Production"
    ],
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
    "studio": [
      "오렌지"
    ],
    "staff": {
      "director": ["마츠미 신이치"],
      "character_design": ["오오츠 나오", "노리타 타쿠모"],
      "adaptor": ["히구치 나나미"]
    }
  },
  //2분기
{
  "id": 59393,
  "title": "치킨 파이터",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/치킨 파이터.webp",
  "day": "Mondays",
  "episodes": 0,
  "studio": [
    "산지겐"
  ],
  "staff": {
    "director": [
      "스즈키 다이스케"
    ],
    "adaptor": [
      "세코 히로시"
    ],
    "character_design": [
      "챠노하라 타쿠야",
      "Shin Joseph"
    ]
  }
},
{
  "id": 62852,
  "title": "고스트 콘서트: missing Songs",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/고스트 콘서트 missing Songs.webp",
  "day": "Mondays",
  "episodes": 12,
  "studio": [
    "ENGI"
  ],
  "staff": {
    "director": [
      "진보 마사토"
    ],
    "adaptor": [
      "진보 마사토"
    ],
    "character_design": [
      "우이가와 마사아키"
    ]
  }
},
{
  "id": 61687,
  "title": "자칭 악역 영애인 약혼자 관찰기록.",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/자칭 악역 영애인 약혼자 관찰기록.webp",
  "day": "Mondays",
  "episodes": 12,
  "studio": [
    "아시 프로덕션"
  ],
  "staff": {
    "director": [
      "야마모토 준이치"
    ],
    "adaptor": [
      "이노우에 아키코"
    ],
    "character_design": [
      "마츠모토 미키",
      "아베",
      "마츠이 우니"
    ]
  }
},
{
  "id": 62146,
  "title": "이세계 유유자적 농가 2",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/이세계 유유자적 농가 2.webp",
  "day": "Mondays",
  "episodes": 12,
  "studio": [
    "Zero-G"
  ],
  "staff": {
    "director": [
      "쿠라야 료이치"
    ],
    "adaptor": [
      "쿠라야 료이치"
    ],
    "character_design": [
      "사이토 요시코",
      "나카하라 키요타카",
      "이소우치 유스케"
    ]
  }
},
{
  "id": 51553,
  "title": "고깔모자 아틀리에",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/고깔모자 아틀리에.webp",
  "day": "Mondays",
  "episodes": 13,
  "studio": [
    "BUG FILMS"
  ],
  "staff": {
    "director": [
      "와타나베 아유무"
    ],
    "adaptor": [
      "세코 히로시"
    ],
    "character_design": [
      "우나바라 카이리",
      "나카지마 아츠코",
      "후쿠치 준페이",
      "미야자키 아사미"
    ]
  }
},
{
  "id": 61425,
  "title": "허당 선도부원과 스커트 길이가 부적절한 여고생의 이야기",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/허당 선도부원과 스커트 길이가 부적절한 여고생의 이야기.webp",
  "day": "Mondays",
  "episodes": 12,
  "studio": [
    "Zero-G"
  ],
  "staff": {
    "director": [
      "이와나가 다이지"
    ],
    "adaptor": [
      "요코타니 마사히로"
    ],
    "character_design": [
      "히무로 요우"
    ]
  }
},
{
  "id": 62331,
  "title": "라이어 게임",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/라이어 게임.webp",
  "day": "Tuesdays",
  "episodes": 0,
  "studio": [
    "매드하우스"
  ],
  "staff": {
    "director": [
      "사토 유조",
      "카와노 아사미"
    ],
    "adaptor": [
      "우라하타 타츠히코"
    ],
    "character_design": [
      "츠치야 케이",
      "요코야마 아이"
    ]
  }
},
{
  "id": 63375,
  "title": "일본삼국",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/일본삼국.webp",
  "day": "Tuesdays",
  "episodes": 0,
  "studio": [
    "스튜디오 카프카"
  ],
  "staff": {
    "director": [
      "테라사와 카즈아키"
    ],
    "adaptor": [
      "우츠미 테루코"
    ],
    "character_design": [
      "아비루 타카히코",
      "츠지무라 코키"
    ]
  }
},
{
  "id": 61931,
  "title": "비극의 원흉이 되는 최강악역 최종보스 여왕은 국민을 위해 헌신합니다 Season2",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/비극의 원흉이 되는 최강악역 최종보스 여왕은 국민을 위해 헌신합니다 Season2.webp",
  "day": "Tuesdays",
  "episodes": 12,
  "studio": [
    "OLM"
  ],
  "staff": {
    "director": [
      "닛타 노리오"
    ],
    "adaptor": [
      "아카오 데코"
    ],
    "character_design": [
      "코노 히토미",
      "스즈노스케",
      "마츠우라 분코",
      "카와노 아키코"
    ]
  }
},
{
  "id": 62601,
  "title": "매리지 톡신",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/매리지 톡신.webp",
  "day": "Tuesdays",
  "episodes": 0,
  "studio": [
    "본즈 필름"
  ],
  "staff": {
    "director": [
      "호리 모토노부"
    ],
    "adaptor": [
      "우에노 키미코"
    ],
    "character_design": [
      "토쿠오카 코헤이",
      "사코 유리카"
    ]
  }
},
{
  "id": 61839,
  "title": "사랑해 게임을 끝내고 싶어",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/사랑해 게임을 끝내고 싶어.webp",
  "day": "Tuesdays",
  "episodes": 12,
  "studio": [
    "FelixFilm"
  ],
  "staff": {
    "director": [
      "타니 아즈마"
    ],
    "adaptor": [
      "오오치 케이이치로"
    ],
    "character_design": [
      "후쿠치 토모키",
      "타니가와 료스케",
      "스기무라 토모카즈"
    ]
  }
},
{
  "id": 56734,
  "title": "반에서 두 번째로 귀여운 여자애와 친구가 되었다",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/반에서 두 번째로 귀여운 여자애와 친구가 되었다.webp",
  "day": "Tuesdays",
  "episodes": 12,
  "studio": [
    "CONNECT"
  ],
  "staff": {
    "director": [
      "타치바나 히데키"
    ],
    "adaptor": [
      "오오치 케이이치로"
    ],
    "character_design": [
      "타키모토 쇼코",
      "휴우가 아즈리"
    ]
  }
},
{
  "id": 61013,
  "title": "레플리카도, 사랑을 한다",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/레플리카도, 사랑을 한다.webp",
  "day": "Tuesdays",
  "episodes": 13,
  "studio": [
    "voil"
  ],
  "staff": {
    "director": [
      "키무라 류이치"
    ],
    "adaptor": [
      "시노즈카 토모코"
    ],
    "character_design": [
      "아비코 에이지",
      "raemz"
    ]
  }
},
{
  "id": 53732,
  "title": "왼손잡이 에렌",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/왼손잡이 에렌.webp",
  "day": "Wednesdays",
  "episodes": 13,
  "studio": [
      "SIGNAL.MD",
      "Production I.G"
    ],
  "staff": {
    "director": [
      "스즈키 토시마사"
    ],
    "adaptor": [
      "키시모토 타쿠"
    ],
    "character_design": [
      "고토 타카유키",
      "후쿠치 유카",
      "타마이 아카네"
    ]
  }
},
{
  "id": 63014,
  "title": "두 남자와 룸쉐어 중입니다",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/두 남자와 룸쉐어 중입니다.webp",
  "day": "Wednesdays",
  "episodes": 0,
  "studio": [
    "타츠노코 프로덕션"
  ],
  "staff": {
    "director": [
      "이마자키 이츠키"
    ],
    "adaptor": [
      "이마자키 이츠키"
    ],
    "character_design": [
      "키쿠치 슌스케"
    ]
  }
},
{
  "id": 63376,
  "title": "여신 「이세계 전생하면 뭐가 되고 싶습니까」 나「용사의 갈비뼈로」",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/여신 「이세계 전생하면 뭐가 되고 싶습니까」 나「용사의 갈비뼈로」.webp",
  "day": "Wednesdays",
  "episodes": 0,
  "studio": [
    "Qzil.la",
    "S.o.K"
  ],
  "staff": {
    "director": [
      "소에지마 야스후미"
    ],
    "adaptor": [
      "후타시로 짓파"
    ],
    "character_design": [
      "메바루",
      "쿠마노마타 카기지",
      "마츠모토 미키"
    ]
  }
},
{
  "id": 59708,
  "title": "어서 오세요 실력지상주의 교실에 4th Season",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/어서 오세요 실력지상주의 교실에 4th Season.webp",
  "day": "Wednesdays",
  "episodes": 16,
  "studio": [
    "Lerche"
  ],
  "staff": {
    "director": [
      "노마타 노리유키"
    ],
    "adaptor": [
      "시게노부 코우"
    ],
    "character_design": [
      "코노 마키",
      "쇼킨지 나오코",
      "카와무라 아츠코",
      "나가타 하루나"
    ]
  }
},
{
  "id": 62512,
  "title": "자동판매기로 다시 태어난 나는 미궁을 방랑한다 3rd season",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/자동판매기로 다시 태어난 나는 미궁을 방랑한다 3rd season.webp",
  "day": "Wednesdays",
  "episodes": 0,
  "studio": [
    "스튜디오 5조",
    "AXsiZ"
  ],
  "staff": {
    "director": [
      "야마모토 타카시"
    ],
    "adaptor": [
      "타카하시 타츠야"
    ],
    "character_design": [
      "유우키 하구레",
      "야마우치 나오키",
      "사카이 타카히로",
      "아키즈키 료",
      "야마우치 나오키",
      "오제키 미야비",
      "황미정",
      "송현주"
    ]
  }
},
{
  "id": 61316,
  "title": "Re:제로부터 시작하는 이세계 생활 4기",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/Re 제로부터 시작하는 이세계 생활 4기.webp",
  "day": "Wednesdays",
  "episodes": 19,
  "studio": [
    "WHITE FOX"
  ],
  "staff": {
    "director": [
      "시노하라 마사히로"
    ],
    "adaptor": [
      "요코타니 마사히로"
    ],
    "character_design": [
      "오츠카 신이치로",
      "사가와 하루카",
      "치바 케이타로"
    ]
  }
},
{
  "id": 61831,
  "title": "최강의 왕, 두 번째 인생에는 무엇을 하는가 시즌 2",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/최강의 왕, 두 번째 인생에는 무엇을 하는가 시즌 2.webp",
  "day": "Wednesdays",
  "episodes": 0,
  "studio": [
    "studio A-CAT"
  ],
  "staff": {
    "director": [
      "모토나가 케이타로"
    ],
    "adaptor": [
      "코노 타카미츠"
    ],
    "character_design": [
      "스에오카 마사미"
    ]
  }
},
{
  "id": 62604,
  "title": "오타쿠에게 상냥한 갸루는 없다",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/오타쿠에게 상냥한 갸루는 없다.webp",
  "day": "Wednesdays",
  "episodes": 0,
  "studio": [
    "TMS 엔터테인먼트"
  ],
  "staff": {
    "director": [
      "미타 아라타"
    ],
    "adaptor": [
      "이누카이 카즈히코"
    ],
    "character_design": [
      "마츠다 리온"
    ]
  }
},
{
  "id": 62893,
  "title": "놓친 물고기는 컸지만 잡은 물고기가 너무 컸던 건",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/놓친 물고기는 컸지만 잡은 물고기가 너무 컸던 건.webp",
  "day": "Thursdays",
  "episodes": 12,
  "studio": [
    "TROYCA"
  ],
  "staff": {
    "director": [
      "오구로 아키라"
    ],
    "adaptor": [
      "요코테 미치코"
    ],
    "character_design": [
      "스즈키 이사무"
    ]
  }
},
{
  "id": 59551,
  "title": "힘내라 나카무라 군",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/힘내라 나카무라 군.webp",
  "day": "Thursdays",
  "episodes": 13,
  "studio": [
    "Drive"
  ],
  "staff": {
    "director": [
      "우메키 아오이"
    ],
    "adaptor": [
      "아오키 야스코"
    ],
    "character_design": [
      "우메키 아오이"
    ]
  }
},
{
  "id": 60028,
  "title": "공주 기사는 야만족의 신부",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/공주 기사는 야만족의 신부.webp",
  "day": "Thursdays",
  "episodes": 12,
  "studio": [
    "주문당"
  ],
  "staff": {
    "director": [
      "타나카 타카유키"
    ],
    "adaptor": [
      "아사카와 미야",
      "모리미야 히사시"
    ],
    "character_design": [
      "키쿠치 마사요시",
      "후지타 마유미",
      "하타케야마 하지메",
      "김로호"
    ]
  }
},
{
  "id": 57592,
  "title": "닥터 스톤 SCIENCE FUTURE",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/닥터 스톤 SCIENCE FUTURE.webp",
  "day": "Thursdays",
  "episodes": 12,
  "studio": [
    "TMS 엔터테인먼트"
  ],
  "staff": {
    "director": [
      "마츠시타 슈헤이"
    ],
    "adaptor": [
      "스나야마 쿠라스미"
    ],
    "character_design": [
      "Boichi",
      "이와사 유코"
    ]
  }
},
{
  "id": 58832,
  "title": "쿠지마 노래하면 집이 파다닥",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/쿠지마 노래하면 집이 파다닥.webp",
  "day": "Thursdays",
  "episodes": 12,
  "studio": [
    "스튜디오 히바리"
  ],
  "staff": {
    "director": [
      "노마타 노리유키",
      "키무라 신이치로"
    ],
    "adaptor": [
      "야마다 야스노리"
    ],
    "character_design": [
      "미츠하시 사쿠라코",
      "하시모리 유카"
    ]
  }
},
{
  "id": 60852,
  "title": "얼음 성벽",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/얼음 성벽.webp",
  "day": "Thursdays",
  "episodes": 0,
  "studio": [
    "스튜디오 KAI"
  ],
  "staff": {
    "director": [
      "만큐"
    ],
    "adaptor": [
      "나카니시 야스히로"
    ],
    "character_design": [
      "오기노 미키",
      "이토 에리코"
    ]
  }
},
{
  "id": 59835,
  "title": "키리오 팬클럽",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/키리오 팬클럽.webp",
  "day": "Fridays",
  "episodes": 12,
  "studio": [
    "SATELIGHT"
  ],
  "staff": {
    "director": [
      "토야마 소"
    ],
    "adaptor": [
      "사츠키 아야"
    ],
    "character_design": [
      "하야시 나미",
      "나가사카 칸지",
      "사다카타 키쿠코"
    ]
  }
},
{
  "id": 59443,
  "title": "리인카네이션의 꽃잎",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/리인카네이션의 꽃잎.webp",
  "day": "Fridays",
  "episodes": 0,
  "studio": [
    "BENTEN Film"
  ],
  "staff": {
    "director": [
      "쿠도 슌"
    ],
    "adaptor": [
      "이시노 아츠오"
    ],
    "character_design": [
      "카토 하루나",
      "이나타 와타루"
    ]
  }
},
{
  "id": 61943,
  "title": "하이바라의 청춘 뉴 게임 플러스",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/하이바라의 청춘 뉴 게임 플러스.webp",
  "day": "Fridays",
  "episodes": 12,
  "studio": [
    "스튜디오 코메트"
  ],
  "staff": {
    "director": [
      "호시노 미스즈"
    ],
    "adaptor": [
      "오오치 케이이치로"
    ],
    "character_design": [
      "긴",
      "오노 히로미"
    ]
  }
},
{
  "id": 58820,
  "title": "아와지마 가극학교",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/아와지마 가극학교.webp",
  "day": "Fridays",
  "episodes": 12,
  "studio": [
    "매드하우스"
  ],
  "staff": {
    "director": [
      "아사카 모리오"
    ],
    "adaptor": [
      "나카니시 야스히로"
    ],
    "character_design": [
      "하마다 쿠니히코",
      "콘노 아키코",
      "나가야마 쇼타로"
    ]
  }
},
{
  "id": 62964,
  "title": "또 죽고 말았나요, 탐정님",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/또 죽고 말았나요, 탐정님.webp",
  "day": "Fridays",
  "episodes": 0,
  "studio": [
    "라이덴 필름"
  ],
  "staff": {
    "director": [
      "나오야 타카시"
    ],
    "adaptor": [
      "이노우에 미오"
    ],
    "character_design": [
      "쿠마다 아키코"
    ]
  }
},
{
  "id": 56876,
  "title": "옆집 천사님 때문에 어느샌가 인간적으로 타락한 사연 2",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/옆집 천사님 때문에 어느샌가 인간적으로 타락한 사연 2.webp",
  "day": "Fridays",
  "episodes": 12,
  "studio": [
    "Project No.9"
  ],
  "staff": {
    "director": [
      "쿠마노 치히로"
    ],
    "adaptor": [
      "오오치 케이이치로"
    ],
    "character_design": [
      "노구치 타카유키",
      "쿠라하시 N카루"
    ]
  }
},
{
  "id": 59970,
  "title": "전생했더니 슬라임이었던 건에 대하여 4기",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/전생했더니 슬라임이었던 건에 대하여 4기.webp",
  "day": "Fridays",
  "episodes": 0,
  "studio": [
    "8-Bit"
  ],
  "staff": {
    "director": [
      "츠다 나오카츠"
    ],
    "adaptor": [
      "오가와 히토미"
    ],
    "character_design": [
      "에바타 료마",
      "키시다 타카히로",
      "코미네 마사요리",
      "야마자키 히데키",
      "이토 토모코"
    ]
  }
},
{
  "id": 62068,
  "title": "스노우볼 어스",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/스노우볼 어스.webp",
  "day": "Fridays",
  "episodes": 13,
  "studio": [
    "스튜디오 KAI"
  ],
  "staff": {
    "director": [
      "사카이 무네히사"
    ],
    "adaptor": [
      "무라코시 시게루"
    ],
    "character_design": [
      "코노 토시야",
      "세라 코타"
    ]
  }
},
{
  "id": 62981,
  "title": "신의 물방울",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/신의 물방울.webp",
  "day": "Fridays",
  "episodes": 24,
  "studio": [
    "SATELIGHT"
  ],
  "staff": {
    "director": [
      "이토소 켄지"
    ],
    "adaptor": [
      "미츠루 유우"
    ],
    "character_design": [
      "스와 소타"
    ]
  }
},
{
  "id": 61186,
  "title": "카미이나 보탄, 취한 모습은 백합의 꽃",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/카미이나 보탄, 취한 모습은 백합의 꽃.webp",
  "day": "Saturdays",
  "episodes": 12,
  "studio": [
    "소와네"
  ],
  "staff": {
    "director": [
      "사쿠마 타카시"
    ],
    "adaptor": [
      "요나이야마 요코"
    ],
    "character_design": [
      "요시나리 코우",
      "미야치"
    ]
  }
},
{
  "id": 61200,
  "title": "종말의 발키리 Ⅲ",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/종말의 발키리 Ⅲ.webp",
  "day": "Saturdays",
  "episodes": 15,
  "studio": [
    "유메타 컴퍼니",
    "마루애니메이션"
  ],
  "staff": {
    "director": [
      "하츠미 코이치"
    ],
    "adaptor": [
      "무토 야스유키"
    ],
    "character_design": [
      "타나베 요코",
      "카와시마 나오",
      "쿠마가이 테츠야",
      "하라다 렌키"
    ]
  }
},
{
  "id": 56646,
  "title": "북두의 권 -FIST OF THE NORTH STAR-",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/북두의 권 -FIST OF THE NORTH STAR-.webp",
  "day": "Saturdays",
  "episodes": 0,
  "studio": [
    "TMS 엔터테인먼트"
  ],
  "staff": {
    "director": [
      "마에다 히로시"
    ],
    "adaptor": [
      "이누카이 카즈히코"
    ],
    "character_design": [
      "히사츠네 나오키",
      "코지"
    ]
  }
},
{
  "id": 62485,
  "title": "여친, 빌리겠습니다 5기",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/여친, 빌리겠습니다 5기.webp",
  "day": "Saturdays",
  "episodes": 12,
  "studio": [
    "TMS 엔터테인먼트"
  ],
  "staff": {
    "director": [
      "코가 카즈오미"
    ],
    "adaptor": [
      "히로타 미츠타카"
    ],
    "character_design": [
      "히라야마 칸나"
    ]
  }
},
{
  "id": 57466,
  "title": "책벌레의 하극상 ~사서가 되기 위해서라면 뭐든지 할 수 있어~",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/책벌레의 하극상 ~사서가 되기 위해서라면 뭐든지 할 수 있어~.webp",
  "day": "Saturdays",
  "episodes": 0,
  "studio": [
    "WIT STUDIO"
  ],
  "staff": {
    "director": [
      "이와사키 요시아키"
    ],
    "adaptor": [
      "쿠니사와 마리코"
    ],
    "character_design": [
      "미노와 아이코",
      "이시다테 나미코",
      "무라카미 타츠야",
      "오치 신지",
      "호사카 모모코",
      "야마자키 코이치",
      "아미 케이노스케",
      "장 샤오웨이",
      "와타나베 켄스케",
      "키시노 미호",
      "핫토리 하나카",
      "카시자키 이노리"
    ]
  }
},
{
  "id": 60310,
  "title": "마계학교 이루마군 4기",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/마계학교 이루마군 4기.webp",
  "day": "Saturdays",
  "episodes": 24,
  "studio": [
    "반다이 남코 픽처스"
  ],
  "staff": {
    "director": [
      "모리와키 마코토",
      "츠지하시 아야카"
    ],
    "adaptor": [
      "후데야스 카즈유키"
    ],
    "character_design": [
      "하라 유미코"
    ]
  }
},
{
  "id": 60444,
  "title": "비실비실 선생님",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/비실비실 선생님.webp",
  "day": "Saturdays",
  "episodes": 12,
  "studio": [
    "브레인즈 베이스"
  ],
  "staff": {
    "director": [
      "이시오도리 히로시"
    ],
    "adaptor": [
      "후쿠시마 요시후미"
    ],
    "character_design": [
      "아이사카 나오키"
    ]
  }
},
{
  "id": 62825,
  "title": "최강의 직업은 용사도 현자도 아닌 감정사(임시)인 것 같은데요",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/최강의 직업은 용사도 현자도 아닌 감정사(임시)인 것 같은데요.webp",
  "day": "Saturdays",
  "episodes": 0,
  "studio": [
    "스튜디오 플러드"
  ],
  "staff": {
    "director": [
      "호시노 마코토"
    ],
    "adaptor": [
      "시미즈 메구미"
    ],
    "character_design": [
      "오오카와 미호코",
      "마츠모토 요시에"
    ]
  }
},
{
  "id": 62391,
  "title": "킬 블루",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/킬 블루.webp",
  "day": "Saturdays",
  "episodes": 12,
  "studio": [
    "CUE"
  ],
  "staff": {
    "director": [
      "이데 야스노리"
    ],
    "adaptor": [
      "카부라기 히로"
    ],
    "character_design": [
      "다이도우지 미호"
    ]
  }
},
{
  "id": 62164,
  "title": "아카네 이야기",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/아카네 이야기.webp",
  "day": "Saturdays",
  "episodes": 0,
  "studio": [
    "ZEXCS"
  ],
  "staff": {
    "director": [
      "와타나베 아유무"
    ],
    "adaptor": [
      "츠치야 미치히로"
    ],
    "character_design": [
      "타나카 키이",
      "닛타 야스나리",
      "타나카 키이",
      "닛타 야스나리",
      "카가와 히사시"
    ]
  }
},
{
  "id": 62001,
  "title": "황천의 츠가이",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/황천의 츠가이.webp",
  "day": "Saturdays",
  "episodes": 24,
  "studio": [
    "본즈 필름"
  ],
  "staff": {
    "director": [
      "안도 마사히로"
    ],
    "adaptor": [
      "타카기 노보루"
    ],
    "character_design": [
      "아라이 노부히로"
    ]
  }
},
{
  "id": 62048,
  "title": "마오",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/마오.webp",
  "day": "Saturdays",
  "episodes": 0,
  "studio": [
    "선라이즈"
  ],
  "staff": {
    "director": [
      "사토 테루오"
    ],
    "adaptor": [
      "카키하라 유코"
    ],
    "character_design": [
      "히시누마 요시히토",
      "리쿠 린",
      "사토 토시코",
      "카타야마 마나부"
    ]
  }
},
{
  "id": 61443,
  "title": "춘하추동 대행자 봄의 춤",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/춘하추동 대행자 봄의 춤.webp",
  "day": "Sundays",
  "episodes": 14,
  "studio": [
    "WIT STUDIO"
  ],
  "staff": {
    "director": [
      "야마모토 켄"
    ],
    "adaptor": [
      "히사오 아유무"
    ],
    "character_design": [
      "후루하시 카즈히로",
      "토리이 나미코"
    ]
  }
},
{
  "id": 62913,
  "title": "니디 걸 오버도즈",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/니디 걸 오버도즈.webp",
  "day": "Sundays",
  "episodes": 13,
  "studio": [
    "요스타 픽처스"
  ],
  "staff": {
    "director": [
      "나카시마 마사오키"
    ],
    "adaptor": [
      "나카시마 마사오키"
    ],
    "character_design": [
      "타케이 아카리",
      "사이카이 켄지",
      "시미즈 카이토",
      "나카시마 마사오키",
      "나카노 유세이",
      "簡延軒",
      "리오",
      "ALBACROW"
    ]
  }
},
{
  "id": 61501,
  "title": "카난 님은 초보 악마",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/카난 님은 초보 악마.webp",
  "day": "Sundays",
  "episodes": 12,
  "studio": [
    "스튜디오 KAI"
  ],
  "staff": {
    "director": [
      "무로야 야스시"
    ],
    "adaptor": [
      "이케다 린타로"
    ],
    "character_design": [
      "미나가와 아카리",
      "시바타 치사"
    ]
  }
},
{
  "id": 62050,
  "title": "신의 정원이 딸린 쿠스노키 저택",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/신의 정원이 딸린 쿠스노키 저택.webp",
  "day": "Sundays",
  "episodes": 12,
  "studio": [
    "JUVENAGE"
  ],
  "staff": {
    "director": [
      "세키노 세키시게"
    ],
    "adaptor": [
      "코바야시 유지"
    ],
    "character_design": [
      "이노우에 유코",
      "노마 치카코",
      "ox"
    ]
  }
},
{
  "id": 62018,
  "title": "다다미 한 장짜리 방 만끽 생활",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/다다미 한 장짜리 방 만끽 생활.webp",
  "day": "Sundays",
  "episodes": 11,
  "studio": [
    "PRA"
  ],
  "staff": {
    "director": [
      "와타베 토시노리"
    ],
    "adaptor": [
      "타카하시 타츠야"
    ],
    "character_design": [
      "우에하라 후미야",
      "하라다 미네후미",
      "야부타 유키",
      "사키구치 사오리"
    ]
  }
},
{
  "id": 63352,
  "title": "부탁해 아이프리",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/부탁해 아이프리.webp",
  "day": "Sundays",
  "episodes": 0,
  "studio": [
    "OLM",
    "동우A&E"
  ],
  "staff": {
    "director": [
      "후지사쿠 준이치",
      "마츠나가 마사히로"
    ],
    "adaptor": [
      "이치카와 기가에몬"
    ],
    "character_design": [
      "니이 마나부"
    ]
  }
},
{
  "id": 59983,
  "title": "지팡이와 검의 위스토리아 Season2",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/지팡이와 검의 위스토리아 Season2.webp",
  "day": "Sundays",
  "episodes": 0,
  "studio": [
    "반다이 남코 픽처스",
    "액터스"
  ],
  "staff": {
    "director": [
      "나카노 히데아키",
      "요시하라 타츠야"
    ],
    "adaptor": [
      "키무라 노보루"
    ],
    "character_design": [
      "오노 사야카"
    ]
  }
},
{
  "id": 60055,
  "title": "요자쿠라 일가의 대작전 제2기",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/요자쿠라 일가의 대작전 제2기.webp",
  "day": "Sundays",
  "episodes": 0,
  "studio": [
    "SILVER LINK."
  ],
  "staff": {
    "director": [
      "미나토 미라이",
      "나카츠가와 타카히로"
    ],
    "adaptor": [
      "Minato",
      "Mirai"
    ],
    "character_design": [
      "타카하시 미즈키"
    ]
  }
},
{
  "id": 58877,
  "title": "다이아몬드 에이스 actII -Second Season-",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/다이아몬드 에이스 actII -Second Season-.webp",
  "day": "Sundays",
  "episodes": 0,
  "studio": [
    "OLM"
  ],
  "staff": {
    "director": [
      "오오바 히데아키"
    ],
    "adaptor": [
      "코누타 켄지"
    ],
    "character_design": [
      "쇼우지 야스카즈"
    ]
  }
},
{
  "id": 62342,
  "title": "메이드 양은 먹기만 할 뿐",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/메이드 양은 먹기만 할 뿐.webp",
  "day": "Sundays",
  "episodes": 12,
  "studio": [
    "EMT 스퀘어드",
    "매직버스"
  ],
  "staff": {
    "director": [
      "센보 료스케"
    ],
    "adaptor": [
      "타카하시 나츠코",
      "후지모토 사에카"
    ],
    "character_design": [
      "아베 치아키"
    ]
  }
},
{
  "id": 63667,
  "title": "마법의 자매 루루토리리",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/마법의 자매 루루토리리.webp",
  "day": "Sundays",
  "episodes": 0,
  "studio": [
    "스튜디오 피에로"
  ],
  "staff": {
    "director": [
      "도게 신타로"
    ],
    "scriptwriter": [
      "카키하라 유코"
    ],
    "character_design": [
      "토리이 나미코",
      "니시키 히로노",
      "소데야마 아사미"
    ]
  }
},
{
  "id": 21,
  "title": "원피스",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/원피스.webp",
  "day": "Sundays",
  "episodes": 0,
  "studio": [
    "토에이 애니메이션"
  ],
  "staff": {
    "director": [
      "마츠미 와타루"
    ],
    "adaptor": [
      "요네무라 쇼지"
    ],
    "character_design": [
      "마츠다 미도리",
      "류즈광",
      "타카하시 나루미",
      "이이다 하나오"
    ]
  }
},
{
  "id": 62171,
  "title": "검은 고양이와 마녀의 교실",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/검은 고양이와 마녀의 교실.webp",
  "day": "Sundays",
  "episodes": 0,
  "studio": [
    "라이덴 필름"
  ],
  "staff": {
    "director": [
      "타츠와 나오유키"
    ],
    "adaptor": [
      "고토 미도리"
    ],
    "character_design": [
      "오노다 타카유키",
      "니이즈마 다이스케",
      "하시모토 타카시"
    ]
  }
},
{
  "id": 62983,
  "title": "마리카쨩의 호감도는 망가져있다",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/마리카쨩의 호감도는 망가져있다.webp",
  "day": "Anomaly",
  "episodes": 8,
  "studio": [
    "스튜디오 레오"
  ],
  "staff": {
    "director": [
      "사사키 스미토"
    ],
    "adaptor": [
      "오타케 마사미츠"
    ],
    "character_design": [
      "나스 레이나"
    ]
  }
},
{
  "id": 63248,
  "title": "큰 여자는 좋아하세요",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/큰 여자는 좋아하세요.webp",
  "day": "Anomaly",
  "episodes": 0,
  "studio": [
    "Studio Hokiboshi"
  ],
  "staff": {
    "director": [
      "와라이 소타"
    ],
    "adaptor": [
      "쿠로사키 에요"
    ],
    "character_design": [
      "아시타카 나가에"
    ]
  }
},
{
  "id": 63310,
  "title": "음옥단지",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/음옥단지.webp",
  "day": "Anomaly",
  "episodes": 12,
  "studio": [
    "Elias"
  ],
  "staff": {
    "director": [
      "토코로 토시카츠"
    ],
    "adaptor": [
      "쿠로사키 에요"
    ],
    "character_design": [
      "니시모토 신고",
      "조야마 유이"
    ]
  }
},
{
  "id": 63304,
  "title": "마물을 먹는 모험가 ~나만 마물을 먹고 강해진다~",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/마물을 먹는 모험가 ~나만 마물을 먹고 강해진다~.webp",
  "day": "Fridays",
  "episodes": 0,
  "studio": [
    "이매지카인포스"
  ],
  "staff": {
    "director": [
      "사토 히카루"
    ],
    "adaptor": [],
    "character_design": [
      "카와쿠"
    ]
  }
},
{
  "id": 57779,
  "title": "도로헤도로 시즌 2",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/도로헤도로 시즌 2.webp",
  "day": "Web",
  "episodes": 11,
  "studio": [
    "MAPPA"
  ],
  "staff": {
    "director": [
      "하야시 유이치로"
    ],
    "adaptor": [
      "세코 히로시"
    ],
    "character_design": [
      "키시 토모히로",
      "키시 토모히로",
      "카네다 리코"
    ]
  }
},
{
  "id": 63572,
  "title": "댄덜라이언",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/댄덜라이언.webp",
  "day": "Web",
  "episodes": 7,
  "studio": [
    "NAZ"
  ],
  "staff": {
    "director": [
      "마타가 다이스케"
    ],
    "adaptor": [
      "스즈키 요스케"
    ],
    "character_design": [
      "아사리 아이"
    ]
  }
},
{
  "id": 62155,
  "title": "경멸하는 표정으로 팬티를 보여다오 R(리턴즈)",
  "quarter": "2분기",
  "thumbnail": "image/animeimg/Q2/경멸하는 표정으로 팬티를 보여다오 R(리턴즈).webp",
  "day": "Web",
  "episodes": 0,
  "studio": [
    "UWAN Pictures"
  ],
  "staff": {
    "director": [
      "후카세 사야"
    ],
    "adaptor": [
      "마에카와 아츠시"
    ],
    "character_design": []
  }
}
];