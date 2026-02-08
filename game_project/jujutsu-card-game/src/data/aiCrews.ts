// ========================================
// AI 크루 데이터 - 54명 캐릭터 / 8팀 체계
// ========================================

import type { AICrew, Difficulty, LegacyGrade } from '../types';
import { ALL_CHARACTERS } from './characters';
import { CREW_SIZE, CREW_COUNT, SALARY_CAP } from './constants';
import { calculateSalary } from '../utils/salarySystem';

// AI 팀 기본 정보 (크루 카드는 시즌 시작 시 랜덤 배정)
export interface AICrewTemplate {
  id: string;
  name: string;
  difficulty: Difficulty;
  description: string;
}

// 등급별 최대 장수 (크루당)
const GRADE_LIMITS: Record<LegacyGrade, number> = {
  '특급': 1,
  '1급': 3,
  '준1급': 6,
  '2급': 6,
  '준2급': 6,
  '3급': 6
};

// AI 팀 템플릿 - 주술회전 세계관 영감 (7팀 = 8팀 - 플레이어 1팀)
export const AI_CREW_TEMPLATES: AICrewTemplate[] = [
  {
    id: 'heukseom',
    name: '흑섬',
    difficulty: 'HARD',
    description: '어둠을 가르는 검은 섬광'
  },
  {
    id: 'muryangongcheo',
    name: '무량공처',
    difficulty: 'HARD',
    description: '무한의 정보가 흐르는 영역'
  },
  {
    id: 'bokmajeonsin',
    name: '복마전신',
    difficulty: 'HARD',
    description: '끊임없는 참격의 신전'
  },
  {
    id: 'yeokrin',
    name: '역린',
    difficulty: 'NORMAL',
    description: '깨어난 자의 분노'
  },
  {
    id: 'jansang',
    name: '잔상',
    difficulty: 'NORMAL',
    description: '눈으로 쫓을 수 없는 속도'
  },
  {
    id: 'jeojubada',
    name: '저주의 바다',
    difficulty: 'NORMAL',
    description: '저주가 모여드는 심연'
  },
  {
    id: 'wonryeong',
    name: '원령',
    difficulty: 'EASY',
    description: '사랑이 낳은 복수의 혼령'
  }
];

// 배열 셔플 함수
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 캐릭터의 등급 가져오기
function getCharacterGrade(characterId: string): LegacyGrade | null {
  const char = ALL_CHARACTERS.find(c => c.id === characterId);
  return (char?.grade as LegacyGrade) || null;
}

// 등급을 고려하여 캐릭터를 크루에 배치 (등급 제한 준수)
function distributeCharactersWithGradeLimits(
  availableCharacters: string[],
  crewCount: number
): string[][] {
  // 등급별로 캐릭터 분류
  const byGrade: Record<string, string[]> = {
    '특급': [],
    '1급': [],
    '준1급': [],
    '2급': [],
    '준2급': [],
    '3급': []
  };

  for (const charId of availableCharacters) {
    const grade = getCharacterGrade(charId);
    if (grade && byGrade[grade]) {
      byGrade[grade].push(charId);
    }
  }

  // 각 등급 셔플
  Object.keys(byGrade).forEach(grade => {
    byGrade[grade] = shuffleArray(byGrade[grade]);
  });

  // 크루 초기화
  const crews: string[][] = Array.from({ length: crewCount }, () => []);

  // 1. 특급 배분 (각 크루 최대 1명)
  let specialIndex = 0;
  for (let i = 0; i < crewCount && specialIndex < byGrade['특급'].length; i++) {
    crews[i].push(byGrade['특급'][specialIndex++]);
  }

  // 2. 1급 배분 (각 크루 최대 3명)
  let firstGradeIndex = 0;
  for (let round = 0; round < 3; round++) {
    for (let i = 0; i < crewCount && firstGradeIndex < byGrade['1급'].length; i++) {
      crews[i].push(byGrade['1급'][firstGradeIndex++]);
    }
  }

  // 3. 나머지 등급 배분 (준1급, 2급, 준2급, 3급)
  const remainingCharacters = [
    ...byGrade['준1급'],
    ...byGrade['2급'],
    ...byGrade['준2급'],
    ...byGrade['3급']
  ];

  const shuffledRemaining = shuffleArray(remainingCharacters);
  let remainingIndex = 0;

  // 각 크루를 CREW_SIZE까지 채움
  for (let i = 0; i < crewCount; i++) {
    while (crews[i].length < CREW_SIZE && remainingIndex < shuffledRemaining.length) {
      crews[i].push(shuffledRemaining[remainingIndex++]);
    }
  }

  return crews;
}

// 시즌용 AI 크루 생성 (등급 제한 적용)
// 전체 카드 풀에서 플레이어 소유 카드 제외 후 등급 밸런스 유지하며 분배
// Phase 5.1: playerOwnedCards를 명시적으로 받아서 중복 방지
export function generateAICrewsForSeason(playerOwnedCards: string[] = []): AICrew[] {
  // 플레이어 소유 카드 제외한 가용 카드
  const availableCards = ALL_CHARACTERS
    .map(c => c.id)
    .filter(id => !playerOwnedCards.includes(id));

  // AI 크루 수 (총 크루 수 - 플레이어 1팀)
  const aiCrewCount = Math.min(CREW_COUNT - 1, AI_CREW_TEMPLATES.length);

  // 필요한 총 카드 수
  const totalCardsNeeded = aiCrewCount * CREW_SIZE;

  console.log(`[AI Crews] 총 캐릭터: ${ALL_CHARACTERS.length}장`);
  console.log(`[AI Crews] 플레이어 소유 카드: ${playerOwnedCards.length}장`);
  console.log(`[AI Crews] 가용 캐릭터: ${availableCards.length}장`);
  console.log(`[AI Crews] AI 크루 수: ${aiCrewCount}팀, 필요 카드: ${totalCardsNeeded}장`);

  // 등급 제한을 고려한 캐릭터 배분
  const distributedCrews = distributeCharactersWithGradeLimits(
    availableCards,
    aiCrewCount
  );

  // AI 크루 생성
  const aiCrews: AICrew[] = [];

  for (let i = 0; i < aiCrewCount; i++) {
    const template = AI_CREW_TEMPLATES[i];
    const crewCards = distributedCrews[i];

    // 등급 통계 로그
    const gradeStats: Record<string, number> = {};
    crewCards.forEach(id => {
      const grade = getCharacterGrade(id) || '?';
      gradeStats[grade] = (gradeStats[grade] || 0) + 1;
    });

    console.log(`[AI Crew] ${template.name}: ${crewCards.length}장`);
    console.log(`  등급: ${JSON.stringify(gradeStats)}`);
    console.log(`  멤버: ${crewCards.join(', ')}`);

    aiCrews.push({
      ...template,
      crew: crewCards
    });
  }

  return aiCrews;
}

// 플레이어 크루 유효성 검사 (등급 제한)
export function validatePlayerCrew(crew: string[]): { valid: boolean; error?: string } {
  if (crew.length !== CREW_SIZE) {
    return { valid: false, error: `크루는 ${CREW_SIZE}장이어야 합니다 (현재: ${crew.length}장)` };
  }

  // 등급별 카운트
  const gradeCount: Partial<Record<LegacyGrade, number>> = {};

  for (const charId of crew) {
    const grade = getCharacterGrade(charId);
    if (!grade) {
      return { valid: false, error: `알 수 없는 캐릭터: ${charId}` };
    }
    gradeCount[grade] = (gradeCount[grade] || 0) + 1;

    if (gradeCount[grade]! > GRADE_LIMITS[grade]) {
      return {
        valid: false,
        error: `${grade} 등급은 최대 ${GRADE_LIMITS[grade]}장까지 가능합니다`
      };
    }
  }

  return { valid: true };
}

// 현재 시즌의 AI 크루 (동적으로 생성됨)
export let AI_CREWS: AICrew[] = [];

// AI 크루 업데이트 함수
export function setAICrews(crews: AICrew[]) {
  AI_CREWS = crews;
  // BY_ID 맵 초기화 및 업데이트
  Object.keys(AI_CREWS_BY_ID).forEach(key => delete AI_CREWS_BY_ID[key]);
  crews.forEach(crew => {
    AI_CREWS_BY_ID[crew.id] = crew;
  });
}

export const AI_CREWS_BY_ID: Record<string, AICrew> = {};

// 플레이어 크루 ID (고정)
export const PLAYER_CREW_ID = 'player';

// 등급 제한 정보 내보내기 (레거시 호환)
export { GRADE_LIMITS };

// ========================================
// Phase 5: 샐러리 캡 기반 크루 배분
// ========================================

// 카드의 연봉 계산 (레벨 1, 성장기 기준)
function getCardBaseSalary(characterId: string): number {
  const char = ALL_CHARACTERS.find(c => c.id === characterId);
  if (!char) return 0;
  const grade = char.grade as LegacyGrade;
  // 레벨 1, 성장기, 루키 스케일 없음
  return calculateSalary(grade, 1, 'GROWTH', false);
}

// 샐러리 캡을 고려한 크루 배분
export function distributeCharactersWithSalaryCap(
  availableCharacters: string[],
  crewCount: number,
  salaryCap: number = SALARY_CAP
): string[][] {
  // 등급별로 캐릭터 분류
  const byGrade: Record<string, string[]> = {
    '특급': [],
    '1급': [],
    '준1급': [],
    '2급': [],
    '준2급': [],
    '3급': []
  };

  for (const charId of availableCharacters) {
    const grade = getCharacterGrade(charId);
    if (grade && byGrade[grade]) {
      byGrade[grade].push(charId);
    }
  }

  // 각 등급 셔플
  Object.keys(byGrade).forEach(grade => {
    byGrade[grade] = shuffleArray(byGrade[grade]);
  });

  // 크루 초기화
  const crews: string[][] = Array.from({ length: crewCount }, () => []);
  const crewSalaries: number[] = Array.from({ length: crewCount }, () => 0);

  // 1. 특급 배분 (각 크루 최대 1명, 샐러리 캡 고려)
  let specialIndex = 0;
  for (let i = 0; i < crewCount && specialIndex < byGrade['특급'].length; i++) {
    const cardId = byGrade['특급'][specialIndex];
    const salary = getCardBaseSalary(cardId);
    if (crewSalaries[i] + salary <= salaryCap) {
      crews[i].push(cardId);
      crewSalaries[i] += salary;
      specialIndex++;
    }
  }

  // 2. 1급 배분 (샐러리 캡 고려, 라운드 로빈)
  let firstGradeIndex = 0;
  for (let round = 0; round < 3 && firstGradeIndex < byGrade['1급'].length; round++) {
    for (let i = 0; i < crewCount && firstGradeIndex < byGrade['1급'].length; i++) {
      const cardId = byGrade['1급'][firstGradeIndex];
      const salary = getCardBaseSalary(cardId);
      if (crewSalaries[i] + salary <= salaryCap) {
        crews[i].push(cardId);
        crewSalaries[i] += salary;
        firstGradeIndex++;
      }
    }
  }

  // 3. 나머지 등급 배분 (샐러리 캡 고려)
  const remainingCharacters = [
    ...byGrade['준1급'],
    ...byGrade['2급'],
    ...byGrade['준2급'],
    ...byGrade['3급']
  ];

  const shuffledRemaining = shuffleArray(remainingCharacters);

  // 각 크루를 CREW_SIZE까지 채움 (샐러리 캡 고려)
  for (let i = 0; i < crewCount; i++) {
    for (const cardId of shuffledRemaining) {
      if (crews[i].length >= CREW_SIZE) break;

      // 이미 다른 크루에 배정되었는지 확인
      if (crews.some(crew => crew.includes(cardId))) continue;

      const salary = getCardBaseSalary(cardId);
      if (crewSalaries[i] + salary <= salaryCap) {
        crews[i].push(cardId);
        crewSalaries[i] += salary;
      }
    }
  }

  // 로그
  console.log('[AI Crews] 샐러리 캡 기반 배분 완료');
  crews.forEach((crew, idx) => {
    console.log(`  크루 ${idx + 1}: ${crew.length}명, 총 연봉: ${crewSalaries[idx]}`);
  });

  return crews;
}

// 크루 총 연봉 계산
export function calculateCrewSalary(crewCardIds: string[]): number {
  return crewCardIds.reduce((sum, cardId) => sum + getCardBaseSalary(cardId), 0);
}

// 크루 샐러리 캡 유효성 검사
export function validateCrewSalaryCap(
  crewCardIds: string[],
  salaryCap: number = SALARY_CAP
): { valid: boolean; totalSalary: number; overAmount: number } {
  const totalSalary = calculateCrewSalary(crewCardIds);
  const overAmount = Math.max(0, totalSalary - salaryCap);
  return {
    valid: totalSalary <= salaryCap,
    totalSalary,
    overAmount
  };
}
