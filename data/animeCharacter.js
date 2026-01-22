const CharacterData = {
  // 1. 남자/여자 캐릭터 (동일 구조)
  "character_male": [
    {
      id: "char_m_01",
      quarter: "2024년 1분기",
      day: "mon",
      animeId: "a_2024_1q_01",
      animeTitle: "나 혼자만 레벨업",
      name: "성진우",
      gender: "male",
      thumbnail: "../images/char/sung_jinwoo.jpg"
    }
  ],
  
  // 2. 베스트 커플 (전용 구조)
  "best_couple": [
    {
      id: "couple_01",
      quarter: "2024년 2분기",
      animeId: "a_2024_2q_10",
      animeTitle: "내 마음의 위험한 녀석",
      names: { male: "이치카와 쿄타로", female: "야마다 안나" },
      thumbnails: { 
        male: "../images/char/ichikawa.jpg", 
        female: "../images/char/yamada.jpg" 
      }
    }
  ]
};