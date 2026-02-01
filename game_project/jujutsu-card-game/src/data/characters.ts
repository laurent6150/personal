// ========================================
// 캐릭터 데이터 (20장) - 새로운 기술 시스템
// ========================================

import type { CharacterCard } from '../types';
import { ATTRIBUTES } from './constants';

// 플레이스홀더 이미지 생성 함수
const getPlaceholderImage = (name: string, attribute: keyof typeof ATTRIBUTES): string => {
  const color = ATTRIBUTES[attribute].color.replace('#', '');
  return `https://via.placeholder.com/200x280/${color}/FFFFFF?text=${encodeURIComponent(name)}`;
};

// ===== 특급 - 3장 =====
const S_GRADE: CharacterCard[] = [
  {
    id: "gojo_satoru",
    name: { ko: "고죠 사토루", ja: "五条悟", en: "Gojo Satoru" },
    grade: "특급",
    attribute: "BARRIER",
    imageUrl: getPlaceholderImage("고죠", "BARRIER"),
    baseStats: { atk: 20, def: 18, spd: 20, ce: 25, hp: 100 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: {
      name: "무량공처 (無量空處)",
      description: "무한의 정보를 흘려보내 행동불능 상태로 만든다",
      effect: { type: "STUN", duration: 2, damage: 200 }
    },
    basicSkills: [
      {
        id: "gojo_1",
        name: "무하 (無下)",
        type: "DEFENSE",
        description: "무한의 공간으로 모든 공격을 멈춘다",
        effect: { type: "DAMAGE_REDUCE", value: 80 }
      },
      {
        id: "gojo_2",
        name: "술순전환 - 창",
        type: "ATTACK",
        description: "저주력을 수렴하여 강력한 일격",
        effect: { type: "DAMAGE", value: 150 }
      },
      {
        id: "gojo_3",
        name: "술순전환 - 적",
        type: "ATTACK",
        description: "저주력을 발산하여 밀어낸다",
        effect: { type: "DAMAGE", value: 100, extra: "KNOCKBACK" }
      }
    ],
    ultimateSkill: {
      id: "gojo_ult",
      name: "무량공처 (無量空處)",
      description: "무한의 정보를 흘려보내 행동불능",
      effect: { type: "STUN", duration: 2, damage: 200 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "gojo_ach_1",
        name: "무하의 경지",
        description: "고죠로 10승",
        condition: { type: "WINS", count: 10 },
        reward: { type: "ITEM", itemId: "six_eyes" }
      },
      {
        id: "gojo_ach_2",
        name: "최강의 증명",
        description: "특급 상대로 5승",
        condition: { type: "DEFEAT_SPECIFIC", target: "특급", count: 5 },
        reward: { type: "ITEM", itemId: "infinity_ring" }
      }
    ]
  },
  {
    id: "ryomen_sukuna",
    name: { ko: "료멘 스쿠나", ja: "両面宿儺", en: "Ryomen Sukuna" },
    grade: "특급",
    attribute: "CURSE",
    imageUrl: getPlaceholderImage("스쿠나", "CURSE"),
    baseStats: { atk: 25, def: 15, spd: 18, ce: 22, hp: 100 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: {
      name: "해 (解)",
      description: "만물을 베어내는 참격, 방어 무시",
      effect: { type: "DAMAGE", value: 120, ignoreDefense: true }
    },
    basicSkills: [
      {
        id: "sukuna_1",
        name: "해 (解)",
        type: "ATTACK",
        description: "기본 참격",
        effect: { type: "DAMAGE", value: 120 }
      },
      {
        id: "sukuna_2",
        name: "첩 (捷)",
        type: "ATTACK",
        description: "연속 참격",
        effect: { type: "MULTI_HIT", hits: 3, value: 50 }
      },
      {
        id: "sukuna_3",
        name: "■ (불명)",
        type: "ATTACK",
        description: "화염을 다루는 술식",
        effect: { type: "DAMAGE", value: 130, element: "FIRE" }
      }
    ],
    ultimateSkill: {
      id: "sukuna_ult",
      name: "복마전신 (伏魔御廚子)",
      description: "결계 없는 영역전개, 끊임없는 참격",
      effect: { type: "CONTINUOUS_DAMAGE", value: 80, duration: 3, ignoreDefense: true },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "sukuna_ach_1",
        name: "저주의 왕",
        description: "스쿠나로 15승",
        condition: { type: "WINS", count: 15 },
        reward: { type: "ITEM", itemId: "malevolent_shrine_talisman" }
      }
    ]
  },
  {
    id: "kenjaku",
    name: { ko: "켄자쿠", ja: "羂索", en: "Kenjaku" },
    grade: "특급",
    attribute: "SOUL",
    imageUrl: getPlaceholderImage("켄자쿠", "SOUL"),
    baseStats: { atk: 18, def: 16, spd: 17, ce: 24, hp: 100 },
    growthStats: { primary: "ce", secondary: "hp" },
    skill: {
      name: "육체 전환",
      description: "천년의 지혜로 상대 술식 무효화",
      effect: { type: "SKILL_NULLIFY", skillSeal: true }
    },
    basicSkills: [
      {
        id: "kenjaku_1",
        name: "저주령 조작",
        type: "ATTACK",
        description: "흡수한 저주령을 사역",
        effect: { type: "SUMMON_DAMAGE", value: 100 }
      },
      {
        id: "kenjaku_2",
        name: "중력 조작",
        type: "UTILITY",
        description: "카모 노리토시의 술식으로 중력 조작",
        effect: { type: "SLOW", value: 30 }
      },
      {
        id: "kenjaku_3",
        name: "뇌격",
        type: "ATTACK",
        description: "번개를 다루는 술식",
        effect: { type: "DAMAGE", value: 110 }
      }
    ],
    ultimateSkill: {
      id: "kenjaku_ult",
      name: "태산부군제",
      description: "천년의 경험으로 완성한 술식",
      effect: { type: "DAMAGE", value: 250, skillSeal: true },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "kenjaku_ach_1",
        name: "천년의 계략",
        description: "모든 특급 격파",
        condition: { type: "DEFEAT_SPECIFIC", target: "ALL_특급", count: 1 },
        reward: { type: "ITEM", itemId: "cursed_manipulation" }
      }
    ]
  }
];

// ===== 1급 - 7장 =====
const A_GRADE: CharacterCard[] = [
  {
    id: "fushiguro_toji",
    name: { ko: "후시구로 토지", ja: "伏黒甚爾", en: "Fushiguro Toji" },
    grade: "1급",
    attribute: "BODY",
    imageUrl: getPlaceholderImage("토지", "BODY"),
    baseStats: { atk: 22, def: 14, spd: 19, ce: 0, hp: 90 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: {
      name: "천여함수 (天与咸受)",
      description: "저주력 0, 압도적 신체 능력",
      effect: { type: "STAT_BOOST", atkBonus: 50 }
    },
    basicSkills: [
      {
        id: "toji_1",
        name: "유성의 검",
        type: "ATTACK",
        description: "특급 저주도구로 공격",
        effect: { type: "DAMAGE", value: 130, ignoreBarrier: true }
      },
      {
        id: "toji_2",
        name: "만상의 뱀",
        type: "UTILITY",
        description: "무기 저장 저주령 활용",
        effect: { type: "WEAPON_CHANGE", atkBonus: 20 }
      },
      {
        id: "toji_3",
        name: "암살",
        type: "ATTACK",
        description: "천여함수의 신체능력으로 급습",
        effect: { type: "CRITICAL_ATTACK", value: 150, critRate: 50 }
      }
    ],
    ultimateSkill: {
      id: "toji_ult",
      name: "천역봉인",
      description: "술식을 강제로 해제하는 특급 도구",
      effect: { type: "SKILL_NULLIFY", damage: 180 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "toji_ach_1",
        name: "술사 킬러",
        description: "토지로 고죠 격파",
        condition: { type: "DEFEAT_SPECIFIC", target: "gojo_satoru", count: 1 },
        reward: { type: "ITEM", itemId: "inverted_spear" }
      }
    ]
  },
  {
    id: "nanami_kento",
    name: { ko: "나나미 켄토", ja: "七海建人", en: "Nanami Kento" },
    grade: "1급",
    attribute: "BODY",
    imageUrl: getPlaceholderImage("나나미", "BODY"),
    baseStats: { atk: 18, def: 16, spd: 15, ce: 18, hp: 85 },
    growthStats: { primary: "atk", secondary: "def" },
    skill: {
      name: "7:3 비율",
      description: "약점을 정확히 노려 치명타",
      effect: { type: "RATIO_DAMAGE", value: 100, damage: 30 }
    },
    basicSkills: [
      {
        id: "nanami_1",
        name: "비율 참격",
        type: "ATTACK",
        description: "7:3 비율의 약점을 노린다",
        effect: { type: "RATIO_DAMAGE", value: 100, damage: 30 }
      },
      {
        id: "nanami_2",
        name: "둔도로 강타",
        type: "ATTACK",
        description: "둔도를 이용한 강력한 일격",
        effect: { type: "DAMAGE", value: 110 }
      },
      {
        id: "nanami_3",
        name: "방어 자세",
        type: "DEFENSE",
        description: "단단한 방어 태세",
        effect: { type: "DAMAGE_REDUCE", value: 40 }
      }
    ],
    ultimateSkill: {
      id: "nanami_ult",
      name: "시간외 노동 (오버타임)",
      description: "리미터 해제, 모든 능력 강화",
      effect: { type: "STAT_BOOST", atkBonus: 50, spdBonus: 30, damage: 200 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "nanami_ach_1",
        name: "프로의 자세",
        description: "나나미로 20승",
        condition: { type: "WINS", count: 20 },
        reward: { type: "ITEM", itemId: "ratio_blade" }
      }
    ]
  },
  {
    id: "jogo",
    name: { ko: "죠고", ja: "漏瑚", en: "Jogo" },
    grade: "1급",
    attribute: "CONVERT",
    imageUrl: getPlaceholderImage("죠고", "CONVERT"),
    baseStats: { atk: 20, def: 12, spd: 16, ce: 22, hp: 85 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: {
      name: "화염탄",
      description: "강력한 화염 공격",
      effect: { type: "DAMAGE", value: 120, element: "FIRE" }
    },
    basicSkills: [
      {
        id: "jogo_1",
        name: "화염탄",
        type: "ATTACK",
        description: "강력한 화염 투사체",
        effect: { type: "DAMAGE", value: 120, element: "FIRE" }
      },
      {
        id: "jogo_2",
        name: "용암 분출",
        type: "ATTACK",
        description: "땅에서 용암을 분출",
        effect: { type: "AOE_DAMAGE", value: 90 }
      },
      {
        id: "jogo_3",
        name: "소각",
        type: "ATTACK",
        description: "모든 것을 태운다",
        effect: { type: "BURN", value: 60, dotDamage: 20, duration: 2 }
      }
    ],
    ultimateSkill: {
      id: "jogo_ult",
      name: "개문돈갑 (철위산)",
      description: "내부 온도가 태양 수준인 영역",
      effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 30, damage: 300 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "jogo_ach_1",
        name: "대지의 분노",
        description: "죠고로 10승",
        condition: { type: "WINS", count: 10 },
        reward: { type: "ITEM", itemId: "volcano_core" }
      }
    ]
  },
  {
    id: "hanami",
    name: { ko: "하나미", ja: "花御", en: "Hanami" },
    grade: "1급",
    attribute: "CONVERT",
    imageUrl: getPlaceholderImage("하나미", "CONVERT"),
    baseStats: { atk: 16, def: 18, spd: 14, ce: 20, hp: 90 },
    growthStats: { primary: "def", secondary: "ce" },
    skill: {
      name: "저주의 새싹",
      description: "자연의 힘으로 회복",
      effect: { type: "HEAL", value: 50 }
    },
    basicSkills: [
      {
        id: "hanami_1",
        name: "저주의 새싹",
        type: "ATTACK",
        description: "저주의 나무를 소환하여 공격",
        effect: { type: "DAMAGE", value: 100 }
      },
      {
        id: "hanami_2",
        name: "목룡",
        type: "ATTACK",
        description: "거대한 나무 용을 소환",
        effect: { type: "DAMAGE", value: 130 }
      },
      {
        id: "hanami_3",
        name: "자연 흡수",
        type: "UTILITY",
        description: "주변의 생명력을 흡수",
        effect: { type: "HEAL", value: 50 }
      }
    ],
    ultimateSkill: {
      id: "hanami_ult",
      name: "화어 (재앙의 꽃)",
      description: "주변 생물의 저주력을 강제 흡수",
      effect: { type: "DRAIN", value: 150, healPercent: 50 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "hanami_ach_1",
        name: "자연의 수호자",
        description: "하나미로 10승",
        condition: { type: "WINS", count: 10 },
        reward: { type: "ITEM", itemId: "nature_blessing" }
      }
    ]
  },
  {
    id: "choso",
    name: { ko: "쵸소", ja: "脹相", en: "Choso" },
    grade: "1급",
    attribute: "CURSE",
    imageUrl: getPlaceholderImage("쵸소", "CURSE"),
    baseStats: { atk: 19, def: 15, spd: 17, ce: 19, hp: 85 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: {
      name: "적혈 조작",
      description: "피를 조작하여 공격",
      effect: { type: "MULTI_HIT", hits: 4, value: 35 }
    },
    basicSkills: [
      {
        id: "choso_1",
        name: "적혈 조작 - 천혈",
        type: "ATTACK",
        description: "경화된 피를 발사",
        effect: { type: "DAMAGE", value: 110 }
      },
      {
        id: "choso_2",
        name: "적혈 조작 - 혈인",
        type: "ATTACK",
        description: "연속으로 피를 발사",
        effect: { type: "MULTI_HIT", hits: 4, value: 35 }
      },
      {
        id: "choso_3",
        name: "혈갑",
        type: "DEFENSE",
        description: "피로 갑옷을 형성",
        effect: { type: "DAMAGE_REDUCE", value: 50 }
      }
    ],
    ultimateSkill: {
      id: "choso_ult",
      name: "초노바",
      description: "혈액을 독으로 변환하여 폭발",
      effect: { type: "POISON_EXPLOSION", damage: 220, dotDamage: 30, duration: 2 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "choso_ach_1",
        name: "혈족의 사랑",
        description: "쵸소로 15승",
        condition: { type: "WINS", count: 15 },
        reward: { type: "ITEM", itemId: "blood_manipulation" }
      }
    ]
  },
  {
    id: "yuta_okkotsu",
    name: { ko: "오코츠 유타", ja: "乙骨憂太", en: "Yuta Okkotsu" },
    grade: "1급",
    attribute: "CURSE",
    imageUrl: getPlaceholderImage("유타", "CURSE"),
    baseStats: { atk: 18, def: 16, spd: 16, ce: 25, hp: 90 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: {
      name: "리카",
      description: "특급 과오원령의 힘",
      effect: { type: "SUMMON", damage: 150 }
    },
    basicSkills: [
      {
        id: "yuta_1",
        name: "저주 반전술",
        type: "UTILITY",
        description: "부상을 회복한다",
        effect: { type: "HEAL", value: 60 }
      },
      {
        id: "yuta_2",
        name: "검술",
        type: "ATTACK",
        description: "리카와 함께 검격",
        effect: { type: "DAMAGE", value: 120 }
      },
      {
        id: "yuta_3",
        name: "복제 술식",
        type: "ATTACK",
        description: "상대의 술식을 복제하여 사용",
        effect: { type: "COPY_ATTACK", multiplier: 0.8 }
      }
    ],
    ultimateSkill: {
      id: "yuta_ult",
      name: "리카 완전 현현",
      description: "특급 과오원령 리카의 완전한 힘",
      effect: { type: "SUMMON", damage: 280, defBonus: 30 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "yuta_ach_1",
        name: "사랑의 힘",
        description: "유타로 20승",
        condition: { type: "WINS", count: 20 },
        reward: { type: "ITEM", itemId: "rika_ring" }
      }
    ]
  },
  {
    id: "todo_aoi",
    name: { ko: "토도 아오이", ja: "東堂葵", en: "Todo Aoi" },
    grade: "1급",
    attribute: "BODY",
    imageUrl: getPlaceholderImage("토도", "BODY"),
    baseStats: { atk: 20, def: 14, spd: 17, ce: 16, hp: 88 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: {
      name: "부기우기",
      description: "박수로 위치 교환",
      effect: { type: "SWAP_ATTACK", damage: 200 }
    },
    basicSkills: [
      {
        id: "todo_1",
        name: "강타",
        type: "ATTACK",
        description: "압도적인 신체 능력으로 강타",
        effect: { type: "DAMAGE", value: 120 }
      },
      {
        id: "todo_2",
        name: "박수",
        type: "UTILITY",
        description: "부기우기 준비",
        effect: { type: "CHARGE", gaugeBonus: 20 }
      },
      {
        id: "todo_3",
        name: "연속 타격",
        type: "ATTACK",
        description: "빠른 연속 공격",
        effect: { type: "MULTI_HIT", hits: 2, value: 65 }
      }
    ],
    ultimateSkill: {
      id: "todo_ult",
      name: "부기우기",
      description: "박수로 위치를 바꿔 기습",
      effect: { type: "SWAP_ATTACK", damage: 200, guaranteed_first: true },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "todo_ach_1",
        name: "베스트 프렌드",
        description: "토도로 이타도리와 함께 승리",
        condition: { type: "WINS", count: 10 },
        reward: { type: "ITEM", itemId: "boogie_woogie" }
      }
    ]
  }
];

// ===== 준1급 - 6장 =====
const B_GRADE: CharacterCard[] = [
  {
    id: "itadori_yuji",
    name: { ko: "이타도리 유지", ja: "虎杖悠仁", en: "Itadori Yuji" },
    grade: "준1급",
    attribute: "BODY",
    imageUrl: getPlaceholderImage("유지", "BODY"),
    baseStats: { atk: 17, def: 13, spd: 18, ce: 12, hp: 80 },
    growthStats: { primary: "spd", secondary: "atk" },
    skill: {
      name: "흑섬 (黒閃)",
      description: "저주력의 핵심을 찌르는 일격",
      effect: { type: "CRITICAL_GUARANTEED", damage: 250, multiplier: 2.5 }
    },
    basicSkills: [
      {
        id: "yuji_1",
        name: "일격",
        type: "ATTACK",
        description: "빠른 주먹 공격",
        effect: { type: "DAMAGE", value: 90 }
      },
      {
        id: "yuji_2",
        name: "연타",
        type: "ATTACK",
        description: "연속 주먹 공격",
        effect: { type: "MULTI_HIT", hits: 3, value: 35 }
      },
      {
        id: "yuji_3",
        name: "회피",
        type: "DEFENSE",
        description: "빠른 신체 능력으로 회피",
        effect: { type: "DODGE", chance: 60 }
      }
    ],
    ultimateSkill: {
      id: "yuji_ult",
      name: "흑섬 (黒閃)",
      description: "저주력의 핵심을 찌르는 일격",
      effect: { type: "CRITICAL_GUARANTEED", damage: 250, multiplier: 2.5 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "yuji_ach_1",
        name: "스쿠나의 그릇",
        description: "유지로 15승",
        condition: { type: "WINS", count: 15 },
        reward: { type: "ITEM", itemId: "sukuna_finger" }
      }
    ]
  },
  {
    id: "fushiguro_megumi",
    name: { ko: "후시구로 메구미", ja: "伏黒恵", en: "Fushiguro Megumi" },
    grade: "준1급",
    attribute: "RANGE",
    imageUrl: getPlaceholderImage("메구미", "RANGE"),
    baseStats: { atk: 15, def: 14, spd: 16, ce: 18, hp: 78 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: {
      name: "십종영법 (十種影法)",
      description: "그림자로 식신 소환",
      effect: { type: "SUMMON_DAMAGE", value: 80 }
    },
    basicSkills: [
      {
        id: "megumi_1",
        name: "옥견",
        type: "ATTACK",
        description: "한 쌍의 신성한 개를 소환",
        effect: { type: "SUMMON_DAMAGE", value: 80 }
      },
      {
        id: "megumi_2",
        name: "대사",
        type: "ATTACK",
        description: "거대한 두꺼비를 소환",
        effect: { type: "DAMAGE", value: 100 }
      },
      {
        id: "megumi_3",
        name: "눌",
        type: "DEFENSE",
        description: "올빼미 식신으로 시야 차단",
        effect: { type: "BLIND", value: 30, duration: 1 }
      }
    ],
    ultimateSkill: {
      id: "megumi_ult",
      name: "질풍암영정",
      description: "그림자를 지배하는 영역전개",
      effect: { type: "DOMAIN", damage: 180, summonBoost: 50 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "megumi_ach_1",
        name: "젠인가의 피",
        description: "메구미로 15승",
        condition: { type: "WINS", count: 15 },
        reward: { type: "ITEM", itemId: "shadow_dog" }
      }
    ]
  },
  {
    id: "mahito",
    name: { ko: "마히토", ja: "真人", en: "Mahito" },
    grade: "준1급",
    attribute: "SOUL",
    imageUrl: getPlaceholderImage("마히토", "SOUL"),
    baseStats: { atk: 16, def: 12, spd: 17, ce: 20, hp: 82 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: {
      name: "무위전변",
      description: "영혼을 직접 건드려 공격",
      effect: { type: "TRUE_DAMAGE", value: 100 }
    },
    basicSkills: [
      {
        id: "mahito_1",
        name: "무위전변",
        type: "ATTACK",
        description: "영혼을 직접 건드려 공격",
        effect: { type: "TRUE_DAMAGE", value: 100 }
      },
      {
        id: "mahito_2",
        name: "형태 변화",
        type: "DEFENSE",
        description: "자신의 영혼을 변형하여 회피",
        effect: { type: "DODGE", chance: 50 }
      },
      {
        id: "mahito_3",
        name: "분신",
        type: "UTILITY",
        description: "작은 분신들을 생성",
        effect: { type: "CLONE", damage: 40, count: 2 }
      }
    ],
    ultimateSkill: {
      id: "mahito_ult",
      name: "자폐영역 (자득체기)",
      description: "영역 내 모든 존재의 영혼을 만질 수 있다",
      effect: { type: "DOMAIN", damage: 200, ignoreDefense: true },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "mahito_ach_1",
        name: "인간의 증오",
        description: "마히토로 20승",
        condition: { type: "WINS", count: 20 },
        reward: { type: "ITEM", itemId: "soul_fragment" }
      }
    ]
  },
  {
    id: "mei_mei",
    name: { ko: "메이메이", ja: "冥冥", en: "Mei Mei" },
    grade: "준1급",
    attribute: "RANGE",
    imageUrl: getPlaceholderImage("메이메이", "RANGE"),
    baseStats: { atk: 16, def: 14, spd: 15, ce: 17, hp: 80 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: {
      name: "흑조 조작",
      description: "까마귀를 조종하여 공격",
      effect: { type: "SUMMON_DAMAGE", value: 85 }
    },
    basicSkills: [
      {
        id: "meimei_1",
        name: "흑조 조작",
        type: "ATTACK",
        description: "까마귀들을 조종하여 공격",
        effect: { type: "SUMMON_DAMAGE", value: 85 }
      },
      {
        id: "meimei_2",
        name: "도끼 공격",
        type: "ATTACK",
        description: "전투 도끼로 근접 공격",
        effect: { type: "DAMAGE", value: 110 }
      },
      {
        id: "meimei_3",
        name: "정찰",
        type: "UTILITY",
        description: "까마귀로 적의 약점 파악",
        effect: { type: "WEAKNESS_FIND", critRate: 30 }
      }
    ],
    ultimateSkill: {
      id: "meimei_ult",
      name: "조의 송장",
      description: "까마귀에 120%의 저주력을 부여하여 돌격",
      effect: { type: "SACRIFICE_ATTACK", damage: 280 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "meimei_ach_1",
        name: "돈이 최고",
        description: "메이메이로 15승",
        condition: { type: "WINS", count: 15 },
        reward: { type: "ITEM", itemId: "black_bird" }
      }
    ]
  },
  {
    id: "inumaki_toge",
    name: { ko: "이누마키 토게", ja: "狗巻棘", en: "Inumaki Toge" },
    grade: "준1급",
    attribute: "CURSE",
    imageUrl: getPlaceholderImage("토게", "CURSE"),
    baseStats: { atk: 14, def: 12, spd: 16, ce: 22, hp: 70 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: {
      name: "주언 (呪言)",
      description: "말에 저주력을 담아 명령",
      effect: { type: "STUN", duration: 1 }
    },
    basicSkills: [
      {
        id: "inumaki_1",
        name: "움직이지 마",
        type: "UTILITY",
        description: "상대의 움직임을 봉쇄",
        effect: { type: "STUN", duration: 1 }
      },
      {
        id: "inumaki_2",
        name: "도망쳐",
        type: "UTILITY",
        description: "상대를 강제로 물러나게 함",
        effect: { type: "KNOCKBACK" }
      },
      {
        id: "inumaki_3",
        name: "잠들어",
        type: "UTILITY",
        description: "상대를 잠재운다",
        effect: { type: "SLEEP", duration: 1, damage: 50 }
      }
    ],
    ultimateSkill: {
      id: "inumaki_ult",
      name: "죽어",
      description: "최강의 주언, 치명적인 부작용 동반",
      effect: { type: "INSTANT_DAMAGE", damage: 350, selfDamage: 50 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "inumaki_ach_1",
        name: "주문의 달인",
        description: "토게로 15승",
        condition: { type: "WINS", count: 15 },
        reward: { type: "ITEM", itemId: "curse_speech" }
      }
    ]
  },
  {
    id: "maki_zenin",
    name: { ko: "젠인 마키", ja: "禪院真希", en: "Maki Zenin" },
    grade: "준1급",
    attribute: "BODY",
    imageUrl: getPlaceholderImage("마키", "BODY"),
    baseStats: { atk: 18, def: 13, spd: 17, ce: 5, hp: 78 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: {
      name: "저주도구 사용",
      description: "다양한 무기로 공격",
      effect: { type: "DAMAGE", value: 110 }
    },
    basicSkills: [
      {
        id: "maki_1",
        name: "유성의 검",
        type: "ATTACK",
        description: "특급 저주도구로 참격",
        effect: { type: "DAMAGE", value: 110 }
      },
      {
        id: "maki_2",
        name: "창술",
        type: "ATTACK",
        description: "창을 이용한 공격",
        effect: { type: "DAMAGE", value: 95, range: "LONG" }
      },
      {
        id: "maki_3",
        name: "연속 베기",
        type: "ATTACK",
        description: "빠른 연속 참격",
        effect: { type: "MULTI_HIT", hits: 2, value: 60 }
      }
    ],
    ultimateSkill: {
      id: "maki_ult",
      name: "천여함수 각성",
      description: "토지와 같은 경지에 도달",
      effect: { type: "STAT_BOOST", atkBonus: 80, spdBonus: 50, damage: 180 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "maki_ach_1",
        name: "젠인가 멸문",
        description: "마키로 20승",
        condition: { type: "WINS", count: 20 },
        reward: { type: "ITEM", itemId: "cursed_tools" }
      }
    ]
  }
];

// ===== 2급 - 4장 =====
const C_GRADE: CharacterCard[] = [
  {
    id: "kugisaki_nobara",
    name: { ko: "쿠기사키 노바라", ja: "釘崎野薔薇", en: "Kugisaki Nobara" },
    grade: "2급",
    attribute: "RANGE",
    imageUrl: getPlaceholderImage("노바라", "RANGE"),
    baseStats: { atk: 15, def: 12, spd: 14, ce: 16, hp: 75 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: {
      name: "공진 (共振)",
      description: "못과 망치로 저주력 공진",
      effect: { type: "DAMAGE", value: 85 }
    },
    basicSkills: [
      {
        id: "nobara_1",
        name: "공진",
        type: "ATTACK",
        description: "못과 망치로 저주력을 공진",
        effect: { type: "DAMAGE", value: 85 }
      },
      {
        id: "nobara_2",
        name: "간모",
        type: "ATTACK",
        description: "짚인형을 통한 원거리 공격",
        effect: { type: "TRUE_DAMAGE", value: 70 }
      },
      {
        id: "nobara_3",
        name: "화공",
        type: "ATTACK",
        description: "저주력을 담은 못을 연사",
        effect: { type: "MULTI_HIT", hits: 3, value: 30 }
      }
    ],
    ultimateSkill: {
      id: "nobara_ult",
      name: "공명",
      description: "자신과 상대의 상처를 공명시킨다",
      effect: { type: "REFLECT_DAMAGE", reflectPercent: 100, damage: 150 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "nobara_ach_1",
        name: "시골 소녀의 의지",
        description: "노바라로 15승",
        condition: { type: "WINS", count: 15 },
        reward: { type: "ITEM", itemId: "straw_doll" }
      }
    ]
  },
  {
    id: "ino_takuma",
    name: { ko: "이노 타쿠마", ja: "猪野琢真", en: "Ino Takuma" },
    grade: "2급",
    attribute: "CURSE",
    imageUrl: getPlaceholderImage("이노", "CURSE"),
    baseStats: { atk: 14, def: 14, spd: 13, ce: 15, hp: 75 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: {
      name: "여제례",
      description: "가마사를 소환하여 공격",
      effect: { type: "SUMMON_DAMAGE", value: 80 }
    },
    basicSkills: [
      {
        id: "ino_1",
        name: "가마사 - 용어",
        type: "ATTACK",
        description: "물고기를 소환하여 공격",
        effect: { type: "SUMMON_DAMAGE", value: 80 }
      },
      {
        id: "ino_2",
        name: "가마사 - 수호",
        type: "DEFENSE",
        description: "소환물로 방어",
        effect: { type: "DAMAGE_REDUCE", value: 45 }
      },
      {
        id: "ino_3",
        name: "돌격",
        type: "ATTACK",
        description: "직접 돌격하여 공격",
        effect: { type: "DAMAGE", value: 90 }
      }
    ],
    ultimateSkill: {
      id: "ino_ult",
      name: "여제례 - 연속 강림",
      description: "모든 가마사를 동시에 소환",
      effect: { type: "MULTI_SUMMON", damage: 200 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "ino_ach_1",
        name: "나나미의 후계자",
        description: "이노로 10승",
        condition: { type: "WINS", count: 10 },
        reward: { type: "ITEM", itemId: "ino_mask" }
      }
    ]
  },
  {
    id: "panda",
    name: { ko: "판다", ja: "パンダ", en: "Panda" },
    grade: "2급",
    attribute: "BODY",
    imageUrl: getPlaceholderImage("판다", "BODY"),
    baseStats: { atk: 16, def: 16, spd: 12, ce: 10, hp: 85 },
    growthStats: { primary: "def", secondary: "atk" },
    skill: {
      name: "고릴라 모드",
      description: "핵 전환으로 파워업",
      effect: { type: "STAT_BOOST", atkBonus: 40 }
    },
    basicSkills: [
      {
        id: "panda_1",
        name: "펀치",
        type: "ATTACK",
        description: "강력한 주먹 공격",
        effect: { type: "DAMAGE", value: 95 }
      },
      {
        id: "panda_2",
        name: "고릴라 모드",
        type: "ATTACK",
        description: "고릴라 핵으로 전환하여 파워 업",
        effect: { type: "DAMAGE", value: 130, selfDefReduce: 20 }
      },
      {
        id: "panda_3",
        name: "회복",
        type: "UTILITY",
        description: "핵을 전환하여 회복",
        effect: { type: "HEAL", value: 40 }
      }
    ],
    ultimateSkill: {
      id: "panda_ult",
      name: "자매 핵 해방",
      description: "숨겨진 세 번째 핵의 힘",
      effect: { type: "TRANSFORM", damage: 220, defBonus: 40 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "panda_ach_1",
        name: "판다는 판다야",
        description: "판다로 10승",
        condition: { type: "WINS", count: 10 },
        reward: { type: "ITEM", itemId: "panda_core" }
      }
    ]
  },
  {
    id: "nishimiya_momo",
    name: { ko: "니시미야 모모", ja: "西宮桃", en: "Nishimiya Momo" },
    grade: "2급",
    attribute: "RANGE",
    imageUrl: getPlaceholderImage("모모", "RANGE"),
    baseStats: { atk: 12, def: 11, spd: 16, ce: 14, hp: 70 },
    growthStats: { primary: "spd", secondary: "ce" },
    skill: {
      name: "바람 조작",
      description: "빗자루로 바람을 일으킨다",
      effect: { type: "DAMAGE", value: 80 }
    },
    basicSkills: [
      {
        id: "momo_1",
        name: "빗자루 공격",
        type: "ATTACK",
        description: "빗자루를 휘둘러 공격",
        effect: { type: "DAMAGE", value: 70 }
      },
      {
        id: "momo_2",
        name: "바람 조작",
        type: "ATTACK",
        description: "바람을 일으켜 공격",
        effect: { type: "DAMAGE", value: 80 }
      },
      {
        id: "momo_3",
        name: "비행 회피",
        type: "DEFENSE",
        description: "빗자루로 빠르게 회피",
        effect: { type: "DODGE", chance: 55 }
      }
    ],
    ultimateSkill: {
      id: "momo_ult",
      name: "돌풍",
      description: "강력한 바람을 일으켜 공격",
      effect: { type: "AOE_DAMAGE", damage: 160 },
      gaugeRequired: 100
    },
    achievements: [
      {
        id: "momo_ach_1",
        name: "하늘의 마녀",
        description: "모모로 10승",
        condition: { type: "WINS", count: 10 },
        reward: { type: "ITEM", itemId: "witch_broom" }
      }
    ]
  }
];

// 전체 캐릭터 배열
export const ALL_CHARACTERS: CharacterCard[] = [
  ...S_GRADE,
  ...A_GRADE,
  ...B_GRADE,
  ...C_GRADE
];

// 전체 캐릭터 ID 목록
export const ALL_CHARACTER_IDS: string[] = ALL_CHARACTERS.map(c => c.id);

export const CHARACTERS_BY_ID = ALL_CHARACTERS.reduce((acc, char) => {
  acc[char.id] = char;
  return acc;
}, {} as Record<string, CharacterCard>);

export const CHARACTERS_BY_GRADE = {
  '특급': S_GRADE,
  '1급': A_GRADE,
  '준1급': B_GRADE,
  '2급': C_GRADE
};

// 초기 크루용 기본 캐릭터 ID (준1급, 2급에서 5장)
export const STARTER_CREW = [
  'itadori_yuji',
  'fushiguro_megumi',
  'kugisaki_nobara',
  'panda',
  'inumaki_toge'
];
