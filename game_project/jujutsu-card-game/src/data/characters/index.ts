// ========================================
// 캐릭터 데이터 통합 (70명)
// 특급 12 / 1급 25 / 준1급 17 / 2급 12 / 3급 4
// 8각형 스탯 시스템 적용
// ========================================

import type { CharacterCard, Stats, LegacyGrade } from '../../types';
import { SPECIAL_GRADE as RAW_SPECIAL_GRADE } from './special-grade';
import { FIRST_GRADE as RAW_FIRST_GRADE } from './first-grade';
import { SEMI_FIRST_GRADE as RAW_SEMI_FIRST_GRADE } from './semi-first-grade';
import { SECOND_GRADE as RAW_SECOND_GRADE } from './second-grade';
import { THIRD_GRADE as RAW_THIRD_GRADE } from './third-grade';
import { GRADE_BASE_NEW_STATS } from '../growthSystem';

// ========================================
// 8스탯 마이그레이션
// ========================================

// 기존 5스탯 캐릭터에 신규 3스탯 자동 추가
function migrateCharacterStats(character: CharacterCard): CharacterCard {
  const legacyStats = character.baseStats as { atk: number; def: number; spd: number; ce: number; hp: number };

  // 이미 8스탯이면 그대로 반환
  if ('crt' in character.baseStats) {
    return character;
  }

  // 등급에 따른 신규 스탯 가져오기
  const newStats = GRADE_BASE_NEW_STATS[character.grade as LegacyGrade] || GRADE_BASE_NEW_STATS['3급'];

  // 8스탯으로 확장
  const fullStats: Stats = {
    atk: legacyStats.atk,
    def: legacyStats.def,
    spd: legacyStats.spd,
    ce: legacyStats.ce,
    hp: legacyStats.hp,
    crt: newStats.crt,
    tec: newStats.tec,
    mnt: newStats.mnt
  };

  return {
    ...character,
    baseStats: fullStats
  };
}

// 모든 캐릭터에 마이그레이션 적용
function migrateAllCharacters(characters: CharacterCard[]): CharacterCard[] {
  return characters.map(migrateCharacterStats);
}

// 마이그레이션된 등급별 캐릭터
export const SPECIAL_GRADE = migrateAllCharacters(RAW_SPECIAL_GRADE);
export const FIRST_GRADE = migrateAllCharacters(RAW_FIRST_GRADE);
export const SEMI_FIRST_GRADE = migrateAllCharacters(RAW_SEMI_FIRST_GRADE);
export const SECOND_GRADE = migrateAllCharacters(RAW_SECOND_GRADE);
export const THIRD_GRADE = migrateAllCharacters(RAW_THIRD_GRADE);

// 전체 캐릭터 배열 (8스탯 적용됨)
export const ALL_CHARACTERS: CharacterCard[] = [
  ...SPECIAL_GRADE,
  ...FIRST_GRADE,
  ...SEMI_FIRST_GRADE,
  ...SECOND_GRADE,
  ...THIRD_GRADE
];

// 전체 캐릭터 ID 목록
export const ALL_CHARACTER_IDS: string[] = ALL_CHARACTERS.map(c => c.id);

// ID로 캐릭터 검색
export const CHARACTERS_BY_ID = ALL_CHARACTERS.reduce((acc, char) => {
  acc[char.id] = char;
  return acc;
}, {} as Record<string, CharacterCard>);

// 등급별 캐릭터
export const CHARACTERS_BY_GRADE = {
  '특급': SPECIAL_GRADE,
  '1급': FIRST_GRADE,
  '준1급': SEMI_FIRST_GRADE,
  '2급': SECOND_GRADE,
  '3급': THIRD_GRADE
};

// 초기 크루용 기본 캐릭터 ID (6장)
export const STARTER_CREW = [
  'itadori_yuji',
  'fushiguro_megumi',
  'kugisaki_nobara',
  'panda',
  'inumaki_toge',
  'maki_zenin'
];

// 등급별 캐릭터는 이미 위에서 export됨
// SPECIAL_GRADE, FIRST_GRADE, SEMI_FIRST_GRADE, SECOND_GRADE, THIRD_GRADE
