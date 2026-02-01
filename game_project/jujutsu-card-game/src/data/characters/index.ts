// ========================================
// 캐릭터 데이터 통합 (54명)
// ========================================

import type { CharacterCard } from '../../types';
import { SPECIAL_GRADE } from './special-grade';
import { FIRST_GRADE } from './first-grade';
import { SEMI_FIRST_GRADE } from './semi-first-grade';
import { SECOND_GRADE } from './second-grade';
import { THIRD_GRADE } from './third-grade';

// 전체 캐릭터 배열
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

// 등급별 내보내기
export { SPECIAL_GRADE, FIRST_GRADE, SEMI_FIRST_GRADE, SECOND_GRADE, THIRD_GRADE };
