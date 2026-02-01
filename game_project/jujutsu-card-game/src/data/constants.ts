// ========================================
// 게임 상수 정의
// ========================================

import type { Attribute, AttributeInfo, Grade, GradeInfo } from '../types';

// 속성 정보
export const ATTRIBUTES: Record<Attribute, AttributeInfo> = {
  BARRIER: { ko: '결계', icon: '🔮', color: '#9B59B6' },
  BODY:    { ko: '신체', icon: '💪', color: '#E74C3C' },
  CURSE:   { ko: '저주', icon: '👁️', color: '#2C3E50' },
  SOUL:    { ko: '혼백', icon: '👻', color: '#1ABC9C' },
  CONVERT: { ko: '변환', icon: '🔥', color: '#F39C12' },
  RANGE:   { ko: '원거리', icon: '🎯', color: '#3498DB' }
};

// 속성 상성표: 각 속성 → [강한 속성들]
export const ATTRIBUTE_ADVANTAGE: Record<Attribute, Attribute[]> = {
  BARRIER: ['CURSE', 'CONVERT'],
  BODY:    ['BARRIER', 'CONVERT'],
  CURSE:   ['BODY', 'RANGE'],
  SOUL:    ['BARRIER', 'CURSE'],
  CONVERT: ['SOUL', 'RANGE'],
  RANGE:   ['BODY', 'SOUL']
};

// 상성 배율
export const ADVANTAGE_MULTIPLIER = 1.5;   // 유리할 때
export const DISADVANTAGE_MULTIPLIER = 0.7; // 불리할 때

// 등급 정보 (주술회전 등급 체계)
export const GRADES: Record<Grade, GradeInfo> = {
  '특급': { bg: '#FF6B6B', text: '#FFFFFF', maxInDeck: 1 },
  '1급': { bg: '#FFD93D', text: '#000000', maxInDeck: 2 },
  '준1급': { bg: '#6BCB77', text: '#FFFFFF', maxInDeck: 5 },
  '2급': { bg: '#4D96FF', text: '#FFFFFF', maxInDeck: 5 },
  '준2급': { bg: '#9B9B9B', text: '#FFFFFF', maxInDeck: 5 },
  '3급': { bg: '#C4C4C4', text: '#000000', maxInDeck: 5 }
};

// 레벨별 필요 경험치 (누적)
export const EXP_TABLE = [0, 100, 220, 360, 520, 700, 900, 1120, 1360, 1620];

// 경험치 보상
export const EXP_REWARDS = {
  WIN: 30,
  LOSE: 10,
  WIN_VS_HIGHER: 50,    // 높은 등급 상대로 승리
  STREAK_BONUS: 5,      // 연승당 보너스
  PERFECT_WIN: 20       // 퍼펙트 승리 (HP 손실 없음)
};

// 최대 레벨
export const MAX_LEVEL = 10;

// 크루 사이즈
export const CREW_SIZE = 5;

// 승리 조건
export const WIN_SCORE = 3;

// 최대 라운드
export const MAX_ROUNDS = 5;

// 스탯 아이콘
export const STAT_ICONS = {
  atk: '⚔️',
  def: '🛡️',
  spd: '⚡',
  ce: '💜',
  hp: '❤️'
};

// 스탯 한글명
export const STAT_NAMES: Record<string, string> = {
  atk: '공격력',
  def: '방어력',
  spd: '속도',
  ce: '저주력',
  hp: '체력'
};

// 아이템 등급 색상
export const RARITY_COLORS = {
  COMMON: '#9CA3AF',
  RARE: '#3B82F6',
  EPIC: '#8B5CF6',
  LEGENDARY: '#F59E0B'
};

// AI 난이도 설명
export const DIFFICULTY_INFO = {
  EASY: {
    name: '쉬움',
    description: '랜덤하게 카드를 선택합니다',
    winRate: '50%'
  },
  NORMAL: {
    name: '보통',
    description: '경기장에 유리한 카드를 우선 선택합니다',
    winRate: '45%'
  },
  HARD: {
    name: '어려움',
    description: '상성과 경기장을 종합적으로 판단합니다',
    winRate: '35%'
  }
};
