// ========================================
// 게임 상수 정의
// ========================================

import type { Attribute, AttributeInfo, LegacyGrade, GradeInfo } from '../types';

// 속성 정보
export const ATTRIBUTES: Record<Attribute, AttributeInfo> = {
  BARRIER: { ko: '결계', icon: '🔮', color: '#9B59B6' },
  BODY:    { ko: '신체', icon: '💪', color: '#E74C3C' },
  CURSE:   { ko: '저주', icon: '👁️', color: '#A855F7' },
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
// Phase 5.3: 등급 제한 제거 → CP 샐러리캡으로 대체 (maxInDeck은 레거시 호환용으로 유지, 실제 제한 없음)
export const GRADES: Record<LegacyGrade, GradeInfo> = {
  '특급': { bg: '#FF6B6B', text: '#FFFFFF', maxInDeck: 8 },  // CP 샐러리캡으로 제한
  '준특급': { bg: '#FF8C42', text: '#FFFFFF', maxInDeck: 8 }, // CP 샐러리캡으로 제한
  '1급': { bg: '#FFD93D', text: '#000000', maxInDeck: 8 },   // CP 샐러리캡으로 제한
  '준1급': { bg: '#6BCB77', text: '#FFFFFF', maxInDeck: 8 },
  '2급': { bg: '#4D96FF', text: '#FFFFFF', maxInDeck: 8 },
  '준2급': { bg: '#9B9B9B', text: '#FFFFFF', maxInDeck: 8 },
  '3급': { bg: '#C4C4C4', text: '#000000', maxInDeck: 8 }
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
export const ROSTER_SIZE = 6;        // 기본 로스터 카드 수 (드래프트 시 팀당 선택 수)
export const BATTLE_SIZE = 6;        // 배틀 참가 카드 수
export const CREW_SIZE = BATTLE_SIZE; // 레거시 호환 (= BATTLE_SIZE)
export const DRAFT_ROUNDS = 6;       // 스네이크 드래프트 라운드 수 (= ROSTER_SIZE)
export const CREW_COUNT = 10;        // 총 크루 수 (플레이어 1 + AI 9)
export const REGULAR_SEASON_GAMES = 9; // 정규시즌 반기당 경기 수 (9팀 × 2회전 / 2반기)

// 승리 조건
export const WIN_SCORE = 3;          // 5라운드 중 3승 필요

// 최대 라운드
export const MAX_ROUNDS = 5;         // 6장 배틀 카드 중 5장 사용 (1장 미사용)

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

// 총 정규시즌 경기 수 (전반기 9 + 후반기 9 = 18경기)
export const TOTAL_SEASON_GAMES = REGULAR_SEASON_GAMES * SEASON_HALVES;

// 트레이드 윈도우 오픈 시점 (전반기 종료 후)
export const TRADE_WINDOW_OPEN_AT = REGULAR_SEASON_GAMES;

// 트레이드 마감 경기 (후반기 5경기째 = 전체 14경기째)
export const TRADE_DEADLINE_GAME = REGULAR_SEASON_GAMES + 5;

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

// 샐러리 캡 (크루 총 연봉 한도) - 하드캡
export const SALARY_CAP = 18000;

// 소프트 캡 (럭셔리 택스 기준)
export const SOFT_SALARY_CAP = 15000;

// ========================================
// Phase 5.3: 소프트캡 초과 페널티 (럭셔리 택스)
// ========================================

// 소프트캡 초과 시 럭셔리 택스율 (초과분의 퍼센트)
export const LUXURY_TAX_RATE = 0.5;  // 50% - 초과분만큼 추가 CP 지출

// 소프트캡 초과 시 경기 보상 감소율
export const SOFT_CAP_REWARD_PENALTY = 0.2;  // 20% 감소

// 소프트캡 초과 구간별 페널티 (심각도에 따라)
export const LUXURY_TAX_BRACKETS = [
  { threshold: 0, rate: 0.5 },      // 소프트캡 초과 0~2000: 50%
  { threshold: 2000, rate: 0.75 },  // 소프트캡 초과 2000~4000: 75%
  { threshold: 4000, rate: 1.0 },   // 소프트캡 초과 4000~: 100%
];

// ========================================
// Phase 5: 카드 CP 가치 (트레이드용)
// ========================================

// 등급별 기본 카드 가치 (CP)
export const CARD_BASE_VALUE: Record<LegacyGrade, number> = {
  '특급': 8000,   // 최상위 등급
  '준특급': 6500,
  '1급': 5000,
  '준1급': 3000,
  '2급': 2000,
  '준2급': 1200,
  '3급': 800,
};

// 레벨당 가치 증가 (CP)
export const CARD_VALUE_PER_LEVEL: Record<LegacyGrade, number> = {
  '특급': 500,
  '준특급': 400,
  '1급': 300,
  '준1급': 200,
  '2급': 150,
  '준2급': 100,
  '3급': 60,
};

// 생애주기별 가치 배율
export const CAREER_PHASE_VALUE_MULTIPLIER: Record<string, number> = {
  'ROOKIE': 1.1,              // 잠재력 +10%
  'GROWTH': 1.0,              // 기본
  'PEAK': 1.2,                // 전성기 +20%
  'DECLINE': 0.7,             // 쇠퇴기 -30%
  'RETIREMENT_ELIGIBLE': 0.4, // 은퇴 권유 -60%
};

// ========================================
// Phase 5: 활동 시스템 상수
// ========================================

// 경기당 활동 포인트 획득 (승패별 차등 지급)
export const AP_PER_MATCH = 2;        // 기본값 (레거시 호환)
export const AP_WIN = 3;              // 승리 시
export const AP_LOSE = 1;             // 패배 시
export const AP_DRAW = 2;             // 무승부 시

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
