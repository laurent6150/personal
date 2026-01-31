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

// 랜덤 크루 생성 (5장 카드)
export function generateRandomCrew(usedCards: string[] = []): string[] {
  const availableCards = ALL_CHARACTER_IDS.filter(id => !usedCards.includes(id));
  const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

// 시즌용 AI 크루 생성 (모든 AI 팀에 랜덤 카드 배정)
export function generateAICrewsForSeason(): AICrew[] {
  const usedCards: string[] = [];

  return AI_CREW_TEMPLATES.map(template => {
    const crew = generateRandomCrew(usedCards);
    usedCards.push(...crew);

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
