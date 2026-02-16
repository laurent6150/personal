// ========================================
// 준특급 캐릭터 (7명)
// 게토, 텐겐, 토지, 마허라, 리카, 타마모노마에, 다부라
// ========================================

import type { CharacterCard } from '../../types';
import { getCharacterImage } from '../../utils/imageHelper';

export const SEMI_SPECIAL_GRADE: CharacterCard[] = [
  {
    id: "geto_suguru",
    name: { ko: "게토 스구루", ja: "夏油傑", en: "Geto Suguru" },
    grade: "준특급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("geto_suguru", "게토 스구루", "CURSE"),
    baseStats: { atk: 19, def: 18, spd: 18, ce: 22, hp: 93 },
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
    id: "tengen",
    name: { ko: "텐겐", ja: "天元", en: "Tengen" },
    grade: "준특급",
    attribute: "BARRIER",
    imageUrl: getCharacterImage("tengen", "텐겐", "BARRIER"),
    baseStats: { atk: 12, def: 20, spd: 10, ce: 25, hp: 100 },
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
    // CE 0 캐릭터: 8스탯 직접 지정 (CRT/TEC 상향, MNT 하향으로 CE 0 보정)
    id: "fushiguro_toji",
    name: { ko: "후시구로 토우지", ja: "伏黒甚爾", en: "Fushiguro Toji" },
    grade: "준특급",
    attribute: "BODY",
    imageUrl: getCharacterImage("fushiguro_toji", "후시구로 토우지", "BODY"),
    baseStats: { atk: 25, def: 16, spd: 24, ce: 0, hp: 92, crt: 26, tec: 20, mnt: 10 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "천역봉인", description: "모든 술식을 강제 해제", effect: { type: "SKILL_NULLIFY", damage: 200 } },
    basicSkills: [
      { id: "toji_1", name: "천역의 창 (天逆鉾)", type: "ATTACK", description: "술식을 무효화하는 특급 저주도구", effect: { type: "DAMAGE", value: 140, ignoreBarrier: true } },
      { id: "toji_2", name: "만상의 뱀", type: "UTILITY", description: "무기 저장 저주령 활용", effect: { type: "WEAPON_CHANGE", atkBonus: 15 } },
      { id: "toji_3", name: "암살", type: "ATTACK", description: "천여함수의 신체능력으로 급습", effect: { type: "CRITICAL_ATTACK", value: 145, critRate: 45 } }
    ],
    ultimateSkill: { id: "toji_ult", name: "천역봉인", description: "술식을 강제로 해제하는 특급 도구", effect: { type: "SKILL_NULLIFY", damage: 200 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "mahoraga",
    name: { ko: "마허라", ja: "八握剣異戒神将魔虚羅", en: "Mahoraga" },
    grade: "준특급",
    attribute: "BODY",
    imageUrl: getCharacterImage("mahoraga", "마허라", "BODY"),
    baseStats: { atk: 22, def: 18, spd: 18, ce: 20, hp: 100 },
    growthStats: { primary: "atk", secondary: "def" },
    skill: { name: "완전 적응", description: "모든 사상에 적응하여 무적 상태", effect: { type: "TRANSFORM", damage: 250, duration: 3 } },
    basicSkills: [
      { id: "mahoraga_1", name: "퇴마의 검", type: "ATTACK", description: "신성한 힘이 깃든 참격", effect: { type: "DAMAGE", value: 140, ignoreBarrier: true } },
      { id: "mahoraga_2", name: "적응", type: "DEFENSE", description: "받은 공격에 적응하여 무력화", effect: { type: "DAMAGE_REDUCE", value: 70 } },
      { id: "mahoraga_3", name: "정의의 바퀴", type: "UTILITY", description: "법진의 바퀴가 회전하며 적응 완료", effect: { type: "STAT_BOOST", defBonus: 40, atkBonus: 20 } }
    ],
    ultimateSkill: { id: "mahoraga_ult", name: "완전 적응 (適應)", description: "모든 사상에 적응한 무적의 일격", effect: { type: "TRANSFORM", damage: 250, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "rika_full",
    name: { ko: "완전체 리카", ja: "折本里香 (完全体)", en: "Rika (Full Manifestation)" },
    grade: "준특급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("rika_full", "완전체 리카", "SOUL"),
    baseStats: { atk: 22, def: 17, spd: 19, ce: 24, hp: 95 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: { name: "사랑의 저주 해방", description: "무한의 사랑이 곧 무한의 저주", effect: { type: "TRANSFORM", damage: 270, ceBonus: 80, duration: 3 } },
    basicSkills: [
      { id: "rika_1", name: "저주력 해방", type: "ATTACK", description: "무한의 저주력을 방출", effect: { type: "DAMAGE", value: 130 } },
      { id: "rika_2", name: "술식 저장", type: "ATTACK", description: "흡수한 술식을 저장하여 사용", effect: { type: "COPY_ATTACK", multiplier: 0.9 } },
      { id: "rika_3", name: "사랑의 포옹", type: "DEFENSE", description: "리카가 대상을 감싸 보호", effect: { type: "DAMAGE_REDUCE", value: 60 } }
    ],
    ultimateSkill: { id: "rika_ult", name: "사랑의 저주 완전 해방", description: "무한의 사랑이 곧 무한의 저주", effect: { type: "TRANSFORM", damage: 270, ceBonus: 80, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "tamamo_no_mae",
    name: { ko: "화신 타마모노마에", ja: "化身玉藻前", en: "Tamamo-no-Mae Incarnate" },
    grade: "준특급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("tamamo_no_mae", "화신 타마모노마에", "CURSE"),
    baseStats: { atk: 21, def: 19, spd: 20, ce: 22, hp: 95 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: { name: "구미호 해방", description: "진정한 구미호의 힘을 해방", effect: { type: "TRANSFORM", damage: 260, atkBonus: 40, duration: 3 } },
    basicSkills: [
      { id: "tamamo_1", name: "여우불 (狐火)", type: "ATTACK", description: "구미호의 요화로 공격", effect: { type: "DAMAGE", value: 130, element: "FIRE" } },
      { id: "tamamo_2", name: "변화술", type: "DEFENSE", description: "형체를 바꿔 공격 회피", effect: { type: "DODGE", chance: 50 } },
      { id: "tamamo_3", name: "저주 흡수", type: "UTILITY", description: "주변의 저주력을 흡수", effect: { type: "DRAIN", value: 90, healPercent: 30 } }
    ],
    ultimateSkill: { id: "tamamo_ult", name: "구미호 해방 (九尾解放)", description: "16체 특급 저주령 중 최강, 진정한 구미호의 힘", effect: { type: "TRANSFORM", damage: 260, atkBonus: 40, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "dabura",
    name: { ko: "다부라", ja: "ダブラ", en: "Dabura" },
    grade: "준특급",
    attribute: "BODY",
    imageUrl: getCharacterImage("dabura", "다부라", "BODY"),
    baseStats: { atk: 23, def: 18, spd: 21, ce: 20, hp: 95 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "궁극 살의", description: "살의를 극한까지 실체화한 궁극의 일격", effect: { type: "DAMAGE", value: 280 } },
    basicSkills: [
      { id: "dabura_1", name: "살의 실체화", type: "ATTACK", description: "살의를 물리적 힘으로 변환", effect: { type: "TRUE_DAMAGE", value: 110 } },
      { id: "dabura_2", name: "시무리아 전투술", type: "ATTACK", description: "외계 전투 기술로 연속 공격", effect: { type: "MULTI_HIT", hits: 3, value: 50 } },
      { id: "dabura_3", name: "주력 강화", type: "DEFENSE", description: "시무리아 고유의 주력으로 방어", effect: { type: "DAMAGE_REDUCE", value: 50 } }
    ],
    ultimateSkill: { id: "dabura_ult", name: "궁극 살의 (殺意具現)", description: "살의를 극한까지 실체화, 모듈로 최강", effect: { type: "DAMAGE", value: 280 }, gaugeRequired: 100 },
    achievements: []
  }
];
