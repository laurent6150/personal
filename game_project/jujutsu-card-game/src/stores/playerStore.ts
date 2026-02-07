// ========================================
// 플레이어 데이터 상태 관리 (Zustand + LocalStorage)
// Phase 5: 연봉/생애주기 시스템 통합
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerData, PlayerCard, RoundResult, Grade, CharacterProgress, FormState, CareerPhase, LegacyGrade } from '../types';
import { STARTER_CREW, ALL_CHARACTERS, CHARACTERS_BY_ID } from '../data/characters';
import { CREW_SIZE, SALARY_CAP } from '../data/constants';
import { calculateExpReward, checkLevelUp } from '../utils/battleCalculator';
import { initializeGrowthData, addExpAndLevelUp } from '../data/growthSystem';
import { calculateSalary } from '../utils/salarySystem';
import { determineCareerPhase, applyDecline } from '../utils/agingSystem';

// 초기 플레이어 데이터 생성
function createInitialPlayerData(): PlayerData {
  // 모든 캐릭터를 초기 소유로 설정
  const ownedCards: Record<string, PlayerCard> = {};

  for (const char of ALL_CHARACTERS) {
    const growthData = initializeGrowthData();
    ownedCards[char.id] = {
      cardId: char.id,
      level: 1,
      exp: 0,
      totalExp: growthData.totalExp,
      equipment: [null, null],
      stats: {
        totalWins: 0,
        totalLosses: 0,
        vsRecord: {},
        arenaRecord: {}
      },
      unlockedAchievements: [],
      bonusStats: growthData.bonusStats,
      condition: growthData.condition,
      currentForm: growthData.currentForm,
      recentResults: growthData.recentResults,
      currentWinStreak: growthData.currentWinStreak,
      maxWinStreak: growthData.maxWinStreak,
      // Phase 5: 생애주기 필드
      seasonsInCrew: 0,
      careerPhase: 'ROOKIE' as CareerPhase,
      isRookieScale: true  // 첫 시즌은 루키 스케일 적용
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

  // 액션 - 경험치 (Step 2.5b-1)
  addExpToCard: (cardId: string, exp: number) => {
    newProgress: import('../types').CharacterProgress;
    leveledUp: boolean;
    levelsGained: number;
    statIncreases: Partial<import('../types').Stats>;
  } | null;

  // 헬퍼
  getPlayerCard: (cardId: string) => PlayerCard | undefined;
  isCardOwned: (cardId: string) => boolean;
  isCardInCrew: (cardId: string) => boolean;
  canAddToCrew: (cardId: string) => boolean;

  // Phase 5: 연봉/생애주기 함수
  getCardSalary: (cardId: string) => number;
  getTotalCrewSalary: () => number;
  isUnderSalaryCap: () => boolean;
  getSalaryCapStatus: () => { total: number; cap: number; remaining: number; isOver: boolean };
  processSeasonEnd: () => { agedCards: string[]; declinedCards: string[] };
  getCardCareerInfo: (cardId: string) => {
    phase: CareerPhase;
    seasonsInCrew: number;
    salary: number;
    isRookieScale: boolean;
  } | null;
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
      },

      // ========================================
      // Phase 5: 연봉/생애주기 함수
      // ========================================

      // 카드 연봉 계산
      getCardSalary: (cardId: string) => {
        const { player } = get();
        const playerCard = player.ownedCards[cardId];
        const char = CHARACTERS_BY_ID[cardId];

        if (!playerCard || !char) return 0;

        const grade = char.grade as LegacyGrade;
        const level = playerCard.level || 1;
        const careerPhase = playerCard.careerPhase || 'GROWTH';
        const isRookieScale = playerCard.isRookieScale || false;

        return calculateSalary(grade, level, careerPhase, isRookieScale);
      },

      // 크루 총 연봉 계산
      getTotalCrewSalary: () => {
        const { player, getCardSalary } = get();
        let total = 0;

        for (const cardId of player.currentCrew) {
          total += getCardSalary(cardId);
        }

        return total;
      },

      // 샐러리 캡 미달 여부
      isUnderSalaryCap: () => {
        const { getTotalCrewSalary } = get();
        return getTotalCrewSalary() <= SALARY_CAP;
      },

      // 샐러리 캡 상태 조회
      getSalaryCapStatus: () => {
        const { getTotalCrewSalary } = get();
        const total = getTotalCrewSalary();
        const remaining = SALARY_CAP - total;

        return {
          total,
          cap: SALARY_CAP,
          remaining,
          isOver: total > SALARY_CAP
        };
      },

      // 시즌 종료 처리 (노화 + 쇠퇴)
      processSeasonEnd: () => {
        const { player } = get();
        const agedCards: string[] = [];
        const declinedCards: string[] = [];
        const newOwnedCards = { ...player.ownedCards };

        // 크루에 있는 카드들만 처리
        for (const cardId of player.currentCrew) {
          const playerCard = newOwnedCards[cardId];
          const char = CHARACTERS_BY_ID[cardId];

          if (!playerCard || !char) continue;

          // 시즌 수 증가
          const newSeasonsInCrew = (playerCard.seasonsInCrew || 0) + 1;
          agedCards.push(cardId);

          // 생애주기 재계산
          const grade = char.grade as LegacyGrade;
          const newCareerPhase = determineCareerPhase(grade, newSeasonsInCrew);

          // 루키 스케일 해제 (첫 시즌 이후)
          const isRookieScale = newSeasonsInCrew <= 1;

          // 쇠퇴 처리
          let newBonusStats = playerCard.bonusStats || {};
          if (newCareerPhase === 'DECLINE' || newCareerPhase === 'RETIREMENT_ELIGIBLE') {
            const declineResult = applyDecline(newCareerPhase, newBonusStats);
            if (Object.keys(declineResult.decreases).length > 0) {
              declinedCards.push(cardId);
              // 보너스 스탯에서 감소 적용
              newBonusStats = { ...newBonusStats };
              for (const [key, value] of Object.entries(declineResult.decreases)) {
                const statKey = key as keyof typeof newBonusStats;
                newBonusStats[statKey] = Math.max(0, (newBonusStats[statKey] || 0) + (value || 0));
              }
              console.log(`[processSeasonEnd] ${char.name.ko} ${declineResult.message}`);
            }
          }

          newOwnedCards[cardId] = {
            ...playerCard,
            seasonsInCrew: newSeasonsInCrew,
            careerPhase: newCareerPhase,
            isRookieScale,
            bonusStats: newBonusStats
          };
        }

        set({
          player: {
            ...player,
            ownedCards: newOwnedCards
          }
        });

        console.log(`[processSeasonEnd] 노화 처리: ${agedCards.length}명, 쇠퇴: ${declinedCards.length}명`);
        return { agedCards, declinedCards };
      },

      // 카드 커리어 정보 조회
      getCardCareerInfo: (cardId: string) => {
        const { player, getCardSalary } = get();
        const playerCard = player.ownedCards[cardId];

        if (!playerCard) return null;

        return {
          phase: playerCard.careerPhase || 'ROOKIE',
          seasonsInCrew: playerCard.seasonsInCrew || 0,
          salary: getCardSalary(cardId),
          isRookieScale: playerCard.isRookieScale || false
        };
      },

      // Step 2.5b-1: 카드에 경험치 추가 함수
      addExpToCard: (cardId: string, exp: number) => {
        const { player } = get();
        const card = CHARACTERS_BY_ID[cardId];
        const playerCard = player.ownedCards[cardId];

        if (!card || !playerCard) {
          console.error('[addExpToCard] 카드를 찾을 수 없음:', cardId);
          return null;
        }

        // 기존 진행 상태 가져오기 (없으면 초기화)
        const currentProgress: CharacterProgress = {
          cardId,
          level: playerCard.level || 1,
          exp: playerCard.exp || 0,
          totalExp: playerCard.totalExp || 0,
          recentResults: playerCard.recentResults || [],
          condition: playerCard.condition || { value: 100, consecutiveBattles: 0, lastRestRound: 0 },
          currentForm: (playerCard.currentForm || 'STABLE') as FormState,
          bonusStats: playerCard.bonusStats || { atk: 0, def: 0, spd: 0, ce: 0, hp: 0, crt: 0, tec: 0, mnt: 0 },
        };

        // 경험치 추가 및 레벨업 처리
        const result = addExpAndLevelUp(currentProgress, exp, card.grade as Grade);

        // 상태 업데이트
        set({
          player: {
            ...player,
            ownedCards: {
              ...player.ownedCards,
              [cardId]: {
                ...playerCard,
                level: result.newProgress.level,
                exp: result.newProgress.exp,
                totalExp: result.newProgress.totalExp,
                bonusStats: result.newProgress.bonusStats,
              },
            },
          },
        });

        // 레벨업 알림 (필요시)
        if (result.leveledUp) {
          console.log(`[addExpToCard] ${card.name.ko} 레벨업! Lv${result.newProgress.level} (+${result.levelsGained})`);
        }

        return result;
      }
    }),
    {
      name: 'jujutsu-card-game-player',
      version: 4, // Phase 5: 연봉/생애주기 시스템
      migrate: (persistedState: unknown, version: number) => {
        console.log('[Player Store] 마이그레이션:', version, '->', 4);
        // 버전 2 이하의 데이터는 리셋 (기술 시스템 개편)
        if (version < 3) {
          console.log('[Player Store] 등급 체계 변경으로 데이터 리셋');
          return { player: createInitialPlayerData() };
        }
        // 버전 3 -> 4: Phase 5 필드 추가
        if (version < 4) {
          console.log('[Player Store] Phase 5 생애주기 필드 추가');
          const state = persistedState as PlayerState;
          const newOwnedCards = { ...state.player.ownedCards };

          // 기존 카드들에 Phase 5 필드 추가
          for (const cardId of Object.keys(newOwnedCards)) {
            const card = newOwnedCards[cardId];
            newOwnedCards[cardId] = {
              ...card,
              seasonsInCrew: card.seasonsInCrew ?? 0,
              careerPhase: card.careerPhase ?? ('GROWTH' as CareerPhase),
              isRookieScale: card.isRookieScale ?? false
            };
          }

          return {
            ...state,
            player: {
              ...state.player,
              ownedCards: newOwnedCards
            }
          };
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
