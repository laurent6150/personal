// ========================================
// AI 크루 데이터 - 완전 중복 방지 시스템
// ========================================

import type { AICrew, Difficulty } from '../types';
import { ALL_CHARACTER_IDS } from './characters';

// AI 팀 기본 정보 (크루 카드는 시즌 시작 시 랜덤 배정)
export interface AICrewTemplate {
  id: string;
  name: string;
  difficulty: Difficulty;
  description: string;
}

// AI 팀 템플릿 - 주술회전 세계관 영감
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

const CREW_SIZE = 5; // 각 크루는 반드시 5장

// 배열 셔플 함수
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 시즌용 AI 크루 생성 (완전 중복 방지)
// 전체 카드 풀에서 플레이어 카드 제외 후 순차 분배
// 각 크루는 반드시 5장씩
export function generateAICrewsForSeason(playerCrew: string[] = []): AICrew[] {
  // 플레이어 카드 제외한 가용 카드
  const availableCards = ALL_CHARACTER_IDS.filter(id => !playerCrew.includes(id));

  // 셔플
  const shuffledCards = shuffleArray(availableCards);

  // 가능한 AI 크루 수 계산 (각 5장씩 필요)
  const maxAICrews = Math.floor(shuffledCards.length / CREW_SIZE);
  const actualAICrewCount = Math.min(maxAICrews, AI_CREW_TEMPLATES.length);

  console.log(`[AI Crews] 총 캐릭터: ${ALL_CHARACTER_IDS.length}장, 플레이어: ${playerCrew.length}장, 가용: ${shuffledCards.length}장`);
  console.log(`[AI Crews] 최대 AI 크루: ${maxAICrews}팀, 실제 생성: ${actualAICrewCount}팀`);

  // AI 크루 생성 (각 5장씩 순차 배분)
  const aiCrews: AICrew[] = [];

  for (let i = 0; i < actualAICrewCount; i++) {
    const template = AI_CREW_TEMPLATES[i];
    const crewCards = shuffledCards.splice(0, CREW_SIZE);

    console.log(`[AI Crew] ${template.name}: ${crewCards.length}장 - ${crewCards.join(', ')}`);

    aiCrews.push({
      ...template,
      crew: crewCards
    });
  }

  return aiCrews;
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
