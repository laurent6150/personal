// ========================================
// AI 로직 시스템
// ========================================

import type { CharacterCard, Difficulty, Arena, Attribute } from '../types';
import { CHARACTERS_BY_GRADE } from '../data/characters';
import { GRADES } from '../data/constants';
import {
  getAttributeMultiplier,
  getArenaAttributeBonus,
  isAttributeNullifiedArena
} from './attributeSystem';

/**
 * 랜덤 선택
 */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 경기장에서 유리한 카드인지 확인
 */
function isBoostedInArena(card: CharacterCard, arena: Arena): boolean {
  const bonus = getArenaAttributeBonus(card.attribute, arena);
  return bonus > 0;
}

/**
 * 예상 상대 카드 속성 추측 (사용된 카드 기반)
 */
function predictOpponentAttributes(
  _usedCards: string[],
  _allPlayerCards: string[]
): Attribute[] {
  // 간단히 모든 속성을 예측 (실제로는 더 정교하게 구현 가능)
  const possibleAttributes: Attribute[] = ['BODY', 'RANGE', 'CURSE', 'SOUL', 'CONVERT', 'BARRIER'];
  return possibleAttributes;
}

/**
 * 카드 점수 계산 (HARD 모드용)
 */
function calculateCardScore(
  card: CharacterCard,
  arena: Arena,
  opponentUsedCards: string[],
  _opponentRemainingCards: string[]
): number {
  let score = 0;

  // 1. 기본 스탯 점수
  const totalStats = card.baseStats.atk + card.baseStats.def + card.baseStats.spd +
    card.baseStats.ce + card.baseStats.hp;
  score += totalStats;

  // 2. 경기장 보너스
  const arenaBonus = getArenaAttributeBonus(card.attribute, arena);
  score += arenaBonus * 50; // 15% 보너스 = +7.5점

  // 3. 속성 상성 고려 (남은 상대 카드 예측)
  if (!isAttributeNullifiedArena(arena)) {
    const possibleAttributes = predictOpponentAttributes(opponentUsedCards, _opponentRemainingCards);
    let advantageCount = 0;
    let disadvantageCount = 0;

    for (const attr of possibleAttributes) {
      const mult = getAttributeMultiplier(card.attribute, attr);
      if (mult > 1) advantageCount++;
      if (mult < 1) disadvantageCount++;
    }

    score += (advantageCount - disadvantageCount) * 5;
  }

  // 4. 등급 가중치 (높은 등급 카드는 중요한 라운드에 아끼려고 약간 패널티)
  if (card.grade === '특급') score -= 10;
  if (card.grade === '1급') score -= 5;

  return score;
}

/**
 * AI 크루 생성 (난이도별)
 */
export function generateAICrew(difficulty: Difficulty): CharacterCard[] {
  const crew: CharacterCard[] = [];
  const usedIds = new Set<string>();

  switch (difficulty) {
    case 'EASY':
      // 2급, 준1급 등급 위주 (약한 크루)
      while (crew.length < 5) {
        const pool = [...CHARACTERS_BY_GRADE['2급'], ...CHARACTERS_BY_GRADE['준1급']];
        const card = randomPick(pool);
        if (!usedIds.has(card.id)) {
          // 등급 제한 체크
          const gradeCount = crew.filter(c => c.grade === card.grade).length;
          if (gradeCount < GRADES[card.grade].maxInDeck) {
            crew.push(card);
            usedIds.add(card.id);
          }
        }
      }
      break;

    case 'NORMAL':
      // 준1급, 1급 등급 혼합
      // 1급 1-2장, 나머지 준1급
      const grade1Cards = [...CHARACTERS_BY_GRADE['1급']];
      const grade1Count = Math.floor(Math.random() * 2) + 1; // 1-2장

      for (let i = 0; i < grade1Count && crew.length < 5; i++) {
        const card = randomPick(grade1Cards);
        if (!usedIds.has(card.id)) {
          crew.push(card);
          usedIds.add(card.id);
        }
      }

      while (crew.length < 5) {
        const pool = [...CHARACTERS_BY_GRADE['준1급'], ...CHARACTERS_BY_GRADE['2급']];
        const card = randomPick(pool);
        if (!usedIds.has(card.id)) {
          crew.push(card);
          usedIds.add(card.id);
        }
      }
      break;

    case 'HARD':
      // 특급 1장 + 1급 2장 + 준1급 2장
      // 특급
      const specialCard = randomPick(CHARACTERS_BY_GRADE['특급']);
      crew.push(specialCard);
      usedIds.add(specialCard.id);

      // 1급 2장
      const grade1Pool = CHARACTERS_BY_GRADE['1급'].filter(c => !usedIds.has(c.id));
      for (let i = 0; i < 2 && grade1Pool.length > 0; i++) {
        const card = randomPick(grade1Pool);
        crew.push(card);
        usedIds.add(card.id);
        grade1Pool.splice(grade1Pool.indexOf(card), 1);
      }

      // 준1급으로 채우기
      while (crew.length < 5) {
        const pool = CHARACTERS_BY_GRADE['준1급'].filter(c => !usedIds.has(c.id));
        if (pool.length === 0) break;
        const card = randomPick(pool);
        crew.push(card);
        usedIds.add(card.id);
      }
      break;
  }

  return crew;
}

/**
 * AI 카드 선택 (난이도별 전략)
 */
export function aiSelectCard(
  difficulty: Difficulty,
  availableCards: CharacterCard[],
  arena: Arena,
  playerUsedCards: string[],
  playerRemainingCards: string[],
  currentScore: { player: number; ai: number },
  roundNumber: number
): CharacterCard {
  if (availableCards.length === 0) {
    throw new Error('No available cards for AI');
  }

  if (availableCards.length === 1) {
    return availableCards[0];
  }

  switch (difficulty) {
    case 'EASY':
      // 완전 랜덤
      return randomPick(availableCards);

    case 'NORMAL':
      // 경기장에 유리한 카드 우선
      const boostedCards = availableCards.filter(c => isBoostedInArena(c, arena));
      if (boostedCards.length > 0) {
        return randomPick(boostedCards);
      }
      return randomPick(availableCards);

    case 'HARD':
      // 종합 판단
      return hardAISelectCard(
        availableCards,
        arena,
        playerUsedCards,
        playerRemainingCards,
        currentScore,
        roundNumber
      );

    default:
      return randomPick(availableCards);
  }
}

/**
 * HARD 모드 AI 카드 선택
 */
function hardAISelectCard(
  availableCards: CharacterCard[],
  arena: Arena,
  playerUsedCards: string[],
  playerRemainingCards: string[],
  currentScore: { player: number; ai: number },
  roundNumber: number
): CharacterCard {
  // 점수 계산
  const cardScores = availableCards.map(card => ({
    card,
    score: calculateCardScore(card, arena, playerUsedCards, playerRemainingCards)
  }));

  // 상황별 전략 조정
  const scoreDiff = currentScore.ai - currentScore.player;

  // 지고 있으면 강한 카드 투입
  if (scoreDiff < 0) {
    // 등급이 높은 카드에 보너스
    for (const cs of cardScores) {
      if (cs.card.grade === '특급') cs.score += 30;
      if (cs.card.grade === '1급') cs.score += 15;
    }
  }

  // 이기고 있으면 카드 아끼기
  if (scoreDiff > 0 && roundNumber < 4) {
    // 등급이 높은 카드에 패널티
    for (const cs of cardScores) {
      if (cs.card.grade === '특급') cs.score -= 20;
      if (cs.card.grade === '1급') cs.score -= 10;
    }
  }

  // 마지막 라운드 (에이스전)
  if (roundNumber === 5 || availableCards.length === 1) {
    // 가장 강한 카드 선택
    for (const cs of cardScores) {
      if (cs.card.grade === '특급') cs.score += 50;
      if (cs.card.grade === '1급') cs.score += 25;
    }
  }

  // 최고 점수 카드 선택
  cardScores.sort((a, b) => b.score - a.score);

  // 약간의 랜덤성 추가 (상위 2개 중 선택)
  if (cardScores.length >= 2 && Math.random() < 0.3) {
    return cardScores[1].card;
  }

  return cardScores[0].card;
}

/**
 * AI 초기 크루 셔플 (게임 시작 시)
 */
export function shuffleAICrew(crew: CharacterCard[]): CharacterCard[] {
  const shuffled = [...crew];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 플레이어 크루에 대응하는 AI 크루 생성 (밸런싱)
 */
export function generateBalancedAICrew(
  difficulty: Difficulty,
  _playerCrewGrades: string[]
): CharacterCard[] {
  // TODO: 플레이어 크루 등급에 맞춰 밸런싱 구현
  // 기본 크루 생성 후 반환
  return generateAICrew(difficulty);
}
