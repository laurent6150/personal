// ========================================
// 범용 업적 데이터
// ========================================

import type { Achievement } from '../types';

export const GENERAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_win",
    name: "첫 승리",
    description: "첫 대전 승리",
    condition: { type: "WINS", count: 1 },
    reward: { type: "ITEM", itemId: "cursed_energy_core" }
  },
  {
    id: "survive_5",
    name: "생존자",
    description: "5회 대전에서 생존",
    condition: { type: "SURVIVE_LOW_HP", count: 5 },
    reward: { type: "ITEM", itemId: "protective_charm" }
  },
  {
    id: "first_strike_10",
    name: "선제공격자",
    description: "10회 선공 성공",
    condition: { type: "USE_SKILL", target: "first_strike", count: 10 },
    reward: { type: "ITEM", itemId: "speed_talisman" }
  },
  {
    id: "total_damage_1000",
    name: "파괴자",
    description: "누적 데미지 1000 달성",
    condition: { type: "USE_SKILL", target: "damage", count: 1000 },
    reward: { type: "ITEM", itemId: "attack_charm" }
  },
  {
    id: "survive_low_hp_3",
    name: "불굴의 의지",
    description: "HP 3 이하에서 3회 승리",
    condition: { type: "SURVIVE_LOW_HP", count: 3 },
    reward: { type: "ITEM", itemId: "vitality_ring" }
  },
  {
    id: "defeat_soul_10",
    name: "영혼 사냥꾼",
    description: "혼백 속성 10회 격파",
    condition: { type: "DEFEAT_SPECIFIC", target: "SOUL", count: 10 },
    reward: { type: "ITEM", itemId: "soul_guard" }
  },
  {
    id: "arena_master",
    name: "경기장 마스터",
    description: "모든 경기장에서 1승",
    condition: { type: "WIN_IN_ARENA", target: "ALL", count: 1 },
    reward: { type: "ITEM", itemId: "domain_amplifier" }
  },
  {
    id: "win_streak_5",
    name: "연승왕",
    description: "5연승 달성",
    condition: { type: "WIN_STREAK", count: 5 },
    reward: { type: "EXP", amount: 100 }
  },
  {
    id: "win_streak_10",
    name: "무패행진",
    description: "10연승 달성",
    condition: { type: "WIN_STREAK", count: 10 },
    reward: { type: "EXP", amount: 300 }
  },
  {
    id: "total_wins_10",
    name: "신참 술사",
    description: "총 10승 달성",
    condition: { type: "WINS", count: 10 },
    reward: { type: "EXP", amount: 50 }
  },
  {
    id: "total_wins_50",
    name: "베테랑 술사",
    description: "총 50승 달성",
    condition: { type: "WINS", count: 50 },
    reward: { type: "EXP", amount: 200 }
  },
  {
    id: "total_wins_100",
    name: "전설의 술사",
    description: "총 100승 달성",
    condition: { type: "WINS", count: 100 },
    reward: { type: "TITLE", title: "전설의 술사" }
  },
  {
    id: "defeat_s_grade",
    name: "거인 사냥꾼",
    description: "S등급 캐릭터 격파",
    condition: { type: "DEFEAT_SPECIFIC", target: "S", count: 1 },
    reward: { type: "EXP", amount: 100 }
  },
  {
    id: "perfect_game",
    name: "완벽한 승리",
    description: "3:0 퍼펙트 승리",
    condition: { type: "WINS", count: 1 },
    reward: { type: "EXP", amount: 50 }
  }
];

export const ACHIEVEMENTS_BY_ID = GENERAL_ACHIEVEMENTS.reduce((acc, achievement) => {
  acc[achievement.id] = achievement;
  return acc;
}, {} as Record<string, Achievement>);
