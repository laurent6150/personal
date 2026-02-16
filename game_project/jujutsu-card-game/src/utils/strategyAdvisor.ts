// ========================================
// 전략 추천 시스템
// 유저가 복잡한 게임 로직을 쉽게 활용할 수 있도록 도움
// ========================================

import type {
  PlayerCard,
  CharacterCard,
  Arena,
  Attribute,
  Stats,
  LegacyGrade
} from '../types';
import { CHARACTERS_BY_ID } from '../data/characters';
import { ALL_ARENAS, ARENA_FAVORED_STATS } from '../data/arenas';
import { ITEMS_BY_ID } from '../data/items';
import {
  ATTRIBUTE_ADVANTAGE,
  ADVANTAGE_MULTIPLIER,
  DISADVANTAGE_MULTIPLIER,
  ATTRIBUTES
} from '../data/constants';
import {
  getArenaAttributeBonus,
  isAttributeNullifiedArena,
  isSpeedReversedArena,
  getSkillSealProbability,
  getArenaStatModifier
} from './attributeSystem';

// ========================================
// 타입 정의
// ========================================

export interface CardAnalysis {
  cardId: string;
  name: string;
  attribute: Attribute;
  grade: LegacyGrade;
  totalPower: number;
  strengths: string[];
  weaknesses: string[];
  bestArenas: ArenaRecommendation[];
  worstArenas: ArenaRecommendation[];
  strongAgainst: AttributeMatchup[];
  weakAgainst: AttributeMatchup[];
}

export interface ArenaRecommendation {
  arena: Arena;
  score: number;
  reasons: string[];
}

export interface AttributeMatchup {
  attribute: Attribute;
  attributeName: string;
  multiplier: number;
  description: string;
}

export interface BanRecommendation {
  arenaId: string;
  arenaName: string;
  banScore: number;  // 높을수록 밴 우선순위 높음
  reasons: string[];
}

export interface PlacementRecommendation {
  arenaId: string;
  arenaName: string;
  recommendedCard: string;
  recommendedCardName: string;
  score: number;
  reasons: string[];
  alternativeCards: Array<{
    cardId: string;
    cardName: string;
    score: number;
  }>;
}

export interface MatchupAnalysis {
  overallAdvantage: 'FAVORABLE' | 'NEUTRAL' | 'UNFAVORABLE';
  advantageScore: number;  // -100 ~ +100
  summary: string;
  arenaMatchups: Array<{
    arena: Arena;
    playerAdvantage: number;
    aiAdvantage: number;
    recommendation: string;
  }>;
}

export interface CrewAnalysis {
  totalPower: number;
  averagePower: number;
  attributeDistribution: Record<Attribute, number>;
  attributeBalance: 'BALANCED' | 'SPECIALIZED' | 'UNBALANCED';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

// ========================================
// 카드 스탯 계산 헬퍼
// ========================================

/**
 * 플레이어 카드의 실제 전투 스탯 계산 (레벨+장비 포함)
 */
export function getEffectiveStats(playerCard: PlayerCard): Stats {
  const baseCard = CHARACTERS_BY_ID[playerCard.cardId];
  if (!baseCard) return { atk: 0, def: 0, spd: 0, ce: 0, hp: 0, crt: 10, tec: 10, mnt: 10 };

  const stats = { ...baseCard.baseStats } as Stats;

  // 8스탯 기본값 보장
  if (!('crt' in stats)) {
    (stats as Stats).crt = 10;
    (stats as Stats).tec = 10;
    (stats as Stats).mnt = 10;
  }

  // 레벨업 보너스
  const levelBonus = (playerCard.level - 1) * 2;
  stats[baseCard.growthStats.primary] += levelBonus;
  stats[baseCard.growthStats.secondary] += levelBonus;

  // 장비 보너스
  for (const equipId of playerCard.equipment) {
    if (equipId) {
      const item = ITEMS_BY_ID[equipId];
      if (item) {
        for (const [stat, value] of Object.entries(item.statBonus)) {
          if (stat in stats && value !== undefined) {
            (stats as unknown as Record<string, number>)[stat] += value;
          }
        }
      }
    }
  }

  return stats as Stats;
}

/**
 * 카드의 총 전투력 계산 (단순 스탯 합계)
 */
export function calculateTotalPower(stats: Stats): number {
  return stats.atk + stats.def + stats.spd + stats.ce + stats.hp +
         (stats.crt || 0) + (stats.tec || 0) + (stats.mnt || 0);
}

// ========================================
// 속성 상성 분석
// ========================================

/**
 * 특정 속성의 상성 관계 분석
 */
export function getAttributeMatchups(attribute: Attribute): {
  strongAgainst: AttributeMatchup[];
  weakAgainst: AttributeMatchup[];
} {
  const strongAgainst: AttributeMatchup[] = [];
  const weakAgainst: AttributeMatchup[] = [];

  // 이 속성이 강한 상대
  for (const targetAttr of ATTRIBUTE_ADVANTAGE[attribute]) {
    strongAgainst.push({
      attribute: targetAttr,
      attributeName: ATTRIBUTES[targetAttr].ko,
      multiplier: ADVANTAGE_MULTIPLIER,
      description: `${ATTRIBUTES[attribute].ko} → ${ATTRIBUTES[targetAttr].ko}: x${ADVANTAGE_MULTIPLIER}`
    });
  }

  // 이 속성이 약한 상대
  for (const [attr, advantages] of Object.entries(ATTRIBUTE_ADVANTAGE) as [Attribute, Attribute[]][]) {
    if (advantages.includes(attribute)) {
      weakAgainst.push({
        attribute: attr,
        attributeName: ATTRIBUTES[attr].ko,
        multiplier: DISADVANTAGE_MULTIPLIER,
        description: `${ATTRIBUTES[attr].ko} → ${ATTRIBUTES[attribute].ko}: x${ADVANTAGE_MULTIPLIER}`
      });
    }
  }

  return { strongAgainst, weakAgainst };
}

// ========================================
// 경기장 분석
// ========================================

/**
 * 특정 카드에 대한 경기장 적합도 점수 계산
 */
export function calculateArenaScore(
  playerCard: PlayerCard,
  arena: Arena
): { score: number; reasons: string[] } {
  const baseCard = CHARACTERS_BY_ID[playerCard.cardId];
  if (!baseCard) return { score: 0, reasons: ['카드 정보 없음'] };

  const reasons: string[] = [];
  let score = 50; // 기본 점수

  // 1. 속성 보너스/패널티 체크
  const attrBonus = getArenaAttributeBonus(baseCard.attribute, arena);
  if (attrBonus > 0) {
    score += attrBonus * 100;  // 0.15 → +15점
    reasons.push(`${ATTRIBUTES[baseCard.attribute].ko} 속성 데미지 +${Math.round(attrBonus * 100)}%`);
  } else if (attrBonus < 0) {
    score += attrBonus * 100;  // -0.10 → -10점
    reasons.push(`${ATTRIBUTES[baseCard.attribute].ko} 속성 데미지 ${Math.round(attrBonus * 100)}%`);
  }

  // 2. 스탯 수정자 체크
  const statMod = getArenaStatModifier(arena);
  if (statMod !== 0) {
    const effect = arena.effects.find(e => e.type === 'STAT_MODIFY' && e.target === 'ALL');
    if (effect) {
      if (statMod > 0) {
        score += statMod * 2;
        reasons.push(`${effect.description}`);
      } else {
        score += statMod * 2;
        reasons.push(`${effect.description}`);
      }
    }
  }

  // 3. 속성 상성 무효 경기장 체크
  if (isAttributeNullifiedArena(arena)) {
    // 순수 스탯 싸움 - 스탯이 높으면 유리
    const stats = getEffectiveStats(playerCard);
    const totalPower = calculateTotalPower(stats);
    if (totalPower > 120) {
      score += 10;
      reasons.push('속성 무효: 높은 스탯으로 유리');
    } else {
      score -= 5;
      reasons.push('속성 무효: 상성 이점 활용 불가');
    }
  }

  // 4. SPD 역전 경기장 체크
  if (isSpeedReversedArena(arena)) {
    const stats = getEffectiveStats(playerCard);
    if (stats.spd <= 12) {
      score += 10;
      reasons.push('SPD 역전: 낮은 속도로 선공 가능');
    } else {
      score -= 10;
      reasons.push('SPD 역전: 높은 속도가 불리');
    }
  }

  // 5. 스킬 봉인 확률 체크
  const sealProb = getSkillSealProbability(arena);
  if (sealProb > 0) {
    // 스킬 의존도가 높은 카드는 불리
    if (baseCard.skill && baseCard.skill.effect) {
      score -= sealProb * 20;  // 0.3 → -6점
      reasons.push(`스킬 봉인 ${sealProb * 100}% 확률`);
    }
  }

  // 6. 경기장 favoredStat 체크
  const favoredStat = ARENA_FAVORED_STATS[arena.id];
  if (favoredStat) {
    const stats = getEffectiveStats(playerCard);
    const statValue = (stats as unknown as Record<string, number>)[favoredStat.stat] || 0;
    if (statValue >= favoredStat.threshold) {
      score += 15;
      reasons.push(`${favoredStat.stat.toUpperCase()} ${favoredStat.threshold}+ → ${favoredStat.bonusType} 보너스`);
    }
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

/**
 * 카드별 최적/최악 경기장 찾기
 */
export function findBestAndWorstArenas(
  playerCard: PlayerCard,
  arenas: Arena[] = ALL_ARENAS
): { best: ArenaRecommendation[]; worst: ArenaRecommendation[] } {
  const arenaScores: ArenaRecommendation[] = arenas.map(arena => {
    const { score, reasons } = calculateArenaScore(playerCard, arena);
    return { arena, score, reasons };
  });

  // 점수순 정렬
  arenaScores.sort((a, b) => b.score - a.score);

  return {
    best: arenaScores.slice(0, 3),
    worst: arenaScores.slice(-3).reverse()
  };
}

// ========================================
// 경기장 밴 추천
// ========================================

/**
 * 밴해야 할 경기장 추천
 * @param playerCards 플레이어 크루 카드들
 * @param opponentCards 상대 크루 카드들 (알려진 경우)
 * @param availableArenas 밴 가능한 경기장들
 */
export function recommendArenaBan(
  playerCards: PlayerCard[],
  opponentCards: CharacterCard[] | null,
  availableArenas: Arena[]
): BanRecommendation[] {
  const recommendations: BanRecommendation[] = [];

  for (const arena of availableArenas) {
    const reasons: string[] = [];
    let banScore = 0;

    // 1. 내 크루에 불리한 경기장 점수 계산
    let totalPlayerScore = 0;
    let playerDisadvantageCount = 0;

    for (const card of playerCards) {
      const { score } = calculateArenaScore(card, arena);
      totalPlayerScore += score;
      if (score < 40) playerDisadvantageCount++;
    }

    const avgPlayerScore = totalPlayerScore / playerCards.length;

    if (avgPlayerScore < 45) {
      banScore += (45 - avgPlayerScore) * 2;
      reasons.push(`내 크루 평균 적합도 낮음 (${avgPlayerScore.toFixed(1)}점)`);
    }

    if (playerDisadvantageCount >= 2) {
      banScore += playerDisadvantageCount * 10;
      reasons.push(`${playerDisadvantageCount}장의 카드가 불리`);
    }

    // 2. 상대에게 유리한 경기장 체크 (상대 정보가 있는 경우)
    if (opponentCards && opponentCards.length > 0) {
      let opponentAdvantageCount = 0;

      for (const oppCard of opponentCards) {
        const attrBonus = getArenaAttributeBonus(oppCard.attribute, arena);
        if (attrBonus > 0.1) {
          opponentAdvantageCount++;
        }
      }

      if (opponentAdvantageCount >= 2) {
        banScore += opponentAdvantageCount * 15;
        reasons.push(`상대 ${opponentAdvantageCount}장이 유리한 경기장`);
      }
    }

    // 3. 특수 규칙으로 인한 불리함 체크
    if (isSpeedReversedArena(arena)) {
      const avgSpd = playerCards.reduce((sum, c) => {
        const stats = getEffectiveStats(c);
        return sum + stats.spd;
      }, 0) / playerCards.length;

      if (avgSpd > 15) {
        banScore += 15;
        reasons.push('SPD 역전: 내 크루 평균 SPD가 높아 불리');
      }
    }

    const sealProb = getSkillSealProbability(arena);
    if (sealProb >= 0.3) {
      banScore += 10;
      reasons.push(`스킬 봉인 ${sealProb * 100}% 확률`);
    }

    // 4. 특정 속성에만 유리한 경기장 체크
    const myAttributes = new Set(playerCards.map(c => CHARACTERS_BY_ID[c.cardId]?.attribute));
    for (const effect of arena.effects) {
      if (effect.type === 'ATTRIBUTE_BOOST' && effect.value >= 0.2) {
        const boostedAttr = effect.target as Attribute;
        if (!myAttributes.has(boostedAttr)) {
          banScore += 10;
          reasons.push(`${ATTRIBUTES[boostedAttr].ko} 속성 대폭 강화 (+${effect.value * 100}%)`);
        }
      }
    }

    if (reasons.length > 0) {
      recommendations.push({
        arenaId: arena.id,
        arenaName: arena.name.ko,
        banScore,
        reasons
      });
    }
  }

  // 밴 우선순위 순으로 정렬
  recommendations.sort((a, b) => b.banScore - a.banScore);

  return recommendations;
}

// ========================================
// 카드 배치 추천
// ========================================

/**
 * 각 경기장에 최적의 카드 배치 추천
 */
export function recommendCardPlacement(
  playerCards: PlayerCard[],
  arenas: Arena[],
  usedCardIds: string[] = []
): PlacementRecommendation[] {
  const recommendations: PlacementRecommendation[] = [];
  const availableCards = playerCards.filter(c => !usedCardIds.includes(c.cardId));

  for (const arena of arenas) {
    const cardScores: Array<{
      card: PlayerCard;
      score: number;
      reasons: string[];
    }> = [];

    for (const card of availableCards) {
      const { score, reasons } = calculateArenaScore(card, arena);
      cardScores.push({ card, score, reasons });
    }

    // 점수순 정렬
    cardScores.sort((a, b) => b.score - a.score);

    if (cardScores.length > 0) {
      const best = cardScores[0];
      const baseCard = CHARACTERS_BY_ID[best.card.cardId];

      recommendations.push({
        arenaId: arena.id,
        arenaName: arena.name.ko,
        recommendedCard: best.card.cardId,
        recommendedCardName: baseCard?.name.ko || best.card.cardId,
        score: best.score,
        reasons: best.reasons,
        alternativeCards: cardScores.slice(1, 3).map(cs => ({
          cardId: cs.card.cardId,
          cardName: CHARACTERS_BY_ID[cs.card.cardId]?.name.ko || cs.card.cardId,
          score: cs.score
        }))
      });
    }
  }

  return recommendations;
}

/**
 * 최적의 전체 배치 전략 추천 (그리디 알고리즘)
 */
export function recommendOptimalPlacement(
  playerCards: PlayerCard[],
  arenas: Arena[]
): PlacementRecommendation[] {
  const usedCardIds: string[] = [];
  const recommendations: PlacementRecommendation[] = [];

  // 각 경기장-카드 조합의 점수 계산
  const allCombinations: Array<{
    arena: Arena;
    card: PlayerCard;
    score: number;
    reasons: string[];
  }> = [];

  for (const arena of arenas) {
    for (const card of playerCards) {
      const { score, reasons } = calculateArenaScore(card, arena);
      allCombinations.push({ arena, card, score, reasons });
    }
  }

  // 점수 높은 순으로 정렬
  allCombinations.sort((a, b) => b.score - a.score);

  // 그리디하게 배치 (점수 높은 조합부터 선택)
  const assignedArenas = new Set<string>();

  for (const combo of allCombinations) {
    if (usedCardIds.includes(combo.card.cardId)) continue;
    if (assignedArenas.has(combo.arena.id)) continue;

    const baseCard = CHARACTERS_BY_ID[combo.card.cardId];

    // 대안 카드 찾기
    const alternativeCards = playerCards
      .filter(c =>
        !usedCardIds.includes(c.cardId) &&
        c.cardId !== combo.card.cardId
      )
      .map(c => {
        const { score } = calculateArenaScore(c, combo.arena);
        return {
          cardId: c.cardId,
          cardName: CHARACTERS_BY_ID[c.cardId]?.name.ko || c.cardId,
          score
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    recommendations.push({
      arenaId: combo.arena.id,
      arenaName: combo.arena.name.ko,
      recommendedCard: combo.card.cardId,
      recommendedCardName: baseCard?.name.ko || combo.card.cardId,
      score: combo.score,
      reasons: combo.reasons,
      alternativeCards
    });

    usedCardIds.push(combo.card.cardId);
    assignedArenas.add(combo.arena.id);

    if (recommendations.length >= arenas.length) break;
  }

  return recommendations;
}

// ========================================
// 크루 분석
// ========================================

/**
 * 크루 전체 분석
 */
export function analyzeCrewComposition(playerCards: PlayerCard[]): CrewAnalysis {
  if (playerCards.length === 0) {
    return {
      totalPower: 0,
      averagePower: 0,
      attributeDistribution: {
        BARRIER: 0, BODY: 0, CURSE: 0, SOUL: 0, CONVERT: 0, RANGE: 0
      },
      attributeBalance: 'UNBALANCED',
      strengths: [],
      weaknesses: [],
      recommendations: ['크루를 구성해주세요']
    };
  }

  // 속성 분포 계산
  const attributeDistribution: Record<Attribute, number> = {
    BARRIER: 0, BODY: 0, CURSE: 0, SOUL: 0, CONVERT: 0, RANGE: 0
  };

  let totalPower = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  for (const card of playerCards) {
    const baseCard = CHARACTERS_BY_ID[card.cardId];
    if (baseCard) {
      attributeDistribution[baseCard.attribute]++;
      const stats = getEffectiveStats(card);
      totalPower += calculateTotalPower(stats);
    }
  }

  const averagePower = totalPower / playerCards.length;

  // 속성 밸런스 분석
  const attributeCounts = Object.values(attributeDistribution);
  const maxAttrCount = Math.max(...attributeCounts);
  const usedAttributes = attributeCounts.filter(c => c > 0).length;

  let attributeBalance: 'BALANCED' | 'SPECIALIZED' | 'UNBALANCED';

  if (usedAttributes >= 4 && maxAttrCount <= 2) {
    attributeBalance = 'BALANCED';
    strengths.push('다양한 속성으로 밸런스 잡힌 크루');
  } else if (maxAttrCount >= 3) {
    attributeBalance = 'SPECIALIZED';
    const dominantAttr = (Object.entries(attributeDistribution) as [Attribute, number][])
      .find(([_, count]) => count === maxAttrCount)?.[0];
    if (dominantAttr) {
      strengths.push(`${ATTRIBUTES[dominantAttr].ko} 속성 특화 크루`);

      // 해당 속성이 강한 상대 찾기
      const strongAgainst = ATTRIBUTE_ADVANTAGE[dominantAttr];
      strengths.push(`${strongAgainst.map(a => ATTRIBUTES[a].ko).join(', ')} 속성에 강함`);

      // 약점 분석
      for (const [attr, adv] of Object.entries(ATTRIBUTE_ADVANTAGE) as [Attribute, Attribute[]][]) {
        if (adv.includes(dominantAttr)) {
          weaknesses.push(`${ATTRIBUTES[attr].ko} 속성에 취약`);
        }
      }
    }
  } else {
    attributeBalance = 'UNBALANCED';
    weaknesses.push('속성 구성이 불균형함');
  }

  // 부족한 속성 체크
  const missingAttributes = (Object.entries(attributeDistribution) as [Attribute, number][])
    .filter(([_, count]) => count === 0)
    .map(([attr, _]) => attr);

  if (missingAttributes.length > 0 && missingAttributes.length <= 3) {
    recommendations.push(
      `${missingAttributes.map(a => ATTRIBUTES[a].ko).join(', ')} 속성 카드 추가 고려`
    );
  }

  // 전투력 분석
  if (averagePower < 100) {
    weaknesses.push('평균 전투력이 낮음');
    recommendations.push('카드 레벨업 또는 장비 강화 권장');
  } else if (averagePower > 130) {
    strengths.push('높은 평균 전투력');
  }

  return {
    totalPower,
    averagePower,
    attributeDistribution,
    attributeBalance,
    strengths,
    weaknesses,
    recommendations
  };
}

// ========================================
// 상대 분석
// ========================================

/**
 * 상대 크루와의 매치업 분석
 */
export function analyzeMatchup(
  playerCards: PlayerCard[],
  opponentCards: CharacterCard[],
  availableArenas: Arena[]
): MatchupAnalysis {
  let totalAdvantage = 0;
  const arenaMatchups: MatchupAnalysis['arenaMatchups'] = [];

  // 속성 상성 분석
  const playerAttributes = playerCards.map(c => CHARACTERS_BY_ID[c.cardId]?.attribute).filter(Boolean) as Attribute[];
  const opponentAttributes = opponentCards.map(c => c.attribute);

  let attrAdvantageCount = 0;
  let attrDisadvantageCount = 0;

  for (const pAttr of playerAttributes) {
    for (const oAttr of opponentAttributes) {
      if (ATTRIBUTE_ADVANTAGE[pAttr]?.includes(oAttr)) {
        attrAdvantageCount++;
      }
      if (ATTRIBUTE_ADVANTAGE[oAttr]?.includes(pAttr)) {
        attrDisadvantageCount++;
      }
    }
  }

  const attrAdvantageScore = (attrAdvantageCount - attrDisadvantageCount) * 5;
  totalAdvantage += attrAdvantageScore;

  // 경기장별 매치업 분석
  for (const arena of availableArenas) {
    let playerAdvantage = 0;
    let aiAdvantage = 0;

    // 플레이어 카드들의 경기장 적합도
    for (const card of playerCards) {
      const { score } = calculateArenaScore(card, arena);
      playerAdvantage += score;
    }
    playerAdvantage /= playerCards.length;

    // 상대 카드들의 경기장 적합도
    for (const oppCard of opponentCards) {
      const attrBonus = getArenaAttributeBonus(oppCard.attribute, arena);
      aiAdvantage += 50 + attrBonus * 100;
    }
    aiAdvantage /= opponentCards.length;

    const diff = playerAdvantage - aiAdvantage;
    totalAdvantage += diff * 0.5;

    let recommendation = '';
    if (diff > 15) {
      recommendation = '이 경기장에서 유리합니다';
    } else if (diff < -15) {
      recommendation = '이 경기장은 피하는 것이 좋습니다';
    } else {
      recommendation = '균형 잡힌 경기장입니다';
    }

    arenaMatchups.push({
      arena,
      playerAdvantage,
      aiAdvantage,
      recommendation
    });
  }

  // 전체 우위 판정
  let overallAdvantage: 'FAVORABLE' | 'NEUTRAL' | 'UNFAVORABLE';
  if (totalAdvantage > 20) {
    overallAdvantage = 'FAVORABLE';
  } else if (totalAdvantage < -20) {
    overallAdvantage = 'UNFAVORABLE';
  } else {
    overallAdvantage = 'NEUTRAL';
  }

  // 요약 생성
  let summary = '';
  if (overallAdvantage === 'FAVORABLE') {
    summary = '전체적으로 유리한 매치업입니다. ';
    if (attrAdvantageCount > attrDisadvantageCount) {
      summary += '속성 상성에서 우위를 점하고 있습니다.';
    }
  } else if (overallAdvantage === 'UNFAVORABLE') {
    summary = '불리한 매치업입니다. ';
    if (attrDisadvantageCount > attrAdvantageCount) {
      summary += '속성 상성에서 불리합니다. 경기장 선택이 중요합니다.';
    }
  } else {
    summary = '균형 잡힌 매치업입니다. 전략적 선택이 승부를 가를 것입니다.';
  }

  return {
    overallAdvantage,
    advantageScore: Math.max(-100, Math.min(100, totalAdvantage)),
    summary,
    arenaMatchups
  };
}

// ========================================
// 개별 카드 분석
// ========================================

/**
 * 개별 카드 상세 분석
 */
export function analyzeCard(playerCard: PlayerCard): CardAnalysis | null {
  const baseCard = CHARACTERS_BY_ID[playerCard.cardId];
  if (!baseCard) return null;

  const stats = getEffectiveStats(playerCard);
  const totalPower = calculateTotalPower(stats);

  const { strongAgainst, weakAgainst } = getAttributeMatchups(baseCard.attribute);
  const { best: bestArenas, worst: worstArenas } = findBestAndWorstArenas(playerCard);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // 스탯 기반 강점/약점
  if (stats.atk >= 20) strengths.push('높은 공격력');
  if (stats.def >= 18) strengths.push('단단한 방어력');
  if (stats.spd >= 18) strengths.push('빠른 속도');
  if (stats.ce >= 20) strengths.push('강력한 주력');
  if (stats.hp >= 30) strengths.push('높은 체력');

  if (stats.atk < 12) weaknesses.push('낮은 공격력');
  if (stats.def < 10) weaknesses.push('약한 방어력');
  if (stats.spd < 10) weaknesses.push('느린 속도');

  // 스킬 분석
  if (baseCard.skill) {
    strengths.push(`스킬: ${baseCard.skill.name}`);
  }

  return {
    cardId: playerCard.cardId,
    name: baseCard.name.ko,
    attribute: baseCard.attribute,
    grade: baseCard.grade,
    totalPower,
    strengths,
    weaknesses,
    bestArenas,
    worstArenas,
    strongAgainst,
    weakAgainst
  };
}

// ========================================
// 종합 전략 추천
// ========================================

export interface StrategyAdvice {
  banRecommendations: BanRecommendation[];
  placementRecommendations: PlacementRecommendation[];
  crewAnalysis: CrewAnalysis;
  matchupAnalysis?: MatchupAnalysis;
  tips: string[];
}

/**
 * 종합 전략 조언 생성
 */
export function getStrategyAdvice(
  playerCards: PlayerCard[],
  opponentCards: CharacterCard[] | null,
  availableArenas: Arena[]
): StrategyAdvice {
  const crewAnalysis = analyzeCrewComposition(playerCards);
  const banRecommendations = recommendArenaBan(playerCards, opponentCards, availableArenas);

  // 밴 후 남은 경기장으로 배치 추천 (상위 1개 밴 가정)
  const remainingArenas = availableArenas.filter(
    a => banRecommendations.length === 0 || a.id !== banRecommendations[0]?.arenaId
  ).slice(0, 5);

  const placementRecommendations = recommendOptimalPlacement(playerCards, remainingArenas);

  let matchupAnalysis: MatchupAnalysis | undefined;
  if (opponentCards && opponentCards.length > 0) {
    matchupAnalysis = analyzeMatchup(playerCards, opponentCards, availableArenas);
  }

  // 팁 생성
  const tips: string[] = [];

  if (banRecommendations.length > 0 && banRecommendations[0].banScore > 30) {
    tips.push(`${banRecommendations[0].arenaName} 경기장을 밴하는 것을 강력 추천합니다.`);
  }

  if (crewAnalysis.attributeBalance === 'SPECIALIZED') {
    tips.push('특화된 속성에 유리한 경기장을 최대한 활용하세요.');
  }

  if (matchupAnalysis) {
    if (matchupAnalysis.overallAdvantage === 'FAVORABLE') {
      tips.push('유리한 매치업입니다. 자신감을 가지고 플레이하세요.');
    } else if (matchupAnalysis.overallAdvantage === 'UNFAVORABLE') {
      tips.push('불리한 매치업이므로 경기장 선택과 카드 배치에 신중해야 합니다.');
    }
  }

  // 경기장별 팁
  for (const arena of availableArenas.slice(0, 3)) {
    if (isSpeedReversedArena(arena)) {
      tips.push(`${arena.name.ko}: SPD가 낮은 카드가 선공합니다.`);
    }
    if (isAttributeNullifiedArena(arena)) {
      tips.push(`${arena.name.ko}: 속성 상성이 무효화됩니다. 순수 스탯 싸움입니다.`);
    }
  }

  return {
    banRecommendations,
    placementRecommendations,
    crewAnalysis,
    matchupAnalysis,
    tips
  };
}
