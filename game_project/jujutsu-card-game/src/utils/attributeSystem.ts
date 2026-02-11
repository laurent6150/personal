// ========================================
// 속성 상성 시스템
// ========================================

import type { Attribute, Arena, ArenaEffect, Grade } from '../types';
import {
  ATTRIBUTE_ADVANTAGE,
  ADVANTAGE_MULTIPLIER,
  DISADVANTAGE_MULTIPLIER,
  ATTRIBUTES
} from '../data/constants';

/**
 * 속성 상성 배율 계산
 * @param attacker 공격자 속성
 * @param defender 방어자 속성
 * @returns 배율 (유리: 1.5, 불리: 0.7, 동등: 1.0)
 */
export function getAttributeMultiplier(attacker: Attribute, defender: Attribute): number {
  // 공격자가 방어자에게 유리한 경우
  if (ATTRIBUTE_ADVANTAGE[attacker].includes(defender)) {
    return ADVANTAGE_MULTIPLIER;
  }
  // 방어자가 공격자에게 유리한 경우 (= 공격자가 불리)
  if (ATTRIBUTE_ADVANTAGE[defender].includes(attacker)) {
    return DISADVANTAGE_MULTIPLIER;
  }
  // 동등
  return 1.0;
}

/**
 * 속성 상성 관계 확인
 * @param attacker 공격자 속성
 * @param defender 방어자 속성
 * @returns 'ADVANTAGE' | 'DISADVANTAGE' | 'NEUTRAL'
 */
export function getAttributeRelation(
  attacker: Attribute,
  defender: Attribute
): 'ADVANTAGE' | 'DISADVANTAGE' | 'NEUTRAL' {
  if (ATTRIBUTE_ADVANTAGE[attacker].includes(defender)) {
    return 'ADVANTAGE';
  }
  if (ATTRIBUTE_ADVANTAGE[defender].includes(attacker)) {
    return 'DISADVANTAGE';
  }
  return 'NEUTRAL';
}

/**
 * 경기장 효과에 따른 속성 보너스 계산
 * @param attribute 캐릭터 속성
 * @param arena 경기장
 * @returns 보너스 배율 (예: 0.15 = +15%)
 */
export function getArenaAttributeBonus(attribute: Attribute, arena: Arena): number {
  let bonus = 0;

  for (const effect of arena.effects) {
    if (effect.type === 'ATTRIBUTE_BOOST' && effect.target === attribute) {
      bonus += effect.value;
    }
    if (effect.type === 'ATTRIBUTE_WEAKEN' && effect.target === attribute) {
      bonus += effect.value; // 음수값
    }
  }

  return bonus;
}

/**
 * 경기장의 특수 규칙 확인
 * @param arena 경기장
 * @returns 특수 규칙 효과 배열
 */
export function getArenaSpecialRules(arena: Arena): ArenaEffect[] {
  return arena.effects.filter(effect => effect.type === 'SPECIAL_RULE');
}

/**
 * 경기장의 스탯 수정 효과 확인
 * @param arena 경기장
 * @returns 스탯 수정값 (ALL 타겟인 경우)
 */
export function getArenaStatModifier(arena: Arena): number {
  let modifier = 0;

  for (const effect of arena.effects) {
    if (effect.type === 'STAT_MODIFY' && effect.target === 'ALL') {
      modifier += effect.value;
    }
  }

  return modifier;
}

/**
 * 속성 상성 무효 경기장인지 확인
 * @param arena 경기장
 * @returns 상성 무효 여부
 */
export function isAttributeNullifiedArena(arena: Arena): boolean {
  return arena.effects.some(
    effect => effect.type === 'SPECIAL_RULE' && effect.description.includes('속성 상성 무효')
  );
}

/**
 * SPD 역전 경기장인지 확인
 * @param arena 경기장
 * @returns SPD 역전 여부
 */
export function isSpeedReversedArena(arena: Arena): boolean {
  return arena.effects.some(
    effect => effect.type === 'SPECIAL_RULE' && effect.description.includes('SPD 역전')
  );
}

/**
 * 스킬 봉인 확률 경기장인지 확인
 * @param arena 경기장
 * @returns 스킬 봉인 확률 (0이면 봉인 없음)
 */
export function getSkillSealProbability(arena: Arena): number {
  const effect = arena.effects.find(
    effect => effect.type === 'SPECIAL_RULE' && effect.description.includes('스킬 봉인')
  );
  return effect?.value ?? 0;
}

/**
 * 속성 정보 가져오기
 * @param attribute 속성
 * @returns 속성 정보 (한글명, 아이콘, 색상)
 */
export function getAttributeInfo(attribute: Attribute) {
  return ATTRIBUTES[attribute];
}

/**
 * 속성에 강한 속성들 가져오기
 * @param attribute 속성
 * @returns 해당 속성에 강한 속성 배열
 */
export function getWeakAgainst(attribute: Attribute): Attribute[] {
  // 이 속성에게 강한 속성들 (이 속성이 약한 속성들)
  return (Object.keys(ATTRIBUTE_ADVANTAGE) as Attribute[]).filter(
    attr => ATTRIBUTE_ADVANTAGE[attr].includes(attribute)
  );
}

/**
 * 속성이 강한 상대 속성들 가져오기
 * @param attribute 속성
 * @returns 이 속성이 강한 상대 속성 배열
 */
export function getStrongAgainst(attribute: Attribute): Attribute[] {
  return ATTRIBUTE_ADVANTAGE[attribute];
}

// ========================================
// 신규 경기장 특수 효과 함수들
// ========================================

/**
 * LOW_DEF 효과: DEF가 낮은 쪽에게 버프 적용
 * @returns DEF 버프량 (낮은 쪽에게만)
 */
export function getLowDefBonus(
  playerDef: number,
  aiDef: number,
  arena: Arena
): { player: number; ai: number } {
  const effect = arena.effects.find(e => e.target === 'LOW_DEF');
  if (!effect) return { player: 0, ai: 0 };

  if (playerDef < aiDef) {
    return { player: effect.value, ai: 0 };
  } else if (aiDef < playerDef) {
    return { player: 0, ai: effect.value };
  }
  // 동일한 경우 양쪽 모두 버프
  return { player: effect.value, ai: effect.value };
}

/**
 * HIGHEST_ATK 효과: 최고 ATK 캐릭터에게 디버프 적용
 * @returns ATK 배율 (디버프 적용)
 */
export function getHighestAtkDebuff(
  playerAtk: number,
  aiAtk: number,
  arena: Arena
): { player: number; ai: number } {
  const effect = arena.effects.find(e => e.target === 'HIGHEST_ATK');
  if (!effect) return { player: 1, ai: 1 };

  if (playerAtk > aiAtk) {
    return { player: 1 + effect.value, ai: 1 }; // value는 음수 (예: -0.30)
  } else if (aiAtk > playerAtk) {
    return { player: 1, ai: 1 + effect.value };
  }
  // 동일한 경우 양쪽 모두 디버프
  return { player: 1 + effect.value, ai: 1 + effect.value };
}

/**
 * FIRST_STRIKE 효과: 선공 시 추가 데미지
 */
export function getFirstStrikeBonus(arena: Arena): number {
  const effect = arena.effects.find(e => e.target === 'FIRST_STRIKE');
  return effect?.value ?? 0;
}

/**
 * LOW_HP 효과: HP가 50% 이하일 때 스탯 버프
 */
export function getLowHpBonus(
  currentHp: number,
  maxHp: number,
  arena: Arena
): number {
  const effect = arena.effects.find(e => e.target === 'LOW_HP');
  if (!effect) return 0;

  const hpRatio = currentHp / maxHp;
  return hpRatio <= 0.5 ? effect.value : 0;
}

/**
 * SPECIAL_GRADE 효과: 특급 등급에게만 적용
 */
export function getSpecialGradeBonus(
  grade: Grade,
  arena: Arena
): number {
  const effect = arena.effects.find(e => e.target === 'SPECIAL_GRADE');
  if (!effect || grade !== '특급') return 0;
  return effect.value;
}

/**
 * NON_SPECIAL 효과: 1급 이하 캐릭터에게만 적용
 */
export function getNonSpecialBonus(
  grade: Grade,
  arena: Arena
): number {
  const effect = arena.effects.find(e => e.target === 'NON_SPECIAL');
  if (!effect || grade === '특급') return 0;
  return effect.value;
}

/**
 * RANDOM (도박장) 효과: 50% 확률로 ATK 변동
 * @returns ATK 변동량 (+5 또는 -3)
 */
export function getRandomGambleBonus(arena: Arena): number {
  const effect = arena.effects.find(e => e.target === 'RANDOM');
  if (!effect) return 0;

  // 50% 확률로 +5, 50% 확률로 -3
  return Math.random() < effect.value ? 5 : -3;
}

/**
 * RANDOM_DEBUFF 효과: 랜덤 스탯 감소
 * @returns 감소할 스탯과 값
 */
export function getRandomDebuff(
  arena: Arena
): { stat: 'atk' | 'def' | 'spd' | 'ce' | 'hp'; value: number } | null {
  const effect = arena.effects.find(e => e.target === 'RANDOM_DEBUFF');
  if (!effect) return null;

  const stats: ('atk' | 'def' | 'spd' | 'ce' | 'hp')[] = ['atk', 'def', 'spd', 'ce', 'hp'];
  const randomStat = stats[Math.floor(Math.random() * stats.length)];
  return { stat: randomStat, value: -2 }; // 항상 -2 감소
}

/**
 * HEAL 효과: 회복 스킬 효과 증폭
 */
export function getHealBonus(arena: Arena): number {
  const effect = arena.effects.find(e => e.target === 'HEAL');
  return effect?.value ?? 0;
}

/**
 * ON_HEAL 효과: HP 회복 시 ATK 버프
 */
export function getOnHealBonus(arena: Arena): number {
  const effect = arena.effects.find(e => e.target === 'ON_HEAL');
  return effect?.value ?? 0;
}

/**
 * LOSER 효과: 패배 시 포인트 배수 확인
 */
export function getLoserPenaltyMultiplier(arena: Arena): number {
  const effect = arena.effects.find(e => e.target === 'LOSER');
  return effect?.value ?? 1;
}

/**
 * 크리티컬 확률 보너스 확인
 */
export function getCriticalBonus(arena: Arena): number {
  const effect = arena.effects.find(
    e => e.type === 'SPECIAL_RULE' && e.description.includes('크리티컬')
  );
  return effect?.value ?? 0;
}

/**
 * 특정 스탯에 대한 경기장 수정자 가져오기
 */
export function getArenaStatModifierForStat(
  arena: Arena,
  stat: 'atk' | 'def' | 'spd' | 'ce' | 'hp',
  grade?: Grade
): number {
  let modifier = 0;

  for (const effect of arena.effects) {
    if (effect.type === 'STAT_MODIFY') {
      // ALL 타겟이고 해당 스탯인 경우
      if (effect.target === 'ALL' && effect.stat === stat) {
        modifier += effect.value;
      }
      // SPECIAL_GRADE 타겟이고 특급인 경우
      if (effect.target === 'SPECIAL_GRADE' && grade === '특급' && effect.stat === stat) {
        modifier += effect.value;
      }
    }
  }

  return modifier;
}
