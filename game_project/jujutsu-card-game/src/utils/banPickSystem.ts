// ========================================
// 밴픽 & 카드 배치 시스템 (Phase 2)
// ========================================

import type {
  Arena,
  Attribute,
  CrewAttributeAnalysis,
  ArenaAnalysis,
  ArenaFitScore,
  CardAssignment,
  BanPickInfo
} from '../types';
import { ALL_ARENAS } from '../data/arenas';
import { CHARACTERS_BY_ID } from '../data/characters';

// ========================================
// 크루 분석 유틸리티
// ========================================

/**
 * 크루의 속성 분포 분석
 */
export function analyzeCrewAttributes(crewCardIds: string[]): CrewAttributeAnalysis {
  const distribution: Record<Attribute, number> = {
    BARRIER: 0,
    BODY: 0,
    CURSE: 0,
    SOUL: 0,
    CONVERT: 0,
    RANGE: 0
  };

  for (const cardId of crewCardIds) {
    const card = CHARACTERS_BY_ID[cardId];
    if (card) {
      distribution[card.attribute]++;
    }
  }

  // 가장 많은 속성 찾기
  let dominant: Attribute = 'BARRIER';
  let maxCount = 0;
  for (const [attr, count] of Object.entries(distribution)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = attr as Attribute;
    }
  }

  return { dominant, distribution };
}

// ========================================
// 경기장 분석 유틸리티
// ========================================

/**
 * 경기장 효과 분석
 */
export function analyzeArena(arena: Arena, crewCardIds: string[]): ArenaAnalysis {
  let favoredAttribute: Attribute | null = null;
  let weakenedAttribute: Attribute | null = null;
  let hasSpeedReverse = false;
  let hasAttributeNullify = false;
  const recommendedCards: string[] = [];
  const avoidCards: string[] = [];

  // 경기장 효과 분석
  for (const effect of arena.effects) {
    if (effect.type === 'ATTRIBUTE_BOOST' && typeof effect.target === 'string') {
      const attr = effect.target as Attribute;
      if (['BARRIER', 'BODY', 'CURSE', 'SOUL', 'CONVERT', 'RANGE'].includes(attr)) {
        if ((effect.value as number) > 0) {
          favoredAttribute = attr;
        }
      }
    }
    if (effect.type === 'ATTRIBUTE_WEAKEN' && typeof effect.target === 'string') {
      const attr = effect.target as Attribute;
      if (['BARRIER', 'BODY', 'CURSE', 'SOUL', 'CONVERT', 'RANGE'].includes(attr)) {
        weakenedAttribute = attr;
      }
    }
    if (effect.type === 'SPECIAL_RULE') {
      if (effect.description.includes('SPD 역전') || effect.description.includes('낮은 쪽이 선공')) {
        hasSpeedReverse = true;
      }
      if (effect.description.includes('속성 상성 무효') || effect.description.includes('순수 스탯')) {
        hasAttributeNullify = true;
      }
    }
  }

  // 추천/비추천 카드 결정
  for (const cardId of crewCardIds) {
    const card = CHARACTERS_BY_ID[cardId];
    if (!card) continue;

    if (favoredAttribute && card.attribute === favoredAttribute) {
      recommendedCards.push(cardId);
    }
    if (weakenedAttribute && card.attribute === weakenedAttribute) {
      avoidCards.push(cardId);
    }
  }

  return {
    arenaId: arena.id,
    favoredAttribute,
    weakenedAttribute,
    hasSpeedReverse,
    hasAttributeNullify,
    recommendedCards,
    avoidCards
  };
}

/**
 * 경기장에 대한 카드 적합도 점수 계산
 */
export function calculateArenaFitScore(
  cardId: string,
  arena: Arena
): ArenaFitScore {
  const card = CHARACTERS_BY_ID[cardId];
  if (!card) {
    return { cardId, arenaId: arena.id, score: 0, reasons: ['카드를 찾을 수 없음'] };
  }

  let score = 0;
  const reasons: string[] = [];

  for (const effect of arena.effects) {
    // 속성 부스트 체크
    if (effect.type === 'ATTRIBUTE_BOOST') {
      if (effect.target === card.attribute) {
        const boost = (effect.value as number) * 100;
        score += boost;
        reasons.push(`${card.attribute} 속성 +${boost}%`);
      }
    }

    // 속성 약화 체크
    if (effect.type === 'ATTRIBUTE_WEAKEN') {
      if (effect.target === card.attribute) {
        const weaken = Math.abs(effect.value as number) * 100;
        score -= weaken;
        reasons.push(`${card.attribute} 속성 -${weaken}%`);
      }
    }

    // 특수 규칙 체크
    if (effect.type === 'SPECIAL_RULE') {
      // SPD 역전 - 낮은 SPD 선호
      if (effect.description.includes('SPD 역전') || effect.description.includes('낮은 쪽이 선공')) {
        const spdScore = Math.max(0, 20 - (card.baseStats.spd || 0));
        score += spdScore;
        if (spdScore > 10) {
          reasons.push('SPD 역전에 유리 (낮은 SPD)');
        }
      }

      // 속성 상성 무효 - 순수 스탯 싸움
      if (effect.description.includes('속성 상성 무효')) {
        // 고스탯 캐릭터 유리
        const totalStats = (card.baseStats.atk || 0) + (card.baseStats.def || 0) +
                          (card.baseStats.spd || 0) + (card.baseStats.ce || 0);
        if (totalStats >= 70) {
          score += 10;
          reasons.push('순수 스탯 대결에 유리');
        }
      }

      // 특급 캐릭터 불리 경기장
      if (effect.description.includes('특급') && effect.description.includes('-')) {
        if (card.grade === '특급') {
          score -= 15;
          reasons.push('특급 캐릭터에 불리한 경기장');
        } else {
          score += 5;
          reasons.push('비특급 캐릭터에 유리');
        }
      }
    }
  }

  return { cardId, arenaId: arena.id, score, reasons };
}

// ========================================
// AI 밴 로직
// ========================================

/**
 * AI가 밴할 경기장 선택
 * 전략: 플레이어 크루에게 유리한 경기장을 밴
 */
export function aiSelectBan(
  playerCrew: string[],
  availableArenas: Arena[],
  _aiCrew: string[] = []
): string {
  // 플레이어 크루의 주요 속성 분석
  const playerAnalysis = analyzeCrewAttributes(playerCrew);
  const dominantAttribute = playerAnalysis.dominant;

  // 플레이어에게 유리한 경기장 찾기 (속성 부스트가 있는)
  const beneficialArenas: { arena: Arena; boost: number }[] = [];

  for (const arena of availableArenas) {
    let boost = 0;
    for (const effect of arena.effects) {
      if (effect.type === 'ATTRIBUTE_BOOST' && effect.target === dominantAttribute) {
        boost += (effect.value as number) * 100;
      }
    }
    if (boost > 0) {
      beneficialArenas.push({ arena, boost });
    }
  }

  // 부스트가 가장 높은 경기장 밴 (또는 랜덤)
  if (beneficialArenas.length > 0) {
    // 50% 확률로 가장 높은 것 선택, 50%는 랜덤
    if (Math.random() < 0.5) {
      beneficialArenas.sort((a, b) => b.boost - a.boost);
      return beneficialArenas[0].arena.id;
    }
    return beneficialArenas[Math.floor(Math.random() * beneficialArenas.length)].arena.id;
  }

  // 유리한 경기장이 없으면 완전 랜덤
  return availableArenas[Math.floor(Math.random() * availableArenas.length)].id;
}

// ========================================
// 카드 자동 배치 로직
// ========================================

/**
 * 경기장 5개에 카드 자동 배치
 */
export function autoAssignCards(
  crewCardIds: string[],
  arenas: Arena[]
): CardAssignment[] {
  const assignments: CardAssignment[] = [];
  const availableCards = [...crewCardIds];

  for (let i = 0; i < arenas.length && i < 5; i++) {
    const arena = arenas[i];

    // 각 경기장에 최적의 카드 찾기
    let bestCard: string | null = null;
    let bestScore = -Infinity;

    for (const cardId of availableCards) {
      const fitScore = calculateArenaFitScore(cardId, arena);
      if (fitScore.score > bestScore) {
        bestScore = fitScore.score;
        bestCard = cardId;
      }
    }

    if (bestCard) {
      assignments.push({
        arenaId: arena.id,
        arenaIndex: i,
        cardId: bestCard
      });
      // 사용한 카드 제거
      const idx = availableCards.indexOf(bestCard);
      if (idx !== -1) {
        availableCards.splice(idx, 1);
      }
    } else {
      // 카드가 없으면 null
      assignments.push({
        arenaId: arena.id,
        arenaIndex: i,
        cardId: null
      });
    }
  }

  return assignments;
}

/**
 * 밴픽 후 5개 경기장 선택
 */
export function selectArenasAfterBan(
  playerBannedId: string,
  aiBannedId: string
): Arena[] {
  // 밴된 경기장 제외
  const availableArenas = ALL_ARENAS.filter(
    arena => arena.id !== playerBannedId && arena.id !== aiBannedId
  );

  // 셔플
  const shuffled = [...availableArenas].sort(() => Math.random() - 0.5);

  // 5개 선택
  return shuffled.slice(0, 5);
}

/**
 * 전체 밴픽 프로세스 실행 (플레이어 밴 후)
 */
export function executeBanPickProcess(
  playerBannedArenaId: string,
  playerCrew: string[],
  aiCrew: string[]
): BanPickInfo {
  // 플레이어 밴 제외한 경기장 목록
  const afterPlayerBan = ALL_ARENAS.filter(a => a.id !== playerBannedArenaId);

  // AI 밴 선택
  const aiBannedArenaId = aiSelectBan(playerCrew, afterPlayerBan, aiCrew);

  // 5개 경기장 선택
  const selectedArenas = selectArenasAfterBan(playerBannedArenaId, aiBannedArenaId);

  return {
    playerBannedArena: playerBannedArenaId,
    aiBannedArena: aiBannedArenaId,
    selectedArenas
  };
}

// ========================================
// 추천 시스템
// ========================================

/**
 * 플레이어에게 밴 추천
 */
export function getRecommendedBans(
  aiCrew: string[],
  availableArenas: Arena[]
): { arenaId: string; reason: string }[] {
  const aiAnalysis = analyzeCrewAttributes(aiCrew);
  const recommendations: { arenaId: string; reason: string; priority: number }[] = [];

  for (const arena of availableArenas) {
    let priority = 0;
    const reasons: string[] = [];

    for (const effect of arena.effects) {
      if (effect.type === 'ATTRIBUTE_BOOST' && effect.target === aiAnalysis.dominant) {
        const boost = (effect.value as number) * 100;
        priority += boost;
        reasons.push(`${aiAnalysis.dominant} 속성 +${boost}% (상대 주력 속성)`);
      }
    }

    if (priority > 0) {
      recommendations.push({
        arenaId: arena.id,
        reason: reasons.join(', '),
        priority
      });
    }
  }

  // 우선순위 정렬
  recommendations.sort((a, b) => b.priority - a.priority);

  return recommendations.slice(0, 3).map(r => ({
    arenaId: r.arenaId,
    reason: r.reason
  }));
}

/**
 * 각 경기장에 추천할 카드 목록
 */
export function getRecommendedCardsForArena(
  arena: Arena,
  availableCards: string[]
): { cardId: string; score: number; reasons: string[] }[] {
  const scores: ArenaFitScore[] = availableCards.map(cardId =>
    calculateArenaFitScore(cardId, arena)
  );

  // 점수순 정렬
  scores.sort((a, b) => b.score - a.score);

  return scores.map(s => ({
    cardId: s.cardId,
    score: s.score,
    reasons: s.reasons
  }));
}

// ========================================
// 경기장 효과 요약 텍스트
// ========================================

/**
 * 경기장 효과를 짧은 텍스트로 요약
 */
export function getArenaEffectSummary(arena: Arena): string {
  const summaries: string[] = [];

  for (const effect of arena.effects) {
    if (effect.type === 'ATTRIBUTE_BOOST') {
      const attr = effect.target as string;
      const attrNames: Record<string, string> = {
        BARRIER: '결계', BODY: '신체', CURSE: '저주',
        SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
      };
      const name = attrNames[attr] || attr;
      const value = Math.round((effect.value as number) * 100);
      summaries.push(`${name}+${value}%`);
    } else if (effect.type === 'ATTRIBUTE_WEAKEN') {
      const attr = effect.target as string;
      const attrNames: Record<string, string> = {
        BARRIER: '결계', BODY: '신체', CURSE: '저주',
        SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
      };
      const name = attrNames[attr] || attr;
      const value = Math.abs(Math.round((effect.value as number) * 100));
      summaries.push(`${name}-${value}%`);
    } else if (effect.type === 'STAT_MODIFY') {
      const stat = effect.stat?.toUpperCase() || '';
      const value = effect.value as number;
      const sign = value >= 0 ? '+' : '';
      summaries.push(`${stat}${sign}${value}`);
    } else if (effect.type === 'SPECIAL_RULE') {
      if (effect.description.includes('SPD 역전')) {
        summaries.push('SPD역전');
      } else if (effect.description.includes('속성 상성 무효')) {
        summaries.push('상성무효');
      } else if (effect.description.includes('스킬 봉인')) {
        const prob = Math.round((effect.value as number) * 100);
        summaries.push(`봉인${prob}%`);
      } else if (effect.description.includes('크리티컬')) {
        summaries.push(`크리+${effect.value}%`);
      } else {
        summaries.push(effect.description);
      }
    }
  }

  return summaries.join(', ');
}
