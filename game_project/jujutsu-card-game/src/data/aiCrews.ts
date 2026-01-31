// ========================================
// AI 크루 데이터 (5개 팀) - 랜덤 크루 지원
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

export const AI_CREW_TEMPLATES: AICrewTemplate[] = [
  {
    id: 'curse_kings',
    name: '저주의 왕들',
    difficulty: 'HARD',
    description: '강력한 저주의 군단'
  },
  {
    id: 'jujutsu_high',
    name: '주술고전',
    difficulty: 'NORMAL',
    description: '도쿄 주술고전 정예 팀'
  },
  {
    id: 'zenin_clan',
    name: '젠인 가문',
    difficulty: 'NORMAL',
    description: '명문 젠인 가문의 실력자들'
  },
  {
    id: 'special_grade',
    name: '특급 집결',
    difficulty: 'HARD',
    description: '특급에 준하는 실력자들'
  },
  {
    id: 'new_generation',
    name: '신세대',
    difficulty: 'EASY',
    description: '차세대 주술사들'
  }
];

// 랜덤 크루 생성 (카드 수 지정 가능, 부족 시 가능한 만큼만)
export function generateRandomCrew(usedCards: string[] = [], count: number = 5): string[] {
  const availableCards = ALL_CHARACTER_IDS.filter(id => !usedCards.includes(id));
  const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 시즌용 AI 크루 생성 (플레이어 크루 제외, 중복 방지)
// 20캐릭터 - 5플레이어 = 15카드 / 5AI팀 = 3장씩 기본
// 부족하면 카드 수를 줄여서 배분
export function generateAICrewsForSeason(playerCrew: string[] = []): AICrew[] {
  const usedCards: string[] = [...playerCrew]; // 플레이어 크루 먼저 제외
  const totalAvailable = ALL_CHARACTER_IDS.length - playerCrew.length;
  const aiTeamCount = AI_CREW_TEMPLATES.length;

  // 카드 배분 계산 (최대한 균등하게)
  const cardsPerTeam = Math.floor(totalAvailable / aiTeamCount);
  const extraCards = totalAvailable % aiTeamCount;

  console.log(`[AI Crews] 총 ${totalAvailable}장 가용, ${aiTeamCount}팀에 각 ${cardsPerTeam}~${cardsPerTeam + 1}장 배분`);

  return AI_CREW_TEMPLATES.map((template, index) => {
    // 앞쪽 팀에 추가 카드 배분
    const crewSize = index < extraCards ? cardsPerTeam + 1 : cardsPerTeam;
    const crew = generateRandomCrew(usedCards, crewSize);
    usedCards.push(...crew);

    console.log(`[AI Crew] ${template.name}: ${crew.length}장`);

    return {
      ...template,
      crew
    };
  });
}

// 현재 시즌의 AI 크루 (동적으로 생성됨)
export let AI_CREWS: AICrew[] = AI_CREW_TEMPLATES.map(t => ({
  ...t,
  crew: [] // 초기값은 빈 배열, 시즌 시작 시 설정
}));

// AI 크루 업데이트 함수
export function setAICrews(crews: AICrew[]) {
  AI_CREWS = crews;
  // BY_ID 맵도 업데이트
  crews.forEach(crew => {
    AI_CREWS_BY_ID[crew.id] = crew;
  });
}

export const AI_CREWS_BY_ID: Record<string, AICrew> = {};

// 플레이어 크루 ID (고정)
export const PLAYER_CREW_ID = 'player';
