// ========================================
// 필살기 효과 데이터
// 캐릭터별 필살기의 damage, ceCost, effects 정의
// ========================================

import type { UltimateEffect } from '../types';

export interface UltimateSkillData {
  damage: number;
  ceCost: number;
  effects: UltimateEffect[];
}

// 캐릭터 ID를 키로 사용하는 필살기 효과 맵
export const ULTIMATE_SKILL_EFFECTS: Record<string, UltimateSkillData> = {
  // ========================================
  // 특급 (8명)
  // ========================================

  gojo_satoru: {
    damage: 45,
    ceCost: 8,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'stun', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'ce_down', chance: 100 }
    ]
  },

  geto_suguru: {
    damage: 43,
    ceCost: 7,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'def_down', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'curse_mark', chance: 50 }
    ]
  },

  yuta_okkotsu: {
    damage: 48,
    ceCost: 8,
    effects: [
      { type: 'LIFESTEAL', target: 'SELF', value: 30 },
      { type: 'STATUS', target: 'SELF', statusId: 'atk_up', chance: 100 }
    ]
  },

  yuki_tsukumo: {
    damage: 46,
    ceCost: 7,
    effects: [
      { type: 'IGNORE_DEF', target: 'ENEMY', value: 50 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'spd_down', chance: 80 }
    ]
  },

  kenjaku: {
    damage: 44,
    ceCost: 7,
    effects: [
      { type: 'CE_DRAIN', target: 'ENEMY', value: 5 },
      { type: 'STATUS', target: 'SELF', statusId: 'regen', chance: 100 }
    ]
  },

  tengen: {
    damage: 35,
    ceCost: 6,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'shield', value: 25 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'seal', chance: 70 }
    ]
  },

  ryomen_sukuna: {
    damage: 52,
    ceCost: 9,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'marked_for_death', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'bleed', chance: 100 }
    ]
  },

  fushiguro_toji: {
    damage: 50,
    ceCost: 0,
    effects: [
      { type: 'IGNORE_DEF', target: 'ENEMY', value: 100 },
      { type: 'CRITICAL_GUARANTEED', target: 'SELF' }
    ]
  },

  // ========================================
  // 1급 (16명)
  // ========================================

  itadori_yuji: {
    damage: 40,
    ceCost: 5,
    effects: [
      { type: 'MULTI_HIT', target: 'ENEMY', value: 3 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'stun', chance: 40 }
    ]
  },

  maki_zenin_awakened: {
    damage: 47,
    ceCost: 0,
    effects: [
      { type: 'IGNORE_DEF', target: 'ENEMY', value: 70 },
      { type: 'STATUS', target: 'SELF', statusId: 'spd_up', chance: 100 },
      { type: 'STATUS', target: 'SELF', statusId: 'atk_up', chance: 100 }
    ]
  },

  nanami_kento: {
    damage: 55,
    ceCost: 6,
    effects: [
      { type: 'CRITICAL_GUARANTEED', target: 'SELF' },
      { type: 'SELF_DAMAGE', target: 'SELF', value: 10 }
    ]
  },

  jogo: {
    damage: 42,
    ceCost: 7,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'burn', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'burn', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'burn', chance: 80 }
    ]
  },

  hanami: {
    damage: 38,
    ceCost: 6,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'poison', chance: 100 },
      { type: 'HEAL_SELF', target: 'SELF', value: 15 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'spd_down', chance: 70 }
    ]
  },

  naobito_zenin: {
    damage: 44,
    ceCost: 6,
    effects: [
      { type: 'MULTI_HIT', target: 'ENEMY', value: 4 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'spd_down', chance: 90 }
    ]
  },

  naoya_zenin: {
    damage: 42,
    ceCost: 5,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'spd_down', chance: 100 },
      { type: 'STATUS', target: 'SELF', statusId: 'evasion', chance: 100 }
    ]
  },

  hiromi_higuruma: {
    damage: 38,
    ceCost: 7,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'seal', chance: 100 },
      { type: 'REMOVE_BUFF', target: 'ENEMY' },
      { type: 'STATUS', target: 'ENEMY', statusId: 'ce_down', chance: 100 }
    ]
  },

  hajime_kashimo: {
    damage: 48,
    ceCost: 8,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'burn', chance: 80 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'stun', chance: 30 },
      { type: 'SELF_DAMAGE', target: 'SELF', value: 15 }
    ]
  },

  ryu_ishigori: {
    damage: 58,
    ceCost: 8,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'def_down', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'burn', chance: 60 }
    ]
  },

  takako_uro: {
    damage: 40,
    ceCost: 6,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'evasion', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'vulnerable', chance: 80 }
    ]
  },

  kinji_hakari: {
    damage: 35,
    ceCost: 7,
    effects: [
      { type: 'RANDOM_DAMAGE', target: 'ENEMY', value: { min: 20, max: 70 } },
      { type: 'STATUS', target: 'SELF', statusId: 'regen', chance: 50 }
    ]
  },

  choso: {
    damage: 42,
    ceCost: 6,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'bleed', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'bleed', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'bleed', chance: 80 }
    ]
  },

  todo_aoi: {
    damage: 44,
    ceCost: 5,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'atk_up', chance: 100 },
      { type: 'MULTI_HIT', target: 'ENEMY', value: 2 }
    ]
  },

  uraume: {
    damage: 40,
    ceCost: 6,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'spd_down', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'stun', chance: 40 }
    ]
  },

  yorozu: {
    damage: 45,
    ceCost: 7,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'def_up', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'def_down', chance: 80 },
      { type: 'IGNORE_DEF', target: 'ENEMY', value: 30 }
    ]
  },

  // ========================================
  // 준1급 (14명)
  // ========================================

  fushiguro_megumi: {
    damage: 40,
    ceCost: 7,
    effects: [
      { type: 'MULTI_HIT', target: 'ENEMY', value: 3 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'vulnerable', chance: 70 }
    ]
  },

  mahito: {
    damage: 43,
    ceCost: 7,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'curse_mark', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'def_down', chance: 80 }
    ]
  },

  mei_mei: {
    damage: 50,
    ceCost: 6,
    effects: [
      { type: 'MULTI_HIT', target: 'ENEMY', value: 5 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'bleed', chance: 60 }
    ]
  },

  inumaki_toge: {
    damage: 45,
    ceCost: 7,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'stun', chance: 70 },
      { type: 'SELF_DAMAGE', target: 'SELF', value: 12 }
    ]
  },

  maki_zenin_normal: {
    damage: 38,
    ceCost: 4,
    effects: [
      { type: 'MULTI_HIT', target: 'ENEMY', value: 3 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'bleed', chance: 50 }
    ]
  },

  angel_hana: {
    damage: 35,
    ceCost: 8,
    effects: [
      { type: 'REMOVE_BUFF', target: 'ENEMY' },
      { type: 'STATUS', target: 'ENEMY', statusId: 'seal', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'ce_down', chance: 100 }
    ]
  },

  reggie_star: {
    damage: 42,
    ceCost: 6,
    effects: [
      { type: 'MULTI_HIT', target: 'ENEMY', value: 4 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'burn', chance: 40 }
    ]
  },

  fumihiko_takaba: {
    damage: 30,
    ceCost: 5,
    effects: [
      { type: 'RANDOM_DAMAGE', target: 'ENEMY', value: { min: 10, max: 60 } },
      { type: 'HEAL_SELF', target: 'SELF', value: 20 },
      { type: 'REMOVE_DEBUFF', target: 'SELF' }
    ]
  },

  charles_bernard: {
    damage: 36,
    ceCost: 5,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'evasion', chance: 100 },
      { type: 'STATUS', target: 'SELF', statusId: 'counter', chance: 100 }
    ]
  },

  jinichi_zenin: {
    damage: 40,
    ceCost: 5,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'bleed', chance: 80 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'atk_down', chance: 60 }
    ]
  },

  ogi_zenin: {
    damage: 43,
    ceCost: 6,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'burn', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'def_down', chance: 50 }
    ]
  },

  noritoshi_kamo: {
    damage: 38,
    ceCost: 5,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'spd_up', chance: 100 },
      { type: 'STATUS', target: 'SELF', statusId: 'atk_up', chance: 100 },
      { type: 'SELF_DAMAGE', target: 'SELF', value: 8 }
    ]
  },

  iori_hazenoki: {
    damage: 48,
    ceCost: 5,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'burn', chance: 100 },
      { type: 'SELF_DAMAGE', target: 'SELF', value: 15 }
    ]
  },

  kusakabe_atsuya: {
    damage: 38,
    ceCost: 4,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'counter', chance: 100 },
      { type: 'STATUS', target: 'SELF', statusId: 'def_up', chance: 100 }
    ]
  },

  // ========================================
  // 2급 (10명)
  // ========================================

  kugisaki_nobara: {
    damage: 38,
    ceCost: 5,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'curse_mark', chance: 70 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'bleed', chance: 80 }
    ]
  },

  panda: {
    damage: 42,
    ceCost: 5,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'atk_up', chance: 100 },
      { type: 'STATUS', target: 'SELF', statusId: 'def_up', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'stun', chance: 30 }
    ]
  },

  ino_takuma: {
    damage: 40,
    ceCost: 6,
    effects: [
      { type: 'RANDOM_DAMAGE', target: 'ENEMY', value: { min: 25, max: 55 } },
      { type: 'STATUS', target: 'SELF', statusId: 'spd_up', chance: 60 }
    ]
  },

  nishimiya_momo: {
    damage: 32,
    ceCost: 4,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'spd_down', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'atk_down', chance: 70 }
    ]
  },

  kasumi_miwa: {
    damage: 35,
    ceCost: 4,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'spd_up', chance: 100 },
      { type: 'CRITICAL_GUARANTEED', target: 'SELF' }
    ]
  },

  mai_zenin: {
    damage: 45,
    ceCost: 6,
    effects: [
      { type: 'IGNORE_DEF', target: 'ENEMY', value: 50 },
      { type: 'SELF_DAMAGE', target: 'SELF', value: 20 }
    ]
  },

  eso: {
    damage: 36,
    ceCost: 5,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'poison', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'poison', chance: 80 }
    ]
  },

  kechizu: {
    damage: 34,
    ceCost: 4,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'poison', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'def_down', chance: 70 }
    ]
  },

  utahime_iori: {
    damage: 20,
    ceCost: 5,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'atk_up', chance: 100 },
      { type: 'STATUS', target: 'SELF', statusId: 'def_up', chance: 100 },
      { type: 'STATUS', target: 'SELF', statusId: 'spd_up', chance: 100 }
    ]
  },

  shoko_ieiri: {
    damage: 0,
    ceCost: 6,
    effects: [
      { type: 'HEAL_SELF', target: 'SELF', value: 50 },
      { type: 'REMOVE_DEBUFF', target: 'SELF' },
      { type: 'STATUS', target: 'SELF', statusId: 'regen', chance: 100 }
    ]
  },

  // ========================================
  // 준2급 (필요 시 추가)
  // ========================================

  // ========================================
  // 3급 (6명)
  // ========================================

  yu_haibara: {
    damage: 35,
    ceCost: 4,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'atk_up', chance: 100 },
      { type: 'STATUS', target: 'SELF', statusId: 'regen', chance: 50 }
    ]
  },

  kiyotaka_ijichi: {
    damage: 15,
    ceCost: 4,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'shield', value: 30 },
      { type: 'STATUS', target: 'SELF', statusId: 'evasion', chance: 80 }
    ]
  },

  akari_nitta: {
    damage: 0,
    ceCost: 4,
    effects: [
      { type: 'HEAL_SELF', target: 'SELF', value: 30 },
      { type: 'STATUS', target: 'SELF', statusId: 'regen', chance: 100 },
      { type: 'REMOVE_DEBUFF', target: 'SELF' }
    ]
  },

  misato_kuroi: {
    damage: 25,
    ceCost: 3,
    effects: [
      { type: 'STATUS', target: 'SELF', statusId: 'counter', chance: 100 },
      { type: 'STATUS', target: 'SELF', statusId: 'def_up', chance: 100 }
    ]
  },

  masamichi_yaga: {
    damage: 38,
    ceCost: 5,
    effects: [
      { type: 'MULTI_HIT', target: 'ENEMY', value: 4 },
      { type: 'STATUS', target: 'SELF', statusId: 'def_up', chance: 60 }
    ]
  },

  eso_kechizu_duo: {
    damage: 42,
    ceCost: 5,
    effects: [
      { type: 'STATUS', target: 'ENEMY', statusId: 'poison', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'poison', chance: 100 },
      { type: 'STATUS', target: 'ENEMY', statusId: 'bleed', chance: 70 }
    ]
  }
};

// 캐릭터 ID로 필살기 효과 조회
export function getUltimateSkillEffects(characterId: string): UltimateSkillData | undefined {
  return ULTIMATE_SKILL_EFFECTS[characterId];
}

// 필살기 효과가 있는지 확인
export function hasUltimateSkillEffects(characterId: string): boolean {
  return characterId in ULTIMATE_SKILL_EFFECTS;
}
