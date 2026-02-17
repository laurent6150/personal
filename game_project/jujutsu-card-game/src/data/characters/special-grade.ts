// ========================================
// 특급 캐릭터 (6명)
// 고죠, 스쿠나, 유타, 켄자쿠, 유키, 이타도리(최종전)
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
    baseStats: { atk: 22, def: 20, spd: 20, ce: 25, hp: 100 },
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
    id: "ryomen_sukuna",
    name: { ko: "료멘 스쿠나", ja: "両面宿儺", en: "Ryomen Sukuna" },
    grade: "특급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("ryomen_sukuna", "료멘 스쿠나", "CURSE"),
    baseStats: { atk: 25, def: 18, spd: 20, ce: 24, hp: 100 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: { name: "복마전신", description: "결계 없는 영역전개, 무한 참격", effect: { type: "CONTINUOUS_DAMAGE", value: 90, duration: 3, ignoreDefense: true } },
    basicSkills: [
      { id: "sukuna_1", name: "해 (解)", type: "ATTACK", description: "대상의 저주력에 맞춰 조정하는 참격", effect: { type: "DAMAGE", value: 140 } },
      { id: "sukuna_2", name: "첩 (捷)", type: "ATTACK", description: "보이지 않는 기본 참격", effect: { type: "MULTI_HIT", hits: 3, value: 55 } },
      { id: "sukuna_3", name: "세계참 (世界斬)", type: "ATTACK", description: "존재하는 모든 것을 베는 신기의 참격", effect: { type: "DAMAGE", value: 150, ignoreDefense: true } }
    ],
    ultimateSkill: { id: "sukuna_ult", name: "복마전신 (伏魔御廚子)", description: "결계 없는 영역전개, 끊임없는 참격", effect: { type: "CONTINUOUS_DAMAGE", value: 90, duration: 3, ignoreDefense: true }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "yuta_okkotsu",
    name: { ko: "옷코츠 유타", ja: "乙骨憂太", en: "Yuta Okkotsu" },
    grade: "특급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("yuta_okkotsu", "옷코츠 유타", "CURSE"),
    baseStats: { atk: 23, def: 18, spd: 20, ce: 25, hp: 102 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: { name: "진안상애", description: "사랑과 저주가 뒤엉킨 영역전개", effect: { type: "DOMAIN", damage: 260, ceBonus: 50 } },
    basicSkills: [
      { id: "yuta_1", name: "반전술식", type: "UTILITY", description: "부상을 회복한다", effect: { type: "HEAL", value: 60 } },
      { id: "yuta_2", name: "검술", type: "ATTACK", description: "리카와 함께 검격", effect: { type: "DAMAGE", value: 130 } },
      { id: "yuta_3", name: "술식 복사", type: "ATTACK", description: "상대의 술식을 복제", effect: { type: "COPY_ATTACK", multiplier: 0.9 } }
    ],
    ultimateSkill: { id: "yuta_ult", name: "진안상애 (真贋相愛)", description: "사랑과 저주가 뒤엉킨 영역전개", effect: { type: "DOMAIN", damage: 260, ceBonus: 50 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "kenjaku",
    name: { ko: "켄자쿠", ja: "羂索", en: "Kenjaku" },
    grade: "특급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("kenjaku", "켄자쿠", "SOUL"),
    baseStats: { atk: 22, def: 17, spd: 18, ce: 25, hp: 104 },
    growthStats: { primary: "ce", secondary: "hp" },
    skill: { name: "태산부군제", description: "천년의 지혜로 완성한 금기술식", effect: { type: "DAMAGE", value: 240, skillSeal: true } },
    basicSkills: [
      { id: "kenjaku_1", name: "저주령 조작", type: "ATTACK", description: "게토의 몸에서 얻은 저주령 사역", effect: { type: "SUMMON_DAMAGE", value: 110 } },
      { id: "kenjaku_2", name: "반중력 시스템", type: "UTILITY", description: "반중력 기구로 공중 기동", effect: { type: "DODGE", chance: 45 } },
      { id: "kenjaku_3", name: "무위전변", type: "ATTACK", description: "마히토에게서 흡수한 영혼 변형 술식", effect: { type: "TRUE_DAMAGE", value: 120 } }
    ],
    ultimateSkill: { id: "kenjaku_ult", name: "태산부군제", description: "천년의 경험으로 완성한 술식", effect: { type: "DAMAGE", value: 240, skillSeal: true }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "yuki_tsukumo",
    name: { ko: "츠쿠모 유키", ja: "九十九由基", en: "Yuki Tsukumo" },
    grade: "특급",
    attribute: "BODY",
    imageUrl: getCharacterImage("yuki_tsukumo", "츠쿠모 유키", "BODY"),
    baseStats: { atk: 24, def: 16, spd: 19, ce: 24, hp: 97 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "흑점", description: "무한에 가까운 질량으로 블랙홀 생성", effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 25, damage: 300 } },
    basicSkills: [
      { id: "yuki_1", name: "봉래신력 - 성자", type: "ATTACK", description: "가상 질량을 부여한 강력한 타격", effect: { type: "DAMAGE", value: 150 } },
      { id: "yuki_2", name: "가르다", type: "ATTACK", description: "식신 가르다로 공격", effect: { type: "SUMMON_DAMAGE", value: 110 } },
      { id: "yuki_3", name: "질량 부여", type: "DEFENSE", description: "자신에게 질량을 부여하여 방어", effect: { type: "DAMAGE_REDUCE", value: 40 } }
    ],
    ultimateSkill: { id: "yuki_ult", name: "흑점 (黑點)", description: "무한에 가까운 질량으로 블랙홀 생성", effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 25, damage: 300 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "itadori_yuji_final",
    name: { ko: "이타도리 유지 (최종전)", ja: "虎杖悠仁 (最終戦)", en: "Itadori Yuji (Final Battle)" },
    grade: "특급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("itadori_yuji_final", "이타도리 유지 (최종전)", "SOUL"),
    baseStats: { atk: 22, def: 18, spd: 21, ce: 22, hp: 97 },
    growthStats: { primary: "spd", secondary: "atk" },
    skill: { name: "영혼의 일격", description: "영혼에 직접 도달하는 주먹, 스쿠나를 꺾은 최후의 일격", effect: { type: "TRUE_DAMAGE", value: 250, ignoreDefense: true } },
    basicSkills: [
      { id: "yuji_final_1", name: "해 (解)", type: "ATTACK", description: "스쿠나에게서 이어받은 참격 술식", effect: { type: "DAMAGE", value: 135, ignoreBarrier: true } },
      { id: "yuji_final_2", name: "흑섬 연쇄", type: "ATTACK", description: "연속으로 흑섬을 발동하는 극한의 집중", effect: { type: "MULTI_HIT", hits: 3, value: 50 } },
      { id: "yuji_final_3", name: "반전술식", type: "UTILITY", description: "저주력을 역전시켜 부상을 회복", effect: { type: "HEAL", value: 60 } }
    ],
    ultimateSkill: { id: "yuji_final_ult", name: "영혼의 일격 (魂打)", description: "영혼에 직접 도달하는 일격, 스쿠나를 꺾은 최후의 주먹", effect: { type: "TRUE_DAMAGE", value: 250, ignoreDefense: true }, gaugeRequired: 100 },
    achievements: []
  }
];
