// ========================================
// 경기장 데이터 (10개)
// ========================================

import type { Arena } from '../types';

const ARENAS: Arena[] = [
  {
    id: "shibuya_station",
    name: { ko: "시부야역 지하", en: "Shibuya Station Underground" },
    description: "폐쇄된 공간, 저주가 들끓는 곳",
    imageUrl: "/images/arenas/shibuya.png",
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
        value: 2,
        description: "모든 캐릭터 CE +2"
      }
    ]
  },
  {
    id: "domain_void",
    name: { ko: "무량공처 (영역)", en: "Unlimited Void" },
    description: "무한의 정보가 흐르는 공간",
    imageUrl: "/images/arenas/void.png",
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
    id: "zenin_training",
    name: { ko: "젠인가 수련장", en: "Zenin Clan Training Ground" },
    description: "전투에 특화된 수련 공간",
    imageUrl: "/images/arenas/zenin.png",
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
    effects: [
      {
        type: "SPECIAL_RULE",
        target: "ALL",
        value: 0,
        description: "속성 상성 무효 (순수 스탯 대결)"
      }
    ]
  },
  {
    id: "cursed_womb",
    name: { ko: "저주태", en: "Cursed Womb" },
    description: "특급 저주가 태어나는 곳",
    imageUrl: "/images/arenas/womb.png",
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
  }
];

export const ALL_ARENAS = ARENAS;

export const ARENAS_BY_ID = ARENAS.reduce((acc, arena) => {
  acc[arena.id] = arena;
  return acc;
}, {} as Record<string, Arena>);

// 랜덤 경기장 선택
export const getRandomArena = (): Arena => {
  const index = Math.floor(Math.random() * ARENAS.length);
  return ARENAS[index];
};
