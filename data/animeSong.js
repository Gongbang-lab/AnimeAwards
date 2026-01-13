//오프닝, 엔딩, OST
function ytThumb(url) {
  return url.replace("watch?v=", "embed/") + "/maxresdefault.jpg";
}

const AnimeOpeningSongs = {
  Q1:[
    {
    id: 1,
    animeId: 101,
    title: "GO GO PARADISE!!",
    singer: "GRANRODEO",
    youtube: "https://youtu.be/KOhrAtk6BLw?si=y2lDNCoOv496ipKy",
    thumbnail: ytThumb("https://youtu.be/KOhrAtk6BLw?si=y2lDNCoOv496ipKy")
  },
  {
    id: 2,
    animeId: 102,
    title: "CATCH!!!",
    singer: "すりぃ(스리이)",
    youtube: "https://youtu.be/bJFqYBcIMcc?si=X0Qr7uwTJPqkSnJw",
    thumbnail: ytThumb("https://youtu.be/bJFqYBcIMcc?si=X0Qr7uwTJPqkSnJw")
  },
  {
    id: 3,
    animeId: 103,
    title: "綺麗。",
    singer: "ゆう(유우)",
    youtube: "https://youtu.be/kinVGoEF3O4?si=X-tObBehTr_xhjwi",
    thumbnail: ytThumb("https://youtu.be/kinVGoEF3O4?si=X-tObBehTr_xhjwi")
  },
  {
    id: 4,
    animeId: 104,
    title: "黄金の彼方(황금의 저편)",
    singer: "Awich × ALI",
    youtube: "https://youtu.be/qDXBnDo3Xpc?si=fULP-s08Csi06wzG",
    thumbnail: ytThumb("https://youtu.be/qDXBnDo3Xpc?si=fULP-s08Csi06wzG")
  },
  {
    id: 5,
    animeId: 105,
    title: "Sunday Morning",
    singer: "ILLIT",
    youtube: "고문공주님 오프닝 url",
    thumbnail: ytThumb("고문공주님 오프닝 url")
  },
  {
    id: 6,
    animeId: 106,
    title: "あいらびゅ♡(아이라뷰♡)",
    singer: "HoneyWorks",
    youtube: "https://youtu.be/6bCKqFGK5ko?si=WdAC6Qbse2dmIZWc",
    thumbnail: ytThumb("https://youtu.be/6bCKqFGK5ko?si=WdAC6Qbse2dmIZWc")
  },
  {
    id: 7,
    animeId: 107,
    title: "Lavish!!",
    singer: "吉乃(요시노)",
    youtube: "https://youtu.be/sGtwzOjZvJI?si=wCsjfO3hj7Zw0eb4",
    thumbnail: ytThumb("https://youtu.be/sGtwzOjZvJI?si=wCsjfO3hj7Zw0eb4")
  },
  {
    id: 8,
    animeId: 108,
    title: "Magic",
    singer: "kobore",
    youtube: "https://youtu.be/d-1B7OkYQJc?si=dEMkOmrPF3oh78uH",
    thumbnail: ytThumb("https://youtu.be/d-1B7OkYQJc?si=dEMkOmrPF3oh78uH")
  },
  {
    id: 9,
    animeId: 109,
    title: "月に向かって撃て",
    singer: "星街 すいせい(호시마치 스이세이)",
    youtube: "https://youtu.be/DeAD2b1x3tQ?si=19tRxAs03uYiJi2Z",
    thumbnail: ytThumb("https://youtu.be/DeAD2b1x3tQ?si=19tRxAs03uYiJi2Z")
  },
  {
    id: 9,
    animeId: 109,
    title: "月に向かって撃て",
    singer: "星街 すいせい(호시마치 스이세이)",
    youtube: "https://youtu.be/DeAD2b1x3tQ?si=19tRxAs03uYiJi2Z",
    thumbnail: ytThumb("https://youtu.be/DeAD2b1x3tQ?si=19tRxAs03uYiJi2Z")
  },
  {
    id: 10,
    animeId: 110,
    title: "YOAKE",
    singer: "blank paper",
    youtube: "https://youtu.be/kHUPdA8H6qk?si=QVQT5_ez_zEWGCsA",
    thumbnail: ytThumb("https://youtu.be/kHUPdA8H6qk?si=QVQT5_ez_zEWGCsA")
  },
  {
    id: 11,
    animeId: 111,
    title: "Make Me Wonder",
    singer: "Official髭男dism",
    youtube: "https://youtu.be/wTDmqzeugx8?si=478RoIkQIqTx9x37",
    thumbnail: ytThumb("https://youtu.be/wTDmqzeugx8?si=478RoIkQIqTx9x37")
  },
  {
    id: 12,
    animeId: 112,
    title: "Q.E.D",
    singer: "Official髭男dism",
    youtube: "https://youtu.be/CebPc_NsjiI?si=bOtHfSmiBGCOOaUe",
    thumbnail: ytThumb("https://youtu.be/CebPc_NsjiI?si=bOtHfSmiBGCOOaUe")
  },
  {
    id: 13,
    animeId: 113,
    title: "君が灯してくれた光を今",
    singer: "HoneyWorks feat.Hanon",
    youtube: "https://youtu.be/g4cxAS-73uQ?si=ZDeo60vrGjtGvIEd",
    thumbnail: ytThumb("https://youtu.be/g4cxAS-73uQ?si=ZDeo60vrGjtGvIEd")
  },
  {
    id: 14,
    animeId: 114,
    title: "We Can Do!!",
    singer: "石原夏織(이시하라 카오리)",
    youtube: "https://youtu.be/uAsa-E11Ubk?si=TQRIHxvPHO07Fgdy",
    thumbnail: ytThumb("https://youtu.be/uAsa-E11Ubk?si=TQRIHxvPHO07Fgdy")
  },
  {
    id: 15,
    animeId: 115,
    title: "TEST ME",
    singer: "ちゃんみな(챤미나)",
    youtube: "최애의 아이 3기 url",
    thumbnail: ytThumb("최애의 아이 3기 url")
  },
  {
    id: 16,
    animeId: 116,
    title: "¬Ersterbend",
    singer: "LIN (MADKID)",
    youtube: "https://youtu.be/VugBZB4gNGk?si=N0qBpJd7kFzBu7Ud",
    thumbnail: ytThumb("https://youtu.be/VugBZB4gNGk?si=N0qBpJd7kFzBu7Ud")
  },
  {
    id: 17,
    animeId: 117,
    title: "ERASE",
    singer: "THE ORAL CIGARETTES",
    youtube: "https://youtu.be/hYx3JeSqDYg?si=W-6okZ6Mcli0TqEk",
    thumbnail: ytThumb("https://youtu.be/hYx3JeSqDYg?si=W-6okZ6Mcli0TqEk")
  },
  {
    id: 18,
    animeId: 118,
    title: "Break off",
    singer: "SUPER★DRAGON",
    youtube: "https://youtu.be/iw0oJHZiP30?si=ZhLBoJ5-lFYW9SrI",
    thumbnail: ytThumb("https://youtu.be/iw0oJHZiP30?si=ZhLBoJ5-lFYW9SrI")
  },
  {
    id: 19,
    animeId: 119,
    title: "Gypso",
    singer: "牧島 輝(마키시마 히카루)",
    youtube: "https://youtu.be/JWC-EklqFtk?si=T3xAMOLYAQ35I2YN",
    thumbnail: ytThumb("https://youtu.be/JWC-EklqFtk?si=T3xAMOLYAQ35I2YN")
  },
  {
    id: 20,
    animeId: 120,
    title: "The Eye",
    singer: "白鲨JAWS(BaishaJAWS)",
    youtube: "https://youtu.be/qFHvA-sK-Ek?si=kv89Vrwi0t61XFJy",
    thumbnail: ytThumb("https://youtu.be/qFHvA-sK-Ek?si=kv89Vrwi0t61XFJy")
  },
  {
    id: 21,
    animeId: 121,
    title: "Kill the Noise",
    singer: "SPYAIR",
    youtube: "용사형의 처함 유튜브 url",
    thumbnail: ytThumb("용사형의 처함 유튜브 url")
  },
  {
    id: 22,
    animeId: 122,
    title: "光よ、僕に。(빛이여, 나에게.)",
    singer: "鬼頭明里(키토 아카리)",
    youtube: "https://youtu.be/zgLov1TFHL4?si=B8AnUZVI-PkfCEeX",
    thumbnail: ytThumb("https://youtu.be/zgLov1TFHL4?si=B8AnUZVI-PkfCEeX")
  },
  {
    id: 23,
    animeId: 123,
    title: "Ding-dong",
    singer: "阿部真央(아베 마오)",
    youtube: "투명남 OP",
    thumbnail: ytThumb("투명남 OP")
  },
  {
    id: 24,
    animeId: 124,
    title: "Happy Ever After feat. 由薫",
    singer: "鷲尾伶菜(와시오 레이나)",
    youtube: "https://youtu.be/ozfUpxMXx5k?si=CivQMPjVocWaiKIa",
    thumbnail: ytThumb("https://youtu.be/ozfUpxMXx5k?si=CivQMPjVocWaiKIa")
  },
  {
    id: 25,
    animeId: 125,
    title: "AIZO(애증)",
    singer: "King Gnu",
    youtube: "https://youtu.be/Xr032EhUDPw?si=BOBFiIXr2qzx_sYC",
    thumbnail: ytThumb("https://youtu.be/Xr032EhUDPw?si=BOBFiIXr2qzx_sYC")
  },
  {
    id: 26,
    animeId: 126,
    title: "Liberator",
    singer: "PassCode",
    youtube: "https://youtu.be/CUdMc-TYOIs?si=1SuwMxNJv5IGbVsi",
    thumbnail: ytThumb("https://youtu.be/CUdMc-TYOIs?si=1SuwMxNJv5IGbVsi")
  },
  {
    id: 27,
    animeId: 127,
    title: "LとR(L과R)",
    singer: "ME:I",
    youtube: "https://youtu.be/0Lxu3LIY-m4?si=DIgZtmI2oEzF09KG",
    thumbnail: ytThumb("https://youtu.be/0Lxu3LIY-m4?si=DIgZtmI2oEzF09KG")
  },
  {
    id: 28,
    animeId: 128,
    title: "魔法使いの日記",
    singer: "ME:I",
    youtube: "https://youtu.be/FXq7zmbs1ws?si=E9UbLs6vj6Ozrmam",
    thumbnail: ytThumb("https://youtu.be/FXq7zmbs1ws?si=E9UbLs6vj6Ozrmam")
  },
  {
    id: 29,
    animeId: 129,
    title: "lulu.",
    singer: "Mrs. GREEN APPLE",
    youtube: "https://youtu.be/MjeiIal1ZR0?si=pZrtKuTmLaiWMI-x",
    thumbnail: ytThumb("https://youtu.be/MjeiIal1ZR0?si=pZrtKuTmLaiWMI-x")
  },
  {
    id: 30,
    animeId: 130,
    title: "ファンキースパイス feat.TOMOO",
    singer: "BREIMEN",
    youtube: "https://youtu.be/q3jtZkx-vX4?si=yetA8sEJjiSUMI8g",
    thumbnail: ytThumb("https://youtu.be/q3jtZkx-vX4?si=yetA8sEJjiSUMI8g")
  },
  {
    id: 31,
    animeId: 131,
    title: "One In A Billion",
    singer: "엔하이픈",
    youtube: "https://youtu.be/aiAUHgVtGH0?si=Y5EAOkvo9NTVXM4H",
    thumbnail: ytThumb("https://youtu.be/aiAUHgVtGH0?si=Y5EAOkvo9NTVXM4H")
  },
  {
    id: 32,
    animeId: 132,
    title: "ハク",
    singer: "あたらよ(아타라요)",
    youtube: "https://youtu.be/XX3rhQgBpiI?si=CnKW1HtMy7quBftG",
    thumbnail: ytThumb("https://youtu.be/XX3rhQgBpiI?si=CnKW1HtMy7quBftG")
  },
  {
    id: 33,
    animeId: 133,
    title: "Ignis -イグニス-(이그니스)",
    singer: "西川貴教(니시카와 타카노리)",
    youtube: "https://youtu.be/FsQ09FXk_0o?si=5doQNgePfQYWVq-9",
    thumbnail: ytThumb("https://youtu.be/FsQ09FXk_0o?si=5doQNgePfQYWVq-9")
  },
  {
    id: 34,
    animeId: 134,
    title: "幻界(환계)",
    singer: "V.W.P",
    youtube: "https://youtu.be/zCbiWxWN1dE?si=VYgGgdIdDDokai6K",
    thumbnail: ytThumb("https://youtu.be/zCbiWxWN1dE?si=VYgGgdIdDDokai6K")
  },
  {
    id: 35,
    animeId: 135,
    title: "Gliding Claw",
    singer: "Sizuk",
    youtube: "https://youtu.be/tBqY4LcRsrE?si=JMUF_7g_qcI5Hhjx",
    thumbnail: ytThumb("https://youtu.be/tBqY4LcRsrE?si=JMUF_7g_qcI5Hhjx")
  },
  {
    id: 36,
    animeId: 136,
    title: "おきらくぜ～しょん(무사태평제~이션)",
    singer: "中島 怜(나카시마 레이)",
    youtube: "https://youtu.be/D_VIrnh8Gx4?si=1fXWYmvWdsCKRJnW",
    thumbnail: ytThumb("https://youtu.be/D_VIrnh8Gx4?si=1fXWYmvWdsCKRJnW")
  },
  {
    id: 37,
    animeId: 137,
    title: "ピカレスクヒーロー(피카레스크 히어로)",
    singer: "中島 怜(나카시마 레이)",
    youtube: "https://youtu.be/9PZ3t1RD9Rk?si=yLKw-rG7fUtAVh5r",
    thumbnail: ytThumb("https://youtu.be/9PZ3t1RD9Rk?si=yLKw-rG7fUtAVh5r")
  },
  {
    id: 38,
    animeId: 138,
    title: "PROVANT",
    singer: "SawanoHiroyuki[nZk]:Jean-Ken Johnny & TAKUMA",
    youtube: "https://youtu.be/tcC9g9dlv58?si=ZYaVoNmkdKz3tyPY",
    thumbnail: ytThumb("https://youtu.be/tcC9g9dlv58?si=ZYaVoNmkdKz3tyPY")
  },
  {
    id: 39,
    animeId: 139,
    title: "デッドエンド(데드 엔드)",
    singer: "五十嵐ハル(이가라시 하루)",
    youtube: "https://youtu.be/AidpQPSomnk?si=WEKG61LffKghOemU",
    thumbnail: ytThumb("https://youtu.be/AidpQPSomnk?si=WEKG61LffKghOemU")
  },
  {
    id: 40,
    animeId: 140,
    title: "ニンゲン",
    singer: "大石 昌良(오오이시 마사요시)",
    youtube: "https://youtu.be/RLVTVMsb6Ic?si=80dI7kFkqMCh_mCV",
    thumbnail: ytThumb("https://youtu.be/RLVTVMsb6Ic?si=80dI7kFkqMCh_mCV")
  },
  {
    id: 41,
    animeId: 141,
    title: "GUN POWDER",
    singer: "TOOBOE",
    youtube: "https://youtu.be/0uwmTsnMSV0?si=CeLcKJ-kSO6ZaX6Q",
    thumbnail: ytThumb("https://youtu.be/0uwmTsnMSV0?si=CeLcKJ-kSO6ZaX6Q")
  },
  {
    id: 42,
    animeId: 142,
    title: "Sweet Magic",
    singer: "F/ACE",
    youtube: "https://youtu.be/cugf5FQ4fLE?si=0jR-RTkt4KxDDKb4",
    thumbnail: ytThumb("https://youtu.be/cugf5FQ4fLE?si=0jR-RTkt4KxDDKb4")
  },
  {
    id: 43,
    animeId: 143,
    title: "Cold Night",
    singer: "HANA",
    youtube: "메달리스트 2기 OP",
    thumbnail: ytThumb("메달리스트 2기 OP")
  },
  {
    id: 44,
    animeId: 144,
    title: "ハートにヒント！名探偵プリキュア！(하트에 힌트! 명탐정 프리큐어!)",
    singer: "石井あみ(이시이 아미)",
    youtube: "명탐정 프리큐어! OP",
    thumbnail: ytThumb("명탐정 프리큐어! OP")
  },
  {
    id: 45,
    animeId: 145,
    title: "うるわし",
    singer: "UNISON SQUARE GARDEN",
    youtube: "https://youtu.be/adm-a1C7TVk?si=248dATn21pJ1qIPS",
    thumbnail: ytThumb("https://youtu.be/adm-a1C7TVk?si=248dATn21pJ1qIPS")
  },
  {
    id: 46,
    animeId: 146,
    title: "メガネを外して(안경을 벗고)",
    singer: "乃紫(노아)",
    youtube: "https://youtu.be/XOKQluw_YLU?si=TX08SheTPt9Xxl2I",
    thumbnail: ytThumb("https://youtu.be/XOKQluw_YLU?si=TX08SheTPt9Xxl2I")
  },
  {
    id: 47,
    animeId: 147,
    title: "まぼろしの行方(환상의 행방)",
    singer: "ヰ世界情緒(이세계정서)",
    youtube: "https://youtu.be/qAlPo5EHilg?si=GERn1WpqBIztIxO9",
    thumbnail: ytThumb("https://youtu.be/qAlPo5EHilg?si=GERn1WpqBIztIxO9")
  },
  {
    id: 48,
    animeId: 148,
    title: "アドレナ",
    singer: "YOASOBI",
    youtube: "https://youtu.be/ARqP5ohiubY?si=jWf_WthucI8FTTot",
    thumbnail: ytThumb("https://youtu.be/ARqP5ohiubY?si=jWf_WthucI8FTTot")
  },
  {
    id: 49,
    animeId: 149,
    title: "ラケナリアの夢",
    singer: "ヰ世界情緒(이세계정서)",
    youtube: "https://youtu.be/e_VgQkPHhDE?si=gNkWu_U4BYVydhfg",
    thumbnail: ytThumb("https://youtu.be/e_VgQkPHhDE?si=gNkWu_U4BYVydhfg")
  },
  {
    id: 50,
    animeId: 150,
    title: "シルベ(이정표)",
    singer: "常闇トワ(토코야미 토와)",
    youtube: "https://youtu.be/Jp6G6iiKMBc?si=39h4TZodBNdlWnn_",
    thumbnail: ytThumb("https://youtu.be/Jp6G6iiKMBc?si=39h4TZodBNdlWnn_")
  },
  {
    id: 51,
    animeId: 151,
    title: "愛のファンファーレ",
    singer: "高垣彩陽feat.城田 優(타카가키 아야히 feat.시로타 유)",
    youtube: "https://youtu.be/GBs5dPA_iQs?si=Gj_pKBw2EfvA7SOu",
    thumbnail: ytThumb("https://youtu.be/GBs5dPA_iQs?si=Gj_pKBw2EfvA7SOu")
  },
  {
    id: 52,
    animeId: 152,
    title: "ソナーレ(소나레)",
    singer: "TOMOO",
    youtube: "https://youtu.be/g_nDJVMvSD8?si=589n8QEfUcuBFF8d",
    thumbnail: ytThumb("https://youtu.be/g_nDJVMvSD8?si=589n8QEfUcuBFF8d")
  },
  {
    id: 53,
    animeId: 153,
    title: "はみだし御免",
    singer: "ポルノグラフィティ(포르노 그라피티)",
    youtube: "https://youtu.be/3GZ6TUiQv2I?si=V5ZftCoZj2nNicu-",
    thumbnail: ytThumb("https://youtu.be/3GZ6TUiQv2I?si=V5ZftCoZj2nNicu-")
  },
  {
    id: 54,
    animeId: 154,
    title: "TIMELESS POWER feat. MOTSU",
    singer: "芹澤 優(세리자와 유우)",
    youtube: "https://youtu.be/toEH-or8-JY?si=7j1wk2kU90JHUgnj",
    thumbnail: ytThumb("https://youtu.be/toEH-or8-JY?si=7j1wk2kU90JHUgnj")
  },
  {
    id: 55,
    animeId: 155,
    title: "かすかなはな(가냘픈 꽃)",
    singer: "木谷竜也 feat. BABYMETAL(키타니 타츠야)",
    youtube: "https://youtu.be/gHIA3Mhc618?si=VCwTgdKo5RP7eobi",
    thumbnail: ytThumb("https://youtu.be/gHIA3Mhc618?si=VCwTgdKo5RP7eobi")
  },
  {
    id: 56,
    animeId: 156,
    title: "ムリムリ進化論(무리무리 진화론)",
    singer: "ナナヲアカリ(나나오아카리)",
    youtube: "https://youtu.be/rV_lQGGtPt0?si=cR1Al2yPZy9uWJNj",
    thumbnail: ytThumb("https://youtu.be/rV_lQGGtPt0?si=cR1Al2yPZy9uWJNj")
  },
  {
    id: 57,
    animeId: 166,
    title: "듀얼마스터즈 LOST OP",
    singer: "듀얼마스터즈 LOST OP",
    youtube: "듀얼마스터즈 LOST OP",
    thumbnail: ytThumb("듀얼마스터즈 LOST OP")
  },
  {
    id: 58,
    animeId: 167,
    title: "스틸 볼 런 OP",
    singer: "스틸 볼 런 OP",
    youtube: "스틸 볼 런 OP",
    thumbnail: ytThumb("스틸 볼 런 OP")
  },
  {
    id: 59,
    animeId: 168,
    title: "비스타즈 OP",
    singer: "비스타즈 OP",
    youtube: "비스타즈 OP",
    thumbnail: ytThumb("비스타즈 OP")
  }
  
],
  Q2:[],
  Q3:[],
  Q4:[],
};

const AnimeEndingSongs = {
  Q1:[
    {
    id: 1,
    animeId: 101,
    title: "明日天気になぁれ",
    singer: "寺島拓篤(테라시마 타쿠마)",
    youtube: "https://youtu.be/UQYuIdD-dwk?si=tqDln0uAreG4QcA8",
    thumbnail: ytThumb("https://youtu.be/UQYuIdD-dwk?si=tqDln0uAreG4QcA8")
  },
  {
    id: 2,
    animeId: 102,
    title: "ミス・ユー",
    singer: "シャイトープ(샤이토프)",
    youtube: "https://youtu.be/S3HQmsf7BSY?si=bJ3W-BNrF7B3jxW5",
    thumbnail: ytThumb("https://youtu.be/S3HQmsf7BSY?si=bJ3W-BNrF7B3jxW5")
  },
  {
    id: 3,
    animeId: 103,
    title: "若葉のころ",
    singer: "清浦夏実(키요우라 나츠미)",
    youtube: "https://youtu.be/kCERfeJ2HWI?si=l1YdgH_wqL1G_hXH",
    thumbnail: ytThumb("https://youtu.be/kCERfeJ2HWI?si=l1YdgH_wqL1G_hXH")
  },
  {
    id: 4,
    animeId: 104,
    title: "골든카무이 엔딩",
    singer: "골든카무이 엔딩 가수",
    youtube: "https://youtu.be/kCERfeJ2HWI?si=l1YdgH_wqL1G_hXH",
    thumbnail: ytThumb("https://youtu.be/kCERfeJ2HWI?si=l1YdgH_wqL1G_hXH")
  },
  {
    id: 5,
    animeId: 105,
    title: "お姫様にはなれない",
    singer: "ユイカ(유이카)",
    youtube: "고문공주님 유튜브 url",
    thumbnail: ytThumb("고문공주님 유튜브 url")
  },
  {
    id: 6,
    animeId: 106,
    title: "あまのじゃく(청개구리)",
    singer: "小玉ひかり(코다마 히카리)",
    youtube: "https://youtu.be/UgDL_Y4Qi8Y?si=r_Azjqa5PbVXuU2K",
    thumbnail: ytThumb("https://youtu.be/UgDL_Y4Qi8Y?si=r_Azjqa5PbVXuU2K")
  },
  {
    id: 7,
    animeId: 107,
    title: "キミ攻略ゲーム",
    singer: "大宮陽和(오오미야 히요리)",
    youtube: "용사파티 엔딩 url",
    thumbnail: ytThumb("용사파티 엔딩 url")
  },
  {
    id: 8,
    animeId: 108,
    title: "Back to Back",
    singer: "森崎 ウィン(모리사키 윈)",
    youtube: "https://youtu.be/bXdibNTWS_M?si=owr2nTf_qKcGrQ39",
    thumbnail: ytThumb("https://youtu.be/bXdibNTWS_M?si=owr2nTf_qKcGrQ39")
  },
  {
    id: 9,
    animeId: 109,
    title: "声の軌跡",
    singer: "Soala",
    youtube: "한밤중 하트튠 엔딩 url",
    thumbnail: ytThumb("한밤중 하트튠 엔딩 url")
  },
  {
    id: 10,
    animeId: 110,
    title: "POWER",
    singer: "ONE OR EIGHT",
    youtube: "사무라이 트루퍼 엔딩 url",
    thumbnail: ytThumb("사무라이 트루퍼 엔딩 url")
  },
  {
    id: 11,
    animeId: 111,
    title: "Turn It Up",
    singer: "a子(a코)",
    youtube: "https://youtu.be/MFNM8RXPDuE?si=qhR08nrazPOoCUX1",
    thumbnail: ytThumb("https://youtu.be/MFNM8RXPDuE?si=qhR08nrazPOoCUX1")
  },
  {
    id: 12,
    animeId: 112,
    title: "人形の街",
    singer: "小林 私(코바야시 와타시)",
    youtube: "아르네의 사건부 유튜브 url",
    thumbnail: ytThumb("아르네의 사건부 유튜브 url")
  },
  {
    id: 13,
    animeId: 113,
    title: "君の隣は空気が美味しい",
    singer: "HoneyWorks feat.Kotoha",
    youtube: "29세 독신 중견 유튜브 url",
    thumbnail: ytThumb("29세 독신 중견 유튜브 url")
  },
  {
    id: 14,
    animeId: 114,
    title: "いっこにこにこ(싱긋 방긋방긋)",
    singer: "쟈히, 두, 아리만",
    youtube: "https://youtu.be/Rn-Epwvu64Q?si=EDUZcKHiBD8XPuvB",
    thumbnail: ytThumb("https://youtu.be/Rn-Epwvu64Q?si=EDUZcKHiBD8XPuvB")
  },
  {
    id: 15,
    animeId: 115,
    title: "セレナーデ(세레나데)",
    singer: "なとり(나토리)",
    youtube: "최애의 아이 3기 url",
    thumbnail: ytThumb("최애의 아이 3기 url")
  },
  {
    id: 16,
    animeId: 116,
    title: "祈り(기도)",
    singer: "藤川千愛(후지카와 치아이)",
    youtube: "https://youtu.be/3l4Yu6HMBwg?si=tr79LWaDFu5zcCfk",
    thumbnail: ytThumb("https://youtu.be/3l4Yu6HMBwg?si=tr79LWaDFu5zcCfk")
  },
  {
    id: 17,
    animeId: 117,
    title: "MAGICAL",
    singer: "Ayumu Imazu",
    youtube: "https://youtu.be/II0A080dreo?si=jN2MEDxmMk0WPFVH",
    thumbnail: ytThumb("https://youtu.be/II0A080dreo?si=jN2MEDxmMk0WPFVH")
  },
  {
    id: 18,
    animeId: 118,
    title: "You'll Be In My Heart〜そばに〜(곁에)",
    singer: "알리체",
    youtube: "https://youtu.be/ohFsMWho5z4?si=7zvzBOQYxQtU8slz",
    thumbnail: ytThumb("https://youtu.be/ohFsMWho5z4?si=7zvzBOQYxQtU8slz")
  },
  {
    id: 19,
    animeId: 119,
    title: "うっすら(어렴풋이)",
    singer: "直田姫奈(스구타 히나)",
    youtube: "https://youtu.be/SMwIXJb0a5o?si=PYlXbtOv5cpEjdNy",
    thumbnail: ytThumb("https://youtu.be/SMwIXJb0a5o?si=PYlXbtOv5cpEjdNy")
  },
  {
    id: 20,
    animeId: 120,
    title: "Lull",
    singer: "AK Liu Zhang",
    youtube: "https://youtu.be/e3I3kbHtYvo?si=D64XOMNolknVBV47",
    thumbnail: ytThumb("https://youtu.be/e3I3kbHtYvo?si=D64XOMNolknVBV47")
  },
  {
    id: 21,
    animeId: 121,
    title: "용사형의 처함 ED",
    singer: "용사형의 처함 ED",
    youtube: "용사형의 처함 ED",
    thumbnail: ytThumb("용사형의 처함 ED")
  },
  {
    id: 22,
    animeId: 122,
    title: "Cipher Cipher",
    singer: "花澤香菜(하나자와 카나)",
    youtube: "https://youtu.be/qPkHdynnfFI?si=CAVZdGcIpOvTczlQ",
    thumbnail: ytThumb("https://youtu.be/qPkHdynnfFI?si=CAVZdGcIpOvTczlQ")
  },
  {
    id: 23,
    animeId: 123,
    title: "星眼鏡(별안경)",
    singer: "石原夏織(이시하라 카오리)",
    youtube: "https://youtu.be/QzpVZuNRyGo?si=fJ6VONk_9Y6WOQh_",
    thumbnail: ytThumb("https://youtu.be/QzpVZuNRyGo?si=fJ6VONk_9Y6WOQh_")
  },
  {
    id: 24,
    animeId: 124,
    title: "カメリア",
    singer: "田村ゆかり(타무라 유카리)",
    youtube: "에리스의 성배 ED",
    thumbnail: ytThumb("에리스의 성배 ED")
  },
  {
    id: 25,
    animeId: 125,
    title: "よあけのうた(새벽의 노래)",
    singer: "jo0ji",
    youtube: "https://youtu.be/-i8LR9-WVps?si=k1WZVFG4DKbQK-rS",
    thumbnail: ytThumb("https://youtu.be/-i8LR9-WVps?si=k1WZVFG4DKbQK-rS")
  },
  {
    id: 26,
    animeId: 126,
    title: "I need",
    singer: "田中有紀(타나카 유키)",
    youtube: "https://youtu.be/2q2mJyyQBhc?si=lemDOIUTgjHJcFhg",
    thumbnail: ytThumb("https://youtu.be/2q2mJyyQBhc?si=lemDOIUTgjHJcFhg")
  },
  {
    id: 27,
    animeId: 127,
    title: "初恋(첫사랑)",
    singer: "berry meet",
    youtube: "https://youtu.be/ycgs83FGgJA?si=m-6oCxBkl5HBuD7W",
    thumbnail: ytThumb("https://youtu.be/ycgs83FGgJA?si=m-6oCxBkl5HBuD7W")
  },
  {
    id: 28,
    animeId: 128,
    title: "君は",
    singer: "Ms.OOJA",
    youtube: "https://youtu.be/jCP_ZA_ga30?si=vhRc3wCDopu6g6GP",
    thumbnail: ytThumb("https://youtu.be/jCP_ZA_ga30?si=vhRc3wCDopu6g6GP")
  },
  {
    id: 29,
    animeId: 129,
    title: "The Story of Us",
    singer: "milet",
    youtube: "장송의 프리렌 ED",
    thumbnail: ytThumb("장송의 프리렌 ED")
  },
  {
    id: 30,
    animeId: 130,
    title: "ステキッ！！",
    singer: "離婚伝説(이혼전설)",
    youtube: "https://youtu.be/HNL5hyuOwpA?si=Z5clk7CkrfI1tq8V",
    thumbnail: ytThumb("https://youtu.be/HNL5hyuOwpA?si=Z5clk7CkrfI1tq8V")
  },
  {
    id: 31,
    animeId: 131,
    title: "CRIMINAL LOVE",
    singer: "엔하이픈",
    youtube: "https://youtu.be/TFI2NB7oaxA?si=kRaU7Yo3d5onWPh8",
    thumbnail: ytThumb("https://youtu.be/TFI2NB7oaxA?si=kRaU7Yo3d5onWPh8")
  },
  {
    id: 32,
    animeId: 132,
    title: "Sanctuary",
    singer: "花耶(카야)",
    youtube: "https://youtu.be/B2j1_hMQWME?si=-xC2R8rRSTYDBf0l",
    thumbnail: ytThumb("https://youtu.be/B2j1_hMQWME?si=-xC2R8rRSTYDBf0l")
  },
  {
    id: 33,
    animeId: 133,
    title: "Speak of the Devil",
    singer: "Survive Said The Prophet",
    youtube: "불꽃 소방대 2쿨 ED",
    thumbnail: ytThumb("불꽃 소방대 2쿨 ED")
  },
  {
    id: 34,
    animeId: 134,
    title: "ギラギラ",
    singer: "RealRomantic",
    youtube: "카드파이트 ED",
    thumbnail: ytThumb("카드파이트 ED")
  },
  {
    id: 35,
    animeId: 135,
    title: "Sky Clipper",
    singer: "導凰(TAO) & 朔雀(SAK)",
    youtube: "https://youtu.be/5zqV7_9TVu4?si=aIAACkygmyZagaU5",
    thumbnail: ytThumb("https://youtu.be/5zqV7_9TVu4?si=aIAACkygmyZagaU5")
  },
  {
    id: 36,
    animeId: 136,
    title: "Make it",
    singer: "大渕野々花(오오부치 노노카)",
    youtube: "https://youtu.be/Scnv6CdB0XI?si=FyEzmNtxQe44HDE2",
    thumbnail: ytThumb("https://youtu.be/Scnv6CdB0XI?si=FyEzmNtxQe44HDE2")
  },
  {
    id: 37,
    animeId: 137,
    title: "スターダスト(스타더스트)",
    singer: "FOMARE",
    youtube: "https://youtu.be/Dz3TitQnWvo?si=SGJkK_wTftQkxSrW",
    thumbnail: ytThumb("https://youtu.be/Dz3TitQnWvo?si=SGJkK_wTftQkxSrW")
  },
  {
    id: 38,
    animeId: 138,
    title: "潜在的なアイ(잠재적인 사랑)",
    singer: "13.3g",
    youtube: "https://youtu.be/P7ZcQSEP6PU?si=7lDw_yar4qLXtEGl",
    thumbnail: ytThumb("https://youtu.be/P7ZcQSEP6PU?si=7lDw_yar4qLXtEGl")
  },
  {
    id: 39,
    animeId: 139,
    title: "来世はどうせ(다음 생은 어차피)",
    singer: "金子 みゆ(카네코 미유)",
    youtube: "https://youtu.be/umoFdK0YpfU?si=e1gbwdaZuDt3_yEf",
    thumbnail: ytThumb("https://youtu.be/umoFdK0YpfU?si=e1gbwdaZuDt3_yEf")
  },
  {
    id: 40,
    animeId: 140,
    title: "人間カムトゥルー!",
    singer: "미나즈키 쿄카, 오오가미 이사키, 우사미 스이, 하네다 토바리",
    youtube: "https://youtu.be/jQhxE6YPWZg?si=C10lohN6CyAfKpjz",
    thumbnail: ytThumb("https://youtu.be/jQhxE6YPWZg?si=C10lohN6CyAfKpjz")
  },
  {
    id: 41,
    animeId: 141,
    title: "メンタルレンタル",
    singer: "紫 今(무라사키 이마)",
    youtube: "https://youtu.be/6owf1r3HGpM?si=6UYa4ICyflGZxfFj",
    thumbnail: ytThumb("https://youtu.be/6owf1r3HGpM?si=6UYa4ICyflGZxfFj")
  },
  {
    id: 42,
    animeId: 142,
    title: "花と夢(꽃과 꿈)",
    singer: "F/ACE",
    youtube: "https://youtu.be/_2dl3blJgy8?si=RAx8scMlCp7Wrynf",
    thumbnail: ytThumb("https://youtu.be/_2dl3blJgy8?si=RAx8scMlCp7Wrynf")
  },
  {
    id: 43,
    animeId: 143,
    title: "Rookies",
    singer: "Conton Candy",
    youtube: "메달리스트 2기 ED",
    thumbnail: ytThumb("메달리스트 2기 ED")
  },
  {
    id: 44,
    animeId: 144,
    title: "なぜ？謎？！ANSWER(왜? 수수께끼? ANSWER)",
    singer: "熊田茜音 & 増井優花(쿠마다 아카네 & 마스이 유우카)",
    youtube: "명탐정 프리큐어! ED",
    thumbnail: ytThumb("명탐정 프리큐어! ED")
  },
  {
    id: 45,
    animeId: 145,
    title: "アザレアの風(어제일리어의 바람)",
    singer: "UNISON SQUARE GARDEN",
    youtube: "아름다운 초저녁달 ED",
    thumbnail: ytThumb("아름다운 초저녁달 ED")
  },
  {
    id: 46,
    animeId: 146,
    title: "ピュア feat.橋本絵莉子(퓨어 feat.하시모토 에리코)",
    singer: "PAS TASTA feat. 하시모토 에리코",
    youtube: "정반대의 너와 나 ED",
    thumbnail: ytThumb("정반대의 너와 나 ED")
  },
  {
    id: 47,
    animeId: 147,
    title: "Playmour feat. カヤちゃん(카야 짱)",
    singer: "導凰(TAO) & 朔雀(SAK)",
    youtube: "https://youtu.be/OGCOFl9HDlw?si=4dIIQntbQWmg5LvE",
    thumbnail: ytThumb("https://youtu.be/OGCOFl9HDlw?si=4dIIQntbQWmg5LvE")
  },
  {
    id: 48,
    animeId: 148,
    title: "BABY",
    singer: "YOASOBI",
    youtube: "https://youtu.be/QnFRBzxmC4s?si=ETeoiosjfxBTx0hn",
    thumbnail: ytThumb("https://youtu.be/QnFRBzxmC4s?si=ETeoiosjfxBTx0hn")
  },
  {
    id: 49,
    animeId: 149,
    title: "Story feat. katagiri",
    singer: "KOHTA YAMAMOTO",
    youtube: "https://youtu.be/ufr75cLrLjk?si=3XdYmdVshgZ_Czm8",
    thumbnail: ytThumb("https://youtu.be/ufr75cLrLjk?si=3XdYmdVshgZ_Czm8")
  },
  {
    id: 50,
    animeId: 150,
    title: "sukuu",
    singer: "Nowlu",
    youtube: "https://youtu.be/-Gl_0CqyUjU?si=ZNvBll1EeBbH62rA",
    thumbnail: ytThumb("https://youtu.be/-Gl_0CqyUjU?si=ZNvBll1EeBbH62rA")
  },
  {
    id: 51,
    animeId: 151,
    title: "魔法の音",
    singer: "高垣彩陽feat.城田 優(타카가키 아야히 feat.시로타 유)",
    youtube: "https://youtu.be/MOsbaJaL02k?si=fESRYQ_AblHuPgur",
    thumbnail: ytThumb("https://youtu.be/MOsbaJaL02k?si=fESRYQ_AblHuPgur")
  },
  {
    id: 52,
    animeId: 152,
    title: "言伝(전언)",
    singer: "BIALYSTOCKS",
    youtube: "https://youtu.be/fyzUQiDSXqs?si=qkOO3sTC2bHwomGV",
    thumbnail: ytThumb("https://youtu.be/fyzUQiDSXqs?si=qkOO3sTC2bHwomGV")
  },
  {
    id: 53,
    animeId: 153,
    title: "陽炎",
    singer: "大泉 洋(오오이즈미 요)",
    youtube: "화식조 ED",
    thumbnail: ytThumb("화식조 ED")
  },
  {
    id: 54,
    animeId: 154,
    title: "予感の途中 Prod. ☆Taku Takahashi (m-flo)",
    singer: "Himika Akaneya",
    youtube: "MF 고스트 3기 ED",
    thumbnail: ytThumb("MF 고스트 3기 ED")
  },
  {
    id: 55,
    animeId: 155,
    title: "PERSONAL",
    singer: "女王蜂 (QUEEN BEE)",
    youtube: "https://youtu.be/N-Go4JtUw6U?si=qC03Mh5ig2b64Q2X",
    thumbnail: ytThumb("https://youtu.be/N-Go4JtUw6U?si=qC03Mh5ig2b64Q2X")
  },
  {
    id: 56,
    animeId: 156,
    title: "迷っちゃうわ(망설이게 돼)",
    singer: "フィロソフィーのダンス(필로소피의 댄스)",
    youtube: "https://youtu.be/iVAVffggNlw?si=INp1oef4_7xH16H_",
    thumbnail: ytThumb("https://youtu.be/iVAVffggNlw?si=INp1oef4_7xH16H_")
  },
  {
    id: 57,
    animeId: 166,
    title: "듀얼마스터즈 LOST ED",
    singer: "듀얼마스터즈 LOST ED",
    youtube: "듀얼마스터즈 LOST ED",
    thumbnail: ytThumb("듀얼마스터즈 LOST ED")
  },
  {
    id: 58,
    animeId: 167,
    title: "스틸 볼 런 ED",
    singer: "스틸 볼 런 ED",
    youtube: "스틸 볼 런 ED",
    thumbnail: ytThumb("스틸 볼 런 ED")
  },
  {
    id: 59,
    animeId: 168,
    title: "비스타즈 ED",
    singer: "비스타즈 ED",
    youtube: "비스타즈 ED",
    thumbnail: ytThumb("비스타즈 ED")
  }
],
  Q2:[],
  Q3:[],
  Q4:[],
};

const AnimeOST = {
  Q1:[
    {
    id: 1,
    animeId: 101,
    title: "勇者",
    singer: "YOASOBI",
    thumbnail: 'https://youtube.com/.../maxresdefault.jpg',
    youtube: "https://youtube.com/..."
  },
  {
    id: 2,
    animeId: 102,
    title: "勇者",
    singer: "YOASOBI",
    thumbnail: '',
    youtube: "https://youtube.com/..."
  }
],
  Q2:[],
  Q3:[],
  Q4:[],
};