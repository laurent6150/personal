// ========================================
// 아이템 데이터 (35개)
// 8각형 스탯 시스템 (atk, def, spd, ce, hp, crt, tec, mnt) 활용
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
    unlockCondition: { characterId: "any", achievementId: "gojo_1" }
  },
  {
    id: "infinity_ring",
    name: { ko: "무한의 반지", en: "Ring of Infinity" },
    description: "무하를 상징하는 반지",
    rarity: "LEGENDARY",
    price: 4500,
    statBonus: { def: 5, ce: 3 },
    specialEffect: { type: "DAMAGE_REDUCTION", value: 10, description: "받는 데미지 -10%" },
    unlockCondition: { characterId: "any", achievementId: "gojo_2" }
  },
  {
    id: "malevolent_shrine_talisman",
    name: { ko: "복마전신 부적", en: "Malevolent Shrine Talisman" },
    description: "스쿠나의 영역을 담은 부적",
    rarity: "LEGENDARY",
    price: 4800,
    statBonus: { atk: 5, ce: 3 },
    specialEffect: { type: "IGNORE_DEFENSE", value: 5, description: "상대 DEF 5 무시" },
    unlockCondition: { characterId: "any", achievementId: "sukuna_1" }
  },
  {
    id: "cursed_manipulation",
    name: { ko: "저주령 조작", en: "Cursed Spirit Manipulation" },
    description: "켄자쿠의 술식이 담긴 도구",
    rarity: "LEGENDARY",
    price: 4200,
    statBonus: { ce: 6, hp: 2 },
    specialEffect: { type: "SKILL_BOOST", value: 15, description: "스킬 효과 +15%" },
    unlockCondition: { characterId: "any", achievementId: "kenjaku_1" }
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
    unlockCondition: { characterId: "any", achievementId: "toji_1" }
  },
  {
    id: "ratio_blade",
    name: { ko: "7:3 단도", en: "Ratio Blade" },
    description: "나나미의 술식이 깃든 단도",
    rarity: "EPIC",
    price: 2500,
    statBonus: { atk: 3, ce: 2 },
    specialEffect: { type: "CRITICAL_RATE", value: 10, description: "크리티컬 확률 +10%" },
    unlockCondition: { characterId: "any", achievementId: "nanami_1" }
  },
  {
    id: "ember_insect",
    name: { ko: "불씨벌레", en: "Ember Insect" },
    description: "죠고의 화염을 담은 벌레",
    rarity: "EPIC",
    price: 2800,
    statBonus: { atk: 3, ce: 3 },
    specialEffect: { type: "BURN_DAMAGE", value: 3, description: "추가 고정 데미지 +3" },
    unlockCondition: { characterId: "any", achievementId: "jogo_1" }
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
    unlockCondition: { characterId: "any", achievementId: "itadori_1" }
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
  },

  // =============================================
  // 신규 아이템 - 8각형 스탯 (crt, tec, mnt) 활용
  // 모든 카드에 장착 가능
  // =============================================

  // ===== LEGENDARY (신규 3개) =====
  // 가격: 4,000~5,000 CP
  {
    id: "rika_ring",
    name: { ko: "리카의 약속 반지", en: "Rika's Promise Ring" },
    description: "절대적인 사랑이 깃든 저주의 반지, 무한한 주력을 끌어낸다",
    rarity: "LEGENDARY",
    price: 4800,
    statBonus: { ce: 4, tec: 4 },
    specialEffect: { type: "GAUGE_BOOST", value: 25, description: "필살기 게이지 충전 +25%" },
    unlockCondition: { characterId: "any", achievementId: "ultimate_10" }
  },
  {
    id: "cursed_womb_painting",
    name: { ko: "저주태 회화", en: "Cursed Womb Painting" },
    description: "저주태에서 태어난 특급 저주령의 힘이 그려진 두루마리",
    rarity: "LEGENDARY",
    price: 4500,
    statBonus: { ce: 5, mnt: 3 },
    specialEffect: { type: "STATUS_CHANCE", value: 15, description: "상태이상 부여 확률 +15%" },
    unlockCondition: { characterId: "any", achievementId: "status_master" }
  },
  {
    id: "star_rage",
    name: { ko: "별의 분노", en: "Star Rage" },
    description: "가상의 질량을 부여하는 별의 힘이 응축된 보석",
    rarity: "LEGENDARY",
    price: 4600,
    statBonus: { atk: 4, crt: 4 },
    specialEffect: { type: "CRITICAL_DAMAGE", value: 30, description: "크리티컬 데미지 +30%" },
    unlockCondition: { characterId: "any", achievementId: "critical_master" }
  },

  // ===== EPIC (신규 6개) =====
  // 가격: 2,000~3,000 CP
  {
    id: "blood_edge",
    name: { ko: "혈류칼날", en: "Blood Edge" },
    description: "쵸소의 혈류를 모방한 무기, 베인 자의 생기를 빼앗는다",
    rarity: "EPIC",
    price: 2800,
    statBonus: { atk: 3, hp: 2 },
    specialEffect: { type: "LIFESTEAL", value: 10, description: "데미지의 10% HP 회복" },
    unlockCondition: { characterId: "any", achievementId: "drain_500" }
  },
  {
    id: "jackpot_chip",
    name: { ko: "잭팟 칩", en: "Jackpot Chip" },
    description: "운명을 건 도박사의 칩, 행운이 폭발적인 힘으로 변한다",
    rarity: "EPIC",
    price: 2600,
    statBonus: { crt: 4, spd: 2 },
    specialEffect: { type: "LUCKY_STRIKE", value: 20, description: "크리티컬 시 추가 데미지 +20%" },
    unlockCondition: { characterId: "any", achievementId: "lucky_crit_5" }
  },
  {
    id: "executioner_gavel",
    name: { ko: "심판의 망치", en: "Executioner's Gavel" },
    description: "법정의 심판을 내리는 망치, 상대의 약점을 오래 노출시킨다",
    rarity: "EPIC",
    price: 2500,
    statBonus: { tec: 3, mnt: 3 },
    specialEffect: { type: "DEBUFF_EXTEND", value: 1, description: "상대 디버프 지속 +1턴" },
    unlockCondition: { characterId: "any", achievementId: "debuff_master" }
  },
  {
    id: "lightning_rod",
    name: { ko: "뇌격의 지팡이", en: "Lightning Rod" },
    description: "번개의 힘을 증폭하는 고대의 지팡이",
    rarity: "EPIC",
    price: 2700,
    statBonus: { atk: 3, spd: 3 },
    specialEffect: { type: "CHAIN_LIGHTNING", value: 5, description: "15% 확률 추가 고정 5 데미지" },
    unlockCondition: { characterId: "any", achievementId: "lightning_win_10" }
  },
  {
    id: "shadow_puppet",
    name: { ko: "그림자 인형", en: "Shadow Puppet" },
    description: "식신을 모방한 그림자 인형, 적의 공격을 되돌린다",
    rarity: "EPIC",
    price: 2400,
    statBonus: { def: 3, tec: 3 },
    specialEffect: { type: "COUNTER_CHANCE", value: 20, description: "피격 시 20% 확률 반격" },
    unlockCondition: { characterId: "any", achievementId: "counter_10" }
  },
  {
    id: "boogie_woogie_bell",
    name: { ko: "부기우기 종", en: "Boogie Woogie Bell" },
    description: "손뼉 소리와 함께 위치를 교란하는 종",
    rarity: "EPIC",
    price: 2500,
    statBonus: { spd: 3, mnt: 2 },
    specialEffect: { type: "SPEED_SWAP", value: 25, description: "25% 확률 SPD 교환" },
    unlockCondition: { characterId: "any", achievementId: "speed_swap_5" }
  },

  // ===== RARE (신규 6개) =====
  // 가격: 800~1,500 CP
  {
    id: "straw_doll",
    name: { ko: "짚 인형", en: "Straw Doll" },
    description: "공명으로 상대의 급소를 꿰뚫는 저주 인형",
    rarity: "RARE",
    price: 1400,
    statBonus: { atk: 2, crt: 3 },
    specialEffect: { type: "RESONANCE", value: 2, description: "크리티컬 시 상대 DEF -2 (1턴)" },
    unlockCondition: { characterId: "any", achievementId: "crit_streak_3" }
  },
  {
    id: "soul_touch",
    name: { ko: "무위전변의 손길", en: "Idle Transfiguration Touch" },
    description: "영혼의 형태를 변형하는 저주의 손길",
    rarity: "RARE",
    price: 1500,
    statBonus: { tec: 3, ce: 2 },
    specialEffect: { type: "SOUL_PIERCE", value: 30, description: "상대 MNT의 30% 무시" },
    unlockCondition: { characterId: "any", achievementId: "soul_win_10" }
  },
  {
    id: "panda_core",
    name: { ko: "판다 핵", en: "Panda Core" },
    description: "세 개의 핵 중 하나, 전투 시작 시 보호막을 생성한다",
    rarity: "RARE",
    price: 1200,
    statBonus: { hp: 3, def: 2 },
    specialEffect: { type: "SHIELD_PROC", value: 8, description: "전투 시작 시 HP 8% 보호막" },
    unlockCondition: { characterId: "any", achievementId: "survive_low_hp_5" }
  },
  {
    id: "cursed_speech_amp",
    name: { ko: "주언 증폭기", en: "Cursed Speech Amplifier" },
    description: "주언의 힘을 증폭하는 특수 마이크",
    rarity: "RARE",
    price: 1300,
    statBonus: { ce: 3, mnt: 2 },
    specialEffect: { type: "SILENCE_CHANCE", value: 15, description: "15% 확률 상대 스킬 1턴 봉인" },
    unlockCondition: { characterId: "any", achievementId: "seal_5" }
  },
  {
    id: "dragon_bone_blade",
    name: { ko: "용골인검", en: "Dragon Bone Blade" },
    description: "특급 저주 도구, 순수한 신체 능력을 극대화한다",
    rarity: "RARE",
    price: 1400,
    statBonus: { atk: 2, spd: 3 },
    specialEffect: { type: "PHYSICAL_BOOST", value: 15, description: "CE 10 이하 시 ATK +15%" },
    unlockCondition: { characterId: "any", achievementId: "physical_win_10" }
  },
  {
    id: "mind_fortress",
    name: { ko: "정신 요새", en: "Mind Fortress" },
    description: "정신 공격에 대한 강력한 방벽을 형성하는 부적",
    rarity: "RARE",
    price: 1100,
    statBonus: { mnt: 4, def: 1 },
    specialEffect: { type: "STATUS_RESIST", value: 20, description: "상태이상 저항 +20%" },
    unlockCondition: { characterId: "any", achievementId: "resist_status_10" }
  },

  // ===== COMMON (신규 5개) =====
  // 가격: 300~500 CP
  {
    id: "critical_eye",
    name: { ko: "간파의 눈", en: "Eye of Insight" },
    description: "상대의 급소를 간파하는 눈",
    rarity: "COMMON",
    price: 400,
    statBonus: { crt: 3 },
    unlockCondition: { characterId: "any", achievementId: "crit_5" }
  },
  {
    id: "technique_scroll",
    name: { ko: "술식 두루마리", en: "Technique Scroll" },
    description: "술식의 정밀도를 높여주는 고서",
    rarity: "COMMON",
    price: 400,
    statBonus: { tec: 3 },
    unlockCondition: { characterId: "any", achievementId: "skill_use_20" }
  },
  {
    id: "mental_ward",
    name: { ko: "정신 수호패", en: "Mental Ward" },
    description: "정신을 보호하는 부적",
    rarity: "COMMON",
    price: 350,
    statBonus: { mnt: 3 },
    unlockCondition: { characterId: "any", achievementId: "survive_debuff_5" }
  },
  {
    id: "hybrid_talisman",
    name: { ko: "혼합의 부적", en: "Hybrid Talisman" },
    description: "기술과 직감을 동시에 강화하는 부적",
    rarity: "COMMON",
    price: 450,
    statBonus: { crt: 2, tec: 2 },
    unlockCondition: { characterId: "any", achievementId: "win_10" }
  },
  {
    id: "survivor_ring",
    name: { ko: "생존자의 반지", en: "Survivor's Ring" },
    description: "극한 상황에서 생존한 자의 의지가 깃든 반지",
    rarity: "COMMON",
    price: 350,
    statBonus: { hp: 2, mnt: 2 },
    unlockCondition: { characterId: "any", achievementId: "clutch_win_3" }
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
