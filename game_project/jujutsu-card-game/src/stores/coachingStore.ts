// ========================================
// 코칭 시스템 스토어 (Phase 5)
// 개인 리그: 카드별 전략 설정
// 팀 리그: 크루 방침 (seasonStore에서 관리)
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoachingStrategy, Stats } from '../types';
import { COACHING_EFFECTS } from '../types';

// ========================================
// 타입 정의
// ========================================

// 카드별 코칭 설정
export interface CardCoachingConfig {
  cardId: string;
  strategy: CoachingStrategy;
  setAtSeason: number;        // 설정된 시즌 (전략 변경 시점 추적용)
  setAtMatch?: number;        // 설정된 경기 번호 (개인 리그에서 라운드마다 변경 가능)
}

// 코칭 효과 계산 결과
export interface CoachingEffectResult {
  modifiedStats: Partial<Stats>;
  gaugeStart: number;         // 궁극기 시작 게이지 (0~100)
  hpModifier: number;         // HP 배율 (0.85~1.0)
  description: string;
}

// ========================================
// 스토어 인터페이스
// ========================================

interface CoachingState {
  // 카드별 코칭 전략 (개인 리그용)
  cardStrategies: Record<string, CardCoachingConfig>;

  // 기본 전략 (설정 안 한 경우)
  defaultStrategy: CoachingStrategy;

  // 액션
  setCardStrategy: (cardId: string, strategy: CoachingStrategy, season: number, match?: number) => void;
  getCardStrategy: (cardId: string) => CoachingStrategy;
  getCardCoachingConfig: (cardId: string) => CardCoachingConfig | null;

  // 코칭 효과 계산
  calculateCoachingEffect: (cardId: string) => CoachingEffectResult;

  // 스탯에 코칭 효과 적용
  applyCoachingToStats: (cardId: string, baseStats: Stats) => Stats;

  // HP에 코칭 효과 적용
  getHpModifier: (cardId: string) => number;

  // 궁극기 시작 게이지 (전략에 따라)
  getGaugeStart: (cardId: string) => number;

  // 모든 전략 초기화
  resetAllStrategies: () => void;

  // 시즌 종료 처리
  processSeasonEnd: () => void;
}

// 초기 상태
const initialState = {
  cardStrategies: {},
  defaultStrategy: 'BALANCED' as CoachingStrategy,
};

// ========================================
// 스토어 구현
// ========================================

export const useCoachingStore = create<CoachingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 카드 전략 설정
      setCardStrategy: (cardId: string, strategy: CoachingStrategy, season: number, match?: number) => {
        const { cardStrategies } = get();

        const config: CardCoachingConfig = {
          cardId,
          strategy,
          setAtSeason: season,
          setAtMatch: match,
        };

        set({
          cardStrategies: {
            ...cardStrategies,
            [cardId]: config,
          },
        });

        const effectInfo = COACHING_EFFECTS[strategy];
        console.log(`[Coaching] ${cardId} 전략 설정: ${effectInfo.label} (${effectInfo.icon})`);
      },

      // 카드 전략 조회
      getCardStrategy: (cardId: string) => {
        const { cardStrategies, defaultStrategy } = get();
        return cardStrategies[cardId]?.strategy || defaultStrategy;
      },

      // 카드 코칭 설정 전체 조회
      getCardCoachingConfig: (cardId: string) => {
        const { cardStrategies } = get();
        return cardStrategies[cardId] || null;
      },

      // 코칭 효과 계산
      calculateCoachingEffect: (cardId: string) => {
        const strategy = get().getCardStrategy(cardId);
        const effect = COACHING_EFFECTS[strategy];

        const modifiedStats: Partial<Stats> = {};
        let gaugeStart = 0;
        let hpModifier = 1.0;

        // 스탯 수정자 적용
        const { statMods } = effect;

        if (statMods.atk !== undefined) {
          modifiedStats.atk = statMods.atk;  // 배율로 저장
        }
        if (statMods.def !== undefined) {
          modifiedStats.def = statMods.def;
        }
        if (statMods.spd !== undefined) {
          modifiedStats.spd = statMods.spd;
        }
        if (statMods.ce !== undefined) {
          modifiedStats.ce = statMods.ce;
        }
        if (statMods.gaugeStart !== undefined) {
          gaugeStart = statMods.gaugeStart;
        }
        if (statMods.hpMod !== undefined) {
          hpModifier = statMods.hpMod;
        }

        return {
          modifiedStats,
          gaugeStart,
          hpModifier,
          description: `${effect.icon} ${effect.label}`,
        };
      },

      // 스탯에 코칭 효과 적용
      applyCoachingToStats: (cardId: string, baseStats: Stats) => {
        const effect = get().calculateCoachingEffect(cardId);
        const { modifiedStats } = effect;

        return {
          atk: Math.floor(baseStats.atk * (modifiedStats.atk || 1)),
          def: Math.floor(baseStats.def * (modifiedStats.def || 1)),
          spd: Math.floor(baseStats.spd * (modifiedStats.spd || 1)),
          ce: Math.floor(baseStats.ce * (modifiedStats.ce || 1)),
          hp: baseStats.hp,  // HP는 별도 처리 (hpModifier)
          crt: baseStats.crt,
          tec: baseStats.tec,
          mnt: baseStats.mnt,
        };
      },

      // HP 배율 조회
      getHpModifier: (cardId: string) => {
        const effect = get().calculateCoachingEffect(cardId);
        return effect.hpModifier;
      },

      // 궁극기 시작 게이지 조회
      getGaugeStart: (cardId: string) => {
        const effect = get().calculateCoachingEffect(cardId);
        return effect.gaugeStart;
      },

      // 모든 전략 초기화
      resetAllStrategies: () => {
        set({ cardStrategies: {} });
        console.log('[Coaching] 모든 전략 초기화');
      },

      // 시즌 종료 처리
      processSeasonEnd: () => {
        // 시즌 종료 시 전략 유지 (다음 시즌까지 유효)
        // 필요 시 여기서 리셋 가능
        console.log('[Coaching] 시즌 종료 처리 - 전략 유지');
      },
    }),
    {
      name: 'jjk-coaching',
      version: 1,
    }
  )
);

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 전략 설명 가져오기
 */
export function getStrategyDescription(strategy: CoachingStrategy): string {
  const effect = COACHING_EFFECTS[strategy];
  const { statMods } = effect;

  const parts: string[] = [];

  if (statMods.atk !== undefined && statMods.atk !== 1) {
    const percent = Math.round((statMods.atk - 1) * 100);
    parts.push(`ATK ${percent > 0 ? '+' : ''}${percent}%`);
  }
  if (statMods.def !== undefined && statMods.def !== 1) {
    const percent = Math.round((statMods.def - 1) * 100);
    parts.push(`DEF ${percent > 0 ? '+' : ''}${percent}%`);
  }
  if (statMods.spd !== undefined && statMods.spd !== 1) {
    const percent = Math.round((statMods.spd - 1) * 100);
    parts.push(`SPD ${percent > 0 ? '+' : ''}${percent}%`);
  }
  if (statMods.ce !== undefined && statMods.ce !== 1) {
    const percent = Math.round((statMods.ce - 1) * 100);
    parts.push(`CE ${percent > 0 ? '+' : ''}${percent}%`);
  }
  if (statMods.gaugeStart !== undefined && statMods.gaugeStart > 0) {
    parts.push(`궁극기 시작 ${statMods.gaugeStart}%`);
  }
  if (statMods.hpMod !== undefined && statMods.hpMod !== 1) {
    const percent = Math.round((statMods.hpMod - 1) * 100);
    parts.push(`HP ${percent > 0 ? '+' : ''}${percent}%`);
  }

  return parts.join(', ') || '변화 없음';
}

/**
 * 전략별 정보 목록
 */
export function getAllStrategies(): Array<{
  strategy: CoachingStrategy;
  label: string;
  icon: string;
  description: string;
}> {
  return (Object.keys(COACHING_EFFECTS) as CoachingStrategy[]).map(strategy => ({
    strategy,
    label: COACHING_EFFECTS[strategy].label,
    icon: COACHING_EFFECTS[strategy].icon,
    description: getStrategyDescription(strategy),
  }));
}

/**
 * 추천 전략 가져오기 (상대 정보 기반)
 */
export function getRecommendedStrategy(
  myStats: Stats,
  opponentStats?: Stats
): CoachingStrategy {
  if (!opponentStats) {
    return 'BALANCED';
  }

  // 상대보다 ATK가 낮으면 공격적 전략
  if (myStats.atk < opponentStats.atk * 0.9) {
    return 'AGGRESSIVE';
  }

  // 상대보다 DEF가 낮으면 수비적 전략
  if (myStats.def < opponentStats.def * 0.9) {
    return 'DEFENSIVE';
  }

  // 상대보다 SPD가 낮으면 속공 전략
  if (myStats.spd < opponentStats.spd * 0.9) {
    return 'SPEED_RUSH';
  }

  // 상대 HP가 높으면 필살기 집중
  if (opponentStats.hp > myStats.hp * 1.2) {
    return 'ULTIMATE_FOCUS';
  }

  return 'BALANCED';
}
