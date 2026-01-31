# 주술회전 카드 게임 - 캐릭터 데이터 (Part 2)

## 캐릭터 목록 (20장)

### S등급 (특급) - 3장

```typescript
const S_GRADE: CharacterCard[] = [
  {
    id: "gojo_satoru",
    name: { ko: "고죠 사토루", ja: "五条悟", en: "Gojo Satoru" },
    grade: "S",
    attribute: "BARRIER",
    imageUrl: "/images/characters/gojo_satoru.png",
    baseStats: { atk: 20, def: 18, spd: 20, ce: 25, hp: 17 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: {
      name: "무량공처 (無量空處)",
      description: "무한의 정보를 흘려보내 행동불능 상태로 만든다",
      effect: {
        type: "SPEED_CONTROL",
        trigger: "ALWAYS",
        value: { stat: "spd", amount: -20 },
        target: "ENEMY"
      }
    },
    achievements: [
      { id: "gojo_1", name: "무하의 경지", description: "고죠로 10승", 
        condition: { type: "WINS", count: 10 }, 
        reward: { type: "ITEM", itemId: "six_eyes" } },
      { id: "gojo_2", name: "최강의 증명", description: "S등급 상대로 5승", 
        condition: { type: "DEFEAT_SPECIFIC", target: "S", count: 5 }, 
        reward: { type: "ITEM", itemId: "infinity_ring" } }
    ]
  },
  {
    id: "ryomen_sukuna",
    name: { ko: "료멘 스쿠나", ja: "両面宿儺", en: "Ryomen Sukuna" },
    grade: "S",
    attribute: "CURSE",
    imageUrl: "/images/characters/sukuna.png",
    baseStats: { atk: 25, def: 15, spd: 18, ce: 22, hp: 20 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: {
      name: "해 (捌)",
      description: "만물을 베어내는 참격, 방어 무시",
      effect: {
        type: "IGNORE_DEFENSE",
        trigger: "ALWAYS",
        value: 10,
        target: "ENEMY"
      }
    },
    achievements: [
      { id: "sukuna_1", name: "저주의 왕", description: "스쿠나로 15승", 
        condition: { type: "WINS", count: 15 }, 
        reward: { type: "ITEM", itemId: "malevolent_shrine" } }
    ]
  },
  {
    id: "kenjaku",
    name: { ko: "켄자쿠", ja: "羂索", en: "Kenjaku" },
    grade: "S",
    attribute: "SOUL",
    imageUrl: "/images/characters/kenjaku.png",
    baseStats: { atk: 18, def: 16, spd: 17, ce: 24, hp: 20 },
    growthStats: { primary: "ce", secondary: "hp" },
    skill: {
      name: "육체 전환",
      description: "천년의 지혜로 상대 술식 무효화",
      effect: {
        type: "SKILL_NULLIFY",
        trigger: "ALWAYS",
        value: 1,
        target: "ENEMY"
      }
    },
    achievements: [
      { id: "kenjaku_1", name: "천년의 계략", description: "모든 S등급 격파", 
        condition: { type: "DEFEAT_SPECIFIC", target: "ALL_S", count: 1 }, 
        reward: { type: "ITEM", itemId: "cursed_manipulation" } }
    ]
  }
];
```

### A등급 (1급) - 7장

```typescript
const A_GRADE: CharacterCard[] = [
  {
    id: "fushiguro_toji",
    name: { ko: "후시구로 토지", ja: "伏黒甚爾", en: "Fushiguro Toji" },
    grade: "A",
    attribute: "BODY",
    imageUrl: "/images/characters/toji.png",
    baseStats: { atk: 22, def: 14, spd: 19, ce: 0, hp: 18 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: {
      name: "천여함수 (天与咸受)",
      description: "저주력 0, 압도적 신체 능력",
      effect: {
        type: "STAT_MODIFY",
        trigger: "ALWAYS",
        value: { stat: "atk", amount: 8 },
        target: "SELF"
      }
    },
    achievements: [
      { id: "toji_1", name: "술사 킬러", description: "토지로 고죠 격파", 
        condition: { type: "DEFEAT_SPECIFIC", target: "gojo_satoru", count: 1 }, 
        reward: { type: "ITEM", itemId: "inverted_spear" } }
    ]
  },
  {
    id: "nanami_kento",
    name: { ko: "나나미 켄토", ja: "七海建人", en: "Nanami Kento" },
    grade: "A",
    attribute: "BODY",
    imageUrl: "/images/characters/nanami.png",
    baseStats: { atk: 18, def: 16, spd: 15, ce: 18, hp: 17 },
    growthStats: { primary: "atk", secondary: "def" },
    skill: {
      name: "7:3 비율",
      description: "약점을 정확히 노려 치명타",
      effect: {
        type: "CRITICAL",
        trigger: "PROBABILITY",
        probability: 40,
        value: 2.0,
        target: "ENEMY"
      }
    },
    achievements: [
      { id: "nanami_1", name: "잔업은 싫어", description: "연속 3승", 
        condition: { type: "WIN_STREAK", count: 3 }, 
        reward: { type: "ITEM", itemId: "ratio_blade" } }
    ]
  },
  {
    id: "jogo",
    name: { ko: "죠고", ja: "漏瑚", en: "Jogo" },
    grade: "A",
    attribute: "CONVERT",
    imageUrl: "/images/characters/jogo.png",
    baseStats: { atk: 20, def: 12, spd: 16, ce: 22, hp: 16 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: {
      name: "극노 (極ノ番)",
      description: "화염을 극한까지 끌어올림",
      effect: {
        type: "STAT_MODIFY",
        trigger: "ALWAYS",
        value: { stat: "atk", amount: 5 },
        target: "SELF"
      }
    },
    achievements: [
      { id: "jogo_1", name: "대지의 분노", description: "신체 속성 5회 격파", 
        condition: { type: "DEFEAT_SPECIFIC", target: "BODY", count: 5 }, 
        reward: { type: "ITEM", itemId: "ember_insect" } }
    ]
  },
  {
    id: "hanami",
    name: { ko: "하나미", ja: "花御", en: "Hanami" },
    grade: "A",
    attribute: "CONVERT",
    imageUrl: "/images/characters/hanami.png",
    baseStats: { atk: 16, def: 18, spd: 14, ce: 20, hp: 18 },
    growthStats: { primary: "def", secondary: "hp" },
    skill: {
      name: "재앙의 수",
      description: "자연의 힘으로 HP 회복",
      effect: {
        type: "HP_DRAIN",
        trigger: "ALWAYS",
        value: 15,
        target: "SELF"
      }
    },
    achievements: []
  },
  {
    id: "choso",
    name: { ko: "쵸소", ja: "脹相", en: "Choso" },
    grade: "A",
    attribute: "CURSE",
    imageUrl: "/images/characters/choso.png",
    baseStats: { atk: 18, def: 15, spd: 17, ce: 19, hp: 17 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: {
      name: "적혈조작",
      description: "피를 조작하여 공방 동시 수행",
      effect: {
        type: "STAT_MODIFY",
        trigger: "ALWAYS",
        value: { stat: "def", amount: 5 },
        target: "SELF"
      }
    },
    achievements: []
  },
  {
    id: "yuta_okkotsu",
    name: { ko: "오코츠 유타", ja: "乙骨憂太", en: "Yuta Okkotsu" },
    grade: "A",
    attribute: "CURSE",
    imageUrl: "/images/characters/yuta.png",
    baseStats: { atk: 19, def: 15, spd: 16, ce: 23, hp: 17 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: {
      name: "리카 소환",
      description: "특급 과오원령 리카와 함께 공격",
      effect: {
        type: "STAT_MODIFY",
        trigger: "ALWAYS",
        value: { stat: "atk", amount: 6 },
        target: "SELF"
      }
    },
    achievements: []
  },
  {
    id: "todo_aoi",
    name: { ko: "토도 아오이", ja: "東堂葵", en: "Todo Aoi" },
    grade: "A",
    attribute: "BODY",
    imageUrl: "/images/characters/todo.png",
    baseStats: { atk: 20, def: 14, spd: 16, ce: 16, hp: 18 },
    growthStats: { primary: "atk", secondary: "hp" },
    skill: {
      name: "부기우기",
      description: "위치를 바꿔 선공 탈취",
      effect: {
        type: "SPEED_CONTROL",
        trigger: "PROBABILITY",
        probability: 50,
        value: { stat: "spd", amount: 10 },
        target: "SELF"
      }
    },
    achievements: []
  }
];
```

### B등급 (준1급) - 6장

```typescript
const B_GRADE: CharacterCard[] = [
  {
    id: "itadori_yuji",
    name: { ko: "이타도리 유지", ja: "虎杖悠仁", en: "Itadori Yuji" },
    grade: "B",
    attribute: "BODY",
    imageUrl: "/images/characters/itadori.png",
    baseStats: { atk: 16, def: 13, spd: 18, ce: 12, hp: 17 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: {
      name: "흑섬 (黒閃)",
      description: "저주력의 핵심을 찌르는 일격",
      effect: {
        type: "CRITICAL",
        trigger: "PROBABILITY",
        probability: 50,
        value: 1.5,
        target: "ENEMY"
      }
    },
    achievements: [
      { id: "itadori_1", name: "존재하지 않는 기억", description: "7연승", 
        condition: { type: "WIN_STREAK", count: 7 }, 
        reward: { type: "ITEM", itemId: "divergent_fist" } }
    ]
  },
  {
    id: "fushiguro_megumi",
    name: { ko: "후시구로 메구미", ja: "伏黒恵", en: "Fushiguro Megumi" },
    grade: "B",
    attribute: "RANGE",
    imageUrl: "/images/characters/megumi.png",
    baseStats: { atk: 14, def: 12, spd: 16, ce: 18, hp: 15 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: {
      name: "십종영보 - 팔악검 이승",
      description: "식신 소환으로 방어 강화",
      effect: {
        type: "STAT_MODIFY",
        trigger: "ALWAYS",
        value: { stat: "def", amount: 8 },
        target: "SELF"
      }
    },
    achievements: []
  },
  {
    id: "mahito",
    name: { ko: "마히토", ja: "真人", en: "Mahito" },
    grade: "B",
    attribute: "SOUL",
    imageUrl: "/images/characters/mahito.png",
    baseStats: { atk: 15, def: 10, spd: 15, ce: 20, hp: 18 },
    growthStats: { primary: "ce", secondary: "hp" },
    skill: {
      name: "무위전변",
      description: "영혼을 직접 공격, 방어 무시",
      effect: {
        type: "HP_DRAIN",
        trigger: "ALWAYS",
        value: -15,
        target: "ENEMY"
      }
    },
    achievements: []
  },
  {
    id: "mei_mei",
    name: { ko: "메이메이", ja: "冥冥", en: "Mei Mei" },
    grade: "B",
    attribute: "RANGE",
    imageUrl: "/images/characters/meimei.png",
    baseStats: { atk: 15, def: 13, spd: 14, ce: 17, hp: 16 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: {
      name: "흑조조작",
      description: "까마귀로 정찰 및 기습",
      effect: {
        type: "SPEED_CONTROL",
        trigger: "ALWAYS",
        value: { stat: "spd", amount: 5 },
        target: "SELF"
      }
    },
    achievements: []
  },
  {
    id: "inumaki_toge",
    name: { ko: "이누마키 토게", ja: "狗巻棘", en: "Inumaki Toge" },
    grade: "B",
    attribute: "CURSE",
    imageUrl: "/images/characters/inumaki.png",
    baseStats: { atk: 12, def: 11, spd: 17, ce: 19, hp: 14 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: {
      name: "주언",
      description: "말에 저주를 담아 상대 약화",
      effect: {
        type: "STAT_MODIFY",
        trigger: "PROBABILITY",
        probability: 60,
        value: { stat: "atk", amount: -5 },
        target: "ENEMY"
      }
    },
    achievements: []
  },
  {
    id: "maki_zenin",
    name: { ko: "젠인 마키", ja: "禪院真希", en: "Maki Zenin" },
    grade: "B",
    attribute: "BODY",
    imageUrl: "/images/characters/maki.png",
    baseStats: { atk: 17, def: 14, spd: 16, ce: 5, hp: 16 },
    growthStats: { primary: "atk", secondary: "def" },
    skill: {
      name: "유성의 검",
      description: "특수 무기로 강력한 일격",
      effect: {
        type: "DAMAGE_MODIFY",
        trigger: "ALWAYS",
        value: 1.2,
        target: "SELF"
      }
    },
    achievements: []
  }
];
```

### C등급 (2급) - 4장

```typescript
const C_GRADE: CharacterCard[] = [
  {
    id: "kugisaki_nobara",
    name: { ko: "쿠기사키 노바라", ja: "釘崎野薔薇", en: "Kugisaki Nobara" },
    grade: "C",
    attribute: "RANGE",
    imageUrl: "/images/characters/nobara.png",
    baseStats: { atk: 13, def: 10, spd: 14, ce: 15, hp: 14 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: {
      name: "공명",
      description: "상대 CE가 높을수록 추가 데미지",
      effect: {
        type: "DAMAGE_MODIFY",
        trigger: "ALWAYS",
        value: 0.02,  // 상대 CE당 2% 추가
        target: "ENEMY"
      }
    },
    achievements: []
  },
  {
    id: "ino_takuma",
    name: { ko: "이노 타쿠마", ja: "猪野琢真", en: "Ino Takuma" },
    grade: "C",
    attribute: "CURSE",
    imageUrl: "/images/characters/ino.png",
    baseStats: { atk: 12, def: 11, spd: 13, ce: 14, hp: 14 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: {
      name: "여제례 - 가마사",
      description: "가면의 힘으로 강화",
      effect: {
        type: "STAT_MODIFY",
        trigger: "ALWAYS",
        value: { stat: "atk", amount: 4 },
        target: "SELF"
      }
    },
    achievements: []
  },
  {
    id: "panda",
    name: { ko: "판다", ja: "パンダ", en: "Panda" },
    grade: "C",
    attribute: "BODY",
    imageUrl: "/images/characters/panda.png",
    baseStats: { atk: 14, def: 14, spd: 12, ce: 10, hp: 16 },
    growthStats: { primary: "def", secondary: "hp" },
    skill: {
      name: "고릴라 모드",
      description: "핵 전환으로 공격력 강화",
      effect: {
        type: "STAT_MODIFY",
        trigger: "ALWAYS",
        value: { stat: "atk", amount: 5 },
        target: "SELF"
      }
    },
    achievements: []
  },
  {
    id: "nishimiya_momo",
    name: { ko: "니시미야 모모", ja: "西宮桃", en: "Nishimiya Momo" },
    grade: "C",
    attribute: "RANGE",
    imageUrl: "/images/characters/momo.png",
    baseStats: { atk: 10, def: 9, spd: 16, ce: 13, hp: 12 },
    growthStats: { primary: "spd", secondary: "ce" },
    skill: {
      name: "빗자루 비행",
      description: "공중 기동으로 회피율 증가",
      effect: {
        type: "STAT_MODIFY",
        trigger: "ALWAYS",
        value: { stat: "def", amount: 4 },
        target: "SELF"
      }
    },
    achievements: []
  }
];
```

---

## 전체 캐릭터 Export

```typescript
export const ALL_CHARACTERS: CharacterCard[] = [
  ...S_GRADE,
  ...A_GRADE,
  ...B_GRADE,
  ...C_GRADE
];

export const CHARACTERS_BY_ID = ALL_CHARACTERS.reduce((acc, char) => {
  acc[char.id] = char;
  return acc;
}, {} as Record<string, CharacterCard>);

export const CHARACTERS_BY_GRADE = {
  S: S_GRADE,
  A: A_GRADE,
  B: B_GRADE,
  C: C_GRADE
};
```
