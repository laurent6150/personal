// ========================================
// 특급 캐릭터 (13명)
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
    name: { ko: "옷코츠 유타", ja: "乙骨憂太", en: "Yuta Okkotsu" },
    grade: "특급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("yuta_okkotsu", "옷코츠 유타", "CURSE"),
    baseStats: { atk: 21, def: 18, spd: 20, ce: 26, hp: 95 },
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
    id: "yuki_tsukumo",
    name: { ko: "츠쿠모 유키", ja: "九十九由基", en: "Yuki Tsukumo" },
    grade: "특급",
    attribute: "BODY",
    imageUrl: getCharacterImage("yuki_tsukumo", "츠쿠모 유키", "BODY"),
    baseStats: { atk: 23, def: 16, spd: 19, ce: 22, hp: 90 },
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
    id: "kenjaku",
    name: { ko: "켄자쿠", ja: "羂索", en: "Kenjaku" },
    grade: "특급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("kenjaku", "켄자쿠", "SOUL"),
    baseStats: { atk: 18, def: 17, spd: 17, ce: 24, hp: 100 },
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
      { id: "sukuna_1", name: "해 (解)", type: "ATTACK", description: "대상의 저주력에 맞춰 조정하는 참격", effect: { type: "DAMAGE", value: 140 } },
      { id: "sukuna_2", name: "첩 (捷)", type: "ATTACK", description: "보이지 않는 기본 참격", effect: { type: "MULTI_HIT", hits: 3, value: 55 } },
      { id: "sukuna_3", name: "세계참 (世界斬)", type: "ATTACK", description: "존재하는 모든 것을 베는 신기의 참격", effect: { type: "DAMAGE", value: 160, ignoreDefense: true } }
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
      { id: "toji_1", name: "천역의 창 (天逆鉾)", type: "ATTACK", description: "술식을 무효화하는 특급 저주도구", effect: { type: "DAMAGE", value: 140, ignoreBarrier: true } },
      { id: "toji_2", name: "만상의 뱀", type: "UTILITY", description: "무기 저장 저주령 활용", effect: { type: "WEAPON_CHANGE", atkBonus: 25 } },
      { id: "toji_3", name: "암살", type: "ATTACK", description: "천여함수의 신체능력으로 급습", effect: { type: "CRITICAL_ATTACK", value: 160, critRate: 60 } }
    ],
    ultimateSkill: { id: "toji_ult", name: "천역봉인", description: "술식을 강제로 해제하는 특급 도구", effect: { type: "SKILL_NULLIFY", damage: 200 }, gaugeRequired: 100 },
    achievements: []
  },
  // ========================================
  // 신규 특급 캐릭터
  // ========================================
  {
    id: "mahoraga",
    name: { ko: "마허라", ja: "八握剣異戒神将魔虚羅", en: "Mahoraga" },
    grade: "특급",
    attribute: "BODY",
    imageUrl: getCharacterImage("mahoraga", "마허라", "BODY"),
    baseStats: { atk: 24, def: 22, spd: 18, ce: 20, hp: 110 },
    growthStats: { primary: "atk", secondary: "def" },
    skill: { name: "완전 적응", description: "모든 사상에 적응하여 무적 상태", effect: { type: "TRANSFORM", damage: 250, duration: 3 } },
    basicSkills: [
      { id: "mahoraga_1", name: "퇴마의 검", type: "ATTACK", description: "신성한 힘이 깃든 참격", effect: { type: "DAMAGE", value: 150, ignoreBarrier: true } },
      { id: "mahoraga_2", name: "적응", type: "DEFENSE", description: "받은 공격에 적응하여 무력화", effect: { type: "DAMAGE_REDUCE", value: 80 } },
      { id: "mahoraga_3", name: "정의의 바퀴", type: "UTILITY", description: "법진의 바퀴가 회전하며 적응 완료", effect: { type: "STAT_BOOST", defBonus: 50, atkBonus: 30 } }
    ],
    ultimateSkill: { id: "mahoraga_ult", name: "완전 적응 (適應)", description: "모든 사상에 적응한 무적의 일격", effect: { type: "TRANSFORM", damage: 250, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "rika_full",
    name: { ko: "완전체 리카", ja: "折本里香 (完全体)", en: "Rika (Full Manifestation)" },
    grade: "특급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("rika_full", "완전체 리카", "SOUL"),
    baseStats: { atk: 22, def: 20, spd: 19, ce: 28, hp: 100 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: { name: "사랑의 저주 해방", description: "무한의 사랑이 곧 무한의 저주", effect: { type: "TRANSFORM", damage: 280, ceBonus: 100, duration: 3 } },
    basicSkills: [
      { id: "rika_1", name: "저주력 해방", type: "ATTACK", description: "무한의 저주력을 방출", effect: { type: "DAMAGE", value: 140 } },
      { id: "rika_2", name: "술식 저장", type: "ATTACK", description: "흡수한 술식을 저장하여 사용", effect: { type: "COPY_ATTACK", multiplier: 0.9 } },
      { id: "rika_3", name: "사랑의 포옹", type: "DEFENSE", description: "리카가 대상을 감싸 보호", effect: { type: "DAMAGE_REDUCE", value: 70 } }
    ],
    ultimateSkill: { id: "rika_ult", name: "사랑의 저주 완전 해방", description: "무한의 사랑이 곧 무한의 저주", effect: { type: "TRANSFORM", damage: 280, ceBonus: 100, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "tamamo_no_mae",
    name: { ko: "화신 타마모노마에", ja: "化身玉藻前", en: "Tamamo-no-Mae Incarnate" },
    grade: "특급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("tamamo_no_mae", "화신 타마모노마에", "CURSE"),
    baseStats: { atk: 23, def: 19, spd: 20, ce: 24, hp: 105 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: { name: "구미호 해방", description: "진정한 구미호의 힘을 해방", effect: { type: "TRANSFORM", damage: 270, atkBonus: 50, duration: 3 } },
    basicSkills: [
      { id: "tamamo_1", name: "여우불 (狐火)", type: "ATTACK", description: "구미호의 요화로 공격", effect: { type: "DAMAGE", value: 140, element: "FIRE" } },
      { id: "tamamo_2", name: "변화술", type: "DEFENSE", description: "형체를 바꿔 공격 회피", effect: { type: "DODGE", chance: 60 } },
      { id: "tamamo_3", name: "저주 흡수", type: "UTILITY", description: "주변의 저주력을 흡수", effect: { type: "DRAIN", value: 100, healPercent: 40 } }
    ],
    ultimateSkill: { id: "tamamo_ult", name: "구미호 해방 (九尾解放)", description: "16체 특급 저주령 중 최강, 진정한 구미호의 힘", effect: { type: "TRANSFORM", damage: 270, atkBonus: 50, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "dabura",
    name: { ko: "다부라", ja: "ダブラ", en: "Dabura" },
    grade: "특급",
    attribute: "BODY",
    imageUrl: getCharacterImage("dabura", "다부라", "BODY"),
    baseStats: { atk: 25, def: 18, spd: 21, ce: 22, hp: 95 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "궁극 살의", description: "살의를 극한까지 실체화한 궁극의 일격", effect: { type: "DAMAGE", value: 300 } },
    basicSkills: [
      { id: "dabura_1", name: "살의 실체화", type: "ATTACK", description: "살의를 물리적 힘으로 변환", effect: { type: "TRUE_DAMAGE", value: 120 } },
      { id: "dabura_2", name: "시무리아 전투술", type: "ATTACK", description: "외계 전투 기술로 연속 공격", effect: { type: "MULTI_HIT", hits: 3, value: 55 } },
      { id: "dabura_3", name: "주력 강화", type: "DEFENSE", description: "시무리아 고유의 주력으로 방어", effect: { type: "DAMAGE_REDUCE", value: 50 } }
    ],
    ultimateSkill: { id: "dabura_ult", name: "궁극 살의 (殺意具現)", description: "살의를 극한까지 실체화, 모듈로 최강", effect: { type: "DAMAGE", value: 300 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "itadori_yuji_final",
    name: { ko: "이타도리 유지 (최종전)", ja: "虎杖悠仁 (最終戦)", en: "Itadori Yuji (Final Battle)" },
    grade: "특급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("itadori_yuji_final", "이타도리 유지 (최종전)", "SOUL"),
    baseStats: { atk: 23, def: 16, spd: 23, ce: 21, hp: 95 },
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
