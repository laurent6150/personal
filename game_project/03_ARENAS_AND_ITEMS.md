# 주술회전 카드 게임 - 경기장 & 아이템 데이터 (Part 3)

## 경기장 데이터 (10개)

```typescript
const ARENAS: Arena[] = [
  {
    id: "shibuya_station",
    name: { ko: "시부야역 지하", en: "Shibuya Station Underground" },
    description: "폐쇄된 공간, 저주가 들끓는 곳",
    imageUrl: "/images/arenas/shibuya.png",
    effects: [
      { type: "ATTRIBUTE_BOOST", target: "CURSE", value: 0.15, 
        description: "저주 속성 데미지 +15%" },
      { type: "ATTRIBUTE_WEAKEN", target: "RANGE", value: -0.10, 
        description: "원거리 속성 데미지 -10%" }
    ]
  },
  {
    id: "jujutsu_high",
    name: { ko: "주술고전", en: "Jujutsu High" },
    description: "술사들의 요람, 결계가 펼쳐진 학교",
    imageUrl: "/images/arenas/jujutsu_high.png",
    effects: [
      { type: "ATTRIBUTE_BOOST", target: "BARRIER", value: 0.15, 
        description: "결계 속성 데미지 +15%" },
      { type: "STAT_MODIFY", target: "ALL", value: 2, 
        description: "모든 캐릭터 CE +2" }
    ]
  },
  {
    id: "domain_void",
    name: { ko: "무량공처 (영역)", en: "Unlimited Void" },
    description: "무한의 정보가 흐르는 공간",
    imageUrl: "/images/arenas/void.png",
    effects: [
      { type: "SPECIAL_RULE", target: "ALL", value: 0, 
        description: "SPD 역전: 낮은 쪽이 선공" },
      { type: "ATTRIBUTE_BOOST", target: "BARRIER", value: 0.20, 
        description: "결계 속성 데미지 +20%" }
    ]
  },
  {
    id: "malevolent_shrine",
    name: { ko: "복마전신 (영역)", en: "Malevolent Shrine" },
    description: "스쿠나의 영역, 끊임없는 참격",
    imageUrl: "/images/arenas/shrine.png",
    effects: [
      { type: "ATTRIBUTE_BOOST", target: "CURSE", value: 0.25, 
        description: "저주 속성 데미지 +25%" },
      { type: "STAT_MODIFY", target: "ALL", value: -3, 
        description: "모든 캐릭터 DEF -3" }
    ]
  },
  {
    id: "chimera_shadow",
    name: { ko: "질풍암영정 (영역)", en: "Chimera Shadow Garden" },
    description: "메구미의 영역, 그림자의 바다",
    imageUrl: "/images/arenas/shadow.png",
    effects: [
      { type: "ATTRIBUTE_BOOST", target: "RANGE", value: 0.15, 
        description: "원거리 속성 데미지 +15%" },
      { type: "ATTRIBUTE_BOOST", target: "RANGE", value: 0.20, 
        description: "원거리 스킬 효과 +20%" }
    ]
  },
  {
    id: "coffin_iron_mountain",
    name: { ko: "개문돈갑 (영역)", en: "Coffin of the Iron Mountain" },
    description: "죠고의 영역, 작열하는 화염",
    imageUrl: "/images/arenas/iron_mountain.png",
    effects: [
      { type: "ATTRIBUTE_BOOST", target: "CONVERT", value: 0.20, 
        description: "변환 속성 데미지 +20%" },
      { type: "STAT_MODIFY", target: "ALL", value: -2, 
        description: "모든 캐릭터 HP -2 (지속 데미지)" }
    ]
  },
  {
    id: "self_embodiment",
    name: { ko: "자폐영역 (영역)", en: "Self-Embodiment of Perfection" },
    description: "마히토의 영역, 영혼이 노출되는 공간",
    imageUrl: "/images/arenas/perfection.png",
    effects: [
      { type: "ATTRIBUTE_BOOST", target: "SOUL", value: 0.25, 
        description: "혼백 속성 데미지 +25%" },
      { type: "ATTRIBUTE_WEAKEN", target: "BODY", value: -0.15, 
        description: "신체 속성 데미지 -15%" }
    ]
  },
  {
    id: "zenin_training",
    name: { ko: "젠인가 수련장", en: "Zenin Clan Training Ground" },
    description: "전투에 특화된 수련 공간",
    imageUrl: "/images/arenas/zenin.png",
    effects: [
      { type: "ATTRIBUTE_BOOST", target: "BODY", value: 0.20, 
        description: "신체 속성 데미지 +20%" },
      { type: "SPECIAL_RULE", target: "ALL", value: 0.30, 
        description: "30% 확률로 스킬 봉인" }
    ]
  },
  {
    id: "kyoto_exchange",
    name: { ko: "교류회 경기장", en: "Kyoto Exchange Event Arena" },
    description: "공정한 대결의 장",
    imageUrl: "/images/arenas/exchange.png",
    effects: [
      { type: "SPECIAL_RULE", target: "ALL", value: 0, 
        description: "속성 상성 무효 (순수 스탯 대결)" }
    ]
  },
  {
    id: "cursed_womb",
    name: { ko: "저주태", en: "Cursed Womb" },
    description: "특급 저주가 태어나는 곳",
    imageUrl: "/images/arenas/womb.png",
    effects: [
      { type: "ATTRIBUTE_BOOST", target: "CURSE", value: 0.15, 
        description: "저주 속성 데미지 +15%" },
      { type: "ATTRIBUTE_BOOST", target: "SOUL", value: 0.15, 
        description: "혼백 속성 데미지 +15%" },
      { type: "ATTRIBUTE_WEAKEN", target: "BARRIER", value: -0.10, 
        description: "결계 속성 데미지 -10%" }
    ]
  }
];

export const ARENAS_BY_ID = ARENAS.reduce((acc, arena) => {
  acc[arena.id] = arena;
  return acc;
}, {} as Record<string, Arena>);
```

---

## 아이템 데이터 (15개)

```typescript
const ITEMS: Item[] = [
  // ===== LEGENDARY (S등급 관련) =====
  {
    id: "six_eyes",
    name: { ko: "육안", en: "Six Eyes" },
    description: "저주력의 본질을 꿰뚫어 보는 눈",
    rarity: "LEGENDARY",
    statBonus: { ce: 5, spd: 3 },
    specialEffect: { type: "CE_EFFICIENCY", value: 20, description: "CE 효율 +20%" },
    unlockCondition: { characterId: "gojo_satoru", achievementId: "gojo_1" }
  },
  {
    id: "infinity_ring",
    name: { ko: "무한의 반지", en: "Ring of Infinity" },
    description: "무하를 상징하는 반지",
    rarity: "LEGENDARY",
    statBonus: { def: 5, ce: 3 },
    specialEffect: { type: "DAMAGE_REDUCTION", value: 10, description: "받는 데미지 -10%" },
    unlockCondition: { characterId: "gojo_satoru", achievementId: "gojo_2" }
  },
  {
    id: "malevolent_shrine_talisman",
    name: { ko: "복마전신 부적", en: "Malevolent Shrine Talisman" },
    description: "스쿠나의 영역을 담은 부적",
    rarity: "LEGENDARY",
    statBonus: { atk: 5, ce: 3 },
    specialEffect: { type: "IGNORE_DEFENSE", value: 5, description: "상대 DEF 5 무시" },
    unlockCondition: { characterId: "ryomen_sukuna", achievementId: "sukuna_1" }
  },
  {
    id: "cursed_manipulation",
    name: { ko: "저주령 조작", en: "Cursed Spirit Manipulation" },
    description: "켄자쿠의 술식이 담긴 도구",
    rarity: "LEGENDARY",
    statBonus: { ce: 6, hp: 2 },
    specialEffect: { type: "SKILL_BOOST", value: 15, description: "스킬 효과 +15%" },
    unlockCondition: { characterId: "kenjaku", achievementId: "kenjaku_1" }
  },

  // ===== EPIC (A등급 관련) =====
  {
    id: "inverted_spear",
    name: { ko: "천역봉인", en: "Inverted Spear of Heaven" },
    description: "술식을 강제 해제하는 특급 저주 도구",
    rarity: "EPIC",
    statBonus: { atk: 4, spd: 2 },
    specialEffect: { type: "SKILL_CANCEL", value: 25, description: "25% 확률로 상대 스킬 무효화" },
    unlockCondition: { characterId: "fushiguro_toji", achievementId: "toji_1" }
  },
  {
    id: "ratio_blade",
    name: { ko: "7:3 단도", en: "Ratio Blade" },
    description: "나나미의 술식이 깃든 단도",
    rarity: "EPIC",
    statBonus: { atk: 3, ce: 2 },
    specialEffect: { type: "CRITICAL_RATE", value: 10, description: "크리티컬 확률 +10%" },
    unlockCondition: { characterId: "nanami_kento", achievementId: "nanami_1" }
  },
  {
    id: "ember_insect",
    name: { ko: "불씨벌레", en: "Ember Insect" },
    description: "죠고의 화염을 담은 벌레",
    rarity: "EPIC",
    statBonus: { atk: 3, ce: 3 },
    specialEffect: { type: "BURN_DAMAGE", value: 3, description: "추가 고정 데미지 +3" },
    unlockCondition: { characterId: "jogo", achievementId: "jogo_1" }
  },

  // ===== RARE (B등급 관련) =====
  {
    id: "divergent_fist",
    name: { ko: "어긋나는 권", en: "Divergent Fist" },
    description: "이타도리의 특수 타격법을 담은 권갑",
    rarity: "RARE",
    statBonus: { atk: 3, spd: 2 },
    specialEffect: { type: "DOUBLE_STRIKE", value: 20, description: "20% 확률로 추가 타격" },
    unlockCondition: { characterId: "itadori_yuji", achievementId: "itadori_1" }
  },
  {
    id: "soul_guard",
    name: { ko: "영혼 수호구", en: "Soul Guard" },
    description: "정신 공격을 막아주는 보호구",
    rarity: "RARE",
    statBonus: { def: 2, hp: 3 },
    specialEffect: { type: "SOUL_RESIST", value: 20, description: "혼백 속성 데미지 -20%" },
    unlockCondition: { characterId: "any", achievementId: "defeat_soul_10" }
  },
  {
    id: "domain_amplifier",
    name: { ko: "영역 증폭기", en: "Domain Amplifier" },
    description: "영역 관련 효과를 증폭",
    rarity: "RARE",
    statBonus: { ce: 4, atk: 2 },
    specialEffect: { type: "ARENA_BOOST", value: 10, description: "경기장 보너스 +10%" },
    unlockCondition: { characterId: "any", achievementId: "arena_master" }
  },

  // ===== COMMON (범용) =====
  {
    id: "cursed_energy_core",
    name: { ko: "저주력 핵", en: "Cursed Energy Core" },
    description: "순수한 저주력이 응축된 핵",
    rarity: "COMMON",
    statBonus: { ce: 3 },
    unlockCondition: { characterId: "any", achievementId: "first_win" }
  },
  {
    id: "protective_charm",
    name: { ko: "수호 부적", en: "Protective Charm" },
    description: "기본 보호 부적",
    rarity: "COMMON",
    statBonus: { def: 2, hp: 2 },
    unlockCondition: { characterId: "any", achievementId: "survive_5" }
  },
  {
    id: "speed_talisman",
    name: { ko: "신속의 부적", en: "Speed Talisman" },
    description: "이동 속도를 높여주는 부적",
    rarity: "COMMON",
    statBonus: { spd: 3 },
    unlockCondition: { characterId: "any", achievementId: "first_strike_10" }
  },
  {
    id: "attack_charm",
    name: { ko: "공격의 부적", en: "Attack Charm" },
    description: "공격력을 높여주는 부적",
    rarity: "COMMON",
    statBonus: { atk: 3 },
    unlockCondition: { characterId: "any", achievementId: "total_damage_1000" }
  },
  {
    id: "vitality_ring",
    name: { ko: "활력의 반지", en: "Vitality Ring" },
    description: "체력을 높여주는 반지",
    rarity: "COMMON",
    statBonus: { hp: 4 },
    unlockCondition: { characterId: "any", achievementId: "survive_low_hp_3" }
  }
];

export const ITEMS_BY_ID = ITEMS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {} as Record<string, Item>);

export const ITEMS_BY_RARITY = {
  LEGENDARY: ITEMS.filter(i => i.rarity === 'LEGENDARY'),
  EPIC: ITEMS.filter(i => i.rarity === 'EPIC'),
  RARE: ITEMS.filter(i => i.rarity === 'RARE'),
  COMMON: ITEMS.filter(i => i.rarity === 'COMMON')
};
```

---

## 범용 업적 목록

```typescript
const GENERAL_ACHIEVEMENTS: Achievement[] = [
  { id: "first_win", name: "첫 승리", description: "첫 대전 승리", 
    condition: { type: "WINS", count: 1 }, reward: { type: "ITEM", itemId: "cursed_energy_core" } },
  { id: "survive_5", name: "생존자", description: "5회 대전에서 생존", 
    condition: { type: "SURVIVE_LOW_HP", count: 5 }, reward: { type: "ITEM", itemId: "protective_charm" } },
  { id: "first_strike_10", name: "선제공격자", description: "10회 선공 성공", 
    condition: { type: "USE_SKILL", target: "first_strike", count: 10 }, reward: { type: "ITEM", itemId: "speed_talisman" } },
  { id: "total_damage_1000", name: "파괴자", description: "누적 데미지 1000 달성", 
    condition: { type: "USE_SKILL", target: "damage", count: 1000 }, reward: { type: "ITEM", itemId: "attack_charm" } },
  { id: "survive_low_hp_3", name: "불굴의 의지", description: "HP 3 이하에서 3회 승리", 
    condition: { type: "SURVIVE_LOW_HP", count: 3 }, reward: { type: "ITEM", itemId: "vitality_ring" } },
  { id: "defeat_soul_10", name: "영혼 사냥꾼", description: "혼백 속성 10회 격파", 
    condition: { type: "DEFEAT_SPECIFIC", target: "SOUL", count: 10 }, reward: { type: "ITEM", itemId: "soul_guard" } },
  { id: "arena_master", name: "경기장 마스터", description: "모든 경기장에서 1승", 
    condition: { type: "WIN_IN_ARENA", target: "ALL", count: 1 }, reward: { type: "ITEM", itemId: "domain_amplifier" } }
];
```
