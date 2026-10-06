const Awards = [
  { id: 1, name: '대상', thumb: 'image/trophy/trophy-golden-cup-narrow.png', theme :'default'},
  { id: 2, name: '최우수상', thumb: 'image/trophy/trophy-golden-cup-narrow.png', theme: 'default'},
  { id: 3, name: '우수상', thumb: 'image/trophy/trophy-golden-cup-narrow.png', theme: 'default'},
  { id: 4, name: '올해의 밈', thumb: 'image/trophy/trophy-diamond-plain-wide.png', theme: 'meme'},
  { id: 5, name: '올해의 오프닝', thumb: 'image/trophy/trophy-music.png', theme: 'opening'},
  { id: 6, name: '올해의 엔딩', thumb: 'image/trophy/trophy-music.png', theme: 'ending'},
  { id: 7, name: '올해의 OST', thumb: 'image/trophy/trophy-music.png', theme: 'ost'},
  { id: 8, name: '신인 성우상', thumb: 'image/trophy/trophy-voice.png', theme: 'rookie_voice'},
  { id: 9, name: '올해의 남자 성우상', thumb: 'image/trophy/trophy-voice.png', theme: 'voice_male'},
  { id: 10, name: '올해의 여자 성우상', thumb: 'image/trophy/trophy-voice.png', theme: 'voice_female'},
  { id: 11, name: '올해의 남우 주연상', thumb: 'image/trophy/trophy-character.png', theme: 'character_male'},
  { id: 12, name: '올해의 여우 주연상', thumb: 'image/trophy/trophy-character.png', theme: 'character_female'},
  { id: 13, name: '베스트 커플상', thumb: 'image/trophy/trophy-couple-hands.png', theme: 'best_couple'},
  { id: 14, name: '베스트 각본상', thumb: 'image/trophy/trophy-writing.png', theme: 'scriptwriter'},
  { id: 15, name: '베스트 각색상', thumb: 'image/trophy/trophy-writing.png', theme: 'dramatization'},
  { id: 16, name: '베스트 감독상', thumb: 'image/trophy/trophy-director.png', theme: 'director'},
  { id: 17, name: '베스트 연출상', thumb: 'image/trophy/trophy-diamond-plain-wide.png', theme: 'direction'},
  { id: 18, name: '베스트 배경상', thumb: 'image/trophy/trophy-diamond-plain-wide.png', theme: 'background'},
  { id: 20, name: '올해의 설레발 상', thumb: 'image/trophy/trophy-balloon-needle-v2.png', theme: 'pv_mode'},
  { id: 21, name: '올해의 다크호스 상', thumb: 'image/trophy/trophy-dark-horse-left.png', theme: 'default'},
  { id: 22, name: '베스트 에피소드 상', thumb: 'image/trophy/trophy-diamond-plain-wide.png', theme: 'best_episode'},
  { id: 23, name: '올해의 시네마 상', thumb: 'image/trophy/trophy-cinema.png', theme: 'cinema'},
  { id: 24, name: '올해의 스튜디오 상', thumb: 'image/trophy/trophy-studio.png', theme: 'studio'},
  { id: 25, name: '올해의 시리즈', thumb: 'image/trophy/trophy-golden-cup-narrow.png', theme: 'top3'},
];

// 저장된 커스텀 상에도 현재 부문별 기본 트로피를 사용한다.
function getAwardTrophy(award) {
    if (String(award.name).replace(/\s/g, '') === '올해의다크호스상') {
        return 'image/trophy/trophy-dark-horse-left.png';
    }
    if (['대상', '최우수상', '우수상'].includes(String(award.name).trim())) {
        return 'image/trophy/trophy-golden-cup-narrow.png';
    }
    const designs = {
        opening: 'music', ending: 'music', ost: 'music',
        rookie_voice: 'voice', voice_male: 'voice', voice_female: 'voice',
        character_male: 'character', character_female: 'character', all_gender: 'character',
        best_couple: 'couple-hands', scriptwriter: 'writing', original: 'writing',
        dramatization: 'writing', director: 'director', cinema: 'cinema', studio: 'studio',
        top3: 'golden-cup-narrow', series: 'golden-cup-narrow'
    };
    return `image/trophy/trophy-${designs[award.theme] || 'diamond-plain-wide'}.png`;
}
