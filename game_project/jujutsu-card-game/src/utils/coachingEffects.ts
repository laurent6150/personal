// ========================================
// 코칭 효과 유틸리티 (Phase 5)
// 코칭 시스템의 효과를 전투에 적용
// ========================================

import type { Stats, CrewPolicy, CoachingStrategy } from '../types';
import { CREW_POLICY_EFFECTS, COACHING_EFFECTS } from '../types';
import { useCoachingStore } from '../stores/coachingStore';
import { useSeasonStore } from '../stores/seasonStore';

// ========================================
// 팀 리그: 크루 방침 적용
// ========================================

/**
 * 크루 방침 효과 가져오기
 */
export function getCrewPolicyEffect(policy: CrewPolicy): {
  atkMod: number;
  defMod: number;
  label: string;
  icon: string;
} {
  return CREW_POLICY_EFFECTS[policy];
}

/**
 * 현재 크루 방침 조회
 */
export function getCurrentCrewPolicy(): CrewPolicy {
  return useSeasonStore.getState().getCrewPolicy();
}

/**
 * 크루 방침을 스탯에 적용
 */
export function applyCrewPolicyToStats(baseStats: Stats, policy?: CrewPolicy): Stats {
  const currentPolicy = policy || getCurrentCrewPolicy();
  const effect = CREW_POLICY_EFFECTS[currentPolicy];

  return {
    ...baseStats,
    atk: Math.floor(baseStats.atk * effect.atkMod),
    def: Math.floor(baseStats.def * effect.defMod),
  };
}

// ========================================
// 개인 리그: 카드별 코칭 전략 적용
// ========================================

/**
 * 카드 코칭 전략 효과 가져오기
 */
export function getCoachingStrategyEffect(strategy: CoachingStrategy): {
  label: string;
  icon: string;
  statMods: Partial<Record<keyof Stats | 'gaugeStart' | 'hpMod', number>>;
} {
  return COACHING_EFFECTS[strategy];
}

/**
 * 카드의 현재 코칭 전략 조회
 */
export function getCardCoachingStrategy(cardId: string): CoachingStrategy {
  return useCoachingStore.getState().getCardStrategy(cardId);
}

/**
 * 카드에 코칭 전략 적용
 */
export function applyCoachingStrategyToStats(
  baseStats: Stats,
  cardId: string,
  _strategy?: CoachingStrategy
): Stats {
  return useCoachingStore.getState().applyCoachingToStats(cardId, baseStats);
}

/**
 * 카드의 코칭 전략에 따른 HP 배율 가져오기
 */
export function getCoachingHpModifier(cardId: string): number {
  return useCoachingStore.getState().getHpModifier(cardId);
}

/**
 * 카드의 코칭 전략에 따른 궁극기 시작 게이지 가져오기
 */
export function getCoachingGaugeStart(cardId: string): number {
  return useCoachingStore.getState().getGaugeStart(cardId);
}

// ========================================
// 통합 스탯 계산 (팀 리그 / 개인 리그)
// ========================================

export interface BattleStatsContext {
  isTeamLeague: boolean;      // 팀 리그 여부 (false면 개인 리그)
  cardId: string;
  baseStats: Stats;
  crewPolicy?: CrewPolicy;    // 팀 리그용
  coachingStrategy?: CoachingStrategy;  // 개인 리그용
}

/**
 * 전투용 최종 스탯 계산 (코칭 효과 적용)
 */
export function calculateBattleStats(context: BattleStatsContext): {
  finalStats: Stats;
  hpModifier: number;
  gaugeStart: number;
  appliedEffect: string;
} {
  const { isTeamLeague, cardId, baseStats, crewPolicy, coachingStrategy } = context;

  if (isTeamLeague) {
    // 팀 리그: 크루 방침 적용
    const policy = crewPolicy || getCurrentCrewPolicy();
    const effect = CREW_POLICY_EFFECTS[policy];
    const finalStats = applyCrewPolicyToStats(baseStats, policy);

    return {
      finalStats,
      hpModifier: 1.0,  // 팀 리그에서는 HP 변경 없음
      gaugeStart: 0,    // 팀 리그에서는 궁극기 시작 게이지 없음
      appliedEffect: `${effect.icon} ${effect.label}`,
    };
  } else {
    // 개인 리그: 카드별 코칭 전략 적용
    if (coachingStrategy) {
      // 전략이 명시적으로 제공된 경우
      useCoachingStore.getState().setCardStrategy(
        cardId,
        coachingStrategy,
        useSeasonStore.getState().currentSeason?.number || 1
      );
    }

    const strategy = coachingStrategy || getCardCoachingStrategy(cardId);
    const effect = COACHING_EFFECTS[strategy];
    const finalStats = useCoachingStore.getState().applyCoachingToStats(cardId, baseStats);

    return {
      finalStats,
      hpModifier: getCoachingHpModifier(cardId),
      gaugeStart: getCoachingGaugeStart(cardId),
      appliedEffect: `${effect.icon} ${effect.label}`,
    };
  }
}

// ========================================
// UI 헬퍼
// ========================================

/**
 * 모든 크루 방침 목록
 */
export function getAllCrewPolicies(): Array<{
  policy: CrewPolicy;
  label: string;
  icon: string;
  atkMod: number;
  defMod: number;
  description: string;
}> {
  return (Object.keys(CREW_POLICY_EFFECTS) as CrewPolicy[]).map(policy => {
    const effect = CREW_POLICY_EFFECTS[policy];
    const atkPercent = Math.round((effect.atkMod - 1) * 100);
    const defPercent = Math.round((effect.defMod - 1) * 100);

    let description = '';
    if (atkPercent !== 0) {
      description += `ATK ${atkPercent > 0 ? '+' : ''}${atkPercent}%`;
    }
    if (defPercent !== 0) {
      if (description) description += ', ';
      description += `DEF ${defPercent > 0 ? '+' : ''}${defPercent}%`;
    }
    if (!description) {
      description = '변화 없음';
    }

    return {
      policy,
      label: effect.label,
      icon: effect.icon,
      atkMod: effect.atkMod,
      defMod: effect.defMod,
      description,
    };
  });
}

/**
 * 모든 코칭 전략 목록 (개인 리그용)
 */
export function getAllCoachingStrategies(): Array<{
  strategy: CoachingStrategy;
  label: string;
  icon: string;
  description: string;
  effects: {
    atk?: string;
    def?: string;
    spd?: string;
    ce?: string;
    hp?: string;
    gauge?: string;
  };
}> {
  return (Object.keys(COACHING_EFFECTS) as CoachingStrategy[]).map(strategy => {
    const effect = COACHING_EFFECTS[strategy];
    const { statMods } = effect;

    const effects: {
      atk?: string;
      def?: string;
      spd?: string;
      ce?: string;
      hp?: string;
      gauge?: string;
    } = {};

    if (statMods.atk !== undefined && statMods.atk !== 1) {
      const percent = Math.round((statMods.atk - 1) * 100);
      effects.atk = `${percent > 0 ? '+' : ''}${percent}%`;
    }
    if (statMods.def !== undefined && statMods.def !== 1) {
      const percent = Math.round((statMods.def - 1) * 100);
      effects.def = `${percent > 0 ? '+' : ''}${percent}%`;
    }
    if (statMods.spd !== undefined && statMods.spd !== 1) {
      const percent = Math.round((statMods.spd - 1) * 100);
      effects.spd = `${percent > 0 ? '+' : ''}${percent}%`;
    }
    if (statMods.ce !== undefined && statMods.ce !== 1) {
      const percent = Math.round((statMods.ce - 1) * 100);
      effects.ce = `${percent > 0 ? '+' : ''}${percent}%`;
    }
    if (statMods.hpMod !== undefined && statMods.hpMod !== 1) {
      const percent = Math.round((statMods.hpMod - 1) * 100);
      effects.hp = `${percent > 0 ? '+' : ''}${percent}%`;
    }
    if (statMods.gaugeStart !== undefined && statMods.gaugeStart > 0) {
      effects.gauge = `시작 ${statMods.gaugeStart}%`;
    }

    const descParts: string[] = [];
    if (effects.atk) descParts.push(`ATK ${effects.atk}`);
    if (effects.def) descParts.push(`DEF ${effects.def}`);
    if (effects.spd) descParts.push(`SPD ${effects.spd}`);
    if (effects.ce) descParts.push(`CE ${effects.ce}`);
    if (effects.hp) descParts.push(`HP ${effects.hp}`);
    if (effects.gauge) descParts.push(`궁극기 ${effects.gauge}`);

    return {
      strategy,
      label: effect.label,
      icon: effect.icon,
      description: descParts.join(', ') || '변화 없음',
      effects,
    };
  });
}

/**
 * 스탯 변화 미리보기
 */
export function previewStatsChange(
  baseStats: Stats,
  isTeamLeague: boolean,
  policy?: CrewPolicy,
  strategy?: CoachingStrategy
): {
  before: Stats;
  after: Stats;
  changes: Partial<Record<keyof Stats, { value: number; percent: number }>>;
} {
  let afterStats: Stats;

  if (isTeamLeague && policy) {
    afterStats = applyCrewPolicyToStats(baseStats, policy);
  } else if (!isTeamLeague && strategy) {
    const effect = COACHING_EFFECTS[strategy];
    const { statMods } = effect;

    afterStats = {
      atk: Math.floor(baseStats.atk * (statMods.atk || 1)),
      def: Math.floor(baseStats.def * (statMods.def || 1)),
      spd: Math.floor(baseStats.spd * (statMods.spd || 1)),
      ce: Math.floor(baseStats.ce * (statMods.ce || 1)),
      hp: Math.floor(baseStats.hp * (statMods.hpMod || 1)),
      crt: baseStats.crt,
      tec: baseStats.tec,
      mnt: baseStats.mnt,
    };
  } else {
    afterStats = { ...baseStats };
  }

  const changes: Partial<Record<keyof Stats, { value: number; percent: number }>> = {};

  (Object.keys(baseStats) as (keyof Stats)[]).forEach(stat => {
    const before = baseStats[stat];
    const after = afterStats[stat];
    if (before !== after) {
      changes[stat] = {
        value: after - before,
        percent: Math.round(((after - before) / before) * 100),
      };
    }
  });

  return {
    before: baseStats,
    after: afterStats,
    changes,
  };
}
