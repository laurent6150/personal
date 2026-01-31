// ========================================
// AI 크루 데이터 (5개 팀)
// ========================================

import type { AICrew } from '../types';

export const AI_CREWS: AICrew[] = [
  {
    id: 'curse_kings',
    name: '저주의 왕들',
    difficulty: 'HARD',
    crew: ['ryomen_sukuna', 'jogo', 'hanami', 'mahito', 'choso'],
    description: '스쿠나가 이끄는 저주의 군단'
  },
  {
    id: 'jujutsu_high',
    name: '주술고전',
    difficulty: 'NORMAL',
    crew: ['gojo_satoru', 'nanami_kento', 'mei_mei', 'ino_takuma', 'panda'],
    description: '도쿄 주술고전 교직원 팀'
  },
  {
    id: 'zenin_clan',
    name: '젠인 가문',
    difficulty: 'NORMAL',
    crew: ['fushiguro_toji', 'maki_zenin', 'fushiguro_megumi', 'nishimiya_momo', 'inumaki_toge'],
    description: '젠인 가문과 연관된 실력자들'
  },
  {
    id: 'special_grade',
    name: '특급 집결',
    difficulty: 'HARD',
    crew: ['kenjaku', 'yuta_okkotsu', 'todo_aoi', 'choso', 'jogo'],
    description: '특급에 준하는 실력자들의 모임'
  },
  {
    id: 'new_generation',
    name: '신세대',
    difficulty: 'EASY',
    crew: ['itadori_yuji', 'fushiguro_megumi', 'kugisaki_nobara', 'panda', 'inumaki_toge'],
    description: '주술고전 1학년 + 2학년'
  }
];

export const AI_CREWS_BY_ID = AI_CREWS.reduce((acc, crew) => {
  acc[crew.id] = crew;
  return acc;
}, {} as Record<string, AICrew>);

// 플레이어 크루 ID (고정)
export const PLAYER_CREW_ID = 'player';
