// ========================================
// 전투 계산 시스템
// ========================================

import type {
  Stats,
  BaseStats,
  Arena,
  CharacterCard,
  PlayerCard,
  CombatStats,
  BattleCalculation,
  RoundResult,
  SkillEffect,
  AppliedStatusEffect,
  TurnResult
} from '../types';
import { CHARACTERS_BY_ID } from '../data/characters';
import { ITEMS_BY_ID } from '../data/items';
import { EXP_TABLE, MAX_LEVEL } from '../data/constants';
import {
  getAttributeMultiplier,
  getArenaAttributeBonus,
  isAttributeNullifiedArena,
  isSpeedReversedArena,
  getSkillSealProbability,
  getArenaStatModifier
} from './attributeSystem';
import { getStatusEffect } from '../data/statusEffects';
import { getUltimateSkillEffects, type UltimateSkillData } from '../data/ultimateSkillEffects';

/**
 * BaseStats를 8스탯 Stats로 변환 (레거시 호환)
 */
function ensureFullStats(baseStats: BaseStats): Stats {
  // 이미 8스탯이면 그대로 반환
  if ('crt' in baseStats) {
    return baseStats as Stats;
  }
  // 5스탯이면 기본값으로 신규 스탯 추가
  return {
    ...baseStats,
    crt: 10,  // 기본 치명
    tec: 10,  // 기본 기술
    mnt: 10   // 기본 정신
  };
}

/**
 * 플레이어 카드의 전투용 스탯 계산 (레벨업 + 장비 적용)
 */
export function calculateCombatStats(
  playerCard: PlayerCard,
  arena: Arena
): CombatStats {
  const baseCard = CHARACTERS_BY_ID[playerCard.cardId];
  if (!baseCard) {
    throw new Error(`Character not found: ${playerCard.cardId}`);
  }

  // 기본 스탯 (8스탯으로 변환)
  const stats: Stats = ensureFullStats(baseCard.baseStats);

  // 레벨업 보너스 적용 (레벨당 주요 스탯 +2)
  const levelBonus = (playerCard.level - 1) * 2;
  stats[baseCard.growthStats.primary] += levelBonus;
  stats[baseCard.growthStats.secondary] += levelBonus;

  // 장비 보너스 적용
  for (const equipId of playerCard.equipment) {
    if (equipId) {
      const item = ITEMS_BY_ID[equipId];
      if (item) {
        for (const [stat, value] of Object.entries(item.statBonus)) {
          if (stat in stats && value !== undefined) {
            stats[stat as keyof Stats] += value;
          }
        }
      }
    }
  }

  // 경기장 스탯 수정자 적용
  const arenaStatMod = getArenaStatModifier(arena);
  if (arenaStatMod !== 0) {
    // CE 또는 DEF에 적용 (경기장 설명에 따라)
    const effect = arena.effects.find(e => e.type === 'STAT_MODIFY' && e.target === 'ALL');
    if (effect?.description.includes('CE')) {
      stats.ce = Math.max(0, stats.ce + arenaStatMod);
    } else if (effect?.description.includes('DEF')) {
      stats.def = Math.max(0, stats.def + arenaStatMod);
    } else if (effect?.description.includes('HP')) {
      stats.hp = Math.max(1, stats.hp + arenaStatMod);
    }
  }

  return {
    ...stats,
    attribute: baseCard.attribute,
    skillEffect: baseCard.skill.effect,
    cardId: playerCard.cardId
  };
}

/**
 * AI용 전투 스탯 계산 (기본 카드 사용)
 */
export function calculateAICombatStats(
  characterCard: CharacterCard,
  arena: Arena
): CombatStats {
  // 기본 스탯 (8스탯으로 변환)
  const stats: Stats = ensureFullStats(characterCard.baseStats);

  // 경기장 스탯 수정자 적용
  const arenaStatMod = getArenaStatModifier(arena);
  if (arenaStatMod !== 0) {
    const effect = arena.effects.find(e => e.type === 'STAT_MODIFY' && e.target === 'ALL');
    if (effect?.description.includes('CE')) {
      stats.ce = Math.max(0, stats.ce + arenaStatMod);
    } else if (effect?.description.includes('DEF')) {
      stats.def = Math.max(0, stats.def + arenaStatMod);
    } else if (effect?.description.includes('HP')) {
      stats.hp = Math.max(1, stats.hp + arenaStatMod);
    }
  }

  return {
    ...stats,
    attribute: characterCard.attribute,
    skillEffect: characterCard.skill.effect,
    cardId: characterCard.id
  };
}

/**
 * 스킬 효과 적용
 */
function applySkillEffect(
  attacker: CombatStats,
  defender: CombatStats,
  effect: SkillEffect,
  isSealed: boolean
): { attacker: CombatStats; defender: CombatStats; activated: boolean } {
  if (isSealed) {
    return { attacker: { ...attacker }, defender: { ...defender }, activated: false };
  }

  // 확률 체크
  if (effect.trigger === 'PROBABILITY') {
    const roll = Math.random() * 100;
    if (roll > (effect.probability ?? 0)) {
      return { attacker: { ...attacker }, defender: { ...defender }, activated: false };
    }
  }

  const newAttacker = { ...attacker };
  const newDefender = { ...defender };

  switch (effect.type) {
    case 'STAT_MODIFY':
      if (typeof effect.value === 'object') {
        const { stat, amount } = effect.value;
        if (effect.target === 'SELF') {
          newAttacker[stat] = Math.max(0, newAttacker[stat] + amount);
        } else {
          newDefender[stat] = Math.max(0, newDefender[stat] + amount);
        }
      }
      break;

    case 'SPEED_CONTROL':
      if (typeof effect.value === 'object') {
        const { stat, amount } = effect.value;
        if (stat === 'spd') {
          if (effect.target === 'SELF') {
            newAttacker.spd = Math.max(0, newAttacker.spd + amount);
          } else {
            newDefender.spd = Math.max(0, newDefender.spd + amount);
          }
        }
      } else if (typeof effect.value === 'number') {
        // SPD를 직접 설정
        if (effect.target === 'ENEMY') {
          newDefender.spd = Math.max(0, newDefender.spd + effect.value);
        }
      }
      break;

    case 'IGNORE_DEFENSE':
      // 방어력 무시는 데미지 계산에서 처리
      break;

    case 'HP_DRAIN':
      if (typeof effect.value === 'number') {
        if (effect.target === 'SELF') {
          // HP 회복
          newAttacker.hp = Math.min(newAttacker.hp + effect.value, newAttacker.hp + 15);
        } else {
          // 상대 HP 감소
          newDefender.hp = Math.max(1, newDefender.hp + effect.value);
        }
      }
      break;

    case 'SKILL_NULLIFY':
      // 상대 스킬 무효화
      if (effect.target === 'ENEMY') {
        newDefender.skillEffect = undefined;
      }
      break;

    default:
      break;
  }

  return { attacker: newAttacker, defender: newDefender, activated: true };
}

// ========================================
// 상태이상 시스템 헬퍼 함수들
// ========================================

/**
 * 확률 체크
 */
function rollChance(chance: number): boolean {
  return Math.random() * 100 < chance;
}

/**
 * 상태이상 적용 (확률 기반)
 */
export function applyStatusEffect(
  statusId: string,
  chance: number = 100
): AppliedStatusEffect | null {
  if (!rollChance(chance)) return null;

  const statusDef = getStatusEffect(statusId);
  if (!statusDef) return null;

  return {
    statusId,
    remainingDuration: statusDef.duration,
    stacks: 1,
    shieldAmount: statusDef.effect.action === 'ABSORB_DAMAGE' ? statusDef.effect.value : undefined
  };
}

/**
 * 상태이상 목록에 추가 (스택 처리)
 */
export function addStatusToList(
  effects: AppliedStatusEffect[],
  newEffect: AppliedStatusEffect
): AppliedStatusEffect[] {
  const statusDef = getStatusEffect(newEffect.statusId);
  if (!statusDef) return [...effects];

  const existingIndex = effects.findIndex(e => e.statusId === newEffect.statusId);

  if (existingIndex >= 0) {
    if (statusDef.stackable) {
      const existing = effects[existingIndex];
      const maxStacks = statusDef.maxStacks ?? 1;
      const newStacks = Math.min(existing.stacks + 1, maxStacks);
      const updated = [...effects];
      updated[existingIndex] = {
        ...existing,
        stacks: newStacks,
        remainingDuration: Math.max(existing.remainingDuration, newEffect.remainingDuration)
      };
      return updated;
    } else {
      // 비스택: 지속시간만 갱신
      const updated = [...effects];
      updated[existingIndex] = {
        ...effects[existingIndex],
        remainingDuration: Math.max(effects[existingIndex].remainingDuration, newEffect.remainingDuration)
      };
      return updated;
    }
  } else {
    return [...effects, newEffect];
  }
}

/**
 * 상태이상 지속시간 감소 및 만료 처리
 */
export function tickStatusEffects(effects: AppliedStatusEffect[]): AppliedStatusEffect[] {
  return effects
    .map(e => ({ ...e, remainingDuration: e.remainingDuration - 1 }))
    .filter(e => e.remainingDuration > 0);
}

/**
 * 특정 트리거의 상태이상 효과 처리
 */
export function processStatusTrigger(
  effects: AppliedStatusEffect[],
  trigger: 'TURN_START' | 'TURN_END' | 'ON_ACTION' | 'ON_HIT',
  currentStats: { hp: number; atk: number; def: number; spd: number; ce: number }
): {
  newHp: number;
  damage: number;
  heal: number;
  skipTurn: boolean;
  triggeredEffects: string[];
  shieldAbsorbed: number;
} {
  let damage = 0;
  let heal = 0;
  let skipTurn = false;
  const triggeredEffects: string[] = [];
  let shieldAbsorbed = 0;

  for (const applied of effects) {
    const statusDef = getStatusEffect(applied.statusId);
    if (!statusDef || statusDef.effect.trigger !== trigger) continue;

    switch (statusDef.effect.action) {
      case 'SKIP_TURN':
        skipTurn = true;
        triggeredEffects.push(applied.statusId);
        break;
      case 'DAMAGE':
        const dmg = statusDef.effect.value * applied.stacks;
        damage += dmg;
        triggeredEffects.push(applied.statusId);
        break;
      case 'HEAL':
        heal += statusDef.effect.value;
        triggeredEffects.push(applied.statusId);
        break;
      case 'COUNTER_ATTACK':
        // 반격은 ON_HIT에서 별도 처리
        triggeredEffects.push(applied.statusId);
        break;
      case 'DODGE':
        // 회피도 ON_HIT에서 별도 처리
        triggeredEffects.push(applied.statusId);
        break;
    }
  }

  const newHp = Math.max(0, currentStats.hp - damage + heal);
  return { newHp, damage, heal, skipTurn, triggeredEffects, shieldAbsorbed };
}

/**
 * 스탯 수정 상태이상 적용
 */
export function applyStatModifiers(
  baseStats: { atk: number; def: number; spd: number; ce: number },
  effects: AppliedStatusEffect[]
): { atk: number; def: number; spd: number; ce: number } {
  const result = { ...baseStats };

  for (const applied of effects) {
    const statusDef = getStatusEffect(applied.statusId);
    if (!statusDef) continue;
    if (statusDef.effect.trigger !== 'INSTANT') continue;

    const stat = statusDef.effect.stat;
    if (!stat) continue;

    // hp는 이 함수에서 처리하지 않음
    if (stat === 'hp') continue;
    if (!(stat in result)) continue;

    if (statusDef.effect.action === 'STAT_REDUCE' || statusDef.effect.action === 'STAT_BOOST') {
      const key = stat as 'atk' | 'def' | 'spd' | 'ce';
      result[key] = Math.max(0, result[key] + statusDef.effect.value);
    }
  }

  return result;
}

/**
 * 보호막으로 데미지 흡수
 */
export function absorbDamageWithShield(
  effects: AppliedStatusEffect[],
  incomingDamage: number
): { remainingDamage: number; updatedEffects: AppliedStatusEffect[] } {
  let remaining = incomingDamage;
  const updatedEffects = effects.map(e => {
    if (e.shieldAmount && e.shieldAmount > 0 && remaining > 0) {
      const absorbed = Math.min(e.shieldAmount, remaining);
      remaining -= absorbed;
      return { ...e, shieldAmount: e.shieldAmount - absorbed };
    }
    return e;
  }).filter(e => !e.shieldAmount || e.shieldAmount > 0 || getStatusEffect(e.statusId)?.effect.action !== 'ABSORB_DAMAGE');

  return { remainingDamage: remaining, updatedEffects };
}

/**
 * 회피 체크
 */
export function checkEvasion(effects: AppliedStatusEffect[]): boolean {
  for (const applied of effects) {
    const statusDef = getStatusEffect(applied.statusId);
    if (statusDef?.effect.action === 'DODGE') {
      if (rollChance(statusDef.effect.value)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 취약 상태 데미지 증가 계산
 */
export function getVulnerabilityMultiplier(effects: AppliedStatusEffect[]): number {
  for (const applied of effects) {
    const statusDef = getStatusEffect(applied.statusId);
    if (statusDef?.effect.action === 'DAMAGE_TAKEN_INCREASE') {
      return 1 + (statusDef.effect.value / 100);
    }
  }
  return 1;
}

/**
 * 처형 대상 체크 (HP%이하 즉사)
 */
export function checkExecuteThreshold(
  effects: AppliedStatusEffect[],
  currentHp: number,
  maxHp: number
): boolean {
  for (const applied of effects) {
    const statusDef = getStatusEffect(applied.statusId);
    if (statusDef?.effect.action === 'EXECUTE_THRESHOLD') {
      const threshold = statusDef.effect.value;
      const hpPercent = (currentHp / maxHp) * 100;
      if (hpPercent <= threshold) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 회복 봉인 체크
 */
export function isHealBlocked(effects: AppliedStatusEffect[]): boolean {
  return effects.some(e => {
    const statusDef = getStatusEffect(e.statusId);
    return statusDef?.effect.action === 'BLOCK_HEAL';
  });
}

/**
 * 스킬 봉인 체크
 */
export function isSkillBlocked(effects: AppliedStatusEffect[]): boolean {
  return effects.some(e => {
    const statusDef = getStatusEffect(e.statusId);
    return statusDef?.effect.action === 'BLOCK_SKILL';
  });
}

/**
 * 디버프 제거
 */
export function removeDebuffs(effects: AppliedStatusEffect[]): AppliedStatusEffect[] {
  return effects.filter(e => {
    const statusDef = getStatusEffect(e.statusId);
    return statusDef?.type === 'BUFF';
  });
}

/**
 * 버프 제거
 */
export function removeBuffs(effects: AppliedStatusEffect[]): AppliedStatusEffect[] {
  return effects.filter(e => {
    const statusDef = getStatusEffect(e.statusId);
    return statusDef?.type !== 'BUFF';
  });
}

/**
 * 필살기 효과 처리
 */
export function processUltimateEffects(
  ultimateData: UltimateSkillData,
  _attackerCardId: string,
  _defenderCardId: string,
  attackerEffects: AppliedStatusEffect[],
  defenderEffects: AppliedStatusEffect[],
  _attackerStats: { hp: number; maxHp: number; ce: number },
  _defenderStats: { hp: number; maxHp: number; ce: number }
): {
  damage: number;
  selfDamage: number;
  healAmount: number;
  attackerNewEffects: AppliedStatusEffect[];
  defenderNewEffects: AppliedStatusEffect[];
  attackerCeDrain: number;
  defenderCeDrain: number;
  isCritical: boolean;
  multiHitCount: number;
  logs: string[];
} {
  let damage = ultimateData.damage;
  let selfDamage = 0;
  let healAmount = 0;
  let attackerCeDrain = 0;
  let defenderCeDrain = 0;
  let isCritical = false;
  let multiHitCount = 1;
  const logs: string[] = [];

  let newAttackerEffects = [...attackerEffects];
  let newDefenderEffects = [...defenderEffects];

  for (const effect of ultimateData.effects) {
    const chance = effect.chance ?? 100;
    if (!rollChance(chance)) continue;

    switch (effect.type) {
      case 'STATUS':
        if (effect.statusId) {
          const applied = applyStatusEffect(effect.statusId, 100); // 이미 확률 체크함
          if (applied) {
            const statusDef = getStatusEffect(effect.statusId);
            const statusIcon = statusDef?.icon || '';
            const statusName = statusDef?.name || effect.statusId;
            if (effect.target === 'ENEMY') {
              newDefenderEffects = addStatusToList(newDefenderEffects, applied);
              logs.push(`${statusIcon} ${statusName} 부여!`);
            } else if (effect.target === 'SELF') {
              newAttackerEffects = addStatusToList(newAttackerEffects, applied);
              logs.push(`${statusIcon} ${statusName} 획득!`);
            }
          }
        }
        break;

      case 'LIFESTEAL':
        const lifeValue = typeof effect.value === 'number' ? effect.value : 0;
        if (!isHealBlocked(newAttackerEffects)) {
          healAmount = Math.floor(damage * lifeValue / 100);
          logs.push(`${healAmount} HP 흡수!`);
        }
        break;

      case 'IGNORE_DEF':
        // 방어 무시는 데미지 계산에서 처리 (데미지 계산 함수에서 별도 처리 필요)
        logs.push(`방어력 ${effect.value}% 무시!`);
        break;

      case 'CE_DRAIN':
        const ceDrainValue = typeof effect.value === 'number' ? effect.value : 0;
        defenderCeDrain = ceDrainValue;
        attackerCeDrain = -ceDrainValue; // 음수는 회복
        logs.push(`주력 ${ceDrainValue} 흡수!`);
        break;

      case 'CRITICAL_GUARANTEED':
        isCritical = true;
        damage = Math.floor(damage * 1.5);
        logs.push(`확정 크리티컬!`);
        break;

      case 'MULTI_HIT':
        const hits = typeof effect.value === 'number' ? effect.value : 1;
        multiHitCount = hits;
        // 다단히트: 총 데미지를 나눠서 적용 (각 타당 데미지)
        logs.push(`${hits}회 다중 공격!`);
        break;

      case 'RANDOM_DAMAGE':
        if (typeof effect.value === 'object' && 'min' in effect.value && 'max' in effect.value) {
          const { min, max } = effect.value;
          damage = min + Math.floor(Math.random() * (max - min + 1));
          logs.push(`랜덤 데미지: ${damage}!`);
        }
        break;

      case 'SELF_DAMAGE':
        const selfDmg = typeof effect.value === 'number' ? effect.value : 0;
        selfDamage = selfDmg;
        logs.push(`자해 데미지: ${selfDamage}!`);
        break;

      case 'HEAL_SELF':
        const healValue = typeof effect.value === 'number' ? effect.value : 0;
        if (!isHealBlocked(newAttackerEffects)) {
          healAmount += healValue;
          logs.push(`${healValue} HP 회복!`);
        }
        break;

      case 'REMOVE_DEBUFF':
        newAttackerEffects = removeDebuffs(newAttackerEffects);
        logs.push(`디버프 해제!`);
        break;

      case 'REMOVE_BUFF':
        newDefenderEffects = removeBuffs(newDefenderEffects);
        logs.push(`상대 버프 제거!`);
        break;
    }
  }

  return {
    damage,
    selfDamage,
    healAmount,
    attackerNewEffects: newAttackerEffects,
    defenderNewEffects: newDefenderEffects,
    attackerCeDrain,
    defenderCeDrain,
    isCritical,
    multiHitCount,
    logs
  };
}

/**
 * 데미지 계산
 * 공식: (ATK × 속성배율 × CE배율 × 경기장보너스) - DEF
 */
export function calculateDamage(
  attacker: CombatStats,
  defender: CombatStats,
  arena: Arena
): number {
  // 1. 속성 배율
  let attrMultiplier = 1.0;
  if (!isAttributeNullifiedArena(arena)) {
    attrMultiplier = getAttributeMultiplier(attacker.attribute, defender.attribute);
  }

  // 2. CE 배율: 1 + (CE / 100)
  const ceMultiplier = 1 + (attacker.ce / 100);

  // 3. 경기장 속성 보너스
  const arenaBonus = 1 + getArenaAttributeBonus(attacker.attribute, arena);

  // 4. 방어력 (IGNORE_DEFENSE 스킬 처리)
  let effectiveDef = defender.def;
  if (attacker.skillEffect?.type === 'IGNORE_DEFENSE') {
    const ignoreAmount = typeof attacker.skillEffect.value === 'number'
      ? attacker.skillEffect.value
      : 0;
    effectiveDef = Math.max(0, effectiveDef - ignoreAmount);
  }

  // 5. 크리티컬 처리
  let critMultiplier = 1.0;
  if (attacker.skillEffect?.type === 'CRITICAL') {
    const critValue = typeof attacker.skillEffect.value === 'number'
      ? attacker.skillEffect.value
      : 1.0;
    critMultiplier = critValue;
  }

  // 6. 데미지 배율 수정 (DAMAGE_MODIFY)
  let damageModifier = 1.0;
  if (attacker.skillEffect?.type === 'DAMAGE_MODIFY') {
    const modValue = typeof attacker.skillEffect.value === 'number'
      ? attacker.skillEffect.value
      : 1.0;

    // 상대 CE 기반 추가 데미지 (노바라의 공명)
    if (modValue < 1 && attacker.skillEffect.target === 'ENEMY') {
      damageModifier = 1 + (defender.ce * modValue);
    } else {
      damageModifier = modValue;
    }
  }

  // 최종 데미지 계산
  let damage = (attacker.atk * attrMultiplier * ceMultiplier * arenaBonus * critMultiplier * damageModifier) - effectiveDef;

  // 최소 데미지 1
  return Math.max(1, Math.floor(damage));
}

/**
 * 선공 판정
 */
export function determineFirstAttacker(
  playerStats: CombatStats,
  aiStats: CombatStats,
  arena: Arena
): 'PLAYER' | 'AI' {
  const speedReversed = isSpeedReversedArena(arena);

  if (speedReversed) {
    // SPD가 낮은 쪽이 선공
    if (playerStats.spd < aiStats.spd) return 'PLAYER';
    if (aiStats.spd < playerStats.spd) return 'AI';
  } else {
    // SPD가 높은 쪽이 선공
    if (playerStats.spd > aiStats.spd) return 'PLAYER';
    if (aiStats.spd > playerStats.spd) return 'AI';
  }

  // 동일 SPD면 랜덤
  return Math.random() > 0.5 ? 'PLAYER' : 'AI';
}

/**
 * 라운드 진행 및 결과 계산
 * HP가 0이 될 때까지 공격을 주고받는 턴제 전투
 */
export function resolveRound(
  playerCard: PlayerCard | CombatStats,
  aiCard: CharacterCard | CombatStats,
  arena: Arena,
  roundNumber: number
): RoundResult {
  // 전투 스탯 계산
  let playerStats: CombatStats;
  let aiStats: CombatStats;

  if ('cardId' in playerCard && 'level' in playerCard) {
    playerStats = calculateCombatStats(playerCard as PlayerCard, arena);
  } else {
    playerStats = playerCard as CombatStats;
  }

  if ('baseStats' in aiCard) {
    aiStats = calculateAICombatStats(aiCard as CharacterCard, arena);
  } else {
    aiStats = aiCard as CombatStats;
  }

  // 스킬 봉인 확률 체크
  const sealProb = getSkillSealProbability(arena);
  const playerSkillSealed = Math.random() < sealProb;
  const aiSkillSealed = Math.random() < sealProb;

  // 스킬 효과 적용
  let playerSkillActivated = false;
  let aiSkillActivated = false;

  if (playerStats.skillEffect) {
    const result = applySkillEffect(playerStats, aiStats, playerStats.skillEffect, playerSkillSealed);
    playerStats = result.attacker;
    aiStats = result.defender;
    playerSkillActivated = result.activated;
  }

  if (aiStats.skillEffect) {
    const result = applySkillEffect(aiStats, playerStats, aiStats.skillEffect, aiSkillSealed);
    aiStats = result.attacker;
    playerStats = result.defender;
    aiSkillActivated = result.activated;
  }

  // 선공 판정
  const firstAttacker = determineFirstAttacker(playerStats, aiStats, arena);
  const playerFirst = firstAttacker === 'PLAYER';

  // 데미지 계산 (턴당 데미지)
  const playerDamagePerTurn = calculateDamage(playerStats, aiStats, arena);
  const aiDamagePerTurn = calculateDamage(aiStats, playerStats, arena);

  // HP 기반 턴제 전투 (HP가 0이 될 때까지 반복)
  let playerCurrentHp = playerStats.hp;
  let aiCurrentHp = aiStats.hp;
  let totalPlayerDamage = 0;
  let totalAiDamage = 0;
  const MAX_TURNS = 100; // 무한 루프 방지
  let turnCount = 0;

  while (playerCurrentHp > 0 && aiCurrentHp > 0 && turnCount < MAX_TURNS) {
    turnCount++;

    if (playerFirst) {
      // 플레이어 선공
      aiCurrentHp -= playerDamagePerTurn;
      totalPlayerDamage += playerDamagePerTurn;

      if (aiCurrentHp <= 0) break;

      // AI 반격
      playerCurrentHp -= aiDamagePerTurn;
      totalAiDamage += aiDamagePerTurn;

      if (playerCurrentHp <= 0) break;
    } else {
      // AI 선공
      playerCurrentHp -= aiDamagePerTurn;
      totalAiDamage += aiDamagePerTurn;

      if (playerCurrentHp <= 0) break;

      // 플레이어 반격
      aiCurrentHp -= playerDamagePerTurn;
      totalPlayerDamage += playerDamagePerTurn;

      if (aiCurrentHp <= 0) break;
    }
  }

  // 승패 판정 (HP가 0 이하인 쪽이 패배)
  let winner: 'PLAYER' | 'AI' | 'DRAW';
  if (aiCurrentHp <= 0 && playerCurrentHp <= 0) {
    winner = 'DRAW';
  } else if (aiCurrentHp <= 0) {
    winner = 'PLAYER';
  } else if (playerCurrentHp <= 0) {
    winner = 'AI';
  } else {
    // MAX_TURNS 도달 시 남은 HP로 판정
    if (playerCurrentHp > aiCurrentHp) {
      winner = 'PLAYER';
    } else if (aiCurrentHp > playerCurrentHp) {
      winner = 'AI';
    } else {
      winner = 'DRAW';
    }
  }

  // 속성 배율 계산 (표시용)
  const playerAttrMult = isAttributeNullifiedArena(arena)
    ? 1.0
    : getAttributeMultiplier(playerStats.attribute, aiStats.attribute);
  const aiAttrMult = isAttributeNullifiedArena(arena)
    ? 1.0
    : getAttributeMultiplier(aiStats.attribute, playerStats.attribute);

  const calculation: BattleCalculation = {
    playerDamage: totalPlayerDamage,
    aiDamage: totalAiDamage,
    playerFinalHp: Math.max(0, playerCurrentHp),
    aiFinalHp: Math.max(0, aiCurrentHp),
    playerFirst,
    attributeMultiplier: {
      player: playerAttrMult,
      ai: aiAttrMult
    },
    ceMultiplier: {
      player: 1 + (playerStats.ce / 100),
      ai: 1 + (aiStats.ce / 100)
    },
    arenaBonus: {
      player: 1 + getArenaAttributeBonus(playerStats.attribute, arena),
      ai: 1 + getArenaAttributeBonus(aiStats.attribute, arena)
    },
    skillActivated: {
      player: playerSkillActivated,
      ai: aiSkillActivated
    }
  };

  return {
    roundNumber,
    arena,
    playerCardId: playerStats.cardId,
    aiCardId: aiStats.cardId,
    winner,
    calculation
  };
}

/**
 * 라운드 진행 및 결과 계산 (필살기 효과 시스템 포함)
 * HP가 0이 될 때까지 공격을 주고받는 턴제 전투
 */
export function resolveRoundWithUltimate(
  playerCard: PlayerCard | CombatStats,
  aiCard: CharacterCard | CombatStats,
  arena: Arena,
  roundNumber: number
): RoundResult {
  // 전투 스탯 계산
  let playerStats: CombatStats;
  let aiStats: CombatStats;

  if ('cardId' in playerCard && 'level' in playerCard) {
    playerStats = calculateCombatStats(playerCard as PlayerCard, arena);
  } else {
    playerStats = playerCard as CombatStats;
  }

  if ('baseStats' in aiCard) {
    aiStats = calculateAICombatStats(aiCard as CharacterCard, arena);
  } else {
    aiStats = aiCard as CombatStats;
  }

  // 스킬 봉인 확률 체크
  const sealProb = getSkillSealProbability(arena);
  const playerSkillSealed = Math.random() < sealProb;
  const aiSkillSealed = Math.random() < sealProb;

  // 스킬 효과 적용
  let playerSkillActivated = false;
  let aiSkillActivated = false;

  if (playerStats.skillEffect) {
    const result = applySkillEffect(playerStats, aiStats, playerStats.skillEffect, playerSkillSealed);
    playerStats = result.attacker;
    aiStats = result.defender;
    playerSkillActivated = result.activated;
  }

  if (aiStats.skillEffect) {
    const result = applySkillEffect(aiStats, playerStats, aiStats.skillEffect, aiSkillSealed);
    aiStats = result.attacker;
    playerStats = result.defender;
    aiSkillActivated = result.activated;
  }

  // 선공 판정
  const firstAttacker = determineFirstAttacker(playerStats, aiStats, arena);
  const playerFirst = firstAttacker === 'PLAYER';

  // 필살기 효과 데이터 가져오기
  const playerUltimateData = getUltimateSkillEffects(playerStats.cardId);
  const aiUltimateData = getUltimateSkillEffects(aiStats.cardId);

  // 상태이상 추적
  let playerEffects: AppliedStatusEffect[] = [];
  let aiEffects: AppliedStatusEffect[] = [];

  // HP 기반 턴제 전투
  let playerCurrentHp = playerStats.hp;
  let aiCurrentHp = aiStats.hp;
  const playerMaxHp = playerStats.hp;
  const aiMaxHp = aiStats.hp;
  let totalPlayerDamage = 0;
  let totalAiDamage = 0;
  const MAX_TURNS = 100;
  let turnCount = 0;

  // 필살기 사용 추적
  let playerUltimateUsed = false;
  let aiUltimateUsed = false;
  let playerUltimateDamage = 0;
  let aiUltimateDamage = 0;

  // 턴 로그
  const turnLogs: TurnResult[] = [];

  // 데미지 계산 (상태이상 적용 포함)
  const calculateTurnDamage = (
    attacker: CombatStats,
    defender: CombatStats,
    attackerEffects: AppliedStatusEffect[],
    defenderEffects: AppliedStatusEffect[]
  ): number => {
    // 스탯 수정자 적용
    const modifiedAttacker = applyStatModifiers(
      { atk: attacker.atk, def: attacker.def, spd: attacker.spd, ce: attacker.ce },
      attackerEffects
    );
    const modifiedDefender = applyStatModifiers(
      { atk: defender.atk, def: defender.def, spd: defender.spd, ce: defender.ce },
      defenderEffects
    );

    // 취약 상태 체크
    const vulnerabilityMult = getVulnerabilityMultiplier(defenderEffects);

    // 기본 데미지 계산
    let baseDamage = calculateDamage(
      { ...attacker, atk: modifiedAttacker.atk, ce: modifiedAttacker.ce },
      { ...defender, def: modifiedDefender.def },
      arena
    );

    // 취약 배율 적용
    baseDamage = Math.floor(baseDamage * vulnerabilityMult);

    return baseDamage;
  };

  while (playerCurrentHp > 0 && aiCurrentHp > 0 && turnCount < MAX_TURNS) {
    turnCount++;

    const isPlayerTurn = playerFirst ? (turnCount % 2 === 1) : (turnCount % 2 === 0);

    if (isPlayerTurn) {
      // 플레이어 턴 시작 처리
      const turnStartResult = processStatusTrigger(
        playerEffects, 'TURN_START',
        { hp: playerCurrentHp, atk: playerStats.atk, def: playerStats.def, spd: playerStats.spd, ce: playerStats.ce }
      );
      playerCurrentHp = turnStartResult.newHp;

      // 기절 상태면 턴 스킵
      if (turnStartResult.skipTurn) {
        playerEffects = tickStatusEffects(playerEffects);
        continue;
      }

      // 스킬 봉인 체크
      const skillBlocked = isSkillBlocked(playerEffects);

      // 필살기 사용 체크 (CE 충분하고 봉인 안됨)
      let damage = 0;
      let turnLog: Partial<TurnResult> = {
        turn: turnCount,
        attackerCardId: playerStats.cardId,
        defenderCardId: aiStats.cardId,
        isUltimate: false,
        isCritical: false
      };

      if (playerUltimateData && !playerUltimateUsed && !skillBlocked && playerStats.ce >= playerUltimateData.ceCost) {
        // 필살기 사용
        const ultimateResult = processUltimateEffects(
          playerUltimateData,
          playerStats.cardId,
          aiStats.cardId,
          playerEffects,
          aiEffects,
          { hp: playerCurrentHp, maxHp: playerMaxHp, ce: playerStats.ce },
          { hp: aiCurrentHp, maxHp: aiMaxHp, ce: aiStats.ce }
        );

        damage = ultimateResult.damage;
        playerEffects = ultimateResult.attackerNewEffects;
        aiEffects = ultimateResult.defenderNewEffects;
        playerUltimateUsed = true;
        playerUltimateDamage = damage;

        // 자해 데미지
        if (ultimateResult.selfDamage > 0) {
          playerCurrentHp = Math.max(1, playerCurrentHp - ultimateResult.selfDamage);
          turnLog.selfDamage = ultimateResult.selfDamage;
        }

        // 회복
        if (ultimateResult.healAmount > 0 && !isHealBlocked(playerEffects)) {
          playerCurrentHp = Math.min(playerMaxHp, playerCurrentHp + ultimateResult.healAmount);
          turnLog.healAmount = ultimateResult.healAmount;
        }

        turnLog.isUltimate = true;
        turnLog.isCritical = ultimateResult.isCritical;
        turnLog.isMultiHit = ultimateResult.multiHitCount > 1;
        turnLog.hitCount = ultimateResult.multiHitCount;
        turnLog.statusApplied = ultimateResult.defenderNewEffects.filter(
          e => !aiEffects.some(ae => ae.statusId === e.statusId)
        );
        turnLog.log = ultimateResult.logs;
      } else {
        // 일반 공격
        damage = calculateTurnDamage(playerStats, aiStats, playerEffects, aiEffects);
      }

      // 회피 체크
      if (checkEvasion(aiEffects)) {
        damage = 0;
        turnLog.log = [...(turnLog.log || []), '회피!'];
      } else {
        // 보호막으로 데미지 흡수
        const shieldResult = absorbDamageWithShield(aiEffects, damage);
        damage = shieldResult.remainingDamage;
        aiEffects = shieldResult.updatedEffects;

        // 데미지 적용
        aiCurrentHp -= damage;
        totalPlayerDamage += damage;
      }

      // 처형 대상 체크
      if (aiCurrentHp > 0 && checkExecuteThreshold(aiEffects, aiCurrentHp, aiMaxHp)) {
        aiCurrentHp = 0;
        turnLog.log = [...(turnLog.log || []), '처형!'];
      }

      // 턴 종료 처리
      const turnEndResult = processStatusTrigger(
        playerEffects, 'TURN_END',
        { hp: playerCurrentHp, atk: playerStats.atk, def: playerStats.def, spd: playerStats.spd, ce: playerStats.ce }
      );
      playerCurrentHp = turnEndResult.newHp;
      turnLog.statusTriggered = turnEndResult.triggeredEffects;

      // 상태이상 지속시간 감소
      playerEffects = tickStatusEffects(playerEffects);

      turnLog.damage = damage;
      turnLog.attackerHpAfter = playerCurrentHp;
      turnLog.defenderHpAfter = aiCurrentHp;
      turnLog.attackerGaugeAfter = 0;
      turnLog.defenderGaugeAfter = 0;
      turnLogs.push(turnLog as TurnResult);

      if (aiCurrentHp <= 0) break;
    } else {
      // AI 턴
      const turnStartResult = processStatusTrigger(
        aiEffects, 'TURN_START',
        { hp: aiCurrentHp, atk: aiStats.atk, def: aiStats.def, spd: aiStats.spd, ce: aiStats.ce }
      );
      aiCurrentHp = turnStartResult.newHp;

      if (turnStartResult.skipTurn) {
        aiEffects = tickStatusEffects(aiEffects);
        continue;
      }

      const skillBlocked = isSkillBlocked(aiEffects);

      let damage = 0;
      let turnLog: Partial<TurnResult> = {
        turn: turnCount,
        attackerCardId: aiStats.cardId,
        defenderCardId: playerStats.cardId,
        isUltimate: false,
        isCritical: false
      };

      if (aiUltimateData && !aiUltimateUsed && !skillBlocked && aiStats.ce >= aiUltimateData.ceCost) {
        const ultimateResult = processUltimateEffects(
          aiUltimateData,
          aiStats.cardId,
          playerStats.cardId,
          aiEffects,
          playerEffects,
          { hp: aiCurrentHp, maxHp: aiMaxHp, ce: aiStats.ce },
          { hp: playerCurrentHp, maxHp: playerMaxHp, ce: playerStats.ce }
        );

        damage = ultimateResult.damage;
        aiEffects = ultimateResult.attackerNewEffects;
        playerEffects = ultimateResult.defenderNewEffects;
        aiUltimateUsed = true;
        aiUltimateDamage = damage;

        if (ultimateResult.selfDamage > 0) {
          aiCurrentHp = Math.max(1, aiCurrentHp - ultimateResult.selfDamage);
          turnLog.selfDamage = ultimateResult.selfDamage;
        }

        if (ultimateResult.healAmount > 0 && !isHealBlocked(aiEffects)) {
          aiCurrentHp = Math.min(aiMaxHp, aiCurrentHp + ultimateResult.healAmount);
          turnLog.healAmount = ultimateResult.healAmount;
        }

        turnLog.isUltimate = true;
        turnLog.isCritical = ultimateResult.isCritical;
        turnLog.isMultiHit = ultimateResult.multiHitCount > 1;
        turnLog.hitCount = ultimateResult.multiHitCount;
        turnLog.statusApplied = ultimateResult.defenderNewEffects.filter(
          e => !playerEffects.some(pe => pe.statusId === e.statusId)
        );
        turnLog.log = ultimateResult.logs;
      } else {
        damage = calculateTurnDamage(aiStats, playerStats, aiEffects, playerEffects);
      }

      if (checkEvasion(playerEffects)) {
        damage = 0;
        turnLog.log = [...(turnLog.log || []), '회피!'];
      } else {
        const shieldResult = absorbDamageWithShield(playerEffects, damage);
        damage = shieldResult.remainingDamage;
        playerEffects = shieldResult.updatedEffects;

        playerCurrentHp -= damage;
        totalAiDamage += damage;
      }

      if (playerCurrentHp > 0 && checkExecuteThreshold(playerEffects, playerCurrentHp, playerMaxHp)) {
        playerCurrentHp = 0;
        turnLog.log = [...(turnLog.log || []), '처형!'];
      }

      const turnEndResult = processStatusTrigger(
        aiEffects, 'TURN_END',
        { hp: aiCurrentHp, atk: aiStats.atk, def: aiStats.def, spd: aiStats.spd, ce: aiStats.ce }
      );
      aiCurrentHp = turnEndResult.newHp;
      turnLog.statusTriggered = turnEndResult.triggeredEffects;

      aiEffects = tickStatusEffects(aiEffects);

      turnLog.damage = damage;
      turnLog.attackerHpAfter = aiCurrentHp;
      turnLog.defenderHpAfter = playerCurrentHp;
      turnLog.attackerGaugeAfter = 0;
      turnLog.defenderGaugeAfter = 0;
      turnLogs.push(turnLog as TurnResult);

      if (playerCurrentHp <= 0) break;
    }
  }

  // 승패 판정
  let winner: 'PLAYER' | 'AI' | 'DRAW';
  if (aiCurrentHp <= 0 && playerCurrentHp <= 0) {
    winner = 'DRAW';
  } else if (aiCurrentHp <= 0) {
    winner = 'PLAYER';
  } else if (playerCurrentHp <= 0) {
    winner = 'AI';
  } else {
    if (playerCurrentHp > aiCurrentHp) {
      winner = 'PLAYER';
    } else if (aiCurrentHp > playerCurrentHp) {
      winner = 'AI';
    } else {
      winner = 'DRAW';
    }
  }

  // 속성 배율 계산
  const playerAttrMult = isAttributeNullifiedArena(arena)
    ? 1.0
    : getAttributeMultiplier(playerStats.attribute, aiStats.attribute);
  const aiAttrMult = isAttributeNullifiedArena(arena)
    ? 1.0
    : getAttributeMultiplier(aiStats.attribute, playerStats.attribute);

  const calculation: BattleCalculation = {
    playerDamage: totalPlayerDamage,
    aiDamage: totalAiDamage,
    playerFinalHp: Math.max(0, playerCurrentHp),
    aiFinalHp: Math.max(0, aiCurrentHp),
    playerFirst,
    attributeMultiplier: {
      player: playerAttrMult,
      ai: aiAttrMult
    },
    ceMultiplier: {
      player: 1 + (playerStats.ce / 100),
      ai: 1 + (aiStats.ce / 100)
    },
    arenaBonus: {
      player: 1 + getArenaAttributeBonus(playerStats.attribute, arena),
      ai: 1 + getArenaAttributeBonus(aiStats.attribute, arena)
    },
    skillActivated: {
      player: playerSkillActivated,
      ai: aiSkillActivated
    },
    ultimateUsed: {
      player: playerUltimateUsed,
      ai: aiUltimateUsed
    },
    ultimateDamage: {
      player: playerUltimateDamage,
      ai: aiUltimateDamage
    },
    statusEffectsApplied: {
      player: playerEffects,
      ai: aiEffects
    },
    turnLogs
  };

  return {
    roundNumber,
    arena,
    playerCardId: playerStats.cardId,
    aiCardId: aiStats.cardId,
    winner,
    calculation
  };
}

/**
 * 경험치 계산
 */
export function calculateExpReward(
  won: boolean,
  opponentGrade: string,
  playerGrade: string,
  winStreak: number,
  isPerfectWin: boolean
): { base: number; bonus: number; total: number; reasons: string[] } {
  const reasons: string[] = [];
  let base = won ? 30 : 10;
  let bonus = 0;

  reasons.push(won ? '승리 +30' : '패배 +10');

  // 높은 등급 상대로 승리
  const gradeOrder = ['3급', '준2급', '2급', '준1급', '1급', '특급'];
  const playerGradeIndex = gradeOrder.indexOf(playerGrade);
  const opponentGradeIndex = gradeOrder.indexOf(opponentGrade);

  if (won && opponentGradeIndex > playerGradeIndex) {
    bonus += 20;
    reasons.push('상위 등급 격파 +20');
  }

  // 연승 보너스
  if (won && winStreak > 1) {
    const streakBonus = (winStreak - 1) * 5;
    bonus += streakBonus;
    reasons.push(`${winStreak}연승 보너스 +${streakBonus}`);
  }

  // 퍼펙트 승리
  if (won && isPerfectWin) {
    bonus += 20;
    reasons.push('퍼펙트 승리 +20');
  }

  return {
    base,
    bonus,
    total: base + bonus,
    reasons
  };
}

/**
 * 레벨업 체크
 */
export function checkLevelUp(currentExp: number, currentLevel: number): {
  newLevel: number;
  newExp: number;
  leveledUp: boolean;
} {
  if (currentLevel >= MAX_LEVEL) {
    return { newLevel: currentLevel, newExp: currentExp, leveledUp: false };
  }

  let newLevel = currentLevel;
  let newExp = currentExp;
  let leveledUp = false;

  while (newLevel < MAX_LEVEL && newExp >= EXP_TABLE[newLevel]) {
    newLevel++;
    leveledUp = true;
  }

  return { newLevel, newExp, leveledUp };
}

/**
 * 다음 레벨까지 필요한 경험치
 */
export function getExpToNextLevel(currentExp: number, currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) {
    return 0;
  }
  return EXP_TABLE[currentLevel] - currentExp;
}

/**
 * 현재 레벨 진행률 (%)
 */
export function getLevelProgress(currentExp: number, currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) {
    return 100;
  }

  const prevLevelExp = currentLevel > 1 ? EXP_TABLE[currentLevel - 1] : 0;
  const nextLevelExp = EXP_TABLE[currentLevel];
  const expInLevel = currentExp - prevLevelExp;
  const expNeeded = nextLevelExp - prevLevelExp;

  return Math.floor((expInLevel / expNeeded) * 100);
}
