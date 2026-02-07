// ========================================
// 경기장 데이터 (25개)
// Phase 5: favoredStat 추가
// ========================================

import type { Arena, ArenaCategory, FavoredStat } from '../types';

// 카테고리 정보
export const ARENA_CATEGORIES: Record<ArenaCategory, { name: string; icon: string }> = {
  LOCATION: { name: '장소', icon: '🏛️' },
  DOMAIN: { name: '영역전개', icon: '🌀' },
  SPECIAL: { name: '특수환경', icon: '⚔️' }
};

const ARENAS: Arena[] = [
  // ========================================
  // 기존 경기장 (10개)
  // ========================================

  // 장소 (4개)
  {
    id: "shibuya_station",
    name: { ko: "시부야역 지하", en: "Shibuya Station Underground" },
    description: "폐쇄된 공간, 저주가 들끓는 곳",
    imageUrl: "/images/arenas/shibuya.png",
    category: "LOCATION",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "CURSE",
        value: 0.15,
        description: "저주 속성 데미지 +15%"
      },
      {
        type: "ATTRIBUTE_WEAKEN",
        target: "RANGE",
        value: -0.10,
        description: "원거리 속성 데미지 -10%"
      }
    ]
  },
  {
    id: "jujutsu_high",
    name: { ko: "주술고전", en: "Jujutsu High" },
    description: "술사들의 요람, 결계가 펼쳐진 학교",
    imageUrl: "/images/arenas/jujutsu_high.png",
    category: "LOCATION",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "BARRIER",
        value: 0.15,
        description: "결계 속성 데미지 +15%"
      },
      {
        type: "STAT_MODIFY",
        target: "ALL",
        stat: "ce",
        value: 2,
        description: "모든 캐릭터 CE +2"
      }
    ]
  },
  {
    id: "zenin_training",
    name: { ko: "젠인가 수련장", en: "Zenin Clan Training Ground" },
    description: "전투에 특화된 수련 공간",
    imageUrl: "/images/arenas/zenin.png",
    category: "LOCATION",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "BODY",
        value: 0.20,
        description: "신체 속성 데미지 +20%"
      },
      {
        type: "SPECIAL_RULE",
        target: "ALL",
        value: 0.30,
        description: "30% 확률로 스킬 봉인"
      }
    ]
  },
  {
    id: "kyoto_exchange",
    name: { ko: "교류회 경기장", en: "Kyoto Exchange Event Arena" },
    description: "공정한 대결의 장",
    imageUrl: "/images/arenas/exchange.png",
    category: "LOCATION",
    effects: [
      {
        type: "SPECIAL_RULE",
        target: "ALL",
        value: 0,
        description: "속성 상성 무효 (순수 스탯 대결)"
      }
    ]
  },

  // 영역전개 (6개)
  {
    id: "domain_void",
    name: { ko: "무량공처 (영역)", en: "Unlimited Void" },
    description: "무한의 정보가 흐르는 공간",
    imageUrl: "/images/arenas/void.png",
    category: "DOMAIN",
    effects: [
      {
        type: "SPECIAL_RULE",
        target: "ALL",
        value: 0,
        description: "SPD 역전: 낮은 쪽이 선공"
      },
      {
        type: "ATTRIBUTE_BOOST",
        target: "BARRIER",
        value: 0.20,
        description: "결계 속성 데미지 +20%"
      }
    ]
  },
  {
    id: "malevolent_shrine",
    name: { ko: "복마전신 (영역)", en: "Malevolent Shrine" },
    description: "스쿠나의 영역, 끊임없는 참격",
    imageUrl: "/images/arenas/shrine.png",
    category: "DOMAIN",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "CURSE",
        value: 0.25,
        description: "저주 속성 데미지 +25%"
      },
      {
        type: "STAT_MODIFY",
        target: "ALL",
        stat: "def",
        value: -3,
        description: "모든 캐릭터 DEF -3"
      }
    ]
  },
  {
    id: "chimera_shadow",
    name: { ko: "질풍암영정 (영역)", en: "Chimera Shadow Garden" },
    description: "메구미의 영역, 그림자의 바다",
    imageUrl: "/images/arenas/shadow.png",
    category: "DOMAIN",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "RANGE",
        value: 0.15,
        description: "원거리 속성 데미지 +15%"
      },
      {
        type: "ATTRIBUTE_BOOST",
        target: "RANGE",
        value: 0.20,
        description: "원거리 스킬 효과 +20%"
      }
    ]
  },
  {
    id: "coffin_iron_mountain",
    name: { ko: "개문돈갑 (영역)", en: "Coffin of the Iron Mountain" },
    description: "죠고의 영역, 작열하는 화염",
    imageUrl: "/images/arenas/iron_mountain.png",
    category: "DOMAIN",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "CONVERT",
        value: 0.20,
        description: "변환 속성 데미지 +20%"
      },
      {
        type: "STAT_MODIFY",
        target: "ALL",
        stat: "hp",
        value: -2,
        description: "모든 캐릭터 HP -2 (지속 데미지)"
      }
    ]
  },
  {
    id: "self_embodiment",
    name: { ko: "자폐영역 (영역)", en: "Self-Embodiment of Perfection" },
    description: "마히토의 영역, 영혼이 노출되는 공간",
    imageUrl: "/images/arenas/perfection.png",
    category: "DOMAIN",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "SOUL",
        value: 0.25,
        description: "혼백 속성 데미지 +25%"
      },
      {
        type: "ATTRIBUTE_WEAKEN",
        target: "BODY",
        value: -0.15,
        description: "신체 속성 데미지 -15%"
      }
    ]
  },
  {
    id: "cursed_womb",
    name: { ko: "저주태", en: "Cursed Womb" },
    description: "특급 저주가 태어나는 곳",
    imageUrl: "/images/arenas/womb.png",
    category: "DOMAIN",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "CURSE",
        value: 0.15,
        description: "저주 속성 데미지 +15%"
      },
      {
        type: "ATTRIBUTE_BOOST",
        target: "SOUL",
        value: 0.15,
        description: "혼백 속성 데미지 +15%"
      },
      {
        type: "ATTRIBUTE_WEAKEN",
        target: "BARRIER",
        value: -0.10,
        description: "결계 속성 데미지 -10%"
      }
    ]
  },

  // ========================================
  // 신규 경기장 - 주요 장소 (5개)
  // ========================================

  {
    id: "kyoto_school",
    name: { ko: "교토고전", en: "Kyoto Jujutsu High" },
    description: "교토 측 주술고전, 실전 중시 훈련",
    imageUrl: "/images/arenas/kyoto_school.png",
    category: "LOCATION",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "BODY",
        value: 0.15,
        description: "신체 속성 데미지 +15%"
      },
      {
        type: "SPECIAL_RULE",
        target: "LOW_DEF",
        value: 3,
        description: "DEF 낮은 쪽 DEF +3"
      }
    ]
  },
  {
    id: "tokyo_colony",
    name: { ko: "도쿄 제1콜로니", en: "Tokyo Colony No.1" },
    description: "사망유희의 주요 전장, 살육의 규칙",
    imageUrl: "/images/arenas/tokyo_colony.png",
    category: "LOCATION",
    effects: [
      {
        type: "STAT_MODIFY",
        target: "ALL",
        stat: "atk",
        value: 3,
        description: "모든 캐릭터 ATK +3"
      },
      {
        type: "SPECIAL_RULE",
        target: "LOSER",
        value: 2,
        description: "패배 시 포인트 2배 감소"
      }
    ]
  },
  {
    id: "sendai_colony",
    name: { ko: "센다이 콜로니", en: "Sendai Colony" },
    description: "하카리 vs 카시모, 전설의 격전지",
    imageUrl: "/images/arenas/sendai_colony.png",
    category: "LOCATION",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "CONVERT",
        value: 0.20,
        description: "변환 속성 데미지 +20%"
      },
      {
        type: "SPECIAL_RULE",
        target: "ALL",
        value: 10,
        description: "크리티컬 확률 +10%"
      }
    ]
  },
  {
    id: "bridge_of_stars",
    name: { ko: "성무변환 다리", en: "Bridge of Stars" },
    description: "텐겐의 결계와 연결된 신성한 장소",
    imageUrl: "/images/arenas/bridge_of_stars.png",
    category: "LOCATION",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "BARRIER",
        value: 0.15,
        description: "결계 속성 데미지 +15%"
      },
      {
        type: "SPECIAL_RULE",
        target: "ALL",
        value: -1,
        description: "스킬 CE 소모량 -1"
      }
    ]
  },
  {
    id: "prison_realm_entrance",
    name: { ko: "옥문강 입구", en: "Prison Realm Entrance" },
    description: "최강이 봉인된 곳, 약자에게 기회가",
    imageUrl: "/images/arenas/prison_realm.png",
    category: "LOCATION",
    effects: [
      {
        type: "STAT_MODIFY",
        target: "SPECIAL_GRADE",
        stat: "atk",
        value: -5,
        description: "특급 캐릭터 ATK -5"
      },
      {
        type: "ATTRIBUTE_BOOST",
        target: "NON_SPECIAL",
        value: 0.10,
        description: "1급 이하 캐릭터 데미지 +10%"
      }
    ]
  },

  // ========================================
  // 신규 경기장 - 캐릭터 영역 (5개)
  // ========================================

  {
    id: "idle_deaths_gamble",
    name: { ko: "사투암흑도박장", en: "Idle Death's Gamble" },
    description: "하카리의 영역, 운명을 건 도박",
    imageUrl: "/images/arenas/idle_deaths_gamble.png",
    category: "DOMAIN",
    effects: [
      {
        type: "SPECIAL_RULE",
        target: "RANDOM",
        value: 0.50,
        description: "매 턴 50% 확률: ATK +5 또는 -3"
      },
      {
        type: "ATTRIBUTE_BOOST",
        target: "BARRIER",
        value: 0.15,
        description: "결계 속성 데미지 +15%"
      }
    ]
  },
  {
    id: "deadly_sentencing",
    name: { ko: "심판인의 검무", en: "Deadly Sentencing" },
    description: "히구루마의 영역, 법정의 심판",
    imageUrl: "/images/arenas/deadly_sentencing.png",
    category: "DOMAIN",
    effects: [
      {
        type: "SPECIAL_RULE",
        target: "HIGHEST_ATK",
        value: -0.30,
        description: "최고 ATK 캐릭터 ATK -30%"
      },
      {
        type: "ATTRIBUTE_BOOST",
        target: "SOUL",
        value: 0.15,
        description: "혼백 속성 데미지 +15%"
      }
    ]
  },
  {
    id: "horizon_rumbling",
    name: { ko: "호선만상", en: "Thin Ice Breaker" },
    description: "우로의 영역, 공간이 왜곡된다",
    imageUrl: "/images/arenas/horizon_rumbling.png",
    category: "DOMAIN",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "BARRIER",
        value: 0.20,
        description: "결계 속성 데미지 +20%"
      },
      {
        type: "SPECIAL_RULE",
        target: "FIRST_STRIKE",
        value: 3,
        description: "선공 시 추가 데미지 +3"
      }
    ]
  },
  {
    id: "true_sphere",
    name: { ko: "타천금강", en: "True Sphere" },
    description: "요로즈의 영역, 완벽한 구체",
    imageUrl: "/images/arenas/true_sphere.png",
    category: "DOMAIN",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "CONVERT",
        value: 0.20,
        description: "변환 속성 데미지 +20%"
      },
      {
        type: "STAT_MODIFY",
        target: "ALL",
        stat: "def",
        value: 3,
        description: "모든 캐릭터 DEF +3"
      }
    ]
  },
  {
    id: "time_cell_moon_palace",
    name: { ko: "천신구려의 달궁", en: "Time Cell Moon Palace" },
    description: "카시모의 영역, 번개가 지배하는 공간",
    imageUrl: "/images/arenas/moon_palace.png",
    category: "DOMAIN",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "CONVERT",
        value: 0.25,
        description: "변환 속성 데미지 +25%"
      },
      {
        type: "SPECIAL_RULE",
        target: "LOW_HP",
        value: 2,
        description: "HP 50% 이하 시 전체 스탯 +2"
      }
    ]
  },

  // ========================================
  // 신규 경기장 - 특수 환경 (5개)
  // ========================================

  {
    id: "heian_shrine",
    name: { ko: "헤이안 시대 신사", en: "Heian Era Shrine" },
    description: "1000년 전, 황금시대의 전장",
    imageUrl: "/images/arenas/heian_shrine.png",
    category: "SPECIAL",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "CURSE",
        value: 0.15,
        description: "저주 속성 데미지 +15%"
      },
      {
        type: "SPECIAL_RULE",
        target: "SPECIAL_GRADE",
        value: 0.20,
        description: "특급 캐릭터 필살기 데미지 +20%"
      }
    ]
  },
  {
    id: "star_plasma_vessel",
    name: { ko: "성장체 의식장", en: "Star Plasma Vessel Chamber" },
    description: "텐겐 동화 의식이 행해지는 신성한 곳",
    imageUrl: "/images/arenas/star_plasma.png",
    category: "SPECIAL",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "SOUL",
        value: 0.20,
        description: "혼백 속성 데미지 +20%"
      },
      {
        type: "SPECIAL_RULE",
        target: "HEAL",
        value: 0.30,
        description: "회복 스킬 효과 +30%"
      }
    ]
  },
  {
    id: "kamo_clan_grounds",
    name: { ko: "카모가 저택", en: "Kamo Clan Grounds" },
    description: "적조조작의 가문, 피의 저택",
    imageUrl: "/images/arenas/kamo_clan.png",
    category: "SPECIAL",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "CURSE",
        value: 0.15,
        description: "저주 속성 데미지 +15%"
      },
      {
        type: "SPECIAL_RULE",
        target: "ON_HEAL",
        value: 2,
        description: "HP 회복 시 ATK +2 (중첩 가능)"
      }
    ]
  },
  {
    id: "ocean_abyss",
    name: { ko: "심해 결계", en: "Ocean Abyss Barrier" },
    description: "바다 속 봉인된 고대의 공간",
    imageUrl: "/images/arenas/ocean_abyss.png",
    category: "SPECIAL",
    effects: [
      {
        type: "STAT_MODIFY",
        target: "ALL",
        stat: "spd",
        value: -3,
        description: "모든 캐릭터 SPD -3"
      },
      {
        type: "STAT_MODIFY",
        target: "ALL",
        stat: "def",
        value: 5,
        description: "모든 캐릭터 DEF +5"
      },
      {
        type: "ATTRIBUTE_WEAKEN",
        target: "RANGE",
        value: -0.20,
        description: "원거리 속성 데미지 -20%"
      }
    ]
  },
  {
    id: "cursed_spirit_nest",
    name: { ko: "저주령 소굴", en: "Cursed Spirit Nest" },
    description: "수많은 저주가 모인 위험한 곳",
    imageUrl: "/images/arenas/cursed_nest.png",
    category: "SPECIAL",
    effects: [
      {
        type: "ATTRIBUTE_BOOST",
        target: "CURSE",
        value: 0.25,
        description: "저주 속성 데미지 +25%"
      },
      {
        type: "SPECIAL_RULE",
        target: "RANDOM_DEBUFF",
        value: 1,
        description: "매 턴 랜덤 캐릭터 1명 스탯 -2"
      }
    ]
  }
];

export const ALL_ARENAS = ARENAS;

export const ARENAS_BY_ID = ARENAS.reduce((acc, arena) => {
  acc[arena.id] = arena;
  return acc;
}, {} as Record<string, Arena>);

// 카테고리별 경기장 목록
export const ARENAS_BY_CATEGORY = {
  LOCATION: ARENAS.filter(a => a.category === 'LOCATION'),
  DOMAIN: ARENAS.filter(a => a.category === 'DOMAIN'),
  SPECIAL: ARENAS.filter(a => a.category === 'SPECIAL')
};

// 랜덤 경기장 선택
export const getRandomArena = (): Arena => {
  const index = Math.floor(Math.random() * ARENAS.length);
  return ARENAS[index];
};

// 사용된 경기장을 제외한 랜덤 경기장 선택 (같은 경기 내 중복 방지)
export const getRandomArenaExcluding = (usedArenaIds: string[]): Arena => {
  const availableArenas = ARENAS.filter(arena => !usedArenaIds.includes(arena.id));

  // 모든 경기장을 사용한 경우 (25개 이상 라운드) 전체에서 랜덤 선택
  if (availableArenas.length === 0) {
    return getRandomArena();
  }

  const index = Math.floor(Math.random() * availableArenas.length);
  return availableArenas[index];
};

// 카테고리 필터링된 랜덤 경기장 선택
export const getRandomArenaByCategory = (category: ArenaCategory): Arena => {
  const filtered = ARENAS_BY_CATEGORY[category];
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
};

// ========================================
// Phase 5: 경기장별 유리 스탯 설정
// ========================================

// 경기장 ID별 favoredStat 매핑
export const ARENA_FAVORED_STATS: Record<string, FavoredStat> = {
  // 젠인가 수련장: SPD 높으면 회피 보너스
  zenin_training: {
    stat: 'spd',
    threshold: 18,
    bonusType: 'EVASION',
    bonusValue: 10  // +10% 회피
  },
  // 복마전신: ATK 높으면 스킬 데미지 보너스
  malevolent_shrine: {
    stat: 'atk',
    threshold: 20,
    bonusType: 'SKILL_DAMAGE',
    bonusValue: 15  // +15% 스킬 데미지
  },
  // 무량공처: CE 높으면 데미지 저항
  domain_void: {
    stat: 'ce',
    threshold: 20,
    bonusType: 'DAMAGE_RESIST',
    bonusValue: 10  // -10% 받는 데미지
  },
  // 심해 결계: DEF 높으면 HP 회복
  ocean_abyss: {
    stat: 'def',
    threshold: 18,
    bonusType: 'HP_RECOVERY',
    bonusValue: 5  // +5 HP 회복/턴
  },
  // 도쿄 제1콜로니: ATK 높으면 스킬 데미지
  tokyo_colony: {
    stat: 'atk',
    threshold: 18,
    bonusType: 'SKILL_DAMAGE',
    bonusValue: 10
  },
  // 센다이 콜로니: CRT 높으면 회피
  sendai_colony: {
    stat: 'crt',
    threshold: 14,
    bonusType: 'EVASION',
    bonusValue: 8
  },
  // 사투암흑도박장: MNT 높으면 데미지 저항
  idle_deaths_gamble: {
    stat: 'mnt',
    threshold: 15,
    bonusType: 'DAMAGE_RESIST',
    bonusValue: 8
  },
  // 헤이안 시대 신사: TEC 높으면 스킬 데미지
  heian_shrine: {
    stat: 'tec',
    threshold: 15,
    bonusType: 'SKILL_DAMAGE',
    bonusValue: 12
  }
};

/**
 * 경기장의 favoredStat 가져오기
 */
export function getArenaFavoredStat(arenaId: string): FavoredStat | null {
  return ARENA_FAVORED_STATS[arenaId] || null;
}

/**
 * 캐릭터가 경기장 favoredStat 보너스를 받는지 확인
 */
export function checkFavoredStatBonus(
  arenaId: string,
  characterStats: Record<string, number>
): { hasBonus: boolean; bonusType?: string; bonusValue?: number } {
  const favoredStat = ARENA_FAVORED_STATS[arenaId];
  if (!favoredStat) {
    return { hasBonus: false };
  }

  const statValue = characterStats[favoredStat.stat] || 0;
  if (statValue >= favoredStat.threshold) {
    return {
      hasBonus: true,
      bonusType: favoredStat.bonusType,
      bonusValue: favoredStat.bonusValue
    };
  }

  return { hasBonus: false };
}
