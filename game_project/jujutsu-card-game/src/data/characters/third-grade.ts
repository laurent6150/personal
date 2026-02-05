// ========================================
// 3급 캐릭터 (5명)
// ========================================

import type { CharacterCard } from '../../types';
import { getCharacterImage } from '../../utils/imageHelper';

export const THIRD_GRADE: CharacterCard[] = [
  {
    id: "yu_haibara",
    name: { ko: "하이바라 유", ja: "灰原雄", en: "Yu Haibara" },
    grade: "3급",
    attribute: "BODY",
    imageUrl: getCharacterImage("yu_haibara", "하이바라 유", "BODY"),
    baseStats: { atk: 13, def: 13, spd: 14, ce: 14, hp: 75 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "동료를 위해", description: "동료를 지키려는 의지", effect: { type: "DAMAGE", value: 160, defBonus: 30 } },
    basicSkills: [
      { id: "haibara_1", name: "검술", type: "ATTACK", description: "기본 검술", effect: { type: "DAMAGE", value: 75 } },
      { id: "haibara_2", name: "저주력 강화", type: "ATTACK", description: "저주력을 담은 공격", effect: { type: "DAMAGE", value: 80 } },
      { id: "haibara_3", name: "회피", type: "DEFENSE", description: "민첩하게 회피", effect: { type: "DODGE", chance: 40 } }
    ],
    ultimateSkill: { id: "haibara_ult", name: "동료를 위해", description: "동료를 지키려는 의지", effect: { type: "DAMAGE", value: 160, defBonus: 30 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "kiyotaka_ijichi",
    name: { ko: "이지치 키요타카", ja: "伊地知潔高", en: "Kiyotaka Ijichi" },
    grade: "3급",
    attribute: "BARRIER",
    imageUrl: getCharacterImage("kiyotaka_ijichi", "이지치 키요타카", "BARRIER"),
    baseStats: { atk: 8, def: 16, spd: 10, ce: 18, hp: 70 },
    growthStats: { primary: "def", secondary: "ce" },
    skill: { name: "완벽한 장막", description: "모든 것을 차단하는 결계", effect: { type: "DAMAGE_REDUCE", value: 90, duration: 2 } },
    basicSkills: [
      { id: "ijichi_1", name: "장막 전개", type: "DEFENSE", description: "장막으로 방어", effect: { type: "DAMAGE_REDUCE", value: 50 } },
      { id: "ijichi_2", name: "결계 유지", type: "UTILITY", description: "결계를 유지하며 충전", effect: { type: "CHARGE", gaugeBonus: 20 } },
      { id: "ijichi_3", name: "저주력 공격", type: "ATTACK", description: "저주력으로 공격", effect: { type: "DAMAGE", value: 50 } }
    ],
    ultimateSkill: { id: "ijichi_ult", name: "완벽한 장막", description: "모든 것을 차단하는 결계", effect: { type: "DAMAGE_REDUCE", value: 90, duration: 2 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "akari_nitta",
    name: { ko: "닛타 아카리", ja: "新田明", en: "Akari Nitta" },
    grade: "3급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("akari_nitta", "닛타 아카리", "SOUL"),
    baseStats: { atk: 8, def: 13, spd: 12, ce: 17, hp: 72 },
    growthStats: { primary: "ce", secondary: "hp" },
    skill: { name: "완전 보존", description: "대상의 상태를 완전히 유지", effect: { type: "HEAL", value: 150 } },
    basicSkills: [
      { id: "nitta_1", name: "상태 유지", type: "UTILITY", description: "상태를 유지", effect: { type: "HEAL", value: 30 } },
      { id: "nitta_2", name: "치료 보조", type: "UTILITY", description: "치료를 보조", effect: { type: "HEAL", value: 40 } },
      { id: "nitta_3", name: "저주력 공격", type: "ATTACK", description: "저주력으로 공격", effect: { type: "DAMAGE", value: 50 } }
    ],
    ultimateSkill: { id: "nitta_ult", name: "완전 보존", description: "대상의 상태를 완전히 유지", effect: { type: "HEAL", value: 150 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "misato_kuroi",
    name: { ko: "쿠로이 미사토", ja: "黒井美里", en: "Misato Kuroi" },
    grade: "3급",
    attribute: "BODY",
    imageUrl: getCharacterImage("misato_kuroi", "쿠로이 미사토", "BODY"),
    baseStats: { atk: 10, def: 14, spd: 13, ce: 12, hp: 75 },
    growthStats: { primary: "def", secondary: "hp" },
    skill: { name: "필사의 수호", description: "목숨을 걸고 지킨다", effect: { type: "DAMAGE", value: 120, defBonus: 60 } },
    basicSkills: [
      { id: "kuroi_1", name: "호신술", type: "DEFENSE", description: "호신술로 방어", effect: { type: "DAMAGE_REDUCE", value: 40 } },
      { id: "kuroi_2", name: "타격", type: "ATTACK", description: "타격 공격", effect: { type: "DAMAGE", value: 65 } },
      { id: "kuroi_3", name: "회피", type: "DEFENSE", description: "회피 동작", effect: { type: "DODGE", chance: 35 } }
    ],
    ultimateSkill: { id: "kuroi_ult", name: "필사의 수호", description: "목숨을 걸고 지킨다", effect: { type: "DAMAGE", value: 120, defBonus: 60 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "masamichi_yaga",
    name: { ko: "야가 마사미치", ja: "夜蛾正道", en: "Masamichi Yaga" },
    grade: "3급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("masamichi_yaga", "야가 마사미치", "SOUL"),
    baseStats: { atk: 14, def: 15, spd: 11, ce: 18, hp: 82 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: { name: "자율 인형술", description: "자아를 가진 인형 군단", effect: { type: "MULTI_SUMMON", damage: 180 } },
    basicSkills: [
      { id: "yaga_1", name: "저주 인형 소환", type: "ATTACK", description: "인형을 소환하여 공격", effect: { type: "SUMMON_DAMAGE", value: 85 } },
      { id: "yaga_2", name: "인형 방어", type: "DEFENSE", description: "인형으로 방어", effect: { type: "DAMAGE_REDUCE", value: 45 } },
      { id: "yaga_3", name: "다중 소환", type: "ATTACK", description: "여러 인형 소환", effect: { type: "MULTI_HIT", hits: 3, value: 30 } }
    ],
    ultimateSkill: { id: "yaga_ult", name: "자율 인형술", description: "자아를 가진 인형 군단", effect: { type: "MULTI_SUMMON", damage: 180 }, gaugeRequired: 100 },
    achievements: []
  }
];
