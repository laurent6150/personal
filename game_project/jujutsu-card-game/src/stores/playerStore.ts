// ========================================
// 플레이어 데이터 상태 관리 (Zustand + LocalStorage)
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerData, PlayerCard, RoundResult } from '../types';
import { STARTER_CREW, ALL_CHARACTERS, CHARACTERS_BY_ID } from '../data/characters';
import { CREW_SIZE } from '../data/constants';
import { calculateExpReward, checkLevelUp } from '../utils/battleCalculator';

// 초기 플레이어 데이터 생성
function createInitialPlayerData(): PlayerData {
  // 모든 캐릭터를 초기 소유로 설정
  const ownedCards: Record<string, PlayerCard> = {};

  for (const char of ALL_CHARACTERS) {
    ownedCards[char.id] = {
      cardId: char.id,
      level: 1,
      exp: 0,
      equipment: [null, null],
      stats: {
        totalWins: 0,
        totalLosses: 0,
        vsRecord: {},
        arenaRecord: {}
      },
      unlockedAchievements: []
    };
  }

  return {
    id: `player_${Date.now()}`,
    name: '술사',
    ownedCards,
    currentCrew: STARTER_CREW,
    unlockedItems: [],
    totalStats: {
      totalWins: 0,
      totalLosses: 0,
      winStreak: 0,
      maxWinStreak: 0
    },
    achievements: [],
    settings: {
      soundEnabled: true,
      animationSpeed: 'NORMAL'
    }
  };
}

interface PlayerState {
  // 플레이어 데이터
  player: PlayerData;

  // 액션 - 크루 관리
  setCurrentCrew: (crew: string[]) => boolean;
  addCardToCrew: (cardId: string) => boolean;
  removeCardFromCrew: (cardId: string) => boolean;
  swapCrewCard: (oldCardId: string, newCardId: string) => boolean;

  // 액션 - 장비 관리
  equipItem: (cardId: string, itemId: string, slot: 0 | 1) => boolean;
  unequipItem: (cardId: string, slot: 0 | 1) => boolean;

  // 액션 - 게임 결과 처리
  processGameResult: (
    won: boolean,
    rounds: RoundResult[],
    aiDifficulty: string
  ) => {
    expGained: Record<string, number>;
    levelUps: string[];
    newAchievements: string[];
  };

  // 액션 - 기타
  unlockItem: (itemId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  setPlayerName: (name: string) => void;
  updateSettings: (settings: Partial<PlayerData['settings']>) => void;
  resetProgress: () => void;

  // 헬퍼
  getPlayerCard: (cardId: string) => PlayerCard | undefined;
  isCardOwned: (cardId: string) => boolean;
  isCardInCrew: (cardId: string) => boolean;
  canAddToCrew: (cardId: string) => boolean;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      player: createInitialPlayerData(),

      setCurrentCrew: (crew: string[]) => {
        if (crew.length !== CREW_SIZE) return false;

        // 모든 카드가 소유 중인지 확인
        const { player } = get();
        for (const cardId of crew) {
          if (!player.ownedCards[cardId]) return false;
        }

        // 등급 제한 체크
        const gradeCounts: Record<string, number> = { '특급': 0, '1급': 0, '준1급': 0, '2급': 0, '준2급': 0, '3급': 0 };
        for (const cardId of crew) {
          const char = CHARACTERS_BY_ID[cardId];
          if (char) {
            gradeCounts[char.grade]++;
          }
        }

        if (gradeCounts['특급'] > 1) return false; // 특급은 1장까지
        if (gradeCounts['1급'] > 2) return false; // 1급은 2장까지

        set({
          player: {
            ...player,
            currentCrew: crew
          }
        });
        return true;
      },

      addCardToCrew: (cardId: string) => {
        const { player, canAddToCrew } = get();
        if (player.currentCrew.length >= CREW_SIZE) return false;
        if (!canAddToCrew(cardId)) return false;

        set({
          player: {
            ...player,
            currentCrew: [...player.currentCrew, cardId]
          }
        });
        return true;
      },

      removeCardFromCrew: (cardId: string) => {
        const { player } = get();
        if (!player.currentCrew.includes(cardId)) return false;

        set({
          player: {
            ...player,
            currentCrew: player.currentCrew.filter(id => id !== cardId)
          }
        });
        return true;
      },

      swapCrewCard: (oldCardId: string, newCardId: string) => {
        const { player } = get();
        const index = player.currentCrew.indexOf(oldCardId);
        if (index === -1) return false;

        // 새 카드를 추가할 수 있는지 확인 (기존 카드 제외하고)
        const tempCrew = player.currentCrew.filter(id => id !== oldCardId);
        const char = CHARACTERS_BY_ID[newCardId];
        if (!char) return false;

        // 등급 제한 체크
        const gradeCounts: Record<string, number> = { '특급': 0, '1급': 0, '준1급': 0, '2급': 0, '준2급': 0, '3급': 0 };
        for (const cardId of tempCrew) {
          const c = CHARACTERS_BY_ID[cardId];
          if (c) gradeCounts[c.grade]++;
        }
        gradeCounts[char.grade]++;

        if (gradeCounts['특급'] > 1 || gradeCounts['1급'] > 2) return false;

        const newCrew = [...player.currentCrew];
        newCrew[index] = newCardId;

        set({
          player: {
            ...player,
            currentCrew: newCrew
          }
        });
        return true;
      },

      equipItem: (cardId: string, itemId: string, slot: 0 | 1) => {
        const { player } = get();
        const playerCard = player.ownedCards[cardId];
        if (!playerCard) return false;

        // 아이템 소유 확인
        if (!player.unlockedItems.includes(itemId)) return false;

        const newEquipment: [string | null, string | null] = [...playerCard.equipment];
        newEquipment[slot] = itemId;

        set({
          player: {
            ...player,
            ownedCards: {
              ...player.ownedCards,
              [cardId]: {
                ...playerCard,
                equipment: newEquipment
              }
            }
          }
        });
        return true;
      },

      unequipItem: (cardId: string, slot: 0 | 1) => {
        const { player } = get();
        const playerCard = player.ownedCards[cardId];
        if (!playerCard) return false;

        const newEquipment: [string | null, string | null] = [...playerCard.equipment];
        newEquipment[slot] = null;

        set({
          player: {
            ...player,
            ownedCards: {
              ...player.ownedCards,
              [cardId]: {
                ...playerCard,
                equipment: newEquipment
              }
            }
          }
        });
        return true;
      },

      processGameResult: (won: boolean, rounds: RoundResult[], _aiDifficulty: string) => {
        const { player } = get();
        const expGained: Record<string, number> = {};
        const levelUps: string[] = [];
        const newAchievements: string[] = [];

        // 연승 계산
        let newWinStreak = won ? player.totalStats.winStreak + 1 : 0;
        let newMaxWinStreak = Math.max(player.totalStats.maxWinStreak, newWinStreak);

        // 사용된 카드별 경험치 계산
        const usedPlayerCards = new Set<string>();
        for (const round of rounds) {
          usedPlayerCards.add(round.playerCardId);
        }

        const newOwnedCards = { ...player.ownedCards };

        for (const cardId of usedPlayerCards) {
          const playerCard = newOwnedCards[cardId];
          if (!playerCard) continue;

          const char = CHARACTERS_BY_ID[cardId];
          if (!char) continue;

          // 해당 카드의 라운드 결과 찾기
          const cardRounds = rounds.filter(r => r.playerCardId === cardId);
          const cardWon = cardRounds.some(r => r.winner === 'PLAYER');

          // 경험치 계산
          const expResult = calculateExpReward(
            cardWon,
            '준1급', // 상대 등급 (간략화)
            char.grade,
            newWinStreak,
            false // 퍼펙트 승리 여부
          );

          expGained[cardId] = expResult.total;

          // 경험치 적용 및 레벨업 체크
          const newExp = playerCard.exp + expResult.total;
          const levelResult = checkLevelUp(newExp, playerCard.level);

          if (levelResult.leveledUp) {
            levelUps.push(cardId);
          }

          // 전적 업데이트
          const newStats = { ...playerCard.stats };
          for (const round of cardRounds) {
            if (round.winner === 'PLAYER') {
              newStats.totalWins++;
            } else if (round.winner === 'AI') {
              newStats.totalLosses++;
            }

            // 상대 기록
            if (!newStats.vsRecord[round.aiCardId]) {
              newStats.vsRecord[round.aiCardId] = { wins: 0, losses: 0 };
            }
            if (round.winner === 'PLAYER') {
              newStats.vsRecord[round.aiCardId].wins++;
            } else if (round.winner === 'AI') {
              newStats.vsRecord[round.aiCardId].losses++;
            }

            // 경기장 기록
            if (!newStats.arenaRecord[round.arena.id]) {
              newStats.arenaRecord[round.arena.id] = { wins: 0, losses: 0 };
            }
            if (round.winner === 'PLAYER') {
              newStats.arenaRecord[round.arena.id].wins++;
            } else if (round.winner === 'AI') {
              newStats.arenaRecord[round.arena.id].losses++;
            }
          }

          newOwnedCards[cardId] = {
            ...playerCard,
            exp: levelResult.newExp,
            level: levelResult.newLevel,
            stats: newStats
          };
        }

        // 전체 통계 업데이트
        const newTotalStats = {
          totalWins: player.totalStats.totalWins + (won ? 1 : 0),
          totalLosses: player.totalStats.totalLosses + (won ? 0 : 1),
          winStreak: newWinStreak,
          maxWinStreak: newMaxWinStreak
        };

        set({
          player: {
            ...player,
            ownedCards: newOwnedCards,
            totalStats: newTotalStats
          }
        });

        return { expGained, levelUps, newAchievements };
      },

      unlockItem: (itemId: string) => {
        const { player } = get();
        if (player.unlockedItems.includes(itemId)) return;

        set({
          player: {
            ...player,
            unlockedItems: [...player.unlockedItems, itemId]
          }
        });
      },

      unlockAchievement: (achievementId: string) => {
        const { player } = get();
        if (player.achievements.includes(achievementId)) return;

        set({
          player: {
            ...player,
            achievements: [...player.achievements, achievementId]
          }
        });
      },

      setPlayerName: (name: string) => {
        const { player } = get();
        set({
          player: {
            ...player,
            name
          }
        });
      },

      updateSettings: (settings: Partial<PlayerData['settings']>) => {
        const { player } = get();
        set({
          player: {
            ...player,
            settings: {
              ...player.settings,
              ...settings
            }
          }
        });
      },

      resetProgress: () => {
        set({ player: createInitialPlayerData() });
      },

      getPlayerCard: (cardId: string) => {
        return get().player.ownedCards[cardId];
      },

      isCardOwned: (cardId: string) => {
        return !!get().player.ownedCards[cardId];
      },

      isCardInCrew: (cardId: string) => {
        return get().player.currentCrew.includes(cardId);
      },

      canAddToCrew: (cardId: string) => {
        const { player, isCardOwned, isCardInCrew } = get();

        // 소유 확인
        if (!isCardOwned(cardId)) return false;

        // 이미 크루에 있는지 확인
        if (isCardInCrew(cardId)) return false;

        // 크루가 가득 찼는지 확인
        if (player.currentCrew.length >= CREW_SIZE) return false;

        // 등급 제한 체크
        const char = CHARACTERS_BY_ID[cardId];
        if (!char) return false;

        const gradeCounts: Record<string, number> = { '특급': 0, '1급': 0, '준1급': 0, '2급': 0, '준2급': 0, '3급': 0 };
        for (const crewCardId of player.currentCrew) {
          const c = CHARACTERS_BY_ID[crewCardId];
          if (c) gradeCounts[c.grade]++;
        }

        if (char.grade === '특급' && gradeCounts['특급'] >= 1) return false;
        if (char.grade === '1급' && gradeCounts['1급'] >= 2) return false;

        return true;
      }
    }),
    {
      name: 'jujutsu-card-game-player',
      version: 3, // 기술 시스템 개편
      migrate: (persistedState: unknown, version: number) => {
        console.log('[Player Store] 마이그레이션:', version, '->', 3);
        // 버전 2 이하의 데이터는 리셋 (기술 시스템 개편)
        if (version < 3) {
          console.log('[Player Store] 등급 체계 변경으로 데이터 리셋');
          return { player: createInitialPlayerData() };
        }
        return persistedState as PlayerState;
      }
    }
  )
);

// 선택자 함수들
export const selectCurrentCrew = (state: PlayerState) => state.player.currentCrew;

export const selectCrewCards = (state: PlayerState) => {
  return state.player.currentCrew
    .map(id => state.player.ownedCards[id])
    .filter(Boolean);
};

export const selectTotalStats = (state: PlayerState) => state.player.totalStats;

export const selectUnlockedItems = (state: PlayerState) => state.player.unlockedItems;

export const selectAchievements = (state: PlayerState) => state.player.achievements;
