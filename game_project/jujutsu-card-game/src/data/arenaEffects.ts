// ========================================
// 경기장 효과 데이터
// ========================================

import type { ArenaEffect } from '../types/individualLeague';

export const ARENA_EFFECTS: Record<string, ArenaEffect> = {
  // 토쿄 시부야
  tokyo_shibuya: {
    id: 'tokyo_shibuya',
    name: '토쿄 시부야',
    bonusAttribute: 'CURSE',
    bonusPercent: 10,
    penaltyAttribute: 'BARRIER',
    penaltyPercent: 5,
    description: '저주가 넘치는 도심. 저주 속성 +10%, 결계 속성 -5%',
  },

  // 주술고전 경기장
  jujutsu_stadium: {
    id: 'jujutsu_stadium',
    name: '주술고전 경기장',
    bonusAttribute: 'BODY',
    bonusPercent: 10,
    penaltyAttribute: 'CURSE',
    penaltyPercent: 5,
    description: '정정당당한 대결의 장. 육체 속성 +10%, 저주 속성 -5%',
  },

  // 결계 수련장
  barrier_dojo: {
    id: 'barrier_dojo',
    name: '결계 수련장',
    bonusAttribute: 'BARRIER',
    bonusPercent: 10,
    penaltyAttribute: 'BODY',
    penaltyPercent: 5,
    description: '결계술 수련의 성지. 결계 속성 +10%, 육체 속성 -5%',
  },

  // 영혼의 계곡
  soul_valley: {
    id: 'soul_valley',
    name: '영혼의 계곡',
    bonusAttribute: 'SOUL',
    bonusPercent: 10,
    penaltyAttribute: 'BODY',
    penaltyPercent: 5,
    description: '정신력이 증폭되는 공간. 정신 속성 +10%, 육체 속성 -5%',
  },

  // 저주의 바다
  cursed_sea: {
    id: 'cursed_sea',
    name: '저주의 바다',
    bonusAttribute: 'CURSE',
    bonusPercent: 15,
    penaltyAttribute: 'SOUL',
    penaltyPercent: 10,
    description: '강력한 저주가 소용돌이치는 곳. 저주 속성 +15%, 정신 속성 -10%',
  },

  // 무한의 감옥
  infinite_prison: {
    id: 'infinite_prison',
    name: '무한의 감옥',
    bonusAttribute: 'BARRIER',
    bonusPercent: 15,
    penaltyAttribute: 'CURSE',
    penaltyPercent: 10,
    description: '탈출 불가능한 결계. 결계 속성 +15%, 저주 속성 -10%',
  },

  // 수련의 산
  training_mountain: {
    id: 'training_mountain',
    name: '수련의 산',
    bonusAttribute: 'BODY',
    bonusPercent: 15,
    penaltyAttribute: 'SOUL',
    penaltyPercent: 10,
    description: '극한의 육체 단련지. 육체 속성 +15%, 정신 속성 -10%',
  },

  // 명상의 사원
  meditation_temple: {
    id: 'meditation_temple',
    name: '명상의 사원',
    bonusAttribute: 'SOUL',
    bonusPercent: 15,
    penaltyAttribute: 'BARRIER',
    penaltyPercent: 10,
    description: '깊은 명상의 장소. 정신 속성 +15%, 결계 속성 -10%',
  },

  // 중립 경기장 (보너스/페널티 없음에 가까움)
  neutral_arena: {
    id: 'neutral_arena',
    name: '중립 경기장',
    bonusAttribute: 'BODY',
    bonusPercent: 3,
    penaltyAttribute: 'SOUL',
    penaltyPercent: 3,
    description: '공정한 대결의 장. 모든 속성 균형.',
  },

  // 혼돈의 영역
  chaos_realm: {
    id: 'chaos_realm',
    name: '혼돈의 영역',
    bonusAttribute: 'CURSE',
    bonusPercent: 20,
    penaltyAttribute: 'BARRIER',
    penaltyPercent: 15,
    description: '질서가 무너진 공간. 저주 속성 +20%, 결계 속성 -15%',
  },
};

// 경기장 효과 목록 배열
export const ARENA_EFFECTS_LIST: ArenaEffect[] = Object.values(ARENA_EFFECTS);

// 랜덤 경기장 선택
export function getRandomArena(): ArenaEffect {
  const arenas = ARENA_EFFECTS_LIST;
  return arenas[Math.floor(Math.random() * arenas.length)];
}

// 특정 속성에 유리한 경기장 찾기
export function getArenaFavoringAttribute(attribute: string): ArenaEffect | undefined {
  return ARENA_EFFECTS_LIST.find(arena => arena.bonusAttribute === attribute);
}

// 경기장 효과 적용 (전투력 계산)
export function applyArenaEffect(
  basePower: number,
  cardAttribute: string,
  arena: ArenaEffect
): { finalPower: number; bonusPercent: number } {
  let bonusPercent = 0;

  if (cardAttribute === arena.bonusAttribute) {
    bonusPercent = arena.bonusPercent;
  } else if (cardAttribute === arena.penaltyAttribute) {
    bonusPercent = -arena.penaltyPercent;
  }

  const finalPower = Math.round(basePower * (1 + bonusPercent / 100));

  return { finalPower, bonusPercent };
}
