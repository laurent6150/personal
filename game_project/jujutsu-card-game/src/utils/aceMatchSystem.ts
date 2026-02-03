// ========================================
// 에이스 결정전 시스템
// 2:2 동점 시 양측 에이스 카드가 1:1 결투
// ========================================

import type { AceMatchState, OwnedCard } from '../types';
import { CHARACTERS_BY_ID } from '../data/characters';

/**
 * 에이스 결정전 초기 상태
 */
export const INITIAL_ACE_MATCH_STATE: AceMatchState = {
  isActive: false,
  playerAceId: null,
  aiAceId: null,
  result: null
};

/**
 * 에이스 결정전 조건 확인 (2:2 동점 상황)
 */
export function checkAceMatchCondition(playerWins: number, aiWins: number): boolean {
  return playerWins === 2 && aiWins === 2;
}

/**
 * 에이스 결정전 시작
 */
export function startAceMatch(
  aiCards: string[],
  playerAceId: string
): AceMatchState {
  // AI 에이스 선정 (가장 강한 카드)
  const aiAceId = selectAiAce(aiCards);

  return {
    isActive: true,
    playerAceId,
    aiAceId,
    result: 'PENDING'
  };
}

/**
 * AI 에이스 선정 (스탯 합계가 가장 높은 카드)
 */
export function selectAiAce(aiCards: string[]): string {
  let bestCard = aiCards[0];
  let bestScore = 0;

  for (const cardId of aiCards) {
    const card = CHARACTERS_BY_ID[cardId];
    if (card) {
      const stats = card.baseStats;
      const score = stats.atk + stats.def + stats.spd + stats.ce + stats.hp;
      if (score > bestScore) {
        bestScore = score;
        bestCard = cardId;
      }
    }
  }

  return bestCard;
}

/**
 * 에이스 추천 (플레이어용)
 * 상대 에이스에 대한 상성을 고려하여 추천
 */
export function recommendPlayerAce(
  playerCards: OwnedCard[],
  aiAceId: string
): string[] {
  const aiAce = CHARACTERS_BY_ID[aiAceId];
  if (!aiAce) {
    return playerCards.map(c => c.cardId);
  }

  // 스탯 점수 + 상성 보너스로 정렬
  const scored = playerCards.map(card => {
    const charData = CHARACTERS_BY_ID[card.cardId];
    if (!charData) return { id: card.cardId, score: 0 };

    const stats = charData.baseStats;
    let score = stats.atk + stats.def + stats.spd + stats.ce + stats.hp;

    // 레벨 보너스
    score += (card.level || 1) * 5;

    // 경험치 보너스
    score += (card.exp || 0) / 100;

    // 속성 상성 (간단한 예시)
    // TODO: 속성 상성 시스템 구현 시 확장

    return { id: card.cardId, score };
  });

  // 점수 높은 순으로 정렬
  scored.sort((a, b) => b.score - a.score);

  return scored.map(s => s.id);
}

/**
 * 에이스 결정전 결과 처리
 */
export function processAceMatchResult(
  state: AceMatchState,
  winnerId: string
): AceMatchState {
  const result = winnerId === state.playerAceId ? 'PLAYER_WIN' : 'AI_WIN';

  return {
    ...state,
    isActive: false,
    result
  };
}

/**
 * 에이스 결정전 보상 계산
 */
export function calculateAceMatchRewards(isWinner: boolean): {
  exp: number;
  gold: number;
  title?: string;
} {
  if (isWinner) {
    return {
      exp: 200,
      gold: 500,
      title: '에이스'
    };
  }
  return {
    exp: 50,
    gold: 100
  };
}

/**
 * 에이스 결정전 연출 메시지
 */
export const ACE_MATCH_MESSAGES = {
  trigger: [
    '2:2 동점! 에이스 결정전이 시작됩니다!',
    '승부가 나지 않았다... 이제 에이스끼리의 대결이다!',
    '마지막 결전! 에이스 결정전!'
  ],
  playerSelect: '에이스를 선택하세요!',
  aiSelect: (name: string) => `상대가 ${name}을(를) 에이스로 선택했습니다!`,
  battleStart: (playerName: string, aiName: string) =>
    `${playerName} VS ${aiName}! 최후의 결전!`,
  playerWin: (name: string) => `${name}의 승리! 시리즈 승리!`,
  aiWin: (name: string) => `${name}에게 패배... 시리즈 패배...`
};

/**
 * 랜덤 메시지 선택
 */
export function getRandomAceMatchMessage(type: keyof typeof ACE_MATCH_MESSAGES): string {
  const messages = ACE_MATCH_MESSAGES[type];
  if (Array.isArray(messages)) {
    return messages[Math.floor(Math.random() * messages.length)];
  }
  return messages as string;
}
