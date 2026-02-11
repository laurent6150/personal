// ========================================
// 경기장 효과 분석 유틸리티
// 캐릭터와 경기장 효과를 분석하여 유/불리 판정
// ========================================

import type { CharacterCard, Arena, ArenaEffect, Attribute } from '../types';

export interface AnalysisResult {
  positive: string[];
  negative: string[];
  neutral: string[];
  recommendation: 'good' | 'bad' | 'neutral';
  score: number; // 1-5 별점
  tipMessage: string;
}

// 속성 한글 이름
const ATTRIBUTE_NAMES: Record<Attribute, string> = {
  BODY: '육체',
  CURSE: '저주',
  SOUL: '혼',
  BARRIER: '결계',
  CONVERT: '반전',
  RANGE: '원거리'
};

// 스탯 한글 이름
const STAT_NAMES: Record<string, string> = {
  atk: '공격력',
  def: '방어력',
  spd: '속도',
  ce: '주술',
  hp: 'HP',
  crt: '치명타',
  tec: '테크닉',
  mnt: '정신력'
};

/**
 * 캐릭터와 경기장의 효과를 분석
 */
export function analyzeArenaEffects(character: CharacterCard, arena: Arena): AnalysisResult {
  const positive: string[] = [];
  const negative: string[] = [];
  const neutral: string[] = [];
  let scoreModifier = 0;

  for (const effect of arena.effects) {
    const analysis = analyzeEffect(effect, character);

    if (analysis.type === 'positive') {
      positive.push(analysis.message);
      scoreModifier += analysis.impact;
    } else if (analysis.type === 'negative') {
      negative.push(analysis.message);
      scoreModifier -= analysis.impact;
    } else {
      neutral.push(analysis.message);
    }
  }

  // 추천도 계산
  const recommendation: 'good' | 'bad' | 'neutral' =
    positive.length >= 2 && negative.length === 0 ? 'good' :
    negative.length >= 2 ? 'bad' :
    positive.length > negative.length ? 'good' :
    negative.length > positive.length ? 'bad' : 'neutral';

  // 별점 계산 (1-5)
  const baseScore = 3;
  const score = Math.min(5, Math.max(1, baseScore + scoreModifier));

  // 팁 메시지 생성
  const tipMessage = generateTipMessage(character, arena, positive, negative);

  return {
    positive,
    negative,
    neutral,
    recommendation,
    score,
    tipMessage
  };
}

interface EffectAnalysis {
  type: 'positive' | 'negative' | 'neutral';
  message: string;
  impact: number; // 점수 영향 (0-2)
}

/**
 * 개별 효과 분석
 */
function analyzeEffect(effect: ArenaEffect, character: CharacterCard): EffectAnalysis {
  const target = effect.target;
  const isTargetAll = target === 'ALL';
  const isTargetAttribute = target === character.attribute;
  const attrName = ATTRIBUTE_NAMES[character.attribute];

  // 속성 부스트/페널티
  if (isTargetAttribute || isTargetAll) {
    const statName = effect.stat ? (STAT_NAMES[effect.stat] || effect.stat) : '전체 스탯';
    if (effect.value > 0) {
      return {
        type: 'positive',
        message: `${statName} +${effect.value}% (${isTargetAll ? '전체' : attrName} 속성)`,
        impact: effect.value >= 20 ? 2 : 1
      };
    } else if (effect.value < 0) {
      return {
        type: 'negative',
        message: `${statName} ${effect.value}% (${isTargetAll ? '전체' : attrName} 속성)`,
        impact: Math.abs(effect.value) >= 20 ? 2 : 1
      };
    }
  }

  // 다른 속성 대상 효과
  if (target !== 'ALL' && target !== character.attribute) {
    const targetAttrName = ATTRIBUTE_NAMES[target as Attribute] || target;
    if (effect.value > 0) {
      return {
        type: 'neutral',
        message: `${targetAttrName} 속성 보너스 해당 없음 (${attrName} 속성)`,
        impact: 0
      };
    } else {
      return {
        type: 'positive', // 다른 속성 페널티는 상대적 이점
        message: `${targetAttrName} 속성 페널티 회피 (${attrName} 속성)`,
        impact: 1
      };
    }
  }

  // 기본 중립
  return {
    type: 'neutral',
    message: `효과 영향 없음`,
    impact: 0
  };
}

/**
 * 팁 메시지 생성
 */
function generateTipMessage(
  character: CharacterCard,
  _arena: Arena,
  positive: string[],
  negative: string[]
): string {
  const attrName = ATTRIBUTE_NAMES[character.attribute];

  if (positive.length >= 2 && negative.length === 0) {
    return `${character.name.ko}에게 매우 유리한 경기장입니다! 적극 추천!`;
  }

  if (negative.length >= 2) {
    return `${character.name.ko}에게 불리한 경기장입니다. 다른 카드를 고려해보세요.`;
  }

  if (positive.length > negative.length) {
    return `${attrName} 속성 ${character.name.ko}에게 유리한 효과가 있습니다.`;
  }

  if (negative.length > positive.length) {
    return `${attrName} 속성에 불리한 효과가 있으니 주의하세요.`;
  }

  return `${character.name.ko}에게 특별한 유불리가 없는 경기장입니다.`;
}

/**
 * 에이스 결정전 팁 생성
 */
export function generateAceTip(character: CharacterCard, arena: Arena): string {
  const analysis = analyzeArenaEffects(character, arena);

  if (analysis.recommendation === 'good') {
    return `${character.name.ko}는 이 경기장과 궁합이 좋습니다! 승리 확률이 높습니다.`;
  }

  if (analysis.recommendation === 'bad') {
    return `${character.name.ko}에게 불리한 경기장입니다. 신중하게 선택하세요.`;
  }

  // 스탯 기반 추천
  const stats = character.baseStats as unknown as Record<string, number>;
  const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);

  if (totalStats > 150) {
    return `${character.name.ko}는 높은 기본 스탯으로 안정적인 선택입니다.`;
  }

  return `${character.name.ko}의 스킬과 전략을 잘 활용하세요.`;
}

/**
 * 빠른 추천도 계산 (별점만)
 */
export function getQuickScore(character: CharacterCard, arena: Arena): number {
  const analysis = analyzeArenaEffects(character, arena);
  return analysis.score;
}

/**
 * 추천 뱃지 텍스트
 */
export function getRecommendationBadge(recommendation: 'good' | 'bad' | 'neutral'): {
  text: string;
  icon: string;
  color: string;
} {
  switch (recommendation) {
    case 'good':
      return { text: '추천!', icon: '⭐', color: 'text-yellow-400' };
    case 'bad':
      return { text: '불리', icon: '⚠️', color: 'text-red-400' };
    default:
      return { text: '보통', icon: '➖', color: 'text-gray-400' };
  }
}
