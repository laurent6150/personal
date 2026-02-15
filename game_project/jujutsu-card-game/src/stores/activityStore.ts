// ========================================
// 활동 시스템 스토어 (Phase 5)
// 경기 사이 카드 활동 관리 (훈련, 휴식, 스카우트 등)
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActivityType, Stats } from '../types';
import { ACTIVITY_OPTIONS } from '../types';
import {
  AP_PER_MATCH,
  AP_WIN,
  AP_LOSE,
  AP_DRAW,
  AP_HALF_TRANSITION_BONUS,
  MAX_AP,
} from '../data/constants';

// ========================================
// 타입 정의
// ========================================

// 카드별 임시 효과
export interface CardActivityEffect {
  cardId: string;
  type: ActivityType;
  appliedSeason: number;
  appliedMatch: number;     // 적용된 경기 번호
  expiresAfterMatch: number; // 효과 만료 경기 번호
  tempStatBonus?: Partial<Stats>;  // 임시 스탯 보너스
  conditionBonus?: number;         // 컨디션 보너스
  expBonus?: number;               // 경험치 보너스
}

// 스카우트 정보
export interface ScoutInfo {
  season: number;
  targetCrewId: string;
  targetCrewName: string;
  cardIds: string[];      // 상대 크루의 카드 ID 목록
  revealedAt: number;     // 정보 획득 시점 (timestamp)
}

// 활동 기록
export interface ActivityLog {
  id: string;
  season: number;
  match: number;
  type: ActivityType;
  cardId?: string;        // 대상 카드 (해당되는 경우)
  apCost: number;
  cpCost: number;
  timestamp: number;
}

// ========================================
// 스토어 인터페이스
// ========================================

interface ActivityState {
  // 상태
  currentAP: number;                          // 현재 활동 포인트
  maxAP: number;                              // 최대 활동 포인트
  activeEffects: CardActivityEffect[];        // 현재 활성 효과들
  scoutInfo: ScoutInfo | null;                // 스카우트 정보
  activityLog: ActivityLog[];                 // 활동 기록

  // AP 관리
  addAP: (amount: number) => void;
  useAP: (amount: number) => boolean;
  resetAP: () => void;

  // 경기 후 AP 지급 (승패별 차등)
  grantMatchAP: (result?: 'WIN' | 'LOSE' | 'DRAW') => void;

  // 전환기 AP 보너스
  grantHalfTransitionAP: () => void;

  // 활동 수행
  performActivity: (
    type: ActivityType,
    cardId: string | null,
    season: number,
    currentMatch: number,
    spendCP: (amount: number, reason: string, description: string, season: number) => boolean
  ) => { success: boolean; message: string; cpEarned?: number };

  // 카드 활동 효과 조회
  getCardEffects: (cardId: string) => CardActivityEffect[];

  // 카드 임시 스탯 보너스 계산
  getCardTempStatBonus: (cardId: string, currentMatch: number) => Partial<Stats>;

  // 카드 컨디션 보너스 계산
  getCardConditionBonus: (cardId: string, currentMatch: number) => number;

  // 카드 경험치 보너스 계산
  getCardExpBonus: (cardId: string, currentMatch: number) => number;

  // 스카우트 정보 설정
  setScoutInfo: (info: ScoutInfo) => void;

  // 스카우트 정보 조회
  getScoutInfo: () => ScoutInfo | null;

  // 스카우트 정보 초기화
  clearScoutInfo: () => void;

  // 효과 만료 처리
  processMatchEnd: (currentMatch: number) => void;

  // 시즌 종료 처리
  processSeasonEnd: () => void;

  // 초기화
  reset: () => void;
}

// 초기 상태
const initialState = {
  currentAP: 0,
  maxAP: MAX_AP,
  activeEffects: [],
  scoutInfo: null,
  activityLog: [],
};

// ========================================
// 스토어 구현
// ========================================

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // AP 추가
      addAP: (amount: number) => {
        const { currentAP, maxAP } = get();
        const newAP = Math.min(currentAP + amount, maxAP);
        set({ currentAP: newAP });
        console.log(`[Activity] AP +${amount}. 현재: ${newAP}/${maxAP}`);
      },

      // AP 사용
      useAP: (amount: number) => {
        const { currentAP } = get();
        if (currentAP < amount) {
          console.warn(`[Activity] AP 부족! 필요: ${amount}, 보유: ${currentAP}`);
          return false;
        }
        set({ currentAP: currentAP - amount });
        console.log(`[Activity] AP -${amount}. 남은 AP: ${currentAP - amount}`);
        return true;
      },

      // AP 초기화
      resetAP: () => {
        set({ currentAP: 0 });
        console.log('[Activity] AP 초기화');
      },

      // 경기 후 AP 지급 (승패별 차등)
      grantMatchAP: (result?: 'WIN' | 'LOSE' | 'DRAW') => {
        const { addAP } = get();
        let apAmount: number;

        switch (result) {
          case 'WIN':
            apAmount = AP_WIN;
            break;
          case 'LOSE':
            apAmount = AP_LOSE;
            break;
          case 'DRAW':
            apAmount = AP_DRAW;
            break;
          default:
            apAmount = AP_PER_MATCH; // 레거시 호환
        }

        addAP(apAmount);
        console.log(`[Activity] 경기 결과: ${result || '미지정'}, AP +${apAmount}`);
      },

      // 전환기 AP 보너스
      grantHalfTransitionAP: () => {
        const { addAP } = get();
        addAP(AP_HALF_TRANSITION_BONUS);
        console.log(`[Activity] 전환기 AP 보너스 +${AP_HALF_TRANSITION_BONUS}`);
      },

      // 활동 수행
      performActivity: (
        type: ActivityType,
        cardId: string | null,
        season: number,
        currentMatch: number,
        spendCP: (amount: number, reason: string, description: string, season: number) => boolean
      ) => {
        const { currentAP, useAP, activeEffects, activityLog } = get();

        // 활동 옵션 찾기
        const option = ACTIVITY_OPTIONS.find(opt => opt.type === type);
        if (!option) {
          return { success: false, message: '유효하지 않은 활동입니다.' };
        }

        // AP 확인
        if (currentAP < option.apCost) {
          return { success: false, message: `AP가 부족합니다. (필요: ${option.apCost}, 보유: ${currentAP})` };
        }

        // CP 지출 (필요한 경우)
        if (option.cpCost > 0) {
          const cpReasonMap: Record<ActivityType, string> = {
            TRAIN: 'TRAINING_COST',
            REST: 'OTHER',
            SCOUT: 'SCOUT_COST',
            PRACTICE: 'PRACTICE_COST',
            FAN_MEETING: 'FAN_MEETING_COST',
          };
          const cpReason = cpReasonMap[type];
          const success = spendCP(option.cpCost, cpReason, `${option.label} 활동`, season);
          if (!success) {
            return { success: false, message: 'CP가 부족합니다.' };
          }
        }

        // AP 사용
        useAP(option.apCost);

        // 활동별 효과 처리
        let newEffect: CardActivityEffect | null = null;
        let cpEarned: number | undefined;

        switch (type) {
          case 'TRAIN':
            // 훈련: 임시 스탯 +2 (1경기)
            if (cardId) {
              newEffect = {
                cardId,
                type: 'TRAIN',
                appliedSeason: season,
                appliedMatch: currentMatch,
                expiresAfterMatch: currentMatch + 1,
                tempStatBonus: { atk: 2, def: 2, spd: 2 },
              };
            }
            break;

          case 'REST':
            // 휴식: 컨디션 +15
            if (cardId) {
              newEffect = {
                cardId,
                type: 'REST',
                appliedSeason: season,
                appliedMatch: currentMatch,
                expiresAfterMatch: currentMatch,  // 즉시 적용, 1회성
                conditionBonus: 15,
              };
            }
            break;

          case 'SCOUT':
            // 스카우트: 다음 상대 정보 (별도 처리 필요 - setScoutInfo 호출)
            // 여기서는 성공 반환만
            break;

          case 'PRACTICE':
            // 연습경기: 경험치 +20
            if (cardId) {
              newEffect = {
                cardId,
                type: 'PRACTICE',
                appliedSeason: season,
                appliedMatch: currentMatch,
                expiresAfterMatch: currentMatch,  // 즉시 적용, 1회성
                expBonus: 20,
              };
            }
            break;

          case 'FAN_MEETING':
            // 팬미팅: CP +300 획득
            cpEarned = 300;
            break;
        }

        // 효과 추가
        if (newEffect) {
          set({ activeEffects: [...activeEffects, newEffect] });
        }

        // 활동 로그 기록
        const logEntry: ActivityLog = {
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          season,
          match: currentMatch,
          type,
          cardId: cardId || undefined,
          apCost: option.apCost,
          cpCost: option.cpCost,
          timestamp: Date.now(),
        };
        set({ activityLog: [...activityLog, logEntry].slice(-100) });

        console.log(`[Activity] ${option.label} 활동 완료. 카드: ${cardId || '없음'}`);

        return {
          success: true,
          message: `${option.label} 활동을 수행했습니다!`,
          cpEarned,
        };
      },

      // 카드 활동 효과 조회
      getCardEffects: (cardId: string) => {
        return get().activeEffects.filter(e => e.cardId === cardId);
      },

      // 카드 임시 스탯 보너스 계산
      getCardTempStatBonus: (cardId: string, currentMatch: number) => {
        const effects = get().activeEffects.filter(
          e => e.cardId === cardId &&
               e.expiresAfterMatch > currentMatch &&
               e.tempStatBonus
        );

        const bonus: Partial<Stats> = {};
        for (const effect of effects) {
          if (effect.tempStatBonus) {
            for (const [stat, value] of Object.entries(effect.tempStatBonus)) {
              const key = stat as keyof Stats;
              bonus[key] = (bonus[key] || 0) + value;
            }
          }
        }
        return bonus;
      },

      // 카드 컨디션 보너스 계산
      getCardConditionBonus: (cardId: string, currentMatch: number) => {
        const effects = get().activeEffects.filter(
          e => e.cardId === cardId &&
               e.appliedMatch === currentMatch &&
               e.conditionBonus
        );

        return effects.reduce((sum, e) => sum + (e.conditionBonus || 0), 0);
      },

      // 카드 경험치 보너스 계산
      getCardExpBonus: (cardId: string, currentMatch: number) => {
        const effects = get().activeEffects.filter(
          e => e.cardId === cardId &&
               e.appliedMatch === currentMatch &&
               e.expBonus
        );

        return effects.reduce((sum, e) => sum + (e.expBonus || 0), 0);
      },

      // 스카우트 정보 설정
      setScoutInfo: (info: ScoutInfo) => {
        set({ scoutInfo: info });
        console.log(`[Activity] 스카우트 정보 획득: ${info.targetCrewName}`);
      },

      // 스카우트 정보 조회
      getScoutInfo: () => {
        return get().scoutInfo;
      },

      // 스카우트 정보 초기화
      clearScoutInfo: () => {
        set({ scoutInfo: null });
      },

      // 효과 만료 처리
      processMatchEnd: (currentMatch: number) => {
        const { activeEffects } = get();
        const remainingEffects = activeEffects.filter(
          e => e.expiresAfterMatch > currentMatch
        );
        set({ activeEffects: remainingEffects });
        console.log(`[Activity] 경기 종료 효과 정리. 남은 효과: ${remainingEffects.length}개`);
      },

      // 시즌 종료 처리
      processSeasonEnd: () => {
        set({
          currentAP: 0,
          activeEffects: [],
          scoutInfo: null,
        });
        console.log('[Activity] 시즌 종료 처리 완료');
      },

      // 초기화
      reset: () => {
        set(initialState);
        console.log('[Activity] 스토어 초기화 완료');
      },
    }),
    {
      name: 'jjk-activity',
      version: 1,
    }
  )
);

// ========================================
// 유틸리티 함수
// ========================================

// 활동 가능 여부 체크
export function canPerformActivity(
  type: ActivityType,
  currentAP: number,
  currentCP: number
): { canDo: boolean; reason?: string } {
  const option = ACTIVITY_OPTIONS.find(opt => opt.type === type);
  if (!option) {
    return { canDo: false, reason: '유효하지 않은 활동입니다.' };
  }

  if (currentAP < option.apCost) {
    return { canDo: false, reason: `AP 부족 (필요: ${option.apCost})` };
  }

  if (currentCP < option.cpCost) {
    return { canDo: false, reason: `CP 부족 (필요: ${option.cpCost})` };
  }

  return { canDo: true };
}

// 활동 옵션 목록 가져오기 (현재 상태 기반)
export function getAvailableActivities(
  currentAP: number,
  currentCP: number
): Array<{ option: typeof ACTIVITY_OPTIONS[0]; available: boolean; reason?: string }> {
  return ACTIVITY_OPTIONS.map(option => {
    const check = canPerformActivity(option.type, currentAP, currentCP);
    return {
      option,
      available: check.canDo,
      reason: check.reason,
    };
  });
}
