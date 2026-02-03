// ========================================
// 전투 실황 해설 시스템
// 전투 상황에 맞는 다양한 해설 메시지 생성
// ========================================

import type { BattleCommentType } from '../types';
import { BATTLE_COMMENTS } from '../types';

/**
 * 랜덤 해설 메시지 가져오기
 */
export function getRandomComment(type: BattleCommentType): string {
  const comments = BATTLE_COMMENTS[type];
  if (!comments || comments.length === 0) {
    return '';
  }
  return comments[Math.floor(Math.random() * comments.length)];
}

/**
 * 캐릭터 이름을 포함한 해설 생성
 */
export function getCommentWithCharacter(
  type: BattleCommentType,
  characterName: string
): string {
  const baseComment = getRandomComment(type);
  return baseComment.replace('{name}', characterName);
}

/**
 * 데미지에 따른 공격 해설
 */
export function getAttackComment(
  attackerName: string,
  defenderName: string,
  damage: number,
  isCritical: boolean
): string {
  if (isCritical) {
    const critComments = [
      `${attackerName}의 회심의 일격! ${defenderName}에게 ${damage} 데미지!`,
      `크리티컬! ${attackerName}이(가) ${defenderName}을(를) 강타! ${damage} 데미지!`,
      `${attackerName}의 정확한 공격이 ${defenderName}의 급소를 꿰뚫는다! ${damage}!`,
      `대단해! ${attackerName}의 크리티컬 히트! ${damage} 데미지!`
    ];
    return critComments[Math.floor(Math.random() * critComments.length)];
  }

  if (damage >= 50) {
    const heavyComments = [
      `${attackerName}의 강력한 공격! ${defenderName}에게 ${damage} 데미지!`,
      `${attackerName}이(가) ${defenderName}을(를) 강하게 때린다! ${damage}!`,
      `무시무시한 공격력! ${attackerName}이(가) ${damage} 데미지를 입힌다!`
    ];
    return heavyComments[Math.floor(Math.random() * heavyComments.length)];
  }

  if (damage >= 25) {
    const normalComments = [
      `${attackerName}의 공격! ${defenderName}에게 ${damage} 데미지.`,
      `${attackerName}이(가) ${defenderName}을(를) 공격. ${damage} 데미지!`,
      `${attackerName}의 일격이 ${defenderName}에게 적중! ${damage}!`
    ];
    return normalComments[Math.floor(Math.random() * normalComments.length)];
  }

  const weakComments = [
    `${attackerName}의 공격이 ${defenderName}을(를) 스쳐간다. ${damage} 데미지.`,
    `${defenderName}이(가) 방어한다! ${attackerName}의 공격은 ${damage} 데미지만.`,
    `${attackerName}의 공격은 효과가 미미하다. ${damage} 데미지.`
  ];
  return weakComments[Math.floor(Math.random() * weakComments.length)];
}

/**
 * 필살기 해설
 */
export function getUltimateComment(
  attackerName: string,
  ultimateName: string,
  damage: number
): string {
  const comments = [
    `${attackerName}의 필살기 "${ultimateName}"!!! ${damage} 데미지!`,
    `"${ultimateName}"! ${attackerName}의 비장의 수가 작렬한다! ${damage}!`,
    `이것이 ${attackerName}의 진정한 힘! "${ultimateName}"으로 ${damage} 데미지!`,
    `${attackerName}: "${ultimateName}"! 필살기가 발동했다! ${damage}!`
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

/**
 * 영역 전개 해설
 */
export function getDomainExpansionComment(
  characterName: string,
  domainName: string
): string {
  const comments = [
    `${characterName}이(가) 영역을 전개한다! "${domainName}"!`,
    `"영역 전개: ${domainName}" ${characterName}의 절대 영역이 펼쳐진다!`,
    `${characterName}: "영역 전개..." "${domainName}"이(가) 발동!`,
    `세계가 바뀐다... ${characterName}의 "${domainName}"!`
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

/**
 * HP 상태에 따른 해설
 */
export function getHpStatusComment(
  characterName: string,
  hpPercent: number
): string {
  if (hpPercent <= 10) {
    const criticalComments = [
      `${characterName}이(가) 쓰러지기 직전이다!`,
      `${characterName}, 한계에 다다랐다...!`,
      `${characterName}의 HP가 거의 남지 않았다!`
    ];
    return criticalComments[Math.floor(Math.random() * criticalComments.length)];
  }

  if (hpPercent <= 25) {
    const lowComments = [
      `${characterName}이(가) 위험하다!`,
      `${characterName}의 HP가 얼마 남지 않았다!`,
      `${characterName}, 고전 중이다!`
    ];
    return lowComments[Math.floor(Math.random() * lowComments.length)];
  }

  if (hpPercent <= 50) {
    const halfComments = [
      `${characterName}이(가) 체력을 절반 이상 잃었다.`,
      `${characterName}, 아직 버틸 수 있다!`,
      `${characterName}의 HP가 절반 이하!`
    ];
    return halfComments[Math.floor(Math.random() * halfComments.length)];
  }

  return '';
}

/**
 * 전투 시작 해설
 */
export function getBattleStartComment(
  player1Name: string,
  player2Name: string,
  arenaName: string
): string {
  const comments = [
    `${arenaName}에서 ${player1Name} VS ${player2Name}! 전투 개시!`,
    `${player1Name}과(와) ${player2Name}의 대결! 경기장: ${arenaName}`,
    `${arenaName}... 여기서 ${player1Name}과(와) ${player2Name}이(가) 맞붙는다!`,
    `운명의 대결! ${player1Name} VS ${player2Name}! (${arenaName})`
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

/**
 * 전투 종료 해설
 */
export function getBattleEndComment(
  winnerName: string,
  loserName: string,
  isCloseMatch: boolean
): string {
  if (isCloseMatch) {
    const closeComments = [
      `박빙의 승부! ${winnerName}의 신승!`,
      `아슬아슬한 승리... ${winnerName}이(가) 간신히 이겼다!`,
      `${winnerName}이(가) ${loserName}을(를) 가까스로 제압!`
    ];
    return closeComments[Math.floor(Math.random() * closeComments.length)];
  }

  const normalComments = [
    `${winnerName}의 승리!`,
    `${winnerName}이(가) ${loserName}을(를) 꺾었다!`,
    `경기 종료! 승자는 ${winnerName}!`
  ];
  return normalComments[Math.floor(Math.random() * normalComments.length)];
}

/**
 * 상태이상 적용 해설
 */
export function getStatusEffectComment(
  targetName: string,
  effectName: string
): string {
  const effectComments: Record<string, string[]> = {
    'burn': [
      `${targetName}이(가) 불에 휩싸였다!`,
      `${targetName}에게 화상을 입혔다!`,
      `불길이 ${targetName}을(를) 태운다!`
    ],
    'freeze': [
      `${targetName}이(가) 얼어붙었다!`,
      `${targetName}의 움직임이 둔해진다!`,
      `차가운 기운이 ${targetName}을(를) 감싼다!`
    ],
    'poison': [
      `${targetName}이(가) 독에 중독되었다!`,
      `독이 ${targetName}의 몸을 갉아먹는다!`,
      `${targetName}에게 독이 퍼져간다!`
    ],
    'stun': [
      `${targetName}이(가) 기절했다!`,
      `${targetName}이(가) 의식을 잃었다!`,
      `${targetName}의 행동이 봉인되었다!`
    ],
    'weaken': [
      `${targetName}의 힘이 빠져나간다!`,
      `${targetName}이(가) 약화되었다!`,
      `${targetName}의 공격력이 감소했다!`
    ],
    'curse': [
      `저주가 ${targetName}에게 내려졌다!`,
      `${targetName}이(가) 저주에 걸렸다!`,
      `어둠의 기운이 ${targetName}을(를) 감싼다!`
    ]
  };

  const comments = effectComments[effectName.toLowerCase()] || [
    `${targetName}에게 ${effectName} 상태이상!`
  ];

  return comments[Math.floor(Math.random() * comments.length)];
}

/**
 * 회피/방어 해설
 */
export function getDodgeComment(characterName: string): string {
  const comments = [
    `${characterName}이(가) 공격을 회피했다!`,
    `빗나갔다! ${characterName}이(가) 피했다!`,
    `${characterName}의 민첩한 움직임! 회피 성공!`,
    `${characterName}이(가) 위기를 모면했다!`
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

/**
 * 연속 콤보 해설
 */
export function getComboComment(
  attackerName: string,
  comboCount: number
): string {
  if (comboCount >= 5) {
    return `${attackerName}의 ${comboCount}콤보! 압도적인 공세!`;
  }
  if (comboCount >= 3) {
    return `${attackerName}이(가) ${comboCount}연속 공격에 성공!`;
  }
  return `${attackerName}의 연속 공격! ${comboCount}콤보!`;
}

/**
 * 턴 시작 해설
 */
export function getTurnStartComment(
  characterName: string,
  turnNumber: number
): string {
  if (turnNumber === 1) {
    return `${characterName}이(가) 먼저 움직인다!`;
  }
  if (turnNumber % 5 === 0) {
    return `${turnNumber}턴째... ${characterName}의 차례!`;
  }
  return `${characterName}의 턴!`;
}

/**
 * 경기장 효과 해설
 */
export function getArenaEffectComment(
  arenaName: string,
  effectDescription: string
): string {
  const comments = [
    `${arenaName}의 효과가 발동! ${effectDescription}`,
    `경기장 효과: ${effectDescription}`,
    `${arenaName}의 힘이 전장에 영향을 미친다! ${effectDescription}`
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

/**
 * 역전 상황 해설
 */
export function getReversalComment(characterName: string): string {
  const comments = [
    `이것이 역전인가?! ${characterName}이(가) 반격한다!`,
    `${characterName}의 대역전극!`,
    `포기하지 않는다! ${characterName}의 반격이 시작된다!`,
    `${characterName}이(가) 일어선다! 역전의 기회!`
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}
