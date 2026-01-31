// ========================================
// 속성 상성 시스템
// ========================================

import type { Attribute, Arena, ArenaEffect } from '../types';
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
