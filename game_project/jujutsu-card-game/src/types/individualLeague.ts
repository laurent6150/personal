// ========================================
// 개인 리그 1:1 배틀 타입 정의
// ========================================

import type { Attribute, LeagueMatchFormat } from './index';

// 경기장 효과
export interface ArenaEffect {
  id: string;
  name: string;
  bonusAttribute: Attribute;   // 보너스 받는 속성
  bonusPercent: number;          // 보너스 퍼센트 (예: 10 = +10%)
  penaltyAttribute: Attribute; // 페널티 받는 속성
  penaltyPercent: number;        // 페널티 퍼센트 (예: 5 = -5%)
  description: string;
}

// format에 따른 필요 승리 수 계산
export function getRequiredWins(format: LeagueMatchFormat): number {
  switch (format) {
    case '1WIN': return 1;
    case '2WIN': return 2;
    case '3WIN': return 3;
    default: return 1;
  }
}

// format 표시 문자열
export function getFormatDisplayText(format: LeagueMatchFormat): string {
  switch (format) {
    case '1WIN': return '단판';
    case '2WIN': return '2선승';
    case '3WIN': return '3선승';
    default: return '단판';
  }
}

// 배틀 턴 (한 턴의 결과)
export interface BattleTurn {
  turnNumber: number;
  playerPower: number;      // 플레이어 최종 전투력
  opponentPower: number;    // 상대 최종 전투력
  winner: 'player' | 'opponent';
  criticalHit?: boolean;    // 크리티컬 여부
  arenaBonus?: {
    player: number;         // 경기장 보너스/페널티
    opponent: number;
  };
}

// 세트 결과 (5판 3선승 기준 한 세트)
export interface SetResult {
  setNumber: number;
  turns: BattleTurn[];
  playerWins: number;       // 플레이어가 이긴 턴 수
  opponentWins: number;     // 상대가 이긴 턴 수
  winner: 'player' | 'opponent';
}

// 개인전 경기 결과
export interface IndividualMatchResult {
  matchId: string;
  playerCardId: string;
  opponentId: string;
  arena: ArenaEffect;
  sets: SetResult[];
  playerSetWins: number;    // 플레이어가 이긴 세트 수
  opponentSetWins: number;  // 상대가 이긴 세트 수
  winner: 'player' | 'opponent';
  mvpTurn?: BattleTurn;     // 가장 인상적인 턴
}

// 배틀 상태 (진행 중인 배틀)
export interface BattleState {
  isActive: boolean;
  matchId: string | null;
  playerCardId: string | null;
  opponentId: string | null;
  arena: ArenaEffect | null;
  format: LeagueMatchFormat;  // 경기 포맷 (1WIN, 2WIN, 3WIN)
  requiredWins: number;       // 승리에 필요한 세트 수
  currentSet: number;         // 현재 세트 (1-based)
  currentTurn: number;        // 현재 턴 (1-based)
  sets: SetResult[];          // 완료된 세트들
  currentSetTurns: BattleTurn[]; // 현재 세트의 턴들
  playerSetWins: number;
  opponentSetWins: number;
  phase: 'READY' | 'BATTLING' | 'SET_END' | 'MATCH_END';
}

// 배틀 통계 (UI 표시용)
export interface BattleStats {
  playerCard: {
    id: string;
    name: string;
    basePower: number;
    attribute: Attribute;
    arenaBonusPercent: number;  // 경기장 효과로 인한 보너스/페널티
  };
  opponentCard: {
    id: string;
    name: string;
    basePower: number;
    attribute: Attribute;
    arenaBonusPercent: number;
  };
  arena: ArenaEffect;
  setScore: {
    player: number;
    opponent: number;
  };
  turnScore: {
    player: number;
    opponent: number;
  };
}

// 초기 배틀 상태
export const initialBattleState: BattleState = {
  isActive: false,
  matchId: null,
  playerCardId: null,
  opponentId: null,
  arena: null,
  format: '1WIN',
  requiredWins: 1,
  currentSet: 0,
  currentTurn: 0,
  sets: [],
  currentSetTurns: [],
  playerSetWins: 0,
  opponentSetWins: 0,
  phase: 'READY',
};
