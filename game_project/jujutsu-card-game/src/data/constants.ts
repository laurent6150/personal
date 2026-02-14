// ========================================
// 게임 상수 정의
// ========================================

import type { Attribute, AttributeInfo, LegacyGrade, GradeInfo } from '../types';

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

// 등급 정보 (주술회전 등급 체계) - 기존 6등급 호환
export const GRADES: Record<LegacyGrade, GradeInfo> = {
  '특급': { bg: '#FF6B6B', text: '#FFFFFF', maxInDeck: 1 },
  '1급': { bg: '#FFD93D', text: '#000000', maxInDeck: 2 },
  '준1급': { bg: '#6BCB77', text: '#FFFFFF', maxInDeck: 6 },
  '2급': { bg: '#4D96FF', text: '#FFFFFF', maxInDeck: 6 },
  '준2급': { bg: '#9B9B9B', text: '#FFFFFF', maxInDeck: 6 },
  '3급': { bg: '#C4C4C4', text: '#000000', maxInDeck: 6 }
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

// 크루 시스템
export const CREW_SIZE = 6;          // 크루당 카드 수 (5 → 6)
export const CREW_COUNT = 8;         // 총 크루 수 (4 → 8)
export const REGULAR_SEASON_GAMES = 7; // 정규시즌 경기 수

// 승리 조건
export const WIN_SCORE = 3;          // 5라운드 중 3승 필요

// 최대 라운드
export const MAX_ROUNDS = 5;         // 6장 크루 중 5장 사용 (1장 미사용)

// 스탯 아이콘 (8스탯 시스템)
export const STAT_ICONS = {
  atk: '⚔️',
  def: '🛡️',
  spd: '⚡',
  ce: '🔮',
  hp: '❤️',
  crt: '💥',  // 치명 (신규)
  tec: '🎯',  // 기술 (신규)
  mnt: '🧠'   // 정신 (신규)
};

// 스탯 한글명 (8스탯 시스템)
export const STAT_NAMES: Record<string, string> = {
  atk: '공격력',
  def: '방어력',
  spd: '속도',
  ce: '주력',
  hp: '체력',
  crt: '치명',  // 신규
  tec: '기술',  // 신규
  mnt: '정신'   // 신규
};

// 스탯 색상 (8각형 레이더 차트용)
export const STAT_COLORS: Record<string, string> = {
  atk: '#EF4444',  // 빨강
  def: '#3B82F6',  // 파랑
  spd: '#F59E0B',  // 노랑
  ce: '#8B5CF6',   // 보라
  hp: '#10B981',   // 초록
  crt: '#EC4899',  // 분홍
  tec: '#14B8A6',  // 청록
  mnt: '#6366F1'   // 인디고
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

// ========================================
// Phase 5: 시즌 구조 상수
// ========================================

// 시즌 반기 수
export const SEASON_HALVES = 2;

// 총 정규시즌 경기 수 (전반기 7 + 후반기 7 = 14경기)
export const TOTAL_SEASON_GAMES = REGULAR_SEASON_GAMES * SEASON_HALVES;

// 트레이드 윈도우 오픈 시점 (전반기 종료 후)
export const TRADE_WINDOW_OPEN_AT = 7;

// 트레이드 마감 경기 (후반기 5경기째 = 전체 12경기째)
export const TRADE_DEADLINE_GAME = 12;

// ========================================
// Phase 5: 드래프트 상수
// ========================================

// 드래프트 풀 최소 카드 수
export const DRAFT_POOL_MIN = 3;

// 드래프트 풀 최대 카드 수
export const DRAFT_POOL_MAX = 6;

// 드래프트 픽 트레이드 제한 (스테판 규칙: 연속 2시즌 픽 트레이드 불가)
export const STEFAN_RULE_CONSECUTIVE_SEASONS = 2;

// ========================================
// Phase 5: 크루 사이즈 상수
// ========================================

// 크루 최소 카드 수
export const MIN_CREW_SIZE = 5;

// 크루 최대 카드 수
export const MAX_CREW_SIZE = 8;

// ========================================
// Phase 5: 샐러리 캡 상수
// ========================================

// 샐러리 캡 (크루 총 연봉 한도)
export const SALARY_CAP = 15000;

// 소프트 캡 (경고 표시 기준)
export const SOFT_SALARY_CAP = 12000;

// ========================================
// Phase 5: 활동 시스템 상수
// ========================================

// 경기당 활동 포인트 획득
export const AP_PER_MATCH = 2;

// 전환기 활동 포인트 보너스
export const AP_HALF_TRANSITION_BONUS = 5;

// 최대 활동 포인트
export const MAX_AP = 20;

// ========================================
// Phase 5: 은퇴/노화 상수
// ========================================

// 은퇴 후 복귀 쿨다운 (특급)
export const COOLDOWN_SPECIAL_GRADE = 3;

// 은퇴 후 복귀 쿨다운 (1급 이하)
export const COOLDOWN_NORMAL_GRADE = 2;

// 후계자 효과 경험치 보너스 (같은 속성 +30%)
export const SUCCESSOR_EXP_BONUS = 0.3;

// ========================================
// Phase 5: 전투 성향 상수
// ========================================

// 전투 성향 상성 보너스
export const BATTLE_STYLE_ADVANTAGE_BONUS = 0.08;   // +8%

// 전투 성향 상성 패널티
export const BATTLE_STYLE_DISADVANTAGE_PENALTY = 0.08;  // -8%

// ========================================
// Phase 5: 라이벌 시스템 상수
// ========================================

// 라이벌 인정 최소 대전 횟수
export const RIVAL_MIN_MATCHES = 3;

// 라이벌전 공격력 보너스
export const RIVAL_ATK_BONUS = 0.05;  // +5%

// ========================================
// Phase 5: 관전 모드 상수
// ========================================

// 관전 보상 CP
export const SPECTATE_REWARD_CP = 50;
