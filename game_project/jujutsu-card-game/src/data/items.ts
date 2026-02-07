// ========================================
// 아이템 데이터 (15개)
// ========================================

import type { Item } from '../types';

const ITEMS: Item[] = [
  // ===== LEGENDARY (S등급 관련) =====
  // 가격: 4,000~5,000 CP
  {
    id: "six_eyes",
    name: { ko: "육안", en: "Six Eyes" },
    description: "저주력의 본질을 꿰뚫어 보는 눈",
    rarity: "LEGENDARY",
    price: 5000,
    statBonus: { ce: 5, spd: 3 },
    specialEffect: { type: "CE_EFFICIENCY", value: 20, description: "CE 효율 +20%" },
    unlockCondition: { characterId: "gojo_satoru", achievementId: "gojo_1" }
  },
  {
    id: "infinity_ring",
    name: { ko: "무한의 반지", en: "Ring of Infinity" },
    description: "무하를 상징하는 반지",
    rarity: "LEGENDARY",
    price: 4500,
    statBonus: { def: 5, ce: 3 },
    specialEffect: { type: "DAMAGE_REDUCTION", value: 10, description: "받는 데미지 -10%" },
    unlockCondition: { characterId: "gojo_satoru", achievementId: "gojo_2" }
  },
  {
    id: "malevolent_shrine_talisman",
    name: { ko: "복마전신 부적", en: "Malevolent Shrine Talisman" },
    description: "스쿠나의 영역을 담은 부적",
    rarity: "LEGENDARY",
    price: 4800,
    statBonus: { atk: 5, ce: 3 },
    specialEffect: { type: "IGNORE_DEFENSE", value: 5, description: "상대 DEF 5 무시" },
    unlockCondition: { characterId: "ryomen_sukuna", achievementId: "sukuna_1" }
  },
  {
    id: "cursed_manipulation",
    name: { ko: "저주령 조작", en: "Cursed Spirit Manipulation" },
    description: "켄자쿠의 술식이 담긴 도구",
    rarity: "LEGENDARY",
    price: 4200,
    statBonus: { ce: 6, hp: 2 },
    specialEffect: { type: "SKILL_BOOST", value: 15, description: "스킬 효과 +15%" },
    unlockCondition: { characterId: "kenjaku", achievementId: "kenjaku_1" }
  },

  // ===== EPIC (A등급 관련) =====
  // 가격: 2,000~3,000 CP
  {
    id: "inverted_spear",
    name: { ko: "천역봉인", en: "Inverted Spear of Heaven" },
    description: "술식을 강제 해제하는 특급 저주 도구",
    rarity: "EPIC",
    price: 3000,
    statBonus: { atk: 4, spd: 2 },
    specialEffect: { type: "SKILL_CANCEL", value: 25, description: "25% 확률로 상대 스킬 무효화" },
    unlockCondition: { characterId: "fushiguro_toji", achievementId: "toji_1" }
  },
  {
    id: "ratio_blade",
    name: { ko: "7:3 단도", en: "Ratio Blade" },
    description: "나나미의 술식이 깃든 단도",
    rarity: "EPIC",
    price: 2500,
    statBonus: { atk: 3, ce: 2 },
    specialEffect: { type: "CRITICAL_RATE", value: 10, description: "크리티컬 확률 +10%" },
    unlockCondition: { characterId: "nanami_kento", achievementId: "nanami_1" }
  },
  {
    id: "ember_insect",
    name: { ko: "불씨벌레", en: "Ember Insect" },
    description: "죠고의 화염을 담은 벌레",
    rarity: "EPIC",
    price: 2800,
    statBonus: { atk: 3, ce: 3 },
    specialEffect: { type: "BURN_DAMAGE", value: 3, description: "추가 고정 데미지 +3" },
    unlockCondition: { characterId: "jogo", achievementId: "jogo_1" }
  },

  // ===== RARE (B등급 관련) =====
  // 가격: 800~1,500 CP
  {
    id: "divergent_fist",
    name: { ko: "어긋나는 권", en: "Divergent Fist" },
    description: "이타도리의 특수 타격법을 담은 권갑",
    rarity: "RARE",
    price: 1500,
    statBonus: { atk: 3, spd: 2 },
    specialEffect: { type: "DOUBLE_STRIKE", value: 20, description: "20% 확률로 추가 타격" },
    unlockCondition: { characterId: "itadori_yuji", achievementId: "itadori_1" }
  },
  {
    id: "soul_guard",
    name: { ko: "영혼 수호구", en: "Soul Guard" },
    description: "정신 공격을 막아주는 보호구",
    rarity: "RARE",
    price: 1200,
    statBonus: { def: 2, hp: 3 },
    specialEffect: { type: "SOUL_RESIST", value: 20, description: "혼백 속성 데미지 -20%" },
    unlockCondition: { characterId: "any", achievementId: "defeat_soul_10" }
  },
  {
    id: "domain_amplifier",
    name: { ko: "영역 증폭기", en: "Domain Amplifier" },
    description: "영역 관련 효과를 증폭",
    rarity: "RARE",
    price: 1400,
    statBonus: { ce: 4, atk: 2 },
    specialEffect: { type: "ARENA_BOOST", value: 10, description: "경기장 보너스 +10%" },
    unlockCondition: { characterId: "any", achievementId: "arena_master" }
  },

  // ===== COMMON (범용) =====
  // 가격: 300~500 CP
  {
    id: "cursed_energy_core",
    name: { ko: "저주력 핵", en: "Cursed Energy Core" },
    description: "순수한 저주력이 응축된 핵",
    rarity: "COMMON",
    price: 400,
    statBonus: { ce: 3 },
    unlockCondition: { characterId: "any", achievementId: "first_win" }
  },
  {
    id: "protective_charm",
    name: { ko: "수호 부적", en: "Protective Charm" },
    description: "기본 보호 부적",
    rarity: "COMMON",
    price: 350,
    statBonus: { def: 2, hp: 2 },
    unlockCondition: { characterId: "any", achievementId: "survive_5" }
  },
  {
    id: "speed_talisman",
    name: { ko: "신속의 부적", en: "Speed Talisman" },
    description: "이동 속도를 높여주는 부적",
    rarity: "COMMON",
    price: 300,
    statBonus: { spd: 3 },
    unlockCondition: { characterId: "any", achievementId: "first_strike_10" }
  },
  {
    id: "attack_charm",
    name: { ko: "공격의 부적", en: "Attack Charm" },
    description: "공격력을 높여주는 부적",
    rarity: "COMMON",
    price: 350,
    statBonus: { atk: 3 },
    unlockCondition: { characterId: "any", achievementId: "total_damage_1000" }
  },
  {
    id: "vitality_ring",
    name: { ko: "활력의 반지", en: "Vitality Ring" },
    description: "체력을 높여주는 반지",
    rarity: "COMMON",
    price: 400,
    statBonus: { hp: 4 },
    unlockCondition: { characterId: "any", achievementId: "survive_low_hp_3" }
  }
];

export const ALL_ITEMS = ITEMS;

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
