// ========================================
// 전투 계산 시스템
// ========================================

import type {
  Stats,
  Arena,
  CharacterCard,
  PlayerCard,
  CombatStats,
  BattleCalculation,
  RoundResult,
  SkillEffect
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

  // 기본 스탯
  const stats: Stats = { ...baseCard.baseStats };

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
  const stats: Stats = { ...characterCard.baseStats };

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

  // 데미지 계산
  const playerDamage = calculateDamage(playerStats, aiStats, arena);
  const aiDamage = calculateDamage(aiStats, playerStats, arena);

  // HP 적용 (선공이 먼저 공격)
  let playerFinalHp = playerStats.hp;
  let aiFinalHp = aiStats.hp;

  if (playerFirst) {
    aiFinalHp -= playerDamage;
    if (aiFinalHp > 0) {
      playerFinalHp -= aiDamage;
    }
  } else {
    playerFinalHp -= aiDamage;
    if (playerFinalHp > 0) {
      aiFinalHp -= playerDamage;
    }
  }

  // 승패 판정
  let winner: 'PLAYER' | 'AI' | 'DRAW';
  if (aiFinalHp <= 0 && playerFinalHp <= 0) {
    winner = 'DRAW';
  } else if (aiFinalHp <= 0) {
    winner = 'PLAYER';
  } else if (playerFinalHp <= 0) {
    winner = 'AI';
  } else {
    // 둘 다 살아있으면 남은 HP로 판정
    if (playerFinalHp > aiFinalHp) {
      winner = 'PLAYER';
    } else if (aiFinalHp > playerFinalHp) {
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
    playerDamage,
    aiDamage,
    playerFinalHp: Math.max(0, playerFinalHp),
    aiFinalHp: Math.max(0, aiFinalHp),
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
  const gradeOrder = ['D', 'C', 'B', 'A', 'S'];
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
