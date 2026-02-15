// ========================================
// 경제 시스템 스토어 (Phase 5)
// CP(크루 포인트) 관리, 인벤토리, 거래 로그
// Phase 5.3: 소프트캡 페널티 시스템 추가
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SOFT_SALARY_CAP,
  SOFT_CAP_REWARD_PENALTY,
  LUXURY_TAX_BRACKETS
} from '../data/constants';

// ========================================
// CP 수입 테이블
// ========================================

export const CP_INCOME = {
  SEASON_BASE: 10000,          // 시즌 기본 예산
  RANK_BONUS: {
    1: 5000,                   // 1위 순위 보너스
    2: 3000,                   // 2위
    3: 2000,                   // 3위
    4: 1000,                   // 4위
    5: 500,                    // 5위
    6: 300,                    // 6위
    7: 200,                    // 7위
    8: 100,                    // 8위
  } as Record<number, number>,
  TEAM_CHAMPIONSHIP: 8000,     // 팀 리그 우승
  INDIVIDUAL_CHAMPIONSHIP: 3000, // 개인 리그 우승
  MATCH_WIN: 200,              // 경기 승리
  MATCH_LOSE: 50,              // 경기 패배
  MATCH_DRAW: 100,             // 무승부
  SPECTATE_BONUS: 50,          // 관전 보상
};

// ========================================
// 타입 정의
// ========================================

export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionReason =
  // 수입
  | 'SEASON_BUDGET'
  | 'RANK_BONUS'
  | 'MATCH_WIN'
  | 'MATCH_LOSE'
  | 'MATCH_DRAW'
  | 'TEAM_CHAMPIONSHIP'
  | 'INDIVIDUAL_CHAMPIONSHIP'
  | 'SPECTATE'
  | 'RETIREMENT_REWARD'
  | 'ITEM_SALE'
  | 'TRADE_CP_RECEIVED'
  // 지출
  | 'ITEM_PURCHASE'
  | 'TRAINING_COST'
  | 'SCOUT_COST'
  | 'PRACTICE_COST'
  | 'FAN_MEETING_COST'
  | 'TRADE_CP_SENT'
  | 'SALARY_PAYMENT'
  | 'LUXURY_TAX'           // Phase 5.3: 럭셔리 택스
  | 'SOFT_CAP_PENALTY'     // Phase 5.3: 소프트캡 페널티
  | 'OTHER';

export interface Transaction {
  id: string;
  timestamp: number;
  season: number;
  type: TransactionType;
  amount: number;
  reason: TransactionReason;
  description: string;
  balance: number;         // 거래 후 잔액
}

export interface SeasonIncome {
  season: number;
  baseBudget: number;
  rankBonus: number;
  winBonus: number;
  championBonus: number;
  otherIncome: number;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
}

// ========================================
// 스토어 인터페이스
// ========================================

interface EconomyState {
  // 상태
  cp: number;                              // 현재 보유 CP
  totalEarned: number;                     // 누적 획득
  totalSpent: number;                      // 누적 지출
  seasonIncome: SeasonIncome[];            // 시즌별 수입 내역
  transactionLog: Transaction[];           // 거래 로그
  inventory: string[];                     // 보유 아이템 ID 목록

  // 수입 액션
  earnCP: (amount: number, reason: TransactionReason, description: string, season: number) => void;

  // 지출 액션
  spendCP: (amount: number, reason: TransactionReason, description: string, season: number) => boolean;

  // 시즌 예산 지급
  grantSeasonBudget: (seasonNumber: number, previousRank: number) => void;

  // 잔액 확인
  canAfford: (amount: number) => boolean;

  // 인벤토리 관리
  buyItem: (itemId: string, price: number, season: number) => boolean;
  sellItem: (itemId: string, price: number, season: number) => void;
  hasItem: (itemId: string) => boolean;

  // 시즌 수입 요약
  getSeasonIncome: (season: number) => SeasonIncome | undefined;

  // 거래 로그 조회
  getTransactionLog: (season?: number) => Transaction[];

  // 초기화
  reset: () => void;
}

// 초기 상태
const initialState = {
  cp: 10000,                 // 초기 CP (첫 시작 보너스)
  totalEarned: 10000,
  totalSpent: 0,
  seasonIncome: [],
  transactionLog: [],
  inventory: [],
};

// ========================================
// 스토어 구현
// ========================================

export const useEconomyStore = create<EconomyState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // CP 획득
      earnCP: (amount: number, reason: TransactionReason, description: string, season: number) => {
        const { cp, totalEarned, transactionLog } = get();

        const newBalance = cp + amount;
        const transaction: Transaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          season,
          type: 'INCOME',
          amount,
          reason,
          description,
          balance: newBalance,
        };

        set({
          cp: newBalance,
          totalEarned: totalEarned + amount,
          transactionLog: [transaction, ...transactionLog].slice(0, 500), // 최대 500개 로그 유지
        });

        console.log(`[Economy] +${amount} CP (${reason}): ${description}. 잔액: ${newBalance}`);
      },

      // CP 지출
      spendCP: (amount: number, reason: TransactionReason, description: string, season: number) => {
        const { cp, totalSpent, transactionLog, canAfford } = get();

        if (!canAfford(amount)) {
          console.warn(`[Economy] CP 부족! 필요: ${amount}, 보유: ${cp}`);
          return false;
        }

        const newBalance = cp - amount;
        const transaction: Transaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          season,
          type: 'EXPENSE',
          amount,
          reason,
          description,
          balance: newBalance,
        };

        set({
          cp: newBalance,
          totalSpent: totalSpent + amount,
          transactionLog: [transaction, ...transactionLog].slice(0, 500),
        });

        console.log(`[Economy] -${amount} CP (${reason}): ${description}. 잔액: ${newBalance}`);
        return true;
      },

      // 시즌 예산 지급
      grantSeasonBudget: (seasonNumber: number, previousRank: number) => {
        const { earnCP, seasonIncome } = get();

        // 기본 예산
        const baseBudget = CP_INCOME.SEASON_BASE;
        earnCP(baseBudget, 'SEASON_BUDGET', `시즌 ${seasonNumber} 기본 예산`, seasonNumber);

        // 순위 보너스 (이전 시즌 순위 기반)
        const rankBonus = CP_INCOME.RANK_BONUS[previousRank] || 0;
        if (rankBonus > 0) {
          earnCP(rankBonus, 'RANK_BONUS', `이전 시즌 ${previousRank}위 보너스`, seasonNumber);
        }

        // 시즌 수입 기록 초기화
        const newSeasonIncome: SeasonIncome = {
          season: seasonNumber,
          baseBudget,
          rankBonus,
          winBonus: 0,
          championBonus: 0,
          otherIncome: 0,
          totalIncome: baseBudget + rankBonus,
          totalExpense: 0,
          netIncome: baseBudget + rankBonus,
        };

        set({
          seasonIncome: [...seasonIncome, newSeasonIncome],
        });

        console.log(`[Economy] 시즌 ${seasonNumber} 예산 지급 완료. 기본: ${baseBudget}, 순위보너스: ${rankBonus}`);
      },

      // 잔액 확인
      canAfford: (amount: number) => {
        return get().cp >= amount;
      },

      // 아이템 구매
      buyItem: (itemId: string, price: number, season: number) => {
        const { spendCP, inventory, hasItem } = get();

        if (hasItem(itemId)) {
          console.warn(`[Economy] 이미 보유한 아이템: ${itemId}`);
          return false;
        }

        const success = spendCP(price, 'ITEM_PURCHASE', `아이템 구매: ${itemId}`, season);
        if (success) {
          set({ inventory: [...inventory, itemId] });
          console.log(`[Economy] 아이템 구매 완료: ${itemId}`);
        }
        return success;
      },

      // 아이템 판매
      sellItem: (itemId: string, price: number, season: number) => {
        const { earnCP, inventory } = get();

        if (!inventory.includes(itemId)) {
          console.warn(`[Economy] 보유하지 않은 아이템: ${itemId}`);
          return;
        }

        earnCP(price, 'ITEM_SALE', `아이템 판매: ${itemId}`, season);
        set({ inventory: inventory.filter(id => id !== itemId) });
        console.log(`[Economy] 아이템 판매 완료: ${itemId}`);
      },

      // 아이템 보유 확인
      hasItem: (itemId: string) => {
        return get().inventory.includes(itemId);
      },

      // 시즌 수입 조회
      getSeasonIncome: (season: number) => {
        return get().seasonIncome.find(s => s.season === season);
      },

      // 거래 로그 조회
      getTransactionLog: (season?: number) => {
        const { transactionLog } = get();
        if (season === undefined) return transactionLog;
        return transactionLog.filter(t => t.season === season);
      },

      // 초기화
      reset: () => {
        set(initialState);
        console.log('[Economy] 스토어 초기화 완료');
      },
    }),
    {
      name: 'jjk-economy',
      version: 1,
    }
  )
);

// ========================================
// 유틸리티 함수
// ========================================

// 경기 결과에 따른 CP 지급
export function getMatchRewardCP(result: 'WIN' | 'LOSE' | 'DRAW'): number {
  switch (result) {
    case 'WIN': return CP_INCOME.MATCH_WIN;
    case 'LOSE': return CP_INCOME.MATCH_LOSE;
    case 'DRAW': return CP_INCOME.MATCH_DRAW;
  }
}

// 순위에 따른 보너스 CP 계산
export function getRankBonusCP(rank: number): number {
  return CP_INCOME.RANK_BONUS[rank] || 0;
}

// ========================================
// Phase 5.3: 소프트캡 페널티 시스템
// ========================================

/**
 * 소프트캡 초과 여부 확인
 * @param totalCrewSalary 현재 크루 총 연봉
 * @returns 초과 여부와 초과 금액
 */
export function checkSoftCapStatus(totalCrewSalary: number): {
  isOver: boolean;
  overAmount: number;
  penaltyRate: number;
} {
  const overAmount = Math.max(0, totalCrewSalary - SOFT_SALARY_CAP);
  const isOver = overAmount > 0;

  // 구간별 페널티율 계산
  let penaltyRate = 0;
  if (isOver) {
    for (const bracket of LUXURY_TAX_BRACKETS) {
      if (overAmount > bracket.threshold) {
        penaltyRate = bracket.rate;
      }
    }
  }

  return { isOver, overAmount, penaltyRate };
}

/**
 * 럭셔리 택스 계산
 * 소프트캡 초과분에 대해 시즌 종료 시 추가 비용 부과
 * @param totalCrewSalary 현재 크루 총 연봉
 * @returns 지불해야 할 럭셔리 택스
 */
export function calculateLuxuryTax(totalCrewSalary: number): number {
  const { isOver, overAmount, penaltyRate } = checkSoftCapStatus(totalCrewSalary);

  if (!isOver) return 0;

  return Math.floor(overAmount * penaltyRate);
}

/**
 * 소프트캡 초과 시 경기 보상 감소율 적용
 * @param baseReward 기본 보상
 * @param totalCrewSalary 현재 크루 총 연봉
 * @returns 페널티 적용된 보상
 */
export function applyRewardPenalty(baseReward: number, totalCrewSalary: number): {
  finalReward: number;
  penaltyApplied: number;
  isPenalized: boolean;
} {
  const { isOver } = checkSoftCapStatus(totalCrewSalary);

  if (!isOver) {
    return {
      finalReward: baseReward,
      penaltyApplied: 0,
      isPenalized: false
    };
  }

  const penaltyAmount = Math.floor(baseReward * SOFT_CAP_REWARD_PENALTY);
  const finalReward = baseReward - penaltyAmount;

  return {
    finalReward,
    penaltyApplied: penaltyAmount,
    isPenalized: true
  };
}

/**
 * 경기 결과에 따른 CP 지급 (소프트캡 페널티 적용)
 * @param result 경기 결과
 * @param totalCrewSalary 현재 크루 총 연봉
 * @returns 페널티 적용된 보상 정보
 */
export function getMatchRewardWithPenalty(
  result: 'WIN' | 'LOSE' | 'DRAW',
  totalCrewSalary: number
): {
  baseReward: number;
  finalReward: number;
  penaltyApplied: number;
  isPenalized: boolean;
} {
  const baseReward = getMatchRewardCP(result);
  const penaltyResult = applyRewardPenalty(baseReward, totalCrewSalary);

  return {
    baseReward,
    ...penaltyResult
  };
}
