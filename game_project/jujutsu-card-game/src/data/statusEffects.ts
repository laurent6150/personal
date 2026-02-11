// ========================================
// 상태이상 효과 데이터
// ========================================

import type { StatusEffect } from '../types';

// 상태이상 목록
export const STATUS_EFFECTS: Record<string, StatusEffect> = {
  // === 제어 효과 ===
  stun: {
    id: 'stun',
    name: '기절',
    type: 'CONTROL',
    duration: 1,
    stackable: false,
    effect: { trigger: 'TURN_START', action: 'SKIP_TURN', value: 1 },
    icon: '💫'
  },
  seal: {
    id: 'seal',
    name: '술식 봉인',
    type: 'CONTROL',
    duration: 2,
    stackable: false,
    effect: { trigger: 'INSTANT', action: 'BLOCK_SKILL', value: 1 },
    icon: '🔒'
  },

  // === 지속 데미지 ===
  burn: {
    id: 'burn',
    name: '화상',
    type: 'DEBUFF',
    duration: 3,
    stackable: true,
    maxStacks: 3,
    effect: { trigger: 'TURN_END', action: 'DAMAGE', value: 5 },
    icon: '🔥'
  },
  bleed: {
    id: 'bleed',
    name: '출혈',
    type: 'DEBUFF',
    duration: 3,
    stackable: true,
    maxStacks: 5,
    effect: { trigger: 'ON_ACTION', action: 'DAMAGE', value: 3 },
    icon: '🩸'
  },
  poison: {
    id: 'poison',
    name: '독',
    type: 'DEBUFF',
    duration: 4,
    stackable: true,
    maxStacks: 3,
    effect: { trigger: 'TURN_END', action: 'DAMAGE', value: 4 },
    icon: '☠️'
  },

  // === 스탯 디버프 ===
  atk_down: {
    id: 'atk_down',
    name: '공격력 감소',
    type: 'DEBUFF',
    duration: 2,
    stackable: false,
    effect: { trigger: 'INSTANT', action: 'STAT_REDUCE', value: -5, stat: 'atk' },
    icon: '⚔️↓'
  },
  def_down: {
    id: 'def_down',
    name: '방어력 감소',
    type: 'DEBUFF',
    duration: 2,
    stackable: false,
    effect: { trigger: 'INSTANT', action: 'STAT_REDUCE', value: -5, stat: 'def' },
    icon: '🛡️↓'
  },
  spd_down: {
    id: 'spd_down',
    name: '감속',
    type: 'DEBUFF',
    duration: 2,
    stackable: false,
    effect: { trigger: 'INSTANT', action: 'STAT_REDUCE', value: -5, stat: 'spd' },
    icon: '🐢'
  },
  ce_down: {
    id: 'ce_down',
    name: '주력 감소',
    type: 'DEBUFF',
    duration: 2,
    stackable: false,
    effect: { trigger: 'INSTANT', action: 'STAT_REDUCE', value: -5, stat: 'ce' },
    icon: '🔮↓'
  },

  // === 특수 디버프 ===
  curse_mark: {
    id: 'curse_mark',
    name: '저주 낙인',
    type: 'DEBUFF',
    duration: 3,
    stackable: false,
    effect: { trigger: 'INSTANT', action: 'BLOCK_HEAL', value: 100 },
    icon: '💀'
  },
  marked_for_death: {
    id: 'marked_for_death',
    name: '처형 대상',
    type: 'DEBUFF',
    duration: 99,
    stackable: false,
    effect: { trigger: 'INSTANT', action: 'EXECUTE_THRESHOLD', value: 15 },
    icon: '⚰️'
  },
  vulnerable: {
    id: 'vulnerable',
    name: '취약',
    type: 'DEBUFF',
    duration: 2,
    stackable: false,
    effect: { trigger: 'INSTANT', action: 'DAMAGE_TAKEN_INCREASE', value: 20 },
    icon: '💔'
  },

  // === 버프 ===
  atk_up: {
    id: 'atk_up',
    name: '공격력 증가',
    type: 'BUFF',
    duration: 2,
    stackable: false,
    effect: { trigger: 'INSTANT', action: 'STAT_BOOST', value: 5, stat: 'atk' },
    icon: '⚔️↑'
  },
  def_up: {
    id: 'def_up',
    name: '방어력 증가',
    type: 'BUFF',
    duration: 2,
    stackable: false,
    effect: { trigger: 'INSTANT', action: 'STAT_BOOST', value: 5, stat: 'def' },
    icon: '🛡️↑'
  },
  spd_up: {
    id: 'spd_up',
    name: '가속',
    type: 'BUFF',
    duration: 2,
    stackable: false,
    effect: { trigger: 'INSTANT', action: 'STAT_BOOST', value: 5, stat: 'spd' },
    icon: '⚡'
  },
  regen: {
    id: 'regen',
    name: '재생',
    type: 'BUFF',
    duration: 3,
    stackable: false,
    effect: { trigger: 'TURN_END', action: 'HEAL', value: 8 },
    icon: '💚'
  },
  shield: {
    id: 'shield',
    name: '보호막',
    type: 'BUFF',
    duration: 2,
    stackable: false,
    effect: { trigger: 'INSTANT', action: 'ABSORB_DAMAGE', value: 15 },
    icon: '🛡️'
  },
  counter: {
    id: 'counter',
    name: '반격 태세',
    type: 'BUFF',
    duration: 2,
    stackable: false,
    effect: { trigger: 'ON_HIT', action: 'COUNTER_ATTACK', value: 50 },
    icon: '↩️'
  },
  evasion: {
    id: 'evasion',
    name: '회피',
    type: 'BUFF',
    duration: 1,
    stackable: false,
    effect: { trigger: 'ON_HIT', action: 'DODGE', value: 50 },
    icon: '💨'
  }
};

// 상태이상 ID로 조회
export function getStatusEffect(id: string): StatusEffect | undefined {
  return STATUS_EFFECTS[id];
}

// 버프인지 확인
export function isBuff(statusId: string): boolean {
  const effect = STATUS_EFFECTS[statusId];
  return effect?.type === 'BUFF';
}

// 디버프인지 확인
export function isDebuff(statusId: string): boolean {
  const effect = STATUS_EFFECTS[statusId];
  return effect?.type === 'DEBUFF' || effect?.type === 'CONTROL';
}
