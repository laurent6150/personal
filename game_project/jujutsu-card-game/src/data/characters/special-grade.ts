// ========================================
// 특급 캐릭터 (8명)
// ========================================

import type { CharacterCard } from '../../types';
import { getCharacterImage } from '../../utils/imageHelper';

export const SPECIAL_GRADE: CharacterCard[] = [
  {
    id: "gojo_satoru",
    name: { ko: "고죠 사토루", ja: "五条悟", en: "Gojo Satoru" },
    grade: "특급",
    attribute: "BARRIER",
    imageUrl: getCharacterImage("gojo_satoru", "고죠 사토루", "BARRIER"),
    baseStats: { atk: 22, def: 20, spd: 22, ce: 25, hp: 100 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: { name: "무량공처", description: "무한의 정보를 흘려보내 행동불능", effect: { type: "STUN", duration: 2, damage: 200 } },
    basicSkills: [
      { id: "gojo_1", name: "무하 (無下)", type: "DEFENSE", description: "무한의 공간으로 모든 공격을 멈춘다", effect: { type: "DAMAGE_REDUCE", value: 80 } },
      { id: "gojo_2", name: "술순전환 - 창", type: "ATTACK", description: "저주력을 수렴하여 강력한 일격", effect: { type: "DAMAGE", value: 140 } },
      { id: "gojo_3", name: "술순전환 - 적", type: "ATTACK", description: "저주력을 발산하여 밀어낸다", effect: { type: "DAMAGE", value: 130, extra: "KNOCKBACK" } }
    ],
    ultimateSkill: { id: "gojo_ult", name: "무량공처 (無量空處)", description: "무한의 정보를 흘려보내 행동불능", effect: { type: "STUN", duration: 2, damage: 200 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "geto_suguru",
    name: { ko: "게토 스구루", ja: "夏油傑", en: "Geto Suguru" },
    grade: "특급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("geto_suguru", "게토 스구루", "CURSE"),
    baseStats: { atk: 20, def: 18, spd: 18, ce: 24, hp: 95 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: { name: "우즈마키", description: "모든 저주령을 하나로 합쳐 극대화", effect: { type: "DAMAGE", value: 280 } },
    basicSkills: [
      { id: "geto_1", name: "저주령 조작", type: "ATTACK", description: "흡수한 저주령을 사역", effect: { type: "SUMMON_DAMAGE", value: 120 } },
      { id: "geto_2", name: "극노천", type: "ATTACK", description: "다수의 저주령으로 광역 공격", effect: { type: "AOE_DAMAGE", value: 100 } },
      { id: "geto_3", name: "저주령 방벽", type: "DEFENSE", description: "저주령으로 방어막 형성", effect: { type: "DAMAGE_REDUCE", value: 50 } }
    ],
    ultimateSkill: { id: "geto_ult", name: "우즈마키 (渦)", description: "모든 저주령을 하나로 합쳐 극대화된 일격", effect: { type: "DAMAGE", value: 280 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "yuta_okkotsu",
    name: { ko: "오코츠 유타", ja: "乙骨憂太", en: "Yuta Okkotsu" },
    grade: "특급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("yuta_okkotsu", "오코츠 유타", "CURSE"),
    baseStats: { atk: 21, def: 18, spd: 20, ce: 26, hp: 95 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: { name: "리카 완전 현현", description: "특급 과오원령의 완전한 힘", effect: { type: "SUMMON", damage: 260, defBonus: 40 } },
    basicSkills: [
      { id: "yuta_1", name: "반전술식", type: "UTILITY", description: "부상을 회복한다", effect: { type: "HEAL", value: 60 } },
      { id: "yuta_2", name: "검술", type: "ATTACK", description: "리카와 함께 검격", effect: { type: "DAMAGE", value: 130 } },
      { id: "yuta_3", name: "술식 복사", type: "ATTACK", description: "상대의 술식을 복제", effect: { type: "COPY_ATTACK", multiplier: 0.9 } }
    ],
    ultimateSkill: { id: "yuta_ult", name: "리카 완전 현현", description: "특급 과오원령 리카의 완전한 힘", effect: { type: "SUMMON", damage: 260, defBonus: 40 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "yuki_tsukumo",
    name: { ko: "츠쿠모 유키", ja: "九十九由基", en: "Yuki Tsukumo" },
    grade: "특급",
    attribute: "BODY",
    imageUrl: getCharacterImage("yuki_tsukumo", "츠쿠모 유키", "BODY"),
    baseStats: { atk: 23, def: 16, spd: 19, ce: 22, hp: 90 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "흑점", description: "무한에 가까운 질량으로 블랙홀 생성", effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 25, damage: 300 } },
    basicSkills: [
      { id: "yuki_1", name: "성자 (星者)", type: "ATTACK", description: "질량을 부여한 강력한 타격", effect: { type: "DAMAGE", value: 150 } },
      { id: "yuki_2", name: "가르다", type: "ATTACK", description: "식신 가르다로 공격", effect: { type: "SUMMON_DAMAGE", value: 110 } },
      { id: "yuki_3", name: "질량 부여", type: "DEFENSE", description: "자신에게 질량을 부여하여 방어", effect: { type: "DAMAGE_REDUCE", value: 40 } }
    ],
    ultimateSkill: { id: "yuki_ult", name: "흑점 (黑點)", description: "무한에 가까운 질량으로 블랙홀 생성", effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 25, damage: 300 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "kenjaku",
    name: { ko: "켄자쿠", ja: "羂索", en: "Kenjaku" },
    grade: "특급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("kenjaku", "켄자쿠", "SOUL"),
    baseStats: { atk: 18, def: 17, spd: 17, ce: 24, hp: 100 },
    growthStats: { primary: "ce", secondary: "hp" },
    skill: { name: "태산부군제", description: "천년의 지혜로 완성한 금기술식", effect: { type: "DAMAGE", value: 240, skillSeal: true } },
    basicSkills: [
      { id: "kenjaku_1", name: "저주령 조작", type: "ATTACK", description: "흡수한 저주령을 사역", effect: { type: "SUMMON_DAMAGE", value: 110 } },
      { id: "kenjaku_2", name: "중력 조작", type: "UTILITY", description: "중력을 조작하여 느리게", effect: { type: "SLOW", value: 30 } },
      { id: "kenjaku_3", name: "뇌격", type: "ATTACK", description: "번개를 다루는 술식", effect: { type: "DAMAGE", value: 120 } }
    ],
    ultimateSkill: { id: "kenjaku_ult", name: "태산부군제", description: "천년의 경험으로 완성한 술식", effect: { type: "DAMAGE", value: 240, skillSeal: true }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "tengen",
    name: { ko: "텐겐", ja: "天元", en: "Tengen" },
    grade: "특급",
    attribute: "BARRIER",
    imageUrl: getCharacterImage("tengen", "텐겐", "BARRIER"),
    baseStats: { atk: 12, def: 25, spd: 10, ce: 28, hp: 120 },
    growthStats: { primary: "def", secondary: "ce" },
    skill: { name: "허공다면체", description: "무수한 결계가 중첩된 절대 방어", effect: { type: "DAMAGE_REDUCE", value: 90, duration: 2 } },
    basicSkills: [
      { id: "tengen_1", name: "결계술", type: "DEFENSE", description: "강력한 결계로 방어", effect: { type: "DAMAGE_REDUCE", value: 70 } },
      { id: "tengen_2", name: "정보 인지", type: "UTILITY", description: "상대의 움직임을 예측", effect: { type: "DODGE", chance: 40 } },
      { id: "tengen_3", name: "저주력 방출", type: "ATTACK", description: "순수한 저주력으로 공격", effect: { type: "DAMAGE", value: 90 } }
    ],
    ultimateSkill: { id: "tengen_ult", name: "허공다면체", description: "무수한 결계가 중첩된 절대 방어", effect: { type: "DAMAGE_REDUCE", value: 90, duration: 2 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "ryomen_sukuna",
    name: { ko: "료멘 스쿠나", ja: "両面宿儺", en: "Ryomen Sukuna" },
    grade: "특급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("ryomen_sukuna", "료멘 스쿠나", "CURSE"),
    baseStats: { atk: 25, def: 18, spd: 22, ce: 24, hp: 95 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: { name: "복마전신", description: "결계 없는 영역전개, 무한 참격", effect: { type: "CONTINUOUS_DAMAGE", value: 90, duration: 3, ignoreDefense: true } },
    basicSkills: [
      { id: "sukuna_1", name: "해 (解)", type: "ATTACK", description: "기본 참격", effect: { type: "DAMAGE", value: 130 } },
      { id: "sukuna_2", name: "첩 (捷)", type: "ATTACK", description: "연속 참격", effect: { type: "MULTI_HIT", hits: 3, value: 55 } },
      { id: "sukuna_3", name: "■ (화염)", type: "ATTACK", description: "화염을 다루는 술식", effect: { type: "DAMAGE", value: 140, element: "FIRE" } }
    ],
    ultimateSkill: { id: "sukuna_ult", name: "복마전신 (伏魔御廚子)", description: "결계 없는 영역전개, 끊임없는 참격", effect: { type: "CONTINUOUS_DAMAGE", value: 90, duration: 3, ignoreDefense: true }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "fushiguro_toji",
    name: { ko: "후시구로 토지", ja: "伏黒甚爾", en: "Fushiguro Toji" },
    grade: "특급",
    attribute: "BODY",
    imageUrl: getCharacterImage("fushiguro_toji", "후시구로 토지", "BODY"),
    baseStats: { atk: 24, def: 15, spd: 25, ce: 0, hp: 90 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "천역봉인", description: "모든 술식을 강제 해제", effect: { type: "SKILL_NULLIFY", damage: 200 } },
    basicSkills: [
      { id: "toji_1", name: "유성의 검", type: "ATTACK", description: "특급 저주도구로 공격", effect: { type: "DAMAGE", value: 140, ignoreBarrier: true } },
      { id: "toji_2", name: "만상의 뱀", type: "UTILITY", description: "무기 저장 저주령 활용", effect: { type: "WEAPON_CHANGE", atkBonus: 25 } },
      { id: "toji_3", name: "암살", type: "ATTACK", description: "천여함수의 신체능력으로 급습", effect: { type: "CRITICAL_ATTACK", value: 160, critRate: 60 } }
    ],
    ultimateSkill: { id: "toji_ult", name: "천역봉인", description: "술식을 강제로 해제하는 특급 도구", effect: { type: "SKILL_NULLIFY", damage: 200 }, gaugeRequired: 100 },
    achievements: []
  }
];
